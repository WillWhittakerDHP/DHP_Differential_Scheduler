# Session 6.12.5: Differential event roles

## Session status

**Status:** Complete (retro-documented)  
**Phase:** 6.12  
**Last updated:** 2026-03-21

---

## Completed tasks

### Task 6.12.5.1: Block instance `differentialEventRoleOverrides` + admin matrix

**Goal:** JSONB on `block_instances`, admin field in Events panel, matrix listing all **active** event shapes (not only those reachable via `validParts` graph), booking merge with template `differentialRole`.  
**Planning:** `sessions/task-6.12.5.1-planning.md`

---

## Test status

Manual: block instance card shows matrix; new event shape appears without extra metadata; scheduling still respects assignments + roles.

---

## Technical reference (backfill)

### Purpose

**Block instance** overrides scheduling **differential role** (major / minor / moveable / none) per **event shape** without changing the global event shape for all consumers.

### Storage

- **Column:** `block_instances.differential_event_role_overrides` (JSONB), map event shape id → `DifferentialRole`.
- **Template:** `event_shapes.differential_role` (+ ternary behavior where applicable).

### Admin UX

- Metadata + `fieldLocationDispatcher` → **Events** panel.
- `DifferentialEventRoleOverridesField.vue` + `buildDifferentialRoleMatrixRows.ts` — rows from all active event shapes.

### Scheduling

- Overrides merge in booking utilities (`partFinalizer`, `perspectiveResolver`, etc.); see `effectiveDifferentialRole` and call sites.

### Code references

`DifferentialEventRoleOverridesField.vue`, `differentialRoleMatrixRows.ts`, migrations `20260429_000026_*`, `000027_*`, `20260431_000031_*`.

<!-- end excerpt session -->
