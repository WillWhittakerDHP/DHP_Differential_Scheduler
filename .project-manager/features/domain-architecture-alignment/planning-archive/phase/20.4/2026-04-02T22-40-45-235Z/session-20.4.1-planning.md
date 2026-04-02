<!-- harness-planning-rollup tier=session id=20.4.1 consolidatedAt=2026-04-02T21:30:35.596Z -->

# Consolidated planning: session 20.4.1

## Session 20.4.1 (parent)

## Story

**This session delivers** a **verified map** of the live booking pipeline vs FEATURE_20 **§4.2** and a **grep-backed consumer list** for differential-role and **PartFinal** layout fields, **so that** sessions **20.4.2–20.4.4** can remove or rewrite enrichment without guesswork.

**Estimated size:** M (audit + small safe edits)

---

## Analysis

- **Why now:** Phase **20.4** depends on an accurate picture before **§4.3** deletes (`PartFinal` role fields, enrichment). Skipping inventory risks breaking slot or perspective ordering.
- **Boundaries:** **Client booking** and **shared** read-only for this session except **confirmed** dead-code (e.g. remove **`mergeBlockDifferentialRoleOverrides`** if inlined). **No** server PartFinalizer. **Admin** matrix files: reference only unless a dead-code delete is zero-risk.
- **Patterns:** Keep **lineage** and **zero-out** order documented; do not reorder pipeline in this session.
- **Risks:** Mistaking “empty override map” for unused **`differentialEventRoleOverrides`** field — type and **`AppointmentShape`** consumers must stay consistent until **20.4.2+**.
- **Alternatives:** Big-bang delete of enrichment in **20.4.1** — **rejected** (phase plan defers to **20.4.2**).

## Goal

Produce an **authoritative pipeline map** (current vs §4.2) and a **consumer inventory** for differential-role and **PartFinal** layout fields; complete **only** safe dead-code cleanup that **cannot** change behavior (e.g. remove no-op **`mergeBlockDifferentialRoleOverrides`** after inlining `{}`).

## Files

