# Session 6.4.3 Guide: Moveable Modal — Shared Time-Slot Grid

## Session: 6.4.3 — Moveable Modal Shared Slot Grid (AppointmentSlotGrid)

**Purpose:** Replace the moveable modal's list-based slot UI with the same AppointmentSlotGrid used on the availability step (non-differential, same reactivity to width).

**Tier:** Session (Tier 2)
**Phase:** 6.4 (Moveable Modal & preClosing Property)
**Prerequisites:** Session 6.4.1 and 6.4.2 scope complete (modal re-enabled, preClosing in place).

---

## Session Objectives

- Time slots in the moveable modal use the **same** custom time-slot button component as the availability step (non-differential).
- Constraint analog: window start = end of major appointment (innerBoundary), window end = contingency deadline (outerBoundary); slots are already computed in that window by `computeMoveableSlots`.
- Same reactivity to screen width (useResponsiveGrid via AppointmentSlotGrid); no duplicate layout logic.

---

## Tasks

- [ ] #### Task 6.4.3.1: MoveableSlot → AppointmentSlot adapter

**Goal:** Build a pure function that maps `MoveableSlot[]` to minimal `AppointmentSlot[]` so AppointmentSlotGrid and useSlotGridDisplay can be used unchanged with `timeBasis: 'nonDifferential'`.

**Files:**
- New: `client/src/utils/booking/moveableSlotToAppointmentSlotAdapter.ts` (or equivalent under booking utils)
- Types: `client/src/types/appointment.ts` (AppointmentSlot, AppointmentShape), `client/src/types/moveableScheduling.ts` (MoveableSlot)

**Approach:**
1. For each MoveableSlot (startTime, endTime, duration), produce one AppointmentSlot with: buttonIndex = array index; isAvailable = true; startTime; totalTimeRange = { startTime, endTime, duration }; shape with slotShape.eventFinals = [] (so derivePerspective returns totalTimeRange); eventTimeRanges = {}.
2. Build minimal AppointmentShape (e.g. slotShape with eventFinals: []) sufficient for derivePerspective's non-differential path; no need for real event shapes.
3. Export a single function, e.g. `moveableSlotsToAppointmentSlots(slots: MoveableSlot[]): AppointmentSlot[]`, and add unit tests if the project expects tests for this tier.

**Checkpoint:**
- Adapter returns array of AppointmentSlot; each slot's totalTimeRange matches the MoveableSlot's start/end/duration.
- TypeScript compiles; no unnecessary fields on the minimal shape.

---

- [ ] #### Task 6.4.3.2: Wire AppointmentSlotGrid into MoveablePartsModal

**Goal:** Replace the "Available Completion Times" VList with AppointmentSlotGrid; selection and loading states remain correct.

**Files:**
- `client/src/components/booking/MoveablePartsModal.vue`
- `client/src/components/booking/AppointmentSlotGrid.vue` (use as-is; no changes unless props need to be optional for modal context)

**Approach:**
1. Import AppointmentSlotGrid and the adapter (e.g. moveableSlotsToAppointmentSlots).
2. Compute a derived prop or computed: when moveableOptions?.availableSlots exists, run adapter(moveableOptions.availableSlots) to get appointmentSlots for the grid.
3. Replace the VList/VListItem block with AppointmentSlotGrid; pass appointmentSlots, selectedButtonIndex = selectedSlotIndex, time-basis="nonDifferential", color/variant as desired (e.g. primary, outlined).
4. Emit on @slot-click: selectSlot(buttonIndex) — buttonIndex is the moveable slot index.
5. Ensure the grid's container has a ref or is inside a container that allows AppointmentSlotGrid's useResponsiveGrid to measure width (same as availability step).
6. Remove the old "Available Slots" VList and the "No available time slots" VAlert only if still redundant; keep any "Earliest Completion" or other non-slot content.

**Checkpoint:**
- Modal shows a grid of time-slot buttons identical in look/behavior to the availability step (non-differential).
- Selecting a slot updates selectedSlotIndex; Confirm remains gated correctly.
- Resize/browser width changes column count the same way as on the main step.

---

- [ ] #### Task 6.4.3.3: Session verification and Phase 6.4 criteria

**Goal:** Confirm app starts, lint passes, and Phase 6.4 success criterion for shared slot grid is met.

**Approach:**
1. Run app (e.g. npm run start:dev), open moveable modal for a pre-closing service with slots; confirm grid renders and selection works.
2. Run client lint (e.g. cd client && npm run lint) and fix any new issues.
3. Mark Phase 6.4 success criterion "Moveable modal uses AppointmentSlotGrid…" as done in the phase guide.

**Checkpoint:**
- App starts; modal slot grid works; lint passes.
- Session log and handoff updated; Next Action points to commit/push or next session.
