<!-- harness-planning-rollup tier=phase id=20.7 consolidatedAt=2026-04-04T18:39:58.778Z -->

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

- **Canonical:** `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md`, `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md`, `.project-manager/ARCHITECTURE.md`, `architecture-alignment-closeout-master-plan.md` (Feature **20** extension sequencing **20.7–20.13**)
- **Feature harness:** `feature-domain-architecture-alignment-guide.md`, `feature-domain-architecture-alignment-handoff.md`, `phases/phase-20.6-handoff.md`, `phases/phase-20.7-guide.md`, `phases/phase-20.7-handoff.md`, `phases/phase-20.7-log.md`
- **Evidence target:** `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md` or another explicitly-linked in-repo narrative surface if the worklog is not the best fit

## Approach

1. **Session 20.7.1:** lock the plan in feature-level docs and add contradictory-doc protections.
2. **Session 20.7.2:** write the preflight package and ensure each item maps to a later close-out phase.
3. **Session 20.7.3:** extract the residual execution backlog for phases **20.8–20.13**.
4. End the phase with a handoff that points to **`/phase-start 20.8`**, not **`/feature-end`**.

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

---

## Session 20.7.1 (source: session-20.7.1-planning.md)

### Story

**This session delivers** a single in-repo canonical home for post-**20.6** close-out sequencing (or honest “not exported yet” wording), updated feature/phase handoff **Next Action** lines, and tombstone/warning banners on a short list of still-referenced but superseded planning paths **so that** agents and harness cascades stop treating **`/feature-end`** or old forks as co-equal with **`phase-20.7-guide.md`** / **`feature-domain-architecture-alignment-guide.md`**.

**Estimated size:** M (docs-only; no product code unless a tombstone lives beside code).

---

### Analysis

- **Problem / why now:** Without a **stable in-repo** sequencing anchor and aligned **Next Action** text, cascades and handoffs keep re-anchoring on **`/phase-start 20.7`** or vague “master plan” paths while the linked **`.cursor/plans/…`** file is absent.
- **Domains:** **Docs / harness only** — touches `.project-manager/features/domain-architecture-alignment/**` and possibly root markdown pointers; does **not** change **`client/`** unless we add a one-line README tombstone (prefer `.project-manager` first).
- **Child tasks:** Thin **task** plans: one for **canonical plan file + link normalization**, one for **feature handoff/guide + phase handoff stub updates**, one for **tombstone grep + targeted edits**.
- **Risks:** Over-editing historical archives; mitigate by **banner + link** rather than deleting content. Duplicating huge plan text in two places — mitigate with **one canonical `.project-manager/...` file** and relative links from feature/phase guides.

### Goal

1. Provide a **real, committed path** under **`.project-manager/features/domain-architecture-alignment/`** for close-out sequencing (full text or structured stub that lists phases **20.7–20.13** and points to each **`phase-20.x-guide.md`**).
2. Update **`feature-domain-architecture-alignment-handoff.md`** (and **`feature-domain-architecture-alignment-guide.md`** master-plan bullet if needed) so **Next Action** matches **post-20.7-start** work (**`/session-start 20.7.1`** done → next **`20.7.2`** or active session), and remove obvious template stubs that confuse status.
3. Add **tombstone / warning** blocks to any **still-linked** contradictory planning surfaces (short list from grep), without deleting historical content.

### Files

- **New or updated (expected):** `.project-manager/features/domain-architecture-alignment/architecture-alignment-closeout-master-plan.md` (name finalized in task 1) — canonical sequencing mirror.
- **Update:** `feature-domain-architecture-alignment-guide.md`, `feature-domain-architecture-alignment-handoff.md`, `phases/phase-20.7-guide.md` (link to canonical plan path only if we change the filename), optionally `phases/phase-20.7-handoff.md` if it still references missing **`.cursor/plans/…`**.
- **Tombstone candidates (verify then edit):** root `VUE_MIGRATION_*.md`, `FEATURE_20_ARCHITECTURE_REDESIGN.md` header note (if agents treat it as “current execution order”), any second “Feature 20 ladder ends at 20.6” lines outside the extension note.

### Approach

1. Draft the **canonical close-out plan** markdown under the feature folder; link **20.7–20.13** to existing phase guides; replace broken **`.cursor/plans/…`** links with that path everywhere in Feature **20** harness docs.
2. Refresh **feature handoff**: **Current status** / **Next action** / dates / branch line so they match **session 20.7.1 in progress** (or **20.7.2** next after this session ends).
3. Grep for **`/feature-end`**, **“ladder ended”**, **`phase-start 20.7`** in Feature **20** docs; add one-paragraph **Superseded / use instead** banners with links to **`feature-domain-architecture-alignment-guide.md`** and the new master-plan file.

