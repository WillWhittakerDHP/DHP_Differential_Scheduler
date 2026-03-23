# Phase 6.13 Guide: Wizard Theme Tokens & Brand Palettes

**Purpose:** Phase-level guide for a single perceptual pipeline (OKLCH or HSL) that generates wizard/Vuetify theme tokens so primary, secondary, warning, darken steps, on-colors, inactive tints, and optional tertiary/semantic roles stay visually consistent. Aligns quote and reschedule variants with the admin **Brand colors** (DHP) path and removes duplicated hex across `theme.ts`, `useThemeMode`, and `BookingWizard.scss`.

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Overview

**Phase Number:** 6.13  
**Phase Name:** Wizard Theme Tokens & Brand Palettes  
**Description:** Today, non-brand quote/reschedule use hand-tuned palettes while brand mode applies a flat DHP palette with identical `standard` / `quote` / `reschedule` entries; quote/reschedule SCSS classes are disabled when brand colors are on. Warning and other semantic colors in the global Vuetify theme are a separate static set. This phase introduces derived tokens from anchor colors (and optional library such as culori), extends `WizardModePalette` and CSS variable application as needed, and consolidates one generator feeding both JS and wizard styles.

**Duration:** 8 sessions (6.13.1–6.13.8)  
**Status:** Planning

---

## Phase Objectives

- Define token rules (e.g. darken-1 = fixed ΔL; warning chroma aligned with secondary; quote mode = reduced chroma ± hue shift) in one module.
- Support distinct quote/reschedule (and standard) palettes when **Brand colors** is on, without breaking the admin toggle.
- Reduce or eliminate parallel hex lists in `BookingWizard.scss` (prefer runtime CSS variables or build-time emission from the same source).
- Optionally extend semantic roles (success, info, error, tertiary) for wizard scope only if product requires them.
- Preserve accessibility (on-* contrast) with explicit checks or fixed rules.

---

## Tasks

- Inventory current overrides: `dhpPalette`, `quoteModeColors`, `rescheduleModeColors`, `inactiveColors`, `BookingWizard.scss`, `useThemeMode` `THEME_VAR_KEYS`.
- Specify OKLCH/HSL transform API and seed inputs (brand anchors vs Vuetify theme read — note `resolvePalette` currently ignores theme seeds when DHP is on).
- Implement generator + wire `resolvePalette` / `applyPaletteToCss`; adjust `BookingWizard.vue` class logic if quote/reschedule should combine with `dhp-colors-active`.
- Verify wizard in new / quote / reschedule with brand on and off; run client lint.

---

## Sessions Breakdown

- **Session 6.13.1:** Token pipeline + theme wiring (`theme.ts`, `useThemeMode`, OKLCH/HSL generator, `WizardModePalette` / CSS vars)
- **Session 6.13.2:** `BookingWizard.vue` / `BookingWizard.scss` integration; brand + quote/reschedule verification; client lint
- **Session 6.13.3:** Branding product workshop — logo placement, extraction vs override, fallback, `useBrandColors` semantics (decision log + copy + non-goals)
- **Session 6.13.4:** Branding persistence — extend `wizard_settings` vs new table; migration, API, Zod, client types (ADR + default path A)
- **Session 6.13.5:** Branding file storage — upload route, auth, limits, local vs object storage; multipart API; tie to DB; mermaid sequence
- **Session 6.13.6:** Brand color extraction — canvas vs server (sharp/vibrant); swatch UX; MVP vs full defaults; links to fallback doc
- **Session 6.13.7:** Public booking wizard — minimal branding DTO, logo slot, `useThemeMode` + DB anchors, loading/cache
- **Session 6.13.8:** Branding security & ops — CSP, SVG, cache headers, backups, helmet, production checklist; ties to `BRANDING_STORAGE_AND_UPLOAD.md`

_Register each session with `/session-add` or tier workflow when starting work._

Session detail (Goal / Files / Approach / Checkpoint) is under **Sessions (tierDown)** below. Suggested order: **6.13.3** (product) → **6.13.4**–**6.13.6** (persistence, upload, extraction) → **6.13.8** (security/ops; best after **6.13.5** storage decisions) → **6.13.7** (public consumer) overlapping **6.13.1**–**6.13.2**; **6.13.7** depends on **6.13.4** + **6.13.5**; **6.13.8** cross-cuts upload and static serve from **6.13.5**.

