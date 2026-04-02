# Session 6.18.2 — Admin alignment: canonical roles ↔ user-type block instances

## Contract

- **Tier:** session | **ID:** 6.18.2 | **Parent phase:** 6.18  
- **Depends on:** Session **6.18.1** — `@shared` `USER_ROLE_VALUES`, API/DB `owner`, `userTypeMapping` name map in place.

## Story

Operators need to **choose which user-type block instance** backs each canonical **`users.user_role`** without shipping code. Today **`getUserTypeBlockIdForRole`** resolves via **`ROLE_TO_BLOCK_NAME`** in `server/src/utils/userTypeMapping.ts` and a DB lookup by **instance name** under **state-control** block shapes. That breaks when instances are renamed or duplicated. This session adds **persisted overrides** (role → `block_instance_id`), **validated APIs**, and **admin UI**, with the **existing name map as fallback** when a role has no override.

## Analysis

- **Why now:** `ARCHITECTURE.md` and `phase-6.18-guide.md` already commit to admin-persisted alignment; 6.18.1 stabilized role strings so keys are stable for storage.
- **Domains:** **Server** — persistence, Joi validation, `getUserTypeBlockIdForRole` read order, cache invalidation; **Admin client** — settings surface (Business Controls or Users-adjacent tab), pickers fed from metadata API for **user-type** instances; **Shared** — optional DTO type for alignment payload (`Record<UserRoleValue, uuid | null>`) if both sides consume it.
- **Risks:** Wrong `block_instance_id` → attendee creation fails or maps to wrong wizard state; must validate **instance exists**, **`block_shape.type === 'user'`**, and **`isStateControl`** on parent shape (same criteria as `findUserTypeBlockByName`). **Migration guard:** only run DDL on localhost per project rules.
- **Patterns:** Mirror **`business-settings`** key pattern (`businessSettingsCrudRouter`, `checkOwnership('businessSetting', …)`) for a dedicated key (e.g. `user_role_block_alignment`) **or** introduce a small table if JSON size/auditing warrants it — **decide in task 6.18.2.1** with preference for **one JSONB row** keyed like availability unless multiple writers conflict.
- **No silent fallback:** Unmapped role → keep current **warn** + `null`; unknown UUID in payload → **400** with clear error.

## Codebase recon

**Paths reviewed (server):**

- `server/src/utils/userTypeMapping.ts` — `ROLE_TO_BLOCK_NAME`, `getUserTypeBlockIdForRole`, `findUserTypeBlockByName`, in-memory cache by **block name** (TTL 5m).
- `server/src/routes/internal/appointments/appointmentPersistenceHelpers.ts` — calls `getUserTypeBlockIdForRole(attendee.role)` when persisting attendees.
- `server/src/db/models/admin/block_shape.ts` — `isStateControl`, `type: 'user' | …`.
- `server/src/routes/internal/businessSettings/businessSettingsCrudRouter.ts` — GET/PATCH patterns, `validateSettingValue`, ownership.
- `server/src/middlewares/ownershipEnforcement.ts` — `businessSetting` param handling.

**Paths reviewed (client):**

- `client/src/utils/booking/cascadeFilterPipeline.ts` — `getUserTypeBlocks` for wizard user-type options.
- `client/src/composables/booking/useWizardFilteredOptions.ts` — consumes `getUserTypeBlocks`.

**Gaps / decisions for tasks:** Exact **settings key** vs **new table**; admin **route/tab** placement (reuse Developer “Business Controls” vs new sub-view); whether **client booking** needs to read alignment (likely **no** — server resolves on persist; wizard already loads instances from global data).

## Goal

Let operators **align** each canonical **`user_role`** to a **user-type block instance** via admin UI and persisted config, so **`getUserTypeBlockIdForRole`** uses **stored `block_instance_id` first** and falls back to the **legacy name-based map** when unset.

## Files (primary)

| Layer | Paths (expected touch) |
|--------|-------------------------|
| Server | `userTypeMapping.ts` (read overrides + cache bust), **new** alignment service + validation helper, `businessSettings` **or** new migration/model, **new** internal routes under `routes/internal/`, constants for setting key |
| Shared | Optional `shared/types/` or `shared/constants` for alignment payload / keys |
| Client | Admin view + composable for load/save; API client module; reuse `USER_ROLE_VALUES` for row labels |

