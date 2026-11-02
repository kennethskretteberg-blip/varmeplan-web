# 170-web · Kundebedrifter får kabel, folie og matte innendørs

Løp 168 (demo Cenika), 02.11.2026. Web-repo `main`, ikke pushet. Ingen migrasjon kjørt.

## Kort fortalt

- En kundebedrift (opprettet av Cenika eller godkjent av Cenika) kan prosjektere **innendørs gulvvarme** og
  **hurtig prosjektering**, altså kabel, folie og matte innendørs.
- **Snø, trapp, fryserom og verktøyene effektbehov og frostsikring** vises med en hengelås. Klikk gir en
  liten dialog: «Snøsmelting prosjekteres av Cenika. Send forespørsel, så får du et ferdig prosjekt
  tilbake.» Knappen **«Be Cenika om prosjektering»** åpner en ferdig utfylt e-post (prosjektnavn, adresse,
  lenke).
- **Tak** var alt skjult for alle, og er det fortsatt.
- **Cenika og alle eksisterende orger merker ingenting** (`allowed_modules = null` = alle moduler).
- Cenika endrer modulene per kunde i Kunder-fanen → **«Moduler for kunder»**.

## ⚠ Dette er en grense i grensesnittet, ikke en sikkerhetsgrense

Låsen bestemmer bare hvilke knapper som lar brukeren **starte** noe. En teknisk kyndig bruker kan i teorien
lage et snøprosjekt ved å skrive prosjektdata direkte (for eksempel fra nettleserens konsoll). Det er greit,
fordi modulene ikke beskytter data. De styrer arbeidsflyt: hvem som prosjekterer hva. Derfor er det **ingen
RLS** for dette, med vilje.

Det som faktisk er beskyttet, er hvem som kan **endre** listen. Det går bare gjennom `set_customer_modules`
(security definer). Kundebedriften selv får `NOT_SUPPLIER`, og `organizations` har ingen UPDATE-policy for
medlemmer (i repoet; se løp-SPØRSMÅL 43 om hva som er live).

## STEG 0

**1. Steder der en modul eller produkttype velges** (linjer etter endringen):

| # | Sted | Funksjon (linje i `index.html`) |
|---|---|---|
| 1 | «Hva ønsker du å prosjektere?» | `showModuleScreen` :74570, `_renderModuleScreen` :74590, klikk → `addPart` :74626 |
| 2 | Dashbord, Kalkulasjon/Prosjektering | `_renderDashModules` :97231 (`_DASH_CALC_CARDS`, `_DASH_PROJ_CARDS`) |
| 3 | Dashbord, Verktøy | `_renderDashTools` :97265 (`_DASH_TOOL_CARDS`: snowcalc, frost) |
| 4 | Snarvei uten lagring | `_quickStartModule` :97384, `_quickStartFromDrawing` :97377 |
| 5 | Verktøy-modalene | `_openSnowCalc` :3725, `_openFrostModule` :3967 |
| 6 | Sidepanelets modul-nav | `renderModuleNav` :79244 → `_navToModule` :79287 → `addPart`; «+ Del» → `showModuleScreen` |
| 7 | Tom hurtigliste | `_emptyQuickList` :77891 → `addPart('list')` |
| 8 | Nytt rom (alle tegneverktøy, hurtigtaster R/M/P/L/W) | `createRoom` :61525 |
| 9 | Høyreklikk «Dupliser rom, utendørs» (sidepanel og lerret) | `dupeRoom` :64166 |
| 10 | Høyreklikk «Varmetype: Innendørs/Utendørs» | `setRoomModuleType` :63962 (`_varmetypeCtxItems`) |
| 11 | Produktpanel per rom | `showUnifiedProductPanel` :8078, `showCablePlacePanel` :24550 |
| 12 | Hurtigprosjektering, Varmetype Innendørs/Utendørs | `_listOnEnv` :75430 (også via ▲▼ `_listStepSelect`), arv i `_listCreateRoomObj` :75290 |
| 13 | Romtype (fryserom) | `setRoomType` :63604 (sidepanel-select + lerretets høyreklikk-grid), `_upcRoomTypeChanged` :8233, `_setCableRoomType` :3458, `_planKortBekreft` :6627 |

Låsen: `_moduleAvailable` :96918, `_moduleAllowed` :96963, `_moduleLockDialog` :97056, test :97169.

Hurtigtast-panelet (`_SHORTCUTS`) har ingen modul-taster. Tegnetastene ender i `createRoom`.
Ikke låst: automatiske importveier som selv setter `roomType` (PDF-romgjennomgang, liste-import), se SPØRSMÅL 51.

**2. Navnene:** strengene i `MODULE_TYPES` (`indoor`, `list`, `stair`, `snow`, `snowcalc`, `frost`, `roof`)
og romtype-id-en `fryserom`. Intet nytt navnesystem. «Fra tegning» (`fromdrawing`) er innendørs.

**3. Mønsteret:** `_isSupplier` (`_userOrg.org_type === 'supplier'`) for knapper i dashbordet, og
`_effectiveOrg()` for superadmin «vis som» (som `_productVisibleToOrg`). Begge er fulgt.

## Hvilke steder spør `_moduleAllowed` nå

