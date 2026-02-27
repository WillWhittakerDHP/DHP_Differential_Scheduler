# Phase 6.5 Guide: Rescheduling Flow

**Purpose:** Phase-level guide for planning and tracking the rescheduling workflow and availability behavior

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Overview

**Phase Number:** 6.5
**Phase Name:** Rescheduling Flow
**Description:** Reschedule confirmed appointments by reusing the booking wizard; same UX as quote and dev-mode load (appointment loads at step 3); temporarily bypass the current appointment as an availability constraint so the wizard does not treat its time and drive buffers as blocked; show a UI indicator for the original inspection slot.

**Duration:** 2–3 sessions (to be refined)
**Status:** Not Started
**Dependencies:** Phase 6.3 (transition guards: `confirmed` → `rescheduling` → `submitted`). Optional: Feature 7 (Authentication) for user-specific “my appointments” and reschedule entry from customer-facing flows.

---

## Context: What Already Exists

**Wizard load at step 3:** `useWizardAppointmentManagement` already loads an appointment via `handleLoadAppointment` → `transformAppointmentToWizard` → `applyWizardState`, then sets `completedSteps` and `activeStep = 2` so the wizard lands on **step 3 (Availability)**. The user can adjust and then call “Update appointment” or submit. This is the same flow used for quotes (“I want a quote” / “I want to book”) and for dev-mode “Load appointment.”

**Slot computation:** Server computes slots in `computeSlotsForDateRange` (slotComputationService). Overlap (and thus “blocked” slots) comes from `eventsWithDrive`: calendar events from Google Calendar plus drive-to/from buffers. When an appointment is confirmed/submitted, a calendar event may be created via `createCalendarEventForAppointment`, so the existing appointment can appear on the calendar and currently **blocks** its own time and drive buffers.

**ComputedAvailabilityRequest:** Currently has `dateRange`, `candidatePlaceId`, `duration`, `dataSource`. No parameter yet to exclude the current appointment’s event from overlap.

**Slot UI:** `AppointmentSlotGrid.vue` uses `appointment-slot-btn--busy` when `!slotData.isAvailable`. No current “original inspection” slot indicator.

---

## Admin entry: step 0 or pre-wizard

For **admins only**, before (or as step 0 of) the wizard, present a choice:

1. **Start new inspection** — Enter wizard in `initial` mode; no loaded appointment.
2. **Edit quote** — Update an existing appointment that is a quote (e.g. status `quoted` or `started`/`held`). Show a **dropdown of non-completed inspections** (exclude `cancelled`, `deleted`; optionally filter to quote-related statuses). On selection, set wizard mode to `quote` (or a dedicated “edit quote” mode if different), load that appointment, then proceed (e.g. to step 3).
3. **Reschedule** — Reschedule an existing appointment (e.g. status `confirmed`). Show the same **dropdown of non-completed inspections** (optionally filtered to `confirmed` for reschedule). On selection, set wizard mode to `reschedule`, load that appointment, then proceed to step 3.

**Non-completed:** Appointments whose status is not in `['cancelled', 'deleted']` (i.e. `started`, `held`, `rescheduling`, `quoted`, `submitted`, `confirmed`). Filter the dropdown by intent (e.g. Edit quote → `quoted`/`started`/`held`; Reschedule → `confirmed` or also `submitted` per product rules).

**Implementation:** Either a dedicated **step 0** in the wizard (admin-only, skipped for non-admin) or a **pre-wizard** screen/card; on submit of that step, set `wizardMode` and `loadedAppointmentId` (and call `handleLoadAppointment` when Edit quote or Reschedule), then advance. Requires an API that returns appointments filtered by status (and by permission when Feature 7 is in place).

---

## Rescheduling Flow (Same as Quote / Dev Load)

1. **Entry:** After auth (Feature 7), user opens “their” appointment (e.g. from a list or link). For admin, entry can remain as today’s dev-style “Load appointment” or a dedicated “Reschedule” action on a confirmed appointment.
2. **Load:** Appointment loads into the wizard at **step 3 (Availability)** using the existing `handleLoadAppointment` / `transformAppointmentToWizard` / `applyWizardState` path. No new load path required.
3. **Adjust:** User can change property/contacts/availability as in quote or dev flow. For reschedule, they typically change the date/time slot.
4. **Submit:** User chooses “Reschedule” (or “Update”) instead of “Book.” Client calls update (or a dedicated reschedule endpoint); server applies status transition: `rescheduling` → `submitted` (and optionally creates/updates calendar event for the new time).
5. **Quote vs reschedule:** Same wizard; only the final action and status transition differ (hold quote vs book vs reschedule).

No change to the step-by-step flow: rescheduling **reuses** the same “load at step 3 → adjust → save/update” behavior as quote and dev-mode load.

---

## Rescheduling Availability: Bypass Current Appointment as Constraint

**Goal:** Keep the existing appointment **on the calendar** (visible in responses and UI) but **temporarily** exclude it from overlap checks so its time and drive buffers do not block slots during reschedule.

