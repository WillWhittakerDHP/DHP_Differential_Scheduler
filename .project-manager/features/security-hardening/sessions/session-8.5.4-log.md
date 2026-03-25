# Session 8.5.4 Log: Joi gap closure batch B — Audit remaining server/src/routes/internal routers for missing validateRequest; same constraints as 8.5.3; close or narrow GC-8-JOI when all targeted mutating routes are covered or explicitly exempted with documented rationale. Consult GAP_CLOSURE_HARNESS_ADD_PROMPTS.md and then update GAP_CLOSURE_CHECKLIST GC-8-JOI when batch is verified (lint + smoke).

**Status:** In Progress
**Date:** 2026-03-25

---

## Session Goal

[Document concrete session goal]

### Task 8.5.4.1: Task 8.5.4.1 ✅
**Goal:** Task completed

**Next Task:**
- 8.5.4.2



## Completed Tasks

### Task 8.5.4.3: Task 8.5.4.3 ✅
**Goal:** Task completed

**Next Task:**
- 8.5.4.4



### Task 8.5.4.2: Task 8.5.4.2 ✅
**Goal:** Task completed

**Next Task:**
- 8.5.4.3



### Task 8.5.4.1: Task 8.5.4.1 ✅
**Goal:** Task completed

**Next Task:**
- 8.5.4.2

<!-- end excerpt session -->



### Task 8.5.4.2: Task 8.5.4.2 ✅
**Goal:** Task completed

**Next Task:**
- 8.5.4.3


## Harness: commit preview (in-scope diff)

Paths (7): `.project-manager/HARNESS_CHARTER.md`, `.project-manager/features/security-hardening/sessions/session-8.5.4-guide.md`, `.project-manager/features/security-hardening/sessions/session-8.5.4-log.md`, `server/src/routes/internal/property-mappings/propertyMappingsRouter.ts`, `.project-manager/features/security-hardening/sessions/task-8.5.4.2-handoff.md`, `.project-manager/features/security-hardening/sessions/task-8.5.4.2-planning.md`, `server/src/routes/internal/property-mappings/propertyMappingsValidators.ts`

### `git diff --stat HEAD`

```text
.project-manager/HARNESS_CHARTER.md                       |  1 +
 .../security-hardening/sessions/session-8.5.4-guide.md    |  2 +-
 .../security-hardening/sessions/session-8.5.4-log.md      | 15 +++++++++++++++
 .../internal/property-mappings/propertyMappingsRouter.ts  | 10 +++++++++-
 4 files changed, 26 insertions(+), 2 deletions(-)
```

### `git diff HEAD`

```diff
diff --git a/.project-manager/HARNESS_CHARTER.md b/.project-manager/HARNESS_CHARTER.md
index 27651e3a..7519d47c 100644
--- a/.project-manager/HARNESS_CHARTER.md
+++ b/.project-manager/HARNESS_CHARTER.md
@@ -111,6 +111,7 @@ Other tiers use a single approve step (`approve_execute`); only task has this ex
 - **nextInvoke shape:** Control-plane decision uses `nextInvoke: { tier, action, params }` (not a full `WorkflowSpec`). Params carry tier identifiers and `params.options` for execution toggles (e.g. `mode: 'execute'`).
 - **Workflow scope resolution:** `resolveWorkflowScope` (`.cursor/commands/utils/workflow-scope.ts`) is the **only** resolver for normalized feature directory name, tier + identifier, and optional `.tier-scope`. **Phase, session, and task** invocations **must** include **`featureId` or `featureName`** (numeric `#` or directory slug from `PROJECT_PLAN.md` Feature Summary). The harness does **not** infer feature from git branch. Pending state (`.tier-start-pending.json`, `.task-start-pending.json`) must carry feature for phase/session/task re-invocation (`/accepted-plan`, `/accepted-build`, `/accepted-code`). `WorkflowCommandContext.contextFromParams` delegates to `resolveWorkflowScope` only. For **feature-only** lookups (utilities, audits, scripts), use **`resolveFeatureDirectoryFromPlan(ref)`** (# or slug → directory); for **continue last explicit scope** (no ref), use **`resolveActiveFeatureDirectory()`** (reads `.project-manager/.tier-scope` from tier-start — not git).
 - **Workflow friction (non-git):** Classified harness failures append to **`.project-manager/WORKFLOW_FRICTION_LOG.md`**. **Harness code** imports **`.cursor/commands/harness/workflow-friction-manager.ts`**: use **`initiateWorkflowFrictionWrite`** when execution is unclear or the agent struggles; **`recordOrchestratorFailureFriction`** for tier start/end orchestrator failures; **`recordHarnessVerboseWarning`** for verbose-only step advisories. Low-level append/format lives in **`.cursor/commands/utils/workflow-friction-log.ts`** (policy: `parseReasonCode` + failure taxonomy; `HARNESS_WORKFLOW_FRICTION`). Read/filter: `npx tsx .cursor/commands/utils/read-workflow-friction.ts`. **`gap_analysis_pending`** is an expected flow stop and is **not** auto-logged (suppressed like `verification_suggested`). Internal errors in the **`gap_analysis`** step use **`gap_analysis_failed`** with `forcePolicy: true`, non-gating. Aligns with governance context redesign (Pillar 5: agent-maintained friction parallel to git JSONL). See **START_END_PLAYBOOK_STRUCTURE.md** → *Workflow / planning friction*.
