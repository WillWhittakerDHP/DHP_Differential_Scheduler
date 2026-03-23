# Plan: task 6.14.3.1 — Exhaustive grep audit (wire or document exceptions)

## Contract
- **Tier:** task | **ID:** 6.14.3.1
- **Scope:** Full-repo inventory of numeric policy reads (org + availability + calendar) beyond the **primary** paths wired in session **6.14.2**; each site either uses the shared resolver contract or has an explicit written exception in `phases/phase-6.14-handoff.md` (and a short code comment where helpful).
- **Governance:** Function/composable playbooks for any touched code; no silent fallbacks — use `createLogger` in catch paths per project standards.

## Work Profile
- **Execution intent:** implement
- **Action type:** integration
- **Scope shape:** cross_cutting
- **Governance domains:** client, server, shared, docs
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate

## Where we left off
Session **6.14.2** aligned **primary** server validation and client slot-shape rounding with merged policy (see `phases/phase-6.14-handoff.md` → Session 6.14.2 closeout). Task **6.14.3.1** is the **exhaustive** pass: remaining greps for raw numeric policy reads, fee/slot/hold paths, and edge utilities.

## Goal
Produce a **complete audit table** (in phase handoff) of remaining **`server/src/`** and **`client/src/`** call sites that derive **booking-related numeric policy** from availability, calendar, or org defaults **without** using **`resolveOrganizationNumericPolicy`**, **`resolveNumericPolicyForAvailabilityAndCalendar`**, **`resolveBookingNumericPolicyFromLoadedData`**, or API payloads that already embed resolved policy. For each row: **wire** if divergence would affect wizard vs server behavior, or **document** a narrow exception (e.g. historical snapshot, dev-only panel, read-only display) with rationale.

**Out of scope for this task:** optional admin badges (task **6.14.3.2**); Phase 3.0 test files (task **6.14.3.3**).

## Files
- **Shared reference:** `shared/utils/resolveOrganizationNumericPolicy.ts`, `shared/utils/calendarNumericOverridesFromSettings.ts`, `shared/types/organizationDefaults.ts`
- **Server:** `server/src/services/organizationNumericPolicyService.ts`, `server/src/services/computedAvailabilityService.ts`, `server/src/routes/internal/` (appointments, availability, calendar, business), `server/src/routes/internal/appointments/appointmentSettingsHelpers.ts` — grep-driven extensions
- **Client:** `client/src/composables/booking/`, `client/src/utils/booking/` (especially `resolveBookingNumericPolicyClient.ts`, fee/time utilities), admin views that read policy for display
- **Docs (append):** `phases/phase-6.14-handoff.md` — new subsection *Session 6.14.3.1 — exhaustive audit*

## Approach
1. **Structured greps** — Symbols: `resolveOrganizationNumericPolicy`, `resolveNumericPolicyForAvailabilityAndCalendar`, `resolveBookingNumericPolicyFromLoadedData`; then inverse patterns: direct `.minuteIncrement`, `durationRounding`, `driveTime`, `hold`, `adminEntry`, `AvailabilitySettings` / `CalendarConfig` numeric fields in booking/fee paths.
2. **Deduplicate** — Mark sites already covered in 6.14.2 closeout as *verified aligned* without re-work unless code drifted.
3. **Triage** — (a) wire resolver or consume embedded API policy, (b) document exception in handoff + comment, (c) ignore if test-only or non-production.
4. **Wire** — Minimal diffs: prefer existing service helpers; avoid duplicate merge logic.
5. **Handoff** — Table: file/function → policy concern → action (wired / exempt + reason).

## Design before execute (pseudocode)
```
// Pattern for a client composable still using raw availability.settings.minuteIncrement:
// Prefer: resolveBookingNumericPolicyFromLoadedData(orgDefaults, availability, calendar)
//   → policy.timeAndRounding.minuteIncrement
// Or: use server-provided resolved fields from API if already on the payload.
```

## Checkpoint
- `phase-6.14-handoff.md` contains the **audit table** (or explicit “no additional gaps” with grep evidence summarized).
- Any new wiring passes **client + server lint** for touched files (full lint at 6.14.3.3 if this task touches few files, run scoped lint here).
- No empty catch blocks; resolver remains single source of merge semantics.

---
## Reference (read before execute — governance and inventory compliance is required)
- Session guide: `.project-manager/features/appointment-workflow/sessions/session-6.14.3-guide.md` (Task 6.14.3.1)
- Session planning: `.project-manager/features/appointment-workflow/sessions/session-6.14.3-planning.md`
- Phase handoff (update): `.project-manager/features/appointment-workflow/phases/phase-6.14-handoff.md`
- Prior server task pattern: `sessions/task-6.14.2.1-planning.md`
- Governance reports: `client/.audit-reports/`
- Playbooks: `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`
