# Project: Varmeplan (Room Designer)

A browser-based engineering tool for designing electric heating systems in buildings.
Built for electricians and heating professionals. Internal/historical codename: Romtegner
(the app file was named `romtegner.html` until the 07.09.2026 rename to `index.html`).

---

# Git Workflow

- **NEVER create worktrees.** Always work directly in the main repo on the `main` branch.
- Do not create feature branches unless explicitly requested.
- Commit and push only when the user asks.

---

# Current Codebase

The entire application lives in a single HTML file:
- **App:** `index.html` (HTML + CSS + JS, all-in-one) — renamed from `romtegner.html` 07.09.2026
  so the app is served from `/`, not `/romtegner.html` (see `vercel.json` for the redirect).
- **Server:** `serve-varmeplan.js` (minimal Node.js static server, port 4000)
- **Backend:** Supabase (product catalog, project storage)
- **Karttjeneste:** `~/Code/varmeplan-roof` (FastAPI) — Kartverket-data. Klientlaget er `_roofApi`;
  **aldri direkte Kartverket-kall fra nettleseren** (nøkkel, CORS, caching og høflighetsgrenser
  bor i tjenesten). Kjøres lokalt på port 4100. Se `docs/kart-lag.md`.
- **Kartbakgrunn:** et vanlig `S.bgs`-objekt med `bg.geo` — altså ingen egen rendering-vei.
  **Kalibrer, roter, speilvend eller skaler aldri en geo-bakgrunn**: målestokken kommer fra
  georeferansen, og endres den, blir alle koordinater feil uten at noe ser galt ut
  (`_bgIsGeo(bg)` er sjekken).
- **No build step.** No npm, no bundler. Pure HTML/JS/CSS.
- **Launch config:** `.claude/launch.json` — start with preview server name `varmeplan`
- **Backup:** Claude config files are backed up in `docs/claude/` in the repo.

When modifying code, respect that this is a single-file architecture.
Do not split into multiple files unless explicitly requested.

Ny hurtigtast → ny rad i `_SHORTCUTS` (hurtigtast-panelet, `?`-tasten). Panelet er en manuell
liste, ikke lest fra tastehåndtererne selv — det finnes ingen automatisk sjekk som fanger en
glemt rad.

---

# Core Design Philosophy

The system follows a deterministic, object-based CAD-like architecture.
All geometry is stored as objects in a world coordinate system (centimeters).
Rendering is always derived from state — no graphical data is stored as pixels.

---

# World Coordinate System

All geometry exists in world coordinates (cm).
Rendering to screen uses the transform function `w2s()` (world-to-screen).
Screen coordinates must never be stored in state.

---

# State Object (S)

The central state object `S` holds all project data. Key properties:

```
S.rooms        — array of room objects (polygon points, metadata)
S.strips       — array of heating foil strip objects
S.varmefolie   — foil placement settings (direction, startCorner, gapCm)
S.ui           — UI state (selections, mode, hover, etc.)
S.counters     — auto-increment IDs (nextStripId, etc.)
S.project      — project metadata (name, description)
```

All rendering and calculations derive from `S`. Push to undo stack with `pushUndo()` before mutations.

---

# Object Model — Heating Foil Strips

Heating foil strips are stored in `S.strips`.

Structure:
```
{
  id,            // unique auto-increment ID
  roomId,        // reference to parent room
  productId,     // reference to product in HEATING_PRODUCTS
  direction,     // 'v' (vertical) or 'h' (horizontal)
  pos_cm,        // position across the room (cm)
  start_cm,      // start position along the strip (cm)
  length_cm      // length of the strip (cm)
}
```

Product data (via `productId`) contains:
- width (mm / netto mm)
- power (W/m²)
- article number and name
- `min_gap_mm` — supplier-specific minimum gap between strips
- `min_wall_margin_mm` — supplier-specific minimum distance from walls

This enables automatic calculation of installed power, covered area, and material lists.

---

# Interactive Objects

Strips support full interaction:
- selection (stored in `S.ui.selectedStripIds`)
- hover
- move and resize
- grouping

Objects remain editable after placement.

---

# Rule System — Supplier-Aware Installation Rules

Installation rules are **supplier-specific** and defined per product.
Each product in the database can have:
- `min_gap_mm` — minimum gap between strips (e.g., 10mm for Cenika)
- `min_wall_margin_mm` — minimum distance from walls/obstacles (e.g., 25mm for Cenika)

