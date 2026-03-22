# Plan: task 7.1.2.1 — 7.1.2.1

## Contract
- **Tier:** task | **ID:** 7.1.2.1
- **Scope:** 7.1.2.1
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
Session **7.1.2** is active on branch **`session-7.1.2`**; DDL for `sessions` / `magic_links` exists from **7.1.1**. This task delivers the **`Session`** ORM slice only (**`MagicLink`** is **7.1.2.2**).

## Goal
Add the **`Session`** Sequelize model for **`public.sessions`** per **LAUNCH_CHECKLIST.md §2A.2** (and the applied migration `20260322_100001_create_auth_sessions_and_magic_links.mjs`): UUID PK, `user_id`, `token`, `expires_at`, `last_active_at`, `created_at`. Register **`SessionFactory`** in **`initializeModels`**, export **`Session`** from **`server/src/config/models.ts`**, and wire **`User.hasMany` / `Session.belongsTo`** on `user_id`. No **`MagicLink`** in this task; no new migrations unless DDL drift is found.

## Files
- `server/src/db/models/auth/Session.ts` — `Session` class + `SessionFactory` (`tableName: 'sessions'`, `timestamps: false`, snake_case `field` maps)
- `server/src/db/models/index.ts` — import/instantiate after `User`, associations, add **`Session`** to return object
- `server/src/config/models.ts` — destructure **`Session`** alongside existing models
- **Not this task:** `MagicLink.ts`, auth routes, client

## Approach
1. Mirror **`UserFactory`** / checklist §2A.2 `Session` snippet: `DataTypes.UUID` id, `userId` → `user_id` with `references: { model: 'users', key: 'id' }`, `onUpdate`/`onDelete` **CASCADE**, unique `token`, `expiresAt` / `lastActiveAt` / `createdAt` field mappings.
2. In **`initializeModels`**, call **`SessionFactory(sequelize)`** immediately after **`User`** exists.
3. **`Session.belongsTo(User, { foreignKey: 'user_id', as: 'user' })`** and **`User.hasMany(Session, { foreignKey: 'user_id', as: 'authSessions' })`** — use alias **`authSessions`** if **`sessions`** collides with Express session typing or existing names (adjust once if lint/tsc complains).
4. **`npm run compile`** and **`npm run lint`** in **`server/`**.

## Checkpoint
- Server **`tsc`** and ESLint pass; app/model init runs without Sequelize errors.
- **`Session`** columns match migration (including NOT NULL / defaults).
- `Session` is exported from `server/src/config/models.ts` like other models.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- Session plan (tierDown): `.project-manager/features/authentication/sessions/session-7.1.2-planning.md`
- TierUp guide (scope and intent): `.project-manager/features/authentication/sessions/session-7.1.2-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
