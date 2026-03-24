# Plan: session 7.1.1 — Migrations (sessions & magic_links)

## Contract
- **Tier:** session | **ID:** 7.1.1
- **Scope:** PostgreSQL migrations only for `sessions` and `magic_links` (Sequelize models are Session 7.1.2)
- **Governance:** Server/migration style and project DB policy; no client work in this session

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** cross_cutting
- **Governance domains:** docs
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
- Phase 7.1 is open on branch `phase-7.1`; session branch `session-7.1.1` is based on `phase-7.1` after rebase.
- Feature 7 stubs and PROJECT_PLAN describe strategy-pattern auth; this session only adds **DDL** for session store and magic-link rows — no `server/src/auth/` or Express auth routes yet.

## Goal
Ship **two Sequelize migrations** (or one combined migration if the repo prefers) that create **`sessions`** and **`magic_links`** tables in PostgreSQL with sensible columns, indexes (including expiry-oriented lookups), and **foreign keys to `users`** where the design requires a logged-in subject. Output must be ready for Session **7.1.2** to add Sequelize models without further schema changes.

## Files
- **Primary:** `server/migrations/*` — new migration file(s) following existing naming and `up`/`down` conventions.
- **Reference only:** `server/src/db/models/participantModels/Users.ts` (FK target), existing migrations for patterns, `PROJECT_PLAN.md` Feature 7 / LAUNCH_CHECKLIST Phase 2A.
- **Out of scope for 7.1.1:** `server/src/db/models/**` new model files (7.1.2), `client/**`, `server/src/auth/**`.

## Approach
1. **Inventory:** Read a recent migration in this repo and match module export style, timestamps, and raw SQL vs Sequelize queryInterface usage.
2. **`sessions` table:** Define storage for server-side sessions (e.g. session id, `user_id` nullable until post-login, `expires_at`, payload/`data` column type consistent with Phase 7.2 session manager design). Add indexes for primary lookup and optional expiry sweep.
3. **`magic_links` table:** Store hashed token (not raw), identifier for recipient (`email` and/or `user_id`), `expires_at`, `consumed_at` / boolean consumed, created timestamps. Index token hash and expiry cleanup.
4. **Policy:** Author migrations in-repo; run `npm run migrate` (or project script) only when `DB_HOST` is localhost per workspace rules; otherwise hand off execution to the DB host.
5. **Order:** Implement via tasks **7.1.1.1** then **7.1.1.2** (or merge into one task if you choose a single migration file — then adjust guide accordingly).

## Checkpoint
- `up` and `down` both run without error on a local Postgres when policy allows.
- Column names and types are documented enough for 7.1.2 model work; FK to `users` matches actual primary key type.
- No undocumented ad-hoc DDL outside migration files.

## How we build the tierDown to achieve them
- **Task 7.1.1.1:** Migration — `sessions` table (columns, indexes, FK to `users` as required)
- **Task 7.1.1.2:** Migration — `magic_links` table (token hash, expiry, consumption, indexes, optional `user_id` / email)
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/phases/phase-7.1-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
