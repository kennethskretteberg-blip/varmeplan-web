#!/bin/bash
# 229 · Setter opp ukentlig kryptert sikkerhetskopi av Varmeplan på denne Macen.
# Kjøres én gang i Terminal (kan trygt kjøres på nytt for å endre noe):
#
#     bash ~/Code/varmeplan-web/scripts/backup/installer.sh
#
# Ingenting hemmelig skrives til fil. Tilkoblingsstreng, service_role-nøkkel og
# krypteringspassord legges i macOS-nøkkelringen.

set -uo pipefail
umask 077
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

HER="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=felles.sh
. "$HER/felles.sh"

strek() { echo; echo "------------------------------------------------------------"; }
stopp() { echo; echo "STOPP: $*"; unset PGPASSWORD; exit 1; }
# sant hvis teksten bare har vanlige tegn (a-z, A-Z, tall, mellomrom og tegn på tastaturet)
bare_ascii() { local LC_ALL=C; case "$1" in *[![:print:]]*) return 1 ;; esac; return 0; }

[ "$(uname)" = "Darwin" ] || stopp "Dette skriptet er laget for macOS."
[ -t 0 ] || stopp "Kjør skriptet i et Terminal-vindu, slik at du kan svare på spørsmålene."
for f in felles.sh ta-kopi.sh GJENOPPRETTING.md last-opp-filer.sh hent-prosjekt.sh; do
  [ -f "$HER/$f" ] || stopp "Finner ikke $HER/$f"
done

echo
echo "SIKKERHETSKOPI AV VARMEPLAN"
echo
echo "Dette setter opp en kryptert kopi av hele Varmeplan (database og alle"
echo "bilder og logoer) hver søndag kl. 21:00. Kopien legges i iCloud Drive,"
echo "og på en ekstern disk hvis den er koblet til."
echo
echo "Du trenger tre ting:"
echo "  1. Tilkoblingsstrengen til databasen (fra Supabase)"
echo "  2. service_role-nøkkelen (fra Supabase)"
echo "  3. Et krypteringspassord du finner på selv"

# ── 1. Verktøy ────────────────────────────────────────────────────────────────
strek
echo "Steg 1 av 6: Sjekker verktøy"
command -v jq >/dev/null 2>&1 || stopp "Finner ikke jq. Det følger med macOS 15 og nyere. Har du Homebrew, kjør: brew install jq"
command -v hdiutil >/dev/null 2>&1 || stopp "Finner ikke hdiutil (skal følge med macOS)."

# brew_libpq <install|upgrade>
brew_libpq() {
  echo "Kopien tas med programmet pg_dump. Det følger med pakken libpq fra Homebrew."
  if ! command -v brew >/dev/null 2>&1; then
    stopp "Homebrew er ikke installert. Installer det fra https://brew.sh, og kjør så dette skriptet på nytt."
  fi
  if spor_ja_nei "Skal jeg kjøre brew $1 libpq nå?"; then
    brew "$1" libpq || stopp "brew $1 libpq feilet."
  else
    stopp "Kjør selv: brew $1 libpq   og kjør så dette skriptet på nytt."
  fi
}

if ! finn_pg; then
  echo "pg_dump er ikke installert."
  brew_libpq install
  finn_pg || stopp "Finner fortsatt ikke pg_dump etter installasjonen."
fi
echo "Fant pg_dump versjon $PG_DUMP_HOVED i $PG_BIN"

# ── 2. Tilkoblingsstreng ──────────────────────────────────────────────────────
strek
echo "Steg 2 av 6: Tilkoblingsstrengen til databasen"
echo
echo "Slik finner du den:"
echo "  1. Åpne supabase.com/dashboard i nettleseren og velg prosjektet arqely-mvp."
echo "  2. Trykk på Connect øverst på siden."
echo "  3. Finn Session pooler og kopier adressen som står under URI."
echo "     Den begynner med postgresql://"
echo "  4. Adressen inneholder teksten [YOUR-PASSWORD]. Bytt den ut med"
echo "     databasepassordet ditt (uten hakeparentesene) før du limer inn."
echo "     Har du glemt det, kan du lage nytt under Project Settings, Database."
echo
echo "Det du limer inn vises ikke på skjermen. Det er meningen."

