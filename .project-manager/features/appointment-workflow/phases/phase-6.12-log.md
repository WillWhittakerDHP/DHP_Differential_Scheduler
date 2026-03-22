# Phase 6.12 Log

**Purpose:** Track phase-level progress, decisions, and blockers

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase status

**Phase:** 6.12  
**Status:** Complete  
**Started:** (see session 6.12.1 completion)  
**Completed:** (pending)

---

## Session documentation (retro backfill)

Technical detail for retrospective sessions **6.12.2–6.12.8** lives in **session logs** (and task planning where noted). Paths under `features/appointment-workflow/sessions/`:

| Session | Log | Planning | Task docs |
|---------|-----|----------|-----------|
| 6.12.2 | [session-6.12.2-log.md](../sessions/session-6.12.2-log.md) | [session-6.12.2-planning.md](../sessions/session-6.12.2-planning.md) | [task-6.12.2.1](../sessions/task-6.12.2.1-planning.md), [task-6.12.2.2](../sessions/task-6.12.2.2-planning.md), [task-6.12.2.3](../sessions/task-6.12.2.3-planning.md) |
| 6.12.3 | [session-6.12.3-log.md](../sessions/session-6.12.3-log.md) | [session-6.12.3-planning.md](../sessions/session-6.12.3-planning.md) | [task-6.12.3.1-planning.md](../sessions/task-6.12.3.1-planning.md) |
| 6.12.4 | [session-6.12.4-log.md](../sessions/session-6.12.4-log.md) | [session-6.12.4-planning.md](../sessions/session-6.12.4-planning.md) | [task-6.12.4.1-planning.md](../sessions/task-6.12.4.1-planning.md) |
| 6.12.5 | [session-6.12.5-log.md](../sessions/session-6.12.5-log.md) | [session-6.12.5-planning.md](../sessions/session-6.12.5-planning.md) | [task-6.12.5.1-planning.md](../sessions/task-6.12.5.1-planning.md) |
| 6.12.6 | [session-6.12.6-log.md](../sessions/session-6.12.6-log.md) | [session-6.12.6-planning.md](../sessions/session-6.12.6-planning.md) | [task-6.12.6.1-planning.md](../sessions/task-6.12.6.1-planning.md) |
| 6.12.7 | [session-6.12.7-log.md](../sessions/session-6.12.7-log.md) | [session-6.12.7-planning.md](../sessions/session-6.12.7-planning.md) | [task-6.12.7.1-planning.md](../sessions/task-6.12.7.1-planning.md) |
| 6.12.8 | [session-6.12.8-log.md](../sessions/session-6.12.8-log.md) | [session-6.12.8-planning.md](../sessions/session-6.12.8-planning.md) | [task-6.12.8.1-planning.md](../sessions/task-6.12.8.1-planning.md) |

Session **6.12.1** log: [session-6.12.1-log.md](../sessions/session-6.12.1-log.md).

---

## Completed sessions

### Session 6.12.1: Entity enhancements and annotation data layer

**Completed:** 2026-03-21  
**Tasks completed:** 6.12.1.1, 6.12.1.2, 6.12.1.3, 6.12.1.4  
**Log:** [session-6.12.1-log.md](../sessions/session-6.12.1-log.md)

**Accomplishments:**

- Event shape `includeRescheduleLink` / `includeCancelLink` and per-instance invite context
- Block shapes admin: reliable entity card expansion (`VExpansionPanels` / `EntityCard`)
- `annotation_instance_content` table, migration/backfill, and API/model alignment
- Annotation shape delete: **409** with actionable body when instances still reference the shape

---

### Session 6.12.2: Annotation UI slots, wizard pipeline, assignment edges

**Log:** [session-6.12.2-log.md](../sessions/session-6.12.2-log.md)

**Accomplishments:**

