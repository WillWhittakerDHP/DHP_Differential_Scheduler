<!-- harness-planning-rollup tier=session id=20.7.3 consolidatedAt=2026-04-04T18:38:51.248Z -->

# Consolidated planning: session 20.7.3

## Session 20.7.3 (parent)

## Story

**This session delivers** a **cross-walked backlog** from preflight onto extension phase guides (**20.8–20.13**) **and** finishes the preflight doc (**§3–§4**) **so that** close-out execution phases have **owned rows** and a **complete evidence package**, without reopening finished **20.1–20.6** work.

**Estimated size:** M (docs-only; no product refactor unless filed as a later phase task).

---

## Analysis

- **Problem / why now:** Without guide-level backlog rows, **20.8+** agents re-derive gaps from scratch; preflight investment must **land visibly** in **`phase-20.x-guide.md`**.
- **Boundaries:** **`.project-manager/`** documentation only; no **`client/`** / **`server/`** product change unless a follow-on **task** under **20.8+** files it.
- **Dependencies:** **20.7.2** complete for **§1–§2**; **§3–§4** completed in this session.
- **Risks:** Duplicating long **20.1–20.6** narratives — **mitigate** with short bullets + links to **`preflight-evidence-20.7.2.md`** / **ARCHITECTURE.md**.

## Goal

1. **Backlog map:** For each **unknown** / **fail** / material **risk** in **`preflight-evidence-20.7.2.md` §§1–2**, ensure a corresponding **actionable bullet** appears under the **correct** phase guide (**20.8–20.13**), with link to canonical analysis (**ARCHITECTURE.md** / master plan).
2. **Finish preflight:** Write **`preflight-evidence-20.7.2.md` §3** (migration execution policy: workspace **localhost / shared DB** rule + pointer to **FEATURE_20** ordering) and **§4** (**`property_details`** vs time-configuration per **§10.4 / §12**).
3. **Harness surfaces:** Update **`phase-20.7-log.md`** (and **`phase-20.7-guide.md`** if needed) to state preflight package **complete**; refresh **`feature-domain-architecture-alignment-handoff.md`** / **`session-20.7.3-handoff.md`** — **Next action** toward **`/phase-start 20.8`**.
4. **`across-ladder.json`:** Add or adjust **session notes** for **20.7.3** if the ladder schema supports it; otherwise ensure **focusSessionId** / **nextTaskAcross** consistency after tasks complete.

## Files