---

## Dependencies

**Prerequisites:** None blocking; touches booking wizard and Vuetify theme only.  
**Related:** Phase 6.12 is unrelated (annotations); numbering is sequential only.

---

## Success Criteria

- [ ] Single source generates RGB/CSS variables for wizard theme overrides used in practice.
- [ ] Quote and reschedule remain coherent when brand colors are enabled (no accidental flat DHP-only look if product requires differentiation).
- [ ] Admin `useBrandColors` / wizard settings behavior unchanged or intentionally extended with docs.
- [ ] `npm run lint` (client) and app start pass.

---

## Related Documents

- `phases/phase-6.13-planning.md` — technical deep-dive and current-state analysis
- `client/src/plugins/5.vuetify/theme.ts`, `client/src/composables/useThemeMode.ts`, `client/src/components/booking/BookingWizard.scss`
- `client/src/@core/components/DropZone.vue` (upload UI reference for 6.13.5)
- `docs/BRANDING_STORAGE_AND_UPLOAD.md` (session **6.13.5** deliverable; **6.13.8** cross-links — create when planning 6.13.5)
- Feature guide: `feature-appointment-workflow-guide.md` (Phase 6.13 entry)

---

## Sessions (tierDown)

### Session 6.13.1: Token pipeline and theme wiring

**Goal:** Introduce a single perceptual-color module (OKLCH or HSL, optional culori) that derives `WizardModePalette` roles from anchor colors; wire `resolvePalette` and `applyPaletteToCss` so DHP `standard` / `quote` / `reschedule` are **distinct** generated palettes; keep non-brand `quoteModeColors` / `rescheduleModeColors` paths working; document token rules (darken-1, warning, on-*).

**Files:** New generator module under `client/src/utils/theme/` (or agreed location); `client/src/plugins/5.vuetify/theme.ts`; `client/src/composables/useThemeMode.ts`; client `package.json` only if adding a color dependency.

**Approach:** (1) Choose library vs hand-rolled OKLCH transforms; (2) Define a small API: inputs (primary, secondary, mode) → palette record; (3) Replace duplicate `dhpPalette` entries with derived outputs per mode; (4) Extend `THEME_VAR_KEYS` / `applyPaletteToCss` as needed; (5) Smoke-check wizard with brand off; brand-on distinct modes in a follow-up session if SCSS still blocks.

**Checkpoint:** Distinct hex/CSS vars for standard vs quote vs reschedule when DHP is on; no placeholder palette fields; client lint clean for touched files; app starts.

**See:** `sessions/session-6.13.1-guide.md` (created by tier workflow)

### Session 6.13.2: BookingWizard integration and verification

**Goal:** Align `BookingWizard.vue` and `BookingWizard.scss` with the single pipeline: allow quote/reschedule visual treatment alongside `dhp-colors-active` when required; prefer CSS variables from the composable over parallel SCSS hex lists; verify all wizard modes with brand on and off.

**Files:** `client/src/components/booking/BookingWizard.vue`; `client/src/components/booking/BookingWizard.scss`; touch-ups in `useThemeMode.ts` only if class/CSS var contract needs adjustment.

**Approach:** (1) Audit class bindings that gate quote/reschedule on `!useDhpColors`; (2) Map SCSS variables to emitted CSS variables where possible; (3) Manual matrix: new / quote / reschedule × brand on/off; (4) Run `cd client && npm run lint`.

**Checkpoint:** Coherent quote and reschedule appearance with brand colors enabled; admin brand toggle behavior unchanged unless documented; lint and app start pass.

**See:** `sessions/session-6.13.2-guide.md` (created by tier workflow)

### Session 6.13.3: Branding product workshop (logo, colors, toggle semantics)

**Goal:** Cover and resolve branding product questions with a **recommendation** column and **needs product sign-off** where unclear. Output: decision log table, user-visible copy suggestions (admin + wizard), v1 non-goals, success criteria checklist.

**Topics:**

