# Plan: task 7.2.3.1 — Session-backed requireAuth middleware

## Contract
- **Tier:** task | **ID:** 7.2.3.1
- **Scope:** Replace `requireAuth` stub with cookie + DB session + `User` resolution
- **Governance:** Thin middleware; extract resolver if branch/length thresholds are approached

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function
- **Recommended context pack:** local_implementation_pack

## Where we left off
Session **7.2.2** shipped `getSessionIdFromRequest`, `getAuthSessionBySid`, façade. `requireAuth` / `requireRole` in `security.ts` are still no-op stubs.

## Goal
Implement **real `requireAuth`**:

1. Read session id from the HttpOnly cookie (`getSessionIdFromRequest`).
2. Load the **`Session`** row (`getAuthSessionBySid`); treat missing/expired as unauthenticated.
3. Require **`session.userId`** — anonymous session rows (no user) → **401**.
4. Load **`User`** by id; missing user → **401**.
5. Set **`req.user = { id, role: user.userRole }`** (matches `Express.Request` augmentation in `express.d.ts`).
6. Respond **401** with **typed JSON** (`code` + `message`, using `AUTH_FAILURE_CODES.UNAUTHORIZED`) for any unauthenticated path. **Do not** echo cookie values or raw `sid`.
7. On **unexpected errors** (e.g. DB throw): **`createLogger` → `logger.error`**, respond **500** with a safe body (no stack to client).

**Out of scope for this task:** `requireRole` (7.2.3.2), new auth routes (7.2.3.3), strategy/magic-link.

## Files
- **`server/src/middlewares/security.ts`** — `requireAuth` becomes async-capable middleware (wrap async work; call `next(err)` or set status + return on failure).
- **`server/src/auth/resolveAuthenticatedUser.ts`** (new) — `resolveAuthenticatedUserForRequest(req): Promise<ResolveAuthResult>` with explicit return type: success payload vs `unauthorized` vs `internal_error` (keeps middleware branch count low).
- **`server/src/auth/index.ts`** — re-export resolver **only if** useful for tests or future tasks; otherwise omit to keep surface minimal.

## Approach
1. Add resolver module: cookie → session → `userId` → `models.User.findByPk`; map `userRole` → `req.user.role` string; single `try/catch` with `logger.error` on unexpected failure returning `internal_error`.
2. Replace `requireAuth` stub: invoke resolver; `unauthorized` → `401` + JSON; `internal_error` → `500` + JSON; success → assign `req.user`, `next()`.
3. Update JSDoc on `requireAuth` to describe session-cookie behavior and dependency on `cookieParser()` (already in `app.ts`).
4. **`requireRole` stays stub** for task **7.2.3.2** (do not implement in this task).
5. Run `cd server && npm run compile && npm run lint`.

## Design before execute (pseudocode)

```
resolveAuthenticatedUserForRequest(req):
  try:
    sid = getSessionIdFromRequest(req)
    if !sid → unauthorized
    session = await getAuthSessionBySid(sid)
    if !session → unauthorized
    if !session.userId → unauthorized
    user = await models.User.findByPk(session.userId)
    if !user → unauthorized
    return ok({ id: user.id, role: user.userRole })
  catch (e):
    logger.error(...)
    return internal_error

requireAuth(req, res, next):
  void (async () => {
    const r = await resolveAuthenticatedUserForRequest(req)
    if r === unauthorized → res.status(401).json({ code: UNAUTHORIZED, message: '...' }); return
    if r === internal_error → res.status(500).json({ ... }); return
    req.user = r.user
    next()
  })().catch(err => next(err))
```

## Checkpoint
- No-cookie / bad session / no `userId` / missing user → **401** with stable JSON shape.
- Resolver logs unexpected errors; no session secrets in JSON bodies.
- `requireRole` unchanged (still passes through).
- `server` compile + lint pass.

---
## Reference
- Session guide: `.project-manager/features/authentication/sessions/session-7.2.3-guide.md`
- `server/src/auth/sessionCookie.ts`, `sessionManager.ts`
- `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`
