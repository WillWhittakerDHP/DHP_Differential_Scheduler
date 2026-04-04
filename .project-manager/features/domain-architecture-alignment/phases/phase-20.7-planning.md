<!-- harness-planning-rollup tier=phase id=20.7 consolidatedAt=2026-04-03T21:30:00.000Z -->

# Consolidated planning: phase 20.7

## Phase 20.7 (parent)

## Story

**As a** maintainer extending Feature 20 beyond the original **20.6** pass ladder, **I want** a locked canonical close-out surface plus a written preflight evidence package and residual execution backlog, **so that** the remaining close-out work runs from one sequencing source and the harness sees concrete work-bearing follow-on phases.

**Estimated size:** **M** (documentation, feature-guide alignment, evidence writing, and backlog extraction; no broad product refactor)

---

## Analysis

- **Problem / why now:** The original Feature 20 ladder ended at **20.6**, but the close-out work now depends on the locked master plan and on safeguards that were not captured in the original phase set. Without a dedicated preflight phase, the feature still points straight to **`/feature-end`**, leaves contradictory planning surfaces active, and does not produce a work-bearing residual backlog for the later execution phases.
- **Boundaries:** Feature/phase/handoff/planning docs, close-out plan, worklog or equivalent evidence doc, and architecture-truth planning surfaces only. No opportunistic product refactors.
- **Patterns:** Use the locked architecture docs for truth and the master close-out plan for sequencing. Convert ambiguity into written evidence, then convert evidence into later execution work.
- **Risks:** Reopening settled architecture by accident; mitigating by writing explicit "locked docs win" language and by scoping the event-routing watchpoint as a code-evidence confirmation, not a redesign exercise.
- **Alternatives:** Skip a dedicated preflight phase and fold this into final close-out — rejected because it leaves the feature ladder and next-action text incorrect during active work.

## Codebase recon (agent-led — required)

- **Paths reviewed:** `feature-domain-architecture-alignment-guide.md` (phases **20.7–20.8** + post-20.6 note); `phases/phase-20.7-guide.md`, `phases/phase-20.7-handoff.md`, `phases/phase-20.6-handoff.md` (next → **20.7**); `across-ladder.json` (phases **20.1–20.13** on disk); `feature-domain-architecture-alignment-handoff.md`; glob for **`.cursor/plans/architecture_alignment_closeout_master_plan_20260403.plan.md`** → **not present** in workspace (treat **`phase-20.7-guide.md`** + feature guide as operational spec until the plan file is added or relocated under **`.project-manager/`**).
- **Patterns / call sites:** Extension ladder is **PM/harness-first** (no single code entrypoint). Product truth remains **`ARCHITECTURE_PRINCIPLES.md`**, **`FEATURE_20_ARCHITECTURE_REDESIGN.md`**, **`ARCHITECTURE.md`**. Pass **6** evidence lives in **`session-20.6.4-log.md`** and **`DOMAIN_REWRITE_WORKLOG.md`**.
- **Gaps / unknowns:** Session **20.7.1** should either **add** the master closeout plan to the repo at a stable path or **update** all references to the real location. **`across-ladder.json`** lists **20.7.1** / **20.7.2** only — confirm whether **20.7.3** needs harness **tier-add** or manual ladder refresh.

## Goal

Complete **Phase 20.7** as the bridge between the original Feature 20 pass ladder and the locked close-out master plan:

1. Lock the master plan as the active sequencing surface for post-20.6 Feature 20 work.
2. Update feature-level harness docs so the next steps are **20.7–20.13**, not immediate **`/feature-end`**.
3. Produce the written preflight package required by the master plan:
   - contradictory-doc protection
   - event-routing watchpoint
   - invariant audit
   - migration execution policy restatement
   - MLS / `property_details` boundary verification
4. Convert those findings into an explicit residual execution backlog for phases **20.8–20.13**.

## Files

- **Canonical:** `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md`, `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md`, `.project-manager/ARCHITECTURE.md` — **master closeout plan:** add under **`.project-manager/`** or **`.cursor/plans/`** when available (path cited in **20.7.1**; not found at last glob)
- **Feature harness:** `feature-domain-architecture-alignment-guide.md`, `feature-domain-architecture-alignment-handoff.md`, `phases/phase-20.6-handoff.md`, `phases/phase-20.7-guide.md`, `phases/phase-20.7-handoff.md`, `phases/phase-20.7-log.md`
- **Evidence target:** `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md` or another explicitly-linked in-repo narrative surface if the worklog is not the best fit

