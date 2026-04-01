# Phase 6.17 Log

**Purpose:** Track phase-level progress, decisions, and blockers

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Status

**Phase:** 6.17 — Generalized Dependency-Aware Delete Wizard  
**Status:** Not Started  
**Started:** —  
**Completed:** — (if complete)

---

## Completed Sessions

### Session 6.17.5: Entity-policy rollout + documentation ✅
**Completed:** 2026-04-01
**Tasks Completed:** All tasks completed
**Key Accomplishments:**
- Completed ** Entity-policy rollout + documentation



### Session 6.17.5: Entity-policy rollout + documentation ✅
**Completed:** 2026-04-01
**Tasks Completed:** All tasks completed
**Key Accomplishments:**
- Completed ** Entity-policy rollout + documentation



### Session 6.17.4: Wire generic delete entry points (list + entity card) ✅
**Completed:** 2026-04-01
**Tasks Completed:** All tasks completed
**Key Accomplishments:**
- Completed ** Wire generic delete entry points (list + entity card)



### Session 6.17.3: Reusable client delete wizard + composable/service ✅
**Completed:** 2026-04-01
**Tasks Completed:** All tasks completed
**Key Accomplishments:**
- Completed ** Reusable client delete wizard + composable/service



### Session 6.17.2: Server preflight / resolution / finalize infrastructure ✅
**Completed:** 2026-04-01
**Tasks Completed:** All tasks completed
**Key Accomplishments:**
- Completed ** Server preflight / resolution / finalize infrastructure



### Session 6.17.1: Delete dependency model + API contract ✅
**Completed:** 2026-04-01
**Tasks Completed:** All tasks completed
**Key Accomplishments:**
- Completed ** Delete dependency model + API contract



_(None yet.)_

---

## In Progress Sessions

_(None yet.)_

---

## Blockers and Issues

_(None yet.)_

---

## Key Decisions

_(None yet.)_

---

## Phase Checkpoints

_(None yet.)_

---

## Next Steps

- `/phase-start 6.17` when ready
- Session order: 6.17.1 → 6.17.2 → 6.17.3 → 6.17.4 → 6.17.5

---

## Phase Completion Summary

**Sessions Completed:** —  
**Total Tasks Completed:** —  
**Success Criteria Met:** —

**Workflow Feedback:** _(Optional)_

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (4): `.project-manager/features/appointment-workflow/phases/phase-6.17-planning.md`, `.project-manager/features/appointment-workflow/sessions/session-6.17.1-planning.md`, `.project-manager/features/appointment-workflow/sessions/session-6.17.2-planning.md`, `.project-manager/features/appointment-workflow/planning-archive/phase/6.17/`

### `git diff --stat HEAD`

