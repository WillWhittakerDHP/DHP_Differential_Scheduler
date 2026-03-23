# Plan: task 7.1.1.1 — Migration: `sessions` table

## Contract
- **Tier:** task | **ID:** 7.1.1.1
- **Scope:** Single Sequelize migration adding `public.sessions` only (`magic_links` is task **7.1.1.2**)
- **Governance:** Thin migration module, explicit SQL, logger on failure paths if any JS branching is added later

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is the single source of truth for this task; Session 7.1.2 will add the Sequelize model.

## Where we left off
Session **7.1.1** is planned; branch `session-7.1.1`. This task is the first coding slice: DDL only, no models or routes.

## Goal
Add one **incremental migration** (`.mjs` under `server/src/db/migrations/`) that creates **`public.sessions`** with columns compatible with a PostgreSQL session store for Phase **7.2** (Express/session manager): stable **session id**, **JSON payload**, **expiry**, optional **`user_id`** to `users.id` (UUID) for post-login association, plus indexes for lookup and expiry cleanup.

## Files
- **Create:** `server/src/db/migrations/20260432_000040_sessions_table_auth.mjs` (or next free `20260432_0000XX` if `000040` exists when implementing — must sort **after** the current latest migration in that folder).
- **Reference:** `server/src/db/migrations/20260324_000005_app_setting_entries.mjs` (raw SQL + `export default { up, down }`), `server/src/db/migrations/README.md`, `server/src/db/models/participantModels/Users.ts` (PK is **UUID** on `users.id`).

## Approach
1. **Shape:** Use **`sid`** (string PK), **`sess` JSONB NOT NULL**, **`expire` TIMESTAMPTZ NOT NULL** — aligns with common `connect-pg-simple` / express-session PostgreSQL stores so Phase 7.2 can adopt or wrap without renaming.
2. **Add** nullable **`user_id` UUID REFERENCES public.users(id) ON DELETE SET NULL** for “logged-in session” rows; keep nullable for anonymous/pre-auth.
3. **Add** optional **`created_at` / `updated_at` TIMESTAMPTZ** with defaults if useful for auditing (match project conventions; skip if you want minimal parity with off-the-shelf store).
4. **Indexes:** BTREE on **`expire`** (TTL sweeps); optional BTREE on **`user_id`** if queries will list sessions by user.
5. **`down`:** `DROP TABLE IF EXISTS public.sessions;` (or equivalent safe drop).
6. **Do not run** `npm run migrate` unless `DB_HOST` is localhost per project rules.

## Checkpoint
- New migration file follows existing **`export default { async up(queryInterface), async down(queryInterface) }`** pattern and uses `queryInterface.sequelize.query` for DDL.
- `users` FK uses **UUID** to match Sequelize `User.id`.
- No Sequelize **models** or **`server/src/auth`** changes in this task.

## Design Before Execute (pseudocode)

**`up`**
- `CREATE TABLE public.sessions ( sid VARCHAR(255) PRIMARY KEY, sess JSONB NOT NULL DEFAULT '{}'::jsonb, expire TIMESTAMPTZ NOT NULL, user_id UUID NULL REFERENCES public.users(id) ON DELETE SET NULL, ... );`
- `CREATE INDEX ... ON public.sessions (expire);`
- Optional: `CREATE INDEX ... ON public.sessions (user_id) WHERE user_id IS NOT NULL;`

**`down`**
- `DROP TABLE IF EXISTS public.sessions CASCADE;`

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/sessions/session-7.1.1-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
