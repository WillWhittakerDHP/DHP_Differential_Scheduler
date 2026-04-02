# Session 20.4.3: Slot shape + time axis

## Completed Tasks

### Task 20.4.3.1: Slot shape + differential offsets (placement-only API) ✅

**Completed:** 2026-04-02  
**Goal:** Remove **`mergedRoleOverrides`** from **`calculateSlotShape`** and **`computeDifferentialOffsetsFromMaps`**; differential offsets use placement-only **`resolvePrimarySecondaryEventShapesForBooking`**.  
**Code:** `0bce245d` — `[task 20.4.3.1] completion`.

### Task 20.4.3.2: Time axis (omit empty `differentialEventRoleOverrides`) ✅

**Completed:** 2026-04-02  
**Goal:** Stop setting / threading **`differentialEventRoleOverrides`** on booking **`AppointmentShape`**; **`applyShapeToTime`**, **`derivePerspective`**, minimizer / availability helpers use placement-only resolution.  
**Code:** `661ea0ce` — `[task 20.4.3.2] completion` (`appointmentSlotBuilder`, `perspectiveResolver`, `appointmentSlotsComputeds`, `minimizerSchedulingBounds`, `availabilityStepData`, `minimizerEventShapes`).  
**Next step:** Cascade **`/session-end 20.4.3`**.

<!-- end excerpt session -->
