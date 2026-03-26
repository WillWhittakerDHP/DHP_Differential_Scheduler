<!-- harness-planning-rollup tier=session id=6.16.2 consolidatedAt=2026-03-25T22:30:52.642Z -->

# Consolidated planning: session 6.16.2

## Session 6.16.2 (parent)

## Story

**This session delivers** ordered **multi-minimizer** scheduling (detect all minimizer-role event shapes, chain segment boundaries) **so that** appointments with more than one minimizer-shaped block can pick completion windows in sequence without breaking slot math or the availability sub-step.

**Estimated size:** M (two tasks: utilities/types first, then composable + orchestrator wiring).

---

## Analysis

- **Problem / why now:** `useMoveablePartsScheduling` uses `getEventShapeByRoleWithOverrides(..., 'moveable', …)` and effectively assumes **at most one** minimizer-role shape. Product intent (phase guide) requires **multiple** minimizer segments with **sequential inner/outer boundary chaining**. Margin (`minimizer: 'override'`) is **not** the same path — it stays pre-major; this session focuses on **`minimizer: 'true'`** shapes (still stored as role `moveable` until rename tranche).

- **Domain boundaries:** **Booking / wizard** — `client/src/composables/booking/*`, `client/src/utils/booking/*`, `client/src/utils/eventAttendeeUtils.ts`, `client/src/types/moveableScheduling*`. **Shared** — only if a new exported helper belongs next to `effectiveDifferentialRole` (prefer client-side first unless both sides need it). See [.project-manager/ARCHITECTURE.md](.project-manager/ARCHITECTURE.md) §2–4.

- **Patterns:** Keep **thin components**; push ordering and boundary math into **named utilities** with explicit return types. Reuse `buildMoveableSchedulingWindow`, `applyMoveableWindowToComputedSlots`, `computeOuterBoundary` / `extractInnerBoundary` where possible; extend rather than fork.

- **Ordering source of truth:** Prefer **stable order** from `appointmentShape.slotShape.eventFinals` (array index) for multiple shapes that resolve to minimizer role after overrides — document if product later needs explicit sort keys.

- **Risks:** Modal UX for “pick segment 1 then segment 2” vs single modal — may stay **single flow** with internal iteration; avoid silent collapse to first shape only. **No** DB migration in this session unless unavoidable (defer enum rename to 6.16.3).

- **Alternatives:** Full rename `useMoveablePartsScheduling` → `useMinimizerPartsScheduling` in this session — **deferred** to mechanical pass / 6.16.3 unless trivial re-export alias is needed for clarity.

- **Out of scope for 6.16.2:** Google Calendar split, persistence/API checklist (6.16.3); mechanical `moveable` → `minimizer` identifier rename across repo.

---

## Goal

1. Detect **all** event shapes whose **effective** differential role is the minimizer storage role (`moveable` today) in **deterministic order**.
2. Introduce **segment-level** types/helpers so each segment has duration, boundaries, and optional labels without duplicating logic per segment.
3. Refactor **scheduling composable** (and **availability orchestrator / sub-step** wiring) so multiple segments chain **outer → inner** boundaries correctly and the user flow still validates against governance (explicit return types on exported composables).

---

## Files

| Area | Paths |
|------|--------|
| Role / shape resolution | `client/src/utils/eventAttendeeUtils.ts` (or new `client/src/utils/booking/minimizerEventShapes.ts` if file grows) |
| Bounds / window | `client/src/utils/booking/moveableSchedulingBounds.ts`, `applyMoveableWindowToComputedSlots.ts` (only if API must widen) |
| Types | `client/src/types/moveableScheduling.ts`, optional `client/src/types/booking/minimizerSegment.ts` |
| Composable | `client/src/composables/booking/useMoveablePartsScheduling.ts` |
| Orchestrator / sub-step | `client/src/composables/booking/useAvailabilityOrchestrator.ts`, `useAvailabilitySubStepContent.ts` (minimal wiring only) |
| Reference | [phase-6.16-guide.md](../phases/phase-6.16-guide.md), [session-6.16.2-guide.md](session-6.16.2-guide.md) |

---

## Approach

