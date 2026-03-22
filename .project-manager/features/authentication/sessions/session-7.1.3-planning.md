# Plan: session 7.1.3 — Auth models: registration audit and boot/migrate verification

## Contract
- **Tier:** session | **ID:** 7.1.3
- **Scope:** Close Phase **7.1** by auditing **`Session`** / **`MagicLink`** wiring (§**2A.2–2A.3**), fixing any gaps, and proving **migrate + compile + model init** on a representative dev path. **No new auth features** (no `auth/` router, strategies, or client work).
- **Governance:** Server-only; follow existing model/index patterns; read Reference governance links before tasks.

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
**7.1.1** — DDL for `sessions` / `magic_links`. **7.1.2** — `Session` + `MagicLink` models, `index.ts`, `config/models.ts`, `User` associations (`authSessions`, `authMagicLinks`). **7.1.3** verifies and hardens that stack so **7.2** can assume stable ORM + tables.

## Goal
Confirm **LAUNCH_CHECKLIST** intent for **2A.2–2A.3** is satisfied in code (models registered, exported, associations defined), eliminate drift vs migration DDL, and verify **`npm run migrate`** + **`npm run compile`** (and that **`initializeModels`** runs cleanly on app boot). Produce no new tables unless a real mismatch is found.

## Files
- `server/src/db/models/index.ts` — audit return object + association block for `Session` / `MagicLink`
- `server/src/config/models.ts` — audit named exports
- `server/src/db/models/auth/Session.ts`, `MagicLink.ts` — only if audit finds DDL/ORM mismatch
- `server/src/db/migrations/20260322_100001_create_auth_sessions_and_magic_links.mjs` — only if corrective migration required (unlikely)
- `server/src/test/setup/testDb.ts` — only if test DB init must reference new models explicitly (usually unnecessary because it calls `initializeModels`)
- Optional: `LAUNCH_CHECKLIST.md` checkbox updates when **2A.2–2A.3** are verified (coordinate with user if checklist edits are desired)

## Approach
1. **Checklist mapping:** Walk §**2A.2** (fields, `tableName`, FKs) and §**2A.3** (factories in `index.ts`) against the repo; note any missing export or wrong `references` target.
2. **Runtime path:** Trace `initializeModels(sequelize)` from `server/src/config/database.ts` / `config/models.ts` / app entry — ensure no duplicate init or circular import issues.
3. **Migrate smoke:** From `server/`, `npm run migrate` against local DB (per env); confirm no pending failures related to auth tables.
4. **Compile + lint:** `npm run compile` and `npm run lint` on server after any fix.
5. **Stop line:** Do not implement session manager, strategies, or routes (**7.2+**).

## Checkpoint
- Audit documented (inline in task handoff or short log); no unresolved DDL vs model mismatches.
- Migrate + compile succeed on a normal dev machine; model associations do not throw at init.
- Phase **7.1** can be marked complete in phase docs after **session-end 7.1.3**.

## How we build the tierDown to achieve them
- **Task 7.1.3.1:** Audit §2A.2–2A.3 wiring (`index.ts`, `config/models.ts`, model files); fix any export/association/field drift vs migration
- **Task 7.1.3.2:** Migrate + compile + boot-path smoke; finalize session/phase closure notes (no new features)
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide: `.project-manager/features/authentication/phases/phase-7.1-guide.md`
- Prior handoff: `.project-manager/features/authentication/sessions/session-7.1.2-handoff.md`
- Checklist: `LAUNCH_CHECKLIST.md` §**2A.2**, §**2A.3**
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
