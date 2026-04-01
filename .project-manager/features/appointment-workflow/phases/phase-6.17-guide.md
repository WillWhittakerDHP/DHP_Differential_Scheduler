# Phase 6.17 Guide: Generalized Dependency-Aware Delete Wizard

**Purpose:** Cross-cutting **admin delete** architecture: detect dependencies before delete, guide the user through reassignment / safe removal / bulk confirmation, then finalize deletion — replacing brittle one-shot DELETE for supported entities.

**Tier:** Phase (Tier 1 - High-Level)

---

## Overview

**Phase Number:** 6.17  
**Phase Name:** Generalized Dependency-Aware Delete Wizard  
**Description:** Today, many admin deletes are **synchronous and binary** (success or generic failure). That is too rigid for entities with referential dependencies. This phase delivers a **product-safe middle path** between “raw cascade delete everywhere” and “undeletable forever”: **preflight dependency analysis**, **explicit user decisions**, **reassignment** where policy requires it, **relationship cleanup** where appropriate, then **final delete**. The workflow is **generalized** (registry/config-driven, typed contracts), not a one-off for a single shape table.

**Duration:** Five sessions (6.17.1 — 6.17.5)  
**Status:** Not Started

**Relation to Phase 6.6 (Soft Delete vs Hard Delete):** Phase 6.6 addresses **appointment lifecycle** policy (cancelled vs deleted, retention, audit). Phase 6.17 addresses **admin CRUD** deletion UX and server contracts for **any supported entity type** using the generic admin stack. They should align on terminology (“delete” vs “soft delete”) but **6.17 is not** “partShape only” — it is the reusable **dependency-aware delete** layer.

---

## Objectives

- **Preflight:** Before delete, the server returns structured **dependency inspection** (graph, counts, policy classification per edge), not only 500/409.
- **Wizard:** One reusable **delete wizard / modal** for supported entities, driven by preflight payload + policy registry.
- **Classification:** Dependencies fall into explicit categories (see **Policy categories** below) — no single universal cascade rule.
- **Reassignment:** Where policy is `reassign_required`, the user selects targets; server validates and applies in a transaction.
- **Finalize:** After resolution, **final delete** runs in a clear server flow; client refreshes **generic global entity** cache/state.
- **Integration:** Sit **above** raw delete in `useEntityCrud` / list delete / entity card actions — **do not** keep a long-running HTTP DELETE open while the user interacts.

---

## Policy categories (product contract)

These are **explicit** — implementations map dependency edges to one category; entities may differ.

| Category | Meaning |
|----------|---------|
| `reassign_required` | Dependent rows must point to another parent (or equivalent) before the entity can be removed. |
| `safe_auto_remove` | Lightweight relationship/config rows may be removed automatically when rules are satisfied (still visible in preflight for transparency). |
| `confirm_bulk_remove` | Many rows or sensitive bulk unlink — user confirms once in the wizard. |
| `hard_blocked` | Delete cannot proceed without out-of-band work (document reason; may still allow cancel). |
| `allow_direct_delete` | No blocking dependencies; optional fast path (still may run preflight for consistency). |

**Destructive cascades** that would **silently** drop large subtrees must **never** happen without an explicit policy + user confirmation path.

---

## Architecture direction

**Preferred pattern (multi-step, not “async DELETE”):**

1. **`delete preflight`** (or named equivalent) — returns dependency graph / counts / suggested actions per policy.
2. **UI** opens the dependency-aware wizard.
3. User chooses **reassignment targets**, **removal options**, or **cancel**.
4. **`resolve` / `finalize`** (or split endpoints) — server applies reassignments and safe cleanup in **transaction(s)** where appropriate, then performs **final delete**.
5. **UI** refreshes generic global data cache (existing entity store / query invalidation patterns).

**Anti-pattern:** A single HTTP DELETE that stays open until the user completes a multi-screen wizard.

**Generalization:** Support **entity–entity**, **relationship-table**, and **parent/child** constraints; design for **new entity types** via registry + config without copying full delete logic per entity.

---

## Baseline integration seam (current codebase)

**Client**

