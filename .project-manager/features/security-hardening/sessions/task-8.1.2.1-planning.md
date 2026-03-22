# Plan: task 8.1.2.1 — 8.1.2.1

## Contract
- **Tier:** task | **ID:** 8.1.2.1
- **Scope:** 8.1.2.1
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
Verify CORS rejects requests from disallowed origins. Run curl with a disallowed Origin header and confirm the API returns CORS rejection (no Access-Control-Allow-Origin or CORS error). Run curl with an allowed origin and confirm success.

## Files
- No code changes. API endpoint (server) for curl verification. Assume API runs on configured port (e.g. 3001).

## Approach
1. Ensure server is running with CORS_ORIGIN set (e.g. `http://localhost:3002`).
2. Run `curl -i -H "Origin: https://evil.com" http://localhost:3001/api/v1/...` (or health/status route). Verify response has no `Access-Control-Allow-Origin` header (or CORS error).
3. Run `curl -i -H "Origin: http://localhost:3002" http://localhost:3001/...`. Verify response includes `Access-Control-Allow-Origin: http://localhost:3002` (or configured origin).

## Checkpoint
- Disallowed origin (`https://evil.com`) receives no Access-Control-Allow-Origin in response.
- Allowed origin (`http://localhost:3002`) receives Access-Control-Allow-Origin in response.
- Document verification steps in session log or as a manual checklist.

## How we build the tierDown to achieve them
- **Task 8.1.2.1:** Verify CORS rejection (curl test)
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/sessions/session-8.1.2-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
