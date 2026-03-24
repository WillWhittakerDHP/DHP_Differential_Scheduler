<!-- harness-planning-rollup tier=session id=7.1.2 consolidatedAt=2026-03-24T22:18:02.759Z -->

# Consolidated planning: session 7.1.2

## Session 7.1.2 (parent)

## Goal

Add **Sequelize model definitions** for the **`sessions`** and **`magic_links`** tables created in 7.1.1, match column types/names/nullability to the migrations, register models in **`initializeModels`** / model bag, and define **`User`** associations where the schema has `user_id` FKs. Out of scope: Express session middleware, passport/strategies, client — Phase **7.2+**.

## Files

- **Migrations (read-only alignment):** `server/src/db/migrations/*sessions*`, `server/src/db/migrations/*magic*link*` (exact filenames on disk from 7.1.1).
- **New models:** e.g. `server/src/db/models/auth/session.ts`, `server/src/db/models/auth/magic_link.ts` (or same folder naming pattern as repo conventions — mirror `participantModels/Users.ts` style).
- **Wiring:** `server/src/db/models/index.ts` (factory + `initializeModels` locals bag), `server/src/db/models/sequelizeModelsBag.ts` if the project exports a typed model map, `server/src/db/models/sequelizeModelAssociations*.ts` for `User` ↔ `Session` / `MagicLink` as applicable.
- **Reference:** `server/src/db/models/participantModels/Users.ts` for FK target and association style.
- **Not in scope:** `server/src/auth/**`, `client/**`, new migrations.

## Approach

1. Read 7.1.1 migration files and list exact table/column names; implement `Session` and `MagicLink` with `Model.init` + shared column helpers if the codebase uses them (`manualCreatedUpdatedAtColumns`, etc.).
2. Register both factories in `initializeModels`, pass instances into `associateSequelizeModels` (or equivalent) and add `belongsTo`/`hasMany` only where DDL supports it.
3. Run **server lint** after edits; run **migrations** only per DB policy (`DB_HOST` localhost). No new routes or session store wiring until 7.2.

## Checkpoint

- App bootstrap loads models without Sequelize errors; model attributes match migrations (including JSON/BLOB and timestamp fields).
- Associations compile and match FKs; no orphan `include` requirements for unrelated domains.
- `npm run lint` (server) clean for touched files.

---

## Task 7.1.2.1 (source: task-7.1.2.1-planning.md)

### Goal

Implement **two Sequelize model modules** — **`Session`** (table `sessions`) and **`MagicLink`** (table `magic_links`) — whose attributes, types, nullability, and `field` mappings match **`20260432_000040_sessions_table_auth.mjs`** and **`20260432_000041_magic_links_table_auth.mjs`**. Export **`SessionFactory`** / **`MagicLinkFactory`** (or equivalent) following **`UserFactory`** in `participantModels/Users.ts`. **Out of scope for this task:** wiring in `server/src/db/models/index.ts`, model bag, association files, Express, client, new migrations.

### Files

- **Read-only:** `server/src/db/migrations/20260432_000040_sessions_table_auth.mjs`, `server/src/db/migrations/20260432_000041_magic_links_table_auth.mjs`
- **New (create):** `server/src/db/models/auth/session.ts`, `server/src/db/models/auth/magic_link.ts` (adjust folder name if repo prefers another convention next to `participantModels/`)
- **Pattern reference:** `server/src/db/models/participantModels/Users.ts`, `server/src/db/models/shared/manualCreatedUpdatedAtColumns.ts`
- **Deferred to 7.1.2.2:** `server/src/db/models/index.ts`, `sequelizeModelsBag.ts`, `sequelizeModelAssociations*.ts`

### Approach

