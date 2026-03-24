# Plan: session 8.2.2 — Auth-route limiter and verification

## Contract
- **Tier:** session | **ID:** 8.2.2
- **Scope:** Auth-route limiter and verification
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
Completed Task - Begin Session 8.2.2

## Goal
Add a stricter auth-route limiter (10 req/15 min per IP) for `/api/v1/internal/auth/*`. Wire to a placeholder path until Feature 7 (Authentication) adds login routes. Excess requests receive 429. General limiter (100 req/15 min) already done in Session 8.2.1.

## Files
- `server/src/middlewares/rateLimit.ts` — add `authRateLimiter` (10 req/15 min); re-export
- `server/src/routes/index.ts` — mount auth sub-router under `/internal/auth` with auth limiter
- `server/src/routes/internal/auth/` — placeholder auth router (e.g. GET returning stub) until Feature 7
- `server/docs/SECURITY_STUBS.md` — document auth-route limiter and verification steps

## Approach
Create `authRateLimiter` in `rateLimit.ts` with `max: 10`, same `windowMs` and headers as general limiter. Add `AuthRouter` under `routes/internal/auth/` with a placeholder route (e.g. GET `/` returning 501 or stub message). In `routes/index.ts`, add `v1Router.use("/internal/auth", authRateLimiter, AuthRouter)` before the general internal router so auth gets the stricter limit. Update SECURITY_STUBS.md with auth-route section and curl verification. Follow governance: explicit return types, no silent error swallowing.

## Checkpoint
- Auth limiter (10 req/15 min) active on `/api/v1/internal/auth/*`
- Placeholder auth path returns stub; structure ready for Feature 7 login routes
- `curl` confirms auth route returns 429 after 10 requests; SECURITY_STUBS.md updated

## How we build the tierDown to achieve them
- **Task 8.2.2.1:** Auth limiter config and mount — add authRateLimiter, create placeholder AuthRouter, mount under /internal/auth
- **Task 8.2.2.2:** Verify and document — curl confirms 429 after 10; update SECURITY_STUBS.md
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/phases/phase-8.2-guide.md`
- Handoff (full transition context): `.project-manager/features/security-hardening/sessions/session-8.2.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
