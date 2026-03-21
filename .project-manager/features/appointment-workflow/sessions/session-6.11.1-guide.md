# Session 6.11.1 Guide: Drive Time Fee — Settings, Calculation, and Line Item

**Phase:** 6.11 — Drive Time Fee Line Item  
**Session:** 6.11.1 — Settings, Calculation, and Line Item  
**Status:** In Progress  
**Branch:** TBD (e.g. `appointment-workflow-phase-6.11-session-6.11.1`)

**Depends on:** Existing fee pipeline (`buildConfirmationPriceData`, `buildAppointmentFeeBreakdown`), availability/business settings API, and Confirmation step fee display. Phase 6.10 (fee bar/popover) is optional; drive time line will appear there once implemented.

---

## Quick Start

**Session ID:** 6.11.1  
**Session Name:** Drive Time Fee — Settings, Calculation, and Line Item  
**Description:** Implement admin settings, calculation helper, drive data flow, fee pipeline extension, and persistence via virtual block instance.  
**Status:** Not Started  

Use `/session-start 6.11.1` to load context and plan tasks. Work through tasks 6.11.1.1–6.11.1.5 in order.

---

## Session Overview

Implement the full drive time fee flow: (1) Admin settings — complimentary drive time (minutes), driving rate per hour ($), and rounding (minutes) — in Business Controls, with types and API. (2) Calculation — total drive = driveTo + driveFrom for selected slot; billable = max(0, total − complimentary); round to configured interval; fee = (rounded/60) × rate. (3) Expose selected-slot drive minutes in the wizard so the fee pipeline can use them. (4) Extend `buildConfirmationPriceData` to accept optional drive context, compute drive time fee, and append `{ label: 'Drive time', amount, isFree }` to line items and include in total. (5) **Persistence:** When fee breakdown is stored, add a drive time fee entry that references a **system "Drive time" block instance** (virtual block) so the current schema (every entry has `block_instance_id`) is preserved — see Phase 6.11 guide and task 6.11.1.5 below.

---

## Key Context

- **Fee builder:** `client/src/utils/booking/confirmationStepData.ts` — `buildConfirmationPriceData`, `buildAppointmentFeeBreakdown`, `lineItems`, `PriceData`. Add optional parameter for drive context (e.g. `driveContext?: { totalDriveMinutes: number }` or `{ driveToMinutes: number; driveFromMinutes: number }`). Read settings (complimentary, rate, rounding) from the same source as other availability/business settings (e.g. `useAvailabilitySettings().settings` or passed in).
- **Settings location:** Business Controls — e.g. Calendar → Confirmation & Holds, or a Driving/Fees subsection. Same persistence pattern as `showApplyCouponInWizard` (Phase 6.10): add fields to availability/business settings types and API payload.
- **Drive data:** Ensure selected slot/candidate exposes `driveToCandidate` and `driveFromCandidate` (or equivalent) in minutes. If the wizard does not yet pass these into the confirmation step or into the fee builder call site, extend the data flow (e.g. from availability step data or slot selection payload).
- **Persistence (virtual block instance):** `appointment_fee_entries` requires `block_instance_id` (NOT NULL). Use one real row in `block_instances` for "Drive time" (lineItem block shape, not user-selectable). When persisting the fee breakdown, append one entry with that block’s id, `blockName` "Drive time", and computed fee in `totalFee`/`baseFee`. See Phase 6.11 guide "Persistence: Virtual Block Instance" and task 6.11.1.5.

---

## Tasks

### Task 6.11.1.1: Admin settings — types, API, UI

**Goal:** Add complimentary drive time (minutes), driving rate per hour ($), and drive-time rounding (minutes) to business/availability settings; persist and load via existing API; add UI controls in Business Controls (e.g. Confirmation & Holds or Driving/Fees).

**Files:**
- Settings types and API: extend availability/business settings type and payload (e.g. in `client/src/configs/availabilitySettings/` or equivalent) with `complimentaryDriveMinutes`, `drivingRatePerHour`, `driveTimeRoundingMinutes`. Defaults: e.g. 0, 0, 15.
- Admin UI: add inputs (number fields or similar) in the appropriate Business Controls panel; wire form state and save.

**Checkpoint:** Settings can be saved and loaded; values appear in admin and in client when wizard fetches settings.

---

### Task 6.11.1.2: Drive time calculation helper

**Goal:** Implement the formula in a small, testable helper: given totalDriveMinutes and settings (complimentary, rate, rounding), return driveTimeFee and optionally rounded billable minutes.

**Files:**
- Add a helper (e.g. in `client/src/utils/booking/` or inside `confirmationStepData.ts`) such as `computeDriveTimeFee(totalDriveMinutes, complimentaryMinutes, ratePerHour, roundingMinutes): number`. Formula: billable = max(0, total − complimentary); round to nearest roundingMinutes; return (rounded/60) * ratePerHour.

**Checkpoint:** Helper returns correct fee for sample inputs; edge cases (zero total, total < complimentary, rounding boundaries) behave as expected.

---

### Task 6.11.1.3: Expose selected-slot drive minutes in wizard

**Goal:** Ensure that when a slot is selected, the wizard/confirmation context has access to total drive minutes (driveTo + driveFrom) for that slot. Pass this into the fee builder call site(s).