`_moduleAllowed(moduleKey, org?)` er den rene regelen (leser `allowed_modules`, `null` = alt, ukjent = false,
superadmin uten «vis som» ser alt). Den kalles **bare** fra `_moduleAvailable(id)` — den eksisterende funksjonen,
som nå også er låsen (boksens punkt 2). Alle 13 stedene over spør `_moduleAvailable` (direkte, eller via de små
hjelperne `_roomTypeLocked(typeId)` og `_roomLockKey(room)`, som selv kaller `_moduleAvailable`).
`_moduleAvailable(id, true)` betyr «finnes modulen i det hele tatt» og avgjør bare om en flis skal vises.
Testen sjekker kildeteksten: hvert inngangspunkt spør porten, og ingen andre leser `allowed_modules`.

Delte prosjekter: en eksisterende snø-del åpnes og vises som før (modul-nav viser «Ute» uten lås når delen finnes).
Det som stoppes, er nye rom og nye utlegg i den.

## Migrasjonen

**Ny fil `supabase-migration-kundemoduler.sql`** (ikke kjørt). Kjøres etter
`supabase-migration-kundesoknad.sql` (169). Stopper med en melding hvis 044 eller 169 mangler.
- `organizations.allowed_modules text[]` (null = alle) og `organizations.contact_email text` — additivt.
- `set_customer_modules(p_org_id uuid, p_modules text[])`, security definer: superadmin (JWT
  `app_metadata.is_superadmin`), eller medlem av leverandøren som **opprettet** (`created_by_org`) eller
  **godkjente** (169) kundebedriften. Bare installatør-orger. Ukjente navn → `UNKNOWN_MODULE`. Lista lagres
  uten dubletter i fast rekkefølge.
- `list_customer_modules()` — avkrysningslista (samme utvalg).
- `module_request_contact(p_org_id)` — leverandørens navn og `contact_email` (fallback `print_email`) for
  kundebedriftens egne medlemmer. Leser leverandørens felt via `to_jsonb`, så den tåler at `print_email` mangler.
- Rettigheter: anon ingenting; `_caller_supplier_org` bare internt.
- **Tester som SQL nederst i fila** (ikke kjørt): kunde på seg selv → `NOT_SUPPLIER`; Cenika på egen kunde →
  ok; Cenika på kunde fra annen leverandør → `NOT_ALLOWED`; ny kunde via `create_customer_org` får `{indoor,list}`.

**Endret, ikke kjørt: `supabase-migration-opprett-kundebedrift.sql` (044v2)** legger samme kolonne og setter
`allowed_modules = coalesce(allowed_modules, array['indoor','list'])` i den felles `_activate_customer_org`.
Da får både «Cenika oppretter» og «Cenika godkjenner» lista fra ett sted (169 hadde forberedt dette).

Rekkefølge: 042 → 044v2 → 046 → 047 → 169 → **170**. Etterpå: fyll inn Cenikas adresse
(`update organizations set contact_email = '…' where id = '<CENIKA_ORG>';`).

## Måtte `contact_email` legges til?

**Ja.** Det fantes ingen kontaktadresse for forespørsler på `organizations`, bare `print_email` (adressen som står
på PDF-en). Ny kolonne `contact_email`, med `print_email` som reserve. Kenneth må fylle den inn
(løp-SPØRSMÅL 47).

## «Til 173» (skrevet i `STATUS-MALING.md`)

Appens produktsøk (038) viser **hele** `heating_products`: ingen filter ved nedlasting
(`src/db/repo.ts`:395), ved oppslag (`listCatalogForSearch` :273) eller i søket (`searchCatalog`,
`productSearch.ts`:109). `kindFromCategory` kjenner bare `category_id` 1/2/3 og gjør alt annet til «kabel»
eller «matte», så utendørskabler, plater og frostsikringskabler vises uten merking. 173 bør filtrere på
`category_id in (1,2,3)` og bekrefte med Kenneth at utendørsprodukter ligger i egne kategorier. Appen er ikke endret.

## Tester

- **Ny:** `_moduleAllowedRegressionTest` **39/39**: `null` gir alt, kundens liste gir bare `indoor`/`list`,
  ukjent navn gir `false`, «vis som»-org styrer `_moduleAvailable`, tak skjult for alle, fryserom låst,
  e-postteksten, avkrysningslogikken, og kildesjekker for alle inngangspunkter.
- **CDP mot mock:** `docs/168/cdp/t170.mjs` grønn, 0 sidefeil. Utskrift `docs/170/t170-utskrift.txt`, bilder
  `docs/170/t170-*.png`. Dashbord, modulvalg, hurtigprosjektering, romtype, Varmetype, dupliser, delt
  snøprosjekt, superadmin + «vis som», fail-open uten migrasjon, uten kontaktadresse, Cenikas liste.
- **Hele regresjonssettet (57 funksjoner, `docs/168/cdp/rtests.mjs`):** grønt, unntatt rader som feiler
  **likt på HEAD** (målt mot en kopi av HEAD på port 4170): fire `_geo*`-tester kaster (`push` på undefined),
  `_kundeforslagRegressionTest` 270/271 (L/138), `_prosjektlaasRegressionTest` 66/67 (krever innlogging),
  `_stairBuilderMoveRegressionTest`/`_stairZoneRegressionTest` finnes ikke som global, fire mattetester gir 0/0.
  Én ny rød rad underveis (`_kundelenkeRegressionTest` G: «ingen utgående lenke bygges på location.origin») —
  rettet: lenka bruker nå `_PUBLIC_BASE_URL`. 330/330.
- `grep service_role index.html admin.html`: 0 treff.
