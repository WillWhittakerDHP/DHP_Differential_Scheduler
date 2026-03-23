# Plan: task 6.14.1.2 — Admin org defaults UI, persistence, and resolver wiring

## Contract
- **Tier:** task | **ID:** 6.14.1.2
- **Scope:** Dedicated admin surface for `OrganizationDefaults`, server GET/PUT (or equivalent) + optional JSONB migration, wire `resolveOrganizationNumericPolicy` at high-value reads or document follow-ups
- **Governance:** Thin Vue sections + composable for load/save; explicit types at boundaries per type playbook

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Builds on 6.14.1.1 (`OrganizationDefaults`, `resolveOrganizationNumericPolicy`); do not re-scope the type/resolver core unless a gap is found.

## Where we left off
Task **6.14.1.1** landed `shared/types/organizationDefaults.ts`, `shared/utils/resolveOrganizationNumericPolicy.ts`, field inventory, and a recorded persistence preference (`organization_defaults` JSONB + GET/PUT aligned with org admin). This task implements that surface and integration.

## Goal
Add a **Business Controls** sub-tab (or equivalent) for **organization-wide numeric defaults** that edits an `OrganizationDefaults` payload, **persists** it via server API (migration + model field as needed), and **uses** `resolveOrganizationNumericPolicy` when serving or reading numeric policy—at least one **booking or admin read path** calls the resolver with org defaults + calendar/availability overrides, **or** the session handoff lists exact follow-up call sites with rationale.

## Files
- `client/src/views/admin/tabs/BusinessControlsTab.vue` — new `VTab` / `VWindowItem` (e.g. `organization` or `policies`)
- `client/src/composables/admin/useBusinessControlsTab.ts` — state, load/save for org defaults tab; align with existing `handleSave` / tab split
- New: `client/src/views/admin/tabs/BusinessControlsOrganizationSection.vue` (or `.../organization/`) — form sections mirroring `OrganizationDefaults` groups (time/rounding, drive fee, holds/admin entry, optional baselines)
- `shared/types/organizationDefaults.ts` — touch only if API DTOs need aliases or validation helpers
- `shared/utils/resolveOrganizationNumericPolicy.ts` — consume from wired paths; extend only if merge inputs need adapters
- Server: Sequelize model + migration for `organization_defaults` JSONB (or chosen table); route handlers GET/PUT under existing internal/admin patterns; mirror resolver import for validation if applicable
- Booking/read paths: e.g. availability slot grid, fee pipeline, or settings bootstrap—pick 1–2 high-value sites or document deferrals

## Approach
1. **Schema** — Add migration + model field; no `npm run migrate` against remote DB (localhost-only execution per project policy).
2. **API** — GET returns stored JSON (with defaults empty-object merge); PUT validates shape and persists; log validation failures per coding standards.
3. **Client composable** — Fetch org defaults on tab enter; bind to reactive form; save batches with existing success/error UX patterns from `useBusinessControlsTab`.
4. **UI** — Subsections with `VTextField` / `VSwitch` / `VSlider` as appropriate; keep template shallow—extract repeated rows to small presentational pieces if needed.
5. **Wiring** — Import resolver where calendar or availability payload is assembled for booking; pass `organizationDefaults` from store/API + partial overrides from calendar config.
6. **Quality** — `cd client && npm run lint` and `cd server && npm run lint`; app starts; no new test files (Phase 3.0 policy).

## Checkpoint
- Admin can load and save org defaults without errors; persisted JSON round-trips
- At least one production read path uses `resolveOrganizationNumericPolicy`, **or** handoff lists remaining wiring with file names
- Client + server lint clean for touched files

## Design Before Execute
- **Load:** `GET /api/.../organization-defaults` → `OrganizationDefaults` → form model.
- **Save:** Validate client-side (min/max, required groups) → `PUT` same shape → toast + refresh `businessControlsState` if shared.
- **Resolve:** `resolved = resolveOrganizationNumericPolicy(orgDefaults, calendarNumericOverrides)` at the chosen call site; overrides type already defined in shared types next to `OrganizationDefaults`.
- **If API not ready in one PR:** stub read/write in composable with `logger.warn` and a single follow-up ticket line in task handoff (avoid silent empty object long term).
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.14.1-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.14.1.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
