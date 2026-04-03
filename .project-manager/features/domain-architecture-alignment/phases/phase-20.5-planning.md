<!-- harness-planning-rollup tier=phase id=20.5 consolidatedAt=2026-04-03T01:10:01.708Z -->

# Consolidated planning: phase 20.5

## Phase 20.5 (parent)

## Story

**As a** maintainer shipping Feature 20, **I want** an **explicit, ordered migration and data narrative** (sequence, seeds, baseline event routing, legacy-to-target mapping, **plus admin metadata schema retirement ordering**) **aligned to FEATURE_20 §8.5 and §9.5**, **so that** no environment relies on **undocumented implicit defaults** and future rollout / phase **20.6** cleanup (including **full** metadata stack removal) can proceed safely.
**Estimated size:** M (mostly documentation and verification; optional small migration/seed fixes only if gaps are found).

---

## Analysis

- **Problem / why now:** **§8.5** requires **written** migration sequence, **seed expectations**, and **no implicit-default** steps. Implementation passes **20.1–20.4** executed many migrations; without a consolidated narrative, operators and reviewers cannot prove **§9.5** ordering and **§9.6** “implicit default routing” risk is mitigated.
- **Boundaries:** Primarily **`.project-manager/analysis/`** + **worklog** + optional **`server/src/db/migrations`** commentary or README; **no** booking/client refactors unless a recon session finds a **blocking** mismatch (then spin a follow-up task, not silent code drift).
- **Patterns:** Cite **FEATURE_20** sections by number; keep **ARCHITECTURE_PRINCIPLES** / **PartFinalizer-on-client** constraints in any narrative about server vs client responsibilities.
- **Risks:** Documenting the wrong order (e.g. implying placement UX before instance columns) confuses deploy; mitigated by mapping each bullet in **§9.5** to concrete **`20260432_*`** files and noting dependencies.
- **Alternatives:** Single monolithic doc session — **rejected**; split **inventory → baseline routing → legacy closure** for clearer session-end gates.

## Goal

**Phase 20.5 only:** Satisfy **FEATURE_20_ARCHITECTURE_REDESIGN §8.5** by producing **migration + data conversion documentation** that:

1. Defines the **data migration sequence** (enums, moved fields, placement, event-instance ownership, attendee rename, legacy cleanup) in **implementation order**, tied to **existing or planned** migration artifacts.
2. Documents **seed expectations** for **baseline placement types** and **baseline event-orchestrator** data so **default routing is never “whatever Sequelize defaults to.”**
3. Closes the **§8.5 acceptance checks:** explicit baseline event routing narrative; **§0.2 / §2** legacy assumptions removed or mapped; **no step relies on undocumented implicit defaults**; **admin metadata retirement** narrative traceable with stated ordering (domain UI → optional export → API/client removal → DDL in **20.6**).

**Feature-wide goal** (unchanged context): complete **20.1–20.6** per guides; **20.5** is the **planning/documentation** pass that unlocks confident **20.6** rollout/cleanup (including **full** metadata stack deletion per §6.3a).

## Files

- **Canonical:** `ARCHITECTURE_PRINCIPLES.md`, `FEATURE_20_ARCHITECTURE_REDESIGN.md` (**§8.5, §9.5, §9.6**), `ARCHITECTURE.md`
- **Phase:** `phases/phase-20.5-guide.md`, `phases/phase-20.5-planning.md`, `phases/phase-20.5-handoff.md` (update status as sessions complete)
- **Worklog / narrative target:** `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md` and/or new short **`MIGRATION_SEQUENCE.md`** under `.project-manager/analysis/` (only if worklog would become unwieldy — decide in **20.5.1**)
- **Evidence:** `server/src/db/migrations/20260432_*.mjs`, optional `server/src/db/seeders/**` if present and relevant

## Approach

1. Run **`/session-start 20.5.1` → …** in order (see **Decomposition**); **`/session-end`** each before the next; **`/phase-end 20.5`** when all sessions complete.
2. For each session: grep/read migrations and docs; **write** findings into the chosen canonical narrative file(s); update **phase guide** session checkboxes.
3. **Do not** run **`npm run migrate`** against non-local **DB_HOST** (project policy); authoring new migration **files** is allowed if a session identifies a **documented** gap—execution stays on the host that owns the DB.
4. Cross-check every **§9.5** bullet against the narrative; cross-check **§9.6** “implicit default routing” row for an explicit mitigation paragraph.
5. In **20.5.3**, append **`### Admin metadata retirement (Pass 5 narrative)`** and a **four-row §8.5** acceptance table per **FEATURE_20** §8.5 (fourth bullet).
6. If **§8.5** acceptance checks are fully met by end of **20.5.3**, mark phase objectives complete and hand off to **`/phase-start 20.6`**.

