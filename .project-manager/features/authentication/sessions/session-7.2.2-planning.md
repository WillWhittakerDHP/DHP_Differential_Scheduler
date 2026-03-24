<!-- harness-planning-rollup tier=session id=7.2.2 consolidatedAt=2026-03-24T22:18:02.763Z -->

# Consolidated planning: session 7.2.2

## Session 7.2.2 (parent)

## Goal

Implement the **server session manager** (create / lookup / revoke / respect `expire`) against the existing `sessions` table and Sequelize `Session` model, add **cookie helpers** aligned with `getAuthConfig()` (name, max-age, secure/httpOnly/sameSite), and expose a **small flat façade** future strategies can call. **No** magic-link send/verify, **no** `requireAuth` middleware — those are **7.2.3** / **7.3**.

## Files

- `server/src/db/models/auth/session.ts` — reference only; align field usage (`sid`, `sess`, `expire`, `userId`)
- `server/src/auth/sessionManager.ts` (or `server/src/auth/session/sessionManager.ts`) — DB-backed session lifecycle
- `server/src/auth/sessionCookie.ts` (or co-located helpers) — parse/set/clear session cookie on Express req/res
- `server/src/config/authConfig.ts` — already owns cookie name/max-age; consumers use `getAuthConfig()`
- `server/src/app.ts` — only if `cookie-parser` (or equivalent) must be registered once globally
- `server/package.json` — only if a tiny dependency is required (prefer built-in/crypto already in use)
- `.project-manager/features/authentication/sessions/session-7.2.2-guide.md` — task checklist

## Approach

1. **Task 7.2.2.1:** Implement `sessionManager` with explicit functions: create session row (crypto-random `sid`, JSON `sess` payload, `expire` from max-age), get by `sid` with expiry check, revoke/delete, optional cleanup helper; use project logger on failure paths; no silent catches.
2. **Task 7.2.2.2:** Add cookie helpers: read session id from `Cookie` header / `req.cookies` (after parser middleware if needed), `setSessionCookie` / `clearSessionCookie` using `getAuthConfig()` + `NODE_ENV`-aware `secure` and sensible `sameSite`.
3. **Task 7.2.2.3:** Add a thin exported façade (e.g. `issueSessionCookie`, `endSessionCookie`) that composes manager + cookie helpers so strategies in 7.3 call one module; keep functions small and typed.
4. Defer route wiring and auth middleware to **Session 7.2.3** unless a minimal dev-only ping is explicitly agreed.
5. After each task: `/task-end` and cascade; run `server` lint on touched files.

## Checkpoint

- Sessions persist in DB with correct `expire`; revoked or expired sessions do not authenticate (lookup returns null or equivalent).
- Cookies use configured name and max-age; production uses `secure: true` when appropriate.
- No new auth routes that bypass the phased plan; façade is documented for Phase 7.3 consumers.
- `npm run lint` passes under `server/`.

---

## Task 7.2.2.1 (source: task-7.2.2.1-planning.md)

### Goal

Add a **`sessionManager`** module that creates, loads, and revokes rows in the `sessions` table via Sequelize `models.Session`, using **`AUTH_SESSION_MAX_AGE_SEC`** from `getAuthConfig()` for `expire`. **Lookup returns `null`** if the row is missing or `expire` is in the past (optionally delete expired row on read). **No** Express routes, **no** cookies in this task.

### Files

- `server/src/auth/sessionManager.ts` — new: `createAuthSession`, `getAuthSessionBySid`, `revokeAuthSession` (names can be finalized in code but keep explicit exports)
- `server/src/config/authConfig.ts` — read-only: `getAuthConfig().sessionMaxAgeSec` for TTL
- `server/src/config/models.ts` / `server/src/db/models/index.ts` — reference only; use `models.Session` from `../config/models.js`
- `server/src/db/models/auth/session.ts` — reference: columns `sid`, `sess`, `expire`, `userId`
- `server/src/utils/logger.ts` — `createLogger` for catch paths

### Approach

1. Import `models` from `server/src/config/models.js` (single registry pattern).
2. Generate `sid` with `crypto.randomBytes` → hex string; validate length bound on input for `get`/`revoke` (reject empty / absurd length).
3. `createAuthSession(sess, userId?)`: compute `expire = now + sessionMaxAgeSec * 1000`, `Session.create({ sid, sess, expire, userId })`; on failure log with `logger.error` and return `null` or throw per existing server patterns — prefer **return null** for create so callers can map to 500 later without uncaught rejects in middleware (document in JSDoc).
4. `getAuthSessionBySid`: `findByPk`; if `expire <= new Date()`, `destroy` row (log warn on destroy failure) and return `null`.
5. `revokeAuthSession`: `destroy({ where: { sid } })`; return whether a row was removed.
6. Do **not** add `cookie-parser` or touch `app.ts` here.

### Checkpoint

- New module compiles; all exported functions have **explicit return types**.
- Expired sessions are not returned from `getAuthSessionBySid`.
- Errors are **logged** (no empty catch blocks).
- `cd server && npm run lint` passes.
- **No** cookie or auth-router changes in this commit.
---

### Design

```ts
// createAuthSession({ foo: 'bar' }, userId?) -> { sid, expire } | null
// getAuthSessionBySid(sid) -> Session | null  // null if missing or expired
// revokeAuthSession(sid) -> boolean

const ttlMs = getAuthConfig().sessionMaxAgeSec * 1000
const expire = new Date(Date.now() + ttlMs)
```

