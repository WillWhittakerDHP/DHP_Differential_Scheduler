# Plan: task 6.12.1.1 — Event shape link toggles and invite builder

## Contract
- **Tier:** task | **ID:** 6.12.1.1
- **Scope:** Event shape `includeRescheduleLink` / `includeCancelLink` + invite context respects them per event instance
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
Session 6.12.1 started; first task in session. TierUp: `sessions/session-6.12.1-planning.md`.

## Goal
Add **`includeRescheduleLink`** and **`includeCancelLink`** on **event shapes** (DB defaults **true**). Wire through Sequelize model, API batch/CRUD payloads, and **client** `EventShapeEntity` + admin field metadata so admins can toggle per shape. Update **invite flow** so template context exposes `{rescheduleLink}` / `{cancelLink}` only when the **current event instance’s shape** allows each link (an appointment can have multiple event instances with different shapes — do **not** use one global context for all). **Out of scope:** block-shapes expansion, `annotation_instance_content`, annotation delete 409 (tasks **6.12.1.2**–**6.12.1.4**); UI slots / wizard transformer (**6.12.2**).

## Files
- **New migration** under `server/src/db/migrations/` — add boolean columns on `event_shapes` (snake_case `include_reschedule_link`, `include_cancel_link`, default true).
- `server/src/db/models/booking/event_shape.ts` — model attributes + `field` mappings.
- `shared/` types if event shape is defined there for API; else server validators and client `client/src/types/entities.ts` (`EventShapeEntity`).
- `client/src/configs/adminConfig.ts` (or entity field registry / metadata for `eventShape`) — boolean fields for admin forms.
- `server/src/services/invites/inviteContextBuilder.ts` — extend `buildInviteContext` (or add a small helper) to accept flags and omit or empty link tokens when false; keep URL builders unchanged.
- `server/src/services/invites/inviteOrchestrationService.ts` — load **event shape** (or flags) for each `eventInstance` in the loop; merge **per-instance** context before `resolveEventTemplates` / `createEventForInstance` (today a single `context` is reused for every instance — refactor so link keys follow the active instance’s shape).
- Any Sequelize includes on `EventInstance` → `EventShape` if not already present for invite path.
- `shared/constants/templateVariables.ts` — document behavior if needed (optional; variables already exist from phase 6.5).

## Approach
1. **Migration + model:** Add two NOT NULL booleans default true; align with existing event_shape naming (`field` for snake_case).
2. **API ↔ client:** Ensure batch entity payload includes new keys; update `EventShapeEntity` and admin primitive field config so toggles appear on event shape edit/create flows without exceeding component/prop governance (thin bindings).
3. **Invite context:**  
   - Base context: appointment-level fields unchanged.  
   - For each `eventInstance`, resolve `includeRescheduleLink` / `includeCancelLink` from its shape; build `context` (or overlay) so `rescheduleLink` / `cancelLink` are set to full URLs when true, and when false either **omit** keys or set **empty string** consistently so `templateResolver` does not leave stale placeholders — pick one strategy and apply everywhere.
4. **Verify:** Toggle off on one event shape, trigger invite path for an appointment using that shape; confirm calendar description/body has no effective link for disabled token. Default-on shapes behave as today.

## Checkpoint
- [ ] Migration applies; existing rows default both flags true.
- [ ] Admin can see and persist both toggles per event shape.
- [ ] Invites for multi–event-instance appointments respect **per-instance** shape flags.
- [ ] Client lint / server compile clean; no silent fallback that hides misconfiguration (log or explicit empty replacement per project rules).

## How we build the tierDown to achieve them
- **Task 6.12.1.1:** Leaf task — no sub-task IDs; complete before **Task 6.12.1.2** (block shapes expansion).

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.12.1-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
