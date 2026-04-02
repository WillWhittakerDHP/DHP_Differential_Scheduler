# Plan: task 20.3.4.1 — 20.3.4.1

## Contract
- **Tier:** task | **ID:** 20.3.4.1
- **Scope:** 20.3.4.1
- **Governance:** Governance Context (Task)

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function
- **Gate profile:** fast
- **Suggested depth:** leaf — advisory; agent decides in Analysis / Decomposition
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition.

## Where we left off
- [ ] #### Task 20.3.4.1: Event block instance segment panel **Goal:** Per–**event** block instance, list/create/delete/reorder **`eventInstance`** segments with **`parentBlockInstanceId`** set; reuse Instances-tab patterns. **Out of scope:** Instances tab removal (**20.3.4.2**).

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** §8.3 sequence places **segment relocation** after domain editors (**20.3.3**). Today, segments are edited under **Instances → Events**, away from the **event block instance** that owns orchestration context — admins lack a single place to manage “this block’s calendar segments.”
- **Domain boundaries:** **Admin / config** client; **reuse** existing `event… _(truncated)_

## Story
**This task adds** a **Segments** panel on **event-shaped block instance** cards **because** FEATURE_20 **§8.3 #4** requires segment management next to the owning block instance; server validation already **requires `parentBlockInstanceId`** on `eventInstance` create (`eventInstanceEntityValidation.ts`), and the current Instances-tab create path does not send it — this task fixes the **card-scoped** path and establishes shared building blocks for **20.3.4.2**.

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
   - **Default:** `utils/api/apiClient` — relative paths, same-origin API.
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
Injected docs above are not a substitute for opening real code. Search/read `client/`, `server/`, and `shared/` as relevant to this tier.

- **Paths reviewed:** `client/src/utils/admin/blockInstanceShape.ts` (`getBlockInstanceShapeProperties` — **type** not exposed today; uses `BLOCK_SHAPE_TYPES`); `client/src/components/admin/generic/EntityCardContent.vue` (mount point for block-instance editors); `client/src/views/admin/tabs/components/EventInstancesSection.vue`, `EventInstanceListItem.vue`, `EventInstanceBuilderBody.vue`; `client/src/composables/admin/useInstancesTabEventInstance.ts` (**create** omits **`parentBlockInstanceId`**); `client/src/composables/admin/useInstancesTabEventInstanceDrag.ts` + `client/src/utils/admin/mountEventInstancesDragAndDrop.ts` (drag/order); `client/src/types/entities.ts` (`EventInstanceEntity.parentBlockInstanceId`); `server/src/routes/internal/entities/eventInstanceEntityValidation.ts` (**create requires parent**).
- **Patterns / call sites:** Instances tab composes **context + expansion panels + builder + list items + Sortable**. Card path should **reuse** child components where props match; **new composable** owns filtered entities + create/delete + local expansion state keyed by **`blockInstanceId`**; **optional** small util for “default new segment draft” to share with Instances tab later.
- **Gaps / unknowns:** Confirm global `eventInstance` list from `useEntityCrud` includes **`parentBlockInstanceId`** after fetch (if missing, trace transformer — fix in this task if blocking). Drag mount uses **one** panels container per mount site — card panel needs **its own** refs + `mountEventInstancesDragAndDrop` call (same util, new instance).

## Analysis
- **Problem:** Segments are only manageable from **Instances → Events**; create payload likely **invalid vs server** (no parent). Admins need segments **on the event block instance card** per §8.3 #4.
- **Boundaries:** **Client admin** only; **reuse** `useEntityCrud('eventInstance')` — no new server routes; **no** PartFinalizer changes.
- **Patterns:** Thin **`EventBlockInstanceSegmentsPanel.vue`** + **`useBlockInstanceEventSegments`**; mirror **`useInstancesTabEventInstance` / `useInstancesTabEventInstanceDrag`** behavior for a **fixed** parent id.
- **Risks:** Duplicate drag listeners if multiple cards mount Sortable — scope DOM roots to the card panel only. Expansion panel id collisions — prefix panel values with **`blockInstanceId`** or use **local** `expandedPanels` ref not shared with Instances tab.
- **Alternatives:** Inline all logic in `EntityCardContent` — **rejected** (component governance). New API “segments by parent” — **rejected** (filter client-side).

## Design
1. **Detect event shape:** Extend **`getBlockInstanceShapeProperties`** (or add **`getBlockInstanceShapeType`**) to expose **`shapeType`** or **`isEvent: shape.type === BLOCK_SHAPE_TYPES.EVENT`** so `EntityCardContent` can gate the panel without duplicate store reads.
2. **Composable `useBlockInstanceEventSegments(parentBlockInstanceId)`** (explicit return type):
   - `useEntityCrud('eventInstance')` + `useEntityCrud('eventShape')` for shapes list.
   - `segmentsForParent = computed` filter `parentBlockInstanceId === parentBlockInstanceId`.
   - **Create:** `create({ ...fields, parentBlockInstanceId: parent })` — match entity CRUD payload shape (camelCase).
   - **Delete / reorder:** same as Instances tab (`remove`, `patchOrderIndex`).
   - **UI state:** `isCreating`, `newEventInstanceData`, `templateWarnings` — copy patterns from **`useInstancesTabEventInstance`**; optionally extract **`openDefaultNewEventSegmentDraft(eventShapes, parentId)`** to `utils/admin/` if it reduces duplication.
3. **Drag:** Instantiate **`useInstancesTabEventInstanceDrag`-style** logic **inside** the composable or a dedicated **`useBlockInstanceEventSegmentDrag`** that takes **`filteredEventInstances`** computed for **this parent only** and **local** container/panels refs; call **`mountEventInstancesDragAndDrop`** in **`onMounted` + nextTick** with those refs.
4. **Component `EventBlockInstanceSegmentsPanel.vue`:** `VCard` title “Calendar segments” (or “Event segments”); **Create** button; **`VExpansionPanels`** listing **`EventInstanceListItem`** + **new** panel using **`EventInstanceBuilderBody`**; wire emits/handlers to composable.
5. **`EntityCardContent.vue`:** `v-if="entityKey === 'blockInstance' && !isNew && isEventBlockInstance"` pass **`entityId`** as parent; do **not** remove Instances tab in this task.

**Pseudocode (mount):**
```vue
<EventBlockInstanceSegmentsPanel
  v-if="showEventSegments"
  :block-instance-id="entityId"
