# Plan: task 6.16.1.1 — Shared types + constants for margin

## Contract
- **Tier:** task | **ID:** 6.16.1.1
- **Scope:** Add `'margin'` to shared `DifferentialRole` unions, labels, select options, and role utils (guards/parsers).
- **Governance:** Governance Context (Task); shared types stay in `@shared` per type boundaries.

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function
- **Gate profile:** fast
- **Suggested depth:** leaf
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Later tasks wire server, part finalizer, and admin; this task only extends the shared contract.

## Where we left off

Session 6.16.1 accepted; first task is **6.16.1.1**. Parent session locks ENUM strategy: add `margin` alongside existing `moveable` in storage; no `moveable`→`minimizer` DB rename in this session.

## Story

**This task changes** the shared `DifferentialRole` contract and helpers **because** downstream layers (server ENUM, part finalizer, admin selects) all import from `@shared`; without `margin` in the union and guards, TypeScript and runtime sanitization would reject or drop the new role.

## Analysis

- **Problem / why now:** Phase 6.16 introduces **margin** as a first-class event-shape role. The shared layer is the single source of truth for API/JSONB and UI; it must list `margin` before server or client code can safely persist or display it.
- **Domain boundaries:** **Shared contracts only** (`shared/types`, `shared/constants`, `shared/utils`). No client-only or server-only files in this task’s file list (see Design note on duplicate loose checks).
- **Patterns:** Keep `DifferentialRole` = union including `'none'`; `DifferentialRoleStorage` = persisted non-null roles (add `'margin'`). `DIFFERENTIAL_ROLE_LABELS` / `DIFFERENTIAL_ROLE_SELECT_OPTIONS` stay the canonical admin labels. Guards use explicit equality checks (existing style).
- **Risks:** Any **client duplicate** of `isDifferentialRoleStorage` (e.g. `isDifferentialRoleStorageLoose` in `apiEntityFieldNormalization.ts`) must be updated in a follow-up edit when wiring API normalization, or API may log false “invalid differentialRole” for `'margin'`. Not required for shared-only compile, but track when implementing the stack.
- **Alternatives:** Stringly-typed margin only on server — rejected; breaks shared boundary and admin transformers.

## Design

1. **`shared/types/differentialRole.ts`:** Extend to  
   `DifferentialRole = 'major' | 'minor' | 'moveable' | 'margin' | 'none'`  
   and `DifferentialRoleStorage = 'major' | 'minor' | 'moveable' | 'margin'`.
2. **`shared/constants/differentialRoleMappings.ts`:** Add `margin: 'Margin'` to `DIFFERENTIAL_ROLE_LABELS`; append `{ value: 'margin', label: ... }` to `DIFFERENTIAL_ROLE_SELECT_OPTIONS` (order: after `moveable` or before `none` in label-only sense — match product: major, minor, moveable, margin, none for selects that list storage values).
3. **`shared/utils/differentialRoleUtils.ts`:**
   - `isDifferentialRoleStorage`: add `value === 'margin'`.
   - `isDifferentialRoleOverrideValue`: add `raw === 'margin'` (override map may include margin for block instances).
   - `parseDifferentialRole` / `sanitizeDifferentialRoleInput`: unchanged structure — they route through `isDifferentialRoleStorage`.
   - `toApiDifferentialRole`: unchanged — returns `DifferentialRoleStorage | null`; `margin` is storage.
   - Update JSDoc on override helper if it lists literals explicitly.

**Pseudocode (guards):**

```ts
// isDifferentialRoleStorage
return value === 'major' || value === 'minor' || value === 'moveable' || value === 'margin'

// isDifferentialRoleOverrideValue  
return raw === 'major' || raw === 'minor' || raw === 'moveable' || raw === 'margin' || raw === 'none'
```

## Goal

Extend shared types and utilities so **`margin`** is a valid **`DifferentialRole`** and **`DifferentialRoleStorage`**, with labels and select options for admin/API consumers, and guards that accept **`margin`** everywhere **`moveable`** was already accepted for storage and overrides.

## Files (this task only)

- `shared/types/differentialRole.ts`
- `shared/constants/differentialRoleMappings.ts`
- `shared/utils/differentialRoleUtils.ts`

## Approach

1. Edit `differentialRole.ts` — add `'margin'` to both type aliases.
2. Edit `differentialRoleMappings.ts` — labels + select option row for `margin`.
3. Edit `differentialRoleUtils.ts` — extend `isDifferentialRoleStorage` and `isDifferentialRoleOverrideValue`; adjust comments if they enumerate literals.

## Checkpoint

- `tsc` / project build for packages that compile `shared/` succeeds (or client/server typecheck after import).
- No exhaustive `switch` on `DifferentialRole` in `shared/` left non-exhaustive (grep if any).

## Deliverables

- Updated `DifferentialRole` and `DifferentialRoleStorage` including `'margin'`.
- `DIFFERENTIAL_ROLE_LABELS` and `DIFFERENTIAL_ROLE_SELECT_OPTIONS` include margin.
- `isDifferentialRoleStorage` and `isDifferentialRoleOverrideValue` accept `'margin'`.

## Acceptance Criteria

- [ ] `DifferentialRole` includes `'margin'`; `DifferentialRoleStorage` includes `'margin'`.
- [ ] `DIFFERENTIAL_ROLE_LABELS.margin === 'Margin'` (or agreed copy).
- [ ] `DIFFERENTIAL_ROLE_SELECT_OPTIONS` includes `{ value: 'margin', label: ... }`.
- [ ] `isDifferentialRoleStorage('margin')` is true; `parseDifferentialRole('margin')` returns `'margin'`.
- [ ] `isDifferentialRoleOverrideValue('margin')` is true; `sanitizeDifferentialEventRoleOverridesInput` preserves margin entries when present in input.

## Implementation Orders (for `/accepted-code` execute mode)

1. `shared/types/differentialRole.ts` — type unions.
2. `shared/constants/differentialRoleMappings.ts` — labels + options.
3. `shared/utils/differentialRoleUtils.ts` — guards + comment updates.

If TypeScript reports new errors in consumers that use exhaustive switches on `DifferentialRole`, fix minimally in those files in the same implementation pass (still under task 6.16.1.1 if the fix is only adding a `margin` case or default).

## Definition of Done

- [ ] App starts (`npm run start:dev`) — after any consumer fixes needed for compile.
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.16.1-guide.md`
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`
- Workflow friction: `.project-manager/WORKFLOW_FRICTION_LOG.md`
