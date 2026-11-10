#!/bin/bash
# 229 · Felles innstillinger og hjelpere for sikkerhetskopien av Varmeplan.
# Leses inn (source) av installer.sh, ta-kopi.sh, avinstaller.sh og last-opp-filer.sh.
# Skrevet for /bin/bash 3.2 (den som følger med macOS).
#
# Hemmeligheter (tilkoblingsstreng, service_role-nøkkel, krypteringspassord) ligger
# BARE i macOS-nøkkelringen. De skrives aldri til fil eller logg, og sendes aldri som
# argument til et program (argumenter er synlige i prosesslista).

# shellcheck disable=SC2034
VPB_TJENESTE="no.varmeplan.backup"          # navn på LaunchAgent og tjeneste i nøkkelringen
VPB_KONTO_DB="tilkoblingsstreng"
VPB_KONTO_API="service-role-nokkel"
VPB_KONTO_PASS="krypteringspassord"

VPB_KONFIG_MAPPE="${VPB_KONFIG_MAPPE:-$HOME/.config/varmeplan-backup}"
VPB_KONFIG_FIL="$VPB_KONFIG_MAPPE/config"
VPB_BIN="$VPB_KONFIG_MAPPE/bin"
VPB_SISTE_OK="$VPB_KONFIG_MAPPE/siste-ok"
VPB_KJOR_NA="$VPB_KONFIG_MAPPE/kjor-na"
VPB_LAAS="$VPB_KONFIG_MAPPE/laas"
VPB_LOGG="${VPB_LOGG:-$HOME/Library/Logs/varmeplan-backup.log}"
VPB_ICLOUD="${VPB_ICLOUD:-$HOME/Library/Mobile Documents/com~apple~CloudDocs/Varmeplan-backup}"
VPB_VOLUMER="${VPB_VOLUMER:-/Volumes}"
VPB_PLIST="$HOME/Library/LaunchAgents/$VPB_TJENESTE.plist"
VPB_MAPPENAVN="Varmeplan-backup"            # mappa på den eksterne disken
VPB_FILMONSTER='^varmeplan-backup-[0-9]{4}-[0-9]{2}-[0-9]{2}\.dmg$'

# ── Nøkkelring ────────────────────────────────────────────────────────────────
# VPB_TEST=1 brukes bare av tørrkjøringen (test/torrkjoring.sh): da leses verdiene
# fra miljøvariabler i stedet, slik at testen aldri rører nøkkelringen.
nokkel_les() {
  if [ "${VPB_TEST:-}" = "1" ]; then
    case "$1" in
      "$VPB_KONTO_DB")   printf '%s' "${VPB_TEST_DB_URL:-}" ;;
      "$VPB_KONTO_API")  printf '%s' "${VPB_TEST_API_NOKKEL:-}" ;;
      "$VPB_KONTO_PASS") printf '%s' "${VPB_TEST_PASSORD:-}" ;;
    esac
    return 0
  fi
  security find-generic-password -s "$VPB_TJENESTE" -a "$1" -w 2>/dev/null
}

nokkel_finnes() {
  security find-generic-password -s "$VPB_TJENESTE" -a "$1" >/dev/null 2>&1
}

# nokkel_lagre <konto> <verdi>
# Verdien går som hex-tekst på stdin til «security -i», aldri som argument.
nokkel_lagre() {
  local hex
  hex=$(printf '%s' "$2" | xxd -p | tr -d '\n')
  printf 'add-generic-password -U -s %s -a %s -l "Varmeplan-backup: %s" -X %s\n' \
    "$VPB_TJENESTE" "$1" "$1" "$hex" | security -i >/dev/null 2>&1
}

nokkel_slett() {
  security delete-generic-password -s "$VPB_TJENESTE" -a "$1" >/dev/null 2>&1
}

# ── Konfigfil (bare ufarlige ting: disknavn og prosjektadresse) ───────────────
konfig_les() {
  [ -f "$VPB_KONFIG_FIL" ] || return 0
  grep -E "^$1=" "$VPB_KONFIG_FIL" | head -n 1 | cut -d= -f2- || true
}

# ── Postgres-verktøy ──────────────────────────────────────────────────────────
# Finner mappa med nyeste pg_dump. Setter PG_BIN og PG_DUMP_HOVED (hovedversjon).
finn_pg() {
  local d v beste="" beste_v=0
  for d in /opt/homebrew/opt/libpq/bin /usr/local/opt/libpq/bin \
           /opt/homebrew/opt/postgresql@*/bin /usr/local/opt/postgresql@*/bin \
           /opt/homebrew/bin /usr/local/bin \
           /Applications/Postgres.app/Contents/Versions/latest/bin; do
    [ -x "$d/pg_dump" ] && [ -x "$d/pg_restore" ] && [ -x "$d/psql" ] || continue
    v=$("$d/pg_dump" --version 2>/dev/null | sed -E 's/.* ([0-9]+)(\.[0-9]+)*.*/\1/')
    case "$v" in ''|*[!0-9]*) continue ;; esac
    if [ "$v" -gt "$beste_v" ]; then beste_v=$v; beste=$d; fi
  done
  [ -n "$beste" ] || return 1
  PG_BIN="$beste"
  PG_DUMP_HOVED="$beste_v"
}