- **Canonical docs:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` §4.1–4.4, `.project-manager/features/domain-architecture-alignment/phases/phase-20.4-planning.md`
- **PM:** `sessions/session-20.4.1-planning.md` (this file), `sessions/session-20.4.1-guide.md`, `sessions/session-20.4.1-log.md`
- **Implementation (audit + optional cleanup):** paths listed under **Codebase recon**

## Approach

1. **Task 20.4.1.1:** Build a **two-column table** (current function / module → §4.2 step index or “downstream / gap”) in the **session log** or a short subsection of **`DOMAIN_REWRITE_WORKLOG.md`** (team preference: default **session log** § “Pipeline map”).
2. **Task 20.4.1.1:** **Grep table** — list each file that imports **`DifferentialRole`**, calls **`enrichBlockFinalsWithDifferentialRoles`**, reads **`PartFinal.major|minor|minimizer`**, or passes **`mergedRoleOverrides` / `differentialEventRoleOverrides`**.
3. **Task 20.4.1.2:** If **`mergeBlockDifferentialRoleOverrides`** remains a no-op-only API, **inline** `{}` at the call site in **`appointmentSlotBuilder.ts`**, **remove** the export from **`partFinalizer.ts`**, re-export cleanup, run **client lint** on touched files.
4. Do **not** remove **`enrichBlockFinalsWithDifferentialRoles`** or **PartFinal** fields in this session.

## Checkpoint

- After **20.4.1.1:** Map + inventory exist; phase **20.4.2** can cite them.
- After **20.4.1.2:** Lint clean on edited files; behavior unchanged (overrides still empty object).

## Deliverables

- Session **log** (or agreed PM file) contains **pipeline map** + **consumer inventory**.
- Optional: **`mergeBlockDifferentialRoleOverrides`** removed and call site inlined — **only** if grep shows single call site and types still align.

## Acceptance Criteria

- [ ] Written **current vs §4.2** mapping covers **`buildAppointmentShape`** through **`applyShapeToTime`** and names **perspective** / **minimizer** as downstream consumers (at least by file reference).
- [ ] Inventory lists **all** `client/` + `shared/` booking-relevant **`DifferentialRole`** / **`enrichBlockFinalsWithDifferentialRoles`** / **`PartFinal` ternary** touchpoints found by search (admin-only rows may be marked “admin scope”).
- [ ] Any code deletion is **provably** no-op; **client lint** passes on touched paths.
- [ ] No change to **zero-out** order or **lineage** semantics.

---

## Task 20.4.1.1 (source: task-20.4.1.1-planning.md)

### Story

**This task delivers** a **durable map and inventory** in the session log **so that** refactors in **20.4.2+** can cite concrete files and §4.2 alignment without re-grepping blind.

### Analysis

- **Why now:** Phase plan orders audit before deleting **`enrichBlockFinalsWithDifferentialRoles`**.
- **Boundaries:** `.project-manager/` only for deliverable body; read-only on `client/` / `shared/` for this task.
- **Risks:** Inventory drifts if imports move — log dated; re-grep at session-end if large refactors land same week.

### Goal

Record authoritative **pipeline vs §4.2** and **differential-role / override / PartFinal** consumer lists in **`session-20.4.1-log.md`**.

### Files

- **Write:** `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.1-log.md`
- **Reference:** `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.1-planning.md`, `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` §4.1–4.3

### Approach

1. Normalize session log title.
2. Insert **Pipeline map** and **Consumer inventory** from verified greps + file reads.
3. Add **Task 20.4.1.1 status** checkbox completed.

### Checkpoint

- Session **20.4.2** planning can link to this log.

### Deliverables

- Updated **`session-20.4.1-log.md`** with both sections and status.

### Acceptance Criteria

- [ ] Log contains a **§4.2 crosswalk table** covering at least `transformGlobalToBooking` → `applyShapeToTime` and naming **enrichment** as §4.3 removal target.
- [ ] Log lists **every client file** that imports `DifferentialRole` from `@shared` (as of task execution) and **all** `enrich` / `merge` call sites.
- [ ] Log states explicitly whether **PartFinal.major/minor/minimizer** have **readers** outside enrichment (expect: **none** for slot math).

### Design

Add two sections to **`session-20.4.1-log.md`**:

1. **Pipeline map** — Markdown table: current symbols ↔ §4.2 step index or “§4.3 remove / dead / downstream”; short narrative on **PartFinal** ternary **write-only** finding.
2. **Consumer inventory** — Subsections A–E: enrichment/merge call sites, client `DifferentialRole` imports, shared package, override map flow, server validation footnote.

Fix session log H1 to drop harness `** **` artifacts.

---

## Task 20.4.1.2 (source: task-20.4.1.2-planning.md)

### Story

**This task removes** a dead **`mergeBlockDifferentialRoleOverrides`** export **because** block-level differential overrides are gone and the function always returned `{}`, adding noise before phase **20.4.2** refactors.

### Analysis

- **Risk:** Low — single call site; types unchanged on `AppointmentShape`.
- **Out of scope:** `enrichBlockFinalsWithDifferentialRoles`, `PartFinal` ternaries (session **20.4.2**).

### Goal

Remove dead merge helper; keep runtime output identical.

### Files

- `client/src/utils/booking/appointmentSlotBuilder.ts`
- `client/src/utils/booking/partFinalizer.ts`
- `sessions/session-20.4.1-log.md` (inventory note only)

### Checkpoint

- Session **20.4.1** can proceed to **`/session-end`** after both tasks closed.

### Deliverables

- No `mergeBlockDifferentialRoleOverrides` symbol in `client/src`.
- Lint clean on touched client files.

### Acceptance Criteria

- [x] Grep shows **zero** `mergeBlockDifferentialRoleOverrides` under `client/`.
- [x] `buildAppointmentShape` still passes an empty `Record<string, DifferentialRole>` into `calculateSlotShape`.
- [x] Client lint passes.

### Design

1. In **`appointmentSlotBuilder.ts`**: import `DifferentialRole` from `@shared`; set `const differentialEventRoleOverrides: Record<string, DifferentialRole> = {}`; drop `mergeBlockDifferentialRoleOverrides` import.
2. In **`partFinalizer.ts`**: delete `mergeBlockDifferentialRoleOverrides` and its JSDoc block.
3. Refresh **`session-20.4.1-log.md`** inventory lines that name the merge function as live code (mark as removed in **20.4.1.2**).

---
