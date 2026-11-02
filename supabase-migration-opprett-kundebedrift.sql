-- ============================================================
-- 044v2-web: create_customer_org() -- leverandoren (Cenika) oppretter en
-- elektrobedrift som kunde, valgt fra Visma-kundelista (erp_customers).
-- ============================================================
-- Kjores manuelt i Supabase SQL Editor. Idempotent. Ren ASCII.
-- KREVER supabase-migration-org-orgnr.sql (042) kjort forst: funksjonen skriver
-- org_nr, parent_org_nr, created_by_user og created_by_org.
--
-- Spec: spec-overfor-prosjekt-til-elektriker.md regel 22-32, 40, 43-45.
--
-- HVORFOR EN FUNKSJON OG IKKE EN POLICY: policyene paa organizations er
-- "Superadmin full tilgang org" (all) + "Medlemmer ser sine org" (select).
-- De LOSNES IKKE. Alle reglene under bor her, i en security definer-funksjon
-- som sjekker kalleren selv -- samme monster som kundelenke-RPC-ene
-- (set search_path, eksplisitt revoke/grant).
--
-- Reglene, i rekkefolge:
--  1. Kalleren maa vaere medlem av en org med org_type = 'supplier'. Leverandoren
--     hentes fra MEDLEMSKAPET (auth.uid()), aldri fra noe klienten sender.
--  2. Duplikat: samme org.nr (bare siffer) -> returner den eksisterende id-en med
--     existed = true. Ingen ny org, INGEN invitasjon, ingen endring paa den
--     eksisterende (en leverandor skal ikke kunne invitere admin inn i en bedrift
--     den ikke opprettet). Samme Visma-kundenummer fra samme leverandor regnes
--     ogsaa som duplikat.
--  3. Ny org: org_type = 'installer' (ALDRI 'supplier' -- finnes ikke som
--     parameter), subscription_status = 'active' og trial_ends_at = null
--     EKSPLISITT (standarden er 'trial' + 30 dager, og paaloggingen stenger
--     ute naar den gaar ut).
--  4. En rad i organization_supplier_access for kallerens EGEN leverandor.
--  5. Kalleren blir IKKE medlem av den nye orgen. Ingen insert i
--     organization_members i hele funksjonen.
--  6. Invitasjon i org_invitations for kontaktpersonen, rolle 'admin'.
--     Tokenet returneres. E-posten sendes av 045.
--
-- Org.nr: ugyldig (MOD11) eller tomt krever p_orgnr_override (begrunnelse).
-- Da lagres org_nr = null, og overstyringen logges i admin_notes med hvem og
-- naar -- samme merke som admin-panelet (042): "Ingen norsk organisasjonsnummer".
--
-- Profilen til den inviterte blir 'active' av den EKSISTERENDE triggeren
-- handle_invitation_on_signup (supabase-migration-orgtypes.sql:92-125), som
-- allerede setter status = 'active' for enhver godtatt invitasjon. Den roeres
-- ikke her. Se kontrollspoerringen nederst.
-- ============================================================

-- Visma-kundenummeret paa organisasjonen (additivt). Samme navn som
-- customers.erp_customer_no -- kolonnen betyr det samme uansett ERP.
alter table organizations
  add column if not exists erp_customer_no text;

