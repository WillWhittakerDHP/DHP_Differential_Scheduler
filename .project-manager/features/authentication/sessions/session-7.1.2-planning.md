# Plan: session 7.1.2 — Sequelize models for `sessions` and `magic_links`

## Contract
- **Tier:** session | **ID:** 7.1.2
- **Scope:** Sequelize models, fields, FK alignment, and `User` associations for existing `public.sessions` and `public.magic_links` tables (DDL completed in session **7.1.1**)
- **Governance:** Read governance reports in Reference before coding; server models follow existing factory + `index.ts` patterns

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
Session **7.1.1** shipped the migration `20260322_100001_create_auth_sessions_and_magic_links.mjs` and removed the duplicate baseline. Tables exist; this session adds **ORM** only (no new auth routes or middleware).

## Goal
Add **`Session`** and **`MagicLink`** Sequelize models matching **LAUNCH_CHECKLIST.md §2A.2** and the live migration columns, register them in **`initializeModels`**, export them from **`server/src/config/models.ts`**, and define **`belongsTo` / `hasMany`** with **`User`** so Phase **7.2+** (session manager, strategies) can use typed models. No new migrations unless schema drift is discovered.

## Files
- `server/src/db/models/auth/Session.ts` — `Session` class + `SessionFactory` (snake_case `field` maps, `tableName: 'sessions'`, `timestamps: false` per checklist)
- `server/src/db/models/auth/MagicLink.ts` — `MagicLink` class + `MagicLinkFactory` (`tableName: 'magic_links'`)
- `server/src/db/models/index.ts` — import factories, instantiate after `User`, wire associations, add to return object
- `server/src/config/models.ts` — destructure `Session` and `MagicLink` from `initializeModels` for app-wide imports
- **Out of scope:** `server/src/auth/*`, client, new migrations (unless fixing documented drift)

## Approach
1. Copy structure from **`UserFactory`** / **`LAUNCH_CHECKLIST §2A.2`**: UUID PK, `user_id` FK → `users.id`, column `field` names matching migration (`expires_at`, `last_active_at`, `used_at`, `created_at`).
2. Instantiate **`Session`** and **`MagicLink`** in **`initializeModels`** immediately after **`User`** (FK target must exist first).
3. Associations: **`Session.belongsTo(User, { foreignKey: 'user_id', as: 'user' })`**, **`User.hasMany(Session, { foreignKey: 'user_id', as: 'sessions' })`** (adjust `as` names if they collide with existing `User` API); repeat for **`MagicLink`** / **`magicLinks`**.
4. Run **`npm run compile`** and **`npm run lint`** in **`server/`**; smoke app boot if needed (no new tests per project policy).

## Checkpoint
- `tsc` and server ESLint pass; `initializeModels` runs without Sequelize association errors.
- Model attributes match migration DDL (types, nullability, uniqueness on `token`).
- `Session` and `MagicLink` are importable from `server/src/config/models.js` like other models.

## How we build the tierDown to achieve them
- **Task 7.1.2.1:** Add `Session` model file, register in `index.ts`, `User` ↔ `Session` associations, export via `config/models.ts`
- **Task 7.1.2.2:** Add `MagicLink` model file, register in `index.ts`, `User` ↔ `MagicLink` associations, export via `config/models.ts`, verify compile/lint
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/phases/phase-7.1-guide.md`
- Handoff (full transition context): `.project-manager/features/authentication/sessions/session-7.1.1-handoff.md`
- Checklist models: `LAUNCH_CHECKLIST.md` §**2A.2**
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
