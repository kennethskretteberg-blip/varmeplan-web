#!/bin/bash
# 229 · Tar en kryptert sikkerhetskopi av Varmeplan (database + alle Storage-filer).
#
# Kjøres av launchd (LaunchAgent no.varmeplan.backup) med --planlagt, eller for hånd:
#     bash ~/.config/varmeplan-backup/bin/ta-kopi.sh
#
# --planlagt: ta kopi bare hvis det ikke finnes en vellykket kopi etter siste
#             søndag kl. 21:00. launchd spør hver kveld kl. 21:00 og ved innlogging,
#             slik at en søndag der Macen var av, tas igjen neste gang den er på.
#
# Resultat: varmeplan-backup-ÅÅÅÅ-MM-DD.dmg (AES-256) i iCloud Drive, og på den
# eksterne disken hvis den er koblet til. Se GJENOPPRETTING.md.

set -Eeuo pipefail
umask 077
export PATH="/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin:/usr/local/bin"
export LANG="en_US.UTF-8"

HER="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=felles.sh
. "$HER/felles.sh"

PLANLAGT=0
if [ "${1:-}" = "--planlagt" ]; then PLANLAGT=1; fi

ARB=""          # midlertidig arbeidsmappe (ukryptert innhold – slettes alltid)
MONTERT=""      # monteringspunkt under kontrollen
HAR_LAAS=0
STEG="oppstart"
DATO="${VPB_TEST_DATO:-$(date +%Y-%m-%d)}"
NAVN="varmeplan-backup-$DATO.dmg"

mkdir -p "$VPB_KONFIG_MAPPE" "$(dirname "$VPB_LOGG")"

logg() {
  local linje
  linje="$(date '+%Y-%m-%d %H:%M:%S') $*"
  printf '%s\n' "$linje" >>"$VPB_LOGG"
  if [ -t 1 ]; then printf '%s\n' "$linje"; fi
}

varsle() {
  if [ "${VPB_TEST:-}" = "1" ]; then logg "VARSEL: $1"; return 0; fi
  osascript -e 'on run argv' \
            -e 'display notification (item 1 of argv) with title "Varmeplan"' \
            -e 'end run' "$1" >/dev/null 2>&1 || true
}

# Kjøres ALLTID når skriptet avslutter – også ved feil og Ctrl-C.
rydd_opp() {
  local kode=$?
  trap - EXIT
  set +e
  if [ -n "$MONTERT" ]; then
    hdiutil detach "$MONTERT" -quiet >/dev/null 2>&1 || hdiutil detach "$MONTERT" -force -quiet >/dev/null 2>&1
  fi
  if [ -n "$ARB" ] && [ -d "$ARB" ]; then rm -rf "$ARB"; fi
  if [ "$HAR_LAAS" = "1" ]; then rmdir "$VPB_LAAS" 2>/dev/null; fi
  if [ "$kode" -ne 0 ]; then
    logg "FEILET under: $STEG (kode $kode). Midlertidige filer er slettet."
    varsle "Varmeplan-kopi FEILET – se loggen"
  fi
  exit "$kode"
}
trap rydd_opp EXIT
trap 'exit 130' INT TERM HUP

avbryt() { logg "FEIL: $*"; exit 1; }

# ── Skal vi kjøre nå? ─────────────────────────────────────────────────────────
# Tidspunktet (sekunder) for siste søndag kl. 21:00.
siste_sondag_21() {
  local na i_dag_21 ukedag t
  na=$(date +%s)
  i_dag_21=$(date -j -f '%Y-%m-%d %H:%M:%S' "$(date +%Y-%m-%d) 21:00:00" +%s)
  ukedag=$(date +%w)                      # 0 = søndag
  t=$(( i_dag_21 - ukedag * 86400 ))
  if [ "$t" -gt "$na" ]; then t=$(( t - 7 * 86400 )); fi
  printf '%s' "$t"
}

if [ "$PLANLAGT" = "1" ]; then
  if [ -e "$VPB_KJOR_NA" ]; then
    rm -f "$VPB_KJOR_NA"
  else
    siste=0
    if [ -f "$VPB_SISTE_OK" ]; then siste=$(tr -cd '0-9' <"$VPB_SISTE_OK"); fi
    if [ -z "$siste" ]; then siste=0; fi
    if [ "$siste" -ge "$(siste_sondag_21)" ]; then
      exit 0                              # ukas kopi er tatt – ingenting å gjøre
    fi
  fi
