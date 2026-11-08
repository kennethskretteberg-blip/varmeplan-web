# 219 · Spørsmål

Hvert spørsmål har mitt midlertidige valg. Det er bygget slik til du sier noe annet.

1. **Hvordan skal L-formen få møne?** Dette er det store spørsmålet. Mønelinje lages i dag bare av rektangel-forslaget, så huset ditt i Steinliveien har ingen. Tre veier:
   - **Et verktøy for å tegne møner i 2D** (205 spm. 3). Da er 2D fortsatt fasiten, og motoren er allerede klar: den reiser taket fra de linjene som ligger lagret, når endene treffer omrisset. Møner som slutter inne på taket krever også graten eller kilerenna fram til hjørnet.
   - **Automatisk forslag til møner** for L-form, som du bekrefter.
   - **La det stå** som lokk ved gesimsen.

   Mitt valg nå: lokk og en tydelig advarsel. Jeg anbefaler verktøyet. Det er det eneste som holder 2D som fasit for hus som ditt.

2. **Parapethøyde og sluk.** Prompten ber om parapet som reises, men høyden finnes ikke i `S.tak`, og prompten sier også at tall som mangler ikke skal regnes ut. Jeg har brukt en ren visningskonstant, 0,30 m, som ikke går inn i noe mål. Det samme gjelder slukets størrelse (Ø0,20 × 0,12 m). Skal parapet ha et eget felt? Mitt valg: konstant til du sier noe annet.

3. **Er omrisset veggen eller takkanten?** Prompten sier at FKB registrerer takkanten. `docs/210/SPØRSMÅL.md` spm. 2 sier at et FKB-omriss som regel er veggen, og at det er DOM1-omriss som er takkanten. Begge kan ikke stemme. Jeg har gjort som prompten: veggene står rett under omrisset, uten utstikk. Hvilket er riktig?

4. **Renna på omrisset eller 0,16 m ut?** Tegningen i 2D og dataene har renna på omrisslinja. Snittet fra 210 setter rennesenteret 0,16 m ut. Tallet ligger ikke i `S.tak`, så 3D følger dataene, og halve renna står inne i veggen. Skal 0,16 m bli et felt per rennestrekk, eller en felles verdi 3D også kan lese? Mitt valg: følge dataene.

5. **Nedløp ført under bakken når lengden ikke stemmer med takfoten.** Snittet i 2D sier da at takfoten står der lengden sier, og at røret går til bakken. 3D starter ved renna og går nedløpets lengde ned, og advarer om at skjøten ikke ligger på terrenget. De er bare uenige når dataene allerede er selvmotsigende, og da skal det synes. Greit at 3D viser dette som feil?

6. **Skal kabelen i gradrenner, varmefelt og snøfangerfelt tegnes som tråder?** I dag tegnes flatene, og kabelmeterne står i listen som «fra data, ikke tegnet». Tråder krever et utlegg 2D ikke har. Mitt valg: ikke tegne dem.

7. **Mønehøyden i filmens bygg** er satt til 13 m for at taket skal kunne reises. Filmen oppgir bare 10 m til takfoten. Tallet påvirker ikke kabelmeterne. Kjenner du den riktige høyden?
