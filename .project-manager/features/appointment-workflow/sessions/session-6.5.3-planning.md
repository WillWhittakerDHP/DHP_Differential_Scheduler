# Plan: session 6.5.3 — ** Original-Inspection UI

## Contract
- **Tier:** session | **ID:** 6.5.3
- **Scope:** ** Original-Inspection UI
- **Governance:** 4 governance highlights — read reports before filling slots

## Where we left off
Session 6.5.2 — Availability Bypass. `reschedulingAppointmentId` in computed-availability request; server excludes that appointment's calendar event from overlap while keeping it in calendarEvents. - Review session guide tasks (6.5.2.1, 6.5.2.2, 6.5.2.3) - Phase 6.5 guide: `phases/phase-6.5-guide.md`

## Goal
Make the original inspection slot (the slot that matches the loaded appointment's current time when rescheduling) visually distinct (e.g. `appointment-slot-btn--original-inspection`) while keeping it selectable. User can see which slot is their current appointment and may keep it or pick another.

## Files
- `client/src/components/booking/AppointmentSlotGrid.vue` — add `appointment-slot-btn--original-inspection` class when slot is the original
- `client/src/components/booking/AppointmentSlotGrid.scss` — add styles for `--original-inspection` (distinct color/overlay)
- `client/src/composables/booking/useAvailabilityOrchestrator.ts` — compute `originalInspectionButtonIndex` when reschedule mode + loaded state + date match
- `client/src/components/booking/steps/AvailabilityStep.vue` — pass `originalInspectionButtonIndex` to AppointmentSlotGrid
- `client/src/utils/booking/timeSlotMatching.ts` — reuse or extend for slot-to-loaded-time comparison (if needed)

## Approach
1. **Compute original-inspection slot:** In orchestrator, when `wizardMode === 'reschedule'` and `loadedWizardState` has availability data, and `selectedDate` matches `loadedWizardState.availability.candidateDate.start`, find the slot whose `startTime` matches `loadedWizardState.availability.candidateTimeSlots[0].time` (first/inspector slot). Use existing `timeSlotMatching` or normalize both for comparison. Return `buttonIndex` or `null`.
2. **Pass to grid:** Add `originalInspectionButtonIndex?: number | null` prop to AppointmentSlotGrid; AvailabilityStep passes it from orchestrator.
3. **Apply class:** In AppointmentSlotGrid, add `'appointment-slot-btn--original-inspection': slotData.buttonIndex === originalInspectionButtonIndex` to the button's `:class`.
4. **Style:** Add `.appointment-slot-btn--original-inspection` in AppointmentSlotGrid.scss — distinct but not disabled (e.g. different border/background tint, optional "Current" label). Slot remains selectable (`:disabled` unchanged).
5. **Governance:** Keep components thin; matching logic in composable or util. Follow component/composable playbooks.

## Checkpoint
- Reschedule flow: load appointment, go to Availability step, select same date as appointment; the slot matching the current appointment time shows distinct styling (e.g. `appointment-slot-btn--original-inspection`).
- Slot is still clickable and selectable; selecting it keeps the same time.
- No regression for new-booking or quote flows (no original-inspection styling).

## Tasks (enumerated for cascade)
- **Task 6.5.3.1:** Compute original-inspection slot and pass to grid
- **Task 6.5.3.2:** Add original-inspection class and styles
- **Task 6.5.3.3:** Verify end-to-end original-inspection UI

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/phases/phase-6.5-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/session-6.5.2-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