## Checkpoint

- After **`/accepted-plan`:** **`/session-start 20.5.1`** on **`feature/domain-architecture-alignment`**.
- Each session-end: **§9.1** drift checklist on edited docs; verify no new “implicit default” language slipped in.
- Phase-end: **§8.5** acceptance checks satisfied in writing; **phase-20.5-handoff.md** lists **Next Action** → **`/phase-start 20.6`**.

## Deliverables

- **Migration sequence doc:** Ordered table or numbered list mapping **§9.5** → **`20260432_*`** migrations (and any seed steps), with **dependencies** and **rollback notes** where relevant.
- **Baseline routing doc:** Explicit description of how **baseline event-orchestrator** and **placement** defaults are established in fresh vs upgraded DBs (no silent defaults).
- **Legacy mapping:** Table or subsection mapping **§0.2** legacy assumptions to **removed** or **replacement storage** (cite migrations or code).
- **Updated** `phase-20.5-guide.md` (objectives + session task bullets checked as you go).

## Acceptance Criteria

- [ ] **§8.5** scope and acceptance checks are traceable to concrete doc sections (not chat-only).
- [ ] **§9.5** each bullet has a corresponding narrative line and migration/seed pointer.
- [ ] **§9.6** risk “implicit default routing” has an explicit mitigation in the written plan.
- [ ] Phase guide **Status** reflects completion; handoff **Next Action** points to **20.6**.

---

## Session 20.5.1 (source: session-20.5.1-planning.md)

### Story

**This session delivers** a **traceable migration narrative** (ordered files + **§9.5** crosswalk) **so that** **20.5.2** can document **baseline routing/seeds** without guessing order, and **§8.5** acceptance stays auditable.
**Estimated size:** S–M (docs + table; no app code unless explicitly scoped later).

---

### Analysis

- **Why now:** **§8.5** / **§9.5** require an **explicit** sequence; code exists but the **narrative** was fragmented across phase logs.
- **Boundaries:** **`.project-manager/analysis/`** + migration **filenames** as evidence; **no** client/server product code in **20.5.1** unless a task discovers a **blocking** doc error (then note follow-up, do not expand scope silently).
- **Child tasks:** Prefer **small commits**: inventory markdown first, then crosswalk table.
- **Risks:** Mis-ordering migrations in prose could mislead operators — mitigate by **copying numeric order from filesystem** and citing file names.
- **Alternatives:** New **`MIGRATION_SEQUENCE.md`** only — deferred unless worklog becomes too long (**>~100 lines** added).

### Goal

1. **Ordered inventory** of all **`20260432_*.mjs`** migrations with **one-line purpose** each, grouped so **§9.5** ordering is visible (type rename → three-property on instances → placement + event-instance schema → relational routing preserved).
2. **Crosswalk table:** each **FEATURE_20 §9.5** bullet → **migration id(s)** or **`none (document gap)`**.
3. **Canonical home decision:** add a new section to **`DOMAIN_REWRITE_WORKLOG.md`** *or* create **`MIGRATION_SEQUENCE.md`** — record the decision in the same PR/commit as the table.

### Files

- **Read:** `FEATURE_20_ARCHITECTURE_REDESIGN.md` §1, §2, §9.5; `phases/phase-20.5-guide.md`
- **Write:** `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md` (preferred) **or** `.project-manager/analysis/MIGRATION_SEQUENCE.md`; optional one-line pointer from `phases/phase-20.5-planning.md` if split file wins
- **Evidence (read-only):** `server/src/db/migrations/20260432_*.mjs`

### Approach

1. **Task 20.5.1.1:** Sort migrations lexicographically; annotate **Feature 20 relevance** (core / adjacent / unrelated-but-same-prefix); map **§1** enum rename and **§2** schema targets to specific files.
2. **Task 20.5.1.2:** Author **§9.5** crosswalk + **ordered narrative paragraph**; append to chosen doc; list **explicit gaps** for **20.5.2** (baseline seeds / orchestrator language).
3. Do **not** run DB migrations from agent unless **DB_HOST** is local (project policy).

### Checkpoint

- After **`/accepted-plan`:** run **`/task-start 20.5.1.1`**, then **`/accepted-code`** for each task before implementation; **`/task-end`** per task; **`/session-end 20.5.1`** when both tasks complete.
- Session-end: phase guide checkbox for **20.5.1**; session log/handoff per harness.

### Deliverables

