<!-- harness-planning-rollup tier=phase id=20.7 consolidatedAt=2026-04-03T21:30:00.000Z -->

# Consolidated planning: phase 20.7

## Phase 20.7 (parent)

## Story

**As a** maintainer extending Feature 20 beyond the original **20.6** pass ladder, **I want** a locked canonical close-out surface plus a written preflight evidence package, **so that** the remaining close-out work runs from one sequencing source and no agent or operator follows contradictory redesign text or ambiguous routing assumptions.

**Estimated size:** **S–M** (documentation, feature-guide alignment, evidence writing; no broad product refactor)

---

## Analysis

- **Problem / why now:** The original Feature 20 ladder ended at **20.6**, but the close-out work now depends on the locked master plan and on safeguards that were not captured in the original phase set. Without a dedicated preflight phase, the feature still points straight to **`/feature-end`** and leaves contradictory planning surfaces active.
- **Boundaries:** Feature/phase/handoff/planning docs, close-out plan, worklog or equivalent evidence doc, and architecture-truth planning surfaces only. No opportunistic product refactors.
- **Patterns:** Use the locked architecture docs for truth and the master close-out plan for sequencing. Convert ambiguity into written evidence, not chat-only interpretation.
- **Risks:** Reopening settled architecture by accident; mitigating by writing explicit "locked docs win" language and by scoping the event-routing watchpoint as a code-evidence confirmation, not a redesign exercise.
- **Alternatives:** Skip a dedicated preflight phase and fold this into final close-out — rejected because it leaves the feature ladder and next-action text incorrect during active work.

## Codebase recon (agent-led — required)

Injected docs above are not a substitute for opening real code. Search/read `client/`, `server/`, and `shared/` as relevant when sessions touch product evidence (this phase is **primarily PM/docs**).

- **Paths reviewed:** `feature-domain-architecture-alignment-guide.md` (rows **20.7** / **20.8**, post-20.6 note); `feature-domain-architecture-alignment-handoff.md` (next **`/phase-start 20.7`**); `phases/phase-20.7-guide.md`, `phases/phase-20.7-handoff.md`, `phases/phase-20.6-handoff.md` → **`/phase-start 20.7`**; `PROJECT_PLAN.md` Feature **20** summary (extension **20.7–20.8**); `sessions/session-20.6.4-log.md` (**§9.3–9.4** deferred); `.cursor/plans/*.plan.md` glob — **no** file named `architecture_alignment_closeout_master_plan_20260403.plan.md` in-repo (treat **feature guide + handoff** as the committed sequencing surface until a plan file is added under **`.cursor/plans/`** or **`.project-manager/`**).
- **Patterns / call sites:** Ladder shows **8** phases on disk (**20.1–20.8**); **20.7** = canonical lock + preflight; **20.8** = truth docs + final close-out per feature guide table.
- **Gaps / unknowns:** If a separate “master close-out plan” markdown is required in-repo, add it and link from **Files** below; otherwise **`phase-20.7-guide.md`** remains the phase intent source.

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

- **Canonical:** `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md`, `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md`, `.project-manager/ARCHITECTURE.md`
- **Master close-out sequencing (committed):** `feature-domain-architecture-alignment-guide.md` (**Phase 20.7 / 20.8** rows), `feature-domain-architecture-alignment-handoff.md`, `phases/phase-20.7-guide.md` — optional future file under `.cursor/plans/` or `.project-manager/` if product wants a single named plan artifact
- **Feature harness:** `feature-domain-architecture-alignment-guide.md`, `feature-domain-architecture-alignment-handoff.md`, `phases/phase-20.6-handoff.md`, `phases/phase-20.7-handoff.md`, `phases/phase-20.7-log.md`
- **Evidence target:** `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md` and/or new subsection in `feature-planning.md` / session logs as agreed in **20.7.2**

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

## Decomposition

- **Session 20.7.1:** Canonical plan adoption and doc protections — align feature/handoff/phase surfaces; tombstone or warning on contradictory planning paths.
- **Session 20.7.2:** Preflight evidence package — event-routing watchpoint, invariant audit with phase mapping, migration **DB_HOST** policy restatement, MLS / `property_details` boundary note.

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

---

## Reference (read before locking — governance)

- **Feature guide:** `feature-domain-architecture-alignment-guide.md`
- **Phase guide:** `phases/phase-20.7-guide.md`
- **Principles / plan:** `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md`, `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md`
- **Workflow friction (optional):** `.project-manager/WORKFLOW_FRICTION_LOG.md` — `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
