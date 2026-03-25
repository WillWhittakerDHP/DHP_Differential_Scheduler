<!-- harness-guide-rollup tier=feature id=authentication consolidatedAt=2026-03-24T22:41:52.985Z -->

# Feature authentication Guide

**Purpose:** Feature-level guide for planning and tracking major initiatives

**Tier:** Feature (Tier 0 - Highest Level)

---

## Feature Overview

**Feature Name:** authentication
**Description:** User authentication (sessions, strategies, magic link beta).
**Status:** Complete

**Duration:** 2026-02-18 — 2026-03-23
**Started:** 2026-02-18
**Completed:** 2026-03-23

---

## Research Phase

Research folded into phases 7.1–7.3; key decisions recorded in phase logs and server docs.

---

## Feature Objectives

- [x] Database and models for auth-related entities
- [x] Server infrastructure (strategy, session, middleware, routing)
- [x] Magic link strategy for beta/development flows

---

## Phases Breakdown

- [x] ### Phase 7.1: Database & Models
**Description:** Migrations and models for sessions, magic links, and related tables.
**Duration:** _(completed 2026-03-23)_
**Sessions:** See phase-7.1 guides
**Dependencies:** Local DB for migrations (policy: migrations on host when shared DB)
**Success Criteria:** DDL aligned with server usage; migrations apply on localhost.

- [x] ### Phase 7.2: Server Infrastructure (Strategy Interface, Session Manager, Auth Config, Middleware, Router)
**Description:** Pluggable auth strategies, session issuance, config, and HTTP pipeline.
**Duration:** _(completed 2026-03-23)_
**Sessions:** See phase-7.2 guides
**Dependencies:** Phase 7.1 schema
**Success Criteria:** Auth middleware and routes callable; session cookies issued consistently.

- [x] ### Phase 7.3: Magic Link Strategy (Beta / Development)
**Description:** Request and verify magic links; set session cookie; structured logging.
**Duration:** _(completed 2026-03-23)_
**Sessions:** 7.3.x
**Dependencies:** Phase 7.2 infrastructure
**Success Criteria:** Documented env vars; verify route validates token and establishes session.


- [ ] ### Phase 7.4: Client-Side Auth
**Description:** Vue client uses session cookies (`withCredentials`), Pinia auth store, `/login` + magic-link verify route, server logout; align `useLogout` with session model.
**Duration:** TBD
**Sessions:** [7.4.1](sessions/session-7.4.1-guide.md) API client + auth API; [7.4.2](sessions/session-7.4.2-guide.md) store + routes + views; [7.4.3](sessions/session-7.4.3-guide.md) logout + layout.
**Dependencies:** Phase 7.3 APIs stable; Vite `/api` proxy in dev.
**Success Criteria:** See [phase-7.4-guide.md](phases/phase-7.4-guide.md).

- [ ] ### Phase 7.5: Password Strategy (Production — Deferred)
**Description:** _(deferred per plan)_
**Duration:** TBD
**Sessions:** TBD
**Dependencies:** TBD
**Success Criteria:** TBD

---

## Dependencies

**Prerequisites:**
- Local or hosted DB for migrations (see migration policy)
- Env vars documented in server `.env.example` / root `.env.example`

**Downstream impact:** Booking and admin UIs consume auth when wired client-side (phase 7.4+).

**External dependencies:** Email delivery for magic links (provider-specific).

---

## Success criteria (tranche 7.1–7.3)

- [x] Phases 7.1–7.3 completed
- [x] Architecture and env documented for delivered scope
- [x] Documentation updated (guide, log, handoff)
- [ ] Phases 7.4+ (client auth, password strategy) — not part of this completion

---

## Git Branch Strategy

**Branch Name:** `feature/authentication` (when used by harness)
**Branch From:** `develop`
**Merge To:** `develop`

**Branch Management:**
- Integrated on **`develop`** as of 2026-03-23; feature branch may be removed after merge.

---

## End of Feature Workflow

**CRITICAL: Prompt before ending feature**

After completing all phases in a feature, **prompt the user** before running `/feature-end`:

```
## Ready to End Feature?

All phases complete. Ready to merge feature branch?

**This will:**
- Generate feature summary
- Merge feature/[name] → develop
- Delete feature branch
- Finalize documentation

**Proceed with /feature-end?** (yes/no)
```

