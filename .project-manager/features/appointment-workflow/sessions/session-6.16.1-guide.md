# Session 6.16.1 Guide: Margin role — types, pipeline, admin

**Purpose:** Session-level guide with task breakdown

**Tier:** Session (Tier 2 - Medium-Level)

---

## Overview

**Session ID:** 6.16.1  
**Session Name:** Margin role — types, pipeline, admin  
**Description:** Add `margin` to `DifferentialRole` across shared types, DB ENUM + server model, part finalizer (`minimizer: 'override'`), and admin differential-role overrides. Migration is authored; execution follows project DB policy.

**Status:** Not started

---

## Objectives

- Extend `DifferentialRole` and storage union with `margin`.
- Author migration adding `margin` to `differential_role` ENUM.
- Map `margin` → `PartFinal.minimizer: 'override'` in `resolvePartShapeDifferentialFlags`.
- Surface **Margin** in admin override UI.

---

## Tasks

- [ ] #### Task 6.16.1.1: Shared types + constants for margin
**Goal:** Add `margin` to unions, labels, select options, and `differentialRoleUtils` guards.
**Files:** `shared/types/differentialRole.ts`, `shared/constants/differentialRoleMappings.ts`, `shared/utils/differentialRoleUtils.ts`

- [ ] #### Task 6.16.1.2: Server model + migration
**Goal:** Sequelize model + ENUM include `margin`; add migration file.
**Files:** `server/src/db/models/booking/event_shape.ts`, `server/src/db/migrations/`

- [ ] #### Task 6.16.1.3: Part finalizer — margin branch
**Goal:** `role === 'margin'` → `minimizer = 'override'` in `resolvePartShapeDifferentialFlags`.
**Files:** `client/src/utils/booking/partFinalizer.ts`

- [ ] #### Task 6.16.1.4: Admin UI + lint
**Goal:** Confirm Margin in override dropdown; `cd client && npm run lint`, `cd server && npm run lint`; app starts.
**Files:** `DifferentialEventRoleOverridesField.vue`, `differentialRoleMatrixRows.ts`

---

## Related Documents

- `phases/phase-6.16-guide.md`
- `sessions/session-6.16.1-planning.md`
