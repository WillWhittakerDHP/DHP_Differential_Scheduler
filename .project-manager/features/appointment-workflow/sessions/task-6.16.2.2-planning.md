# Plan: task 6.16.2.2 — Multi-segment composable + orchestrator wiring

## Contract
- **Tier:** task | **ID:** 6.16.2.2
- **Scope:** Session 6.16.2 — consume ordered minimizer segments in `useMinimizerPartsScheduling`, chain segment boundaries, wire availability orchestrator / sub-step.
- **Governance:** Governance Context (Task) | Gate profile: fast

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function, composable
- **Suggested depth:** leaf — advisory; agent decides in Analysis

## Where we left off
- [x] #### Task 6.16.2.1: Minimizer segment detection + types ✅  
  **Delivered:** `listMinimizerSegmentsFromAppointmentShape` + `MinimizerSegmentDescriptor` in `client/src/utils/booking/minimizerEventShapes.ts` (ordered by `slotShape.eventFinals`, effective role `minimizer`).
- [ ] #### Task 6.16.2.2: Multi-segment composable + orchestrator wiring  
  **Goal:** Refactor scheduling composable to use **all** segments (not first match only), chain **outer → inner** boundaries across segments, and expose whatever the orchestrator / availability sub-step need for multi-shape templates.

---

## Parent context (session planning — summary)

Session **6.16.2** targets **multiple minimizer-role event finals** in one appointment shape, **stable order** from `eventFinals`, and **sequential boundary chaining**. **Margin** (`PartFinal.minimizer === 'override'`) stays on the pre-major path — out of scope for this composable path. DB/storage already uses **`minimizer`** role string (rename landed with task 6.16.2.x mechanical pass).

---

## Story

**This task changes** `useMinimizerPartsScheduling` (and minimal orchestrator / sub-step wiring) **because** 6.16.2.1 only added **pure** listing of segments; the composable still resolves **one** minimizer final via `getEventShapeByRoleWithOverrides` (first match) and derives a single `minimizerDuration` / options pipeline. Product requires **N** minimizer segments to participate in scheduling math and UI without dropping later segments.

---

## Analysis

- **Problem:** `minimizerEventFinal` and downstream duration/slots assume **at most one** minimizer `EventFinal`, even though `listMinimizerSegmentsFromAppointmentShape` can return **N** descriptors.
- **Domain:** Booking / wizard only (`client/src/composables/booking/*`, `client/src/utils/booking/*`). No new `@shared` unless both client and server need the same contract (prefer client types co-located with composable per ARCHITECTURE §4).
- **Dependencies:** Reuse `listMinimizerSegmentsFromAppointmentShape`, `buildMinimizerSchedulingWindow`, `applyMinimizerWindowToComputedSlots`, `computeOuterBoundary` / `extractInnerBoundary` from `minimizerSchedulingBounds` / `applyMinimizerWindowToComputedSlots` — extend signatures or add **named helpers** instead of duplicating window math.
- **Risks:** Regressing **single-segment** templates (must behave as today). UX for **multi-segment** may stay a **single step-4 flow** with internal segment index or combined window — avoid scope creep into full multi-modal UX unless required for AC.
- **Orchestrator:** `useAvailabilityOrchestratorSlotsPhase` bundles `useMinimizerPartsScheduling`; sub-step content consumes `minimizerOptions`, `minimizerSchedulingWindow`, etc. — extend only if new refs/computed are required (e.g. segment count, active segment index).

---

## Design

1. **Source of truth:** Replace `minimizerEventFinal` + `getEventShapeByRoleWithOverrides(..., 'minimizer', …)` with **`listMinimizerSegmentsFromAppointmentShape(appointmentShape)`** (or equivalent computed from `appointmentShape.value`).
2. **Duration / “has parts”:** `hasMinimizerParts` = segments.length > 0 and at least one segment with `roundedDuration > 0`. Aggregate or **active-segment** duration: smallest change that preserves one-segment behavior — e.g. sum durations for fetch range, or drive **active segment index** ref (0..N-1) for stepped completion (document choice in code).
3. **Boundary chaining:** For segment `i > 0`, constrain **inner** boundary using **previous segment’s resolved outer boundary** (or documented invariant) before calling existing window builders; add a short **WHY** comment at the chain site.
4. **Types:** Extend `MinimizerSchedulingOptions` or add narrow types only if needed for persisted step data / confirm — avoid `Ref | ComputedRef` unions on exported composable API.
5. **Orchestrator / sub-step:** Thread new computed/refs only if the UI or confirm step must distinguish segments; otherwise keep external contract stable and handle multi-segment **inside** the composable.

