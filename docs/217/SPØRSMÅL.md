# 217 · Spørsmål til Kenneth

Hvert spørsmål har mitt midlertidige valg. Det står slik til du sier noe annet.

1. **Prosjekter som alt er lagret kan inneholde en annen kundes adresse.** Før 217 skrev «Opprett prosjekt» forrige
   prosjekts `S.geo` inn i det nye prosjektets JSON (målt, se rapporten). 217 hindrer nye tilfeller, men rydder ikke i det
   som ligger i Supabase. Dataene vises ikke uten at etasjen har kart, men de følger prosjektet. Jeg har ikke innlogging
   og vet ikke hvor mange det gjelder. Denne spørringen kun leser, og er **ikke kjørt**:

   ```sql
   select p.id, k as etasje, p.data->'geo'->k->>'address' as adresse
   from romtegner_projects p, jsonb_object_keys(coalesce(p.data->'geo', '{}'::jsonb)) k
   where not (coalesce(p.data->'bgs', '{}'::jsonb) ? k)
     and not (coalesce(p.data->'bgRefs', '{}'::jsonb) ? k);
   ```

   Treffene er kandidater, ikke bevis: et prosjekt der kartet ble fjernet, kan også gi treff. **Valgt nå:** ingen opprydding.
   Vil du ha en egen prompt for det?

2. **Kommentaren ved `_takAddrFieldHtml` er nå feil.** Den sier «S.geo nullstilles ikke med prosjektet, kartet gjør det».
   Prompten sier at ingenting annet skal endres, så den står. Koden er riktig uansett. **Valgt nå:** rør den neste gang
   noen er innom feltet. Det samme gjelder `S.geo = {}` i `nyTak` i `_takRegressionTest216`, som nå er overflødig.

3. **`STATUS.md`: fire ting utenfor listen din.** Prompten nevner 194, 195, 196, 199, 201 og 204–216. Forrige status hadde
   også `docs/200`, `docs/203`, mobilappen (198 spm 9) og 197. Ingen rapport sier at de er ferdige, så de står under
   «Sto også i forrige status». **Valgt nå:** behold dem. Skal de bort?

4. **Jeg fant ingen `000-KJØR-MEG.md` for serie 204–216.** Den nærmeste er `docs/tak-modul/prompter/000-KJØR-MEG.md`,
   som gjelder 001–007. Jeg fulgte de generelle reglene der (STEG 0, tester før commit, spørsmål skrives). Ligger det en
   egen fil for serien et sted jeg ikke ser?

5. **Endringsloggen mangler 216.** `docs/endringslogg.md` har 215 øverst. Jeg la til 217, men skrev ikke inn 216 i
   ettertid, fordi det ikke hørte til denne prompten. Skal den fylles inn?
