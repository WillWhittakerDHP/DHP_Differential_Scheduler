# Task 6.11.1.4 handoff

**Completed:** 2026-03-15
**Description:** Fee pipeline — drive context, compute fee, append line item
**Goal:** `buildConfirmationPriceData` uses `driveContext` + `driveTimeFee` settings (`mergeDriveTimeFeeConfig` / `computeDriveTimeFee`), appends **Drive time** to `lineItems`, and adds the fee to `totalFee`, `orderTotal`, `bagTotal`, and `finalTotal`. Composables pass `availabilitySettings.value?.driveTimeFee` via `useAvailabilitySettings()`.

**Also:** `DEFAULT_DRIVE_TIME_FEE_CONFIG` + `mergeDriveTimeFeeConfig` in `computeDriveTimeFee.ts` (admin reuses default); `calculateBlockInstanceFee` exported for tests; unit tests in `confirmationStepData.test.ts` and `computeDriveTimeFee.test.ts`.

**Not in this task:** `buildAppointmentFeeBreakdown` persistence for drive row → **6.11.1.5** (virtual block instance).

**Next:** 6.11.1.5

<!-- end excerpt task -->
