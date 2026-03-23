# Plan: task 6.14.2.1 — Audit + server wiring and validation parity

## Contract
- **Tier:** task | **ID:** 6.14.2.1
- **Scope:** Server-side audit of numeric policy reads; wire `resolveNumericPolicyForAvailabilityAndCalendar` where validation or routes still use raw availability/calendar numbers; document intentional exceptions in `phases/phase-6.14-handoff.md` (short bullets).
- **Governance:** Function playbook for touched server code; shared resolver stays pure — thin adapters in services/routes.

## Work Profile
- **Execution intent:** implement
- **Action type:** integration
- **Scope shape:** cross_cutting
- **Governance domains:** server, shared
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate

## Where we left off
Session **6.14.2** is active; **6.14.1** already merged policy in `computedAvailabilityService` via `organizationNumericPolicyService`. This task closes the **remaining server** gaps only (not client badges — task 6.14.2.2).

## Goal
Produce an **inventory** of server code paths that read `minuteIncrement`, duration rounding, drive-time fee numbers, holds, or related numeric policy from raw `AvailabilitySettings` / `CalendarSettings` (or parallel shapes) **without** going through `resolveNumericPolicyForAvailabilityAndCalendar` (or an equivalent single merge). For each high-value path (especially **appointment create/update validation**, **slot/step checks**, and any availability-adjacent route that enforces policy): **wire the resolver** so server enforcement matches the computed-availability pipeline. Where a path must stay raw (e.g. persisted snapshot on an existing appointment row), **document the exception** in code (one-line comment) and in phase handoff.

## Files
- `server/src/services/organizationNumericPolicyService.ts` — canonical merge export; extend helpers if a route needs policy without repeating merge logic.
- `server/src/services/computedAvailabilityService.ts` — reference implementation for “correct” merge usage.
- **Audit targets (grep-driven, refine as found):** `server/src/routes/internal/` (appointments, availability, business settings), any `*validation*`, `*slot*`, middleware that compares times to admin limits.
- `shared/utils/resolveOrganizationNumericPolicy.ts`, `shared/utils/calendarNumericOverridesFromSettings.ts` — only if types or merge inputs need adjustment (prefer thin server wrappers).

## Approach
1. **Grep inventory** — Search for reads of fields like `minuteIncrement`, `durationRounding`, `driveTimeFee`, `holdDuration`, `adminEntryTimeout` on availability/calendar payloads outside `organizationNumericPolicyService` / `computedAvailabilityService`.
2. **Triage** — Classify each hit: (a) should use resolver, (b) truly independent (document), (c) dead/test-only.
3. **Wire** — For (a): load `AvailabilitySettingsData` + `CalendarSettingsData` (or existing repo helpers), call `resolveNumericPolicyForAvailabilityAndCalendar`, use `ResolvedNumericPolicy` fields in validation comparisons.
4. **Log** — Per coding standards: no empty catches; use project logger for unexpected merge/load failures where appropriate.
5. **Handoff** — Append a short “Server exceptions — 6.14.2.1” subsection to `phases/phase-6.14-handoff.md` listing any documented (b) paths.

## Design before execute (pseudocode)
```
// In a validation handler that currently uses availability.minuteIncrement:
const policy = await resolveNumericPolicyForAvailabilityAndCalendar(availability, calendar)
const step = policy.timeAndRounding.minuteIncrement // or actual field path on ResolvedNumericPolicy
// compare step against requested slot granularity
```

## Checkpoint
- Grep inventory captured (comments or a short list in handoff).
- All triaged “should use resolver” paths on the server wired or explicitly deferred with written rationale.
- **No** change to client admin UI in this task (that is 6.14.2.2).
- `cd server && npm run lint` passes for touched files.

---
## Reference (read before execute — governance and inventory compliance is required)
- Session guide: `.project-manager/features/appointment-workflow/sessions/session-6.14.2-guide.md` (Task 6.14.2.1 block)
- Session planning: `.project-manager/features/appointment-workflow/sessions/session-6.14.2-planning.md`
- Phase handoff (update): `.project-manager/features/appointment-workflow/phases/phase-6.14-handoff.md`
- Governance reports: `client/.audit-reports/` (server-side function governance still applies; check server lint)
- Playbooks: `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`
