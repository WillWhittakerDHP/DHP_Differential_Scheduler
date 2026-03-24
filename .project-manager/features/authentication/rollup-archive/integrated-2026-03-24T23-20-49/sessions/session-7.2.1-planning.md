<!-- harness-planning-rollup tier=session id=7.2.1 consolidatedAt=2026-03-24T22:18:02.761Z -->

# Consolidated planning: session 7.2.1

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
