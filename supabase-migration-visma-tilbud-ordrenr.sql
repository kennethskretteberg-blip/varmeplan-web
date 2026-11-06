-- ============================================================
-- 198-web: tilbudsnr. og ordrenr. fra Visma paa prosjektet.
-- ============================================================
-- Kjores manuelt i Supabase SQL Editor. Idempotent (kan kjores flere ganger). Ren ASCII.
--
-- Onsket (Fredrik 02.11.2026): ved "Tilbud sendt" skal tilbudsnummeret fra Visma kunne
-- fylles inn, ved "Vunnet" ordrenummeret. Gjor det lett aa folge opp senere.
--
-- To nye, valgfrie tekstkolonner paa romtegner_projects. Fritekst (bokstaver og tall),
-- klienten trimmer og kutter paa 30 tegn. NULL = ikke fylt inn.
--
-- Dette er Cenikas egne numre fra Visma Global. De er IKKE Varmeplans prosjektnummer:
-- project_no, triggeren romtegner_projects_assign_no og filnavn rores ikke.
--
-- RLS: INGEN endring. "Eier kan oppdatere prosjekter" (UPDATE) gjelder hele raden, saa
-- den som kan endre status i dag, kan ogsaa lagre numrene. Laas-triggeren
-- romtegner_projects_lock_guard_trg er "before update of data" og slaar ikke til her
-- (samme som for sales_status).
--
-- Appen virker ogsaa FOER denne fila er kjort: feltene skjules, og en statusendring
-- lagres som foer.
-- ============================================================

alter table romtegner_projects add column if not exists visma_offer_no text;
alter table romtegner_projects add column if not exists visma_order_no text;

comment on column romtegner_projects.visma_offer_no is '198: tilbudsnummer fra Visma (fritekst, valgfritt)';
comment on column romtegner_projects.visma_order_no is '198: ordrenummer fra Visma (fritekst, valgfritt)';

-- --- VERIFISER -------------------------------------------------------------
-- Skal gi 2.
select count(*) as visma_kolonner
  from information_schema.columns
 where table_schema = 'public'
   and table_name = 'romtegner_projects'
   and column_name in ('visma_offer_no', 'visma_order_no');
