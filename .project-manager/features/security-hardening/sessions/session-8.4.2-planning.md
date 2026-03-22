# Plan: session 8.4.2 — Committed files scan

## Contract
- **Tier:** session | **ID:** 8.4.2
- **Scope:** Committed files scan
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
Completed Task - Begin Session 8.4.2

## Goal
Verify .gitignore coverage for credential paths, scan tracked files for secrets (API keys, tokens, high-entropy strings), and document findings in SECURITY_STUBS. Session 8.4.1 completed env var inventory and .env.example; this session focuses on committed-file safety.

## Files
- `.gitignore` — audit coverage for .env*, credentials, token files
- `client/src/**`, `server/src/**` — tracked source to scan for secrets
- `server/docs/SECURITY_STUBS.md` — document committed-files scan findings
- Root and nested `*.config.*`, config loaders — verify no secrets in committed config

## Approach
1. **.gitignore verification:** Confirm .env, .env.*, .google-tokens.json and any other credential paths are excluded; add missing patterns if needed.
2. **Secrets scan:** Grep tracked files for known patterns (API key formats, bearer tokens, high-entropy strings, `password=`, `secret=`) and document findings or confirm clean.
3. **SECURITY_STUBS:** Add "Committed files scan" section with .gitignore coverage summary, scan methodology, and safe-handling guidelines for future commits.

## Checkpoint
- .gitignore verified; any missing credential patterns added
- Tracked files scanned; no secrets found or findings documented
- SECURITY_STUBS updated with committed-files scan section

## How we build the tierDown to achieve them
- **Task 8.4.2.1:** .gitignore verification and secrets scan — audit .gitignore coverage, run pattern scan on tracked files, record findings
- **Task 8.4.2.2:** SECURITY_STUBS documentation — add Committed files scan section with .gitignore summary, scan results, and guidelines
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/phases/phase-8.4-guide.md`
- Handoff (full transition context): `.project-manager/features/security-hardening/sessions/session-8.4.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
