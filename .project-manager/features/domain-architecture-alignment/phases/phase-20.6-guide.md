# Phase 20.6 Guide: Pass 6 — Rollout and cleanup

**Purpose:** Phase-level harness guide for Feature 20 — implementation plan **§8.6** (rollout and cleanup pass).

**Tier:** Phase (Tier 1)

---

## Canonical sources (absolute truth)

- [.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md](.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md) — immutable architectural rules.
- [.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md](.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md) — domain implementation plan (ordered passes, acceptance checks, drift checklist).

**Conflict rule:** If this guide disagrees with either file above, **the analysis documents win**; update this guide, not the principles or the implementation plan.

---

## Verbatim directive (FEATURE_20_ARCHITECTURE_REDESIGN.md §8.6)

Scope:

- Roll out domain editors incrementally.
- Delete differential-role code after the replacement path is in place.
- Delete `EntityCard` and the **entire** admin metadata infrastructure (including annotation-related metadata tables and pipeline code) after replacement editors are proven.
- Prepare replacement review for consolidating this document as the sole canonical implementation plan (retire older redesign filenames if any remain).

Cleanup grouping:

- Differential-role utilities and shared types
- Event-instance standalone editing remnants
- Generic `EntityCard` component tree
- Generic `EntityCard` composables and types
- Admin metadata database tables, routes, and client prefetch/mutation paths (full stack)
- Remaining event-shape display/config wiring no longer needed after placement-type conversion

Acceptance checks:

- Cleanup follows replacement, not the reverse.
- Review gate artifacts are complete before replacing the old redesign file.
- Remaining risks and open decisions are carried into the final review section.

---

## Related plan sections

- **§6.3** / **§6.3a** — Shared display, metadata cleanup, and full deletion inventory for `EntityCard` and related infrastructure.
- **§9.3** / **§9.4** — Replacement readiness and review gate before any redesign doc promotion or filename consolidation.
- **§8.3** — Admin UX pass (replacement editors must precede deletions).

---

## Principles and drift

**Cleanup follows replacement, not the reverse** (plan §8.6). Enforce **ARCHITECTURE_PRINCIPLES.md** §7 (domain editors). Run **plan §9.1** / **§9.1a** through rollout.

**Parent feature guide:** [../feature-domain-architecture-alignment-guide.md](../feature-domain-architecture-alignment-guide.md)

---

## Overview

**Phase Number:** 20.6
**Phase Name:** Pass 6 — Rollout, cleanup, doc promotion (§8.6).
**Description:** Incremental rollout of domain editors; delete differential-role and legacy admin code; **remove the full admin metadata stack** (per §6.3a) after cutover; review gate before doc promotion.
**Status:** Complete — session **20.6.1** first; follow **`phase-20.6-planning.md`** decomposition

---

## Objectives

- [ ] **Replacement first** — No metadata or EntityCard deletion until replacement editors are proven (plan §8.6 acceptance).
- [ ] **Cleanup** — EntityCard tree, metadata composables/types/utils, admin metadata **server** models/routes, and client `admin-metadata` usage removed per §6.3a.
- [ ] **Docs** — `ARCHITECTURE.md` / handoff reflect end state; review gate §9.3–§9.4 satisfied if promoting canonical docs.

---

## Sessions breakdown

| Session | Focus |
|--------|--------|
| **20.6.1** | Admin metadata stack removal — server models/routes/migrations + client **`admin-metadata`** API usage (per **§6.3a** + worklog ordering). |
| **20.6.2** | **EntityCard** tree and façade consumers per **`ENTITY_CARD_CONSUMERS_20.6.md`**. |
| **20.6.3** | Differential-role + event-shape / event-instance legacy remnants (**§8.6** grouping). |
| **20.6.4** | Review gate, **`ARCHITECTURE.md`** / handoffs, **`/feature-end`** readiness. |

**Harness order:** `/session-start 20.6.1` → … → `/session-end` each → `/phase-end 20.6` when all sessions complete.

---

## Tasks

Session guides/logs are created at **`/session-start`**. Trace execution to **FEATURE_20 §6.3a** and **`DOMAIN_REWRITE_WORKLOG.md` → `### Admin metadata retirement (Pass 5 narrative)`**.

- [x] ### Session 20.6.1: Admin metadata stack removal (server + client API)
**Description:** Drop or detach **admin metadata** Sequelize models and migrations per **DB_HOST** policy; remove **`server/src/routes/internal/admin-metadata`** and related **primitive/relationship metadata** routes if in scope; remove client **`admin-metadata`** prefetch/mutations after confirming domain editors do not depend on rows.

**Tasks:**
- Inventory consumers: ripgrep **`admin-metadata`**, **`AdminMetadata`**, **`adminMetadata`** across `client/src` and `server/src`; cross-check **`server/src/routes/internal/index.ts`** mounts.
- Remove or narrow **client** API modules and TanStack/query keys that call metadata endpoints; replace reads with entity/settings APIs already used by Pass 3–4 editors where needed.
- Remove **server** routers, helpers, Joi schemas tied to metadata POST/GET; update **`metadataValidatorFactory`** consumers so lint/tsc stay green.
- Author **migration(s)** to drop or detach metadata tables (names from **§6.3a** + live models under **`server/src/db/models/admin/`**); do not run DDL on remote **DB_HOST**.
- Verify admin UI smoke paths still load for shapes/instances/settings without metadata rows.

- [x] ### Session 20.6.2: EntityCard tree and façade consumers
**Description:** Replace or inline remaining **`EntityCard.vue`** import sites in **`ENTITY_CARD_CONSUMERS_20.6.md`**; delete **`EntityCard*`** shell components and **`useEntityCard*`** composables when import graph is zero.

**Tasks:**
- Work through inventory table row by row; prefer domain-specific cards already introduced in earlier passes.
- Remove **`AnnotationShapeListCard`** façade or reimplement without **EntityCard** per deferral notes.
- Delete internal **EntityCard** tree only after zero external imports.

- [x] ### Session 20.6.3: Legacy differential-role and event-shape remnants
**Description:** Remove superseded differential-role utilities/types and **event-instance** / **event-shape** wiring listed under **§8.6** cleanup grouping — only after **20.6.1–20.6.2** are stable.

**Tasks:**
- Ripgrep for deprecated symbols; align with placement-first admin UX from Pass 3–4.
- Do not change booking **PartFinalizer** boundary.

- [x] ### Session 20.6.4: Review gate, docs, and feature closeout
**Description:** Close **§8.6** acceptance; update **`ARCHITECTURE.md`**, feature + phase handoffs, **`DOMAIN_REWRITE_WORKLOG.md`**; run **§9.3–§9.4** only if promoting canonical docs; prepare **`/feature-end`**.

**Tasks:**
- Drift checklist **§9.1 / §9.1a** on final PR.
- **`phase-20.6-handoff.md`**: **Next Action** → **`/feature-end`** or explicit follow-up.

<!-- end excerpt phase -->
