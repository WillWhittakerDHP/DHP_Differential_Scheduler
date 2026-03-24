<!-- harness-planning-rollup tier=phase id=6.14 consolidatedAt=2026-03-24T22:28:25.484Z -->

# Consolidated planning: phase 6.14

## Phase 6.14 (parent)

## Story

As an org admin, I have one canonical **organization defaults** object merged at read time with availability/calendar data so the wizard and server agree on increments, rounding, holds, and related numeric policy without hidden client-only defaults.

## Analysis

- **Domains:** Appointment workflow, booking numeric policy, admin Business Controls — shared types and resolver live at the **shared** / server / client boundary (see `.project-manager/ARCHITECTURE.md` in repo when present; phase guide lists concrete file paths).
- **Risks:** Client vs server drift if new call sites skip merge-at-read; silent Vue-only fallbacks; **automated resolver tests** remain deferred while `TEST_ENABLED=false` (Phase 3.0 checklist in `phase-6.14-guide.md`).
- **Patterns:** Single resolver family (`resolveOrganizationNumericPolicy`, `resolveNumericPolicyForAvailabilityAndCalendar`, booking helpers); `organization_defaults` JSONB + API; admin dedicated surface for defaults.
- **Re-open context:** Starting phase **6.14** again does not imply incomplete delivery — use this doc to confirm closure, run **`/phase-end 6.14`** if needed, or record a **change request** before adding new sessions.

## Goal

Deliver a canonical **organization defaults** model merged at read time with availability/calendar payloads so numeric policy (minute increments, duration rounding, drive-time fee, holds, admin entry timeout, lead time, buffers, optional constraint baselines) has one source of truth and explicit resolution on client and server—no silent Vue-only fallbacks. Admin can edit defaults in a dedicated surface; persistence strategy is documented and implemented (or stubbed with a tracked follow-up). Aligns with `BusinessControlsTab.vue` save split and existing `AvailabilitySettings` / `CalendarConfig` paths.

## Files

- `phases/phase-6.14-guide.md`, `sessions/session-6.14.1-planning.md`, `sessions/session-6.14.2-planning.md`, `sessions/session-6.14.3-planning.md` — scope and session detail
- `client/src/views/admin/tabs/BusinessControlsTab.vue` — current controls and save behavior
- `client/src/configs/availabilitySettings/types.ts`, `shared/types/calendarTypes.ts`, `shared/types/availabilityTypes.ts` — types to extend or integrate
- New or updated: shared types for `OrganizationDefaults` (or equivalent), resolver module(s) (`resolveBusinessNumericPolicy` / `resolve*`), admin tab or section for organization defaults
- Server: routes/models/migrations as needed for persistence (per session 6.14.1 plan)

## Approach

1. **Inventory** — Map each in-scope numeric field to default vs override; confirm merge rules (missing keys, zero vs unset, hold clamping) in session 6.14.1.
2. **Types** — Define nested `OrganizationDefaults` (time/rounding, drive-time fee, holds/admin entry, optional constraint baselines) in the agreed shared layer; keep JSON-serializable.
3. **Resolver** — Implement merge-at-read functions used by booking paths and server validation from a single module; wire call sites for slot grid, rounding, and drive-fee pipeline incrementally or document follow-ups.
4. **Persistence** — Choose new field vs `calendar_settings` / availability JSON; implement or stub with explicit follow-up ticket.
5. **Admin UI** — Add recommended top-level “Organization defaults” or “Policies” tab with sub-sections mirroring types; badge “using org default” where it helps.
6. **Quality** — Client lint and app start pass; automated tests for resolver follow project test policy (deferred until Phase 3.0 unless session plan explicitly adds harness-allowed work).

## Checkpoint

- Shared types and resolver exist; booking read paths use resolved values or a documented wiring follow-up
- Admin can edit organization defaults in the dedicated surface
- Persistence strategy is documented and implemented or stubbed with a clear follow-up
- No silent fallbacks in resolution; governance playbooks respected for touched code

## Deliverables

