# Plan: task 6.13.1.1 — Perceptual wizard palette generator (pure module)

## Contract

- **Tier:** task | **ID:** 6.13.1.1
- **Scope:** New `client/src/utils/theme/` module — OKLCH/HSL helpers and `buildWizardModePalette`-style API; no wiring to Vuetify or `useThemeMode` in this task (that is 6.13.1.2)
- **Governance:** Pure functions with explicit return types; small surface; read audits before merge

## Work Profile

- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function, type
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate

## Where we left off

Session 6.13.1 is open on `session-6.13.1`. This task adds the color math layer only; integration into `theme.ts` / `useThemeMode.ts` follows in task 6.13.1.2.

## Goal

Add a **pure** module that, given DHP-style primary and secondary anchor colors and a wizard mode (`standard` | `quote` | `reschedule`), returns a complete `WizardModePalette`-shaped object (primary, secondary, warning, darken-1, on-*, inactive-related fields as required by existing types). Use perceptual space (OKLCH via **culori** or equivalent) so quote/reschedule variants differ by controlled chroma/lightness deltas, not copy-pasted hex. Consumers (`theme.ts`) are updated in the next task.

## Files

- `client/src/utils/theme/wizardPaletteFromAnchors.ts` — main exported builder
- `client/src/utils/theme/colorMath.ts` — hex ↔ OKLCH, ΔL / chroma nudges (split if needed for governance line limits)
- `client/src/utils/theme/index.ts` — barrel exports
- `client/package.json` — add `culori` dependency if we use it

## Approach

1. Inspect `WizardModePalette` / `dhpPalette` types in `client/src/plugins/5.vuetify/theme.ts` and mirror output shape exactly.
2. Implement `buildWizardModePaletteFromAnchors({ primary, secondary, mode }): WizardModePalette` with named constants for quote/reschedule chroma reduction and warning hue nudge.
3. Keep functions unit-testable (pure, no DOM); avoid pulling in Vue or `useThemeMode`.
4. Run `cd client && npm run lint` on new files only.

## Checkpoint

- Module compiles; exports match `WizardModePalette` shape; distinct outputs for the three modes when given the same anchors (verify with a quick inline log or temporary dev-only assert in the module comment, removed before task-end).
- No edits to `theme.ts` or `useThemeMode.ts` in this task.
- Client lint passes for new files.

## Design Before Execute

- Import `WizardModePalette` type from the theme plugin (or duplicate a minimal interface in the util if circular — prefer importing from a types-only path if one exists).
- Pseudocode: `parse(primary) → oklch`; derive `secondary`, `warning` (hue shift), `primaryDarken1` (ΔL); derive `on*` for contrast; mode applies chroma scale for quote/reschedule.

---

## Reference (read before filling slots — governance and inventory compliance is required)

- Tier-up: `.project-manager/features/appointment-workflow/sessions/session-6.13.1-guide.md`
- Phase context: `.project-manager/features/appointment-workflow/phases/phase-6.13-planning.md`
- Governance reports: `client/.audit-reports/`
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`
