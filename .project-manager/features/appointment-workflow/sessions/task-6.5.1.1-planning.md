# Planning: task 6.5.1.1 — Status and transitions

## Goals of this tier

**Task 6.5.1.1 — Status and transitions:** Ensure appointment status `rescheduling` exists (client + server if applicable) and that `VALID_STATUS_TRANSITIONS` (or equivalent) allows: `confirmed` → `rescheduling`, `rescheduling` → `submitted`. Verify transition guards are used when entering reschedule flow and on submit. No UI for raw status required.

## How we build the tierDown to achieve them

Single deliverable (no child tier). Implement this task; then run task-end and cascade to next task or session-end.

## Loaded Context
- **Scope:** 6.5.1.1

- **Context source policy:** tierUp only. Session guide (task section) and session handoff excerpt only. Task handoff and other task-level docs are excluded.


### What We Are Planning (from context)

**Explicit coding goal:** Ensure status `rescheduling` and transitions confirmed → rescheduling → submitted are defined and used by transition guards (entry and submit). Client and server must agree on the status value and valid transitions.

### Proposed Implementation Plan

1. Locate appointment status definition and transition map (client constants, server enum/validation).
2. Add `rescheduling` to status enum/type and to `VALID_STATUS_TRANSITIONS`: confirmed → rescheduling, rescheduling → submitted.
3. Ensure any transition guard or validator (e.g. when starting reschedule, when submitting) uses this map; no new UI for the status field.

### Task context (from session guide)

- [ ] #### Task 6.5.1.1: Status and transitions
**Goal:** Ensure appointment status `rescheduling` exists (client + server if applicable) and that `VALID_STATUS_TRANSITIONS` (or equivalent) allows: `confirmed` → `rescheduling`, `rescheduling` → `submitted`. Verify transition guards are used when entering reschedule flow and on submit. No UI for raw status required.
**Files:** See Design Before Execute below.

### Governance Context (audit digest)

## Governance Context (Task)

No task files specified — governance checks skipped. Fill in **Files:** in the session guide for file-scoped governance.

- **Governance highlights:** No governance findings were extracted from current output.
- **Related code:** No inventory reuse hints were extracted from current output.

## Design Before Execute

### Coding Goal

Add/verify appointment status `rescheduling` and transitions: `confirmed` → `rescheduling`, `rescheduling` → `submitted`. Transition guards (client and server) must use the same map so starting reschedule and submitting both respect valid transitions.

### Files

- **Client:** `client/src/constants/appointmentConstants.ts` (or equivalent) — `VALID_STATUS_TRANSITIONS`; appointment status type/enum if defined in client (e.g. in types/appointmentApi or constants).
- **Server:** Appointment status enum and any transition validation (e.g. `server/src/db/models/booking/appointment.ts` or a shared constants/validation module). Ensure server accepts `rescheduling` and allows the two transitions.

### Pseudocode

1. **Client:** Find where appointment status and `VALID_STATUS_TRANSITIONS` (or similar) are defined. Add `rescheduling` to the status union/type and add map entries: `confirmed` → `['rescheduling', ...]`, `rescheduling` → `['submitted', ...]` (plus any other allowed targets per product).
2. **Server:** Find appointment status enum and any transition check. Add `rescheduling` to the enum; ensure transition logic allows confirmed → rescheduling and rescheduling → submitted (e.g. in status update validation or state machine).
3. **Verify:** No UI change required for this task. Guards are used when (a) user enters reschedule flow (status may transition to rescheduling) and (b) on submit (rescheduling → submitted). Those call sites will be wired in later tasks; this task only ensures the status and map exist and are consistent.

### Snippets (scaffold)

- `VALID_STATUS_TRANSITIONS`: shape like `Record<AppointmentStatus, AppointmentStatus[]>` or `Map<string, string[]>` with `confirmed` → include `rescheduling`, `rescheduling` → include `submitted`.
- Server: if Sequelize enum, add `'rescheduling'` to the status enum definition; if there is a transition validator, extend it for the new transitions.

### Acceptance / Test Intent

- Client and server both define status `rescheduling` and allow confirmed → rescheduling and rescheduling → submitted.
- Lint and typecheck pass. No regression to existing status transitions (e.g. draft → submitted, held → confirmed).
- Optional: unit test or manual check that transition guard rejects invalid transitions (e.g. submitted → rescheduling) if such a test already exists.



## Decisions Made

- **2026-03-02:** Task 6.5.1.1 verified as already implemented. Client: `client/src/constants/appointmentStatus.ts` and `client/src/types/appointmentStatus.ts` define `rescheduling` and `VALID_STATUS_TRANSITIONS` with confirmed → rescheduling, rescheduling → submitted. Server: `server/src/routes/internal/appointments/appointmentConstants.ts` and `server/src/db/models/booking/appointment.ts` define the same; `appointmentCrudRouter.ts` uses `isValidTransition()` on PATCH. No code changes required. Proceed to `/task-end 6.5.1.1` and cascade to Task 6.5.1.2.

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
