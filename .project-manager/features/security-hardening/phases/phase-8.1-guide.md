# Phase 8.1: CORS Lockdown

**Purpose:** Phase-level guide for planning and tracking major milestones

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Overview

**Phase Number:** 8.1
**Phase Name:** CORS Lockdown
**Description:** Add `CORS_ORIGIN` env var, restrict CORS to allowed origins (dev: localhost:3002, production: Render static site URL). Replace wide-open `cors()` config.

**Duration:** 1 session
**Status:** Not Started

---

## Phase Objectives

- Add `CORS_ORIGIN` to env validation (envConfig.ts)
- Pass `{ origin }` to `cors()` in app.ts
- Document `CORS_ORIGIN` in .env.example
- Verify requests from unlisted origins are rejected

---

## Sessions Breakdown

- [x] ### Session 8.1.1: CORS Origin Wiring
**Description:** Add CORS_ORIGIN env var, wire CORS origin in app.ts, update .env.example, verify origin restriction.
**Tasks:** 1
**Focus:**
- envConfig.ts: add CORS_ORIGIN to schema
- app.ts: replace `cors()` with `cors({ origin: corsOrigin })`
- .env.example: document CORS_ORIGIN
- Manual verification: curl with disallowed origin returns CORS error

---

## Dependencies

**Prerequisites:** None (Phase 8.1 is independent of Feature 7)

**Downstream Impact:** Once CORS is locked down, only whitelisted origins can call the API; external testers must use the configured frontend URL.

---

## Success Criteria

- [ ] CORS rejects requests from origins not in allowlist
- [ ] Dev: http://localhost:3002 accepted
- [ ] Production: Render static site origin accepted
- [ ] .env.example documents CORS_ORIGIN

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

- Phase Log: `.project-manager/features/security-hardening/phases/phase-8.1-log.md`
- Phase Handoff: `.project-manager/features/security-hardening/phases/phase-8.1-handoff.md`
- Feature Guide: `../feature-security-hardening-guide.md`

---

## Tasks

Sessions and tasks for this phase. [See Sessions Breakdown below.]
