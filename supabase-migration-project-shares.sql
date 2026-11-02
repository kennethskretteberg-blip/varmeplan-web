-- ============================================================
-- 046-web: project_shares -- Cenika deler ETT prosjekt med en elektrobedrift.
-- ============================================================
-- Kjores manuelt i Supabase SQL Editor. Idempotent. Ren ASCII.
-- Spec: spec-overfor-prosjekt-til-elektriker.md regel 1-8.
--
-- Cenika beholder eierskapet (romtegner_projects.org_id endres aldri).
-- Den delte orgen faar LESE prosjektet -- ingenting annet.
--
-- LIVE POLICYER PAA romtegner_projects FOER DENNE MIGRASJONEN
-- (pg_policies, kjort av Kenneth 02.11.2026 06:52 -- = supabase-fix-permission.sql):
--   "Superadmin full tilgang prosjekter"   ALL     using is_superadmin()
--   "Org-medlemmer ser prosjekter"         SELECT  using (org_id in (mine orger)) or (user_id = auth.uid())
--   "Autentiserte kan opprette prosjekter" INSERT  with check (auth.uid() is not null)
--   "Eier kan oppdatere prosjekter"        UPDATE  using (user_id = auth.uid()) or (org_id in (mine orger))
--   "Eier kan slette prosjekter"           DELETE  using (user_id = auth.uid()) or (org_id in (mine orger, rolle owner/admin))
-- Denne fila endrer BARE "Org-medlemmer ser prosjekter" (en OR-gren, via ALTER POLICY).
-- INSERT, UPDATE, DELETE og superadmin-policyen roeres ikke. Ingen policy paa
-- warranty_certificates / certificate_products / measurements / certificate_photos roeres.
--
-- HVORFOR HJELPEFUNKSJONER (security definer) OG IKKE EN INLINE EXISTS:
-- Policyen paa romtegner_projects maa lese project_shares, og eier-policyen paa
-- project_shares maa lese romtegner_projects. Med vanlige subqueries ser Postgres
-- policy -> tabell -> policy -> tabell og avviser HVER lesing av prosjekttabellen med
-- "infinite recursion detected in policy for relation ...". Det ville stengt ute alle
-- brukere, ogsaa Cenika. Hjelpefunksjonene under er security definer (eier = postgres,
-- som eier tabellene og derfor ikke ser RLS), og bryter ringen. De returnerer bare
-- data om kalleren selv (auth.uid()).
--
-- org_invitations: share_project lager IKKE en invitasjonsrad (avvik fra prompten,
-- se docs/046/RAPPORT.md). org_invitations.org_id er NOT NULL, og triggeren
-- handle_invitation_on_signup melder den inviterte inn i invitasjonens org ved
-- registrering. En invitasjon paa Cenikas org ville gjort elektrikeren til
-- Cenika-medlem med innsyn i ALLE prosjektene. Den ventende delingen baerer
-- invited_email + token; 047 kobler den til elektrikerens org.
-- ============================================================

-- --- 1. TABELLEN ------------------------------------------------------------
create table if not exists project_shares (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references romtegner_projects(id) on delete cascade,
  org_id        uuid references organizations(id) on delete cascade,
  invited_email text,
  role          text not null default 'documenter',
  status        text not null default 'pending',
  token         text unique not null default encode(gen_random_bytes(32), 'hex'),
  created_by    uuid,
  created_at    timestamptz not null default now(),
  accepted_at   timestamptz
);

alter table project_shares enable row level security;

