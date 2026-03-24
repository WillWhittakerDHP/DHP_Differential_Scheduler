# Plan: session 6.15.2 — Admin brand UI with extraction, anchors, and palette preview

## Contract
- **Tier:** session | **ID:** 6.15.2
- **Scope:** Vue admin only — brand logo upload UX, anchor hex editing, client-side color extraction, live palette preview, save/load via existing wizard_settings APIs (session **6.15.1** complete)
- **Governance:** Thin SFCs; composables with explicit return types; read component/composable playbooks before adding UI

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** cross_cutting
- **Governance domains:** client, docs
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** moderate
- **Downstream advice:** Session **6.15.3** consumes anchors in the booking wizard — this session does not modify `BookingWizard.vue` or `theme.ts` except where needed for shared types re-exports.

## Where we left off
Session **6.15.1** delivered DB columns, GET/PUT `wizard_settings`, `POST /wizard-settings/logo`, and static serving for uploaded logos. **6.15.2** adds the **admin** surface to configure brand assets and preview palettes before wizard integration.

## Goal
Let admins **upload a logo** (multipart to existing logo endpoint), **edit primary/secondary anchor hex** (with optional **extraction from the logo image** via Canvas `getImageData` or a small browser helper), and see a **live palette preview** using `buildWizardModePaletteFromAnchors` (or the project’s canonical preview helper from Phase 6.13). **Save** persists `brandPrimaryHex`, `brandSecondaryHex`, and `logoUrl` through existing `PUT /wizard-settings` and shared `WizardSettingsData`. **Done** when load/save round-trips, preview reflects saved anchors, client lint passes, and no placeholder UX remains in the brand section.

## Files
- `client/src/configs/wizardSettings/` — types already flow from `@shared`; extend usage for brand fields; add **`multipart/form-data` POST** helper for logo upload (axios `FormData`, field name `file` per server).
- `client/src/composables/admin/` — new or extended composable(s) for brand state: load wizard settings, upload logo, update hex fields, save via `buildWizardPayload`.
- Admin UI entry: existing wizard/business settings tab pattern (e.g. tab that already uses `useAdminWizardSettings`) — add a **Brand** subsection or dedicated block per project layout.
- Small **utility** for sampling colors from an `HTMLImageElement` / File → hex strings (pure functions; no silent catch).
- Optional dependency: only if extraction needs it (e.g. `color-thief-browser`) — prefer Canvas-first to limit deps; document choice in session log if added.
- **Governance:** `client/.audit-reports/` before session end; `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`, `COMPOSABLE_AUTHORING_PLAYBOOK.md`.

## Approach
1. **Composable + API:** Wire `brandPrimaryHex`, `brandSecondaryHex`, `logoUrl` on the admin form model; implement `uploadWizardLogo(file: File)` calling `POST .../wizard-settings/logo` with `FormData`; normalize hex (`#RRGGBB`) to match server Joi; reuse `getWizardSettings` / `put` patterns from `useAdminWizardSettings` where possible.
2. **Extraction + preview:** On file select or after upload, draw image to canvas, sample dominant / corner pixels or use a small extraction helper; populate candidate anchors; call `buildWizardModePaletteFromAnchors` for light/dark preview chips or swatches.
3. **UI:** Vuetify file input, two color fields (or color pickers), preview area (readonly), save button tied to existing save flow; loading/error via `createLogger` in catch paths.
4. **Quality:** `cd client && npm run lint`; app starts; no new tests (Phase 3.0).

## Checkpoint
- Admin can upload logo, see returned `logoUrl`, and persist anchors with **Save**
- Reload shows stored logo URL and hex values
- Preview updates when anchors change and matches saved state after reload
- Client lint clean

## How we build the tierDown to achieve them
- **Task 6.15.2.1:** Composable, upload helper, extraction utilities, and wizard_settings save/load for brand fields
- **Task 6.15.2.2:** Admin brand UI section with file input, anchors, and palette preview wired to composable

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide: `.project-manager/features/appointment-workflow/phases/phase-6.15-guide.md`
- Prior session: `.project-manager/features/appointment-workflow/sessions/session-6.15.1-handoff.md`
- Governance reports: `client/.audit-reports/`
- Playbooks: `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