**If user says "yes":**
- Run `/feature-end` command automatically
- Complete all feature-end steps (verify completion, update docs, generate summary)
- **After all checks pass and docs are updated, prompt for commit/merge/push:**
  ```
  ## Ready to Commit, Merge, and Push?
  
  All feature-end checks completed successfully:
  - ✅ Feature summary generated
  - ✅ Feature documentation closed
  - ✅ All documentation updated
  
  **Ready to commit, merge, and push all changes?**
  
  This will:
  - Commit all changes with feature completion message
  - Merge feature/[name] → develop
  - Delete feature branch
  - Push to remote repository
  
  **Proceed with commit, merge, and push?** (yes/no)
  ```
- **If user says "yes" to commit/merge/push:** Execute git commit, merge, delete branch, and push, then end feature
- **If user says "no" to commit/merge/push:** End feature without committing (user can commit and merge manually later)

**If user says "no" to feature-end:**
- Address any requested changes
- Re-prompt when ready

After completing all phases in a feature:

1. **Verify feature completion** - All phases complete, success criteria met
2. **Update feature status** - Mark feature as Complete
3. **Update feature handoff** - Document feature completion and transition context
4. **Generate feature summary** - Create completion summary
5. **PROMPT USER FOR COMMIT/MERGE/PUSH** - After all checks pass and docs are updated, prompt user before git operations
6. **Merge feature branch** - Merge to develop (after user approval)
7. **Delete feature branch** - Clean up branch (after merge)
8. **Workflow Feedback** (Optional - only if issues encountered):
   - Were there any problems managing this feature workflow or issues with results?
   - Note any sticking points, inefficiencies, or workflow friction for future improvement
   - Consider if feature-level issues suggest improvements needed at phase, session, or task level

---

## Notes

[Feature-specific notes, decisions, blockers]

---

## Related Documents

- Feature Log: `.project-manager/features/[name]/feature-[name]-log.md`
- Feature Handoff: `.project-manager/features/[name]/feature-[name]-handoff.md`
- Phase Guides: `.project-manager/features/[name]/phases/phase-[N]-guide.md`
- Research Questions: `.project-manager/features/[name]/research-questions.md`

## Guide doc rollup (harness)

Child guides were archived at **2026-03-24T22:41:52.985Z** (safe rollup — no automatic merge of tierDown blocks).

- `.project-manager/features/authentication/phases/phase-7.1-guide.md`
- `.project-manager/features/authentication/phases/phase-7.2-guide.md`
- `.project-manager/features/authentication/phases/phase-7.3-guide.md`

---

## Architecture

High-level architecture and dependencies. [Fill in from feature plan.]

---

## Implementation Plan

Phases and implementation order. [Fill in from feature plan.]

---

## Session docs (integrated)

### session-7.1.1-guide

# Session 7.1.1 Guide: Migrations — sessions & magic_links

**Purpose:** Session-level guide with task breakdown

**Tier:** Session (Tier 2 - Medium-Level)

---

### session-7.1.2-guide

# Session 7.1.2 Guide: ** Sequelize models — register Session and MagicLink (or agreed names), associations, model index wiring

**Purpose:** Session-level guide with task breakdown

**Tier:** Session (Tier 2 - Medium-Level)

---

### session-7.2.1-guide

# Session 7.2.1 Guide: Strategy Contract and Auth Config Foundation

**Purpose:** Session-level guide with task breakdown

**Tier:** Session (Tier 2 - Medium-Level)

---

### session-7.2.2-guide

# Session 7.2.2 Guide: Session Manager and Cookie Lifecycle

**Purpose:** Session-level guide with task breakdown

**Tier:** Session (Tier 2 - Medium-Level)

---

### session-7.2.3-guide

# Session 7.2.3 Guide: Middleware and Router Integration

**Purpose:** Session-level guide with task breakdown

**Tier:** Session (Tier 2 - Medium-Level)

---

### session-7.3.1-guide

# Session 7.3.1 Guide: Magic link strategy core

**Purpose:** Session-level guide with task breakdown

**Tier:** Session (Tier 2 - Medium-Level)

---

### session-7.3.2-guide

# Session 7.3.2 Guide: Request magic link + delivery abstraction

**Purpose:** Session-level guide with task breakdown

