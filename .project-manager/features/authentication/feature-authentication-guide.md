# Feature authentication Guide

**Purpose:** Feature-level guide for planning and tracking major initiatives

**Tier:** Feature (Tier 0 - Highest Level)

---

## Overview

**Feature Name:** authentication  
**Description:** Pluggable authentication (magic link for beta, password deferred for production), shared PostgreSQL sessions, httpOnly cookies, and `requireAuth` middleware per LAUNCH_CHECKLIST Phase 2A and PROJECT_PLAN Feature 7.  
**Status:** 📋 Planning  

**Duration:** [To be determined]  
**Started:** 2026-02-18  
**Completed:** —

## Architecture

Server-side **strategy pattern** for auth: shared `sessions` / `magic_links` data layer, session manager, auth router, and middleware that attaches `req.user` from cookie-backed sessions. Client uses Pinia (or equivalent) plus Vue Router guards aligned with the same session contract. CSRF and ownership checks in `security.ts` stay wired; real implementations replace stubs after sessions exist. Feature 6 and later features consume identity via enactment steps listed under Dependencies in this guide.

## Implementation Plan

Execute phases in order: **7.1** Database & Models (migrations, Sequelize models) → **7.2** Server infrastructure (strategy interface, session manager, `requireAuth`, auth config, router) → **7.3** Magic link strategy (beta/dev) → **7.4** Client-side auth (store, views, guards) → enact dependent features per PROJECT_PLAN; **7.5** Password strategy remains deferred until production readiness. After each phase: `/phase-start` → work per phase guide → `/phase-end`, then cascade to the next phase.

---

## Research Phase

Research phase not yet started — architectural decisions to be documented in this guide.

---

## Feature Objectives

- [Objective 1]
- [Objective 2]
- [Objective 3]

---

## Phases Breakdown

- [ ] ### Phase 7.1: Database & Models
**Description:** 
**Duration:** [Estimated weeks]
**Sessions:** [Number of sessions]
**Dependencies:** [Prerequisites]
**Success Criteria:**


- [ ] ### Phase 7.2: Server Infrastructure (Strategy Interface, Session Manager, Auth Config, Middleware, Router)
**Description:** 
**Duration:** [Estimated weeks]
**Sessions:** [Number of sessions]
**Dependencies:** [Prerequisites]
**Success Criteria:**


- [ ] ### Phase 7.3: Magic Link Strategy (Beta / Development)
**Description:** 
**Duration:** [Estimated weeks]
**Sessions:** [Number of sessions]
**Dependencies:** [Prerequisites]
**Success Criteria:**


- [ ] ### Phase 7.4: Client-Side Auth
**Description:** 
**Duration:** [Estimated weeks]
**Sessions:** [Number of sessions]
**Dependencies:** [Prerequisites]
**Success Criteria:**


- [ ] ### Phase 7.5: Password Strategy (Production — Deferred)
**Description:** 
**Duration:** [Estimated weeks]
**Sessions:** [Number of sessions]
**Dependencies:** [Prerequisites]
**Success Criteria:**


- [ ] ### Phase [N+1]: [Phase Name]
**Description:** [What this phase accomplishes]
**Duration:** [Estimated weeks]
**Sessions:** [Number of sessions]
**Dependencies:** [Prerequisites]
**Success Criteria:**
- [Criterion 1]
- [Criterion 2]

---

## Dependencies

**Prerequisites:**
- [Dependency 1]
- [Dependency 2]

**Downstream Impact:**
- [How this feature affects other features/work]

**External Dependencies:**
- [External dependency 1]
- [External dependency 2]

---

## Success Criteria

- [ ] All phases completed
- [ ] All research questions answered
- [ ] Architecture decisions documented
- [ ] Code quality checks passing
- [ ] Documentation updated
- [ ] Tests passing
- [ ] Performance targets met
- [ ] Ready for production

---

## Git Branch Strategy

**Branch Name:** `feature/[name]`
**Branch From:** `develop`
**Merge To:** `develop`

**Branch Management:**
- Created: [Date] (at feature start)
- Merged: [Date] (at feature end)
- Deleted: [Date] (after merge)

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

