# Plan: task 8.6.1.1 — Token issuance and middleware wiring

## Contract
- **Tier:** task | **ID:** 8.6.1.1
- **Scope:** CSRF token issuance + Express middleware order only (validation is Task 8.6.1.2; docs handoff is 8.6.1.3)
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
Session **8.6.1** started; this is the first task. No prior task handoff.

## Goal
Establish **server-side CSRF secret/token issuance** and wire any **middleware** needed so that **Task 8.6.1.2** can implement real checks in `csrfProtection`. Prefer storing a per-session token (e.g. in the existing DB-backed session model used by Feature 7) and exposing a **non-HttpOnly cookie** or a **dedicated GET endpoint** that returns the token for the SPA (final contract documented briefly in code comments for 8.6.2). **Do not** replace the `csrfProtection` stub with full validation in this task unless a minimal pass-through is required to avoid breaking the tree—prefer keeping validation for 8.6.1.2.

## Files
- `server/src/middlewares/security.ts` — helpers for token generation/rotation; may add `issueCsrfToken` or similar; **leave `csrfProtection` as no-op or minimal** if validation is deferred to 8.6.1.2
- `server/src/app.ts` — register issuance middleware after `cookieParser` and before `ROUTE_PATHS.API` (or attach token on session load in auth path—follow existing session patterns)
- Session / auth modules that create or load sessions (e.g. under `server/src/auth/`) — only if token must be bound at session creation
- `server/src/routes/helpers/createCrudRouter.ts` — read-only: note where `csrfProtection` runs for later tasks

## Approach
1. Inspect how sessions are stored and keyed (cookie name, `req.session` or equivalent).
2. Choose **synchronizer token in session** + **readable cookie mirror** *or* **double-submit cookie** pair; align with OWASP CSRF cheat sheet and same-site cookie defaults already in use.
3. On first authenticated request (or session creation), generate a random token, persist with session, set cookie/header contract **named consistently** (e.g. `X-CSRF-Token` header vs cookie name—document in a short comment block in `security.ts`).
4. Use `createLogger` for issuance edge cases (e.g. missing session) at **info** or **warn**, not silent.
5. Run `npm run start:dev` and confirm server boots; optional: log token presence in dev-only debug.

## Checkpoint
- Server starts; no regression on existing routes.
- A CSRF token exists per session (or per session lifecycle) and is reachable by the mechanism chosen for 8.6.2 (cookie and/or endpoint documented in `security.ts` header comment).
- `checkOwnership` untouched; `csrfProtection` still safe no-op **or** contains only shared helpers used by 8.6.1.2 (no full enforcement yet if split strictly).

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/sessions/session-8.6.1-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

## Design Before Execute (pseudocode / notes)
- If session row exists: `csrfSecret = randomBytes(32).toBase64url()` stored on session; set cookie `csrf_token=<public>` matching header name documented for Vue.
- Middleware order: `cookieParser` → `sessionLoader` (existing) → `ensureCsrfTokenAttached` → `routes`.
