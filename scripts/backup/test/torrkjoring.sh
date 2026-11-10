#!/bin/bash
# 229 · Tørrkjøring av sikkerhetskopien – rører verken Supabase, iCloud eller /Volumes.
#
#     bash scripts/backup/test/torrkjoring.sh
#
# Bygger en falsk Storage-tjener (falsk-storage.mjs) og, hvis en lokal Postgres-tjener
# lar seg starte (initdb), en liten ekte database med skjemaene public/auth/storage.
# Uten lokal Postgres brukes en falsk dump, og pg_restore --list hoppes over.
# Alt ligger i en midlertidig mappe (med mellomrom i stiene) som slettes til slutt.
# Eneste som rører noe ekte: en prøvenøkkel legges i nøkkelringen og fjernes igjen
# (hopp over med VPB_TEST_UTEN_NOKKELRING=1).

set -uo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
HER="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROT="$(dirname "$HER")"
T=$(mktemp -d "${TMPDIR:-/tmp}/vpb-test.XXXXXX")
T=$(cd "$T" && pwd -P)
PORT=47229; PORT2=47231; PGPORT_T=47230
NOKKEL="test-service-role-NOKKEL-229"
PASSORD="Test passord 229!"
OK=0; FEIL=0; EKTE=0; PIDS=""

rydd() {
  for p in $PIDS; do kill "$p" 2>/dev/null; wait "$p" 2>/dev/null; done
  if [ "$EKTE" = "1" ]; then pg_ctl -D "$T/pg" -m immediate stop >/dev/null 2>&1; fi
  mount | grep -F "$T" | awk '{ print $1 }' | while read -r d; do hdiutil detach "$d" -force >/dev/null 2>&1; done
  chmod -R u+w "$T" 2>/dev/null; rm -rf "$T"
}
trap rydd EXIT

# sjekk <navn> <kommando ...>: kommandoen skal lykkes.  ikke <navn> <kommando ...>: skal feile.
sjekk() { local n="$1"; shift; if "$@" >/dev/null 2>&1; then OK=$(( OK + 1 )); echo "  ok    $n"; else FEIL=$(( FEIL + 1 )); echo "  FEIL  $n"; fi; }
ikke()  { local n="$1"; shift; if "$@" >/dev/null 2>&1; then FEIL=$(( FEIL + 1 )); echo "  FEIL  $n"; else OK=$(( OK + 1 )); echo "  ok    $n"; fi; }
lik()   { [ "$1" = "$2" ]; }
har()   { grep -qF -- "$2" "$1"; }

# shellcheck source=../felles.sh
. "$ROT/felles.sh"

echo "== 0. Syntaks =="
for f in felles.sh ta-kopi.sh installer.sh avinstaller.sh last-opp-filer.sh hent-prosjekt.sh test/torrkjoring.sh; do
  sjekk "bash -n $f" bash -n "$ROT/$f"
