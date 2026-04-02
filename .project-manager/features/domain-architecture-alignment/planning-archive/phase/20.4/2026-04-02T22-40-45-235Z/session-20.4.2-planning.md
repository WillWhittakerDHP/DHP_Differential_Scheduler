<!-- harness-planning-rollup tier=session id=20.4.2 consolidatedAt=2026-04-02T21:58:10.548Z -->

# Consolidated planning: session 20.4.2

## Session 20.4.2 (parent)

## Story

**This session delivers** a booking pipeline slice where block/part finals no longer depend on a dedicated **`enrichBlockFinalsWithDifferentialRoles`** stage and **PartFinal** role ternaries are removed or replaced by data tied to **event instances + placement**, **so that** later tasks (slot shape, time axis, minimizer, perspective — this session or follow-ons) align with FEATURE_20 **§4.2** target ordering and **§4.3** removals without breaking lineage or zero-out ordering.
**Estimated size:** M (two tasks; touches core `client/src/utils/booking/` paths)

---

## Analysis

- **Problem / why now:** Phase **20.4** session **20.4.1** documented the pipeline and removed only confirmed dead code. Session **20.4.2** is the first **behavioral** step toward FEATURE_20 **§4.3**: stop treating “differential role” as a separate enrichment pass on finals; express scheduling/placement from **event instances + placement data** and grouping, preserving **lineage** and **§4.4** resolution order.
- **Domain boundaries:** Primarily **booking** (`client/src/utils/booking/*`, composables/steps that consume slots). **Shared** (`@shared` placement + differential role types) may change only if booking still compiles and admin contracts remain valid. **Server** booking persistence is unchanged (no PartFinalizer on server).
- **Child tier patterns:** Prefer **replacement-before-delete**: thread placement/instance-derived inputs through the same choke points (`buildAppointmentShape` / slot builder), then remove **`enrichBlockFinalsWithDifferentialRoles`** and **`PartFinal`** role fields when grep-clean. Keep **zero-out** and lineage ordering explicit in task planning.
- **Risks:** Regressions in **AvailabilityStep** / minimizer / perspective if slot shape inputs change before consumers are updated. Mitigation: task **20.4.2.1** ends with lint + targeted manual smoke; **20.4.2.2** covers downstream layout helpers.
- **Alternatives:** Big-bang delete of `@shared/differentialRole*` — **rejected** for this session if admin and **`eventAttendeeUtils`** still need it; prefer narrow booking-path removal first, §6.2 shared cleanup when grep-clean.

## Goal

Complete **FEATURE_20 §8.4 — Pass 4 (Booking pipeline alignment)** on branch `feature/domain-architecture-alignment`: remove differential-role **pipeline** enrichment where placement + instances suffice; rewrite **grouping, slot shape, time-axis application, minimizer bounds, and perspective** inputs to use **event shapes / instances + placement**; delete or rewrite **§6.2**-listed shared paths when no longer referenced; **PartFinalizer stays client-side**.

## Files

- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (§4, §4.2–4.4, §6.2, §8.4), `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md` (§4.4 where cited), `.project-manager/ARCHITECTURE.md` §8–§14
- **PM / harness:** `phases/phase-20.4-guide.md`, `phases/phase-20.4-planning.md` (this file), `feature-domain-architecture-alignment-guide.md`, `DOMAIN_REWRITE_WORKLOG.md`
- **Implementation (expected hotspots):** `client/src/utils/booking/partFinalizer.ts`, slot/shape helpers (e.g. `partFinalizerSlotShape*`, `calculateSlotShape`, `applyShapeToTime`), `perspectiveResolver`, `minimizerSchedulingBounds` / `minimizerEventShapes`, shared `shared/**/differentialRole*` or client mirrors, booking composables that assume **major/minor/minimizer** on **PartFinal**

## Approach

