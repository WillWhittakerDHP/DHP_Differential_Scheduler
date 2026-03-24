# Plan: task 7.2.2.2 — 7.2.2.2

## Contract
- **Tier:** task | **ID:** 7.2.2.2
- **Scope:** 7.2.2.2
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
Task **7.2.2.1** added `sessionManager` (DB create/get/revoke). This task adds **HTTP cookie helpers** only — **no** façade (7.2.2.3), **no** new auth routes or middleware (7.2.3).

## Goal
Mount **`cookie-parser`** once on the Express app and implement **`sessionCookie.ts`** helpers to **read**, **set**, and **clear** the auth session cookie using `getAuthConfig()` (`sessionCookieName`, `sessionMaxAgeSec`) plus **`httpOnly: true`**, **`sameSite: 'lax'`** (default), and **`secure: true`** when `NODE_ENV === production`. Session id must **never** be written to JSON response bodies by these helpers.

## Files
- `server/package.json` — add runtime dependency `cookie-parser`; add `@types/cookie-parser` under `devDependencies` if types are not bundled
- `server/src/app.ts` — `import cookieParser from 'cookie-parser'`; `app.use(cookieParser())` after body parsers (or immediately after CORS — document order in a one-line WHY comment)
- `server/src/auth/sessionCookie.ts` — new: `getSessionIdFromRequest(req)`, `setSessionCookie(res, sid)`, `clearSessionCookie(res)` with explicit return types
- `server/src/config/authConfig.ts` — read-only consumer for cookie name + max-age
- `server/src/constants/appConstants.ts` — use existing `NODE_ENV` constants for `secure` flag (avoid ad-hoc string compares scattered in new code)
- `server/src/auth/index.ts` — re-export cookie helpers if barrel stays cycle-free

## Approach
1. Install `cookie-parser`; wire middleware in `app.ts` so `req.cookies` is populated for all routes.
2. Implement `getSessionIdFromRequest(req)`: read `req.cookies[getAuthConfig().sessionCookieName]`; return `null` if missing; validate length with same upper bound as `sessionManager` (255) and reject malformed values without logging secrets (log only a stable message).
3. Implement `setSessionCookie(res, sid)`: `res.cookie(name, sid, { maxAge: sessionMaxAgeSec * 1000, httpOnly: true, secure, sameSite: 'lax', path: '/' })`.
4. Implement `clearSessionCookie(res)`: `res.clearCookie` with **matching** `path` / `sameSite` / `secure` so browsers actually drop the cookie.
5. Do **not** call `sessionManager` from this file yet (façade is 7.2.2.3).

## Design Before Execute
```ts
// secure = envConfig.NODE_ENV === NODE_ENV.PRODUCTION (or equivalent from app constants)
// maxAgeMs = getAuthConfig().sessionMaxAgeSec * 1000

getSessionIdFromRequest(req: Request): string | null
setSessionCookie(res: Response, sid: string): void
clearSessionCookie(res: Response): void
```

## Checkpoint
- `req.cookies` works on a route that only reads the cookie (smoke via existing dev route optional — **not required** if lint/typecheck pass).
- Cookie attributes match plan; `clearSessionCookie` uses options consistent with `setSessionCookie`.
- No session id echoed in any new JSON helpers.
- `cd server && npm run lint` passes.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/sessions/session-7.2.2-guide.md`
- Handoff (full transition context): `.project-manager/features/authentication/sessions/task-7.2.2.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
