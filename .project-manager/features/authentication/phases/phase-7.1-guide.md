# Phase 7.1: Database & Models

**Purpose:** Phase-level guide for Feature 7 — persist sessions and magic-link tokens before server auth infrastructure (Phase 7.2).

**Tier:** Phase (Tier 1)

---

## Overview

**Phase number:** 7.1  
**Name:** Database & Models  
**Status:** In Progress  
**Branch:** `phase-7.1` (from `feature/authentication`)

This phase adds PostgreSQL tables and Sequelize models for **`sessions`** and **`magic_links`** per PROJECT_PLAN Feature 7 Step 1 and LAUNCH_CHECKLIST Phase 2A (migrations, models, index registration). No auth router, strategies, or middleware here—only the data layer so Phase 7.2 can implement session manager and `requireAuth`.

---

## Objectives

- Ship idempotent migrations creating `sessions` and `magic_links` with columns and indexes aligned with downstream session manager and magic-link verify flows.
- Implement Sequelize models with explicit fields and typings consistent with the rest of `server/src/db/models`.
- Register models in `server/src/db/models/index.ts` and verify dev migrate + server boot with no registration gaps.

---

## Tasks

Work is organized into three sessions (7.1.1–7.1.3). Each session has its own guide under `sessions/`; task-level IDs are created at `/session-start`. Complete sessions in order; use `/session-end` before starting the next session.

---

## Sessions Breakdown

- [x] ### Session 7.1.1: Migrations for sessions and magic_links
**Description:** Add idempotent DB migrations creating `sessions` and `magic_links` with columns and indexes per Feature 7 / LAUNCH_CHECKLIST 2A.1.
**Goal:** Tables exist in dev with schema ready for session manager and magic-link consumption in Phase 7.2–7.3.
**Files:** `server/src/db/migrations/*` (new migration files following repo conventions)
**Approach:** Mirror existing migration patterns; define primary keys, foreign keys only if required by schema design, indexes for lookup by token/session id as needed; run migrate up locally.
**Checkpoint:** Migration succeeds; tables visible in PostgreSQL with expected columns.
**Tasks:** Typically 2–3 tasks created at `/session-start 7.1.1`.
**Focus:**
- Schema matches downstream session manager and magic-link verify flow
- Migration style matches existing server migrations

- [ ] ### Session 7.1.2: Sequelize models for auth tables
**Description:** Implement Sequelize models for the new tables; define fields, timestamps, and any required associations.
**Goal:** Typed models match migrations; associations documented where used by later phases.
**Files:** `server/src/db/models/**` (new model module(s)), types co-located or shared per codebase pattern
**Approach:** Define model classes, field maps, timestamps alignment with rest of app; minimal associations only if schema requires; no route or service wiring yet.
**Checkpoint:** Models import without error; field set matches migrations.
**Tasks:** Typically 2–3 tasks at `/session-start 7.1.2`.
**Focus:**
- Explicit typings and model layout consistent with codebase patterns

- [ ] ### Session 7.1.3: Model registration and boot verification
**Description:** Register models in `server/src/db/models/index.ts`; run migrate/sync and confirm server boot against dev DB.
**Goal:** Application discovery loads auth tables through the same index as other models; dev boot is green.
**Files:** `server/src/db/models/index.ts`, bootstrap touch points only if required
**Approach:** Export/register new models in index; run dev server or test boot path; fix circular imports or naming collisions.
**Checkpoint:** Server starts against migrated DB; Phase 7.2 can begin.
**Tasks:** Typically 1–2 tasks at `/session-start 7.1.3`.
**Focus:**
- No Sequelize registration gaps; ready for Phase 7.2

---

## Dependencies

**Prerequisites:** PostgreSQL dev database; working Sequelize migration pipeline; branch `phase-7.1`.

**Downstream impact:** Phase 7.2 (server auth infrastructure) depends on these tables and models.

---

## Success Criteria

- [ ] All sessions 7.1.1–7.1.3 completed
- [ ] Migrations and models match planned contract for sessions and magic links
- [ ] Server boots with models registered; lint and app start pass per session workflow
- [ ] Ready for `/phase-end` when all sessions are done

---

## End of Phase Workflow

After all sessions complete, prompt before `/phase-end` (merge phase branch, update control docs, audits per harness).

---

## Notes

Exact column shapes (session id storage, user FK nullable vs deferred) should follow LAUNCH_CHECKLIST 2A and team review; record decisions here when locked.

---

## Related Documents

- Phase planning: `.project-manager/features/authentication/phases/phase-7.1-planning.md`
- Phase log: `.project-manager/features/authentication/phases/phase-7.1-log.md`
- Phase handoff: `.project-manager/features/authentication/phases/phase-7.1-handoff.md`
- Session guides: `.project-manager/features/authentication/sessions/session-7.1.*-guide.md`
