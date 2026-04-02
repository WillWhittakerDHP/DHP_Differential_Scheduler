# Feature appointment-workflow Handoff

**Purpose:** Transition context between features (large-scale concerns only)

**Tier:** Feature (Tier 0 - Highest Level)

**Last Updated:** 2026-04-02
**Feature Status:** Complete

## [Next Action]

**Feature 6 is closed.** Pick up the next feature from `.project-manager/PROJECT_PLAN.md`. Optional follow-ups that do **not** block closure: Phase **6.9** (mini-wizard — not started), **6.5** session **6.5.1** (partial per `phase-6.5-guide.md`), **6.10** (fee preview / coupon — in progress per `phase-6.10-guide.md`). For **Feature 7**, enact auth-related stubs using the section **Enactment requirements for Feature 7** below and `server/docs/SECURITY_STUBS.md`.

---

## Current Status

**Feature appointment-workflow:** Complete (feature-end **2026-04-02**)
**Integration:** Work merged to `develop` and `main`; feature branch was `feature/appointment-workflow` (removed on remote when present).
**Rollup:** `.project-manager/PROJECT_PLAN.md` (Feature 6 section + summary table); per-phase detail: `phases/phase-6.*-guide.md`.

---

## Transition Context

**Closure:** PROJECT_PLAN marks Feature 6 complete with an explicit rollup table; phases **6.5** (partial), **6.9** (not started), and **6.10** (in progress) remain documented as follow-ups in guides, not as open feature-tier gates.

**Historical note (2026-03-02):** Admin SFC complexity — BlockInstanceList, ShapesTab, EventInstancesSection, OverlapConstraintsPanel — logic extracted to composables; see `sessions/admin-panel-four-components.md`.

**Downstream:** Rescheduling, org defaults, delete wizard, role catalog, brand/theme tranches, and related wizard/admin work are recorded in phase guides. Feature 7 owns **requireAuth**, **held_by**, **scheduled_by** population from `req.user`, and client visibility of role-gated actions — see **Enactment requirements for Feature 7** and `server/docs/NOTIFICATION_ARCHITECTURE.md`.

---

## Feature Summary

**Phases (rollup):** 6.1–6.4, 6.6–6.8, 6.11–6.18 complete per PROJECT_PLAN at feature-end; **6.5** partial; **6.9** not started; **6.10** in progress.

**Key accomplishments:**
- Eight-value appointment status model with guarded transitions
- Confirmation, notifications, calendar invites, and business settings
- Wizard modes (initial / quote / reschedule), org defaults resolver, dependency-aware admin delete, role catalog and alignment, brand/theme pipelines, fee and drive-time tooling (see phase guides for scope)
- Auth-dependent surfaces stubbed with documented Feature 7 enactment steps

**Decisions:** State machine for transitions; observer-style notification hooks; shared types and resolver patterns per ARCHITECTURE.md and phase docs.

**Stack:** Vue 3 + Vuetify (wizard, admin); Express + Sequelize (API, appointments, availability, fees).

---

## Git Branch Status

**Branch:** Was `feature/appointment-workflow`
**Status:** Merged; local/remote feature branch removed when applicable
**Merged to:** `develop`, then `main`
**Close date:** 2026-04-02

---

## Notes

**Keep minimal** - Detailed notes belong in feature log, not handoff.

---

## Enactment requirements for Feature 7 (Authentication)

The appointment-workflow feature leaves **security stubs** that Feature 7 (authentication) must enact for the held-status flow to be fully functional. Exact steps:

1. **requireAuth middleware** (`server/src/middlewares/security.ts`)
   - Replace the stub with real JWT/session verification.
   - Extract token from `Authorization` header or cookie; verify; attach `req.user` (e.g. `{ id: string, ... }`).
   - Return 401 for missing or invalid tokens.

2. **Protect appointment PATCH (hold)**  
   - Apply `requireAuth` to the appointment PATCH route (or the subset of routes that allow `status: 'held'`) so that only authenticated users can hold slots.

3. **Set `held_by` from authenticated user** (`server/src/routes/internal/appointments/appointmentCrudRouter.ts`)
   - In `sanitizeInput`, when `status === 'held'`, set `appointmentFields.heldBy = req.user.id` (or equivalent from request context populated by `requireAuth`) instead of `null`.
   - Ensure `req` is available in the sanitizeInput pipeline (it is set by `beforeUpdate`; sanitizeInput receives body—if needed, pass user id via a request-scoped value set by middleware).