DB_URL=""
if nokkel_finnes "$VPB_KONTO_DB" && spor_ja_nei "Det ligger allerede en tilkoblingsstreng i nøkkelringen. Vil du beholde den?"; then
  DB_URL=$(nokkel_les "$VPB_KONTO_DB")
fi
SERVER_HOVED=""
while true; do
  if [ -z "$DB_URL" ]; then
    les_skjult "Lim inn tilkoblingsstrengen og trykk Enter: "
    DB_URL="$SKJULT"
  fi
  case "$DB_URL" in
    *"[YOUR-PASSWORD]"*)
      echo "Teksten [YOUR-PASSWORD] står fortsatt i adressen. Bytt den ut med passordet."
      DB_URL=""; continue ;;
  esac
  if ! db_uri_til_env "$DB_URL"; then
    echo "Det ser ikke ut som en tilkoblingsstreng. Den skal begynne med postgresql://"
    DB_URL=""; continue
  fi
  if [ "$PGPORT" = "6543" ]; then
    echo "Dette er Transaction pooler (port 6543). Velg Session pooler (port 5432) i stedet."
    DB_URL=""; continue
  fi
  echo "Prøver å koble til ..."
  if SERVER_TEKST=$("$PG_BIN/psql" -X -At --no-password -c 'select version()' 2>&1); then
    SERVER_HOVED=$("$PG_BIN/psql" -X -At --no-password -c "select current_setting('server_version_num')::int / 10000" 2>/dev/null)
    echo "Tilkoblingen virker."
    break
  fi
  echo "Fikk ikke koblet til. Meldingen fra databasen:"
  printf '%s\n' "$SERVER_TEKST" | sed 's/^/   /'
  echo "Prøv igjen, eller trykk Ctrl-C for å avbryte."
  DB_URL=""
done

echo "Serveren kjører: $SERVER_TEKST"
case "$SERVER_HOVED" in ''|*[!0-9]*) stopp "Klarte ikke å lese Postgres-versjonen på serveren." ;; esac
if [ "$PG_DUMP_HOVED" -lt "$SERVER_HOVED" ]; then
  echo
  echo "VIKTIG: pg_dump på denne Macen er versjon $PG_DUMP_HOVED, men serveren er versjon $SERVER_HOVED."
  echo "pg_dump må være samme versjon som serveren eller nyere, ellers kan den ikke ta kopi."
  brew_libpq upgrade
  finn_pg || stopp "Finner ikke pg_dump etter oppgraderingen."
  if [ "$PG_DUMP_HOVED" -lt "$SERVER_HOVED" ]; then
    stopp "pg_dump er fortsatt versjon $PG_DUMP_HOVED, serveren er $SERVER_HOVED. Kopien kan ikke tas før pg_dump er versjon $SERVER_HOVED eller nyere."
  fi
fi
echo "pg_dump er versjon $PG_DUMP_HOVED og serveren versjon $SERVER_HOVED. Det passer."

SUPABASE_URL=""
REF=$(prosjekt_ref)
if [ -n "$REF" ]; then
  SUPABASE_URL="https://$REF.supabase.co"
else
  echo
  echo "Jeg klarte ikke å lese prosjektadressen ut av tilkoblingsstrengen."
  echo "Du finner den i Supabase under Project Settings, Data API, Project URL."
  while true; do
    printf 'Skriv prosjektadressen (https://....supabase.co): '
    IFS= read -r SUPABASE_URL || stopp "Avbrutt."
    case "$SUPABASE_URL" in https://*.*) break ;; esac
    echo "Adressen skal begynne med https://"
  done
fi
SUPABASE_URL="${SUPABASE_URL%/}"
echo "Prosjektadresse: $SUPABASE_URL"
unset PGPASSWORD

# ── 3. service_role-nøkkel ────────────────────────────────────────────────────
strek
echo "Steg 3 av 6: service_role-nøkkelen"
echo
echo "Den trengs for å hente bildene og logoene. Slik finner du den:"
echo "  1. I Supabase: Project Settings (tannhjulet), så API Keys."
echo "  2. Finn nøkkelen som heter service_role (står under Legacy API keys"
echo "     hvis siden har flere faner). Trykk Reveal og så Copy."
echo "     En nøkkel som begynner med sb_secret_ virker også."
echo "  Ikke bruk nøkkelen som heter anon eller publishable."
echo

