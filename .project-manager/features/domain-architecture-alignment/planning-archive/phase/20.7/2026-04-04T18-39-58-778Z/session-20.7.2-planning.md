<!-- harness-planning-rollup tier=session id=20.7.2 consolidatedAt=2026-04-04T01:08:49.405Z -->

# Consolidated planning: session 20.7.2

## Session 20.7.2 (parent)

## Story

**This session delivers** a cited, reviewable **preflight evidence package** (routing, invariants, migrations, MLS boundary) **so that** phases **20.8–20.13** can execute against explicit pass/fail rows instead of rediscovering ambiguity in **`event_assignments`** or **`property_details`**.

**Estimated size:** M–L (mostly docs + targeted code reads; product changes only where evidence requires a one-line fix with explicit follow-on task).

---

## Analysis

- **Problem / why now:** Close-out phases **20.8+** assume the preflight package exists; without it, execution work re-litigates **`event_assignments`** and **`property_details`** boundaries.
- **Domains:** Booking + admin + migrations — **evidence is mostly markdown**; code changes only for **documented** follow-ons (separate task).
- **Dependencies:** **Session 20.7.1** delivered **`architecture-alignment-closeout-master-plan.md`**; this session adds **evidence** files under **`.project-manager/`** (or append to **`DOMAIN_REWRITE_WORKLOG.md`** with clear headings).
- **Risks:** Scope creep into product refactors — **mitigate** by PASS/FAIL table + “deferred to phase X” rows.

## Goal

1. **Event-routing watchpoint:** Written note: how **`event_assignments`** flow from global/booking transforms into **`PartFinalizer`**, and where ambiguity or legacy naming remains.
2. **Invariant audit:** Table of **ARCHITECTURE.md** §14-style checks with **pass/fail/unknown** and **owning phase (20.8–20.13)** for each gap.
3. **Migration policy:** Short restatement aligned with project **migration authority** rules (localhost-only execution) and Feature **20** ordering.
4. **`property_details` boundary:** Confirm appointment-scoped data vs time-configuration storage per §10.4 / §12 (evidence only).

## Files

