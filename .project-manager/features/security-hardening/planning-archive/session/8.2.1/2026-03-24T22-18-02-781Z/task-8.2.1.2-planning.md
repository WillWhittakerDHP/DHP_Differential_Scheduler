# Plan: task 8.2.1.2 — 8.2.1.2

## Contract
- **Tier:** task | **ID:** 8.2.1.2
- **Scope:** 8.2.1.2
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
Verify rate limit behavior: confirm 429 when limit exceeded; add verification instructions to SECURITY_STUBS.md.

## Files
- `server/docs/SECURITY_STUBS.md` — add "How to verify" section with curl example

## Approach
Add a "How to verify" subsection under the rate limiting section with a curl loop that exhausts the limit (101 requests) and shows 429 + Retry-After. No code changes to rateLimit.ts or routes. Optionally run the verification once to confirm.

## Checkpoint
- Verification instructions documented in SECURITY_STUBS.md
- 429 and Retry-After confirmed (manual or documented curl)

## How we build the tierDown
- **Step 1:** Add "How to verify" section with curl example to SECURITY_STUBS.md
- **Step 2:** Optionally run verification to confirm 429
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/sessions/session-8.2.1-guide.md`
- Handoff (full transition context): `.project-manager/features/security-hardening/sessions/task-8.2.1.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
