# Plan: task 7.1.2.1 — Sequelize models for `sessions` and `magic_links` (definitions only)

## Contract
- **Tier:** task | **ID:** 7.1.2.1
- **Scope:** Add `Session` and `MagicLink` Sequelize models with `Model.init` matching 7.1.1 migrations; no `index.ts` registration or associations (task **7.1.2.2**).
- **Governance:** Clean — no violations detected

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
No prior handoff for this task.

## Goal
Implement **two Sequelize model modules** — **`Session`** (table `sessions`) and **`MagicLink`** (table `magic_links`) — whose attributes, types, nullability, and `field` mappings match **`20260432_000040_sessions_table_auth.mjs`** and **`20260432_000041_magic_links_table_auth.mjs`**. Export **`SessionFactory`** / **`MagicLinkFactory`** (or equivalent) following **`UserFactory`** in `participantModels/Users.ts`. **Out of scope for this task:** wiring in `server/src/db/models/index.ts`, model bag, association files, Express, client, new migrations.

## Files
- **Read-only:** `server/src/db/migrations/20260432_000040_sessions_table_auth.mjs`, `server/src/db/migrations/20260432_000041_magic_links_table_auth.mjs`
- **New (create):** `server/src/db/models/auth/session.ts`, `server/src/db/models/auth/magic_link.ts` (adjust folder name if repo prefers another convention next to `participantModels/`)
- **Pattern reference:** `server/src/db/models/participantModels/Users.ts`, `server/src/db/models/shared/manualCreatedUpdatedAtColumns.ts`
- **Deferred to 7.1.2.2:** `server/src/db/models/index.ts`, `sequelizeModelsBag.ts`, `sequelizeModelAssociations*.ts`

## Approach
1. **Session:** Map `sid` (PK string), `sess` (JSONB), `expire` (timestamptz), optional `user_id` (UUID FK to `users.id`), `created_at` / `updated_at` — mirror migration names (`underscored` / `field` as in `User`).
2. **MagicLink:** Map `id` (UUID PK), `token_hash`, `email`, `user_id`, `purpose`, `expires_at`, `consumed_at`, `created_at`, `updated_at` with correct Sequelize types and nullability.
3. Use **`timestamps: false`** + explicit columns or shared **`manualCreatedUpdatedAtColumns`** if it matches the DDL; set **`schema: 'public'`** and **`tableName`** explicitly if needed for clarity.
4. Run **`npm run lint`** under `server/` on touched files only.

## Checkpoint
- Both factories call `Model.init` without type errors; attribute list matches migrations (including JSONB and timestamptz fields).
- No registration in `index.ts` required for this task; **7.1.2.2** will load models and add `User` associations.
- Server lint passes for new model files.

## Design Before Execute
- `Session extends Model<InferAttributes<Session>, InferCreationAttributes<Session>>` with `declare` fields for each column; `SessionFactory(sequelize)` calls `Session.init({ ... }, { sequelize, tableName: 'sessions', ... })`.
- `MagicLink` same pattern with `tableName: 'magic_links'`.
- FK columns use `references: { model: 'users', key: 'id' }` and `onDelete: 'SET NULL'` where migration matches.

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/sessions/session-7.1.2-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
