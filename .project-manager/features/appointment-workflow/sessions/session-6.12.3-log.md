# Session 6.12.3: Admin metadata — panels and `render_as`

## Session status

**Status:** Complete (retro-documented)  
**Phase:** 6.12  
**Last updated:** 2026-03-21

---

## Completed tasks

### Task 6.12.3.1: Sub-panels, dispatcher, and multiselect for shape-level `valid*`

**Goal:** Align admin IA (parts / relationships / annotations / events), client `determinePanelFromFieldKey`, `computeRenderAs` + `RELATIONSHIP_COLLECTION_FIELD_KEYS`, and DB migrations so shape-level allowlists use **multiselect** where intended and event-related fields land in the **Events** panel.  
**Planning:** `sessions/task-6.12.3.1-planning.md`

---

## Test status

Manual: entity cards show fields under expected panels; shape `valid*` fields render as multiselect, not relationship collection.

---

## Technical reference (backfill)

### Purpose

How admin entity cards choose **sub-panel** placement and **Vue control** (`render_as`), given `admin_metadata` and client overrides.

### Panel routing

- **DB:** `admin_metadata.panel` (`parts`, `relationships`, `annotations`, `events`, `none`, etc.).
- **Client override:** `client/src/utils/forms/fieldLocationDispatcher.ts` — `determinePanelFromFieldKey` maps known relationship keys (e.g. `validParts` → parts, `validAnnotations` → annotations, `eventAssignments` / `differentialEventRoleOverrides` → events).
- **Rule:** Prefer dispatcher for known keys so UI does not drift from stale DB rows.

### `render_as` vs `computeRenderAs`

- Persisted `render_as` is not authoritative alone.
- **`shared/utils/metadataRenderAsUtils.ts`** (`computeRenderAs`) combines `dataType`, `ic_*` / input config, and **`RELATIONSHIP_COLLECTION_FIELD_KEYS`** (`shared/constants/collectionFieldKeys.ts`) for e.g. `multiselect` vs `relationshipCollection`.
- Shape-level **`valid*`** intentionally **multiselect** when `ic_select_mode` is multiple (see comments in `collectionFieldKeys.ts`).

### Migrations

Representative: `20260430_000028_*` through `20260431_000033_*` (panel, `render_as`, `ic_*`). Debug path: DB row + `computeRenderAs` + dispatcher.

### Code references

`fieldLocationDispatcher.ts`, `metadataRenderAsUtils.ts`, `collectionFieldKeys.ts`, migrations under `server/src/db/migrations/20260430_*`, `20260431_*`.

<!-- end excerpt session -->
