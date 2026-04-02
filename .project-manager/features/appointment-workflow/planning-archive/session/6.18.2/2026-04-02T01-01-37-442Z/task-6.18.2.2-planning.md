# Plan: task 6.18.2.2 — Admin UI: user role ↔ user-type block instance alignment

## Contract
- **Tier:** task | **ID:** 6.18.2.2
- **Scope:** Client-only admin surface to load/save persisted `user_role` → `block_instance_id` overrides (API from 6.18.2.1).
- **Governance:** Governance Context (Task)

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function, composable, component
- **Gate profile:** fast
- **Suggested depth:** leaf — advisory; agent decides in Analysis / Decomposition
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition.

## Where we left off
- [x] **Task 6.18.2.1** shipped: `GET`/`PUT` `/api/v1/internal/user-role-block-alignment`, repository, `userTypeMapping` override read + cache invalidation, shared `UserRoleBlockAlignmentDto`.
- [x] **Task 6.18.2.2:** Build Business Controls (or equivalent admin) UI: matrix of roles → eligible instance pickers, load/save, errors, help text.

## Parent context (session planning — Analysis excerpt)

- **Why now:** Operators need to change alignment without deploys; persistence and runtime already honor overrides after 6.18.2.1.
- **Domains:** **Admin client** — settings surface, `apiClient` calls, composable orchestration, Vuetify forms; **Shared** — reuse `USER_ROLE_VALUES`, `UserRoleBlockAlignmentDto` for typing only.

## Story
**This task adds** an admin settings panel **because** staff must view and edit which **user-type block instance** each canonical **`user_role`** maps to, using the existing internal API, with pickers constrained to the same eligibility rules the server enforces (user-shaped block under a state-control shape).

---
## Architecture context (harness-injected)

## 1. System overview

Bonsai Differential Scheduler is a **Vue 3 + Express + Sequelize** application with a **shared type layer** (`shared/` / `@shared`). It serves:

- **Public booking users** — wizard-style scheduling and property/availability flows.
- **Admin configurators** — metadata-driven entity CRUD, wizard settings, availability rules, integrations.

TanStack **Vue Query** manages server-state caching. Composables typically expose **`ComputedRef<T>`** for read-only query data. Admin metadata is often batch-prefetched (e.g. router navigation guards).

---

## 2. Domain map

| Domain | Client paths | Server paths | Key models / areas | Shared types |
|--------|----------------|-------------|---------------------|--------------|
| **Booking / Wizard** | `client/src/composables/booking/`, `useBooking.ts`, `useAppointment.ts`, `useProperty.ts`, `components/booking/`, `views/booking/`, `types/booking/`, `configs/wizardSteps`, `configs/availabilitySettings` | `server/src/routes/internal/appointments`, `availability`, `properties`, `services/availability*`, `db/models` booking-related | Appointments, selections, time slots, properties, fees | `@shared/types` availability, appointment-related |
| **Admin / Config** | `composables/admin/`, `components/admin/`, `views/admin/`, `types/admin/`, `configs/` | `routes/internal/entities`, `relationships`, `admin-metadata`, `*-settings`, `db/models` admin | Shapes, instances, wizard settings, calendar settings, business rules | `@shared/types/entities` |
| **Auth / Sessions** | Router guards; future `composables/auth/` | `routes/internal/auth`, `auth/`, `db/models/auth` | Sessions, users, magic links (evolving); **`users.user_role`** (ENUM + API) | Auth contracts in `@shared` as they stabilize; **canonical role strings** via `@shared` (`USER_ROLE_VALUES` — Feature 6 Session 6.18.1) |
| **Integrations** | `services/calendarApiService`, `mapsApiService`, `propertyEnrichmentApiService` (full-URL axios) | `routes/external/calendar`, `oauth`, `maps`, `services/google/` | OAuth, external APIs | `@shared/types/calendar` |
| **Beta** | `composables/beta/`, `views/beta/`, `components/beta/` | `routes/internal/beta-feedback`, `db/models/beta` | Beta feedback | (often local types) |

---

## 3. Data flow

Canonical path:

1. **Vue view** → **presentational component**
2. **Composable** (state + orchestration; thin components)
3. **Client HTTP**
   - **Default:** `@/utils/api` (axios instance, `baseURL` = `VITE_API_BASE_URL` or `/api/v1/internal`) — relative paths such as `/user-role-block-alignment`.
   - **Integrations:** `services/*ApiService` — full-base-URL axios (calendar, maps, enrichment).
4. **Express route** (`routes/internal/*` or `routes/external/*`)
5. **Service** (`server/src/services/`)
6. **Repository** (`server/src/repositories/`) or direct Sequelize access
7. **Sequelize model** (`server/src/db/models/`)

Cross-cutting: **transformers** (e.g. global → booking), **injection keys** for wizard scope, **TanStack Query** keys + invalidation for mutations.

