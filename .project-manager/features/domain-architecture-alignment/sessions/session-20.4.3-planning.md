<!-- harness-planning-rollup tier=session id=20.4.3 consolidatedAt=2026-04-02T22:16:15.756Z -->

# Consolidated planning: session 20.4.3

## Session 20.4.3 (parent)

## Story

**This session delivers** slot-shape aggregation and time-range application that depend on **event shape placement + instances**, not parallel differential-role override maps, **so that** FEATURE_20 **§4.3** / phase **20.4** “slot + time axis” slice is consistent with **20.4.2** and easier to reason about at **`appointmentSlotBuilder`** boundaries.
**Estimated size:** M (two tasks; core `client/src/utils/booking/*`)

---

## Analysis

- **Problem / why now:** **20.4.2** moved primary/secondary selection to **placement** for offsets and UI perspective, but the **public** slot/time APIs still carry **`DifferentialRole` override** parameters, inviting drift and confusing “two sources of truth.”
- **Domain boundaries:** **Booking** client utils only (`client/src/utils/booking/*`, **`eventAttendeeUtils`**). **Server** unchanged. **@shared** `DifferentialRole` type may remain for admin; booking path should not **require** it for slot math after this session.
- **Patterns:** Keep **pure functions** in slot helpers; **explicit logger** in catch paths per project standards; **replacement-before-delete** on call sites.
- **Risks:** Subtle **time-range** bugs if **`eventFinals`** order or major/minor naming diverges from **`resolveEventShapes`**. Mitigation: small tasks, lint, manual smoke on availability slots.
- **Alternatives:** Leave parameters as no-op “reserved” — **rejected** for this session if **grep** shows no non-empty use; prefer cleaner signatures and types.

## Goal

On **`feature/domain-architecture-alignment`**, complete the **20.4.3** slice of FEATURE_20 **§8.4 / §4.3**: **slot shape** (durations, **`eventFinals`**, differential offsets) and **time-axis application** (**`applyShapeToTime`**, per-event time ranges, minor adjustment) read **placement + instances** as the source of truth; **remove or internalize** unused **`DifferentialRole` override** parameters on this path unless a documented interim bridge remains.

## Files

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

## Approach

1. **Grep** `calculateSlotShape`, `mergedRoleOverrides`, `differentialEventRoleOverrides`, `resolveEventShapes` across `client/src` before edits; list every caller.
2. **Task 20.4.3.1:** Refactor **slot shape** helpers so **`computeDifferentialOffsetsFromMaps`** / **`calculateSlotShape`** use the same placement-first selection as **20.4.2** without requiring an override map when product intent is “placement only”; shrink or delete the **`mergedRoleOverrides`** parameter if always `{}` on the booking path.
3. **Task 20.4.3.2:** Refactor **time application**: **`applyShapeToTime`** and **`resolveEventShapes`** — stop threading empty override objects if removable; ensure major/minor time range logic stays consistent with **`roundedDifferentialOffset`** and **§4.4** ordering (zero-out / lineage unchanged).
4. **Lint** client (and server if touched). **No new server PartFinalizer.** Testing suspended — manual smoke on availability slot list if time permits.

## Checkpoint

- **Before task-start:** Decomposition below covers slot API cleanup + time-axis cleanup without mixing minimizer-only work (deferred to **20.4.4** per phase guide).
- **Per task:** No silent behavior change: if overrides are removed, document any admin-only future hook in **Analysis** or keep a single explicit optional parameter with a logged no-op path per coding standards.

## Deliverables

- Updated **`calculateSlotShape`** / **`partFinalizerSlotShapeHelpers`** with clearer placement-native contract and fewer redundant parameters (or typed “placement context” if consolidation reduces arity).
- Updated **`applyShapeToTime`** (and **`perspectiveResolver`** as needed) so time ranges align with placement-native **`eventFinals`** and differential offset math.
- Short **grep notes** in **session log** or task planning (inventory of removed/changed parameters).

---

## Task 20.4.3.1 (source: task-20.4.3.1-planning.md)

### Story

**This task changes** the **`calculateSlotShape`** / **`computeDifferentialOffsetsFromMaps`** surface **because** the booking path no longer supplies differential-role overrides for slot math, and dead parameters obscure the real source of truth (**placement + event shapes**).

---

### Analysis

- **Problem / why now:** **20.4.2** moved primary/secondary selection to **placement**; **`buildAppointmentShape`** always passes **empty** overrides into **`calculateSlotShape`**, but signatures still expose **`Record<string, DifferentialRole>`**.
- **Domain boundaries:** **Booking** client utils; **`eventAttendeeUtils`** unchanged except indirect use via existing helper.

### Goal

**Task 20.4.3.1 only:** Placement-native **slot shape** API — **`calculateSlotShape`** and **`computeDifferentialOffsetsFromMaps`** no longer accept differential-role override maps; behavior unchanged for current booking data (**empty overrides**).

### Files

- `client/src/utils/booking/partFinalizerSlotShapeHelpers.ts`
- `client/src/utils/booking/partFinalizerSlotShape.ts`
- `client/src/utils/booking/appointmentSlotBuilder.ts` (**`buildAppointmentShape`** call only)

### Approach

1. Edit signatures and single call site as in **Design**.
2. Grep for **`calculateSlotShape(`** and **`mergedRoleOverrides`** after changes.
3. Lint; no server or test file changes.

### Checkpoint

- After implementation, **`grep`** shows no **`calculateSlotShape`** arity mismatch.
- **`applyShapeToTime`** / **`perspectiveResolver`** left for **20.4.3.2**.

### Deliverables

