<!-- harness-planning-rollup tier=session id=20.5.3 consolidatedAt=2026-04-03T00:34:16.699Z -->

# Consolidated planning: session 20.5.3

## Session 20.5.3 (parent)

## Story

**This session delivers** a written **legacy → target** closure (**§0.2** + **§2**), a **`### Admin metadata retirement (Pass 5 narrative)`** subsection in the worklog (ordering for **full** metadata stack removal per **§8.5** / **§6.3a**), and a **four-row §8.5** traceability table **so that** **FEATURE_20 §8.5 Pass 5** acceptance checks are demonstrably met in-repo and **phase 20.6** can start without undocumented migration assumptions.
**Estimated size:** **S** (analysis docs + one phase handoff file; **no** app code).

---

## Analysis

- **Why now:** **20.5.1–20.5.2** documented **sequence** and **baseline routing**; **20.5.3** is the **closure** pass: map **legacy assumptions** to **replacements** and prove **§8.5** is satisfied before **20.6** deletes code.
- **Boundaries:** **`.project-manager/analysis/`** + **`phase-20.5-handoff.md`** only unless a guide checkbox must flip; **no** `client/` / `server/` product edits planned.
- **Risks:** Over-long worklog — keep new sections **tabular + bullets**; duplicate **FEATURE_20** text — prefer **pointers** + one closure table.

## Goal

1. Add **`### Legacy assumption closure (session 20.5.3)`** to **`DOMAIN_REWRITE_WORKLOG.md`** with:
   - **`#### §0.2 legacy assumptions → replacement`** — table: assumption (quote or paraphrase from **FEATURE_20** §0.2) | **removed / replaced by** | **evidence** (worklog anchor, migration filename, or “client/server — phase 20.x”).
   - **`#### §2 model targets vs legacy (closure)`** — short table or bullets mapping **§2.2–§2.5** “survive / drop / add” themes to **Checkpoint 9** / **061–062** / three-property migrations (**059–060**), without re-pasting the full **FEATURE_20** §2.
   - **`#### Migration implicit-default audit`** — explicit statement that **`20260432_*`** steps are **idempotent / data-moving** per file headers and **do not** rely on undocumented Sequelize defaults for routing; cite **20.5.2** baseline + **§9.6** mitigation for orchestrator graphs.
2. Ensure **`### Admin metadata retirement (Pass 5 narrative)`** exists in **`DOMAIN_REWRITE_WORKLOG.md`** (before the §8.5 acceptance table) with models/routes pointers and **ordering**; **no** required product code in **20.5.3**.
3. Add or update **`### FEATURE_20 §8.5 acceptance (session 20.5.3)`** with a **four-row** table mapping each **§8.5** acceptance bullet (including **admin metadata retirement** traceability) → **satisfied by** (worklog heading / table) → **notes**.
4. Update **`.project-manager/features/domain-architecture-alignment/phases/phase-20.5-handoff.md`**: **Current Status**, **Next Action** → **`/phase-start 20.6`**, **Transition Context** (Pass 5 metadata narrative + **20.6** execution), **Last Updated**; optionally tick session **20.5.3** in **`phase-20.5-guide.md`** at **session-end** (task **20.5.3.2** or harness).

## Files

- **Read:** `FEATURE_20_ARCHITECTURE_REDESIGN.md` (§0.2, §2 headers, §8.5), `DOMAIN_REWRITE_WORKLOG.md`
- **Write:** `DOMAIN_REWRITE_WORKLOG.md`, `phases/phase-20.5-handoff.md` (and `phases/phase-20.5-guide.md` checkbox if not auto-updated by harness at session-end)

## Approach

1. **`/accepted-plan`** → **`/task-start 20.5.3.1`** → **`/accepted-code`** → append **§0.2 / §2 / implicit-default audit** sections to worklog → **`/task-end`**.
2. **`/task-start 20.5.3.2`** → **`/accepted-code`** → ensure **`### Admin metadata retirement (Pass 5 narrative)`** + **four-row §8.5** acceptance table → update **phase handoff** (and guide checkbox) → **`/task-end`**.
3. **`/session-end 20.5.3`** → push flow per harness.

## Checkpoint

- **`/accepted-plan`** → task cascade **20.5.3.1** → **20.5.3.2** → **`/session-end 20.5.3`**.

## Deliverables

- **`### Legacy assumption closure`**, **`### Admin metadata retirement (Pass 5 narrative)`**, and **`### FEATURE_20 §8.5 acceptance`** ( **four** rows) in **`DOMAIN_REWRITE_WORKLOG.md`**.
- Updated **`phase-20.5-handoff.md`** ready for **`/phase-start 20.6`**.