**Booking resolution boundary:** The server serves **configuration and raw storage rows** (e.g. part instances, relationships) plus appointment-scoped inputs such as `property_details`. **PartFinalizer** on the **client** resolves wizard time, fee, and segment placement for the live booking flow. On submit, the client sends a **full appointment payload**; the server **persists** it and does **not** re-run PartFinalizer to recompute or “verify” those totals. Do not introduce a second booking calculator on the server for the same contract (see §10).

---

## 4. Type boundaries

| Layer | Location | Use when |
|-------|----------|----------|
| **Shared contracts** | Repo `shared/`, imported as `@shared/types/...` | Types needed by **both** client and server (API shapes, branded IDs, shared enums). |
| **Client-only** | `client/src/types/<domain>/` | UI-only: injection keys, wizard step types, transformer helpers, form field types. **Never** imported by server. |
| **Server-only** | `server/src/types/` | Handler params, repository types, internal DTOs. **Never** imported by client. |

**Rule:** If both sides need it → `@shared`. If only one side → keep it local.

**Reactivity boundaries:** Prefer `ComputedRef<T>` for read-only consumer APIs; `Ref<T>` for internal mutable state; avoid leaking `Ref | ComputedRef` unions at public composable boundaries (see type governance rule + TYPE_AUTHORING_PLAYBOOK).

---
## Codebase recon (agent-led — required)

- **Paths reviewed:**
  - `client/src/utils/api/apiClientCore.ts` — default `baseURL` `/api/v1/internal`; mutating methods attach CSRF when cookie present.
  - `client/src/configs/organizationDefaults/api.ts` + `useAdminOrganizationDefaults.ts` — pattern for thin config `get` + composable `load`/`save` with `enabled` watch.
  - `client/src/views/admin/tabs/BusinessControlsTab.vue` + `useBusinessControlsTab.ts` — `VTabs`/`VWindow` per section; `handleSave` branches on `currentMainTab`; aggregated `loading`/`error`/`success`.
  - `client/src/utils/eventAttendeeUtils.ts` — `getAllUserTypeBlockIds(globalData)` filters block instances whose shape is `isStateControl`; server additionally requires `shape.type === 'user'` (see `validateUserRoleBlockAlignmentPayload.ts`).
  - `server/src/routes/internal/userRoleBlockAlignment/userRoleBlockAlignmentRouter.ts` — `GET`/`PUT` `/` return `{ alignments }` JSON body.
  - `shared/types/userRoleBlockAlignment.ts` — `UserRoleBlockAlignmentDto`; `shared/constants/roleConstants.ts` — `USER_ROLE_VALUES`.
  - `client/src/composables/useGlobal.ts` / `useAdmin.ts` — global entity lists for picker options.
- **Patterns / call sites:** Config module under `client/src/configs/<feature>/api.ts` + admin composable with logger on catch; Business Controls as single form with tab-specific save behavior.
- **Gaps / unknowns:** Exact human-readable labels per `UserRoleValue` in admin (reuse existing admin strings if any; else derive from role key). Whether to hide `admin` row product-wise — **default:** show all `USER_ROLE_VALUES` for parity with server keys.

## Analysis
- **Problem:** Without UI, alignment changes require DB or API tools; 6.18.2.1 made the API staff-auth gated and validated.
- **Boundaries:** Admin client + shared types/constants only; **no** server or migration changes in this task.
- **Patterns to follow:** Mirror `useAdminOrganizationDefaults` (optional `enabled` when sub-tab visible); use `createLogger` in catch paths; keep `BusinessControlsTab.vue` thin — new section component + composable wiring in `useBusinessControlsTab`.
- **Risks:** Picker options out of sync with server rules → surface server `400` message in `VAlert`; after successful save, booking flows that cache user-type mapping on server are refreshed via server invalidation (no extra client step).
- **Alternatives:** Separate admin route instead of Business Controls tab — rejected to keep operational settings together; higher discoverability cost.

## Design
- Add a **new Business Controls main tab** (e.g. `roles` / “Role & user-type mapping”) with:
  - Short **help text** explaining that this overrides the legacy name-based map and points to Instances docs for creating user-type state-control block instances.
  - One row per **`USER_ROLE_VALUE`**: label + **`VSelect`** (or autocomplete) of eligible instances; optional “Clear override” → `null` for that key.
  - **Load** on tab enable: `GET /user-role-block-alignment` → populate local draft `Partial<Record<UserRoleValue, string | null>>`.
  - **Save** on primary action for that tab: `PUT` body `UserRoleBlockAlignmentDto` — send **full desired state** for all rows the UI edits (merge loaded + edits so omitted keys are not accidentally wiped — **implement as:** maintain full object keyed by every displayed role, values `string | null`).
