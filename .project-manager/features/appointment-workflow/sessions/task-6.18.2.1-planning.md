# Plan: task 6.18.2.1 — Persistence + API + `getUserTypeBlockIdForRole` integration

## Contract

- **Tier:** task | **ID:** 6.18.2.1 | **Parent session:** 6.18.2  
- **Scope:** Server only — alignments storage, validated HTTP API, runtime resolution in `userTypeMapping.ts`. **Admin UI is task 6.18.2.2.**

## Work Profile

- **Execution intent:** implement  
- **Action type:** localized_change  
- **Scope shape:** file_local  
- **Governance domains:** function  
- **Gate profile:** fast  
- **Recommended context pack:** local_implementation_pack  
- **Planning artifact action:** update  

## Where we left off

- [ ] #### Task 6.18.2.1: Persistence + API + `getUserTypeBlockIdForRole` **Goal:** Store role→`block_instance_id` overrides, expose GET/PUT, validate instances, prefer overrides in `getUserTypeBlockIdForRole` with cache invalidation. **Files:** see table below.

## Parent context (session planning — excerpt)

Session **6.18.2** delivers admin-configurable **canonical `user_role` → user-type block instance** alignment. Task **6.18.2.1** implements **persistence + API + server resolution**; **6.18.2.2** adds the admin UI.

## Story

**This task** adds a **persisted override map** and **internal API** so each canonical role can resolve to a specific **`block_instances.id`** without redeploy. **`getUserTypeBlockIdForRole`** must read **overrides first**, then fall back to **`ROLE_TO_BLOCK_NAME` + `findUserTypeBlockByName`**, preserving existing warn behavior for unknown roles.

## Codebase recon

**Paths reviewed:**

- `server/src/utils/userTypeMapping.ts` — `ROLE_TO_BLOCK_NAME`, `getUserTypeBlockIdForRole`, name-based lookup, **5-minute TTL cache keyed by block name** (`userTypeBlockCache`).
- `server/src/routes/internal/appointments/appointmentPersistenceHelpers.ts` — `getUserTypeBlockIdForRole(attendee.role)` for attendee persistence.
- `server/src/routes/internal/businessSettings/businessSettingsCrudRouter.ts` — **only** `availability_settings` key today; dedicated repository, not a generic key-value store.
- `server/src/db/models/admin/availability_setting.ts` — structured columns + `organizationDefaults` JSON; **not** a fit for embedding role alignment without coupling.
- `server/src/db/models/admin/block_shape.ts` — `isStateControl`, `type` includes `'user'`.
- `shared/constants/roleConstants.ts` — `USER_ROLE_VALUES`, per-role constants for valid keys.

**Patterns / call sites:**

- New data should follow **repository + route** layering (`repositories/`, `routes/internal/`), **Joi** validation on bodies, **`checkOwnership`** / **`requireAuth`** patterns consistent with other internal admin routes.
- Instance validation must mirror **`findUserTypeBlockByName`**: `BlockInstance` exists, **`blockShapeRef`** points to a **`BlockShape`** with **`type === 'user'`** and **`isStateControl === true`**.

**Gaps / unknowns:**

- Exact route path and auth middleware mirror (e.g. `requireRole('admin')` vs existing business-setting ownership) — **match** `appointmentRouter` internal staff patterns during implementation.
- **Migration:** single-row table vs multi-row; **decision:** **single-row** `user_role_block_alignment` with **`alignments` JSONB** (object: role string → UUID string | null) for simple GET/PUT replace semantics.

## Analysis

- **Problem:** Operators cannot retarget a role to a different user-type instance without changing code (`ROLE_TO_BLOCK_NAME` + seed names).
- **Boundaries:** **Server-only** this task; **shared** may export a **type** for the JSON shape if duplicated later — optional `UserRoleBlockAlignments` in `shared/types/` for API contract.
- **Risks:** Stale **name cache** after PUT — must **`invalidateUserTypeBlockCache()`** (new export) when alignment saved. Invalid UUID or wrong shape → **400** + message; do not persist partial bad payloads.
- **Alternatives:** Extend `business_settings` router — **rejected** for this task because the router is hard-wired to **availability** only; a **dedicated model** avoids widening `isAvailabilityKey` hacks.

## Design

### Persistence

- **Migration:** table `user_role_block_alignments` (singular row convention: fixed `id` or singleton query `LIMIT 1`) with `alignments` **JSONB** default `{}`.
- **Model:** Sequelize model + **repository** `getUserRoleBlockAlignments()` / `saveUserRoleBlockAlignments(record)`.

### Payload shape

- **Keys:** subset of **`USER_ROLE_VALUES`**; allow **only** keys that exist in shared constants (reject unknown keys).
- **Values:** `string | null` (UUID v4 string or null to clear override).

### Validation (on PUT)

- For each non-null value: load **`BlockInstance`** with **`BlockShape`** include; require **`shape.type === 'user'`** and **`shape.isStateControl === true`**.
- **Empty object** allowed (all fallback to legacy map).

