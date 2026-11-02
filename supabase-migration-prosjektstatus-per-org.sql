-- ============================================================
-- 171-web: prosjektstatus per bedrift for DELTE prosjekter (046).
-- ============================================================
-- Kjores manuelt i Supabase SQL Editor. Idempotent. Ren ASCII. Additiv: ingen drop av
-- tabeller/kolonner, ingen endring av eksisterende policyer.
-- AVHENGER AV 046 (supabase-migration-project-shares.sql): bruker project_shares og
-- hjelperen project_owned_by_my_org(uuid). Kjor 046 forst.
--
-- HVORFOR:
-- Statusen (sales_status / delivery_status / lost_reason) ligger allerede som kolonner
-- paa romtegner_projects (supabase-migration-project-status.sql, kjort 14.07.2026).
-- Det virker for bedriftens EGNE prosjekter, og det fortsetter uendret.
-- For et DELT prosjekt (Cenika eier, elektrikeren har bare lesetilgang) kan elektrikeren
-- ikke skrive paa prosjektraden, og to elektrikere som faar samme prosjekt delt kan ikke
-- dele en status. Derfor: en rad per (prosjekt, bedrift) i en egen tabell.
--
-- HVORDAN WEB BRUKER DEN (index.html, _projectStatus / _setProjectStatus):
--   * Eget prosjekt (prosjektets org_id = min org, eller user_id = meg, eller org_id null):
--     kolonnene paa romtegner_projects, akkurat som foer. Denne tabellen brukes IKKE.
--   * Delt prosjekt (org_id = en annen bedrift): raden (project_id, min org) her.
--     Mangler raden, er statusen 'under_arbeid'. Ingen tilbakefylling.
--   Kolonnene paa romtegner_projects slettes ikke og endres ikke av denne fila.
--
-- RLS (eneste sikkerhetsgrense):
--   LESE : medlem av radens org_id, ELLER medlem av orgen som eier prosjektet
--          (Cenika ser at elektrikeren fikk jobben paa et prosjekt Cenika delte).
--   SKRIVE (insert/update): bare medlem av radens org_id, og bare for et prosjekt den
--          orgen kan se (eier det, eller har en AKSEPTERT deling som ikke er i papirkurven).
--   SLETTE: ingen policy (raden forsvinner med prosjektet via on delete cascade).
--   Superadmin: alt (is_superadmin(), samme som paa romtegner_projects).
-- ============================================================

-- --- 1. TABELLEN ------------------------------------------------------------
create table if not exists project_org_status (
  project_id      uuid not null references romtegner_projects(id) on delete cascade,
  org_id          uuid not null references organizations(id) on delete cascade,
  sales_status    text not null default 'under_arbeid',
  delivery_status text,
  lost_reason     text,
  updated_by      uuid,
  updated_at      timestamptz not null default now(),
  primary key (project_id, org_id)
);

alter table project_org_status enable row level security;

