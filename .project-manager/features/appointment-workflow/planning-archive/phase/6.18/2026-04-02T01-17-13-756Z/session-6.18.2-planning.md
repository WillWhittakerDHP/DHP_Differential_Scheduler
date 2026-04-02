<!-- harness-planning-rollup tier=session id=6.18.2 consolidatedAt=2026-04-02T01:01:37.442Z -->

# Consolidated planning: session 6.18.2

## Session 6.18.2 (parent)

## Story

Operators need to **choose which user-type block instance** backs each canonical **`users.user_role`** without shipping code. Today **`getUserTypeBlockIdForRole`** resolves via **`ROLE_TO_BLOCK_NAME`** in `server/src/utils/userTypeMapping.ts` and a DB lookup by **instance name** under **state-control** block shapes. That breaks when instances are renamed or duplicated. This session adds **persisted overrides** (role → `block_instance_id`), **validated APIs**, and **admin UI**, with the **existing name map as fallback** when a role has no override.

## Analysis

- **Why now:** `ARCHITECTURE.md` and `phase-6.18-guide.md` already commit to admin-persisted alignment; 6.18.1 stabilized role strings so keys are stable for storage.
- **Domains:** **Server** — persistence, Joi validation, `getUserTypeBlockIdForRole` read order, cache invalidation; **Admin client** — settings surface (Business Controls or Users-adjacent tab), pickers fed from metadata API for **user-type** instances; **Shared** — optional DTO type for alignment payload (`Record<UserRoleValue, uuid | null>`) if both sides consume it.
- **Risks:** Wrong `block_instance_id` → attendee creation fails or maps to wrong wizard state; must validate **instance exists**, **`block_shape.type === 'user'`**, and **`isStateControl`** on parent shape (same criteria as `findUserTypeBlockByName`). **Migration guard:** only run DDL on localhost per project rules.
- **Patterns:** Mirror **`business-settings`** key pattern (`businessSettingsCrudRouter`, `checkOwnership('businessSetting', …)`) for a dedicated key (e.g. `user_role_block_alignment`) **or** introduce a small table if JSON size/auditing warrants it — **decide in task 6.18.2.1** with preference for **one JSONB row** keyed like availability unless multiple writers conflict.
- **No silent fallback:** Unmapped role → keep current **warn** + `null`; unknown UUID in payload → **400** with clear error.

## Goal

Let operators **align** each canonical **`user_role`** to a **user-type block instance** via admin UI and persisted config, so **`getUserTypeBlockIdForRole`** uses **stored `block_instance_id` first** and falls back to the **legacy name-based map** when unset.

## Files

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

---

## Task 6.18.2.2 (source: task-6.18.2.2-planning.md)

### Story

**This task adds** an admin settings panel **because** staff must view and edit which **user-type block instance** each canonical **`user_role`** maps to, using the existing internal API, with pickers constrained to the same eligibility rules the server enforces (user-shaped block under a state-control shape).

---

### Analysis

- **Why now:** Operators need to change alignment without deploys; persistence and runtime already honor overrides after 6.18.2.1.
- **Domains:** **Admin client** — settings surface, `apiClient` calls, composable orchestration, Vuetify forms; **Shared** — reuse `USER_ROLE_VALUES`, `UserRoleBlockAlignmentDto` for typing only.

### Goal

Operators can **view and edit** persisted **user_role → block_instance_id** alignment from admin **without code changes**, using the **6.18.2.1** API, with pickers limited to **user-type state-control** instances.

### Files