# ── Tilkoblingsstreng → miljøvariabler ────────────────────────────────────────
url_dekod() {
  local s="${1//\\/\\\\}"
  printf '%b' "${s//%/\\x}"
}

# db_uri_til_env <postgresql://bruker:passord@vert:port/database?sslmode=...>
# Setter PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE og PGSSLMODE, slik at
# pg_dump/psql aldri får passordet som argument.
db_uri_til_env() {
  local uri="$1" rest info vertdel sporring="" vert port db bruker pass ssl
  case "$uri" in
    postgresql://*|postgres://*) ;;
    *) return 1 ;;
  esac
  rest="${uri#*://}"
  case "$rest" in *@*) ;; *) return 1 ;; esac
  info="${rest%@*}"
  vertdel="${rest##*@}"
  case "$vertdel" in *\?*) sporring="${vertdel#*\?}"; vertdel="${vertdel%%\?*}" ;; esac
  db="postgres"
  case "$vertdel" in */*) db="${vertdel#*/}"; vertdel="${vertdel%%/*}" ;; esac
  [ -n "$db" ] || db="postgres"
  port="5432"
  case "$vertdel" in *:*) port="${vertdel##*:}"; vert="${vertdel%:*}" ;; *) vert="$vertdel" ;; esac
  bruker="$info"; pass=""
  case "$info" in *:*) bruker="${info%%:*}"; pass="${info#*:}" ;; esac
  [ -n "$vert" ] && [ -n "$bruker" ] || return 1
  case "$port" in ''|*[!0-9]*) return 1 ;; esac
  ssl="require"
  case "&$sporring&" in
    *"&sslmode="*) ssl="${sporring##*sslmode=}"; ssl="${ssl%%&*}" ;;
  esac
  PGHOST=$(url_dekod "$vert")
  PGPORT="$port"
  PGUSER=$(url_dekod "$bruker")
  PGPASSWORD=$(url_dekod "$pass")
  PGDATABASE=$(url_dekod "$db")
  PGSSLMODE="$ssl"
  PGCONNECT_TIMEOUT=20
  PGAPPNAME="varmeplan-backup"
  export PGHOST PGPORT PGUSER PGPASSWORD PGDATABASE PGSSLMODE PGCONNECT_TIMEOUT PGAPPNAME
}

# Prosjekt-ID (f.eks. nhzhffertfqdeslhzyxx) fra brukernavn «postgres.<id>» eller
# vert «db.<id>.supabase.co». Skriver tom streng hvis den ikke kan utledes.
prosjekt_ref() {
  local h
  case "${PGUSER:-}" in
    postgres.*) printf '%s' "${PGUSER#postgres.}"; return 0 ;;
  esac
  case "${PGHOST:-}" in
    db.*.supabase.co) h="${PGHOST#db.}"; printf '%s' "${h%.supabase.co}" ;;
  esac
}

# ── Storage-API ───────────────────────────────────────────────────────────────
# Nøkkelen ligger i VPB_API_NOKKEL og gis til curl gjennom en konfig-strøm
# (prosess-substitusjon), ikke som argument.
api_curl() {
  curl -sS --connect-timeout 20 --max-time 900 --retry 3 --retry-delay 2 \
    -K <(printf 'header = "apikey: %s"\nheader = "Authorization: Bearer %s"\n' \
          "$VPB_API_NOKKEL" "$VPB_API_NOKKEL") "$@"
}

# ── Diverse ───────────────────────────────────────────────────────────────────
# Sant hvis <mappe> er et eget tilkoblet volum (ikke bare en tom mappe i /Volumes,
# og ikke systemdisken).
er_eget_volum() {
  [ -d "$1" ] || return 1
  if [ "${VPB_TEST:-}" = "1" ]; then return 0; fi
  [ "$(stat -f %d "$1" 2>/dev/null)" != "$(stat -f %d / 2>/dev/null)" ]
}

spor_ja_nei() {
  local svar
  while true; do
    printf '%s (ja/nei): ' "$1"
    IFS= read -r svar || return 1
    case "$svar" in
      ja|Ja|JA|j|J) return 0 ;;
      nei|Nei|NEI|n|N) return 1 ;;
    esac
    echo "Skriv ja eller nei."
  done
}

# les_skjult <ledetekst>: leser en linje uten å vise den. Svaret ligger i SKJULT.
les_skjult() {
  SKJULT=""
  printf '%s' "$1"
  IFS= read -rs SKJULT || true
  echo
  # fjern linjeskift/mellomrom som følger med når man limer inn
  SKJULT="${SKJULT#"${SKJULT%%[![:space:]]*}"}"
  SKJULT="${SKJULT%"${SKJULT##*[![:space:]]}"}"
}
