<!-- harness-planning-rollup tier=session id=20.7.1 consolidatedAt=2026-04-04T00:55:03.583Z -->

# Consolidated planning: session 20.7.1

## Session 20.7.1 (parent)

## Story

**This session delivers** a single in-repo canonical home for post-**20.6** close-out sequencing (or honest “not exported yet” wording), updated feature/phase handoff **Next Action** lines, and tombstone/warning banners on a short list of still-referenced but superseded planning paths **so that** agents and harness cascades stop treating **`/feature-end`** or old forks as co-equal with **`phase-20.7-guide.md`** / **`feature-domain-architecture-alignment-guide.md`**.

**Estimated size:** M (docs-only; no product code unless a tombstone lives beside code).

---

## Analysis

- **Problem / why now:** Without a **stable in-repo** sequencing anchor and aligned **Next Action** text, cascades and handoffs keep re-anchoring on **`/phase-start 20.7`** or vague “master plan” paths while the linked **`.cursor/plans/…`** file is absent.
- **Domains:** **Docs / harness only** — touches `.project-manager/features/domain-architecture-alignment/**` and possibly root markdown pointers; does **not** change **`client/`** unless we add a one-line README tombstone (prefer `.project-manager` first).
- **Child tasks:** Thin **task** plans: one for **canonical plan file + link normalization**, one for **feature handoff/guide + phase handoff stub updates**, one for **tombstone grep + targeted edits**.
- **Risks:** Over-editing historical archives; mitigate by **banner + link** rather than deleting content. Duplicating huge plan text in two places — mitigate with **one canonical `.project-manager/...` file** and relative links from feature/phase guides.

## Goal

1. Provide a **real, committed path** under **`.project-manager/features/domain-architecture-alignment/`** for close-out sequencing (full text or structured stub that lists phases **20.7–20.13** and points to each **`phase-20.x-guide.md`**).
2. Update **`feature-domain-architecture-alignment-handoff.md`** (and **`feature-domain-architecture-alignment-guide.md`** master-plan bullet if needed) so **Next Action** matches **post-20.7-start** work (**`/session-start 20.7.1`** done → next **`20.7.2`** or active session), and remove obvious template stubs that confuse status.
3. Add **tombstone / warning** blocks to any **still-linked** contradictory planning surfaces (short list from grep), without deleting historical content.

## Files

- **New or updated (expected):** `.project-manager/features/domain-architecture-alignment/architecture-alignment-closeout-master-plan.md` (name finalized in task 1) — canonical sequencing mirror.
- **Update:** `feature-domain-architecture-alignment-guide.md`, `feature-domain-architecture-alignment-handoff.md`, `phases/phase-20.7-guide.md` (link to canonical plan path only if we change the filename), optionally `phases/phase-20.7-handoff.md` if it still references missing **`.cursor/plans/…`**.
- **Tombstone candidates (verify then edit):** root `VUE_MIGRATION_*.md`, `FEATURE_20_ARCHITECTURE_REDESIGN.md` header note (if agents treat it as “current execution order”), any second “Feature 20 ladder ends at 20.6” lines outside the extension note.

## Approach

1. Draft the **canonical close-out plan** markdown under the feature folder; link **20.7–20.13** to existing phase guides; replace broken **`.cursor/plans/…`** links with that path everywhere in Feature **20** harness docs.
2. Refresh **feature handoff**: **Current status** / **Next action** / dates / branch line so they match **session 20.7.1 in progress** (or **20.7.2** next after this session ends).
3. Grep for **`/feature-end`**, **“ladder ended”**, **`phase-start 20.7`** in Feature **20** docs; add one-paragraph **Superseded / use instead** banners with links to **`feature-domain-architecture-alignment-guide.md`** and the new master-plan file.

## Checkpoint

- After task **20.7.1.1**, every Feature **20** reference to the close-out plan resolves to a **file that exists in git**.
- After task **20.7.1.2**, **`feature-domain-architecture-alignment-handoff.md`** no longer reads like a template with placeholder **Feature Summary** / wrong **Next Action** for someone already in **20.7**.
- After task **20.7.1.3**, at least **one** high-traffic contradictory doc (if any) carries an explicit **extension ladder** pointer.

## Deliverables

