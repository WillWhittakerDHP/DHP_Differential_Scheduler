# Plan: session 8.2.1 — ** General rate limiter for internal API routes

## Contract
- **Tier:** session | **ID:** 8.2.1
- **Scope:** ** General rate limiter for internal API routes
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
No prior handoff for this session.

## Goal
Add general inbound rate limiting (100 req/15 min per IP) to `/api/v1/internal/*` routes. Excess requests receive 429 with Retry-After. Auth-route limiter is Session 8.2.2.

## Files
- `server/package.json` — add `express-rate-limit` dependency
- `server/src/app.ts` — create and mount general limiter before internal routes
- `server/docs/SECURITY_STUBS.md` — document rate limiting behavior

## Approach
Install `express-rate-limit`; create a limiter with `windowMs: 15 * 60 * 1000`, `max: 100`; enable `standardHeaders` and `legacyHeaders` for RateLimit-* and Retry-After. Mount limiter on the path prefix `/api/v1/internal` (or wherever internal routes are mounted). Follow governance: explicit return types, no silent error swallowing.

## Checkpoint
- General limiter active; excess requests return 429 with Retry-After
- Documentation updated in SECURITY_STUBS.md
- Manual curl or script confirms rate limit behavior

## How we build the tierDown to achieve them
- **Task 8.2.1.1:** Add express-rate-limit and create general limiter
- **Task 8.2.1.2:** Verify rate limit behavior
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/phases/phase-8.2-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
