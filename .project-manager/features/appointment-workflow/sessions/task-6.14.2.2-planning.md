# Plan: task 6.14.2.2 — Client booking alignment + optional admin badges

## Contract
- **Tier:** task | **ID:** 6.14.2.2
- **Scope:** Client-side numeric policy alignment with merged org defaults + availability + calendar; optional “using org default” hints on Business Controls calendar/confirmation surfaces.
- **Governance:** Composable + component playbooks; thin Vue; explicit return types on new composable exports.

## Work Profile
- **Execution intent:** implement
- **Action type:** integration
- **Scope shape:** cross_cutting
- **Governance domains:** client, shared
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate

## Where we left off
Task **6.14.2.1** wired server hold/admin-timeout helpers to **`resolveNumericPolicyForAvailabilityAndCalendar`**. This task addresses the **client** side: booking utilities that still derive rounding from raw **`AvailabilitySettings`** only, and optional admin UX for org-default awareness.

## Goal
1. **Booking alignment** — Where the client computes duration rounding or other numeric policy **without** calling the computed-availability API, ensure inputs match the **same merge** as the server (`resolveOrganizationNumericPolicy` + `buildCalendarNumericOverridesFromAvailabilityAndCalendar` + org defaults). Prefer **reusing shared** `@shared/utils` with org defaults loaded from the existing **`GET /organization-defaults`** (or `useAdminOrganizationDefaults` pattern) plus availability + calendar settings already fetched in the booking/admin pipeline.
2. **Primary gap (audit):** **`roundDuration` / `getRoundingConfig`** in `client/src/utils/booking/durationRounding.ts` use raw `AvailabilitySettings` — can diverge from merged policy when org defaults differ from stored availability rows.
3. **Admin badges (optional, minimal)** — On **Calendar → Confirmation & Holds** (`AppointmentConfirmationPanel` / `BusinessControlsCalendarSection`), show a compact hint (e.g. VChip or caption) when a hold field matches the **organization default** snapshot (compare `OrganizationDefaults.holdsAndAdminEntry` to `formState` for calendar holds), without duplicating the Organization tab layout.

## Files
- **Shared (already exist):** `shared/utils/resolveOrganizationNumericPolicy.ts`, `shared/utils/calendarNumericOverridesFromSettings.ts`
- **Client booking:** `client/src/utils/booking/durationRounding.ts`, `client/src/utils/booking/partFinalizerSlotShapeHelpers.ts`, `client/src/utils/booking/partFinalizerSlotShape.ts` — trace callers; pass resolver-backed settings or a thin `ResolvedNumericPolicy` slice for time/rounding.
- **Org defaults API:** `client/src/configs/organizationDefaults/api.ts`, `client/src/composables/admin/useAdminOrganizationDefaults.ts` — pattern for loading org defaults; booking may need a **read-only** fetch or shared singleton to avoid N+1 (use existing patterns).
- **Calendar settings:** `client/src/configs/` calendar or business controls loaders — pair with availability for merge inputs.
- **Admin UI:** `client/src/views/admin/tabs/BusinessControlsCalendarSection.vue`, `client/src/views/admin/tabs/components/AppointmentConfirmationPanel.vue` (or equivalent) — badges only if low-risk.

## Approach
1. **Inventory** — Grep `client/src/composables/booking` and `client/src/utils/booking` for `minuteIncrement`, `durationRounding`, `roundDuration`, raw `settings.` without computed availability.
2. **Resolver-backed rounding** — Introduce a small **pure** helper (e.g. `getDurationRoundingConfigFromResolvedPolicy(policy: ResolvedNumericPolicy)`) or pass **`ResolvedNumericPolicy`** into `roundDuration` after `resolveOrganizationNumericPolicy(org, overrides)` on the client. **Single fetch** of org defaults per wizard session where feasible.
3. **Wire** — Update `buildRoundedDurationMap` / `partFinalizerSlotShape` call chain to obtain merged policy (async boundary may require composable-level resolution before calling sync helpers — document pattern in phase handoff if split).
4. **Badges** — If `businessControlsState.organizationDefaults.formData` is available in tab context, compare hold fields to `holdsAndAdminEntry` and show “Matches org default” on matching fields only.
5. **Quality** — `cd client && npm run lint`; note any **documented** exceptions in `phases/phase-6.14-handoff.md`.

## Design before execute (sketch)
```ts
// After loading orgDefaults, availability, calendar:
const overrides = buildCalendarNumericOverridesFromAvailabilityAndCalendar(availability, calendar)
const policy = resolveOrganizationNumericPolicy(orgDefaults, overrides)
// Use policy.timeAndRounding for duration rounding (same as server computed payload)
```

## Checkpoint
- Duration rounding on the client uses **merged** policy for the path that feeds `roundDuration`, **or** the handoff documents why the wizard uses **only** API `computedAvailability` for that value and local rounding is removed.
- Admin badges: implemented **or** explicitly deferred with one line in phase handoff.
- Client lint passes for touched files.

---
## Reference (read before execute — governance and inventory compliance is required)
- Session guide: `.project-manager/features/appointment-workflow/sessions/session-6.14.2-guide.md` (Task 6.14.2.2)
- Prior task: `sessions/task-6.14.2.1-handoff.md`
- Phase handoff: `.project-manager/features/appointment-workflow/phases/phase-6.14-handoff.md`
- Governance reports: `client/.audit-reports/`
- Playbooks: `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`, `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`
