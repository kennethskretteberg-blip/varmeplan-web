-- ============================================================
-- 169-web: Kunden registrerer bedriften selv, og leverandoeren (Cenika) godkjenner.
-- ============================================================
-- Kjores manuelt i Supabase SQL Editor. Idempotent. Ren ASCII. Additiv: nye kolonner,
-- nye funksjoner, EN ny vakt-trigger. Ingen drop av tabeller/kolonner, ingen policy endret.
--
-- KREVER (i denne rekkefolgen):
--   supabase-migration-org-orgnr.sql             (042: org_nr, created_by_org, unik indeks)
--   supabase-migration-opprett-kundebedrift.sql  (044v2 slik den ser ut etter 169:
--                                                 erp_customer_no, _orgnr_valid_digits,
--                                                 _activate_customer_org, create_customer_org)
--   supabase-migration-project-shares.sql        (046: project_shares)
--   supabase-migration-del-med-elektriker.sql    (047: list_customer_orgs -- erstattes under)
--
-- FOER DU KJORER: sjekk at handle_new_user i databasen er den samme som i
-- supabase-migration-org-centric.sql (se seksjon 2 og SPOERSMAAL.md):
--   select pg_get_functiondef('public.handle_new_user'::regproc);
--
-- MODELLEN (etter maalingen i 168): ingen ny soeknadstabell. Dagens registrering
-- (_authRegister -> auth.signUp -> trigger handle_new_user) lager alt installatoer-orgen,
-- gjoer brukeren til owner og lar profilen staa 'pending'. Paaloggingen
-- (_authCheckProfileAndProceed) stenger ute 'pending'. Det som er nytt:
--   * Skjemaet sender "Kunde hos" (leverandoer-org) og org.nr; triggeren LAGRER dem.
--   * Cenika (medlem av leverandoer-orgen) kan godkjenne eller avslaa -- i tillegg til
--     superadmin, hvis vei er uendret (_admApproveOrg / _admQuickApprove).
--
-- GRUNNREGELEN: en ventende org gir ingen tilgang. Profilen er 'pending' til noen godkjenner.
-- Seksjon 8 stenger et hull som gjorde at en bruker kunne sette sin EGEN profil til 'active'.
-- ============================================================

do $$
begin
  if to_regprocedure('public._activate_customer_org(uuid,uuid,text,uuid)') is null
     or to_regprocedure('public._orgnr_valid_digits(text)') is null then
    raise exception 'Kjor supabase-migration-opprett-kundebedrift.sql (versjonen fra 169) foerst';
  end if;
end $$;

-- ------------------------------------------------------------
-- 1. Kolonner paa organizations (additivt)
-- ------------------------------------------------------------
-- requested_supplier_org_id   "Kunde hos" fra registreringen (bare en org med org_type='supplier')
-- requested_org_nr            org.nr slik soekeren oppga det (ni siffer). org_nr har en UNIK
--                             indeks (042): finnes nummeret alt paa en annen org, kan det ikke
--                             lagres i org_nr uten at registreringen feiler. Da staar det her,
--                             og godkjenningen svarer existing_org.
-- customer_request_decision   null = venter, 'approved' | 'rejected'
-- customer_request_decided_at / _by, customer_request_reject_reason
-- customer_request_notified_at  satt av Edge Function kundesoknad-svar naar e-posten er sendt
--                               (en avgjoerelse gir hoeyst EN e-post)
alter table organizations
  add column if not exists requested_supplier_org_id     uuid references organizations(id),
  add column if not exists requested_org_nr              text,
  add column if not exists customer_request_decision     text,
  add column if not exists customer_request_decided_at   timestamptz,
  add column if not exists customer_request_decided_by   uuid,
  add column if not exists customer_request_reject_reason text,
  add column if not exists customer_request_notified_at  timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'organizations_customer_request_decision_chk') then
    alter table organizations add constraint organizations_customer_request_decision_chk
      check (customer_request_decision is null or customer_request_decision in ('approved', 'rejected'));
  end if;
end $$;

create index if not exists organizations_requested_supplier_open_idx
  on organizations (requested_supplier_org_id)
  where requested_supplier_org_id is not null and customer_request_decision is null;

