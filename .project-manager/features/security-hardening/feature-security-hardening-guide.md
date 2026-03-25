<!-- harness-guide-rollup tier=feature id=security-hardening consolidatedAt=2026-03-24T22:43:16.884Z -->

# Feature security-hardening Guide

**Purpose:** Feature-level guide for planning and tracking major initiatives

**Tier:** Feature (Tier 0 - Highest Level)

---

## Feature Overview

**Feature Name:** security-hardening
**Description:** CORS lockdown, rate limiting, request validation (Joi), secrets audit, security headers (Helmet), CSRF when using session-based auth. Protects API before external access.
**Status:** In progress (8.1–8.4 + partial 8.5 + 8.6/8.7 delivered in code; Joi sweep ongoing)

**Duration:** [To be determined]
**Started:** 2026-03-21
**Completed:** —

---

## Research Phase

Research phase not yet started — architectural decisions to be documented in this guide.

---

## Feature Objectives

- Lock down CORS to specific origins (Render static site URL, localhost for dev)
- Add API rate limiting for internal and auth routes
- Add request validation / input sanitization (Joi on all POST/PUT bodies)
- Audit environment variables and ensure no secrets in committed files
- Review security response headers (Helmet, CSP)
- Implement CSRF protection if using session-based auth
- Replace checkOwnership stub with real implementation

---

## Existing Infrastructure (reconciled 2026-03-25)

| What | File(s) | Status |
|------|---------|--------|
| Helmet | `server/src/app.ts` | **HSTS**, **referrerPolicy**, **contentSecurityPolicy** (dev allows `unsafe-inline` / `unsafe-eval` for Vite). |
| CORS | `server/src/app.ts`, `envConfig.ts` | **`CORS_ORIGIN`** (default dev client origin); `cors({ origin })`. |
| Inbound rate limit | `server/src/middlewares/rateLimit.ts`, `routes/index.ts` | **generalRateLimiter** on `/internal`, **authRateLimiter** on `/internal/auth`. |
| Joi + `validateRequest` | `middlewares/validateRequest.ts`, route schemas | Used on multiple routers; **not** yet every POST/PUT. |
| CRUD router factory | `createCrudRouter.ts` | Wires **`csrfProtection`** + **`checkOwnership`** on mutations. |
| CSRF | `middlewares/csrfTokens.ts`, `security.ts`, `GET /auth/csrf-token` | **Double-submit** cookie + `X-CSRF-Token`. |
| Ownership | `middlewares/ownershipChecks.ts` | **Appointments** + privileged roles; anonymous passes through. |
| Outbound rate limit | `rateLimiter.ts`, Google/MLS | Unchanged. |
| Security doc | `server/docs/SECURITY_STUBS.md` | Updated for CSRF + ownership behavior. |

**Remaining:** Full **Joi** coverage on all internal mutating routes; tighten **CSP** for production builds if violations appear; extend **ownership** beyond appointments where product requires.

---

## Phases Breakdown

> **Steps 1–5 are independent of Feature 7** and can be done now. Steps 6–7 require working sessions/auth and align with Feature 7's Enactment phase.

- [x] ### Phase 8.1: CORS Lockdown
**Description:** `CORS_ORIGIN` in `envConfig`; `cors({ origin })` in `app.ts`.
**Success Criteria:** Met for configured origins.

- [x] ### Phase 8.2: Inbound Rate Limiting
**Description:** `express-rate-limit` on internal + auth paths.
**Success Criteria:** Met.

- [x] ### Phase 8.3: Helmet (HSTS, referrer, CSP baseline)
**Description:** CSP enabled; dev relaxes script-src for Vite.
**Success Criteria:** Met — monitor CSP reports in staging/production.

- [x] ### Phase 8.4: Secrets Audit
**Description:** Per `SECURITY_STUBS.md` inventory and `.env.example` expansion (see doc).
**Success Criteria:** Met for audited tranche; re-run when new env vars ship.

- [ ] ### Phase 8.5: Joi Request Body Validation (ongoing)
**Description:** Audit remaining POST/PUT without `validateRequest` / Joi.
**Success Criteria:** All internal mutating routes validated.

- [x] ### Phase 8.6: CSRF Real Implementation
**Description:** `csrf` package + `csrf_secret` cookie + `GET /auth/csrf-token`; `csrfProtection` verifies token.
**Active guide:** [sessions/session-8.6.1-guide.md](sessions/session-8.6.1-guide.md)
**Success Criteria:** Unsafe methods require valid CSRF when cookie present.

- [x] ### Phase 8.7: checkOwnership (appointments + privileged roles)
**Description:** `ownershipChecks.ts` — appointment `scheduledById` / `heldBy`; privileged roles bypass.
**Active guide:** [sessions/session-8.7.1-guide.md](sessions/session-8.7.1-guide.md)
**Success Criteria:** Authenticated non-owner cannot read others’ appointments by id; extend other resources as needed.

---

## Success Criteria (Feature-Level)

- [x] CORS locked to production and dev origins
- [x] Inbound rate limiting active on internal + auth routes
- [x] Helmet with HSTS, referrer policy, CSP baseline
- [x] Secrets audit tranche (see SECURITY_STUBS)
- [ ] Joi validation on all unvalidated POST/PUT routes
- [x] CSRF protection active (with client `csrf-token` bootstrap)
- [x] Ownership checks for appointments (extend as needed)
- [ ] All existing tests still pass (testing suspended per project policy)

---

## Related Documents

- **PROJECT_PLAN.md:** Feature 8 section
- **Gap closure tracker:** [GAP_CLOSURE_CHECKLIST.md](../../GAP_CLOSURE_CHECKLIST.md)
- **Launch Checklist:** `../../LAUNCH_CHECKLIST.md` Phase 2
- **Security Stubs:** `server/docs/SECURITY_STUBS.md`
- **Authentication (dependency):** `../authentication/`

---

**Last Updated:** 2026-03-25

---

## Phase rollup (from parallel phase-8.5 line)

- **Phase 8.1:** CORS origin wiring — complete on integration branch
- **Phase 8.2:** Inbound rate limiting — complete on integration branch
- **Phase 8.3:** Request validation / input sanitization — Joi on POST/PUT bodies
- **Phase 8.4:** Secrets audit
- **Phase 8.5:** Security headers — Helmet, CSP
- **Phase 8.6–8.7:** CSRF protection (depends on Feature 7 Authentication)

## Guide doc rollup (harness)

Child guides were archived at **2026-03-24T22:43:16.884Z** (safe rollup — no automatic merge of tierDown blocks).

- `.project-manager/features/security-hardening/phases/phase-8.1-guide.md`
- `.project-manager/features/security-hardening/phases/phase-8.2-guide.md`
- `.project-manager/features/security-hardening/phases/phase-8.3-guide.md`
- `.project-manager/features/security-hardening/phases/phase-8.4-guide.md`
- `.project-manager/features/security-hardening/phases/phase-8.5-guide.md`

---

## Architecture

High-level architecture and dependencies. [Fill in from feature plan.]

---

## Implementation Plan

Phases and implementation order. [Fill in from feature plan.]

---

## Session docs (integrated)

### session-8.1.1-guide

# Session 8.1.1 Guide: ** Add CORS_ORIGIN env var, wire CORS origin in app.ts, update .env.example, verify origin restriction

**Purpose:** Session-level guide with task breakdown

**Tier:** Session (Tier 2 - Medium-Level)

---

### session-8.1.2-guide

# Session 8.1.2 Guide: CORS verification and .env.example polish

**Purpose:** Session-level guide with task breakdown

**Tier:** Session (Tier 2 - Medium-Level)

---

### session-8.2.1-guide

# Session 8.2.1 Guide: General rate limiter for internal API routes

**Phase:** 8.2 — Inbound Rate Limiting
**Session:** 8.2.1 — General rate limiter for internal API routes
**Status:** In Progress
**Branch:** `session-8.2.1`

---

### session-8.2.2-guide

# Session 8.2.2 Guide: Auth-route limiter and verification

**Phase:** 8.2 — Inbound Rate Limiting
**Session:** 8.2.2 — Auth-route limiter and verification
**Status:** In Progress
**Branch:** `session-8.2.2`

---

### session-8.3.1-guide

# Session 8.3.1 Guide: ** Add validation library and middleware

**Purpose:** Session-level guide with task breakdown

**Tier:** Session (Tier 2 - Medium-Level)

---

### session-8.3.2-guide

# Session 8.3.2 Guide: ** Apply validation across internal routes

**Purpose:** Session-level guide with task breakdown

**Tier:** Session (Tier 2 - Medium-Level)

---

### session-8.4.1-guide

# Session 8.4.1 Guide: ** Env var audit — inventory process.env usage, validate .env.example, ensure no hardcoded secrets

**Purpose:** Session-level guide with task breakdown

**Tier:** Session (Tier 2 - Medium-Level)

---

### session-8.4.2-guide

# Session 8.4.2 Guide: Committed files scan

**Purpose:** Session-level guide with task breakdown

**Tier:** Session (Tier 2 - Medium-Level)

---

### session-8.5.1-guide

# Session 8.5.1 Guide: ** Helmet configuration — audit defaults, tune HSTS/referrer policy, document in SECURITY_STUBS

**Purpose:** Session-level guide with task breakdown

**Tier:** Session (Tier 2 - Medium-Level)

---

### session-8.5.2-guide

# Session 8.5.2 Guide: ** CSP implementation — add Content-Security-Policy for API and Vue SPA, verify app loads

**Purpose:** Session-level guide with task breakdown

**Tier:** Session (Tier 2 - Medium-Level)

---

## Guide Structure

This template defines the standard structure for session guides. Session-specific guides should include all standard sections, which can be customized or reference this template.

### Standard Sections (Required)

These sections are extracted by workflow commands and should be included in all session guides:

- **Session Structure** - Session labeling format, task structure, session organization
- **Task Template** - Task planning and entry templates

**Note:** Session-specific guides can customize these sections or reference this template. If sections are missing, extraction will fall back to this template.

### Session-Specific Sections

These sections contain session-specific content:

- **Quick Start** - Session overview, tasks (session-specific)
- **Session Workflow** - Workflow instructions (can customize for session needs)
- **Reference** - Links to templates and examples
- **Notes** - Session-specific notes and decisions

---

## Quick Start

### Session Overview

**Session ID:** 8.5.2
**Session Name:** ** CSP implementation — add Content-Security-Policy for API and Vue SPA, verify app loads
**Description:** [Brief description of session objectives]

**Duration:** [Estimated hours/days]
**Status:** [Not Started / In Progress / Complete]

### Tasks

- [ ] #### Task 8.5.2.1: [Task Name]
**Goal:** [Task goal]
**Files:** 
- [Files to work with]
**Approach:** [Approach to take]
**Checkpoint:** [What needs to be verified]

- [ ] #### Task 8.5.2.2: [Task Name]
**Goal:** [Task goal]
**Files:** 
- [Files to work with]
**Approach:** [Approach to take]
**Checkpoint:** [What needs to be verified]

---

## Session Workflow

### Before Starting a Session

**Recommended:** Use `/session-start 8.5.2 [description]` to automatically:
- Load key sections from session handoff document
- Load relevant sections from session guide
- Generate formatted session label with date/status
- Display compact prompt format for reference
- Trigger task planning (fill out task embeds in session guide)
- Identify files to work with based on handoff "Next Action"

**IMPORTANT: Agent Response Format**

When agents respond to `/session-start` commands, they must follow the standardized response format defined in `.cursor/commands/tiers/session/templates/session-start-response-template.md`. The response should be concise, focused, and include:

