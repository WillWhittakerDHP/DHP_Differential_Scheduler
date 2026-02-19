# Feature 13: Guided Beta Testing — Feature Plan

**Feature:** Beta Tester Onboarding & Guided Testing
**Status:** 📋 Planning
**Created:** 2026-02-18
**Source:** BETA_LAUNCH_CHECKLIST.md Phase 6A

---

## Goal

Provide an interactive, in-app guided testing experience that welcomes beta testers, assigns them randomized test tasks across all feature areas, collects structured feedback per task, and gives you analytics on test coverage across your tester pool.

**Why Database-Driven:** Static checklists give every tester the same list. A database-driven system lets you randomly distribute tasks so different testers exercise different features, track which features have been tested by how many people, curate specific test data (addresses, configurations) without redeploying, and link each task directly to the feedback it generates.

**Dependency:** Requires Phase 2A (authentication) — task assignment needs user identity. The UI can be scaffolded before auth using localStorage, then upgraded to server-backed assignment once auth lands.

---

## Architecture

```
Beta Guided Testing System
─────────────────────────────────────────────────────────

  DATABASE LAYER
  ├── beta_test_tasks         — Pool of test tasks (curated by you)
  │   ├── feature_area, difficulty, estimated_minutes
  │   ├── test_data (JSONB)   — Specific addresses, user types, expected results
  │   └── min_completions     — Coverage target per task
  ├── beta_test_assignments   — Who got what, and did they finish
  │   ├── user_id (FK → users)
  │   ├── task_id (FK → beta_test_tasks)
  │   ├── status              — assigned → in_progress → completed / skipped
  │   └── feedback_id (FK → beta_feedback)
  └── beta_test_addresses     — Curated properties for address-dependent tasks

  SERVER LAYER
  ├── GET  /beta-testing/my-tasks     — Assignment algorithm + return tester's tasks
  ├── PATCH /beta-testing/tasks/:id   — Update task status
  ├── GET  /beta-testing/coverage     — Admin: coverage analytics
  └── CRUD /beta-testing/tasks        — Admin: manage task pool

  CLIENT LAYER
  └── BetaTestingGuide.vue — Floating panel (bottom-left)
      ├── Welcome section + Task checklist
      ├── Per-task feedback shortcut (pre-fills BetaFeedbackModal)
      └── Minimizable
```

---

## Assignment Algorithm

When a tester requests their tasks (`GET /beta-testing/my-tasks`):

1. Check existing assignments for this user.
2. If fewer than `TASKS_PER_TESTER` (e.g. 8–12), assign more from the pool.
3. Scoring: coverage priority (tasks with fewer completions vs min_completions), variety (feature areas not yet assigned), difficulty mix.
4. Weighted random selection from scored candidates.
5. Create `beta_test_assignments` rows with `status = 'assigned'`.

---

## Database Schema

Full SQL for `beta_test_tasks`, `beta_test_assignments`, and `beta_test_addresses` is in BETA_LAUNCH_CHECKLIST.md Phase 6A (Database Schema section). Summary:

- **beta_test_tasks:** id, title, description, prompt, feature_area, difficulty, estimated_minutes, test_data (JSONB), sort_order, is_active, min_completions, max_assignments, created_at, updated_at. Index on feature_area (partial is_active).
- **beta_test_assignments:** id, task_id, user_id, status, assigned_at, started_at, completed_at, feedback_id, notes. FKs to beta_test_tasks, users, beta_feedback. Unique (task_id, user_id).
- **beta_test_addresses:** id, address_line, city, state, zip, place_id, property_type, has_mls_data, expected_features (JSONB), notes, is_active, created_at.

**Feature area values:** booking_wizard, composite_blocks, differential_view, non_differential_view, property_details, availability, contacts, confirmation, admin_instances, admin_business_controls, calendar_integration, drive_time, address_autocomplete, mobile, quote_mode.

**Difficulty:** easy, medium, hard. **Status:** assigned, in_progress, completed, skipped.

Example `test_data` JSONB: `{ "addressId", "userType", "expectedServices", "steps": [...] }`. See checklist for full example and feature areas table with example tasks.

---

## Phase 13.1: Database & Models

- [ ] **6A.1** Create migration for beta_test_tasks, beta_test_assignments, beta_test_addresses (schema as in checklist).
- [ ] **6A.2** Create Sequelize models BetaTestTask, BetaTestAssignment, BetaTestAddress in server/src/db/models/beta/; register and set associations (Task hasMany Assignment, Assignment belongsTo Task/User/BetaFeedback).

---

## Phase 13.2: Seed Data & Assignment Algorithm & API

- [ ] **6A.3** Seed script for test tasks: ~20–25 tasks across feature areas, balance easy/medium/hard, include test_data JSONB.
- [ ] **6A.4** Seed script for test addresses: 5–8 curated addresses (single-family with MLS, multi-family, condo, far location, known MLS features), include place_id where possible.
- [ ] **6A.5** Assignment algorithm in server/src/services/beta/betaTestingAssignmentService.ts: assignTasksToUser(userId), TASKS_PER_TESTER, scoring and weighted random selection.
- [ ] **6A.6** Beta testing API router at /api/v1/internal/beta-testing: GET my-tasks, PATCH tasks/:assignmentId, GET coverage (admin), GET/POST/PATCH/DELETE tasks (admin). requireAuth; admin routes requireRole.
- [ ] **6A.7** Joi validation for task payloads and status transitions; validate feature_area and difficulty.

---

## Phase 13.3: Client Components

- [ ] **6A.8** useBetaTesting composable: fetchMyTasks, updateTaskStatus, fetchCoverage (admin); state: tasks, loading, error.
- [ ] **6A.9** BetaTestingGuide.vue: fixed bottom-left, welcome + task list + minimize; auto-open first visit (localStorage); minimize to tab; responsive (bottom sheet on mobile).
- [ ] **6A.10** BetaTestItem.vue: checkbox, title, difficulty badge, estimated time; expandable description/steps; "Give Feedback" emits context for pre-filled modal.
- [ ] **6A.11** Feedback linkage: prefill BetaFeedbackModal with description/category/assignmentId; on submit, set assignment.feedback_id; map feature_area to FeedbackCategory.

---

## Phase 13.4: Admin Coverage & Integration

- [ ] **6A.12** BetaTestingCoverageView.vue: route /beta-testing/coverage; heatmap by feature area (completions vs min_completions); per-task table (assignments, completions, skips, feedback count); per-tester table; highlight under-tested areas.
- [ ] **6A.13** Mount BetaTestingGuide in app layout (with BetaFeedbackWidget); show only when authenticated; pre-auth show welcome + "Log in to see your tasks".
- [ ] **6A.14** Add route /beta-testing/coverage → BetaTestingCoverageView; require admin role.

---

## Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Task storage | PostgreSQL | Global state, coverage aggregation, curated test data without redeploy |
| Assignment | Server-side weighted random | Cross-tester coverage; under-tested features get priority |
| Test addresses | Separate table | Reusable, updatable, structured |
| test_data | JSONB | Flexible per-task schema |
| UI position | Bottom-left panel | Coexists with feedback FAB (bottom-right) |

---

**Last Updated:** 2026-02-18
