# Phase 6.14 Guide: Organization Defaults & Resolved Numeric Policy

**Purpose:** Phase-level guide for a canonical **organization defaults** object merged at read time with availability/calendar (and future override) payloads so numeric policy (increments, fees, holds, baselines) has one source of truth and explicit resolution.

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Overview

**Phase Number:** 6.14  
**Phase Name:** Organization Defaults & Resolved Numeric Policy  
**Description:** Introduce organization-level defaults (option 3: defaults + optional overrides / merge at read) for admin-controlled numeric fields currently spread across Business Controls. Defaults define “what we use when nothing more specific is set”; overrides store only explicit values or deltas where they differ.

**Duration:** Starts with session 6.14.1  
**Status:** Not Started

---

## Phase Objectives

- Define shared types for organization defaults (nested groups: time/rounding, drive-time fee, holds/admin entry, optional constraint baselines).
- Implement merge/resolve functions used by client booking paths and server validation (single place, not Vue-only fallbacks).
- Document persistence (new field vs existing `calendar_settings` / availability JSON) aligned with `BusinessControlsTab.vue` save split.
- Add admin UI (recommended: top-level “Organization defaults” or “Policies” tab) with sub-sections mirroring types.
- Add tests for resolver edge cases (missing keys, zero vs unset, hold clamping).

---

## Tasks

- Inventory and map every field in scope to default vs override (see session 6.14.1 planning).
- Specify `OrganizationDefaults` shape in `shared/types/` and migration/API if needed.
- Implement `resolve*` (or single `resolveBusinessNumericPolicy`) and wire call sites for slot grid, rounding, drive fee pipeline.
- Build admin panel + save/load; link or badge “using org default” on existing panels where useful.
- Unit tests + lint; update handoff/session log per workflow.

---

## Sessions Breakdown

- [ ] ### Session 6.14.1: Organization defaults & resolved numeric policy (availability + calendar)

**Description:** Full scope, deliverables, and success criteria in `sessions/session-6.14.1-planning.md`.

**See:** `sessions/session-6.14.1-planning.md` (verbose planning context)

---

## Dependencies

**Prerequisites:** None blocking. Relates to existing `AvailabilitySettings`, `CalendarConfig`, and Business Controls save paths.

---

## Success Criteria

- [ ] Types and resolver in shared (or agreed) layer; booking reads resolved values
- [ ] Admin can edit organization defaults in one dedicated surface
- [ ] Persistence strategy documented and implemented or stubbed with follow-up
- [ ] Tests for merge/resolver; client lint and app start pass

---

## Related Documents

- `sessions/session-6.14.1-planning.md`
- `feature-appointment-workflow-guide.md` (Phase 6.14)
- `client/src/views/admin/tabs/BusinessControlsTab.vue`, `client/src/configs/availabilitySettings/types.ts`, `shared/types/calendarTypes.ts`, `shared/types/availabilityTypes.ts`
