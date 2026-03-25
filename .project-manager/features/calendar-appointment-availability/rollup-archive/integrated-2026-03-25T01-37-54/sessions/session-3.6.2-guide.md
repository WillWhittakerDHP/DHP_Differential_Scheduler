---
name: differentialRole field and moveable modal re-enablement
overview: Add differentialRole enum column to event_shapes (server migration + model), update client types/configs, add getEventShapeByRole() utility, update 9 consumer files to use role-based resolution, and re-enable the moveable parts scheduling modal trigger.
---

# Session 3.6.2: differentialRole Field and Moveable Modal Re-enablement

**Date:** 2026-02-23
**Phase:** 3.6 — differentialRole with moveable
**Status:** In Progress

## Session Goal

Replace indirect attendee-matching and name-based fallback role resolution with a direct `differentialRole` field on EventShape, then re-enable the moveable parts scheduling modal that depends on role-based detection.

## Tasks

### Task 3.6.2.1: Server migration and model update
**Status:** Not Started

Create the database migration and update the Sequelize model:
- New migration: `ALTER TABLE event_shapes ADD COLUMN differential_role varchar(12) DEFAULT NULL`
- UPDATE existing rows (Total Time -> major, Client Presentation -> minor, Moveable Part -> moveable)
- Seed `admin_metadata` for the new field (render_as: select, options: Major/Minor/Moveable/None)
- Update `server/src/db/models/booking/event_shape.ts` with column declaration and init

**Files:**
- `server/src/db/migrations/YYYYMMDDHHMMSS-add-differential-role-to-event-shapes.ts` (new)
- `server/src/db/models/booking/event_shape.ts`

### Task 3.6.2.2: Client types and configs
**Status:** Not Started

Add `differentialRole` to the client-side type system and admin UI configs:
- `client/src/types/entities.ts` — Add `differentialRole: 'major' | 'minor' | 'moveable' | null` to `EventShapeEntity`
- `client/src/configs/field/form/appliedForm/eventShapeFields.ts` — Add form field config (select with 4 options)
- `client/src/configs/field/display/appliedDisplay/eventShapeDisplays.ts` — Add display config

**Files:**
- `client/src/types/entities.ts`
- `client/src/configs/field/form/appliedForm/eventShapeFields.ts`
- `client/src/configs/field/display/appliedDisplay/eventShapeDisplays.ts`

### Task 3.6.2.3: Core resolution utility and consumer file updates
**Status:** Not Started

Add `getEventShapeByRole()` to `eventAttendeeUtils.ts`, then update all 9 consumer files to use `differentialRole`-first resolution with attendee-matching fallback:
- `client/src/utils/eventAttendeeUtils.ts` — New function + deprecate old helpers
- `client/src/utils/booking/perspectiveResolver.ts` — `resolveEventShapes()`
- `client/src/utils/differentialScheduling.ts` — `resolveMajorMinorEventFinals()`
- `client/src/utils/booking/partFinalizer.ts` — differential offset calculation
- `client/src/utils/booking/availabilityStepData.ts` — selected time slot building
- `client/src/utils/booking/appointmentSlotBuilder.ts` — `applyShapeToTime`
- `client/src/composables/booking/useTimeSlotCalculations.ts` — major/minor duration
- `client/src/composables/booking/useMoveablePartsScheduling.ts` — moveable detection + major time range
- `client/src/composables/booking/useAppointmentSlots.ts` — graph bar building
- `client/src/configs/eventPerspectiveLabels.ts` — if it uses attendee-based lookup

**Files:** 10 files listed above

### Task 3.6.2.4: Re-enable moveable modal trigger and verify
**Status:** Not Started

Re-enable the moveable parts scheduling modal and verify the full stack:
- `client/src/composables/booking/useAvailabilityStepHandlers.ts` — Replace disabled comment with `hasMoveableParts` check and `openMoveableModal()` call
- Verify: TypeScript compiles, linting passes, app starts
- Verify: Event shapes render with new field in admin UI
- Verify: Moveable modal opens when moveable parts detected

**Files:**
- `client/src/composables/booking/useAvailabilityStepHandlers.ts`

## What Already Works (No Changes Needed)

- `MoveablePartsModal.vue` — Full UI with contingency questions, slot selection, confirm/cancel
- `minimalSlotGenerator.ts` — Generates time slots in range
- `confirmedMoveableScheduling` ref in `useAvailabilityOrchestrator.ts` — Flows into step data
- `handleMoveableConfirm` / `handleMoveableCancel` — Both fully implemented

## What Stays the Same

- `differentialPerspectives.majorAttendees` / `minorAttendees` in business settings
- `EventShapeAttendee` relationship for calendar invite attendees
- `isTernary` / `ternaryDefault` fields
- Server-side availability computation
- `MoveablePartsModal.vue` component itself