-- ------------------------------------------------------------
-- 2. handle_new_user -- kopiert ORDRETT fra supabase-migration-org-centric.sql:11-49
--    (den nyeste av de to versjonene i repoet; den andre er supabase-migration-auth.sql:21-34).
--    Lagt til: tre variabler i DECLARE og blokka merket "169" etter "Link profile to org".
--    Ingenting annet er endret. Blokka kan ALDRI felle registreringen: alt i den er pakket
--    i en exception-handler, og org.nr lagres bare naar det er gyldig og ledig.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_org_id uuid;
  company text;
  v169_orgnr text;
  v169_sup_txt text;
  v169_sup uuid;
BEGIN
  company := NEW.raw_user_meta_data->>'company_name';

  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, company_name, message)
  VALUES (
    NEW.id, NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    company,
    NEW.raw_user_meta_data->>'message'
  );

  -- If company_name provided AND no matching invitation, auto-create org
  IF company IS NOT NULL AND company != '' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.org_invitations
      WHERE lower(email) = lower(NEW.email) AND status = 'pending' AND expires_at > now()
    ) THEN
      INSERT INTO public.organizations (name, slug, org_type)
      VALUES (company, lower(regexp_replace(company, '[^a-zA-Z0-9]+', '-', 'g')), 'installer')
      RETURNING id INTO new_org_id;

      -- Make user owner of new org
      INSERT INTO public.organization_members (org_id, user_id, role)
      VALUES (new_org_id, NEW.id, 'owner');

      -- Link profile to org
      UPDATE public.profiles SET org_id = new_org_id WHERE id = NEW.id;

      -- 169: org.nr og "Kunde hos" fra registreringsskjemaet. Metadata er brukerens egne
      -- data: leverandoeren godtas bare naar id-en er en org med org_type='supplier', og
      -- org.nr bare naar det er gyldig (MOD11) og ikke finnes paa en annen org.
      BEGIN
        v169_orgnr := public._orgnr_valid_digits(NEW.raw_user_meta_data->>'org_number');
        v169_sup_txt := NEW.raw_user_meta_data->>'requested_supplier_org_id';
        IF v169_sup_txt ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
          SELECT o.id INTO v169_sup FROM public.organizations o
           WHERE o.id = v169_sup_txt::uuid AND o.org_type = 'supplier';
        END IF;
        UPDATE public.organizations
           SET requested_org_nr = v169_orgnr,
               requested_supplier_org_id = v169_sup
         WHERE id = new_org_id;
        IF v169_orgnr IS NOT NULL AND NOT EXISTS (
          SELECT 1 FROM public.organizations o
           WHERE o.id <> new_org_id AND o.org_nr IS NOT NULL
             AND regexp_replace(o.org_nr, '[^0-9]', '', 'g') = v169_orgnr
        ) THEN
          UPDATE public.organizations SET org_nr = v169_orgnr WHERE id = new_org_id;
        END IF;
      EXCEPTION WHEN others THEN
        RAISE WARNING 'handle_new_user 169: org.nr/Kunde hos ikke lagret for %: %', NEW.id, SQLERRM;
      END;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------
-- 3. list_registration_suppliers() -- "Kunde hos"-lista i registreringsskjemaet.
--    Skjemaet vises FOER innlogging, saa anon maa kunne lese den. Den LESER bare: id og navn
--    paa leverandoer-orger som er koblet til produktkatalogen (suppliers). Ingen andre felt.
-- ------------------------------------------------------------
create or replace function public.list_registration_suppliers()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', o.id, 'name', o.name) order by lower(o.name)), '[]'::jsonb)
    from organizations o
   where o.org_type = 'supplier'
     and exists (select 1 from suppliers s where s.name = o.supplier_name);
$$;

-- ------------------------------------------------------------
-- 4. Intern kallersjekk for godkjenn/avslaa. Kalleren maa vaere medlem av orgens
--    requested_supplier_org_id, og den orgen maa ha org_type='supplier'. Orgen maa vaere
--    'installer'. Alle feil gir SAMME svar (NOT_ALLOWED), saa en id ikke kan proeves ut.
-- ------------------------------------------------------------
create or replace function public._customer_request_supplier(p_org_id uuid)
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_type text;
  v_req  uuid;