- Updated **`DOMAIN_REWRITE_WORKLOG.md`** (or new **`MIGRATION_SEQUENCE.md`**) containing **Checkpoint / section: Feature 20 — `20260432` migration sequence** with ordered list + **§9.5** table.
- Short **gaps** list (bullets) handed to **20.5.2**.

### Acceptance Criteria

- [ ] Every **`20260432_*.mjs`** file appears in the inventory or is explicitly excluded with reason (e.g. out-of-scope auth-only).
- [ ] Each **§9.5** line from **FEATURE_20** has a table row with **migration pointer** or **`gap:`** note.
- [ ] **Canonical doc choice** is stated in prose (not only in chat).
- [ ] No claim that **baseline event-orchestrator** data is fully specified **in this session** (that is **20.5.2**).

---

---

## Session 20.5.2 (source: session-20.5.2-planning.md)

### Story

**This session delivers** written **baseline placement + event routing** expectations for **new and upgraded** databases **so that** **§8.5** / **§9.6** are not satisfied only by migrations list — operators know what **configuration rows** legitimately establish routing vs what **admin/product** must create.
**Estimated size:** S (documentation only; **no** Sequelize seeders directory exists in repo today).

---

### Analysis

- **Why now:** **20.5.1.2** left **`gap:`** for orchestrator baseline; **§9.6** requires explicit mitigation language.
- **Boundaries:** **`.project-manager/analysis/`** only; cite **migrations** by id, do not change them.
- **Risks:** Claiming migrations insert full routing graphs — **avoid**; state **admin + validity graph** responsibility clearly.

### Goal

1. Append **`### Baseline placement & event routing (session 20.5.2)`** to **`DOMAIN_REWRITE_WORKLOG.md`** with: **Fresh DB after full `20260432` migrate**, **Upgraded DB**, **Placement-type seeds (061)**, **Relational routing (`event_assignments`)**, **Orchestrator baseline vs profile override** (align **FEATURE_20** §1.2 / §5.x vocabulary).
2. Replace or annotate **`#### Gaps for session 20.5.2`** so items are **resolved in prose** (or marked **N/A** with reason — e.g. no seeders dir).
3. Add **§9.6 mitigation** paragraph: implicit default routing is avoided by documenting that **no** server path invents `event_assignments`; baseline comes from **stored graph + admin selections**, with **061** only guaranteeing **placement catalog** seeds.

### Files

- **Read:** `FEATURE_20_ARCHITECTURE_REDESIGN.md` (§1.2, §5.2, §9.6), `DOMAIN_REWRITE_WORKLOG.md` (Checkpoint 9 + crosswalk + gaps)
- **Write:** `DOMAIN_REWRITE_WORKLOG.md` only

### Approach

1. **Task 20.5.2.1:** Draft the **Baseline placement & event routing** section (subsections per **Goal**).
2. **Task 20.5.2.2:** Add **§9.6 explicit mitigation**; update **Gaps for session 20.5.2** block to **“Addressed (20.5.2)”** with pointers to subsection anchors; optional one-line **seeders: none in repo**.
3. **§9.1** skim after edits (orchestrator = selector language only).

### Checkpoint

- **`/accepted-plan`** → **`/task-start 20.5.2.1`** → **`/accepted-code`** → implement → **`/task-end`** → **`/task-start 20.5.2.2`** → repeat → **`/session-end 20.5.2`**.

### Deliverables

- Updated **`DOMAIN_REWRITE_WORKLOG.md`** with new section + closed/annotated gaps + §9.6 mitigation.

### Acceptance Criteria

- [ ] **Fresh** and **upgraded** DB expectations each have a short subsection.
- [ ] **061** placement seeds described; no false claim that migrations seed all **`event_assignments`**.
- [ ] **`event_assignments`** + **orchestrator baseline** language matches **FEATURE_20** (no scalar part event columns).
- [ ] **Seeders:** explicit statement (**none** under `server/src/db/seeders` today) or list if found.
- [ ] **§9.6** mitigation paragraph present.
- [ ] Edits confined to **`DOMAIN_REWRITE_WORKLOG.md`**.

---

---

## Session 20.5.3 (source: session-20.5.3-planning.md)

### Story

**This session delivers** a written **legacy → target** closure (**§0.2** + **§2**), a **`### Admin metadata retirement (Pass 5 narrative)`** subsection in the worklog (ordering for **full** metadata stack removal per **§8.5** / **§6.3a**), and a **four-row §8.5** traceability table **so that** **FEATURE_20 §8.5 Pass 5** acceptance checks are demonstrably met in-repo and **phase 20.6** can start without undocumented migration assumptions.
**Estimated size:** **S** (analysis docs + one phase handoff file; **no** app code).