/>
```

## Goal
Deliver the **first half** of session **20.3.4**: an **event block instance–scoped** segment (**`eventInstance`**) panel with **valid `parentBlockInstanceId`** on create and **list / delete / reorder** parity with the current Instances-tab behavior — **without** removing the Instances **Events** tab yet (**20.3.4.2**).

## Files
- **Change / add:** `client/src/utils/admin/blockInstanceShape.ts` (or sibling) — expose **event** detection for block instance.
- **Add:** `client/src/composables/admin/useBlockInstanceEventSegments.ts` (and optionally `useBlockInstanceEventSegmentDrag.ts` if split keeps functions under complexity limits).
- **Add:** `client/src/components/admin/generic/EventBlockInstanceSegmentsPanel.vue`.
- **Change:** `client/src/components/admin/generic/EntityCardContent.vue` — mount panel + gate.
- **Maybe:** `client/src/utils/admin/eventInstanceSegmentDraft.ts` (pure helpers for default create payload) if shared with Instances tab in same or follow-up task.
- **Verify only:** `client/src/composables/entityCrud/*` create typing for `eventInstance` includes `parentBlockInstanceId`.

## Approach
1. Expose **event shape** flag from block instance + shape store helper.
2. Implement **`useBlockInstanceEventSegments`** (filter, CRUD, inline create state, logging on catch).
3. Add **panel component** reusing **`EventInstanceListItem`** / **`EventInstanceBuilderBody`** / expansion layout from **`EventInstancesSection`**.
4. Wire **drag** with **card-local** refs.
5. Mount from **`EntityCardContent`** for **event** instances only.
6. Run **`cd client && npm run lint`** and **`npm run type-check`**; manual smoke: open **event** block instance → create segment → reorder → delete.

## Checkpoint
- **This task:** Event block instance card shows segments; **create** succeeds with **parent** set; order updates persist; **Instances → Events** still works (unchanged).
- **Next task (20.3.4.2):** Remove or replace global Events editor.

## Deliverables
- [ ] **`EventBlockInstanceSegmentsPanel`** + composable(s) on **`EntityCardContent`** for **event** block instances (`!isNew`).
- [ ] **Create** payload includes **`parentBlockInstanceId`** aligned with server validation.
- [ ] **List / delete / reorder** for segments whose parent matches the card.
- [ ] Client **lint** + **type-check** clean.

## Acceptance Criteria
- [ ] Panel appears **only** for **event**-type block instances (not service/time/price/user).
- [ ] New segment **create** sends **`parentBlockInstanceId`** equal to the card’s block instance id.
- [ ] **Delete** and **drag reorder** update persisted order (same mechanism as Instances tab).
- [ ] **No** removal of **`EventInstancesSection`** / Instances **Events** tab in this task.
- [ ] **`cd client && npm run lint`** and **`npm run type-check`** pass.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
