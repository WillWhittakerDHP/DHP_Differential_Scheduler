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
**Description:** _(future tranche — not in scope for 7.1–7.3 completion)_
**Duration:** TBD
**Sessions:** TBD
**Dependencies:** Phase 7.3 APIs stable
**Success Criteria:** TBD

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