---

### Analysis

- **Why now:** **20.5.1–20.5.2** documented **sequence** and **baseline routing**; **20.5.3** is the **closure** pass: map **legacy assumptions** to **replacements** and prove **§8.5** is satisfied before **20.6** deletes code.
- **Boundaries:** **`.project-manager/analysis/`** + **`phase-20.5-handoff.md`** only unless a guide checkbox must flip; **no** `client/` / `server/` product edits planned.
- **Risks:** Over-long worklog — keep new sections **tabular + bullets**; duplicate **FEATURE_20** text — prefer **pointers** + one closure table.

### Goal

1. Add **`### Legacy assumption closure (session 20.5.3)`** to **`DOMAIN_REWRITE_WORKLOG.md`** with:
   - **`#### §0.2 legacy assumptions → replacement`** — table: assumption (quote or paraphrase from **FEATURE_20** §0.2) | **removed / replaced by** | **evidence** (worklog anchor, migration filename, or “client/server — phase 20.x”).
   - **`#### §2 model targets vs legacy (closure)`** — short table or bullets mapping **§2.2–§2.5** “survive / drop / add” themes to **Checkpoint 9** / **061–062** / three-property migrations (**059–060**), without re-pasting the full **FEATURE_20** §2.
   - **`#### Migration implicit-default audit`** — explicit statement that **`20260432_*`** steps are **idempotent / data-moving** per file headers and **do not** rely on undocumented Sequelize defaults for routing; cite **20.5.2** baseline + **§9.6** mitigation for orchestrator graphs.
2. Ensure **`### Admin metadata retirement (Pass 5 narrative)`** exists in **`DOMAIN_REWRITE_WORKLOG.md`** (before the §8.5 acceptance table) with models/routes pointers and **ordering**; **no** required product code in **20.5.3**.
3. Add or update **`### FEATURE_20 §8.5 acceptance (session 20.5.3)`** with a **four-row** table mapping each **§8.5** acceptance bullet (including **admin metadata retirement** traceability) → **satisfied by** (worklog heading / table) → **notes**.
4. Update **`.project-manager/features/domain-architecture-alignment/phases/phase-20.5-handoff.md`**: **Current Status**, **Next Action** → **`/phase-start 20.6`**, **Transition Context** (Pass 5 metadata narrative + **20.6** execution), **Last Updated**; optionally tick session **20.5.3** in **`phase-20.5-guide.md`** at **session-end** (task **20.5.3.2** or harness).

### Files

- **Read:** `FEATURE_20_ARCHITECTURE_REDESIGN.md` (§0.2, §2 headers, §8.5), `DOMAIN_REWRITE_WORKLOG.md`
- **Write:** `DOMAIN_REWRITE_WORKLOG.md`, `phases/phase-20.5-handoff.md` (and `phases/phase-20.5-guide.md` checkbox if not auto-updated by harness at session-end)

### Approach

1. **`/accepted-plan`** → **`/task-start 20.5.3.1`** → **`/accepted-code`** → append **§0.2 / §2 / implicit-default audit** sections to worklog → **`/task-end`**.
2. **`/task-start 20.5.3.2`** → **`/accepted-code`** → ensure **`### Admin metadata retirement (Pass 5 narrative)`** + **four-row §8.5** acceptance table → update **phase handoff** (and guide checkbox) → **`/task-end`**.
3. **`/session-end 20.5.3`** → push flow per harness.

### Checkpoint

- **`/accepted-plan`** → task cascade **20.5.3.1** → **20.5.3.2** → **`/session-end 20.5.3`**.

### Deliverables

- **`### Legacy assumption closure`**, **`### Admin metadata retirement (Pass 5 narrative)`**, and **`### FEATURE_20 §8.5 acceptance`** ( **four** rows) in **`DOMAIN_REWRITE_WORKLOG.md`**.
- Updated **`phase-20.5-handoff.md`** ready for **`/phase-start 20.6`**.

### Acceptance Criteria

- [ ] Every **§0.2** bullet has a **row** (or explicit **N/A** + reason) in the closure table.
- [ ] **§8.5** **four** acceptance checks each **map** to a specific worklog anchor (row 4 → **`### Admin metadata retirement (Pass 5 narrative)`**).
- [ ] **Implicit-default audit** references **20.5.2** baseline narrative and does not claim migrations seed full tenant graphs.
- [ ] **Phase handoff** lists **Next Action** **`/phase-start 20.6`** with accurate **Transition Context** (incl. admin metadata narrative + **20.6** owns execution).

---

---
