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

<!-- harness:anchor:commit-preview -->
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
 