```text
.../phases/phase-6.17-planning.md                  | 164 +++++++++-----
 .../sessions/session-6.17.1-planning.md            | 236 --------------------
 .../sessions/session-6.17.2-planning.md            | 246 ---------------------
 3 files changed, 114 insertions(+), 532 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/appointment-workflow/phases/phase-6.17-planning.md b/.project-manager/features/appointment-workflow/phases/phase-6.17-planning.md
index aec39d66..08f2370e 100644
--- a/.project-manager/features/appointment-workflow/phases/phase-6.17-planning.md
+++ b/.project-manager/features/appointment-workflow/phases/phase-6.17-planning.md
@@ -1,21 +1,12 @@
-# Plan: phase 6.17 — Generalized Dependency-Aware Delete Wizard
+<!-- harness-planning-rollup tier=phase id=6.17 consolidatedAt=2026-04-01T23:26:30.152Z -->
 
-## Contract
+# Consolidated planning: phase 6.17
 
-- **Tier:** phase | **ID:** 6.17
-- **Scope:** Generalized admin delete workflow — preflight, wizard, resolve/finalize, policy registry
-- **Governance:** Read function/composable/component playbooks before large composable or router edits
+## Phase 6.17 (parent)
 
-## Work Profile
+## Story
 
-- **Execution intent:** plan
-- **Action type:** decomposition
-- **Scope shape:** architectural
-- **Governance domains:** docs, client-server contract
-- **Recommended context pack:** decomposition_pack
-- **Planning artifact action:** create
-- **Decomposition mode:** light
-- **Downstream advice:** Planning doc is advisory; phase guide owns session list. Implement contracts in 6.17.1 before deep server/UI work.
+Admins delete shapes and related catalog rows through generic CRUD. Today deletes are often **binary** and opaque when FKs or relationship rows block removal. We deliver a **dependency-aware funnel**: server explains what blocks deletion and how each edge is classified; the user resolves reassignment or confirms safe/bulk removal; server finalizes in transactions; the client refreshes global entity state — reusable across entity keys via a registry.
 
 ## Analysis
 
@@ -26,14 +17,6 @@
 - **Cross-phase:** **Phase 6.6** (appointment soft/hard delete) is **terminology alignment only** for this phase; 6.17 is admin generic delete, not appointment lifecycle.
 - **Testing:** Suspended until Phase 3.0 — manual smoke only (admin list + card delete, policies).
 
-## Story / epic
-
-Admins delete shapes and related catalog rows through generic CRUD. Today deletes are often **binary** and opaque when FKs or relationship rows block removal. We deliver a **dependency-aware funnel**: server explains what blocks deletion and how each edge is classified; the user resolves reassignment or confirms safe/bulk removal; server finalizes in transactions; the client refreshes global entity state — reusable across entity keys via a registry.
-
-## Where we left off
-
-Phase registered via `/phase-add 6.17`; full intent in `phase-6.17-guide.md` and Feature 6 / PROJECT_PLAN.
-
 ## Goal
 
 Deliver a **reusable dependency-aware delete** path for admin entities: **preflight** returns structured dependencies and policy actions; **wizard** collects reassignment/removal decisions; **resolve/finalize** applies server-side mutations and final delete in a clear transaction story; **client** invalidates generic entity cache. Replaces one-shot DELETE as the only path for supported types. **Not** a single-table hack — registry/config + typed policies (`reassign_required`, `safe_auto_remove`, `confirm_bulk_remove`, `hard_blocked`, `allow_direct_delete`).
@@ -68,41 +51,122 @@ Deliver a **reusable dependency-aware delete** path for admin entities: **prefli
 4. **Wiring:** `entityListDelete`, entity card actions, `useEntityCrud` / mutations funnel registered entities into the wizard (session 6.17.4).
 5. **Rollout + docs:** `partShape`, `blockShape`, `annotationShape` policies registered; extension guide for new entities (session 6.17.5).
 
-## Acceptance criteria
+---
+
+## Session 6.17.1 (source: session-6.17.1-planning.md)
+
+### Story
+
+**This session delivers** machine-readable **contracts** (TypeScript in `shared/` + written API spec) for dependency-aware delete **so that** Session 6.17.2 can implement preflight/resolution/finalize against a stable shape, and Session 6.17.3+ can type client calls without rework.
+
+**Estimated size:** M (mostly types + docs; small optional constants for route paths).
 
-- [ ] Supported entities use **preflight + wizard + finalize** when dependencies exist; not raw one-shot DELETE alone in those cases.
-- [ ] Wizard surfaces **policy-aligned** actions (`reassign_required`, `safe_auto_remove`, `confirm_bulk_remove`, `hard_blocked`, `allow_direct_delete`) per phase guide table.
-- [ ] **Reassignment** validated and applied server-side where required; **final delete** succeeds without orphans for rolled-out entities.
-- [ ] **TanStack Query / global entity** invalidation keeps admin lists and detail consistent after finalize.
-- [ ] Server returns **structured** dependency data and machine-readable errors (not only opaque 500).
-- [ ] Documentation describes **how to register** a new entity and policies.
-- [ ] **Lint + app start** after phase work; **no new automated test files** unless project policy changes.
+---
+
+### Analysis
+
+- **Problem / why now:** Phase 6.17 depends on a single **contract** for preflight → user resolution → finalize. Without frozen DTOs, server and client work in 6.17.2–6.17.4 will diverge.
+- **Domains:** **Shared** (`shared/` / `@shared`) for cross-boundary DTOs and policy literals; **docs** for HTTP contract; **server** touch limited to **naming alignment** (constants/comments/route skeleton optional) — no behavioral delete logic here.
+- **Patterns to follow:** `ARCHITECTURE.md` §4 — shared types only where both sides need them; reuse existing **entity key** vocabulary (`GlobalEntityKey` / `ENTITY_KEYS` style) for `entityType` fields in payloads; align error **codes** with existing `entityErrorHandler` / structured response patterns used in `entityCrudRouter`.
+- **Risks:** Over-modeling the graph (start minimal: nodes, edges, policy per edge, counts); versioning — document additive-only expectation for v1.
+- **Out of scope this session:** Sequelize queries, Vue wizard UI, wiring `useEntityCrud`, transactional apply — **6.17.2+**.
+
+### Goal
+
+Introduce **versioned shared types** and a **written API contract** for:
+
+1. **Delete preflight** — response describes blocking/related dependencies with **policy classification** per edge (`reassign_required` | `safe_auto_remove` | `confirm_bulk_remove` | `hard_blocked` | `allow_direct_delete`).
+2. **Delete resolve** (optional split from finalize in spec) — request body carries user choices (reassignment targets, bulk confirm tokens).
+3. **Delete finalize** — request confirms apply + **entity id**; response confirms completion or structured failure.
 
-## Decomposition
+**Explicitly not required in 6.17.1:** working Express routes beyond optional **path constants** or commented mount plan.
 
-| Session | Leaf outcome | Depends on |
-|---------|----------------|------------|
-| **6.17.1** | Types + OpenAPI-level doc: dependency nodes/edges, policy enum, preflight response, resolve/finalize request bodies; router extension points named | — |
-| **6.17.2** | Server registry + handlers: preflight query, apply resolution, final delete; transactions; error shape | 6.17.1 |
-| **6.17.3** | `useDependencyAwareDelete` (or named equivalent) + thin modal; calls preflight/finalize; explicit return type; no deep logic in components | 6.17.1–2 |
-| **6.17.4** | Single entry funnel from `entityListDelete`, `entityCardActionsPersistence`, mutations when `GlobalEntityKey` registered | 6.17.3 |
-| **6.17.5** | Policies for part/block/annotation shapes + README or phase doc “how to add an entity” | 6.17.2–4 |
+### Files
 
-**Coverage check:** The five sessions sequence **contracts → server → client wizard → wire → rollout**, which fully covers the Goal and Approach. No parallel track is required for MVP; optional follow-up (perf, more entities) is out of scope until explicitly added.
+| Area | Paths |
+|------|--------|
+| Shared types | New module under `shared/types/` (e.g. `adminDeleteDependency.ts` o
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
