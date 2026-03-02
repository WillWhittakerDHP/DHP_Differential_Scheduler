# Planning: task 6.5.1.2 -- Wizard mode and load-at-step-3

## Goals of this tier
**Task 6.5.1.2 — Wizard mode and load-at-step-3:** Add wizard mode `reschedule` to types/state. When mode is set to reschedule with a `loadedAppointmentId`, wizard loads that appointment and lands at step 3 (Availability), reusing existing quote/dev load-at-step-3 logic. Ensure `loadedAppointmentId` and mode are set by entry points (next tasks).

## How we build the tierDown to achieve them
**Create/add (from Goal/Approach):**
- Add `reschedule` to wizard mode type/state.
- When entering reschedule flow (mode `reschedule` + `loadedAppointmentId`), wizard loads that appointment and lands at step 3, reusing quote/dev load-at-step-3 logic.
- Entry points that set mode and `loadedAppointmentId` are implemented in later tasks (6.5.1.3, 6.5.1.4).

Then run task-end and cascade to next task or session-end.

## Loaded Context
- **Scope:** 6.5.1.2

- **Context source policy:** tierUp only. Session guide (task section) and session handoff excerpt only. Task handoff and other task-level docs are excluded.


### What We Are Planning (from context)

**Explicit coding goal:** Add wizard mode `reschedule` and wire load-at-step-3 so that when mode is `reschedule` and `loadedAppointmentId` is set, the wizard loads that appointment and lands at step 3 (Availability), reusing existing quote/dev load logic.


### Proposed Implementation Plan

- **Approach:** Reuse existing wizard composables; add `reschedule` to wizard mode type/union and state; ensure load-at-step-3 path (used for quote/dev) is triggered when mode is `reschedule` and `loadedAppointmentId` is set. No new UI in this task—entry points come in 6.5.1.3/6.5.1.4.
- Define concrete steps in Design Before Execute; then approve to begin coding.

### Task context (from session guide)

- [ ] #### Task 6.5.1.2: Wizard mode and load-at-step-3
**Goal:** Add wizard mode `reschedule` to types/state. When mode is set to reschedule with a `loadedAppointmentId`, wizard loads that appointment and lands at step 3 (Availability), reusing existing quote/dev load-at-step-3 logic. Ensure `loadedAppointmentId` and mode are set by entry points (next tasks).
**Files:** `client/src/composables/booking/useBookingWizard.ts`, `useWizardAppointmentManagement.ts` (or equivalent); wizard mode type definition; any step-routing or load logic that handles quote/dev load-at-step-3.

### Governance Context (audit digest)

## Governance Context (Task)

No task files specified — governance checks skipped. Fill in **Files:** in the session guide for file-scoped governance.

- **Governance highlights:** No governance findings were extracted from current output.
- **Related code:** No inventory reuse hints were extracted from current output.

## Design Before Execute

### Coding Goal
Add wizard mode `reschedule`; when mode is `reschedule` and `loadedAppointmentId` is set, wizard loads that appointment and lands at step 3 (Availability), reusing existing quote/dev load-at-step-3 logic.

### Files
- Wizard mode type/constants (where `WizardMode` or equivalent is defined—e.g. in a types file or inside `useBookingWizard.ts`).
- `client/src/composables/booking/useBookingWizard.ts` (or primary wizard composable): add `reschedule` to mode type/state; ensure `loadedAppointmentId` is accepted and used when mode is `reschedule`.
- `useWizardAppointmentManagement.ts` or equivalent: load-at-step-3 logic—ensure it runs when mode is `reschedule` and `loadedAppointmentId` is set (same as quote/dev load).
- Step routing / initial step: when opening wizard with mode `reschedule` and `loadedAppointmentId`, land at step 3 (Availability) after load.

### Pseudocode
1. Locate wizard mode type (e.g. `WizardMode`): add `'reschedule'` to the union/const.
2. In wizard composable: add/use state for `loadedAppointmentId`; when mode is `reschedule` and `loadedAppointmentId` is set, trigger load (fetch appointment, populate form/state) and set current step to 3.
3. Reuse existing load-at-step-3 path: identify where quote/dev load sets step to 3 and populates data; ensure reschedule uses the same path or calls the same helper with `loadedAppointmentId`.
4. Ensure step-initialization or route/navigation accepts "open at step 3" for reschedule so the user lands on Availability.

### Snippets (scaffold)
- `WizardMode = '...' | 'reschedule'` (or existing pattern).
- In composable: `if (mode === 'reschedule' && loadedAppointmentId) { loadAppointmentForStep3(loadedAppointmentId); setCurrentStep(3); }`.

### Acceptance / Test Intent
- Wizard mode type includes `reschedule`.
- When mode is `reschedule` and `loadedAppointmentId` is set (e.g. via dev/test), wizard loads that appointment and lands at step 3; data matches the loaded appointment.
- Existing quote/dev load-at-step-3 behavior is unchanged.
- Lint and typecheck pass.



## Decisions Made
- **WizardMode type:** Added `WizardMode = 'new' | 'quote' | 'reschedule'` in `client/src/types/wizard.ts`; wizard state includes `wizardMode: Ref<WizardMode>` (default `'new'`) and `setWizardMode(mode)`.
- **Load-at-step-3:** Existing `handleLoadAppointment(id)` in `useWizardAppointmentManagement` already loads appointment and lands at step 3 (Availability). When loading by id (not `'random'`), we set `wizard.setWizardMode('reschedule')` so the submit step (task 6.5.1.5) can show "Update appointment" and use the update path.
- **Reset:** `handleResetWizard` now calls `wizard.setWizardMode('new')`.
- **Entry points (6.5.1.3, 6.5.1.4):** Will call `wizard.setWizardMode('reschedule')` then `handleLoadAppointment(appointmentId)`; optional to set mode first since we also set it inside handleLoadAppointment when loading by id.

## Insight / Proposal / Decisions
### 1. Insight / Proposal / Decision

**What the docs indicate:** Task context: [Task Name]. Goal/Files/Approach from the session guide inform the design.

**Proposed path:** We'll create a task planning doc (Design Before Execute) and use it as the single source of truth. Discuss in chat, then run /accepted-code when ready to begin coding.

**Decision needed:** What do you want to lock in or adjust before we begin coding?

*Where you and the agent talk about the task plan.*

**Options:** Let's discuss in chat | I'm ready to lock the design and begin coding

---

### 2. Insight / Proposal / Decision

**What the docs indicate:** The task section has no concrete Files listed (or placeholder).

**Proposed path:** We'll target files inferred from the goal and approach, or you can specify areas/components to touch.

**Decision needed:** Which files or areas should this task touch?

*Where the deliverable lives.*

**Options:** Infer from goal | List in chat | Match session guide

---

### 3. Insight / Proposal / Decision

**What the docs indicate:** The Approach field is empty or placeholder. Governance suggests thin components and composables for logic.

**Proposed path:** We'll choose an approach that reuses existing components/composables where the inventory suggests fit, unless you prefer a different pattern.

**Decision needed:** How should we implement it?

*Approach for this deliverable.*

**Options:** Reuse from inventory where possible | New composable/component | Describe in chat
