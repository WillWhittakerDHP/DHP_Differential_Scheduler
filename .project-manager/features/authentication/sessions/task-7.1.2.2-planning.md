# Plan: task 7.1.2.2 — MagicLink Sequelize model

## Contract
- **Tier:** task | **ID:** 7.1.2.2
- **Scope:** `MagicLink` ORM for `public.magic_links` ( **`Session`** completed in **7.1.2.1** )
- **Governance:** Server model factory pattern; explicit fields; no silent drift from migration

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
**7.1.2.1** added `Session.ts`, `User` ↔ `Session` associations (`authSessions`), and `Session` in `config/models.ts`. This task adds **`MagicLink`** the same way.

## Goal
Add **`MagicLink`** for **`public.magic_links`** per **LAUNCH_CHECKLIST.md §2A.2** and migration `20260322_100001_create_auth_sessions_and_magic_links.mjs`: UUID PK, `user_id` → `users.id`, `token` (unique), `expires_at`, nullable `used_at`, `created_at`. Register in **`initializeModels`**, export from **`server/src/config/models.ts`**, and wire **`User.hasMany` / `MagicLink.belongsTo`** (alias **`authMagicLinks`** on `User` for consistency with **`authSessions`**). No new migrations unless DDL mismatch.

## Files
- `server/src/db/models/auth/MagicLink.ts` — class + `MagicLinkFactory` (`modelName: 'magic_link'`, `tableName: 'magic_links'`, `timestamps: false`)
- `server/src/db/models/index.ts` — import factory, instantiate after `Session` (or after `User`), associations, add to return object
- `server/src/config/models.ts` — export **`MagicLink`**
- **Not this task:** auth routes, client, `Session.ts` edits except wiring neighbors

## Approach
1. Mirror **`Session.ts`** / checklist snippet: same FK pattern to **`users`**, **`usedAt`** nullable with `field: 'used_at'`.
2. **`const MagicLink = MagicLinkFactory(sequelize)`** next to **`Session`** in **`initializeModels`**.
3. **`User.hasMany(MagicLink, { foreignKey: 'user_id', as: 'authMagicLinks' })`**, **`MagicLink.belongsTo(User, { foreignKey: 'user_id', as: 'user' })`**.
4. **`npm run compile`** and **`npm run lint`** in **`server/`**.

## Checkpoint
- Server **`tsc`** and ESLint pass; model init / associations succeed.
- Columns match DB (`used_at` nullable, rest NOT NULL / defaults as in migration).
- **`MagicLink`** exported from `server/src/config/models.ts`.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- Session plan: `.project-manager/features/authentication/sessions/session-7.1.2-planning.md`
- Prior task handoff: `.project-manager/features/authentication/sessions/task-7.1.2.1-handoff.md`
- TierUp guide: `.project-manager/features/authentication/sessions/session-7.1.2-guide.md`
- Checklist: `LAUNCH_CHECKLIST.md` §**2A.2** (`MagicLink` block)
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