- **Primary read/write:** `preflight-evidence-20.7.2.md`, `phases/phase-20.8-guide.md` … `phases/phase-20.13-guide.md`, `across-ladder.json`
- **Secondary:** `phases/phase-20.7-guide.md`, `phases/phase-20.7-log.md`, `phases/phase-20.7-handoff.md`, `feature-domain-architecture-alignment-handoff.md`, `session-20.7.3-handoff.md` (create/update), `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (ordering cite for §3)

## Approach

1. **Task 20.7.3.1:** Read **§2** table + **§1.4** risks; for each **owning phase**, add a **concise backlog subsection or bullets** to that phase’s guide; optional one-line **`across-ladder.json`** session note for **20.7.3**.
2. **Task 20.7.3.2:** Replace **§3** / **§4** stubs in **`preflight-evidence-20.7.2.md`**; update file intro to say **§3–§4** completed in **20.7.3**; update **`phase-20.7-log.md`** / handoffs.

## Checkpoint

- **Coverage check:** If the **Goal** is “preflight fully landed + guides carry backlog,” **two tasks** suffice: **(1)** guide crosswalk, **(2)** §3–§4 + harness handoff updates. **Gaps:** none for a doc-only session; product execution remains in **20.8+**.

## Deliverables

- [ ] Phase guides **20.8–20.13** contain visible **preflight-sourced** backlog items (no duplicate **20.1–20.6** essays).
- [ ] **`preflight-evidence-20.7.2.md`** §3 and §4 complete; intro cross-refs fixed.
- [ ] **`phase-20.7-log.md`** (and handoffs) reflect completion and point to **`/phase-start 20.8`**.

## Acceptance Criteria

- [ ] Every **unknown** / **fail** row in preflight **§2** has a **matching** backlog bullet (or explicit “already tracked” note) in the **intended** phase guide.
- [ ] **§1** risks (**parentKind**, dual admin surfaces, **part_shape** keying) reflected under **20.8 / 20.9 / 20.10** as appropriate.
- [ ] **§3** cites migration authority (**localhost** vs shared DB) and **FEATURE_20** ordering; **§4** cites **ARCHITECTURE** §10.4 / §12.
- [ ] No **`client/`** / **`server/`** code changes unless separately justified (out of scope).

---

## Task 20.7.3.1 (source: task-20.7.3.1-planning.md)

### Story

**This task updates** six **phase guides** under Feature **20** **because** preflight conclusions must be **visible** on the extension ladder before **`/phase-start 20.8`**, not buried only in **`preflight-evidence-20.7.2.md`**.

---

### Analysis

- **Problem / why now:** Without guide-level backlog rows, **20.8+** agents re-derive gaps from scratch; preflight investment must **land visibly** in **`phase-20.x-guide.md`**.
- **Boundaries:** **`.project-manager/`** documentation only; no **`client/`** / **`server/`** product change unless a follow-on **task** under **20.8+** files it.
- **Dependencies:** **20.7.2** complete for **§1–§2**; **§3–§4** completed in this session.
- **Risks:** Duplicating long **20.1–20.6** narratives — **mitigate** with short bullets + links to **`preflight-evidence-20.7.2.md`** / **ARCHITECTURE.md**.

### Goal

After this task, each **owning phase** guide (**20.8–20.13**) lists **its** preflight-sourced items with a link to **`../preflight-evidence-20.7.2.md`** (or repo-relative equivalent) and **`.project-manager/ARCHITECTURE.md`** where relevant.

### Files

- **Edit:** `phases/phase-20.8-guide.md` … `phases/phase-20.13-guide.md`
- **Optional edit:** `across-ladder.json` (only if structure supports session notes without breaking consumers)
- **Read-only:** `preflight-evidence-20.7.2.md`

### Approach

1. Open **`preflight-evidence-20.7.2.md`** §2 table; group rows by **Owning phase** column.
2. Merge **§1.4** three risks into the same groups (**20.8–20.10** primarily).
3. Patch each **`phase-20.x-guide.md`** with **3–8 bullets** max per phase (no copy-paste of full §2 table).
4. If **`across-ladder.json`** has a safe field for **20.7.3**, add one line; else omit.

### Checkpoint

- A reader opening **`phase-20.10-guide.md`** sees **lineage / zero-out / property_details** follow-ups without opening preflight first (preflight remains authoritative for detail).

### Deliverables

- Six phase guides updated (**20.8–20.13**).
- Optional **`across-ladder.json`** touch documented in task-end notes if done.

### Acceptance Criteria

- [ ] Every **§2** row with **unknown** (and **fail** if any) has a **matching** bullet in the guide for its **Owning phase** column.
- [ ] **§1.4** risks (**parentKind**, dual admin **`eventAssignments`**, **part_shape** map) appear under **20.8** / **20.9** / **20.10** as appropriate.
- [ ] No changes to **`preflight-evidence-20.7.2.md` §3–§4** in this task diff.
- [ ] No **`client/`** / **`server/`** product code.

### Design

1. For **phase 20.8:** map §2 rows tagged **20.8** (**§14.1**, **§14.3**, **§14.3a–c**) + **§1** risks that imply **API/schema/event routing** integrity.
2. For **20.9:** **§14.2a–c**, **§14.6**, admin/orchestration semantics + **§1.4** dual admin surface coordination.
3. For **20.10:** **§14.3d**, **§14.3g**, **§10.3** zero-out, **§14.4a–c**, **§14.5** (pointer until §4 lands), **§1.4** **part_shape** / booking pipeline risks.
4. For **20.11:** migration/narrative follow-ups only if preflight implies **seed/conversion** (light pointer; heavy prose in **§3** is **20.7.3.2**).
5. For **20.12:** vocabulary/cleanup pointers only if a risk is “retire alias” (optional; may be empty).
6. For **20.13:** doc reconciliation / truth alignment pointer for **§2** **unknown**s that are **doc-verification** shaped.
7. **`across-ladder.json`:** If JSON has **`notes`** / **`description`** per session, set **20.7.3** to *“Crosswalk preflight → phase guides 20.8–20.13 (task 20.7.3.1).”* If not, **skip** JSON (no invalid keys).

---

## Task 20.7.3.2 (source: task-20.7.3.2-planning.md)

### Story

**This task finishes** the **preflight narrative** and **harness transition text** **so that** agents can run **`/phase-end 20.7`** / **`/phase-start 20.8`** with a **single** canonical evidence path and **no** stub sections.

---

### Analysis

- **Problem / why now:** Preflight evidence is incomplete without **§3–§4**; phase **20.7** log/handoff must state **package complete** and point to **20.8**.
- **Boundaries:** **`.project-manager/`** markdown only.
- **Dependencies:** **20.7.3.1** complete.

### Goal

Deliver a **non-stub** **`preflight-evidence-20.7.2.md`** §3 and §4 and **updated handoffs** so the feature is ready for **phase 20.8** execution.

### Files

- **Edit:** `preflight-evidence-20.7.2.md`, `phases/phase-20.7-log.md`, `feature-domain-architecture-alignment-handoff.md`, `sessions/session-20.7.3-handoff.md` (create if missing)
- **Optional edit:** `phases/phase-20.7-guide.md`
- **Read-only:** `ARCHITECTURE.md`, `FEATURE_20_ARCHITECTURE_REDESIGN.md`, `.cursor/rules` (migration rule)

### Approach

1. Draft §3 / §4 in preflight; fix cross-refs in §2.1 “Next” line.
2. Update logs/handoffs.
3. **Do not** modify `across-ladder.json` unless **`nextTaskAcross`** must advance (harness may refresh at **`/task-end`**).

### Checkpoint

- Reader can answer “Where is migration policy?” and “Where is **`property_details`** boundary?” from **only** `preflight-evidence-20.7.2.md` §3–§4.

### Deliverables

- **`preflight-evidence-20.7.2.md`** — §3, §4 complete; intro updated.
- **`phase-20.7-log.md`** — session **20.7.3** noted.
- **`feature-domain-architecture-alignment-handoff.md`** + **`session-20.7.3-handoff.md`** — next phase **20.8**.

### Acceptance Criteria

- [ ] §3 cites **localhost / shared DB** migration authority and **FEATURE_20** ordering reference.
- [ ] §4 cites **ARCHITECTURE** §10.4 / §12 and at least one **client** booking path for `propertyDetails` (path only).
- [ ] No **`client/`** / **`server/`** code changes.
- [ ] Handoffs list **`/phase-start 20.8`** as next harness step after **`/phase-end 20.7`**.

### Design

1. **`preflight-evidence-20.7.2.md`:** Replace **§3** with: who may run migrations (`DB_HOST` **localhost** / **127.0.0.1**); shared DB consumers **must not** run DDL; **author** migrations on any machine, **execute** on host per rules; pointer to **FEATURE_20** / **20.11** for conversion narrative.
2. Replace **§4** with: **`property_details`** = appointment-scoped **inputs** (MLS / wizard); time atomics = **rates**; product = rate × input → duration contribution; cite **ARCHITECTURE** §10.4 / §12; link booking builders for evidence.
3. **Intro paragraph:** State **§3–§4** completed in **session 20.7.3** (not “task 20.7.2.3”); remove stale “**§3–§4** remain for task **20.7.2.3**” line.
4. **`phase-20.7-log.md`:** Append session **20.7.3** outcome + pointer to full preflight + **next: `/phase-start 20.8`**.
5. **`feature-domain-architecture-alignment-handoff.md`**, **`session-20.7.3-handoff.md`:** **Current status**, **Next action** = **`/phase-end 20.7`** then **`/phase-start 20.8`** (with feature slug); **Transition context** — preflight complete, backlog in phase guides **20.8–20.13**.
6. **`phase-20.7-guide.md`:** Optional — mark Session **20.7.3** tasks complete if checklist format exists.

---
