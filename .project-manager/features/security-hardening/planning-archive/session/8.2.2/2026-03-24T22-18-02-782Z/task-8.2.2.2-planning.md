# Plan: task 8.2.2.2 — 8.2.2.2

## Contract
- **Tier:** task | **ID:** 8.2.2.2
- **Scope:** 8.2.2.2
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
Confirm auth-route limiter returns 429 after 10 requests; update SECURITY_STUBS.md with auth-route section and curl verification. Task 8.2.2.1 delivered the limiter and placeholder router.

## Files
- `server/docs/SECURITY_STUBS.md` — add auth-route limiter section, update "will be added" to "added", add curl verification for `/api/v1/internal/auth`

## Approach
1. Update SECURITY_STUBS.md: change "Auth-route limiter: Stricter limit... will be added in Session 8.2.2" to "Auth-route limiter: 10 req/15 min on `/api/v1/internal/auth/*`. Placeholder route returns 501 until Feature 7."
2. Add "Auth-route verification" subsection with curl examples: send 11 requests to `/api/v1/internal/auth`; 11th returns 429 with Retry-After.
3. Optionally run curl once to verify locally before committing.

## Checkpoint
- SECURITY_STUBS.md documents auth-route limiter and verification
- Manual curl (if run) confirms 429 after 10 requests on auth path

## How we build the tierDown to achieve them
- **Task 8.2.2.2:** Verify and document (no sub-tasks; implement directly)
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/sessions/session-8.2.2-guide.md`
- Handoff (full transition context): `.project-manager/features/security-hardening/sessions/task-8.2.2.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
