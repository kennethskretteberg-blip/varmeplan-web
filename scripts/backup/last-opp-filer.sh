#!/bin/bash
# 229 · Laster filene i en sikkerhetskopi (mappa storage/) opp til et Supabase-prosjekt.
# Brukes bare ved full gjenoppretting til et NYTT prosjekt. Se GJENOPPRETTING.md, del D.
#
#     bash "/Volumes/Varmeplan-backup ÅÅÅÅ-MM-DD/last-opp-filer.sh"
#
# Spør om adressen til det nye prosjektet og service_role-nøkkelen der (vises ikke).
# Lager bøttene som i kopien (offentlig/privat som før) og laster opp alle filene.
# Filer som finnes fra før, skrives over.

set -uo pipefail
export PATH="/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin:/usr/local/bin"
HER="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=felles.sh
. "$HER/felles.sh"

KILDE="${1:-$HER}"
[ -d "$KILDE/storage" ] && [ -f "$KILDE/storage-buckets.json" ] || {
  echo "Finner ikke storage/ og storage-buckets.json i $KILDE"
  echo "Åpne kopien (.dmg) først, og kjør skriptet som ligger inne i den."
  exit 1
}

if [ -n "${VPB_TEST_OPPLAST_URL:-}" ]; then
  NY_URL="$VPB_TEST_OPPLAST_URL"; VPB_API_NOKKEL="${VPB_TEST_API_NOKKEL:-}"
else
  echo
  echo "LASTE OPP FILENE TIL ET SUPABASE-PROSJEKT"
  echo
  printf 'Adressen til prosjektet (https://....supabase.co): '
  IFS= read -r NY_URL
  les_skjult "Lim inn service_role-nøkkelen til DETTE prosjektet og trykk Enter: "
  VPB_API_NOKKEL="$SKJULT"
  echo
  echo "Filene lastes opp til: $NY_URL"
  spor_ja_nei "Er det riktig prosjekt?" || { echo "Avbrutt."; exit 1; }
fi
NY_URL="${NY_URL%/}"

OK=0; FEIL=0
while IFS=$'\t' read -r botte offentlig; do
  [ -n "$botte" ] || continue
  [ -d "$KILDE/storage/$botte" ] || continue
  benc=$(jq -rn --arg s "$botte" '$s | @uri')
  # Lag bøtta. Finnes den fra før, svarer Supabase med en feil vi kan overse.
  jq -n --arg b "$botte" --argjson p "$offentlig" '{id: $b, name: $b, public: $p}' \
    | api_curl -o /dev/null -X POST -H 'Content-Type: application/json' -d @- "$NY_URL/storage/v1/bucket" || true
  echo "Bøtte $botte:"
  while IFS= read -r fil; do
    sti="${fil#"$KILDE/storage/$botte/"}"
    enc=$(jq -rn --arg p "$sti" '$p | split("/") | map(@uri) | join("/")')
    type=$(file -b --mime-type "$fil" 2>/dev/null)
    [ -n "$type" ] || type="application/octet-stream"
    if api_curl -f -o /dev/null -X POST -H "Content-Type: $type" -H 'x-upsert: true' \
         --data-binary @"$fil" "$NY_URL/storage/v1/object/$benc/$enc" 2>/dev/null; then
      OK=$(( OK + 1 ))
    else
      FEIL=$(( FEIL + 1 )); echo "   FEILET: $sti"
    fi
  done < <(find "$KILDE/storage/$botte" -type f)
done < <(jq -r '.[] | [.id, (.public // false)] | @tsv' "$KILDE/storage-buckets.json")

echo
echo "Lastet opp $OK filer. $FEIL feilet."
[ "$FEIL" -eq 0 ]
