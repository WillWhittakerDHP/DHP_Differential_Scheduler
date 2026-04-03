# Plan: task 20.7.1.1 — Feature and phase handoff alignment (extension ladder)

## Contract

- **Tier:** task | **ID:** 20.7.1.1
- **Scope:** Update **feature-level** and **selected phase handoff** markdown so **Next Action** and canonical bullets match the real post-**20.6** path (**20.7** → **20.8** → **`/feature-end`**), and remove misleading pointers to a **non-existent** in-repo master plan file.
- **Explicitly out of scope for this task:** Tombstones on **20.6** archival session docs and **`phase-20.6-planning.md`**; **`phase-20.7-guide.md`** / **`phase-20.8-guide.md`** link blocks — those are **Task 20.7.1.2**.

## Work Profile

- **Execution intent:** implement (after **`/accepted-code`**)
- **Scope shape:** `.project-manager` documentation only

## Story

**This task changes** feature guide + feature handoff + phase **20.7** handoff + phase **20.6** handoff (+ **PROJECT_PLAN** pointer line) **because** agents following **Next Action** must see the current harness state (Phase **20.7** / Session **20.7.1** in flight) and must not be sent to a broken **`/.cursor/plans/...`** path as if it were committed truth.

---

## Architecture context (pointer)

No application code changes. Sequencing authority remains **`.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md`** and **`FEATURE_20_ARCHITECTURE_REDESIGN.md`**; extension ordering is documented in phase guides.

---

## Codebase recon (agent-led — required)

- **Paths reviewed:** `feature-domain-architecture-alignment-guide.md`, `feature-domain-architecture-alignment-handoff.md`, `phases/phase-20.7-handoff.md`, `phases/phase-20.6-handoff.md`, `PROJECT_PLAN.md` (Feature **20** table row ~46 and **## Feature 20** section); glob confirmed **no** `architecture_alignment_closeout_master_plan_20260403.plan.md` under `.cursor/plans/`.
- **Patterns / call sites:** Several docs still say “read” the master plan at an absolute path that does not exist in the repo; feature handoff **Next Action** still says **`/phase-start 20.7`** though that gate may already be satisfied.
- **Gaps / unknowns:** None for this task; **20.7.1.2** will align remaining guides.

## Analysis

- **Problem:** Stale commands and broken links cause wrong next step and false authority for sequencing.
- **Boundaries:** Only the files listed under **Files**; no `client/` / `server/`.
- **Risks:** Overwriting harness **Across ladder** blocks — edit around them or leave blocks untouched.

## Design

1. Replace the third “canonical” bullet in the **feature guide** with prose: committed sequencing = **`phase-20.7-guide.md`** / **`phase-20.8-guide.md`** (+ planning/handoffs); optional future file under **`.cursor/plans/`** named like `architecture_alignment_closeout_master_plan_20260403.plan.md` if added to the repo.
2. **Feature handoff:** **Next Action** → continue **Phase 20.7** / **Session 20.7.1** (task **20.7.1.1** then **20.7.1.2**); remove sole dependency on “locked master plan” file path.
3. **phase-20.7-handoff:** Set **Phase Status** to **In Progress**; fix “What you need to start” and **Next Action** for active **20.7** work.
4. **phase-20.6-handoff:** Fix **Transition Context** so **`/feature-end`** is not listed as the first closeout step without **20.7–20.8**.
5. **PROJECT_PLAN:** Add one line under **Feature 20** that extension **20.7–20.8** is in the documented ladder (if not already explicit enough).

## Goal

Align live **Next Action** and canonical sequencing language across the feature + phase **20.7** / **20.6** handoff surfaces with the extension ladder actually on disk, without broken master-plan links.

## Files

- `.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-guide.md`
- `.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-handoff.md`
- `.project-manager/features/domain-architecture-alignment/phases/phase-20.7-handoff.md`
- `.project-manager/features/domain-architecture-alignment/phases/phase-20.6-handoff.md`
- `.project-manager/PROJECT_PLAN.md` (Feature **20** subsection only if needed)

## Approach

Edit markdown in place; preserve **<!-- harness-across-ladder** blocks verbatim. Use consistent “committed in-repo sequencing” wording.

## Checkpoint

- Grep feature folder for `/.cursor/plans/architecture_alignment_closeout` on edited files — should be gone from handoffs we touched; feature guide should explain optional file, not link to missing path.

## Deliverables

- Updated five targets above with consistent extension-ladder **Next Action** and no broken master-plan link pretense.

## Acceptance Criteria

- [ ] Feature guide does not present a markdown link to a non-existent `architecture_alignment_closeout_master_plan_20260403.plan.md` without an explicit “if present in repo” note.
- [ ] Feature handoff **Next Action** reflects continuing **20.7** / **20.7.1** work (not only **`/phase-start 20.7`** as the only step).
- [ ] **phase-20.7-handoff** **Next Action** matches phase in progress; “What you need” does not require opening a missing file path.
- [ ] **phase-20.6-handoff** **Transition Context** lists **`/feature-end`** only after **20.7** and **20.8**, not as the first bullet.

## Definition of Done

- [ ] Task planning doc filled (this file)
- [ ] Edits saved; session guide task checkbox can move at **task-end**

---

## Reference

- `sessions/session-20.7.1-planning.md`
- `phases/phase-20.7-guide.md`
