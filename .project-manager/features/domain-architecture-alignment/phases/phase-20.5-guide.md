# Phase 20.5 Guide: Pass 5 — Migration planning and data conversion

**Purpose:** Phase-level harness guide for Feature 20 — implementation plan **§8.5** (migration pass).

**Tier:** Phase (Tier 1)

---

## Canonical sources (absolute truth)

- [.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md](.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md) — immutable architectural rules.
- [.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md](.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md) — domain implementation plan (ordered passes, acceptance checks, drift checklist).

**Conflict rule:** If this guide disagrees with either file above, **the analysis documents win**; update this guide, not the principles or the implementation plan.

---

## Verbatim directive (FEATURE_20_ARCHITECTURE_REDESIGN.md §8.5)

Scope:

- Define the data migration sequence for renamed enums, moved fields, placement data, event-instance ownership, attendee-table rename, and legacy cleanup.
- Document seed expectations for baseline placement types and baseline event-orchestrator data.
- Document the **planned sequence for admin metadata schema retirement** (which tables, routes, and client prefetch paths retire; ordering relative to domain editors). **Narrative and traceability only** in Pass 5 — DDL execution lands in Pass 6 per project migration policy.

Acceptance checks:

- Migration notes describe how baseline event routing is established explicitly.
- Legacy assumptions listed in section 2 are either removed or mapped to their replacement storage.
- No migration step depends on undocumented implicit defaults.
- Admin metadata retirement narrative is **traceable in-repo** (e.g. `DOMAIN_REWRITE_WORKLOG.md`) and states **ordering**: domain UI replaces reads/writes → optional row export if product needs parity → remove client/API usage → drop or detach tables in Pass 6.

---

## Related plan sections

- **§2** — Schema targets migrations must reach.
- **§6.3** / **§6.3a** — Full admin metadata stack removal inventory (execution **20.6**; Pass 5 documents ordering only).
- **§9.5** — Migration notes (ordering: type names first, three-property on instances, placement, relational routing).
- **§9.6** — Risk register (implicit default routing, etc.).
- **§1** — Rename and part-instance mappings.

---

## Principles and drift

Migration steps must remain permitted by **ARCHITECTURE_PRINCIPLES.md**; use **plan §9.2** stop conditions if a step would invent behavior. Run **§9.1** / **§9.1a** at session boundaries.

**Parent feature guide:** [../feature-domain-architecture-alignment-guide.md](../feature-domain-architecture-alignment-guide.md)

---

## Overview

**Phase Number:** 20.5  
**Phase Name:** Pass 5 — Migration planning and data conversion (§8.5).  
**Description:** Consolidate **FEATURE_20 §8.5** into written artifacts: ordered migration/data narrative tied to **`20260432_*`** migrations, explicit **baseline placement + event-orchestrator** expectations, **legacy → replacement** mapping, and **admin metadata retirement ordering** (worklog narrative; execution in **20.6**) so **§9.5 / §9.6** risks are closed in documentation—not assumed from code.  
**Status:** Complete (planning)

---

## Objectives

- [ ] **Migration sequence** documented and mapped to **§9.5** (see `phase-20.5-planning.md` → Deliverables).
- [ ] **Baseline event routing** and **seed expectations** stated explicitly (**§8.5** acceptance).
- [ ] **Legacy assumptions** (**§0.2 / §2**) removed or mapped to replacement storage in writing.
- [ ] **No undocumented implicit defaults** in any described migration or seed step.
- [ ] **Admin metadata retirement** narrative present in **`DOMAIN_REWRITE_WORKLOG.md`** (`### Admin metadata retirement (Pass 5 narrative)`) and cited from the **§8.5** acceptance table in session **20.5.3**.

---

## Sessions breakdown

| Session | Focus |
|--------|--------|
| **20.5.1** | Inventory **`20260432_*`** chain vs **§9.5**; choose worklog vs `MIGRATION_SEQUENCE.md`; draft ordered sequence table. |
| **20.5.2** | Baseline **placement types** + **event-orchestrator** data for fresh/upgraded DBs; mitigate **§9.6** implicit-routing risk in prose. |
| **20.5.3** | Legacy closure table; **`### Admin metadata retirement (Pass 5 narrative)`** in worklog; four-row **§8.5** acceptance table; phase handoff → **20.6**. |

**Harness order:** `/session-start 20.5.1` → … → `/session-end` each → `/phase-end 20.5` when all sessions complete.

---

## Tasks

Use session guides (`sessions/session-20.5.*-guide.md`) as each session starts; keep this phase guide objectives in sync at session-end.

- [x] ### Session 20.5.1: Migration chain inventory
**Description:** Map existing **`20260432_*`** migrations to **FEATURE_20 §9.5** ordering; choose **DOMAIN_REWRITE_WORKLOG** vs **`MIGRATION_SEQUENCE.md`**; draft the ordered sequence table.

**Tasks:**
- List **`server/src/db/migrations/20260432_*.mjs`** in run order; note dependencies (enum rename before code that assumes `time`/`price`/`event`, three-property on **`block_instances`**, then event schema / placement).
- For each **§9.5** bullet, add a row: principle → migration id(s) → one-line purpose.
- Pick the **canonical narrative file** (extend **DOMAIN_REWRITE_WORKLOG.md** or add **`.project-manager/analysis/MIGRATION_SEQUENCE.md`**) and paste the first **ordered table** there.
- If a **§9.5** step has **no** migration pointer, open a **Decision needed** line (do not assume implicit behavior).

- [x] ### Session 20.5.2: Baseline placement and event routing
**Description:** Document **seed expectations** and explicit **baseline event-orchestrator / placement** behavior for fresh and upgraded DBs; address **§9.6** implicit default routing in prose.

**Tasks:**
- Describe **fresh DB**: what creates minimal **placement** / **event shape** / **routing** data (migrations only vs seed scripts); cite paths.
- Describe **upgraded DB**: what prior rows mean post-migration; no reliance on “ORM defaults” for routing.
- Add an explicit subsection: **Baseline event routing** (relational **`event_assignments`**, orchestrator baseline + profile overrides) per **FEATURE_20**; tie to **§9.6** mitigation row.
- Cross-read **`server/src/db/seeders/**`** if present; note gaps.

- [x] ### Session 20.5.3: Legacy assumption closure
**Description:** Complete **§0.2 / §2** legacy-to-target mapping; append **admin metadata retirement** narrative to worklog; final **§8.5** acceptance checklist (**four** rows); **phase handoff** → **20.6**.

**Tasks:**
- Build **legacy → replacement** table for **§0.2** items (shape-level three-property, scalar event on parts, etc.): **removed** | **replaced by** | **evidence** (migration or code path).
- Append **`### Admin metadata retirement (Pass 5 narrative)`** to **`DOMAIN_REWRITE_WORKLOG.md`**: tables/models/routes pointers, ordering (domain UI → optional export → client/API removal → DDL in **20.6**); **no** required `client/` / `server/` product edits for this doc-only slice unless scope explicitly expands.
- Walk **§8.5** acceptance checks (**four** bullets); tick only when each maps to a **doc paragraph** (not chat-only).
- Update **`phase-20.5-handoff.md`**: **Current Status**, **Next Action** → **`/phase-start 20.6`**, **Transition Context** (mention Pass 5 metadata narrative + **20.6** execution).

<!-- end excerpt phase -->