create or replace function public.create_customer_org(
  p_name            text,
  p_org_nr          text,
  p_parent_org_nr   text,
  p_address         text,
  p_contact_email   text,
  p_erp_customer_no text,
  p_orgnr_override  text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid           uuid := auth.uid();
  v_n             int;
  v_supplier_org  uuid;
  v_supplier_name text;
  v_supplier_id   uuid;
  v_name          text := nullif(btrim(coalesce(p_name, '')), '');
  v_email         text := lower(nullif(btrim(coalesce(p_contact_email, '')), ''));
  v_digits        text := regexp_replace(coalesce(p_org_nr, ''), '[^0-9]', '', 'g');
  v_parent        text := regexp_replace(coalesce(p_parent_org_nr, ''), '[^0-9]', '', 'g');
  v_erp           text := nullif(btrim(coalesce(p_erp_customer_no, '')), '');
  v_addr          text := nullif(btrim(coalesce(p_address, '')), '');
  v_override      text := nullif(btrim(coalesce(p_orgnr_override, '')), '');
  v_w             int[] := array[3, 2, 7, 6, 5, 4, 3, 2];
  v_sum           int;
  v_rest          int;
  v_ok            boolean;
  v_note          text := null;
  v_ex            record;
  v_org_id        uuid;
  v_base          text;
  v_slug          text;
  v_i             int := 1;
  v_token         text;
begin
  -- 1. Kalleren -------------------------------------------------------------
  if v_uid is null then
    raise exception 'NOT_AUTHENTICATED: logg inn foerst' using errcode = '42501';
  end if;

  select count(*) into v_n
    from organization_members om
    join organizations o on o.id = om.org_id
   where om.user_id = v_uid and o.org_type = 'supplier';
  if v_n = 0 then
    raise exception 'NOT_SUPPLIER: bare medlemmer av en leverandoer kan opprette kundebedrifter'
      using errcode = '42501';
  end if;
  if v_n > 1 then
    -- Hvilken leverandoers produkter skulle kunden faatt? Gjett ikke.
    raise exception 'AMBIGUOUS_SUPPLIER: brukeren er medlem av flere leverandoerer'
      using errcode = '42501';
  end if;

  select o.id, o.supplier_name into v_supplier_org, v_supplier_name
    from organization_members om
    join organizations o on o.id = om.org_id
   where om.user_id = v_uid and o.org_type = 'supplier';

  select s.id into v_supplier_id from suppliers s where s.name = v_supplier_name;
  if v_supplier_id is null then
    raise exception 'SUPPLIER_NOT_LINKED: leverandoer-orgen (supplier_name=%) har ingen rad i suppliers',
      coalesce(v_supplier_name, 'null') using errcode = '22023';
  end if;

  -- Inndata -------------------------------------------------------------------
  if v_name is null then
    raise exception 'NAME_REQUIRED: bedriftsnavn mangler' using errcode = '22023';
  end if;
  if length(v_name) > 200 then
    raise exception 'NAME_TOO_LONG' using errcode = '22023';
  end if;
  if v_email is null or v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'EMAIL_INVALID: kontaktpersonens e-post er paakrevd' using errcode = '22023';
  end if;

  -- Org.nr: MOD11, vekter 3 2 7 6 5 4 3 2 fra venstre; rest 0 -> 0; rest 1 -> ugyldig.
  -- Samme regel som _validOrgNr i index.html (042).
  v_ok := false;
  if length(v_digits) = 9 then
    v_sum := 0;
    for k in 1..8 loop
      v_sum := v_sum + substr(v_digits, k, 1)::int * v_w[k];
    end loop;
    v_rest := v_sum % 11;
    v_ok := v_rest <> 1
        and (case when v_rest = 0 then 0 else 11 - v_rest end) = substr(v_digits, 9, 1)::int;
  end if;

  if not v_ok then
    if v_override is null then
      raise exception 'ORGNR_INVALID: organisasjonsnummeret mangler eller er ugyldig (oppgitt: %). Overstyring krever begrunnelse.',
        coalesce(nullif(btrim(p_org_nr), ''), 'tomt') using errcode = '22023';
    end if;
    v_note := '[Ingen norsk organisasjonsnummer - overstyrt av '
      || coalesce(auth.jwt() ->> 'email', v_uid::text)
      || ' ' || to_char(now() at time zone 'Europe/Oslo', 'DD.MM.YYYY HH24:MI')
      || ' via create_customer_org'
      || case when nullif(btrim(coalesce(p_org_nr, '')), '') is not null
              then '; oppgitt nummer: ' || left(btrim(p_org_nr), 40) else '' end
      || '; begrunnelse: ' || left(v_override, 500) || ']';
    v_digits := null;
  end if;

  -- Hovedenhet: valgfri, men er den oppgitt maa den vaere ni siffer og ikke lik enheten selv.
  if v_parent = '' then
    v_parent := null;
  elsif length(v_parent) <> 9 then
    raise exception 'PARENT_ORGNR_INVALID: hovedenhetens nummer maa ha ni siffer' using errcode = '22023';
  elsif v_parent = v_digits then
    raise exception 'PARENT_ORGNR_SAME: hovedenheten kan ikke ha samme nummer som bedriften' using errcode = '22023';
  end if;

  -- 2. Duplikat -----------------------------------------------------------------
  if v_digits is not null then
    select o.id, o.name into v_ex
      from organizations o
     where o.org_nr is not null
       and regexp_replace(o.org_nr, '[^0-9]', '', 'g') = v_digits
     limit 1;
    if found then
      return jsonb_build_object('org_id', v_ex.id, 'existed', true, 'matched_on', 'org_nr',
                                'name', v_ex.name, 'invite_token', null, 'invite_email', null);
    end if;
  end if;
  if v_erp is not null then
    select o.id, o.name into v_ex
      from organizations o
     where o.created_by_org = v_supplier_org and o.erp_customer_no = v_erp
     limit 1;
    if found then
      return jsonb_build_object('org_id', v_ex.id, 'existed', true, 'matched_on', 'erp_customer_no',
                                'name', v_ex.name, 'invite_token', null, 'invite_email', null);
    end if;
  end if;

  -- 3. Opprett ------------------------------------------------------------------
  v_base := btrim(lower(regexp_replace(v_name, '[^a-zA-Z0-9]+', '-', 'g')), '-');
  if v_base = '' then v_base := 'kunde'; end if;
  v_base := left(v_base, 60);
  v_slug := v_base;
  while exists (select 1 from organizations where slug = v_slug) loop
    v_i := v_i + 1;
    v_slug := v_base || '-' || v_i;
  end loop;

  begin
    insert into organizations (
      name, slug, org_type,
      subscription_status, trial_ends_at,
      org_nr, parent_org_nr, erp_customer_no, print_address,
      created_by_user, created_by_org, admin_notes
    ) values (
      v_name, v_slug, 'installer',
      'active', null,
      v_digits, v_parent, v_erp, v_addr,
      v_uid, v_supplier_org, v_note
    )
    returning id into v_org_id;
  exception when unique_violation then
    -- Noen opprettet samme org.nr i samme oyeblikk (unik indeks fra 042).
    if v_digits is not null then
      select o.id, o.name into v_ex
        from organizations o
       where o.org_nr is not null
         and regexp_replace(o.org_nr, '[^0-9]', '', 'g') = v_digits
       limit 1;
      if found then
        return jsonb_build_object('org_id', v_ex.id, 'existed', true, 'matched_on', 'org_nr',
                                  'name', v_ex.name, 'invite_token', null, 'invite_email', null);
      end if;
    end if;
    raise;
  end;

  -- 4. Leverandoertilgang: bare kallerens egen leverandoer --------------------------
  insert into organization_supplier_access (org_id, supplier_id, enabled, granted_by)
  values (v_org_id, v_supplier_id, true, v_uid)
  on conflict (org_id, supplier_id) do update set enabled = true;

  -- 5. (Med vilje ingenting: kalleren blir IKKE medlem.)

  -- 6. Invitasjon til kontaktpersonen ---------------------------------------------
  insert into org_invitations (org_id, email, role, invited_by, status, expires_at)
  values (v_org_id, v_email, 'admin', v_uid, 'pending', now() + interval '30 days')
  returning token into v_token;

  return jsonb_build_object('org_id', v_org_id, 'existed', false, 'matched_on', null,
                            'name', v_name, 'org_nr', v_digits,
                            'invite_token', v_token, 'invite_email', v_email);
end;
$$;

-- 7. Rettigheter. Funksjonen beskytter seg selv (punkt 1); anon faar ikke kalle den.
revoke all on function public.create_customer_org(text, text, text, text, text, text, text) from public;
revoke all on function public.create_customer_org(text, text, text, text, text, text, text) from anon;
grant execute on function public.create_customer_org(text, text, text, text, text, text, text) to authenticated;

-- ============================================================
-- KONTROLL ETTERPAA
-- ============================================================
-- a) Signaturen -- det finnes INGEN org_type-parameter:
--   select pg_get_function_identity_arguments(p.oid), p.prosecdef as security_definer, p.proconfig
--     from pg_proc p where p.proname = 'create_customer_org';
--   -> p_name text, p_org_nr text, p_parent_org_nr text, p_address text,
--      p_contact_email text, p_erp_customer_no text, p_orgnr_override text | true | {search_path=public}
--
-- b) Hvem kan kalle den (forventet: authenticated=true, anon=false):
--   select has_function_privilege('anon', 'public.create_customer_org(text,text,text,text,text,text,text)', 'execute') as anon,
--          has_function_privilege('authenticated', 'public.create_customer_org(text,text,text,text,text,text,text)', 'execute') as authenticated;
--
-- c) Oppgave B: triggerne som gjor den inviterte aktiv. Begge MAA finnes. De fyrer i
--    navnerekkefolge: on_auth_user_created (lager profilen, 'pending') foer
--    on_user_check_invitations (medlemskap + profil 'active').
--   select tgname, tgenabled from pg_trigger
--    where tgrelid = 'auth.users'::regclass and not tgisinternal order by tgname;
--   select position('active' in prosrc) > 0 as setter_active
--     from pg_proc where proname = 'handle_invitation_on_signup';
--
-- ============================================================
-- TESTER (kjor hver blokk for seg i SQL Editor; alle ender i ROLLBACK,
-- saa ingenting blir liggende igjen)
-- ============================================================
-- Forberedelse: finn en leverandor-bruker og en installator-bruker.
--   select om.user_id, o.name, o.org_type from organization_members om
--     join organizations o on o.id = om.org_id order by o.org_type, o.name;
--
-- TEST 1 -- leverandor-medlem: org opprettes riktig, kalleren blir IKKE medlem.
--   begin;
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<LEVERANDOR_USER_ID>','role','authenticated','email','test@cenika.no')::text, true);
--   set local role authenticated;
--   select public.create_customer_org('TEST Elektro 044', '123456785', null, '3000 Drammen',
--                                     'kontakt@test-elektro-044.no', 'T044') as r;
--   reset role;
--   select name, org_type, subscription_status, trial_ends_at, org_nr, erp_customer_no,
--          created_by_user, created_by_org
--     from organizations where org_nr = '123456785';
--     -- forventet: installer | active | null | 123456785 | T044 | <LEVERANDOR_USER_ID> | <Cenika-org>
--   select count(*) as tilgang_rader, bool_and(s.name = lo.supplier_name) as bare_egen_leverandor
--     from organization_supplier_access a
--     join suppliers s on s.id = a.supplier_id
--     join organizations o on o.id = a.org_id
--     join organizations lo on lo.id = o.created_by_org
--    where o.org_nr = '123456785';
--     -- forventet: 1 | true
--   select count(*) as kaller_medlem from organization_members m
--     join organizations o on o.id = m.org_id
--    where o.org_nr = '123456785' and m.user_id = '<LEVERANDOR_USER_ID>';
--     -- forventet: 0
--   select email, role, status from org_invitations i
--     join organizations o on o.id = i.org_id where o.org_nr = '123456785';
--     -- forventet: kontakt@test-elektro-044.no | admin | pending
--   rollback;
--
-- TEST 2 -- installator-medlem: exception NOT_SUPPLIER.
--   begin;
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<INSTALLATOR_USER_ID>','role','authenticated')::text, true);
--   set local role authenticated;
--   select public.create_customer_org('TEST Elektro 044', '123456785', null, null,
--                                     'kontakt@test-elektro-044.no', null);
--     -- forventet: ERROR: NOT_SUPPLIER: ...
--   rollback;
--
-- TEST 3 -- uten innlogging: exception.
--   begin;
--   select set_config('request.jwt.claims', '{"role":"anon"}', true);
--   set local role anon;
--   select public.create_customer_org('TEST Elektro 044', '123456785', null, null,
--                                     'kontakt@test-elektro-044.no', null);
--     -- forventet: ERROR: permission denied for function create_customer_org
--   rollback;
--   -- Og som authenticated uten sub (auth.uid() = null):
--   begin;
--   select set_config('request.jwt.claims', '{"role":"authenticated"}', true);
--   set local role authenticated;
--   select public.create_customer_org('TEST Elektro 044', '123456785', null, null,
--                                     'kontakt@test-elektro-044.no', null);
--     -- forventet: ERROR: NOT_AUTHENTICATED: ...
--   rollback;
--
-- TEST 4 -- samme org.nr to ganger, ogsaa med mellomrom: andre kall gir samme id.
--   begin;
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<LEVERANDOR_USER_ID>','role','authenticated')::text, true);
--   set local role authenticated;
--   select public.create_customer_org('TEST Elektro 044', '941163343', null, null,
--                                     'a@test-elektro-044.no', null) as forste;
--   select public.create_customer_org('TEST Elektro 044 kopi', '941 163 343', null, null,
--                                     'b@test-elektro-044.no', null) as andre;
--     -- forventet: andre.org_id = forste.org_id, andre.existed = true,
--     --            andre.invite_token = null (ingen invitasjon til en eksisterende bedrift)
--   reset role;
--   select count(*) from organizations where regexp_replace(org_nr,'[^0-9]','','g') = '941163343';
--     -- forventet: 1 (eller 1 som fantes fra foer -- da er "forste" ogsaa existed = true)
--   rollback;
--
-- TEST 4b -- ugyldig org.nr uten og med overstyring.
--   begin;
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<LEVERANDOR_USER_ID>','role','authenticated','email','test@cenika.no')::text, true);
--   set local role authenticated;
--   select public.create_customer_org('TEST Svensk AB', '556677-8899', null, null,
--                                     'x@test-svensk.se', null);
--     -- forventet: ERROR: ORGNR_INVALID: ...
--   rollback;
--   begin;
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<LEVERANDOR_USER_ID>','role','authenticated','email','test@cenika.no')::text, true);
--   set local role authenticated;
--   select public.create_customer_org('TEST Svensk AB', '556677-8899', null, null,
--                                     'x@test-svensk.se', null, 'Svensk firma, ikke i Enhetsregisteret');
--   reset role;
--   select org_nr, admin_notes from organizations where name = 'TEST Svensk AB';
--     -- forventet: null | [Ingen norsk organisasjonsnummer - overstyrt av test@cenika.no ...]
--   rollback;
--
-- TEST 5 -- org_type kan ikke settes: det finnes ingen slik parameter.
--   select pg_get_function_identity_arguments(p.oid) from pg_proc p where p.proname = 'create_customer_org';
--     -- forventet: ingen "org_type" i lista
--   select public.create_customer_org(p_name => 'X', p_org_nr => '123456785', p_parent_org_nr => null,
--     p_address => null, p_contact_email => 'x@x.no', p_erp_customer_no => null, p_org_type => 'supplier');
--     -- forventet: ERROR: function public.create_customer_org(...) does not exist
-- ============================================================
