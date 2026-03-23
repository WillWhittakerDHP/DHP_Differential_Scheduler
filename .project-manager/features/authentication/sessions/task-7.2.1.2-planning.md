# Plan: task 7.2.1.2 — 7.2.1.2

## Contract
- **Tier:** task | **ID:** 7.2.1.2
- **Scope:** 7.2.1.2
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
Task **7.2.1.1** shipped `strategyTypes.ts` and typed 501 responses on `authRouter`. This task adds **validated env-driven auth config** and a small **auth module barrel** so middleware and strategies (7.2.2 / 7.3) read one place — **no** session DB reads/writes here.

## Goal
Centralize auth-related environment settings (active strategy name, session cookie name, max-age) behind `getAuthConfig()`-style helpers validated alongside existing `envConfig`, and wire `authRouter` to surface the configured strategy in placeholder JSON for observability. Session persistence and cookie **setting** on responses stay in Session **7.2.2**.

## Files
- `server/src/config/envConfig.ts` — extend Joi schema + `EnvConfig` with optional auth fields (defaults safe for local dev)
- `server/src/config/authConfig.ts` — `getAuthStrategyName()`, `getAuthSessionCookieSettings()`, `getAuthConfig()` (or equivalent flat API)
- `server/src/auth/index.ts` — barrel: re-export strategy types + auth config getters (or only types if barrel would create cycles — prefer no cycles)
- `server/src/routes/internal/auth/authRouter.ts` — import config; include `strategy` (and optionally cookie **name** only) on 501 JSON; remain 501 for real login
- `server/.env.development` or root env example — document new vars in a short comment block only if repo uses `.env.example`; else document in `authConfig.ts` JSDoc

## Approach
1. Add env keys: e.g. `AUTH_STRATEGY` (`none` | `magic_link` | `password`), `AUTH_SESSION_COOKIE_NAME`, `AUTH_SESSION_MAX_AGE_SEC` with Joi defaults matching `AuthStrategyName` and sensible cookie defaults.
2. Implement `authConfig.ts` that reads **only** from validated `envConfig` (no raw `process.env` in consumers).
3. Update `authRouter` placeholder handlers to attach read-only fields (`strategy`, optional `sessionCookieName`) for debugging; do not set cookies or touch Sequelize.
4. Add minimal `server/src/auth/index.ts` re-exports if it stays cycle-free; otherwise skip barrel and import from `config` + `strategies` explicitly.
5. Run `server` lint; no client changes.

## Design Before Execute
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

## Checkpoint
- New env vars validated at boot; invalid combo fails fast with existing envConfig logging pattern.
- `getAuthConfig()` (or equivalent) is the single read API for auth env for server code.
- `authRouter` still returns **501** for unimplemented auth but exposes configured strategy (and cookie name) for visibility.
- No session table access, no `express-session` wiring, no magic-link send/verify in this task.
- `npm run lint` in `server/` passes.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/sessions/session-7.2.1-guide.md`
- Handoff (full transition context): `.project-manager/features/authentication/sessions/task-7.2.1.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
