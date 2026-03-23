# Plan: task 7.2.2.1 — 7.2.2.1

## Contract
- **Tier:** task | **ID:** 7.2.2.1
- **Scope:** 7.2.2.1
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
Session **7.2.2** is active on `session-7.2.2`. This task is **DB session lifecycle only** — cookie parsing/Set-Cookie is **7.2.2.2**; façade is **7.2.2.3**.

## Goal
Add a **`sessionManager`** module that creates, loads, and revokes rows in the `sessions` table via Sequelize `models.Session`, using **`AUTH_SESSION_MAX_AGE_SEC`** from `getAuthConfig()` for `expire`. **Lookup returns `null`** if the row is missing or `expire` is in the past (optionally delete expired row on read). **No** Express routes, **no** cookies in this task.

## Files
- `server/src/auth/sessionManager.ts` — new: `createAuthSession`, `getAuthSessionBySid`, `revokeAuthSession` (names can be finalized in code but keep explicit exports)
- `server/src/config/authConfig.ts` — read-only: `getAuthConfig().sessionMaxAgeSec` for TTL
- `server/src/config/models.ts` / `server/src/db/models/index.ts` — reference only; use `models.Session` from `../config/models.js`
- `server/src/db/models/auth/session.ts` — reference: columns `sid`, `sess`, `expire`, `userId`
- `server/src/utils/logger.ts` — `createLogger` for catch paths

## Approach
1. Import `models` from `server/src/config/models.js` (single registry pattern).
2. Generate `sid` with `crypto.randomBytes` → hex string; validate length bound on input for `get`/`revoke` (reject empty / absurd length).
3. `createAuthSession(sess, userId?)`: compute `expire = now + sessionMaxAgeSec * 1000`, `Session.create({ sid, sess, expire, userId })`; on failure log with `logger.error` and return `null` or throw per existing server patterns — prefer **return null** for create so callers can map to 500 later without uncaught rejects in middleware (document in JSDoc).
4. `getAuthSessionBySid`: `findByPk`; if `expire <= new Date()`, `destroy` row (log warn on destroy failure) and return `null`.
5. `revokeAuthSession`: `destroy({ where: { sid } })`; return whether a row was removed.
6. Do **not** add `cookie-parser` or touch `app.ts` here.

## Design Before Execute
```ts
// createAuthSession({ foo: 'bar' }, userId?) -> { sid, expire } | null
// getAuthSessionBySid(sid) -> Session | null  // null if missing or expired
// revokeAuthSession(sid) -> boolean

const ttlMs = getAuthConfig().sessionMaxAgeSec * 1000
const expire = new Date(Date.now() + ttlMs)
```

## Checkpoint
- New module compiles; all exported functions have **explicit return types**.
- Expired sessions are not returned from `getAuthSessionBySid`.
- Errors are **logged** (no empty catch blocks).
- `cd server && npm run lint` passes.
- **No** cookie or auth-router changes in this commit.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/sessions/session-7.2.2-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