- Where the customer logo may appear in v1 (booking wizard header only vs header + confirmation step vs future email — scope boundaries).
- Color strategy: fully automatic extraction vs suggested swatches with admin override (argue for override; minimal UX: 2 anchor hex fields + optional “reset to extracted”).
- Fallback when extraction fails or image is unusable: keep current hardcoded DHP anchors (#EED202 / #FF3333) vs fall back to default Vuetify theme — exact precedence order.
- Relationship to admin toggle **Use brand colors** (`wizard_settings.useBrandColors`): keep as master switch vs rename conceptually when logo/anchors exist; admin copy and behavior matrix (toggle off / on × no logo / logo present).

**Files:** [TBD after workshop — likely settings UI copy, docs, and any schema notes]

**Approach:** Product workshop or async review; capture decisions in session guide + link from phase planning doc.

**Checkpoint:** Decision table approved or explicitly flagged for sign-off; copy drafts ready for implementation sessions.

**See:** `sessions/session-6.13.3-guide.md` (created by `/session-start 6.13.3`)

### Session 6.13.4: Branding persistence (wizard_settings vs new table)

**Goal:** Short **ADR-style** comparison of persistence approaches; default **A** (extend singleton `wizard_settings`) unless multi-tenant separation forces **B**. Deliver concrete schema and API contracts.

**Deliverables:**

- **A)** Extend `wizard_settings`: `logo_url`, `brand_primary_hex`, `brand_secondary_hex`, optional `extracted_palette_json`, `updated_at` semantics.
- **B)** New `business_branding` / `org_branding` + FK or parallel read for future multi-tenant.
- For chosen default: columns (types, nullability, defaults), additive-only migration, Sequelize fields, Zod PUT schema (partial updates), client types (`WizardSettingsData` extend vs parallel `BrandingSettings`), backward compatibility for clients ignoring new fields, example GET/PUT JSON fragments.

**Files:** Server migrations/models, wizard-settings route + Zod; client types alongside existing `WizardSettingsData`.

**Approach:** Document tradeoffs; lock v1 choice; align with existing internal GET/PUT `/wizard-settings`.

**Checkpoint:** ADR + examples merged into session/planning doc; ready for implementation task breakdown.

**See:** `sessions/session-6.13.4-guide.md` (created by `/session-start 6.13.4`)

### Session 6.13.5: Branding file storage (upload pipeline)

**Goal:** Specify logo upload for Node/Express + Vue admin: storage, endpoint, auth, validation, and how the stored asset links to `wizard_settings` (session 6.13.4).

**Sections:**

- Storage: local `uploads/branding` (static or signed serve) vs S3/R2 (URL-only in DB) — single-instance dev vs multi-instance prod.
- Recommended **v1** path with justification.
- **POST** multipart design: path (e.g. `/internal/wizard-settings/logo` vs `/internal/admin/branding/logo`), auth aligned with internal admin routes, CSRF same as existing mutations.
- Validation: max size, MIME allowlist (png/jpeg/webp; SVG disallow v1 or rasterize), cache-bust (hash in filename vs query param).
- DB flow: response returns public URL or storage key; same response or follow-up updates `wizard_settings`.
- Client: `client/src/@core/components/DropZone.vue` exists; **server pipeline is net-new**.

**Deliverables:** Written spec ending with a **mermaid** sequence diagram: upload → store → persist URL.

**Files:** New Express route(s), multer or equivalent, storage adapter; admin Vue wiring to DropZone.

**Checkpoint:** Diagram + endpoint contract approved for build.

**See:** `sessions/session-6.13.5-guide.md` (created by `/session-start 6.13.5`)

### Session 6.13.6: Brand color extraction (canvas vs server + swatch UX)

**Goal:** Compare **browser canvas** extraction vs **server** pipeline (e.g. sharp + vibrant or similar); define **swatch override** admin UX; recommend **MVP** default vs **full phase** default.

**Compare (for each path):** steps, dependencies, **privacy** (image stays in browser vs stored/processed on server), **performance**, **security**, **testability**.

**Product flow:** upload / preview → show **2–6** suggested swatches → admin picks **primary** / **secondary** (override allowed) → persist via existing **JSON PUT** to wizard settings (session 6.13.4).

