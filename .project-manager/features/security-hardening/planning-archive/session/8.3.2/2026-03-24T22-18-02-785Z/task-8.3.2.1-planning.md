# Plan: task 8.3.2.1 — 8.3.2.1

## Contract
- **Tier:** task | **ID:** 8.3.2.1
- **Scope:** 8.3.2.1
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
Session 8.3.1 complete: Joi and validateRequest middleware in place; auth/login has POC. No prior task handoff.

## Goal
Audit internal POST/PUT routes for validation coverage. Add Joi schemas and validateRequest middleware to entity CRUD, appointments, availability, and property CRUD — the high-impact routes. Return 400 with validation details on invalid payloads.

## Files
- `server/src/middlewares/validateRequest.ts` — existing; reuse
- `server/src/routes/helpers/createCrudRouter.ts` — CRUD factory; check validation integration point
- `server/src/routes/internal/entities/entityCrudRouter.ts` — entity POST/PUT/PATCH
- `server/src/routes/internal/appointments/` — appointment CRUD and force-create
- `server/src/routes/internal/availabilityRouter.ts` — POST /computed-data
- `server/src/routes/internal/properties/propertyCrudRouter.ts`, `propertyTypesRouter.ts` — property POST/PUT/PATCH

## Approach
1. Audit: List entity, appointment, availability, property routes; note createCrudRouter (hand-written ValidationResult) vs routes with no body validation.
2. For createCrudRouter routes: Either (a) add optional Joi integration to factory, or (b) add validateRequest(schema) per route before CRUD handler. Prefer (b) for minimal factory change.
3. Add Joi schemas: Define schemas per route family (e.g. entityCreateSchema, appointmentPatchSchema). Wire validateRequest(schema) before handlers.
4. Availability router: Add schema for computed-data request body; wire validateRequest.
5. Verify: Invalid payloads return 400 with `{ error: 'Validation failed', details }`.

## Checkpoint
- Entity CRUD, appointment CRUD, availability, property CRUD return 400 with Joi details on invalid POST/PUT/PATCH bodies
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/sessions/session-8.3.2-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
