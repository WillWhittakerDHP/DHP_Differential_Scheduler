# Plan: session 6.14.3 — Org-default UX polish, resolver audit, and test policy alignment

## Contract
- **Tier:** session | **ID:** 6.14.3
- **Scope:** Deferred Phase 6.14 items from session 6.14.2 closeout — optional legacy admin affordances, exhaustive resolver wiring audit, and documented alignment with Phase 3.0 resolver tests (no new test files unless project test policy is explicitly unblocked)
- **Governance:** Same as 6.14.1–6.14.2 — type/composable/function playbooks for touched code

## Work Profile
- **Execution intent:** implement (docs-heavy where tests are deferred)
- **Action type:** integration + polish
- **Scope shape:** cross_cutting
- **Governance domains:** client, server, shared types, docs
- **Planning artifact action:** create
- **Decomposition mode:** moderate

## Where we left off
Session **6.14.2** aligned primary booking and validation paths with merged numeric policy; optional Calendar/Availability “using org default” badges, an **exhaustive** grep of every remaining numeric read, and **resolver unit tests** were explicitly deferred (see `phases/phase-6.14-handoff.md` → *Session 6.14.2 closeout*).

## Goal
1. **Exhaustive audit** — Grep and review remaining `server/src/` and `client/src/` call sites that derive booking-related numeric policy from availability/calendar/org; **wire** the shared resolver where product-critical, or **document** narrow exceptions with rationale in `phases/phase-6.14-handoff.md`.
2. **Optional admin UX** — Add “using organization default” (or equivalent) badges or helper text on **legacy** Calendar / Availability admin panels where fields are merged from org defaults vs explicit overrides — only where it reduces confusion without duplicating Business Controls layout.
3. **Tests (policy)** — Do **not** add or modify test files while `TEST_ENABLED=false` / Phase 3.0 gate unless explicitly unblocked; **document** the resolver edge-case checklist and Phase 3.0 follow-up in phase guide or handoff.
4. **Quality** — Client + server lint; app start; update phase/session handoffs and success criteria.

## Files (starting points — refine during session)
- **Shared:** `shared/utils/resolveOrganizationNumericPolicy.ts`, `shared/utils/calendarNumericOverridesFromSettings.ts`, `shared/types/organizationDefaults.ts`
- **Server:** `server/src/services/organizationNumericPolicyService.ts`, `server/src/routes/internal/` (grep targets)
- **Client booking / admin:** `client/src/composables/booking/`, `client/src/views/admin/` (Calendar, Availability, Business Controls–related panels)
- **Docs:** `phases/phase-6.14-guide.md`, `phases/phase-6.14-handoff.md`, `sessions/session-6.14.3-guide.md`

## Approach
1. **Inventory** — Run structured greps (resolver symbols, raw `AvailabilitySettings` / `CalendarConfig` numeric fields); produce a short table: site → action (wire / exempt + reason).
2. **Wire or document** — Implement wiring for any gap that could diverge wizard vs server; otherwise add code comment + handoff bullet.
3. **Badges** — Reuse patterns from `BusinessControlsOrganizationSection` / org-defaults tab; keep chips minimal and accessible.
4. **Tests** — Record Phase 3.0 checklist only (missing keys, zero vs unset, hold clamping); no new test files unless policy changes.
5. **Closeout** — Lint, app start, update phase success criteria checkboxes.

## Checkpoint
- Phase 6.14 guide rows for **optional badges** and **resolver test policy** reflect delivered work or honest deferral.
- No silent fallbacks; exceptions are written, not implied.

## How we build the tierDown
- **Task 6.14.3.1:** Exhaustive grep audit — wire resolver or document exceptions in handoff
- **Task 6.14.3.2:** Optional “using org default” badges on legacy Calendar / Availability panels
- **Task 6.14.3.3:** Docs, Phase 3.0 resolver test checklist, client + server lint, app start

---
## Reference (read before execute — governance and inventory compliance is required)
- Phase guide: `.project-manager/features/appointment-workflow/phases/phase-6.14-guide.md`
- Phase handoff (6.14.2 closeout / deferrals): `.project-manager/features/appointment-workflow/phases/phase-6.14-handoff.md`
- Session 6.14.2 planning: `sessions/session-6.14.2-planning.md`
- Feature guide: `.project-manager/features/appointment-workflow/feature-appointment-workflow-guide.md`
- Governance reports: `client/.audit-reports/`
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`

## Outcome (fill at session end)
- **Delivered:**
- **Deferred:**
