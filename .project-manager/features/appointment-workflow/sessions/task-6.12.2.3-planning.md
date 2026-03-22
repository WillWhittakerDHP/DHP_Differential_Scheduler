# Plan: task 6.12.2.3 — Annotation assignment edges and user-type-aware wizard copy (retro)

## Contract

- **Tier:** task | **ID:** 6.12.2.3
- **Scope:** Flat `annotationAssignmentEdges` on global hydrate, `buildBookingBlockAnnotationUi` / `assignmentUserTypeFilter`, `resolveAnnotationTextForAssignment`, admin annotation content editor alignment with session 6.12.1 content table
- **Governance:** Explicit boundaries on `FetchedRelationship` optional fields (see session 6.12.8)

## Execution note

**Retro-documented:** Implemented on branch work consolidated under phase 6.12; this file records intent and pointers for audit.

## Goal

Ensure the wizard resolves annotation copy using (1) **assignment** rows that may be scoped by user-type block instance, and (2) **content rows** on the annotation instance, without treating assignment metadata as a separate graph edge.

## Delivered behavior

- `buildAnnotationAssignmentEdges` in `fetchToGlobalTransformer.ts` builds edges from `annotationAssignments` fetched rows.
- `BookingBlockAnnotationUi` candidates carry `assignmentUserTypeFilter` for slot resolution.
- `AnnotationContentEditor` and CRUD save paths include `contentRows` where applicable.

## References

- **Session log:** `sessions/session-6.12.2-log.md` (Technical reference §B)
- **Session 6.12.8:** `sessions/session-6.12.8-log.md` (fetch normalization for `userTypeBlockInstanceId`)

## Checkpoint (retro)

- [x] Edges present on `GlobalData` after batch hydrate
- [x] Wizard slot text respects user-type filter + content rows
- [x] No use of assignment user-type field on non-annotation relationship kinds
