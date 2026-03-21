# Plan: session 6.12.1 — Entity enhancements and annotation data layer

## Contract
- **Tier:** session | **ID:** 6.12.1
- **Scope:** Entity enhancements (event shape link toggles, block shapes expansion) and annotation relational content layer (new table, migrations, delete 409)
- **Governance:** 4 governance highlights — read reports before filling slots

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
Phase 6.12 started; no prior session handoff for 6.12.1. TierUp: `phases/phase-6.12-guide.md` (Session 6.12.1 description).

## Goal
Finish **Session 6.12.1** only: (1) **Event shape** — add `includeRescheduleLink` and `includeCancelLink` (default true) end-to-end (migration, Sequelize model, shared/client types, admin field config/metadata, invite context builder omits tokens when off). (2) **Block shapes tab** — fix entity cards so expansion panels open reliably on click. (3) **Annotation data** — introduce `annotation_instance_content` (FK to `annotation_instances` and `user_type_block_instance_id`), backfill/migrate from existing `annotation_instances` / `userType` usage; deprecate or narrow `AnnotationInstance.userType` and simplify `AnnotationAssignment` per phase guide. (4) **Annotation shape delete** — on FK conflict (`annotation_instances_type_fkey`), return **409** with an actionable body instead of 500. Session 6.12.2 (UI slots registry + wizard pipeline) is **out of scope** here.

## Files
- **Intent:** `phases/phase-6.12-guide.md`, `sessions/session-6.12.1-guide.md`
- **Event shape:** migration; `server/src/db/models/booking/event_shape.ts`; `server/src/services/invites/inviteContextBuilder.ts`; shared types + client entity metadata / field configs for event shape
- **Block shapes admin:** components using expansion for entity cards (e.g. `ShapeCardList`, `EntityCard`, shapes tab under admin) — locate via grep
- **Annotations:** migrations; models for `annotation_instances`, `annotation_assignments`, new `annotation_instance_content`; annotation shape routes/services (DELETE handler); repositories or CRUD as existing pattern
- **Types:** `shared/types` or domain annotation types consumed by client/server
- **Governance:** `client/.audit-reports/*`, `.project-manager/*_AUTHORING_PLAYBOOK.md`

## Approach
1. **Event toggles:** Add columns → model + types → admin UI fields → invite builder branches on shape flags when substituting `{rescheduleLink}` / `{cancelLink}`.
2. **Block expansion:** Reproduce failure path in admin UI; fix event handling / `v-model` / keying so panel state toggles correctly (prefer minimal composable or prop fix).
3. **Content table:** Design migration (create table, copy legacy text/tooltip into rows per user-type dimension); update create/update/read paths for annotations; remove or gate `userType` on instance; simplify assignments in line with phase doc.
4. **409 delete:** Catch Sequelize FK error (or pre-check counts) on annotation shape delete; map to 409 + consistent error shape used elsewhere in API.

## Checkpoint
- Migrations run clean on dev DB; existing annotation rows still readable after backfill.
- Admin: event shape shows two booleans; saving persists; invite emails respect off toggles (manual spot-check).
- Block shapes: entity card expands/collapses as expected.
- Deleting an annotation shape still in use returns **409** with clear message; unused shape deletes succeed.
- No implementation work for `annotationSlots` / `ui_slot` / wizard transformer in this session (deferred to 6.12.2).

## How we build the tierDown to achieve them
- **Task 6.12.1.1:** Event shape reschedule/cancel link toggles and invite builder
- **Task 6.12.1.2:** Block shapes tab entity card expansion fix
- **Task 6.12.1.3:** `annotation_instance_content` table, migration, and model/API alignment (deprecate `userType` path)
- **Task 6.12.1.4:** Annotation shape delete — 409 with actionable response when dependents exist
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/phases/phase-6.12-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
