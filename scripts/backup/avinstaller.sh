#!/bin/bash
# 229 · Slår av den automatiske sikkerhetskopien av Varmeplan.
#
#     bash ~/Code/varmeplan-web/scripts/backup/avinstaller.sh
#
# Fjerner LaunchAgent no.varmeplan.backup og (hvis du svarer ja) de tre nøklene i
# nøkkelringen. Kopiene som alt er tatt, blir liggende urørt.

set -uo pipefail
HER="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=felles.sh
. "$HER/felles.sh"

echo
echo "AVINSTALLERE SIKKERHETSKOPI AV VARMEPLAN"
echo
echo "Dette slår av den automatiske kopien hver søndag."
echo "Kopiene som alt er tatt, blir liggende:"
echo "   $VPB_ICLOUD"
echo
if ! spor_ja_nei "Vil du slå av den automatiske kopien?"; then
  echo "Ingenting er endret."
  exit 0
fi

launchctl bootout "gui/$(id -u)/$VPB_TJENESTE" >/dev/null 2>&1 \
  || launchctl unload -w "$VPB_PLIST" >/dev/null 2>&1 || true
rm -f "$VPB_PLIST"
rm -rf "$VPB_BIN"
rm -f "$VPB_KJOR_NA" "$VPB_SISTE_OK"
rmdir "$VPB_LAAS" 2>/dev/null || true
echo "Den automatiske kopien er slått av."

echo
echo "I nøkkelringen ligger tilkoblingsstrengen, service_role-nøkkelen og"
echo "krypteringspassordet. Fjerner du dem, må du lime dem inn på nytt hvis du"
echo "setter opp kopien igjen."
echo
echo "VIKTIG: Krypteringspassordet trengs for å åpne kopiene du har."
echo "Fjern det bare hvis du har skrevet det ned et annet sted."
echo
if spor_ja_nei "Vil du fjerne de tre nøklene fra nøkkelringen?"; then
  for k in "$VPB_KONTO_DB" "$VPB_KONTO_API" "$VPB_KONTO_PASS"; do
    if nokkel_slett "$k"; then echo "   fjernet: $k"; else echo "   fantes ikke: $k"; fi
  done
  rm -f "$VPB_KONFIG_FIL"
  rmdir "$VPB_KONFIG_MAPPE" 2>/dev/null || true
else
  echo "Nøklene ligger fortsatt i nøkkelringen (søk etter Varmeplan-backup i Nøkkelringtilgang)."
fi

echo
echo "Ferdig. Kopiene og loggen ($VPB_LOGG) er ikke rørt."
