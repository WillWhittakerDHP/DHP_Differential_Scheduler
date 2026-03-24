<!-- harness-planning-rollup tier=session id=7.1.1 consolidatedAt=2026-03-24T22:18:02.754Z -->

# Consolidated planning: session 7.1.1

## Session 7.1.1 (parent)

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

---

## Task 7.1.1.1 (source: task-7.1.1.1-planning.md)

### Goal

Add one **incremental migration** (`.mjs` under `server/src/db/migrations/`) that creates **`public.sessions`** with columns compatible with a PostgreSQL session store for Phase **7.2** (Express/session manager): stable **session id**, **JSON payload**, **expiry**, optional **`user_id`** to `users.id` (UUID) for post-login association, plus indexes for lookup and expiry cleanup.

### Files

- **Create:** `server/src/db/migrations/20260432_000040_sessions_table_auth.mjs` (or next free `20260432_0000XX` if `000040` exists when implementing — must sort **after** the current latest migration in that folder).
- **Reference:** `server/src/db/migrations/20260324_000005_app_setting_entries.mjs` (raw SQL + `export default { up, down }`), `server/src/db/migrations/README.md`, `server/src/db/models/participantModels/Users.ts` (PK is **UUID** on `users.id`).

### Approach

1. **Shape:** Use **`sid`** (string PK), **`sess` JSONB NOT NULL**, **`expire` TIMESTAMPTZ NOT NULL** — aligns with common `connect-pg-simple` / express-session PostgreSQL stores so Phase 7.2 can adopt or wrap without renaming.
2. **Add** nullable **`user_id` UUID REFERENCES public.users(id) ON DELETE SET NULL** for “logged-in session” rows; keep nullable for anonymous/pre-auth.
3. **Add** optional **`created_at` / `updated_at` TIMESTAMPTZ** with defaults if useful for auditing (match project conventions; skip if you want minimal parity with off-the-shelf store).
4. **Indexes:** BTREE on **`expire`** (TTL sweeps); optional BTREE on **`user_id`** if queries will list sessions by user.
5. **`down`:** `DROP TABLE IF EXISTS public.sessions;` (or equivalent safe drop).
6. **Do not run** `npm run migrate` unless `DB_HOST` is localhost per project rules.

### Checkpoint

- New migration file follows existing **`export default { async up(queryInterface), async down(queryInterface) }`** pattern and uses `queryInterface.sequelize.query` for DDL.
- `users` FK uses **UUID** to match Sequelize `User.id`.
- No Sequelize **models** or **`server/src/auth`** changes in this task.

### Design

**`up`**
- `CREATE TABLE public.sessions ( sid VARCHAR(255) PRIMARY KEY, sess JSONB NOT NULL DEFAULT '{}'::jsonb, expire TIMESTAMPTZ NOT NULL, user_id UUID NULL REFERENCES public.users(id) ON DELETE SET NULL, ... );`
- `CREATE INDEX ... ON public.sessions (expire);`
- Optional: `CREATE INDEX ... ON public.sessions (user_id) WHERE user_id IS NOT NULL;`

**`down`**
- `DROP TABLE IF EXISTS public.sessions CASCADE;`

---

---

## Task 7.1.1.2 (source: task-7.1.1.2-planning.md)

### Goal

Add one **incremental migration** that creates **`public.magic_links`** for **passwordless / magic-link** flows: store **only a hash** of the raw token, **expiry**, **consumption** timestamp, optional **`email`** and **`user_id`** (UUID → `users`), and indexes for **verify-by-hash** and **expiry cleanup**. Shapes the table so Phase 7.3 can issue and verify links without schema churn.

### Files

- **Create:** `server/src/db/migrations/20260432_000041_magic_links_table_auth.mjs` (must sort after `20260432_000040_sessions_table_auth.mjs`).
- **Reference:** `server/src/db/migrations/20260432_000040_sessions_table_auth.mjs`, `20260324_000005_app_setting_entries.mjs`, `server/src/db/models/participantModels/Users.ts`.

### Approach

1. **Primary key:** `id UUID` default `gen_random_uuid()`.
2. **token_hash:** `TEXT NOT NULL` — application stores **hash** of the secret token (never the raw token).
3. **Recipient:** nullable **`email` TEXT**, nullable **`user_id` UUID REFERENCES public.users(id) ON DELETE SET NULL** (either or both per flow).
4. **Lifecycle:** **`expires_at` TIMESTAMPTZ NOT NULL**, **`consumed_at` TIMESTAMPTZ NULL** (NULL = unused).
5. **Optional `purpose` TEXT** — e.g. `login` / `verify_email` for filtering (nullable if unused in v1).
6. **Timestamps:** `created_at` / `updated_at` TIMESTAMPTZ with `NOW()` defaults.
7. **Indexes:** non-unique BTREE on **`token_hash`** for lookup; BTREE on **`expires_at`**; **partial unique** on **`(token_hash)` WHERE `consumed_at IS NULL`** so at most one active row per hash (adjust if product allows duplicate pending links).
8. **`down`:** `DROP TABLE IF EXISTS public.magic_links CASCADE`.
9. **Do not run** `npm run migrate` unless `DB_HOST` is localhost per project rules.

### Checkpoint

- `export default { up, down }` matches repo pattern; `users` FK uses **UUID**.
- No Sequelize models or `server/src/auth` in this task.

### Design

**`up`**
- `CREATE TABLE public.magic_links ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), token_hash TEXT NOT NULL, email TEXT NULL, user_id UUID NULL REFERENCES public.users(id) ON DELETE SET NULL, purpose TEXT NULL, expires_at TIMESTAMPTZ NOT NULL, consumed_at TIMESTAMPTZ NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW() );`
- `CREATE INDEX magic_links_token_hash_idx ON public.magic_links (token_hash);`
- `CREATE INDEX magic_links_expires_at_idx ON public.magic_links (expires_at);`
- `CREATE UNIQUE INDEX magic_links_token_hash_active_idx ON public.magic_links (token_hash) WHERE consumed_at IS NULL;`

**`down`**
- `DROP TABLE IF EXISTS public.magic_links CASCADE;`

---

---