**Implementation:**

1. **Request:** Extend `ComputedAvailabilityRequest` (shared/types/availabilityTypes) with:
   - `reschedulingAppointmentId?: string`
2. **Server behavior** (in `computeAvailabilityData` and the pipeline that feeds `computeSlotsForDateRange`):
   - When `reschedulingAppointmentId` is set:
     - Load that appointment (including stored calendar event id, e.g. `googleEventId`, if available).
     - Build `calendarEvents` for the **response** unchanged (so the client still receives and can display the event).
     - Build the **overlap** input to slot computation by excluding the event that corresponds to `reschedulingAppointmentId` (match by stored event id, or by appointment time window from `selectedTimeSlots` if event id is not stored). Pass this filtered list into the slot computation so that event (and its drive buffers) are not used as overlap constraints.
   - If the appointment’s calendar event id is not stored, derive the appointment’s time window from its `selectedTimeSlots` and exclude from overlap any calendar event whose start/end matches (or falls inside) that window. Prefer storing and matching by `googleEventId` when the event is created.
3. **Client:** When the wizard is in “reschedule” mode (e.g. `loadedAppointmentId` is set and the intent is reschedule), include `reschedulingAppointmentId: loadedAppointmentId.value` in the computed-availability request. No other client change is required for “bypass”; the rest is server-side filtering of the overlap list.

**Result:** The existing appointment remains on the calendar and in `calendarEvents`; only the **overlap input** to slot computation excludes that appointment’s event, so its time and drive buffers do not block slots.

---

## UI Indicator: Original Inspection Slot

**Goal:** Slots that correspond to the **original** inspection time should have a distinct visual (e.g. different color or overlay) so the user sees “this is the current time” and can still select it or another slot.

**Data:** When an appointment is loaded, `loadedWizardState` (and availability step data) already contains the selected date and time (e.g. `availabilityStepData.candidateDate` and the selected slot/time range). The client has the **original** appointment time range.

**Implementation:**

1. **Prop / context:** In the availability step (or wherever the slot grid is used for reschedule), compute the original time range from the loaded appointment, e.g. `originalAppointmentTimeRange: { start: RFC3339, end: RFC3339 } | null`, and pass it into the component that renders the slots (e.g. `AppointmentSlotGrid` or the parent that builds the slot list).
2. **Mark “original” slots:** For each slot, compare `startTime`/`endTime` to `originalAppointmentTimeRange` (e.g. same start or overlap). Set a flag (e.g. `isOriginalInspectionSlot`) so the template can add a class or overlay.
3. **Visual:** In `AppointmentSlotGrid.vue`, add a modifier class (e.g. `appointment-slot-btn--original-inspection`) when the slot is the original time. Style with a distinct color (e.g. secondary), border, or small overlay/label (“Current time”) so the existing appointment is clearly indicated while remaining selectable.

**Where to compare:** Either (a) in the composable that builds the slot list (where server `ComputedSlot[]` is mapped to the shape used by the grid) and add `isOriginalInspectionSlot` there, or (b) in `AppointmentSlotGrid` by accepting `originalAppointmentTimeRange` as a prop and computing “is this slot the original?” in the component. Prefer (a) if the grid should stay presentational; (b) is acceptable if keeping “original” logic in one place.

---

## Relation to Phase 6.8 (Admin Force-Create & Constraint Overrides)

Phase 6.8 introduces **`allowedExceptions`**: when rescheduling an appointment that was **force-created** with overrides, the client passes the override’s violation keys so the server can **relax those constraint types** (e.g. capacity, business hours) for that request. That is **separate** from “don’t treat this appointment’s calendar event as overlap.”

For rescheduling, **both** may be needed:

- **Exclude current appointment’s event from overlap** (Phase 6.5): Add `reschedulingAppointmentId` to the availability request; server excludes that appointment’s calendar event (and thus its drive buffers) from the overlap list used in `computeSlotsForDateRange`, while still returning it in `calendarEvents`. This applies to **every** reschedule (with or without overrides).
- **Relax override constraints** (Phase 6.8): When the rescheduled appointment has a `constraint_override` record, pass `allowedExceptions` so the server can relax those same constraints for the new slot. This applies only when the appointment was force-created with overrides.

Implement Phase 6.5 first so that reschedule always unblocks the current appointment’s time; then Phase 6.8 adds override-aware relaxation on top.

**Block-level `agentPermissions`:** Tooltips and permissions (e.g. Override constraints, future agent features) are driven by state: **(wizard mode, user role, block.agentPermissions)**. The `agent_permissions` column on block_instances (TernaryBoolean: `true` = agents, `false` = clients, `override` = admins) is added full-stack elsewhere (same phase or a dedicated schema/phase); Phase 6.5’s admin entry and wizard mode work with that state so the UI respects it.

---

## Phase Objectives

