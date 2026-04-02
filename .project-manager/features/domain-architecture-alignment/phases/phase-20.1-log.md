# Phase 20.1 Log

**Purpose:** Track phase-level progress, decisions, and blockers

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Status

**Phase:** 20.1
**Status:** [In Progress / Complete]
**Started:** [Date]
**Completed:** [Date] (if complete)

---

## Completed Sessions

### Session 20.1.3: Event schema alignment ✅
**Completed:** 2026-04-02
**Tasks Completed:** All tasks completed
**Key Accomplishments:**
- Completed ** Event schema alignment (placement, segment ownership, instance attendees)



### Session 20.1.2: Block instance three-property alignment and legacy cleanup ✅
**Completed:** 2026-04-02
**Tasks Completed:** All tasks completed
**Key Accomplishments:**
- Completed ** ** Block instance three-property alignment and legacy cleanup -- migration: ADD `orchestrator` (bool), ADD `wizardVisible` (bool) to `block_instances`; DROP `bookingMode`, `differential`, `differentialEventRoleOverrides` from `block_instances`; DROP `composable`, `isStateControl`, `canHaveParts` from `block_shapes`; update both Sequelize models; update `BlockInstanceEntity` and `BlockShapeEntity` client types.



### Session 20.1.2: Block instance three-property alignment and legacy cleanup ✅
**Completed:** 2026-04-02
**Tasks Completed:** All tasks completed
**Key Accomplishments:**
- Completed ** ** Block instance three-property alignment and legacy cleanup -- migration: ADD `orchestrator` (bool), ADD `wizardVisible` (bool) to `block_instances`; DROP `bookingMode`, `differential`, `differentialEventRoleOverrides` from `block_instances`; DROP `composable`, `isStateControl`, `canHaveParts` from `block_shapes`; update both Sequelize models; update `BlockInstanceEntity` and `BlockShapeEntity` client types.



### Session 20.1.2: Block instance three-property alignment and legacy cleanup ✅
**Completed:** 2026-04-02
**Tasks Completed:** All tasks completed
**Key Accomplishments:**
- Completed ** ** Block instance three-property alignment and legacy cleanup -- migration: ADD `orchestrator` (bool), ADD `wizardVisible` (bool) to `block_instances`; DROP `bookingMode`, `differential`, `differentialEventRoleOverrides` from `block_instances`; DROP `composable`, `isStateControl`, `canHaveParts` from `block_shapes`; update both Sequelize models; update `BlockInstanceEntity` and `BlockShapeEntity` client types.



### Session 20.1.2: Block instance three-property alignment and legacy cleanup ✅
**Completed:** 2026-04-02
**Tasks Completed:** All tasks completed
**Key Accomplishments:**
- Completed ** ** Block instance three-property alignment and legacy cleanup -- migration: ADD `orchestrator` (bool), ADD `wizardVisible` (bool) to `block_instances`; DROP `bookingMode`, `differential`, `differentialEventRoleOverrides` from `block_instances`; DROP `composable`, `isStateControl`, `canHaveParts` from `block_shapes`; update both Sequelize models; update `BlockInstanceEntity` and `BlockShapeEntity` client types.



### Session 20.1.1: Block shape type enum rename ✅
**Completed:** 2026-04-02
**Tasks Completed:** All tasks completed
**Key Accomplishments:**
- Completed ** ** Block shape type enum rename -- migration (`property`->`time`, `coupon`->`price`, `option`->`event`); update `block_shape.ts` model and TS type; update `client/src/constants/blockShapeTypes.ts` and `entities.ts`; grep and update server Joi validators / route constants referencing old strings.



### Session [SESSION_ID]: [SESSION_NAME] ✅
**Completed:** [Date]
**Tasks Completed:** [List of task IDs]
**Key Accomplishments:**
- [Accomplishment 1]
- [Accomplishment 2]

### Session [SESSION_ID+1]: [SESSION_NAME] ✅
**Completed:** [Date]
**Tasks Completed:** [List of task IDs]
**Key Accomplishments:**
- [Accomplishment 1]
- [Accomplishment 2]

---

## In Progress Sessions

### Session [SESSION_ID]: [SESSION_NAME] 🔄
**Started:** [Date]
**Current Task:** [TASK_ID]
**Progress:** [X] of [Y] tasks complete

---

## Blockers and Issues

