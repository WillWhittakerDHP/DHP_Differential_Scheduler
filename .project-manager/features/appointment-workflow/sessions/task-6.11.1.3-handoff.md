# Task 6.11.1.3 handoff

**Completed:** 2026-03-15
**Description:** Expose selected-slot drive minutes in wizard
**Goal:** Total drive minutes (`driveToCandidate` + `driveFromCandidate`) flow from server slots → `AvailabilityStepData.totalDriveMinutes` → `ConfirmationDriveContext` → `buildConfirmationPriceData(..., driveContext)`. Fee math / line item intentionally deferred to **6.11.1.4** (`driveContext` wired; builder may no-op until then).

**Delivered (summary):**
- Shared `ComputedSlot` + server slot computation attach drive legs; client `AppointmentSlot` and `useAppointmentSlots` map fields.
- `totalDriveMinutesFromAppointmentSlot`, `buildAvailabilityStepData` requires `totalDriveMinutes`; `useAvailabilityStepData` derives from selected slot.
- `useConfirmationStepData` and `useAvailabilityStepFeePreview` pass `driveContext` into `buildConfirmationPriceData`.
- Wizard load transformer sets `moveableScheduling` / `totalDriveMinutes` null for loaded appointments.
- Vitest: `@shared` alias in `vitest.config.ts`; booking tests aligned with current APIs (`selectedCouponBlocks`, `selectedServiceTypeBlocks`, `AppointmentRequest` shape).

**Next:** 6.11.1.4

<!-- end excerpt task -->
