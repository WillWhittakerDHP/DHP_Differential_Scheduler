# Phase 6.12 Log

**Purpose:** Track phase-level progress, decisions, and blockers

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase status

**Phase:** 6.12  
**Status:** Complete  
**Started:** 2026-03-21 (session 6.12.1)  
**Completed:** 2026-03-22  

---

## Session documentation index

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

## Completed sessions (summary)

### Session 6.12.1: Entity enhancements and annotation data layer

**Completed:** 2026-03-21  
**Tasks completed:** 6.12.1.1, 6.12.1.2, 6.12.1.3, 6.12.1.4  
**Log:** [session-6.12.1-log.md](../sessions/session-6.12.1-log.md)

- Event shape reschedule/cancel link toggles; invite context  
- Block shapes admin: entity card expansion  
- `annotation_instance_content` table, migration/backfill  
- Annotation shape delete **409** when instances reference shape  

### Sessions 6.12.2–6.12.8 (retrospective)

| Session | Theme | Log |
|---------|--------|-----|
| 6.12.2 | Annotation UI slots, wizard pipeline, assignment edges | [session-6.12.2-log.md](../sessions/session-6.12.2-log.md) |
| 6.12.3 | Admin metadata panels, `render_as`, `valid*` multiselect | [session-6.12.3-log.md](../sessions/session-6.12.3-log.md) |
| 6.12.4 | Block-level events (`valid_events`, `event_assignments`) | [session-6.12.4-log.md](../sessions/session-6.12.4-log.md) |
| 6.12.5 | Differential event roles / overrides matrix | [session-6.12.5-log.md](../sessions/session-6.12.5-log.md) |
| 6.12.6 | Event instance admin, template preview | [session-6.12.6-log.md](../sessions/session-6.12.6-log.md) |
| 6.12.7 | Booking/scheduling refinements | [session-6.12.7-log.md](../sessions/session-6.12.7-log.md) |
| 6.12.8 | `FetchedRelationship` normalization / `userTypeBlockInstanceId` | [session-6.12.8-log.md](../sessions/session-6.12.8-log.md) |

---

## Key decisions

| Decision | Rationale |
|----------|-----------|
| **Blocks own events** (valid allowlist + instance assignments) | Parts participate through the parent block; avoids part-as-parent for `event_assignments`. |
| **Shape-level `valid*` as multiselect** | Faster admin UX; `computeRenderAs` + `collectionFieldKeys` enforce. |
| **`userTypeBlockInstanceId` only on annotation assignment fetch normalization** | Attendee assignments reuse similar raw keys for different semantics (child id). |
| **Differential role matrix: all active event shapes** | New event shapes appear without re-wiring `validParts` graphs. |

---

## Next steps

- [ ] Run pending DB migrations through `20260432_*` on staging/production when promoting; verify admin “Block Shape Fields (Global)” includes **Valid Events** after `000036` where applicable.
- [ ] Re-run automated `phaseEnd('6.12','appointment-workflow')` from a **clean** `phase-6.12` tree if you still want harness merge → feature branch, audits, and PR in one pass (first attempt: stash pop conflict — see below).

---

## Phase completion summary

**Sessions completed:** 6.12.1, 6.12.2, 6.12.3, 6.12.4, 6.12.5, 6.12.6, 6.12.7, 6.12.8  
**Success criteria met:** Yes — see `phase-6.12-guide.md` (2026-03-22).

**Workflow feedback (2026-03-22):** `/phase-end 6.12` (agent-run) returned **`blocked` / `wrong_branch_before_commit`**: source stash pop conflicted on `phase-6.12`; harness recovered nine files to branch version. **Follow-up:** `git add` resolved five `deleted by us` paths; **`phase-6.12-guide.md` was overwritten to an old template** during the run — restored manually with full session list + **Complete** status. **`phase-6.12-log.md`** in repo was already a duplicated template; replaced with this file. **`client/vitest.config.ts`** reported comment-cleanup validation noise (non-blocking skip in log).