1. **Map** current pipeline stages to FEATURE_20 **§4.2**; note every import of **`DifferentialRole`**, **`enrichBlockFinalsWithDifferentialRoles`**, and **PartFinal** role fields before editing.
2. **Session order:** audit + safe dead-code → **remove role enrichment / narrow PartFinal** → **slot + time axis** → **minimizer + perspective + shared cleanup** (adjust if discovery shows tighter coupling).
3. **Replacement-before-delete:** migrate call sites to **placement + instance/segment** inputs, then remove shared utilities per **§6.2** when grep is clean.
4. **Testing:** Suspended project-wide — **lint**, **typecheck**, manual booking smoke on representative wizard paths per Definition of Done.
5. After **phase-end:** update **phase-20.4-guide** checkboxes, **phase log**, **handoff** for **20.5** (or next planned phase).

## Checkpoint

- **Before `/accepted-plan`:** This **Decomposition** matches **§8.4** scope; sessions are ordered so **zero-out / grouping order** is not violated (§4.4).
- **Per session:** No new server-side PartFinalizer; lineage + zero-out ordering preserved or explicitly documented if intentionally changed (requires plan amendment).
- **Before `/phase-end 20.4`:** Grep shows no booking-pipeline **requirement** for differential-role enrichment for layout (admin may still have transitional strings — out of scope unless duplicated in booking).

## Deliverables

- Grep-backed inventory (in **task 20.4.2.1** planning or session log) of every reader of **`PartFinal.major` / `minor` / `minimizer`** and of **`enrichBlockFinalsWithDifferentialRoles`**.
- Booking pipeline updated so **`enrichBlockFinalsWithDifferentialRoles`** is removed or reduced to a no-op bridge **only** if an interim step is required (prefer full removal within the session).
- **`PartFinal`** type and **`createPartFinal`** aligned with **§4.3** (role ternaries removed or replaced by placement/segment-linked fields) **or** explicitly documented interim if two-step migration is required across 20.4.2.1 / 20.4.2.2.
- **`calculateSlotShape`**, **`applyShapeToTime`**, and related helpers updated in **20.4.2.2** to use **placement / segment** inputs rather than role flags, or task scope narrowed with explicit follow-up documented if coupling forces it.
- Client (+ server if touched) **lint** clean; **app starts**; session **log** + **handoff** updated at **session-end**.

## Acceptance Criteria

- Pipeline ordering intent matches FEATURE_20 **§4.2** / Principles **§4.4** (no new server-side finalizer; zero-out and lineage rules preserved or any intentional change documented in the task log).
- Placement semantics come from **event shape / instance data**, not a reintroduced “compute role flags then paste on PartFinal” enrichment step.
- **`grep`** shows no remaining **booking** call to **`enrichBlockFinalsWithDifferentialRoles`** after **20.4.2.1** (or documented waiver with follow-up task id).
- **Lint** passes on **`client/`** and **`server/`**; **`npm run start:dev`** starts after the session’s code changes.

---

## Task 20.4.2.1 (source: task-20.4.2.1-planning.md)

### Story

**This task removes** the **`enrichBlockFinalsWithDifferentialRoles`** stage and **PartFinal** role ternaries **because** session **20.4.1** showed slot math already uses **`getEventShapeByRoleWithOverrides`** + **`eventAssignmentsByPartShape`**, not those part-level flags — enrichment only duplicated placement → role → ternary. **Placement data remains** on event shapes and in **`eventAssignmentsByPartShape`** for **20.4.2.2** to consume exclusively.

---

### Analysis

- **Intent:** FEATURE_20 **§4.3** — delete differential-role **enrichment** on block finals; **`PartFinal.major|minor|minimizer`** removed in favor of placement/instance-driven data downstream. **20.4.2.1** = pipeline + type narrowing; **20.4.2.2** = slot/time/perspective/minimizer consumers.

### Goal

