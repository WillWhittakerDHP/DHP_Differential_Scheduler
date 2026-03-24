# Plan: task 8.1.2.2 — 8.1.2.2

## Contract
- **Tier:** task | **ID:** 8.1.2.2
- **Scope:** 8.1.2.2
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
Verify CORS rejects disallowed origins in dev and production; polish `.env.example` documentation for `CORS_ORIGIN` with clear examples for dev and production.

## Files
- `server/.env.example` — expand CORS_ORIGIN documentation with dev/production examples
- `server/src/app.ts` — reference only (CORS wiring done in 8.1.1)
- `server/src/config/envConfig.ts` — reference only (env schema done in 8.1.1)

## Approach
Run curl tests to confirm disallowed origins receive CORS rejection and allowed origins succeed. Expand `.env.example` CORS_ORIGIN section with commented examples for localhost (dev) and Render URL (production). Document comma-separated format if multiple origins are needed.

## Checkpoint
- `curl -H "Origin: https://evil.com"` to API returns CORS error or no Access-Control-Allow-Origin
- `curl -H "Origin: http://localhost:3002"` (or configured origin) succeeds
- `.env.example` has clear CORS_ORIGIN examples for dev and production
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/sessions/session-8.1.2-guide.md`
- Handoff (full transition context): `.project-manager/features/security-hardening/sessions/task-8.1.2.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