## Approach

1. **Session 20.7.1:** lock the plan in feature-level docs and add contradictory-doc protections.
2. **Session 20.7.2:** write the preflight package and ensure each item maps to a later close-out phase.
3. **Session 20.7.3:** extract the residual execution backlog for phases **20.8–20.13**.
4. End the phase with a handoff that points to **`/phase-start 20.8`**, not **`/feature-end`**.

## Decomposition

- **Session 20.7.1:** Canonical plan adoption and contradictory-doc protections — feature guide / handoff / tombstones; master plan path resolution.
- **Session 20.7.2:** Preflight evidence package — event-routing watchpoint, invariant audit, migration policy, **`property_details`** boundary.
- **Session 20.7.3:** Residual execution backlog for phases **20.8–20.13** — map findings to phase guides without duplicating **20.1–20.6** completed work.

## Checkpoint

- **`/accepted-plan`** should confirm that the decomposition covers harness-ladder correction, evidence-package creation, and residual execution-backlog extraction.
- **Per session:** keep the work doc-focused; any product-code ambiguity found during the routing watchpoint becomes evidence plus a later execution task, not silent refactor scope.
- **Phase-end:** `phase-20.7-handoff.md` should point to **20.8**.

## Deliverables

- Updated feature-level harness docs showing **20.7–20.13** as active remaining phases
- Contradictory-doc warning or tombstone language where needed
- Written preflight package covering routing, invariants, migration policy, and `property_details` boundary
- Residual execution backlog for phases **20.8–20.13**

## Acceptance Criteria

- [ ] Feature-level docs no longer say **`/feature-end`** is the immediate next step after **20.6**
- [ ] The locked master plan is referenced as the active sequencing surface for the extension work
- [ ] A written event-routing watchpoint exists in-repo
- [ ] A written invariant audit exists in-repo
- [ ] Migration execution policy and `property_details` boundary are explicitly restated
- [ ] Residual schema/API, admin, booking, migration-narrative, cleanup, and truth-doc work is mapped into later phases

---

## Session 20.7.1

### Story

**This session delivers** canonical plan adoption and contradictory-doc protections **so that** later close-out execution does not branch off stale phase assumptions or outdated redesign paths.

### Goal

1. Update feature-level harness docs to show **20.7–20.13** in the active ladder.
2. Replace any immediate **`/feature-end`** next-action guidance that is no longer correct.
3. Add brief warning/tombstone language to contradictory redesign/planning surfaces likely to be consulted.

### Deliverables

- Updated feature guide / handoff / phase handoff surfaces
- Warning or tombstone text added where needed

### Acceptance Criteria

- [ ] The feature guide shows **20.7–20.13**
- [ ] The handoff path after **20.6** points to **20.7**
- [ ] Contradictory planning surfaces are no longer silently presented as equal authorities

---

## Session 20.7.2

### Story

**This session delivers** the written preflight evidence package **so that** the remaining close-out work starts from explicit watchpoints instead of assumptions.

### Goal

1. Write the event-routing watchpoint note.
2. Write the invariant audit with phase ownership mapping.
3. Restate migration execution policy.
4. Confirm and record the MLS / `property_details` boundary.

### Deliverables

- A linked in-repo preflight evidence package

### Acceptance Criteria

- [ ] Event-routing ambiguity is addressed as a written watchpoint
- [ ] Invariant audit rows map to later phases
- [ ] Migration execution policy is written into the active close-out docs
- [ ] `property_details` boundary is explicit and reviewable

---

## Session 20.7.3

### Story

**This session delivers** the residual execution backlog **so that** later phases contain real implementation work rather than only documentation goals.

### Goal

1. Translate preflight findings into residual schema/API work for **20.8**.
2. Translate preflight findings into residual admin and booking work for **20.9** and **20.10**.
3. Translate remaining narrative, cleanup, and closeout work into **20.11–20.13**.

### Acceptance Criteria

- [ ] Each later phase has work-bearing goals and acceptance criteria
- [ ] Already-complete work from **20.1–20.6** is not blindly duplicated
- [ ] The handoff after **20.7** points cleanly to **20.8**