**Tier:** Session (Tier 2 - Medium-Level)

---

### session-7.3.3-guide

# Session 7.3.3 Guide: ** Verify route — validate token, create session, set cookie, structured error paths and logging.

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

**Session ID:** 7.3.3
**Session Name:** ** Verify route — validate token, create session, set cookie, structured error paths and logging.
**Description:** [Brief description of session objectives]

**Duration:** [Estimated hours/days]
**Status:** [Not Started / In Progress / Complete]

### Tasks

- [x] #### Task 7.3.3.1: [Task Name]
**Goal:** [Task goal]
**Files:** 
- [Files to work with]
**Approach:** [Approach to take]
**Checkpoint:** [What needs to be verified]

- [x] #### Task 7.3.3.2: [Task Name]
**Goal:** [Task goal]
**Files:** 
- [Files to work with]
**Approach:** [Approach to take]
**Checkpoint:** [What needs to be verified]

---

## Session Workflow

### Before Starting a Session

**Recommended:** Use `/session-start 7.3.3 [description]` to automatically:
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
## Session: 7.3.3 - [Brief Description]
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
## Session: 7.3.3 - [Brief Description]
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
#### Task 7.3.3.N: [Task Name]
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
- [ ] #### Task 7.3.3.N: [Task Name]

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

**Session ID:** 7.3.2
**Session Name:** Request magic link + delivery abstraction
**Description:** Expose a POST endpoint to request a magic link, deliver it via a mailer abstraction (real email when configured; structured logger in dev). Reuse `issueMagicLinkForEmail`. Verify route + cookie is session 7.3.3.

**Duration:** 3 tasks
**Status:** In Progress

### Tasks

- [x] #### Task 7.3.2.1: Magic link delivery abstraction
**Goal:** Env-gated outbound send vs dev-only logging; stable log messages; redact secrets in logs.
**Files:**
- `server/src/auth/magicLinkDelivery.ts` (or `server/src/services/email/` if you prefer)
- `server/.env.example`
**Approach:** Single entry `sendMagicLinkNotification(...)`; no new npm deps unless already in repo; document env flags.
**Checkpoint:** Dev path logs intent without requiring SMTP; prod path callable when env is wired.

- [x] #### Task 7.3.2.2: Verify URL helper + request-link handler
**Goal:** `buildMagicLinkVerifyUrl(rawToken)`; `POST` handler that validates email, calls `issueMagicLinkForEmail`, then delivery.
**Files:**
- `server/src/auth/` (url helper, optional small module)
- `server/src/routes/internal/auth/authRouter.ts`
**Approach:** Joi body; generic JSON success (no user enumeration); CSRF on POST.
**Checkpoint:** End-to-end in dev: POST returns 200/202 and logs show a verifiable URL fragment.

- [x] #### Task 7.3.2.3: Router integration and docs
**Goal:** Wire route path under `authRouter`; align with `routes/index.ts` prefix; document env and smoke steps.
**Files:**
- `authRouter.ts`, `.env.example`, session planning reference
**Approach:** Keep handlers thin; delegate to helpers; logger on unexpected errors.
**Checkpoint:** `npm run lint` (server) clean; no verify/session cookie in this session.

---

## Session Workflow

### Before Starting a Session

**Recommended:** Use `/session-start 7.3.2 [description]` to automatically:
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
## Session: 7.3.2 - [Brief Description]
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
## Session: 7.3.2 - [Brief Description]
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
#### Task 7.3.2.N: [Task Name]
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
- [ ] #### Task 7.3.2.N: [Task Name]

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

- Depends on **7.3.1** (`issueMagicLinkForEmail`, token TTL). Verify + `Set-Cookie` belongs to **7.3.3**.
- Planning: `.project-manager/features/authentication/sessions/session-7.3.2-planning.md`

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

**Session ID:** 7.3.1
**Session Name:** Magic link strategy core
**Description:** Token generation and hashing, `magic_links` persistence lifecycle, and `AuthStrategy` (`verifyToken`) aligned with Phase 7.2 contracts. HTTP request-link, email, and session+cookie on verify belong to sessions 7.3.2 and 7.3.3.

**Duration:** ~3 tasks
**Status:** In Progress

### Tasks

