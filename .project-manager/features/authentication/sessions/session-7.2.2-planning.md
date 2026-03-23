# Plan: session 7.2.2 — Session Manager and Cookie Lifecycle

## Contract
- **Tier:** session | **ID:** 7.2.2
- **Scope:** Session Manager and Cookie Lifecycle
- **Governance:** 3 governance highlights — read reports before filling slots

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** cross_cutting
- **Governance domains:** docs
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
Session **7.2.1** shipped strategy types, `authConfig`, and typed 501 auth responses. Phase **7.2** next slice is persistent sessions + httpOnly cookies so Phase **7.3** magic-link can establish identity without reimplementing DB or cookie logic.

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

## How we build the tierDown to achieve them
- **Task 7.2.2.1:** DB-backed session manager (create, get, revoke, expiry)
- **Task 7.2.2.2:** HttpOnly session cookie read/write helpers
- **Task 7.2.2.3:** Flat façade composing manager + cookies for strategies
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/phases/phase-7.2-guide.md`
- Handoff (full transition context): `.project-manager/features/authentication/sessions/session-7.2.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
