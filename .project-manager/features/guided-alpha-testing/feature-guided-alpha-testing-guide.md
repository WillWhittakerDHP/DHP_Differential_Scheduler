**Purpose:** Feature-level guide for planning and tracking Feature 9. Content mirrors PROJECT_PLAN Feature 9; see `.project-manager/PROJECT_PLAN.md` for single source of truth.

---

## Feature 9: Guided Alpha Testing

**Status:** 📋 Planning
**Description:** Validate the product before authoring E2E tests: (1) document the booking wizard flow and all logical branches in a Mermaid diagram to find bad loops, dead ends, or wrong wiring; (2) build an alpha testing task database where each row is one E2E-testable task; (3) randomly assign tasks to alpha testers and require 2–3 "blank" full wizard runs with their own data. E2E tests (Feature 10) are then derived from this task list. Depends on Feature 7 (Authentication) for assigning tasks to users.
**Branch:** TBD
**Directory:** `features/guided-alpha-testing/`

### Why Before Feature 10 (Testing)

We need to know **what to test** before writing E2E tests. Guided Alpha Testing produces the canonical list of testable scenarios (wizard paths, modes, roles) and validates the flow with real users. That task list becomes the source for Feature 10's E2E test cases and for assigning work to alpha testers.

### Phase 9.1: Wizard Flow Diagram (Mermaid)

**Goal:** One diagram of the entire booking wizard flow and all logical branches so we can review for bad loops, dead ends, and wrong logic.

**Scope:**

- **Nodes:** Entry (client / agent / admin). Admin-only: step 0 or pre-wizard (Start new | Edit quote | Reschedule + dropdown of non-completed inspections). Steps 1–4 (or 0–4): Service Selection, Property Details, Appointment Availability, Personal Information, Summary. Branches: wizard mode (initial / quote / reschedule), validation pass/fail, optional sub-flows (e.g. moveable modal). Submit actions: Create (new), Send quote, Update appointment (edit quote / reschedule), Hold Slot (when auth + role). Outcomes: success (confirmation), error, reset.
- **Edges:** Next / Previous. Skip to step 3 when loading appointment (dev or reschedule / edit quote). Conditions on wizard mode and user role for which buttons/actions exist. Validation failures (stay on step or show error).
- **Review:** Check for cycles that never reach Submit/Exit; nodes with no path to a terminal; and logic errors (e.g. reschedule path not setting reschedulingAppointmentId).

**Deliverable:** Mermaid flowchart or state diagram in project docs (e.g. `docs/wizard-flow.md` or Feature 9 plan). Derive from `client/src/configs/wizardSteps.ts`, `useWizardNavigation`, `BookingWizard.vue`, `useWizardAppointmentManagement`, and planned admin step 0.

### Phase 9.2: Alpha Testing Task Database

**Goal:** A database (and API) of **alpha test tasks**. Each task = one testable scenario that a human (or later an E2E test) can execute.

**Schema (conceptual):**

- **Task id** (e.g. UUID or short code).
- **Title / description** (e.g. "Complete wizard in quote mode and hold quote").
- **Category** (e.g. "Booking – new," "Booking – quote," "Booking – reschedule," "Admin – confirmation," "Admin – override").
- **Wizard path** (optional): which steps, which mode, which role.
- **Acceptance / verification** (what "done" looks like; becomes the E2E assertion list).
- **Depends on** (e.g. "Auth," "Reschedule API") so tasks are not assigned before the feature exists.
- **Assignment** (for guided alpha): tester id, assigned date, status (not started / in progress / done / skipped).

**Implementation:** Tables (e.g. `alpha_test_tasks`, `alpha_test_assignments`). Seed tasks from the Mermaid paths and product requirements. API to list tasks, assign tasks to users, and record completion.

### Phase 9.3: Guided Assignment and Blank Runs

**Goal:** Assign a random subset of tasks to each alpha tester; require 2–3 full "blank" wizard runs with their own data.

- **Random assignment:** Each tester gets a random subset (or one full shuffled set) of tasks so coverage is spread across people.
- **Blank runs:** In addition to assigned tasks, each tester completes 2–3 **full wizard runs with their own data** (no preloaded appointment) to catch real-world paths and UX issues.
- **In-app flow:** When authenticated (Feature 7), show "Your alpha tasks" and "Start blank run." Track progress and completion.

**Deliverable:** UI and API for viewing assigned tasks, marking tasks done, and starting/recording blank runs. Integration with Feature 7 (user identity).

### Phase 9.4: User Feedback & Error Wiring

**Goal:** Use a single, readable feedback pipeline for alpha and beta: rename the existing beta feedback system to **user_feedback** (database, routes, types, UI) and wire **all** feedback and automatically detected errors/warnings into it so CI/CD and planning can talk about feedback and updates from one place.

**Scope:**

- **Rename:** `beta_feedback` → `user_feedback` (tables, routes, models, client API, types, composables, components). One shared pipeline for manual feedback (alpha + beta) and auto-reported issues.
- **Source column:** Add `source` (or `origin`) to distinguish `user` | `alpha` | `error_boundary` | `console` (or equivalent) so dashboards and CI can filter.
- **Wiring:** Vue error boundary and any global error/logger paths POST to the same user-feedback API with appropriate category/severity and source (e.g. `source: 'error_boundary'`). Alpha flows submit with `source: 'alpha'`.

**Session:** 9.4.1 — see `features/guided-alpha-testing/sessions/session-9.4.1-guide.md`.

**Deliverable:** Database and API named `user_feedback`; all feedback and auto-detected errors flow into it; CI/CD can query one store for "feedback and updates."

### Implementation Order

| Step | What | Depends On |
|------|------|------------|
| 1 | **Wizard flow Mermaid (Phase 9.1)** — Document full wizard flow and branches; review for loops, dead ends, wrong logic. | — |
| 2 | **Alpha task database (Phase 9.2)** — Schema, seed tasks from flow + product requirements, API to list/assign/complete. | Step 1 |
| 3 | **Guided assignment + blank runs (Phase 9.3)** — Random assignment, "Your tasks" UI, 2–3 blank runs per tester. | Step 2, Feature 7 (auth) |
| 4 | **User feedback & error wiring (Phase 9.4)** — Rename beta_feedback → user_feedback; add source column; wire Vue error boundary and auto error reporting. Session 9.4.1. | Feature 14 (existing feedback system); can run in parallel with 9.1–9.3 |

### Related Documents

- LAUNCH_CHECKLIST.md Phase 6A (guided testing; update to "Guided Alpha")
- Feature 6 (Appointment Workflow) — wizard steps, modes, admin entry
- Feature 10 (Testing & Quality Validation) — E2E tests derived from alpha task list
- **Feature 9 Session 9.4.1:** `features/guided-alpha-testing/sessions/session-9.4.1-guide.md` — User Feedback & Error Wiring (rename to user_feedback, wire all feedback/errors)
