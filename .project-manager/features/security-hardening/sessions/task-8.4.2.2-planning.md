# Plan: task 8.4.2.2 — 8.4.2.2

## Contract
- **Tier:** task | **ID:** 8.4.2.2
- **Scope:** 8.4.2.2
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
Add safe-handling guidelines for committed-file security to SECURITY_STUBS. Task 8.4.2.1 added .gitignore coverage and scan results; this task adds guidelines for future commits and periodic re-scans.

## Files
- `server/docs/SECURITY_STUBS.md` — add guidelines subsection under Committed files scan

## Approach
1. **Guidelines subsection:** Under "Committed files scan — results", add "Safe-handling guidelines" with: pre-commit checklist (no API keys/tokens in source), how to add new credential paths to .gitignore, when to re-run the scan (e.g. before phase/session end or when adding new integrations).
2. **Concrete guidance:** Document patterns to avoid (hardcoded keys, literal tokens), reference .env.example for required vars, and a one-liner or short script to run a quick grep scan.

## Checkpoint
- SECURITY_STUBS has "Safe-handling guidelines" subsection with pre-commit checklist and re-scan guidance
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/sessions/session-8.4.2-guide.md`
- Handoff (full transition context): `.project-manager/features/security-hardening/sessions/task-8.4.2.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
