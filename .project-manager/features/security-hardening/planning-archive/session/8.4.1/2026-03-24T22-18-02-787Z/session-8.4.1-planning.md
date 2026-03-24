# Plan: session 8.4.1 — ** ** Env var audit — inventory process.env usage, validate .env.example, ensure no hardcoded secrets

## Contract
- **Tier:** session | **ID:** 8.4.1
- **Scope:** ** ** Env var audit — inventory process.env usage, validate .env.example, ensure no hardcoded secrets
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
Phase 8.3 completed (request validation); Phase 8.4 (Secrets audit) just started. This session covers the env var audit portion only; Session 8.4.2 will handle committed-files scan.

## Goal
Inventory all environment variable usage across the project; validate .env.example completeness; ensure no hardcoded secrets. Document the env var inventory and safe-handling patterns. (Committed-files scan and .gitignore verification are Session 8.4.2.)

## Files
- `server/.env.example`, `server/.env.development`, `server/.env.production` — audit against usage
- Root `.env`, `.env.example` — if present; audit
- `server/src/**` — scan for process.env and config usage
- `client/src/**` — scan if any env usage (Vite import.meta.env)
- Any `*.config.*` or config loaders — ensure they read from env
- `server/SECURITY_STUBS.md` or equivalent — document env inventory

## Approach
1. Grep for `process.env`, `import.meta.env`, and config-loading patterns across server and client
2. Cross-check findings against .env.example; add missing vars (placeholders, no real values)
3. Scan for hardcoded API keys, passwords, tokens; replace with env vars if any found
4. Document env var inventory (required vs optional) and safe-handling patterns

## Checkpoint
- Env var inventory documented
- .env.example covers all required vars
- No hardcoded secrets in codebase

## How we build the tierDown to achieve them
- **Task 8.4.1.1:** Inventory process.env and config usage — grep server/client, document vars
- **Task 8.4.1.2:** Validate .env.example and fix hardcoded secrets — cross-check, update .env.example, remediate any hardcoded values
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/phases/phase-8.4-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
