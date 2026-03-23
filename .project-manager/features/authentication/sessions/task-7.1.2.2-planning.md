# Plan: task 7.1.2.2 — Register auth models and wire `User` associations

## Contract
- **Tier:** task | **ID:** 7.1.2.2
- **Scope:** Register `Session` and `MagicLink` in `initializeModels`, extend `SequelizeModelsBag`, add `User` ↔ auth associations; do not change model attribute definitions in `auth/session.ts` or `auth/magic_link.ts` unless a wiring bug requires it.
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
Task **7.1.2.1** added `server/src/db/models/auth/session.ts` and `server/src/db/models/auth/magic_link.ts` with factories only — not loaded by the app yet.

## Goal
Wire **`SessionFactory`** and **`MagicLinkFactory`** into **`initializeModels`** (`server/src/db/models/index.ts`), add both model classes to **`SequelizeModelsBag`** (`sequelizeModelsBag.ts`), pass them into **`associateSequelizeModels`**, and define associations consistent with nullable **`user_id`** FKs: **`Session.belongsTo(User)`**, **`MagicLink.belongsTo(User)`**, and matching **`User.hasMany`** for optional navigation. **Out of scope:** Express, passport, client, new migrations, changing DDL.

## Files
- **Edit:** `server/src/db/models/index.ts` — import factories, call them after `User`, include `Session` / `MagicLink` in `associateSequelizeModels({ ... })` and in the returned model map.
- **Edit:** `server/src/db/models/sequelizeModelsBag.ts` — add `Session` and `MagicLink` entries to the bag type.
- **Edit:** `server/src/db/models/sequelizeModelAssociations.ts` and/or a focused associations module (follow existing **PartA / PartB** split; e.g. new **`sequelizeModelAssociationsAuth.ts`** invoked from the main `associateSequelizeModels` entry) — keep **PartB**-style `foreignKey` naming consistent with how `User` ↔ other models are declared.
- **Read-only reference:** `server/src/db/models/sequelizeModelAssociationsPartB.ts` (`User.hasMany` / `belongsTo` patterns), `server/src/db/models/auth/session.ts`, `server/src/db/models/auth/magic_link.ts`

## Approach
1. Extend **`SequelizeModelsBag`** with `Session` and `MagicLink` `ModelCtor<Model>` fields.
2. In **`initializeModels`**, instantiate both factories (same pattern as `UserFactory`), then add them to the object passed to **`associateSequelizeModels`** and to the **return** object.
3. In associations: for each auth child model, **`belongsTo(User, { foreignKey: 'userId', as: '...' })`** (or the project’s established key form if attributes use camelCase with `field` mapping), and **`User.hasMany(Session|MagicLink, { foreignKey: 'userId', as: '...' })`**. Use clear `as` aliases (e.g. `sessions`, `magicLinks` on `User`).
4. Run **`npm run lint`** and **`npm run compile`** in `server/`.

## Checkpoint
- App bootstrap / `initializeModels` runs with no Sequelize association errors.
- `User`, `Session`, and `MagicLink` can be related via documented `as` names where `user_id` is set.
- Server lint and TypeScript compile succeed.

## Design Before Execute
- `associateSequelizeModels` already delegates to PartA/PartB; add **`associateSequelizeAuth(m)`** (or equivalent) that destructures `{ User, Session, MagicLink }` and wires the four association lines, then call it from **`sequelizeModelAssociations.ts`** after PartB (or merge into PartB if you prefer one less file — prefer **small new module** to keep auth isolated).

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/sessions/session-7.1.2-guide.md`
- Prior task handoff: `.project-manager/features/authentication/sessions/task-7.1.2.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