done
if command -v shellcheck >/dev/null 2>&1; then
  sjekk "shellcheck" shellcheck -x -S warning "$ROT"/*.sh
else
  echo "  --    shellcheck er ikke installert (hoppet over)"
fi

echo "== 1. Tilkoblingsstreng =="
t1() { ( db_uri_til_env 'postgresql://postgres.abcdefgh:p%40ss%2Fw%3Ard@aws-0-eu-north-1.pooler.supabase.com:5432/postgres' \
        && lik "$PGHOST|$PGPORT|$PGUSER|$PGPASSWORD|$PGDATABASE|$PGSSLMODE" 'aws-0-eu-north-1.pooler.supabase.com|5432|postgres.abcdefgh|p@ss/w:rd|postgres|require' \
        && lik "$(prosjekt_ref)" abcdefgh ); }
t2() { ( db_uri_til_env 'postgres://postgres:hemmelig@db.xyzxyz.supabase.co:5432/postgres?sslmode=verify-full&x=1' \
        && lik "$PGHOST|$PGSSLMODE|$(prosjekt_ref)" 'db.xyzxyz.supabase.co|verify-full|xyzxyz' ); }
t3() { ( db_uri_til_env 'postgresql://u:a@b?c@h:6543/d' && lik "$PGHOST|$PGPORT|$PGUSER|$PGPASSWORD|$PGDATABASE" 'h|6543|u|a@b?c|d' ); }
t4() { ( db_uri_til_env 'postgresql://u:p%5Cq%25@h' && lik "$PGPASSWORD|$PGPORT|$PGDATABASE" 'p\q%|5432|postgres' ); }
sjekk "pooler-adresse, passord med kodede tegn, prosjekt-id" t1
sjekk "direkte adresse, sslmode fra adressen" t2
sjekk "passord med @ og ?, port 6543" t3
sjekk "backslash og prosent i passord, standard port og database" t4
ikke  "https-adresse avvises" db_uri_til_env 'https://x.supabase.co'
ikke  "adresse uten bruker avvises" db_uri_til_env 'postgresql://bare-vert/db'

echo "== 2. Nøkkelring (prøvenøkkel legges inn og fjernes) =="
if [ "${VPB_TEST_UTEN_NOKKELRING:-}" = "1" ]; then
  echo "  --    hoppet over"
else
  VPB_TJENESTE_EKTE="$VPB_TJENESTE"; VPB_TJENESTE="no.varmeplan.backup.test"
  VERDI='p"a'"'"'ss w\ord$1 %x;&|'
  nokkel_slett prove
  sjekk "lagre i nøkkelringen" nokkel_lagre prove "$VERDI"
  sjekk "lese tilbake gir samme verdi" lik "$(nokkel_les prove)" "$VERDI"
  sjekk "lagre på nytt skriver over" nokkel_lagre prove "ny-verdi-2"
  sjekk "ny verdi leses" lik "$(nokkel_les prove)" "ny-verdi-2"
  sjekk "slette" nokkel_slett prove
  ikke  "borte etter sletting" nokkel_finnes prove
  VPB_TJENESTE="$VPB_TJENESTE_EKTE"
fi

echo "== 3. Oppsett: falsk Storage og database =="
L="$T/lager"
mkdir -p "$L/documentation/prosjekt 1/rom A" "$L/branding" "$L/mange/serie" "$L/tom"
printf 'bilde-innhold-1' >"$L/documentation/prosjekt 1/rom A/bilde æøå.jpg"
printf 'signatur'        >"$L/documentation/prosjekt 1/signatur.png"
printf 'finnes ikke'     >"$L/documentation/borte.fantom"
printf 'logo'            >"$L/branding/logo.png"
i=1; while [ "$i" -le 1203 ]; do printf '%s' "$i" >"$L/mange/serie/f$i.txt"; i=$(( i + 1 )); done
FORVENTET_FILER=1206      # 2 + 1 + 1203; borte.fantom skal mangle; bøtta tom har ingen

node "$HER/falsk-storage.mjs" "$L" "$PORT" "$NOKKEL" >"$T/tjener.log" 2>&1 &
PIDS="$PIDS $!"
mkdir -p "$T/lager2"
node "$HER/falsk-storage.mjs" "$T/lager2" "$PORT2" "$NOKKEL" >"$T/tjener2.log" 2>&1 &
PIDS="$PIDS $!"
i=0; until curl -s -o /dev/null "http://127.0.0.1:$PORT/" || [ "$i" -ge 50 ]; do sleep 0.2; i=$(( i + 1 )); done
sjekk "falsk Storage-tjener svarer" curl -s -o /dev/null "http://127.0.0.1:$PORT/"

# Innhold med alt som er vanskelig: fnutter, backslash, linjeskift, tab, æøå
DATA2='{"navn": "Kjøkken \"stort\"", "sti": "C:\\temp", "linjer": "a\nb\tc", "tall": [1, 2.5]}'

export VPB_TEST=1 VPB_TEST_API_NOKKEL="$NOKKEL" VPB_TEST_PASSORD="$PASSORD"
export VPB_KONFIG_MAPPE="$T/konfig mappe" VPB_LOGG="$T/logg mappe/varmeplan-backup.log"
export VPB_ICLOUD="$T/Mobile Documents/com~apple~CloudDocs/Varmeplan-backup" VPB_VOLUMER="$T/Volumes"
export TMPDIR="$T/tmp mappe"
mkdir -p "$VPB_KONFIG_MAPPE" "$VPB_ICLOUD" "$VPB_VOLUMER/Min Disk" "$TMPDIR"
printf 'SUPABASE_URL=http://127.0.0.1:%s/\nEKSTERN_DISK=Min Disk\n' "$PORT" >"$VPB_KONFIG_MAPPE/config"
LOGG="$VPB_LOGG"

if command -v initdb >/dev/null 2>&1 && initdb -D "$T/pg" -A trust -U vp >"$T/initdb.log" 2>&1 \
   && pg_ctl -D "$T/pg" -w -l "$T/pg.log" \
        -o "-p $PGPORT_T -c listen_addresses=127.0.0.1 -c unix_socket_directories=$T" start >/dev/null 2>&1; then
  EKTE=1
  export VPB_TEST_DB_URL="postgresql://vp@127.0.0.1:$PGPORT_T/postgres?sslmode=disable"
  PSQL_T() { psql -X -At -h 127.0.0.1 -p "$PGPORT_T" -U vp -d postgres -v ON_ERROR_STOP=1 "$@"; }
  PSQL_T >/dev/null <<SQL
create schema auth; create schema storage;
create table auth.users (id int primary key, email text);
insert into auth.users values (1, 'a@example.com'), (2, 'b@example.com');
create table storage.objects (id int primary key, bucket_id text, name text);
insert into storage.objects values (1, 'documentation', 'x'), (2, 'documentation', 'y'), (3, 'branding', 'logo.png');
create table public.romtegner_projects (id uuid primary key, project_no text, name text, data jsonb,
  updated_at timestamptz default now(), deleted_at timestamptz);
insert into public.romtegner_projects (id, project_no, name, data) values
  ('00000000-0000-0000-0000-000000000001', 'P0001', 'Enebolig Å', '{"a": 1}'),
  ('00000000-0000-0000-0000-000000000002', 'P0002', 'Hytte	med tab', \$vp\$$DATA2\$vp\$),
  ('00000000-0000-0000-0000-000000000003', 'P0003', 'Tomt', null);
create table public.profiles (id int); insert into public.profiles values (1), (2);
create table public."Rar Tabell" (id int);
SQL
  echo "  --    lokal Postgres startet: ekte pg_dump og pg_restore testes"
else
  printf 'dette er ikke en ekte dump\n' >"$T/falsk.dump"
  export VPB_TEST_FALSK_DUMP="$T/falsk.dump" VPB_TEST_HOPP_OVER_PG_RESTORE=1
  export VPB_TEST_DB_URL="postgresql://ubrukt@127.0.0.1/ubrukt"
  tail -n 4 "$T/initdb.log" "$T/pg.log" 2>/dev/null | sed "s/^/      /"
  echo "  --    ingen lokal Postgres: falsk dump, pg_restore --list hoppes over"
fi

# kjor <dato> [argumenter]: kjører ta-kopi.sh med /bin/bash (3.2, som launchd gjør)
kjor() { local d="$1"; shift; VPB_TEST_DATO="$d" /bin/bash "$ROT/ta-kopi.sh" "$@"; }
dmger() { ls -1 "$1" | grep -E "$VPB_FILMONSTER" | sort | tr '\n' ' '; }
tmp_tom() { [ -z "$(ls -A "$TMPDIR")" ]; }
ingen_montert() { ! mount | grep -F "$T" | grep -vqF "$T/mp "; }

echo "== 4. Scenario A: full kopi, ekstern disk tilkoblet, rydding =="
# 40 gamle ukekopier (søndager bakover fra 08.11.2026) + to filer som ikke skal røres
i=0; while [ "$i" -lt 40 ]; do
  : >"$VPB_ICLOUD/varmeplan-backup-$(date -j -v-"$i"w -f '%Y-%m-%d' 2026-11-08 +%Y-%m-%d).dmg"; i=$(( i + 1 ))
done
: >"$VPB_ICLOUD/annet.txt"; : >"$VPB_ICLOUD/varmeplan-backup-notat.dmg"
kjor 2026-11-15; KODE=$?
if [ "$KODE" != "0" ]; then tail -n 15 "$LOGG" | sed "s/^/      /"; fi
sjekk "avslutter med 0" lik "$KODE" 0
A="$VPB_ICLOUD/varmeplan-backup-2026-11-15.dmg"
sjekk "kopien ligger i iCloud-mappa" test -s "$A"
sjekk "samme fil på den eksterne disken" cmp "$A" "$VPB_VOLUMER/Min Disk/Varmeplan-backup/varmeplan-backup-2026-11-15.dmg"
sjekk "rydding: 8 siste uker + én per måned i 6 måneder" lik "$(dmger "$VPB_ICLOUD")" \
  "varmeplan-backup-2026-06-28.dmg varmeplan-backup-2026-07-26.dmg varmeplan-backup-2026-08-30.dmg varmeplan-backup-2026-09-27.dmg varmeplan-backup-2026-10-04.dmg varmeplan-backup-2026-10-11.dmg varmeplan-backup-2026-10-18.dmg varmeplan-backup-2026-10-25.dmg varmeplan-backup-2026-11-01.dmg varmeplan-backup-2026-11-08.dmg varmeplan-backup-2026-11-15.dmg "
sjekk "andre filer i mappa er urørt" test -e "$VPB_ICLOUD/annet.txt" -a -e "$VPB_ICLOUD/varmeplan-backup-notat.dmg"
sjekk "ingen midlertidige filer igjen" tmp_tom
sjekk "ingenting står montert" ingen_montert
sjekk "låsen er sluppet" test ! -e "$VPB_KONFIG_MAPPE/laas"
sjekk "siste-ok er skrevet" test -s "$VPB_KONFIG_MAPPE/siste-ok"
ikke  "service-nøkkelen står ikke i loggen" grep -rqF "$NOKKEL" "$T/logg mappe" "$VPB_KONFIG_MAPPE"
ikke  "krypteringspassordet står ikke i loggen" grep -rqF "$PASSORD" "$T/logg mappe" "$VPB_KONFIG_MAPPE"
sjekk "varsel: antall filer og MB" grep -qE "VARSEL: Varmeplan-kopi tatt: [0-9?]+ prosjekter, $FORVENTET_FILER filer, [0-9]+,[0-9] MB\. Også på Min Disk\. 1 filer manglet\." "$LOGG"
sjekk "kopien er kryptert (hdiutil isencrypted)" sh -c 'hdiutil isencrypted "$0" 2>&1 | grep -q "encrypted: YES"' "$A"
feil_passord() { mkdir -p "$T/mp0"; printf 'feil passord' | hdiutil attach -quiet -stdinpass -readonly -nobrowse -mountpoint "$T/mp0" "$A"; }
ikke  "feil passord åpner ikke kopien" feil_passord
MP="$T/mp"; mkdir -p "$MP"
aapne() { printf '%s' "$PASSORD" | hdiutil attach -quiet -stdinpass -readonly -nobrowse -mountpoint "$MP" "$1"; }
sjekk "riktig passord åpner kopien" aapne "$A"
sjekk "manifest: sum filer" har "$MP/MANIFEST.txt" "SUM filer: $FORVENTET_FILER"
sjekk "manifest: SHA-256 stemmer med dumpen" har "$MP/MANIFEST.txt" "$(shasum -a 256 "$MP/database/varmeplan.dump" | awk '{ print $1 }')"
sjekk "manifest: fila som manglet er nevnt" har "$MP/MANIFEST.txt" "documentation/borte.fantom"
sjekk "manifest: tom bøtte er med" grep -qE '^  tom +0 +0 +0' "$MP/MANIFEST.txt"
sjekk "fil med mellomrom og æøå i stien er lik originalen" cmp "$MP/storage/documentation/prosjekt 1/rom A/bilde æøå.jpg" "$L/documentation/prosjekt 1/rom A/bilde æøå.jpg"
sjekk "filnavnet er bevart byte for byte" sh -c 'ls "$0" | grep -q "^bilde $(printf "\303\246\303\270\303\245").jpg$"' "$MP/storage/documentation/prosjekt 1/rom A"
sjekk "1203 filer i én mappe (sideblaing over 1000)" lik "$(ls "$MP/storage/mange/serie" | wc -l | tr -d ' ')" 1203
sjekk "veiledning og hjelpeskript ligger i kopien" test -f "$MP/GJENOPPRETTING.md" -a -f "$MP/last-opp-filer.sh" -a -f "$MP/hent-prosjekt.sh" -a -f "$MP/felles.sh"
ikke  "kopien er skrivebeskyttet" touch "$MP/ny-fil"
if [ "$EKTE" = "1" ]; then
  sjekk "manifest: rader i romtegner_projects" grep -qE '^  romtegner_projects +3$' "$MP/MANIFEST.txt"
  sjekk "manifest: tabell med mellomrom i navnet" grep -qE '^  Rar Tabell +0$' "$MP/MANIFEST.txt"
  sjekk "manifest: brukere" har "$MP/MANIFEST.txt" "auth.users: 2"
  sjekk "manifest: skjemaer public, auth, storage" har "$MP/MANIFEST.txt" "Skjemaer:  public, auth, storage"
  sjekk "manifest: storage.objects per bøtte" grep -qE '^  documentation +2 +[0-9]+ +3 +2$' "$MP/MANIFEST.txt"
  sjekk "logg: pg_restore --list leste dumpen" har "$LOGG" "pg_restore --list leste"
  sjekk "varsel: 3 prosjekter" har "$LOGG" "Varmeplan-kopi tatt: 3 prosjekter"
fi

echo "== 5. Scenario B: ekstern disk ikke tilkoblet =="
mv "$VPB_VOLUMER/Min Disk" "$T/frakoblet"
kjor 2026-11-22; KODE=$?
sjekk "avslutter med 0" lik "$KODE" 0
sjekk "varsel sier at disken ikke er tilkoblet" grep -qE 'VARSEL: Varmeplan-kopi tatt: .* Ekstern disk ikke tilkoblet\.' "$LOGG"
sjekk "kopien ligger i iCloud-mappa" test -s "$VPB_ICLOUD/varmeplan-backup-2026-11-22.dmg"
sjekk "ingen mappe laget under Volumes" test ! -e "$VPB_VOLUMER/Min Disk"
sjekk "rydding: september beholdes nå som månedskopi" lik "$(dmger "$VPB_ICLOUD" | wc -w | tr -d ' ')" 12
sjekk "ingen midlertidige filer igjen" tmp_tom
mv "$T/frakoblet" "$VPB_VOLUMER/Min Disk"

echo "== 6. Scenario C: feil underveis rydder opp =="
FOR=$(dmger "$VPB_ICLOUD")
VPB_TEST_API_NOKKEL="feil-nokkel" kjor 2026-11-29; KODE=$?
ikke  "feil service-nøkkel: avslutter med feil" lik "$KODE" 0
sjekk "logg og varsel sier FEILET" grep -q 'VARSEL: Varmeplan-kopi FEILET' "$LOGG"
sjekk "ingen kopi laget, ingenting ryddet bort" lik "$(dmger "$VPB_ICLOUD")" "$FOR"
sjekk "ingen midlertidige filer igjen" tmp_tom
sjekk "låsen er sluppet" test ! -e "$VPB_KONFIG_MAPPE/laas"
chmod 555 "$VPB_ICLOUD"
kjor 2026-11-29; KODE=$?
chmod 755 "$VPB_ICLOUD"
ikke  "iCloud-mappa skrivebeskyttet: avslutter med feil" lik "$KODE" 0
sjekk "feilet under kopiering til iCloud" har "$LOGG" "FEILET under: kopiere til iCloud Drive"
sjekk "ingen midlertidige filer igjen (ferdig .dmg slettet)" tmp_tom
sjekk "ingenting står montert" ingen_montert
if [ "$EKTE" != "1" ]; then
  VPB_TEST_HOPP_OVER_PG_RESTORE=0 kjor 2026-11-29; KODE=$?
  ikke  "falsk dump stoppes av pg_restore --list" lik "$KODE" 0
  sjekk "feilet under kontrollen" har "$LOGG" "Kontroll: pg_restore --list kunne ikke lese dumpen"
  sjekk "kontrollbildet er avmontert og slettet" tmp_tom
  sjekk "ingenting står montert" ingen_montert
fi
sjekk "ingen kopi for 29.11 finnes" test ! -e "$VPB_ICLOUD/varmeplan-backup-2026-11-29.dmg"

echo "== 7. Scenario D: --planlagt =="
N1=$(grep -c 'Starter sikkerhetskopi' "$LOGG")
kjor 2026-11-29 --planlagt; KODE=$?
sjekk "kopi nettopp tatt: gjør ingenting, avslutter med 0" lik "$KODE|$(grep -c 'Starter sikkerhetskopi' "$LOGG")" "0|$N1"
echo 1000 >"$VPB_KONFIG_MAPPE/siste-ok"
kjor 2026-11-29 --planlagt; KODE=$?
sjekk "forrige kopi er gammel: tar kopi" test "$KODE" = 0 -a -s "$VPB_ICLOUD/varmeplan-backup-2026-11-29.dmg"
touch "$VPB_KONFIG_MAPPE/kjor-na"
kjor 2026-12-06 --planlagt; KODE=$?
sjekk "kjor-na: tar kopi selv om ukas kopi er tatt" test "$KODE" = 0 -a -s "$VPB_ICLOUD/varmeplan-backup-2026-12-06.dmg" -a ! -e "$VPB_KONFIG_MAPPE/kjor-na"
mkdir "$VPB_KONFIG_MAPPE/laas"; N1=$(grep -c 'Starter sikkerhetskopi' "$LOGG")
kjor 2026-12-13; KODE=$?
sjekk "en kopi kjører allerede: gjør ingenting, lar låsen stå" test "$KODE" = 0 -a -d "$VPB_KONFIG_MAPPE/laas" -a "$(grep -c 'Starter sikkerhetskopi' "$LOGG")" = "$N1"
rmdir "$VPB_KONFIG_MAPPE/laas"

echo "== 8. last-opp-filer.sh: fra åpnet kopi til et tomt prosjekt =="
VPB_TEST_OPPLAST_URL="http://127.0.0.1:$PORT2" /bin/bash "$MP/last-opp-filer.sh" >"$T/opplast.txt" 2>&1; KODE=$?
sjekk "avslutter med 0" lik "$KODE" 0
sjekk "alle filene lastet opp" har "$T/opplast.txt" "Lastet opp $FORVENTET_FILER filer. 0 feilet."
sjekk "fil med æøå er lik originalen" cmp "$T/lager2/documentation/prosjekt 1/rom A/bilde æøå.jpg" "$L/documentation/prosjekt 1/rom A/bilde æøå.jpg"
sjekk "bøttene laget, offentlig/privat som før" test "$(sort "$T/lager2/.botter-laget.txt" | tr '\n' ' ')" = "branding public=true documentation public=false mange public=false tom public=false "

echo "== 9. hent-prosjekt.sh: ett prosjekt ut av kopien =="
UT="$T/ut mappe"
ID2="00000000-0000-0000-0000-000000000002"
if [ "$EKTE" = "1" ]; then
  hent() { /bin/bash "$MP/hent-prosjekt.sh" "$@"; }
else
  # Samme tabell slik pg_restore --data-only skriver den (COPY-format, backslash doblet)
  {
    printf '%s\n' '-- PostgreSQL database dump' ''
    printf '%s\n' 'COPY public.romtegner_projects (id, project_no, name, data, updated_at, deleted_at) FROM stdin;'
    printf '%s\t%s\t%s\t%s\t%s\t%s\n' 00000000-0000-0000-0000-000000000001 P0001 'Enebolig Å' '{"a": 1}' '2026-11-01 10:00:00+00' '\N'
    printf '%s\t%s\t%s\t%s\t%s\t%s\n' "$ID2" P0002 'Hytte\tmed tab' \
      '{"sti": "C:\\\\temp", "navn": "Kjøkken \\"stort\\"", "tall": [1, 2.5], "linjer": "a\\nb\\tc"}' '2026-11-02 10:00:00+00' '2026-11-03 10:00:00+00'
    printf '%s\t%s\t%s\t%s\t%s\t%s\n' 00000000-0000-0000-0000-000000000003 P0003 Tomt '\N' '2026-11-03 10:00:00+00' '\N'
    printf '%s\n' '\.' ''
  } >"$T/copy.sql"
  hent() { VPB_TEST_COPY_FIL="$T/copy.sql" /bin/bash "$ROT/hent-prosjekt.sh" "$@"; }
fi
hent "" "$UT" >"$T/liste.txt" 2>&1; KODE=$?
sjekk "liste: avslutter med 0, tre prosjekter + overskrift" lik "$KODE|$(wc -l <"$T/liste.txt" | tr -d ' ')" "0|4"
sjekk "liste: nummer, id og navn med Å" grep -qE '^P0001 .* 00000000-0000-0000-0000-000000000001 +Enebolig Å$' "$T/liste.txt"
hent p2 "$UT" >"$T/hent.txt" 2>&1; KODE=$?
sjekk "hente P0002 (skrevet som p2): avslutter med 0" lik "$KODE" 0
sjekk "innholdet er nøyaktig det som lå i databasen" lik "$(jq -S -c . "$UT/prosjekt-P0002.json" 2>&1)" "$(printf '%s' "$DATA2" | jq -S -c .)"
sjekk "oppdater-fila peker på riktig id" grep -q "::jsonb where id = '$ID2';$" "$UT/prosjekt-P0002-oppdater.sql"
sjekk "rad-fila har COPY-hode, én rad og sluttmerke" lik "$(wc -l <"$UT/prosjekt-P0002-rad.sql" | tr -d ' ')|$(tail -n 1 "$UT/prosjekt-P0002-rad.sql")" '3|\.'
hent "$ID2" "$UT" >/dev/null 2>&1; sjekk "hente med id virker også" lik "$?" 0
hent P0003 "$UT" >/dev/null 2>&1; ikke "prosjekt uten innhold gir feil" lik "$?" 0
hent P9999 "$UT" >/dev/null 2>&1; ikke "ukjent prosjekt gir feil" lik "$?" 0
if [ "$EKTE" = "1" ]; then
  PSQL_T -c "update public.romtegner_projects set data = '{}' where id = '$ID2'" >/dev/null
  PSQL_T -f "$UT/prosjekt-P0002-oppdater.sql" >/dev/null 2>&1
  sjekk "oppdater-fila legger innholdet tilbake" lik "$(PSQL_T -c "select data from public.romtegner_projects where id = '$ID2'" | jq -S -c .)" "$(printf '%s' "$DATA2" | jq -S -c .)"
  PSQL_T -c "delete from public.romtegner_projects where id = '$ID2'" >/dev/null
  PSQL_T -f "$UT/prosjekt-P0002-rad.sql" >/dev/null 2>&1
  sjekk "rad-fila setter inn et slettet prosjekt igjen" lik "$(PSQL_T -c "select project_no from public.romtegner_projects where id = '$ID2'")" P0002
fi

echo
echo "== Resultat: $OK ok, $FEIL feil =="
if [ "$EKTE" = "1" ]; then
  echo "Testet med ekte lokal Postgres (pg_dump, radtelling, pg_restore --list, hent-prosjekt)."
else
  echo "IKKE testet her (ingen lokal Postgres): pg_dump, radtelling og pg_restore --list på en ekte dump."
fi
echo "ALDRI testet av denne tørrkjøringen: ekte Supabase, installer.sh, launchd, iCloud Drive, varsler."
if [ "$FEIL" -gt 0 ]; then
  echo; echo "Slutten av loggen:"; tail -n 40 "$LOGG" | sed 's/^/   /'
  exit 1
fi
exit 0