- Updated function signatures and call chain; no behavioral change for empty overrides.
- Clean imports (**`DifferentialRole`** removed from slot-shape modules if unused).

### Acceptance Criteria

- **`calculateSlotShape`** and **`computeDifferentialOffsetsFromMaps`** have no **`mergedRoleOverrides`** / **`DifferentialRole`** parameter.
- **`buildAppointmentShape`** compiles and still produces the same **`slotShape`** for representative shapes (placement-only path).
- **Client lint** passes.

### Design

Drop **`mergedRoleOverrides`** from **`calculateSlotShape`** and **`computeDifferentialOffsetsFromMaps`**. Inside **`computeDifferentialOffsetsFromMaps`**, call **`resolvePrimarySecondaryEventShapesForBooking(candidateEventShapes, undefined)`** (or omit second argument) so the placement-only path is explicit. Remove **`DifferentialRole`** imports where unused in these two modules. **`buildAppointmentShape`** stops passing the sixth argument to **`calculateSlotShape`**.

### Implementation Orders
1. **`partFinalizerSlotShapeHelpers.ts`:** Change **`computeDifferentialOffsetsFromMaps`** to accept only **`(eventRawDurations, eventRoundedDurationsByShapeId, eventShapes)`**; call **`resolvePrimarySecondaryEventShapesForBooking`** without overrides.
2. **`partFinalizerSlotShape.ts`:** Update **`calculateSlotShape`** signature and **`computeDifferentialOffsetsFromMaps`** call; remove unused imports.
3. **`appointmentSlotBuilder.ts`:** **`calculateSlotShape(...)`** — remove **`differentialEventRoleOverrides`** argument (still build **`differentialEventRoleOverrides: {}`** on **`AppointmentShape`** for **20.4.3.2**).
4. **`cd client && npm run lint`**; fix any stale references.

---

## Task 20.4.3.2 (source: task-20.4.3.2-planning.md)

### Story

**This task changes** how we build and consume **`AppointmentShape`** for time ranges and perspective **because** overrides are not used on the live booking path and omitting them matches **20.4.3.1**’s placement-only contract.

---

### Analysis

- **Problem / why now:** Empty override objects are noise; resolution already uses placement when overrides are empty/absent (**`hasNonEmptyDifferentialRoleOverrides`**).
- **Domain boundaries:** **`client/src/utils/booking/*`** composables that read **`AppointmentShape`**.

### Goal

**Task 20.4.3.2:** Booking **time axis** and **perspective** resolution use **placement-only** inputs (no empty override map on **`AppointmentShape`**, no override argument at call sites that only ever passed null/empty).

### Files

- `client/src/utils/booking/appointmentSlotBuilder.ts`
- `client/src/utils/booking/perspectiveResolver.ts`
- `client/src/utils/booking/appointmentSlotsComputeds.ts`
- `client/src/utils/booking/minimizerSchedulingBounds.ts`
- `client/src/utils/booking/minimizerEventShapes.ts`
- `client/src/utils/booking/availabilityStepData.ts`

### Approach

Grep after edits for **`differentialEventRoleOverrides`**; ensure only intentional reads remain (or none on booking hot path). Lint.

### Checkpoint

- **`applyShapeToTime`** and **`derivePerspective`** behavior unchanged for templates with no overrides (current product case).

### Deliverables

- No **`differentialEventRoleOverrides`** property on objects built by **`buildAppointmentShape`** / **`createMinimalAppointmentShapeForDuration`**.
- Call sites use single-arg resolution where overrides were always empty.

### Acceptance Criteria

- **`grep`** `differentialEventRoleOverrides` in `client/src/utils/booking` shows no **write** of `{}` on **`AppointmentShape`** from **`appointmentSlotBuilder`**; optional type remains for future use.
- **Client lint** clean.
- Session **20.4.4** / shared **`differentialRole*`** cleanup remains out of scope unless this task discovers a required coupling.

### Design

1. **`buildAppointmentShape`** / **`createMinimalAppointmentShapeForDuration`:** Stop setting **`differentialEventRoleOverrides`**. Remove unused **`DifferentialRole`** import from **`appointmentSlotBuilder.ts`** if applicable.
2. **`applyShapeToTime`:** **`resolveEventShapes(effectiveSlotShape.eventFinals)`** (single argument).
3. **`derivePerspective`:** **`resolveDifferentialMajorMinorFromEventShapes(eventShapeEntities)`** only.
4. **`appointmentSlotsComputeds`:** **`resolveDifferentialMajorMinorFromEventShapes(eventShapeEntities)`** only.
5. **`minimizerSchedulingBounds`**, **`minimizerEventShapes`**, **`availabilityStepData`:** Drop **`?? null` override argument** — call with one arg or pass **`undefined`** explicitly only if signature requires; prefer single-arg **`resolveEventShapes`** / **`resolveDifferentialMajorMinorFromEventShapes`**.
6. Leave **`resolveEventShapes(..., overrides?)`** signature in **`perspectiveResolver.ts`** for optional future callers; document in comment if needed.
7. **`client npm run lint`**.

### Implementation Orders
1. Edit **`appointmentSlotBuilder.ts`** (minimal shape + **`buildAppointmentShape`** return + **`applyShapeToTime`**).
2. Edit **`perspectiveResolver.ts`** (**`derivePerspective`** only; not required to change **`resolveEventShapes`** export signature).
3. Edit **`appointmentSlotsComputeds.ts`**, **`minimizerSchedulingBounds.ts`**, **`minimizerEventShapes.ts`**, **`availabilityStepData.ts`** as needed for single-arg calls.
4. Lint.

---