fi

# Bare én kopi om gangen. En lås eldre enn 6 timer regnes som etterlatt.
if ! mkdir "$VPB_LAAS" 2>/dev/null; then
  if [ -n "$(find "$VPB_LAAS" -maxdepth 0 -mmin +360 2>/dev/null)" ]; then
    rmdir "$VPB_LAAS" 2>/dev/null || true
    mkdir "$VPB_LAAS" 2>/dev/null || { STEG="ta låsen"; avbryt "Fikk ikke tatt låsen $VPB_LAAS"; }
  else
    trap - EXIT
    exit 0                                # en annen kopi kjører allerede
  fi
fi
HAR_LAAS=1

# Hold loggen liten (behold de siste 2000 linjene når den passerer 1 MB).
if [ -f "$VPB_LOGG" ] && [ "$(stat -f %z "$VPB_LOGG")" -gt 1048576 ]; then
  tail -n 2000 "$VPB_LOGG" >"$VPB_LOGG.ny" && mv -f "$VPB_LOGG.ny" "$VPB_LOGG"
fi

logg "──── Starter sikkerhetskopi $DATO ────"

# ── Hemmeligheter og oppsett ──────────────────────────────────────────────────
STEG="lese nøkkelringen"
DB_URL=$(nokkel_les "$VPB_KONTO_DB") || true
VPB_API_NOKKEL=$(nokkel_les "$VPB_KONTO_API") || true
DMG_PASS=$(nokkel_les "$VPB_KONTO_PASS") || true
if [ -z "$DB_URL" ] || [ -z "$VPB_API_NOKKEL" ] || [ -z "$DMG_PASS" ]; then
  avbryt "Mangler nøkler i nøkkelringen. Kjør installer.sh på nytt."
fi

SUPABASE_URL=$(konfig_les SUPABASE_URL)
EKSTERN_DISK=$(konfig_les EKSTERN_DISK)
[ -n "$SUPABASE_URL" ] || avbryt "SUPABASE_URL mangler i $VPB_KONFIG_FIL. Kjør installer.sh på nytt."
SUPABASE_URL="${SUPABASE_URL%/}"

STEG="finne pg_dump"
FALSK_DUMP=""
if [ "${VPB_TEST:-}" = "1" ]; then FALSK_DUMP="${VPB_TEST_FALSK_DUMP:-}"; fi
if [ -z "$FALSK_DUMP" ]; then
  finn_pg || avbryt "Fant ikke pg_dump. Kjør: brew install libpq"
  db_uri_til_env "$DB_URL" || avbryt "Tilkoblingsstrengen i nøkkelringen er ikke en gyldig postgresql://-adresse."
fi
DB_URL=""

command -v jq >/dev/null 2>&1 || avbryt "Fant ikke jq (følger med macOS 15 og nyere)."

ARB=$(mktemp -d "${TMPDIR:-/tmp}/varmeplan-backup.XXXXXX")
INNHOLD="$ARB/innhold"
mkdir -p "$INNHOLD/database" "$INNHOLD/storage"
DUMP="$INNHOLD/database/varmeplan.dump"

sql() { "$PG_BIN/psql" -X -At -F '|' -v ON_ERROR_STOP=1 --no-password "$@"; }
feil_til_logg() { sed 's/^/   /' "$ARB/feil.txt" >>"$VPB_LOGG" 2>/dev/null || true; }

# ── Database ──────────────────────────────────────────────────────────────────
SKJEMAER="public, auth, storage"
SKJEMA_MERKNAD=""
if [ -n "$FALSK_DUMP" ]; then
  STEG="falsk dump (tørrkjøring)"
  cp "$FALSK_DUMP" "$DUMP"
  PG_VERSJON="TØRRKJØRING – falsk dump, ingen database"
  printf 'profiles|2\nromtegner_projects|3\n' >"$ARB/rader.txt"
  BRUKERE=2
  : >"$ARB/storage-db.txt"
