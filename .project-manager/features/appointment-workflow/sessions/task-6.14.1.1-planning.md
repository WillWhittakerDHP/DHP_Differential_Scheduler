# Plan: task 6.14.1.1 — Types, resolver core, inventory, persistence decision

## Contract
- **Tier:** task | **ID:** 6.14.1.1
- **Scope:** Shared types + merge/resolver core + field inventory doc + persistence strategy (minimal stub only if agreed)
- **Governance:** Function and type playbooks; explicit return types on exported resolver functions

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function, types
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Task 6.14.1.2 owns admin UI and broad wiring; this task delivers the data layer contract.

## Where we left off
Session 6.14.1 started; this is the first task in the session.

## Goal
Define **JSON-serializable `OrganizationDefaults`** (and related input types for calendar/availability overrides), document a **field inventory** mapping each in-scope numeric control to default vs override semantics, implement **pure `resolveOrganizationNumericPolicy`** (and small merge helpers) that merge organization defaults with a partial override payload, and **record a persistence decision** (where org defaults live, how they align with `BusinessControlsTab.vue` save paths) with optional **minimal server/client stub** only if needed to compile—no full admin UI in this task.

## Files
- New: `shared/types/organizationDefaults.ts` (or equivalent under `shared/types/` per type playbook)
- New: resolver module — e.g. `shared/utils/resolveOrganizationNumericPolicy.ts` or `shared/organization/resolveNumericPolicy.ts` (pure functions, client + server importable)
- Reference-only reads: `client/src/configs/availabilitySettings/types.ts`, `shared/types/calendarTypes.ts`, `shared/types/availabilityTypes.ts`, `client/src/views/admin/tabs/BusinessControlsTab.vue` (save split — inform persistence doc only)
- Server (optional this task): types re-export or thin wrapper if the server cannot import the same path; migration/API **only** if explicitly in scope after persistence decision and localhost DB policy allows execution

## Approach
1. **Written inventory** — Table or structured comment in the types file or adjacent markdown note: each field from session appendix (minute increment, rounding, drive fee, holds, admin entry, baseline constraints) → default source vs override path → merge rule (unset vs zero, clamping).
2. **Types** — Nested groups: `timeAndRounding`, `driveTimeFee`, `holdsAndAdminEntry`, optional `constraintBaselines`; define `ResolvedNumericPolicy` (or similar) output type.
3. **Resolver** — Single entry `resolveOrganizationNumericPolicy(orgDefaults, overrides): ResolvedNumericPolicy` with small helpers if needed; stay under governance complexity thresholds; use project logger only if catching unexpected shapes at boundaries.
4. **Persistence decision** — One subsection in planning or a short `docs/` or session note: recommended storage (JSON column vs `calendar_settings` vs new table), API shape sketch, follow-up ticket ID or session log line if not implementing DDL this task.
5. **Stub** — If required for integration, add noop or read-through placeholder export used later by 6.14.1.2—no new admin components here.

## Checkpoint
- Types compile across client and server consumers that will import them (or documented import path)
- Resolver is unit-testable in principle (pure); automated tests still deferred per project policy unless explicitly enabled
- Field inventory and persistence decision are written down for task 6.14.1.2
- `cd client && npm run lint` clean for touched files; app starts

## Design Before Execute
- **Inputs:** `OrganizationDefaults` + partial `CalendarNumericOverrides` (name TBD) merged deterministically.
- **Output:** One resolved struct used by booking for minute increment, rounding, drive fee numbers, hold minutes, etc.
- **Edge cases:** Document handling for missing keys; distinguish `undefined` from `0` where business rules require it; hold min/max clamping called out in inventory.

## Persistence decision (recorded)
- **Storage:** Prefer a dedicated JSON column on the organization (or tenant) row, e.g. `organization_defaults` JSONB, holding `OrganizationDefaults`. Alternative: nest under existing org-level settings if one exists; avoid duplicating the same numbers in `calendar_settings` long term—calendar should hold **overrides** only where they differ from org defaults.
- **API:** GET/PUT org defaults alongside other org admin settings; keep `calendar_settings` / availability payloads as today for per-calendar overrides. Merge at read in API responses for computed availability **or** in shared resolver on client after fetch—server validation should call the same `resolveOrganizationNumericPolicy` for authoritative numbers.
- **Alignment with `BusinessControlsTab.vue`:** When adding the Organization defaults tab (6.14.1.2), add a save handler that persists the JSON blob and reuses the same split as constraints vs calendar vs wizard—exact route wiring is a follow-up; no migration run from this task unless `DB_HOST` is localhost and the session explicitly runs DDL.
- **DDL:** Deferred until 6.14.1.2 or a dedicated migration task; authoring a migration file without executing against remote DB is allowed per project policy.

**Implemented code:** `shared/types/organizationDefaults.ts` (types + FIELD_INVENTORY), `shared/utils/resolveOrganizationNumericPolicy.ts` (`resolveOrganizationNumericPolicy`).

---
## Reference (read before filling slots — governance and inventory compliance is required)
- Session plan: `.project-manager/features/appointment-workflow/sessions/session-6.14.1-planning.md`
- Phase guide: `.project-manager/features/appointment-workflow/phases/phase-6.14-guide.md`
- Governance reports: `client/.audit-reports/`
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`