- [x] #### Task 7.3.1.1: Token and hash utilities
**Goal:** Define how raw magic-link tokens are generated, hashed for storage (never store raw token), default TTL, optional `purpose` string; read TTL from env where appropriate.
**Files:**
- `server/src/auth/strategies/magicLinkToken.ts` (new, or co-locate in strategy file if small)
- `server/src/auth/strategies/strategyTypes.ts` (reference only)
**Approach:** Use Node crypto for random bytes + one-way hash; centralize constants; log misconfiguration with project logger, not empty catches.
**Checkpoint:** Hash function stable; TTL documented; raw token never persisted in DB.

- [x] #### Task 7.3.1.2: Magic link persistence layer
**Goal:** Create, lookup by token hash, enforce `expiresAt` and `consumedAt`, mark consumed on success (single-use).
**Files:**
- `server/src/db/models/auth/magic_link.ts` (model usage)
- `server/src/auth/strategies/magicLinkPersistence.ts` (new) or equivalent module
**Approach:** Sequelize queries in named functions; clear `AuthOpResult`-shaped outcomes or typed errors for strategy layer; handle not-found, expired, already-consumed uniformly.
**Checkpoint:** Unit behavior verifiable via dev logging or temporary route stub (no new tests per project policy unless you add a deliberate harness).

- [x] #### Task 7.3.1.3: `magicLinkStrategy` module
**Goal:** Export an `AuthStrategy` with `name: 'magic_link'` and `verifyToken` returning `userId` on valid token; no session creation here (Phase 7.3.3). Expose hooks or factory deps for 7.3.2 to issue links.
**Files:**
- `server/src/auth/strategies/magicLinkStrategy.ts` (new)
- `server/src/auth/index.ts` (register/export if pattern exists)
**Approach:** Compose token + persistence helpers; map failures to `AUTH_FAILURE_CODES`; keep functions within governance size or split.
**Checkpoint:** `verifyToken` matches `AuthStrategy` types; invalid paths return structured failure; ready for auth router wiring in later sessions.

---

## Session Workflow

### Before Starting a Session

**Recommended:** Use `/session-start 7.3.1 [description]` to automatically:
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
## Session: 7.3.1 - [Brief Description]
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
## Session: 7.3.1 - [Brief Description]
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
#### Task 7.3.1.N: [Task Name]
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
- [ ] #### Task 7.3.1.N: [Task Name]

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

- Session scope stops at strategy + persistence; **7.3.2** adds request-link HTTP + mail/log delivery; **7.3.3** adds verify route + `sessionManager` + cookie.
- Planning reference: `.project-manager/features/authentication/sessions/session-7.3.1-planning.md`

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

**Session ID:** 7.2.3
**Session Name:** Middleware and Router Integration
**Description:** Replace auth stubs with session-cookie + DB-backed `requireAuth` / `requireRole`, then integrate with `authRouter` and the internal route tree so Phase 7.3 can add strategies without reshaping middleware.

**Duration:** 3 tasks
**Status:** In Progress

### Tasks

- [x] #### Task 7.2.3.1: Session-backed requireAuth middleware
**Goal:** Read session id from cookie, load `Session` row, require `userId`, load `User`, set `req.user` (`id`, `role` from `userRole`); respond 401 with typed JSON when unauthenticated or on server errors (logged).
**Files:** 
- `server/src/middlewares/security.ts`
- `server/src/auth/sessionCookie.ts` (read-only use)
- `server/src/auth/sessionManager.ts` (read-only use)
- `server/src/types/express.d.ts` (only if needed)
- Optional: `server/src/auth/*` helper for “session → req.user” mapping
**Approach:** Async Express middleware; use `createLogger` in catch paths; do not leak session secrets in responses.
**Checkpoint:** Calls without valid logged-in session get 401; valid session with user gets `req.user` populated.

- [x] #### Task 7.2.3.2: requireRole factory
**Goal:** After `requireAuth`, enforce allowed roles using `req.user.role`; 403 when role missing or not allowed.
**Files:** 
- `server/src/middlewares/security.ts`
- `server/src/constants/userRoles.ts` (reference / alignment only)
**Approach:** Variadic `requireRole(...roles: string[])` returning standard middleware; clear JSON body for 403.
**Checkpoint:** Agent vs client (etc.) correctly allowed/blocked on a test route when combined with `requireAuth`.