- Committed **canonical close-out sequencing** markdown + updated links in feature/phase harness docs.
- Updated **feature handoff** (and minimal guide tweaks if the master-plan bullet path changes).
- **Tombstone/warning** edits on a verified short list (or explicit note in session log if none needed).

---

## Task 20.7.1.1 (source: task-20.7.1.1-planning.md)

### Story

**This task changes** harness documentation **because** several Feature **20** guides and handoffs link to a **Cursor plan path that does not exist in git**, so agents hit dead links when adopting the close-out ladder.

---

### Analysis

- **Problem / why now:** Without a **stable in-repo** sequencing anchor and aligned **Next Action** text, cascades and handoffs keep re-anchoring on **`/phase-start 20.7`** or vague “master plan” paths while the linked **`.cursor/plans/…`** file is absent.
- **Domains:** **Docs / harness only** — touches `.project-manager/features/domain-architecture-alignment/**` and possibly root markdown pointers; does **not** change **`client/`** unless we add a one-line README tombstone (prefer `.project-manager` first).
- **Child tasks:** Thin **task** plans: one for **canonical plan file + link normalization**, one for **feature handoff/guide + phase handoff stub updates**, one for **tombstone grep + targeted edits**.
- **Risks:** Over-editing historical archives; mitigate by **banner + link** rather than deleting content. Duplicating huge plan text in two places — mitigate with **one canonical `.project-manager/...` file** and relative links from feature/phase guides.

### Goal

Ship a **committed** canonical close-out plan document and update **all** Feature **20** harness references that pointed at the missing Cursor plan so they resolve in-repo.

### Files

- **Create:** `.project-manager/features/domain-architecture-alignment/architecture-alignment-closeout-master-plan.md`
- **Edit (link normalization):** `feature-domain-architecture-alignment-guide.md`, `phases/phase-20.7-guide.md`, `phases/phase-20.7-handoff.md`, `phases/phase-20.8-guide.md`, `phases/phase-20.9-guide.md`, `phases/phase-20.10-guide.md`  
- **Optional same-task:** `sessions/session-20.7.1-planning.md` / `phase-20.7-planning.md` prose that still says “glob not found” may be tightened to “see `architecture-alignment-closeout-master-plan.md`” **only if** touched while verifying links (keep scope minimal).

### Approach

1. Add **`architecture-alignment-closeout-master-plan.md`** with structure above.
2. Replace broken master-plan links in the six (or seven) harness files identified in recon.
3. Open each edited link in preview (relative path sanity) from `phases/` vs feature root.

### Checkpoint

- `rg 'architecture_alignment_closeout_master_plan|\.cursor/plans/architecture_alignment'` under **`.project-manager/features/domain-architecture-alignment/`** returns **no** hits (or only historical mentions inside the new file’s “replaced path” note if you add one).

### Deliverables

- New **master plan index** markdown file committed under the feature.
- Updated markdown links across Feature **20** harness docs so the close-out plan URL is always the new file.

### Acceptance Criteria

- [x] `architecture-alignment-closeout-master-plan.md` exists and links to **`phase-20.7-guide.md` … `phase-20.13-guide.md`**.
- [x] No remaining **harness** link in this feature folder targets **`/.cursor/plans/architecture_alignment_closeout_master_plan_20260403.plan.md`** (historical prose may remain in session/task planning artifacts and in the new file’s “Replaces” note).
- [ ] `npm run start:dev` still runs (docs-only change; not re-run at task-end — run before push if you want the smoke check on record).

### Design

1. **New file** `architecture-alignment-closeout-master-plan.md` at feature root:
   - Title + **Purpose** (canonical sequencing surface for phases **20.7–20.13**).
   - **Conflict rule** (align with `phase-20.7-guide.md`: analysis docs > this doc for architecture truth; this doc > informal forks for **order**).
   - Table or list: phase **20.x** → link to `./phases/phase-20.x-guide.md` for **x = 7..13**.
   - Pointers to `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md`, `FEATURE_20_ARCHITECTURE_REDESIGN.md`, `.project-manager/ARCHITECTURE.md`.
   - Short **Phase 0 / preflight** reminder (one paragraph) so the file is useful even before a long Cursor export is pasted.
2. **Link sweep:** In every file under the grep result set, replace the **`.cursor/plans/architecture_alignment_closeout_master_plan_20260403.plan.md`** bullet/link with a link to **`../architecture-alignment-closeout-master-plan.md`** (from `phases/`) or **`./architecture-alignment-closeout-master-plan.md`** (from feature root), matching each file’s location.

