-- MIGRATION 220: Ny prosjektstatus 'grossist' (Kenneth 09.11.2026)
-- Run in Supabase Dashboard -> SQL Editor. Idempotent (kan kjores flere ganger).
--
-- Bakgrunn:
--   «Grossist» = vi tegner/prosjekterer for grossisten, som selv gir pris til elektrikeren.
--   Ingen pris fra oss. Statusen ligger i sales_status (akse A) ved siden av
--   under_arbeid / tilbud_sendt / vunnet / tapt.
--
-- Hva som endres (ADDITIVT - ingen verdier fjernes eller endres):
--   1. romtegner_projects.sales_status  : CHECK-begrensningen utvides med 'grossist'.
--      Begrensningen ble laget inline i supabase-migration-project-status.sql og har derfor
--      Postgres sitt automatiske navn (normalt romtegner_projects_sales_status_check). Vi slaar
--      den opp paa kolonnen i pg_constraint i stedet for aa anta navnet.
--   2. project_org_status.sales_status  : CHECK project_org_status_sales_chk utvides likt
--      (supabase-migration-prosjektstatus-per-org.sql, 171). Tabellen finnes bare der 171 er
--      kjort - hoppes over ellers.
--
-- Rader, RLS, triggere, indekser, delivery_status og lost_reason rores IKKE.
-- Uten denne migrasjonen avviser databasen 'grossist' (23514, violates check constraint), og
-- appen sier «databasen kjenner ikke denne statusen ennaa» - ingenting annet gaar i stykker.

-- ==============================================================
-- STEP 1: romtegner_projects.sales_status
-- ==============================================================
DO $$
DECLARE
  c record;
BEGIN
  -- Finn alle CHECK-begrensninger paa romtegner_projects som nevner sales_status og mangler 'grossist'.
  FOR c IN
    SELECT con.conname
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
     WHERE nsp.nspname = 'public'
       AND rel.relname = 'romtegner_projects'
       AND con.contype = 'c'
       AND pg_get_constraintdef(con.oid) LIKE '%sales_status%'
       AND pg_get_constraintdef(con.oid) NOT LIKE '%grossist%'
  LOOP
    EXECUTE format('ALTER TABLE public.romtegner_projects DROP CONSTRAINT %I', c.conname);
    RAISE NOTICE 'Fjernet gammel CHECK % (erstattes under)', c.conname;
  END LOOP;

  IF NOT EXISTS (
    SELECT 1
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
     WHERE nsp.nspname = 'public'
       AND rel.relname = 'romtegner_projects'
       AND con.contype = 'c'
       AND pg_get_constraintdef(con.oid) LIKE '%sales_status%'
  ) THEN
    ALTER TABLE public.romtegner_projects
      ADD CONSTRAINT romtegner_projects_sales_status_check
      CHECK (sales_status IN ('under_arbeid','tilbud_sendt','vunnet','tapt','grossist'));
    RAISE NOTICE 'Lagt til romtegner_projects_sales_status_check med grossist';
  END IF;
END $$;

-- ==============================================================
-- STEP 2: project_org_status.sales_status (bare om tabellen finnes - 171)
-- ==============================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = 'project_org_status'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM pg_constraint
       WHERE conname = 'project_org_status_sales_chk'
         AND pg_get_constraintdef(oid) NOT LIKE '%grossist%'
    ) THEN
      ALTER TABLE public.project_org_status DROP CONSTRAINT project_org_status_sales_chk;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'project_org_status_sales_chk') THEN
      ALTER TABLE public.project_org_status ADD CONSTRAINT project_org_status_sales_chk
        CHECK (sales_status IN ('under_arbeid','tilbud_sendt','vunnet','tapt','grossist'));
      RAISE NOTICE 'Lagt til project_org_status_sales_chk med grossist';
    END IF;
  END IF;
END $$;

-- ==============================================================
-- STEP 3: Verifiser - begge definisjonene skal inneholde 'grossist'
-- ==============================================================
SELECT rel.relname AS tabell, con.conname, pg_get_constraintdef(con.oid) AS definisjon
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
 WHERE nsp.nspname = 'public'
   AND rel.relname IN ('romtegner_projects','project_org_status')
   AND con.contype = 'c'
   AND pg_get_constraintdef(con.oid) LIKE '%sales_status%'
 ORDER BY rel.relname;

-- Forventet: 1-2 rader, begge med 'grossist' i definisjonen.
-- Deretter: sett et prosjekt til Grossist i appen og last siden paa nytt - chipen skal staa.