### Checkpoint

- After task **20.7.1.1**, every Feature **20** reference to the close-out plan resolves to a **file that exists in git**.
- After task **20.7.1.2**, **`feature-domain-architecture-alignment-handoff.md`** no longer reads like a template with placeholder **Feature Summary** / wrong **Next Action** for someone already in **20.7**.
- After task **20.7.1.3**, at least **one** high-traffic contradictory doc (if any) carries an explicit **extension ladder** pointer.

### Deliverables

- Committed **canonical close-out sequencing** markdown + updated links in feature/phase harness docs.
- Updated **feature handoff** (and minimal guide tweaks if the master-plan bullet path changes).
- **Tombstone/warning** edits on a verified short list (or explicit note in session log if none needed).

---

---

## Session 20.7.2 (source: session-20.7.2-planning.md)

### Story

**This session delivers** a cited, reviewable **preflight evidence package** (routing, invariants, migrations, MLS boundary) **so that** phases **20.8–20.13** can execute against explicit pass/fail rows instead of rediscovering ambiguity in **`event_assignments`** or **`property_details`**.

**Estimated size:** M–L (mostly docs + targeted code reads; product changes only where evidence requires a one-line fix with explicit follow-on task).

---

### Analysis

- **Problem / why now:** Close-out phases **20.8+** assume the preflight package exists; without it, execution work re-litigates **`event_assignments`** and **`property_details`** boundaries.
- **Domains:** Booking + admin + migrations — **evidence is mostly markdown**; code changes only for **documented** follow-ons (separate task).
- **Dependencies:** **Session 20.7.1** delivered **`architecture-alignment-closeout-master-plan.md`**; this session adds **evidence** files under **`.project-manager/`** (or append to **`DOMAIN_REWRITE_WORKLOG.md`** with clear headings).
- **Risks:** Scope creep into product refactors — **mitigate** by PASS/FAIL table + “deferred to phase X” rows.

### Goal

1. **Event-routing watchpoint:** Written note: how **`event_assignments`** flow from global/booking transforms into **`PartFinalizer`**, and where ambiguity or legacy naming remains.
2. **Invariant audit:** Table of **ARCHITECTURE.md** §14-style checks with **pass/fail/unknown** and **owning phase (20.8–20.13)** for each gap.
3. **Migration policy:** Short restatement aligned with project **migration authority** rules (localhost-only execution) and Feature **20** ordering.
4. **`property_details` boundary:** Confirm appointment-scoped data vs time-configuration storage per §10.4 / §12 (evidence only).

### Files