- `ANNOTATION_UI_SLOTS`, `annotation_shapes.ui_slot`, server validation, admin dropdown
- `buildBookingBlockAnnotationUi`, `useAnnotationContent`, wizard slot copy
- Flat annotation assignment edges, `assignmentUserTypeFilter`, content row resolution (tasks 6.12.2.1–6.12.2.3)

---

### Session 6.12.3: Admin metadata — panels and `render_as`

**Log:** [session-6.12.3-log.md](../sessions/session-6.12.3-log.md)

**Accomplishments:**

- Sub-panels and `fieldLocationDispatcher` alignment
- Shape-level `valid*` multiselect via `collectionFieldKeys` + `computeRenderAs` + migrations

---

### Session 6.12.4: Events — block-level ownership

**Log:** [session-6.12.4-log.md](../sessions/session-6.12.4-log.md)

**Accomplishments:**

- `valid_events` → block shape; `event_assignments` → block instance only
- Booking + invites + admin metadata migrations (`20260432_*` family)

---

### Session 6.12.5: Differential event roles

**Log:** [session-6.12.5-log.md](../sessions/session-6.12.5-log.md)

**Accomplishments:**

- `differential_event_role_overrides` JSONB + admin matrix (all active event shapes)

---

### Session 6.12.6: Event instance admin and template preview

**Log:** [session-6.12.6-log.md](../sessions/session-6.12.6-log.md)

**Accomplishments:**

- Event instance admin UI + preview API / service + shared template helpers

---

### Session 6.12.7: Booking and scheduling refinements

**Log:** [session-6.12.7-log.md](../sessions/session-6.12.7-log.md)

**Accomplishments:**

- Moveable parts, cascades, differential scheduling, time-slot composables aligned with annotations/events changes

---

### Session 6.12.8: Relationship fetch normalization

**Log:** [session-6.12.8-log.md](../sessions/session-6.12.8-log.md)

**Accomplishments:**

- `FetchedRelationship.userTypeBlockInstanceId` naming and annotation-only population; legacy raw key support on ingest

---

## In progress

- Close phase 6.12 when remaining acceptance criteria in `phase-6.12-guide.md` are met and migrations are run in all target environments.

---

## Key decisions

| Decision | Rationale |
|----------|-----------|
| **Blocks own events** (valid allowlist + instance assignments) | Parts participate through the parent block; avoids part-as-parent for `event_assignments`. |
| **Shape-level `valid*` as multiselect** | Faster admin UX than relationship collection for allowlists; `computeRenderAs` + `collectionFieldKeys` enforce. |
| **`userTypeBlockInstanceId` only on annotation assignment fetch normalization** | Attendee assignments reuse similar raw keys for different semantics (child id). |
| **Differential role matrix: all active event shapes** | Admins expect new event shapes to appear without re-wiring `validParts` graphs. |

---

## Next steps

- [ ] Run pending DB migrations through `20260432_*` on dev/staging and verify admin “Block Shape Fields (Global)” includes **Valid Events** after `000036`.
- [ ] Mark phase complete in `phase-6.12-guide.md` / handoff when wizard + admin acceptance checks pass.
- [x] Tier harness: session guides list tasks **6.12.2.3** and **6.12.3.1**–**6.12.8.1** (see `sessions/session-6.12.*-guide.md`).

---

## Phase completion summary

*(Fill when phase closes.)*

**Sessions completed:** 6.12.1, 6.12.2, 6.12.3, 6.12.4, 6.12.5, 6.12.6, 6.12.7, 6.12.8 (retrospective)  
**Total tasks completed:** (TBD — reconcile with task tier)  
**Success criteria met:** (TBD)


## Phase Completion Summary

**Sessions Completed:** 6.12.1, 6.12.2, 6.12.3, 6.12.4, 6.12.5, 6.12.6, 6.12.7, 6.12.8
**Total Tasks Completed:** 0
**Success Criteria Met:** Yes - All success criteria met

<!-- end excerpt phase -->