- [x] #### Task 7.2.3.3: Auth router and route-tree integration
**Goal:** Mount or extend internal auth routes so at least one endpoint demonstrates `requireAuth` (and optional `requireRole`); keep login/magic-link as 501 until 7.3; document extension points in code comments.
**Files:** 
- `server/src/routes/internal/auth/authRouter.ts`
- `server/src/routes/index.ts` (or internal router entry) if mount order changes
**Approach:** Add minimal read-only “who am I” or health-style authenticated route; preserve existing CSRF/validation patterns where applicable.
**Checkpoint:** End-to-end: cookie + session + user → authenticated route succeeds; unauthenticated → 401; compile + lint pass.

---

## Session Workflow

### Before Starting a Session

**Recommended:** Use `/session-start 7.2.3 [description]` to automatically:
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
## Session: 7.2.3 - [Brief Description]
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
## Session: 7.2.3 - [Brief Description]
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
#### Task 7.2.3.N: [Task Name]
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
- [ ] #### Task 7.2.3.N: [Task Name]

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

**Session ID:** 7.2.2
**Session Name:** Session Manager and Cookie Lifecycle
**Description:** Persist server sessions in PostgreSQL and manage httpOnly session cookies using existing `getAuthConfig()`, so magic-link (7.3) can attach identity without redoing persistence.

**Duration:** 3 tasks
**Status:** In Progress

### Tasks

- [x] #### Task 7.2.2.1: Session manager (DB lifecycle)
**Goal:** Create, load, and revoke sessions via Sequelize `Session` model with explicit expiry handling and logging on errors.
**Files:** 
- `server/src/db/models/auth/session.ts` (reference)
- `server/src/auth/sessionManager.ts` (new; path per planning doc)
- `server/src/db/models/index.ts` or associations if imports need adjustment
**Approach:** Crypto-secure `sid`, store `sess` JSON and `expire` from `AUTH_SESSION_MAX_AGE_SEC`; `getSession` returns null if missing/expired; `revokeSession` deletes row.
**Checkpoint:** Unit behavior verifiable via manual script or temporary route only if already planned — prefer pure functions testable in isolation; lint clean.

- [x] #### Task 7.2.2.2: Session cookie helpers
**Goal:** Read/write/clear the session cookie using config-driven name, max-age, httpOnly, secure, sameSite.
**Files:** 
- `server/src/auth/sessionCookie.ts` (new)
- `server/src/config/authConfig.ts` (read-only use)
- `server/src/app.ts` if `cookie-parser` (or equivalent) must be mounted once
**Approach:** Align with Express `req`/`res` types; do not leak session id in response bodies.
**Checkpoint:** Cookie attributes match env expectations; dev vs production `secure` behavior documented in code comments.

- [x] #### Task 7.2.2.3: Session + cookie façade
**Goal:** Single small module exporting composed operations for Phase 7.3 (e.g. issue session + Set-Cookie, clear session + Clear-Cookie).
**Files:** 
- `server/src/auth/sessionIssue.ts` or `server/src/auth/sessionFacade.ts` (new)
- Re-export from `server/src/auth/index.ts` if useful and cycle-free
**Approach:** Thin wrappers calling sessionManager + sessionCookie only; no strategy logic.
**Checkpoint:** One import path documented for “how strategies establish a session” in a short module comment.

---

## Session Workflow

### Before Starting a Session

**Recommended:** Use `/session-start 7.2.2 [description]` to automatically:
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
## Session: 7.2.2 - [Brief Description]
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
## Session: 7.2.2 - [Brief Description]
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
#### Task 7.2.2.N: [Task Name]
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
- [ ] #### Task 7.2.2.N: [Task Name]

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

**Session ID:** 7.2.1
**Session Name:** Strategy Contract and Auth Config Foundation
**Description:** Define the shared server auth contracts and configuration foundation so later magic-link and password strategies can plug into one stable router and middleware boundary.

**Duration:** 2 tasks
**Status:** In Progress

### Tasks

