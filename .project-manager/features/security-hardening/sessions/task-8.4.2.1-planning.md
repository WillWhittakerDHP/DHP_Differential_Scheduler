# Plan: task 8.4.2.1 — 8.4.2.1

## Contract
- **Tier:** task | **ID:** 8.4.2.1
- **Scope:** 8.4.2.1
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
Audit .gitignore for credential-path coverage, run a pattern-based secrets scan on tracked files, and record findings for Task 8.4.2.2 to fold into SECURITY_STUBS.

## Files
- `.gitignore` — audit and update if missing credential patterns
- `client/src/**`, `server/src/**` — grep scan targets (exclude node_modules, dist via git ls-files)
- `server/docs/SECURITY_STUBS.md` — add "Committed files scan — results" subsection with .gitignore coverage and scan findings

## Approach
1. **.gitignore audit:** Verify .env, .env.*, .google-tokens.json, mcp.json, gmail-mcp-server; add any missing credential paths from env inventory.
2. **Secrets scan:** Use `git ls-files` + grep for patterns: `(api[_-]?key|secret|password|token|bearer)\s*[=:]\s*['\"]?[a-zA-Z0-9]{20,}`, `AIza[0-9A-Za-z-_]{35}`, `sk-[a-zA-Z0-9]{20,}`; exclude .env.example and docs that document patterns. Record matches or "No findings."
3. **Document results:** Add subsection under SECURITY_STUBS with .gitignore coverage list and scan results (clean or findings with file:line).

## Checkpoint
- .gitignore audited and updated if needed
- Scan completed; findings recorded
- SECURITY_STUBS has "Committed files scan — results" with coverage + scan outcome
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/sessions/session-8.4.2-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
