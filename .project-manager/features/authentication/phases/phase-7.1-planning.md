# Plan: phase 7.1 — 7.1

## Contract
- **Tier:** phase | **ID:** 7.1
- **Scope:** 7.1
- **Governance:** Clean — no violations detected

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** architectural
- **Governance domains:** docs
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** light
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
- **Feature 7** is in planning; `.project-manager/PROJECT_PLAN.md` and `feature-authentication-guide.md` describe strategy-pattern auth (magic link → password later) and existing **security stubs** — no `server/src/auth/` yet, no `sessions` / `magic_links` tables.
- **Existing `User` model** (`server/src/db/models/participantModels/Users.ts`) is the natural FK target for session rows; Phase 7.1 aligns schema with that model and LAUNCH_CHECKLIST Phase 2A.
- **No blockers** for 7.1-only work beyond migration authority: run DDL only when `DB_HOST` is localhost per project rules; otherwise author migrations and execute on the host that owns the DB.

## Goal
**Phase 7.1 (this tier):** Add PostgreSQL persistence for auth-related data — migrations for **`sessions`** and **`magic_links`** (names as agreed in implementation), plus **Sequelize models** registered with the app — so Phase 7.2 can implement session manager, middleware, and strategies without schema gaps.

**Feature context (inheritance):** Later phases add server infrastructure (7.2), magic-link strategy (7.3), Vue client (7.4), and defer password production auth (7.5). Track **pre-alpha user-type switching** and **Google OAuth** as open questions in guides; they do not block 7.1 schema/models.

## Files
- **Planning / control:** `phase-7.1-planning.md` (this doc), `phase-7.1-guide.md`, `feature-authentication-guide.md`, feature log/handoff under `.project-manager/features/authentication/`.
- **Server (7.1):** `server/migrations/**` (new migration files), `server/src/db/models/**` (new or extended models + associations), `server/src/db/models/index.ts` wiring; reference existing `Users` model for FKs.
- **Deferred out of 7.1:** `server/src/auth/**`, middleware replacement, client auth UI — Phases 7.2–7.4.
- **Quality:** Governance playbooks under `.project-manager/`; session/task tier audits when coding tasks run.

## Approach
1. **Session 7.1.1:** Design and land migrations — `sessions` (server-side session store: e.g. `sid`, `user_id` FK to `users`, `expires_at`, `data` or JSON blob per chosen pattern), `magic_links` (token hash, email or user reference, expiry, consumed flag). Add indexes for lookup and expiry cleanup; follow existing Sequelize migration style in the repo.
2. **Session 7.1.2:** Implement Sequelize models, `init`/associations, export through model index; no Express middleware or routes required for 7.1 — behavior lives in 7.2+.
3. **Migration policy:** Author migrations in-repo; run `npm run migrate` (or project equivalent) only when local DB policy allows (`DB_HOST` localhost).
4. **After phase:** `/phase-end 7.1` when all sessions complete; then `/phase-start 7.2` per feature order in PROJECT_PLAN.

## Checkpoint
- **After 7.1.1:** Migrations applied (or ready to apply on host DB); tables match agreed columns and indexes; no ad-hoc DDL left undocumented.
- **After 7.1.2:** Models load in app bootstrap; associations to `User` (if applicable) defined; TypeScript types and Sequelize definitions consistent with migrations.

## How we build the tierDown to achieve them
- **Session 7.1.1:** Migrations — `sessions` and `magic_links` tables, indexes, FK to `users` where required
- **Session 7.1.2:** Sequelize models — register Session and MagicLink (or agreed names), associations, model index wiring
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/feature-authentication-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