- **New or append:** `.project-manager/features/domain-architecture-alignment/preflight-evidence-20.7.2.md` (single package) **or** sections in **`DOMAIN_REWRITE_WORKLOG.md`** — pick one primary surface and link from **`phase-20.7-guide.md`** / **`phase-20.7-log.md`** when done.
- **Read:** `client/src/utils/booking/*` (above), `server/src/db/migrations/` (relevant Feature **20** migrations — cite by filename), `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (migration sequencing context).

### Approach

1. Draft **`preflight-evidence-20.7.2.md`** with four sections matching **Goal**.
2. Map each **fail/unknown** invariant row to a **target phase guide** (`phase-20.8-guide.md` … **`phase-20.13-guide.md`**) in a table.
3. Cross-check admin **`eventAssignments`** config vs booking pipeline for a single “source of truth” paragraph.
4. Session **20.7.3** (if run) will **only** reshape backlog text — avoid duplicating that work here beyond explicit forward pointers.

### Checkpoint

- A new reader can answer: “What is still ambiguous about **`event_assignments`**?” and “Which phase owns each open gap?” without opening IDE.
- No silent production behavior change without a **task** under **20.8+** that cites this evidence doc.

### Deliverables

- **`preflight-evidence-20.7.2.md`** (or equivalent single narrative) committed under the feature folder **or** clearly delimited append to **`DOMAIN_REWRITE_WORKLOG.md`**.
- **`phase-20.7-log.md`** (or guide) updated with a pointer to the evidence package when implementation completes.

### Acceptance Criteria

- [ ] Watchpoint section names **≥2** concrete code paths (client booking + admin) for **`event_assignments`** and states **pass** or **risk** for each ambiguity called out in **`phase-20.7-guide.md`**.
- [ ] Invariant audit covers **lineage**, **zero-out**, relational **events**, client **PartFinalizer**, and **`property_details`** separation; each **fail/unknown** names an owning **phase 20.8–20.13** target.
- [ ] Migration policy paragraph cites **localhost / shared DB** execution rule from workspace policy and points to **FEATURE_20** ordering where relevant.
- [ ] No undocumented production behavior change — refactors are **out of scope** unless filed as follow-on tasks with phase IDs.

---

---

## Session 20.7.3 (source: session-20.7.3-planning.md)

### Story

**This session delivers** a **cross-walked backlog** from preflight onto extension phase guides (**20.8–20.13**) **and** finishes the preflight doc (**§3–§4**) **so that** close-out execution phases have **owned rows** and a **complete evidence package**, without reopening finished **20.1–20.6** work.

**Estimated size:** M (docs-only; no product refactor unless filed as a later phase task).

---

### Analysis

- **Problem / why now:** Without guide-level backlog rows, **20.8+** agents re-derive gaps from scratch; preflight investment must **land visibly** in **`phase-20.x-guide.md`**.
- **Boundaries:** **`.project-manager/`** documentation only; no **`client/`** / **`server/`** product change unless a follow-on **task** under **20.8+** files it.
- **Dependencies:** **20.7.2** complete for **§1–§2**; **§3–§4** completed in this session.
- **Risks:** Duplicating long **20.1–20.6** narratives — **mitigate** with short bullets + links to **`preflight-evidence-20.7.2.md`** / **ARCHITECTURE.md**.

### Goal

1. **Backlog map:** For each **unknown** / **fail** / material **risk** in **`preflight-evidence-20.7.2.md` §§1–2**, ensure a corresponding **actionable bullet** appears under the **correct** phase guide (**20.8–20.13**), with link to canonical analysis (**ARCHITECTURE.md** / master plan).
2. **Finish preflight:** Write **`preflight-evidence-20.7.2.md` §3** (migration execution policy: workspace **localhost / shared DB** rule + pointer to **FEATURE_20** ordering) and **§4** (**`property_details`** vs time-configuration per **§10.4 / §12**).
3. **Harness surfaces:** Update **`phase-20.7-log.md`** (and **`phase-20.7-guide.md`** if needed) to state preflight package **complete**; refresh **`feature-domain-architecture-alignment-handoff.md`** / **`session-20.7.3-handoff.md`** — **Next action** toward **`/phase-start 20.8`**.
4. **`across-ladder.json`:** Add or adjust **session notes** for **20.7.3** if the ladder schema supports it; otherwise ensure **focusSessionId** / **nextTaskAcross** consistency after tasks complete.

### Files

- **Primary read/write:** `preflight-evidence-20.7.2.md`, `phases/phase-20.8-guide.md` … `phases/phase-20.13-guide.md`, `across-ladder.json`
- **Secondary:** `phases/phase-20.7-guide.md`, `phases/phase-20.7-log.md`, `phases/phase-20.7-handoff.md`, `feature-domain-architecture-alignment-handoff.md`, `session-20.7.3-handoff.md` (create/update), `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (ordering cite for §3)

### Approach

1. **Task 20.7.3.1:** Read **§2** table + **§1.4** risks; for each **owning phase**, add a **concise backlog subsection or bullets** to that phase’s guide; optional one-line **`across-ladder.json`** session note for **20.7.3**.
2. **Task 20.7.3.2:** Replace **§3** / **§4** stubs in **`preflight-evidence-20.7.2.md`**; update file intro to say **§3–§4** completed in **20.7.3**; update **`phase-20.7-log.md`** / handoffs.

### Checkpoint

- **Coverage check:** If the **Goal** is “preflight fully landed + guides carry backlog,” **two tasks** suffice: **(1)** guide crosswalk, **(2)** §3–§4 + harness handoff updates. **Gaps:** none for a doc-only session; product execution remains in **20.8+**.

### Deliverables

- [ ] Phase guides **20.8–20.13** contain visible **preflight-sourced** backlog items (no duplicate **20.1–20.6** essays).
- [ ] **`preflight-evidence-20.7.2.md`** §3 and §4 complete; intro cross-refs fixed.
- [ ] **`phase-20.7-log.md`** (and handoffs) reflect completion and point to **`/phase-start 20.8`**.

### Acceptance Criteria

- [ ] Every **unknown** / **fail** row in preflight **§2** has a **matching** backlog bullet (or explicit “already tracked” note) in the **intended** phase guide.
- [ ] **§1** risks (**parentKind**, dual admin surfaces, **part_shape** keying) reflected under **20.8 / 20.9 / 20.10** as appropriate.
- [ ] **§3** cites migration authority (**localhost** vs shared DB) and **FEATURE_20** ordering; **§4** cites **ARCHITECTURE** §10.4 / §12.
- [ ] No **`client/`** / **`server/`** code changes unless separately justified (out of scope).

---

---