**Technical:** v1 **algorithm sketch** (e.g. downscale, drop near-white/near-black, k-means or library); list **failure modes** and link to **fallback** behavior doc (align with session 6.13.3 decisions).

**Deliverables:** Explicit **MVP** recommendation and **full-phase** recommendation; wireframes or bullet UX for swatch grid + manual hex fallback.

**Files:** Admin Vue (brand settings), optional shared color util; server route if server-side extraction chosen; types for `extracted_palette_json` if used.

**Approach:** Decide privacy/ops constraints first; then pick extraction location; document contract for PUT payload.

**Checkpoint:** Spec signed off; implementation can slot after 6.13.5 upload and 6.13.4 fields.

**See:** `sessions/session-6.13.6-guide.md` (created by `/session-start 6.13.6`)

### Session 6.13.7: Booking wizard consumption (public branding + theme)

**Goal:** Specify how the **public** booking wizard loads branding **without** exposing unrelated `wizard_settings` (labels, internal copy).

**API options:**

- **Option 1:** Widen anonymous `GET /wizard-settings` if the wizard already calls it — **risk:** leaks labels and other fields.
- **Option 2 (recommended):** New `GET /public/branding` returning a **minimal DTO** only, e.g. `{ logoUrl, primary, secondary, useBrandColors }` (exact shape in spec).

**Vue integration:**

- **Logo:** `BookingWizard` header slot (or agreed placement per 6.13.3); **fallback** when `logoUrl` is null (no broken image; optional DHP/default).
- **Theme:** `useThemeMode` / `resolvePalette` — when `useBrandColors` **and** custom anchors from API: call `buildWizardModePaletteFromAnchors({ primary, secondary, mode })` per wizard mode instead of hardcoded `dhpPalette`; when toggle off, **unchanged** current behavior.

**SPA concerns:** Loading and error behavior (no SSR assumption unless project changes); **caching** strategy for the small JSON (HTTP cache headers, client TTL, SWR pattern — pick one and document).

**Files:** `BookingWizard.vue`, `useThemeMode.ts` (and related palette helpers), new public route + DTO on server.

**Approach:** Prefer Option 2; align DTO with 6.13.4 columns; document security review (no PII in DTO).

**Checkpoint:** OpenAPI or typed contract + matrix: toggle on/off × anchors present/missing × logo null.

**See:** `sessions/session-6.13.7-guide.md` (created by `/session-start 6.13.7`)

### Session 6.13.8: Branding security and ops (Express + helmet + admin)

**Goal:** **Checklist + narrative** for hardening branding upload, static/logo delivery, and production ops. **Each section must reference** decisions recorded in **`BRANDING_STORAGE_AND_UPLOAD.md`** (deliverable of session **6.13.5** — create that doc there if missing, e.g. under `features/appointment-workflow/docs/`).

**Checklist topics:**

- **Upload:** Authenticated **admin only**; **rate** + **size** limits; align with internal route auth from **6.13.5**.
- **Cache-Control:** Logo assets — prefer **immutable** + **hashed filename** (see storage doc); document CDN/proxy behavior.
- **CSP:** Serving **same-origin** uploaded images under **helmet** / Express static — `img-src`, `default-src`, nonce/hash if applicable.
- **SVG policy:** **Disallow v1** or **sanitize** — narrative on XSS / foreignObject / script embedding risks.
- **Logging:** No **binary** or full payloads in logs; optional **audit** line for branding change (who/when/what fields).
- **Backup / restore:** If **local disk** storage path chosen in storage doc — include in runbooks.
- **Production:** Env vars, **S3/R2 bucket policy** + public vs private object ACLs if object storage path chosen.

**Files:** `server` helmet config, upload route middleware, static mount; ops doc alongside `BRANDING_STORAGE_AND_UPLOAD.md`.

**Approach:** Map checklist items to explicit anchors/sections inside `BRANDING_STORAGE_AND_UPLOAD.md` (cross-links both ways).

**Checkpoint:** Reviewable security + ops doc; sign-off before exposing public logo URLs at scale.

**See:** `sessions/session-6.13.8-guide.md` (created by `/session-start 6.13.8`)
