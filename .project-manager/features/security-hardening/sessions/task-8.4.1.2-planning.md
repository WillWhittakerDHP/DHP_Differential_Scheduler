# Plan: task 8.4.1.2 — 8.4.1.2

## Contract
- **Tier:** task | **ID:** 8.4.1.2
- **Scope:** 8.4.1.2
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
Task 8.4.1.1 completed: env var inventory is in `server/docs/SECURITY_STUBS.md`. This task validates .env.example and fixes any hardcoded secrets.

## Goal
Cross-check the env inventory against `server/.env.example` (and root `.env.example` if present); add any missing required vars as placeholders. Scan committed files for hardcoded secrets (API keys, passwords, tokens); replace with env vars or document as a finding. Ensure .env.example is complete and no secrets remain in code.

## Files
- `server/.env.example` — add missing vars from inventory (placeholders only)
- Root `.env.example` — create or update if cross-cutting vars need documentation
- `server/src/**`, `client/src/**` — scan for hardcoded secrets; fix if found
- `server/docs/SECURITY_STUBS.md` — reference inventory; add validation notes if needed

## Approach
1. Compare inventory (SECURITY_STUBS) to server/.env.example; list missing vars
2. Add missing vars to server/.env.example with placeholder comments (no real values)
3. Grep for high-risk patterns (API keys, client IDs, secrets) in committed code
4. If hardcoded secrets found: replace with process.env/import.meta.env and document; otherwise document as clean
5. Update root .env.example if cross-cutting vars (TEST_ENABLED, GIT_MCP_SERVER, VITE_*) need docs

## Checkpoint
- server/.env.example documents all required vars from inventory
- No hardcoded secrets in committed files (or remediated)
- SECURITY_STUBS validation section updated if findings
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/sessions/session-8.4.1-guide.md`
- Handoff (full transition context): `.project-manager/features/security-hardening/sessions/task-8.4.1.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
