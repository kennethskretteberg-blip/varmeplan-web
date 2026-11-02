-- ============================================================
-- 170-web: Kundebedrifter faar kabel, folie og matte innendoers.
-- ============================================================
-- Kjores manuelt i Supabase SQL Editor. Idempotent. Ren ASCII. Additiv: to nye kolonner,
-- tre nye funksjoner. Ingen drop, ingen policy endret, ingen RLS lagt til.
--
-- KREVER (i denne rekkefolgen):
--   supabase-migration-org-orgnr.sql             (042: created_by_org)
--   supabase-migration-opprett-kundebedrift.sql  (044v2 slik den ser ut etter 170: legger
--                                                 allowed_modules og setter den i
--                                                 _activate_customer_org)
--   supabase-migration-kundesoknad.sql           (169: requested_supplier_org_id,
--                                                 customer_request_decision)
--
-- ------------------------------------------------------------
-- VIKTIG -- DETTE ER IKKE EN SIKKERHETSGRENSE
-- ------------------------------------------------------------
-- allowed_modules styrer bare hva knappene i Varmeplan lar brukeren STARTE (nytt rom, ny del,
-- nytt utlegg i snoe/trapp/tak/fryserom, verktoeyene effektbehov og frostsikring). En teknisk
-- kyndig bruker kan i teorien lage et snoeprosjekt ved aa skrive prosjektdata direkte. Det er
-- greit: modulene beskytter ikke data, bare arbeidsflyt. Derfor INGEN RLS for dette.
-- Det som ER beskyttet: hvem som kan ENDRE allowed_modules. Det gaar bare gjennom
-- set_customer_modules (under), og organizations har ingen UPDATE-policy for medlemmer.
--
-- Verdiene i allowed_modules er de eksisterende modul-id-ene i index.html (MODULE_TYPES):
--   indoor, list, stair, snow, snowcalc, frost, roof
-- pluss romtypen fryserom (romtype, ikke modul -- maalt i 168).
-- null = alle moduler. Cenika og alle eksisterende orger har null, og ingenting endres for dem.
-- Kundebedrifter faar array['indoor','list'] (innendoers gulvvarme + hurtigprosjektering, dvs.
-- kabel, folie og matte innendoers) i _activate_customer_org -- baade naar Cenika oppretter
-- bedriften (create_customer_org) og naar Cenika godkjenner en soeknad (approve_customer_org).
-- ============================================================

do $$
begin
  if to_regprocedure('public._activate_customer_org(uuid,uuid,text,uuid)') is null then
    raise exception 'Kjor supabase-migration-opprett-kundebedrift.sql (versjonen fra 170) foerst';
  end if;
  if not exists (select 1 from information_schema.columns
                  where table_schema = 'public' and table_name = 'organizations'
                    and column_name = 'customer_request_decision') then
    raise exception 'Kjor supabase-migration-kundesoknad.sql (169) foerst';
  end if;
end $$;

-- ------------------------------------------------------------
-- 1. Kolonner (additivt)
-- ------------------------------------------------------------
-- allowed_modules  se over. Ogsaa lagt til i 044-fila; her igjen saa fila staar paa egne ben.
-- contact_email    leverandoerens adresse for "Be Cenika om prosjektering". Finnes ikke paa
--                  organizations i dag (bare print_email, som er adressen som STAAR PAA PDF-en).
--                  Klienten bruker contact_email, og faller tilbake paa print_email.
--                  >>> Kenneth fyller inn Cenikas adresse, se SPOERSMAAL.md:
--                  update organizations set contact_email = '<adresse>' where id = '<CENIKA_ORG>';
alter table organizations
  add column if not exists allowed_modules text[],
  add column if not exists contact_email   text;

-- Kjente modulnavn, ett sted. Brukes av set_customer_modules.
create or replace function public._known_modules()
returns text[]
language sql
immutable
set search_path = public
as $$ select array['indoor','list','stair','snow','snowcalc','frost','roof','fryserom']::text[] $$;

