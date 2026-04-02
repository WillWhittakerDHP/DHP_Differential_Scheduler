<!-- harness-planning-rollup tier=phase id=20.4 consolidatedAt=2026-04-02T22:40:45.235Z -->

# Consolidated planning: phase 20.4

## Phase 20.4 (parent)

## Story

**As a** maintainer of the booking experience, **I want** the client **PartFinalizer** and related slot/time/minimizer/perspective steps to read **event instances, placement, and segment grouping** instead of **differential role flags**, **so that** runtime behavior matches **ARCHITECTURE** §8–§14 and **FEATURE_20** §4 ordering without legacy role pipelines leaking into layout.

**Estimated size:** L (touches `partFinalizer`, slot shape, minimizer bounds, perspective, shared `differentialRole*` consumers)

---

## Analysis

- **Problem / why now:** **§8.4 Pass 4** explicitly targets the booking pipeline after admin (20.3) and schema/API work (20.1–20.2). `partFinalizer.ts` still exposes **`enrichBlockFinalsWithDifferentialRoles`** and uses **`eventShapeDifferentialRoleFromPlacementFields`** / **`DifferentialRole`** for downstream slot and grouping behavior. That duplicates semantics already expressed by **placement_kind / anchor_edge** and **event instance** groupings.
- **Domain boundaries:** Primarily **client booking** (`client/src/utils/booking/`, composables that consume PartFinal outputs). **Shared** changes only where types or small helpers must move or shrink (e.g. deleting or narrowing `differentialRole*` once unused). **Server** unchanged unless a bug is uncovered (document in session if any).
- **Patterns to follow:** FEATURE_20 **§4.2** ordered steps (e.g. build appointment shape → per-block parts → time/fee/event → **zero-out** → **group by event** → layout → perspective → floating windows); **§4.3** replace **PartFinal.major / minor / minimizer** role fields with **segment + placement**-driven inputs; **§4.4** preserve **zero-out before grouping** and **lineage** correlation.
- **Risks:** Subtle ordering regressions in slot layout or minimizer bounds; hidden consumers of `DifferentialRole` or `PartFinal` role fields. Prefer **vertical slices** (one pipeline stage at a time) with grep-backed deletion lists per **§6.2**.
- **Alternatives:** Keep role enrichment as a “compat layer” forever — **rejected** by §8.4 / §4.3.

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

- **Pipeline documentation** in code comments or short inline map tying major functions to **§4.2** (where helpful, not a new long doc unless PM asks).
- **PartFinal** shape and **partFinalizer** outputs aligned with **§4.3** (no reliance on **major/minor/minimizer** for layout where plan specifies segment/placement).
- **Slot shape / applyShapeToTime** (and related helpers) driven by **placement + grouped instances**, not differential role flags.
- **Perspective + minimizer** inputs updated per plan; **§6.2** items removed or rewritten when unused.
- Updated **phase-20.4-guide**, **phase-20.4-log**, **phase-20.4-handoff**; **DOMAIN_REWRITE_WORKLOG** checkpoint when material.

## Acceptance Criteria

- [ ] Booking pipeline ordering respects **§4.4** (including **zero-out** before **group-by-event** and layout steps as specified in FEATURE_20).
- [ ] **Placement** and **event instance / segment** data drive grouping and slot layout; differential-role flags are not the **source of truth** for those steps.
- [ ] **PartFinalizer** remains **client-side**; no server duplication of finalization for this scope.
- [ ] Client + server **lint** clean; app starts; new `@audit-allow` only with justification.

---

## Session 20.4.1 (source: session-20.4.1-planning.md)

### Story

**This session delivers** a **verified map** of the live booking pipeline vs FEATURE_20 **§4.2** and a **grep-backed consumer list** for differential-role and **PartFinal** layout fields, **so that** sessions **20.4.2–20.4.4** can remove or rewrite enrichment without guesswork.

**Estimated size:** M (audit + small safe edits)

---

### Analysis

