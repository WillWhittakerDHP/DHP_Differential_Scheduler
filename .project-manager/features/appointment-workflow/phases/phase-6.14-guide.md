# Phase 6.14 Guide: Organization Defaults & Resolved Numeric Policy

**Purpose:** Phase-level guide for a canonical **organization defaults** object merged at read time with availability/calendar (and future override) payloads so numeric policy (increments, fees, holds, baselines) has one source of truth and explicit resolution.

**Tier:** Phase (Tier 1 - High-Level)

---

## Overview

**Phase Number:** 6.14  
**Phase Name:** Organization Defaults & Resolved Numeric Policy  
**Description:** Introduce organization-level defaults (option 3: defaults + optional overrides / merge at read) for admin-controlled numeric fields currently spread across Business Controls. Defaults define “what we use when nothing more specific is set”; overrides store only explicit values or deltas where they differ.

**Duration:** 2 sessions (6.14.1 foundation, 6.14.2 integration gaps) — see `phases/phase-6.14-planning.md` *Planning decomposition note*.  
**Status:** In Progress (6.14.1 complete; 6.14.2 not started)

---

## Planning decomposition note

Early phase artifacts listed only **one session** while the phase objectives implicitly required **foundation + follow-up integration** (full resolver wiring, validation parity, optional admin badges). Session **6.14.1** delivered types, resolver, persistence, admin surface, and merge-at-read on the **computed availability** server path. Session **6.14.2** tracks the remaining scope explicitly (`sessions/session-6.14.2-planning.md`). This restores alignment between planning docs and actual work.

---

## Objectives

- Define shared types for organization defaults (nested groups: time/rounding, drive-time fee, holds/admin entry, optional constraint baselines).
- Implement merge/resolve functions used by client booking paths and server validation (single place, not Vue-only fallbacks).
- Document persistence (new field vs existing `calendar_settings` / availability JSON) aligned with `BusinessControlsTab.vue` save split.
- Add admin UI (recommended: top-level “Organization defaults” or “Policies” tab) with sub-sections mirroring types.
- Document or defer automated tests for resolver edge cases per project test policy (missing keys, zero vs unset, hold clamping).

---

## Tasks

- Inventory and map every field in scope to default vs override (see session 6.14.1 planning).
- Specify `OrganizationDefaults` shape in `shared/types/` and migration/API if needed.
- Implement `resolve*` (or single `resolveBusinessNumericPolicy`) and wire call sites for slot grid, rounding, drive fee pipeline.
- Build admin panel + save/load; link or badge “using org default” on existing panels where useful.
- Client lint + app start; update handoff/session log per workflow.

### Sessions Breakdown

- [x] ### Session 6.14.1: Organization defaults & resolved numeric policy (availability + calendar) — **foundation**
**Description:** Canonical defaults object + merge at read for numeric policy (minuteIncrement, durationRounding, driveTimeFee, holds, adminEntryTimeout, lead time, buffers, capacity baselines). Deliverables: shared `OrganizationDefaults` types, resolver, persistence, admin surface, merge-at-read on computed availability server path. Deferred items: `sessions/session-6.14.1-planning.md` → *Outcome*.
**Tasks:** Types; merge/resolve; persistence; admin UI; initial server wiring + documented deferrals.
**Focus:** Single resolver module; no silent fallbacks; align with `BusinessControlsTab.vue` save split.

- [ ] ### Session 6.14.2: Resolver breadth, validation parity, and org-default UX
**Description:** Close gaps from 6.14.1 — wire resolver across remaining booking/server read and validation paths (or document exceptions); optional “using org default” badges on Calendar/Availability panels; finalize phase success criteria.
**Tasks:** Audit call sites; server + client alignment as needed; admin badges; handoff updates.
**Focus:** Parity between what the wizard sees and what the server enforces.
**Full scope:** `sessions/session-6.14.2-planning.md`, `sessions/session-6.14.2-guide.md`.

---

## Dependencies

**Prerequisites:** None blocking. Relates to existing `AvailabilitySettings`, `CalendarConfig`, and Business Controls save paths.

---

## Success Criteria

- [x] Types and resolver in shared (or agreed) layer — **6.14.1**
- [ ] **Resolved numeric policy** used (or explicitly exempted in writing) for all production booking + validation paths that derive policy from org + calendar + availability — **target 6.14.2**
- [x] Admin can edit organization defaults in one dedicated surface — **6.14.1**
- [x] Persistence strategy documented and implemented (`organization_defaults` JSONB + API) — **6.14.1**
- [ ] Optional: “using org default” affordances on relevant legacy admin panels — **6.14.2** (where useful)
- [ ] Client lint and app start pass at phase close — **verify at 6.14.2 end** (6.14.1 already met this bar for touched code)
- [ ] Resolver automated tests — Phase 3.0 policy (not a gate for 6.14.2 unless unblocked)

---

## Related Documents

- `phases/phase-6.14-planning.md` (phase contract + decomposition table)
- `phases/phase-6.14-handoff.md` (current transition / next: 6.14.2)
- `sessions/session-6.14.1-planning.md` (includes **Outcome: delivered vs deferred**)
- `sessions/session-6.14.2-planning.md`, `sessions/session-6.14.2-guide.md`
- `feature-appointment-workflow-guide.md` (Phase 6.14)
- `client/src/views/admin/tabs/BusinessControlsTab.vue`, `client/src/configs/availabilitySettings/types.ts`, `shared/types/calendarTypes.ts`, `shared/types/availabilityTypes.ts`