---

## Goal

1. **Composable** uses ordered **segment list** from `minimizerEventShapes.ts` — no silent “first minimizer only.”
2. **Sequential** inner/outer boundaries across segments are **correct** for multi-segment templates (document invariants).
3. **Single-segment** templates: **parity** with pre–6.16.2.2 behavior (lint + manual smoke).
4. **Orchestrator / sub-step:** wired so step 4 / confirm does not break when `segments.length > 1`.

---

## Files (expected touch set)

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

## Approach (implementation order)

1. Introduce computed **`minimizerSegments`** from `listMinimizerSegmentsFromAppointmentShape` when `appointmentShape` is non-null; remove or narrow **`minimizerEventFinal`** to derive from segments (e.g. first segment only for backward-compat shim, then replace).
2. **Duration / options pipeline:** Refactor `minimizerDuration`, `useMinimizerAvailabilityData` inputs, and `createMinimalAppointmentShapeForDuration` calls so **multi-segment** templates do not drop later finals — choose **sum vs active index** and document.
3. **Chaining:** Implement **segment boundary chain** using existing `buildMinimizerSchedulingWindow` / `extractInnerBoundary` / `computeOuterBoundary` where applicable; add pure function(s) if branch count in composable exceeds governance thresholds.
4. **Orchestrator:** Update slot phase only if new exports are required; keep components thin.
5. **Verify:** `cd client && npm run lint`; `npm run start:dev` smoke; no new test files (project policy).

---

## Checkpoint

- Template with **two** minimizer-role finals: scheduling path uses **both** (no console errors; no silent ignore of second final).
- **One** minimizer final: behavior matches **before** this task.
- Client lint clean for touched files.

---

## Deliverables

- `useMinimizerPartsScheduling` driven by **ordered segment list**, not first-match-only.
- Documented **boundary-chaining** behavior for segment 2..N.
- Orchestrator / sub-step **compatible** with multi-segment composable outputs.
- No new composable public API that violates type-governance (no `Ref | ComputedRef` unions at boundaries).

---

## Acceptance Criteria

- [ ] Multi-minimizer template: user can complete minimizer scheduling (step 4 / confirm) without errors; **both** segments accounted for in scheduling logic (not only the first).
- [ ] Single minimizer template: **regression-free** vs current behavior (duration, slots, window).
- [ ] Exported composable return type remains **explicit**; complexity within thresholds or extracted to named utilities.
- [ ] `cd client && npm run lint` passes for touched files.

---

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`; `cd server && npm run lint` if server touched)
- [ ] Governance maintained on touched surfaces
- [ ] Session guide task 6.16.2.2 can be checked at `/task-end`

---

## Reference

- Session guide: `.project-manager/features/appointment-workflow/sessions/session-6.16.2-guide.md`
- Session planning: `.project-manager/features/appointment-workflow/sessions/session-6.16.2-planning.md`
- Phase: `.project-manager/features/appointment-workflow/phases/phase-6.16-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md`
- Prior task handoff: `.project-manager/features/appointment-workflow/sessions/task-6.16.2.1-handoff.md`
- Playbooks: `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `FUNCTION_AUTHORING_PLAYBOOK.md`, `TYPE_AUTHORING_PLAYBOOK.md`

---

## Coverage check

**Does this plan cover session task 6.16.2.2?** Yes: it applies 6.16.2.1’s ordered segments to the composable, adds chaining, and wires orchestrator/sub-step as needed. **6.16.3** remains for calendar split, persistence checklist, and broader rename tranches if any remain.

---

## Decomposition / child tiers

None — single task implementation.
