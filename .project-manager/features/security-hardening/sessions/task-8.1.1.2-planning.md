# Plan: task 8.1.1.2 — Wire CORS origin in app.ts

## Contract
- **Tier:** task | **ID:** 8.1.1.2
- **Scope:** Replace cors() with cors({ origin }) using getCorsOrigin from envConfig
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
Task 8.1.1.1 completed — envConfig exports getCorsOrigin() and CORS_ORIGIN. Ready to wire it in app.ts.

## Goal
Replace the wide-open `cors()` call with `cors({ origin: getCorsOrigin() })` so requests from unlisted origins are rejected.

## Files
- `server/src/app.ts` — import getCorsOrigin from envConfig; replace app.use(cors()) with app.use(cors({ origin: getCorsOrigin() }))

## Approach
1. Import `getCorsOrigin` from `./config/envConfig.js`.
2. Replace `app.use(cors())` with `app.use(cors({ origin: getCorsOrigin() }))`.
3. No other changes. The getCorsOrigin() helper (from Task 8.1.1.1) returns string or string[] for cors() consumption.

## Checkpoint
- CORS middleware uses origin restriction
- Server starts successfully
- Requests from unlisted origins (e.g. curl -H "Origin: https://evil.com") return CORS error or are rejected
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/sessions/session-8.1.1-guide.md`
- Handoff (full transition context): `.project-manager/features/security-hardening/sessions/task-8.1.1.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
