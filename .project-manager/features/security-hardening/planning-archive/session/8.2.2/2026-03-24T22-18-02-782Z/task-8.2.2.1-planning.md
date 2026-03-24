# Plan: task 8.2.2.1 — 8.2.2.1

## Contract
- **Tier:** task | **ID:** 8.2.2.1
- **Scope:** 8.2.2.1
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
No prior handoff for this task.

## Goal
Create authRateLimiter (10 req/15 min per IP), a placeholder AuthRouter, and mount under `/api/v1/internal/auth/*`. Excess requests receive 429. Structure ready for Feature 7 login routes.

## Files
- `server/src/middlewares/rateLimit.ts` — add `authRateLimiter` (10 req/15 min); re-export
- `server/src/routes/internal/auth/authRouter.ts` — new: placeholder router (GET `/` returns stub)
- `server/src/routes/index.ts` — mount auth path with auth limiter before general internal routes

## Approach
1. In `rateLimit.ts`: add `authRateLimiter` with `max: 10`, same `windowMs` (15 min), `standardHeaders`, `legacyHeaders`, and message as `generalRateLimiter`.
2. Create `server/src/routes/internal/auth/authRouter.ts`: Router with GET `/` returning 501 or `{ message: 'Auth routes coming in Feature 7' }`.
3. In `routes/index.ts`: add `v1Router.use("/internal/auth", authRateLimiter, AuthRouter)` — order matters: auth path must be registered before the catch-all `/internal` so `/internal/auth/*` gets the stricter limit. Current structure: `v1Router.use("/internal", generalRateLimiter, InternalRouter)` — we need `/internal/auth` mounted first with its own limiter.
4. Export AuthRouter from internal auth; import in routes/index.ts.

## Checkpoint
- Auth limiter active on `/api/v1/internal/auth/*`; 11th request returns 429
- Placeholder GET `/api/v1/internal/auth` or `/api/v1/internal/auth/` returns stub response

## How we build the tierDown to achieve them
- **Task 8.2.2.1:** Auth limiter config and mount (no sub-tasks; implement directly)
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/sessions/session-8.2.2-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