- **New or append:** `.project-manager/features/domain-architecture-alignment/preflight-evidence-20.7.2.md` (single package) **or** sections in **`DOMAIN_REWRITE_WORKLOG.md`** — pick one primary surface and link from **`phase-20.7-guide.md`** / **`phase-20.7-log.md`** when done.
- **Read:** `client/src/utils/booking/*` (above), `server/src/db/migrations/` (relevant Feature **20** migrations — cite by filename), `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (migration sequencing context).

## Approach

1. Draft **`preflight-evidence-20.7.2.md`** with four sections matching **Goal**.
2. Map each **fail/unknown** invariant row to a **target phase guide** (`phase-20.8-guide.md` … **`phase-20.13-guide.md`**) in a table.
3. Cross-check admin **`eventAssignments`** config vs booking pipeline for a single “source of truth” paragraph.
4. Session **20.7.3** (if run) will **only** reshape backlog text — avoid duplicating that work here beyond explicit forward pointers.

## Checkpoint

- A new reader can answer: “What is still ambiguous about **`event_assignments`**?” and “Which phase owns each open gap?” without opening IDE.
- No silent production behavior change without a **task** under **20.8+** that cites this evidence doc.

## Deliverables

- **`preflight-evidence-20.7.2.md`** (or equivalent single narrative) committed under the feature folder **or** clearly delimited append to **`DOMAIN_REWRITE_WORKLOG.md`**.
- **`phase-20.7-log.md`** (or guide) updated with a pointer to the evidence package when implementation completes.

## Acceptance Criteria

- [ ] Watchpoint section names **≥2** concrete code paths (client booking + admin) for **`event_assignments`** and states **pass** or **risk** for each ambiguity called out in **`phase-20.7-guide.md`**.
- [ ] Invariant audit covers **lineage**, **zero-out**, relational **events**, client **PartFinalizer**, and **`property_details`** separation; each **fail/unknown** names an owning **phase 20.8–20.13** target.
- [ ] Migration policy paragraph cites **localhost / shared DB** execution rule from workspace policy and points to **FEATURE_20** ordering where relevant.
- [ ] No undocumented production behavior change — refactors are **out of scope** unless filed as follow-on tasks with phase IDs.

---

## Task 20.7.2.1 (source: task-20.7.2.1-planning.md)

### Story

**This task adds** the first block of the preflight evidence package **because** **`phase-20.7-guide.md`** requires a written **event-routing watchpoint** before close-out phases **20.8+** assume the contract is clear.

---

### Analysis

- **Problem / why now:** Close-out phases **20.8+** assume the preflight package exists; without it, execution work re-litigates **`event_assignments`** and **`property_details`** boundaries.
- **Domains:** Booking + admin + migrations — **evidence is mostly markdown**; code changes only for **documented** follow-ons (separate task).
- **Dependencies:** **Session 20.7.1** delivered **`architecture-alignment-closeout-master-plan.md`**; this session adds **evidence** files under **`.project-manager/`** (or append to **`DOMAIN_REWRITE_WORKLOG.md`** with clear headings).
- **Risks:** Scope creep into product refactors — **mitigate** by PASS/FAIL table + “deferred to phase X” rows.

### Goal

Deliver **§1 — Event-routing watchpoint** in **`preflight-evidence-20.7.2.md`** with cited client paths for **booking** and **admin** and a clear **risk register** paragraph.

### Files

- **Create or update:** `.project-manager/features/domain-architecture-alignment/preflight-evidence-20.7.2.md` (at minimum §1; stub headings for §2–§4 optional with “TBD — tasks 20.7.2.2 / 20.7.2.3”).
- **Read-only for citations:** `client/src/utils/booking/appointmentSlotBuilder.ts`, `partFinalizerSlotShape.ts`, `partFinalizerSlotShapeHelpers.ts`, `client/src/utils/admin/codeFirstMetadataCache.ts`, `codeFirstSelectInputConfigs.ts`.

### Approach

1. Create the markdown file and write **§1** full content.
2. Grep **`event_assignments`** / **`eventAssignments`** under **`client/src`** for any extra hot paths worth one line each (cap list ~8 bullets).
3. End §1 with a **Next** line pointing to **task 20.7.2.2** / **20.7.2.3** for remaining sections.

### Checkpoint

- **`phase-20.7-guide.md`** Session **20.7.2** task “Confirm live meaning of **`event_assignments`**…” is addressable from §1 alone (or explicitly marked **risk** with owner **phase 20.10** booking alignment if unresolved).

### Deliverables

- **`preflight-evidence-20.7.2.md`** containing a complete **§1 Event-routing watchpoint**.

### Acceptance Criteria

- [ ] **≥2** cited code paths: **one** booking pipeline file (**`appointmentSlotBuilder`** or **`partFinalizer*`**), **one** admin file (**`codeFirstMetadataCache`** or **`codeFirstSelectInputConfigs`**).
- [ ] Paragraph or table that states **pass** or **risk** for each ambiguity the guide calls out (or “none observed” with justification).
- [ ] No edits to **20.7.2.2** / **20.7.2.3** scope (invariant audit / migration policy) in this task diff.

### Design

1. Create **`preflight-evidence-20.7.2.md`** at feature root with title, date, link to **`architecture-alignment-closeout-master-plan.md`** and **`ARCHITECTURE.md`** §10–§11.
2. Add **`## 1. Event-routing watchpoint`** with subsections: **Data flow (booking)**, **Admin surface**, **Ambiguity / risks** (bulleted, each with repo path).
3. Explicitly state **pass** vs **risk** for each ambiguity called out in **`phase-20.7-guide.md`** Session **20.7.2** (“confirm live meaning where code appears ambiguous”).

---

## Task 20.7.2.2 (source: task-20.7.2.2-planning.md)

### Story

**This task extends** the preflight package with a formal **§14 drift table** **because** session **20.7.2** acceptance requires every **fail/unknown** gap to have an **owning close-out phase** before execution work in **20.8+** starts.

---

### Analysis