Remove **`enrichBlockFinalsWithDifferentialRoles`** from the booking pipeline and delete **`PartFinal.major` / `minor` / `minimizer`** so **§4.3** narrowing is done at the part-final type; **eventAssignmentsByPartShape** + shapes remain the source for placement-linked data into **`calculateSlotShape`**.

### Files

- `client/src/utils/booking/partFinalizer.ts`
- `client/src/utils/booking/appointmentSlotBuilder.ts`
- `client/src/utils/booking/PartFinal.ts`
- `client/src/types/booking/partFinal.ts`

### Approach

1. Edit **`partFinal.ts`** (type) and **`PartFinal.ts`** (**`createPartFinal`**) first.
2. Remove enrich function + helpers from **`partFinalizer.ts`**; drop unused imports; keep **`calculateSlotShape`** re-export.
3. Remove enrich **import** and **call** from **`appointmentSlotBuilder.ts`**.
4. **`grep`** **`client/`** for **`enrichBlockFinalsWithDifferentialRoles`** and **`PartFinal`** role fields; fix stragglers.
5. **`npm run lint`** in **`client/`**.

### Checkpoint

- **`grep`** shows **no** **`enrichBlockFinalsWithDifferentialRoles`** in **`client/`**.
- **`PartFinal`** interface has **no** role ternaries; **`client` lint** passes.

### Deliverables

- Code changes in the four files above + any compile fixes.
- No behavioral change expected for slots when overrides are empty; note in **task-end** if smoke finds otherwise.

### Acceptance Criteria

- **AC1:** **`enrichBlockFinalsWithDifferentialRoles`** and **`resolvePartShapeDifferentialFlags`** deleted from **`partFinalizer.ts`**.
- **AC2:** **`buildAppointmentShape`** does not call enrich; still passes **`eventAssignmentsByPartShape`** into **`calculateSlotShape`**.
- **AC3:** **`PartFinal`** type and **`createPartFinal`** omit **`major` / `minor` / `minimizer`**.
- **AC4:** **`cd client && npm run lint`** exits 0.

### Design

1. **`appointmentSlotBuilder.buildAppointmentShape`:** Remove the block that assigns **`nonZeroedBlockFinals = enrichBlockFinalsWithDifferentialRoles(...)`**. Keep **`eventAssignmentsByPartShape`** and **`resolvedEventShapes`** as today.
2. **`partFinalizer.ts`:** Delete **`resolvePartShapeDifferentialFlags`**, **`enrichBlockFinalsWithDifferentialRoles`**, and imports only they need. After removal, **`BlockFinal`** type import may be unused — remove if so.
3. **`client/src/types/booking/partFinal.ts`:** Remove **`major`**, **`minor`**, **`minimizer`** from **`PartFinal`**.
4. **`PartFinal.ts` (`createPartFinal`):** Remove default ternary constants and object properties.
5. Run **`cd client && npm run lint`**; fix any type errors.

---

## Task 20.4.2.2 (source: task-20.4.2.2-planning.md)

### Story

**This task changes** how booking picks **primary vs secondary** (and **minimizer/floating**) event shapes for **differential offsets**, **perspective**, and **minimizer grids** **because** FEATURE_20 requires **placement_kind** to drive layout, not **differential role** strings layered on top of placement.

---

### Analysis

- **Problem / why now:** Phase **20.4** session **20.4.1** documented the pipeline and removed only confirmed dead code. Session **20.4.2** is the first **behavioral** step toward FEATURE_20 **§4.3**: stop treating “differential role” as a separate enrichment pass on finals; express scheduling/placement from **event instances + placement data** and grouping, preserving **lineage*… _(truncated)_

### Goal

Rewrite booking **slot differential offsets**, **perspective resolution**, and **minimizer segment discovery** to select **event shapes by `placement_kind` / `anchor_edge`** (and overrides where required), not by **`'major'` / `'minor'` role string lookups** as the primary mechanism — preserving behavior for empty **`differentialEventRoleOverrides`** and existing wizard flows.