- **Eligible instances (client filter):** From `useGlobal().getGlobalData()`, block instances whose `blockShapeRef` resolves to a `blockShape` with `isStateControl === true` and `type === 'user'` (match server validator). Display label: instance name/title field consistent with other admin selects + id if needed for disambiguation.
- **UX:** Disable save while loading or saving; show success toast/message pattern consistent with organization defaults (timeout clear optional); dirty detection optional — minimum viable: always PUT on Save with current draft.

## Goal
Operators can **view and edit** persisted **user_role → block_instance_id** alignment from admin **without code changes**, using the **6.18.2.1** API, with pickers limited to **user-type state-control** instances.

## Files (primary)

| Layer | Paths (expected touch) |
|--------|-------------------------|
| Client config | **New** `client/src/configs/userRoleBlockAlignment/api.ts` — `getUserRoleBlockAlignment()`, `putUserRoleBlockAlignment(dto)` using `apiClient` from `@/utils/api` |
| Client composable | **New** `client/src/composables/admin/useAdminUserRoleBlockAlignment.ts` — load/save, `enabled` option, explicit return type |
| Client view | **New** `client/src/views/admin/tabs/BusinessControlsRoleAlignmentSection.vue` (or under `tabs/components/`) — thin template |
| Client wiring | `client/src/views/admin/tabs/BusinessControlsTab.vue` — tab + `VWindowItem` |
| Client orchestration | `client/src/composables/admin/useBusinessControlsTab.ts` — compose loading/error/success, `handleSave` branch, optional `provide` if section needs shared state |
| Client strings | `client/src/configs/businessControlsTabStrings.ts` — tab label, help, button labels |
| Client utils (optional) | Small named helper e.g. `getEligibleUserTypeStateControlInstances(globalData)` next to or reusing patterns from `eventAttendeeUtils.ts` — **only if** it keeps composable under complexity thresholds |

## Files
[Refine during implementation if a type file is needed under `client/src/types/admin/` for section props — prefer inline props for a single consumer.]

## Approach
1. Implement **`api.ts`**: parse `GET` response `{ alignments }`; `PUT` sends `UserRoleBlockAlignmentDto`; log errors via `createLogger`.
2. Implement **composable**: refs for draft alignments, loading/saving/error/success; `loadSettings` / `saveSettings`; watch `enabled` like organization defaults.
3. Build **section component**: iterate `USER_ROLE_VALUES`; each row binds to draft; options computed from global data + block shape filter.
4. **Wire Business Controls**: new tab value, strings, aggregate loading/error/success, `handleSave` for that tab, clear errors in `clearAllErrors`.
5. **Verify:** `npm run start:dev`, `cd client && npm run lint` and `vue-tsc` / typecheck as used in repo; no new tests (project: testing suspended).

## Checkpoint
After **6.18.2.2:** Staff user with ownership can open Business Controls → new tab, see current alignments, change a role’s instance, save, reload and see persistence; invalid instance rejected by API shows server message.

## Deliverables
- Config API module for user-role-block-alignment GET/PUT.
- `useAdminUserRoleBlockAlignment` composable with documented return type.
- New Business Controls sub-tab UI + strings.
- No server or shared-type changes unless a missing export is discovered (unlikely).

## Acceptance Criteria
- [ ] `GET` loads existing `alignments` into the form when the tab becomes active (lazy load acceptable).
- [ ] `PUT` persists changes; success and error feedback visible; CSRF/cookies respected via existing `apiClient`.
- [ ] Pickers only list block instances that are **user** type under **state-control** shapes (client-side filter aligned with server).
- [ ] All roles in `USER_ROLE_VALUES` that the UI exposes are saveable as UUID or cleared (`null`).
- [ ] `useBusinessControlsTab` `loading`/`error`/`success` includes the new composable; Save on that tab invokes alignment save only (not other tabs).
- [ ] Client lint passes; app starts.

## Implementation orders
1. Add `client/src/configs/userRoleBlockAlignment/api.ts` (GET/PUT, typed with `UserRoleBlockAlignmentDto` / response shape).
2. Add eligible-instance helper (inline or `utils/`) using `GlobalData` + `blockShape` join.
3. Add `useAdminUserRoleBlockAlignment.ts` with `AdminSettingsTabQueryOptions`-style `enabled` and explicit return interface.
4. Add `BusinessControlsRoleAlignmentSection.vue` (props: bind to composable outputs or inject if already provided — prefer props from parent for clarity).
5. Update `businessControlsTabStrings.ts` with tab label and help copy.
6. Update `BusinessControlsTab.vue` (new `VTab` + `VWindowItem` + section).
7. Update `useBusinessControlsTab.ts` (wire composable, `handleSave`, `clearAllErrors`, loading/error/success aggregation).
8. Run client lint and fix any governance issues; smoke-test admin path manually.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint` if any server files touched — expect **client-only**)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.18.2-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.18.2.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
