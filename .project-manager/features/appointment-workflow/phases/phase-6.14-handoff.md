# Phase 6.14 Handoff

**Purpose:** Transition context between phases (large-scale concerns only)

**Tier:** Phase (Tier 1 - High-Level)

**Last Updated:** 2026-03-23
**Phase Status:** In Progress (session **6.14.3** planned — deferred work from 6.14.2: exhaustive audit, optional badges, Phase 3.0 test checklist)
**Next session in phase:** **6.14.3** (see `sessions/session-6.14.3-planning.md`)

---

## Current Status

**Phase 6.14:** In Progress (session **6.14.3** not started)  
**Last completed session:** **6.14.2** (resolver breadth, client rounding alignment, server hold/timeout merge) — see *Session 6.14.2 closeout* below  
**Prior session:** 6.14.1 (foundation — types, resolver, persistence, admin surface, computed-availability merge on server)  
**Next session:** **6.14.3** — exhaustive audit, optional legacy badges, Phase 3.0 test documentation  
**Next phase after 6.14 closes:** 6.15 (see feature guide) — **do not** start until **`/phase-end 6.14`** when success criteria are met.

**If** you accept **6.14.2** as “done enough” for the harness without **6.14.3**, you may still run **`/session-end 6.14.2`** / **`/phase-end 6.14`** — but phase guide success criteria will remain partially open until **6.14.3** is completed or explicitly waived in writing.

---

## Transition Context

**Where we left off:**

Session 6.14.1 shipped the shared resolver and org-defaults persistence, but phase-level goals require **broader wiring** (remaining server/booking paths), **validation parity**, and optional **“using org default”** admin affordances. Those items are **not** missing implementation by accident — they were **deferred** and are now tracked as session **6.14.2** (see `sessions/session-6.14.1-planning.md` → *Outcome: delivered vs deferred*).

**Planning note:** Early artifacts listed only one session for phase 6.14; planning docs were **amended** to add **6.14.2** so decomposition matches scope.

**What you need for session 6.14.3:**

- Read `sessions/session-6.14.3-planning.md`, `sessions/session-6.14.3-guide.md`, and `phases/phase-6.14-guide.md` success criteria.
- Audit grep: `resolveOrganizationNumericPolicy`, `resolveNumericPolicyForAvailabilityAndCalendar`, raw availability/calendar numeric reads in `server/src/` and `client/src/` (exhaustive pass vs 6.14.2 primary paths).

**Plan changes affecting downstream:** Phase **6.14** is now a **three-session** decomposition (6.14.1 foundation, 6.14.2 primary wiring, **6.14.3** deferred polish).

### Task 6.14.2.1 (server wiring — 2026-03-23)

- **`getHoldDurationFromSettings`** and **`getAdminEntryTimeoutFromSettings`** (`server/src/routes/internal/appointments/appointmentSettingsHelpers.ts`) now load availability + calendar and call **`resolveNumericPolicyForAvailabilityAndCalendar`**, using **`policy.holdsAndAdminEntry`** for bounds, default hold minutes, and admin entry timeout. This matches the merge used by **`computedAvailabilityService`** and org defaults JSONB. Previously these helpers read **calendar settings only**, which could diverge from merged policy.
- **Documented exceptions:** None for these entry points; calendar-only hold/timeout reads were replaced rather than grandfathered.

### Task 6.14.2.2 (client booking duration rounding — 2026-03-23)

- **Slot shape / `roundDuration` path** now uses the same merge as the server: when availability settings are loaded, **`useAppointmentShape`** fetches organization defaults + calendar settings in parallel and builds **`resolveOrganizationNumericPolicy`** via **`resolveBookingNumericPolicyFromLoadedData`** (`client/src/utils/booking/resolveBookingNumericPolicyClient.ts`). **`buildRoundedDurationMap`** / **`calculateSlotShape`** accept optional **`resolvedTimeRounding`**; **`roundDurationFromResolvedTimeRounding`** (`durationRounding.ts`) applies merged `timeAndRounding` instead of raw `AvailabilitySettings` only.
- **`calculateAppointmentSlots`** can take optional **`resolvedTimeRounding`** for callers that load merged policy themselves; otherwise behavior falls back to availability-only rounding (unchanged).
- **Admin “using org default” badges** on Calendar panels: **deferred** to **session 6.14.3** (optional scope).

### Task 6.14.2.3 (docs + quality gate — 2026-03-23)

- **Phase / session docs** updated; **client + server lint** run as part of closeout.
- **Explicit deferrals (unchanged):** optional admin “org default” badges; **resolver unit tests** remain Phase 3.0 per project policy.

### Session 6.14.2 closeout

**Delivered (merged policy alignment):**

- **6.14.1:** Computed availability service merge-at-read; org defaults JSONB + admin surface.
- **6.14.2.1:** `getHoldDurationFromSettings` / `getAdminEntryTimeoutFromSettings` use **`resolveNumericPolicyForAvailabilityAndCalendar`** (availability + calendar + org defaults).
- **6.14.2.2:** Client **`useAppointmentShape`** resolves **`timeAndRounding`** via shared merge (`resolveBookingNumericPolicyFromLoadedData`) for **duration rounding** / slot shape; `calculateAppointmentSlots` accepts optional merged rounding.

**Documented exceptions / follow-ups:**

- **Optional** “using org default” UI on legacy Calendar/Availability panels — **not shipped**; tracked as **session 6.14.3**.
- **Exhaustive** audit of every remaining numeric read in the repo — not claimed in 6.14.2; primary booking + validation paths above are aligned. **Session 6.14.3** owns the exhaustive pass (wire or document).

