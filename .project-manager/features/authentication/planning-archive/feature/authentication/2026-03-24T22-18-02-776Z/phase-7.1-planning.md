<!-- harness-planning-rollup tier=phase id=7.1 consolidatedAt=2026-03-24T22:18:02.773Z -->

# Consolidated planning: phase 7.1

## Phase 7.1 (parent)

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

---

## Session 7.1.1 (source: session-7.1.1-planning.md)

### Goal

Ship **two Sequelize migrations** (or one combined migration if the repo prefers) that create **`sessions`** and **`magic_links`** tables in PostgreSQL with sensible columns, indexes (including expiry-oriented lookups), and **foreign keys to `users`** where the design requires a logged-in subject. Output must be ready for Session **7.1.2** to add Sequelize models without further schema changes.

### Files

- **Primary:** `server/migrations/*` — new migration file(s) following existing naming and `up`/`down` conventions.
- **Reference only:** `server/src/db/models/participantModels/Users.ts` (FK target), existing migrations for patterns, `PROJECT_PLAN.md` Feature 7 / LAUNCH_CHECKLIST Phase 2A.
- **Out of scope for 7.1.1:** `server/src/db/models/**` new model files (7.1.2), `client/**`, `server/src/auth/**`.

### Approach

1. **Inventory:** Read a recent migration in this repo and match module export style, timestamps, and raw SQL vs Sequelize queryInterface usage.
2. **`sessions` table:** Define storage for server-side sessions (e.g. session id, `user_id` nullable until post-login, `expires_at`, payload/`data` column type consistent with Phase 7.2 session manager design). Add indexes for primary lookup and optional expiry sweep.
3. **`magic_links` table:** Store hashed token (not raw), identifier for recipient (`email` and/or `user_id`), `expires_at`, `consumed_at` / boolean consumed, created timestamps. Index token hash and expiry cleanup.
4. **Policy:** Author migrations in-repo; run `npm run migrate` (or project script) only when `DB_HOST` is localhost per workspace rules; otherwise hand off execution to the DB host.
5. **Order:** Implement via tasks **7.1.1.1** then **7.1.1.2** (or merge into one task if you choose a single migration file — then adjust guide accordingly).

### Checkpoint

- `up` and `down` both run without error on a local Postgres when policy allows.
- Column names and types are documented enough for 7.1.2 model work; FK to `users` matches actual primary key type.
- No undocumented ad-hoc DDL outside migration files.

---

---

## Session 7.1.2 (source: session-7.1.2-planning.md)

### Goal

Add **Sequelize model definitions** for the **`sessions`** and **`magic_links`** tables created in 7.1.1, match column types/names/nullability to the migrations, register models in **`initializeModels`** / model bag, and define **`User`** associations where the schema has `user_id` FKs. Out of scope: Express session middleware, passport/strategies, client — Phase **7.2+**.

### Files

- **Migrations (read-only alignment):** `server/src/db/migrations/*sessions*`, `server/src/db/migrations/*magic*link*` (exact filenames on disk from 7.1.1).
- **New models:** e.g. `server/src/db/models/auth/session.ts`, `server/src/db/models/auth/magic_link.ts` (or same folder naming pattern as repo conventions — mirror `participantModels/Users.ts` style).
- **Wiring:** `server/src/db/models/index.ts` (factory + `initializeModels` locals bag), `server/src/db/models/sequelizeModelsBag.ts` if the project exports a typed model map, `server/src/db/models/sequelizeModelAssociations*.ts` for `User` ↔ `Session` / `MagicLink` as applicable.
- **Reference:** `server/src/db/models/participantModels/Users.ts` for FK target and association style.
- **Not in scope:** `server/src/auth/**`, `client/**`, new migrations.

### Approach

1. Read 7.1.1 migration files and list exact table/column names; implement `Session` and `MagicLink` with `Model.init` + shared column helpers if the codebase uses them (`manualCreatedUpdatedAtColumns`, etc.).
2. Register both factories in `initializeModels`, pass instances into `associateSequelizeModels` (or equivalent) and add `belongsTo`/`hasMany` only where DDL supports it.
3. Run **server lint** after edits; run **migrations** only per DB policy (`DB_HOST` localhost). No new routes or session store wiring until 7.2.

### Checkpoint

- App bootstrap loads models without Sequelize errors; model attributes match migrations (including JSON/BLOB and timestamp fields).
- Associations compile and match FKs; no orphan `include` requirements for unrelated domains.
- `npm run lint` (server) clean for touched files.

---

---
