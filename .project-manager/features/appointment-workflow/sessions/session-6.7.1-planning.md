# Plan: session 6.7.1 — Backend — set scheduled_by_id on create from req.user

## Contract
- **Tier:** session | **ID:** 6.7.1
- **Scope:** Backend — set scheduled_by_id on create from req.user
- **Governance:** 4 governance highlights — read reports before filling slots

## Where we left off
No prior handoff for this session. Phase 6.7 (Scheduled By Auto-Population) just started; Feature 7 (Authentication) will provide req.user.

## Goal
Set `scheduled_by_id` on the appointment create path from `req.user` (Feature 7); do not allow the client to supply this field on create.

## Files
- Server: appointment create route/handler (e.g. `server/src/routes/internal/appointments/` or equivalent); sanitizeInput or create pipeline where appointment fields are set.

## Approach
- In the appointment create handler, read `req.user` (populated by Feature 7 auth middleware).
- Set `scheduled_by_id` on the entity from `req.user.id` before persist.
- Ensure client cannot override: do not accept `scheduled_by_id` from request body, or explicitly overwrite with server value in sanitize/create logic.

## Checkpoint
Creating an appointment while authenticated results in `scheduled_by_id` populated with the current user id; unauthenticated or missing user handled per product policy (e.g. null or 401).

## How we build the tierDown to achieve them
- **Task 6.7.1.1:** Set scheduled_by_id in create path from req.user and block client override
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/phases/phase-6.7-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
