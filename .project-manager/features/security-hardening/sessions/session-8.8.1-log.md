# Session 8.8.1: ** Create Joi schemas for User, PropertyFieldMapping, and PropertyFeatureMapping models; wire `validateRequest` callbacks into all three CRUD router configs; run server lint; update GC-8-JOI checklist


### Task 8.8.1.1: Task 8.8.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 8.8.1.2



## Completed Tasks

### Task 8.8.1.2: Task 8.8.1.2 ✅
**Goal:** Task completed

**Next Task:**
- 8.8.1.3



### Task 8.8.1.1: Task 8.8.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 8.8.1.2

<!-- end excerpt session -->



### Task 8.8.1.2: Task 8.8.1.2 ✅
**Goal:** Task completed

**Next Task:**
- 8.8.1.3


## Harness: commit preview (in-scope diff)

Paths (7): `.project-manager/GAP_CLOSURE_CHECKLIST.md`, `.project-manager/features/security-hardening/sessions/session-8.8.1-guide.md`, `.project-manager/features/security-hardening/sessions/session-8.8.1-log.md`, `server/src/routes/internal/property-mappings/propertyMappingsValidators.ts`, `server/src/routes/schemas/propertyMappingSchemas.ts`, `.project-manager/features/security-hardening/sessions/task-8.8.1.2-handoff.md`, `.project-manager/features/security-hardening/sessions/task-8.8.1.2-planning.md`

### `git diff --stat HEAD`