4. **Client "Hold Slot" button**
   - Remove the `disabled` state and "Hold requires authentication (Feature 7)" tooltip from the Hold Slot button in the booking wizard.
   - Wire the button to call `holdSlot(id)` (or equivalent) when the user is authenticated.

5. **Documentation**
   - Update `server/docs/SECURITY_STUBS.md` when stubs are replaced (mark requireAuth and held-status as enacted).

**Reference:** `server/docs/SECURITY_STUBS.md` — stub behavior and mapping table.

### Override Constraints (Session 6.2.2)

6. **requireRole middleware** (`server/src/middlewares/security.ts`)
   - Replace the stub with real role verification against `req.user.role`.
   - Return 403 if user lacks the required role.

7. **Protect appointment PATCH (override)**
   - Apply `requireRole('admin')` to the appointment PATCH route (or the subset that handles `overrideConstraints`) so only admins can set constraint overrides.

8. **Client "Override Constraints" button**
   - Remove the `disabled` state and "Override requires admin authentication (Feature 7)" tooltip from the Override button in the admin appointments table.
   - Wire the button to call `applyOverrideConstraints(id, constraints)` when the user has admin role.

9. **Phase 6.8 integration**
   - Phase 6.8 (Admin Force-Create & Constraint Overrides) builds on this stub. The `override_constraints` JSONB column and `ALLOWED_OVERRIDE_CONSTRAINTS` constant provide the schema foundation. Phase 6.8 adds the constraint engine integration, per-constraint UI toggles, and reason tracking.

10. **Documentation**
    - Update `server/docs/SECURITY_STUBS.md` when stubs are replaced (mark requireRole and override-constraints as enacted).

---

## Related Documents

- Feature Guide: `.project-manager/features/appointment-workflow/feature-appointment-workflow-guide.md`
- Feature Log: `.project-manager/features/appointment-workflow/feature-appointment-workflow-log.md`
- Phase 6.3 Guide: `.project-manager/features/appointment-workflow/phases/phase-6.3-guide.md`
- Phase 6.4 Guide: `.project-manager/features/appointment-workflow/phases/phase-6.4-guide.md`
- Phase 6.5 Guide: `.project-manager/features/appointment-workflow/phases/phase-6.5-guide.md` (Rescheduling flow, availability bypass, original-inspection UI)
- Session 6.4.1 Guide: `.project-manager/features/appointment-workflow/sessions/session-6.4.1-guide.md`
- Session 6.4.3 Guide: `.project-manager/features/appointment-workflow/sessions/session-6.4.3-guide.md`
- Session 6.4.3 Handoff: `.project-manager/features/appointment-workflow/sessions/session-6.4.3-handoff.md`
- Phase 6.10 Guide: `.project-manager/features/appointment-workflow/phases/phase-6.10-guide.md`
- Session 6.10.1 Guide: `.project-manager/features/appointment-workflow/sessions/session-6.10.1-guide.md`
- Session 6.10.2 Guide: `.project-manager/features/appointment-workflow/sessions/session-6.10.2-guide.md`
- Phase 6.11 Guide: `.project-manager/features/appointment-workflow/phases/phase-6.11-guide.md` (Drive Time Fee Line Item)
- Session 6.11.1 Guide: `.project-manager/features/appointment-workflow/sessions/session-6.11.1-guide.md`
- Notification Architecture: `server/docs/NOTIFICATION_ARCHITECTURE.md`
- Security Stubs: `server/docs/SECURITY_STUBS.md`
- Appointment Constants: `server/src/routes/internal/appointments/appointmentConstants.ts`

<!-- harness-across-ladder:start -->
## Across ladder (harness)

_Auto-updated from disk guides. Agents: prefer `across-ladder.json` for checks._

- **Feature:** `appointment-workflow` · **Status:** Complete (feature-end **2026-04-02**)
- **Source (manifest):** phase_end · **Derived:** 2026-04-02T01:29:29.637Z
- **Phases on disk (17):** 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11, 6.12, 6.13, 6.14, 6.15, 6.16, 6.17, 6.18
- **Focus phase:** _n/a_ (feature closed) · **Next phase across:** _n/a_
- **Manifest:** `.project-manager/features/appointment-workflow/across-ladder.json`
<!-- harness-across-ladder:end -->

<!-- end excerpt feature -->