**Files:**
- Types: ensure slot/candidate type includes drive fields (e.g. from `shared/types/availabilityTypes.ts`: `driveToCandidate`, `driveFromCandidate` or equivalent).
- Wizard/availability step: when user selects a slot, store or expose `totalDriveMinutes` (or both components) where the Confirmation step and/or availability-step fee logic can read it (e.g. `propertyDetailsStepData`, wizard state, or injectable).
- ConfirmationStep.vue / useConfirmationStepData: pass drive context into `buildConfirmationPriceData` when calling it (e.g. from selected slot data). Same for AvailabilityStep.vue when Phase 6.10 fee bar/popover is implemented.

**Checkpoint:** After selecting a slot, the value passed to the fee builder reflects the selected slot’s total drive minutes.

---

### Task 6.11.1.4: Fee pipeline — accept drive context, compute and append line item

**Goal:** `buildConfirmationPriceData` accepts optional drive context; reads complimentary, rate, and rounding from settings; computes drive time fee; appends "Drive time" line item; includes amount in order total.

**Files:**
- `client/src/utils/booking/confirmationStepData.ts`: Add optional parameter `driveContext?: { totalDriveMinutes: number }` (or `driveToMinutes` + `driveFromMinutes`). If present, call `computeDriveTimeFee` with settings, then append `{ label: 'Drive time', amount: driveTimeFee, isFree: driveTimeFee === 0 }` to `lineItems` and add amount to the total. Ensure settings are available (e.g. passed in or read from a composable/store used by the builder).

**Checkpoint:** Confirmation step (and availability-step popover if 6.10 is done) shows "Drive time" row; total includes it; when drive is under complimentary or zero, line shows $0 or "Free" as appropriate.

---

### Task 6.11.1.5: Persist drive time in fee breakdown via virtual block instance

**Goal:** When the appointment fee breakdown is persisted, add a drive time fee entry so the stored breakdown matches the UI. Use the **virtual block instance** approach: one system "Drive time" block instance (real row in `block_instances`, lineItem shape, not user-selectable); store the computed amount only in the fee entry.

**Implementation:**
- **Ensure drive-time block exists:** Create or seed one "Drive time" block instance per calendar (or global) with block shape type lineItem. The block can have minimal/zero parts (normal block fee formula yields 0). Exclude this block from wizard block selection (e.g. by name, block_shape_ref, or future `is_system` flag). Document or config how to resolve this block’s id (e.g. by name + calendar scope).
- **buildAppointmentFeeBreakdown:** When building the payload for appointment create, if drive context is present and drive time fee > 0 (or include even when 0 for consistency), append one `AppointmentFeeEntryCreate`: `blockInstanceId` = drive-time block’s id, `blockName` = "Drive time", `blockShapeRef` = that block’s shape ref, `baseFee` = computed drive time fee (or 0), `overageFee` = 0, `totalFee` = computed drive time fee, `quantity` = 1. Do not add this block to the wizard’s selected blocks; only add this entry when constructing the breakdown payload.
- **Server:** No schema change; existing `appointment_fee_entries` create path accepts the extra entry. Optionally ensure the drive-time block instance id is valid (e.g. same tenant/calendar) if the server validates FKs elsewhere; the table comment allows instance deletion so typically no FK on block_instance_id.

**Files:**
- Client: `buildAppointmentFeeBreakdown` (or shared fee breakdown builder) — accept optional drive context and drive-time block instance id/ref; append drive time entry when present. Resolve drive-time block id from config, booking data, or a small helper that looks up the system Drive time block for the current calendar/scope.
- Seed/migration or admin: ensure one "Drive time" block instance (and lineItem block shape) exists per scope; document how it is identified and excluded from selection.

**Checkpoint:** After booking with non-zero drive time, stored fee breakdown includes one entry for "Drive time" with the correct amount and the system block’s id; no schema change; UI and stored breakdown match.

---

## Session Workflow

**Before Starting:** Use `/session-start 6.11.1` to load context, plan tasks, and identify files. Work on one task at a time; document decisions inline. Pause after each task for checkpoint before continuing.

**During Session:** Complete tasks 6.11.1.1–6.11.1.5 in order. After each task, run quality checks and update progress. End with `/session-end 6.11.1` when all tasks complete.

---

## Success Criteria

- [ ] Admin: Complimentary drive (min), driving rate ($/hr), and drive-time rounding (min) are configurable and persisted; UI in Business Controls.
- [ ] Calculation helper: Correct fee for given total drive and settings; rounding and edge cases handled.
- [ ] Wizard: Selected-slot drive minutes available and passed into fee builder at Confirmation (and availability step if 6.10 in place).
- [ ] Fee pipeline: Optional drive context; "Drive time" line item appended and included in total.
- [ ] Stored fee breakdown includes drive time as a fee entry referencing the system "Drive time" block instance when applicable (virtual block approach).
- [ ] Lint passes; app starts.

---

## Related Documents

- Phase 6.11 guide: `phases/phase-6.11-guide.md` (includes "Persistence: Virtual Block Instance")
- confirmationStepData.ts — buildConfirmationPriceData, buildAppointmentFeeBreakdown, lineItems
- shared/types/appointmentFeeTypes.ts — AppointmentFeeEntryCreate
- Phase 6.10 guide/session — fee bar and popover (optional; drive line will appear there once implemented)
- shared/types/availabilityTypes.ts — drive fields for slot/candidate
