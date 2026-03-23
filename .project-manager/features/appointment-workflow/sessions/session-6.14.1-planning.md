# Plan: session 6.14.1 — Organization defaults & resolved numeric policy (availability + calendar)

## Contract
- **Tier:** session | **ID:** 6.14.1
- **Scope:** Organization defaults + merge-at-read resolver + persistence + admin surface
- **Governance:** Read type/composable/function playbooks before touching shared types and admin UI

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** cross_cutting
- **Governance domains:** client, server, shared types
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Guide owns task detail; this doc sets boundaries and task order.

## Where we left off
Phase 6.14 started; session 6.14.1 is the first session in the phase.

## Goal
Ship a canonical **organization defaults** model and **merge-at-read** resolver so numeric policy (minute grid, duration rounding, drive-time fee, holds, admin entry timeout, and optional constraint baselines) resolves in one place for client booking paths and server validation—no silent Vue-only fallbacks. Deliver shared types, resolver module(s), a documented persistence strategy (with implementation or explicit stub + follow-up), a dedicated admin surface for org defaults, and wiring to key read paths—or documented follow-ups where wiring is large.

## Files
- `shared/types/` — new or extended types for `OrganizationDefaults` (nested groups: time/rounding, drive-time fee, holds/admin entry, optional constraint baselines); JSON-serializable
- Resolver module (e.g. `shared/` or `client/src/utils/` + server mirror per project conventions) — `resolveBusinessNumericPolicy` or focused `resolve*` functions
- `client/src/views/admin/tabs/BusinessControlsTab.vue` — tab routing and save split alignment
- New admin components or tab for “Organization defaults” / “Policies” under business controls
- `client/src/configs/availabilitySettings/types.ts`, `shared/types/calendarTypes.ts`, `shared/types/availabilityTypes.ts` — integrate with existing shapes
- Server: models/routes/migrations as needed for chosen persistence (only when `DB_HOST` is localhost per project migration policy for this workspace)

## Approach
1. **Inventory** — Map fields in scope (from phase session doc) to default vs calendar override; document merge rules (missing keys, zero vs unset, hold clamping).
2. **Types** — Define `OrganizationDefaults` and inputs for merge (defaults + calendar/availability slice).
3. **Resolver** — Implement pure merge/resolve functions; single source for slot grid, rounding, drive fee reads; add logging for invalid combinations per coding standards (no silent swallow).
4. **Persistence** — Choose storage (new column, JSON blob, or existing `calendar_settings`); implement or stub with explicit follow-up ticket in session log.
5. **Admin UI** — Add tab/section with sub-groups mirroring types; load/save through existing API patterns; optional “using org default” badges on legacy panels as time allows.
6. **Wiring** — Connect resolver at highest-value read sites (e.g. minute increment, drive fee) or list follow-up tasks in handoff.
7. **Quality** — `cd client && npm run lint`; app starts; automated tests deferred to Phase 3.0 unless explicitly unblocked.

## Checkpoint
- Types and resolver exist and are used by at least one booking read path **or** a written follow-up lists remaining call sites
- Admin can view/edit organization defaults in the new surface (or stub documented with blocker)
- Persistence strategy is documented; DB changes only when local migration policy allows
- No silent fallbacks; client lint passes; app starts

## How we build the tierDown to achieve them
- **Task 6.14.1.1:** Types, resolver core, field inventory, and persistence decision (documented + minimal API/model if applicable)
- **Task 6.14.1.2:** Admin UI for org defaults, save/load, resolver wiring to key paths or documented follow-ups, lint and app start

---
## Reference (read before filling slots — governance and inventory compliance is required)
- Phase guide: `.project-manager/features/appointment-workflow/phases/phase-6.14-guide.md`
- Governance reports: `client/.audit-reports/`
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

---

## Appendix — field inventory (scope reminder)

**Time grid & rounding:** `minuteIncrement`, `durationRounding` (enabled, increment, method), `driveTimeFee.driveTimeRoundingMinutes`.

**Drive-time billing:** `driveTimeFee.complimentaryDriveMinutes`, `driveTimeFee.drivingRatePerHour`.

**Holds & admin entry:** `holdDurationMinutes`, min/max/fallback, `adminEntryTimeout`.

**Constraint baselines (candidates):** lead time minutes, overlap buffer minutes, capacity `maxHours` / `maxIncome`.

**Out of scope unless pulled in:** wizard copy-only settings, pure non-numeric toggles, MLS tab rules not tied to numeric policy.