---

## Task 7.2.2.2 (source: task-7.2.2.2-planning.md)

### Goal

Mount **`cookie-parser`** once on the Express app and implement **`sessionCookie.ts`** helpers to **read**, **set**, and **clear** the auth session cookie using `getAuthConfig()` (`sessionCookieName`, `sessionMaxAgeSec`) plus **`httpOnly: true`**, **`sameSite: 'lax'`** (default), and **`secure: true`** when `NODE_ENV === production`. Session id must **never** be written to JSON response bodies by these helpers.

### Files

- `server/package.json` — add runtime dependency `cookie-parser`; add `@types/cookie-parser` under `devDependencies` if types are not bundled
- `server/src/app.ts` — `import cookieParser from 'cookie-parser'`; `app.use(cookieParser())` after body parsers (or immediately after CORS — document order in a one-line WHY comment)
- `server/src/auth/sessionCookie.ts` — new: `getSessionIdFromRequest(req)`, `setSessionCookie(res, sid)`, `clearSessionCookie(res)` with explicit return types
- `server/src/config/authConfig.ts` — read-only consumer for cookie name + max-age
- `server/src/constants/appConstants.ts` — use existing `NODE_ENV` constants for `secure` flag (avoid ad-hoc string compares scattered in new code)
- `server/src/auth/index.ts` — re-export cookie helpers if barrel stays cycle-free

### Approach

1. Install `cookie-parser`; wire middleware in `app.ts` so `req.cookies` is populated for all routes.
2. Implement `getSessionIdFromRequest(req)`: read `req.cookies[getAuthConfig().sessionCookieName]`; return `null` if missing; validate length with same upper bound as `sessionManager` (255) and reject malformed values without logging secrets (log only a stable message).
3. Implement `setSessionCookie(res, sid)`: `res.cookie(name, sid, { maxAge: sessionMaxAgeSec * 1000, httpOnly: true, secure, sameSite: 'lax', path: '/' })`.
4. Implement `clearSessionCookie(res)`: `res.clearCookie` with **matching** `path` / `sameSite` / `secure` so browsers actually drop the cookie.
5. Do **not** call `sessionManager` from this file yet (façade is 7.2.2.3).

### Checkpoint

- `req.cookies` works on a route that only reads the cookie (smoke via existing dev route optional — **not required** if lint/typecheck pass).
- Cookie attributes match plan; `clearSessionCookie` uses options consistent with `setSessionCookie`.
- No session id echoed in any new JSON helpers.
- `cd server && npm run lint` passes.
---

### Design

```ts
// secure = envConfig.NODE_ENV === NODE_ENV.PRODUCTION (or equivalent from app constants)
// maxAgeMs = getAuthConfig().sessionMaxAgeSec * 1000

getSessionIdFromRequest(req: Request): string | null
setSessionCookie(res: Response, sid: string): void
clearSessionCookie(res: Response): void
```

---

## Task 7.2.2.3 (source: task-7.2.2.3-planning.md)

### Goal

Add a **small façade module** that composes **only** `sessionManager` + `sessionCookie` so Phase **7.3** auth strategies can:
1. **Create** a DB session **and** send the HttpOnly session cookie in one call.
2. **Revoke** the server session (when a cookie is present) **and** clear the cookie in one call.

**Out of scope:** Magic-link, `requireAuth`, new public routes, strategy branching, JWT.

### Files

- **`server/src/auth/sessionFacade.ts`** (new) — exported composed operations; module-level comment documents the single import path for strategies.
- **`server/src/auth/index.ts`** — re-export façade functions (keep barrel cycle-free).
- **Reference only:** `sessionManager.ts`, `sessionCookie.ts`, `authConfig.ts`.

### Approach

1. **`issueAuthSessionWithCookie(res, sess, userId?)`**
   - `await createAuthSession(sess, userId)`; on `null` return `null` (no cookie set).
   - On success: `setSessionCookie(res, sid)`; return `CreatedAuthSession`.
   - Return type: `Promise<CreatedAuthSession | null>`.

2. **`clearAuthSessionWithCookie(req, res)`**
   - `sid = getSessionIdFromRequest(req)`.
   - If `sid`: `await revokeAuthSession(sid)` (ignore boolean; errors already logged in manager).
   - **Always** `clearSessionCookie(res)` so the browser drops the cookie even if DB revoke failed or sid was missing.
   - Return type: `Promise<void>`.

3. **Naming / boundaries:** No new dependencies; no imports from `routes` or strategies; use `createLogger` only if a façade-specific edge needs visibility (prefer delegating logs to existing modules).

4. After implementation: `cd server && npm run compile && npm run lint`.

### Checkpoint

- One documented import path in `sessionFacade.ts` header for “how strategies establish / end a browser session.”
- Façade imports only session manager + cookie helpers (+ types/logger if needed).
- `npm run compile` and `npm run lint` pass under `server/`.
- No new auth routes; Phase 7.3 wires strategies to these calls.

---

### Design

```
issueAuthSessionWithCookie(res, sess, userId?):
  created = await createAuthSession(sess, userId)
  if (!created) return null
  setSessionCookie(res, created.sid)
  return created

clearAuthSessionWithCookie(req, res):
  sid = getSessionIdFromRequest(req)
  if (sid) await revokeAuthSession(sid)
  clearSessionCookie(res)
```

---
