# 202 · D — båndinndelingen i PDF-ens sidevisning, alle trapper fra trappetestene

Generert av `docs/202/probe/baand.js` (fanget fra `_generateStairSurfaces` mens testene kjørte; én rad per unik trapp, ført på testen som laget den først). **Ingen kode er endret.**

- **Dagens** = formelen i `_renderStairSidePrintImages`: dybde / (Σ opptrinn på trinnflater + 17), repos teller 0.
- **Kjede** = dybde / `_stairSideTotalHeightCm` (bakken → gulvet over; opptrinnet til gulvet over er med, derfor ingen +17).
- Bånd: forhold > 8 → 3, > 4 → 2, ellers 1. «Avstand» = korteste avstand fra ett av de to forholdene til grensen 4 eller 8.

Testkjøringen med innpakningen: 191 15/15, 192 40/40, hestesko 274/274, regresjon 45/45, sone 106/106, bygger110 59/59, bygger193 31/31, side 25/25, manuelt 42/42.

| # | Test | Retning | Trapp | Repos | Dybde cm | H dagens | H kjede | Forhold dagens | Forhold kjede | Bånd dagens → kjede | Bytter | Avstand til 4/8 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | hestesko | nedenfra | 1×17/24 + R120 | 1 | 144 | 34 | 34 | 4,24 | 4,24 | 2 → 2 | nei | 0,24 |
| 2 | bygger193 | nedenfra | 1×17/30 + R120 | 1 | 150 | 34 | 34 | 4,41 | 4,41 | 2 → 2 | nei | 0,41 |
| 3 | regresjon | nedenfra | 6×17/30 + R140 + R90 | 2 | 410 | 119 | 135 | 3,45 | 3,04 | 1 → 1 | nei | 0,55 |
| 4 | hestesko | nedenfra | hestesko 2 flater | 0 | 116 | 51 | 34 | 2,27 | 3,41 | 1 → 1 | nei | 0,59 |
| 5 | hestesko | nedenfra | hestesko 2 flater | 0 | 116 | 51 | 34 | 2,27 | 3,41 | 1 → 1 | nei | 0,59 |
| 6 | manuelt | nedenfra | R120 + 4×16/32 | 1 | 248 | 81 | 80 | 3,06 | 3,10 | 1 → 1 | nei | 0,90 |
| 7 | bygger110 | nedenfra | 10×17/50 + R140 + 6×16/28 | 1 | 808 | 283 | 299 | 2,86 | 2,70 | 1 → 1 | nei | 1,14 |
| 8 | hestesko | nedenfra | 3×17/24 + R120 | 1 | 192 | 68 | 68 | 2,82 | 2,82 | 1 → 1 | nei | 1,18 |
| 9 | hestesko | nedenfra | 4×17/30 + R120 | 1 | 240 | 85 | 85 | 2,82 | 2,82 | 1 → 1 | nei | 1,18 |
| 10 | regresjon | nedenfra | 4×17/30 + R120 | 1 | 240 | 85 | 85 | 2,82 | 2,82 | 1 → 1 | nei | 1,18 |
| 11 | bygger193 | nedenfra | 4×17/30 + R90 + R90 + 4×17/30 | 2 | 420 | 153 | 187 | 2,75 | 2,25 | 1 → 1 | nei | 1,25 |
| 12 | bygger193 | ovenfra | 4×17/30 + R90 + R90 + 4×17/30 | 2 | 420 | 153 | 187 | 2,75 | 2,25 | 1 → 1 | nei | 1,25 |
| 13 | 191 | nedenfra | 4×17/30 + R90 + R90 + 4×18/30 | 2 | 420 | 157 | 192 | 2,68 | 2,19 | 1 → 1 | nei | 1,32 |
| 14 | bygger110 | nedenfra | R140 + 10×17/30 + R140 + 6×16/28 | 2 | 748 | 283 | 299 | 2,64 | 2,50 | 1 → 1 | nei | 1,36 |
| 15 | bygger110 | nedenfra | 10×17/30 + R140 + 6×16/28 + R140 | 2 | 748 | 283 | 299 | 2,64 | 2,50 | 1 → 1 | nei | 1,36 |
| 16 | bygger110 | ovenfra | R140 + 10×17/30 + R140 + 6×16/28 | 2 | 748 | 283 | 299 | 2,64 | 2,50 | 1 → 1 | nei | 1,36 |
| 17 | bygger110 | ovenfra | 10×17/30 + R140 + 6×16/28 + R140 | 2 | 748 | 283 | 299 | 2,64 | 2,50 | 1 → 1 | nei | 1,36 |
| 18 | bygger110 | nedenfra | 10×17/30 + R140 + R140 + 6×16/28 | 2 | 748 | 283 | 316 | 2,64 | 2,37 | 1 → 1 | nei | 1,36 |
| 19 | bygger193 | nedenfra | 4×18/30 + R90 + R90 + 4×18/30 | 2 | 420 | 161 | 198 | 2,61 | 2,12 | 1 → 1 | nei | 1,39 |
| 20 | bygger193 | nedenfra | 4×18/30 + R90 + R90 + 4×18/30 | 2 | 420 | 161 | 196 | 2,61 | 2,14 | 1 → 1 | nei | 1,39 |
| 21 | hestesko | nedenfra | hestesko 5 flater | 0 | 220 | 102 | 85 | 2,16 | 2,59 | 1 → 1 | nei | 1,41 |
| 22 | hestesko | nedenfra | hestesko 5 flater | 0 | 220 | 102 | 85 | 2,16 | 2,59 | 1 → 1 | nei | 1,41 |
| 23 | hestesko | nedenfra | hestesko 5 flater | 0 | 215 | 102 | 85 | 2,11 | 2,53 | 1 → 1 | nei | 1,47 |
| 24 | hestesko | nedenfra | hestesko 5 flater | 0 | 254 | 102 | 102 | 2,49 | 2,49 | 1 → 1 | nei | 1,51 |
| 25 | hestesko | nedenfra | hestesko 3 flater | 0 | 162 | 68 | 68 | 2,38 | 2,38 | 1 → 1 | nei | 1,62 |
| 26 | hestesko | nedenfra | hestesko 3 flater | 0 | 162 | 68 | 68 | 2,38 | 2,38 | 1 → 1 | nei | 1,62 |
| 27 | hestesko | nedenfra | hestesko 3 flater | 0 | 162 | 68 | 68 | 2,38 | 2,38 | 1 → 1 | nei | 1,62 |
| 28 | hestesko | nedenfra | hestesko 3 flater | 0 | 162 | 68 | 68 | 2,38 | 2,38 | 1 → 1 | nei | 1,62 |
| 29 | hestesko | nedenfra | hestesko 3 flater | 0 | 162 | 68 | 68 | 2,38 | 2,38 | 1 → 1 | nei | 1,62 |
| 30 | 192 | nedenfra | 4×17/30 + R120 + 4×17/30 | 1 | 360 | 153 | 170 | 2,35 | 2,12 | 1 → 1 | nei | 1,65 |
| 31 | regresjon | nedenfra | 10×17/30 + R140 | 1 | 440 | 187 | 187 | 2,35 | 2,35 | 1 → 1 | nei | 1,65 |
| 32 | 191 | nedenfra | R90 + 6×17/30 | 1 | 270 | 119 | 119 | 2,27 | 2,27 | 1 → 1 | nei | 1,73 |
| 33 | 191 | nedenfra | 6×17/30 + R90 | 1 | 270 | 119 | 119 | 2,27 | 2,27 | 1 → 1 | nei | 1,73 |
| 34 | hestesko | nedenfra | hestesko 2 flater | 0 | 116 | 51 | 51 | 2,27 | 2,27 | 1 → 1 | nei | 1,73 |
| 35 | hestesko | nedenfra | hestesko 2 flater | 0 | 116 | 51 | 51 | 2,27 | 2,27 | 1 → 1 | nei | 1,73 |
| 36 | hestesko | nedenfra | hestesko 2 flater | 0 | 116 | 51 | 51 | 2,27 | 2,27 | 1 → 1 | nei | 1,73 |
| 37 | hestesko | nedenfra | hestesko 2 flater | 0 | 116 | 51 | 51 | 2,27 | 2,27 | 1 → 1 | nei | 1,73 |
| 38 | hestesko | nedenfra | hestesko 2 flater | 0 | 116 | 51 | 51 | 2,27 | 2,27 | 1 → 1 | nei | 1,73 |
| 39 | hestesko | nedenfra | hestesko 2 flater | 0 | 116 | 51 | 51 | 2,27 | 2,27 | 1 → 1 | nei | 1,73 |
| 40 | hestesko | nedenfra | hestesko 2 flater | 0 | 116 | 51 | 51 | 2,27 | 2,27 | 1 → 1 | nei | 1,73 |
| 41 | hestesko | nedenfra | hestesko 2 flater | 0 | 116 | 51 | 51 | 2,27 | 2,27 | 1 → 1 | nei | 1,73 |
| 42 | bygger193 | ovenfra | R90 + 6×17/30 | 1 | 270 | 119 | 119 | 2,27 | 2,27 | 1 → 1 | nei | 1,73 |
| 43 | bygger193 | ovenfra | 6×17/30 + R90 | 1 | 270 | 119 | 119 | 2,27 | 2,27 | 1 → 1 | nei | 1,73 |
| 44 | hestesko | nedenfra | hestesko 11 flater | 0 | 460 | 204 | 204 | 2,25 | 2,25 | 1 → 1 | nei | 1,75 |
| 45 | hestesko | nedenfra | hestesko 11 flater | 0 | 460 | 204 | 204 | 2,25 | 2,25 | 1 → 1 | nei | 1,75 |
| 46 | hestesko | nedenfra | hestesko 11 flater | 0 | 460 | 204 | 204 | 2,25 | 2,25 | 1 → 1 | nei | 1,75 |
| 47 | sone | nedenfra | 4×17/30 + R120 + 6×17/30 | 1 | 420 | 187 | 204 | 2,25 | 2,06 | 1 → 1 | nei | 1,75 |
| 48 | 191 | nedenfra | 4×17/30 + R90 + 4×17/30 | 1 | 330 | 153 | 170 | 2,16 | 1,94 | 1 → 1 | nei | 1,84 |
| 49 | hestesko | nedenfra | hestesko 5 flater | 0 | 220 | 102 | 102 | 2,16 | 2,16 | 1 → 1 | nei | 1,84 |
| 50 | hestesko | nedenfra | hestesko 5 flater | 0 | 220 | 102 | 102 | 2,16 | 2,16 | 1 → 1 | nei | 1,84 |
| 51 | hestesko | nedenfra | hestesko 5 flater | 0 | 220 | 102 | 102 | 2,16 | 2,16 | 1 → 1 | nei | 1,84 |
| 52 | hestesko | nedenfra | hestesko 5 flater | 0 | 220 | 102 | 102 | 2,16 | 2,16 | 1 → 1 | nei | 1,84 |
| 53 | hestesko | nedenfra | hestesko 5 flater | 0 | 220 | 102 | 102 | 2,16 | 2,16 | 1 → 1 | nei | 1,84 |
| 54 | hestesko | nedenfra | hestesko 5 flater | 0 | 220 | 102 | 102 | 2,16 | 2,16 | 1 → 1 | nei | 1,84 |
| 55 | bygger193 | ovenfra | 4×17/30 + R90 + 4×17/30 | 1 | 330 | 153 | 170 | 2,16 | 1,94 | 1 → 1 | nei | 1,84 |
| 56 | bygger110 | nedenfra | 10×17/30 + R140 + 6×16/28 | 1 | 608 | 283 | 299 | 2,15 | 2,03 | 1 → 1 | nei | 1,85 |
| 57 | bygger110 | ovenfra | 10×17/30 + R140 + 6×16/28 | 1 | 608 | 283 | 299 | 2,15 | 2,03 | 1 → 1 | nei | 1,85 |
| 58 | hestesko | nedenfra | hestesko 5 flater | 0 | 182 | 102 | 85 | 1,78 | 2,14 | 1 → 1 | nei | 1,86 |
| 59 | hestesko | nedenfra | hestesko 5 flater | 0 | 182 | 102 | 85 | 1,78 | 2,14 | 1 → 1 | nei | 1,86 |
| 60 | hestesko | nedenfra | hestesko 5 flater | 0 | 215 | 102 | 102 | 2,11 | 2,11 | 1 → 1 | nei | 1,89 |
| 61 | hestesko | nedenfra | hestesko 5 flater | 0 | 215 | 102 | 102 | 2,11 | 2,11 | 1 → 1 | nei | 1,89 |
| 62 | 191 | nedenfra | 4×17/30 + R90 + 4×18/30 | 1 | 330 | 157 | 175 | 2,10 | 1,89 | 1 → 1 | nei | 1,90 |
| 63 | bygger193 | ovenfra | 4×17/30 + R90 + 4×18/30 | 1 | 330 | 157 | 175 | 2,10 | 1,89 | 1 → 1 | nei | 1,90 |
| 64 | hestesko | nedenfra | hestesko 11 flater | 0 | 415 | 204 | 204 | 2,03 | 2,03 | 1 → 1 | nei | 1,97 |
| 65 | hestesko | nedenfra | hestesko 11 flater | 0 | 410 | 204 | 204 | 2,01 | 2,01 | 1 → 1 | nei | 1,99 |
| 66 | hestesko | nedenfra | hestesko 11 flater | 0 | 410 | 204 | 204 | 2,01 | 2,01 | 1 → 1 | nei | 1,99 |
| 67 | hestesko | nedenfra | hestesko 2 flater | 0 | 101 | 51 | 51 | 1,98 | 1,98 | 1 → 1 | nei | 2,02 |
| 68 | hestesko | nedenfra | hestesko 2 flater | 0 | 101 | 51 | 51 | 1,98 | 1,98 | 1 → 1 | nei | 2,02 |
| 69 | hestesko | nedenfra | hestesko 2 flater | 0 | 101 | 51 | 51 | 1,98 | 1,98 | 1 → 1 | nei | 2,02 |
| 70 | hestesko | nedenfra | hestesko 2 flater | 0 | 101 | 51 | 51 | 1,98 | 1,98 | 1 → 1 | nei | 2,02 |
| 71 | hestesko | nedenfra | hestesko 2 flater | 0 | 101 | 51 | 51 | 1,98 | 1,98 | 1 → 1 | nei | 2,02 |
| 72 | regresjon | nedenfra | 40×16/32 | 0 | 1280 | 657 | 656 | 1,95 | 1,95 | 1 → 1 | nei | 2,05 |
| 73 | regresjon | nedenfra | 24×16/32 | 0 | 768 | 401 | 400 | 1,92 | 1,92 | 1 → 1 | nei | 2,08 |
| 74 | manuelt | nedenfra | 16×16/32 | 0 | 512 | 273 | 272 | 1,88 | 1,88 | 1 → 1 | nei | 2,12 |
| 75 | hestesko | nedenfra | hestesko 11 flater | 0 | 350 | 204 | 187 | 1,72 | 1,87 | 1 → 1 | nei | 2,13 |
| 76 | hestesko | nedenfra | hestesko 11 flater | 0 | 350 | 204 | 187 | 1,72 | 1,87 | 1 → 1 | nei | 2,13 |
| 77 | hestesko | nedenfra | hestesko 4 flater | 0 | 156 | 85 | 85 | 1,84 | 1,84 | 1 → 1 | nei | 2,16 |
| 78 | regresjon | nedenfra | 10×16/32 | 0 | 320 | 177 | 176 | 1,81 | 1,82 | 1 → 1 | nei | 2,18 |
| 79 | hestesko | nedenfra | hestesko 21 flater | 0 | 678 | 374 | 374 | 1,81 | 1,81 | 1 → 1 | nei | 2,19 |
| 80 | hestesko | nedenfra | hestesko 21 flater | 0 | 678 | 374 | 374 | 1,81 | 1,81 | 1 → 1 | nei | 2,19 |
| 81 | hestesko | nedenfra | hestesko 11 flater | 0 | 365 | 204 | 204 | 1,79 | 1,79 | 1 → 1 | nei | 2,21 |
| 82 | hestesko | nedenfra | hestesko 11 flater | 0 | 363 | 204 | 204 | 1,78 | 1,78 | 1 → 1 | nei | 2,22 |
| 83 | hestesko | nedenfra | hestesko 11 flater | 0 | 364 | 204 | 204 | 1,78 | 1,78 | 1 → 1 | nei | 2,22 |
| 84 | hestesko | nedenfra | hestesko 5 flater | 0 | 182 | 102 | 102 | 1,78 | 1,78 | 1 → 1 | nei | 2,22 |
| 85 | hestesko | nedenfra | hestesko 5 flater | 0 | 182 | 102 | 102 | 1,78 | 1,78 | 1 → 1 | nei | 2,22 |
| 86 | regresjon | nedenfra | 8×16/32 | 0 | 256 | 145 | 144 | 1,77 | 1,78 | 1 → 1 | nei | 2,22 |
| 87 | hestesko | nedenfra | hestesko 11 flater | 0 | 361 | 204 | 204 | 1,77 | 1,77 | 1 → 1 | nei | 2,23 |
| 88 | hestesko | nedenfra | hestesko 11 flater | 0 | 362 | 204 | 204 | 1,77 | 1,77 | 1 → 1 | nei | 2,23 |
| 89 | hestesko | nedenfra | hestesko 11 flater | 0 | 360 | 204 | 204 | 1,76 | 1,76 | 1 → 1 | nei | 2,24 |
| 90 | hestesko | nedenfra | hestesko 11 flater | 0 | 360 | 204 | 204 | 1,76 | 1,76 | 1 → 1 | nei | 2,24 |
| 91 | hestesko | nedenfra | hestesko 11 flater | 0 | 360 | 204 | 204 | 1,76 | 1,76 | 1 → 1 | nei | 2,24 |
| 92 | hestesko | nedenfra | hestesko 11 flater | 0 | 359 | 204 | 204 | 1,76 | 1,76 | 1 → 1 | nei | 2,24 |
| 93 | hestesko | nedenfra | hestesko 11 flater | 0 | 359 | 204 | 204 | 1,76 | 1,76 | 1 → 1 | nei | 2,24 |
| 94 | hestesko | nedenfra | hestesko 11 flater | 0 | 358 | 204 | 204 | 1,75 | 1,75 | 1 → 1 | nei | 2,25 |
| 95 | hestesko | nedenfra | hestesko 11 flater | 0 | 350 | 204 | 204 | 1,72 | 1,72 | 1 → 1 | nei | 2,28 |
| 96 | hestesko | nedenfra | hestesko 11 flater | 0 | 350 | 204 | 204 | 1,72 | 1,72 | 1 → 1 | nei | 2,28 |
| 97 | hestesko | nedenfra | hestesko 11 flater | 0 | 350 | 204 | 204 | 1,72 | 1,72 | 1 → 1 | nei | 2,28 |
| 98 | hestesko | nedenfra | hestesko 11 flater | 0 | 348 | 204 | 204 | 1,71 | 1,71 | 1 → 1 | nei | 2,29 |
| 99 | hestesko | nedenfra | hestesko 9 flater | 0 | 291 | 170 | 170 | 1,71 | 1,71 | 1 → 1 | nei | 2,29 |
| 100 | hestesko | nedenfra | 30×17/30 | 0 | 900 | 527 | 527 | 1,71 | 1,71 | 1 → 1 | nei | 2,29 |
| 101 | regresjon | nedenfra | 6×16/32 | 0 | 192 | 113 | 112 | 1,70 | 1,71 | 1 → 1 | nei | 2,29 |
| 102 | hestesko | nedenfra | hestesko 11 flater | 0 | 346 | 204 | 204 | 1,70 | 1,70 | 1 → 1 | nei | 2,30 |
| 103 | hestesko | nedenfra | hestesko 11 flater | 0 | 347 | 204 | 204 | 1,70 | 1,70 | 1 → 1 | nei | 2,30 |
| 104 | hestesko | nedenfra | hestesko 11 flater | 0 | 347 | 204 | 204 | 1,70 | 1,70 | 1 → 1 | nei | 2,30 |
| 105 | hestesko | nedenfra | hestesko 11 flater | 0 | 347 | 204 | 204 | 1,70 | 1,70 | 1 → 1 | nei | 2,30 |
| 106 | hestesko | nedenfra | hestesko 11 flater | 0 | 346 | 204 | 204 | 1,70 | 1,70 | 1 → 1 | nei | 2,30 |
| 107 | hestesko | nedenfra | hestesko 11 flater | 0 | 344 | 204 | 204 | 1,69 | 1,69 | 1 → 1 | nei | 2,31 |
| 108 | hestesko | nedenfra | hestesko 11 flater | 0 | 345 | 204 | 204 | 1,69 | 1,69 | 1 → 1 | nei | 2,31 |
| 109 | hestesko | nedenfra | hestesko 13 flater | 0 | 403 | 238 | 238 | 1,69 | 1,69 | 1 → 1 | nei | 2,31 |
| 110 | hestesko | nedenfra | hestesko 11 flater | 0 | 345 | 204 | 204 | 1,69 | 1,69 | 1 → 1 | nei | 2,31 |
| 111 | sone | nedenfra | 20×17/30 + 2×17/30 | 0 | 660 | 391 | 391 | 1,69 | 1,69 | 1 → 1 | nei | 2,31 |
| 112 | hestesko | nedenfra | hestesko 11 flater | 0 | 342 | 204 | 204 | 1,68 | 1,68 | 1 → 1 | nei | 2,32 |
| 113 | hestesko | nedenfra | hestesko 11 flater | 0 | 343 | 204 | 204 | 1,68 | 1,68 | 1 → 1 | nei | 2,32 |
| 114 | hestesko | nedenfra | hestesko 11 flater | 0 | 342 | 204 | 204 | 1,68 | 1,68 | 1 → 1 | nei | 2,32 |
| 115 | hestesko | nedenfra | hestesko 11 flater | 0 | 340 | 204 | 204 | 1,67 | 1,67 | 1 → 1 | nei | 2,33 |
| 116 | hestesko | nedenfra | hestesko 11 flater | 0 | 340 | 204 | 204 | 1,67 | 1,67 | 1 → 1 | nei | 2,33 |
| 117 | hestesko | nedenfra | hestesko 11 flater | 0 | 340 | 204 | 204 | 1,67 | 1,67 | 1 → 1 | nei | 2,33 |
| 118 | hestesko | nedenfra | hestesko 11 flater | 0 | 341 | 204 | 204 | 1,67 | 1,67 | 1 → 1 | nei | 2,33 |
| 119 | regresjon | nedenfra | 5×16/32 | 0 | 160 | 97 | 96 | 1,65 | 1,67 | 1 → 1 | nei | 2,33 |
| 120 | hestesko | nedenfra | 16×17/30 | 0 | 480 | 289 | 289 | 1,66 | 1,66 | 1 → 1 | nei | 2,34 |
| 121 | side | nedenfra | 14×17/30 | 0 | 420 | 255 | 255 | 1,65 | 1,65 | 1 → 1 | nei | 2,35 |
| 122 | hestesko | nedenfra | hestesko 11 flater | 0 | 335 | 204 | 204 | 1,64 | 1,64 | 1 → 1 | nei | 2,36 |
| 123 | hestesko | nedenfra | 13×17/30 | 0 | 390 | 238 | 238 | 1,64 | 1,64 | 1 → 1 | nei | 2,36 |
| 124 | regresjon | nedenfra | 6×17/30 + 4×17/30 | 0 | 300 | 187 | 187 | 1,60 | 1,60 | 1 → 1 | nei | 2,40 |
| 125 | sone | nedenfra | 10×17/30 | 0 | 300 | 187 | 187 | 1,60 | 1,60 | 1 → 1 | nei | 2,40 |
| 126 | side | ovenfra | 10×17/30 | 0 | 300 | 187 | 187 | 1,60 | 1,60 | 1 → 1 | nei | 2,40 |
| 127 | hestesko | nedenfra | 9×17/30 | 0 | 270 | 170 | 170 | 1,59 | 1,59 | 1 → 1 | nei | 2,41 |
| 128 | 192 | nedenfra | 8×17/30 | 0 | 240 | 153 | 153 | 1,57 | 1,57 | 1 → 1 | nei | 2,43 |
| 129 | bygger193 | ovenfra | 8×17/30 | 0 | 240 | 153 | 153 | 1,57 | 1,57 | 1 → 1 | nei | 2,43 |
| 130 | hestesko | nedenfra | 6×17/30 | 0 | 180 | 119 | 119 | 1,51 | 1,51 | 1 → 1 | nei | 2,49 |
| 131 | hestesko | nedenfra | hestesko 2 flater | 0 | 74 | 51 | 51 | 1,45 | 1,45 | 1 → 1 | nei | 2,55 |
| 132 | regresjon | nedenfra | 6×17/30 + 4×17/22 | 0 | 268 | 187 | 187 | 1,43 | 1,43 | 1 → 1 | nei | 2,57 |
| 133 | hestesko | nedenfra | 4×17/30 | 0 | 120 | 85 | 85 | 1,41 | 1,41 | 1 → 1 | nei | 2,59 |
| 134 | hestesko | nedenfra | hestesko 2 flater | 0 | 71 | 51 | 51 | 1,39 | 1,39 | 1 → 1 | nei | 2,61 |
| 135 | hestesko | nedenfra | 3×17/30 | 0 | 90 | 68 | 68 | 1,32 | 1,32 | 1 → 1 | nei | 2,68 |
| 136 | hestesko | nedenfra | hestesko 5 flater | 0 | 108 | 102 | 102 | 1,06 | 1,06 | 1 → 1 | nei | 2,94 |
| 137 | hestesko | nedenfra | hestesko 5 flater | 0 | 108 | 102 | 102 | 1,06 | 1,06 | 1 → 1 | nei | 2,94 |
| 138 | hestesko | nedenfra | hestesko 11 flater | 0 | 180 | 204 | 204 | 0,88 | 0,88 | 1 → 1 | nei | 3,12 |
| 139 | bygger193 | nedenfra | 1×17/30 | 0 | 30 | 34 | 34 | 0,88 | 0,88 | 1 → 1 | nei | 3,12 |
| 140 | hestesko | nedenfra | hestesko 11 flater | 0 | 122 | 204 | 204 | 0,60 | 0,60 | 1 → 1 | nei | 3,40 |
| 141 | hestesko | nedenfra | hestesko 11 flater | 0 | 3245 | 204 | 204 | 15,91 | 15,91 | 3 → 3 | nei | 7,91 |
