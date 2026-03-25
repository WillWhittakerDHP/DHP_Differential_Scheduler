# Plan: phase 8.2 — 8.2

## Contract
- **Tier:** phase | **ID:** 8.2
- **Scope:** 8.2
- **Governance:** 2 governance highlights — read reports before filling slots

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** architectural
- **Governance domains:** docs
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** light
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
No prior handoff for this phase.

## Goal
Add inbound HTTP rate limiting to protect the API from abuse: general limiter on `/api/v1/internal/*` (100 req/15 min), stricter limiter for auth routes when they exist (10 req/15 min). Excess requests receive 429. Auth-route limiter can be wired to a placeholder path until Feature 7 (Authentication) adds actual login routes.

## Files
- `server/package.json` — add `express-rate-limit` dependency
- `server/src/app.ts` — mount rate limiters before route handlers
- `server/src/routes/index.ts` — route tree; identify internal vs auth route mounts
- `server/src/middlewares/` — new rate limiter middleware (or inline in app.ts)
- `server/docs/SECURITY_STUBS.md` — document rate limiting behavior

## Approach
Install `express-rate-limit`, create a general limiter (100 req/15 min per IP) and a stricter auth limiter (10 req/15 min). Apply general limiter to all `/api/v1/internal/*` routes. Wire auth limiter to `/api/v1/internal/auth/*` or a placeholder path; when Feature 7 adds login routes, they inherit it. Use `windowMs` and `max` options. Return 429 with `Retry-After` when limit exceeded. Follow governance: explicit return types, no silent error swallowing.

## Checkpoint
- General limiter active on internal API; excess requests return 429
- Auth-route limiter wired (placeholder or real); structure ready for Feature 7
- `curl` or manual test confirms rate limit behavior

## How we build the tierDown to achieve them
- **Session 8.2.1:** General rate limiter for internal API routes
- **Session 8.2.2:** Auth-route limiter and verification
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/feature-security-hardening-guide.md`
- Handoff (full transition context): `.project-manager/features/security-hardening/phases/phase-8.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