- Reuse existing “load at step 3” and update path for reschedule; add “Reschedule” entry/action and status transitions (`confirmed` → `rescheduling` → `submitted`).
- **Admin entry:** Add step 0 or pre-wizard for admins: choose Start new inspection | Edit quote | Reschedule; when Edit quote or Reschedule, show dropdown of non-completed inspections; set wizard mode and `loadedAppointmentId` from selection.
- Introduce wizard mode state (`initial` | `quote` | `reschedule`); set `reschedule` when loading for reschedule; drive submit button label and action (create vs update) and reschedule-specific availability/UI from mode.
- Extend `ComputedAvailabilityRequest` with `reschedulingAppointmentId`; server excludes that appointment’s calendar event from overlap input to slot computation; client passes it when in reschedule mode.
- Add original-inspection slot indicator: pass original time range into slot UI, mark matching slots, style with distinct class (e.g. `appointment-slot-btn--original-inspection`).
- Optional: Store `googleEventId` (or equivalent) on the appointment or related model when creating calendar events, so the server can reliably exclude by event id.

---

## Sessions Breakdown (To Be Refined)

- [ ] ### Session 6.5.1: Rescheduling entry and status transitions
**Description:** Reschedule action for confirmed appointments; reuse wizard load at step 3; wire status transitions rescheduling → submitted (and cancelled) and any reschedule-specific API or validation. For admins, add step 0 or pre-wizard to choose Start new | Edit quote | Reschedule and (when Edit quote or Reschedule) select appointment from dropdown of non-completed inspections.
**Tasks:** Define reschedule entry point (admin “Reschedule” button / post-auth customer “My appointment”); ensure transition guards allow confirmed → rescheduling → submitted; reuse handleLoadAppointment and update path; add reschedule-specific submit path if needed. **Admin entry:** Implement step 0 or pre-wizard (admin-only): choice of Start new inspection | Edit quote | Reschedule; dropdown of non-completed inspections (API filtered by status; exclude cancelled, deleted); on selection set wizard mode and loadedAppointmentId and load appointment when Edit quote or Reschedule. Introduce wizard mode state and drive submit label/action from mode.
**Success criteria:** User can open a confirmed appointment, land at step 3, change slot, and complete reschedule with valid status transition. Admins see entry choice and appointment dropdown; selection sets mode and loads appointment correctly.

- [ ] ### Session 6.5.2: Availability bypass (reschedulingAppointmentId)
**Description:** Server and client support for excluding the current appointment’s event from overlap during reschedule.
**Tasks:** Add `reschedulingAppointmentId` to `ComputedAvailabilityRequest`; in computeAvailabilityData, when set, exclude that appointment’s calendar event from the overlap list passed to computeSlotsForDateRange while keeping it in calendarEvents; client passes reschedulingAppointmentId when loadedAppointmentId is set and intent is reschedule; optionally store googleEventId when creating calendar events for reliable exclusion.
**Success criteria:** During reschedule, the current appointment’s time and drive buffers do not block slots; calendar still shows the appointment.

- [ ] ### Session 6.5.3: Original-inspection slot UI
**Description:** Visual indicator for the slot that matches the original inspection time.
**Tasks:** Compute originalAppointmentTimeRange from loaded wizard state; pass into slot grid (or slot-building composable); mark slots that match/overlap original time; add CSS class and styles (e.g. appointment-slot-btn--original-inspection, “Current time” label or overlay).
**Success criteria:** The original inspection slot is visually distinct but still selectable.

---

## Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Flow alignment | Same as quote and dev load (load at step 3) | Single mental model; no extra wizard steps; reuse existing code paths. |
| Bypass mechanism | Exclude event from overlap list on server | Keeps calendar response unchanged; only overlap input is filtered; drive buffers automatically excluded with the event. |
| Request parameter | `reschedulingAppointmentId` | Clear intent; server can load appointment and resolve calendar event (by id or time window). |
| Original slot indicator | Client-side comparison with original time range | Server already returns all slots; no need for server to mark “original” slot; client has loaded state. |
| Admin entry | Step 0 or pre-wizard with dropdown of non-completed inspections | Single place for admins to choose Start new | Edit quote | Reschedule; dropdown sets wizard mode and loadedAppointmentId; non-completed = exclude cancelled, deleted. |

---

## Related Documents

- Feature Guide: `../feature-appointment-workflow-guide.md`
- Feature Handoff: `../feature-appointment-workflow-handoff.md`
- Phase 6.3 Guide: `phase-6.3-guide.md` (transition guards)
- Phase 6.8 Guide: `phase-6.8-guide.md` (allowedExceptions for override-aware reschedule)
- useWizardAppointmentManagement: `client/src/composables/booking/useWizardAppointmentManagement.ts`
- ComputedAvailabilityRequest: `shared/types/availabilityTypes.ts`
- Slot computation: `server/src/services/slotComputationService.ts`
- AppointmentSlotGrid: `client/src/components/booking/AppointmentSlotGrid.vue`
