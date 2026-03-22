# Plan: task 6.12.8.1 — FetchedRelationship user-type field scoping (retro)

## Contract

- **Tier:** task | **ID:** 6.12.8.1
- **Scope:** `fetchToGlobalTransformer.ts` (`transformApiRelationship`, `buildAnnotationAssignmentEdges`), `FetchedRelationship` in `relationships.ts`, `AnnotationAssignmentResponse` in `annotations.ts`

## Delivered (retro)

- Renamed confusing double-`Block` property to `userTypeBlockInstanceId` on `FetchedRelationship`.
- Legacy raw key still accepted on ingest.
- `userTypeBlockInstanceId` on fetched row populated **only** for `annotationAssignments`.

## References

- **Session log:** `sessions/session-6.12.8-log.md`
- **Related:** `sessions/session-6.12.2-log.md` §B (consumers of edges)

## Checkpoint (retro)

- [x] Attendee hydrate does not populate annotation-only field from child id
- [x] Annotation edges still receive user-type id when present
