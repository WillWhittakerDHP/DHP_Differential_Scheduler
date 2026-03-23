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

- [ ] #### Task 6.14.2.1: Audit + server wiring and validation parity
**Goal:** Inventory remaining server routes/handlers that read numeric policy; wire `resolveNumericPolicyForAvailabilityAndCalendar` (or equivalent) so validation matches computed availability; document any intentional exceptions.
**Files:** `server/src/services/organizationNumericPolicyService.ts`, `server/src/services/computedAvailabilityService.ts`, grep targets under `server/src/routes/internal/`, appointment validation modules.
**Approach:** Grep for raw availability/calendar numeric reads; align each with shared resolver inputs; add short comments where an exception is required.
**Checkpoint:** Server paths that enforce policy for booking use the same merge as computed availability, or exceptions are written in handoff.

- [ ] #### Task 6.14.2.2: Client booking alignment + optional admin badges
**Goal:** Align client booking composables with resolved policy contract (from API or shared resolver after fetch); add minimal “using org default” affordances on high-traffic admin fields where useful.
**Files:** `client/src/composables/booking/` (call sites), `BusinessControlsTab.vue`, `BusinessControlsOrganizationSection.vue`, related calendar/availability panels.
**Approach:** Prefer consuming server-resolved payloads; if client must resolve locally, use shared utils and one documented pattern.
**Checkpoint:** Wizard/admin behavior matches server policy; badges optional but consistent where added.

- [ ] #### Task 6.14.2.3: Docs, handoff, quality gate
**Goal:** Update `phase-6.14-handoff.md`, `phase-6.14-log.md` as appropriate; run client + server lint; verify app start.
**Files:** `.project-manager/features/appointment-workflow/phases/phase-6.14-handoff.md`, session handoff, phase guide success criteria checkboxes.
**Approach:** Close phase 6.14 success criteria or list explicit deferrals; no silent gaps.
**Checkpoint:** Lint passes; phase guide reflects delivered vs deferred honestly.

---

## Related Documents

- **Planning (authoritative scope):** `sessions/session-6.14.2-planning.md`
- **Prior session outcome:** `sessions/session-6.14.1-planning.md` → section *Outcome: delivered vs deferred*
- **Phase:** `phases/phase-6.14-guide.md`