VPB_API_NOKKEL=""
if nokkel_finnes "$VPB_KONTO_API" && spor_ja_nei "Det ligger allerede en service_role-nøkkel i nøkkelringen. Vil du beholde den?"; then
  VPB_API_NOKKEL=$(nokkel_les "$VPB_KONTO_API")
fi
BOTTER_FIL=$(mktemp "${TMPDIR:-/tmp}/vpb-botter.XXXXXX")
trap 'rm -f "$BOTTER_FIL"' EXIT
while true; do
  if [ -z "$VPB_API_NOKKEL" ]; then
    les_skjult "Lim inn service_role-nøkkelen og trykk Enter: "
    VPB_API_NOKKEL="$SKJULT"
  fi
  if [ -z "$VPB_API_NOKKEL" ] || ! bare_ascii "$VPB_API_NOKKEL"; then
    echo "Det ser ikke ut som en nøkkel. Prøv igjen."
    VPB_API_NOKKEL=""; continue
  fi
  echo "Prøver nøkkelen ..."
  KODE=$(api_curl -o "$BOTTER_FIL" -w '%{http_code}' "$SUPABASE_URL/storage/v1/bucket" 2>/dev/null) || KODE="000"
  if [ "$KODE" = "200" ] && jq -e 'type == "array"' "$BOTTER_FIL" >/dev/null 2>&1; then
    echo "Nøkkelen virker. Disse lagrene (bøttene) med filer blir med i kopien:"
    jq -r '.[] | "   " + .id' "$BOTTER_FIL"
    break
  fi
  echo "Nøkkelen ble ikke godtatt (svar $KODE fra Supabase)."
  echo "Sjekk at du kopierte service_role-nøkkelen, og hele nøkkelen. Prøv igjen."
  VPB_API_NOKKEL=""
done

# ── 4. Krypteringspassord ─────────────────────────────────────────────────────
strek
echo "Steg 4 av 6: Krypteringspassordet"
echo
echo "Kopiene låses med et passord du velger selv. Det samme passordet brukes"
echo "når du en dag skal åpne en kopi (dobbeltklikk på fila, skriv passordet)."
echo "  Minst 12 tegn."
echo "  Bruk bokstavene a til z, tall og vanlige tegn. Ikke æ, ø eller å."
echo

DMG_PASS=""
if nokkel_finnes "$VPB_KONTO_PASS"; then
  echo "Det ligger allerede et krypteringspassord i nøkkelringen."
  echo "Bytter du passord, åpnes gamle kopier fortsatt bare med det gamle."
  if spor_ja_nei "Vil du beholde passordet som ligger der?"; then
    DMG_PASS=$(nokkel_les "$VPB_KONTO_PASS")
  fi
fi
while [ -z "$DMG_PASS" ]; do
  les_skjult "Skriv krypteringspassordet: "
  P1="$SKJULT"
  if [ "${#P1}" -lt 12 ]; then echo "For kort. Passordet må ha minst 12 tegn."; continue; fi
  if ! bare_ascii "$P1"; then echo "Passordet har tegn som ikke er tillatt (for eksempel æ, ø eller å). Velg et annet."; continue; fi
  les_skjult "Skriv det en gang til: "
  if [ "$P1" != "$SKJULT" ]; then echo "De to var ikke like. Prøv igjen."; continue; fi
  DMG_PASS="$P1"
done
P1=""; SKJULT=""

echo
echo "Lagrer de tre i nøkkelringen ..."
lagre_og_sjekk() {
  nokkel_lagre "$1" "$2"
  [ "$(nokkel_les "$1")" = "$2" ]
}
lagre_og_sjekk "$VPB_KONTO_DB" "$DB_URL"          || stopp "Fikk ikke lagret tilkoblingsstrengen i nøkkelringen."
lagre_og_sjekk "$VPB_KONTO_API" "$VPB_API_NOKKEL" || stopp "Fikk ikke lagret service_role-nøkkelen i nøkkelringen."
lagre_og_sjekk "$VPB_KONTO_PASS" "$DMG_PASS"      || stopp "Fikk ikke lagret krypteringspassordet i nøkkelringen."
DB_URL=""; DMG_PASS=""
echo "Lagret. Du finner dem i programmet Nøkkelringtilgang ved å søke etter Varmeplan-backup."

