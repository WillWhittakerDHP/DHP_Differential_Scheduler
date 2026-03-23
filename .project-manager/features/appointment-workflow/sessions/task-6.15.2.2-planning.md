# Plan: task 6.15.2.2 — Admin brand UI section (logo, anchors, preview)

## Contract
- **Tier:** task | **ID:** 6.15.2.2
- **Scope:** Vue **presentation only** — Business Controls → Wizard panel: file input, hex fields, extract button, preview chips, uses **`useWizardBrandSettings`** from 6.15.2.1. No server changes.

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** component

## Where we left off
Task **6.15.2.1** shipped `uploadWizardLogo`, `useWizardBrandSettings`, extraction utils, and preview helpers.

## Goal
Add a **Brand customization** block under the existing Wizard switches in **`WizardConfigPanel`**: logo file upload (calls `uploadLogo`), primary/secondary hex text fields (bound to `WizardSettingsData`), **Extract colors from image** (calls `extractAnchorsFromFile` on the last selected file), and a compact **preview** row (primary/secondary/warning swatches for **standard** mode from `previewPalettes`). Save remains the existing **Save settings** button (`wizardSaveSettings`). **Done** when admin can round-trip logo + anchors and see preview update; client lint passes.

## Files
- `client/src/views/admin/tabs/wizardFormDataKey.ts` (or co-locate) — `InjectionKey<Ref<WizardSettingsData | null>>`
- `client/src/composables/admin/useBusinessControlsTab.ts` — `provide(WIZARD_FORM_DATA_KEY, wizard.formData)`
- `client/src/views/admin/tabs/components/WizardBrandPanel.vue` — new SFC
- `client/src/views/admin/tabs/components/WizardConfigPanel.vue` — render `WizardBrandPanel`
- `client/src/configs/businessControlsTabStrings.ts` — `brand.*` strings

## Approach
1. Provide wizard form ref for inject (avoid `reactive()` ref-unwrapping pitfalls).
2. Build thin panel: `inject` + `useWizardBrandSettings`; `VFileInput` + `VTextField` + `VBtn` + swatch `div`s with inline background from `previewPalettes.standard`.
3. Keep template under governance limits; logic stays in composable from 6.15.2.1.
4. `cd client && npm run lint`.

## Checkpoint
- Business → Wizard tab shows brand section; save persists via existing flow
- Lint clean

## Design Before Execute
- Preview shows **standard** palette only in this task (quote/reschedule can be a follow-up note in guide).

---
## Reference
- `client/src/composables/admin/useWizardBrandSettings.ts`
- `client/src/views/admin/tabs/components/WizardConfigPanel.vue`
