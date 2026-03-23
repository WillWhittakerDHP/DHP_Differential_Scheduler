# Phase 7.2: Server Infrastructure

**Purpose:** Phase-level guide for planning and tracking major milestones

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Overview

**Phase Number:** 7.2
**Phase Name:** Server Infrastructure
**Description:** Build the shared server-side authentication foundation: strategy contracts, auth configuration, session lifecycle management, middleware boundaries, and router integration. This phase should make magic-link auth possible in the next phase without forcing rewrites to route protection or session storage.

**Duration:** 3 sessions
**Status:** In Progress

---

## Phase Objectives

- Define a pluggable authentication contract so magic-link and password flows can share one server boundary
- Add session-manager infrastructure for creating, reading, refreshing, and revoking server-backed sessions
- Introduce auth config, middleware, and router structure that can protect future authenticated routes without coupling to one strategy

---

## Sessions Breakdown

- [x] ### Session 7.2.1: Strategy Contract and Auth Config Foundation
**Description:** Start simple by defining the server auth seams: shared auth types, strategy interface, environment/config decisions, and router/auth module structure.
**Tasks:** 3
**Focus:**
- Create auth strategy types and explicit contracts for authenticate/request/verify flows
- Add auth config helpers for cookie/session behavior and environment-driven strategy selection
- Replace placeholder planning ambiguity with concrete file locations and naming for the auth server module

- [x] ### Session 7.2.2: Session Manager and Cookie Lifecycle
**Description:** Add the persistent session layer that strategies can use without owning cookie or database lifecycle details directly.
**Tasks:** 3
**Focus:**
- Implement server session manager helpers for create, lookup, revoke, and expiration handling
- Define cookie read/write helpers and httpOnly session behavior for Express responses
- Keep the public server contract flat so later strategies call session actions instead of duplicating persistence logic

- [x] ### Session 7.2.3: Middleware and Router Integration
**Description:** Wire the infrastructure into Express so auth-aware routes have reusable middleware and the auth router can grow beyond its current placeholder state.
**Tasks:** 3
**Focus:**
- Add `requireAuth` and role-aware middleware boundaries for protected routes
- Refactor the internal auth router from placeholder endpoints toward strategy-backed request handlers
- Integrate auth middleware and router wiring into the server route tree with clear extension points for Phase 7.3

---

## Dependencies

**Prerequisites:**
- Phase 7.1 database and model work provides the underlying auth/session tables or equivalent persistence contract
- Existing Express server structure in `server/src/app.ts` and `server/src/routes/**` remains the integration surface

**Downstream Impact:**
- Phase 7.3 can focus on magic-link behavior instead of rebuilding session or middleware foundations
- Phase 7.4 can consume stable auth/session APIs from the client side for route guards and session awareness

---

## Success Criteria

- [ ] Strategy interfaces and auth types are defined with explicit server boundaries
- [ ] Session manager lifecycle exists for create/read/revoke flows
- [ ] Auth config centralizes cookie/session strategy decisions
- [ ] Middleware exists for authenticated and role-aware route protection
- [ ] Auth router structure is ready for magic-link implementation in Phase 7.3
- [ ] Documentation reflects the agreed server auth architecture

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

- Manual continuation note: `phase-7.2` branch already existed, so the harness `phase-start 7.2` validation blocked on branch creation. This guide was seeded manually so session planning can continue on the existing phase branch.
- Existing placeholder auth routing lives in `server/src/routes/internal/auth/authRouter.ts` and should be evolved, not replaced blindly.
- Keep Google OAuth explicitly out of scope for this phase unless product scope changes; Phase 7.2 is infrastructure-first.

---

## Related Documents

- Phase Log: `.project-manager/features/authentication/phases/phase-7.2-log.md`
- Phase Handoff: `.project-manager/features/authentication/phases/phase-7.2-handoff.md`
- Feature Guide: `../feature-authentication-guide.md`