### Files

- `client/src/utils/booking/partFinalizerSlotShapeHelpers.ts`
- `client/src/utils/eventAttendeeUtils.ts`
- `client/src/utils/booking/minimizerEventShapes.ts`
- `client/src/utils/booking/perspectiveResolver.ts` (only if re-exports or thin wrappers need updates)
- `client/src/utils/booking/partFinalizerSlotShape.ts` (only if **`calculateSlotShape`** signature / imports simplify)
- Optional: `shared/utils/eventPlacementUtils.ts` — only if a **shared** pure helper reduces duplication without pulling Vue types

### Approach

1. Introduce placement-first selection used by **both** **`computeDifferentialOffsetsFromMaps`** and **`resolveDifferentialMajorMinorFromEventShapes`** (single source of truth).
2. Update **minimizer** segment listing to **placement-first** filtering; run **`cd client && npm run lint`**.
3. **Grep** **`client/src/utils/booking`** for **`getEventShapeByRoleWithOverrides`** and **`'major'`** / **`'minor'`** string literals in slot/perspective/minimizer paths; remove or narrow to tests/admin boundaries.
4. Manual smoke (advisory): availability step with differential + minimizer grid if time permits.

### Checkpoint

- Slot **differential offsets** and **perspective** pair derive from **primary/secondary** placement (or documented equivalent with overrides).
- **`minimizerEventShapes`** does not rely solely on derived role **`=== 'minimizer'`** for the default path.
- **`npm run lint`** (**`client/`**) passes.

### Deliverables

- Code updates in the files above; concise comments **WHY** placement-first (FEATURE_20 / §4.3).
- Short note in **task-end** if any behavioral nuance changed (unlikely with empty overrides).

### Acceptance Criteria

- **AC1:** **`computeDifferentialOffsetsFromMaps`** does not call **`getEventShapeByRoleWithOverrides`** with **`'major'`** / **`'minor'`** for the default selection path (placement-based selection used).
- **AC2:** **`resolveDifferentialMajorMinorFromEventShapes`** (or its replacement) uses **placement_kind**-first logic consistent with **AC1**.
- **AC3:** **Minimizer** segment enumeration uses **placement-first** rule (**`floating`**) aligned with **`differentialRoleFromPlacement`**, with overrides handled if still required.
- **AC4:** **`cd client && npm run lint`** exits 0.

### Design

1. **Shared selection helper (client):** Add a small pure module or functions (e.g. in `eventAttendeeUtils.ts` or `partFinalizerSlotShapeHelpers.ts`) that, given **`EventShapeEntity[]`** candidates and optional **`mergedRoleOverrides`**, returns **primary** (**`placementKind === 'primary'`** or default) and **secondary** (**`placementKind === 'secondary'`**) shapes using **placement fields first**, applying **`effectiveDifferentialRole`** only where overrides require parity with today’s behavior.
2. **`computeDifferentialOffsetsFromMaps`:** Replace **`getEventShapeByRoleWithOverrides(..., 'major'/'minor')`** with the placement-based helper (same duration math).
3. **`resolveDifferentialMajorMinorFromEventShapes`:** Reimplement to use the same placement-based selection so **`resolveEventShapes`** / **`applyShapeToTime`** stay consistent with slot offsets.
4. **`minimizerEventShapes`:** Prefer **`placementKind === 'floating'`** (with existing override/effective-role rules for edge cases) instead of **`effective === 'minimizer'`** as the primary filter, documenting equivalence when overrides are empty.
5. **`calculateSlotShape` / `applyShapeToTime`:** Adjust only if signatures or call sites require; avoid server-side resolution.
6. **Dead imports:** Remove **`DifferentialRole`** / role-only imports in touched files when no longer referenced; **§6.2** shared deletes only if **booking** grep is clean (admin may still import **`differentialRoleUtils`**).

---
