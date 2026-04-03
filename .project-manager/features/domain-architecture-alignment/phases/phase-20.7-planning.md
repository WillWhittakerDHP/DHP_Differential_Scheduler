<!-- harness-planning-rollup tier=phase id=20.7 consolidatedAt=2026-04-03T21:30:00.000Z -->

# Consolidated planning: phase 20.7

## Phase 20.7 (parent)

## Story

**As a** maintainer extending Feature 20 beyond the original **20.6** pass ladder, **I want** a locked canonical close-out surface plus a written preflight evidence package, **so that** the remaining close-out work runs from one sequencing source and no agent or operator follows contradictory redesign text or ambiguous routing assumptions.

**Estimated size:** **S–M** (documentation, feature-guide alignment, evidence writing; no broad product refactor)

---

## Codebase recon (agent-led — required)

- **Paths reviewed:** `feature-domain-architecture-alignment-guide.md` (**§ Phase 20.7 / 20.8** table + narrative); `phases/phase-20.7-guide.md`, `phases/phase-20.7-handoff.md`, `feature-domain-architecture-alignment-handoff.md`, `across-ladder.json` (phases **20.7**–**20.13** on disk); `PROJECT_PLAN.md` Feature **20** row (extension **20.7–20.8** before **`/feature-end`**). Ripgrep for **`architecture_alignment_closeout_master_plan`** under repo → **no** committed file at that name; **committed ladder** lives in the feature guide + phase guides.
- **Patterns / call sites:** Post-**20.6** work is **harness-doc sequencing** first; **20.7.1** aligns “next action” text and tombstones; **20.7.2** writes preflight evidence (watchpoint, invariants, migration policy, **`property_details`** boundary).
- **Gaps / unknowns:** If a **Cursor-only** plan file exists locally but is not in git, either add it under **`.project-manager/`** or keep **feature guide** as the in-repo sequencing SoT—do not reference absolute `/.cursor/plans/...` paths as required reading unless the file is tracked.

---

## Analysis

- **Problem / why now:** The original Feature 20 ladder ended at **20.6**, but the close-out work now depends on the locked master plan and on safeguards that were not captured in the original phase set. Without a dedicated preflight phase, the feature still points straight to **`/feature-end`** and leaves contradictory planning surfaces active.
- **Boundaries:** Feature/phase/handoff/planning docs, close-out plan, worklog or equivalent evidence doc, and architecture-truth planning surfaces only. No opportunistic product refactors.
- **Patterns:** Use the locked architecture docs for truth and the master close-out plan for sequencing. Convert ambiguity into written evidence, not chat-only interpretation.
- **Risks:** Reopening settled architecture by accident; mitigating by writing explicit "locked docs win" language and by scoping the event-routing watchpoint as a code-evidence confirmation, not a redesign exercise.
- **Alternatives:** Skip a dedicated preflight phase and fold this into final close-out — rejected because it leaves the feature ladder and next-action text incorrect during active work.

## Goal

Complete **Phase 20.7** as the bridge between the original Feature 20 pass ladder and the locked close-out master plan:

1. Lock the master plan as the active sequencing surface for post-20.6 Feature 20 work.
2. Update feature-level harness docs so the next steps are **20.7** then **20.8**, not immediate **`/feature-end`**.
3. Produce the written preflight package required by the master plan:
   - contradictory-doc protection
   - event-routing watchpoint
   - invariant audit
   - migration execution policy restatement
   - MLS / `property_details` boundary verification

## Files

- **Canonical:** `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md`, `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md`
- **Committed sequencing (extension ladder):** `feature-domain-architecture-alignment-guide.md` (**Phase 20.7–20.8**); optional **`.cursor/plans/*.plan.md`** only if tracked in git—otherwise do not treat as a hard dependency
- **Feature harness:** `feature-domain-architecture-alignment-handoff.md`, `phases/phase-20.6-handoff.md`, `phases/phase-20.7-guide.md`, `phases/phase-20.7-handoff.md`, `phases/phase-20.7-log.md`
- **Evidence target:** `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md` and/or new subsection under `feature-planning.md` / session logs (**20.7.2**)

## Approach

1. **Session 20.7.1:** lock the plan in feature-level docs and add contradictory-doc protections.
2. **Session 20.7.2:** write the preflight package and ensure each item maps to a later close-out phase.
3. End the phase with a handoff that points to **`/phase-start 20.8`**, not **`/feature-end`**.

## Checkpoint

- **`/accepted-plan`** should confirm that the decomposition covers both harness-ladder correction and evidence-package creation.
- **Per session:** keep the work doc-focused; any product-code ambiguity found during the routing watchpoint becomes evidence plus a later execution task, not silent refactor scope.
- **Phase-end:** `phase-20.7-handoff.md` should point to **20.8**.

## Deliverables

- Updated feature-level harness docs showing **20.7** and **20.8** as active remaining phases
- Contradictory-doc warning or tombstone language where needed
- Written preflight package covering routing, invariants, migration policy, and `property_details` boundary

## Acceptance Criteria

- [ ] Feature-level docs no longer say **`/feature-end`** is the immediate next step after **20.6**
- [ ] The locked master plan is referenced as the active sequencing surface for the extension work
- [ ] A written event-routing watchpoint exists in-repo
- [ ] A written invariant audit exists in-repo
- [ ] Migration execution policy and `property_details` boundary are explicitly restated

## Reference

- **Tier-up:** `phases/phase-20.7-guide.md`
- **Architecture / principles:** `.project-manager/ARCHITECTURE.md`, `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md`, `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md`
- **Worklog / traceability:** `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md`
- **Playbooks:** `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`

## Decomposition

**Leaf tier (sessions, in order):**

1. **Session 20.7.1** — Canonical plan adoption and contradictory-doc protections (`/session-start 20.7.1`; tasks **20.7.1.1** / **20.7.1.2** per session planning when generated).
2. **Session 20.7.2** — Preflight evidence package (`/session-start 20.7.2`).

**Phase-end:** **`/phase-end 20.7`** → **`/phase-start 20.8`** (not **`/feature-end`**).

---

## Session 20.7.1

### Story

**This session delivers** canonical plan adoption and contradictory-doc protections **so that** later close-out execution does not branch off stale phase assumptions or outdated redesign paths.

### Goal

1. Update feature-level harness docs to show **20.7** and **20.8** in the active ladder.
2. Replace any immediate **`/feature-end`** next-action guidance that is no longer correct.
3. Add brief warning/tombstone language to contradictory redesign/planning surfaces likely to be consulted.

### Deliverables

- Updated feature guide / handoff / phase handoff surfaces
- Warning or tombstone text added where needed

### Acceptance Criteria

- [ ] The feature guide shows **20.7** and **20.8**
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
