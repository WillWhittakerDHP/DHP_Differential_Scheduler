<!-- harness-planning-rollup tier=session id=20.5.1 consolidatedAt=2026-04-03T00:00:44.361Z -->

# Consolidated planning: session 20.5.1

## Session 20.5.1 (parent)

## Story

**This session delivers** a **traceable migration narrative** (ordered files + **§9.5** crosswalk) **so that** **20.5.2** can document **baseline routing/seeds** without guessing order, and **§8.5** acceptance stays auditable.
**Estimated size:** S–M (docs + table; no app code unless explicitly scoped later).

---

## Analysis

- **Why now:** **§8.5** / **§9.5** require an **explicit** sequence; code exists but the **narrative** was fragmented across phase logs.
- **Boundaries:** **`.project-manager/analysis/`** + migration **filenames** as evidence; **no** client/server product code in **20.5.1** unless a task discovers a **blocking** doc error (then note follow-up, do not expand scope silently).
- **Child tasks:** Prefer **small commits**: inventory markdown first, then crosswalk table.
- **Risks:** Mis-ordering migrations in prose could mislead operators — mitigate by **copying numeric order from filesystem** and citing file names.
- **Alternatives:** New **`MIGRATION_SEQUENCE.md`** only — deferred unless worklog becomes too long (**>~100 lines** added).

## Goal

1. **Ordered inventory** of all **`20260432_*.mjs`** migrations with **one-line purpose** each, grouped so **§9.5** ordering is visible (type rename → three-property on instances → placement + event-instance schema → relational routing preserved).
2. **Crosswalk table:** each **FEATURE_20 §9.5** bullet → **migration id(s)** or **`none (document gap)`**.
3. **Canonical home decision:** add a new section to **`DOMAIN_REWRITE_WORKLOG.md`** *or* create **`MIGRATION_SEQUENCE.md`** — record the decision in the same PR/commit as the table.

## Files

- **Read:** `FEATURE_20_ARCHITECTURE_REDESIGN.md` §1, §2, §9.5; `phases/phase-20.5-guide.md`
- **Write:** `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md` (preferred) **or** `.project-manager/analysis/MIGRATION_SEQUENCE.md`; optional one-line pointer from `phases/phase-20.5-planning.md` if split file wins
- **Evidence (read-only):** `server/src/db/migrations/20260432_*.mjs`

## Approach

1. **Task 20.5.1.1:** Sort migrations lexicographically; annotate **Feature 20 relevance** (core / adjacent / unrelated-but-same-prefix); map **§1** enum rename and **§2** schema targets to specific files.
2. **Task 20.5.1.2:** Author **§9.5** crosswalk + **ordered narrative paragraph**; append to chosen doc; list **explicit gaps** for **20.5.2** (baseline seeds / orchestrator language).
3. Do **not** run DB migrations from agent unless **DB_HOST** is local (project policy).

## Checkpoint

- After **`/accepted-plan`:** run **`/task-start 20.5.1.1`**, then **`/accepted-code`** for each task before implementation; **`/task-end`** per task; **`/session-end 20.5.1`** when both tasks complete.
- Session-end: phase guide checkbox for **20.5.1**; session log/handoff per harness.

## Deliverables

- Updated **`DOMAIN_REWRITE_WORKLOG.md`** (or new **`MIGRATION_SEQUENCE.md`**) containing **Checkpoint / section: Feature 20 — `20260432` migration sequence** with ordered list + **§9.5** table.
- Short **gaps** list (bullets) handed to **20.5.2**.

## Acceptance Criteria

- [ ] Every **`20260432_*.mjs`** file appears in the inventory or is explicitly excluded with reason (e.g. out-of-scope auth-only).
- [ ] Each **§9.5** line from **FEATURE_20** has a table row with **migration pointer** or **`gap:`** note.
- [ ] **Canonical doc choice** is stated in prose (not only in chat).
- [ ] No claim that **baseline event-orchestrator** data is fully specified **in this session** (that is **20.5.2**).

---

## Task 20.5.1.1 (source: task-20.5.1.1-planning.md)

### Story

**This task adds** a single **ordered inventory section** for all **`20260432_*.mjs`** migrations (one-line purpose + Feature 20 relevance tags) **to** **`DOMAIN_REWRITE_WORKLOG.md`**, **because** **§8.5 / §9.5** need a traceable sequence before **20.5.1.2** can author the **§9.5** crosswalk table.

---

### Analysis

- **Why now:** **§8.5** / **§9.5** require an **explicit** sequence; code exists but the **narrative** was fragmented across phase logs.
- **Boundaries:** **`.project-manager/analysis/`** + migration **filenames** as evidence; **no** client/server product code in **20.5.1** unless a task discovers a **blocking** doc error (then note follow-up, do not expand scope silently).
- **C… _(truncated)_

### Goal

Produce an **ordered, tagged inventory** of every **`server/src/db/migrations/20260432_*.mjs`** file in **lexicographic run order**, each with a **one-line purpose** and **Feature 20 relevance** tags (**§1**, **§2**, **core**, **adjacent**, **other**), **appended to** **`DOMAIN_REWRITE_WORKLOG.md`**.

### Files

- **Write:** `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md`
- **Read (evidence):** `server/src/db/migrations/20260432_*.mjs`

### Approach