- Shared **`OrganizationDefaults`** (or equivalent) types and **merge-at-read resolver(s)** used on primary booking and server validation paths.
- **Persistence:** `organization_defaults` JSONB + API (per session 6.14.1 outcome).
- **Admin UI:** dedicated organization defaults / policies surface; optional legacy-panel affordances completed or documented in 6.14.3.
- **Documentation:** exhaustive audit table or written exceptions; Phase **3.0** resolver test checklist in phase guide (no new test files while testing suspended).
- **Quality:** client and server lint clean for touched code; app start verified per session closeouts.

---

## Session 6.14.1 (source: session-6.14.1-planning.md)

### Goal

Ship a canonical **organization defaults** model and **merge-at-read** resolver so numeric policy (minute grid, duration rounding, drive-time fee, holds, admin entry timeout, and optional constraint baselines) resolves in one place for client booking paths and server validation—no silent Vue-only fallbacks. Deliver shared types, resolver module(s), a documented persistence strategy (with implementation or explicit stub + follow-up), a dedicated admin surface for org defaults, and wiring to key read paths—or documented follow-ups where wiring is large.

### Files

- `shared/types/` — new or extended types for `OrganizationDefaults` (nested groups: time/rounding, drive-time fee, holds/admin entry, optional constraint baselines); JSON-serializable
- Resolver module (e.g. `shared/` or `client/src/utils/` + server mirror per project conventions) — `resolveBusinessNumericPolicy` or focused `resolve*` functions
- `client/src/views/admin/tabs/BusinessControlsTab.vue` — tab routing and save split alignment
- New admin components or tab for “Organization defaults” / “Policies” under business controls
- `client/src/configs/availabilitySettings/types.ts`, `shared/types/calendarTypes.ts`, `shared/types/availabilityTypes.ts` — integrate with existing shapes
- Server: models/routes/migrations as needed for chosen persistence (only when `DB_HOST` is localhost per project migration policy for this workspace)

### Approach

1. **Inventory** — Map fields in scope (from phase session doc) to default vs calendar override; document merge rules (missing keys, zero vs unset, hold clamping).
2. **Types** — Define `OrganizationDefaults` and inputs for merge (defaults + calendar/availability slice).
3. **Resolver** — Implement pure merge/resolve functions; single source for slot grid, rounding, drive fee reads; add logging for invalid combinations per coding standards (no silent swallow).
4. **Persistence** — Choose storage (new column, JSON blob, or existing `calendar_settings`); implement or stub with explicit follow-up ticket in session log.
5. **Admin UI** — Add tab/section with sub-groups mirroring types; load/save through existing API patterns; optional “using org default” badges on legacy panels as time allows.
6. **Wiring** — Connect resolver at highest-value read sites (e.g. minute increment, drive fee) or list follow-up tasks in handoff.
7. **Quality** — `cd client && npm run lint`; app starts; automated tests deferred to Phase 3.0 unless explicitly unblocked.

### Checkpoint

- Types and resolver exist and are used by at least one booking read path **or** a written follow-up lists remaining call sites
- Admin can view/edit organization defaults in the new surface (or stub documented with blocker)
- Persistence strategy is documented; DB changes only when local migration policy allows
- No silent fallbacks; client lint passes; app starts

---

## Session 6.14.2 (source: session-6.14.2-planning.md)

### Goal

1. **Resolver wiring** — Ensure every **production read path** that derives booking numeric policy from availability + calendar uses the same merge as the computed-availability pipeline **or** document a narrow exception with rationale (e.g. read-only preview that must match saved appointment snapshot).
2. **Server validation** — Where server validates slot/step inputs against admin policy, call the same resolver inputs (org defaults + overrides) so validation matches computed slots.
3. **Client (optional but preferred)** — Either rely on API responses that already embed resolved policy, or invoke shared resolver on the client after fetching org defaults + overrides when local UI must show policy without a round-trip (document the chosen pattern in phase handoff).
4. **Admin UX** — “Using organization default” (or equivalent) **badges or links** on Calendar / Availability / related panels where a field is merged from org defaults vs explicit override (phase guide: “where useful”).
5. **Quality** — Client lint + app start; resolver unit tests remain Phase 3.0 unless explicitly unblocked.

