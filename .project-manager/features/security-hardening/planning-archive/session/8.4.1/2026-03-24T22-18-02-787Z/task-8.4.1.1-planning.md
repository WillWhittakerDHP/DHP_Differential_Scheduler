# Plan: task 8.4.1.1 — 8.4.1.1

## Contract
- **Tier:** task | **ID:** 8.4.1.1
- **Scope:** 8.4.1.1
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
No prior handoff for this task. Session 8.4.1 (Env var audit) just started. Task 8.4.1.2 will validate .env.example and fix hardcoded secrets.

## Goal
Grep server and client codebases for `process.env` and `import.meta.env` usage; produce a structured env var inventory documenting every variable used, its source file(s), and whether it is required or optional. (Validation and remediation are Task 8.4.1.2.)

## Files
- `server/src/**` — grep for process.env and config usage
- `client/src/**` — grep for import.meta.env (Vite)
- Any `*.config.*`, `config.ts`, or env-loading modules
- `server/SECURITY_STUBS.md` or `server/docs/` — create or append env inventory section (output)

## Approach
1. Grep for `process\.env\.\w+` in server/src; note variable names and file paths
2. Grep for `import\.meta\.env\.\w+` (or `VITE_*`) in client/src; note variable names
3. Check config loaders (e.g. dotenv, env vars in app startup)
4. Collate results into inventory: var name | source files | required/optional | purpose
5. Write inventory to SECURITY_STUBS or a dedicated env-inventory doc

## Checkpoint
- Env var inventory document exists with all process.env and import.meta.env vars
- Each var lists source file(s) and required/optional
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/sessions/session-8.4.1-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
