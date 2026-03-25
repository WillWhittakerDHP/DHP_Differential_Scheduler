# Plan: session 8.3.2 — Apply validation across internal routes

## Contract
- **Tier:** session | **ID:** 8.3.2
- **Scope:** Apply validation across internal routes
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
Session 8.3.1 complete: Joi installed, validateRequest middleware in place, auth/login route has POC validation. Ready to apply validation across internal POST/PUT routes.

## Goal
Apply Joi validation to internal API POST/PUT routes that lack schema-based validation. Use existing validateRequest(schema) middleware; add Joi schemas per route or route family. Return 400 with validation details on invalid payloads. Document schemas and patterns in SECURITY_STUBS.

## Files
- `server/src/middlewares/validateRequest.ts` — existing; reuse
- `server/src/routes/internal/` — entity CRUD, property, relationship, appointment, availability, business/calendar/wizard settings, admin-metadata
- `server/docs/SECURITY_STUBS.md` — expand with validation patterns and schema inventory

## Approach
1. Audit internal POST/PUT routes: identify which use Joi (auth, relationshipAnnotationAssignment, relationshipInstanceComponent) vs hand-written validators (CRUD via createCrudRouter) vs none.
2. Prioritize high-impact routes: entity CRUD, appointments, availability, property CRUD.
3. Add Joi schemas and validateRequest(schema) middleware to routes missing validation; for CRUD routes, either integrate Joi into createCrudRouter or add per-route validation.
4. Return 400 Bad Request with { error: 'Validation failed', details } on schema failure (validateRequest already does this).
5. Expand SECURITY_STUBS with validation patterns, schema inventory, and migration notes.

## Checkpoint
- Joi validation applied to entity CRUD and appointment-related internal routes
- Remaining internal POST/PUT routes validated
- SECURITY_STUBS documents validation patterns and schema inventory

## How we build the tierDown to achieve them
- **Task 8.3.2.1:** Audit and apply Joi to entity CRUD and high-impact internal routes
- **Task 8.3.2.2:** Apply Joi to remaining internal routes; document in SECURITY_STUBS
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/phases/phase-8.3-guide.md`
- Handoff (full transition context): `.project-manager/features/security-hardening/sessions/session-8.3.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
