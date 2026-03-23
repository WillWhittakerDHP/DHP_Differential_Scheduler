# Plan: task 6.15.2.1 — Composable, upload API, extraction utilities, brand save/load

## Contract
- **Tier:** task | **ID:** 6.15.2.1
- **Scope:** Client **data layer only** — `uploadWizardLogo` API, `normalizeBrandHex`, canvas-based `extractAnchorsFromImageFile`, preview helpers from anchors, and `useWizardBrandSettings` composable. **No** Vuetify UI (task **6.15.2.2**).

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** composable, function
- **Recommended context pack:** local_implementation_pack

## Where we left off
Session **6.15.2** started; server **6.15.1** exposes `POST /wizard-settings/logo` and brand fields on GET/PUT.

## Goal
Deliver **`uploadWizardLogo(file)`** (multipart to `/wizard-settings/logo`, parse `{ setting_value }`), **`normalizeBrandHex`** for server-aligned `#RRGGBB`, **`extractAnchorsFromImageFile`** (Canvas / `createImageBitmap`, two sample points → primary/secondary hex), **`buildBrandPreviewPalettes`** (wraps `buildWizardModePaletteFromAnchors` for standard/quote/reschedule using current or default anchors), and **`useWizardBrandSettings(formData)`** with `uploadLogo`, `extractAnchorsFromFile`, `uploading` ref, and a compact preview surface. **Out of scope:** admin components, file input, color pickers (**6.15.2.2**).

## Files
- `client/src/configs/wizardSettings/api.ts` — `uploadWizardLogo`
- `client/src/utils/wizardBrand/normalizeBrandHex.ts`
- `client/src/utils/wizardBrand/extractAnchorsFromImageFile.ts`
- `client/src/utils/wizardBrand/wizardBrandPreview.ts` — preview palette map from anchors
- `client/src/composables/admin/useWizardBrandSettings.ts` — explicit return type; logger in catch paths
- Optional: `client/src/types/admin/wizardBrandSettings.ts` — return type contract

## Approach
1. Implement **fetch**-based upload (avoid axios default `Content-Type: application/json` fighting `FormData`).
2. Pure **normalize** + **extract** utilities; no empty catch blocks.
3. **Composable** merges `setting_value` from upload into `Ref<WizardSettingsData | null>`; extraction writes `brandPrimaryHex` / `brandSecondaryHex` using `normalizeBrandHex`.
4. **Preview** uses same default anchors as `theme.ts` when hex missing (document in code comment).
5. `cd client && npm run lint`.

## Checkpoint
- `uploadWizardLogo` returns full `WizardSettingsData` and merges into form ref in composable
- Extraction returns plausible hex pairs for a PNG test file (manual smoke)
- Client lint passes

## Design Before Execute
- **Composable** accepts `formData: Ref<WizardSettingsData | null>` from parent; parent owns load/save via existing `useAdminWizardSettings` or calls `getWizardSettings` first.

---
## Reference
- Session plan: `.project-manager/features/appointment-workflow/sessions/session-6.15.2-planning.md`
- `client/src/utils/theme/wizardPaletteFromAnchors.ts`, `client/src/plugins/5.vuetify/theme.ts` (DHP anchor defaults)
