<!-- harness-planning-rollup tier=feature id=authentication consolidatedAt=2026-03-24T22:18:02.776Z -->

# Consolidated planning: feature authentication

## Feature authentication (parent)

## Goal

Ship **authentication** for the scheduler app in phased slices: persist identity and session data (Phase 7.1), add server-side auth infrastructure and strategy seams (Phase 7.2), implement **magic-link** login for beta/dev (Phase 7.3), wire **Vue client** flows (guards, session awareness, UX) (Phase 7.4), and leave **password-based** production auth explicitly deferred (Phase 7.5) until strategy and security review land.

Fold two inherited design threads into planning (not blockers here): **pre-alpha user-type switching** for E2E (how testers impersonate or select roles / auth levels) and **Google OAuth** scope (in v1 strategy vs deferred). Document choices in phase guides or checkpoints as they land.

## Files

- **Planning / control:** `.project-manager/features/authentication/feature-authentication-guide.md`, phase guides under `.project-manager/features/authentication/phases/` (created per `/phase-start`), feature log and handoff in the same feature folder.
- **Server:** `server/src/**` — models/migrations aligned with Phase 7.1; auth config, session handling, middleware, and route protection in Phase 7.2–7.3; strategy implementations (magic link first).
- **Client (Vue):** `client/src/**` — login/callback UI, composables or stores for session, route guards, and admin vs booking surfaces per Phase 7.4.
- **Quality:** `client/.audit-reports/` and project playbooks (type, composable, function, component) at tier boundaries per workflow.

## Approach

1. **Follow the guide’s phase order:** `7.1` → `7.2` → `7.3` → `7.4`; treat `7.5` as deferred until magic-link + client paths are stable and product agrees on password/OAuth scope.
2. **Each phase:** `/phase-start` → implement per phase guide → `/phase-end`; merge/cascade per harness; no skipping governance at tier boundaries.
3. **Open questions:** In **Phases 7.2–7.4**, decide or stub **tester user-type switching** (minimal dev-only affordance vs full matrix) and record **Google OAuth** as out-of-scope for initial beta unless explicitly pulled into a phase.
4. **Branching:** Target branch `feature/authentication` from `develop` when execute mode runs after `/accepted-proceed`; keep work off unrelated feature branches.

## Checkpoint

- **After 7.1:** Data model and migrations support users/sessions (or agreed equivalents); no blocking schema gaps for magic link.
- **After 7.3:** Magic-link flow demonstrable in development (send link, consume token, establish session) with logging and failure paths visible.
- **After 7.4:** Client reflects auth state; protected routes behave; tester role switching approach is either implemented or explicitly documented as follow-up.
- **Before 7.5:** Written decision on password + OAuth timeline; Phase 7.5 only starts after that scope is approved.

---

## Phase 7.1 (source: phase-7.1-planning.md)

### Goal

**Phase 7.1 (this tier):** Add PostgreSQL persistence for auth-related data — migrations for **`sessions`** and **`magic_links`** (names as agreed in implementation), plus **Sequelize models** registered with the app — so Phase 7.2 can implement session manager, middleware, and strategies without schema gaps.

**Feature context (inheritance):** Later phases add server infrastructure (7.2), magic-link strategy (7.3), Vue client (7.4), and defer password production auth (7.5). Track **pre-alpha user-type switching** and **Google OAuth** as open questions in guides; they do not block 7.1 schema/models.

### Files

- **Planning / control:** `phase-7.1-planning.md` (this doc), `phase-7.1-guide.md`, `feature-authentication-guide.md`, feature log/handoff under `.project-manager/features/authentication/`.
- **Server (7.1):** `server/migrations/**` (new migration files), `server/src/db/models/**` (new or extended models + associations), `server/src/db/models/index.ts` wiring; reference existing `Users` model for FKs.
- **Deferred out of 7.1:** `server/src/auth/**`, middleware replacement, client auth UI — Phases 7.2–7.4.
- **Quality:** Governance playbooks under `.project-manager/`; session/task tier audits when coding tasks run.

### Approach

1. **Session 7.1.1:** Design and land migrations — `sessions` (server-side session store: e.g. `sid`, `user_id` FK to `users`, `expires_at`, `data` or JSON blob per chosen pattern), `magic_links` (token hash, email or user reference, expiry, consumed flag). Add indexes for lookup and expiry cleanup; follow existing Sequelize migration style in the repo.
2. **Session 7.1.2:** Implement Sequelize models, `init`/associations, export through model index; no Express middleware or routes required for 7.1 — behavior lives in 7.2+.
3. **Migration policy:** Author migrations in-repo; run `npm run migrate` (or project equivalent) only when local DB policy allows (`DB_HOST` localhost).
4. **After phase:** `/phase-end 7.1` when all sessions complete; then `/phase-start 7.2` per feature order in PROJECT_PLAN.

### Checkpoint

- **After 7.1.1:** Migrations applied (or ready to apply on host DB); tables match agreed columns and indexes; no ad-hoc DDL left undocumented.
- **After 7.1.2:** Models load in app bootstrap; associations to `User` (if applicable) defined; TypeScript types and Sequelize definitions consistent with migrations.