- `client/src/composables/entityCrud/useEntityCrud.ts`
- `client/src/composables/entityCrud/useEntityCrudMutations.ts`
- `client/src/utils/admin/entityListDelete.ts`
- `client/src/composables/admin/entityCardActionsPersistence.ts`

**Server**

- `server/src/routes/internal/entities/entityCrudRouter.ts`
- Related relationship routers, helpers, and error handlers as needed for structured responses

New behavior should **orchestrate** these paths: preflight → wizard → resolve/finalize → invalidate caches.

---

## First rollout entities

Start with a **small** set; expand via registry:

- `partShape`
- `blockShape`
- `annotationShape`
- Any **closely related** types already using **generic admin delete** flows (document in session 6.17.5).

**Adding entities later:** Phase and session docs must describe **how to register** a new entity key, wire preflight resolvers, and attach policy rows (no ad hoc copy-paste of full delete flows).

---

## Out of scope (unless explicitly added to scope)

- Silent **full cascade** delete for all entities
- **Background jobs** or long-running pending-delete workers
- **DB-level** migration to convert all FKs to `ON DELETE CASCADE`
- **Automated tests** — project policy: testing suspended until Phase 3.0 (`TEST_ENABLED`); no new test files unless a future phase explicitly enables harness-allowed test work

---

## Success criteria

- [ ] Delete entry points for **supported** entities no longer rely on **raw one-shot delete alone** when preflight finds dependencies.
- [ ] When dependencies exist, user sees the **dependency-aware wizard** with clear actions per policy.
- [ ] **Reassignment** works where `reassign_required` applies.
- [ ] **Lightweight** dependencies can be resolved without manual DB cleanup (per policy).
- [ ] **Final delete** succeeds after resolution without **orphan** data for rolled-out entities.
- [ ] **Generic client CRUD** cache/state remains **consistent** after finalize.
- [ ] Server returns **structured** dependency information (not only generic 500/409-only flows).
- [ ] Documentation explains **how to add** new entity policies and register entities.

---

## Sessions Breakdown

- [x] ### Session 6.17.1: Delete dependency model + API contract  
**Description:** Shared types for dependency graph, policy categories, preflight/finalize request–response shapes; OpenAPI-level or internal contract doc; alignment with `entityCrudRouter` extension points.  
**Focus:** Contracts first; no “hidden” cascade semantics.

- [x] ### Session 6.17.2: Server preflight / resolution / finalize infrastructure  
**Description:** Implement preflight query per entity registry; transactional resolve + final delete; structured errors; relationship helpers.  
**Focus:** Correctness and transactions; explicit policy handling.

- [x] ### Session 6.17.3: Reusable client delete wizard + composable/service  
**Description:** Wizard UI shell, composable that runs preflight → drives steps → calls finalize; reusable across admin surfaces.  
**Focus:** Thin components; orchestration in composable/services per project governance.

- [ ] ### Session 6.17.4: Wire generic delete entry points (list + entity card)  
**Description:** Replace/adapt one-shot delete in `entityListDelete`, entity card persistence, and `useEntityCrud` mutations to use the new flow when entity is registered.  
**Focus:** Single funnel into the wizard for supported keys.

- [ ] ### Session 6.17.5: Entity-policy rollout + documentation  
**Description:** Register policies for `partShape`, `blockShape`, `annotationShape` (and related); document extension guide for new entities; client lint + app start.  
**Focus:** Prove end-to-end on real admin paths; handoff for future entities.

_Register sessions with `/session-add` or tier workflow when starting work._

Session detail (Goal / Files / Approach / Checkpoint) lives in **Sessions (tierDown)** once `session-6.17.x-guide.md` files exist.

---

## Dependencies

**Prerequisites:** None strictly blocking; works with current generic CRUD. **Related:** Phase 6.6 (soft vs hard delete) — keep terminology aligned in docs.

---

## Related Documents

- `phases/phase-6.17-planning.md`
- `feature-appointment-workflow-guide.md` (Phase 6.17 row)
- `.project-manager/PROJECT_PLAN.md` (Feature 6 — Phase 6.17)
- Client/server files listed under **Baseline integration seam**