1. **Utilities first:** Implement `getMinimizerEventShapesOrdered` (name TBD) returning `EventShapeEntity[]` filtered by `effectiveDifferentialRole === 'moveable'` (storage), ordered by `eventFinals` index. Add typed **segment descriptor** (id, duration, display name) built from each shape.
2. **Boundaries:** For each segment after the first, treat **previous segment’s outer boundary** as constraint for the next **inner** range; document invariants in a short comment block near the chain function.
3. **Composable:** Replace single `moveableEventFinal` with **list**; derive `moveableOptions` / slots per active segment or a stepped index — smallest change that preserves existing modal + stepper behavior when `length === 1`.
4. **Orchestrator:** Pass through any new refs/computed needed by the availability sub-step; no new cross-domain imports from admin.

---

## Checkpoint

- With **two** minimizer-role shapes on a test appointment template, scheduling logic considers **both** in order (no silent drop).
- **One-shape** appointments behave as today (regression).
- Client lint clean for touched files; `npm run start:dev` starts.

---

## Deliverables

- Ordered multi-minimizer detection utility (+ types).
- Composable supports sequential multi-segment boundary chaining.
- Orchestrator / sub-step wired so the wizard availability step receives correct data.
- Session log + handoff updated at session-end.

---

## Acceptance Criteria

- [ ] Phase 6.16 guide intent for **6.16.2** satisfied: multi-minimizer detection + composable + orchestrator wiring.
- [ ] No silent fallback when multiple minimizer shapes exist.
- [ ] Client lint passes; app starts.
- [ ] Session guide tasks 6.16.2.1 / 6.16.2.2 align with this decomposition (update guide at task-start if labels differ).

---

---

## Task 6.16.2.1 (source: task-6.16.2.1-planning.md)

### Story

**This task adds** `listMinimizerSegmentsFromAppointmentShape` (name may be finalized) **and** `MinimizerSegmentDescriptor` **because** `getEventShapeByRoleWithOverrides(..., 'moveable')` only returns **one** shape while templates can contain **multiple** event finals whose **effective** role is minimizer storage (`moveable`). Task **6.16.2.2** will consume the ordered list without re-implementing role resolution.

---

### Analysis

- **Problem:** `resolveEventShapeEntityForRole` uses `Array.find` → first match only. Scheduling needs **every** `eventFinal` whose `effectiveDifferentialRole(...) === 'moveable'`, in **array index order** (phase guide: sequential boundaries).
- **Boundaries:** **Booking / client utils only** — `client/src/utils/booking/*`, optional `client/src/types/booking/*`. Uses `@shared/utils/differentialRoleUtils.effectiveDifferentialRole` and `DifferentialRoleStorage` — **no** server changes.
- **Data source:** `AppointmentShape.slotShape.eventFinals` — each `EventFinal` has `eventShape`, `rawDuration`, `roundedDuration` ([`appointmentModels.ts`](../../../../client/src/types/appointmentModels.ts)).
- **Not included:** Margin (`margin` → `minimizer: 'override'` on `PartFinal`) is a **different** scheduling path; this helper filters by **storage** role **`moveable`** only (minimizer **completion window** segment).
- **Risks:** `EventShape` (wizard model) vs `EventShapeEntity` (admin) — composable today casts `eventShape` to `EventShapeEntity`; keep **one** representation in the descriptor that matches what `getMoveablePartShapeName` / composable expect (document in Design).
- **Tests:** Project policy — **no new test files**; verify via `npm run lint` and manual reasoning.

---

### Goal

Ship **ordered** minimizer-segment descriptors for an `AppointmentShape`, suitable for task **6.16.2.2** to chain boundaries in the composable.

---

### Files

| Action | Path |
|--------|------|
| Add | `client/src/utils/booking/minimizerEventShapes.ts` |
| Add | `client/src/types/booking/minimizerSegment.ts` (optional if types stay inline — prefer single file if &lt; ~80 lines total) |
| Reference only | `client/src/types/appointmentModels.ts`, `@shared/utils/differentialRoleUtils.ts` |

**Not in this task:** `useMoveablePartsScheduling.ts`, `useAvailabilityOrchestrator.ts` (6.16.2.2).

---

### Approach

1. Add types + `listMinimizerSegmentsFromAppointmentShape` with explicit return type.
2. Export from `minimizerEventShapes.ts`; avoid default export.
3. `cd client && npm run lint` on touched files.
4. **Do not** wire the composable yet (prevents scope creep into 6.16.2.2).

---

### Checkpoint

- Lint clean; no new audit P0 on touched files.
- Descriptor list length matches count of `eventFinals` with effective role `moveable`, in index order.

---

### Deliverables

