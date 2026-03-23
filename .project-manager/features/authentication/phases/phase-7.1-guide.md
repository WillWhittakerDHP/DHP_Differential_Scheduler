# Phase 7.1 Guide Template

**Purpose:** Phase-level guide for planning and tracking major milestones

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Overview

**Phase Number:** 7.1
**Phase Name:** Database & Models
**Description:** Database & Models

**Duration:** [Estimated weeks/months]
**Status:** Not Started

---

## Phase Objectives

- PostgreSQL tables exist for **server-side sessions** and **magic links**, aligned with Feature 7 strategy (LAUNCH_CHECKLIST Phase 2A, PROJECT_PLAN Feature 7).
- **Sequelize models** mirror those tables and integrate with the existing **`User`** model where foreign keys apply.
- No auth middleware, routes, or client UI in this phase — schema and models only.

---

## Sessions Breakdown

- [ ] ### Session 7.1.1: Migrations — sessions & magic_links
**Description:** Add Sequelize migrations creating `sessions` and `magic_links` (or agreed table names) with appropriate columns, indexes, and FK to `users` as needed.
**Tasks:** [Planned at session-start]
**Focus:**
- Match columns to the session-manager / magic-link design implied by PROJECT_PLAN (expiry, token storage, user linkage)
- Follow repo migration conventions; respect DB_HOST policy for running migrations

- [ ] ### Session 7.1.2: Sequelize models & registration
**Description:** Implement models for the new tables, define associations to `User`, export via `server/src/db/models/index.ts` (and association files if required by repo pattern).
**Tasks:** [Planned at session-start]
**Focus:**
- Type-safe model definitions consistent with migrations
- No Express wiring — Phase 7.2 owns session manager and middleware

---

## Dependencies

**Prerequisites:**
- [Dependency 1]
- [Dependency 2]

**Downstream Impact:**
- [How this phase affects later phases]

---

## Success Criteria

- [ ] All sessions completed
- [ ] All focus areas addressed
- [ ] Code quality checks passing
- [ ] Documentation updated
- [ ] Ready for next phase

---

## End of Phase Workflow

**CRITICAL: Prompt before completing phase**

After completing all sessions in a phase, **prompt the user** before running `/phase-end`:

```
## Ready to Complete Phase?

All sessions complete. Ready to run phase-completion workflow?

**This will:**
- Mark phase complete (update checkboxes and status)
- Update phase log with completion summary
- Update main handoff document
- Git commit/push

**Proceed with /phase-end?** (yes/no)
```

**If user says "yes":**
- Run `/phase-end` command automatically
- Complete all phase-completion steps

**If user says "no":**
- Address any requested changes
- Re-prompt when ready

After completing all sessions in a phase:

1. **Verify phase completion** - All sessions complete, success criteria met
2. **Update phase status** - Mark phase as Complete
3. **Update phase handoff** - Document phase completion and transition context
4. **Workflow Feedback** (Optional - only if issues encountered):
   - Were there any problems managing this phase workflow or issues with results?
   - Note any sticking points, inefficiencies, or workflow friction for future improvement
   - Consider if phase-level issues suggest improvements needed at session or task level

---

## Notes

[Phase-specific notes, decisions, blockers]

---

## Related Documents

- Feature guide: `.project-manager/features/authentication/feature-authentication-guide.md`
- Phase planning: `.project-manager/features/authentication/phases/phase-7.1-planning.md`
- Session guides: `.project-manager/features/authentication/sessions/session-7.1.*-guide.md` (created at session-start)

---

## Tasks

Sessions and tasks for this phase. [See Sessions Breakdown below.]