### Blocker [Date]
**Description:** [What's blocking progress]
**Impact:** [How it affects the phase]
**Resolution:** [How it was resolved or plan to resolve]

---

## Key Decisions

### Decision [Date]
**Context:** [What decision was needed]
**Decision:** [What was decided]
**Rationale:** [Why this decision was made]
**Impact:** [How this affects downstream phases]

---

## Phase Checkpoints

### Checkpoint [Date]
**Sessions Completed:** [X.Y, X.Y+1, ...]
**Status:** [On track / Behind / Ahead]
**Notes:** [Checkpoint notes]

---

## Next Steps

- [Next session to start]
- [Actions needed]
- [Dependencies to resolve]

---

## Phase Completion Summary

**Sessions Completed:** 20.1.1, 20.1.2, 20.1.3
**Total Tasks Completed:** 0
**Success Criteria Met:** Yes - All success criteria met

**Workflow Feedback:** (Optional - only document if issues encountered)
- **User feedback:** [Any problems managing phase workflow or issues with results]
- **AI observations:** [Sticking points, inefficiencies, or workflow friction encountered during phase]
- **Improvements needed:** [Workflow improvements for future phases]
- **Template updates:** [Any template improvements suggested]
- **Cross-tier feedback:** [If phase-level issues suggest improvements needed at session or task level]

<!-- end excerpt phase -->

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (5): `.project-manager/features/domain-architecture-alignment/phases/phase-20.1-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.1.1-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-planning.md`, `.project-manager/features/domain-architecture-alignment/planning-archive/phase/`

### `git diff --stat HEAD`

```text
.../phases/phase-20.1-planning.md                  | 417 +++++++++------------
 .../sessions/session-20.1.1-planning.md            | 191 ----------
 .../sessions/session-20.1.2-planning.md            | 208 ----------
 .../sessions/session-20.1.3-planning.md            | 197 ----------
 4 files changed, 186 insertions(+), 827 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.1-planning.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.1-planning.md
index 3386824b..f0c1c8fe 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.1-planning.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.1-planning.md
@@ -1,316 +1,271 @@
-# Plan: phase 20.1 — 20.1
-
-## Contract
-- **Tier:** phase | **ID:** 20.1
-- **Scope:** 20.1
-- **Governance (harness snapshot):**
-  - Governance Context (Phase)
-  - Type Inventory Issues
-  - Duplication Hotspots (top 4)
-  - Import Graph
-  - **7** composable chain depth violations (max depth exceeded)
-
-## Work Profile
-- **Execution intent:** plan
-- **Action type:** decomposition
-- **Scope shape:** architectural
-- **Governance domains:** docs, architecture, booking
-- **Gate profile:** decomposition
-- **Suggested depth:** full — advisory; agent decides in Analysis / Decomposition
-- **Recommended context pack:** decomposition_pack
-- **Planning artifact action:** create
-- **Decomposition mode:** light
-- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition.
-
-## Where we left off
-Feature 20 planning accepted. Branch **`feature/domain-architecture-alignment`** created. Phase 20.1 is the first implementation pass — no prior schema work has landed yet. Across ladder: next phase after this is **20.2** (API alignment).
+<!-- harness-planning-rollup tier=phase id=20.1 consolidatedAt=2026-04-02T16:35:47.963Z -->
+
+# Consolidated planning: phase 20.1
+
+## Phase 20.1 (parent)
 
 ## Story
+
 **As a** platform maintainer, **I want** the database schema and Sequelize models to match the locked domain principles (block type renames, instance-level three-property model, event placement columns, event-instance ownership, legacy column removal), **so that** all subsequent passes (API, admin, booking pipeline, migration) operate against the target schema rather than working around legacy structures.
 **Estimated size:** L
 
 ---
-## Architecture context (harness-injected)
 
-## 1. System overview
+## Analysis
 
-Bonsai Differential Scheduler is a **Vue 3 + Express + Sequelize** application with a **shared type layer** (`shared/` / `@shared`). It serves:
+- **Problem / why now:** The DB schema still carries legacy type names (`property`/`coupon`/`option`), shape-level booleans that should be instance-level (`composable` on shapes; no `orchestrator`/`wizardVisible` on instances), differential-role storage on event shapes instead of placement data, and missing event-instance ownership (`parent_block_instance_id`). Every subsequent pass (API, admin, booking) depends on the schema matching the locked principles first.
+- **Domain boundaries:** Primarily **server persistence** (models + migrations) and **shared type contracts**. Client constants and entity types (`blockShapeTypes.ts`, `entities.ts`) need to stay in sync but this phase does not rewrite booking logic or admin UI — those are 20.3–20.4.
+- **Grounding:** Recon confirmed all legacy columns exist, all target columns are missing, and migration pattern is `.mjs` with raw SQL + idempotent guards.
+- **Patterns:** Migrations use `queryInterface.sequelize.query(...)` with `IF EXISTS` / `IF NOT EXISTS`. Enum changes use `ALTER TYPE ... RENAME VALUE` (see migration 000056). Model files use `Model.init(...)` with `DataTypes`. Follow these existing patterns.
+- **Risks:** (1) Enum rename in PostgreSQL (`ALTER TYPE ... RENAME VALUE`) requires PG ≥10 and must rename one value at a time. (2) Dropping columns that have FK or validation references requires ordering (drop validate first, then column). (3) `event_shape_attendees` rename to `event_instance_attendees` also requires FK updates. (4) `DB_HOST` migration policy — author migration files only; do not run on shared DB from this machine.
+- **Open questions:** Whether `active_part.ts` duplicate factory needs cleanup (deferred — not blocking schema work). Whether any server-side Joi validators hard-code the old enum values (verify in session tasks).
+- **Alternatives:** Single mega-migration vs. multiple focused migrations. Chose **multiple focused migrations** (one per logical group: type rename, instance properties, event shape/instance) for clarity and safer rollback.
 
-- **Public booking users** — wizard-style scheduling and property/availability flows.
-- **Admin configurators** — metadata-driven entity CRUD, wizard settings, availability rules, integrations.
+## Goal
 
-TanStack **Vue Query** manages server-state caching. Composables typically expose **`ComputedRef<T>`** for read-only query data. Admin metadata is often batch-prefetched (e.g. router navigation guards).
+Align the **database schema** (PostgreSQL + Sequelize models) and **client/shared type constants** with the locked domain principles per **FEATURE_20_ARCHITECTURE_REDESIGN.md §2** and **§8.1** acceptance checks:
+- Block shape type enum uses `time` / `price` / `event` (not `property` / `coupon` / `option`).
+- `block_instances` carries all three booleans: `composite`, `orchestrator`, `wizardVisible`.
+- Legacy shape-level booleans (`composable`, `isStateControl`, `canHaveParts`) and instance-level drift columns (`bookingMode`, `differential`, `differentialEventRoleOverrides`) removed.
+- `event_shapes` has `placement_kind` + `anchor_edge` instead of `differential_role`; calendar toggles moved to `event_instances`.
+- `event_instances` owns `parent_block_instance_id` and location fields.
+- `event_shape_attendees` renamed to `event_instance_attendees`.
 
----
+**Done for this phase:** Migrations authored (and run on localhost if applicable); Sequelize models updated; client constants and entity types updated; app starts and lint passes.
 
-## 2. Domain map
+## Files
 
-| Domain | Client paths | Server paths | Key models / areas | Shared types |
-|--------|----------------|-------------|---------------------|--------------|
-| **Booking / Wizard** | `client/src/composables/booking/`, `useBooking.ts`, `useAppointment.ts`, `useProperty.ts`, `components/booking/`, `views/booking/`, `types/booking/`, `configs/wizardSteps`, `configs/availabilitySettings` | `server/src/routes/internal/appointments`, `availability`, `properties`, `services/availability*`, `db/models` booking-related | Appointments, selections, time slots, properties, fees | `@shared/types` availability, appointment-related |
-| **Admin / Config** | `composables/admin/`, `components/admin/`, `views/admin/`, `types/admin/`, `configs/` | `routes/internal/entities`, `relationships`, `admin-metadata`, `*-settings`, `db/models` admin | Shapes, instances, wizard settings, calendar settings, business rules | `@shared/types/entities` |
-| **Auth / Sessions** | Router guards; future `composables/auth/` | `routes/internal/auth`, `auth/`, `db/models/auth` | Sessions, users, magic links (evolving); **`users.user_role`** (ENUM + API) | Auth contracts in `@shared` as they stabilize; **canonical role strings** via `@shared` (`USER_ROLE_VALUES` — Feature 6 Session 6.18.1) |
-| **Integrations** | `services/calendarApiService`, `mapsApiService`, `propertyEnrichmentApiService` (full-URL axios) | `routes/external/calendar`, `oauth`, `maps`, `services/google/` | OAuth, external APIs | `@shared/types/calendar` |
-| **Beta** | `composables/beta/`, `views/beta/`, `components/beta/` | `routes/internal/beta-feedback`, `db/models/beta` | Beta feedback | (often local types) |
+- **Canonical (read-only references):** `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md`, `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (§1, §2, §8.1), `.project-manager/ARCHITECTURE.md` (§8–§14)
+- **Harness / PM:** `phases/phase-20.1-guide.md`, this planning doc, feature handoff/log
+- **Server models (modify):** `server/src/db/models/admin/block_shape.ts`, `server/src/db/models/booking/block_instance.ts
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
