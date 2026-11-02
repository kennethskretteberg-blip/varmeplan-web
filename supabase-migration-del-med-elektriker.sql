-- ============================================================
-- 047-web: "Del med elektriker" -- to LESE-funksjoner for delingsarket.
-- ============================================================
-- Kjores manuelt i Supabase SQL Editor. Idempotent. Ren ASCII.
-- KREVER (i denne rekkefolgen):
--   supabase-migration-org-orgnr.sql          (042: org_nr, created_by_org)
--   supabase-migration-opprett-kundebedrift.sql (044v2: create_customer_org, erp_customer_no)
--   supabase-migration-project-shares.sql     (046: project_shares, share_project,
--                                               revoke_project_share, project_owned_by_my_org)
--
-- HVORFOR: delingsarket maa vise (a) elektrobedriftene Cenika har opprettet, og (b) navnet
-- og en AERLIG status paa bedriftene et prosjekt er delt med. Begge deler ligger i tabeller
-- Cenika IKKE kan lese:
--   organizations       -- "Medlemmer ser sine org": bare orger man er medlem av
--   organization_members -- "Medlemmer ser medlemmer i egne orgs"
--   org_invitations     -- bare orgens egne admins (og en policy som leser auth.users)
--   auth.users          -- aldri tilgjengelig for authenticated
-- Policyene LOSNES IKKE (KJOR regel 8). To security definer-funksjoner svarer i stedet, og
-- sjekker kalleren selv. De SKRIVER ingenting -- ingen insert/update/delete i fila.
--
-- "Aerlig status" (047 punkt 4): en akseptert deling betyr at bedriften HAR tilgang, ikke at
-- noen har sett den. Funksjonene gir derfor ogsaa:
--   members          -- antall brukere i bedriften
--   last_sign_in_at  -- siste innlogging blant dem (auth.users), null = ingen har logget inn
--   invite           -- ventende, ikke utlopt invitasjon (e-post, utloper; token bare naar
--                       kallerens leverandor opprettet bedriften -- trengs for "send paa nytt")
-- Klienten avleder "Invitert -- ikke aapnet ennaa" / "Delt" / "Invitasjonen er ikke sendt".
--
-- MEDLEMSKAP: ingen av funksjonene legger noen inn i noen org.
-- ============================================================

-- --- 1. list_customer_orgs ----------------------------------------------------
-- Elektrobedriftene kallerens leverandor har opprettet (created_by_org), pluss
-- installator-orger leverandoren alt har delt et prosjekt med (f.eks. en bedrift som
-- fantes fra for, funnet av duplikatsjekken i 044). Bare leverandor-medlemmer.
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
                or o.id in (select ps.org_id
                              from project_shares ps
                              join romtegner_projects p on p.id = ps.project_id
                             where p.org_id = v_sup and ps.org_id is not null))
      ) s
  ), '[]'::jsonb);
end;
$$;

-- --- 2. list_project_shares -----------------------------------------------------
-- Alle delinger av ETT prosjekt, med bedriftsnavn og statusgrunnlag. Bare medlemmer av
-- orgen som eier prosjektet (samme sjekk som eier-policyen paa project_shares), eller
-- superadmin. Andre faar samme svar som et ukjent prosjekt.
create or replace function public.list_project_shares(p_project_id uuid)
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
  if p_project_id is null
     or not (public.project_owned_by_my_org(p_project_id) or is_superadmin()) then
    raise exception 'NOT_PROJECT_OWNER: bare prosjekteierens bedrift ser delingene'
      using errcode = '42501';
  end if;

  return coalesce((
    select jsonb_agg(s.x order by (s.x ->> 'created_at') desc)
      from (
        select jsonb_build_object(
          'share_id',        ps.id,
          'org_id',          ps.org_id,
          'org_name',        o.name,
          'org_nr',          o.org_nr,
          'invited_email',   ps.invited_email,
          'status',          ps.status,
          'created_at',      ps.created_at,
          'accepted_at',     ps.accepted_at,
          'members',         (select count(*) from organization_members m where m.org_id = ps.org_id),
          'last_sign_in_at', (select max(u.last_sign_in_at)
                                from organization_members m
                                join auth.users u on u.id = m.user_id
                               where m.org_id = ps.org_id),
          'invite',          (select jsonb_build_object(
                                       'email',      i.email,
                                       'expires_at', i.expires_at,
                                       -- Tokenet bare til leverandoren som opprettet bedriften
                                       -- (samme krav som Edge Function opprett-kundebruker).
                                       'token',      case when o.created_by_org in (
                                                       select om.org_id from organization_members om
                                                        where om.user_id = v_uid)
                                                     then i.token else null end)
                                from org_invitations i
                               where i.org_id = ps.org_id
                                 and i.status = 'pending'
                                 and i.expires_at > now()
                               order by i.created_at desc
                               limit 1)
        ) as x
          from project_shares ps
          left join organizations o on o.id = ps.org_id
         where ps.project_id = p_project_id
      ) s
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.list_customer_orgs() from public;
revoke all on function public.list_customer_orgs() from anon;
grant execute on function public.list_customer_orgs() to authenticated;
revoke all on function public.list_project_shares(uuid) from public;
revoke all on function public.list_project_shares(uuid) from anon;
grant execute on function public.list_project_shares(uuid) to authenticated;

-- --- 3. VERIFISER ---------------------------------------------------------------
select
  (select count(*) from pg_proc where proname in ('list_customer_orgs', 'list_project_shares')
      and prosecdef)                                                                      as definer_funksjoner,  -- 2
  has_function_privilege('anon', 'public.list_customer_orgs()', 'execute')               as anon_kan_liste,      -- false
  has_function_privilege('anon', 'public.list_project_shares(uuid)', 'execute')          as anon_kan_dele_liste; -- false

-- ============================================================
-- TESTER (hver blokk for seg; alle ender i ROLLBACK)
-- Bytt <CENIKA_USER_ID>, <ELEKTRO_USER_ID>, <PROSJEKT_ID> (DUPLIKAT av et Cenika-prosjekt).
-- ============================================================
-- TEST 1 -- Cenika ser kundebedriftene og delingene:
--   begin;
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<CENIKA_USER_ID>','role','authenticated')::text, true);
--   set local role authenticated;
--   select jsonb_array_length(public.list_customer_orgs());       -- antall opprettede kundebedrifter
--   select public.list_project_shares('<PROSJEKT_ID>');           -- [] eller delingene
--   rollback;
--
-- TEST 2 -- en elektriker kan ikke liste noe av dette:
--   begin;
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<ELEKTRO_USER_ID>','role','authenticated')::text, true);
--   set local role authenticated;
--   select public.list_customer_orgs();                -- forventet: ERROR NOT_SUPPLIER
--   rollback;
--   begin;
--   select set_config('request.jwt.claims',
--     json_build_object('sub','<ELEKTRO_USER_ID>','role','authenticated')::text, true);
--   set local role authenticated;
--   select public.list_project_shares('<PROSJEKT_ID>');  -- forventet: ERROR NOT_PROJECT_OWNER
--   rollback;
--
-- TEST 3 -- ingen skriving: fila inneholder ingen insert/update/delete utenfor kommentarer.
-- ============================================================
