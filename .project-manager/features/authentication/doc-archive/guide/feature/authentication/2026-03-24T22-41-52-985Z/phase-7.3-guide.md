# Phase 7.3: Magic Link Strategy (Beta / Development)

**Purpose:** Phase-level guide for planning and tracking major milestones

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Overview

**Phase Number:** 7.3  
**Phase Name:** Magic Link Strategy (Beta / Development)  
**Description:** Implement the first concrete auth strategy: magic-link issuance, delivery (email or dev logging), and verify flow that establishes a server session and httpOnly cookie on top of Phase 7.1–7.2 infrastructure.

**Duration:** 3 sessions  
**Status:** Complete

---

## Phase Objectives

- Implement a magic-link strategy that conforms to the Phase 7.2 strategy contract
- Provide a request-link endpoint and a verify endpoint that completes session + cookie lifecycle
- Keep email optional in development via a clear env-gated or console-based delivery path

---

## Sessions Breakdown

- [x] ### Session 7.3.1: Magic link strategy core
**Description:** Token generation, storage, and consumption rules using the `magic_links` model; strategy module registered with existing auth seams.  
**Tasks:** 3  
**Focus:**
- Align with `strategyTypes` and session manager boundaries
- Expiry, single-use or rotation policy, and logging on failure

- [x] ### Session 7.3.2: Request magic link + delivery abstraction
**Description:** HTTP surface to request a link for an identifier (email); outbound email when configured, structured console/log path in dev.  
**Tasks:** 3  
**Focus:**
- No silent failures; rate-limit or abuse notes documented if out of scope
- Router wiring in `authRouter` consistent with Phase 7.2

- [x] ### Session 7.3.3: Verify route and session establishment
**Description:** Verify handler validates token, creates session via session manager, sets session cookie, returns appropriate success/error responses.  
**Tasks:** 3  
**Focus:**
- End-to-end smoke: valid token → authenticated subsequent request via `requireAuth`
- Clear behavior for expired, reused, or unknown tokens

---

## Dependencies

**Prerequisites:**

- Phase 7.1: `sessions` and `magic_links` tables and Sequelize models
- Phase 7.2: strategy types, session manager, cookie helpers, `requireAuth`, auth router scaffold

**Downstream Impact:**

- Phase 7.4 can build Vue login/verify UX and align router guards with the real cookie/session contract

---

## Success Criteria

- [ ] Magic-link strategy implemented and reachable from auth router
- [ ] Request and verify flows exercised in development without requiring production email
- [ ] Successful verify creates a session and sets cookie; invalid paths logged and handled
- [ ] Phase guide sessions completed and documented for handoff to 7.4

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

Client-facing login and guard polish belong to **Phase 7.4**. Password strategy remains **Phase 7.5 (deferred)**.

---

## Related Documents

- Feature guide: `.project-manager/features/authentication/feature-authentication-guide.md`
- Phase planning: `.project-manager/features/authentication/phases/phase-7.3-planning.md`
- Prior phase: `.project-manager/features/authentication/phases/phase-7.2-guide.md`
- Session guides: `.project-manager/features/authentication/sessions/session-7.3.*-guide.md` (created at session-start)

---

## Tasks

Sessions and tasks for this phase. See **Sessions Breakdown** above.

<!-- end excerpt phase -->