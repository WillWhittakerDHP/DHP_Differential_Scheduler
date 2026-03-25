# Phase 8.5 Guide: Security headers — Helmet, CSP

**Purpose:** Harden HTTP security headers for the Express API and Vue SPA.

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Overview

**Phase Number:** 8.5
**Phase Name:** Security headers — Helmet, CSP
**Description:** Review and tune Helmet configuration; add Content-Security-Policy for API and Vue SPA; document in SECURITY_STUBS.

**Duration:** ~1–2 weeks
**Status:** Not Started

---

## Phase Objectives

- Tune Helmet defaults (HSTS, referrer policy, safe directives)
- Add Content-Security-Policy suited for API + Vue SPA
- Document security header patterns in SECURITY_STUBS
- Ensure app loads and functions after changes

---

## Sessions Breakdown

- [x] ### Session 8.5.1: Helmet configuration
**Description:** Audit current Helmet defaults, tune HSTS/referrer policy, document in SECURITY_STUBS.
**Tasks:** 2
**Focus:**
- HSTS, referrer policy, safe defaults
- SECURITY_STUBS documentation

- [x] ### Session 8.5.2: CSP implementation
**Description:** Add Content-Security-Policy via Helmet; configure for API and Vue SPA; verify app loads.
**Tasks:** 2
**Focus:**
- CSP directives (default-src, script-src, style-src, connect-src)
- App verification and CSP violation check

---

## Dependencies

**Prerequisites:**
- Phase 8.4 (Secrets audit) complete
- Helmet already installed and used in server/src/app.ts

**Downstream Impact:**
- Phase 8.6–8.7 (CSRF) may depend on CSP and header setup for cookie/CSRF flow.

---

## Success Criteria

- [ ] All sessions completed
- [ ] Helmet configured with HSTS, referrer policy
- [ ] CSP header applied; Vue app loads without CSP violations
- [ ] SECURITY_STUBS updated
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

- Phase Log: `.project-manager/features/security-hardening/phases/phase-8.5-log.md`
- Phase Handoff: `.project-manager/features/security-hardening/phases/phase-8.5-handoff.md`
- Session Guides: `.project-manager/features/security-hardening/sessions/session-8.5.*-guide.md`

---

## Tasks

Sessions 8.5.1 and 8.5.2. See Sessions Breakdown above.