### Files

- **Shared:** `shared/utils/resolveOrganizationNumericPolicy.ts`, `shared/utils/calendarNumericOverridesFromSettings.ts`, `shared/types/organizationDefaults.ts`
- **Server:** `server/src/services/computedAvailabilityService.ts`, `server/src/services/organizationNumericPolicyService.ts`; grep for availability/calendar numeric reads in `server/src/routes/internal/` and appointment validation
- **Client booking:** composables under `client/src/composables/booking/` that read minute increment, rounding, drive fee, holds — align with resolved policy contract
- **Admin:** `client/src/views/admin/tabs/BusinessControlsTab.vue`, `BusinessControlsOrganizationSection.vue`, calendar/availability field components as needed for badges

### Approach

1. **Inventory (audit)** — List call sites that still use raw `AvailabilitySettings` / `CalendarConfig` numbers without `resolveOrganizationNumericPolicy`; prioritize booking and fee paths.
2. **Wire or document** — For each site: wire resolver, or add a short “exception” note in code + phase handoff if intentionally different.
3. **Validation** — Align appointment/slot validation handlers with merged policy.
4. **Badges** — Add minimal badge/helper text for org-default vs override on high-traffic admin fields (increment, rounding, drive fee, holds) without duplicating Business Controls layout.
5. **Lint / smoke** — `cd client && npm run lint`; app start; update `phase-6.14-handoff.md` when phase complete.

### Checkpoint

- Phase 6.14 **Success Criteria** in `phases/phase-6.14-guide.md` can be checked with no “partial” footnotes, or remaining exceptions are explicitly listed in handoff.
- No silent fallback: invalid combinations still log or surface per project standards.

---

## Session 6.14.3 (source: session-6.14.3-planning.md)

### Goal

1. **Exhaustive audit** — Grep and review remaining `server/src/` and `client/src/` call sites that derive booking-related numeric policy from availability/calendar/org; **wire** the shared resolver where product-critical, or **document** narrow exceptions with rationale in `phases/phase-6.14-handoff.md`.
2. **Optional admin UX** — Add “using organization default” (or equivalent) badges or helper text on **legacy** Calendar / Availability admin panels where fields are merged from org defaults vs explicit overrides — only where it reduces confusion without duplicating Business Controls layout.
3. **Tests (policy)** — Do **not** add or modify test files while `TEST_ENABLED=false` / Phase 3.0 gate unless explicitly unblocked; **document** the resolver edge-case checklist and Phase 3.0 follow-up in phase guide or handoff.
4. **Quality** — Client + server lint; app start; update phase/session handoffs and success criteria.

### Files

- **Shared:** `shared/utils/resolveOrganizationNumericPolicy.ts`, `shared/utils/calendarNumericOverridesFromSettings.ts`, `shared/types/organizationDefaults.ts`
- **Server:** `server/src/services/organizationNumericPolicyService.ts`, `server/src/routes/internal/` (grep targets)
- **Client booking / admin:** `client/src/composables/booking/`, `client/src/views/admin/` (Calendar, Availability, Business Controls–related panels)
- **Docs:** `phases/phase-6.14-guide.md`, `phases/phase-6.14-handoff.md`, `sessions/session-6.14.3-guide.md`

### Approach

1. **Inventory** — Run structured greps (resolver symbols, raw `AvailabilitySettings` / `CalendarConfig` numeric fields); produce a short table: site → action (wire / exempt + reason).
2. **Wire or document** — Implement wiring for any gap that could diverge wizard vs server; otherwise add code comment + handoff bullet.
3. **Badges** — Reuse patterns from `BusinessControlsOrganizationSection` / org-defaults tab; keep chips minimal and accessible.
4. **Tests** — Record Phase 3.0 checklist only (missing keys, zero vs unset, hold clamping); no new test files unless policy changes.
5. **Closeout** — Lint, app start, update phase success criteria checkboxes.

### Checkpoint

- Phase 6.14 guide rows for **optional badges** and **resolver test policy** reflect delivered work or honest deferral.
- No silent fallbacks; exceptions are written, not implied.

---