-- Samme verdier som paa romtegner_projects (planen paragraf 3).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'project_org_status_sales_chk') then
    alter table project_org_status add constraint project_org_status_sales_chk
      check (sales_status in ('under_arbeid', 'tilbud_sendt', 'vunnet', 'tapt'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'project_org_status_delivery_chk') then
    alter table project_org_status add constraint project_org_status_delivery_chk
      check (delivery_status is null or delivery_status in
        ('klar_for_montering', 'under_montering', 'montert_venter_dok',
         'klar_for_levering', 'levert', 'ferdig'));
  end if;
end $$;

-- Cenikas oppslag "hvilke av mine delte prosjekter har kunden vunnet" gaar paa project_id
-- (primaernokkelen dekker det); elektrikerens "mine statuser" gaar paa org_id.
create index if not exists project_org_status_org_idx on project_org_status (org_id);

-- --- 2. STEMPEL: updated_by / updated_at settes av databasen, ikke av klienten -----
create or replace function public.project_org_status_stamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

drop trigger if exists project_org_status_stamp_trg on project_org_status;
create trigger project_org_status_stamp_trg
  before insert or update on project_org_status
  for each row execute function public.project_org_status_stamp();

-- --- 3. HJELPER: kan orgen se prosjektet? (security definer, bryter RLS-ringen) ----
-- Sann naar orgen EIER prosjektet, eller har en AKSEPTERT deling paa et prosjekt som ikke
-- ligger i papirkurven (samme regel som delingsgrenen i "Org-medlemmer ser prosjekter").
-- Sier ingenting om kalleren -- policyen sjekker i tillegg at kalleren er medlem av p_org_id.
create or replace function public.project_visible_to_org(p_project_id uuid, p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
      select 1 from romtegner_projects p
       where p.id = p_project_id and p.org_id = p_org_id
    )
    or exists (
      select 1
        from project_shares ps
        join romtegner_projects p on p.id = ps.project_id
       where ps.project_id = p_project_id
         and ps.org_id = p_org_id
         and ps.status = 'accepted'
         and p.deleted_at is null
    )
$$;

revoke all on function public.project_visible_to_org(uuid, uuid) from public;
grant execute on function public.project_visible_to_org(uuid, uuid) to authenticated;

-- --- 4. POLICYER --------------------------------------------------------------
drop policy if exists "pos superadmin full" on project_org_status;
create policy "pos superadmin full" on project_org_status
  for all using (is_superadmin()) with check (is_superadmin());

-- Lese: egen org, eller orgen som eier prosjektet (project_owned_by_my_org fra 046).
drop policy if exists "pos les egen org eller prosjekteier" on project_org_status;
create policy "pos les egen org eller prosjekteier" on project_org_status
  for select using (
    org_id in (select om.org_id from organization_members om where om.user_id = auth.uid())
    or public.project_owned_by_my_org(project_id)
  );

-- Skrive: bare egen org, og bare et prosjekt egen org kan se.
drop policy if exists "pos egen org setter inn" on project_org_status;
create policy "pos egen org setter inn" on project_org_status
  for insert with check (
    org_id in (select om.org_id from organization_members om where om.user_id = auth.uid())
    and public.project_visible_to_org(project_id, org_id)
  );

drop policy if exists "pos egen org oppdaterer" on project_org_status;
create policy "pos egen org oppdaterer" on project_org_status
  for update
  using (
    org_id in (select om.org_id from organization_members om where om.user_id = auth.uid())
    and public.project_visible_to_org(project_id, org_id)
  )
  with check (
    org_id in (select om.org_id from organization_members om where om.user_id = auth.uid())
    and public.project_visible_to_org(project_id, org_id)
  );

-- Ingen anonym tilgang. Ingen delete-policy (se toppen).
revoke all on project_org_status from anon;
grant select, insert, update on project_org_status to authenticated;

-- --- 5. VERIFISER -------------------------------------------------------------
select
  (select count(*) from pg_policies where tablename = 'project_org_status')   as pos_policyer,       -- 4
  (select count(*) from pg_policies where tablename = 'romtegner_projects')   as prosjekt_policyer,  -- 5 (uendret)
  (select count(*) from project_org_status)                                   as rader;              -- 0 (ingen tilbakefylling)

-- ============================================================
-- TESTER ETTER MIGRASJONEN (hver blokk for seg; alle ender i ROLLBACK)
-- ============================================================
-- Bytt plassholderne:
--   <CENIKA_USER_ID>, <CENIKA_ORG_ID>     -- Cenika-bruker og Cenikas org
--   <ELEKTRO_USER_ID>, <ELEKTRO_ORG_ID>   -- bruker i en elektrobedrift (installer)
--   <TREDJE_USER_ID>                      -- bruker i en tredje org (ikke Cenika, ikke elektro)
--   <PROSJEKT_ID>   = et DUPLIKAT av et Cenika-prosjekt (KJOR regel 11), ikke i papirkurven
--   <ANNET_PROSJEKT_ID> = et Cenika-prosjekt som IKKE er delt med elektrobedriften
--
-- Alt i EN transaksjon; deling settes opp inne i den og rulles tilbake til slutt.
--   begin;
--   -- 0) Cenika deler prosjektet (046):
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<CENIKA_USER_ID>','role','authenticated')::text, true);
--   set local role authenticated;
--   select public.share_project('<PROSJEKT_ID>', '<ELEKTRO_ORG_ID>', null);
--
--   -- TEST 1: elektriker setter status paa delt prosjekt i SIN org -> ok
--   reset role;
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<ELEKTRO_USER_ID>','role','authenticated')::text, true);
--   set local role authenticated;
--   insert into project_org_status (project_id, org_id, sales_status)
--   values ('<PROSJEKT_ID>', '<ELEKTRO_ORG_ID>', 'vunnet')
--   on conflict (project_id, org_id) do update set sales_status = excluded.sales_status,
--                                                  delivery_status = null
--   returning project_id, org_id, sales_status, updated_by;
--     -- forventet: 1 rad, sales_status vunnet, updated_by = <ELEKTRO_USER_ID>
--   -- Angre (samme vei som web): tilbake til forrige verdi
--   update project_org_status set sales_status = 'under_arbeid'
--    where project_id = '<PROSJEKT_ID>' and org_id = '<ELEKTRO_ORG_ID>';   -- forventet: UPDATE 1
--   update project_org_status set sales_status = 'vunnet'
--    where project_id = '<PROSJEKT_ID>' and org_id = '<ELEKTRO_ORG_ID>';   -- forventet: UPDATE 1
--
--   -- TEST 2: elektriker proever aa sette status for Cenika-orgen -> avvist
--   -- (savepoint: en feil midt i en transaksjon stanser ellers resten av blokka)
--   savepoint t2;
--   insert into project_org_status (project_id, org_id, sales_status)
--   values ('<PROSJEKT_ID>', '<CENIKA_ORG_ID>', 'tapt');
--     -- forventet: ERROR new row violates row-level security policy
--   rollback to savepoint t2;
--   update romtegner_projects set sales_status = 'vunnet' where id = '<PROSJEKT_ID>';
--     -- forventet: UPDATE 0 (prosjektraden er Cenikas; uendret fra 046)
--
--   -- TEST 3: elektriker proever status paa et prosjekt han ikke ser -> avvist
--   savepoint t3;
--   insert into project_org_status (project_id, org_id, sales_status)
--   values ('<ANNET_PROSJEKT_ID>', '<ELEKTRO_ORG_ID>', 'vunnet');
--     -- forventet: ERROR new row violates row-level security policy
--   rollback to savepoint t3;
--
--   -- TEST 4: Cenika leser elektrikerens status paa eget delt prosjekt -> ok
--   reset role;
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<CENIKA_USER_ID>','role','authenticated')::text, true);
--   set local role authenticated;
--   select project_id, org_id, sales_status from project_org_status
--    where project_id = '<PROSJEKT_ID>';
--     -- forventet: 1 rad, org_id = <ELEKTRO_ORG_ID>, sales_status vunnet
--   -- ... men Cenika kan ikke skrive elektrikerens rad:
--   update project_org_status set sales_status = 'tapt'
--    where project_id = '<PROSJEKT_ID>' and org_id = '<ELEKTRO_ORG_ID>';   -- forventet: UPDATE 0
--
--   -- TEST 5: en tredje org leser -> ingenting
--   reset role;
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<TREDJE_USER_ID>','role','authenticated')::text, true);
--   set local role authenticated;
--   select count(*) from project_org_status where project_id = '<PROSJEKT_ID>';  -- forventet: 0
--
--   -- TEST 6: deling trukket tilbake -> elektrikeren kan ikke lenger skrive (men raden blir liggende)
--   reset role;
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<CENIKA_USER_ID>','role','authenticated')::text, true);
--   set local role authenticated;
--   select public.revoke_project_share(id) from project_shares
--    where project_id = '<PROSJEKT_ID>' and org_id = '<ELEKTRO_ORG_ID>';
--   reset role;
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<ELEKTRO_USER_ID>','role','authenticated')::text, true);
--   set local role authenticated;
--   update project_org_status set sales_status = 'tapt'
--    where project_id = '<PROSJEKT_ID>' and org_id = '<ELEKTRO_ORG_ID>';   -- forventet: UPDATE 0
--   select count(*) from project_org_status where org_id = '<ELEKTRO_ORG_ID>'
--    and project_id = '<PROSJEKT_ID>';                                       -- forventet: 1 (egen rad, lesbar)
--
--   -- TEST 7: anon ser ingenting
--   reset role;
--   set local role anon;
--   select count(*) from project_org_status;   -- forventet: ERROR permission denied (ingen grant til anon)
--   rollback;
--
-- ============================================================
-- ROLLBACK (bare hvis noe over feiler) -- tabellen er ny, ingenting annet er endret:
--   drop table if exists project_org_status;
--   drop function if exists public.project_visible_to_org(uuid, uuid);
--   drop function if exists public.project_org_status_stamp();
-- (Unntak fra "aldri drop": dette fjerner bare det denne fila selv la til.)
-- ============================================================