+- **`/harness-repair`:** Plan mode analyzes the friction log (open vs addressed, recurrence clusters) and injects **`buildTierAdvisoryContext`** (via **`classifyWorkProfile`** + **`workflow_bug_fix`**). Execute mode writes stable **addressed** bullets (`harnessRepairAddressed`, note, `parentRepoCommit`, `cursorSubmoduleCommit`) in-place and uses **Policy A**: commit with **`parentRepoCommit: pending`**, then stamp the real parent SHA in a second commit. **`.cursor`** submodule commits for harness changes go through **`git-manager`** (`getCursorSubmoduleStatus`, **`commitCursorSubmoduleAndStageParentGitlink`**). **Session-end:** When the outcome is **`pending_push_confirmation`** and **`hasOpenWorkflowFrictionEntries()`** is true, **`nextAction`** appends a requirement to run **`/harness-repair`** in **plan** mode before **`/accepted-push`** (no execute inside `runTierEndWorkflow`). See **`.cursor/commands/harness-repair.md`**.
 
 ---
 
diff --git a/.project-manager/features/security-hardening/sessions/session-8.5.4-guide.md b/.project-manager/features/security-hardening/sessions/session-8.5.4-guide.md
index fc6f083c..61892dae 100644
--- a/.project-manager/features/security-hardening/sessions/session-8.5.4-guide.md
+++ b/.project-manager/features/security-hardening/sessions/session-8.5.4-guide.md
@@ -51,7 +51,7 @@ These sections contain session-specific content:
 **Approach:** Walk each batch B mount's router files. For each `router.post`/`.put`/`.patch`, inspect middleware chain. Classify and record.
 **Checkpoint:** Audit table complete with all batch B mutating routes classified.
 
-- [ ] #### Task 8.5.4.2: Add Joi validators for property mapping GAPs
+- [x] #### Task 8.5.4.2: Add Joi validators for property mapping GAPs
 **Goal:** Create validators and wire `validateRequest` factory callbacks for the 6 GAP routes in field-mappings and feature-mappings.
 **Files:** 
 - `server/src/routes/internal/property-mappings/propertyMappingsValidators.ts` (new)
diff --git a/.project-manager/features/security-hardening/sessions/session-8.5.4-log.md b/.project-manager/features/security-hardening/sessions/session-8.5.4-log.md
index 6579f549..2ce59eec 100644
--- a/.project-manager/features/security-hardening/sessions/session-8.5.4-log.md
+++ b/.project-manager/features/security-hardening/sessions/session-8.5.4-log.md
@@ -19,6 +19,14 @@
 
### Task 8.5.4.3: Task 8.5.4.3 ✅
**Goal:** Task completed

**Next Task:**
- 8.5.4.4

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (5): `.project-manager/GAP_CLOSURE_CHECKLIST.md`, `.project-manager/features/security-hardening/sessions/session-8.5.4-guide.md`, `.project-manager/features/security-hardening/sessions/session-8.5.4-log.md`, `.project-manager/features/security-hardening/sessions/task-8.5.4.3-handoff.md`, `.project-manager/features/security-hardening/sessions/task-8.5.4.3-planning.md`

### `git diff --stat HEAD`

```text
.project-manager/GAP_CLOSURE_CHECKLIST.md                |  4 ++--
 .../security-hardening/sessions/session-8.5.4-guide.md   |  2 +-
 .../security-hardening/sessions/session-8.5.4-log.md     | 16 +++++++++++++++-
 3 files changed, 18 insertions(+), 4 deletions(-)
```

### `git diff HEAD`

