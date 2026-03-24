# Plan: session 8.1.1 — CORS Origin Wiring

## Contract
- **Tier:** session | **ID:** 8.1.1
- **Scope:** Add CORS_ORIGIN env var, wire CORS origin in app.ts, update .env.example, verify origin restriction
- **Governance:** 5 governance highlights — read reports before filling slots

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
Replace the current wide-open CORS config with origin restriction. Add `CORS_ORIGIN` env var, pass `{ origin }` to `cors()`, set `http://localhost:3002` in dev, Render URL in production. Requests from unlisted origins must be rejected.

## Files
- `server/src/app.ts` — where `cors()` is currently called; add `{ origin: corsOrigin }` from env
- `server/src/config/envConfig.ts` — add `CORS_ORIGIN` to env schema and validated config; parse comma-separated origins if multiple
- `server/.env.example` — document `CORS_ORIGIN` with example values for dev and production

## Approach
Add `CORS_ORIGIN` to the env validation (Joi schema in envConfig). Support a single origin or comma-separated list (e.g. `http://localhost:3002,https://app.example.onrender.com`). Pass the resolved origin(s) to `cors({ origin })`. In dev, use `http://localhost:3002` (Vite dev server). In production, use the Render static site URL. Explicit return types, no silent fallbacks.

## Checkpoint
- CORS rejects requests from origins not in the allowlist (verify with `curl -H "Origin: https://evil.com"`)
- Dev: `http://localhost:3002` accepted; Vue app can call API
- Production: Render static site origin accepted; other origins rejected
- `.env.example` documents `CORS_ORIGIN`

## How we build the tierDown to achieve them
- **Task 8.1.1.1:** Add CORS_ORIGIN to envConfig — Joi schema, validated config export
- **Task 8.1.1.2:** Wire CORS origin in app.ts — replace cors() with cors({ origin })
- **Task 8.1.1.3:** Update .env.example and verify — document CORS_ORIGIN, curl test disallowed origin
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/phases/phase-8.1-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
