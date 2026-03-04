# Plan: task 6.5.4.4 — 6.5.4.4

## Contract
- **Tier:** task | **ID:** 6.5.4.4
- **Scope:** 6.5.4.4
- **Governance:** 1 governance highlights — read reports before filling slots

## Where we left off
No prior handoff for this task.

## Goal
Add a "Copy quote link" button in the **booking wizard** that **replaces the Submit button** when viewing an existing quote (quote mode + loaded appointment). The button builds the quote URL via `buildQuoteLink`, copies to clipboard, and shows "Link copied" feedback. Fix wizard persistence so going backwards preserves **all** step selections (Service Selection, Property Details, Contacts, Availability).

## Files
- `client/src/components/booking/BookingWizard.vue` — Show "Copy quote link" instead of Submit when `isQuoteMode && loadedAppointmentId && isLastStep`; on click: buildQuoteLink, clipboard.writeText, success
- `client/src/constants/appointmentsTableConstants.ts` — COPY_QUOTE_LINK, LINK_COPIED (already added)
- `client/src/composables/booking/useAvailabilityDefaults.ts` — Restore selectedDate and slot from parent `availabilityStepData`
- `client/src/composables/booking/useAvailabilityOrchestrator.ts` — Pass `availabilityStepData` to useAvailabilityDefaults
- `client/src/composables/booking/usePropertyFormWatchers.ts` — Accept `restoreFrom`; restore form from parent `propertyDetailsStepData`
- `client/src/composables/booking/useContactsStepData.ts` — Accept `restoreFrom`; restore contacts from parent `contactsStepData`
- `client/src/components/booking/steps/AvailabilityStep.vue` — Inject availabilityStepData and pass to orchestrator
- `client/src/components/booking/steps/PropertyDetailsStep.vue` — Inject propertyDetailsStepData and pass to usePropertyFormWatchers
- `client/src/components/booking/steps/ContactsStep.vue` — Inject contactsStepData and pass to useContactsStepData
- `client/src/views/admin/tabs/components/AppointmentActionsCell.vue` — Copy quote link **removed** (moved to wizard)

## Approach
1. **Wizard:** When `isQuoteMode && loadedAppointmentId && isLastStep`, show "Copy quote link" button instead of Submit. On click: buildQuoteLink(loadedAppointmentId), navigator.clipboard.writeText, success('Link copied').
2. **Admin:** Remove Copy quote link from AppointmentActionsCell (was incorrectly placed there).
3. **Wizard persistence (all steps):**
   - **Availability:** useAvailabilityDefaults accepts `restoreFrom`; restores date/slot from parent availabilityStepData.
   - **Property Details:** usePropertyFormWatchers accepts `restoreFrom`; restores form fields from parent propertyDetailsStepData.
   - **Contacts:** useContactsStepData accepts `restoreFrom`; restores contact refs from parent contactsStepData.
   - **Service Selection:** wizard state (selectedUserTypeBlock, selectedServiceTypeBlocks) persists in parent; no restore needed.

## Checkpoint
- On confirmation step with quote mode + loaded appointment, "Copy quote link" replaces Submit; clicking copies URL and shows "Link copied".
- Going Previous preserves all step selections (Service Selection, Property Details, Contacts, Availability).

## Retroactive fix (included in 6.5.4.4 commit)

**Moveable modal: slot grid not constrained by appointment end + buffer**

The moveable modal's slot grid was showing all server-computed slots for the selected day, including slots that start *before* the selected appointment's end time + appointment buffer. This meant a user could pick a moveable completion time that overlaps with the onsite appointment or its buffer period.

**Root cause:** `useMoveableAvailabilityData` fetched the full day (00:00–23:59) and `useMoveablePartsScheduling` passed the server slots through to `useAppointmentSlots` unfiltered. The `innerBoundary` (major event end time) was computed but never used to filter slot start times. The appointment buffer (placement `'after'` or `'both'`) was only used for the default contingency deadline, not as a slot constraint.

**Fix (2 files, isolated to moveable flow):**
- `useMoveableAvailabilityData.ts` — Always fetch settings (cached) to determine `afterBufferMinutes` based on `buffers.appointment.placement` and `buffers.appointment.minutes`. Exposed as a ref.
- `useMoveablePartsScheduling.ts` — `moveableServerSlotsForDay` now filters out any `ComputedSlot` whose `startTime` is earlier than `innerBoundary + afterBufferMinutes`.

**No impact on:** `extractInnerBoundary`, `moveableOptions.innerBoundary` semantics, `defaultDeadlineTime`, the main availability slot grid, or server-side logic.

## How we build the tierDown
- **Task 6.5.4.1:** URL scheme and router
- **Task 6.5.4.2:** Wizard entry from query
- **Task 6.5.4.3:** Cancel flow
- **Task 6.5.4.4:** Copy quote link button
- **Task 6.5.4.5:** Invite template variables (optional)
- **Task 6.5.4.6:** Verification and docs

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.5.4-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.5.4.3-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