---

## Task 20.7.1.2 (source: task-20.7.1.2-planning.md)

### Story

**This task changes** feature and phase **handoff** documents (and a light **feature guide** consistency pass) **because** stale **Next Action** lines derail harness cascades after **`/session-start 20.7.1`** and **`/task-start 20.7.1.*`**.

---

### Analysis

- **Problem:** Feature and phase handoffs still read like **pre-20.7** templates (**Next Action:** run **`/phase-start 20.7`**; placeholder **Feature Summary**; **`feature/[name]`** branch).
- **Domains:** `.project-manager/features/domain-architecture-alignment/**` markdown only.
- **Dependency:** Close-out plan path is now **`./architecture-alignment-closeout-master-plan.md`** — handoffs should cite it by name, not “locked master plan” with no path.

### Goal

Align feature- and phase-level **handoff** narratives with **active** extension work and remove obvious template noise; add minimal **guide** wording so mandatory context matches the three canonical bullets.

### Files

- `feature-domain-architecture-alignment-handoff.md`
- `phases/phase-20.7-handoff.md`
- `feature-domain-architecture-alignment-guide.md` (§ Mandatory context only unless a one-line status clarification is needed)

### Approach

1. Edit **feature handoff** top matter and **Next Action** / **Git** / **Feature Summary** / **Related Documents** per Design.
2. Edit **phase-20.7-handoff** status and **Next Action** per Design.
3. Patch **feature guide** mandatory-context bullet(s).
4. Re-read both handoffs aloud as a harness user: would you run the wrong slash command?

### Checkpoint

- No **Next Action** in these files instructs **`/phase-start 20.7`** as the only path when work is already under **Session 20.7.1**.
- No **`feature/[name]`** or **`[List phase numbers]`** placeholders remain in **feature handoff** body.

### Deliverables

- Updated **feature** and **phase 20.7** handoffs + **feature guide** mandatory-context line.

### Acceptance Criteria

- [x] **`feature-domain-architecture-alignment-handoff.md`**: **Next Action** references continuing **Session 20.7.1** / next task and links **`architecture-alignment-closeout-master-plan.md`** by path.
- [x] **`phase-20.7-handoff.md`**: Phase reflects **in progress**; **Next Action** continues **Session 20.7.1** (no **`/phase-start 20.7`** as sole step).
- [x] **`feature-domain-architecture-alignment-guide.md`**: Mandatory context references **all canonical sources** in the guide header (three docs).
- [x] Docs-only; client **`npm run lint`** run at wrap (server lint at **`/task-end`** if you want both on record).

### Design

1. **Feature handoff**
   - **Last Updated:** today (ISO date).
   - **Feature Status:** In Progress — extension **20.7–20.13**; Phase **20.7** / Session **20.7.1** active (tasks **20.7.1.1** done; **20.7.1.2**–**20.7.1.3** pending unless already advanced).
   - **Current Status:** One short paragraph: pass **20.6** complete; close-out index committed; session **20.7.1** in flight.
   - **Next Action:** Point to **`session-20.7.1-guide.md`**, **`/task-start 20.7.1.3`** after this task, and **[`architecture-alignment-closeout-master-plan.md`](../architecture-alignment-closeout-master-plan.md)** — **not** **`/phase-start 20.7`**.
   - **Git Branch Status:** **`feature/domain-architecture-alignment`**, in progress (adjust merge lines to honest placeholders or remove if unknown).
   - **Feature Summary / Related Documents:** Replace **`[name]`** placeholders with **`domain-architecture-alignment`** or concise real bullets; remove lorem-style lines where possible.

2. **Phase 20.7 handoff**
   - **Phase Status:** In Progress (or Active).
   - **Next Action:** **`/session-start 20.7.1`** if not started — **else** continue **Session 20.7.1** / next task per session guide (wording that matches post-**phase-start** reality).
   - **What you need to start:** Already satisfied → reframe as “what you need **during** phase 20.7”.

3. **Feature guide**
   - **Mandatory context:** Change “**both** canonical documents” → **three** bullets (principles, redesign, close-out master plan index) or “all canonical sources in § Canonical sources above”.

---
