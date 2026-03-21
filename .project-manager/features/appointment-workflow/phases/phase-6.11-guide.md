# Phase 6.11 Guide: Drive Time Fee Line Item

**Purpose:** Phase-level guide for adding a configurable "Drive time" fee line item: admin settings (complimentary minutes, rate per hour, rounding), calculation from selected-slot drive minutes, and integration into the fee pipeline and confirmation/availability-step UI. Persistence uses a single system block instance so the current fee-entry schema is unchanged.

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Overview

**Phase Number:** 6.11  
**Phase Name:** Drive Time Fee Line Item  
**Description:** Add a new fee line item **"Drive time"** driven by admin-configurable settings. Admin defines: (1) **Complimentary drive time (minutes)** — drive under this threshold is free; (2) **Driving rate per hour ($)** — used for billable drive; (3) **Rounding (minutes)** — round billable drive to the nearest N minutes. The fee pipeline accepts optional drive context (total drive to + from for the selected slot), computes the drive time fee, appends the line item to the fee breakdown, and includes it in the order total. When the appointment fee breakdown is persisted, drive time is stored as a fee entry that references a **virtual (system) block instance** so the existing schema (every entry has a `block_instance_id`) is preserved.

**Duration:** 1 session (6.11.1)  
**Status:** Not Started

---

## Persistence: Virtual Block Instance (Architecture Decision)

**Decision:** Preserve drive time in the database as a fee entry that references a single **system "Drive time" block instance**, rather than making `block_instance_id` nullable or adding a separate line-item type.

**Rationale:**
- `appointment_fee_entries` requires `block_instance_id` (NOT NULL). Every current fee entry is tied to a block instance.
- Adding a real row in `block_instances` (and a lineItem `block_shape`) for "Drive time" gives a stable id and `block_shape_ref`; the **value** is stored only in the fee entry (`total_fee` / `base_fee`), not in the block’s parts.
- The block is **not user-selectable** in the wizard; it exists only so that when we persist the breakdown we can append one fee entry with that block’s id, `block_name` "Drive time", and the computed amount. No schema change; no nulls; reporting and "every entry has a block" assumptions stay valid.

**Implementation notes:**
- Create or seed one "Drive time" block instance per calendar (or global) with block shape type lineItem. The block can have minimal/zero parts (so the normal block fee formula yields 0). Exclude this block from wizard block selection (e.g. by name, ref, or `is_system` flag if added).
- **Display:** In `buildConfirmationPriceData`, append a "Drive time" line item when drive context is present (computed amount); do not add this block to the wizard.
- **Persistence:** When building the fee breakdown payload for appointment create, when drive context is present append one entry: `blockInstanceId` = drive-time block’s id, `blockName` = "Drive time", `totalFee`/`baseFee` = computed drive time fee, `overageFee` = 0, `quantity` = 1.

---

## Context: What Already Exists

**Fee pipeline:** `buildConfirmationPriceData()` in `client/src/utils/booking/confirmationStepData.ts` builds `PriceData` with `lineItems`, `finalTotal`, and currency. It is used by the Confirmation step and (in Phase 6.10) by the availability-step fee bar and popover. Line items today come from block instance fees and related totals; the builder can be extended to accept optional drive context and append a "Drive time" line item.

**Fee breakdown persistence:** `buildAppointmentFeeBreakdown` produces `entries` (AppointmentFeeEntryCreate) with `blockInstanceId`, `blockName`, `blockShapeRef`, baseFee, overageFee, totalFee, quantity. Server persists these to `appointment_fee_entries`. Drive time is added as one more entry pointing at the system Drive time block instance.

**Drive data:** Shared types (e.g. `shared/types/availabilityTypes.ts`) and slot/candidate payloads may already expose `driveToCandidate` and `driveFromCandidate` (or equivalent) in minutes. The selected slot’s total drive (to + from) must be available in the wizard/confirmation context — from availability step data or from the slot payload when a slot is selected. If not yet exposed, extend types and data flow so the fee builder can receive `totalDriveMinutes` (or `driveToMinutes` + `driveFromMinutes`) for the chosen slot.

**Admin settings:** Business Controls (e.g. Calendar → Confirmation & Holds, or a Driving / Business Rules subsection) already host availability and fee-related settings. Add the three drive-time settings in the same area; persist via the same availability/business settings API and types.

