<!-- harness-planning-rollup tier=session id=7.2.3 consolidatedAt=2026-03-24T22:18:02.765Z -->

# Consolidated planning: session 7.2.3

## Session 7.2.3 (parent)

## Goal

Wire **7.2.2** session persistence into Express so protected routes can reuse one boundary:

1. **Real `requireAuth`** — read session id from the HttpOnly cookie, load the DB row, require a **logged-in user** (`Session.userId`), attach **`req.user`** (`id`, `role` from `User.userRole`), respond **401** with typed JSON on failure (no silent pass-through).
2. **Real `requireRole`** — factory middleware that checks **`req.user.role`** against allowed roles and returns **403** when missing (depends on `requireAuth` running first).
3. **Router integration** — keep **`authRouter`** on **`/api/v1/internal/auth`** as the extension surface; add a minimal **authenticated internal route** (e.g. session/me-style) to prove middleware + mount order; **login/magic-link stays 501 / Phase 7.3** unless explicitly scoped.

**Out of scope for this session:** Implementing magic-link or password verification, Pinia/Vue guards, Google OAuth.

## Files

- `server/src/middlewares/security.ts` — replace `requireAuth` / `requireRole` stubs with session-backed implementations.
- `server/src/types/express.d.ts` — extend `Request` only if new fields are needed beyond existing `req.user`.
- `server/src/auth/*` — use `getSessionIdFromRequest`, `getAuthSessionBySid`; optional small helper to map `Session` + `User` → `req.user` (keep middleware thin).
- `server/src/routes/internal/auth/authRouter.ts` — add or adjust routes that demonstrate auth middleware; preserve 501 placeholders for unimplemented strategy flows.
- `server/src/routes/index.ts` (or internal mount) — confirm mount order: `cookieParser` already in `app.ts`; auth routes and any new protected stub routes documented.
- `server/src/config/models.ts` / `User` model — read-only lookup by id for role when attaching `req.user`.

## Approach

1. **Task 7.2.3.1:** Implement async `requireAuth`: cookie → session row → must have `userId` → load `User` → set `req.user = { id, role: userRole }`; use `createLogger` on errors; JSON 401 using `AUTH_FAILURE_CODES.UNAUTHORIZED` (or consistent auth error shape).
2. **Task 7.2.3.2:** Implement `requireRole(...roles)` after `requireAuth`: if `!req.user` or role not in list → 403 + stable message; log unexpected gaps at `warn`/`debug` as appropriate.
3. **Task 7.2.3.3:** Add one documented internal endpoint behind `requireAuth` (and optionally `requireRole`) to validate wiring; update module comments for Phase **7.3** extension points; `npm run compile` + `npm run lint` in `server/` after each task.

## Checkpoint

- Unauthenticated requests to protected stub routes receive **401**; wrong role receives **403**.
- `req.user` matches Express augmentation; no stub `next()` bypass for protected paths using these middlewares.
- Auth router still exposes 501 for strategy-backed login until **7.3**; session cookie + DB session are the source of truth for middleware.
- Server compile and lint clean; governance thresholds respected (extract helpers if middleware grows).

---

## Task 7.2.3.1 (source: task-7.2.3.1-planning.md)

### Goal

Implement **real `requireAuth`**:

1. Read session id from the HttpOnly cookie (`getSessionIdFromRequest`).
2. Load the **`Session`** row (`getAuthSessionBySid`); treat missing/expired as unauthenticated.
3. Require **`session.userId`** — anonymous session rows (no user) → **401**.
4. Load **`User`** by id; missing user → **401**.
5. Set **`req.user = { id, role: user.userRole }`** (matches `Express.Request` augmentation in `express.d.ts`).
6. Respond **401** with **typed JSON** (`code` + `message`, using `AUTH_FAILURE_CODES.UNAUTHORIZED`) for any unauthenticated path. **Do not** echo cookie values or raw `sid`.
7. On **unexpected errors** (e.g. DB throw): **`createLogger` → `logger.error`**, respond **500** with a safe body (no stack to client).

**Out of scope for this task:** `requireRole` (7.2.3.2), new auth routes (7.2.3.3), strategy/magic-link.

### Files

- **`server/src/middlewares/security.ts`** — `requireAuth` becomes async-capable middleware (wrap async work; call `next(err)` or set status + return on failure).
- **`server/src/auth/resolveAuthenticatedUser.ts`** (new) — `resolveAuthenticatedUserForRequest(req): Promise<ResolveAuthResult>` with explicit return type: success payload vs `unauthorized` vs `internal_error` (keeps middleware branch count low).
- **`server/src/auth/index.ts`** — re-export resolver **only if** useful for tests or future tasks; otherwise omit to keep surface minimal.

### Approach

1. Add resolver module: cookie → session → `userId` → `models.User.findByPk`; map `userRole` → `req.user.role` string; single `try/catch` with `logger.error` on unexpected failure returning `internal_error`.
2. Replace `requireAuth` stub: invoke resolver; `unauthorized` → `401` + JSON; `internal_error` → `500` + JSON; success → assign `req.user`, `next()`.
3. Update JSDoc on `requireAuth` to describe session-cookie behavior and dependency on `cookieParser()` (already in `app.ts`).
4. **`requireRole` stays stub** for task **7.2.3.2** (do not implement in this task).
5. Run `cd server && npm run compile && npm run lint`.