- [ ] `MinimizerSegmentDescriptor` (or equivalent) exported from booking utils/types.
- [ ] `listMinimizerSegmentsFromAppointmentShape` implemented and exported.
- [ ] JSDoc invariants documented.

---

### Acceptance Criteria

- [ ] **0** shapes → `[]`; **1** minimizer final → length **1**; **N** minimizer finals → length **N**, order matches `eventFinals` iteration order.
- [ ] Finals with effective role **major** / **minor** / **margin** / **none** are **not** included unless they resolve to **`moveable`** (verify with override mental examples).
- [ ] No composable changes in this PR scope.

---

### Design

1. **New module** (preferred over bloating [`eventAttendeeUtils.ts`](../../../../client/src/utils/eventAttendeeUtils.ts)): `client/src/utils/booking/minimizerEventShapes.ts`.
2. **Exported type** `MinimizerSegmentDescriptor` (exact fields TBD in implementation, minimally):
   - `orderIndex: number` — index into `slotShape.eventFinals` (stable ordering).
   - `eventShapeId: string` — `String(eventFinal.eventShape.id)` (or branded id helper if project standard).
   - `rawDurationMinutes: number` / `roundedDurationMinutes: number` — from `EventFinal` (confirm units match existing moveable duration usage in [`useMoveablePartsScheduling`](../../../../client/src/composables/booking/useMoveablePartsScheduling.ts)).
   - `eventShape: EventShape` — reference for callers that need entity fields without re-fetching.
3. **Exported function** `listMinimizerSegmentsFromAppointmentShape(shape: AppointmentShape): MinimizerSegmentDescriptor[]`:
   - Read `shape.differentialEventRoleOverrides`.
   - For each `eventFinal` in `shape.slotShape.eventFinals` **in order**, compute `effectiveDifferentialRole(eventShapeId, templateRole, overrides)`.
   - If effective role **`=== 'moveable'`** (the only `DifferentialRoleStorage` value for minimizer segment in DB today), **push** descriptor; else skip.
   - Return **empty** array if none; **N** entries if N finals qualify.
4. **JSDoc:** One block stating ordering invariant (eventFinals index order) and that **`margin`** is excluded by definition of this helper.

**Optional:** thin re-export or wrapper in `eventAttendeeUtils.ts` **only if** we want a single import surface — default **no** to avoid churn.

---

---

## Task 6.16.2.2 (source: task-6.16.2.2-planning.md)

### Story

**This task changes** `useMinimizerPartsScheduling` (and minimal orchestrator / sub-step wiring) **because** 6.16.2.1 only added **pure** listing of segments; the composable still resolves **one** minimizer final via `getEventShapeByRoleWithOverrides` (first match) and derives a single `minimizerDuration` / options pipeline. Product requires **N** minimizer segments to participate in scheduling math and UI without dropping later segments.

---

### Analysis

- **Problem:** `minimizerEventFinal` and downstream duration/slots assume **at most one** minimizer `EventFinal`, even though `listMinimizerSegmentsFromAppointmentShape` can return **N** descriptors.
- **Domain:** Booking / wizard only (`client/src/composables/booking/*`, `client/src/utils/booking/*`). No new `@shared` unless both client and server need the same contract (prefer client types co-located with composable per ARCHITECTURE §4).
- **Dependencies:** Reuse `listMinimizerSegmentsFromAppointmentShape`, `buildMinimizerSchedulingWindow`, `applyMinimizerWindowToComputedSlots`, `computeOuterBoundary` / `extractInnerBoundary` from `minimizerSchedulingBounds` / `applyMinimizerWindowToComputedSlots` — extend signatures or add **named helpers** instead of duplicating window math.
- **Risks:** Regressing **single-segment** templates (must behave as today). UX for **multi-segment** may stay a **single step-4 flow** with internal segment index or combined window — avoid scope creep into full multi-modal UX unless required for AC.
- **Orchestrator:** `useAvailabilityOrchestratorSlotsPhase` bundles `useMinimizerPartsScheduling`; sub-step content consumes `minimizerOptions`, `minimizerSchedulingWindow`, etc. — extend only if new refs/computed are required (e.g. segment count, active segment index).

---

### Goal

1. **Composable** uses ordered **segment list** from `minimizerEventShapes.ts` — no silent “first minimizer only.”
2. **Sequential** inner/outer boundaries across segments are **correct** for multi-segment templates (document invariants).
3. **Single-segment** templates: **parity** with pre–6.16.2.2 behavior (lint + manual smoke).
4. **Orchestrator / sub-step:** wired so step 4 / confirm does not break when `segments.length > 1`.

