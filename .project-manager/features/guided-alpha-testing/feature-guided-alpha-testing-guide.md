**Purpose:** Feature-level guide for planning and tracking Feature 9. Content mirrors PROJECT_PLAN Feature 9; see `.project-manager/PROJECT_PLAN.md` for single source of truth.

---

## Feature 9: Guided Alpha Testing

**Status:** 📋 Planning
**Description:** Validate the product before authoring E2E tests: (1) document the booking wizard flow and all logical branches in a Mermaid diagram to find bad loops, dead ends, or wrong wiring; (2) build an alpha testing task database where each row is one E2E-testable task; (3) randomly assign tasks to alpha testers and require 2–3 "blank" full wizard runs with their own data. E2E tests (Feature 10) are then derived from this task list. Depends on Feature 7 (Authentication) for assigning tasks to users.
**Branch:** TBD
**Directory:** `features/guided-alpha-testing/`

### Why Before Feature 10 (Testing)

We need to know **what to test** before writing E2E tests. Guided Alpha Testing produces the canonical list of testable scenarios (wizard paths, modes, roles) and validates the flow with real users. That task list becomes the source for Feature 10's E2E test cases and for assigning work to alpha testers.

### Open Questions (Feature 9)

1. **Out-of-state testers and address generation:** Some alpha testers will be out of state and unable to enter a local property address. Should the wizard include a "show random address" button that generates a random address in the metro area or pulls one from the appointment database? *(Needs design decision — affects Property Details step UI and data seeding strategy.)*

2. **Alpha cohorts vs `user_role`:** Labels such as **dev**, **agent**, and **friend** must map to **`users.user_role`** for auth and task assignment. **Agent** → `agent`. **Dev** / **friend** may map onto existing ENUM values (e.g. `client`, `inspector`) for alpha without schema work, or gain dedicated roles only after **Feature 6 Phase 6.18** and ENUM changes — document the chosen mapping in task seeds and tester onboarding. See **Feature 6** Open Questions in `.project-manager/PROJECT_PLAN.md` and `features/appointment-workflow/phases/phase-6.18-guide.md`.

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
- **Wizard path** (optional): which steps, which mode, which role (canonical **`user_role`** per Feature 6 Phase 6.18 / `@shared`).
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

- **Notes for trusted dev friends (alpha):** repo access, companion texts, and the **harness** narrative — see `.project-manager/PROJECT_PLAN.md` Feature 9 → **Notes and deliverables for dev friends (alpha)**.
- LAUNCH_CHECKLIST.md Phase 6A (guided testing; update to "Guided Alpha")
- Feature 6 (Appointment Workflow) — wizard steps, modes, admin entry; **Phase 6.18** (canonical `user_role` catalog)
- Feature 7 (Authentication) — Enactment uses shared role vocabulary with Phase 6.18
- Feature 10 (Testing & Quality Validation) — E2E tests derived from alpha task list
- **Feature 9 Session 9.4.1:** `features/guided-alpha-testing/sessions/session-9.4.1-guide.md` — User Feedback & Error Wiring (rename to user_feedback, wire all feedback/errors)

---

## Session docs (integrated)

### session-9.4.1-guide

# Session 9.4.1 Guide: User Feedback & Error Wiring

**Phase:** 9.4 — User Feedback & Error Wiring  
**Session:** 9.4.1 — Rename to user_feedback and wire all feedback/errors  
**Status:** Not Started  
**Branch:** TBD (e.g. `feature/guided-alpha-testing-phase-9.4-session-9.4.1`)

---

## Session Overview

Wire **all** feedback and automatically detected errors/warnings into a single, readable pipeline so alpha testing (and later beta and production) use one database and API. The existing system is named **beta_feedback** (tables, routes, models, client). This session renames it to **user_feedback** and adds a **source** (or **origin**) column so entries can be distinguished (e.g. manual user, alpha tester, Vue error boundary, console/logger). Then wire the Vue error boundary and any global error/logger paths to POST into this same API so CI/CD and planning can talk about "feedback and updates" from one place.

