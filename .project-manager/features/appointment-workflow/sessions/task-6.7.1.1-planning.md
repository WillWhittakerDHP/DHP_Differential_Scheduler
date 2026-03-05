# Plan: task 6.7.1.1 — 6.7.1.1

## Contract
- **Tier:** task | **ID:** 6.7.1.1
- **Scope:** 6.7.1.1
- **Governance:** Clean — no violations detected

## Where we left off
No prior handoff for this task.

## Goal
Set `scheduled_by_id` on the appointment create path from `req.user` (Feature 7); do not allow the client to supply this field on create.

## Files
- Server: appointment create route/handler (e.g. `server/src/routes/internal/appointments/`); sanitizeInput or create pipeline where appointment fields are set.

## Approach
- In the appointment create handler, read `req.user` (populated by Feature 7 auth middleware when present).
- Set `scheduled_by_id` on the entity from `req.user.id` before persist.
- Ensure client cannot override: do not accept `scheduled_by_id` from request body, or explicitly overwrite with server value in sanitize/create logic. If `req.user` is absent (no auth yet), leave `scheduled_by_id` null per product policy.

## Checkpoint
Creating an appointment while authenticated results in `scheduled_by_id` populated with the current user id; unauthenticated or missing user leaves it null (or return 401 if create requires auth).
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.7.1-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
