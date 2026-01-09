## Annotation Assignments (Admin) - Query/State/Actions Pattern

### What this folder is
`client/src/composables/admin/annotationAssignments/` contains the **internal building blocks** used by the facade composable `useAnnotationAssignments` (`client/src/composables/admin/useAnnotationAssignments.ts`).

This is intentionally split to keep the public API stable while making the implementation easier to reason about and audit.

### Data model
- **AnnotationAssignment**: join/relationship between a **BlockInstance** and an **Annotation**, with metadata:
  - `orderIndex`
  - `isDefault`
  - `userTypeBlockBlockInstanceId` (nullable)

### Files and responsibilities
- **`useAnnotationAssignmentsQuery.ts`**
  - Fetches:
    - assignments for a single block instance (`blockInstanceAnnotations`)
    - a cached “all block instance annotations” view for cross-referencing (`allBlockInstanceAnnotations`)
  - No mutations.

- **`useAnnotationAssignmentsState.ts`**
  - Pure derived state / helpers (e.g. `getMaxOrderIndex()`).
  - No API calls, no mutations.

- **`useAnnotationAssignmentsActions.ts`**
  - Mutations for create/update/delete assignment records.
  - Orchestrated helpers used by the field view-model (add selected, create + attach, metadata updates, etc.).
  - Refetches `['globalData']` after success to keep the unified cache consistent.

### Invariants
- **No DOM access**: this is pure data + orchestration.
- **No silent fallbacks**: errors are logged via `createLogger()` and surfaced to callers for UI notifications.
- **Single entry point for UI**: components should use `useAnnotationAssignments` (facade), not these modules directly.