---

---

## Phase 7.3 (source: phase-7.3-planning.md)

### Goal

Implement **magic-link authentication** on the server: a `magicLinkStrategy` (or equivalent) that fits the existing strategy contract, persistence using the `magic_links` model, a **request-link** path (email in production-shaped hook; **console or structured log in dev**), and a **verify** path that validates the token, creates a server session via the session manager, and sets the **httpOnly session cookie**. Leave password and OAuth out of this phase.

### Files

- **New / extended server:** `server/src/auth/strategies/` (magic link strategy), `server/src/routes/internal/auth/authRouter.ts` (request + verify handlers), optional `server/src/services/` or `server/src/auth/` helper for outbound email vs dev logging.
- **Existing seams:** `server/src/auth/strategies/strategyTypes.ts`, `server/src/auth/sessionManager.ts`, `server/src/auth/sessionCookie.ts`, `server/src/db/models/auth/magic_link.ts`.
- **Planning:** this file, `phase-7.3-guide.md`, and post-phase `phase-7.3-handoff.md` when 7.3 ends.

### Approach

1. Implement magic-link token lifecycle (create, store, expiry, single-use or rotation policy) against the existing DB model; keep branching shallow and log failures with the project logger.
2. Expose HTTP endpoints consistent with Phase 7.2 router patterns; wire verify flow to **session create + cookie set** so `requireAuth` succeeds on the next request.
3. Abstract **email delivery** behind a small interface or env-gated implementation so dev never requires SMTP.
4. Defer **client** login forms and deep guard alignment to **7.3** only as needed for manual smoke (e.g. hitting verify URL); full Vue work stays in **7.4**.

### Checkpoint

- Requesting a magic link for a known user identity produces a persisted token and a visible delivery signal (email or dev log).
- Visiting the verify URL (or POST, per design) with a valid token yields a session and cookie; invalid/expired tokens return clear errors and logs.
- No new migrations unless the team discovers a gap versus `magic_links` / sessions schema from 7.1.

---

---

---

## Integrated session planning

### Session 7.2.1

<!-- harness-planning-rollup tier=session id=7.2.1 consolidatedAt=2026-03-24T22:18:02.761Z -->

# Consolidated planning: session 7.2.1

### Session 7.2.2

<!-- harness-planning-rollup tier=session id=7.2.2 consolidatedAt=2026-03-24T22:18:02.763Z -->

# Consolidated planning: session 7.2.2

### Session 7.2.3

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

## Session 7.2.1 (parent)

## Goal

Define the first stable server-side authentication seam for Feature 7: a strategy contract and auth configuration foundation that later magic-link and password strategies can plug into without changing router or middleware boundaries.

- Turn the session goal into two implementation-ready tasks with explicit acceptance criteria.
- Lock the initial auth server file layout so later phases extend the same structure instead of scattering auth logic through routes.
- Keep this session infrastructure-focused: strategy contracts, config helpers, and router/module seams now; session persistence internals belong to Session 7.2.2.

## Files

- `server/src/routes/internal/auth/authRouter.ts` — current placeholder auth router to evolve into the new module boundary
- `server/src/routes/index.ts` — confirm auth router wiring stays aligned with the new auth module structure
- `server/src/config/authConfig.ts` — central auth config for strategy selection, cookie rules, and auth environment decisions
- `server/src/auth/strategies/strategyTypes.ts` — shared strategy contract and auth result types
- `server/src/auth/index.ts` or equivalent auth module barrel if needed to keep router wiring clean
- `.project-manager/features/authentication/sessions/session-7.2.1-guide.md` — canonical task breakdown for this session

## Approach

1. Start simple: define the shared auth vocabulary first, including strategy interface, auth payload/result types, and clear responsibilities for request-vs-verify flows.
2. Add a dedicated auth config layer that centralizes environment-driven strategy choice and cookie/session settings, so later middleware and strategies read one source of truth.
3. Refactor placeholder router structure only enough to consume the new contracts cleanly. Do not build magic-link behavior yet; create extension seams for Phase 7.3.
4. Keep session-manager persistence and cookie lifecycle implementation out of this session unless a minimal type reference is required. That complexity lands in Session 7.2.2.
5. After task planning is approved, implement in task order and validate that new auth infrastructure follows existing server patterns rather than introducing ad-hoc auth wiring.

## Checkpoint

- The codebase has a named auth contract that future strategies can implement without changing route signatures.
- Auth config decisions are centralized and documented, including what is intentionally deferred to the next session.
- The auth router no longer represents a dead-end placeholder architecture; it clearly points to the new server auth module layout.
- Task boundaries are specific enough that `/task-start 7.2.1.1` can begin implementation without another planning pass.

---

## Task 7.2.1.1 (source: task-7.2.1.1-planning.md)

### Goal

Introduce shared **auth strategy contracts** and **typed auth results** on the server so Phase 7.3 (magic link) can implement a strategy without changing Express route shapes or inventing ad-hoc types per endpoint. Align the existing placeholder `authRouter` with those types and keep responses **501 / not implemented** for real auth flows until strategies exist.

