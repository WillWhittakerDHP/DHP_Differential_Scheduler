# Plan: task 7.2.3.2 — requireRole middleware factory

## Contract
- **Tier:** task | **ID:** 7.2.3.2
- **Scope:** Real `requireRole` — **403** when `req.user.role` is not in the allowed set
- **Governance:** Thin factory + small helper if branch count grows; explicit return types on exports

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function

## Where we left off
**7.2.3.1** implemented session-backed **`requireAuth`** (sets **`req.user`**). **`requireRole`** must run **after** `requireAuth` on the same route.

## Goal
Replace the **`requireRole` stub** with a **variadic factory** `requireRole(...allowedRoles: string[])` that returns Express middleware which:

1. Assumes **`requireAuth`** has already run (if **`req.user`** is missing → **403** with stable JSON — misconfigured route chain; optionally **`logger.warn`** once per pattern with a searchable message).
2. Reads **`req.user.role`** (string from **`User.userRole`** in 7.2.3.1).
3. If **`allowedRoles` is empty** → **`logger.warn`** and **403** (misconfiguration).
4. If user’s role is **not** in **`allowedRoles`** (strict string equality) → **403** with typed JSON body.
5. Otherwise **`next()`**.

**403 JSON shape:** `{ code, message }` — add **`FORBIDDEN`** (or equivalent) to **`AUTH_FAILURE_CODES`** in `strategyTypes.ts` for consistency with **401**’s **`UNAUTHORIZED`**.

**Out of scope:** New routes (7.2.3.3), changing **`requireAuth`**, **`checkOwnership`**, CSRF stub.

## Files
- **`server/src/middlewares/security.ts`** — implement **`requireRole`** factory; update JSDoc (document ordering: **`requireAuth` first**).
- **`server/src/auth/strategies/strategyTypes.ts`** — add **`AUTH_FAILURE_CODES.FORBIDDEN`** (and export type updates if needed).
- **`server/docs/SECURITY_STUBS.md`** — update **`requireRole`** section from “stub” to “enacted”.

## Approach
1. Add **`FORBIDDEN`** to **`AUTH_FAILURE_CODES`**.
2. Implement **`requireRole(...allowedRoles: string[])`** returning **`(req, res, next) => void`**:
   - Normalize **`allowedRoles`** (non-empty check).
   - **`!req.user`** → 403 + log.
   - **`!req.user.role`** or not in list → 403.
   - Else **`next()`**.
3. Use **`createLogger('middleware.requireRole')`** for misconfiguration / unexpected gaps (no PII).
4. Run **`cd server && npm run compile && npm run lint`**.

## Design before execute (pseudocode)

```
requireRole(...allowedRoles):
  if allowedRoles.length === 0:
    logger.warn('requireRole called with no roles')
    return middleware that always 403
  return (req, res, next):
    if !req.user → 403 FORBIDDEN
    role = req.user.role
    if !role or !allowedRoles.includes(role) → 403 FORBIDDEN
    next()
```

## Checkpoint
- With **`requireAuth` → requireRole('agent')`**: client role → **403**; agent role → **`next()`**.
- JSON responses never include secrets.
- **`requireAuth`** unchanged in this task (still session-backed from 7.2.3.1).
- Server compile + lint pass.

---
## Reference
- Session guide: `.project-manager/features/authentication/sessions/session-7.2.3-guide.md`
- Task 7.2.3.1 handoff: `.project-manager/features/authentication/sessions/task-7.2.3.1-handoff.md`
- `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`
