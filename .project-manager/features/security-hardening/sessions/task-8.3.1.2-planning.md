# Plan: task 8.3.1.2 — 8.3.1.2

## Contract
- **Tier:** task | **ID:** 8.3.1.2
- **Scope:** 8.3.1.2
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
Task 8.3.1.1 completed: Joi installed (already in package.json), `validateRequest(schema)` middleware in `server/src/middlewares/validateRequest.ts`. No route wiring or SECURITY_STUBS documentation yet.

## Goal
Wire `validateRequest` to one sample internal POST route as proof of concept; add brief "Request validation" section to SECURITY_STUBS.md. Session 8.3.2 will apply validation across internal routes.

## Files
- `server/src/routes/internal/` — wire `validateRequest(schema)` to one sample POST route
- `server/docs/SECURITY_STUBS.md` — add "Request validation" section documenting the pattern

## Approach
1. Pick a sample internal POST route (e.g. entities POST or appointments POST). 2. Define a Joi schema for its body. 3. Apply `validateRequest(schema)` middleware before the route handler. 4. Add a brief "Request validation" section to SECURITY_STUBS describing the pattern (middleware usage, error shape, how to verify). Joi and validateRequest already exist from 8.3.1.1.

## Checkpoint
- Sample route returns 400 on invalid payload with `{ error: 'Validation failed', details: [...] }`
- SECURITY_STUBS documents the validation pattern

## How we build the tierDown to achieve them
- **Task 8.3.1.2:** Wire validation to sample route and document (no sub-tasks; implement directly)

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/sessions/session-8.3.1-guide.md`
- Handoff (full transition context): `.project-manager/features/security-hardening/sessions/task-8.3.1.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