**Why this belongs in Guided Alpha Testing:** Alpha testers and automated error detection both produce feedback we want in one queryable store. Renaming to "user_feedback" makes the system stage-agnostic (alpha, beta, production) and clarifies that the same pipeline accepts manual feedback and auto-reported issues.

---

## Key Context (Current State)

| Layer | Current name / location |
|-------|--------------------------|
| **DB** | Tables: `beta_feedback`, `beta_feedback_tags`. Migration: `server/src/db/migrations/20260210_100000_create_beta_feedback.mjs`. |
| **Server models** | `server/src/db/models/beta/beta_feedback.ts` (class `BetaFeedback`), `beta_feedback_tag.ts` (`BetaFeedbackTag`). Registered in `server/src/db/models/index.ts` (BetaFeedbackFactory, BetaFeedbackTagFactory). |
| **Server routes** | Folder: `server/src/routes/internal/beta-feedback/`. Mount path: `/beta-feedback` in `server/src/routes/internal/index.ts`. Files: `betaFeedbackRouter.ts`, `betaFeedbackCrudRouter.ts`, `betaFeedbackConstants.ts`, `betaFeedbackValidators.ts`, `betaFeedbackErrorHandler.ts`. |
| **Client API** | `client/src/utils/api/betaFeedbackApi.ts` — base path `/beta-feedback`, endpoints for list, by-id, stats. |
| **Client types** | `client/src/types/betaFeedback.ts` — FeedbackCategory, FeedbackSeverity, FeedbackStatus, BetaFeedback, etc. |
| **Client composables** | `client/src/composables/beta/` — useFeedbackSubmit, useFeedbackDetail, useFeedbackDashboard; they call `betaFeedback()` from `client/src/utils/beta/betaFeedback.ts`. |
| **Client components/views** | `client/src/components/beta/` (BetaFeedbackModal, BetaFeedbackDashboard, BetaFeedbackButton, etc.), `client/src/views/beta/BetaFeedbackView.vue`. Route: path `/beta-feedback`, name `beta-feedback` in `client/src/router/index.ts`. |

**What does NOT exist yet:** No `source`/`origin` column. No Vue error boundary or logger wiring that POSTs to this feedback API. No CI/CD integration that reads from this database (that comes later; this session makes the data model and API ready).

---

## Instructions and Notes

### 1. Database: Rename tables and add `source` column

- **Do not edit the original migration** `20260210_100000_create_beta_feedback.mjs`. Existing environments have already run it.
- **Create a new migration** (e.g. `YYYYMMDD_HHMMSS_rename_beta_feedback_to_user_feedback.mjs`) that:
  - Renames table `beta_feedback` → `user_feedback`.
  - Renames table `beta_feedback_tags` → `user_feedback_tags`.
  - Updates the foreign key in `user_feedback_tags` so `feedback_id` references `user_feedback(id)` (the column name can stay `feedback_id`).
  - Adds a new column to `user_feedback`, e.g. `source varchar(50) NOT NULL DEFAULT 'user'`. Allowed values: `'user'`, `'alpha'`, `'error_boundary'`, `'console'` (or equivalent enum/check). Document the allowed values in the migration comment and in the model.
- **Down migration:** Reverse the renames and drop the `source` column so a rollback restores `beta_feedback` / `beta_feedback_tags` without `source`.

**Checkpoint:** Migration runs `up` and `down` successfully; `user_feedback` and `user_feedback_tags` exist; `user_feedback.source` exists with default `'user'`.

---

### 2. Server: Models and routes renamed to user_feedback

- **Models:**
  - Move or copy `server/src/db/models/beta/beta_feedback.ts` to a new location (e.g. `server/src/db/models/feedback/user_feedback.ts`). Rename class `BetaFeedback` → `UserFeedback`, `modelName`/`tableName` to `user_feedback`. Add `source` attribute (string, default `'user'`). Optionally keep the same type names for category/severity/status or rename to `UserFeedbackCategory` etc. for consistency.
  - Same for the tag model: `user_feedback_tag.ts`, class `UserFeedbackTag`, table `user_feedback_tags`, association to `user_feedback`.
  - Update `server/src/db/models/index.ts`: register `UserFeedbackFactory` and `UserFeedbackTagFactory`; remove or deprecate Beta* registrations once all route code is switched.