-- Leverandoeren til kalleren: EN supplier-org via medlemskapet (auth.uid()), aldri noe klienten
-- sender. Samme regel som create_customer_org / list_customer_orgs.
create or replace function public._caller_supplier_org()
returns uuid
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
    from organization_members om join organizations o on o.id = om.org_id
   where om.user_id = v_uid and o.org_type = 'supplier';
  if v_n = 0 then
    raise exception 'NOT_SUPPLIER: bare medlemmer av en leverandoer kan endre kundenes moduler'
      using errcode = '42501';
  end if;
  if v_n > 1 then
    raise exception 'AMBIGUOUS_SUPPLIER: brukeren er medlem av flere leverandoerer' using errcode = '42501';
  end if;
  select o.id into v_sup
    from organization_members om join organizations o on o.id = om.org_id
   where om.user_id = v_uid and o.org_type = 'supplier';
  return v_sup;
end;
$$;

-- ------------------------------------------------------------
-- 2. set_customer_modules(p_org_id, p_modules)
-- ------------------------------------------------------------
-- Kan kalles av:
--   * superadmin (app_metadata.is_superadmin i JWT -- ALDRI auth.users, se CLAUDE.md), eller
--   * et medlem av leverandoer-orgen som opprettet kundebedriften (created_by_org), eller som
--     GODKJENTE den (169: requested_supplier_org_id + customer_request_decision = 'approved';
--     created_by_org settes ikke ved godkjenning -- samme regel som list_customer_orgs i 169).
-- Ingen andre. Kundebedriften kan IKKE endre sine egne moduler (den er ikke leverandoer ->
-- NOT_SUPPLIER). Bare installatoer-orger (kundebedrifter) kan faa en liste.
-- p_modules: ikke null; bare kjente navn (UNKNOWN_MODULE ellers); dubletter fjernes og
-- rekkefoelgen blir den faste i _known_modules().
create or replace function public.set_customer_modules(p_org_id uuid, p_modules text[])
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_super boolean := coalesce((auth.jwt() -> 'app_metadata' ->> 'is_superadmin')::boolean, false);
  v_sup   uuid;
  v_org   record;
  v_bad   text;
  v_list  text[];
begin
  if v_uid is null then
    raise exception 'NOT_AUTHENTICATED: logg inn foerst' using errcode = '42501';
  end if;
  if p_modules is null then
    raise exception 'MODULES_REQUIRED: lista kan ikke vaere null' using errcode = '22023';
  end if;

  select o.id, o.org_type, o.created_by_org, o.requested_supplier_org_id, o.customer_request_decision
    into v_org from organizations o where o.id = p_org_id for update;
  if not found then
    raise exception 'ORG_NOT_FOUND' using errcode = '22023';
  end if;
  if v_org.org_type is distinct from 'installer' then
    raise exception 'NOT_INSTALLER: bare kundebedrifter (installatoer-orger) kan faa modul-grense'
      using errcode = '42501';
  end if;

  if not v_super then
    v_sup := public._caller_supplier_org();   -- NOT_SUPPLIER for kundebedriften selv
    if not (v_org.created_by_org = v_sup
            or (v_org.requested_supplier_org_id = v_sup
                and v_org.customer_request_decision = 'approved')) then
      raise exception 'NOT_ALLOWED: kundebedriften er opprettet eller godkjent av en annen leverandoer'
        using errcode = '42501';
    end if;
  end if;

  select m into v_bad from unnest(p_modules) m
   where m is null or not (m = any (public._known_modules())) limit 1;
  if found then
    raise exception 'UNKNOWN_MODULE: %', coalesce(v_bad, 'null') using errcode = '22023';
  end if;

  select coalesce(array_agg(k order by i), '{}'::text[]) into v_list
    from unnest(public._known_modules()) with ordinality as t(k, i)
   where k = any (p_modules);

  update organizations set allowed_modules = v_list where id = p_org_id;
  return jsonb_build_object('org_id', p_org_id, 'allowed_modules', to_jsonb(v_list));
end;
$$;

-- ------------------------------------------------------------
-- 3. list_customer_modules() -- avkrysningslista i Kunder-fanen
-- ------------------------------------------------------------
-- Samme utvalg som set_customer_modules tillater: kundebedrifter kalleren (leverandoer) har
-- opprettet eller godkjent. Leser ingen andre kolonner enn de som vises.
create or replace function public.list_customer_modules()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_sup uuid := public._caller_supplier_org();
begin
  return coalesce((
    select jsonb_agg(jsonb_build_object(
             'org_id', o.id, 'name', o.name, 'org_nr', o.org_nr,
             'allowed_modules', to_jsonb(o.allowed_modules)) order by lower(o.name))
      from organizations o
     where o.org_type = 'installer'
       and (o.created_by_org = v_sup
            or (o.requested_supplier_org_id = v_sup and o.customer_request_decision = 'approved'))
  ), '[]'::jsonb);
