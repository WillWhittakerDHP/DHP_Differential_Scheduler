# Plan: task 8.6.1.2 — `csrfProtection` validation

## Contract
- **Tier:** task | **ID:** 8.6.1.2
- **Scope:** Implement real `csrfProtection` only (issuance done in 8.6.1.1 via `csrfIssuance.ts`)
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
Task **8.6.1.1** shipped `ensureCsrfTokenAttached`, `Session.sess.csrfToken`, and readable cookie **`csrf_token`**; constants **`CSRF_HEADER_NAME`** (`X-CSRF-Token`) and **`CSRF_SESS_KEY`** are in `csrfIssuance.ts`.

## Goal
Replace the `csrfProtection` stub in `security.ts` with middleware that, on **unsafe** methods only, requires a CSRF token matching the server session. Use **`CSRF_HEADER_NAME`** from `csrfIssuance.ts` (import the constant — single source of truth). Compare submitted value to `Session.sess[CSRF_SESS_KEY]` after loading the session via **`getSessionIdFromRequest`** + **`getAuthSessionBySid`**. Return **403** with a small JSON body (and stable `code` if the project uses one for auth errors); **`createLogger`** on reject paths. **Do not** change `checkOwnership` or issuance middleware.

## Files
- `server/src/middlewares/security.ts` — `csrfProtection` implementation (may extract a small named helper in the same file or `csrfIssuance.ts` if it keeps `security.ts` thin)
- `server/docs/SECURITY_STUBS.md` — mark validation active; align curl examples with real header + session requirement

## Approach
1. **Safe methods:** `GET`, `HEAD`, `OPTIONS` → `next()` immediately.
2. **No session cookie or no session row:** For routes that already use `csrfProtection`, treat as **403** (cannot validate) or document if any route must allow anonymous POST (unlikely for CRUD factory paths behind auth) — default **403** with log.
3. **Missing `csrfToken` in sess:** **403** (client must hit a GET first so issuance runs).
4. **Header:** read case-insensitively (`req.headers` / `req.get`) for `X-CSRF-Token`; optional: also accept `x-csrf-token`.
5. **Compare:** timing-safe string compare if available (`crypto.timingSafeEqual` on buffers of equal length); reject length mismatch before compare.
6. Keep handler **sync-looking** from Express’s perspective: use `void (async () => { ... })().catch(next)` pattern like `requireAuth`, or sync-only if only sync APIs — async is required for DB load.

## Checkpoint
- Unsafe method without session or without header → **403** + logger
- Unsafe method with valid session + matching `X-CSRF-Token` → `next()`
- `server/docs/SECURITY_STUBS.md` updated: validation active; login placeholder curl updated if it still says `stub` token
- `npm run lint` (server) passes

## Design Before Execute
- Pseudocode: `if (safeMethod) next(); sid = getSessionIdFromRequest(req); if (!sid) { log; return 403 }; row = await getAuthSessionBySid(sid); tokenSess = row?.sess?.csrfToken; headerVal = req.get(CSRF_HEADER_NAME); if (!tokenSess || !headerVal || !timingSafeEqual) { log; return 403 }; next();`

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/sessions/session-8.6.1-guide.md`
- Handoff (full transition context): `.project-manager/features/security-hardening/sessions/task-8.6.1.1-handoff.md`
- Issuance constants: `server/src/middlewares/csrfIssuance.ts`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
