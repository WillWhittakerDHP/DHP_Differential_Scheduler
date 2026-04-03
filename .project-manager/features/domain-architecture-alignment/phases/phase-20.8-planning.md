<!-- harness-planning-rollup tier=phase id=20.8 consolidatedAt=2026-04-03T21:35:00.000Z -->

# Consolidated planning: phase 20.8

## Phase 20.8 (parent)

## Story

**As a** maintainer finishing the Feature 20 close-out extension, **I want** the architecture truth docs, plan surfaces, and feature-level handoffs to describe one honest state, **so that** Feature 20 can end cleanly without stale claims, competing plans, or hidden residual ambiguity.

**Estimated size:** **S–M** (documentation, reconciliation, and final review; code only if a tiny doc-supporting fix is required)

---

## Analysis

- **Problem / why now:** The original Feature 20 work ended with implementation passes and cleanup, but the close-out now depends on one final reconciliation pass so `ARCHITECTURE.md`, the active planning set, and feature/project-level status all agree with the locked architecture and the master plan.
- **Boundaries:** Truth-bearing architecture/planning/handoff docs first. Do not expand into unrelated product work.
- **Patterns:** Update derivative docs to match reality; do not use documentation to paper over unresolved implementation drift.
- **Risks:** Overstating completion, or leaving older parallel planning surfaces active enough to fork future work.
- **Alternatives:** End the feature without a dedicated doc phase — rejected because the current doc set still contains multiple planning authorities and stale close-out guidance.

## Goal

Complete **Phase 20.8** as the final truth-doc and feature-closeout phase:

1. Reconcile `ARCHITECTURE.md` with the locked architecture and the post-20.6 close-out reality.
2. Reconcile or retire parallel planning surfaces so the locked master plan is the clear sequencing authority.
3. Update feature-level and project-level closeout language only when it is supportable by the document and implementation evidence.
4. Prepare a clean handoff to **`/feature-end`**.

## Files

- **Canonical:** `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md`, `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md`, `/.cursor/plans/architecture_alignment_closeout_master_plan_20260403.plan.md`
- **Truth docs:** `.project-manager/ARCHITECTURE.md`, `.project-manager/PROJECT_PLAN.md`
- **Feature harness:** `feature-domain-architecture-alignment-guide.md`, `feature-domain-architecture-alignment-handoff.md`, `phases/phase-20.8-guide.md`, `phases/phase-20.8-handoff.md`, `phases/phase-20.8-log.md`
- **Parallel plan surfaces:** the three source plans and any feature-local guide/handoff text still presenting them as co-equal authorities

## Approach

1. **Session 20.8.1:** truth-align `ARCHITECTURE.md`.
2. **Session 20.8.2:** reconcile plan surfaces and project-level status wording.
3. **Session 20.8.3:** final review packet, handoffs, and **`/feature-end`** readiness.

## Checkpoint

- **`/accepted-plan`** should confirm that the decomposition covers both architecture-truth reconciliation and feature-closeout readiness.
- **Per session:** if a doc claim cannot be supported, narrow it or mark the residual debt explicitly.
- **Phase-end:** `phase-20.8-handoff.md` should point to **`/feature-end`**.

## Deliverables

- Updated `ARCHITECTURE.md`
- Reconciled or retired parallel plan surfaces
- Updated feature/project closeout text
- Final phase handoff pointing to **`/feature-end`**

## Acceptance Criteria

- [ ] `ARCHITECTURE.md` no longer overclaims completion or hides transitional reality
- [ ] Parallel planning surfaces no longer compete with the locked master plan
- [ ] Feature-level handoff points cleanly to **`/feature-end`**
- [ ] Project-level Feature 20 status language is honest about the extension close-out

---

## Session 20.8.1

### Story

**This session delivers** `ARCHITECTURE.md` truth alignment **so that** the code map and domain rules point to the same end state as the locked architecture and master close-out plan.

### Acceptance Criteria

- [ ] Booking correlation, routing, metadata status, and client-finalizer boundaries are described honestly
- [ ] Transitional wording remains only where the repo still needs it

---

## Session 20.8.2

### Story

**This session delivers** planning-surface reconciliation **so that** future work does not fork again from parallel plan documents or stale project-level wording.

### Acceptance Criteria

- [ ] Parallel plans are reconciled, retired, or explicitly narrowed
- [ ] `PROJECT_PLAN.md` Feature 20 wording reflects the extension ladder accurately

---

## Session 20.8.3

### Story

**This session delivers** final review and closeout readiness **so that** Feature 20 can end with an honest handoff and a clean **`/feature-end`** path.

### Acceptance Criteria

- [ ] Final handoffs and logs point to **`/feature-end`**
- [ ] Remaining residual risks are explicit rather than implied away