Default values (applied at load time if missing from DB):
- `min_gap_mm = 10` (Cenika default)
- `min_wall_margin_mm = 25` (Cenika default)

**Central helper functions** (defined near `MARGIN_CM`):
- `_productMinGapCm(productId)` — supplier's minimum gap in cm
- `_productMinMarginCm(productId)` — supplier's minimum margin in cm
- `_effectiveGapCm(productId)` — `max(user preference, supplier min)`
- `_effectiveGapCmPair(prodId1, prodId2)` — strictest gap between two different products
- `_effectiveMarginCm(productId)` — supplier's margin for a product
- `_roomMaxMarginCm(roomId, direction?)` — strictest margin across all products in a room

**Rules:**
- User can set gap via ctxbar (`S.varmefolie.gapCm`), but it cannot go below supplier minimum
- When two strips from different suppliers/products are adjacent, the strictest rule applies
- Wall margin is always determined by the product's supplier rules
- `MARGIN_CM = 2.5` remains as a **fallback constant** when no product context is available

Rules may be overridden by the user, but the system must always show warnings.

---

# Cable Layout Rules — LOCKED

These rules are **permanent** and must not be changed without explicit user request.

## U-turn arcs (LOCKED)
- U-turns are always **half-circles** with radius = CC/2
- U-turn length = `π × (spacing_cm / 2)`
- Drawing: half-circle arc between adjacent run endpoints
- **Never** change to hairpin, elliptical, or any other shape

## Sweep margin (LOCKED)
- `sweepMargin = margin + CC/2` (margin from product rules + U-turn radius)
- The U-turn arc extends CC/2 beyond the segment endpoint toward the wall
- **Never** use bend radius or any other value for sweep margin

## Equal-length runs (LOCKED)
- **All cable runs must be exactly the same length (MANDATORY equalization)**
- After generating polygon-clipped runs, find the shortest common sweep range and clip ALL runs to match
- This equalization is NEVER optional — it prevents Y-splits
- When overshoot trimming (cable longer than target): shorten ALL runs equally by increasing sweep margin symmetrically from both ends — never trim only the last run
- Cable must use exactly the specified product length (no more, no less)
- For irregular rooms (L/T-shapes), equalization means some areas won't be covered — this is acceptable
- The auto-direction selector picks the direction that maximizes the common sweep range (best coverage)

## No Y-splits (LOCKED)
- **Y-splits (branching/forking) are absolutely forbidden**
- A cable has exactly ONE start and ONE end — no branches, no T-junctions
- The cable path must be a clean sinusoidal (serpentine) pattern from start to end
- **Extension lines between runs of different heights ARE Y-splits** — this is NOT allowed
- ALL runs must have identical sweep range after equalization
- **Never** draw extension lines between runs of different heights — this creates visual branches
- The ONLY way to avoid Y-splits is mandatory equalization of all runs to the common overlap range

## W/m² sync with room type (LOCKED)
- When user selects a room type, the W/m² field (Flateeffekt) must update to match the room type's default value
- Product suggestions must recalculate based on the new W/m²
- Priority: User override > Org override > Global default

---

# Rooms

Rooms are the primary container for all objects.
Creation methods:
- rectangle (length + width)
- L-shape
- polygon drawing
- wall-by-wall input

Room geometry uses room-local coordinates.

**Fundamental rule — interior dimensions:**
All rooms are drawn according to interior (innvendig) dimensions.
`room.points` defines the **interior boundary** of the room.
`room.area` IS the usable interior floor area.
Wall thickness extends **outward** from `room.points`, never inward.
`computeWallOutline()` builds walls outward using perpendicular normal vectors.
`_calcNetArea(room)` returns interior area minus obstacle areas only — wall thickness is never subtracted.
This rule must be respected by all current and future code that touches room geometry or area calculations.

---

# Background Drawings

Rooms may use background drawings (PDF, JPG, PNG) as visual references.
Background files are loaded per project.
If a background file is replaced with the same filename, the system reloads it automatically, preserving scale and placement.

**Plantegningen er låst til etasjen (162).** `S.bgs`/`S.bgRefs` er nøklet per etasje; `'__global__'` finnes
**bare** i prosjekter uten etasjer (tegnefilteret `_bgKeyOnActiveFloor` håndhever det). Hver import bærer en
import-kontekst (`_bgImportCtx`, blokken «162 · IMPORT-KONTEKST») som **parameter** gjennom hele kjeden —
målretasjen bindes synkront når fila velges/slippes. **Ny importvei: aldri les `S.ui.activeFloorId` etter en
await, og aldri en global «målretasje»-variabel** — lag en kontekst ved start og send den videre. Etter await:
`_bgCtxResolveFloor(ctx)` (null = etasjen er slettet → `_bgCtxAbort`). Gamle `__global__`-nøkler ryddes ved
åpning (`_bgMigrateGlobalKeys`). Regresjon: `_bgFloorRegressionTest()`.

