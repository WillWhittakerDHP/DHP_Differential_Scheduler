# Plan: session 8.3.1 — ** ** Add validation library and middleware

## Contract
- **Tier:** session | **ID:** 8.3.1
- **Scope:** ** ** Add validation library and middleware
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
No prior handoff for this session.

## Goal
Add Joi and create validation middleware or helper pattern. Wire validation to one sample internal route as proof of concept. Session 8.3.2 will apply validation across internal routes.

## Files
- `server/package.json` — add Joi
- `server/src/middlewares/validateRequest.ts` — validation middleware or helper
- `server/src/routes/internal/` — wire validation to one sample POST route
- `server/docs/SECURITY_STUBS.md` — document validation pattern (brief)

## Approach
1. Install Joi. 2. Create `validateRequest(schema)` middleware that validates `req.body` against a Joi schema; on failure, return 400 with validation errors. 3. Wire to one sample internal route (e.g. entities POST or appointments POST) as proof of concept. 4. Add brief "Request validation" section to SECURITY_STUBS.

## Checkpoint
- Joi installed; validateRequest middleware in place
- Sample route validated; invalid payload returns 400 with error details
- SECURITY_STUBS documents validation pattern

## How we build the tierDown to achieve them
- **Task 8.3.1.1:** Add Joi and create validateRequest middleware
- **Task 8.3.1.2:** Wire validation to sample route; document in SECURITY_STUBS
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/phases/phase-8.3-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