## Acceptance Criteria

- [ ] Every **§0.2** bullet has a **row** (or explicit **N/A** + reason) in the closure table.
- [ ] **§8.5** **four** acceptance checks each **map** to a specific worklog anchor (row 4 → **`### Admin metadata retirement (Pass 5 narrative)`**).
- [ ] **Implicit-default audit** references **20.5.2** baseline narrative and does not claim migrations seed full tenant graphs.
- [ ] **Phase handoff** lists **Next Action** **`/phase-start 20.6`** with accurate **Transition Context** (incl. admin metadata narrative + **20.6** owns execution).

---

## Task 20.5.3.1 (source: task-20.5.3.1-planning.md)

### Story

**This task appends** **`### Legacy assumption closure (session 20.5.3)`** to the worklog **because** **FEATURE_20** §0.2 / §2 must be **traceable** to migrations + prior narrative (**Checkpoint 9**, **20.5.2**) before **20.5.3.2** can sign **§8.5** and the phase handoff.

---

### Analysis

- **Why now:** **20.5.1–20.5.2** documented **sequence** and **baseline routing**; **20.5.3** is the **closure** pass: map **legacy assumptions** to **replacements** and prove **§8.5** is satisfied before **20.6** deletes code.
- **Boundaries:** **`.project-manager/analysis/`** + **`phase-20.5-handoff.md`** only unless a guide checkbox must flip; **no** `client/` / `server/` prod… _(truncated)_

### Goal

Add **`### Legacy assumption closure (session 20.5.3)`** with the **three `####` subsections** above to **`DOMAIN_REWRITE_WORKLOG.md`**. **Do not** add **`### FEATURE_20 §8.5 acceptance`** or edit **`phase-20.5-handoff.md`** in this task.

### Files

- **Read:** `FEATURE_20_ARCHITECTURE_REDESIGN.md` (§0.2, §2), `DOMAIN_REWRITE_WORKLOG.md`
- **Write:** `DOMAIN_REWRITE_WORKLOG.md`

### Approach

1. Open worklog; scroll to **`### Baseline placement & event routing`**; append new **`###`** after **§9.6 mitigation** `####`.
2. Build §0.2 table from **FEATURE_20** lines 41–48 (paraphrase OK).
3. Build §2 closure table from **§2.2–§2.5** headings (themes, not full column lists).
4. Write implicit-default audit referencing **`### Baseline placement`** and **`#### FEATURE_20 §9.6 mitigation`**.

### Checkpoint

- **`/accepted-code`** → implement → **`/task-end 20.5.3.1`** → **`/task-start 20.5.3.2`**.

### Deliverables

- **`### Legacy assumption closure (session 20.5.3)`** in **`DOMAIN_REWRITE_WORKLOG.md`**.

### Acceptance Criteria

- [ ] **Six** §0.2 rows (or explicit **N/A** + reason — expect **six** filled).
- [ ] §2 closure covers **enum**, **three-property**, **relational `event_assignments`**, **drops** (JSON overrides / shape booleans / differential_role), **attendee rename** — without pasting full §2.
- [ ] Implicit-default audit **links** to **20.5.2** baseline + **§9.6 mitigation** headings.
- [ ] **No** **`### FEATURE_20 §8.5 acceptance`** and **no** `phase-20.5-handoff.md` edits in this diff.

### Design

Append **after** the last subsection of **`### Baseline placement & event routing (session 20.5.2)`** (after **`#### FEATURE_20 §9.6 mitigation`**):

1. **`### Legacy assumption closure (session 20.5.3)`**
2. **`#### §0.2 legacy assumptions → replacement`** — markdown table with **6 rows** (one per §0.2 bullet).
3. **`#### §2 model targets vs legacy (closure)`** — compact table: **Theme** (e.g. enum rename, three-property, relational events, drops) | **FEATURE_20 §2 ref** | **Evidence** (migrations **058–062**, **034–036**, **051–055**, **035**, worklog **Checkpoint 9**).
4. **`#### Migration implicit-default audit`** — bullets: migrations state **explicit** DDL/data moves; routing graphs per **20.5.2**; no reliance on undocumented ORM null semantics for **`event_assignments`**.

---

## Task 20.5.3.2 (source: task-20.5.3.2-planning.md)

### Story

**This task records FEATURE_20 §8.5 Pass 5 acceptance in the worklog and updates the phase handoff** **because** **20.5.3.1** closed **§0.2 / §2** traceability — **§8.5** must now **map to headings** (not chat-only) and **phase 20.5** must hand off to **20.6**.