## Approach

1. **Persistence:** Add storage for `Record<roleKey, blockInstanceId | null>` (subset of roles that need user-type mapping — likely all entries currently in `ROLE_TO_BLOCK_NAME` plus `admin` if ever needed; **product call:** map only roles that appear in attendee creation).
2. **Validation:** On write, each non-null UUID must resolve to a `block_instances` row whose shape is **user** and **state-control** (reuse query logic aligned with `findUserTypeBlockByName`).
3. **Runtime:** `getUserTypeBlockIdForRole`: if override present, return it (and optionally cache by role); else existing name path. **Invalidate** role/block cache when settings update.
4. **Admin UI:** Table: label per role (`USER_ROLE_VALUES` or filtered list) → autocomplete/select of eligible instances (name + id); save dirty state; link to Instances docs in help text.
5. **Docs:** Session log + `ARCHITECTURE.md` one-line update when delivered; seed note for default alignment in dev.

## Checkpoint

After **6.18.2.1:** API returns/saves alignment; server resolves attendees using overrides in a manual or integration check. After **6.18.2.2:** Admin can change mapping without code; lint and app start pass.

## Deliverables

- Persisted role → `block_instance_id` map (validated).
- GET/PUT (or PATCH) API for alignment.
- Admin UI matrix/list with pickers.
- `getUserTypeBlockIdForRole` reads config first; legacy map fallback; cache safety.
- Brief doc/seed note for defaults.

## Acceptance criteria

- [ ] Saving alignment changes which block instance is used for new/updated attendee rows using that role (server path), without redeploy for mapping-only edits.
- [ ] Legacy `ROLE_TO_BLOCK_NAME` + name lookup still applies when a role has **no** stored override.
- [ ] Invalid instance IDs rejected at API with clear errors; unknown roles logged as today.
- [ ] `npm run lint` (client + server) and local app start succeed.

## Decomposition (leaf tasks)

### Task 6.18.2.1: Persistence + API + `getUserTypeBlockIdForRole` integration

**Goal:** Store alignment, expose authenticated GET/PUT (or merge into business-settings key), validate instances, update `userTypeMapping.ts` to prefer overrides and clear cache on update.

**Implementation orders (high level):**

1. Choose storage (prefer single `business_settings` JSON key following `availability` patterns unless table is required).
2. Add shared types for payload if client/server both import.
3. Implement validation: UUID → `BlockInstance` + `BlockShape` user + state-control checks.
4. Wire routes + ownership (admin-only).
5. Change `getUserTypeBlockIdForRole`: lookup override by role → return id; else existing flow.
6. Add cache invalidation when alignment updates.

### Task 6.18.2.2: Admin UI — role ↔ user-type instance matrix

**Goal:** Operator-facing screen to view/edit alignment; load roles from shared catalog; instance picker from existing global/block metadata APIs used elsewhere in admin.

**Implementation orders (high level):**

1. Add API client methods for alignment GET/PUT.
2. Build composable for form state + dirty guard + save.
3. Add view under agreed admin nav (Business Controls or session guide pick); reuse Vuetify table + select/autocomplete patterns from nearby admin screens.
4. Help copy: point to Instances tab and state-control user shapes.

---

## Reference

- `.project-manager/features/appointment-workflow/phases/phase-6.18-guide.md`
- `.project-manager/ARCHITECTURE.md` (Users / `user_role`, `getUserTypeBlockIdForRole`)
- `server/src/utils/userTypeMapping.ts`
- `server/src/routes/internal/appointments/appointmentPersistenceHelpers.ts`
- `server/src/routes/internal/businessSettings/businessSettingsCrudRouter.ts`
- `client/src/utils/booking/cascadeFilterPipeline.ts` (`getUserTypeBlocks`)

## Out of scope

- Dynamic/unlimited roles (not ENUM-driven) — future architecture.
- Changing booking wizard client to fetch alignment separately (server remains source of truth on persist unless product later requires client-side preview of resolved id).