### Session 6.14.3.1 — exhaustive audit (2026-03-23)

**Goal:** Inventory remaining **booking-relevant** numeric policy reads; wire merged policy or document **exempt** paths (admin persistence, validation of stored documents, incremental `constraintBaselines`).

| Area | Location / pattern | Action |
|------|-------------------|--------|
| Server — computed slots | `computedAvailabilityService.ts` | **Aligned** — `resolveNumericPolicyForAvailabilityAndCalendar` before slot computation; response built from merged `settingsWithResolvedNumericPolicy`. |
| Server — API response shape | `buildComputedAvailabilityResponse` (`computedAvailabilityResponseHelpers.ts`) | **Aligned** — `minuteIncrement` / `durationRounding` come from merged settings object passed by caller. |
| Server — hold / admin timeout | `getHoldDurationFromSettings`, `getAdminEntryTimeoutFromSettings` (`appointmentSettingsHelpers.ts`) | **Aligned** (6.14.2) — merged policy. |
| Server — slot math | `slotComputationService.ts` | **Aligned** — receives `minuteIncrement` as parameters from merged pipeline (no independent policy read). |
| Server — persistence / codec | `availabilityRelationalCodec.ts`, `availabilityPersistenceChunks.ts`, validators | **Exempt** — map DB rows to/from `AvailabilitySettingsData`; validate saved payloads. Not runtime merge for booking. |
| Server — org defaults API | `organizationNumericPolicyService.ts`, `organizationDefaults*` routes | **Resolver infrastructure** — not booking consumers. |
| Client — computed availability fetch | `computedAvailabilityFetchCore.ts` | **Aligned** — reflects server response (already merged on server). |
| Client — appointment shape / rounding | `useAppointmentShape.ts` | **Aligned** (6.14.2) — `resolveBookingNumericPolicyFromLoadedData` for `timeAndRounding`. |
| Client — confirmation fee / drive line | `useConfirmationStepData.ts` | **Wired (6.14.3.1)** — loads org defaults + calendar in parallel with availability; uses `resolveBookingNumericPolicyFromLoadedData` → `driveTimeFee` for `buildConfirmationPriceData`, with fallback to raw availability `driveTimeFee` if merge fails. |
| Client — orchestrator minute increment fallback | `useAvailabilityOrchestratorPostFetchPhase.ts` (`computedAvailability…minuteIncrement ?? 15`) | **Aligned** — uses computed-availability payload from server (merged), not a separate raw merge. |
| Client — after-appointment buffer | `useAfterAppointmentBufferMinutes.ts` | **Exempt** — reads `buffers.appointment` from persisted availability settings for orchestration timing; org-level **constraintBaselines** buffer merge is not in scope for this pass (see `FIELD_INVENTORY` in `organizationDefaults.ts`). |
| Client — admin Business Controls | `useBusinessControlsFormState`, grid/duration panels, `BusinessControlsOrganizationSection` | **Exempt** — edit stored org/availability documents, not wizard booking merge. |

**Grep follow-up:** Re-run when adding new booking or fee features: `minuteIncrement`, `durationRounding`, `driveTimeFee`, `resolveNumericPolicyForAvailabilityAndCalendar`, `resolveBookingNumericPolicyFromLoadedData`.

---

## Phase Summary

**Sessions completed:** 6.14.1, 6.14.2  
**Sessions remaining:** **6.14.3** (optional polish + exhaustive audit + Phase 3.0 test checklist in docs)

**Key accomplishments (6.14.1):**

- `OrganizationDefaults` types; `resolveOrganizationNumericPolicy`; JSONB persistence; admin API and Business Controls organization surface; merge-at-read on computed availability service path.

**Key accomplishments (6.14.2):**

- Server hold/admin-timeout helpers merged; client slot-shape rounding merged; documentation and lint gate for phase close.

**Decisions:**

- Optional badges, exhaustive audit, and automated resolver tests deferred to **session 6.14.3** per scope / Phase 3.0 policy.

---

## Related Documents

- Phase guide: `phases/phase-6.14-guide.md`
- Phase log: `phases/phase-6.14-log.md`
- Session 6.14.2 planning: `sessions/session-6.14.2-planning.md`
- Session 6.14.3 planning: `sessions/session-6.14.3-planning.md`

---

## Next Action

1. If not already done: run **`/session-end 6.14.2`** to roll up session 6.14.2.  
2. Start **`/session-start 6.14.3`** (feature `appointment-workflow`) to work deferred scope.  
3. When **6.14.3** is complete and phase success criteria are satisfied, run **`/session-end 6.14.3`** then **`/phase-end 6.14`**.  
4. Do **not** start phase **6.15** until phase 6.14 is ended in the harness (unless you explicitly waive remaining 6.14.3 criteria in writing).

<!-- harness-across-ladder:start -->
## Across ladder (harness)

_Auto-updated from disk guides. Agents: prefer `across-ladder.json` for checks._

- **Feature:** `appointment-workflow` · **Source:** session_end · **Derived:** 2026-03-23T17:51:08.330Z
- **Phases on disk (14):** 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11, 6.12, 6.13, 6.14, 6.17
- **Focus phase:** `6.14` · **Next phase across:** `6.17` → `/phase-start 6.17`
- **Focus session:** `6.14.3` · **Session 3/3 in phase** · **Next session across:** _(then /phase-end)_
- **Tasks in session (detected):** 3 · **Next task across:** `6.14.3.1` → `/task-start` / cascade
- **Manifest:** `.project-manager/features/appointment-workflow/across-ladder.json`
<!-- harness-across-ladder:end -->