- **Why now:** Phase **20.4** depends on an accurate picture before **§4.3** deletes (`PartFinal` role fields, enrichment). Skipping inventory risks breaking slot or perspective ordering.
- **Boundaries:** **Client booking** and **shared** read-only for this session except **confirmed** dead-code (e.g. remove **`mergeBlockDifferentialRoleOverrides`** if inlined). **No** server PartFinalizer. **Admin** matrix files: reference only unless a dead-code delete is zero-risk.
- **Patterns:** Keep **lineage** and **zero-out** order documented; do not reorder pipeline in this session.
- **Risks:** Mistaking “empty override map” for unused **`differentialEventRoleOverrides`** field — type and **`AppointmentShape`** consumers must stay consistent until **20.4.2+**.
- **Alternatives:** Big-bang delete of enrichment in **20.4.1** — **rejected** (phase plan defers to **20.4.2**).

### Goal

Produce an **authoritative pipeline map** (current vs §4.2) and a **consumer inventory** for differential-role and **PartFinal** layout fields; complete **only** safe dead-code cleanup that **cannot** change behavior (e.g. remove no-op **`mergeBlockDifferentialRoleOverrides`** after inlining `{}`).

### Files

- **Canonical docs:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` §4.1–4.4, `.project-manager/features/domain-architecture-alignment/phases/phase-20.4-planning.md`
- **PM:** `sessions/session-20.4.1-planning.md` (this file), `sessions/session-20.4.1-guide.md`, `sessions/session-20.4.1-log.md`
- **Implementation (audit + optional cleanup):** paths listed under **Codebase recon**

### Approach

1. **Task 20.4.1.1:** Build a **two-column table** (current function / module → §4.2 step index or “downstream / gap”) in the **session log** or a short subsection of **`DOMAIN_REWRITE_WORKLOG.md`** (team preference: default **session log** § “Pipeline map”).
2. **Task 20.4.1.1:** **Grep table** — list each file that imports **`DifferentialRole`**, calls **`enrichBlockFinalsWithDifferentialRoles`**, reads **`PartFinal.major|minor|minimizer`**, or passes **`mergedRoleOverrides` / `differentialEventRoleOverrides`**.
3. **Task 20.4.1.2:** If **`mergeBlockDifferentialRoleOverrides`** remains a no-op-only API, **inline** `{}` at the call site in **`appointmentSlotBuilder.ts`**, **remove** the export from **`partFinalizer.ts`**, re-export cleanup, run **client lint** on touched files.
4. Do **not** remove **`enrichBlockFinalsWithDifferentialRoles`** or **PartFinal** fields in this session.

### Checkpoint

- After **20.4.1.1:** Map + inventory exist; phase **20.4.2** can cite them.
- After **20.4.1.2:** Lint clean on edited files; behavior unchanged (overrides still empty object).

### Deliverables

- Session **log** (or agreed PM file) contains **pipeline map** + **consumer inventory**.
- Optional: **`mergeBlockDifferentialRoleOverrides`** removed and call site inlined — **only** if grep shows single call site and types still align.

### Acceptance Criteria

- [ ] Written **current vs §4.2** mapping covers **`buildAppointmentShape`** through **`applyShapeToTime`** and names **perspective** / **minimizer** as downstream consumers (at least by file reference).
- [ ] Inventory lists **all** `client/` + `shared/` booking-relevant **`DifferentialRole`** / **`enrichBlockFinalsWithDifferentialRoles`** / **`PartFinal` ternary** touchpoints found by search (admin-only rows may be marked “admin scope”).
- [ ] Any code deletion is **provably** no-op; **client lint** passes on touched paths.
- [ ] No change to **zero-out** order or **lineage** semantics.

---

---

## Session 20.4.2 (source: session-20.4.2-planning.md)

### Story

**This session delivers** a booking pipeline slice where block/part finals no longer depend on a dedicated **`enrichBlockFinalsWithDifferentialRoles`** stage and **PartFinal** role ternaries are removed or replaced by data tied to **event instances + placement**, **so that** later tasks (slot shape, time axis, minimizer, perspective — this session or follow-ons) align with FEATURE_20 **§4.2** target ordering and **§4.3** removals without breaking lineage or zero-out ordering.
**Estimated size:** M (two tasks; touches core `client/src/utils/booking/` paths)

---

### Analysis

- **Problem / why now:** Phase **20.4** session **20.4.1** documented the pipeline and removed only confirmed dead code. Session **20.4.2** is the first **behavioral** step toward FEATURE_20 **§4.3**: stop treating “differential role” as a separate enrichment pass on finals; express scheduling/placement from **event instances + placement data** and grouping, preserving **lineage** and **§4.4** resolution order.
- **Domain boundaries:** Primarily **booking** (`client/src/utils/booking/*`, composables/steps that consume slots). **Shared** (`@shared` placement + differential role types) may change only if booking still compiles and admin contracts remain valid. **Server** booking persistence is unchanged (no PartFinalizer on server).
- **Child tier patterns:** Prefer **replacement-before-delete**: thread placement/instance-derived inputs through the same choke points (`buildAppointmentShape` / slot builder), then remove **`enrichBlockFinalsWithDifferentialRoles`** and **`PartFinal`** role fields when grep-clean. Keep **zero-out** and lineage ordering explicit in task planning.
- **Risks:** Regressions in **AvailabilityStep** / minimizer / perspective if slot shape inputs change before consumers are updated. Mitigation: task **20.4.2.1** ends with lint + targeted manual smoke; **20.4.2.2** covers downstream layout helpers.
- **Alternatives:** Big-bang delete of `@shared/differentialRole*` — **rejected** for this session if admin and **`eventAttendeeUtils`** still need it; prefer narrow booking-path removal first, §6.2 shared cleanup when grep-clean.

### Goal

Complete **FEATURE_20 §8.4 — Pass 4 (Booking pipeline alignment)** on branch `feature/domain-architecture-alignment`: remove differential-role **pipeline** enrichment where placement + instances suffice; rewrite **grouping, slot shape, time-axis application, minimizer bounds, and perspective** inputs to use **event shapes / instances + placement**; delete or rewrite **§6.2**-listed shared paths when no longer referenced; **PartFinalizer stays client-side**.

### Files

- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (§4, §4.2–4.4, §6.2, §8.4), `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md` (§4.4 where cited), `.project-manager/ARCHITECTURE.md` §8–§14
- **PM / harness:** `phases/phase-20.4-guide.md`, `phases/phase-20.4-planning.md` (this file), `feature-domain-architecture-alignment-guide.md`, `DOMAIN_REWRITE_WORKLOG.md`
- **Implementation (expected hotspots):** `client/src/utils/booking/partFinalizer.ts`, slot/shape helpers (e.g. `partFinalizerSlotShape*`, `calculateSlotShape`, `applyShapeToTime`), `perspectiveResolver`, `minimizerSchedulingBounds` / `minimizerEventShapes`, shared `shared/**/differentialRole*` or client mirrors, booking composables that assume **major/minor/minimizer** on **PartFinal**

### Approach

1. **Map** current pipeline stages to FEATURE_20 **§4.2**; note every import of **`DifferentialRole`**, **`enrichBlockFinalsWithDifferentialRoles`**, and **PartFinal** role fields before editing.
2. **Session order:** audit + safe dead-code → **remove role enrichment / narrow PartFinal** → **slot + time axis** → **minimizer + perspective + shared cleanup** (adjust if discovery shows tighter coupling).
3. **Replacement-before-delete:** migrate call sites to **placement + instance/segment** inputs, then remove shared utilities per **§6.2** when grep is clean.
4. **Testing:** Suspended project-wide — **lint**, **typecheck**, manual booking smoke on representative wizard paths per Definition of Done.
5. After **phase-end:** update **phase-20.4-guide** checkboxes, **phase log**, **handoff** for **20.5** (or next planned phase).

### Checkpoint

- **Before `/accepted-plan`:** This **Decomposition** matches **§8.4** scope; sessions are ordered so **zero-out / grouping order** is not violated (§4.4).
- **Per session:** No new server-side PartFinalizer; lineage + zero-out ordering preserved or explicitly documented if intentionally changed (requires plan amendment).
- **Before `/phase-end 20.4`:** Grep shows no booking-pipeline **requirement** for differential-role enrichment for layout (admin may still have transitional strings — out of scope unless duplicated in booking).

### Deliverables

- Grep-backed inventory (in **task 20.4.2.1** planning or session log) of every reader of **`PartFinal.major` / `minor` / `minimizer`** and of **`enrichBlockFinalsWithDifferentialRoles`**.
- Booking pipeline updated so **`enrichBlockFinalsWithDifferentialRoles`** is removed or reduced to a no-op bridge **only** if an interim step is required (prefer full removal within the session).
- **`PartFinal`** type and **`createPartFinal`** aligned with **§4.3** (role ternaries removed or replaced by placement/segment-linked fields) **or** explicitly documented interim if two-step migration is required across 20.4.2.1 / 20.4.2.2.
- **`calculateSlotShape`**, **`applyShapeToTime`**, and related helpers updated in **20.4.2.2** to use **placement / segment** inputs rather than role flags, or task scope narrowed with explicit follow-up documented if coupling forces it.
- Client (+ server if touched) **lint** clean; **app starts**; session **log** + **handoff** updated at **session-end**.

### Acceptance Criteria

- Pipeline ordering intent matches FEATURE_20 **§4.2** / Principles **§4.4** (no new server-side finalizer; zero-out and lineage rules preserved or any intentional change documented in the task log).
- Placement semantics come from **event shape / instance data**, not a reintroduced “compute role flags then paste on PartFinal” enrichment step.
- **`grep`** shows no remaining **booking** call to **`enrichBlockFinalsWithDifferentialRoles`** after **20.4.2.1** (or documented waiver with follow-up task id).
- **Lint** passes on **`client/`** and **`server/`**; **`npm run start:dev`** starts after the session’s code changes.

---

---

## Session 20.4.3 (source: session-20.4.3-planning.md)

### Story

**This session delivers** slot-shape aggregation and time-range application that depend on **event shape placement + instances**, not parallel differential-role override maps, **so that** FEATURE_20 **§4.3** / phase **20.4** “slot + time axis” slice is consistent with **20.4.2** and easier to reason about at **`appointmentSlotBuilder`** boundaries.
**Estimated size:** M (two tasks; core `client/src/utils/booking/*`)

---

### Analysis

- **Problem / why now:** **20.4.2** moved primary/secondary selection to **placement** for offsets and UI perspective, but the **public** slot/time APIs still carry **`DifferentialRole` override** parameters, inviting drift and confusing “two sources of truth.”
- **Domain boundaries:** **Booking** client utils only (`client/src/utils/booking/*`, **`eventAttendeeUtils`**). **Server** unchanged. **@shared** `DifferentialRole` type may remain for admin; booking path should not **require** it for slot math after this session.
- **Patterns:** Keep **pure functions** in slot helpers; **explicit logger** in catch paths per project standards; **replacement-before-delete** on call sites.
- **Risks:** Subtle **time-range** bugs if **`eventFinals`** order or major/minor naming diverges from **`resolveEventShapes`**. Mitigation: small tasks, lint, manual smoke on availability slots.
- **Alternatives:** Leave parameters as no-op “reserved” — **rejected** for this session if **grep** shows no non-empty use; prefer cleaner signatures and types.

### Goal

On **`feature/domain-architecture-alignment`**, complete the **20.4.3** slice of FEATURE_20 **§8.4 / §4.3**: **slot shape** (durations, **`eventFinals`**, differential offsets) and **time-axis application** (**`applyShapeToTime`**, per-event time ranges, minor adjustment) read **placement + instances** as the source of truth; **remove or internalize** unused **`DifferentialRole` override** parameters on this path unless a documented interim bridge remains.

### Files

- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (**§4.2–4.4**, **§8.4**), `.project-manager/ARCHITECTURE.md` §8–§14
- **PM:** `phases/phase-20.4-guide.md`, `sessions/session-20.4.3-guide.md`, `sessions/session-20.4.2-handoff.md`
- **Implementation (verified / expected):**
  - `client/src/utils/booking/partFinalizerSlotShape.ts` — **`calculateSlotShape`**
  - `client/src/utils/booking/partFinalizerSlotShapeHelpers.ts` — durations, **`computeDifferentialOffsetsFromMaps`**, **`resolvePrimarySecondaryEventShapesForBooking`**
  - `client/src/utils/booking/appointmentSlotBuilder.ts` — **`buildAppointmentShape`**, **`applyShapeToTime`**
  - `client/src/utils/booking/slotShapeLookups.ts` — **`createTimeRangesFromSlotShape`**
  - `client/src/utils/booking/perspectiveResolver.ts` — **`resolveEventShapes`**, **`adjustMinorTimeRange`**
  - `client/src/utils/eventAttendeeUtils.ts` — primary/secondary resolution (shared with minimizer; avoid regressions)
  - Callers: `appointmentTimeCalculations.ts`, `appointmentSlotsComputeds.ts` (smoke paths)

### Approach

1. **Grep** `calculateSlotShape`, `mergedRoleOverrides`, `differentialEventRoleOverrides`, `resolveEventShapes` across `client/src` before edits; list every caller.
2. **Task 20.4.3.1:** Refactor **slot shape** helpers so **`computeDifferentialOffsetsFromMaps`** / **`calculateSlotShape`** use the same placement-first selection as **20.4.2** without requiring an override map when product intent is “placement only”; shrink or delete the **`mergedRoleOverrides`** parameter if always `{}` on the booking path.
3. **Task 20.4.3.2:** Refactor **time application**: **`applyShapeToTime`** and **`resolveEventShapes`** — stop threading empty override objects if removable; ensure major/minor time range logic stays consistent with **`roundedDifferentialOffset`** and **§4.4** ordering (zero-out / lineage unchanged).
4. **Lint** client (and server if touched). **No new server PartFinalizer.** Testing suspended — manual smoke on availability slot list if time permits.

### Checkpoint

- **Before task-start:** Decomposition below covers slot API cleanup + time-axis cleanup without mixing minimizer-only work (deferred to **20.4.4** per phase guide).
- **Per task:** No silent behavior change: if overrides are removed, document any admin-only future hook in **Analysis** or keep a single explicit optional parameter with a logged no-op path per coding standards.

### Deliverables

- Updated **`calculateSlotShape`** / **`partFinalizerSlotShapeHelpers`** with clearer placement-native contract and fewer redundant parameters (or typed “placement context” if consolidation reduces arity).
- Updated **`applyShapeToTime`** (and **`perspectiveResolver`** as needed) so time ranges align with placement-native **`eventFinals`** and differential offset math.
- Short **grep notes** in **session log** or task planning (inventory of removed/changed parameters).

---

---

## Session 20.4.4 (source: session-20.4.4-planning.md)

### Story

**This session delivers** a single coherent **perspective + minimizer** story and **safe** shared **`differentialRole*`** pruning **so that** phase **20.4** closes without dead API surface and without breaking admin placement UI or **`@shared`** contracts still referenced by server/client.
**Estimated size:** M (two tasks; booking utils + shared grep)

---

### Analysis

- **Why now:** **20.4.3** cleared override **threading**; this session removes **dead API** and dedupes **perspective** resolution.
- **Boundaries:** **`client/src/utils/booking/*`** first; **`@shared`** edits only with **full-repo grep** (client + server importers).
- **Risks:** Deleting **`shared/types/differentialRole`** or **`differentialRoleUtils`** wholesale — **rejected**; admin (**`DifferentialEventRoleOverridesField`**) and **`eventPlacementUtils`** still use role **template** mapping.

### Goal

Close **phase 20.4** session **4**: perspective API matches **placement-only** booking; **no dead `resolveEventShapes` parameters**; **§6.2**-style shared pruning **grep-gated**; **admin** + **server** contracts preserved.

### Files

- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (**§6.2**, **§8.4**)
- **PM:** `phases/phase-20.4-guide.md`, `sessions/session-20.4.4-guide.md`, `sessions/session-20.4.3-handoff.md`
- **Implementation:** `client/src/utils/booking/perspectiveResolver.ts`; `client/src/utils/booking/minimizerEventShapes.ts`; `shared/utils/differentialRoleUtils.ts`, `shared/constants/differentialRoleMappings.ts`, `shared/types/differentialRole*` — **only if grep-clean**

### Approach

1. Run **20.4.4.1** then **20.4.4.2**; **`vue-tsc`** + **`npm run lint`** (`client/`) per task; **server lint** if **shared/** or **server/** touched.
2. **Grep-before-delete** for any **shared** removal.

### Checkpoint

- **Perspective** / slot **end-time** behavior unchanged for **no-override** templates.
- **Admin** **`DifferentialEventRoleOverridesField`** and block-instance saves unaffected.

### Deliverables

- Updated **`perspectiveResolver`** (+ any import fixes).
- Minimizer / **`@shared`** outcomes per task **20.4.4.2** with grep notes.

### Design

- **Task 1:** **`perspectiveResolver`:** Remove **`overrides`** from **`resolveEventShapes`**; implement **`derivePerspective`** via **`resolveEventShapes(eventFinals)`** + **`derivePerspectiveWithResolved`** to avoid duplicate **`resolveDifferentialMajorMinorFromEventShapes`**.
- **Task 2:** **`minimizerEventShapes`** + **`@shared` `differentialRole*`** — grep-first: simplify minimizer legacy path **only** if no writers / no payload risk; else **document deferral**; remove **only** **unreferenced** shared symbols.

---

---
