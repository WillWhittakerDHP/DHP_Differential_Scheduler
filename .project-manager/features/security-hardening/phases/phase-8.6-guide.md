# Phase 8.6 Guide Template

**Purpose:** Phase-level guide for planning and tracking major milestones

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Overview

**Phase Number:** 8.6
**Phase Name:** CSRF Real Implementation
**Description:** CSRF Real Implementation

**Duration:** [Estimated weeks/months]
**Status:** Complete

---

## Phase Objectives

- [ ] Replace CSRF stub with validation compatible with HttpOnly session cookies
- [ ] Keep `createCrudRouter` integration working without per-route edits
- [ ] Document and verify end-to-end (server + Vue) for mutating requests

---

## Sessions Breakdown

- [x] ### Session 8.6.1: Server CSRF middleware and token issuance
**Description:** Implement real `csrfProtection`, document contract, verify mutating routes reject without token.
**Tasks:** TBD in session guide
**Focus:**
- `server/src/middlewares/security.ts`, `app.ts` ordering, `docs/SECURITY_STUBS.md`

- [x] ### Session 8.6.2: Vue client wires CSRF on mutating API calls
**Description:** Ensure SPA sends token on POST/PUT/PATCH/DELETE through shared API layer; smoke-test key flows.
**Tasks:** TBD in session guide
**Focus:**
- `client/src/**` fetch/axios composables or API module

---

## Dependencies

**Prerequisites:**
- Feature 7: session cookie and authenticated mutating API paths usable from Vue
- Phase 8.5 CSP: client can obtain/send CSRF token without CSP violations

**Downstream Impact:**
- [How this phase affects later phases]

---

## Success Criteria

- [x] All sessions completed
- [ ] All focus areas addressed
- [x] Code quality checks passing
- [x] Documentation updated
- [x] Ready for next phase

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

- Phase Log: `.cursor/workflow-manager/vue-migration/phases/phase-8.6-log.md`
- Phase Handoff: `.cursor/workflow-manager/vue-migration/phases/phase-8.6-handoff.md`
- Session Guides: `.cursor/workflow-manager/vue-migration/sessions/session-[X.Y]-guide.md`

---

## Tasks

Sessions and tasks for this phase. [See Sessions Breakdown below.]

<!-- end excerpt phase -->