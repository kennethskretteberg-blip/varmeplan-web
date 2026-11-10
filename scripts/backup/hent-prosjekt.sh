#!/bin/bash
# 229 · Henter ETT prosjekt ut av en sikkerhetskopi. Se GJENOPPRETTING.md, del C.
# Trenger ingen database – leser rett fra dumpen i den åpnede kopien.
#
#   Liste over alle prosjektene i kopien:
#     bash "/Volumes/Varmeplan-backup ÅÅÅÅ-MM-DD/hent-prosjekt.sh"
#   Hente ett (prosjektnummer eller id fra lista):
#     bash "/Volumes/Varmeplan-backup ÅÅÅÅ-MM-DD/hent-prosjekt.sh" P0402
#
# Lager tre filer på Skrivebordet (eller i mappa gitt som andre argument):
#   prosjekt-<nr>.json          innholdet (kolonnen data), til å se på
#   prosjekt-<nr>-oppdater.sql  legger innholdet tilbake i et prosjekt som FINNES
#   prosjekt-<nr>-rad.sql       setter inn hele raden igjen hvis prosjektet er SLETTET

set -uo pipefail
export PATH="/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin:/usr/local/bin"
HER="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=felles.sh
. "$HER/felles.sh"

VALG="${1:-}"
UT="${2:-$HOME/Desktop}"
DUMP="${VPB_DUMP:-$HER/database/varmeplan.dump}"

les_tabellen() {
  if [ -n "${VPB_TEST_COPY_FIL:-}" ]; then cat "$VPB_TEST_COPY_FIL"; return; fi
  [ -f "$DUMP" ] || { echo "Finner ikke $DUMP. Åpne kopien (.dmg) og kjør skriptet som ligger inne i den." >&2; return 1; }
  finn_pg || { echo "Finner ikke pg_restore. Kjør: brew install libpq" >&2; return 1; }
  "$PG_BIN/pg_restore" --data-only -n public -t romtegner_projects -f - "$DUMP"
}

mkdir -p "$UT" || exit 1
les_tabellen | perl -e '
  use strict; use warnings;
  my ($valg, $ut) = @ARGV;
  my (%ix, $hode, $inne, $funnet);
  my %m = (n => "\n", t => "\t", r => "\r", b => "\b", f => "\f", v => "\x0b");
  sub de { my $s = shift; return undef if !defined $s or $s eq "\\N";
           $s =~ s/\\(.)/exists $m{$1} ? $m{$1} : $1/ge; return $s; }
  sub norm { my $s = uc(shift // ""); $s =~ s/^P?0*//; return $s; }
  sub skriv { my ($fil, $tekst) = @_; open(my $fh, ">", $fil) or die "Kan ikke skrive $fil\n";
              print $fh $tekst; close $fh; print "   $fil\n"; }
  while (my $l = <STDIN>) {
    if (!$inne) {
      if ($l =~ /^COPY public\.romtegner_projects \((.*)\) FROM stdin;/) {
        my @k = map { s/"//g; $_ } split /, /, $1;
        @ix{@k} = (0 .. $#k); $hode = $l; $inne = 1;
        die "Tabellen mangler kolonnen id eller data\n" unless exists $ix{id} and exists $ix{data};
        printf "%-8s %-19s %-38s %s\n", "NR", "SIST ENDRET", "ID", "NAVN" if $valg eq "";
      }
      next;
    }
    last if $l =~ /^\\\.$/;
    (my $r = $l) =~ s/\n$//;
    my @f = split /\t/, $r, -1;
    my $id = $f[$ix{id}];
    my $nr = exists $ix{project_no} ? de($f[$ix{project_no}]) : undef;
    if ($valg eq "") {
      my $navn = exists $ix{name} ? de($f[$ix{name}]) : "";
      my $tid = exists $ix{updated_at} ? de($f[$ix{updated_at}]) : "";
      my $slettet = (exists $ix{deleted_at} and defined de($f[$ix{deleted_at}])) ? "  (i papirkurven)" : "";
      printf "%-8s %-19s %-38s %s%s\n", $nr // "-", substr($tid // "", 0, 19), $id, $navn // "", $slettet;
      next;
    }
    next unless $id eq $valg or (defined $nr and norm($nr) eq norm($valg));
    $funnet = 1;
    my $data = de($f[$ix{data}]);
    die "Prosjektet har ikke noe innhold (data er tom)\n" unless defined $data;
    die "Innholdet inneholder merket vpdata – kan ikke lage oppdater-fila\n" if index($data, "\$vpdata\$") >= 0;
    (my $navn = $nr // $id) =~ s/[^A-Za-z0-9_-]/_/g;
    print "Fant prosjektet. Skrev disse filene:\n";
    skriv("$ut/prosjekt-$navn.json", $data . "\n");
    skriv("$ut/prosjekt-$navn-oppdater.sql",
          "update public.romtegner_projects set data = \$vpdata\$" . $data . "\$vpdata\$::jsonb where id = " . chr(39) . $id . chr(39) . ";\n");
    skriv("$ut/prosjekt-$navn-rad.sql", $hode . $l . "\\.\n");
  }
  die "Fant ikke tabellen romtegner_projects i kopien\n" unless $inne;
  die "Fant ikke prosjektet $valg. Kjør uten argument for å se lista.\n" if $valg ne "" and !$funnet;
' "$VALG" "$UT"