else
  STEG="koble til databasen"
  forsok=1; maks=3
  if [ "$PLANLAGT" = "1" ]; then maks=20; fi   # rett etter oppvåkning kan nettet bruke litt tid
  until sql -c 'select 1' >/dev/null 2>"$ARB/feil.txt"; do
    if [ "$forsok" -ge "$maks" ]; then
      feil_til_logg
      avbryt "Får ikke kontakt med databasen etter $forsok forsøk."
    fi
    forsok=$(( forsok + 1 ))
    sleep 30
  done

  PG_VERSJON=$(sql -c 'select version()')
  SERVER_HOVED=$(sql -c "select current_setting('server_version_num')::int / 10000")
  logg "Server: PostgreSQL $SERVER_HOVED. pg_dump: $PG_DUMP_HOVED ($PG_BIN)."
  if [ "$PG_DUMP_HOVED" -lt "$SERVER_HOVED" ]; then
    avbryt "pg_dump er versjon $PG_DUMP_HOVED, men serveren er $SERVER_HOVED. pg_dump må være lik eller nyere. Kjør: brew upgrade libpq"
  fi

  STEG="pg_dump"
  if ! "$PG_BIN/pg_dump" -Fc --no-password -n public -n auth -n storage -f "$DUMP" 2>"$ARB/feil.txt"; then
    feil_til_logg
    logg "pg_dump med skjemaet storage feilet – prøver public + auth."
    rm -f "$DUMP"
    if ! "$PG_BIN/pg_dump" -Fc --no-password -n public -n auth -f "$DUMP" 2>"$ARB/feil.txt"; then
      feil_til_logg
      avbryt "pg_dump feilet."
    fi
    SKJEMAER="public, auth"
    SKJEMA_MERKNAD="MERK: skjemaet storage ble nektet og er IKKE med i dumpen. Filene er likevel med (mappa storage/)."
  fi
  logg "Dump ferdig: $(( $(stat -f %z "$DUMP") / 1024 )) kB, skjemaer: $SKJEMAER."

  STEG="telle rader"
  sql >"$ARB/rader.txt" <<'SQL'
select format('select %L, count(*) from %I.%I', c.relname, n.nspname, c.relname)
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind in ('r', 'p')
order by c.relname
\gexec
SQL
  BRUKERE=$(sql -c 'select count(*) from auth.users')
  sql -c 'select bucket_id, count(*) from storage.objects group by 1 order by 1' \
    >"$ARB/storage-db.txt" 2>/dev/null || : >"$ARB/storage-db.txt"
fi
unset PGPASSWORD

PROSJEKTER=$(awk -F'|' '$1 == "romtegner_projects" { print $2 }' "$ARB/rader.txt")
if [ -z "$PROSJEKTER" ]; then PROSJEKTER="?"; fi

# ── Storage: alle filer i alle bøtter ─────────────────────────────────────────
STEG="hente liste over Storage-bøtter"
if ! api_curl -f -o "$INNHOLD/storage-buckets.json" "$SUPABASE_URL/storage/v1/bucket" 2>"$ARB/feil.txt"; then
  feil_til_logg
  avbryt "Storage-API-et svarte ikke (feil nøkkel eller adresse?)."
fi
jq -e 'type == "array"' "$INNHOLD/storage-buckets.json" >/dev/null 2>&1 \
  || avbryt "Uventet svar fra Storage-API-et (ikke en liste over bøtter)."

