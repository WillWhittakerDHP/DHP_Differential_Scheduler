# Plan: phase 8.4 — 8.4

## Contract
- **Tier:** phase | **ID:** 8.4
- **Scope:** 8.4
- **Governance:** 2 governance highlights — read reports before filling slots

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** architectural
- **Governance domains:** docs
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** light
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
Phase 8.3 completed with sessions: 8.3.1.

## Goal
Complete a secrets audit for the project: (1) inventory all environment variable usage and ensure secrets are loaded from env, not hardcoded; (2) verify no secrets or credentials exist in committed files. Document patterns in SECURITY_STUBS and ensure .env.example + .gitignore are complete.

## Files
- `server/.env.example`, `server/.env.development`, `server/.env.production` — template and env patterns
- Root `.env`, `.env.example` — if present
- `.gitignore` — ensure .env* and credential files excluded
- `server/src/**` — scan for process.env usage and any hardcoded strings
- `.project-manager/features/security-hardening/**/SECURITY_STUBS*` or equivalent — document audit findings
- Any `*.config.*` or config loaders that may hold secrets

## Approach
1. **Env audit:** Inventory all `process.env` (or config) usage across server/client; cross-check against .env.example; ensure no defaults contain secrets; document required vs optional vars.
2. **Committed-file scan:** Verify .gitignore covers .env*, .google-tokens.json, and any credential paths; optionally run a grep/truffleHog-style scan for high-entropy strings or known patterns; document safe patterns.
3. **Documentation:** Add "Secrets audit" section to SECURITY_STUBS with env var inventory, .gitignore coverage, and safe-handling guidelines.

## Checkpoint
- Env var inventory documented; .env.example complete for all required vars
- No hardcoded secrets in codebase; .gitignore verified
- SECURITY_STUBS updated with secrets audit section

## How we build the tierDown to achieve them
- **Session 8.4.1:** Env var audit — inventory process.env usage, validate .env.example, ensure no hardcoded secrets
- **Session 8.4.2:** Committed files scan — verify .gitignore coverage, scan for secrets in tracked files, document in SECURITY_STUBS
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/feature-security-hardening-guide.md`
- Handoff (full transition context): `.project-manager/features/security-hardening/phases/phase-8.3-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
