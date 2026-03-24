# Phase 6.14 Guide: Organization Defaults & Resolved Numeric Policy

**Purpose:** Phase-level guide for a canonical **organization defaults** object merged at read time with availability/calendar (and future override) payloads so numeric policy (increments, fees, holds, baselines) has one source of truth and explicit resolution.

**Tier:** Phase (Tier 1 - High-Level)

---

## Overview

**Phase Number:** 6.14  
**Phase Name:** Organization Defaults & Resolved Numeric Policy  
**Description:** Introduce organization-level defaults (option 3: defaults + optional overrides / merge at read) for admin-controlled numeric fields currently spread across Business Controls. Defaults define “what we use when nothing more specific is set”; overrides store only explicit values or deltas where they differ.

**Duration:** 3 sessions (6.14.1 foundation, 6.14.2 primary wiring, 6.14.3 deferred polish / audit) — see `phases/phase-6.14-planning.md` *Planning decomposition note*.  
**Status:** Session **6.14.3** complete (docs + lint gate in task **6.14.3.3**); run **`/phase-end 6.14`** in the harness when ready to close the phase.

---

## Planning decomposition note

Early phase artifacts listed only **one session** while the phase objectives implicitly required **foundation + follow-up integration** (full resolver wiring, validation parity, optional admin badges). Session **6.14.1** delivered types, resolver, persistence, admin surface, and merge-at-read on the **computed availability** server path. Session **6.14.2** aligned **primary** booking and validation paths. Session **6.14.3** holds explicitly deferred work: **exhaustive** grep audit (wire or document), optional legacy-panel “org default” affordances, and **Phase 3.0** resolver test follow-up (documented only unless test policy is unblocked). See `sessions/session-6.14.3-planning.md`.

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

- [x] ### Session 6.14.2: Resolver breadth, validation parity, and org-default UX
**Description:** Close **primary** gaps from 6.14.1 — wire resolver across main booking/server read and validation paths (or document exceptions); client rounding alignment; docs + lint gate. Exhaustive audit and optional legacy badges deferred to **6.14.3** where listed in handoff.
**Tasks:** Audit call sites; server + client alignment as needed; handoff updates.
**Focus:** Parity between what the wizard sees and what the server enforces on primary paths.
**Full scope:** `sessions/session-6.14.2-planning.md`, `sessions/session-6.14.2-guide.md`.

- [x] ### Session 6.14.3: Org-default UX polish, resolver audit, and test policy alignment
**Description:** Deferred from 6.14.2 closeout — exhaustive grep audit (wire or document exceptions); optional “using org default” badges on legacy Calendar/Availability panels; Phase 3.0 resolver test checklist in docs (no new test files unless policy unblocked).
**Tasks:** Full audit table; optional badges; docs + lint; update phase success criteria.
**Focus:** No silent gaps; honest phase close.
**Full scope:** `sessions/session-6.14.3-planning.md`, `sessions/session-6.14.3-guide.md`.

---

## Dependencies

**Prerequisites:** None blocking. Relates to existing `AvailabilitySettings`, `CalendarConfig`, and Business Controls save paths.

---

## Success Criteria

- [x] Types and resolver in shared (or agreed) layer — **6.14.1**
- [x] **Resolved numeric policy** used (or explicitly exempted in writing) for **primary** production booking + validation paths — **6.14.2** (see `phases/phase-6.14-handoff.md` → *Session 6.14.2 closeout*)
- [x] **Exhaustive** resolver coverage (or written exception list) for remaining numeric policy reads — **6.14.3.1** (audit table: `phases/phase-6.14-handoff.md` → *Session 6.14.3.1*)
- [x] Admin can edit organization defaults in one dedicated surface — **6.14.1**
- [x] Persistence strategy documented and implemented (`organization_defaults` JSONB + API) — **6.14.1**
- [x] Optional: “using org default” affordances on relevant legacy admin panels — **6.14.3.2** (Grid slot increment + Constraints duration rounding chips; drive-time fee row deferred — see `phases/phase-6.14-handoff.md` → *Session 6.14.3.2*)
- [x] Client and server lint pass for session **6.14.3** closeout — **6.14.3.3** (re-verify; `npm run start:dev` acceptable when already running)
- [ ] **Automated** resolver tests — **not implemented** while `TEST_ENABLED=false` / Phase 3.0 gate; checklist documented below (Phase 3.0)

---

## Phase 3.0 — Resolver tests (checklist)

*Canonical list for when automated testing is enabled (see `LAUNCH_CHECKLIST.md` Phase 3.0). No test files added in 6.14.3.*

- **Org baseline:** Merge when `organization_defaults` row missing vs present; default JSON shape vs partial PATCH.
- **Overrides:** Numeric `0` vs unset leaf (drive fee, increments) — merged snapshot matches resolver contract.
- **Holds / admin entry:** `resolveNumericPolicyForAvailabilityAndCalendar` clamps hold duration to min/max/fallback; admin entry timeout units.
- **Calendar partial overrides:** `CalendarNumericOverrides` — only some leaves set; remainder from org.
- **Client confirmation:** `useConfirmationStepData` — `driveTimeFee` from `resolveBookingNumericPolicyFromLoadedData` vs raw availability fallback on failure.
- **Admin chips:** `orgDefaultPolicyBadges` comparisons align with org `timeAndRounding` (including duration rounding increment fallback to org minute increment).

*See also:* `phases/phase-6.14-handoff.md` (sessions 6.14.3.1–6.14.3.2).

---

## Related Documents

- `phases/phase-6.14-planning.md` (phase contract + decomposition table)
- `phases/phase-6.14-handoff.md` (phase complete; next: **6.17** or across-ladder **6.15**)
- `sessions/session-6.14.1-planning.md` (includes **Outcome: delivered vs deferred**)
- `sessions/session-6.14.2-planning.md`, `sessions/session-6.14.2-guide.md`
- `sessions/session-6.14.3-planning.md`, `sessions/session-6.14.3-guide.md`
- `feature-appointment-workflow-guide.md` (Phase 6.14)
- `client/src/views/admin/tabs/BusinessControlsTab.vue`, `client/src/configs/availabilitySettings/types.ts`, `shared/types/calendarTypes.ts`, `shared/types/availabilityTypes.ts`

<!-- end excerpt phase -->