---

# Rendering Layers

Rendering follows a layer-based approach (bottom to top):
1. Background drawing
2. Walls
3. Rooms
4. Obstacles
5. Heating elements
6. Labels
7. UI overlays

---

# Performance Principles

Avoid heavy recalculations during rendering.
Preferred techniques:
- cached calculations
- bounding boxes
- incremental updates

Rendering must remain smooth even with many heating elements.

---

# Engine Architecture (established patterns)

The system already follows a structured CAD engine design.
Do not refactor these patterns — extend them.

## Scene Hierarchy (in place)

```
S (state)
 ├─ floors[]
 │    └─ rooms[] (via floorId)
 │         ├─ walls[]
 │         ├─ points[] (polygon)
 │         ├─ strips[] (via roomId, in S.strips)
 │         └─ obstacles[] (hindrings, via roomId)
 └─ view {zoom, panX, panY}
```

Room is the primary container. All objects reference their room via `roomId`.

## Hit Detection Order (in place)

Priority from top to bottom:
1. UI gizmos (strip arrows, group handles)
2. Strip end-handles
3. Strip bodies
4. Hindring walls / vertices
5. Walls
6. Room bodies
7. Annotations / dimension lines

Functions: `hitStripGizmo()`, `hitStripEndArrow()`, `hitStrip()`, `hitTest()`, `hitAnnotation()`

## Collision & Snapping (in place)

- `_stripOverlapsAny(strip)` — supplier-aware gap-based overlap detection
- `_clampStripToRoom(strip, origPos)` — room bounds + supplier-aware neighbor collision avoidance
- `_snapStripToNearest(strip)` — magnetic snap to nearest neighbor with supplier-aware gap
- `_stripRoomBounds(strip)` — bounding box for room of a strip
- `_effectiveGapCmPair(prodId1, prodId2)` — strictest gap rule between two products
- `_effectiveMarginCm(productId)` — supplier-aware wall margin for a product

## Scalability Guidelines (for future growth)

When the project grows beyond ~50 rooms / 200 heating objects:

1. **Viewport culling**: Only render objects whose bounding box intersects the visible viewport. Check `w2s()` bounds against canvas dimensions before drawing.

2. **Spatial indexing**: If linear hit-testing becomes slow, add a simple grid index (not quadtree — overkill for 2D axis-aligned rooms). Partition world space into cells, bucket objects by cell.

3. **Dirty rendering**: Add a `_dirty` flag. Only call `render()` when state actually changes. Avoid redundant renders from mousemove when nothing moves.

4. **Per-room rendering**: Room-scoped operations (collision, rendering, validation) should filter by `roomId` first — never scan all objects globally when the room is known.

These optimizations should be added **only when needed**, not preemptively.
Current performance is fine for the expected project sizes (1-20 rooms, 10-100 strips).

---

# Code Style Guidelines

When modifying code:
- prefer small, incremental changes
- do not rewrite large parts of the system
- explain architectural changes before implementing
- maintain backward compatibility
- prioritize clarity over cleverness
- always test changes visually via the preview server

---

# Documentation, Warranty & Claims Module (implemented — Fase 1–3)

A separate, mobile-first module on the same login, built on top of existing
project/room/product/auth. Entered via dashboard tabs **Dokumentasjon** (project/room
picker) and **Garantiportal** (role-gated to `org_type='supplier'`), plus a
**Dokumentér** shortcut in the room right-click menu (`_docFromRoom`).

## Supplier as data (not branding)
The app stays neutrally "Varmeplan"-branded. Each supplier is a row in `suppliers`
(seeded with Cenika): name, display_name, color, garanti_id_prefix, recipient_email,
and measurement rules (`resistance_tolerance_pct` ±10 %, `insulation_min_mohm` >10,
`insulation_min_volt` 500). Adding ØS Varme later = one new row. `heating_products`
links via `supplier_id` (integer FK — `heating_products.id` is integer, not uuid).

## Data model (separate Supabase tables, NOT in project JSON)
Kept out of project JSON so the portal can search across projects.
- `warranty_certificates` — one per room; snapshot fields (project/room name) so the
  cert survives project edits; `share_token` for a future homeowner link; `status`
  draft|signed.
