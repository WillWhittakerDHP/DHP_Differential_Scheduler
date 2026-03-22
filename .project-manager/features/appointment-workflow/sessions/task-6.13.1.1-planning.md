# Plan: task 6.13.1.1 — 6.13.1.1

## Contract
- **Tier:** task | **ID:** 6.13.1.1
- **Scope:** 6.13.1.1
- **Governance:** 1 governance highlights — read reports before filling slots

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
No prior handoff for this task.

## Goal
Complete **Session 6.13.1 — Token pipeline and theme wiring**: introduce a small, typed color-token module (OKLCH or HSL; optional **culori**) that derives `WizardModePalette` values from anchor inputs; update `dhpPalette` so `standard`, `quote`, and `reschedule` are intentionally distinct when DHP brand mode is on; wire **`resolvePalette`** and **`applyPaletteToCss`** so runtime CSS variables match the generated palette. **Out of scope for this session:** `BookingWizard.vue` / SCSS class matrix (Session 6.13.2). **Done** when client lint passes, generator behavior is documented in code comments or planning notes, and a quick smoke of the booking wizard in standard / quote / reschedule with brand on and off shows expected palette changes.

## Files
- **TierUp:** `.project-manager/features/appointment-workflow/phases/phase-6.13-guide.md`
- **Theme & types:** `client/src/plugins/5.vuetify/theme.ts` (`WizardModePalette`, `dhpPalette`, `quoteModeColors`, `rescheduleModeColors`)
- **Runtime:** `client/src/composables/useThemeMode.ts` (`resolvePalette`, `applyPaletteToCss`, `THEME_VAR_KEYS`, `useDhpColors`)
- **New:** `client/src/utils/color/` (or equivalent) — transform helpers + `buildWizardModePalettes` (name TBD), exported with explicit types
- **Dependencies:** `package.json` / lockfile only if adding **culori** (or another color lib)
- **Governance:** `client/.audit-reports/*`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`

## Approach
1. Inventory current `dhpPalette` / `quoteModeColors` / `rescheduleModeColors` and document where `resolvePalette` ignores theme seeds when DHP is active.
2. Implement transform helpers and a single builder that returns per-mode `WizardModePalette` objects (at minimum distinct **quote** and **reschedule** vs **standard** when brand colors are on, or an explicit product decision to keep equivalence with a code comment).
3. Integrate the builder into `theme.ts` and `useThemeMode.ts`; ensure `applyPaletteToCss` receives complete keys; avoid widening public APIs without need.
4. Smoke-test the wizard; run `cd client && npm run lint`. No changes to `BookingWizard.scss` except incidental imports if absolutely required — prefer deferring SCSS to 6.13.2.

## Checkpoint
Token module merges clean; `resolvePalette` has a clear contract for DHP vs non-DHP; `dhpPalette` no longer accidentally duplicates hex across modes unless documented; `npm run lint` (client) passes; dev server starts; booking wizard smoke in three modes × brand on/off recorded in session log or handoff when session ends.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.13.1-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