begin
  if v_uid is null then
    raise exception 'NOT_AUTHENTICATED: logg inn foerst' using errcode = '42501';
  end if;
  select o.org_type, o.requested_supplier_org_id into v_type, v_req
    from organizations o where o.id = p_org_id;
  if v_req is null
     or v_type is distinct from 'installer'
     or not exists (select 1 from organizations s where s.id = v_req and s.org_type = 'supplier')
     or not exists (select 1 from organization_members m where m.org_id = v_req and m.user_id = v_uid)
  then
    raise exception 'NOT_ALLOWED: bare leverandoeren soekeren valgte kan behandle soeknaden'
      using errcode = '42501';
  end if;
  return v_req;
end;
$$;

-- ------------------------------------------------------------
-- 5. approve_customer_org(p_org_id, p_erp_customer_no)
-- ------------------------------------------------------------
-- Returnerer jsonb:
--   { result: 'approved', org_id, name }
--   { result: 'existing_org', org_id }  -- org.nr finnes paa en annen org. INGENTING endres.
--     Grensesnittet sier: "Bedriften har allerede Varmeplan. Soekeren maa inviteres av
--     bedriftens administrator." En fremmed skal aldri kunne melde seg inn i en eksisterende
--     bedrift via Cenika -- soekeren legges ikke inn noe sted.
-- Ellers: felles regler i _activate_customer_org (044v2/169): installer, 'active',
-- trial_ends_at = null, erp_customer_no, EN rad i organization_supplier_access.
-- Eierens profil -> 'active'. Kalleren blir IKKE medlem.
create or replace function public.approve_customer_org(p_org_id uuid, p_erp_customer_no text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid    uuid := auth.uid();
  v_sup    uuid;
  v_org    record;
  v_owner  uuid;
  v_status text;
  v_digits text;
begin
  v_sup := public._customer_request_supplier(p_org_id);

  select o.id, o.name, o.org_nr, o.requested_org_nr, o.customer_request_decision
    into v_org from organizations o where o.id = p_org_id for update;
  if v_org.customer_request_decision is not null then
    raise exception 'ALREADY_DECIDED: soeknaden er alt behandlet (%)', v_org.customer_request_decision
      using errcode = '22023';
  end if;

  select m.user_id into v_owner
    from organization_members m where m.org_id = p_org_id and m.role = 'owner' limit 1;
  if v_owner is null then
    raise exception 'NO_OWNER: bedriften har ingen eier' using errcode = '22023';
  end if;
  select p.status into v_status from profiles p where p.id = v_owner for update;
  if v_status is distinct from 'pending' then
    raise exception 'NOT_PENDING: soekeren venter ikke paa godkjenning (status %)', coalesce(v_status, 'ingen profil')
      using errcode = '22023';
  end if;

  -- Org.nr som finnes paa en annen org (samme normalisering som 044v2: bare siffer).
  v_digits := public._orgnr_valid_digits(coalesce(v_org.org_nr, v_org.requested_org_nr));
  if v_digits is not null and exists (
    select 1 from organizations o
     where o.id <> p_org_id and o.org_nr is not null
       and regexp_replace(o.org_nr, '[^0-9]', '', 'g') = v_digits
  ) then
    return jsonb_build_object('result', 'existing_org', 'org_id', p_org_id);
  end if;
  if v_org.org_nr is null and v_digits is not null then
    begin
      update organizations set org_nr = v_digits where id = p_org_id;
    exception when unique_violation then
      return jsonb_build_object('result', 'existing_org', 'org_id', p_org_id);
    end;
  end if;

  perform public._activate_customer_org(p_org_id, v_sup, p_erp_customer_no, v_uid);

  update organizations
     set customer_request_decision   = 'approved',
         customer_request_decided_at = now(),
         customer_request_decided_by = v_uid
   where id = p_org_id;

  update profiles
     set status = 'active', approved_at = now(), approved_by = v_uid
   where id = v_owner and status = 'pending';

  return jsonb_build_object('result', 'approved', 'org_id', p_org_id, 'name', v_org.name);
end;
$$;

-- ------------------------------------------------------------
-- 6. reject_customer_org(p_org_id, p_reason) -- eierens profil -> 'rejected'.
--    Orgen blir staaende (superadmin rydder); den gir ingen tilgang uten en aktiv profil.
-- ------------------------------------------------------------
create or replace function public.reject_customer_org(p_org_id uuid, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid    uuid := auth.uid();
  v_sup    uuid;
  v_dec    text;
  v_owner  uuid;
  v_status text;
begin
  v_sup := public._customer_request_supplier(p_org_id);

  select o.customer_request_decision into v_dec from organizations o where o.id = p_org_id for update;
  if v_dec is not null then
    raise exception 'ALREADY_DECIDED: soeknaden er alt behandlet (%)', v_dec using errcode = '22023';
  end if;
  select m.user_id into v_owner
    from organization_members m where m.org_id = p_org_id and m.role = 'owner' limit 1;
  if v_owner is null then
    raise exception 'NO_OWNER: bedriften har ingen eier' using errcode = '22023';
  end if;
  select p.status into v_status from profiles p where p.id = v_owner for update;
  if v_status is distinct from 'pending' then
    raise exception 'NOT_PENDING: soekeren venter ikke paa godkjenning (status %)', coalesce(v_status, 'ingen profil')
      using errcode = '22023';
  end if;

  update organizations
     set customer_request_decision      = 'rejected',
         customer_request_decided_at    = now(),
         customer_request_decided_by    = v_uid,
         customer_request_reject_reason = left(nullif(btrim(coalesce(p_reason, '')), ''), 1000)
   where id = p_org_id;

  update profiles set status = 'rejected' where id = v_owner and status = 'pending';

  return jsonb_build_object('result', 'rejected', 'org_id', p_org_id);
end;
$$;

-- ------------------------------------------------------------
-- 7. list_customer_requests() -- Cenikas godkjenningsliste. LESER bare.
--    Ventende orger med requested_supplier_org_id = en leverandoer-org kalleren er medlem
--    av, eieren fortsatt 'pending', ingen avgjoerelse. Med treff i Visma-lista
--    (erp_customers.org_number, normalisert til siffer) for samme leverandoer.
--    Ikke-leverandoerer faar en tom liste. Cenika kan ikke lese disse radene direkte (RLS),
--    og policyene loesnes ikke (KJOR regel 8).
-- ------------------------------------------------------------
create or replace function public.list_customer_requests()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'NOT_AUTHENTICATED: logg inn foerst' using errcode = '42501';
  end if;

  return coalesce((
    select jsonb_agg(r.x order by r.created_at)
      from (
        select o.created_at,
               jsonb_build_object(
                 'org_id',          o.id,
                 'name',            o.name,
                 'org_nr',          coalesce(o.org_nr, o.requested_org_nr),
                 'org_nr_taken',    (d.digits is not null and exists (
                                       select 1 from organizations o2
                                        where o2.id <> o.id and o2.org_nr is not null
                                          and regexp_replace(o2.org_nr, '[^0-9]', '', 'g') = d.digits)),
                 'supplier_org_id', o.requested_supplier_org_id,
                 'contact_name',    p.full_name,
                 'email',           p.email,
                 'phone',           u.raw_user_meta_data ->> 'phone',
                 'message',         p.message,
                 'created_at',      o.created_at,
                 'erp_matches',     coalesce((
                                       select jsonb_agg(jsonb_build_object('erp_no', e.erp_no, 'name', e.name) order by e.erp_no)
                                         from (select e1.erp_no, e1.name from erp_customers e1
                                                where d.digits is not null
                                                  and e1.org_id = o.requested_supplier_org_id
                                                  and e1.active is not false
                                                  and regexp_replace(coalesce(e1.org_number, ''), '[^0-9]', '', 'g') = d.digits
                                                order by e1.erp_no limit 10) e), '[]'::jsonb)
               ) as x
          from organizations o
          join organization_members m on m.org_id = o.id and m.role = 'owner'
          join profiles p on p.id = m.user_id
          left join auth.users u on u.id = m.user_id
          cross join lateral (select public._orgnr_valid_digits(coalesce(o.org_nr, o.requested_org_nr)) as digits) d
         where o.org_type = 'installer'
           and o.customer_request_decision is null
           and p.status = 'pending'
           and o.requested_supplier_org_id in (
                 select om.org_id from organization_members om
                   join organizations s on s.id = om.org_id and s.org_type = 'supplier'
                  where om.user_id = v_uid)
      ) r
  ), '[]'::jsonb);
end;
$$;

-- ------------------------------------------------------------
-- 8. VAKT: en bruker kan ikke godkjenne seg selv.
--    Policyen "profiles_update_own" (supabase-migration-profiles-update-own.sql, 146) gir
--    UPDATE paa hele egen profilrad -- ogsaa status. Er den kjort, kan en ventende bruker
--    sette sin egen status til 'active' rett mot REST-API-et, og hele godkjenningen (169 og
--    superadmin) er pynt. Policyen endres IKKE; en trigger stopper bare den ene endringen:
--    at brukeren selv (auth.uid() = raden) endrer status/approved_at/approved_by.
--    Uberoert: superadmin (JWT app_metadata), service role/Edge Functions og triggere
--    (auth.uid() er null), og Cenika/superadmin som endrer en ANNEN brukers rad.
-- ------------------------------------------------------------
create or replace function public.profiles_self_status_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null
     and auth.uid() = old.id
     and coalesce((auth.jwt() -> 'app_metadata' ->> 'is_superadmin')::boolean, false) = false
     and (new.status      is distinct from old.status
       or new.approved_at is distinct from old.approved_at
       or new.approved_by is distinct from old.approved_by)
  then
    raise exception 'PROFILE_STATUS_SELF: du kan ikke endre din egen godkjenningsstatus'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_self_status_guard_trg on profiles;
create trigger profiles_self_status_guard_trg
  before update on profiles
  for each row execute function public.profiles_self_status_guard();

-- ------------------------------------------------------------
-- 9. list_customer_orgs() -- kopiert ORDRETT fra supabase-migration-del-med-elektriker.sql
--    (047), med EN ny OR-linje (merket 169): en bedrift Cenika har godkjent, staar i
--    "Del med elektriker" paa samme maate som en Cenika har opprettet. created_by_org settes
--    IKKE ved godkjenning -- bedriften ble opprettet av soekeren, ikke av Cenika.
-- ------------------------------------------------------------
create or replace function public.list_customer_orgs()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_n   int;
  v_sup uuid;
begin
  if v_uid is null then
    raise exception 'NOT_AUTHENTICATED: logg inn foerst' using errcode = '42501';
  end if;

  select count(*) into v_n
    from organization_members om
    join organizations o on o.id = om.org_id
   where om.user_id = v_uid and o.org_type = 'supplier';
  if v_n = 0 then
    raise exception 'NOT_SUPPLIER: bare medlemmer av en leverandoer kan se kundebedriftene'
      using errcode = '42501';
  end if;
  if v_n > 1 then
    raise exception 'AMBIGUOUS_SUPPLIER: brukeren er medlem av flere leverandoerer'
      using errcode = '42501';
  end if;

  select o.id into v_sup
    from organization_members om
    join organizations o on o.id = om.org_id
   where om.user_id = v_uid and o.org_type = 'supplier';

  return coalesce((
    select jsonb_agg(s.x order by lower(s.x ->> 'name'))
      from (
        select jsonb_build_object(
          'org_id',          o.id,
          'name',            o.name,
          'org_nr',          o.org_nr,
          'erp_customer_no', o.erp_customer_no,
          'address',         o.print_address,
          'created_at',      o.created_at,
          'created_by_us',   (o.created_by_org = v_sup),
          'members',         (select count(*) from organization_members m where m.org_id = o.id),
          'last_sign_in_at', (select max(u.last_sign_in_at)
                                from organization_members m
                                join auth.users u on u.id = m.user_id
                               where m.org_id = o.id)
        ) as x
          from organizations o
         where o.org_type = 'installer'
           and (o.created_by_org = v_sup
                or (o.requested_supplier_org_id = v_sup and o.customer_request_decision = 'approved') -- 169
                or o.id in (select ps.org_id
                              from project_shares ps
                              join romtegner_projects p on p.id = ps.project_id
                             where p.org_id = v_sup and ps.org_id is not null))
      ) s
  ), '[]'::jsonb);
end;
$$;

-- ------------------------------------------------------------
-- 10. Rettigheter
-- ------------------------------------------------------------
revoke all on function public._customer_request_supplier(uuid) from public;
revoke all on function public._customer_request_supplier(uuid) from anon;
revoke all on function public._customer_request_supplier(uuid) from authenticated;

revoke all on function public.profiles_self_status_guard() from public;
revoke all on function public.profiles_self_status_guard() from anon;
revoke all on function public.profiles_self_status_guard() from authenticated;

revoke all on function public.list_registration_suppliers() from public;
grant execute on function public.list_registration_suppliers() to anon;
grant execute on function public.list_registration_suppliers() to authenticated;

revoke all on function public.approve_customer_org(uuid, text) from public;
revoke all on function public.approve_customer_org(uuid, text) from anon;
grant execute on function public.approve_customer_org(uuid, text) to authenticated;

revoke all on function public.reject_customer_org(uuid, text) from public;
revoke all on function public.reject_customer_org(uuid, text) from anon;
grant execute on function public.reject_customer_org(uuid, text) to authenticated;

revoke all on function public.list_customer_requests() from public;
revoke all on function public.list_customer_requests() from anon;
grant execute on function public.list_customer_requests() to authenticated;

revoke all on function public.list_customer_orgs() from public;
revoke all on function public.list_customer_orgs() from anon;
grant execute on function public.list_customer_orgs() to authenticated;

-- ============================================================
-- KONTROLL ETTERPAA
-- ============================================================
-- a) Triggeren lagrer de nye feltene:
--   select position('requested_supplier_org_id' in pg_get_functiondef('public.handle_new_user'::regproc)) > 0;
-- b) Hvem kan kalle hva (forventet: anon bare list_registration_suppliers):
--   select p.proname,
--          has_function_privilege('anon', p.oid, 'execute') as anon,
--          has_function_privilege('authenticated', p.oid, 'execute') as authenticated
--     from pg_proc p
--    where p.proname in ('list_registration_suppliers','approve_customer_org','reject_customer_org',
--                        'list_customer_requests','_customer_request_supplier','_activate_customer_org',
--                        '_orgnr_valid_digits','list_customer_orgs');
-- c) Ingen policy er endret paa organizations, organization_members eller profiles:
--   select tablename, policyname, cmd from pg_policies
--    where tablename in ('organizations','organization_members','profiles') order by 1, 2;
--
-- ============================================================
-- TESTER (kjor hver blokk for seg i SQL Editor; alle ender i ROLLBACK)
-- ============================================================
-- Forberedelse: finn Cenika-orgen, en Cenika-bruker og en installatoer-bruker.
--   select o.id, o.name, o.org_type, o.supplier_name from organizations o where o.org_type = 'supplier';
--   select om.user_id, o.name, o.org_type from organization_members om
--     join organizations o on o.id = om.org_id order by o.org_type, o.name;
-- I testene: <CENIKA_ORG>, <CENIKA_USER>, <INSTALLATOR_USER>. Org.nr 123456785 er gyldig (MOD11)
-- og finnes neppe; sjekk med: select id from organizations where org_nr = '123456785';
--
-- TEST 1 -- registrering med "Kunde hos" + org.nr -> en ventende org, profil 'pending',
--           org.nr og leverandoer lagret.
--   begin;
--   insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data, created_at, updated_at)
--   values ('11111111-1111-1111-1111-111111111169', '00000000-0000-0000-0000-000000000000',
--           'authenticated', 'authenticated', 'test169a@example.com',
--           jsonb_build_object('full_name','Test Soeker','company_name','TEST Elektro 169',
--                              'org_number','123 456 785','requested_supplier_org_id','<CENIKA_ORG>'),
--           now(), now());
--   select o.name, o.org_type, o.org_nr, o.requested_org_nr, o.requested_supplier_org_id,
--          o.customer_request_decision, p.status, m.role
--     from organizations o join organization_members m on m.org_id = o.id
--     join profiles p on p.id = m.user_id
--    where m.user_id = '11111111-1111-1111-1111-111111111169';
--     -- forventet: TEST Elektro 169 | installer | 123456785 | 123456785 | <CENIKA_ORG> | null | pending | owner
--   rollback;
--
-- TEST 2 -- falsk leverandoer og ugyldig org.nr i metadata: registreringen gaar likevel
--           gjennom, men ingenting av det lagres.
--   begin;
--   insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data, created_at, updated_at)
--   values ('22222222-2222-2222-2222-222222222169', '00000000-0000-0000-0000-000000000000',
--           'authenticated', 'authenticated', 'test169b@example.com',
--           jsonb_build_object('full_name','Test B','company_name','TEST Elektro 169 B',
--                              'org_number','123456789','requested_supplier_org_id','<INSTALLATOR_ORG_ID>'),
--           now(), now());
--   select o.org_nr, o.requested_org_nr, o.requested_supplier_org_id
--     from organizations o join organization_members m on m.org_id = o.id
--    where m.user_id = '22222222-2222-2222-2222-222222222169';
--     -- forventet: null | null | null
--   rollback;
--
-- TEST 3 -- soekeren proever aa godkjenne seg selv -> avvist.
--   (a) profilen: trigger PROFILE_STATUS_SELF (eller 0 rader hvis 146 ikke er kjort)
--   (b) orgen: 0 rader (ingen UPDATE-policy for medlemmer paa organizations)
--   (c) funksjonen: NOT_ALLOWED (soekeren er ikke medlem av Cenika)
--   begin;
--   insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data, created_at, updated_at)
--   values ('11111111-1111-1111-1111-111111111169', '00000000-0000-0000-0000-000000000000',
--           'authenticated', 'authenticated', 'test169a@example.com',
--           jsonb_build_object('full_name','Test Soeker','company_name','TEST Elektro 169',
--                              'org_number','123456785','requested_supplier_org_id','<CENIKA_ORG>'),
--           now(), now());
--   select set_config('request.jwt.claims',
--     json_build_object('sub','11111111-1111-1111-1111-111111111169','role','authenticated')::text, true);
--   set local role authenticated;
--   update profiles set status = 'active' where id = '11111111-1111-1111-1111-111111111169';
--     -- forventet: ERROR PROFILE_STATUS_SELF (kjor (b) og (c) i en ny blokk etter feilen)
--   rollback;
--   -- (b)+(c): samme forberedelse, deretter
--   --   update organizations set customer_request_decision = 'approved', subscription_status = 'active'
--   --    where name = 'TEST Elektro 169';                       -- forventet: UPDATE 0
--   --   select public.approve_customer_org((select org_id from organization_members
--   --     where user_id = '11111111-1111-1111-1111-111111111169'), null);  -- forventet: NOT_ALLOWED
--
-- TEST 4 -- installatoer-medlem kaller approve_customer_org -> exception NOT_ALLOWED.
--   begin;
--   <forberedelse fra TEST 1>
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<INSTALLATOR_USER>','role','authenticated')::text, true);
--   set local role authenticated;
--   select public.approve_customer_org((select id from organizations where name = 'TEST Elektro 169'), null);
--     -- forventet: ERROR: NOT_ALLOWED
--   rollback;
--
-- TEST 5 -- Cenika-medlem godkjenner -> installer, aktiv, trial null, soekeren er eier og
--           aktiv, Cenika er IKKE medlem, EN tilgangsrad for Cenika, kundenr lagret.
--   begin;
--   <forberedelse fra TEST 1>
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<CENIKA_USER>','role','authenticated')::text, true);
--   set local role authenticated;
--   select jsonb_array_length(public.list_customer_requests()) > 0 as ser_soeknaden;   -- true
--   select public.approve_customer_org((select (x->>'org_id')::uuid
--            from jsonb_array_elements(public.list_customer_requests()) x
--           where x->>'name' = 'TEST Elektro 169'), 'T169');
--     -- forventet: {"result": "approved", ...}
--   reset role;
--   select o.org_type, o.subscription_status, o.trial_ends_at, o.erp_customer_no,
--          o.customer_request_decision, p.status
--     from organizations o join organization_members m on m.org_id = o.id and m.role = 'owner'
--     join profiles p on p.id = m.user_id where o.name = 'TEST Elektro 169';
--     -- forventet: installer | active | null | T169 | approved | active
--   select count(*) from organization_members m join organizations o on o.id = m.org_id
--    where o.name = 'TEST Elektro 169' and m.user_id = '<CENIKA_USER>';           -- forventet: 0
--   select count(*) from organization_supplier_access a join organizations o on o.id = a.org_id
--    where o.name = 'TEST Elektro 169';                                            -- forventet: 1
--   rollback;
--
-- TEST 6 -- org.nr finnes alt -> existing_org; soekeren legges IKKE inn noe sted, og
--           registreringen feiler ikke (org_nr null, requested_org_nr satt).
--   begin;
--   insert into organizations (name, slug, org_type, org_nr) values ('TEST Fantes 169', 'test-fantes-169', 'installer', '123456785');
--   <forberedelse fra TEST 1>
--   select org_nr, requested_org_nr from organizations where name = 'TEST Elektro 169';  -- null | 123456785
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<CENIKA_USER>','role','authenticated')::text, true);
--   set local role authenticated;
--   select x->>'org_nr_taken' from jsonb_array_elements(public.list_customer_requests()) x
--    where x->>'name' = 'TEST Elektro 169';                                         -- true
--   select public.approve_customer_org((select (x->>'org_id')::uuid
--            from jsonb_array_elements(public.list_customer_requests()) x
--           where x->>'name' = 'TEST Elektro 169'), null);
--     -- forventet: {"result": "existing_org", ...}
--   reset role;
--   select count(*) from organization_members m join organizations o on o.id = m.org_id
--    where o.name = 'TEST Fantes 169';                                               -- forventet: 0
--   select p.status from profiles p where p.id = '11111111-1111-1111-1111-111111111169';  -- pending
--   rollback;
--
-- TEST 7 -- bruker A ser ikke bruker Bs soeknad: en installatoer faar tom liste, og en
--           soeker ser ikke andres orger (RLS "Medlemmer ser sine org").
--   begin;
--   <forberedelse fra TEST 1>
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<INSTALLATOR_USER>','role','authenticated')::text, true);
--   set local role authenticated;
--   select public.list_customer_requests();                                          -- forventet: []
--   select count(*) from organizations where name = 'TEST Elektro 169';              -- forventet: 0
--   rollback;
--
-- TEST 8 -- avslag: profil 'rejected', begrunnelse lagret; nytt forsoek gir ALREADY_DECIDED.
--   begin;
--   <forberedelse fra TEST 1>
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<CENIKA_USER>','role','authenticated')::text, true);
--   set local role authenticated;
--   select public.reject_customer_org((select (x->>'org_id')::uuid
--            from jsonb_array_elements(public.list_customer_requests()) x
--           where x->>'name' = 'TEST Elektro 169'), 'Ikke kunde hos oss');
--   reset role;
--   select o.customer_request_decision, o.customer_request_reject_reason, p.status
--     from organizations o join organization_members m on m.org_id = o.id and m.role = 'owner'
--     join profiles p on p.id = m.user_id where o.name = 'TEST Elektro 169';
--     -- forventet: rejected | Ikke kunde hos oss | rejected
--   rollback;
--
-- TEST 9 -- anon kan lese leverandoerlista, men ikke kalle resten.
--   begin;
--   select set_config('request.jwt.claims', '{"role":"anon"}', true);
--   set local role anon;
--   select public.list_registration_suppliers();          -- forventet: [{"id": ..., "name": "Cenika AS"}]
--   select public.list_customer_requests();               -- forventet: ERROR permission denied
--   rollback;
-- ============================================================
