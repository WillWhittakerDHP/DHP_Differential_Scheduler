# Phase 6.14 Guide: Organization Defaults & Resolved Numeric Policy

**Purpose:** Phase-level guide for a canonical **organization defaults** object merged at read time with availability/calendar (and future override) payloads so numeric policy (increments, fees, holds, baselines) has one source of truth and explicit resolution.

**Tier:** Phase (Tier 1 - High-Level)

---

## Overview

**Phase Number:** 6.14  
**Phase Name:** Organization Defaults & Resolved Numeric Policy  
**Description:** Introduce organization-level defaults (option 3: defaults + optional overrides / merge at read) for admin-controlled numeric fields currently spread across Business Controls. Defaults define “what we use when nothing more specific is set”; overrides store only explicit values or deltas where they differ.

**Duration:** Starts with session 6.14.1  
**Status:** Not Started

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

- [ ] ### Session 6.14.1: Organization defaults & resolved numeric policy (availability + calendar)
**Description:** Canonical defaults object + merge at read for numeric policy (minuteIncrement, durationRounding, driveTimeFee, holds, adminEntryTimeout, lead time, buffers, capacity baselines). Deliverables: shared `OrganizationDefaults` types, resolver, persistence strategy, admin tab, wiring. Full scope: `sessions/session-6.14.1-planning.md`.
**Tasks:** Types; merge/resolve; persistence; admin UI; wire booking read paths (or documented follow-up).
**Focus:**
- Single resolver for client + server; no silent fallbacks; align with `BusinessControlsTab.vue` save split.

---

## Dependencies

**Prerequisites:** None blocking. Relates to existing `AvailabilitySettings`, `CalendarConfig`, and Business Controls save paths.

---

## Success Criteria

- [ ] Types and resolver in shared (or agreed) layer; booking reads resolved values
- [ ] Admin can edit organization defaults in one dedicated surface
- [ ] Persistence strategy documented and implemented or stubbed with follow-up
- [ ] Client lint and app start pass; resolver tests per Phase 3.0 policy

---

## Related Documents

- `sessions/session-6.14.1-planning.md`
- `feature-appointment-workflow-guide.md` (Phase 6.14)
- `client/src/views/admin/tabs/BusinessControlsTab.vue`, `client/src/configs/availabilitySettings/types.ts`, `shared/types/calendarTypes.ts`, `shared/types/availabilityTypes.ts`
