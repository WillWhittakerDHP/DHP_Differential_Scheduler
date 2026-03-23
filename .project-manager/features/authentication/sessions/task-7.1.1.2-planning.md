# Plan: task 7.1.1.2 — Migration: `magic_links` table

## Contract
- **Tier:** task | **ID:** 7.1.1.2
- **Scope:** Single Sequelize migration adding **`public.magic_links`** only (sessions landed in task **7.1.1.1**)
- **Governance:** Thin migration module; DDL only — no models or routes

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Session 7.1.2 adds Sequelize models; this task is schema only.

## Where we left off
Task **7.1.1.1** added `public.sessions`. This task completes Session **7.1.1** migration scope with magic-link persistence for Phase **7.3** strategy.

## Goal
Add one **incremental migration** that creates **`public.magic_links`** for **passwordless / magic-link** flows: store **only a hash** of the raw token, **expiry**, **consumption** timestamp, optional **`email`** and **`user_id`** (UUID → `users`), and indexes for **verify-by-hash** and **expiry cleanup**. Shapes the table so Phase 7.3 can issue and verify links without schema churn.

## Files
- **Create:** `server/src/db/migrations/20260432_000041_magic_links_table_auth.mjs` (must sort after `20260432_000040_sessions_table_auth.mjs`).
- **Reference:** `server/src/db/migrations/20260432_000040_sessions_table_auth.mjs`, `20260324_000005_app_setting_entries.mjs`, `server/src/db/models/participantModels/Users.ts`.

## Approach
1. **Primary key:** `id UUID` default `gen_random_uuid()`.
2. **token_hash:** `TEXT NOT NULL` — application stores **hash** of the secret token (never the raw token).
3. **Recipient:** nullable **`email` TEXT**, nullable **`user_id` UUID REFERENCES public.users(id) ON DELETE SET NULL** (either or both per flow).
4. **Lifecycle:** **`expires_at` TIMESTAMPTZ NOT NULL**, **`consumed_at` TIMESTAMPTZ NULL** (NULL = unused).
5. **Optional `purpose` TEXT** — e.g. `login` / `verify_email` for filtering (nullable if unused in v1).
6. **Timestamps:** `created_at` / `updated_at` TIMESTAMPTZ with `NOW()` defaults.
7. **Indexes:** non-unique BTREE on **`token_hash`** for lookup; BTREE on **`expires_at`**; **partial unique** on **`(token_hash)` WHERE `consumed_at IS NULL`** so at most one active row per hash (adjust if product allows duplicate pending links).
8. **`down`:** `DROP TABLE IF EXISTS public.magic_links CASCADE`.
9. **Do not run** `npm run migrate` unless `DB_HOST` is localhost per project rules.

## Checkpoint
- `export default { up, down }` matches repo pattern; `users` FK uses **UUID**.
- No Sequelize models or `server/src/auth` in this task.

## Design Before Execute (pseudocode)

**`up`**
- `CREATE TABLE public.magic_links ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), token_hash TEXT NOT NULL, email TEXT NULL, user_id UUID NULL REFERENCES public.users(id) ON DELETE SET NULL, purpose TEXT NULL, expires_at TIMESTAMPTZ NOT NULL, consumed_at TIMESTAMPTZ NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW() );`
- `CREATE INDEX magic_links_token_hash_idx ON public.magic_links (token_hash);`
- `CREATE INDEX magic_links_expires_at_idx ON public.magic_links (expires_at);`
- `CREATE UNIQUE INDEX magic_links_token_hash_active_idx ON public.magic_links (token_hash) WHERE consumed_at IS NULL;`

**`down`**
- `DROP TABLE IF EXISTS public.magic_links CASCADE;`

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide: `.project-manager/features/authentication/sessions/session-7.1.1-guide.md`
- Prior task handoff: `.project-manager/features/authentication/sessions/task-7.1.1.1-handoff.md`
- Governance reports: `client/.audit-reports/`
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