- **Routes:**
  - Rename folder `server/src/routes/internal/beta-feedback/` → `server/src/routes/internal/user-feedback/`.
  - Rename files: e.g. `userFeedbackRouter.ts`, `userFeedbackCrudRouter.ts`, `userFeedbackConstants.ts`, `userFeedbackValidators.ts`, `userFeedbackErrorHandler.ts`. Replace all references to `BetaFeedback` model with `UserFeedback`, and to beta_feedback table names where applicable.
  - In `server/src/routes/internal/index.ts`: change import from `./beta-feedback/betaFeedbackRouter.js` to `./user-feedback/userFeedbackRouter.js`, and mount with `router.use('/user-feedback', UserFeedbackRouter)` (so API path becomes `/api/v1/internal/user-feedback`).
- **Validators and constants:** Accept `source` in create/update body where appropriate; validate against allowed values. Constants and error messages should refer to "user feedback" not "beta feedback."

**Checkpoint:** Server starts; `GET/POST /api/v1/internal/user-feedback` and related CRUD work; create body can include `source` (e.g. `alpha`, `error_boundary`); existing beta_feedback routes removed or deprecated.

---

### 3. Client: API, types, composables, components

- **API:** Rename `client/src/utils/api/betaFeedbackApi.ts` → `userFeedbackApi.ts`. Change base path from `/beta-feedback` to `/user-feedback`. Export the same shape of functions (getUserFeedback, getUserFeedbackById, getUserFeedbackStats, submit payload). Include `source` in the submit payload type.
- **Types:** Rename `client/src/types/betaFeedback.ts` → `client/src/types/userFeedback.ts`. Rename types (e.g. `BetaFeedback` → `UserFeedback`, `BetaFeedbackFilters` → `UserFeedbackFilters`) and add `source` to the feedback type. Keep category/severity/status as-is unless you prefer a `UserFeedback*` prefix.
- **Utils:** Rename `client/src/utils/beta/betaFeedback.ts` → e.g. `client/src/utils/feedback/userFeedback.ts`. Function name can become `userFeedback()` returning the same shape; internally call the new API and types.
- **Composables:** Update `client/src/composables/beta/useFeedbackSubmit.ts`, `useFeedbackDetail.ts`, `useFeedbackDashboard.ts` to import from the new userFeedback API and types. Optionally move to `client/src/composables/feedback/` and keep names (useFeedbackSubmit etc.) so call sites change minimally.
- **Components and views:** Rename `BetaFeedbackModal` → `UserFeedbackModal`, `BetaFeedbackDashboard` → `UserFeedbackDashboard`, etc., or keep "Feedback" only (e.g. `FeedbackModal`). Update all imports and references. In `client/src/router/index.ts`, change path from `/beta-feedback` to `/user-feedback` and name to `user-feedback` (or `feedback`). Update any nav links or redirects that point to `beta-feedback`.
- **Exports:** Update `client/src/utils/api/index.ts` to export from `userFeedbackApi` instead of `betaFeedbackApi`.

**Checkpoint:** Client builds; feedback modal and dashboard work against `/user-feedback`; submitted feedback includes `source` (default `user` or leave server default); no remaining references to `beta-feedback` or `betaFeedback` in the client except possibly in comments or docs.

---

### 4. Wire Vue error boundary and auto error reporting

- **Vue error boundary:** If not already present, add an app-level error boundary (e.g. Vue 3 `onErrorCaptured` or a wrapper component that catches errors and renders a fallback UI). In the error handler, in addition to showing the fallback UI, call the user-feedback API to POST a new feedback entry with:
  - `category`: e.g. `'bug'` or a dedicated category like `'auto_error'` if you add it.
  - `severity`: e.g. `'high'` or `'critical'`.
  - `title`: e.g. "Error boundary: [component name or route]."
  - `description`: include error message, stack (if safe to send), component/route info. No PII.
  - `source`: `'error_boundary'`.
  - `reporterName`/`reporterEmail`: optional or "System" / null if unauthenticated.