| Layer | Paths (expected touch) |
|--------|-------------------------|
| Client config | **New** `client/src/configs/userRoleBlockAlignment/api.ts` — `getUserRoleBlockAlignment()`, `putUserRoleBlockAlignment(dto)` using `apiClient` from `@/utils/api` |
| Client composable | **New** `client/src/composables/admin/useAdminUserRoleBlockAlignment.ts` — load/save, `enabled` option, explicit return type |
| Client view | **New** `client/src/views/admin/tabs/BusinessControlsRoleAlignmentSection.vue` (or under `tabs/components/`) — thin template |
| Client wiring | `client/src/views/admin/tabs/BusinessControlsTab.vue` — tab + `VWindowItem` |
| Client orchestration | `client/src/composables/admin/useBusinessControlsTab.ts` — compose loading/error/success, `handleSave` branch, optional `provide` if section needs shared state |
| Client strings | `client/src/configs/businessControlsTabStrings.ts` — tab label, help, button labels |
| Client utils (optional) | Small named helper e.g. `getEligibleUserTypeStateControlInstances(globalData)` next to or reusing patterns from `eventAttendeeUtils.ts` — **only if** it keeps composable under complexity thresholds |

### Approach

1. Implement **`api.ts`**: parse `GET` response `{ alignments }`; `PUT` sends `UserRoleBlockAlignmentDto`; log errors via `createLogger`.
2. Implement **composable**: refs for draft alignments, loading/saving/error/success; `loadSettings` / `saveSettings`; watch `enabled` like organization defaults.
3. Build **section component**: iterate `USER_ROLE_VALUES`; each row binds to draft; options computed from global data + block shape filter.
4. **Wire Business Controls**: new tab value, strings, aggregate loading/error/success, `handleSave` for that tab, clear errors in `clearAllErrors`.
5. **Verify:** `npm run start:dev`, `cd client && npm run lint` and `vue-tsc` / typecheck as used in repo; no new tests (project: testing suspended).

### Checkpoint

After **6.18.2.2:** Staff user with ownership can open Business Controls → new tab, see current alignments, change a role’s instance, save, reload and see persistence; invalid instance rejected by API shows server message.

### Deliverables

- Config API module for user-role-block-alignment GET/PUT.
- `useAdminUserRoleBlockAlignment` composable with documented return type.
- New Business Controls sub-tab UI + strings.
- No server or shared-type changes unless a missing export is discovered (unlikely).

### Acceptance Criteria

- [ ] `GET` loads existing `alignments` into the form when the tab becomes active (lazy load acceptable).
- [ ] `PUT` persists changes; success and error feedback visible; CSRF/cookies respected via existing `apiClient`.
- [ ] Pickers only list block instances that are **user** type under **state-control** shapes (client-side filter aligned with server).
- [ ] All roles in `USER_ROLE_VALUES` that the UI exposes are saveable as UUID or cleared (`null`).
- [ ] `useBusinessControlsTab` `loading`/`error`/`success` includes the new composable; Save on that tab invokes alignment save only (not other tabs).
- [ ] Client lint passes; app starts.

### Design

- Add a **new Business Controls main tab** (e.g. `roles` / “Role & user-type mapping”) with:
  - Short **help text** explaining that this overrides the legacy name-based map and points to Instances docs for creating user-type state-control block instances.
  - One row per **`USER_ROLE_VALUE`**: label + **`VSelect`** (or autocomplete) of eligible instances; optional “Clear override” → `null` for that key.
  - **Load** on tab enable: `GET /user-role-block-alignment` → populate local draft `Partial<Record<UserRoleValue, string | null>>`.
  - **Save** on primary action for that tab: `PUT` body `UserRoleBlockAlignmentDto` — send **full desired state** for all rows the UI edits (merge loaded + edits so omitted keys are not accidentally wiped — **implement as:** maintain full object keyed by every displayed role, values `string | null`).
- **Eligible instances (client filter):** From `useGlobal().getGlobalData()`, block instances whose `blockShapeRef` resolves to a `blockShape` with `isStateControl === true` and `type === 'user'` (match server validator). Display label: instance name/title field consistent with other admin selects + id if needed for disambiguation.
- **UX:** Disable save while loading or saving; show success toast/message pattern consistent with organization defaults (timeout clear optional); dirty detection optional — minimum viable: always PUT on Save with current draft.

---