### Files

- `server/src/auth/strategies/strategyTypes.ts` — strategy interface, request/result types, strategy name union
- `server/src/routes/internal/auth/authRouter.ts` — keep placeholder routes; use shared types for structured error/placeholder responses
- `server/src/routes/index.ts` — only if import path cleanup is required
- Optional: `server/src/auth/index.ts` — re-export `strategyTypes` only if it reduces router coupling

### Approach

1. Add `strategyTypes.ts` with an explicit `AuthStrategy` contract and discriminated result types (`ok: true` vs `ok: false` with stable error codes for future HTTP mapping).
2. Define minimal **context** types for strategy inputs so strategies do not depend on the whole app.
3. Update `authRouter` to return typed JSON bodies where helpful while still returning **501** for unimplemented login until 7.3.
4. Do **not** add `authConfig.ts` or session persistence in this task — that is **7.2.1.2**.
5. Run `server` lint after edits; no client changes in this task.

### Checkpoint

- `strategyTypes.ts` exists with explicit exported types and strategy interface; no `any` at public boundaries.
- `authRouter.ts` compiles against those types; placeholder routes remain **501** for real auth.
- No new `authConfig` or DB session code in this commit.
- `npm run lint` in `server/` passes for touched files.
---

### Design

```ts
// Pseudocode — strategy seam
type AuthStrategyName = 'magic_link' | 'password' | 'none'

interface AuthStrategy {
  readonly name: AuthStrategyName
  requestLogin?(input: { email: string }): Promise<AuthOpResult>
  verifyToken?(input: { token: string }): Promise<AuthOpResult>
}

type AuthOpResult =
  | { ok: true; userId?: string; sessionId?: string }
  | { ok: false; code: 'NOT_IMPLEMENTED' | 'VALIDATION' | 'UNAUTHORIZED'; message: string }

// Router: import types; handlers return 501 with { code, message } until strategy wired in 7.2.1.2/7.3
```

---

## Task 7.2.1.2 (source: task-7.2.1.2-planning.md)

### Goal

Centralize auth-related environment settings (active strategy name, session cookie name, max-age) behind `getAuthConfig()`-style helpers validated alongside existing `envConfig`, and wire `authRouter` to surface the configured strategy in placeholder JSON for observability. Session persistence and cookie **setting** on responses stay in Session **7.2.2**.

### Files

- `server/src/config/envConfig.ts` — extend Joi schema + `EnvConfig` with optional auth fields (defaults safe for local dev)
- `server/src/config/authConfig.ts` — `getAuthStrategyName()`, `getAuthSessionCookieSettings()`, `getAuthConfig()` (or equivalent flat API)
- `server/src/auth/index.ts` — barrel: re-export strategy types + auth config getters (or only types if barrel would create cycles — prefer no cycles)
- `server/src/routes/internal/auth/authRouter.ts` — import config; include `strategy` (and optionally cookie **name** only) on 501 JSON; remain 501 for real login
- `server/.env.development` or root env example — document new vars in a short comment block only if repo uses `.env.example`; else document in `authConfig.ts` JSDoc

### Approach

1. Add env keys: e.g. `AUTH_STRATEGY` (`none` | `magic_link` | `password`), `AUTH_SESSION_COOKIE_NAME`, `AUTH_SESSION_MAX_AGE_SEC` with Joi defaults matching `AuthStrategyName` and sensible cookie defaults.
2. Implement `authConfig.ts` that reads **only** from validated `envConfig` (no raw `process.env` in consumers).
3. Update `authRouter` placeholder handlers to attach read-only fields (`strategy`, optional `sessionCookieName`) for debugging; do not set cookies or touch Sequelize.
4. Add minimal `server/src/auth/index.ts` re-exports if it stays cycle-free; otherwise skip barrel and import from `config` + `strategies` explicitly.
5. Run `server` lint; no client changes.

### Checkpoint

- New env vars validated at boot; invalid combo fails fast with existing envConfig logging pattern.
- `getAuthConfig()` (or equivalent) is the single read API for auth env for server code.
- `authRouter` still returns **501** for unimplemented auth but exposes configured strategy (and cookie name) for visibility.
- No session table access, no `express-session` wiring, no magic-link send/verify in this task.
- `npm run lint` in `server/` passes.
---

### Design

```ts
// envConfig additions (conceptual)
AUTH_STRATEGY: 'none' | 'magic_link' | 'password'  // default 'none'
AUTH_SESSION_COOKIE_NAME: string  // default 'dhp_sid' or similar
AUTH_SESSION_MAX_AGE_SEC: number   // default 604800 (7d)

// authConfig
export function getAuthConfig(): {
  strategy: AuthStrategyName
  sessionCookieName: string
  sessionMaxAgeSec: number
}

// authRouter 501 body (extends placeholder)
{ code: 'NOT_IMPLEMENTED', message: '...', strategy: 'none', sessionCookieName: '...' }
// Session 7.2.2 will use sessionCookieName + maxAge when setting Set-Cookie
```

---