- [ ] #### Task 7.2.1.1: Define Auth Strategy Contracts
**Goal:** Create the shared strategy interface, auth payload/result types, and server auth vocabulary that Phase 7.3 can implement without revisiting route contracts.
**Files:** 
- `server/src/auth/strategies/strategyTypes.ts`
- `server/src/routes/internal/auth/authRouter.ts`
- `server/src/routes/index.ts`
**Approach:** Define explicit auth strategy contracts for request/verify/authenticate-style flows, add typed result shapes, and align the current auth router with those contracts without implementing magic-link behavior yet.
**Checkpoint:** Strategy types are explicit, reusable, and narrow enough that future strategies can implement them without changing router signatures.

- [ ] #### Task 7.2.1.2: Add Auth Config and Module Scaffolding
**Goal:** Centralize auth environment decisions and create clean server module seams for config-driven auth behavior.
**Files:** 
- `server/src/config/authConfig.ts`
- `server/src/auth/index.ts`
- `server/src/routes/internal/auth/authRouter.ts`
- `server/src/routes/index.ts`
**Approach:** Add auth config helpers for strategy selection and cookie/session policy, then wire the auth router to consume the new config/module boundary while leaving session persistence implementation for Session 7.2.2.
**Checkpoint:** Auth config exists in one place, deferred responsibilities are clear, and the router/module shape is ready for Phase 7.3 magic-link work.

---

## Session Workflow

### Before Starting a Session

**Recommended:** Use `/session-start 7.2.1 [description]` to automatically:
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
## Session: 7.2.1 - [Brief Description]
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
## Session: 7.2.1 - [Brief Description]
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
#### Task 7.2.1.N: [Task Name]
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
- [ ] #### Task 7.2.1.N: [Task Name]

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

**Session ID:** 7.1.2
**Session Name:** ** Sequelize models — register Session and MagicLink (or agreed names), associations, model index wiring
**Description:** [Brief description of session objectives]

**Duration:** [Estimated hours/days]
**Status:** [Not Started / In Progress / Complete]

### Tasks

- [x] #### Task 7.1.2.1: [Task Name]
**Goal:** [Task goal]
**Files:** 
- [Files to work with]
**Approach:** [Approach to take]
**Checkpoint:** [What needs to be verified]

- [x] #### Task 7.1.2.2: [Task Name]
**Goal:** [Task goal]
**Files:** 
- [Files to work with]
**Approach:** [Approach to take]
**Checkpoint:** [What needs to be verified]

---

## Session Workflow

### Before Starting a Session

**Recommended:** Use `/session-start 7.1.2 [description]` to automatically:
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
## Session: 7.1.2 - [Brief Description]
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
## Session: 7.1.2 - [Brief Description]
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
#### Task 7.1.2.N: [Task Name]
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
- [ ] #### Task 7.1.2.N: [Task Name]

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

**Session ID:** 7.1.1
**Session Name:** Migrations — sessions & magic_links
**Description:** Add PostgreSQL migrations for `sessions` and `magic_links`; Sequelize models land in Session 7.1.2.

**Duration:** [Estimated hours/days]
**Status:** In Progress

### Tasks

- [x] #### Task 7.1.1.1: Migration — `sessions` table
**Goal:** Create the `sessions` table migration with columns, indexes, and FK to `users` as required by the session-store design for Phase 7.2.
**Files:**
- `server/migrations/*` (new file)
**Approach:** Follow existing repo migration patterns; align column types with `users.id`; add indexes for session lookup and expiry maintenance.
**Checkpoint:** `up`/`down` succeed on local Postgres when migrations are allowed to run; no model layer changes required for this task.

- [x] #### Task 7.1.1.2: Migration — `magic_links` table
**Goal:** Create the `magic_links` table migration (hashed token, expiry, consumption state, indexes; optional `user_id` / email per design).
**Files:**
- `server/migrations/*` (new or follow-up file in same PR as 7.1.1.1 if using one migration)
**Approach:** Store hashed token only; index fields used for verify and cleanup; FK to `users` when row is user-bound.
**Checkpoint:** `up`/`down` succeed; schema ready for magic-link strategy in Phase 7.3 and models in 7.1.2.

---

## Session Workflow

### Before Starting a Session

**Recommended:** Use `/session-start 7.1.1 [description]` to automatically:
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
## Session: 7.1.1 - [Brief Description]
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
## Session: 7.1.1 - [Brief Description]
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
#### Task 7.1.1.N: [Task Name]
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
- [ ] #### Task 7.1.1.N: [Task Name]

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