end;
$$;

-- ------------------------------------------------------------
-- 4. module_request_contact(p_org_id) -- hvem "Be Cenika om prosjektering" sendes til
-- ------------------------------------------------------------
-- Kundebedriften kan ikke lese leverandoerens org-rad (RLS: "Medlemmer ser sine org"). Denne
-- returnerer BARE navn og kontaktadresse til leverandoeren som opprettet/godkjente kalleren
-- sin org. Kalleren maa vaere medlem av p_org_id (eller superadmin).
-- Leverandoerens felt leses via to_jsonb(), saa funksjonen virker ogsaa der print_email ikke
-- finnes (migrasjonen feedback-print ikke kjort).
create or replace function public.module_request_contact(p_org_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_super boolean := coalesce((auth.jwt() -> 'app_metadata' ->> 'is_superadmin')::boolean, false);
  v_org   record;
  v_sid   uuid;
  v_s     jsonb;
begin
  if v_uid is null then
    raise exception 'NOT_AUTHENTICATED: logg inn foerst' using errcode = '42501';
  end if;
  if not v_super and not exists (select 1 from organization_members
                                  where org_id = p_org_id and user_id = v_uid) then
    raise exception 'NOT_MEMBER' using errcode = '42501';
  end if;
  select o.created_by_org, o.requested_supplier_org_id, o.customer_request_decision
    into v_org from organizations o where o.id = p_org_id;
  if not found then
    return null;
  end if;
  v_sid := coalesce(v_org.created_by_org,
                    case when v_org.customer_request_decision = 'approved'
                         then v_org.requested_supplier_org_id end);
  if v_sid is null then
    return null;
  end if;
  select to_jsonb(s) into v_s from organizations s where s.id = v_sid and s.org_type = 'supplier';
  if v_s is null then
    return null;
  end if;
  return jsonb_build_object(
    'supplier_org_id', v_sid,
    'supplier_name',   coalesce(nullif(btrim(v_s ->> 'supplier_name'), ''), v_s ->> 'name'),
    'contact_email',   coalesce(nullif(btrim(v_s ->> 'contact_email'), ''),
                                nullif(btrim(v_s ->> 'print_email'), '')));
end;
$$;

-- ------------------------------------------------------------
-- 5. Rettigheter
-- ------------------------------------------------------------
revoke all on function public._known_modules() from public;
revoke all on function public._known_modules() from anon;
revoke all on function public._caller_supplier_org() from public;
revoke all on function public._caller_supplier_org() from anon;
revoke all on function public._caller_supplier_org() from authenticated;

revoke all on function public.set_customer_modules(uuid, text[]) from public;
revoke all on function public.set_customer_modules(uuid, text[]) from anon;
grant execute on function public.set_customer_modules(uuid, text[]) to authenticated;

revoke all on function public.list_customer_modules() from public;
revoke all on function public.list_customer_modules() from anon;
grant execute on function public.list_customer_modules() to authenticated;

revoke all on function public.module_request_contact(uuid) from public;
revoke all on function public.module_request_contact(uuid) from anon;
grant execute on function public.module_request_contact(uuid) to authenticated;

-- ============================================================
-- KONTROLL ETTERPAA
-- ============================================================
-- a) Kolonnene finnes, og ingen eksisterende org har faatt en liste:
--   select count(*) filter (where allowed_modules is not null) as med_liste, count(*) as alle
--     from organizations;                          -- med_liste = 0 rett etter kjoring
-- b) Hvem kan kalle hva (forventet: anon ingenting):
--   select p.proname, has_function_privilege('anon', p.oid, 'execute') as anon,
--          has_function_privilege('authenticated', p.oid, 'execute') as authenticated
--     from pg_proc p where p.proname in ('set_customer_modules','list_customer_modules',
--                                        'module_request_contact','_caller_supplier_org');
--   -- forventet: _caller_supplier_org false/false, de tre andre false/true
-- c) Fyll inn Cenikas kontaktadresse (SPOERSMAAL.md):
--   update organizations set contact_email = '<adresse>' where id = '<CENIKA_ORG>';

