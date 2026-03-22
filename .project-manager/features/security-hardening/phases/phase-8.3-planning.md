# Plan: phase 8.3 — 8.3

## Contract
- **Tier:** phase | **ID:** 8.3
- **Scope:** 8.3
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
Phase 8.2 completed with sessions: 8.2.1, 8.2.2.

## Goal
Add request validation and input sanitization to protect against malformed or malicious POST/PUT payloads. Install Joi, create validation middleware or helpers, apply to internal API routes, and document patterns in SECURITY_STUBS.

## Files
- `server/package.json` — add Joi (or chosen validator)
- `server/src/middlewares/` — validation middleware or schema helpers
- `server/src/routes/internal/` — apply validation to POST/PUT handlers
- `server/docs/SECURITY_STUBS.md` — document validation patterns

## Approach
1. Install Joi; create reusable validation middleware or per-route schema pattern. 2. Wire validation to a sample internal route (proof of concept). 3. Apply across internal POST/PUT routes (entities, appointments, etc.) with appropriate schemas. 4. Return 400 Bad Request with validation errors when schema fails. 5. Document approach and schemas in SECURITY_STUBS.

## Checkpoint
- Validation library installed; middleware or helper pattern in place
- Sample and key internal routes validated; 400 returned on invalid payloads
- Documentation updated

## How we build the tierDown to achieve them
- **Session 8.3.1:** Add validation library and middleware
- **Session 8.3.2:** Apply validation across internal routes
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/feature-security-hardening-guide.md`
- Handoff (full transition context): `.project-manager/features/security-hardening/phases/phase-8.2-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
