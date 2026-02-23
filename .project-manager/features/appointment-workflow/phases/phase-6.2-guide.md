# Phase 6.2 Guide: Held & Override Stubs

**Purpose:** Phase-level guide for planning and tracking the held status and admin override stub implementations

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Overview

**Phase Number:** 6.2
**Phase Name:** Held & Override Stubs
**Description:** Prepare held appointment status and admin constraint-override as stub implementations. These stubs establish the server routes, model fields, and client UI scaffolding now, so Feature 7 (Authentication) can enact them with real role checks when auth is in place.

**Duration:** 1–2 sessions
**Status:** Not Started

---

## Phase Objectives

- Add server-side hold/release logic to existing CRUD router for holding appointment slots (trusted agent hold)
- Add server-side admin constraint override logic to existing CRUD router
- Add client-side UI scaffolding for "Hold Slot" and "Admin Override" actions (disabled until auth)
- Document what Feature 7 enactment must wire up for each stub

---

## Context: What Already Exists

**Appointment Status ENUM (Phase 6.1):** Already includes `held` in the 8-value status enum (`started`, `held`, `rescheduling`, `quoted`, `submitted`, `confirmed`, `cancelled`, `deleted`). The `held` status value exists in the database — Phase 6.2 adds the route/logic to transition appointments into that status.

**Security Stubs:** `csrfProtection` and `checkOwnership` stubs exist in `server/src/middlewares/security.ts`. `requireAuth` is now exported (previously `_requireAuth`). Phase 6.2 stubs follow the same pattern — functional middleware that calls `next()` for auth checks, with documented ENACTMENT markers for Feature 7.

**Phase 6.7 (Future):** The full admin force-create and constraint override flow (Phase 6.7) depends on Feature 7 auth. Phase 6.2 prepares the foundation: a simpler stub that establishes the route structure, model fields, and UI placement. Phase 6.7 builds the complete implementation on top.

---

## Sessions Breakdown

- [x] ### Session 6.2.1: Held Status Stub
**Description:** Hold logic via the existing appointment PATCH endpoint, plus client-side "Hold Slot" button (disabled/hidden). The held flow: agent selects a slot → hits "Hold" → client PATCHes `{ status: 'held', holdDurationMinutes: 15 }` → server computes `heldUntil` in `sanitizeInput`, sets `held_by` and `held_until` → slot is temporarily reserved. Release: client PATCHes `{ status: 'started' }` → server auto-clears hold metadata.
**Tasks:**
- Add `held_by` (FK → users, nullable) and `held_until` (TIMESTAMPTZ, nullable) columns to appointments table via migration
- Add hold/release logic in `sanitizeInput` of the existing CRUD router (computes `heldUntil` from `holdDurationMinutes`, clears hold metadata on release)
- Export `requireAuth` stub from security middleware for Feature 7 enactment
- Client: Add "Hold Slot" button to availability step UI (disabled with tooltip "Requires authentication")
- Document enactment requirements for Feature 7

**Learning Goals:**
- Understand the stub pattern for auth-gated features
- Learn how appointment status transitions work

- [x] ### Session 6.2.2: Admin Override Stub
**Description:** Admin constraint override logic via the existing appointment PATCH endpoint, plus client-side "Override" action in the admin panel. This prepares the structure that Phase 6.7 will expand into the full force-create and constraint override system.
**Tasks:**
- Add `override_constraints` (JSONB, nullable) column to appointments via migration and update model
- Add override logic in `sanitizeInput`: when `overrideConstraints` is present in PATCH body, validate and store the constraint keys
- Export `requireRole` stub from security middleware for Feature 7 enactment
- Client: Add "Override Constraints" button to admin appointment view (disabled with tooltip "Requires admin authentication")
- Document the relationship between this stub and Phase 6.7's full implementation
- Document enactment requirements for Feature 7

**Learning Goals:**
- Understand how constraint overrides will integrate with the slot computation system
- Learn the admin role-gating pattern

---

## Dependencies

**Prerequisites:**
- Phase 6.1 (Status Workflow & UI Enhancements) — Complete ✅
- Appointment status ENUM already includes `held`

**Downstream Impact:**
- Feature 7 (Authentication) enactment will wire real `requireAuth` and `requireRole` into these stubs
- Phase 6.7 (Admin Force-Create & Constraint Overrides) builds the full override system on top of this stub foundation

---

## Success Criteria

- [ ] All sessions completed
- [ ] Hold via PATCH works end-to-end (status: 'held' with computed heldUntil)
- [ ] Override via PATCH works end-to-end (with stub auth)
- [ ] Client UI elements exist but are properly gated
- [ ] Enactment requirements documented for Feature 7
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

---

## Notes

- **PATCH-based approach:** Hold and override are status transitions, not separate resources. They use the existing `PATCH /appointments/:id` endpoint with `sanitizeInput` computing server-side fields (e.g., `heldUntil` from `holdDurationMinutes`). This keeps the API surface minimal and consistent with how other appointment status changes work.
- The "stub" pattern here mirrors the existing security stubs (`csrfProtection`, `checkOwnership`) — functional middleware that calls `next()` but skips auth verification. Feature 7 replaces the stub auth with real checks.
- The `held` status already exists in the ENUM from Phase 6.1, so no ENUM migration is needed — only column additions (`held_by`, `held_until`).
- Phase 6.7 is the full implementation; Phase 6.2 is the minimal foundation.

---

## Related Documents

- Feature Guide: `.project-manager/features/appointment-workflow/feature-appointment-workflow-guide.md`
- Feature Log: `.project-manager/features/appointment-workflow/feature-appointment-workflow-log.md`
- PROJECT_PLAN: `.project-manager/PROJECT_PLAN.md` (Feature 6, Phase 6.2)
- Security Stubs: `server/docs/SECURITY_STUBS.md`