```diff
diff --git a/.project-manager/GAP_CLOSURE_CHECKLIST.md b/.project-manager/GAP_CLOSURE_CHECKLIST.md
index 80cca7f8..a72b75e8 100644
--- a/.project-manager/GAP_CLOSURE_CHECKLIST.md
+++ b/.project-manager/GAP_CLOSURE_CHECKLIST.md
@@ -63,7 +63,7 @@ flowchart LR
 | GC-8.5.2 | F8 | Helmet **Content-Security-Policy** tuned for API + Vue SPA; no violations in dev/prod builds. | [session-8.5.2-guide.md](features/security-hardening/sessions/session-8.5.2-guide.md) | `server/src/app.ts` | done | security-hardening | Baseline CSP; iterate `connect-src`/`img-src` in staging if needed |
 | GC-8.6 | F8 | Replace `csrfProtection` stub with real CSRF (state-changing routes). | session 8.6.1 / [phase-8.6-guide.md](features/security-hardening/phases/phase-8.6-guide.md) | `server/src/middlewares/csrfTokens.ts`, `security.ts` | done | PROJECT_PLAN F8 step 6 | Client: `authStore` + `apiClientCore` |
 | GC-8.7 | F8 | Replace `checkOwnership` stub with resource ownership checks. | session 8.7.1 / [phase-8.7-guide.md](features/security-hardening/phases/phase-8.7-guide.md) | `server/src/middlewares/ownershipChecks.ts` | done | PROJECT_PLAN F8 step 7 | Appointments first |
-| GC-8-JOI | F8 | Joi (or equivalent) on remaining internal POST/PUT bodies missing `validateRequest`. | session TBD | `server/src/routes/internal/**` | pending | PROJECT_PLAN F8 step 5 | Parallel / ongoing |
+| GC-8-JOI | F8 | Joi (or equivalent) on remaining internal POST/PUT bodies missing `validateRequest`. | [session-8.5.4-guide.md](features/security-hardening/sessions/session-8.5.4-guide.md) | `server/src/routes/internal/**` | done | PROJECT_PLAN F8 step 5 | Batch A: session 8.5.3 (users + audit table). Batch B: session 8.5.4 (property mappings Joi). See task planning 8.5.3.x / 8.5.4.1–8.5.4.2. |
 | GC-10-NOTE | Cross | `GIT_MCP_SERVER` / PAT hygiene in root `.env` (Feature 10 security note). | optional | `.env.example` | pending | PROJECT_PLAN Feature 10 Security Note | Optional hygiene |
 
 **Excluded by policy:** Feature 6 (appointment workflow, org defaults, phases 6.x).
@@ -76,4 +76,4 @@ Items **GC-DOC-7**, **GC-DOC-8** capture **stale PROJECT_PLAN** narrative vs imp
 
 ---
 
-_Last updated: 2026-03-25 (tranches A–C + enactment partial; Joi sweep open)_
+_Last updated: 2026-03-25 (GC-8-JOI closed: internal Joi sweep batches A+B)_
diff --git a/.project-manager/features/security-hardening/sessions/session-8.5.4-guide.md b/.project-manager/features/security-hardening/sessions/session-8.5.4-guide.md
index 61892dae..26f33d87 100644
--- a/.project-manager/features/security-hardening/sessions/session-8.5.4-guide.md
+++ b/.project-manager/features/security-hardening/sessions/session-8.5.4-guide.md
@@ -59,7 +59,7 @@ These sections contain session-specific content:
 **Approach:** Create Joi-based validators matching model fields. Wire `validateRequest` callbacks + `sanitizeInput` into `createCrudRouter` configs. Server lint.
 **Checkpoint:** Property mapping routes reject invalid bodies with 400. Valid requests work. Server lint passes.
 
-- [ ] #### Task 8.5.4.3: Verify + close GC-8-JOI
+- [x] #### Task 8.5.4.3: Verify + close GC-8-JOI
 **Goal:** Verify app starts + lint; produce combined A+B summary; update GC-8-JOI to done.
 **Files:** 
 - `.project-manager/GAP_CLOSURE_CHECKLIST.md` (modify)
diff --git a/.project-manager/features/security-hardening/sessions/session-8.5.4-log.md b/.project-manager/features/security-hardening/sessions/session-8.5.4-log.md
index f6362c7b..e630409d 100644
--- a/.project-manager/features/security-hardening/sessions/session-8.5.4-log.md
+++ b/.project-manager/features/security-hardening/sessions/session-8.5.4-log.md
@@ -19,6 +19,14 @@
 