# list_botte <bøtte> <utfil>: én linje per fil – sti, URL-kodet sti, størrelse (tab-delt).
# Går rekursivt gjennom mappene (mapper har id = null i svaret), 1000 om gangen.
list_botte() {
  local botte="$1" ut="$2" benc prefiks offset svar n mappe i=0
  local ko
  ko=("")
  benc=$(jq -rn --arg s "$botte" '$s | @uri')
  : >"$ut"
  while [ "$i" -lt "${#ko[@]}" ]; do
    prefiks="${ko[$i]}"
    i=$(( i + 1 ))
    offset=0
    while true; do
      svar=$(jq -n --arg p "$prefiks" --argjson o "$offset" \
               '{prefix: $p, limit: 1000, offset: $o, sortBy: {column: "name", order: "asc"}}' \
             | api_curl -f -X POST -H 'Content-Type: application/json' -d @- \
                 "$SUPABASE_URL/storage/v1/object/list/$benc")
      n=$(printf '%s' "$svar" | jq 'length')
      while IFS= read -r mappe; do
        if [ -n "$mappe" ]; then ko+=("$prefiks$mappe/"); fi
      done < <(printf '%s' "$svar" | jq -r '.[] | select(.id == null) | .name')
      printf '%s' "$svar" | jq -r --arg p "$prefiks" \
        '.[] | select(.id != null)
             | [($p + .name), (($p + .name) | split("/") | map(@uri) | join("/")), (.metadata.size // 0)]
             | @tsv' >>"$ut"
      if [ "$n" -lt 1000 ]; then break; fi
      offset=$(( offset + 1000 ))
    done
  done
  return 0
}

ANTALL_FILER=0
SUM_BYTE=0
MANGLER=0
: >"$ARB/botter.txt"
: >"$ARB/mangler.txt"

while IFS= read -r botte; do
  if [ -z "$botte" ]; then continue; fi
  STEG="laste ned bøtta $botte"
  case "$botte" in */*|.|..) avbryt "Ugyldig bøttenavn: $botte" ;; esac
  mkdir -p "$INNHOLD/storage/$botte"
  list_botte "$botte" "$ARB/liste.tsv"
  benc=$(jq -rn --arg s "$botte" '$s | @uri')
  listet=$(wc -l <"$ARB/liste.tsv" | tr -d ' ')
  while IFS=$'\t' read -r sti enc _str; do
    if [ -z "$sti" ]; then continue; fi
    case "/$sti/" in
      */../*|*/./*|//*)
        echo "$botte/$sti (ugyldig sti)" >>"$ARB/mangler.txt"; MANGLER=$(( MANGLER + 1 )); continue ;;
    esac
    mal="$INNHOLD/storage/$botte/$sti"
    mkdir -p "$(dirname "$mal")"
    if ! api_curl -f -o "$mal" "$SUPABASE_URL/storage/v1/object/$benc/$enc" 2>>"$ARB/feil.txt"; then
      rm -f "$mal"
      echo "$botte/$sti" >>"$ARB/mangler.txt"
      MANGLER=$(( MANGLER + 1 ))
    fi
  done <"$ARB/liste.tsv"
  filer=$(find "$INNHOLD/storage/$botte" -type f | wc -l | tr -d ' ')
  byte=$(find "$INNHOLD/storage/$botte" -type f -exec stat -f %z {} + | awk '{ s += $1 } END { printf "%d", s }')
  db=$(awk -F'|' -v b="$botte" '$1 == b { print $2 }' "$ARB/storage-db.txt")
  printf '%s|%s|%s|%s|%s\n' "$botte" "$filer" "$byte" "$listet" "${db:--}" >>"$ARB/botter.txt"
  ANTALL_FILER=$(( ANTALL_FILER + filer ))
  SUM_BYTE=$(( SUM_BYTE + byte ))
  logg "Bøtte $botte: $filer filer, $(( byte / 1024 )) kB."
done < <(jq -r '.[].id' "$INNHOLD/storage-buckets.json")

if [ "$MANGLER" -gt 0 ]; then
  feil_til_logg
  logg "ADVARSEL: $MANGLER filer lot seg ikke laste ned (står i MANIFEST.txt)."
fi

# ── Manifest ──────────────────────────────────────────────────────────────────
STEG="skrive manifest"
SHA=$(shasum -a 256 "$DUMP" | awk '{ print $1 }')
{
  echo "VARMEPLAN – SIKKERHETSKOPI"
  echo "=========================="
  echo "Tatt:              $(date '+%Y-%m-%d %H:%M:%S %Z')"
  echo "Kopiens dato:      $DATO"
  echo "Maskin:            $(scutil --get ComputerName 2>/dev/null || hostname)"
  echo "Prosjekt:          $SUPABASE_URL"
  echo "Postgres (server): $PG_VERSJON"
  echo "pg_dump:           ${PG_DUMP_HOVED:--}"
  echo
  echo "DATABASE  (database/varmeplan.dump, laget med pg_dump -Fc)"
  echo "  Skjemaer:  $SKJEMAER"
  if [ -n "$SKJEMA_MERKNAD" ]; then echo "  $SKJEMA_MERKNAD"; fi
  echo "  Størrelse: $(stat -f %z "$DUMP") byte"
  echo "  SHA-256:   $SHA"
  echo
  echo "BRUKERE"
  echo "  auth.users: $BRUKERE"
  echo
  echo "RADER PER TABELL I public  (telt rett etter dumpen)"
  awk -F'|' '{ printf "  %-44s %10d\n", $1, $2 }' "$ARB/rader.txt"
  echo
  echo "FILER  (storage/<bøtte>/...)"
  echo "  «listet» er hva Storage-API-et oppga, «i databasen» er storage.objects."
  printf '  %-28s %7s %13s %8s %13s\n' "bøtte" "filer" "byte" "listet" "i databasen"
  awk -F'|' '{ printf "  %-28s %7d %13d %8d %13s\n", $1, $2, $3, $4, $5 }' "$ARB/botter.txt"
  echo "  SUM filer: $ANTALL_FILER"
  echo "  SUM byte:  $SUM_BYTE"
  if [ "$MANGLER" -gt 0 ]; then
    echo
    echo "ADVARSEL – FILER SOM IKKE LOT SEG LASTE NED ($MANGLER)"
    sed 's/^/  /' "$ARB/mangler.txt"
  fi
  echo
  echo "IKKE MED I KOPIEN (må noteres separat – se GJENOPPRETTING.md):"
  echo "  Auth-innstillinger og SMTP (Resend), Edge Function-hemmeligheter,"
  echo "  Vercel-oppsett og domene."
} >"$INNHOLD/MANIFEST.txt"

for f in GJENOPPRETTING.md last-opp-filer.sh hent-prosjekt.sh felles.sh; do
  if [ -f "$HER/$f" ]; then cp "$HER/$f" "$INNHOLD/$f"; fi
done

# ── Pakk i kryptert .dmg ──────────────────────────────────────────────────────
STEG="lage kryptert .dmg"
DMG="$ARB/$NAVN"
printf '%s' "$DMG_PASS" | hdiutil create -quiet -encryption AES-256 -stdinpass \
  -srcfolder "$INNHOLD" -volname "Varmeplan-backup $DATO" -fs APFS -format UDZO -ov "$DMG" \
  >>"$VPB_LOGG" 2>&1 || avbryt "hdiutil klarte ikke å lage .dmg-fila."

# Det ukrypterte innholdet trengs ikke lenger.
rm -rf "$INNHOLD"

# ── Kontroller kopien ─────────────────────────────────────────────────────────
STEG="kontrollere kopien"
MP="$ARB/montert"
mkdir -p "$MP"
printf '%s' "$DMG_PASS" | hdiutil attach -quiet -stdinpass -readonly -nobrowse -noautoopen \
  -mountpoint "$MP" "$DMG" >>"$VPB_LOGG" 2>&1 \
  || avbryt "Kontroll: fikk ikke åpnet .dmg-fila med passordet."
MONTERT="$MP"
DMG_PASS=""

[ -f "$MP/MANIFEST.txt" ] || avbryt "Kontroll: MANIFEST.txt mangler i kopien."
sha_k=$(shasum -a 256 "$MP/database/varmeplan.dump" | awk '{ print $1 }')
[ "$sha_k" = "$SHA" ] || avbryt "Kontroll: SHA-256 av dumpen i kopien stemmer ikke med manifestet."
if [ -n "$FALSK_DUMP" ] && [ "${VPB_TEST_HOPP_OVER_PG_RESTORE:-}" = "1" ]; then
  logg "TØRRKJØRING: pg_restore --list hoppet over (falsk dump)."
else
  if [ -z "${PG_BIN:-}" ]; then finn_pg || avbryt "Kontroll: fant ikke pg_restore."; fi
  oppf=$("$PG_BIN/pg_restore" --list "$MP/database/varmeplan.dump" 2>>"$VPB_LOGG" | grep -vc '^;' || true)
  if [ "${oppf:-0}" -lt 1 ]; then avbryt "Kontroll: pg_restore --list kunne ikke lese dumpen."; fi
  logg "Kontroll: pg_restore --list leste $oppf oppføringer."
fi
filer_k=$(find "$MP/storage" -type f | wc -l | tr -d ' ')
[ "$filer_k" = "$ANTALL_FILER" ] \
  || avbryt "Kontroll: $filer_k filer i kopien, manifestet sier $ANTALL_FILER."
hdiutil detach "$MP" -quiet >>"$VPB_LOGG" 2>&1 || hdiutil detach "$MP" -force -quiet >>"$VPB_LOGG" 2>&1
MONTERT=""
logg "Kontroll OK: dumpen er lesbar, SHA-256 stemmer, $filer_k filer."

# ── Legg kopien på plass ──────────────────────────────────────────────────────
# legg_i <mappe>: kopierer via et midlertidig navn, så en halv fil aldri ser ferdig ut.
legg_i() {
  mkdir -p "$1" && cp "$DMG" "$1/.$NAVN.delvis" && mv -f "$1/.$NAVN.delvis" "$1/$NAVN"
}

# rydd_mappe <mappe>: behold de 8 nyeste, pluss den nyeste i hver av de 6 siste
# kalendermånedene (inneværende + 5 bakover). Alt annet som heter
# varmeplan-backup-ÅÅÅÅ-MM-DD.dmg slettes. Andre filer røres aldri.
rydd_mappe() {
  local mappe="$1" grense f m i=0 sett=" "
  grense=$(date -j -v-5m -f '%Y-%m-%d' "$DATO" +%Y-%m)
  while IFS= read -r f; do
    if [ -z "$f" ]; then continue; fi
    i=$(( i + 1 ))
    m="${f:17:7}"                          # ÅÅÅÅ-MM
    if [ "$i" -le 8 ]; then
      case "$sett" in *" $m "*) ;; *) sett="$sett$m " ;; esac
      continue
    fi
    if [ ! "$m" \< "$grense" ]; then
      case "$sett" in
        *" $m "*) ;;
        *) sett="$sett$m "; continue ;;
      esac
    fi
    if rm -f "$mappe/$f"; then logg "Ryddet bort $f fra $mappe"; fi
  done < <(ls -1 "$mappe" 2>/dev/null | grep -E "$VPB_FILMONSTER" | sort -r)
  rm -f "$mappe"/.varmeplan-backup-*.dmg.delvis 2>/dev/null || true
  return 0
}

STEG="kopiere til iCloud Drive"
if ! legg_i "$VPB_ICLOUD" 2>>"$VPB_LOGG"; then
  avbryt "Fikk ikke lagt kopien i $VPB_ICLOUD. Har bash fått tilgang til iCloud Drive? Se GJENOPPRETTING.md, avsnittet Hvis noe ikke virker."
fi
logg "Lagt i iCloud Drive: $VPB_ICLOUD/$NAVN"

STEG="kopiere til ekstern disk"
EKSTERN_TEKST=""
if [ -z "$EKSTERN_DISK" ]; then
  logg "Ingen ekstern disk er valgt."
elif er_eget_volum "$VPB_VOLUMER/$EKSTERN_DISK"; then
  if legg_i "$VPB_VOLUMER/$EKSTERN_DISK/$VPB_MAPPENAVN" 2>>"$VPB_LOGG"; then
    logg "Lagt på ekstern disk: $VPB_VOLUMER/$EKSTERN_DISK/$VPB_MAPPENAVN/$NAVN"
    EKSTERN_TEKST=" Også på $EKSTERN_DISK."
    rydd_mappe "$VPB_VOLUMER/$EKSTERN_DISK/$VPB_MAPPENAVN"
  else
    logg "ADVARSEL: fikk ikke skrevet til den eksterne disken $EKSTERN_DISK."
    EKSTERN_TEKST=" Ekstern disk: kopiering feilet."
  fi
else
  logg "Ekstern disk ikke tilkoblet ($EKSTERN_DISK) – iCloud-kopien er tatt."
  EKSTERN_TEKST=" Ekstern disk ikke tilkoblet."
fi

STEG="rydde gamle kopier"
rydd_mappe "$VPB_ICLOUD"

# ── Ferdig ────────────────────────────────────────────────────────────────────
STEG="avslutte"
MB=$(awk -v b="$(stat -f %z "$DMG")" 'BEGIN { printf "%.1f", b / 1048576 }' | tr . ,)
date +%s >"$VPB_SISTE_OK"
MANGLER_TEKST=""
if [ "$MANGLER" -gt 0 ]; then MANGLER_TEKST=" $MANGLER filer manglet."; fi
MELDING="Varmeplan-kopi tatt: $PROSJEKTER prosjekter, $ANTALL_FILER filer, $MB MB.$EKSTERN_TEKST$MANGLER_TEKST"
logg "FERDIG. $MELDING"
varsle "$MELDING"
exit 0
