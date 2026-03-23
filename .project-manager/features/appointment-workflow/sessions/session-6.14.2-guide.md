# Session 6.14.2 Guide: Resolver breadth, validation parity, and org-default UX

**Purpose:** Session-level guide for closing Phase 6.14 gaps documented after 6.14.1.

**Tier:** Session (Tier 2 - Medium-Level)

---

## Quick Start

**Session ID:** 6.14.2  
**Session Name:** Resolver breadth, validation parity, and org-default UX  
**Description:** Wire `resolveOrganizationNumericPolicy` (or equivalent merge-at-read) across remaining booking and server validation paths; optional client alignment; “using org default” admin affordances. Full scope: `sessions/session-6.14.2-planning.md`.

**Depends on:** Session 6.14.1 complete (types, persistence, admin surface, computed-availability merge).

### Tasks

- [x] #### Task 6.14.2.1: Audit + server wiring and validation parity

**Goal:** Inventory remaining server routes and handlers that read numeric policy; wire `resolveNumericPolicyForAvailabilityAndCalendar` (or equivalent) so validation matches computed availability; document any intentional exceptions in phase handoff.

**Files:** `server/src/services/organizationNumericPolicyService.ts`, `server/src/services/computedAvailabilityService.ts`, `server/src/routes/internal/` (appointment and availability routes), validation modules that enforce slot or timing policy.

**Approach:** Grep for raw availability/calendar numeric reads; align each with shared resolver inputs; add short comments where an exception is required.

**Checkpoint:** Server paths that enforce policy for booking use the same merge as computed availability, or exceptions are written in handoff.

- [x] #### Task 6.14.2.2: Client booking alignment + optional admin badges

**Goal:** Align client booking composables with the resolved policy contract (prefer API payloads that embed policy; if client resolves locally, use shared utils and one documented pattern). Add minimal “using org default” affordances on high-traffic admin fields where useful.

**Files:** `client/src/composables/booking/`, `client/src/views/admin/tabs/BusinessControlsTab.vue`, `BusinessControlsOrganizationSection.vue`, calendar/availability panels as needed.

**Approach:** Prefer server-resolved values; avoid duplicate merge logic unless documented.

**Checkpoint:** Wizard/admin behavior matches server policy; badges consistent where added.

- [x] - [x] #### Task 6.14.2.3: Docs, handoff, quality gate

**Goal:** Update phase handoff and session log; run client and server lint; verify app start; check phase success criteria or list explicit deferrals.

**Files:** `phases/phase-6.14-handoff.md`, `phases/phase-6.14-log.md`, `sessions/session-6.14.2-handoff.md`, `phases/phase-6.14-guide.md` success criteria.

**Approach:** Close the loop on documentation; no silent gaps.

**Checkpoint:** Lint passes; phase guide reflects delivered vs deferred honestly.

---

## Session Workflow

### Before starting

1. Confirm you are on branch `session-6.14.2` (created by `/accepted-proceed`).
2. Read `sessions/session-6.14.2-planning.md` and `sessions/session-6.14.1-planning.md` → *Outcome: delivered vs deferred*.
3. Work tasks **6.14.2.1** → **6.14.2.3** in order unless a dependency forces a swap (document in session handoff).

### During the session

1. One task at a time; checkpoint after each task.
2. No silent fallbacks: use `createLogger` in catch paths per project standards.
3. Testing: deferred to Phase 3.0 unless explicitly unblocked.

### After the session

1. `cd client && npm run lint` and `cd server && npm run lint`.
2. Verify app starts (`npm run start:dev` or project script).
3. `/session-end 6.14.2` when scope is complete; then `/phase-end 6.14` when phase success criteria are met.

---

## Related Documents

- **Planning (authoritative scope):** `sessions/session-6.14.2-planning.md`
- **Prior session outcome:** `sessions/session-6.14.1-planning.md` → section *Outcome: delivered vs deferred*
- **Phase:** `phases/phase-6.14-guide.md`
