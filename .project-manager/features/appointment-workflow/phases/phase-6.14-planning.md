# Plan: phase 6.14 — Organization Defaults & Resolved Numeric Policy

## Contract
- **Tier:** phase | **ID:** 6.14
- **Scope:** Organization Defaults & Resolved Numeric Policy
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
Phase 6.13 completed with sessions: All sessions.

## Planning decomposition note

Phase **6.14** is intentionally split into **two sessions**:

| Session | Role |
|--------|------|
| **6.14.1** | Foundation: types, `resolveOrganizationNumericPolicy`, persistence, admin UI, merge-at-read on **computed availability** (server). |
| **6.14.2** | Integration: broaden resolver wiring + server validation parity + optional org-default badges; close phase success criteria. |

Some artifacts previously implied a **single** session for the whole phase; that understated follow-up work. See `sessions/session-6.14.1-planning.md` (*Outcome*) and `sessions/session-6.14.2-planning.md`.

## Goal
Deliver a canonical **organization defaults** model merged at read time with availability/calendar payloads so numeric policy (minute increments, duration rounding, drive-time fee, holds, admin entry timeout, lead time, buffers, optional constraint baselines) has one source of truth and explicit resolution on client and server—no silent Vue-only fallbacks. Admin can edit defaults in a dedicated surface; persistence strategy is documented and implemented (or stubbed with a tracked follow-up). Aligns with `BusinessControlsTab.vue` save split and existing `AvailabilitySettings` / `CalendarConfig` paths.

## Files
- `phases/phase-6.14-guide.md`, `sessions/session-6.14.1-planning.md`, `sessions/session-6.14.2-planning.md` — scope and session detail
- `client/src/views/admin/tabs/BusinessControlsTab.vue` — current controls and save behavior
- `client/src/configs/availabilitySettings/types.ts`, `shared/types/calendarTypes.ts`, `shared/types/availabilityTypes.ts` — types to extend or integrate
- New or updated: shared types for `OrganizationDefaults` (or equivalent), resolver module(s) (`resolveBusinessNumericPolicy` / `resolve*`), admin tab or section for organization defaults
- Server: routes/models/migrations as needed for persistence (per session 6.14.1 plan)

## Approach
1. **Inventory** — Map each in-scope numeric field to default vs override; confirm merge rules (missing keys, zero vs unset, hold clamping) in session 6.14.1.
2. **Types** — Define nested `OrganizationDefaults` (time/rounding, drive-time fee, holds/admin entry, optional constraint baselines) in the agreed shared layer; keep JSON-serializable.
3. **Resolver** — Implement merge-at-read functions used by booking paths and server validation from a single module; wire call sites for slot grid, rounding, and drive-fee pipeline incrementally or document follow-ups.
4. **Persistence** — Choose new field vs `calendar_settings` / availability JSON; implement or stub with explicit follow-up ticket.
5. **Admin UI** — Add recommended top-level “Organization defaults” or “Policies” tab with sub-sections mirroring types; badge “using org default” where it helps.
6. **Quality** — Client lint and app start pass; automated tests for resolver follow project test policy (deferred until Phase 3.0 unless session plan explicitly adds harness-allowed work).

## Checkpoint
- Shared types and resolver exist; booking read paths use resolved values or a documented wiring follow-up
- Admin can edit organization defaults in the dedicated surface
- Persistence strategy is documented and implemented or stubbed with a clear follow-up
- No silent fallbacks in resolution; governance playbooks respected for touched code

## How we build the tierDown to achieve them
- **Session 6.14.1:** Organization defaults & resolved numeric policy — foundation (complete; see session outcome for deferrals)
- **Session 6.14.2:** Resolver breadth, validation parity, org-default UX — closes phase 6.14
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/feature-appointment-workflow-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/phases/phase-6.13-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
