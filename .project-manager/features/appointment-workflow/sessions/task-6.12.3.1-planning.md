# Plan: task 6.12.3.1 — Panels, dispatcher, multiselect for `valid*` (retro)

## Contract

- **Tier:** task | **ID:** 6.12.3.1
- **Scope:** `fieldLocationDispatcher`, `metadataRenderAsUtils`, `collectionFieldKeys`, `useEntityCardSubPanels` summaries, SQL/JS migrations updating `admin_metadata`

## Goal

Align persisted metadata with client routing and rendering rules so admins see the correct panel and control type for relationship fields.

## Delivered (retro)

- Dispatcher overrides for relationship keys and primitives routed to `events` where needed.
- `RELATIONSHIP_COLLECTION_FIELD_KEYS` narrowed so shape `valid*` resolve to multiselect via `computeRenderAs`.
- Migrations: panel + `render_as` sync (`000028`–`000033` family).

## References

- **Session log:** `sessions/session-6.12.3-log.md`

## Checkpoint (retro)

- [x] `validParts` / `validAnnotations` / `validCascades` / `validEvents` multiselect behavior
- [x] Event-related fields visible under Events panel in admin