-- Gyldige verdier. Ny tabell, saa ingen eksisterende rader kan bryte dem.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'project_shares_status_chk') then
    alter table project_shares add constraint project_shares_status_chk
      check (status in ('pending', 'accepted', 'revoked'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'project_shares_role_chk') then
    alter table project_shares add constraint project_shares_role_chk
      check (role in ('documenter'));
  end if;
  -- En deling maa peke paa noen: en org eller en e-post.
  if not exists (select 1 from pg_constraint where conname = 'project_shares_target_chk') then
    alter table project_shares add constraint project_shares_target_chk
      check (org_id is not null or invited_email is not null);
  end if;
  -- 'accepted' uten org ville ikke gitt tilgang til noen -- forby den heller enn aa la den ligge.
  if not exists (select 1 from pg_constraint where conname = 'project_shares_accepted_org_chk') then
    alter table project_shares add constraint project_shares_accepted_org_chk
      check (status <> 'accepted' or org_id is not null);
  end if;
end $$;

-- --- 2. INDEKSER --------------------------------------------------------------
-- Ett prosjekt deles bare EN gang til samme bedrift.
create unique index if not exists project_shares_project_org_key
  on project_shares (project_id, org_id) where org_id is not null;
-- Samme ventende e-postdeling to ganger -> samme rad (share_project regel 4).
create unique index if not exists project_shares_project_email_pending_key
  on project_shares (project_id, lower(invited_email))
  where org_id is null and status = 'pending';
-- Kostnaden i policyen: oppslag paa org_id (hvilke prosjekter er delt med meg) og
-- paa project_id (eier-sjekk, cascade ved sletting).
create index if not exists project_shares_project_idx on project_shares (project_id);
create index if not exists project_shares_org_idx     on project_shares (org_id);

-- --- 3. HJELPEFUNKSJONER (bryter RLS-ringen, se toppen) -----------------------
-- Prosjekt-id-er som er AKSEPTERT delt med en org kalleren er medlem av.
-- Brukes som uncorrelated subquery i policyen -> kjores en gang per spoerring, ikke per rad.
create or replace function public.project_shares_my_project_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select ps.project_id
    from project_shares ps
   where ps.status = 'accepted'
     and ps.org_id in (select om.org_id from organization_members om where om.user_id = auth.uid())
$$;

-- Er kalleren medlem av orgen som EIER prosjektet?
create or replace function public.project_owned_by_my_org(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from romtegner_projects p
      join organization_members om on om.org_id = p.org_id
     where p.id = p_project_id
       and om.user_id = auth.uid()
  )
$$;

revoke all on function public.project_shares_my_project_ids() from public;
revoke all on function public.project_owned_by_my_org(uuid) from public;
-- anon faar kalle dem: policyen evalueres ogsaa for anon-lesinger av prosjekttabellen,
-- og uten execute ville de feilet med 42501 i stedet for aa gi tomt svar. For anon er
-- auth.uid() null, og begge gir tomt / false.
grant execute on function public.project_shares_my_project_ids() to anon, authenticated;
grant execute on function public.project_owned_by_my_org(uuid) to anon, authenticated;

-- --- 4. POLICYER PAA project_shares ---------------------------------------------
drop policy if exists "ps superadmin full" on project_shares;
create policy "ps superadmin full" on project_shares
  for all using (is_superadmin()) with check (is_superadmin());

-- Eieren av prosjektet leser og skriver sine egne delinger.
drop policy if exists "ps eier leser og skriver" on project_shares;
create policy "ps eier leser og skriver" on project_shares
  for all using (public.project_owned_by_my_org(project_id))
  with check (public.project_owned_by_my_org(project_id));

-- Den delte orgen LESER raden som gjelder seg. Ingen skrivepolicy for den.
drop policy if exists "ps delt org leser egen" on project_shares;
create policy "ps delt org leser egen" on project_shares
  for select using (
    org_id in (select om.org_id from organization_members om where om.user_id = auth.uid())
  );

-- --- 5. TILGANGSREGELEN PAA PROSJEKTET (bare SELECT) ---------------------------
-- ALTER, ikke drop + create: navnet beholdes, og det er ingen glipp mellom drop og
-- create der ingen ser noe. De to forste grenene er ordrett det som er live i dag.
-- Den nye grenen: akseptert deling til min org, og prosjektet ligger ikke i
-- papirkurven (Cenika har kastet det -> elektrikeren skal ikke se det heller).
-- Feiler denne setningen med "policy ... does not exist", er live-settet ikke det
-- vi maalte -- STOPP og si fra, ikke opprett policyen paa egen haand.
alter policy "Org-medlemmer ser prosjekter" on romtegner_projects
  using (
    (org_id in (select organization_members.org_id from organization_members
                 where organization_members.user_id = auth.uid()))
    or (user_id = auth.uid())
    or (deleted_at is null
        and id in (select public.project_shares_my_project_ids()))
  );

-- --- 6. share_project ---------------------------------------------------------
create or replace function public.share_project(
  p_project_id    uuid,
  p_org_id        uuid default null,
  p_invited_email text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid       uuid := auth.uid();
  v_owner_org uuid;
  v_deleted   timestamptz;
  v_email     text := lower(nullif(btrim(coalesce(p_invited_email, '')), ''));
  v_type      text;
  v_row       project_shares;
  v_existed   boolean;
begin
  if v_uid is null then
    raise exception 'NOT_AUTHENTICATED: logg inn foerst' using errcode = '42501';
  end if;
  if p_project_id is null then
    raise exception 'PROJECT_REQUIRED' using errcode = '22023';
  end if;

  select p.org_id, p.deleted_at into v_owner_org, v_deleted
    from romtegner_projects p where p.id = p_project_id;
  if not found then
    -- Samme svar som "ikke eier": avslor ikke om prosjekt-id-en finnes.
    raise exception 'NOT_PROJECT_OWNER: du kan bare dele prosjekter som tilhoerer din bedrift'
      using errcode = '42501';
  end if;

  -- 1. Kalleren maa vaere medlem av orgen som EIER prosjektet.
  if v_owner_org is null
     or not exists (select 1 from organization_members om
                     where om.org_id = v_owner_org and om.user_id = v_uid) then
    raise exception 'NOT_PROJECT_OWNER: du kan bare dele prosjekter som tilhoerer din bedrift'
      using errcode = '42501';
  end if;

  if v_deleted is not null then
    raise exception 'PROJECT_IN_TRASH: prosjektet ligger i papirkurven' using errcode = '22023';
  end if;

  if v_email is not null and v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'EMAIL_INVALID' using errcode = '22023';
  end if;

  -- 2. Kjent org -> akseptert med en gang.
  if p_org_id is not null then
    select o.org_type into v_type from organizations o where o.id = p_org_id;
    if not found then
      raise exception 'ORG_NOT_FOUND' using errcode = '22023';
    end if;
    if p_org_id = v_owner_org then
      raise exception 'SAME_ORG: prosjektet tilhoerer allerede denne bedriften' using errcode = '22023';
    end if;
    if v_type = 'supplier' then
      raise exception 'TARGET_IS_SUPPLIER: prosjekter deles med kundebedrifter, ikke leverandoerer'
        using errcode = '22023';
    end if;

    -- 4. Samme org to ganger -> den eksisterende. Er den trukket tilbake, har eieren
    --    nettopp bestemt seg paa nytt: den blir akseptert igjen (samme rad, samme token).
    v_existed := exists (select 1 from project_shares ps
                          where ps.project_id = p_project_id and ps.org_id = p_org_id);
    insert into project_shares (project_id, org_id, invited_email, status, created_by, accepted_at)
    values (p_project_id, p_org_id, v_email, 'accepted', v_uid, now())
    on conflict (project_id, org_id) where org_id is not null
    do update set
      status      = 'accepted',
      accepted_at = case when project_shares.status = 'accepted'
                         then project_shares.accepted_at else now() end
    returning * into v_row;

    return jsonb_build_object('share_id', v_row.id, 'project_id', v_row.project_id,
                              'org_id', v_row.org_id, 'status', v_row.status,
                              'invited_email', v_row.invited_email,
                              'token', v_row.token, 'existed', v_existed);
  end if;

  -- 3. Bare e-post -> ventende deling. Ingen org_invitations-rad (se toppen).
  if v_email is null then
    raise exception 'TARGET_REQUIRED: oppgi bedrift eller e-post' using errcode = '22023';
  end if;

  insert into project_shares (project_id, org_id, invited_email, status, created_by)
  values (p_project_id, null, v_email, 'pending', v_uid)
  on conflict (project_id, lower(invited_email)) where org_id is null and status = 'pending'
  do nothing
  returning * into v_row;

  if v_row.id is null then
    v_existed := true;
    select * into v_row from project_shares ps
     where ps.project_id = p_project_id and ps.org_id is null and ps.status = 'pending'
       and lower(ps.invited_email) = v_email
     limit 1;
  else
    v_existed := false;
  end if;

  return jsonb_build_object('share_id', v_row.id, 'project_id', v_row.project_id,
                            'org_id', null, 'status', v_row.status,
                            'invited_email', v_row.invited_email,
                            'token', v_row.token, 'existed', v_existed);
end;
$$;

-- --- 7. revoke_project_share ----------------------------------------------------
-- Setter status = 'revoked'. Bare medlemmer av prosjekteierens org. Raden slettes
-- ikke (sporbarhet), og garantibevisene roeres ikke -- de er elektrikerens (regel 8).
create or replace function public.revoke_project_share(p_share_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_row  project_shares;
begin
  if v_uid is null then
    raise exception 'NOT_AUTHENTICATED: logg inn foerst' using errcode = '42501';
  end if;

  select * into v_row from project_shares where id = p_share_id;
  if not found or not exists (
       select 1 from romtegner_projects p
         join organization_members om on om.org_id = p.org_id
        where p.id = v_row.project_id and om.user_id = v_uid) then
    raise exception 'NOT_PROJECT_OWNER: bare prosjekteierens bedrift kan trekke tilbake en deling'
      using errcode = '42501';
  end if;

  update project_shares set status = 'revoked' where id = p_share_id
  returning * into v_row;

  return jsonb_build_object('share_id', v_row.id, 'project_id', v_row.project_id,
                            'org_id', v_row.org_id, 'status', v_row.status);
end;
$$;

revoke all on function public.share_project(uuid, uuid, text) from public;
revoke all on function public.share_project(uuid, uuid, text) from anon;
grant execute on function public.share_project(uuid, uuid, text) to authenticated;
revoke all on function public.revoke_project_share(uuid) from public;
revoke all on function public.revoke_project_share(uuid) from anon;
grant execute on function public.revoke_project_share(uuid) to authenticated;

-- --- 8. VERIFISER -------------------------------------------------------------
select
  (select count(*) from pg_policies where tablename = 'romtegner_projects')                     as prosjekt_policyer,      -- 5 (uendret antall)
  (select count(*) from pg_policies where tablename = 'romtegner_projects'
     and policyname = 'Org-medlemmer ser prosjekter'
     and qual like '%project_shares_my_project_ids%')                                           as select_har_delt_gren,   -- 1
  (select count(*) from pg_policies where tablename = 'romtegner_projects'
     and cmd in ('INSERT', 'UPDATE', 'DELETE')
     and coalesce(qual, '') || coalesce(with_check, '') like '%project_shares%')                 as skrive_med_deling,      -- 0
  (select count(*) from pg_policies where tablename = 'project_shares')                         as share_policyer,         -- 3
  (select count(*) from pg_indexes where tablename = 'project_shares')                          as share_indekser;         -- 6 (pkey, token, 2 unike, 2 vanlige)

-- ============================================================
-- KJOR FOER MIGRASJONEN (test 1 trenger tallet)
-- ============================================================
-- Finn en Cenika-bruker og en bruker i en elektrobedrift (installer):
--   select om.user_id, o.id as org_id, o.name, o.org_type from organization_members om
--     join organizations o on o.id = om.org_id order by o.org_type, o.name;
--
-- Antall prosjekter Cenika-brukeren ser i dag (skriv tallet ned):
--   begin;
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<CENIKA_USER_ID>','role','authenticated')::text, true);
--   set local role authenticated;
--   select count(*) as foer from romtegner_projects;
--   rollback;
--
-- Det samme for elektro-brukeren (forventet: bare egne, typisk 0):
--   (som over med <ELEKTRO_USER_ID>)
--
-- ============================================================
-- TESTER ETTER MIGRASJONEN (hver blokk for seg; alle ender i ROLLBACK)
-- ============================================================
-- Bytt <CENIKA_USER_ID>, <ELEKTRO_USER_ID>, <ELEKTRO_ORG_ID> og <PROSJEKT_ID>.
-- <PROSJEKT_ID> = et DUPLIKAT av et Cenika-prosjekt (KJOR regel 11), ikke i papirkurven.
--
-- TEST 1 -- VIKTIGST: Cenika ser noyaktig like mange prosjekter som foer.
--   begin;
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<CENIKA_USER_ID>','role','authenticated')::text, true);
--   set local role authenticated;
--   select count(*) as etter from romtegner_projects;
--     -- forventet: = foer. Avviker tallet, er policyen feil -> rull tilbake (nederst).
--   -- Ingen rader Cenika ser BARE via delingsgrenen (Cenika har ingen delinger til seg):
--   select count(*) as bare_via_deling from romtegner_projects
--    where not (org_id in (select org_id from organization_members where user_id = auth.uid())
--               or user_id = auth.uid());
--     -- forventet: 0
--   rollback;
--
-- TEST 2 -- elektro-org ser ingenting av Cenikas foer deling.
--   begin;
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<ELEKTRO_USER_ID>','role','authenticated')::text, true);
--   set local role authenticated;
--   select count(*) from romtegner_projects where id = '<PROSJEKT_ID>';   -- forventet: 0
--   rollback;
--
-- TEST 3, 4, 6, 7 -- deling, update nektes, revoke, beviset blir liggende. En transaksjon.
--   begin;
--   -- a) Cenika deler:
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<CENIKA_USER_ID>','role','authenticated')::text, true);
--   set local role authenticated;
--   select public.share_project('<PROSJEKT_ID>', '<ELEKTRO_ORG_ID>', null) as delt;
--     -- forventet: status accepted, existed false
--   select public.share_project('<PROSJEKT_ID>', '<ELEKTRO_ORG_ID>', null) as igjen;
--     -- forventet: samme share_id, existed true (regel 4)
--   -- b) TEST 3: elektrikeren ser ETT av Cenikas prosjekter:
--   reset role;
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<ELEKTRO_USER_ID>','role','authenticated')::text, true);
--   set local role authenticated;
--   select count(*) as cenika_prosjekter_synlige from romtegner_projects
--    where org_id <> '<ELEKTRO_ORG_ID>';                                   -- forventet: 1
--   select id, name from romtegner_projects where id = '<PROSJEKT_ID>';    -- forventet: 1 rad
--   -- c) TEST 4: update nektes. RLS gir ingen feilmelding -- UPDATE treffer 0 rader.
--   update romtegner_projects set name = name || ' HACK' where id = '<PROSJEKT_ID>';
--     -- forventet: UPDATE 0
--   update romtegner_projects set data = data where id = '<PROSJEKT_ID>';
--     -- forventet: UPDATE 0
--   delete from romtegner_projects where id = '<PROSJEKT_ID>';
--     -- forventet: DELETE 0
--   select public.project_lock_acquire('<PROSJEKT_ID>', 'test-046', false);
--     -- forventet: {"ok": false, "not_found": true} (FOR UPDATE krever UPDATE-policyen).
--     -- Finnes ikke funksjonen, er 060 ikke kjort -- hopp over linjen.
--   -- Elektrikeren kan ikke skrive delinger:
--   insert into project_shares (project_id, org_id, status) values ('<PROSJEKT_ID>', '<ELEKTRO_ORG_ID>', 'accepted');
--     -- forventet: ERROR new row violates row-level security policy (eller unik-feil)
--   -- d) Elektrikeren lager et bevis i SIN org:
--   insert into warranty_certificates (org_id, project_id, project_name, room_name, created_by)
--   values ('<ELEKTRO_ORG_ID>', '<PROSJEKT_ID>', 'TEST 046', 'Bad', auth.uid())
--   returning id;
--   -- e) Cenika trekker delingen:
--   reset role;
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<CENIKA_USER_ID>','role','authenticated')::text, true);
--   set local role authenticated;
--   select public.revoke_project_share(id) from project_shares
--    where project_id = '<PROSJEKT_ID>' and org_id = '<ELEKTRO_ORG_ID>';  -- forventet: status revoked
--   -- f) TEST 6 og 7 som elektrikeren:
--   reset role;
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<ELEKTRO_USER_ID>','role','authenticated')::text, true);
--   set local role authenticated;
--   select count(*) from romtegner_projects where id = '<PROSJEKT_ID>';                 -- forventet: 0
--   select count(*) from warranty_certificates where project_name = 'TEST 046';        -- forventet: 1
--   select status from project_shares where project_id = '<PROSJEKT_ID>';              -- forventet: revoked (leser egen rad)
--   rollback;
--
-- TEST 5 -- 'pending' gir ingen tilgang.
--   begin;
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<CENIKA_USER_ID>','role','authenticated')::text, true);
--   set local role authenticated;
--   select public.share_project('<PROSJEKT_ID>', null, 'test-046@example.invalid') as ventende;
--     -- forventet: status pending, org_id null
--   reset role;
--   -- Simuler at 047 har koblet org, men ikke akseptert:
--   update project_shares set org_id = '<ELEKTRO_ORG_ID>'
--    where project_id = '<PROSJEKT_ID>' and invited_email = 'test-046@example.invalid';
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<ELEKTRO_USER_ID>','role','authenticated')::text, true);
--   set local role authenticated;
--   select count(*) from romtegner_projects where id = '<PROSJEKT_ID>';   -- forventet: 0
--   rollback;
--
-- TEST 8 -- andre enn eieren kan ikke dele.
--   begin;
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<ELEKTRO_USER_ID>','role','authenticated')::text, true);
--   set local role authenticated;
--   select public.share_project('<PROSJEKT_ID>', '<ELEKTRO_ORG_ID>', null);
--     -- forventet: ERROR NOT_PROJECT_OWNER
--   rollback;
--
-- KOSTNAD -- som Cenika-brukeren, etter migrasjonen:
--   begin;
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<CENIKA_USER_ID>','role','authenticated')::text, true);
--   set local role authenticated;
--   explain analyze select id, name, updated_at from romtegner_projects order by updated_at desc;
--   rollback;
--   -- Forventet: delingsgrenen som "hashed SubPlan" (kjores EN gang), ikke "SubPlan" per rad.
--   -- Execution Time skal vaere i samme storrelsesorden som foer migrasjonen.
--
-- ============================================================
-- ROLLBACK (bare hvis test 1 feiler) -- setter SELECT-policyen tilbake ordrett:
--   alter policy "Org-medlemmer ser prosjekter" on romtegner_projects
--     using (
--       (org_id in (select organization_members.org_id from organization_members
--                    where organization_members.user_id = auth.uid()))
--       or (user_id = auth.uid())
--     );
-- Tabellen og funksjonene kan bli liggende; uten OR-grenen gir de ingen tilgang.
-- ============================================================