- `certificate_products` (1..n per cert) → `measurements` (3 stages: før installasjon /
  innstøping / tilkobling, R + isolasjon, `ok` snapshot) + `certificate_photos`.
- `claims` (reklamasjonssak, linked to a cert) → `claim_events` (timeline) + `claim_photos`.
- Private `documentation` storage bucket (photos, signature, generated PDF).

## RLS pattern (IMPORTANT)
Org members see their org's rows; supplier orgs see rows for their products
(`supplier_id` ↔ `organizations.supplier_name`). **Superadmin checks MUST read
`auth.jwt() -> 'app_metadata' ->> 'is_superadmin'`, NEVER `SELECT FROM auth.users`** —
the `authenticated` role lacks access to `auth.users` (→ 42501; and separate policies
don't short-circuit the way OR-conditions inside one policy do).

## Code map (all in `index.html`)
- `_doc*` — picker, 5-step mobile wizard (`#doc-screen`), prefill from drawing,
  nominal R=U²/P, live measurement validation, `_docBuildPDF` (jsPDF), save to cloud.
- `_portal*` — Garantiportal: KPI, filtered cert list, detail with color-coded
  measurement table, photos (signed URLs), open PDF; sub-nav to Reklamasjoner.
- `_claim*` — Meld feil form (`#claim-screen`, channel app+phone → same case),
  approval gate, timeline, cost, outcome; `_claimStatusView` is the installer's
  read-only status revisit.

## Conventions / gotchas
- Migrations are plain ASCII `.sql` files run manually in Supabase SQL Editor
  (`supabase-migration-documentation.sql`, `supabase-migration-claims.sql`); idempotent.
- Full-screen overlays `#doc-screen`/`#claim-screen` use z-index > 1001 (the dashboard
  `#project-list-screen` is z-index 1001); portal modal uses z-index 2000.
- Email (customer routine notice + supplier/installer copy) is intentionally deferred
  to a Supabase Edge Function — shown as info on the receipt; data is saved regardless.

---

# Prosjektlås (060) — én redigerende bruker per prosjekt

`S.ui.readOnly` er **ikke** en egenskap ved prosjektet, men ved dette vinduets forhold til
det. Den lagres aldri i `data`-blobben og settes aldri av `_restoreProject`.

**To lag, og begge må stå:**
1. UI-gaten i `index.html` (seksjonen «060 · PROSJEKTLÅS») — førstelinje, den brukeren ser.
2. Triggeren `romtegner_projects_lock_guard_trg` (`before update of data`) — sikringen,
   reiser `PROJECT_LOCKED`.

**Ny kode som skriver prosjektet til skyen MÅ gates på `S.ui.readOnly`**, på samme sted og
på samme måte som `S.ui.kundeMode` — én gate, to grunner. ⚠ `pushUndo` er en BAKSTOPP, ikke
garantien: alle 230 kallsteder kaller den som en bar setning og ser aldri returverdien.

Låsen er **fail-open**: finnes ikke RPC-ene (migrasjonen ikke kjørt), settes
`_lockDisabled` og appen oppfører seg nøyaktig som før 060. Ikke bygg om på dette —
en nettverksblipp skal ikke bli en arbeidsstans.

`?present=` og `?kunde=` tar **aldri** en lås, og feltappens opprettelse av prosjekter
(INSERT) er aldri låst. Se `docs/spec-prosjektlaas.md`.

---

# Future (not yet implemented)

The following features are planned but do not exist in the codebase yet.
Do not build infrastructure for these unless explicitly requested.

## Additional Heating Modules
- Heating Cable
- Heating Mats
- Outdoor Snow Melting

Each future module will use the same architecture: object-based geometry, product references, rule validation, and power calculations.

## Email delivery (Edge Function)
Routine email to customer on claim creation + warranty-certificate copy to installer/
supplier. Scaffolded in `supabase/functions/` — needs deploy + secrets to activate.

## Project Export (PDF)
Export functionality for:
- room drawings with heating layouts
- installed power and equipment lists
- product information
- suitable for customer delivery and project documentation

## Long-Term Vision
Professional engineering tool for electric heating design with:
- automatic heating layout
- power optimization
- installation validation
- full project documentation
- integration with supplier product databases

---

## Status for prosjektoversikten
På slutten av hver økt: oppdater `STATUS.md` (Fase, Sist oppdatert, Sist gjort, Neste steg, Blokkert av, Live). Behold formatet på feltlinjene nøyaktig.
