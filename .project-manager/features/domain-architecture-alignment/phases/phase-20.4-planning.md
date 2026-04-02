# Plan: phase 20.4 — Pass 4 (booking pipeline alignment)

## Contract
- **Tier:** phase | **ID:** 20.4
- **Scope:** Booking pipeline: remove differential-role-derived pipeline pieces; derive grouping, slot layout, and time-axis behavior from **event instances + placement**; keep **lineage** correlation and **zero-out** order; **PartFinalizer remains client-side** per FEATURE_20.
- **Governance (harness snapshot):** As captured at `phase-start` — booking + architecture domains; maintain lint / governance baselines.

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** architectural
- **Governance domains:** booking, architecture, client pipeline
- **Gate profile:** decomposition
- **Suggested depth:** full — advisory; agent decides in Analysis / Decomposition
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** moderate (multi-session refactor; order matters)
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition.

## Where we left off
Phase **20.3** completed: admin UX aligned to placement + instance orchestration (§8.3). Schema and admin surfaces now speak **placement** and **segments**; the **client booking pipeline** still contains **differential-role** enrichment and slot helpers that FEATURE_20 **§8.4** / **§4.3** mark for removal or rewrite.

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

## Decomposition

- **Session 20.4.1:** Pipeline audit and map — document current `globalToBooking` / `buildAppointmentShape` / PartFinalizer chain vs **§4.2**; identify all `DifferentialRole` / `enrichBlockFinalsWithDifferentialRoles` / **PartFinal** role-field consumers; remove **confirmed** dead paths (e.g. empty `mergeBlockDifferentialRoleOverrides` branches) without changing behavior elsewhere.
- **Session 20.4.2:** Remove **differential-role enrichment** of block finals — replace **`enrichBlockFinalsWithDifferentialRoles`** (and related) with **event_assignments + placement + segment**-derived structure; narrow or remove **PartFinal.major / minor / minimizer** per **§4.3** and update first-party consumers in the same vertical slice.
- **Session 20.4.3:** **Slot shape + time axis** — rewrite **`calculateSlotShape`**, **`partFinalizerSlotShape`**, **`applyShapeToTime`**, and related helpers to use **placement_kind / anchor_edge** and instance grouping instead of role flags.
- **Session 20.4.4:** **Perspective + minimizer + shared cleanup** — update **`perspectiveResolver`**, **`minimizerSchedulingBounds`**, **`minimizerEventShapes`**, **`partFinalizerSlotShapeHelpers`** as needed; delete unused **`differentialRole*`** shared/client utilities per **§6.2** when grep-clean.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child sessions complete
- [ ] Phase guide and handoff updated

---

## Reference

- TierUp guide: `.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-guide.md`
- Prior phase handoff: `.project-manager/features/domain-architecture-alignment/phases/phase-20.3-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — §8–§14 domain rules for booking / PartFinalizer
- Workflow friction: `.project-manager/WORKFLOW_FRICTION_LOG.md`; `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
- Agent model preferences: `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/`
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `COMPOSABLE_AUTHORING_PLAYBOOK.md`, `FUNCTION_AUTHORING_PLAYBOOK.md`, `COMPONENT_AUTHORING_PLAYBOOK.md`
