# Plan: phase 6.14 — Organization Defaults & Resolved Numeric Policy

## Contract
- **Tier:** phase | **ID:** 6.14
- **Scope:** Organization Defaults & Resolved Numeric Policy
- **Governance:** 2 governance highlights — read reports before filling slots

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** architectural
- **Governance domains:** docs
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** light
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off

Phase **6.14** sessions **6.14.1–6.14.3** are complete (see `phases/phase-6.14-handoff.md`). This planning doc was refreshed on **`/phase-start 6.14`** (2026-03-24) for harness **Gate 1**; no new session decomposition is required unless scope changes or a reopening session is explicitly added.

## Analysis

- **Domains:** Appointment workflow, booking numeric policy, admin Business Controls — shared types and resolver live at the **shared** / server / client boundary (see `.project-manager/ARCHITECTURE.md` in repo when present; phase guide lists concrete file paths).
- **Risks:** Client vs server drift if new call sites skip merge-at-read; silent Vue-only fallbacks; **automated resolver tests** remain deferred while `TEST_ENABLED=false` (Phase 3.0 checklist in `phase-6.14-guide.md`).
- **Patterns:** Single resolver family (`resolveOrganizationNumericPolicy`, `resolveNumericPolicyForAvailabilityAndCalendar`, booking helpers); `organization_defaults` JSONB + API; admin dedicated surface for defaults.
- **Re-open context:** Starting phase **6.14** again does not imply incomplete delivery — use this doc to confirm closure, run **`/phase-end 6.14`** if needed, or record a **change request** before adding new sessions.

## Story / epic

As an org admin, I have one canonical **organization defaults** object merged at read time with availability/calendar data so the wizard and server agree on increments, rounding, holds, and related numeric policy without hidden client-only defaults.

## Planning decomposition note

Phase **6.14** is split into **three sessions**:

| Session | Role |
|--------|------|
| **6.14.1** | Foundation: types, `resolveOrganizationNumericPolicy`, persistence, admin UI, merge-at-read on **computed availability** (server). |
| **6.14.2** | Integration: **primary** resolver wiring + server validation parity + client alignment; docs + lint gate. |
| **6.14.3** | Follow-up: exhaustive **grep audit** (wire or document), optional legacy **org-default** badges, **Phase 3.0** resolver test checklist in docs (no new tests unless policy unblocked). |

Some artifacts previously implied a **single** session for the whole phase; that understated follow-up work. See `sessions/session-6.14.1-planning.md` (*Outcome*), `sessions/session-6.14.2-planning.md`, and `sessions/session-6.14.3-planning.md`.

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

## Acceptance criteria

- [x] Types and resolver in agreed shared/client/server layers (**6.14.1**)
- [x] Resolved numeric policy on **primary** production booking + validation paths, or explicit written exemptions (**6.14.2**)
- [x] Exhaustive resolver coverage audit or exception list (**6.14.3.1**)
- [x] Admin can edit organization defaults in one dedicated surface (**6.14.1**)
- [x] Persistence strategy implemented (`organization_defaults` + API) (**6.14.1**)
- [x] Optional “using org default” affordances where scoped (**6.14.3.2**)
- [x] Lint / app start gate for session **6.14.3** closeout (**6.14.3.3**)
- [ ] **Automated** resolver tests — deferred to Phase **3.0** (documented checklist only)

## Decomposition

| Unit | Scope | Status |
|------|--------|--------|
| **Session 6.14.1** | Foundation: types, resolver, persistence, admin UI, merge-at-read on computed availability (server) | Complete |
| **Session 6.14.2** | Primary wiring, validation parity, client alignment, docs + lint | Complete |
| **Session 6.14.3** | Grep audit (wire or document), optional legacy badges, Phase 3.0 test policy alignment in docs | Complete |

**How we build the tierDown (historical):** Run **`/session-start 6.14.N`** in order for net-new work; for this phase as delivered, sessions are closed — use **`/phase-end 6.14`** when formal phase closure is pending.

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/feature-appointment-workflow-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/phases/phase-6.14-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