---

### Files

| Area | Paths |
|------|--------|
| Segments (read-only) | `client/src/utils/booking/minimizerEventShapes.ts` (only if helper API must widen) |
| Composable | `client/src/composables/booking/useMinimizerPartsScheduling.ts` |
| Availability data | `client/src/composables/booking/useMinimizerAvailabilityData.ts`, `useMinimizerAvailabilityDataCore.ts` — if fetch/options depend on single duration |
| Bounds / window | `client/src/utils/booking/minimizerSchedulingBounds.ts`, `applyMinimizerWindowToComputedSlots.ts` — if chaining needs new parameters |
| Types | `client/src/types/minimizerScheduling.ts`, `client/src/types/booking/minimizerPartsScheduling.ts` as needed |
| Orchestrator | `client/src/composables/booking/useAvailabilityOrchestratorSlotsPhase.ts`, possibly `useAvailabilityOrchestrator.ts`, `useAvailabilitySubStepContent.ts` (minimal) |
| Duration helper | `client/src/utils/booking/minimizerDurationFromAppointmentShape.ts` — align with multi-segment if still single-final |

---

### Approach

1. Introduce computed **`minimizerSegments`** from `listMinimizerSegmentsFromAppointmentShape` when `appointmentShape` is non-null; remove or narrow **`minimizerEventFinal`** to derive from segments (e.g. first segment only for backward-compat shim, then replace).
2. **Duration / options pipeline:** Refactor `minimizerDuration`, `useMinimizerAvailabilityData` inputs, and `createMinimalAppointmentShapeForDuration` calls so **multi-segment** templates do not drop later finals — choose **sum vs active index** and document.
3. **Chaining:** Implement **segment boundary chain** using existing `buildMinimizerSchedulingWindow` / `extractInnerBoundary` / `computeOuterBoundary` where applicable; add pure function(s) if branch count in composable exceeds governance thresholds.
4. **Orchestrator:** Update slot phase only if new exports are required; keep components thin.
5. **Verify:** `cd client && npm run lint`; `npm run start:dev` smoke; no new test files (project policy).

---

### Checkpoint

- Template with **two** minimizer-role finals: scheduling path uses **both** (no console errors; no silent ignore of second final).
- **One** minimizer final: behavior matches **before** this task.
- Client lint clean for touched files.

---

### Deliverables

- `useMinimizerPartsScheduling` driven by **ordered segment list**, not first-match-only.
- Documented **boundary-chaining** behavior for segment 2..N.
- Orchestrator / sub-step **compatible** with multi-segment composable outputs.
- No new composable public API that violates type-governance (no `Ref | ComputedRef` unions at boundaries).

---

### Acceptance Criteria

- [ ] Multi-minimizer template: user can complete minimizer scheduling (step 4 / confirm) without errors; **both** segments accounted for in scheduling logic (not only the first).
- [ ] Single minimizer template: **regression-free** vs current behavior (duration, slots, window).
- [ ] Exported composable return type remains **explicit**; complexity within thresholds or extracted to named utilities.
- [ ] `cd client && npm run lint` passes for touched files.

---

### Design

1. **Source of truth:** Replace `minimizerEventFinal` + `getEventShapeByRoleWithOverrides(..., 'minimizer', …)` with **`listMinimizerSegmentsFromAppointmentShape(appointmentShape)`** (or equivalent computed from `appointmentShape.value`).
2. **Duration / “has parts”:** `hasMinimizerParts` = segments.length > 0 and at least one segment with `roundedDuration > 0`. Aggregate or **active-segment** duration: smallest change that preserves one-segment behavior — e.g. sum durations for fetch range, or drive **active segment index** ref (0..N-1) for stepped completion (document choice in code).
3. **Boundary chaining:** For segment `i > 0`, constrain **inner** boundary using **previous segment’s resolved outer boundary** (or documented invariant) before calling existing window builders; add a short **WHY** comment at the chain site.
4. **Types:** Extend `MinimizerSchedulingOptions` or add narrow types only if needed for persisted step data / confirm — avoid `Ref | ComputedRef` unions on exported composable API.
5. **Orchestrator / sub-step:** Thread new computed/refs only if the UI or confirm step must distinguish segments; otherwise keep external contract stable and handle multi-segment **inside** the composable.

---

---