```text
.project-manager/GAP_CLOSURE_CHECKLIST.md          |  4 +-
 .../sessions/session-8.8.1-guide.md                |  2 +-
 .../sessions/session-8.8.1-log.md                  | 15 ++++++
 .../propertyMappingsValidators.ts                  | 60 +++-------------------
 .../src/routes/schemas/propertyMappingSchemas.ts   | 47 +++++++++--------
 5 files changed, 52 insertions(+), 76 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/GAP_CLOSURE_CHECKLIST.md b/.project-manager/GAP_CLOSURE_CHECKLIST.md
index 63d98fcc..3a6ac1cf 100644
--- a/.project-manager/GAP_CLOSURE_CHECKLIST.md
+++ b/.project-manager/GAP_CLOSURE_CHECKLIST.md
@@ -63,7 +63,7 @@ flowchart LR
 | GC-8.5.2 | F8 | Helmet **Content-Security-Policy** tuned for API + Vue SPA; no violations in dev/prod builds. | [session-8.5.2-guide.md](features/security-hardening/sessions/session-8.5.2-guide.md) | `server/src/app.ts` | done | security-hardening | Baseline CSP; iterate `connect-src`/`img-src` in staging if needed |
 | GC-8.6 | F8 | Replace `csrfProtection` stub with real CSRF (state-changing routes). | session 8.6.1 / [phase-8.6-guide.md](features/security-hardening/phases/phase-8.6-guide.md) | `server/src/middlewares/csrfTokens.ts`, `security.ts` | done | PROJECT_PLAN F8 step 6 | Client: `authStore` + `apiClientCore` |
 | GC-8.7 | F8 | Replace `checkOwnership` stub with resource ownership checks. | session 8.7.1 / [phase-8.7-guide.md](features/security-hardening/phases/phase-8.7-guide.md) | `server/src/middlewares/ownershipChecks.ts` | done | PROJECT_PLAN F8 step 7 | Appointments first |
-| GC-8-JOI | F8 | Joi (or equivalent) on remaining internal POST/PUT bodies missing `validateRequest`. | [session-8.5.4-guide.md](features/security-hardening/sessions/session-8.5.4-guide.md) | `server/src/routes/internal/**` | done | PROJECT_PLAN F8 step 5 | Batch A: session 8.5.3 (users + audit table). Batch B: session 8.5.4 (property mappings Joi). Batch C (session 8.5.5): verified `/v1/internal/auth` POSTs use `validateRequest`; relationship PATCH routers use inline Joi; dev router GET-only (N/A). Log: `session-8.5.5-log.md`. |
+| GC-8-JOI | F8 | Joi (or equivalent) on remaining internal POST/PUT bodies missing `validateRequest`. | [phase-8.8-guide.md](features/security-hardening/phases/phase-8.8-guide.md) session **8.8.1** | `server/src/routes/internal/**` | done | PROJECT_PLAN F8 step 5 | **8.8.1:** User CRUD uses `validateRequest` middleware + `userSchemas.ts`. Property field/feature mappings use `createCrudRouter` `validateRequest` with Joi in `propertyMappingsValidators.ts` (schemas in `propertyMappingSchemas.ts`). Prior batches: 8.5.3–8.5.5; auth/relationships covered earlier. |
 | GC-10-NOTE | Cross | `GIT_MCP_SERVER` / PAT hygiene in root `.env` (Feature 10 security note). | optional | `.env.example` | pending | PROJECT_PLAN Feature 10 Security Note | Optional hygiene |
 
 **Excluded by policy:** Feature 6 (appointment workflow, org defaults, phases 6.x).
@@ -76,4 +76,4 @@ Items **GC-DOC-7**, **GC-DOC-8** capture **stale PROJECT_PLAN** narrative vs imp
 
 ---
 
-_Last updated: 2026-03-25 (GC-7-E1: session 7.4.4 registered under phase 7.4; GC-8-JOI batch C in session 8.5.5)_
+_Last updated: 2026-03-25 (GC-8-JOI: phase 8.8 — user + property mapping Joi consolidated; `propertyMappingSchemas` single source of truth)_
diff --git a/.project-manager/features/security-hardening/sessions/session-8.8.1-guide.md b/.project-manager/features/security-hardening/sessions/session-8.8.1-guide.md
index d58abb01..1a4e1ece 100644
--- a/.project-manager/features/security-hardening/sessions/session-8.8.1-guide.md
+++ b/.project-manager/features/security-hardening/sessions/session-8.8.1-guide.md
@@ -51,7 +51,7 @@ These sections contain session-specific content:
 **Approach:** Follow existing schema pattern (`entitySchemas.ts`, `propertySchemas.ts`). Define create/update schemas with required fields; patch schemas with all optional but `.min(1)`. Use `.unknown(true)` for forward compat.
 **Checkpoint:** Schema files export named Joi schemas; `cd server && npm run lint` passes
 
-- [ ] #### Task 8.8.1.2: Wire validateRequest callbacks and update checklist
+- [x] #### Task 8.8.1.2: Wire validateRequest callbacks and update checklist
 **Goal:** Add `validateRequest` callbacks to all three CRUD router configs; update GC-8-JOI
 **Files:** 
 - `server/src/routes/internal/users/userCrudRouter.ts`
diff --git a/.project-manager/features/security-hardening/sessions/session-8.8.1-log.md b/.project-manager/features/security-hardening/sessions/session-8.8.1-log.md
index cb51382a..807e46cc 100644
--- a/.project-manager/features/security-hardening/sessions/session-8.8.1-log.md
+++ b/.project-manager/features/security-hardening/sessions/session-8.8.1-log.md
@@ -11,6 +11,14 @@
 


## Test Status

**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (12): `.project-manager/features/security-hardening/across-ladder.json`, `.project-manager/features/security-hardening/feature-security-hardening-handoff.md`, `.project-manager/features/security-hardening/phases/phase-8.8-guide.md`, `.project-manager/features/security-hardening/phases/phase-8.8-handoff.md`, `.project-manager/features/security-hardening/sessions/session-8.8.1-guide.md`, `.project-manager/features/security-hardening/sessions/session-8.8.1-log.md`, `.project-manager/features/security-hardening/sessions/session-8.8.1-planning.md`, `.project-manager/features/security-hardening/sessions/task-8.8.1.1-planning.md`, `.project-manager/features/security-hardening/sessions/task-8.8.1.2-planning.md`, `.project-manager/features/security-hardening/phases/phase-8.8-log.md`, `.project-manager/features/security-hardening/planning-archive/session/8.8.1/`, `.project-manager/features/security-hardening/sessions/session-8.8.1-handoff.md`

### `git diff --stat HEAD`

```text
.../features/security-hardening/across-ladder.json |   4 +-
 .../feature-security-hardening-handoff.md          |   8 +-
 .../security-hardening/phases/phase-8.8-guide.md   |   2 +-
 .../security-hardening/phases/phase-8.8-handoff.md |   4 +-
 .../sessions/session-8.8.1-guide.md                |   2 +
 .../sessions/session-8.8.1-log.md                  |   7 +-
 .../sessions/session-8.8.1-planning.md             | 273 +++++++++++----------
 .../sessions/task-8.8.1.1-planning.md              | 161 ------------
 .../sessions/task-8.8.1.2-planning.md              | 149 -----------
 9 files changed, 165 insertions(+), 445 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/security-hardening/across-ladder.json b/.project-manager/features/security-hardening/across-ladder.json
index a926d4b6..5638fcec 100644
--- a/.project-manager/features/security-hardening/across-ladder.json
+++ b/.project-manager/features/security-hardening/across-ladder.json
@@ -1,8 +1,8 @@
 {
   "schemaVersion": 1,
   "feature": "security-hardening",
-  "derivedAt": "2026-03-25T20:11:53.440Z",
-  "sourceTier": "session",
+  "derivedAt": "2026-03-25T20:20:34.516Z",
+  "sourceTier": "session_end",
   "phasesOnDisk": [
     "8.1",
     "8.2",
diff --git a/.project-manager/features/security-hardening/feature-security-hardening-handoff.md b/.project-manager/features/security-hardening/feature-security-hardening-handoff.md
index 591f7726..ff5adddb 100644
--- a/.project-manager/features/security-hardening/feature-security-hardening-handoff.md
+++ b/.project-manager/features/security-hardening/feature-security-hardening-handoff.md
@@ -35,9 +35,11 @@ Phase 8.2 (Inbound Rate Limiting) complete. General limiter (100 req/15 min) and
 
 _Auto-updated from disk guides. Agents: prefer `across-ladder.json` for checks._
 
-- **Feature:** `security-hardening` · **Source:** phase_end · **Derived:** 2026-03-25T19:12:18.142Z
-- **Phases on disk (7):** 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7
-- **Focus phase:** `8.5` · **Next phase across:** `8.6` → `/phase-start 8.6`
+- **Feature:** `security-hardening` · **Source:** session_end · **Derived:** 2026-03-25T20:20:34.516Z
+- **Phases on disk (8):** 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8
+- **Focus phase:** `8.8` · **Next phase across:** _(none — after phase-end use /feature-end if last)_
+- **Focus session:** `8.8.1` · **Session 1/1 in phase** · **Next session across:** _(then /phase-end)_
+- **Tasks in session (detected):** 2 · **Next task across:** `8.8.1.1` → `/task-start` / cascade
 - **Manifest:** `.project-manager/features/security-hardening/across-ladder.json`
 <!-- harness-across-ladder:end -->
 
diff --git a/.project-manager/features/security-hardening/phases/phase-8.8-guide.md b/.project-manager/features/security-hardening/phases/phase-8.8-guide.md
index 634cdfe7..319dbd0a 100644
--- a/.project-manager/features/security-hardening/phases/phase-8.8-guide.md
+++ b/.project-manager/features/security-hardening/phases/phase-8.8-guide.md
@@ -28,7 +28,7 @@
 
 ## Sessions Breakdown
 
-- [ ] ### Session 8.8.1: Joi schemas and CRUD validateRequest wiring
+- [x] ### Session 8.8.1: Joi schemas and CRUD validateRequest wiring
 **Description:** Create Joi schema files, wire validateRequest callbacks into userCrudRouter and propertyMappingsRouter (both CRUD instances), run server lint, update checklist.
 **Tasks:** 2–3
 **Focus:**
diff --git a/.project-manager/features/security-hardening/phases/phase-8.8-handoff.md b/.project-manager/features/security-hardening/phases/phase-8.8-handoff.md
index 59adfe42..68eee625 100644
--- a/.project-manager/features/security-hardening/phases/phase-8.8-handoff.md
+++ b/.project-manager/features/security-hardening/phases/phase-8.8-handoff.md
@@ -69,8 +69,10 @@ Continue with next step. [Fill in.]
 
 _Auto-updated from disk guides. Agents: prefer `across-ladder.json` for checks._
 
-- **Feature:** `security-hardening` · **Source:** phase · **Derived:** 2026-03-25T20:07:54.234Z
+- **Feature:** `security-hardening` · **Source:** session_end · **Derived:** 2026-03-25T20:20:34.516Z
 - **Phases on disk (8):** 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8
 - **Focus phase:** `8.8` · **Next phase across:** _(none — after phase-end use /feature-end if last)_
+- **Focus session:** `8.8.1` · **Session 1/1 in phase** · **Next session across:** _(then /phase-end)_
+- **Tasks in session (detected):** 2 · **Next task across:** `8.8.1.1` → `/task-start` / cascade
 - **Manifest:** `.project-manager/features/security-hardening/across-ladder.json`
 <!-- harness-across-ladder:end -->
diff --git a/.project-manager/features/security-hardening/sessions/session-8.8.1-guide.md b/.project-manager/features/security-hardening/sessions/session-8.8.1-guide.md
index 1a4e1ece..f042ca6b 100644
--- a/.project-manager/features/security-hardening/sessions/session-8.8.1-guide.md
+++ b/.project-manager/features/security-hardening/sessions/session-8.8.1-guide.md
@@ -407,3 +407,5 @@ Break each session into focused tasks:
 ## Notes
 
 [Session-specific notes, patterns, architectural decisions]
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/.project-manager/features/security-hardening/sessions/session-8.8.1-log.md b/.project-manager/features/security-hardening/sessions/session-8.8.1-log.md
index 921b566e..214b6b86 100644
--- a/.project-manager/features/security-hardening/sessions/session-8.8.1-log.md
+++ b/.project-manager/features/security-hardening/sessions/session-8.8.1-log.md
@@ -92,4 +92,9 @@ index cb51382a..807e46cc 100644
 --- a/.project-manager/features/security-hardening/sessions/session-8.8.1-log.md
 +++ b/.project-manager/features/security-hardening/sessions/session-8.8.1-log.md
 @@ -11,6 +11,14 @@
- 
\ No newline at end of file
+ 
+
+
+## Test Status
+
+**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.
diff --git a/.project-manager/features/security-hardening/sessions/session-8.8.1-planning.md b/.project-manager/features/security-hardening/sessions/session-8.8.1-planning.md
index d2226ebb..1c43644c 100644
--- a/.project-manager/features/security-hardening/sessions/session-8.8.1-planning.md
+++ b/.project-manager/features/security-hardening/sessions/session-8.8.1-planning.md
@@ -1,195 +1,214 @@
-# Plan: session 8.8.1 — ** ** Create Joi schemas for User, PropertyFieldMapping, and PropertyFeatureMapping models; wire `validateRequest` callbacks into all three CRUD router configs; run server lint; update GC-8-JOI checklist
-
-## Contract
-- **Tier:** session | **ID:** 8.8.1
-- **Scope:** ** ** Create Joi schemas for User, PropertyFieldMapping, and PropertyFeatureMapping models; wire `validateRequest` callbacks into all three CRUD router configs; run server lint; update GC-8-JOI checklist
-- **Governance (harness snapshot):**
-  - Governance Context (Session)
-  - Function Governance
-  - Clean — no violations detected.
-  - Component Governance
-  - Clean — no violations detected.
-  - 3. Script logic can move to composable/util? → extract (Tier1 hotspots: watch, async, map/reduce, DOM)
-  - `client/src/composables/booking/useAvailabilitySubStepContent.ts` — oversized-return: Return surface has 15 properties; decompose into focused composables
-
-## Work Profile
-- **Execution intent:** plan
-- **Action type:** decomposition
-- **Scope shape:** cross_cutting
-- **Governance domains:** docs, architecture
-- **Gate profile:** standard
-- **Suggested depth:** full — advisory; agent decides in Analysis / Decomposition
-- **Recommended context pack:** decomposition_pack
-- **Planning artifact action:** create
-- **Decomposition mode:** moderate
-- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition.
-
-## Where we left off
-Phase 8.7 completed ownership checks. GC-8-JOI was marked "done" but code audit found 3 CRUD router configs with zero validation. Phase 8.8 was created to close the gap.
+<!-- harness-planning-rollup tier=session id=8.8.1 consolidatedAt=2026-03-25T20:21:02.990Z -->
+
+# Consolidated planning: session 8.8.1
+
+## Session 8.8.1 (parent)
 
 ## Story
+
 **This session delivers** Joi schemas and `validateRequest` callbacks for the 3 remaining unvalidated CRUD routers **so that** all internal mutating routes reject malformed payloads at the middleware layer, and GC-8-JOI is accurately closed.
 **Estimated size:** S
 
 ---
-## Architecture context (harness-injected)
 
-## 1. System overview
+## Analysis
+
+**Problem:** `userCrudRouter.ts` and both CRUD instances in `propertyMappingsRouter.ts` use `createCrudRouter` without a `validateRequest`
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
