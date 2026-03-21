# Phase 8.2 Guide Template

**Purpose:** Phase-level guide for planning and tracking major milestones

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Overview

**Phase Number:** 8.2
**Phase Name:** Inbound Rate Limiting
**Description:** Inbound Rate Limiting

**Duration:** [Estimated weeks/months]
**Status:** [Not Started / In Progress / Complete]

---

## Phase Objectives

- Install `express-rate-limit` and apply general limiter (100 req/15 min) to internal API routes
- Wire auth-route limiter (10 req/15 min) for future auth routes
- Verify excess requests return 429 with Retry-After

---

## Sessions Breakdown

- [x] ### Session 8.2.1: General rate limiter for internal API routes
**Description:** Install express-rate-limit, create general limiter (100 req/15 min per IP), mount on `/api/v1/internal/*`.
**Tasks:** 2–3
**Focus:**
- Add express-rate-limit dependency
- Create and mount limiter middleware in app.ts
- Verify 429 response when limit exceeded

- [x] ### Session 8.2.2: Auth-route limiter and verification
**Description:** Add stricter limiter (10 req/15 min) for auth routes; wire to placeholder or real path; document in SECURITY_STUBS.
**Tasks:** 2
**Focus:**
- Auth-route limiter config and mount
- Verification and documentation

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

- Phase Log: `.cursor/workflow-manager/vue-migration/phases/phase-8.2-log.md`
- Phase Handoff: `.cursor/workflow-manager/vue-migration/phases/phase-8.2-handoff.md`
- Session Guides: `.cursor/workflow-manager/vue-migration/sessions/session-[X.Y]-guide.md`

---

## Tasks

Sessions and tasks for this phase. [See Sessions Breakdown below.]
