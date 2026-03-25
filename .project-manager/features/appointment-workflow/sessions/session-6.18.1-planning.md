# Session 6.18.1 — Shared user role catalog + `seller` → `owner` + audit

## Contract

- **Tier:** session | **ID:** 6.18.1 | **Parent phase:** 6.18

## Goal

Introduce a **single `@shared`** export for allowed `user_role` strings, migrate **`seller` → `owner`** at the database and application layers, and **audit** the codebase so no feature uses a divergent hardcoded list.

## Scope

1. **Shared:** Extend `shared/constants/roleConstants.ts` (or add `shared/constants/userRoleCatalog.ts`) with:
   - `USER_ROLE_OWNER = 'owner' as const` (replaces seller)
   - Readonly tuple `USER_ROLE_VALUES` listing every allowed DB/API value in one place
   - Re-export for server `userRoles.ts` / client `attendeeRoles.ts` as needed
2. **Server:** Joi `userSchemas.ts` — `.valid(...USER_ROLE_VALUES)` from shared import; `Users` model ENUM; any seed data
3. **Client:** `UserRequest`, admin role selects, transformers — import shared catalog
4. **Mapping:** `userTypeMapping.ts` — key `'owner'` with block name aligned to product (e.g. display name "Owner" / instance name documented in phase guide)
5. **Migration:** ENUM alter + `UPDATE users SET user_role = 'owner' WHERE user_role = 'seller'`
6. **Audit:** Document grep patterns in session log (hardcoded `'client'|'agent'|...` lists)

## Out of scope

- Session 6.18.2 admin alignment UI (separate session)
- New roles beyond rename (optional follow-up)

## Dependencies

- Phase 6.18 guide
- Coordinate ENUM migration with project migration policy (localhost DB for local execution)

## Acceptance

- [ ] Single shared module is the only authoritative list for allowed roles
- [ ] No remaining `seller` in persisted role semantics (DB + API + types)
- [ ] Lint/typecheck pass; app starts
