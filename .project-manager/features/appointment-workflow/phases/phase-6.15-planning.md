# Plan: phase 6.15 — 6.15

## Contract
- **Tier:** phase | **ID:** 6.15
- **Scope:** 6.15
- **Governance:** 2 governance highlights — read reports before filling slots

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** architectural
- **Governance domains:** docs
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** light
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
Phase 6.14 completed with sessions: 6.14.1, 6.14.2, 6.14.3.

## Goal
Deliver **Admin Brand Customization: logo upload and color anchors** for the booking wizard: persist brand primary/secondary hex and logo URL on `wizard_settings`; serve uploaded logos safely; let admins pick/verify anchors (including extraction from the logo image); wire those values into the existing OKLCH theme pipeline (replacing hardcoded `DHP_ANCHOR_PRIMARY` / `DHP_ANCHOR_SECONDARY` in `theme.ts` / `useThemeMode`); show the custom logo in the BookingWizard header. **Depends on Phase 6.13** (wizard theme tokens / OKLCH pipeline). **Done** when all three sessions are complete, lints pass, and custom brand is verified across light/dark (and wizard mode) combinations without silent misconfiguration.

## Files
- **Server:** New migration(s) for `wizard_settings` (e.g. `brand_primary_hex`, `brand_secondary_hex`, `logo_url` or agreed column names); upload route(s) (e.g. multer), static/public serving path for uploaded assets; GET/PUT (or PATCH) handlers for brand settings aligned with existing wizard settings API patterns.
- **Client — admin:** Logo upload UI, client-side color extraction (e.g. Canvas `getImageData` or `color-thief-browser`), swatches + editable color picker, live preview using `buildWizardModePaletteFromAnchors`, save/load wired to API.
- **Client — wizard:** `theme.ts`, `useThemeMode`, `BookingWizard.vue` (header logo); remove or override hardcoded anchor constants with DB-sourced values; verify palette behavior for mode × brand cases.
- **Governance / quality:** `client/.audit-reports/` as needed before session ends; project playbooks under `.project-manager/*_AUTHORING_PLAYBOOK.md`.

## Approach
1. **Session 6.15.1 — data + API:** Add schema + migration; implement upload endpoint and brand settings read/update; confirm contracts with client types and error handling (logger in catch paths per project rules).
2. **Session 6.15.2 — admin UX:** Build upload + extraction + anchor editing + preview; persist via 6.15.1 API; stay within component/composable governance (thin components, explicit composable contracts).
3. **Session 6.15.3 — wizard integration:** Consume stored anchors and logo URL in the theme pipeline and BookingWizard; manually verify combinations; run client lint; no new tests (Phase 3.0 policy).

## Checkpoint
- After **6.15.1:** Migration applies on allowed DB hosts only; API returns/accepts brand fields; upload file reachable where the client expects.
- After **6.15.2:** Admin can set logo + anchors and see preview; saves round-trip.
- After **6.15.3:** Wizard shows custom logo and palettes; no regression for default brand; lint clean.

## How we build the tierDown to achieve them
- **Session 6.15.1:** DB schema and brand settings API with logo upload
- **Session 6.15.2:** Admin brand UI with extraction, anchors, and palette preview
- **Session 6.15.3:** Wizard theme wiring and BookingWizard logo integration
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/feature-appointment-workflow-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/phases/phase-6.14-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