### Checkpoint

- No-cookie / bad session / no `userId` / missing user → **401** with stable JSON shape.
- Resolver logs unexpected errors; no session secrets in JSON bodies.
- `requireRole` unchanged (still passes through).
- `server` compile + lint pass.

---

### Design

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

---

## Task 7.2.3.2 (source: task-7.2.3.2-planning.md)

### Goal

Replace the **`requireRole` stub** with a **variadic factory** `requireRole(...allowedRoles: string[])` that returns Express middleware which:

1. Assumes **`requireAuth`** has already run (if **`req.user`** is missing → **403** with stable JSON — misconfigured route chain; optionally **`logger.warn`** once per pattern with a searchable message).
2. Reads **`req.user.role`** (string from **`User.userRole`** in 7.2.3.1).
3. If **`allowedRoles` is empty** → **`logger.warn`** and **403** (misconfiguration).
4. If user’s role is **not** in **`allowedRoles`** (strict string equality) → **403** with typed JSON body.
5. Otherwise **`next()`**.

**403 JSON shape:** `{ code, message }` — add **`FORBIDDEN`** (or equivalent) to **`AUTH_FAILURE_CODES`** in `strategyTypes.ts` for consistency with **401**’s **`UNAUTHORIZED`**.

**Out of scope:** New routes (7.2.3.3), changing **`requireAuth`**, **`checkOwnership`**, CSRF stub.

### Files

- **`server/src/middlewares/security.ts`** — implement **`requireRole`** factory; update JSDoc (document ordering: **`requireAuth` first**).
- **`server/src/auth/strategies/strategyTypes.ts`** — add **`AUTH_FAILURE_CODES.FORBIDDEN`** (and export type updates if needed).
- **`server/docs/SECURITY_STUBS.md`** — update **`requireRole`** section from “stub” to “enacted”.

### Approach

1. Add **`FORBIDDEN`** to **`AUTH_FAILURE_CODES`**.
2. Implement **`requireRole(...allowedRoles: string[])`** returning **`(req, res, next) => void`**:
   - Normalize **`allowedRoles`** (non-empty check).
   - **`!req.user`** → 403 + log.
   - **`!req.user.role`** or not in list → 403.
   - Else **`next()`**.
3. Use **`createLogger('middleware.requireRole')`** for misconfiguration / unexpected gaps (no PII).
4. Run **`cd server && npm run compile && npm run lint`**.

### Checkpoint

- With **`requireAuth` → requireRole('agent')`**: client role → **403**; agent role → **`next()`**.
- JSON responses never include secrets.
- **`requireAuth`** unchanged in this task (still session-backed from 7.2.3.1).
- Server compile + lint pass.

---

### Design

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

---

## Task 7.2.3.3 (source: task-7.2.3.3-planning.md)

### Goal

1. Add **at least one read-only GET** on **`authRouter`** that runs **`requireAuth`** and returns a **small JSON** body derived from **`req.user`** (e.g. `id`, `role`) — **no** session ids, cookies, or tokens in the response.
2. Add a **second GET** (optional but recommended) that chains **`requireAuth`** + **`requireRole(USER_ROLE_AGENT)`** (import from `server/src/constants/userRoles.js`) to demonstrate **403** for wrong role — stable JSON only.
3. Keep **`GET /`**, **`POST /login`** as **501** placeholders (Phase **7.3**).
4. Document in module comment where **Phase 7.3** will register strategy handlers (verify magic link, etc.) without reshaping these middleware routes.

**Out of scope:** Magic-link implementation, changing global mount path, client work.

### Files

- **`server/src/routes/internal/auth/authRouter.ts`** — new routes + imports `requireAuth`, `requireRole`, `USER_ROLE_AGENT`.
- **`server/src/routes/index.ts`** — read-only verification: mount already correct; comment only if something about order must be documented.

### Approach

1. Add **`GET /session/me`** (or **`/me`** if shorter — prefer **`/session/me`** to avoid colliding with future resource names): **`requireAuth`**, handler returns **`200`** + `{ userId: req.user.id, role: req.user.role }` (field names explicit for API clarity).
2. Add **`GET /session/agent-ping`**: **`requireAuth`**, **`requireRole(USER_ROLE_AGENT)`**, **`200`** + `{ ok: true }` (minimal).
3. **GET** routes — **no** `csrfProtection` (read-only; aligns with existing GET patterns on API).
4. Top-of-file **WHY / PATTERN** comment: extension points for **7.3**.
5. **`npm run compile && npm run lint`** in **`server/`**.

### Checkpoint

- Unauthenticated **`curl`** to **`/session/me`** → **401** with typed body.
- Authenticated session with user → **200** and body matches **`req.user`**.
- Client-role user hits **`agent-ping`** → **403** `FORBIDDEN`; agent → **200**.
- **`POST /login`** still **501**; server compile + lint clean.

---

### Design

```
GET /session/me → requireAuth → 200 { userId, role } | 401 from middleware
GET /session/agent-ping → requireAuth → requireRole(AGENT) → 200 { ok: true } | 401 | 403
```

---
