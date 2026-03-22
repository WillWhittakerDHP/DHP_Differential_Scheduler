# Plan: task 7.1.3.1 — Audit Session/MagicLink vs §2A.2–2A.3 and fix drift

## Contract
- **Tier:** task | **ID:** 7.1.3.1
- **Scope:** Static audit + minimal code fixes so **`Session`** / **`MagicLink`** match **LAUNCH_CHECKLIST** §**2A.2–2A.3** and migration DDL. **Task 7.1.3.2** covers migrate/compile/boot smoke.
- **Governance:** Server models only; no new auth routes or client work.

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
Session **7.1.3** is open; **7.1.1–7.1.2** already added tables and models. This task proves wiring matches the checklist and fixes any mismatch (fields, FK `references`, `index.ts` return, `config/models` exports, `User` associations).

## Goal
Complete a **checklist-driven audit** of **`Session`** and **`MagicLink`**: every column and constraint in **`20260322_100001_create_auth_sessions_and_magic_links.mjs`** has a matching Sequelize attribute; **`SessionFactory` / `MagicLinkFactory`** are invoked in **`initializeModels`**; both models appear in the **`initializeModels` return** and in **`server/src/config/models.ts`**; **`User` ↔ auth** associations (`authSessions`, `authMagicLinks`) exist and use `user_id`. Apply **only** the patches required to close gaps—no feature work.

## Files
- `server/src/db/migrations/20260322_100001_create_auth_sessions_and_magic_links.mjs` — source of truth for columns/nullability
- `server/src/db/models/auth/Session.ts`, `MagicLink.ts` — align attributes if audit finds drift
- `server/src/db/models/index.ts` — factories, associations, return payload
- `server/src/config/models.ts` — named exports
- **Not this task:** full **`npm run migrate`** smoke as the primary deliverable (defer to **7.1.3.2**); optional one-line comment in model files only if it clarifies checklist mapping

## Approach
1. Build a **column checklist** from the migration for `sessions` and `magic_links`.
2. Compare to **`Session.init` / `MagicLink.init`** (types, `field`, `allowNull`, `unique`, defaults).
3. Verify §**2A.3**: both factories called after **`User`**, both in return object; **`config/models.ts`** destructures **`Session`** and **`MagicLink`**.
4. Verify associations: **`User.hasMany`** + **`belongsTo(User)`** for each model with consistent `foreignKey` / `as`.
5. If drift found, patch model(s) or index; run **`npm run compile`** and **`npm run lint`** in **`server/`** to validate. If no drift, **no code churn** beyond confirmation.

## Checkpoint
- Written audit result: **pass** or **fixed** with a short note of what changed.
- **`npm run compile`** and **`npm run lint`** pass after any edits.
- No open mismatch between DDL and ORM for auth tables.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- Session plan: `.project-manager/features/authentication/sessions/session-7.1.3-planning.md`
- TierUp guide: `.project-manager/features/authentication/sessions/session-7.1.3-guide.md`
- Checklist: `LAUNCH_CHECKLIST.md` §**2A.2**, §**2A.3**
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