- Current State (what's done ✅ vs missing ❌)
- Phase X.Y Objectives (numbered, actionable)
- Files to Work With (source and target)
- Implementation Plan (high-level steps)
- Key Differences: React vs Vue (brief)
- Explicit approval request: "Should I proceed with implementing these changes, or do you want to review the plan first?"

See the template file for complete format, examples, and guidelines.

**Example:**
```
/session-start 1.3 "API Clients"
```

**Manual Alternative:**
1. **Label the session** with format below
2. **Review previous session notes** (if any)
3. **Identify files to work with**

### Session Labeling Format

Each session should start with:
```
## Session: 8.5.2 - [Brief Description]
**Date:** [Date]
**Duration:** [Estimated/Actual]
**Status:** [In Progress / Completed / Blocked]
**Agent:** [Current/New]
```

### During Session

1. **Work on one task at a time**
2. **Document decisions** inline in code
3. **Ask questions** as they arise

### After Each Task - Unified Checkpoint

**CRITICAL: Automatically pause and present checkpoint summary after each task.**

**Checkpoint Type:** Choose based on task complexity:
- **Simple tasks** (trivial changes, single file): Quick checkpoint (quality only)
- **Complex tasks** (new features, multiple files, architectural changes): Full checkpoint (quality + optional feedback)

#### Quick Checkpoint Format (Simple Tasks)

```
## Checkpoint: Task [X.Y.Z]

**Completed:** [What was accomplished]
**Quality:** [Status from /checkpoint command]
**Next:** Task [X.Y.Z+1]: [Description]

[Wait for user review before continuing]
```

#### Full Checkpoint Format (Complex Tasks)

```
## Checkpoint: Task [X.Y.Z]

**Completed:** [What was accomplished]
- [Key concepts/patterns used]
- [React → Vue differences if applicable]
- [Questions answered]

**Workflow Feedback:** (Optional - only if issues encountered)
- [Any problems managing this task workflow or issues with results?]

[Wait for user review before continuing]
```

#### Checkpoint Process

1. **Automatically pause** - After completing each task, stop and present checkpoint
2. **Run quality checks** - Use `/task-checkpoint [X.Y.Z]` command (or `/checkpoint` alias) to verify code compiles and passes checks
3. **Update progress** - Mark checkpoints in session log
4. **Wait for user review** - Do NOT continue to next task until:
   - User explicitly approves continuation, OR
   - User asks questions (answer them), OR
   - User requests changes (make them), OR
   - User ends the session

### End of Session

**CRITICAL: Prompt before ending session**

After completing the last task in a session, **prompt the user** before running `/session-end`:

```
## Ready to End Session?

All tasks complete. Ready to run end-of-session workflow?

**This will:**
- Verify app starts
- Run quality checks
- Update session log
- Update handoff document
- Mark session complete (update checkboxes in phase guide)
- Git commit/push

**Proceed with /session-end?** (yes/no)
```

**If user says "yes":**
- Run `/session-end` command automatically
- Complete all end-of-session steps (verify app, lint, build, update docs)
- **Workflow order:**
  1. Verify app starts
  2. Run lint/typecheck
  3. **Commit feature work** (before audits)
  4. Run code quality audit
  5. Update docs (session log, handoff, guide)
  6. **Commit audit fixes** (if any, separately from feature work)
  7. **After all commits are done, prompt for push:**
  ```
  ## Ready to Push?
  
  All session-end checks completed successfully:
  - ✅ App starts
  - ✅ Linting passed
  - ✅ Feature work committed
  - ✅ Audit fixes committed (if any)
  - ✅ Session log updated
  - ✅ Handoff document updated
  - ✅ Session guide updated
  
  **Ready to push all commits to remote?**
  
  This will:
  - Push feature work commit
  - Push audit fixes commit (if any)
  - Push to remote repository
  
  **Proceed with push?** (yes/no)
  ```
- **If user says "yes" to push:** Execute git push, then end session
- **If user says "no" to push:** End session without pushing (user can push manually later)
- **Agent:** After session-end returns, use the command result's `outcome.nextAction` for the exact next step (do not infer from step text).

**If user says "no" to session-end:**
- Address any requested changes
- Re-prompt when ready

**Recommended:** Use `/session-end [session-id] [description] [next-session]` to automatically complete all steps below.

**Manual Alternative (5 Steps):**

1. **Verify** - App starts (`/verify-app` or `npm run start:dev`) and quality checks pass (`/verify vue`)
2. **Document** - Update session log and handoff document (use `/log-task` and `/update-handoff-minimal` or manual)
3. **Commit** - Git commit and push (`/git-commit [message]` and `/git-push` or manual)
4. **Handoff** - Create compact prompt for next session:
   ```
   @.cursor/project-manager/features/vue-migration/handoff.md Continue Vue migration - start Session [X.Y] ([Description])
   ```
5. **Feedback** - Optional workflow feedback (only if issues encountered):
   - Were there any problems managing this session workflow or issues with results?
   - Note any sticking points or inefficiencies for future improvement

**Command Chaining Example:**
```
/verify-app && /verify vue && /log-task 1.3.1 "Base API Client Setup" && /update-handoff && /git-commit "Session 1.3" && /git-push
```

---

## Session Structure

### Session Labeling Format

Each session should start with:
```
## Session: 8.5.2 - [Brief Description]
**Date:** [Date]
**Duration:** [Estimated/Actual]
**Status:** [In Progress / Completed / Blocked]
**Agent:** [Current/New]
```

### Task Structure

Break each session into focused tasks. Each task should have:

- **Goal:** Clear objective for the task
- **Files:** Source and target files (if porting/migrating)
- **Approach:** How to accomplish the goal
- **Checkpoint:** What needs to be verified upon completion

**Task Format:**
```
#### Task 8.5.2.N: [Task Name]
**Goal:** [Task goal]
**Files:** 
- [Files to work with]
**Approach:** [Approach to take]
**Checkpoint:** [What needs to be verified]
```

### Session Organization

- **Quick Start:** Session overview, tasks
- **Session Workflow:** Before/during/after session process
- **Reference:** Templates, examples, related documents
- **Notes:** Session-specific notes and decisions

---

## Task Template

### Task Planning Template

When planning a new task, use this structure:

```markdown
- [ ] #### Task 8.5.2.N: [Task Name]

**Goal:** [Clear, specific objective]

**Files:** 
- Source: `[source-path]` (if porting/migrating)
- Target: `[target-path]` (if creating new)

**Approach:** 
- [Step 1]
- [Step 2]
- [Step 3]

**Checkpoint:** 
- [What needs to be verified]
- [Quality criteria]

**Dependencies:**
- [Prerequisite tasks or files]
```

### Task Entry Template (For Session Log)

When logging a completed task:

```markdown
### Task [X.Y.Z]: [Name] ✅
**Completed:** [Date]
**Goal:** [What was accomplished]

**Files Created:**
- `[path]` - [Description]

**Files Modified:**
- `[path]` - [Description]

**Key Methods/Functions:**
- `methodName()` - [Description]

**Architecture Notes:**
- **[Pattern]**: [Explanation]

**Questions Answered:**
- **[Question]** - [Answer]

**Next Task:**
- [X.Y.Z+1]: [Next task]
```

---

## Reference

### Document Responsibilities

- **Session Guide** (this file): Instructions for how to work (workflow, checkpoints, end-of-session)
- **Session Log**: Historical record of what happened (task entries, progress)
- **Session Handoff**: Transition context for next session (where we left off, what's next)

### Documentation Templates

**See `.cursor/commands/tiers/session/templates/session-log.md` for complete documentation templates.**

Templates include:
- Task entry format for session log
- Handoff document format

### Task Structure Examples

Break each session into focused tasks:

#### Example: Session 1.1 - Type Definitions
```
### Task 1.1.1: Core Entity Types
**Goal:** Port GlobalEntity types
**Files:** 
- frontend-root/src/global/types/globalEntityTypes.ts → frontend-root/src/types/entities.ts
**Checkpoint:** Types compile without errors

### Task 1.1.2: Primitive Types  
**Goal:** Port primitive type system
**Files:**
- frontend-root/src/global/types/globalPrimitiveTypes.ts → frontend-root/src/types/properties.ts
**Checkpoint:** Primitive types match React version
```

### Recommendations

1. **Start each session** using `/session-start [X.Y]` for consistent initialization
2. **Plan tasks** using `/plan-task [X.Y.Z]` to fill out task details in session guide
3. **Complete one task** before moving to the next
4. **Use `/verify vue`** frequently during development to catch errors early
5. **Choose checkpoint type** based on task complexity (quick vs full)
6. **Document as you go** - use `/log-task [X.Y.Z]` after each task
7. **End sessions** using `/session-end [X.Y] [description] [next-session]` for complete automation
8. **Review previous sessions** before starting new ones

**See `.cursor/commands/USAGE.md` for complete slash command documentation and examples.**

---

## Related Documents

- **Session Log:** `.cursor/project-manager/features/vue-migration/sessions/session-[X.Y]-log.md` (templates and historical record)
- **Session Handoff:** `.cursor/project-manager/features/vue-migration/sessions/session-[X.Y]-handoff.md` (transition context)
- **Phase Guide:** `.cursor/project-manager/features/vue-migration/phases/phase-[X]-guide.md` (phase-level context)

---

## Notes

[Session-specific notes, patterns, architectural decisions]

## Guide Structure

This template defines the standard structure for session guides. Session-specific guides should include all standard sections, which can be customized or reference this template.

### Standard Sections (Required)

These sections are extracted by workflow commands and should be included in all session guides:

- **Session Structure** - Session labeling format, task structure, session organization
- **Task Template** - Task planning and entry templates

**Note:** Session-specific guides can customize these sections or reference this template. If sections are missing, extraction will fall back to this template.

### Session-Specific Sections

These sections contain session-specific content:

- **Quick Start** - Session overview, tasks (session-specific)
- **Session Workflow** - Workflow instructions (can customize for session needs)
- **Reference** - Links to templates and examples
- **Notes** - Session-specific notes and decisions

---

## Quick Start

### Session Overview

**Session ID:** 8.5.1
**Session Name:** ** Helmet configuration — audit defaults, tune HSTS/referrer policy, document in SECURITY_STUBS
**Description:** [Brief description of session objectives]

**Duration:** [Estimated hours/days]
**Status:** [Not Started / In Progress / Complete]

### Tasks

- [x] #### Task 8.5.1.1: Helmet config — HSTS and referrer policy
**Goal:** Replace `app.use(helmet())` with configured options (HSTS, referrerPolicy); verify app starts and API responds.
**Files:** 
- `server/src/app.ts`
**Approach:** Add helmet options object; enable HSTS for production (maxAge, includeSubDomains, preload); set referrerPolicy (strict-origin-when-cross-origin).
**Checkpoint:** App starts; existing API routes respond; no regression.

- [x] #### Task 8.5.1.2: SECURITY_STUBS Helmet documentation
**Goal:** Add "Security headers (Helmet)" section to SECURITY_STUBS with config summary and verification steps.
**Files:** 
- `server/docs/SECURITY_STUBS.md`
**Approach:** Document helmet options used, rationale, and how to verify headers (curl -I or browser DevTools).
**Checkpoint:** Section added; verification steps work.

---

## Session Workflow

### Before Starting a Session

**Recommended:** Use `/session-start 8.5.1 [description]` to automatically:
- Load key sections from session handoff document
- Load relevant sections from session guide
- Generate formatted session label with date/status
- Display compact prompt format for reference
- Trigger task planning (fill out task embeds in session guide)
- Identify files to work with based on handoff "Next Action"

**IMPORTANT: Agent Response Format**

When agents respond to `/session-start` commands, they must follow the standardized response format defined in `.cursor/commands/tiers/session/templates/session-start-response-template.md`. The response should be concise, focused, and include:

- Current State (what's done ✅ vs missing ❌)
- Phase X.Y Objectives (numbered, actionable)
- Files to Work With (source and target)
- Implementation Plan (high-level steps)
- Key Differences: React vs Vue (brief)
- Explicit approval request: "Should I proceed with implementing these changes, or do you want to review the plan first?"

See the template file for complete format, examples, and guidelines.

**Example:**
```
/session-start 1.3 "API Clients"
```

**Manual Alternative:**
1. **Label the session** with format below
2. **Review previous session notes** (if any)
3. **Identify files to work with**

### Session Labeling Format

Each session should start with:
```
## Session: 8.5.1 - [Brief Description]
**Date:** [Date]
**Duration:** [Estimated/Actual]
**Status:** [In Progress / Completed / Blocked]
**Agent:** [Current/New]
```

### During Session

1. **Work on one task at a time**
2. **Document decisions** inline in code
3. **Ask questions** as they arise

### After Each Task - Unified Checkpoint

**CRITICAL: Automatically pause and present checkpoint summary after each task.**

**Checkpoint Type:** Choose based on task complexity:
- **Simple tasks** (trivial changes, single file): Quick checkpoint (quality only)
- **Complex tasks** (new features, multiple files, architectural changes): Full checkpoint (quality + optional feedback)

#### Quick Checkpoint Format (Simple Tasks)

```
## Checkpoint: Task [X.Y.Z]

**Completed:** [What was accomplished]
**Quality:** [Status from /checkpoint command]
**Next:** Task [X.Y.Z+1]: [Description]

[Wait for user review before continuing]
```

#### Full Checkpoint Format (Complex Tasks)

```
## Checkpoint: Task [X.Y.Z]

**Completed:** [What was accomplished]
- [Key concepts/patterns used]
- [React → Vue differences if applicable]
- [Questions answered]

**Workflow Feedback:** (Optional - only if issues encountered)
- [Any problems managing this task workflow or issues with results?]

[Wait for user review before continuing]
```

#### Checkpoint Process

1. **Automatically pause** - After completing each task, stop and present checkpoint
2. **Run quality checks** - Use `/task-checkpoint [X.Y.Z]` command (or `/checkpoint` alias) to verify code compiles and passes checks
3. **Update progress** - Mark checkpoints in session log
4. **Wait for user review** - Do NOT continue to next task until:
   - User explicitly approves continuation, OR
   - User asks questions (answer them), OR
   - User requests changes (make them), OR
   - User ends the session

### End of Session

**CRITICAL: Prompt before ending session**

After completing the last task in a session, **prompt the user** before running `/session-end`:

```
## Ready to End Session?

All tasks complete. Ready to run end-of-session workflow?

**This will:**
- Verify app starts
- Run quality checks
- Update session log
- Update handoff document
- Mark session complete (update checkboxes in phase guide)
- Git commit/push

**Proceed with /session-end?** (yes/no)
```

**If user says "yes":**
- Run `/session-end` command automatically
- Complete all end-of-session steps (verify app, lint, build, update docs)
- **Workflow order:**
  1. Verify app starts
  2. Run lint/typecheck
  3. **Commit feature work** (before audits)
  4. Run code quality audit
  5. Update docs (session log, handoff, guide)
  6. **Commit audit fixes** (if any, separately from feature work)
  7. **After all commits are done, prompt for push:**
  ```
  ## Ready to Push?
  
  All session-end checks completed successfully:
  - ✅ App starts
  - ✅ Linting passed
  - ✅ Feature work committed
  - ✅ Audit fixes committed (if any)
  - ✅ Session log updated
  - ✅ Handoff document updated
  - ✅ Session guide updated
  
  **Ready to push all commits to remote?**
  
  This will:
  - Push feature work commit
  - Push audit fixes commit (if any)
  - Push to remote repository
  
  **Proceed with push?** (yes/no)
  ```
- **If user says "yes" to push:** Execute git push, then end session
- **If user says "no" to push:** End session without pushing (user can push manually later)
- **Agent:** After session-end returns, use the command result's `outcome.nextAction` for the exact next step (do not infer from step text).

**If user says "no" to session-end:**
- Address any requested changes
- Re-prompt when ready

**Recommended:** Use `/session-end [session-id] [description] [next-session]` to automatically complete all steps below.

**Manual Alternative (5 Steps):**

1. **Verify** - App starts (`/verify-app` or `npm run start:dev`) and quality checks pass (`/verify vue`)
2. **Document** - Update session log and handoff document (use `/log-task` and `/update-handoff-minimal` or manual)
3. **Commit** - Git commit and push (`/git-commit [message]` and `/git-push` or manual)
4. **Handoff** - Create compact prompt for next session:
   ```
   @.cursor/project-manager/features/vue-migration/handoff.md Continue Vue migration - start Session [X.Y] ([Description])
   ```
5. **Feedback** - Optional workflow feedback (only if issues encountered):
   - Were there any problems managing this session workflow or issues with results?
   - Note any sticking points or inefficiencies for future improvement

**Command Chaining Example:**
```
/verify-app && /verify vue && /log-task 1.3.1 "Base API Client Setup" && /update-handoff && /git-commit "Session 1.3" && /git-push
```

---

## Session Structure

### Session Labeling Format

Each session should start with:
```
## Session: 8.5.1 - [Brief Description]
**Date:** [Date]
**Duration:** [Estimated/Actual]
**Status:** [In Progress / Completed / Blocked]
**Agent:** [Current/New]
```

### Task Structure

Break each session into focused tasks. Each task should have:

- **Goal:** Clear objective for the task
- **Files:** Source and target files (if porting/migrating)
- **Approach:** How to accomplish the goal
- **Checkpoint:** What needs to be verified upon completion

**Task Format:**
```
#### Task 8.5.1.N: [Task Name]
**Goal:** [Task goal]
**Files:** 
- [Files to work with]
**Approach:** [Approach to take]
**Checkpoint:** [What needs to be verified]
```

### Session Organization

- **Quick Start:** Session overview, tasks
- **Session Workflow:** Before/during/after session process
- **Reference:** Templates, examples, related documents
- **Notes:** Session-specific notes and decisions

---

## Task Template

### Task Planning Template

When planning a new task, use this structure:

```markdown
- [ ] #### Task 8.5.1.N: [Task Name]

**Goal:** [Clear, specific objective]

**Files:** 
- Source: `[source-path]` (if porting/migrating)
- Target: `[target-path]` (if creating new)

**Approach:** 
- [Step 1]
- [Step 2]
- [Step 3]

**Checkpoint:** 
- [What needs to be verified]
- [Quality criteria]

**Dependencies:**
- [Prerequisite tasks or files]
```

### Task Entry Template (For Session Log)

When logging a completed task:

```markdown
### Task [X.Y.Z]: [Name] ✅
**Completed:** [Date]
**Goal:** [What was accomplished]

**Files Created:**
- `[path]` - [Description]

**Files Modified:**
- `[path]` - [Description]

**Key Methods/Functions:**
- `methodName()` - [Description]

**Architecture Notes:**
- **[Pattern]**: [Explanation]

**Questions Answered:**
- **[Question]** - [Answer]

**Next Task:**
- [X.Y.Z+1]: [Next task]
```

---

## Reference

### Document Responsibilities

- **Session Guide** (this file): Instructions for how to work (workflow, checkpoints, end-of-session)
- **Session Log**: Historical record of what happened (task entries, progress)
- **Session Handoff**: Transition context for next session (where we left off, what's next)

### Documentation Templates

**See `.cursor/commands/tiers/session/templates/session-log.md` for complete documentation templates.**

Templates include:
- Task entry format for session log
- Handoff document format

### Task Structure Examples

Break each session into focused tasks:

#### Example: Session 1.1 - Type Definitions
```
### Task 1.1.1: Core Entity Types
**Goal:** Port GlobalEntity types
**Files:** 
- frontend-root/src/global/types/globalEntityTypes.ts → frontend-root/src/types/entities.ts
**Checkpoint:** Types compile without errors

### Task 1.1.2: Primitive Types  
**Goal:** Port primitive type system
**Files:**
- frontend-root/src/global/types/globalPrimitiveTypes.ts → frontend-root/src/types/properties.ts
**Checkpoint:** Primitive types match React version
```

### Recommendations

1. **Start each session** using `/session-start [X.Y]` for consistent initialization
2. **Plan tasks** using `/plan-task [X.Y.Z]` to fill out task details in session guide
3. **Complete one task** before moving to the next
4. **Use `/verify vue`** frequently during development to catch errors early
5. **Choose checkpoint type** based on task complexity (quick vs full)
6. **Document as you go** - use `/log-task [X.Y.Z]` after each task
7. **End sessions** using `/session-end [X.Y] [description] [next-session]` for complete automation
8. **Review previous sessions** before starting new ones

**See `.cursor/commands/USAGE.md` for complete slash command documentation and examples.**

---

## Related Documents

- **Session Log:** `.cursor/project-manager/features/vue-migration/sessions/session-[X.Y]-log.md` (templates and historical record)
- **Session Handoff:** `.cursor/project-manager/features/vue-migration/sessions/session-[X.Y]-handoff.md` (transition context)
- **Phase Guide:** `.cursor/project-manager/features/vue-migration/phases/phase-[X]-guide.md` (phase-level context)

---

## Notes

[Session-specific notes, patterns, architectural decisions]

<!-- end excerpt session -->

## Guide Structure

This template defines the standard structure for session guides. Session-specific guides should include all standard sections, which can be customized or reference this template.

### Standard Sections (Required)

These sections are extracted by workflow commands and should be included in all session guides:

- **Session Structure** - Session labeling format, task structure, session organization
- **Task Template** - Task planning and entry templates

**Note:** Session-specific guides can customize these sections or reference this template. If sections are missing, extraction will fall back to this template.

### Session-Specific Sections

These sections contain session-specific content:

- **Quick Start** - Session overview, tasks (session-specific)
- **Session Workflow** - Workflow instructions (can customize for session needs)
- **Reference** - Links to templates and examples
- **Notes** - Session-specific notes and decisions

---

## Quick Start

### Session Overview

**Session ID:** 8.4.2
**Session Name:** Committed files scan
**Description:** [Brief description of session objectives]

**Duration:** [Estimated hours/days]
**Status:** [Not Started / In Progress / Complete]

### Tasks

- [x] #### Task 8.4.2.1: [Task Name]
**Goal:** [Task goal]
**Files:** 
- [Files to work with]
**Approach:** [Approach to take]
**Checkpoint:** [What needs to be verified]

- [x] #### Task 8.4.2.2: [Task Name]
**Goal:** [Task goal]
**Files:** 
- [Files to work with]
**Approach:** [Approach to take]
**Checkpoint:** [What needs to be verified]

---

## Session Workflow

### Before Starting a Session

**Recommended:** Use `/session-start 8.4.2 [description]` to automatically:
- Load key sections from session handoff document
- Load relevant sections from session guide
- Generate formatted session label with date/status
- Display compact prompt format for reference
- Trigger task planning (fill out task embeds in session guide)
- Identify files to work with based on handoff "Next Action"

**IMPORTANT: Agent Response Format**

When agents respond to `/session-start` commands, they must follow the standardized response format defined in `.cursor/commands/tiers/session/templates/session-start-response-template.md`. The response should be concise, focused, and include:

- Current State (what's done ✅ vs missing ❌)
- Phase X.Y Objectives (numbered, actionable)
- Files to Work With (source and target)
- Implementation Plan (high-level steps)
- Key Differences: React vs Vue (brief)
- Explicit approval request: "Should I proceed with implementing these changes, or do you want to review the plan first?"

See the template file for complete format, examples, and guidelines.

**Example:**
```
/session-start 1.3 "API Clients"
```

**Manual Alternative:**
1. **Label the session** with format below
2. **Review previous session notes** (if any)
3. **Identify files to work with**

### Session Labeling Format

Each session should start with:
```
## Session: 8.4.2 - [Brief Description]
**Date:** [Date]
**Duration:** [Estimated/Actual]
**Status:** [In Progress / Completed / Blocked]
**Agent:** [Current/New]
```

### During Session

1. **Work on one task at a time**
2. **Document decisions** inline in code
3. **Ask questions** as they arise

### After Each Task - Unified Checkpoint

**CRITICAL: Automatically pause and present checkpoint summary after each task.**

**Checkpoint Type:** Choose based on task complexity:
- **Simple tasks** (trivial changes, single file): Quick checkpoint (quality only)
- **Complex tasks** (new features, multiple files, architectural changes): Full checkpoint (quality + optional feedback)

#### Quick Checkpoint Format (Simple Tasks)

```
## Checkpoint: Task [X.Y.Z]

**Completed:** [What was accomplished]
**Quality:** [Status from /checkpoint command]
**Next:** Task [X.Y.Z+1]: [Description]

[Wait for user review before continuing]
```

#### Full Checkpoint Format (Complex Tasks)

```
## Checkpoint: Task [X.Y.Z]

**Completed:** [What was accomplished]
- [Key concepts/patterns used]
- [React → Vue differences if applicable]
- [Questions answered]

**Workflow Feedback:** (Optional - only if issues encountered)
- [Any problems managing this task workflow or issues with results?]

[Wait for user review before continuing]
```

#### Checkpoint Process

1. **Automatically pause** - After completing each task, stop and present checkpoint
2. **Run quality checks** - Use `/task-checkpoint [X.Y.Z]` command (or `/checkpoint` alias) to verify code compiles and passes checks
3. **Update progress** - Mark checkpoints in session log
4. **Wait for user review** - Do NOT continue to next task until:
   - User explicitly approves continuation, OR
   - User asks questions (answer them), OR
   - User requests changes (make them), OR
   - User ends the session

### End of Session

**CRITICAL: Prompt before ending session**

After completing the last task in a session, **prompt the user** before running `/session-end`:

```
## Ready to End Session?

All tasks complete. Ready to run end-of-session workflow?

**This will:**
- Verify app starts
- Run quality checks
- Update session log
- Update handoff document
- Mark session complete (update checkboxes in phase guide)
- Git commit/push

**Proceed with /session-end?** (yes/no)
```

**If user says "yes":**
- Run `/session-end` command automatically
- Complete all end-of-session steps (verify app, lint, build, update docs)
- **Workflow order:**
  1. Verify app starts
  2. Run lint/typecheck
  3. **Commit feature work** (before audits)
  4. Run code quality audit
  5. Update docs (session log, handoff, guide)
  6. **Commit audit fixes** (if any, separately from feature work)
  7. **After all commits are done, prompt for push:**
  ```
  ## Ready to Push?
  
  All session-end checks completed successfully:
  - ✅ App starts
  - ✅ Linting passed
  - ✅ Feature work committed
  - ✅ Audit fixes committed (if any)
  - ✅ Session log updated
  - ✅ Handoff document updated
  - ✅ Session guide updated
  
  **Ready to push all commits to remote?**
  
  This will:
  - Push feature work commit
  - Push audit fixes commit (if any)
  - Push to remote repository
  
  **Proceed with push?** (yes/no)
  ```
- **If user says "yes" to push:** Execute git push, then end session
- **If user says "no" to push:** End session without pushing (user can push manually later)
- **Agent:** After session-end returns, use the command result's `outcome.nextAction` for the exact next step (do not infer from step text).

**If user says "no" to session-end:**
- Address any requested changes
- Re-prompt when ready

**Recommended:** Use `/session-end [session-id] [description] [next-session]` to automatically complete all steps below.

**Manual Alternative (5 Steps):**

1. **Verify** - App starts (`/verify-app` or `npm run start:dev`) and quality checks pass (`/verify vue`)
2. **Document** - Update session log and handoff document (use `/log-task` and `/update-handoff-minimal` or manual)
3. **Commit** - Git commit and push (`/git-commit [message]` and `/git-push` or manual)
4. **Handoff** - Create compact prompt for next session:
   ```
   @.cursor/project-manager/features/vue-migration/handoff.md Continue Vue migration - start Session [X.Y] ([Description])
   ```
5. **Feedback** - Optional workflow feedback (only if issues encountered):
   - Were there any problems managing this session workflow or issues with results?
   - Note any sticking points or inefficiencies for future improvement

**Command Chaining Example:**
```
/verify-app && /verify vue && /log-task 1.3.1 "Base API Client Setup" && /update-handoff && /git-commit "Session 1.3" && /git-push
```

---

## Session Structure

### Session Labeling Format

Each session should start with:
```
## Session: 8.4.2 - [Brief Description]
**Date:** [Date]
**Duration:** [Estimated/Actual]
**Status:** [In Progress / Completed / Blocked]
**Agent:** [Current/New]
```

### Task Structure

Break each session into focused tasks. Each task should have:

- **Goal:** Clear objective for the task
- **Files:** Source and target files (if porting/migrating)
- **Approach:** How to accomplish the goal
- **Checkpoint:** What needs to be verified upon completion

**Task Format:**
```
#### Task 8.4.2.N: [Task Name]
**Goal:** [Task goal]
**Files:** 
- [Files to work with]
**Approach:** [Approach to take]
**Checkpoint:** [What needs to be verified]
```

### Session Organization

- **Quick Start:** Session overview, tasks
- **Session Workflow:** Before/during/after session process
- **Reference:** Templates, examples, related documents
- **Notes:** Session-specific notes and decisions

---

## Task Template

### Task Planning Template

When planning a new task, use this structure:

```markdown
- [ ] #### Task 8.4.2.N: [Task Name]

**Goal:** [Clear, specific objective]

**Files:** 
- Source: `[source-path]` (if porting/migrating)
- Target: `[target-path]` (if creating new)

**Approach:** 
- [Step 1]
- [Step 2]
- [Step 3]

**Checkpoint:** 
- [What needs to be verified]
- [Quality criteria]

**Dependencies:**
- [Prerequisite tasks or files]
```

### Task Entry Template (For Session Log)

When logging a completed task:

```markdown
### Task [X.Y.Z]: [Name] ✅
**Completed:** [Date]
**Goal:** [What was accomplished]

**Files Created:**
- `[path]` - [Description]

**Files Modified:**
- `[path]` - [Description]

**Key Methods/Functions:**
- `methodName()` - [Description]

**Architecture Notes:**
- **[Pattern]**: [Explanation]

**Questions Answered:**
- **[Question]** - [Answer]

**Next Task:**
- [X.Y.Z+1]: [Next task]
```

---

## Reference

### Document Responsibilities

- **Session Guide** (this file): Instructions for how to work (workflow, checkpoints, end-of-session)
- **Session Log**: Historical record of what happened (task entries, progress)
- **Session Handoff**: Transition context for next session (where we left off, what's next)

### Documentation Templates

**See `.cursor/commands/tiers/session/templates/session-log.md` for complete documentation templates.**

Templates include:
- Task entry format for session log
- Handoff document format

### Task Structure Examples

Break each session into focused tasks:

#### Example: Session 1.1 - Type Definitions
```
### Task 1.1.1: Core Entity Types
**Goal:** Port GlobalEntity types
**Files:** 
- frontend-root/src/global/types/globalEntityTypes.ts → frontend-root/src/types/entities.ts
**Checkpoint:** Types compile without errors

### Task 1.1.2: Primitive Types  
**Goal:** Port primitive type system
**Files:**
- frontend-root/src/global/types/globalPrimitiveTypes.ts → frontend-root/src/types/properties.ts
**Checkpoint:** Primitive types match React version
```

### Recommendations

1. **Start each session** using `/session-start [X.Y]` for consistent initialization
2. **Plan tasks** using `/plan-task [X.Y.Z]` to fill out task details in session guide
3. **Complete one task** before moving to the next
4. **Use `/verify vue`** frequently during development to catch errors early
5. **Choose checkpoint type** based on task complexity (quick vs full)
6. **Document as you go** - use `/log-task [X.Y.Z]` after each task
7. **End sessions** using `/session-end [X.Y] [description] [next-session]` for complete automation
8. **Review previous sessions** before starting new ones

**See `.cursor/commands/USAGE.md` for complete slash command documentation and examples.**

---

## Related Documents

- **Session Log:** `.cursor/project-manager/features/vue-migration/sessions/session-[X.Y]-log.md` (templates and historical record)
- **Session Handoff:** `.cursor/project-manager/features/vue-migration/sessions/session-[X.Y]-handoff.md` (transition context)
- **Phase Guide:** `.cursor/project-manager/features/vue-migration/phases/phase-[X]-guide.md` (phase-level context)

---

## Notes

[Session-specific notes, patterns, architectural decisions]

<!-- end excerpt session -->

## Guide Structure

This template defines the standard structure for session guides. Session-specific guides should include all standard sections, which can be customized or reference this template.

### Standard Sections (Required)

These sections are extracted by workflow commands and should be included in all session guides:

- **Session Structure** - Session labeling format, task structure, session organization
- **Task Template** - Task planning and entry templates

**Note:** Session-specific guides can customize these sections or reference this template. If sections are missing, extraction will fall back to this template.

### Session-Specific Sections

These sections contain session-specific content:

- **Quick Start** - Session overview, tasks (session-specific)
- **Session Workflow** - Workflow instructions (can customize for session needs)
- **Reference** - Links to templates and examples
- **Notes** - Session-specific notes and decisions

---

## Quick Start

### Session Overview

**Session ID:** 8.4.1
**Session Name:** ** Env var audit — inventory process.env usage, validate .env.example, ensure no hardcoded secrets
**Description:** [Brief description of session objectives]

**Duration:** [Estimated hours/days]
**Status:** [Not Started / In Progress / Complete]

### Tasks

- [x] #### Task 8.4.1.1: [Task Name]
**Goal:** [Task goal]
**Files:** 
- [Files to work with]
**Approach:** [Approach to take]
**Checkpoint:** [What needs to be verified]

- [x] #### Task 8.4.1.2: [Task Name]
**Goal:** [Task goal]
**Files:** 
- [Files to work with]
**Approach:** [Approach to take]
**Checkpoint:** [What needs to be verified]

---

## Session Workflow

### Before Starting a Session

**Recommended:** Use `/session-start 8.4.1 [description]` to automatically:
- Load key sections from session handoff document
- Load relevant sections from session guide
- Generate formatted session label with date/status
- Display compact prompt format for reference
- Trigger task planning (fill out task embeds in session guide)
- Identify files to work with based on handoff "Next Action"

**IMPORTANT: Agent Response Format**

When agents respond to `/session-start` commands, they must follow the standardized response format defined in `.cursor/commands/tiers/session/templates/session-start-response-template.md`. The response should be concise, focused, and include:

- Current State (what's done ✅ vs missing ❌)
- Phase X.Y Objectives (numbered, actionable)
- Files to Work With (source and target)
- Implementation Plan (high-level steps)
- Key Differences: React vs Vue (brief)
- Explicit approval request: "Should I proceed with implementing these changes, or do you want to review the plan first?"

See the template file for complete format, examples, and guidelines.

**Example:**
```
/session-start 1.3 "API Clients"
```

**Manual Alternative:**
1. **Label the session** with format below
2. **Review previous session notes** (if any)
3. **Identify files to work with**

### Session Labeling Format

Each session should start with:
```
## Session: 8.4.1 - [Brief Description]
**Date:** [Date]
**Duration:** [Estimated/Actual]
**Status:** [In Progress / Completed / Blocked]
**Agent:** [Current/New]
```

### During Session

1. **Work on one task at a time**
2. **Document decisions** inline in code
3. **Ask questions** as they arise

### After Each Task - Unified Checkpoint

**CRITICAL: Automatically pause and present checkpoint summary after each task.**

**Checkpoint Type:** Choose based on task complexity:
- **Simple tasks** (trivial changes, single file): Quick checkpoint (quality only)
- **Complex tasks** (new features, multiple files, architectural changes): Full checkpoint (quality + optional feedback)

#### Quick Checkpoint Format (Simple Tasks)

```
## Checkpoint: Task [X.Y.Z]

**Completed:** [What was accomplished]
**Quality:** [Status from /checkpoint command]
**Next:** Task [X.Y.Z+1]: [Description]

[Wait for user review before continuing]
```

#### Full Checkpoint Format (Complex Tasks)

```
## Checkpoint: Task [X.Y.Z]

**Completed:** [What was accomplished]
- [Key concepts/patterns used]
- [React → Vue differences if applicable]
- [Questions answered]

**Workflow Feedback:** (Optional - only if issues encountered)
- [Any problems managing this task workflow or issues with results?]

[Wait for user review before continuing]
```

#### Checkpoint Process

1. **Automatically pause** - After completing each task, stop and present checkpoint
2. **Run quality checks** - Use `/task-checkpoint [X.Y.Z]` command (or `/checkpoint` alias) to verify code compiles and passes checks
3. **Update progress** - Mark checkpoints in session log
4. **Wait for user review** - Do NOT continue to next task until:
   - User explicitly approves continuation, OR
   - User asks questions (answer them), OR
   - User requests changes (make them), OR
   - User ends the session

### End of Session

**CRITICAL: Prompt before ending session**

After completing the last task in a session, **prompt the user** before running `/session-end`:

```
## Ready to End Session?

All tasks complete. Ready to run end-of-session workflow?

**This will:**
- Verify app starts
- Run quality checks
- Update session log
- Update handoff document
- Mark session complete (update checkboxes in phase guide)
- Git commit/push

**Proceed with /session-end?** (yes/no)
```

**If user says "yes":**
- Run `/session-end` command automatically
- Complete all end-of-session steps (verify app, lint, build, update docs)
- **Workflow order:**
  1. Verify app starts
  2. Run lint/typecheck
  3. **Commit feature work** (before audits)
  4. Run code quality audit
  5. Update docs (session log, handoff, guide)
  6. **Commit audit fixes** (if any, separately from feature work)
  7. **After all commits are done, prompt for push:**
  ```
  ## Ready to Push?
  
  All session-end checks completed successfully:
  - ✅ App starts
  - ✅ Linting passed
  - ✅ Feature work committed
  - ✅ Audit fixes committed (if any)
  - ✅ Session log updated
  - ✅ Handoff document updated
  - ✅ Session guide updated
  
  **Ready to push all commits to remote?**
  
  This will:
  - Push feature work commit
  - Push audit fixes commit (if any)
  - Push to remote repository
  
  **Proceed with push?** (yes/no)
  ```
- **If user says "yes" to push:** Execute git push, then end session
- **If user says "no" to push:** End session without pushing (user can push manually later)
- **Agent:** After session-end returns, use the command result's `outcome.nextAction` for the exact next step (do not infer from step text).

**If user says "no" to session-end:**
- Address any requested changes
- Re-prompt when ready

**Recommended:** Use `/session-end [session-id] [description] [next-session]` to automatically complete all steps below.

**Manual Alternative (5 Steps):**

1. **Verify** - App starts (`/verify-app` or `npm run start:dev`) and quality checks pass (`/verify vue`)
2. **Document** - Update session log and handoff document (use `/log-task` and `/update-handoff-minimal` or manual)
3. **Commit** - Git commit and push (`/git-commit [message]` and `/git-push` or manual)
4. **Handoff** - Create compact prompt for next session:
   ```
   @.cursor/project-manager/features/vue-migration/handoff.md Continue Vue migration - start Session [X.Y] ([Description])
   ```
5. **Feedback** - Optional workflow feedback (only if issues encountered):
   - Were there any problems managing this session workflow or issues with results?
   - Note any sticking points or inefficiencies for future improvement

**Command Chaining Example:**
```
/verify-app && /verify vue && /log-task 1.3.1 "Base API Client Setup" && /update-handoff && /git-commit "Session 1.3" && /git-push
```

---

## Session Structure

### Session Labeling Format

Each session should start with:
```
## Session: 8.4.1 - [Brief Description]
**Date:** [Date]
**Duration:** [Estimated/Actual]
**Status:** [In Progress / Completed / Blocked]
**Agent:** [Current/New]
```

### Task Structure

Break each session into focused tasks. Each task should have:

- **Goal:** Clear objective for the task
- **Files:** Source and target files (if porting/migrating)
- **Approach:** How to accomplish the goal
- **Checkpoint:** What needs to be verified upon completion

**Task Format:**
```
#### Task 8.4.1.N: [Task Name]
**Goal:** [Task goal]
**Files:** 
- [Files to work with]
**Approach:** [Approach to take]
**Checkpoint:** [What needs to be verified]
```

### Session Organization

- **Quick Start:** Session overview, tasks
- **Session Workflow:** Before/during/after session process
- **Reference:** Templates, examples, related documents
- **Notes:** Session-specific notes and decisions

---

## Task Template

### Task Planning Template

When planning a new task, use this structure:

```markdown
- [ ] #### Task 8.4.1.N: [Task Name]

**Goal:** [Clear, specific objective]

**Files:** 
- Source: `[source-path]` (if porting/migrating)
- Target: `[target-path]` (if creating new)

**Approach:** 
- [Step 1]
- [Step 2]
- [Step 3]

**Checkpoint:** 
- [What needs to be verified]
- [Quality criteria]

**Dependencies:**
- [Prerequisite tasks or files]
```

### Task Entry Template (For Session Log)

When logging a completed task:

```markdown
### Task [X.Y.Z]: [Name] ✅
**Completed:** [Date]
**Goal:** [What was accomplished]

**Files Created:**
- `[path]` - [Description]

**Files Modified:**
- `[path]` - [Description]

**Key Methods/Functions:**
- `methodName()` - [Description]

**Architecture Notes:**
- **[Pattern]**: [Explanation]

**Questions Answered:**
- **[Question]** - [Answer]

**Next Task:**
- [X.Y.Z+1]: [Next task]
```

---

## Reference

### Document Responsibilities

- **Session Guide** (this file): Instructions for how to work (workflow, checkpoints, end-of-session)
- **Session Log**: Historical record of what happened (task entries, progress)
- **Session Handoff**: Transition context for next session (where we left off, what's next)

### Documentation Templates

**See `.cursor/commands/tiers/session/templates/session-log.md` for complete documentation templates.**

Templates include:
- Task entry format for session log
- Handoff document format

### Task Structure Examples

Break each session into focused tasks:

#### Example: Session 1.1 - Type Definitions
```
### Task 1.1.1: Core Entity Types
**Goal:** Port GlobalEntity types
**Files:** 
- frontend-root/src/global/types/globalEntityTypes.ts → frontend-root/src/types/entities.ts
**Checkpoint:** Types compile without errors

### Task 1.1.2: Primitive Types  
**Goal:** Port primitive type system
**Files:**
- frontend-root/src/global/types/globalPrimitiveTypes.ts → frontend-root/src/types/properties.ts
**Checkpoint:** Primitive types match React version
```

### Recommendations

1. **Start each session** using `/session-start [X.Y]` for consistent initialization
2. **Plan tasks** using `/plan-task [X.Y.Z]` to fill out task details in session guide
3. **Complete one task** before moving to the next
4. **Use `/verify vue`** frequently during development to catch errors early
5. **Choose checkpoint type** based on task complexity (quick vs full)
6. **Document as you go** - use `/log-task [X.Y.Z]` after each task
7. **End sessions** using `/session-end [X.Y] [description] [next-session]` for complete automation
8. **Review previous sessions** before starting new ones

**See `.cursor/commands/USAGE.md` for complete slash command documentation and examples.**

---

## Related Documents

- **Session Log:** `.cursor/project-manager/features/vue-migration/sessions/session-[X.Y]-log.md` (templates and historical record)
- **Session Handoff:** `.cursor/project-manager/features/vue-migration/sessions/session-[X.Y]-handoff.md` (transition context)
- **Phase Guide:** `.cursor/project-manager/features/vue-migration/phases/phase-[X]-guide.md` (phase-level context)

---

## Notes

[Session-specific notes, patterns, architectural decisions]

<!-- end excerpt session -->

## Guide Structure

This template defines the standard structure for session guides. Session-specific guides should include all standard sections, which can be customized or reference this template.

### Standard Sections (Required)

These sections are extracted by workflow commands and should be included in all session guides:

- **Session Structure** - Session labeling format, task structure, session organization
- **Task Template** - Task planning and entry templates

**Note:** Session-specific guides can customize these sections or reference this template. If sections are missing, extraction will fall back to this template.

### Session-Specific Sections

These sections contain session-specific content:

- **Quick Start** - Session overview, tasks (session-specific)
- **Session Workflow** - Workflow instructions (can customize for session needs)
- **Reference** - Links to templates and examples
- **Notes** - Session-specific notes and decisions

---

## Quick Start

### Session Overview

**Session ID:** 8.3.2
**Session Name:** ** Apply validation across internal routes
**Description:** [Brief description of session objectives]

**Duration:** [Estimated hours/days]
**Status:** [Not Started / In Progress / Complete]

### Tasks

- [ ] #### Task 8.3.2.1: [Task Name]
**Goal:** [Task goal]
**Files:** 
- [Files to work with]
**Approach:** [Approach to take]
**Checkpoint:** [What needs to be verified]

- [ ] #### Task 8.3.2.2: [Task Name]
**Goal:** [Task goal]
**Files:** 
- [Files to work with]
**Approach:** [Approach to take]
**Checkpoint:** [What needs to be verified]

---

## Session Workflow

### Before Starting a Session

**Recommended:** Use `/session-start 8.3.2 [description]` to automatically:
- Load key sections from session handoff document
- Load relevant sections from session guide
- Generate formatted session label with date/status
- Display compact prompt format for reference
- Trigger task planning (fill out task embeds in session guide)
- Identify files to work with based on handoff "Next Action"

**IMPORTANT: Agent Response Format**

When agents respond to `/session-start` commands, they must follow the standardized response format defined in `.cursor/commands/tiers/session/templates/session-start-response-template.md`. The response should be concise, focused, and include:

- Current State (what's done ✅ vs missing ❌)
- Phase X.Y Objectives (numbered, actionable)
- Files to Work With (source and target)
- Implementation Plan (high-level steps)
- Key Differences: React vs Vue (brief)
- Explicit approval request: "Should I proceed with implementing these changes, or do you want to review the plan first?"

See the template file for complete format, examples, and guidelines.

**Example:**
```
/session-start 1.3 "API Clients"
```

**Manual Alternative:**
1. **Label the session** with format below
2. **Review previous session notes** (if any)
3. **Identify files to work with**

### Session Labeling Format

Each session should start with:
```
## Session: 8.3.2 - [Brief Description]
**Date:** [Date]
**Duration:** [Estimated/Actual]
**Status:** [In Progress / Completed / Blocked]
**Agent:** [Current/New]
```

### During Session

1. **Work on one task at a time**
2. **Document decisions** inline in code
3. **Ask questions** as they arise

### After Each Task - Unified Checkpoint

**CRITICAL: Automatically pause and present checkpoint summary after each task.**

**Checkpoint Type:** Choose based on task complexity:
- **Simple tasks** (trivial changes, single file): Quick checkpoint (quality only)
- **Complex tasks** (new features, multiple files, architectural changes): Full checkpoint (quality + optional feedback)

#### Quick Checkpoint Format (Simple Tasks)

```
## Checkpoint: Task [X.Y.Z]

**Completed:** [What was accomplished]
**Quality:** [Status from /checkpoint command]
**Next:** Task [X.Y.Z+1]: [Description]

[Wait for user review before continuing]
```

#### Full Checkpoint Format (Complex Tasks)

```
## Checkpoint: Task [X.Y.Z]

**Completed:** [What was accomplished]
- [Key concepts/patterns used]
- [React → Vue differences if applicable]
- [Questions answered]

**Workflow Feedback:** (Optional - only if issues encountered)
- [Any problems managing this task workflow or issues with results?]

[Wait for user review before continuing]
```

#### Checkpoint Process

1. **Automatically pause** - After completing each task, stop and present checkpoint
2. **Run quality checks** - Use `/task-checkpoint [X.Y.Z]` command (or `/checkpoint` alias) to verify code compiles and passes checks
3. **Update progress** - Mark checkpoints in session log
4. **Wait for user review** - Do NOT continue to next task until:
   - User explicitly approves continuation, OR
   - User asks questions (answer them), OR
   - User requests changes (make them), OR
   - User ends the session

### End of Session

**CRITICAL: Prompt before ending session**

After completing the last task in a session, **prompt the user** before running `/session-end`:

```
## Ready to End Session?

All tasks complete. Ready to run end-of-session workflow?

**This will:**
- Verify app starts
- Run quality checks
- Update session log
- Update handoff document
- Mark session complete (update checkboxes in phase guide)
- Git commit/push

**Proceed with /session-end?** (yes/no)
```

**If user says "yes":**
- Run `/session-end` command automatically
- Complete all end-of-session steps (verify app, lint, build, update docs)
- **Workflow order:**
  1. Verify app starts
  2. Run lint/typecheck
  3. **Commit feature work** (before audits)
  4. Run code quality audit
  5. Update docs (session log, handoff, guide)
  6. **Commit audit fixes** (if any, separately from feature work)
  7. **After all commits are done, prompt for push:**
  ```
  ## Ready to Push?
  
  All session-end checks completed successfully:
  - ✅ App starts
  - ✅ Linting passed
  - ✅ Feature work committed
  - ✅ Audit fixes committed (if any)
  - ✅ Session log updated
  - ✅ Handoff document updated
  - ✅ Session guide updated
  
  **Ready to push all commits to remote?**
  
  This will:
  - Push feature work commit
  - Push audit fixes commit (if any)
  - Push to remote repository
  
  **Proceed with push?** (yes/no)
  ```
- **If user says "yes" to push:** Execute git push, then end session
- **If user says "no" to push:** End session without pushing (user can push manually later)
- **Agent:** After session-end returns, use the command result's `outcome.nextAction` for the exact next step (do not infer from step text).

**If user says "no" to session-end:**
- Address any requested changes
- Re-prompt when ready

**Recommended:** Use `/session-end [session-id] [description] [next-session]` to automatically complete all steps below.

**Manual Alternative (5 Steps):**

1. **Verify** - App starts (`/verify-app` or `npm run start:dev`) and quality checks pass (`/verify vue`)
2. **Document** - Update session log and handoff document (use `/log-task` and `/update-handoff-minimal` or manual)
3. **Commit** - Git commit and push (`/git-commit [message]` and `/git-push` or manual)
4. **Handoff** - Create compact prompt for next session:
   ```
   @.cursor/project-manager/features/vue-migration/handoff.md Continue Vue migration - start Session [X.Y] ([Description])
   ```
5. **Feedback** - Optional workflow feedback (only if issues encountered):
   - Were there any problems managing this session workflow or issues with results?
   - Note any sticking points or inefficiencies for future improvement

**Command Chaining Example:**
```
/verify-app && /verify vue && /log-task 1.3.1 "Base API Client Setup" && /update-handoff && /git-commit "Session 1.3" && /git-push
```

---

## Session Structure

### Session Labeling Format

Each session should start with:
```
## Session: 8.3.2 - [Brief Description]
**Date:** [Date]
**Duration:** [Estimated/Actual]
**Status:** [In Progress / Completed / Blocked]
**Agent:** [Current/New]
```

### Task Structure

Break each session into focused tasks. Each task should have:

- **Goal:** Clear objective for the task
- **Files:** Source and target files (if porting/migrating)
- **Approach:** How to accomplish the goal
- **Checkpoint:** What needs to be verified upon completion

**Task Format:**
```
#### Task 8.3.2.N: [Task Name]
**Goal:** [Task goal]
**Files:** 
- [Files to work with]
**Approach:** [Approach to take]
**Checkpoint:** [What needs to be verified]
```

### Session Organization

- **Quick Start:** Session overview, tasks
- **Session Workflow:** Before/during/after session process
- **Reference:** Templates, examples, related documents
- **Notes:** Session-specific notes and decisions

---

## Task Template

### Task Planning Template

When planning a new task, use this structure:

```markdown
- [ ] #### Task 8.3.2.N: [Task Name]

**Goal:** [Clear, specific objective]

**Files:** 
- Source: `[source-path]` (if porting/migrating)
- Target: `[target-path]` (if creating new)

**Approach:** 
- [Step 1]
- [Step 2]
- [Step 3]

**Checkpoint:** 
- [What needs to be verified]
- [Quality criteria]

**Dependencies:**
- [Prerequisite tasks or files]
```

### Task Entry Template (For Session Log)

When logging a completed task:

```markdown
### Task [X.Y.Z]: [Name] ✅
**Completed:** [Date]
**Goal:** [What was accomplished]

**Files Created:**
- `[path]` - [Description]

**Files Modified:**
- `[path]` - [Description]

**Key Methods/Functions:**
- `methodName()` - [Description]

**Architecture Notes:**
- **[Pattern]**: [Explanation]

**Questions Answered:**
- **[Question]** - [Answer]

**Next Task:**
- [X.Y.Z+1]: [Next task]
```

---

## Reference

### Document Responsibilities

- **Session Guide** (this file): Instructions for how to work (workflow, checkpoints, end-of-session)
- **Session Log**: Historical record of what happened (task entries, progress)
- **Session Handoff**: Transition context for next session (where we left off, what's next)

### Documentation Templates

**See `.cursor/commands/tiers/session/templates/session-log.md` for complete documentation templates.**

Templates include:
- Task entry format for session log
- Handoff document format

### Task Structure Examples

Break each session into focused tasks:

#### Example: Session 1.1 - Type Definitions
```
### Task 1.1.1: Core Entity Types
**Goal:** Port GlobalEntity types
**Files:** 
- frontend-root/src/global/types/globalEntityTypes.ts → frontend-root/src/types/entities.ts
**Checkpoint:** Types compile without errors

### Task 1.1.2: Primitive Types  
**Goal:** Port primitive type system
**Files:**
- frontend-root/src/global/types/globalPrimitiveTypes.ts → frontend-root/src/types/properties.ts
**Checkpoint:** Primitive types match React version
```

### Recommendations

1. **Start each session** using `/session-start [X.Y]` for consistent initialization
2. **Plan tasks** using `/plan-task [X.Y.Z]` to fill out task details in session guide
3. **Complete one task** before moving to the next
4. **Use `/verify vue`** frequently during development to catch errors early
5. **Choose checkpoint type** based on task complexity (quick vs full)
6. **Document as you go** - use `/log-task [X.Y.Z]` after each task
7. **End sessions** using `/session-end [X.Y] [description] [next-session]` for complete automation
8. **Review previous sessions** before starting new ones

**See `.cursor/commands/USAGE.md` for complete slash command documentation and examples.**

---

## Related Documents

- **Session Log:** `.cursor/project-manager/features/vue-migration/sessions/session-[X.Y]-log.md` (templates and historical record)
- **Session Handoff:** `.cursor/project-manager/features/vue-migration/sessions/session-[X.Y]-handoff.md` (transition context)
- **Phase Guide:** `.cursor/project-manager/features/vue-migration/phases/phase-[X]-guide.md` (phase-level context)

---

## Notes

[Session-specific notes, patterns, architectural decisions]

## Guide Structure

This template defines the standard structure for session guides. Session-specific guides should include all standard sections, which can be customized or reference this template.

### Standard Sections (Required)

These sections are extracted by workflow commands and should be included in all session guides:

- **Session Structure** - Session labeling format, task structure, session organization
- **Task Template** - Task planning and entry templates

**Note:** Session-specific guides can customize these sections or reference this template. If sections are missing, extraction will fall back to this template.

### Session-Specific Sections

These sections contain session-specific content:

- **Quick Start** - Session overview, tasks (session-specific)
- **Session Workflow** - Workflow instructions (can customize for session needs)
- **Reference** - Links to templates and examples
- **Notes** - Session-specific notes and decisions

---

## Quick Start

### Session Overview

**Session ID:** 8.3.1
**Session Name:** ** Add validation library and middleware
**Description:** [Brief description of session objectives]

**Duration:** [Estimated hours/days]
**Status:** [Not Started / In Progress / Complete]

### Tasks

- [x] - [x] - [x] #### Task 8.3.1.1: [Task Name]
**Goal:** [Task goal]
**Files:** 
- [Files to work with]
**Approach:** [Approach to take]
**Checkpoint:** [What needs to be verified]

- [x] #### Task 8.3.1.2: [Task Name]
**Goal:** [Task goal]
**Files:** 
- [Files to work with]
**Approach:** [Approach to take]
**Checkpoint:** [What needs to be verified]

---

## Session Workflow

### Before Starting a Session

**Recommended:** Use `/session-start 8.3.1 [description]` to automatically:
- Load key sections from session handoff document
- Load relevant sections from session guide
- Generate formatted session label with date/status
- Display compact prompt format for reference
- Trigger task planning (fill out task embeds in session guide)
- Identify files to work with based on handoff "Next Action"

**IMPORTANT: Agent Response Format**

When agents respond to `/session-start` commands, they must follow the standardized response format defined in `.cursor/commands/tiers/session/templates/session-start-response-template.md`. The response should be concise, focused, and include:

- Current State (what's done ✅ vs missing ❌)
- Phase X.Y Objectives (numbered, actionable)
- Files to Work With (source and target)
- Implementation Plan (high-level steps)
- Key Differences: React vs Vue (brief)
- Explicit approval request: "Should I proceed with implementing these changes, or do you want to review the plan first?"

See the template file for complete format, examples, and guidelines.

**Example:**
```
/session-start 1.3 "API Clients"
```

**Manual Alternative:**
1. **Label the session** with format below
2. **Review previous session notes** (if any)
3. **Identify files to work with**

### Session Labeling Format

Each session should start with:
```
## Session: 8.3.1 - [Brief Description]
**Date:** [Date]
**Duration:** [Estimated/Actual]
**Status:** [In Progress / Completed / Blocked]
**Agent:** [Current/New]
```

### During Session

1. **Work on one task at a time**
2. **Document decisions** inline in code
3. **Ask questions** as they arise

### After Each Task - Unified Checkpoint

**CRITICAL: Automatically pause and present checkpoint summary after each task.**

**Checkpoint Type:** Choose based on task complexity:
- **Simple tasks** (trivial changes, single file): Quick checkpoint (quality only)
- **Complex tasks** (new features, multiple files, architectural changes): Full checkpoint (quality + optional feedback)

#### Quick Checkpoint Format (Simple Tasks)

```
## Checkpoint: Task [X.Y.Z]

**Completed:** [What was accomplished]
**Quality:** [Status from /checkpoint command]
**Next:** Task [X.Y.Z+1]: [Description]

[Wait for user review before continuing]
```

#### Full Checkpoint Format (Complex Tasks)

```
## Checkpoint: Task [X.Y.Z]

**Completed:** [What was accomplished]
- [Key concepts/patterns used]
- [React → Vue differences if applicable]
- [Questions answered]

**Workflow Feedback:** (Optional - only if issues encountered)
- [Any problems managing this task workflow or issues with results?]

[Wait for user review before continuing]
```

#### Checkpoint Process

1. **Automatically pause** - After completing each task, stop and present checkpoint
2. **Run quality checks** - Use `/task-checkpoint [X.Y.Z]` command (or `/checkpoint` alias) to verify code compiles and passes checks
3. **Update progress** - Mark checkpoints in session log
4. **Wait for user review** - Do NOT continue to next task until:
   - User explicitly approves continuation, OR
   - User asks questions (answer them), OR
   - User requests changes (make them), OR
   - User ends the session

### End of Session

**CRITICAL: Prompt before ending session**

After completing the last task in a session, **prompt the user** before running `/session-end`:

```
## Ready to End Session?

All tasks complete. Ready to run end-of-session workflow?

**This will:**
- Verify app starts
- Run quality checks
- Update session log
- Update handoff document
- Mark session complete (update checkboxes in phase guide)
- Git commit/push

**Proceed with /session-end?** (yes/no)
```

**If user says "yes":**
- Run `/session-end` command automatically
- Complete all end-of-session steps (verify app, lint, build, update docs)
- **Workflow order:**
  1. Verify app starts
  2. Run lint/typecheck
  3. **Commit feature work** (before audits)
  4. Run code quality audit
  5. Update docs (session log, handoff, guide)
  6. **Commit audit fixes** (if any, separately from feature work)
  7. **After all commits are done, prompt for push:**
  ```
  ## Ready to Push?
  
  All session-end checks completed successfully:
  - ✅ App starts
  - ✅ Linting passed
  - ✅ Feature work committed
  - ✅ Audit fixes committed (if any)
  - ✅ Session log updated
  - ✅ Handoff document updated
  - ✅ Session guide updated
  
  **Ready to push all commits to remote?**
  
  This will:
  - Push feature work commit
  - Push audit fixes commit (if any)
  - Push to remote repository
  
  **Proceed with push?** (yes/no)
  ```
- **If user says "yes" to push:** Execute git push, then end session
- **If user says "no" to push:** End session without pushing (user can push manually later)
- **Agent:** After session-end returns, use the command result's `outcome.nextAction` for the exact next step (do not infer from step text).

**If user says "no" to session-end:**
- Address any requested changes
- Re-prompt when ready

**Recommended:** Use `/session-end [session-id] [description] [next-session]` to automatically complete all steps below.

**Manual Alternative (5 Steps):**

1. **Verify** - App starts (`/verify-app` or `npm run start:dev`) and quality checks pass (`/verify vue`)
2. **Document** - Update session log and handoff document (use `/log-task` and `/update-handoff-minimal` or manual)
3. **Commit** - Git commit and push (`/git-commit [message]` and `/git-push` or manual)
4. **Handoff** - Create compact prompt for next session:
   ```
   @.cursor/project-manager/features/vue-migration/handoff.md Continue Vue migration - start Session [X.Y] ([Description])
   ```
5. **Feedback** - Optional workflow feedback (only if issues encountered):
   - Were there any problems managing this session workflow or issues with results?
   - Note any sticking points or inefficiencies for future improvement

**Command Chaining Example:**
```
/verify-app && /verify vue && /log-task 1.3.1 "Base API Client Setup" && /update-handoff && /git-commit "Session 1.3" && /git-push
```

---

## Session Structure

### Session Labeling Format

Each session should start with:
```
## Session: 8.3.1 - [Brief Description]
**Date:** [Date]
**Duration:** [Estimated/Actual]
**Status:** [In Progress / Completed / Blocked]
**Agent:** [Current/New]
```

### Task Structure

Break each session into focused tasks. Each task should have:

- **Goal:** Clear objective for the task
- **Files:** Source and target files (if porting/migrating)
- **Approach:** How to accomplish the goal
- **Checkpoint:** What needs to be verified upon completion

**Task Format:**
```
#### Task 8.3.1.N: [Task Name]
**Goal:** [Task goal]
**Files:** 
- [Files to work with]
**Approach:** [Approach to take]
**Checkpoint:** [What needs to be verified]
```

### Session Organization

- **Quick Start:** Session overview, tasks
- **Session Workflow:** Before/during/after session process
- **Reference:** Templates, examples, related documents
- **Notes:** Session-specific notes and decisions

---

## Task Template

### Task Planning Template

When planning a new task, use this structure:

```markdown
- [ ] #### Task 8.3.1.N: [Task Name]

**Goal:** [Clear, specific objective]

**Files:** 
- Source: `[source-path]` (if porting/migrating)
- Target: `[target-path]` (if creating new)

**Approach:** 
- [Step 1]
- [Step 2]
- [Step 3]

**Checkpoint:** 
- [What needs to be verified]
- [Quality criteria]

**Dependencies:**
- [Prerequisite tasks or files]
```

### Task Entry Template (For Session Log)

When logging a completed task:

```markdown
### Task [X.Y.Z]: [Name] ✅
**Completed:** [Date]
**Goal:** [What was accomplished]

**Files Created:**
- `[path]` - [Description]

**Files Modified:**
- `[path]` - [Description]

**Key Methods/Functions:**
- `methodName()` - [Description]

**Architecture Notes:**
- **[Pattern]**: [Explanation]

**Questions Answered:**
- **[Question]** - [Answer]

**Next Task:**
- [X.Y.Z+1]: [Next task]
```

---

## Reference

### Document Responsibilities

- **Session Guide** (this file): Instructions for how to work (workflow, checkpoints, end-of-session)
- **Session Log**: Historical record of what happened (task entries, progress)
- **Session Handoff**: Transition context for next session (where we left off, what's next)

### Documentation Templates

**See `.cursor/commands/tiers/session/templates/session-log.md` for complete documentation templates.**

Templates include:
- Task entry format for session log
- Handoff document format

### Task Structure Examples

Break each session into focused tasks:

#### Example: Session 1.1 - Type Definitions
```
### Task 1.1.1: Core Entity Types
**Goal:** Port GlobalEntity types
**Files:** 
- frontend-root/src/global/types/globalEntityTypes.ts → frontend-root/src/types/entities.ts
**Checkpoint:** Types compile without errors

### Task 1.1.2: Primitive Types  
**Goal:** Port primitive type system
**Files:**
- frontend-root/src/global/types/globalPrimitiveTypes.ts → frontend-root/src/types/properties.ts
**Checkpoint:** Primitive types match React version
```

### Recommendations

1. **Start each session** using `/session-start [X.Y]` for consistent initialization
2. **Plan tasks** using `/plan-task [X.Y.Z]` to fill out task details in session guide
3. **Complete one task** before moving to the next
4. **Use `/verify vue`** frequently during development to catch errors early
5. **Choose checkpoint type** based on task complexity (quick vs full)
6. **Document as you go** - use `/log-task [X.Y.Z]` after each task
7. **End sessions** using `/session-end [X.Y] [description] [next-session]` for complete automation
8. **Review previous sessions** before starting new ones

**See `.cursor/commands/USAGE.md` for complete slash command documentation and examples.**

---

## Related Documents

- **Session Log:** `.cursor/project-manager/features/vue-migration/sessions/session-[X.Y]-log.md` (templates and historical record)
- **Session Handoff:** `.cursor/project-manager/features/vue-migration/sessions/session-[X.Y]-handoff.md` (transition context)
- **Phase Guide:** `.cursor/project-manager/features/vue-migration/phases/phase-[X]-guide.md` (phase-level context)

---

## Notes

[Session-specific notes, patterns, architectural decisions]

<!-- end excerpt session -->

## Quick Start

**Session ID:** 8.2.2
**Session Name:** Auth-route limiter and verification
**Description:** Add stricter limiter (10 req/15 min) for auth routes; wire to placeholder or real path; document in SECURITY_STUBS.

---

## Session Overview

Add a stricter rate limiter for auth/login routes to protect against credential stuffing and brute force. The auth limiter applies 10 requests per 15 minutes per IP. Wired to `/api/v1/internal/auth/*` placeholder until Feature 7 adds login routes. Session 8.2.1 delivered the general limiter (100 req/15 min) on all internal routes.

---

## Key Context

- **server/src/middlewares/rateLimit.ts** — Add authRateLimiter (10 req/15 min)
- **server/src/routes/index.ts** — Mount auth sub-router with auth limiter
- **server/src/routes/internal/auth/** — Placeholder auth router for Feature 7
- **express-rate-limit** — Already installed; reuse pattern from generalRateLimiter

---

## Tasks

### Task 8.2.2.1: Auth limiter config and mount

**Goal:** Create authRateLimiter (10 req/15 min), placeholder AuthRouter, mount under /internal/auth.

**Files:**
- `server/src/middlewares/rateLimit.ts` — add authRateLimiter
- `server/src/routes/internal/auth/authRouter.ts` — placeholder router (GET returns stub)
- `server/src/routes/index.ts` — mount auth path with auth limiter

**Checkpoint:** Auth limiter active on /api/v1/internal/auth/*; excess requests return 429.

### Task 8.2.2.2: Verify and document

**Goal:** Confirm 429 after 10 requests on auth path; update SECURITY_STUBS.md.

**Files:**
- `server/docs/SECURITY_STUBS.md` — auth-route limiter section and curl verification

**Checkpoint:** Manual curl confirms rate limit; documentation updated.

---

## Related Documents

- Phase Guide: `../phases/phase-8.2-guide.md`
- Feature Guide: `../feature-security-hardening-guide.md`
- Planning: `session-8.2.2-planning.md`

<!-- end excerpt session -->

## Quick Start

**Session ID:** 8.2.1
**Session Name:** General rate limiter for internal API routes
**Description:** Install express-rate-limit, create general limiter (100 req/15 min per IP), mount on `/api/v1/internal/*`. Verify 429 response when limit exceeded.

---

## Session Overview

Add inbound HTTP rate limiting to protect the internal API from abuse. The general limiter applies 100 requests per 15 minutes per IP to all internal routes. Auth routes (when they exist) will get a stricter limiter in Session 8.2.2.

---

## Key Context

- **server/src/app.ts** — Mount rate limiter middleware before route handlers
- **server/src/routes/index.ts** — Route tree; internal routes under `/api/v1/internal/*`
- **express-rate-limit** — npm package; `windowMs`, `max`, `standardHeaders`, `legacyHeaders` options

---

## Tasks

### Task 8.2.1.1: Add express-rate-limit and create general limiter

**Goal:** Install express-rate-limit, create a limiter (100 req/15 min per IP), mount on internal API routes.

**Files:**
- `server/package.json` — add express-rate-limit dependency
- `server/src/app.ts` — create and mount limiter before internal routes
- Optional: `server/src/middlewares/rateLimit.ts` — if extracting to a middleware file

**Checkpoint:** General limiter active; excess requests return 429 with Retry-After header.

### Task 8.2.1.2: Verify rate limit behavior

**Goal:** Confirm 429 response when limit exceeded; document in SECURITY_STUBS.md.

**Files:**
- `server/docs/SECURITY_STUBS.md` — document inbound rate limiting

**Checkpoint:** Manual curl or script confirms rate limit; documentation updated.

---

## Related Documents

- Phase Guide: `../phases/phase-8.2-guide.md`
- Feature Guide: `../feature-security-hardening-guide.md`

<!-- end excerpt session -->

## Quick Start

### Session Overview

**Session ID:** 8.1.2
**Session Name:** CORS verification and .env.example polish
**Description:** Verify CORS rejects disallowed origins; polish .env.example documentation for CORS_ORIGIN.

**Duration:** [Estimated hours/days]
**Status:** [Not Started / In Progress / Complete]

### Tasks

- [x] - [x] #### Task 8.1.2.1: Verify CORS rejection
**Goal:** curl disallowed origin, confirm rejection
**Files:** Reference API endpoint
**Approach:** curl -H "Origin: https://evil.com" to API; verify CORS error or no Access-Control-Allow-Origin
**Checkpoint:** Disallowed origin rejected; allowed origin (localhost) succeeds

- [x] #### Task 8.1.2.2: Polish .env.example
**Goal:** Expand CORS_ORIGIN doc with dev/production examples
**Files:** server/.env.example
**Approach:** Add commented examples for localhost (dev) and Render URL (production); document comma-separated format
**Checkpoint:** .env.example has clear CORS_ORIGIN examples

---

## Session Workflow

See `.cursor/commands/tiers/session/templates/session-guide.md` for full workflow template.

---

## Related Documents

- Phase Guide: `../phases/phase-8.1-guide.md`
- Session Log: `session-8.1.2-log.md`
- Feature Guide: `../../feature-security-hardening-guide.md`

## Guide Structure

This template defines the standard structure for session guides. Session-specific guides should include all standard sections, which can be customized or reference this template.

### Standard Sections (Required)

These sections are extracted by workflow commands and should be included in all session guides:

- **Session Structure** - Session labeling format, task structure, session organization
- **Task Template** - Task planning and entry templates

**Note:** Session-specific guides can customize these sections or reference this template. If sections are missing, extraction will fall back to this template.

### Session-Specific Sections

These sections contain session-specific content:

- **Quick Start** - Session overview, tasks (session-specific)
- **Session Workflow** - Workflow instructions (can customize for session needs)
- **Reference** - Links to templates and examples
- **Notes** - Session-specific notes and decisions

---

## Quick Start

### Session Overview

**Session ID:** 8.1.1
**Session Name:** ** Add CORS_ORIGIN env var, wire CORS origin in app.ts, update .env.example, verify origin restriction
**Description:** [Brief description of session objectives]

**Duration:** [Estimated hours/days]
**Status:** [Not Started / In Progress / Complete]

### Tasks

- [x] #### Task 8.1.1.1: [Task Name]
**Goal:** [Task goal]
**Files:** 
- [Files to work with]
**Approach:** [Approach to take]
**Checkpoint:** [What needs to be verified]

- [x] - [x] - [x] - [x] - [x] #### Task 8.1.1.2: [Task Name]
**Goal:** [Task goal]
**Files:** 
- [Files to work with]
**Approach:** [Approach to take]
**Checkpoint:** [What needs to be verified]

---

## Session Workflow

### Before Starting a Session

**Recommended:** Use `/session-start 8.1.1 [description]` to automatically:
- Load key sections from session handoff document
- Load relevant sections from session guide
- Generate formatted session label with date/status
- Display compact prompt format for reference
- Trigger task planning (fill out task embeds in session guide)
- Identify files to work with based on handoff "Next Action"

**IMPORTANT: Agent Response Format**

When agents respond to `/session-start` commands, they must follow the standardized response format defined in `.cursor/commands/tiers/session/templates/session-start-response-template.md`. The response should be concise, focused, and include:

- Current State (what's done ✅ vs missing ❌)
- Phase X.Y Objectives (numbered, actionable)
- Files to Work With (source and target)
- Implementation Plan (high-level steps)
- Key Differences: React vs Vue (brief)
- Explicit approval request: "Should I proceed with implementing these changes, or do you want to review the plan first?"

See the template file for complete format, examples, and guidelines.

**Example:**
```
/session-start 1.3 "API Clients"
```

**Manual Alternative:**
1. **Label the session** with format below
2. **Review previous session notes** (if any)
3. **Identify files to work with**

### Session Labeling Format

Each session should start with:
```
## Session: 8.1.1 - [Brief Description]
**Date:** [Date]
**Duration:** [Estimated/Actual]
**Status:** [In Progress / Completed / Blocked]
**Agent:** [Current/New]
```

### During Session

1. **Work on one task at a time**
2. **Document decisions** inline in code
3. **Ask questions** as they arise

### After Each Task - Unified Checkpoint

**CRITICAL: Automatically pause and present checkpoint summary after each task.**

**Checkpoint Type:** Choose based on task complexity:
- **Simple tasks** (trivial changes, single file): Quick checkpoint (quality only)
- **Complex tasks** (new features, multiple files, architectural changes): Full checkpoint (quality + optional feedback)

#### Quick Checkpoint Format (Simple Tasks)

```
## Checkpoint: Task [X.Y.Z]

**Completed:** [What was accomplished]
**Quality:** [Status from /checkpoint command]
**Next:** Task [X.Y.Z+1]: [Description]

[Wait for user review before continuing]
```

#### Full Checkpoint Format (Complex Tasks)

```
## Checkpoint: Task [X.Y.Z]

**Completed:** [What was accomplished]
- [Key concepts/patterns used]
- [React → Vue differences if applicable]
- [Questions answered]

**Workflow Feedback:** (Optional - only if issues encountered)
- [Any problems managing this task workflow or issues with results?]

[Wait for user review before continuing]
```

#### Checkpoint Process

1. **Automatically pause** - After completing each task, stop and present checkpoint
2. **Run quality checks** - Use `/task-checkpoint [X.Y.Z]` command (or `/checkpoint` alias) to verify code compiles and passes checks
3. **Update progress** - Mark checkpoints in session log
4. **Wait for user review** - Do NOT continue to next task until:
   - User explicitly approves continuation, OR
   - User asks questions (answer them), OR
   - User requests changes (make them), OR
   - User ends the session

### End of Session

**CRITICAL: Prompt before ending session**

After completing the last task in a session, **prompt the user** before running `/session-end`:

```
## Ready to End Session?

All tasks complete. Ready to run end-of-session workflow?

**This will:**
- Verify app starts
- Run quality checks
- Update session log
- Update handoff document
- Mark session complete (update checkboxes in phase guide)
- Git commit/push

**Proceed with /session-end?** (yes/no)
```

**If user says "yes":**
- Run `/session-end` command automatically
- Complete all end-of-session steps (verify app, lint, build, update docs)
- **Workflow order:**
  1. Verify app starts
  2. Run lint/typecheck
  3. **Commit feature work** (before audits)
  4. Run code quality audit
  5. Update docs (session log, handoff, guide)
  6. **Commit audit fixes** (if any, separately from feature work)
  7. **After all commits are done, prompt for push:**
  ```
  ## Ready to Push?
  
  All session-end checks completed successfully:
  - ✅ App starts
  - ✅ Linting passed
  - ✅ Feature work committed
  - ✅ Audit fixes committed (if any)
  - ✅ Session log updated
  - ✅ Handoff document updated
  - ✅ Session guide updated
  
  **Ready to push all commits to remote?**
  
  This will:
  - Push feature work commit
  - Push audit fixes commit (if any)
  - Push to remote repository
  
  **Proceed with push?** (yes/no)
  ```
- **If user says "yes" to push:** Execute git push, then end session
- **If user says "no" to push:** End session without pushing (user can push manually later)
- **Agent:** After session-end returns, use the command result's `outcome.nextAction` for the exact next step (do not infer from step text).

**If user says "no" to session-end:**
- Address any requested changes
- Re-prompt when ready

**Recommended:** Use `/session-end [session-id] [description] [next-session]` to automatically complete all steps below.

**Manual Alternative (5 Steps):**

1. **Verify** - App starts (`/verify-app` or `npm run start:dev`) and quality checks pass (`/verify vue`)
2. **Document** - Update session log and handoff document (use `/log-task` and `/update-handoff-minimal` or manual)
3. **Commit** - Git commit and push (`/git-commit [message]` and `/git-push` or manual)
4. **Handoff** - Create compact prompt for next session:
   ```
   @.cursor/project-manager/features/vue-migration/handoff.md Continue Vue migration - start Session [X.Y] ([Description])
   ```
5. **Feedback** - Optional workflow feedback (only if issues encountered):
   - Were there any problems managing this session workflow or issues with results?
   - Note any sticking points or inefficiencies for future improvement

**Command Chaining Example:**
```
/verify-app && /verify vue && /log-task 1.3.1 "Base API Client Setup" && /update-handoff && /git-commit "Session 1.3" && /git-push
```

---

## Session Structure

### Session Labeling Format

Each session should start with:
```
## Session: 8.1.1 - [Brief Description]
**Date:** [Date]
**Duration:** [Estimated/Actual]
**Status:** [In Progress / Completed / Blocked]
**Agent:** [Current/New]
```

### Task Structure

Break each session into focused tasks. Each task should have:

- **Goal:** Clear objective for the task
- **Files:** Source and target files (if porting/migrating)
- **Approach:** How to accomplish the goal
- **Checkpoint:** What needs to be verified upon completion

**Task Format:**
```
#### Task 8.1.1.N: [Task Name]
**Goal:** [Task goal]
**Files:** 
- [Files to work with]
**Approach:** [Approach to take]
**Checkpoint:** [What needs to be verified]
```

### Session Organization

- **Quick Start:** Session overview, tasks
- **Session Workflow:** Before/during/after session process
- **Reference:** Templates, examples, related documents
- **Notes:** Session-specific notes and decisions

---

## Task Template

### Task Planning Template

When planning a new task, use this structure:

```markdown
- [ ] #### Task 8.1.1.N: [Task Name]

**Goal:** [Clear, specific objective]

**Files:** 
- Source: `[source-path]` (if porting/migrating)
- Target: `[target-path]` (if creating new)

**Approach:** 
- [Step 1]
- [Step 2]
- [Step 3]

**Checkpoint:** 
- [What needs to be verified]
- [Quality criteria]

**Dependencies:**
- [Prerequisite tasks or files]
```

### Task Entry Template (For Session Log)

When logging a completed task:

```markdown
### Task [X.Y.Z]: [Name] ✅
**Completed:** [Date]
**Goal:** [What was accomplished]

**Files Created:**
- `[path]` - [Description]

**Files Modified:**
- `[path]` - [Description]

**Key Methods/Functions:**
- `methodName()` - [Description]

**Architecture Notes:**
- **[Pattern]**: [Explanation]

**Questions Answered:**
- **[Question]** - [Answer]

**Next Task:**
- [X.Y.Z+1]: [Next task]
```

---

## Reference

### Document Responsibilities

- **Session Guide** (this file): Instructions for how to work (workflow, checkpoints, end-of-session)
- **Session Log**: Historical record of what happened (task entries, progress)
- **Session Handoff**: Transition context for next session (where we left off, what's next)

### Documentation Templates

**See `.cursor/commands/tiers/session/templates/session-log.md` for complete documentation templates.**

Templates include:
- Task entry format for session log
- Handoff document format

### Task Structure Examples

Break each session into focused tasks:

#### Example: Session 1.1 - Type Definitions
```
### Task 1.1.1: Core Entity Types
**Goal:** Port GlobalEntity types
**Files:** 
- frontend-root/src/global/types/globalEntityTypes.ts → frontend-root/src/types/entities.ts
**Checkpoint:** Types compile without errors

### Task 1.1.2: Primitive Types  
**Goal:** Port primitive type system
**Files:**
- frontend-root/src/global/types/globalPrimitiveTypes.ts → frontend-root/src/types/properties.ts
**Checkpoint:** Primitive types match React version
```

### Recommendations

1. **Start each session** using `/session-start [X.Y]` for consistent initialization
2. **Plan tasks** using `/plan-task [X.Y.Z]` to fill out task details in session guide
3. **Complete one task** before moving to the next
4. **Use `/verify vue`** frequently during development to catch errors early
5. **Choose checkpoint type** based on task complexity (quick vs full)
6. **Document as you go** - use `/log-task [X.Y.Z]` after each task
7. **End sessions** using `/session-end [X.Y] [description] [next-session]` for complete automation
8. **Review previous sessions** before starting new ones

**See `.cursor/commands/USAGE.md` for complete slash command documentation and examples.**

---

## Related Documents

- **Session Log:** `.cursor/project-manager/features/vue-migration/sessions/session-[X.Y]-log.md` (templates and historical record)
- **Session Handoff:** `.cursor/project-manager/features/vue-migration/sessions/session-[X.Y]-handoff.md` (transition context)
- **Phase Guide:** `.cursor/project-manager/features/vue-migration/phases/phase-[X]-guide.md` (phase-level context)

---

## Notes

[Session-specific notes, patterns, architectural decisions]