- **Logger / global error handler:** If the client has a global error or logger that runs on unhandled errors or console.error, add an optional path that POSTs to the same user-feedback API with `source: 'console'` (or `'logger'`) and similar title/description. Ensure this does not create infinite loops (e.g. if the POST fails, log locally only; do not trigger another POST).
- **Alpha flows:** When alpha testers submit feedback from the guided alpha flow, set `source: 'alpha'` in the submit payload so it can be filtered in dashboards and CI.

**Checkpoint:** Triggering a component error (e.g. throw in a child) results in a fallback UI and a new row in `user_feedback` with `source = 'error_boundary'`. Optional: console/logger path also creates rows with `source = 'console'`. No duplicate or recursive POSTs.

---

### 5. Documentation and project plan updates

- **PROJECT_PLAN.md:** Feature 14 (Beta Feedback System) description and related docs can state that the system has been generalized to "user feedback" (Phase 9.4) and is used for alpha, beta, and auto-detected errors. Feature 15 (Beta Feedback Response) still applies to triaging/responding to feedback in this table.
- **LAUNCH_CHECKLIST.md:** Any references to "beta feedback" as the only pipeline should note that the same pipeline is now "user feedback" and used for alpha and auto errors.
- **README or feature docs:** In `.project-manager/features/beta-feedback/` or a new `guided-alpha-testing` or `user-feedback` doc, note: database and API are named `user_feedback`; allowed `source` values; how CI/CD can query (e.g. "all feedback" or "where source in ('alpha','error_boundary','console')").

**Checkpoint:** Docs and project plan consistently refer to user_feedback and Phase 9.4; no stale "beta_feedback only" wording.

---

## Tasks (Summary)

| Task | Description | Status |
|------|-------------|--------|
| 9.4.1.1 | **Migration:** New migration to rename beta_feedback → user_feedback, beta_feedback_tags → user_feedback_tags, add source column. | Not Started |
| 9.4.1.2 | **Server:** Models UserFeedback / UserFeedbackTag; routes under user-feedback; mount /user-feedback; validators/constants for source. | Not Started |
| 9.4.1.3 | **Client:** API, types, utils, composables, components/views and router renamed to user_feedback; include source in submit. | Not Started |
| 9.4.1.4 | **Wiring:** Vue error boundary POSTs to user-feedback API with source 'error_boundary'; optional logger/console path with source 'console'; alpha flows use source 'alpha'. | Not Started |
| 9.4.1.5 | **Docs:** PROJECT_PLAN, LAUNCH_CHECKLIST, and feature READMEs updated for user_feedback and Phase 9.4. | Not Started |

---

---

## Dependencies

- Existing beta feedback system (Feature 14) in place — we are renaming and extending it, not building from scratch.
- No hard dependency on Feature 7 for the rename; wiring alpha flows to send `source: 'alpha'` may depend on Feature 7 (auth) when alpha tester identity is required.

---

## Success Criteria

- [ ] Migration runs up/down; tables `user_feedback` and `user_feedback_tags` exist with `source` on `user_feedback`.
- [ ] Server exposes only `/user-feedback` (no `/beta-feedback`); CRUD and stats work; create accepts `source`.
- [ ] Client uses only user-feedback API and types; modal and dashboard work; route is `/user-feedback`.
- [ ] Error boundary (and optional logger) POST to user-feedback API with correct source; no recursive POSTs.
- [ ] PROJECT_PLAN and related docs updated; CI/CD can later query one user_feedback store for "feedback and updates."

---

## Related Documents

- **PROJECT_PLAN.md** — Feature 9 Phase 9.4, Implementation Order Step 4
- **Feature 14 (Beta Feedback System)** — current implementation being generalized to user_feedback
- **LAUNCH_CHECKLIST.md** Phase 6A — guided testing; Pre-Launch Polish (Feature 12) note on error boundary sending to feedback chain