- **Problem / why now:** Close-out phases **20.8+** assume the preflight package exists; without it, execution work re-litigates **`event_assignments`** and **`property_details`** boundaries.
- **Domains:** Booking + admin + migrations — **evidence is mostly markdown**; code changes only for **documented** follow-ons (separate task).
- **Dependencies:** **Session 20.7.1** delivered **`architecture-alignment-closeout-master-plan.md`**; this session adds **evidence** files under **`.project-manager/`** (or append to **`DOMAIN_REWRITE_WORKLOG.md`** with clear headings).
- **Risks:** Scope creep into product refactors — **mitigate** by PASS/FAIL table + “deferred to phase X” rows.

### Goal

Deliver a complete **`## 2. Invariant audit`** section in **`preflight-evidence-20.7.2.md`** satisfying session **20.7.2** acceptance: lineage, zero-out, relational events, client PartFinalizer, **`property_details`** separation — each **fail/unknown** has **owning phase 20.8–20.13**.

### Files

- **Update:** `.project-manager/features/domain-architecture-alignment/preflight-evidence-20.7.2.md` (**§2** only; leave **§3–§4** stubs for **20.7.2.3**).
- **Read:** `.project-manager/ARCHITECTURE.md` §10–§14; phase guides **`phase-20.8-guide.md`–`phase-20.13-guide.md`** (titles only for table); client paths listed in **Codebase recon**.

### Approach

1. Re-read **§14** and list every invariant to appear as a row (merge tiny sub-bullets where redundant).
2. For each row, assign **pass / fail / unknown** from **documented** code paths (short citations); use **unknown** when the audit does not trace code end-to-end.
3. For every **fail** or **unknown**, set **Owning phase** and **`phase-20.x-guide.md`** link per heuristic.
4. Add a one-line **See also:** pointer to **§1** for event-routing specifics.

### Checkpoint

- A reader can answer “Which §14 rows are red?” and “Which phase guide owns each?” using only **`preflight-evidence-20.7.2.md` §2**.

### Deliverables

- **`preflight-evidence-20.7.2.md`** with **§2** complete (not a stub).

### Acceptance Criteria

- [ ] **§2** is a table (or equivalent structured list) with **pass / fail / unknown** per **§14**-scoped check; **lineage**, **zero-out**, **relational events**, **client PartFinalizer**, **`property_details`** are all explicitly addressed (session **20.7.2** AC).
- [ ] Each **fail** or **unknown** names an **owning phase** in **20.8–20.13** and points to the matching **`phase-20.x-guide.md`**.
- [ ] No replacement of **§3** or **§4** content (**20.7.2.3**).
- [ ] No undocumented production code change in this task.

### Design

1. Open **`preflight-evidence-20.7.2.md`** and replace the **§2** stub with:
   - Short intro referencing **§14** verbatim intent (“If any assertion below is violated…”).
   - **Markdown table:** columns **`Invariant (§14 ref)`** | **`Status`** | **`Evidence (paths / notes)`** | **`Owning phase`** | **`Guide link`**.
2. **Row coverage (minimum):** **§14.1** domain separation; **§14.2** (+ **2a–c** optionally condensed); **§14.3** with explicit rows or sub-rows for **lineage (3d)**, **relational events (3e)**, **client PartFinalizer (3f)**, **per-block-instance provenance (3g)**; **§14.4** events-as-data; **§14.5** `property_details` (appointment data not configuration) — **may be unknown** pending **20.7.2.3** detail, but row must exist; **§14.6** user orchestrators.
3. **Owning phase heuristic (default):**
   - Schema, API, event-routing integrity → **20.8**
   - Admin/editor surfaces → **20.9**
   - Booking pipeline, lineage, zero-out, placement, PartFinalizer behavior → **20.10**
   - Migration/seed/conversion narrative → **20.11**
   - Transitional code / vocabulary → **20.12**
   - Doc reconciliation / feature end → **20.13**
4. Cross-link **§1** for **`event_assignments`** / **`parentKind`** — do not duplicate the full watchpoint; one sentence pointer is enough.

---