# ── 5. Ekstern disk ───────────────────────────────────────────────────────────
strek
echo "Steg 5 av 6: Ekstern disk (valgfritt)"
echo
echo "Kopien legges alltid i iCloud Drive. Velger du en ekstern disk her, legges"
echo "den i tillegg der hver gang disken er koblet til. Er den ikke koblet til,"
echo "går det fint, og varselet sier at den eksterne disken ikke var tilkoblet."
echo "Disken må være koblet til nå for at du skal kunne velge den."
echo

EKSTERN_DISK=""
while true; do
  DISKER=()
  for v in "$VPB_VOLUMER"/*; do
    if er_eget_volum "$v"; then DISKER+=("$(basename "$v")"); fi
  done
  echo "  0. Ingen ekstern disk"
  n=0
  while [ "$n" -lt "${#DISKER[@]}" ]; do
    echo "  $(( n + 1 )). ${DISKER[$n]}"
    n=$(( n + 1 ))
  done
  if [ "${#DISKER[@]}" -eq 0 ]; then echo "  (fant ingen eksterne disker akkurat nå)"; fi
  printf 'Skriv tallet foran disken du vil bruke, eller n for å lete på nytt: '
  IFS= read -r VALG || stopp "Avbrutt."
  case "$VALG" in
    n|N) continue ;;
    0) EKSTERN_DISK=""; echo "Ingen ekstern disk valgt."; break ;;
    ''|*[!0-9]*) echo "Skriv et tall."; continue ;;
  esac
  if [ "$VALG" -gt "${#DISKER[@]}" ]; then echo "Det tallet står ikke i lista."; continue; fi
  EKSTERN_DISK="${DISKER[$(( VALG - 1 ))]}"
  if mkdir -p "$VPB_VOLUMER/$EKSTERN_DISK/$VPB_MAPPENAVN" 2>/dev/null \
     && touch "$VPB_VOLUMER/$EKSTERN_DISK/$VPB_MAPPENAVN/.skrivetest" 2>/dev/null; then
    rm -f "$VPB_VOLUMER/$EKSTERN_DISK/$VPB_MAPPENAVN/.skrivetest"
    echo "Valgt: $EKSTERN_DISK. Kopiene legges i mappa $VPB_MAPPENAVN på disken."
    break
  fi
  echo "Jeg får ikke lov til å skrive til $EKSTERN_DISK. Det kan være en ren"
  echo "Time Machine-disk eller en skrivebeskyttet disk. Velg en annen, eller 0."
done

# ── 6. Installer og ta første kopi ────────────────────────────────────────────
strek
echo "Steg 6 av 6: Installerer og tar første kopi"

mkdir -p "$VPB_KONFIG_MAPPE" "$VPB_BIN" "$HOME/Library/LaunchAgents" "$(dirname "$VPB_LOGG")"
chmod 700 "$VPB_KONFIG_MAPPE" "$VPB_BIN"
{
  echo "# Varmeplan-backup. Ingen hemmeligheter her, de ligger i nøkkelringen."
  echo "SUPABASE_URL=$SUPABASE_URL"
  echo "EKSTERN_DISK=$EKSTERN_DISK"
} >"$VPB_KONFIG_FIL"

# Skriptene kopieres ut av repoet, slik at kopien går selv om repoet står på en
# annen gren eller flyttes. Kjør installer.sh på nytt for å oppdatere dem.
for f in felles.sh ta-kopi.sh GJENOPPRETTING.md last-opp-filer.sh hent-prosjekt.sh; do
  cp "$HER/$f" "$VPB_BIN/$f" || stopp "Fikk ikke kopiert $f til $VPB_BIN"
done
chmod 700 "$VPB_BIN"/*.sh

cat >"$VPB_PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$VPB_TJENESTE</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>$VPB_BIN/ta-kopi.sh</string>
    <string>--planlagt</string>
  </array>
  <!-- Spør hver kveld kl. 21:00 og ved innlogging. ta-kopi.sh tar bare kopi når
       det ikke finnes en vellykket kopi etter siste søndag kl. 21:00. -->
  <key>StartCalendarInterval</key>
  <dict><key>Hour</key><integer>21</integer><key>Minute</key><integer>0</integer></dict>
  <key>RunAtLoad</key><true/>
  <key>ProcessType</key><string>Background</string>
  <key>StandardOutPath</key><string>$HOME/Library/Logs/varmeplan-backup.launchd.log</string>
  <key>StandardErrorPath</key><string>$HOME/Library/Logs/varmeplan-backup.launchd.log</string>
</dict>
</plist>
PLIST
plutil -lint "$VPB_PLIST" >/dev/null || stopp "Oppsettsfila $VPB_PLIST ble ikke gyldig."

BRUKER_ID=$(id -u)
LINJER_FOR=0
if [ -f "$VPB_LOGG" ]; then LINJER_FOR=$(wc -l <"$VPB_LOGG" | tr -d ' '); fi

launchctl bootout "gui/$BRUKER_ID/$VPB_TJENESTE" >/dev/null 2>&1 || true
sleep 1
rmdir "$VPB_LAAS" 2>/dev/null || true
touch "$VPB_KJOR_NA"                       # ber ta-kopi.sh om å ta kopi nå, uansett ukedag
if ! launchctl bootstrap "gui/$BRUKER_ID" "$VPB_PLIST" 2>/dev/null; then
  launchctl load -w "$VPB_PLIST" || stopp "Fikk ikke slått på den automatiske kopien (launchctl)."
fi
echo "Automatisk kopi er slått på: hver søndag kl. 21:00."
echo
echo "Tar første kopi nå. Det kan ta noen minutter."
echo "Hvis macOS spør om bash kan få tilgang til iCloud Drive eller til en"
echo "ekstern disk: trykk Tillat. Ellers får ikke kopien lagt seg der."
echo

# Følg loggen til kopien er ferdig (eller har feilet). Maks 60 minutter.
RESULTAT=""
VIST=$LINJER_FOR
SEK=0
while [ "$SEK" -lt 3600 ]; do
  sleep 2; SEK=$(( SEK + 2 ))
  if [ -f "$VPB_LOGG" ]; then
    NA=$(wc -l <"$VPB_LOGG" | tr -d ' ')
    if [ "$NA" -gt "$VIST" ]; then
      NYE=$(tail -n +"$(( VIST + 1 ))" "$VPB_LOGG")
      printf '%s\n' "$NYE" | sed 's/^/   /'
      VIST=$NA
      case "$NYE" in
        *" FERDIG. "*) RESULTAT="ok"; break ;;
        *" FEILET under"*) RESULTAT="feil"; break ;;
      esac
    fi
  fi
  if [ "$SEK" -eq 20 ] && [ "$VIST" -eq "$LINJER_FOR" ]; then
    # launchd startet den ikke av seg selv – be om det uttrykkelig
    touch "$VPB_KJOR_NA"
    launchctl kickstart "gui/$BRUKER_ID/$VPB_TJENESTE" >/dev/null 2>&1 || true
  fi
done

strek
if [ "$RESULTAT" = "ok" ]; then
  echo "FØRSTE KOPI ER TATT OG KONTROLLERT."
  echo
  echo "Den ligger her:"
  echo "   $VPB_ICLOUD"
  if [ -n "$EKSTERN_DISK" ]; then echo "   $VPB_VOLUMER/$EKSTERN_DISK/$VPB_MAPPENAVN"; fi
  echo "I Finder: iCloud Drive, mappa Varmeplan-backup."
  open "$VPB_ICLOUD" >/dev/null 2>&1 || true
elif [ "$RESULTAT" = "feil" ]; then
  echo "FØRSTE KOPI FEILET. Linjene over forteller hvorfor."
  echo "Hele loggen: $VPB_LOGG"
  echo "Den automatiske kopien er likevel slått på, og prøver igjen hver kveld"
  echo "kl. 21:00 til den lykkes. Rett feilen og kjør dette skriptet på nytt."
else
  echo "Kopien ble ikke ferdig mens jeg ventet. Se loggen: $VPB_LOGG"
fi

echo
echo "Senere kan du når som helst:"
echo "   se loggen:        open $VPB_LOGG"
echo "   ta en kopi nå:    bash $VPB_BIN/ta-kopi.sh"
echo "   lese veiledning:  open $HER/GJENOPPRETTING.md"
echo "   fjerne alt:       bash $HER/avinstaller.sh"
echo
echo "============================================================"
echo "Skriv ned krypteringspassordet et trygt sted utenfor Macen."
echo "Uten det kan ingen åpne kopiene – heller ikke du."
echo "============================================================"
echo
if [ "$RESULTAT" = "ok" ]; then exit 0; fi
exit 1
