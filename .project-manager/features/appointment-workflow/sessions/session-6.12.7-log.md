# Session 6.12.7: Booking and scheduling refinements

## Session status

**Status:** Complete (retro-documented)  
**Phase:** 6.12  
**Last updated:** 2026-03-21

---

## Completed tasks

### Task 6.12.7.1: Moveable parts, cascades, differential scheduling, time slots

**Goal:** Keep booking composables and pure utilities consistent with annotation slot resolution and block-owned event assignments: moveable scheduling bounds, cascade filter pipeline, `partFinalizer` / `perspectiveResolver` / `differentialScheduling`, time-slot and availability step data (`useTimeSlotCalculations`, `useMoveablePartsScheduling`, `appointmentSlotBuilder` consumers). No separate design doc — cross-cutting alignment with sessions 6.12.2, 6.12.4, 6.12.5.  
**Planning:** `sessions/task-6.12.7.1-planning.md`

---

## Test status

Manual: wizard time grids, moveable parts path, cascade filtering after event/annotation changes.

---

## Technical reference (backfill)

### Scope

Branch work that **tightened** booking math and filtering alongside entity/relationship changes elsewhere in phase 6.12. Document by **code areas** rather than a single feature flag.

### Representative modules

- `client/src/utils/booking/partFinalizer.ts`, `perspectiveResolver.ts`, `moveableSchedulingBounds.ts`, `cascadeFilterPipeline.ts`, `differentialScheduling.ts`, `appointmentSlotBuilder.ts`, `availabilityStepData.ts`
- Composables: `useTimeSlotCalculations.ts`, `useMoveablePartsScheduling.ts`, `useAppointmentSlots.ts`, `useWizardFilteredOptions.ts`

### Dependency on other sessions

- **6.12.2:** Annotation UI payload on booking blocks.
- **6.12.4:** Event assignment parent = block instance.
- **6.12.5:** Differential role overrides on block instance.

### Maintenance

When changing event or annotation graphs, re-run manual smoke on **moveable** grid and **cascade** filters.

<!-- end excerpt session -->
