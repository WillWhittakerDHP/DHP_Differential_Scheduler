# Plan: session 6.16.2 — Multiple minimizers — segments, composable, orchestrator

## Contract
- **Tier:** session | **ID:** 6.16.2
- **Scope:** Multiple minimizer event shapes — ordered segment detection, types/utilities, `useMoveablePartsScheduling` multi-segment + sequential boundaries, availability orchestrator / sub-step wiring.
- **Governance (harness snapshot):**
  - Governance Context (Session)
  - Function Governance — Clean
  - Component Governance — Clean
  - Advisory: `useAvailabilitySubStepContent.ts` oversized return (pre-existing; not in this session’s file list unless we touch it)

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** cross_cutting
- **Governance domains:** docs, architecture, booking
- **Gate profile:** standard
- **Suggested depth:** full — advisory; agent decides in Analysis / Decomposition
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition.

## Where we left off
Session **6.16.1** complete: `margin` on `DifferentialRole`, DB ENUM, `PartFinal.minimizer: 'override'` for margin, admin override dropdown, part finalizer + normalization. Phase guide session 6.16.2 row is the active focus.

---

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

## Files (expected touch set)

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

## Decomposition

### Task 6.16.2.1 — Minimizer segment detection + types

**Story:** Add pure utilities and types to list minimizer-role event shapes in canonical order and describe each segment for scheduling.

**Implementation orders:**
1. Add ordered query helper (effective role `moveable` + overrides) with explicit return type; stable sort per `eventFinals` order.
2. Add segment descriptor type(s) (shape id, duration minutes, label helper reusing `getMoveablePartShapeName` or equivalent).
3. Add focused unit tests **only if** project re-enables tests in this phase — otherwise verify via lint + manual dev check (per project policy: tests suspended → **no new test files**).

**Acceptance criteria:**
- [ ] Helper returns empty array when no minimizer shapes; one entry when one shape; N entries when N distinct shapes match role.
- [ ] Ordering matches `slotShape.eventFinals` traversal order.
- [ ] No new `Ref | ComputedRef` unions on public composable APIs (types only in this task).

### Task 6.16.2.2 — Multi-segment composable + orchestrator wiring

**Story:** Refactor `useMoveablePartsScheduling` to consume ordered segments and chain boundaries; connect `useAvailabilityOrchestrator` (and sub-step content) to the expanded contract.

**Implementation orders:**
1. Replace single-shape assumption with segment list from 6.16.2.1.
2. Implement sequential boundary chaining between segments (reuse existing boundary helpers).
3. Wire orchestrator / availability sub-step props so UI can complete flow for multi-shape templates.
4. Run `cd client && npm run lint`; smoke app start.

**Acceptance criteria:**
- [ ] Multi-minimizer template: user can complete moveable/minimizer scheduling without console errors.
- [ ] Single minimizer template: behavior matches pre-6.16.2.
- [ ] Exported composable return type remains explicit and flat enough for governance.

---

## Acceptance Criteria (session)

- [ ] Phase 6.16 guide intent for **6.16.2** satisfied: multi-minimizer detection + composable + orchestrator wiring.
- [ ] No silent fallback when multiple minimizer shapes exist.
- [ ] Client lint passes; app starts.
- [ ] Session guide tasks 6.16.2.1 / 6.16.2.2 align with this decomposition (update guide at task-start if labels differ).

---

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint` if server touched)
- [ ] Governance maintained on touched surfaces
- [ ] All child tasks complete
- [ ] Session log and handoff updated

---

## Reference (read before execute)

- TierUp: [.project-manager/features/appointment-workflow/phases/phase-6.16-guide.md](../phases/phase-6.16-guide.md)
- Prior session: [.project-manager/features/appointment-workflow/sessions/session-6.16.1-handoff.md](session-6.16.1-handoff.md)
- Architecture: [.project-manager/ARCHITECTURE.md](../../ARCHITECTURE.md)
- Workflow friction: [.project-manager/WORKFLOW_FRICTION_LOG.md](../../WORKFLOW_FRICTION_LOG.md)
- Playbooks: `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `FUNCTION_AUTHORING_PLAYBOOK.md`, `COMPONENT_AUTHORING_PLAYBOOK.md`, `TYPE_AUTHORING_PLAYBOOK.md`

---

## Coverage check (agent)

**If this is the goal, have we outlined enough steps to enact it?** Yes: **6.16.2.1** supplies ordered data + types; **6.16.2.2** applies that data to the composable and wires the orchestrator. Gap none for session scope; 6.16.3 owns E2E inventory, calendar split, and rename tranches.
