# Plan: task 7.2.2.3 — Session + cookie façade

## Contract
- **Tier:** task | **ID:** 7.2.2.3
- **Scope:** Composed HTTP session operations for Phase 7.3 strategies (no strategy logic here)
- **Governance:** Clean — thin functions, explicit return types, logger on unexpected paths

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate

## Where we left off
- **7.2.2.1** `sessionManager`: `createAuthSession`, `getAuthSessionBySid`, `revokeAuthSession`.
- **7.2.2.2** `sessionCookie`: `getSessionIdFromRequest`, `setSessionCookie`, `clearSessionCookie`; `cookie-parser` mounted in `app.ts`.

## Goal
Add a **small façade module** that composes **only** `sessionManager` + `sessionCookie` so Phase **7.3** auth strategies can:
1. **Create** a DB session **and** send the HttpOnly session cookie in one call.
2. **Revoke** the server session (when a cookie is present) **and** clear the cookie in one call.

**Out of scope:** Magic-link, `requireAuth`, new public routes, strategy branching, JWT.

## Files
- **`server/src/auth/sessionFacade.ts`** (new) — exported composed operations; module-level comment documents the single import path for strategies.
- **`server/src/auth/index.ts`** — re-export façade functions (keep barrel cycle-free).
- **Reference only:** `sessionManager.ts`, `sessionCookie.ts`, `authConfig.ts`.

## Approach
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

## Design before execute (pseudocode)

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

## Checkpoint
- One documented import path in `sessionFacade.ts` header for “how strategies establish / end a browser session.”
- Façade imports only session manager + cookie helpers (+ types/logger if needed).
- `npm run compile` and `npm run lint` pass under `server/`.
- No new auth routes; Phase 7.3 wires strategies to these calls.

---
## Reference
- Session guide: `.project-manager/features/authentication/sessions/session-7.2.2-guide.md`
- Handoff: `.project-manager/features/authentication/sessions/task-7.2.2.2-handoff.md`
- Playbooks: `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`
