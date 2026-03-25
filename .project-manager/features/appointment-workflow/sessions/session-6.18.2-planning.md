# Session 6.18.2 — Admin alignment: canonical roles ↔ user-type block instances

## Contract

- **Tier:** session | **ID:** 6.18.2 | **Parent phase:** 6.18  
**Depends on:** Session 6.18.1 (canonical role keys stable)

## Goal

Let operators **align** each canonical **`user_role`** value to a **user-type block instance** (state-control shapes) via admin UI and persisted settings, so **`getUserTypeBlockIdForRole`** resolves from **config first** and falls back to the legacy name-based map only when unset.

## Scope (conceptual)

1. **Persistence:** Choose storage (e.g. JSONB on organization/wizard settings, or dedicated table) for `Record<UserRole, block_instance_id | null>`.
2. **API:** GET/PUT alignment payload; validate instance IDs belong to user-type / state-control shapes.
3. **Admin UI:** Matrix or list: Role (read-only enum labels) → searchable instance picker; unsaved changes guard; help text linking to Instances tab.
4. **Runtime:** Update `getUserTypeBlockIdForRole` to read persisted map before `ROLE_TO_BLOCK_NAME` string lookup.
5. **Docs:** Seed/migration note for default alignments per environment.

## Out of scope

- Replacing `user_role` ENUM with unlimited dynamic roles (future architecture — see PROJECT_PLAN Feature 6 Open Questions)

## Acceptance

- [ ] Saving alignment updates resolution for attendees/booking without code deploy for mapping-only changes
- [ ] Legacy string map still works as fallback for unset keys
- [ ] Lint; app starts
