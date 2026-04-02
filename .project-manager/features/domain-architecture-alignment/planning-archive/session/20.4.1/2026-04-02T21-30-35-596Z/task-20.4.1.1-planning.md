# Plan: task 20.4.1.1 — Pipeline map + consumer inventory

## Contract
- **Tier:** task | **ID:** 20.4.1.1
- **Scope:** Documentation only — append **pipeline map** (current vs FEATURE_20 §4.2) and **grep-backed consumer inventory** to `session-20.4.1-log.md`. No product behavior change in this task.
- **Governance:** PM markdown only; no new `@audit-allow`.

## Work Profile
- **Execution intent:** implement (deliver log sections)
- **Gate profile:** fast

## Where we left off
Session **20.4.1** task list: first task is audit trail for phase **20.4.2–20.4.4**.

## Story

**This task delivers** a **durable map and inventory** in the session log **so that** refactors in **20.4.2+** can cite concrete files and §4.2 alignment without re-grepping blind.

## Architecture pointers

- FEATURE_20 §4.1 (current chain), §4.2 (target steps), §4.3 (removals).
- ARCHITECTURE.md §10 (PartFinalizer client-only).

## Codebase recon

- **Opened / searched:** `globalToBookingTransformer.ts`, `appointmentSlotBuilder.ts`, `partFinalizer.ts`, `partFinalizerSlotShape.ts`, `partFinalizerSlotShapeHelpers.ts`, `blockFinalizer.ts`, `PartFinal.ts`, `perspectiveResolver.ts`, `minimizerEventShapes.ts`, `eventAttendeeUtils.ts`, `InstancesPanel.vue`, `shared/utils/eventPlacementUtils.ts`, `shared/utils/differentialRoleUtils.ts`.
- **Patterns:** `buildAppointmentShape` orchestrates block/part finals, optional event assignment map, **enrichment** → **slot shape**; slot durations use **baseTime** + event instances; major/minor **offsets** use **event shape id** + override map (empty today). **PartFinal** role ternaries are **written** by enrichment but **not read** elsewhere for math (dev panel does not surface them).
- **Gaps:** Exact naming parity for §4.2 steps 2–3 vs transformer timing — documented as partial in the log table.

## Analysis

- **Why now:** Phase plan orders audit before deleting **`enrichBlockFinalsWithDifferentialRoles`**.
- **Boundaries:** `.project-manager/` only for deliverable body; read-only on `client/` / `shared/` for this task.
- **Risks:** Inventory drifts if imports move — log dated; re-grep at session-end if large refactors land same week.

## Design

Add two sections to **`session-20.4.1-log.md`**:

1. **Pipeline map** — Markdown table: current symbols ↔ §4.2 step index or “§4.3 remove / dead / downstream”; short narrative on **PartFinal** ternary **write-only** finding.
2. **Consumer inventory** — Subsections A–E: enrichment/merge call sites, client `DifferentialRole` imports, shared package, override map flow, server validation footnote.

Fix session log H1 to drop harness `** **` artifacts.

## Goal

Record authoritative **pipeline vs §4.2** and **differential-role / override / PartFinal** consumer lists in **`session-20.4.1-log.md`**.

## Files

- **Write:** `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.1-log.md`
- **Reference:** `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.1-planning.md`, `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` §4.1–4.3

## Approach

1. Normalize session log title.
2. Insert **Pipeline map** and **Consumer inventory** from verified greps + file reads.
3. Add **Task 20.4.1.1 status** checkbox completed.

## Implementation Orders

1. Replace `session-20.4.1-log.md` body with: H1 + last updated, `## Pipeline map`, `## Consumer inventory`, `## Task 20.4.1.1 status` (checked).
2. Ensure no literal backtick paths containing `*` (harness context gatherer).
3. Mark task **20.4.1.1** checkbox in `session-20.4.1-guide.md` when user runs **`/task-end`** (harness step — not in this file).

## Deliverables

- Updated **`session-20.4.1-log.md`** with both sections and status.

## Acceptance Criteria

- [ ] Log contains a **§4.2 crosswalk table** covering at least `transformGlobalToBooking` → `applyShapeToTime` and naming **enrichment** as §4.3 removal target.
- [ ] Log lists **every client file** that imports `DifferentialRole` from `@shared` (as of task execution) and **all** `enrich` / `merge` call sites.
- [ ] Log states explicitly whether **PartFinal.major/minor/minimizer** have **readers** outside enrichment (expect: **none** for slot math).

## Checkpoint

- Session **20.4.2** planning can link to this log.

## Definition of Done

- [ ] Session log updated (this task — no app code).
- [ ] Session guide task checkbox updated at **task-end** when you close **20.4.1.1**.

---

## Reference

- `sessions/session-20.4.1-guide.md`
- `.project-manager/ARCHITECTURE.md` §8–§14
- `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` §4