1. Confirm file list via `ls` / glob (28 files).
2. Draft list from each file’s leading comment (trim to one line where multi-line).
3. Tag each row: **§1** = block shape type enum rename (**058**); **§2** = schema targets in **FEATURE_20** §2 (esp. **059–062**, parts of **034–036**, **051**); **adjacent** = auth / user_role / wizard copy / availability / differential enum not central to §2 table; **other** when none apply.
4. Paste into worklog; no migration execution.

### Checkpoint

- **`/accepted-code`** → implement doc edit → **`/task-end 20.5.1.1`** → cascade **`/task-start 20.5.1.2`**.

### Deliverables

- New **Checkpoint / section** in **`DOMAIN_REWRITE_WORKLOG.md`** containing the full ordered inventory.

### Acceptance Criteria

- [ ] All **28** `20260432_*.mjs` files appear **once**, in **lexicographic** order.
- [ ] Each line includes **filename** + **one-line purpose** + at least one **tag** (**§1**, **§2**, **core**, **adjacent**, or **other**).
- [ ] **No** §9.5 crosswalk table in this task (that is **20.5.1.2**).
- [ ] **No** application source changes outside **`.project-manager/analysis/`**.

### Design

1. Open **`DOMAIN_REWRITE_WORKLOG.md`**, append **`## Checkpoint 6 — Feature 20: `20260432` ordered migration inventory (task 20.5.1.1)`** (or sibling heading if Checkpoint 6 exists — bump number).
2. Subsection **Run order (lexicographic)** — numbered list: **`filename`** — one-line purpose (from migration header) — tags: **`§1`** | **`§2`** | **`core`** | **`adjacent`** | **`other`** (use `core` when both §1 and §2 touched in one file, e.g. **061**).
3. Optional short **Grouping callout** (markdown) grouping **034–036** (relational event), **051–055** (valid_*), **058–062** (phase 20.1 tranche) without re-sorting (order stays filename order).

---

## Task 20.5.1.2 (source: task-20.5.1.2-planning.md)

### Story

**This task adds** the **FEATURE_20 §9.5 crosswalk** (table + short narrative + **§9.6** mitigation pointer) **to** **`DOMAIN_REWRITE_WORKLOG.md`** **because** **§8.5** acceptance requires every migration note to map to **concrete** migration ids and to surface **gaps** (especially **baseline event-orchestrator** prose) for **session 20.5.2**.

---

### Analysis

- **Why now:** **§8.5** / **§9.5** require an **explicit** sequence; code exists but the **narrative** was fragmented across phase logs.
- **Boundaries:** **`.project-manager/analysis/`** + migration **filenames** as evidence; **no** client/server product code in **20.5.1** unless a task discovers a **blocking** doc error (then note follow-up, do not expand scope silently).
- **C… _(truncated)_

### Goal

- Map **each** of the **five** **§9.5** bullets to **migration file id(s)** and/or a **`gap:`** line.
- Add **concise** narrative + **20.5.2** gap list + **canonical home** statement.
- Reference **§9.6** “implicit default routing” mitigation as **partially** addressed by **061** placement seeds + **035** relational parent rule; **remainder** in **20.5.2**.

### Files

- **Read:** `FEATURE_20_ARCHITECTURE_REDESIGN.md` §9.5–§9.6; `DOMAIN_REWRITE_WORKLOG.md` (Checkpoint 9)
- **Write:** `DOMAIN_REWRITE_WORKLOG.md`

### Approach

1. Copy §9.5 bullets verbatim or tight paraphrase into table left column.
2. Fill rows using Checkpoint 9 tags + migration headers; use **`gap:`** where orchestrator baseline is not migration-documented.
3. Add narrative + gaps + canonical home subsections.
4. No code or migration execution.

### Checkpoint

- **`/accepted-code`** → edit worklog → **`/task-end 20.5.1.2`** → **`/session-end 20.5.1`**.

### Deliverables

- **`DOMAIN_REWRITE_WORKLOG.md`** updated with **§9.5 crosswalk**, **narrative**, **gaps for 20.5.2**, **canonical home** note.

### Acceptance Criteria

- [ ] Table has **exactly five** rows (one per **§9.5** bullet).
- [ ] Every row has **at least one** of: migration id(s), **`none`**, or **`gap:`** explanation.
- [ ] **Gaps for 20.5.2** mentions **baseline event-orchestrator** explicitly.
- [ ] **Canonical home** sentence present (**worklog**, not new file).
- [ ] No changes outside **`.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md`**.

### Design

1. Under **`DOMAIN_REWRITE_WORKLOG.md`** after **Checkpoint 9** content, add **`### FEATURE_20 §9.5 migration crosswalk (task 20.5.1.2)`**.
2. **Table** with columns: **§9.5 bullet (paraphrase)** | **Primary migrations** | **Supporting / prerequisite** | **Notes or `gap:`**.
3. **Narrative:** 1 short paragraph stating **§9.5 logical order** vs **full `20260432` lex order** (operators run all pending migrations; Feature 20 tranche is **058–062** with prerequisites **034–036**, **051–055**).
4. **`### Gaps for session 20.5.2`** — bullets: e.g. explicit **event-orchestrator baseline** data definition; optional **seeders/** audit; **§9.6** mitigation sentence referencing planned **20.5.2** prose.
5. **`### Canonical narrative home`** — one sentence: **continue in `DOMAIN_REWRITE_WORKLOG.md`**; **no** `MIGRATION_SEQUENCE.md` for this pass.

---