### API

- **`GET /api/internal/.../user-role-block-alignment`** — returns `{ alignments: Record<string, string | null> }` (merged with defaults optional: return **stored only** for v1).
- **`PUT`** same path — body `{ alignments }`, full replace or merge — **spec: full replace** of stored JSON for simplicity.

### `getUserTypeBlockIdForRole(role)`

1. Load alignments ( **in-memory cache with short TTL** or read-through from DB each call — prefer **module-level cached alignments** invalidated on save to avoid N+1 on bulk attendee save).
2. If `alignments[role]` is non-null string, validate UUID format; return id (optional: verify row still exists — **v1:** trust DB FK on future migration; for now soft-validate instance on write only).
3. Else existing **`ROLE_TO_BLOCK_NAME`** + **`findUserTypeBlockByName`** path.

### Cache strategy

- **Name cache** (`userTypeBlockCache`): clear entire map on alignment **save**.
- **Alignment cache:** `let alignmentCache: { map: …; loadedAt: number } | null` with TTL e.g. 60s, or invalidate on save only.

## Goal (task-scoped)

Ship **server persistence**, **GET/PUT API**, and **`getUserTypeBlockIdForRole`** behavior: **override first**, **legacy name map fallback**, **cache invalidation** on update.

## Files (primary)

| Layer | Paths |
|--------|--------|
| Server (new) | `server/src/db/migrations/*_create_user_role_block_alignments.*`, `server/src/db/models/admin/user_role_block_alignment.ts` (or equivalent naming), `server/src/repositories/userRoleBlockAlignmentRepository.ts` |
| Server (new) | `server/src/routes/internal/userRoleBlockAlignment/userRoleBlockAlignmentRouter.ts` (or nested under `settings`), validators |
| Server (edit) | `server/src/utils/userTypeMapping.ts`, `server/src/routes/internal/index.ts` (mount router), `server/src/config/app.js` or model registry if models are registered centrally |
| Shared (optional) | `shared/types/userRoleBlockAlignment.ts` — exported type for `{ alignments: Partial<Record<UserRoleValue, string | null>> }` |

**Not in this task:** `client/**` (task 6.18.2.2).

## Approach

1. Add migration + model + repository (singleton row upsert pattern).  
2. Add Joi schema for PUT body; validation helper `assertBlockInstanceIsUserTypeStateControl(id)`.  
3. Register routes with CSRF + auth consistent with internal admin.  
4. Extend `userTypeBlockIdForRole` flow + `invalidateAlignmentCache` / `invalidateUserTypeBlockCache` on successful save.  
5. Manual verification: PUT a mapping, call path that uses `getUserTypeBlockIdForRole` (or temporary log line) — **no new automated tests** (project testing suspended).

## Checkpoint

- GET returns stored JSON (or `{}` when no row).  
- PUT rejects invalid UUID / wrong block shape with **400**.  
- After PUT, attendee persistence uses new instance id for that role.

## Deliverables

- DB table + migration (guarded per `DB_HOST` project rules for **running** migration on non-localhost).  
- Repository + GET/PUT routes.  
- `getUserTypeBlockIdForRole` reads overrides + invalidates caches on save.  
- Brief comment in `userTypeMapping.ts` pointing to alignment table.

## Acceptance Criteria

- [ ] Persisted alignments survive server restart.  
- [ ] Unknown role keys in payload rejected.  
- [ ] Non-null instance id must be user-type + state-control shape.  
- [ ] Unset role → unchanged legacy name resolution.  
- [ ] `npm run lint` in `server` passes; `tsc --noEmit` passes.

## Implementation Orders

1. **Migration + model** — `user_role_block_alignments` with `alignments` JSONB; register in Sequelize.  
2. **Repository** — getSingleton / upsert alignments object.  
3. **`validateAlignmentPayload`** — keys ∈ `USER_ROLE_VALUES`, values null or UUID; for each UUID run shape check.  
4. **Router** — GET, PUT, wire `internal` index, middleware.  
5. **`userTypeMapping.ts`** — load alignment map (cached), prefer override, export `invalidateUserTypeMappingCaches()` called from repository after save.  
6. **Smoke:** curl or Thunder Client GET/PUT (document in task-end note).

## Definition of Done

- [ ] App starts (`npm run start:dev`)  
- [ ] Lint passes (`cd server && npm run lint`)  
- [ ] Session guide task **6.18.2.1** checkbox updated when task completes  

---

## Reference

- `.project-manager/features/appointment-workflow/sessions/session-6.18.2-planning.md`  
- `.project-manager/features/appointment-workflow/sessions/session-6.18.2-guide.md`  
- `.project-manager/ARCHITECTURE.md` (Users / `user_role`, `getUserTypeBlockIdForRole`)  
- `server/src/utils/userTypeMapping.ts`  
- `shared/constants/roleConstants.ts`  
- `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`  
- `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`  
- `.project-manager/WORKFLOW_FRICTION_LOG.md`  
- `.project-manager/agent-model-config.json`  
