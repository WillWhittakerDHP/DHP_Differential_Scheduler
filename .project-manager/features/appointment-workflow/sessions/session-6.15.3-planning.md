# Plan: session 6.15.3 — Wizard theme wiring and BookingWizard logo integration

## Contract
- **Tier:** session | **ID:** 6.15.3
- **Scope:** Booking client consumes `wizard_settings` brand fields (`brandPrimaryHex`, `brandSecondaryHex`, `logoUrl`) and applies them in the existing OKLCH theme pipeline (`theme.ts` / `useThemeMode`) and in `BookingWizard.vue` (header logo). No new server work unless a small client API gap appears.
- **Governance:** Thin `BookingWizard`; composables with explicit return types; follow component/composable playbooks on touched files.

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** cross_cutting
- **Governance domains:** client
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create

## Where we left off
Session **6.15.2** shipped admin brand UI (`WizardBrandPanel`, `useWizardBrandSettings`, upload + extraction + preview) and persists via existing wizard settings APIs. Session **6.15.3** finishes phase 6.15 by wiring those values into the public booking wizard.

## Goal
Replace hardcoded DHP anchor usage in the **booking** path with values from loaded `wizard_settings` when the admin **Brand colors** path applies; render the **custom logo** in the wizard header when `logoUrl` is set; keep documented fallbacks for null/missing fields (no silent misconfiguration). **Done** when custom brand and logo are visible end-to-end, default/non-brand behavior still matches expectations, and `cd client && npm run lint` passes.

## Files
- `client/src/plugins/5.vuetify/theme.ts` — anchor resolution vs defaults (`dhpPalette` / `buildWizardModePaletteFromAnchors` entry points as already used).
- `client/src/composables/useThemeMode.ts` — apply palettes from settings when `useBrandColors` (or equivalent) is on; align CSS variables with Phase 6.13 pipeline.
- `client/src/components/booking/BookingWizard.vue` — header logo `img` or equivalent bound to resolved `logoUrl` (absolute/relative handling per API contract).
- Wizard settings load path: composables/config that already fetch `getWizardSettings` / booking bootstrap (extend to pass brand fields into theme path without duplicating fetches).
- Optional touch: `BookingWizard.scss` only if CSS variables or classes need adjustment for logo layout.

## Approach
1. **Load & plumb:** Ensure booking flow has `brandPrimaryHex`, `brandSecondaryHex`, `logoUrl` wherever `useThemeMode` (or theme init) needs them—prefer existing wizard settings query/cache.
2. **Theme:** When brand colors are active, derive `WizardModePalette` from API anchors (reuse `buildWizardModePaletteFromAnchors` / existing 6.13 wiring); keep static defaults when settings null or toggle off.
3. **Logo:** Show logo in header when URL present; handle broken image gracefully (optional alt/placeholder per governance).
4. **Verify:** Manual matrix: brand on/off × light/dark × standard/quote/reschedule as applicable; run client lint.

## Checkpoint
- Custom anchors change wizard colors when configured; toggling admin **Brand colors** / equivalent still behaves as product expects.
- Logo appears when `logoUrl` set; no layout break on small viewports.
- Client lint clean; no new tests (Phase 3.0 policy).

## How we build the tierDown to achieve them
- **Task 6.15.3.1:** Wire wizard_settings brand anchors into `useThemeMode` / theme pipeline (replace hardcoded booking anchors when settings + brand mode apply).
- **Task 6.15.3.2:** BookingWizard header logo + URL handling, edge cases, and full manual verification + lint.

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide: `.project-manager/features/appointment-workflow/phases/phase-6.15-guide.md`
- Prior session handoff: `.project-manager/features/appointment-workflow/sessions/session-6.15.2-handoff.md`
- Phase 6.13 dependency: `.project-manager/features/appointment-workflow/phases/phase-6.13-guide.md`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape
- Playbooks: `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`
