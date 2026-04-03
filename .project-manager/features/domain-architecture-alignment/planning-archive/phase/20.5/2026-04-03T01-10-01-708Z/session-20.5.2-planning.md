<!-- harness-planning-rollup tier=session id=20.5.2 consolidatedAt=2026-04-03T00:08:34.319Z -->

# Consolidated planning: session 20.5.2

## Session 20.5.2 (parent)

## Story

**This session delivers** written **baseline placement + event routing** expectations for **new and upgraded** databases **so that** **§8.5** / **§9.6** are not satisfied only by migrations list — operators know what **configuration rows** legitimately establish routing vs what **admin/product** must create.
**Estimated size:** S (documentation only; **no** Sequelize seeders directory exists in repo today).

---

## Analysis

- **Why now:** **20.5.1.2** left **`gap:`** for orchestrator baseline; **§9.6** requires explicit mitigation language.
- **Boundaries:** **`.project-manager/analysis/`** only; cite **migrations** by id, do not change them.
- **Risks:** Claiming migrations insert full routing graphs — **avoid**; state **admin + validity graph** responsibility clearly.

## Goal

1. Append **`### Baseline placement & event routing (session 20.5.2)`** to **`DOMAIN_REWRITE_WORKLOG.md`** with: **Fresh DB after full `20260432` migrate**, **Upgraded DB**, **Placement-type seeds (061)**, **Relational routing (`event_assignments`)**, **Orchestrator baseline vs profile override** (align **FEATURE_20** §1.2 / §5.x vocabulary).
2. Replace or annotate **`#### Gaps for session 20.5.2`** so items are **resolved in prose** (or marked **N/A** with reason — e.g. no seeders dir).
3. Add **§9.6 mitigation** paragraph: implicit default routing is avoided by documenting that **no** server path invents `event_assignments`; baseline comes from **stored graph + admin selections**, with **061** only guaranteeing **placement catalog** seeds.

## Files

- **Read:** `FEATURE_20_ARCHITECTURE_REDESIGN.md` (§1.2, §5.2, §9.6), `DOMAIN_REWRITE_WORKLOG.md` (Checkpoint 9 + crosswalk + gaps)
- **Write:** `DOMAIN_REWRITE_WORKLOG.md` only

## Approach

1. **Task 20.5.2.1:** Draft the **Baseline placement & event routing** section (subsections per **Goal**).
2. **Task 20.5.2.2:** Add **§9.6 explicit mitigation**; update **Gaps for session 20.5.2** block to **“Addressed (20.5.2)”** with pointers to subsection anchors; optional one-line **seeders: none in repo**.
3. **§9.1** skim after edits (orchestrator = selector language only).

## Checkpoint

- **`/accepted-plan`** → **`/task-start 20.5.2.1`** → **`/accepted-code`** → implement → **`/task-end`** → **`/task-start 20.5.2.2`** → repeat → **`/session-end 20.5.2`**.

## Deliverables

- Updated **`DOMAIN_REWRITE_WORKLOG.md`** with new section + closed/annotated gaps + §9.6 mitigation.

## Acceptance Criteria

- [ ] **Fresh** and **upgraded** DB expectations each have a short subsection.
- [ ] **061** placement seeds described; no false claim that migrations seed all **`event_assignments`**.
- [ ] **`event_assignments`** + **orchestrator baseline** language matches **FEATURE_20** (no scalar part event columns).
- [ ] **Seeders:** explicit statement (**none** under `server/src/db/seeders` today) or list if found.
- [ ] **§9.6** mitigation paragraph present.
- [ ] Edits confined to **`DOMAIN_REWRITE_WORKLOG.md`**.

---

## Task 20.5.2.1 (source: task-20.5.2.1-planning.md)

### Story

**This task adds** the main **baseline placement & event routing** prose to **`DOMAIN_REWRITE_WORKLOG.md`** **because** **20.5.1.2** deferred orchestrator/placement semantics to **20.5.2** and splitting **narrative** (**20.5.2.1**) from **risk/gap closure** (**20.5.2.2**) keeps task-end diffs reviewable.

---

### Analysis

- **Why now:** **20.5.1.2** left **`gap:`** for orchestrator baseline; **§9.6** requires explicit mitigation language.
- **Boundaries:** **`.project-manager/analysis/`** only; cite **migrations** by id, do not change them.
- **Risks:** Claiming migrations insert full routing graphs — **avoid**; state **admin + validity graph** responsibility clearly.

### Goal

Append **`### Baseline placement & event routing (session 20.5.2)`** with the **five `####` subsections** listed in **Design** to **`DOMAIN_REWRITE_WORKLOG.md`**, **without** modifying **`#### Gaps for session 20.5.2`** or adding the **§9.6** mitigation block (**20.5.2.2**).

### Files

- **Read:** `FEATURE_20_ARCHITECTURE_REDESIGN.md` (§1.2, §5.2), `DOMAIN_REWRITE_WORKLOG.md`
- **Write:** `DOMAIN_REWRITE_WORKLOG.md`

### Approach

1. Open worklog; append the new **`###`** and subsections after **Canonical narrative home**.
2. Keep prose **short** (bullet lists OK); cite **`20260432_000061_*`**, **`000035_*`** by filename only.
3. Stop before editing the **Gaps for session 20.5.2** heading block.

### Checkpoint