1. **Session:** Map `sid` (PK string), `sess` (JSONB), `expire` (timestamptz), optional `user_id` (UUID FK to `users.id`), `created_at` / `updated_at` — mirror migration names (`underscored` / `field` as in `User`).
2. **MagicLink:** Map `id` (UUID PK), `token_hash`, `email`, `user_id`, `purpose`, `expires_at`, `consumed_at`, `created_at`, `updated_at` with correct Sequelize types and nullability.
3. Use **`timestamps: false`** + explicit columns or shared **`manualCreatedUpdatedAtColumns`** if it matches the DDL; set **`schema: 'public'`** and **`tableName`** explicitly if needed for clarity.
4. Run **`npm run lint`** under `server/` on touched files only.

### Checkpoint

- Both factories call `Model.init` without type errors; attribute list matches migrations (including JSONB and timestamptz fields).
- No registration in `index.ts` required for this task; **7.1.2.2** will load models and add `User` associations.
- Server lint passes for new model files.

### Design

- `Session extends Model<InferAttributes<Session>, InferCreationAttributes<Session>>` with `declare` fields for each column; `SessionFactory(sequelize)` calls `Session.init({ ... }, { sequelize, tableName: 'sessions', ... })`.
- `MagicLink` same pattern with `tableName: 'magic_links'`.
- FK columns use `references: { model: 'users', key: 'id' }` and `onDelete: 'SET NULL'` where migration matches.

---

---

## Task 7.1.2.2 (source: task-7.1.2.2-planning.md)

### Goal

Wire **`SessionFactory`** and **`MagicLinkFactory`** into **`initializeModels`** (`server/src/db/models/index.ts`), add both model classes to **`SequelizeModelsBag`** (`sequelizeModelsBag.ts`), pass them into **`associateSequelizeModels`**, and define associations consistent with nullable **`user_id`** FKs: **`Session.belongsTo(User)`**, **`MagicLink.belongsTo(User)`**, and matching **`User.hasMany`** for optional navigation. **Out of scope:** Express, passport, client, new migrations, changing DDL.

### Files

- **Edit:** `server/src/db/models/index.ts` — import factories, call them after `User`, include `Session` / `MagicLink` in `associateSequelizeModels({ ... })` and in the returned model map.
- **Edit:** `server/src/db/models/sequelizeModelsBag.ts` — add `Session` and `MagicLink` entries to the bag type.
- **Edit:** `server/src/db/models/sequelizeModelAssociations.ts` and/or a focused associations module (follow existing **PartA / PartB** split; e.g. new **`sequelizeModelAssociationsAuth.ts`** invoked from the main `associateSequelizeModels` entry) — keep **PartB**-style `foreignKey` naming consistent with how `User` ↔ other models are declared.
- **Read-only reference:** `server/src/db/models/sequelizeModelAssociationsPartB.ts` (`User.hasMany` / `belongsTo` patterns), `server/src/db/models/auth/session.ts`, `server/src/db/models/auth/magic_link.ts`

### Approach

1. Extend **`SequelizeModelsBag`** with `Session` and `MagicLink` `ModelCtor<Model>` fields.
2. In **`initializeModels`**, instantiate both factories (same pattern as `UserFactory`), then add them to the object passed to **`associateSequelizeModels`** and to the **return** object.
3. In associations: for each auth child model, **`belongsTo(User, { foreignKey: 'userId', as: '...' })`** (or the project’s established key form if attributes use camelCase with `field` mapping), and **`User.hasMany(Session|MagicLink, { foreignKey: 'userId', as: '...' })`**. Use clear `as` aliases (e.g. `sessions`, `magicLinks` on `User`).
4. Run **`npm run lint`** and **`npm run compile`** in `server/`.

### Checkpoint

- App bootstrap / `initializeModels` runs with no Sequelize association errors.
- `User`, `Session`, and `MagicLink` can be related via documented `as` names where `user_id` is set.
- Server lint and TypeScript compile succeed.

### Design

- `associateSequelizeModels` already delegates to PartA/PartB; add **`associateSequelizeAuth(m)`** (or equivalent) that destructures `{ User, Session, MagicLink }` and wires the four association lines, then call it from **`sequelizeModelAssociations.ts`** after PartB (or merge into PartB if you prefer one less file — prefer **small new module** to keep auth isolated).

---

---
