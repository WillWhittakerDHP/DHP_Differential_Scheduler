# Plan: task 8.3.1.1 — 8.3.1.1

## Contract
- **Tier:** task | **ID:** 8.3.1.1
- **Scope:** 8.3.1.1
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
Install Joi and create `validateRequest(schema)` middleware that validates `req.body` against a Joi schema; on failure return 400 with validation error details. Task 8.3.1.2 will wire it to a sample route.

## Files
- `server/package.json` — add Joi dependency
- `server/src/middlewares/validateRequest.ts` — new: validateRequest(schema) middleware

## Approach
1. Add Joi to server dependencies. 2. Create validateRequest.ts: export function `validateRequest(schema: Joi.ObjectSchema)` that returns Express middleware. Middleware: run `schema.validate(req.body, { abortEarly: false })`; on error, `res.status(400).json({ error: 'Validation failed', details: error.details })` and `next()` is not called; on success, `next()`. 3. Use Joi types for schema param; explicit return type on exported function.

## Checkpoint
- Joi installed and imported
- validateRequest middleware exported; accepts schema, validates body, returns 400 with details on failure

## How we build the tierDown to achieve them
- **Task 8.3.1.1:** Add Joi and create validateRequest middleware (no sub-tasks; implement directly)
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/sessions/session-8.3.1-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