- **`/accepted-code`** → implement → **`/task-end 20.5.2.1`** → **`/task-start 20.5.2.2`**.

### Deliverables

- New **`### Baseline placement & event routing (session 20.5.2)`** section in **`DOMAIN_REWRITE_WORKLOG.md`**.

### Acceptance Criteria

- [ ] Section and all **five** **`####`** children present.
- [ ] States clearly that **migrations do not** create full **`event_assignments`** graphs for production tenants.
- [ ] **`event_assignments`** / **blockInstance** parent rule referenced (**035**).
- [ ] **061** placement catalog role described without over-claiming.
- [ ] **No** edits to **`#### Gaps for session 20.5.2`** in this task’s diff.

### Design

Insert after **`#### Canonical narrative home`** (still under Checkpoint 9):

- **`### Baseline placement & event routing (session 20.5.2)`**
  - **`#### Fresh database`** — after full **`20260432_*`** migrate: schema + **061** default **placement-type** `event_shapes` rows; **no** automatic population of block/event **instances** or **`event_assignments`**; admin + product config create graphs.
  - **`#### Upgraded database`** — legacy rows migrate per **061** / **035** / validity renames; routing meaning = same relational model, not new scalar columns on parts.
  - **`#### Placement-type seeds (061)`** — what is guaranteed (named catalog); what is **not** (full template graphs).
  - **`#### Relational routing (`event_assignments`)`** — **035** parent = **blockInstance**; edges tie **segments** to **part instances**.
  - **`#### Orchestrator baseline vs profile override`** — vocabulary aligned to **FEATURE_20** §1.2 / client resolution order (**override ?? baseline**).

---

## Task 20.5.2.2 (source: task-20.5.2.2-planning.md)

### Story

**This task closes** the open **Checkpoint 9** gap list and **records FEATURE_20 §9.6 risk mitigation** in the worklog **because** **20.5.2.1** added the baseline narrative body; **20.5.2.2** wires that narrative back to **§9.5 / §9.6** so readers do not assume implicit ORM routing after migrate.

---

### Analysis

- **Why now:** **20.5.1.2** left **`gap:`** for orchestrator baseline; **§9.6** requires explicit mitigation language.
- **Boundaries:** **`.project-manager/analysis/`** only; cite **migrations** by id, do not change them.
- **Risks:** Claiming migrations insert full routing graphs — **avoid**; state **admin + validity graph** responsibility clearly.

### Goal

1. Replace **`#### Gaps for session 20.5.2`** with **`#### Addressed (session 20.5.2)`** and resolution bullets that **link** to existing baseline subsections.
2. Add **`#### FEATURE_20 §9.6 mitigation (session 20.5.2)`** under **`### Baseline placement & event routing (session 20.5.2)`**.
3. Update the **§9.5 crosswalk** table **Notes** for the baseline seed row to remove stale **`gap:`** language and point at the baseline **`###`** + §9.6 mitigation.

### Files

- **Read:** `FEATURE_20_ARCHITECTURE_REDESIGN.md` (§9.6), `DOMAIN_REWRITE_WORKLOG.md`
- **Write:** `DOMAIN_REWRITE_WORKLOG.md`

### Approach

1. Edit **Gaps** block → **Addressed** block (pointers + seeders **N/A**).
2. Append **§9.6 mitigation** `####` after **Orchestrator baseline vs profile override**.
3. Tighten crosswalk table **Notes** cell for **061** / orchestrator baseline row.

### Checkpoint

- **`/accepted-code`** → implement → **`/task-end 20.5.2.2`** → **`/session-end 20.5.2`**.

### Deliverables

- **`#### Addressed (session 20.5.2)`** + **`#### FEATURE_20 §9.6 mitigation (session 20.5.2)`** + updated **§9.5** table **Notes** (one row).

### Acceptance Criteria

- [ ] No heading **`#### Gaps for session 20.5.2`** remains (replaced or clearly superseded).
- [ ] **§9.6** row *Migration sequence leaves default routing implicit* explicitly mitigated in worklog prose.
- [ ] **Seeders** bullet resolved (**N/A** + path) or equivalent.
- [ ] **§9.5** crosswalk no longer implies an open **`gap:`** for orchestrator baseline without pointer to **20.5.2** narrative.

### Design

1. **Rename/replace** **`#### Gaps for session 20.5.2`** → **`#### Addressed (session 20.5.2)`** with **short bullets**: each former gap → pointer to the relevant **`####`** under **`### Baseline placement & event routing`**; **seeders** → **N/A** (no `server/src/db/seeders/` in repo; enumerate if introduced).
2. **Append** final subsection **`#### FEATURE_20 §9.6 mitigation (session 20.5.2)`** under the same **`### Baseline placement & event routing`**, explicitly mapping the §9.6 row *Migration sequence leaves default routing implicit* to: **documentation** + **operator/product** responsibility for instance graphs; **061** = placement **catalog** only; **no** API path synthesizes **`event_assignments`** as silent defaults.
3. **Optional alignment:** In the **§9.5 crosswalk** table, replace the lingering **`gap:`** phrasing in the **“Seed or confirm baseline…”** row **Notes** cell with **“Addressed in worklog …”** + anchor to **`### Baseline placement & event routing`** and the new **§9.6 mitigation** subsection (keeps crosswalk consistent with body).

---