---

## Formula

- **Total drive (minutes):** `totalDriveMinutes = driveToCandidate + driveFromCandidate` for the selected slot (candidate/slot must expose these or a pre-summed total).
- **Billable drive:** `billableDriveMinutes = max(0, totalDriveMinutes - complimentaryMinutes)`.
- **Rounding:** Round `billableDriveMinutes` to the nearest N minutes (admin-configured rounding, e.g. 15).
- **Fee:** `driveTimeFee = (roundedBillableMinutes / 60) * drivingRatePerHour`.
- **Line item:** `{ label: 'Drive time', amount: driveTimeFee, isFree: driveTimeFee === 0 }` appended to `lineItems`; include in order total.

---

## Phase Objectives

- **Admin settings:** Complimentary drive time (minutes), driving rate per hour ($), and drive-time rounding (minutes) — configurable in Business Controls (availability_settings or Driving/Fees subsection), persisted and read by the fee pipeline.
- **Data requirement:** Selected-slot drive minutes (to + from) available in wizard/confirmation context; extend types and flow if not already present.
- **Fee pipeline:** `buildConfirmationPriceData` accepts optional drive context (e.g. `totalDriveMinutes` or `{ driveToMinutes, driveFromMinutes }`), reads the three settings, computes drive time fee, appends "Drive time" line item, and includes it in the total.
- **UI:** Confirmation step and (when Phase 6.10 is done) availability-step fee popover show the Drive time row when applicable.
- **Persistence:** When fee breakdown is stored, add one fee entry for drive time using the system "Drive time" block instance (virtual block); stored breakdown matches the UI.

---

## Tasks

Sessions and tasks for this phase. See Sessions Breakdown below for session list and session-6.11.1-guide.md for task breakdown (6.11.1.1–6.11.1.5).

---

## Sessions Breakdown

- [x] ### Session 6.11.1: Drive Time Fee — Settings, Calculation, and Line Item  
**Description:** Implement admin settings (types, API, UI), calculation helper, exposure of selected-slot drive minutes in the wizard, extension of `buildConfirmationPriceData` with optional drive context and "Drive time" line item, and persistence of drive time in fee breakdown via the virtual block instance.  
**See:** `sessions/session-6.11.1-guide.md`

---

## Dependencies

**Prerequisites:**
- Feature 6 phases 6.1–6.3 (workflow and confirmation routine) — Complete.
- Existing `buildConfirmationPriceData`, `buildAppointmentFeeBreakdown`, Confirmation step fee UI, and availability/business settings API.
- Slot/candidate data that can provide drive-to and drive-from minutes (or total) for the selected slot; extend if missing.

**Downstream Impact:**
- Fee preview (Phase 6.10) will automatically show the drive time line in the popover once the fee builder returns it.
- No change to core booking or availability logic beyond passing drive context into the fee builder. One system block instance (Drive time) must exist per calendar/scope and be excluded from wizard selection.

---

## Success Criteria

- [ ] Admin: Complimentary drive (min), driving rate ($/hr), and drive-time rounding (min) are configurable and persisted in Business Controls.
- [ ] Wizard/confirmation: Selected-slot total drive minutes (to + from) are available where `buildConfirmationPriceData` is called.
- [ ] Fee pipeline: Optional drive context accepted; drive time fee computed; "Drive time" line item appended and included in total.
- [ ] Confirmation step (and availability-step fee popover when 6.10 is in place) shows Drive time row when applicable.
- [ ] Stored fee breakdown includes a drive time fee entry referencing the system Drive time block instance when applicable; no schema change to appointment_fee_entries.
- [ ] Lint and app start pass.

---

## Related Documents

- PROJECT_PLAN.md — Feature 6 Phase 6.11
- feature-appointment-workflow-guide.md — Phase 6.11 summary
- sessions/session-6.11.1-guide.md — Settings, calculation, line item, persistence
- confirmationStepData.ts — buildConfirmationPriceData, buildAppointmentFeeBreakdown, lineItems, PriceData
- shared/types/availabilityTypes.ts — driveToCandidate, driveFromCandidate (or equivalent)
- appointment_fee_entry model, appointmentFeeTypes.ts — fee entry shape and block_instance_id requirement
