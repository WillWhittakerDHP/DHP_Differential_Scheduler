# Session 6.12.1 Guide: Entity enhancements and annotation data layer

**Phase:** 6.12 — Annotation Content Layer and Entity Enhancements  
**Session:** 6.12.1  
**Branch:** `phase-6.12` (or session branch merged into it)

---

## Quick Start

**Session ID:** 6.12.1  
**Session name:** Entity enhancements and annotation data layer  
**Description:** Deliver event-shape invite link toggles per instance, reliable block-shape entity card expansion, `annotation_instance_content` with backfill and read/write alignment, and **409** responses when deleting an annotation shape that still has dependent instances.  
**Status:** Complete when all tasks below are checked off and migrations have been applied on target environments.

---

## Tasks

### Task 6.12.1.1: Event shape `includeRescheduleLink` / `includeCancelLink` and invite context

**Goal:** Persist booleans on event shapes (default true) and build invite template context **per event instance** so disabled links omit or empty `{rescheduleLink}` / `{cancelLink}` consistently.

**Files:** migration, `event_shape` model, client `EventShapeEntity` and field config, `inviteOrchestrationService` / `templateResolver` as needed.

**Checkpoint:** Admin toggles round-trip; multi–event-instance appointments respect each instance’s shape flags.

---

### Task 6.12.1.2: Block shapes tab — entity card expansion

**Goal:** `VExpansionPanels` / `EntityCard` open and close reliably on header click (block shapes tab and any shared path).

**Files:** `ShapeCardList.vue`, `EntityCard.vue`, `useEntityCardExpansion.ts`, related tab state.

**Checkpoint:** First-click expand/collapse; `multiple` mode still correct after reorder if drag applies.

---

### Task 6.12.1.3: `annotation_instance_content` table and migration

**Goal:** Relational content rows keyed by annotation instance + optional `user_type_block_instance_id`; backfill from legacy columns; read paths resolve text from the content table with a safe fallback during transition.

**Files:** new migration and Sequelize model, `relationshipQueryBuilders` / routers as needed, shared/client types if API shape changes.

**Checkpoint:** Migration logs counts; no silent data loss on backfill gaps.

---

### Task 6.12.1.4: Annotation shape delete → **409**

**Goal:** When dependents exist (`annotation_instances` still reference the shape), return **409** with actionable JSON instead of **500**.

**Files:** shape DELETE route/service (pre-count or FK mapping).

**Checkpoint:** In-use shape → 409 + message; unused shape → delete succeeds.

---

## Session Workflow

### Before starting

Use `/session-start 6.12.1` (or equivalent) so guides, phase scope, and branch expectations are aligned.

### During the session

Work one task at a time; run server migrations on dev DB after schema changes; keep client `vue-tsc` and lint clean for touched files.

### Ending the session

Update this guide’s task checkboxes, append the session log with completed tasks, refresh the handoff for **6.12.2**, then run `/session-end 6.12.1` (and `--continue-past-verification` after manual checks when prompted).

<!-- end excerpt session -->