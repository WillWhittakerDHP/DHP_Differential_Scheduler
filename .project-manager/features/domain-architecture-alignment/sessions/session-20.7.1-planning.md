# Plan: session 20.7.1 — Canonical plan adoption and doc protections

## Contract

- **Tier:** session | **ID:** 20.7.1
- **Scope:** Align Feature **20** harness docs so post-**20.6** work is sequenced as **20.7** → **20.8** → **`/feature-end`**; add tombstones or warnings where old text or broken links still imply immediate **`/feature-end`** after **20.6** or treat a missing file as an authority.
- **Out of scope for this session:** The written preflight evidence package (event-routing watchpoint, invariant audit, migration policy, `property_details` boundary) — that is **Session 20.7.2**.

## Work Profile

- **Execution intent:** plan (context_gathering → user **`/accepted-plan`** → execute tasks)
- **Scope shape:** documentation / harness surfaces under `.project-manager/features/domain-architecture-alignment/` and **`PROJECT_PLAN.md`** as needed

## Where we left off

Phase **20.7** is active after **`/phase-start 20.7`** + **`/accepted-plan`**. **20.6** execution is complete; extension phases **20.7** and **20.8** were added to the on-disk ladder. Several PM artifacts still say **`/feature-end`** immediately after **`/phase-end 20.6`**, and multiple guides link to a **master close-out plan** path that **does not exist** in-repo under `.cursor/plans/`.

## Story

**As a** maintainer or agent continuing Feature **20**, **I want** feature/phase/handoff text and canonical links to name the real sequencing surface, **so that** nobody treats superseded close-out copy or a dead plan path as equal to **`ARCHITECTURE_PRINCIPLES.md`** / **`FEATURE_20_ARCHITECTURE_REDESIGN.md`**.

**Estimated size:** S (PM edits only for this session)

---

## Architecture context (pointer)

Authoritative domain rules remain in **`.project-manager/ARCHITECTURE.md`** and **`.project-manager/analysis/`**. This session does not change product code; it only fixes harness/planning surfaces. Session **20.7.2** will cite live code for routing and invariants.

---

## Codebase recon (agent-led — required)

Injected architecture excerpts are not a substitute for verifying what agents will actually open.

- **Paths reviewed:** `feature-domain-architecture-alignment-guide.md`, `feature-domain-architecture-alignment-handoff.md`, `phases/phase-20.7-guide.md`, `phases/phase-20.7-handoff.md`, `phases/phase-20.6-handoff.md`, `sessions/session-20.6.4-handoff.md`, `sessions/session-20.6.4-log.md`, `PROJECT_PLAN.md` (Feature **20** row), `phases/phase-20.8-guide.md` (for consistent “after 20.8” language); glob `.cursor/plans/*.plan.md` — **no** `architecture_alignment_closeout_master_plan_20260403.plan.md`.
- **Patterns / call sites:** Historical **20.6.4** artifacts and **`phase-20.6-planning.md`** still describe **`/phase-end 20.6`** → **`/feature-end`** without **20.7–20.8**. Feature guide and phase **20.7** / **20.8** guides use a **relative** link to the missing master plan file (broken in-repo).
- **Gaps / unknowns:** Whether product will add the master plan markdown under **`.cursor/plans/`** or **`.project-manager/`**; until then, docs must state the **committed** sequencing source explicitly (feature guide table + **`phase-20.7-guide.md`** / **`phase-20.8-guide.md`**).

## Analysis

- **Problem / why now:** The extension ladder (**20.7**, **20.8**) exists on disk, but PM text written for the old “**20.6** then feature-end” story is still discoverable and contradicts the new path.
- **Boundaries:** `.project-manager` harness docs and **`PROJECT_PLAN.md`** only; no `client/` / `server/` refactors.
- **Patterns:** “Locked docs win” order already stated in phase guide: **`ARCHITECTURE_PRINCIPLES.md`** and **`FEATURE_20_ARCHITECTURE_REDESIGN.md`** beat planning forks; sequencing for the extension should be explicit so a missing Cursor-local plan file is not silently treated as authoritative.
- **Risks:** Over-editing historical session logs; prefer **tombstone notes** at top of still-referenced files or **Next Action**-only fixes where logs are archival.
- **Alternatives:** Add the master plan file to the repo (larger change); deferred unless Will asks — this session instead **corrects links and authority language**.

## Goal