-- ============================================================
-- TESTER (kjor hver blokk for seg; alle ruller tilbake)
-- ============================================================
-- Forberedelse: finn Cenika-orgen og en Cenika-bruker.
--   select o.id, o.name, o.supplier_name from organizations o where o.org_type = 'supplier';
--   select om.user_id, o.name from organization_members om join organizations o on o.id = om.org_id
--    where o.org_type = 'supplier';
-- I testene: <CENIKA_ORG>, <CENIKA_USER>.
--
-- TEST 1 -- kundebedriften proever set_customer_modules paa seg selv -> exception NOT_SUPPLIER.
--   begin;
--   insert into organizations (id, name, slug, org_type, created_by_org, allowed_modules)
--   values ('17017017-0000-0000-0000-000000000001', 'TEST Kunde 170', 'test-kunde-170', 'installer',
--           '<CENIKA_ORG>', array['indoor','list']);
--   insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data, created_at, updated_at)
--   values ('17017017-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000000',
--           'authenticated', 'authenticated', 'test170kunde@example.com', '{}'::jsonb, now(), now());
--   insert into organization_members (org_id, user_id, role)
--   values ('17017017-0000-0000-0000-000000000001', '17017017-0000-0000-0000-0000000000a1', 'owner');
--   select set_config('request.jwt.claims',
--     json_build_object('sub','17017017-0000-0000-0000-0000000000a1','role','authenticated')::text, true);
--   set local role authenticated;
--   select public.set_customer_modules('17017017-0000-0000-0000-000000000001', array['indoor','list','snow']);
--     -- forventet: ERROR: NOT_SUPPLIER
--   rollback;
--   -- Og direkte: (samme forberedelse) update organizations set allowed_modules = null
--   --   where id = '17017017-0000-0000-0000-000000000001';      -- forventet: UPDATE 0
--   -- Kunden kan lese egen kontakt:
--   --   select public.module_request_contact('17017017-0000-0000-0000-000000000001');
--   --   -- forventet: {"supplier_name": "Cenika...", "contact_email": ..., "supplier_org_id": "<CENIKA_ORG>"}
--
-- TEST 2 -- Cenika paa egen kunde -> ok.
--   begin;
--   insert into organizations (id, name, slug, org_type, created_by_org, allowed_modules)
--   values ('17017017-0000-0000-0000-000000000001', 'TEST Kunde 170', 'test-kunde-170', 'installer',
--           '<CENIKA_ORG>', array['indoor','list']);
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<CENIKA_USER>','role','authenticated')::text, true);
--   set local role authenticated;
--   select public.set_customer_modules('17017017-0000-0000-0000-000000000001', array['snow','indoor','list','indoor']);
--     -- forventet: {"org_id": "...", "allowed_modules": ["indoor", "list", "snow"]}
--   select public.list_customer_modules() @> '[{"name":"TEST Kunde 170"}]'::jsonb;   -- true
--   select public.set_customer_modules('17017017-0000-0000-0000-000000000001', array['plasma']);
--     -- forventet: ERROR: UNKNOWN_MODULE: plasma
--   rollback;
--
-- TEST 3 -- Cenika paa en kunde opprettet av en annen leverandoer -> exception NOT_ALLOWED.
--   begin;
--   insert into organizations (id, name, slug, org_type, supplier_name)
--   values ('17017017-0000-0000-0000-000000000002', 'TEST Annen Leverandoer 170', 'test-annen-lev-170',
--           'supplier', 'TEST170');
--   insert into organizations (id, name, slug, org_type, created_by_org, allowed_modules)
--   values ('17017017-0000-0000-0000-000000000003', 'TEST Fremmed Kunde 170', 'test-fremmed-kunde-170',
--           'installer', '17017017-0000-0000-0000-000000000002', array['indoor','list']);
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<CENIKA_USER>','role','authenticated')::text, true);
--   set local role authenticated;
--   select public.set_customer_modules('17017017-0000-0000-0000-000000000003', array['indoor','list','snow']);
--     -- forventet: ERROR: NOT_ALLOWED
--   select public.list_customer_modules() @> '[{"name":"TEST Fremmed Kunde 170"}]'::jsonb;   -- false
--   rollback;
--
-- TEST 4 -- ny kundebedrift via create_customer_org faar ['indoor','list'].
--   begin;
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<CENIKA_USER>','role','authenticated')::text, true);
--   set local role authenticated;
--   select public.create_customer_org('TEST Kunde 170 B', '', null, null, 'test170b@example.com', null, 'test 170');
--   reset role;
--   select allowed_modules from organizations where name = 'TEST Kunde 170 B';   -- {indoor,list}
--   rollback;