---

### Analysis

- **Why now:** **20.5.1–20.5.2** documented **sequence** and **baseline routing**; **20.5.3** is the **closure** pass: map **legacy assumptions** to **replacements** and prove **§8.5** is satisfied before **20.6** deletes code.
- **Boundaries:** **`.project-manager/analysis/`** + **`phase-20.5-handoff.md`** only unless a guide checkbox must flip; **no** `client/` / `server/` prod… _(truncated)_

### Goal

1. Ensure **`### Admin metadata retirement (Pass 5 narrative)`** is present in **`DOMAIN_REWRITE_WORKLOG.md`** (immediately **before** the §8.5 acceptance table unless a clearer anchor is documented).
2. Add or update **`### FEATURE_20 §8.5 acceptance (session 20.5.3)`** as a **four-row** table (fourth row → admin metadata narrative).
3. Update **`phases/phase-20.5-handoff.md`** for **`/phase-start 20.6`** (transition mentions metadata narrative + **20.6**).
4. Mark **Session 20.5.3** complete in **`phases/phase-20.5-guide.md`** when applicable.

### Files

- **Read:** `FEATURE_20_ARCHITECTURE_REDESIGN.md` (§8.5), `DOMAIN_REWRITE_WORKLOG.md`, `phases/phase-20.5-handoff.md`
- **Write:** `DOMAIN_REWRITE_WORKLOG.md`, `phases/phase-20.5-handoff.md`, `phases/phase-20.5-guide.md` (checkbox only)

### Approach

1. Append **`### Admin metadata retirement (Pass 5 narrative)`** after **`### Legacy assumption closure`** (before **`### FEATURE_20 §8.5 acceptance`**) if missing — compact tables per **phase-20.5-guide** session **20.5.3** tasks.
2. Add or extend **`### FEATURE_20 §8.5 acceptance (session 20.5.3)`** with a **fourth** row for the **§8.5** admin-metadata acceptance bullet → **`### Admin metadata retirement (Pass 5 narrative)`**.
3. Edit **phase handoff** minimal sections per **Design**.
4. Tick **20.5.3** in **phase-20.5-guide.md**.

### Checkpoint

- **`/accepted-code`** → implement → **`/task-end 20.5.3.2`** → **`/session-end 20.5.3`**.

### Deliverables

- **`### Admin metadata retirement (Pass 5 narrative)`** + **`### FEATURE_20 §8.5 acceptance (session 20.5.3)`** (**four** rows) in worklog.
- Updated **`phase-20.5-handoff.md`** + **20.5.3** checkbox in **`phase-20.5-guide.md`**.

### Acceptance Criteria

- [ ] Table has **exactly four** rows aligned to **FEATURE_20** §8.5 acceptance list (including admin metadata narrative).
- [ ] Each row’s **satisfied by** column names **real** worklog **`###` / `####`** headings.
- [ ] **phase-20.5-handoff** **Next Action** is **`/phase-start 20.6`** with accurate transition text (metadata narrative documented; **20.6** executes removal).
- [ ] **Do not** re-edit **`### Legacy assumption closure`** body unless a broken cross-reference is found.

### Design

1. **`### FEATURE_20 §8.5 acceptance (session 20.5.3)`** markdown table:
   - Row 1: *Migration notes describe how baseline event routing is established explicitly* → **`### Baseline placement & event routing`**, **`#### FEATURE_20 §9.6 mitigation`**, **`#### Addressed (session 20.5.2)`**, **§9.5** crosswalk **Notes**.
   - Row 2: *Legacy assumptions listed in section 2 are either removed or mapped* → **`### Legacy assumption closure`** (**§0.2** + **§2** tables).
   - Row 3: *No migration step depends on undocumented implicit defaults* → **`#### Migration implicit-default audit`** + **Checkpoint 9** narrative.
   - Row 4: *Admin metadata retirement narrative traceable + ordering* → **`### Admin metadata retirement (Pass 5 narrative)`**.
2. **`phase-20.5-handoff.md`:** Set **Last Updated**, **Session / phase status** (20.5 doc pass complete), **Next Action** **`/phase-start 20.6`**, **Transition Context** (worklog §8.5 + legacy closure + **admin metadata** Pass 5 narrative; **20.6** implements **§6.3a**).
3. **`phase-20.5-guide.md`:** Change **Session 20.5.3** checkbox from `[ ]` to `[x]` if still open.

---
