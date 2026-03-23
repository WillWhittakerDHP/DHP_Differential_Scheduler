# Phase 7.1 — Database & Models

## Overview

**Phase Number:** 7.1  
**Phase Name:** Database & Models  
**Description:** PostgreSQL migrations for `sessions` and `magic_links` tables plus Sequelize models, aligned with Feature 7 (Authentication) in PROJECT_PLAN. No Express auth routes or client UI in this phase.

**Status:** In Progress  
**Feature:** authentication (see `feature-authentication-guide.md`).

## Objectives

- Land **migrations** for server-side **sessions** and **magic_links** persistence with appropriate indexes and FK to `users` where required (LAUNCH_CHECKLIST Phase 2A / PROJECT_PLAN Feature 7).
- Register **Sequelize models** and associations consistent with those tables; integrate with existing **`User`** model where foreign keys apply.
- Respect **migration authority**: run DDL only when `DB_HOST` is localhost; otherwise author migrations for execution on the DB host.
- No auth middleware, routes, or client UI in this phase — Phase 7.2+ only.

## Tasks

Sessions and tasks for this phase. See **Sessions Breakdown** below.

---

## Sessions Breakdown

- [ ] ### Session 7.1.1: Migrations — sessions & magic_links
**Description:** Add Sequelize migrations creating `sessions` and `magic_links` (or agreed table names) with appropriate columns, indexes, and FK to `users` as needed.
**Tasks:** [To be planned]
**Focus:**
- Match columns to session-manager / magic-link design (expiry, token storage, user linkage)
- Follow repo migration conventions; respect DB_HOST policy for running migrations

- [ ] ### Session 7.1.2: Sequelize models & registration
**Description:** Implement models for the new tables, define associations to `User`, export via `server/src/db/models/index.ts` (and association files if required by repo pattern).
**Tasks:** [To be planned]
**Focus:**
- Type-safe model definitions consistent with migrations
- No Express wiring — Phase 7.2 owns session manager and middleware

---

## Dependencies

**Prerequisites:** Feature branch and phase branch per harness; existing `User` model in codebase.

**Downstream:** Phase 7.2 (server auth infrastructure) depends on schema and models from this phase.

---

## Success Criteria

- [ ] All sessions in this phase completed
- [ ] Migrations and models reviewed against PROJECT_PLAN Feature 7 step 1
- [ ] Ready for `/phase-end 7.1` when scoped work is done

---

## Related Documents

- Feature guide: `.project-manager/features/authentication/feature-authentication-guide.md`
- Phase planning: `.project-manager/features/authentication/phases/phase-7.1-planning.md`
- Session guides: `.project-manager/features/authentication/sessions/session-7.1.*-guide.md`