1. Make **feature-level** and **active handoff** **Next Action** text describe **`/session-start 20.7.1`** / continuation of **20.7**, then **20.8**, and **`/feature-end`** only after **20.8**, not immediately after **20.6**.
2. Fix or tombstone **broken** references to **`architecture_alignment_closeout_master_plan_20260403.plan.md`** so agents are not sent to a non-existent path without explanation.
3. Add short **warning/tombstone** blocks where stale planning still implies the old close-out sequence (at minimum: **`phase-20.6-planning.md`**, **`session-20.6.4-handoff.md`**, and key lines in **`session-20.6.4-log.md`** if they remain the canonical “what we did” entry point).

## Files

- `feature-domain-architecture-alignment-guide.md` — ladder table, sequencing, master-plan link / footnote
- `feature-domain-architecture-alignment-handoff.md` — **Current Status** / **Next Action**
- `phases/phase-20.7-guide.md`, `phases/phase-20.7-handoff.md` — canonical sources block + link hygiene
- `phases/phase-20.8-guide.md`, `phases/phase-20.8-planning.md` — same link pattern if present
- `phases/phase-20.6-handoff.md` — ensure **Next Phase** / narrative matches extension (if still “live”)
- `sessions/session-20.6.4-handoff.md`, `sessions/session-20.6.4-log.md` — tombstone or addendum where they mandate immediate **`/feature-end`**
- `phases/phase-20.6-planning.md` — tombstone at top (archival plan doc)
- `PROJECT_PLAN.md` — Feature **20** row notes if still implying **`/feature-end`** without **20.7–20.8**

## Approach

1. **Task 20.7.1.1:** Edit **feature guide + feature handoff + phase-20.7-handoff** (and **`phase-20.6-handoff`** if needed) so **Next Action** and status lines match **20.7** → **20.8** → **`/feature-end`**. Replace broken master-plan links with “committed sequencing” wording + optional relative path only if the file is added later.
2. **Task 20.7.1.2:** Add **tombstones** / **Superseded by extension ladder** notes to **`phase-20.6-planning.md`**, **`session-20.6.4-handoff`**, **`session-20.6.4-log`** (targeted sections), and align **`phase-20.7-guide.md`** / **`phase-20.8-guide.md`** canonical bullet for the master plan.

## Checkpoint

- After **`/accepted-plan`**, run **Task 20.7.1.1** then **20.7.1.2** with **`/task-end`** per task; then **`/session-end 20.7.1`**.
- Grep the feature folder for **`/feature-end`** and confirm only **20.8** / final close-out paths use it as the immediate next step after extension work (archival text carries tombstone).

## Deliverables

- Updated feature guide and handoffs with correct ladder and **Next Action**
- Tombstones or warnings on contradictory / archival surfaces
- No broken in-repo links to the missing master plan file without an explicit note

## Acceptance Criteria

- [ ] Feature guide lists **20.7** and **20.8** and does not present **`/feature-end`** as the immediate next step after **20.6** without also stating **20.7–20.8**
- [ ] Feature handoff **Next Action** matches active work (**20.7** in progress or **20.7.2** / **20.8** as appropriate after this session’s tasks)
- [ ] References to the master close-out plan either resolve to a real committed file or explicitly name the in-repo sequencing documents
- [ ] At least one archival doc (**`phase-20.6-planning.md`** or **20.6.4** session artifacts) carries a clear supersession note

## Decomposition

- **Task 20.7.1.1:** Feature + phase handoff alignment — **`feature-domain-architecture-alignment-guide.md`**, **`feature-domain-architecture-alignment-handoff.md`**, **`phases/phase-20.7-handoff.md`**, **`phases/phase-20.6-handoff.md`**, **`PROJECT_PLAN.md`** as needed.
- **Task 20.7.1.2:** Tombstones and guide link hygiene — **`phase-20.7-guide.md`**, **`phase-20.8-guide.md`**, **`phase-20.8-planning.md`**, **`phase-20.6-planning.md`**, **`session-20.6.4-handoff.md`**, **`session-20.6.4-log.md`**.

## Definition of Done

- [ ] App starts (`npm run start:dev`) — N/A if docs-only; run if any tooling touch
- [ ] Lint passes — N/A for PM-only edits
- [ ] Child tasks **20.7.1.1** and **20.7.1.2** complete with task planning + task-end
- [ ] **`session-20.7.1-log.md`** and **`session-20.7.1-handoff.md`** updated at **`/session-end`**

---

## Reference (read before locking)

- **Phase guide:** `phases/phase-20.7-guide.md`
- **Phase planning:** `phases/phase-20.7-planning.md` (Session **20.7.1** embed)
- **Principles / redesign:** `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md`, `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md`
- **Architecture:** `.project-manager/ARCHITECTURE.md`
