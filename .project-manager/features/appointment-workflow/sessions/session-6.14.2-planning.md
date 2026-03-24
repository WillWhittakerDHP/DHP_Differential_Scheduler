# Plan: session 6.14.2 — Resolver breadth, validation parity, and org-default UX

## Contract
- **Tier:** session | **ID:** 6.14.2
- **Scope:** Close Phase 6.14 gaps left intentionally open in 6.14.1 (see `session-6.14.1-planning.md` → Outcome)
- **Governance:** Same as 6.14.1 — type/composable/function playbooks for touched code

## Work Profile
- **Execution intent:** implement
- **Action type:** integration
- **Scope shape:** cross_cutting
- **Governance domains:** client, server, shared types
- **Planning artifact action:** create
- **Decomposition mode:** moderate

## Where we left off
Session **6.14.1** delivered the canonical types, shared `resolveOrganizationNumericPolicy`, persistence (`organization_defaults` JSONB on availability settings), GET/PUT admin API, Business Controls organization surface, and **server** merge-at-read on the **computed availability** path (`server/src/services/organizationNumericPolicyService.ts` → `computedAvailabilityService.ts`). Broader wiring, validation parity, and optional admin badges were deferred here.

## Goal
1. **Resolver wiring** — Ensure every **production read path** that derives booking numeric policy from availability + calendar uses the same merge as the computed-availability pipeline **or** document a narrow exception with rationale (e.g. read-only preview that must match saved appointment snapshot).
2. **Server validation** — Where server validates slot/step inputs against admin policy, call the same resolver inputs (org defaults + overrides) so validation matches computed slots.
3. **Client (optional but preferred)** — Either rely on API responses that already embed resolved policy, or invoke shared resolver on the client after fetching org defaults + overrides when local UI must show policy without a round-trip (document the chosen pattern in phase handoff).
4. **Admin UX** — “Using organization default” (or equivalent) **badges or links** on Calendar / Availability / related panels where a field is merged from org defaults vs explicit override (phase guide: “where useful”).
5. **Quality** — Client lint + app start; resolver unit tests remain Phase 3.0 unless explicitly unblocked.

## Files (starting points — refine during session)
- **Shared:** `shared/utils/resolveOrganizationNumericPolicy.ts`, `shared/utils/calendarNumericOverridesFromSettings.ts`, `shared/types/organizationDefaults.ts`
- **Server:** `server/src/services/computedAvailabilityService.ts`, `server/src/services/organizationNumericPolicyService.ts`; grep for availability/calendar numeric reads in `server/src/routes/internal/` and appointment validation
- **Client booking:** composables under `client/src/composables/booking/` that read minute increment, rounding, drive fee, holds — align with resolved policy contract
- **Admin:** `client/src/views/admin/tabs/BusinessControlsTab.vue`, `BusinessControlsOrganizationSection.vue`, calendar/availability field components as needed for badges

## Approach
1. **Inventory (audit)** — List call sites that still use raw `AvailabilitySettings` / `CalendarConfig` numbers without `resolveOrganizationNumericPolicy`; prioritize booking and fee paths.
2. **Wire or document** — For each site: wire resolver, or add a short “exception” note in code + phase handoff if intentionally different.
3. **Validation** — Align appointment/slot validation handlers with merged policy.
4. **Badges** — Add minimal badge/helper text for org-default vs override on high-traffic admin fields (increment, rounding, drive fee, holds) without duplicating Business Controls layout.
5. **Lint / smoke** — `cd client && npm run lint`; app start; update `phase-6.14-handoff.md` when phase complete.

## Checkpoint
- Phase 6.14 **Success Criteria** in `phases/phase-6.14-guide.md` can be checked with no “partial” footnotes, or remaining exceptions are explicitly listed in handoff.
- No silent fallback: invalid combinations still log or surface per project standards.

## How we build the tierDown
- **Task 6.14.2.1:** Audit + server wiring and validation parity (resolver at remaining routes/handlers)
- **Task 6.14.2.2:** Client booking alignment + optional “using org default” admin badges
- **Task 6.14.2.3:** Handoff, phase log, lint + app start; list documented exceptions if any

---
## Reference (read before execute — governance and inventory compliance is required)
- Phase guide: `.project-manager/features/appointment-workflow/phases/phase-6.14-guide.md`
- Session 6.14.1 outcome: `sessions/session-6.14.1-planning.md` → *Outcome: delivered vs deferred*
- Feature guide: `.project-manager/features/appointment-workflow/feature-appointment-workflow-guide.md`
- Governance reports: `client/.audit-reports/`
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
