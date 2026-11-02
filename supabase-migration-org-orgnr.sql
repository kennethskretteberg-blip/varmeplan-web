-- ============================================================
-- 042-web: Organisasjonsnummer paa organizations (duplikatnokkel)
-- ============================================================
-- Kjores manuelt i Supabase SQL Editor. Idempotent: trygg aa kjore flere ganger.
-- Additiv: bare nye kolonner og en ny indeks. Ingen drop, ingen rename.
--
-- org_nr         = den enheten vi faktisk betjener (hovedenhet ELLER underenhet).
--                  Lagres som 9 siffer uten mellomrom (klienten normaliserer).
-- parent_org_nr  = hovedenheten, naar org_nr er en underenhet.
--                  Underenheter har eget 9-sifret nummer. Verifisert 17.10.2026:
--                  ELEKTROIMPORTOREN NORGE AS 914939828, avdelingen SKOYEN 833911872.
-- created_by_user / created_by_org = hvem som opprettet organisasjonen (sporing).
--
-- org_nr = null er lov: eldre organisasjoner, og utenlandske firma uten norsk
-- nummer (admin krysser av "ingen norsk organisasjonsnummer"; hvem som overstyrte
-- skrives i admin_notes).
--
-- Unik indeks: samme 9 siffer kan bare finnes paa EN organisasjon, uansett
-- mellomrom/punktum i det som ble lagret. Rader uten 9 siffer er ikke med.
-- Ikke det samme som organizations.print_org_nr (bare utskrift), customers.org_number
-- (Varmeplans kunder) eller erp_customers.org_number (Visma-lista).
--
-- Merk: finnes det alt to organisasjoner med samme nummer (kan ikke skje i dag,
-- kolonnen er ny), vil create unique index feile. Da maa duplikatet ryddes forst.
-- ============================================================

alter table organizations
  add column if not exists org_nr          text,
  add column if not exists parent_org_nr   text,
  add column if not exists created_by_user uuid,
  add column if not exists created_by_org  uuid references organizations(id);

create unique index if not exists organizations_org_nr_uniq
  on organizations ((regexp_replace(coalesce(org_nr,''), '[^0-9]', '', 'g')))
  where org_nr is not null
    and length(regexp_replace(org_nr, '[^0-9]', '', 'g')) = 9;

-- Kontroll etterpaa:
-- select column_name, data_type from information_schema.columns
--  where table_name = 'organizations'
--    and column_name in ('org_nr','parent_org_nr','created_by_user','created_by_org');
-- select indexname from pg_indexes where tablename = 'organizations'
--    and indexname = 'organizations_org_nr_uniq';
