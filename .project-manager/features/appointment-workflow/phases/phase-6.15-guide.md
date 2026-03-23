# Phase 6.15 Guide: Admin Brand Customization — Logo Upload & Color Anchors

**Purpose:** Phase-level guide for per-wizard brand assets and theme anchors: persisted logo URL and primary/secondary hex on `wizard_settings`, server upload + public serving, admin extraction/selection of anchors, and wiring into the OKLCH pipeline plus BookingWizard header.

**Tier:** Phase (Tier 1 - High-Level)

---

## Overview

**Phase Number:** 6.15  
**Phase Name:** Admin Brand Customization: Logo Upload & Color Anchors  
**Description:** Logo upload (file storage + public serving); client-side color extraction from the uploaded image; admin verification of primary and secondary anchor hex; DB fields for anchors and logo URL; replace hardcoded `DHP_ANCHOR_PRIMARY` / `DHP_ANCHOR_SECONDARY` with DB-sourced values in `theme.ts` / `useThemeMode`; render the logo in the BookingWizard header. Depends on **Phase 6.13** (wizard theme tokens / OKLCH pipeline).

**Duration:** Three sessions (6.15.1 data + API, 6.15.2 admin UI, 6.15.3 wizard consumption).  
**Status:** In Progress — phase started; run sessions in order, then `/phase-end 6.15 appointment-workflow` when success criteria are met.

---

## Objectives

- Persist `brand_primary_hex`, `brand_secondary_hex`, and `logo_url` (or agreed column names) on `wizard_settings` with a safe migration.
- Expose multer (or equivalent) upload, public URL for the asset, and GET/PUT brand settings aligned with existing wizard settings patterns.
- Admin UI: upload logo, extract colors, edit anchors, live palette preview via `buildWizardModePaletteFromAnchors`, save round-trip.
- Wizard: load anchors from API into theme composables; show logo in `BookingWizard.vue`; verify light/dark and mode combinations without silent misconfiguration.

---

## Tasks

- Land migration and server routes; only run migrations where project policy allows (`DB_HOST` localhost guard).
- Implement admin brand surface and wire to API.
- Integrate theme pipeline and header; client lint; update handoffs per session.

### Sessions Breakdown

- [ ] ### Session 6.15.1: DB schema and brand settings API with logo upload  
**Goal:** Add columns and migration for brand fields on `wizard_settings`; implement upload endpoint and brand GET/PUT; serve uploaded files under the agreed public path; log errors per project standards.  
**Files:** Sequelize model(s), migration, wizard settings routes, upload middleware, static serving config as used elsewhere in the server.  
**Approach:** Follow existing `wizard_settings` API shapes; return typed payloads for client; document URL shape for the logo.  
**Checkpoint:** Migration applies on dev DB; API accepts and returns brand fields; uploaded file is reachable at the URL stored in DB.

- [ ] ### Session 6.15.2: Admin brand UI with extraction, anchors, and palette preview  
**Goal:** Let admins upload a logo, derive candidate colors from the image, pick/verify primary and secondary hex, preview palettes, and save.  
**Files:** Admin Vue components and composables under `client/src/` (brand settings tab or agreed surface), API client calls from 6.15.1.  
**Approach:** Thin components; composable for extraction + form state; use `buildWizardModePaletteFromAnchors` for preview; explicit save/load.  
**Checkpoint:** Round-trip save/load; preview matches saved anchors; no placeholder UX.

- [ ] ### Session 6.15.3: Wizard theme wiring and BookingWizard logo integration  
**Goal:** Replace hardcoded anchor constants with values from loaded wizard settings; render logo in the wizard header; verify combinations.  
**Files:** `theme.ts`, `useThemeMode`, `BookingWizard.vue`, wizard data loaders that already fetch `wizard_settings`.  
**Approach:** Single source of truth from API; fallbacks only where explicitly documented (no silent hides); manual verification matrix for mode × theme.  
**Checkpoint:** Custom brand visible end-to-end; client lint clean; regressions documented or fixed.

---

## Dependencies

**Prerequisites:** Phase **6.13** complete (OKLCH / wizard theme token pipeline).  
**Downstream:** Later phases may assume brand fields exist on `wizard_settings`; avoid breaking default wizard when columns are null.

---

## Success Criteria

- [ ] Migration + API + upload path complete — **6.15.1**
- [ ] Admin can configure logo and anchors with preview — **6.15.2**
- [ ] Wizard uses DB anchors and shows logo — **6.15.3**
- [ ] Client and server lint pass at phase close; app starts (`npm run start:dev`)
- [ ] Phase handoff and feature guide table updated when phase ends

---

## End of Phase Workflow

After all sessions complete, confirm with Will before running:

`/phase-end 6.15 appointment-workflow`

---

## Related Documents

- `phases/phase-6.15-planning.md`
- `feature-appointment-workflow-guide.md` (Phase 6.15 row)
- `phases/phase-6.13-guide.md` (theme token dependency)
- Session guides: `sessions/session-6.15.1-guide.md`, `sessions/session-6.15.2-guide.md`, `sessions/session-6.15.3-guide.md`
