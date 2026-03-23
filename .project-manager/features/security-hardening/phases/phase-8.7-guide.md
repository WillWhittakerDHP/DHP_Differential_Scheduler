# Phase 8.7 Guide Template

**Purpose:** Phase-level guide for planning and tracking major milestones

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Overview

**Phase Number:** 8.7
**Phase Name:** checkOwnership Real Implementation
**Description:** checkOwnership Real Implementation

**Duration:** TBD
**Status:** In Progress

---

## Phase Objectives

- [ ] Replace **`checkOwnership`** stub with real enforcement using **`req.user.id`** (after **`requireAuth`**)
- [ ] Keep **`createCrudRouter`** and existing route wiring — fix only wrong owner-field assumptions via registry/config
- [ ] Document behavior, exceptions (global rows, admin), and verification steps in **`SECURITY_STUBS.md`**

---

## Sessions Breakdown

- [x] ### Session 8.7.1: Ownership registry and middleware implementation
**Description:** Map resource names to Sequelize models and owner columns; implement load-by-param, 404/403, logging.
**Tasks:** Defined in session guide after `/session-start 8.7.1`
**Focus:**
- `server/src/middlewares/security.ts`
- Optional ownership registry module colocated under `server/src/middlewares/` or `server/src/auth/`

- [ ] ### Session 8.7.2: Edge cases, docs, and IDOR smoke
**Description:** Global/system-owned rows, admin bypass rules if any, update **SECURITY_STUBS**, manual wrong-user checks.
**Tasks:** Defined in session guide after `/session-start 8.7.2`
**Focus:**
- `server/docs/SECURITY_STUBS.md`
- Appointment / entity / property routers — validation only unless mapping fixes required

---

## Dependencies

**Prerequisites:**
- Feature **7**: **`requireAuth`** sets **`req.user`** (`id`, `role`)
- Phase **8.6**: CSRF active on mutating internal API (client sends token)

**Downstream Impact:**
- **IDOR** closed on routes already using **`checkOwnership`**; may expose missing **`requireAuth`** on some handlers (fix in same phase or follow-up)

---

## Success Criteria

- [ ] All sessions completed
- [ ] Ownership enforced per registry; exceptions documented
- [ ] Server lint clean on touched files
- [ ] **SECURITY_STUBS** reflects active **`checkOwnership`**
- [ ] Ready for **`/phase-end 8.7`**

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

- Phase planning: `.project-manager/features/security-hardening/phases/phase-8.7-planning.md`
- Feature guide: `.project-manager/features/security-hardening/feature-security-hardening-guide.md`
- Security contract: `server/docs/SECURITY_STUBS.md`

---

## Tasks

Sessions and tasks for this phase. [See Sessions Breakdown below.]
