# Plan: task 20.3.4.2 — 20.3.4.2

## Contract
- **Tier:** task | **ID:** 20.3.4.2
- **Scope:** Instances tab — remove **Events** island; trim **`InstancesTabContext`**; guidance only; dedupe **eventInstance** global metadata modal (keep **Shapes** tab path).
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
- [ ] #### Task 20.3.4.2: Instances tab — remove duplicate Events editor **Goal:** Drop **Instances → Events** segment CRUD + trim **`InstancesTabContext`**; keep **global Event Instance field metadata** via **Shapes → Events → Instance Fields** (existing); add short **guidance** on Instances tab pointing admins to **event block instance** cards. **Depends on:** **20.3.4.1** (card segment panel) merged.

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** §8.3 sequence places **segment relocation** after domain editors (**20.3.3**). Today, segments are edited under **Instances → Events**, away from the **event block instance** that owns orchestration context — admins lack a single place to manage “this block’s calendar segments.”
- **Domain boundaries:** **Admin / config** client; **reuse** existing `event… _(truncated)_

## Story
**This task removes** the redundant **Instances tab → Events** full segment editor and **slims** `useInstancesTab` / **`InstancesTabContext`** **because** **20.3.4.1** moved segment CRUD to **event block instance** cards; keeping two primary editors violates §8.3 #4 intent. **Global** `/admin-metadata` for **eventInstance** fields remains available from **Shapes** (duplicate modal on Instances tab is removed).

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

- **Paths reviewed:** `client/src/views/admin/tabs/InstancesTab.vue` (**Events** `VTab` + `VWindowItem` + duplicate **`MetadataEditModal`** for `eventInstance` global fields); `client/src/composables/admin/useInstancesTab.ts` (wires **`useInstancesTabEventInstance`**, **`useInstancesTabEventInstanceDrag`**, **`useEntityCrud('eventInstance')`**, builds **`instancesTabContext`**); `client/src/types/admin/adminInjectionKeys.ts` (**`InstancesTabContext`** — many event-only fields); `client/src/views/admin/tabs/components/BlockInstancesGroup.vue` (**inject** context — **no** event fields used); `client/src/views/admin/tabs/ShapesTab.vue` + **`ShapesTabEventPanel.vue`** (already **`MetadataEditModal`** + **Instance Fields** for **`eventInstance`** global config); `EventInstancesSection.vue` / **`useEventInstancesSection.ts`** / **`useInstancesTabEventInstance.ts`** / **`useInstancesTabEventInstanceDrag.ts`** (only consumed from Instances tab path); `client/src/types/admin/instancesTab.ts` (**`UseInstancesTabReturn`** includes **`filteredEventInstances`**, modal refs).
- **Patterns / call sites:** **BlockInstancesGroup** only needs block-instance drag/shape context — safe to strip event slice from **`InstancesTabContext`**. **Shapes** tab is the canonical place for **global** event instance **field metadata** modal; Instances tab’s second copy is redundant.
- **Gaps / unknowns:** None blocking — confirm no other `inject(instancesTabContextKey)` consumers beyond **BlockInstancesGroup** (grep before delete).

## Analysis
- **Problem:** After **20.3.4.1**, segment CRUD lives on **event** block instance cards; the **Instances → Events** tab is duplicate UX and keeps a large, error-prone context surface.
- **Boundaries:** **Client admin** only; **no** API changes; **no** removal of **Shapes**-tab event tooling.
- **Risks:** Admins lose discoverability — mitigate with a **visible `VAlert`** on Instances tab (tonal info) with pointers: open an **event** block instance → **Calendar segments**; edit **event instance field definitions** under **Shapes → Events → Instance Fields**.
- **Alternatives:** Read-only aggregate list of all segments on Instances tab — **rejected** for this task (adds maintenance); optional follow-up if product requests.

## Design
1. **`InstancesTab.vue`:** Remove **Events** `VTab`, **`VSpacer`** adjustment if needed (keep **Calibration** tab layout readable). Remove **`VWindowItem value="eventInstances"`**. Remove **`EventInstancesSection`** import. Simplify **empty BlockShapes** `VAlert` (drop `activeTab !== 'eventInstances'` branch). Remove **duplicate** bottom **`MetadataEditModal`** for **`eventInstance`** (lines ~158–163 pattern). Add **`VAlert`** (info, tonal, `class="mb-4"`) above **`VWindow`**: short copy + link-style text to **Shapes → Events** for global field metadata (plain text; no new router API).
2. **`useInstancesTab.ts`:** Delete **`useInstancesTabEventInstance`**, **`useInstancesTabEventInstanceDrag`**, **`useEntityCrud('eventInstance')`** / **`eventShapes`** wiring used only for Events tab; remove **`eventInstanceFieldsGlobalEntity`** computed; strip **`instancesTabContext`** down to fields **BlockInstancesGroup** still needs. Remove **`void eventInstancesContainer.value`** hack. Drop **`toGlobalEntityId`** import if unused after removal.
3. **`adminInjectionKeys.ts`:** **`InstancesTabContext`** — remove all **`event*`** / **`template*`** / **`openCreate*`** / **`handleEventInstance*`** / **`eventInstancesContainer`** properties; update comment (**BlockInstancesGroup** only). Remove **`NewEventInstanceData`** import if unused.
4. **`instancesTab.ts`:** Update **`UseInstancesTabReturn`** — remove **`filteredEventInstances`**, **`eventInstanceMetadataModalOpen`**, **`eventInstanceFieldsGlobalEntity`**.
5. **Delete dead modules:** `EventInstancesSection.vue`, `useEventInstancesSection.ts`, `useInstancesTabEventInstance.ts`, `useInstancesTabEventInstanceDrag.ts`; **`client/src/types/admin/instancesTabEventInstanceDrag.ts`** if nothing else imports it after deletes.
6. **`instancesTabEventInstance.ts`:** Keep **`NewEventInstanceData`** (still used by **`EventInstanceBuilderBody`**, **`useBlockInstanceEventSegments`**); remove **`UseInstancesTabEventInstanceParams`** if unused after deleting composable.
7. **Styles:** Remove **`.event-instances-tab`*** rules from **`InstancesTab.vue`** scoped CSS if obsolete.
8. **Audit config:** If **`audit-global-config.json`** references deleted paths, update allowlist rows only if CI fails (prefer minimal touch).

## Goal
Complete session **20.3.4** cleanup: **remove** the **Instances** tab **Events** island and **deduplicate** global **eventInstance** metadata editing (single path: **Shapes** tab), after **20.3.4.1** delivers card-scoped segments.

## Files
- **Edit:** `client/src/views/admin/tabs/InstancesTab.vue`, `client/src/composables/admin/useInstancesTab.ts`, `client/src/types/admin/adminInjectionKeys.ts`, `client/src/types/admin/instancesTab.ts`, `client/src/types/admin/instancesTabEventInstance.ts` (trim unused exports)
- **Delete:** `client/src/views/admin/tabs/components/EventInstancesSection.vue`, `client/src/composables/admin/useEventInstancesSection.ts`, `client/src/composables/admin/useInstancesTabEventInstance.ts`, `client/src/composables/admin/useInstancesTabEventInstanceDrag.ts`, `client/src/types/admin/instancesTabEventInstanceDrag.ts` (if unused)
- **Verify:** `grep` for **`EventInstancesSection`**, **`useEventInstancesSection`**, **`InstancesTabContext`** event keys

## Approach
1. Shrink **`InstancesTabContext`** + **`useInstancesTab`** + **`InstancesTab.vue`** per Design.
2. Delete obsolete components/composables/types.
3. `cd client && npm run lint` + `npm run type-check`.
4. Manual smoke: **Instances** tab (per-shape + calibration); **Shapes → Events → Instance Fields** modal still opens; **event** block instance card **segments** still work (**20.3.4.1**).

## Checkpoint
- Instances tab has **no** Events sub-tab and **no** duplicate **eventInstance** metadata modal.
- **Shapes** tab still exposes **Event Instance Fields (Global)**.
- **Lint/type-check** clean; no broken inject in **BlockInstancesGroup**.

## Deliverables
- [ ] Removed **Events** tab UI and related composable wiring from **`useInstancesTab`**.
- [ ] Trimmed **`InstancesTabContext`** + fixed **provide** object.
- [ ] Guidance **`VAlert`** on Instances tab.
- [ ] Deleted dead files (list above).
- [ ] Client **lint** + **type-check** pass.

## Acceptance Criteria
- [ ] **Instances** tab: no **Events (`n`)** tab; no **`EventInstancesSection`**.
- [ ] **`InstancesTabContext`** contains **no** event-segment CRUD or event modal state.
- [ ] **Shapes → Events** still opens **Event Instance Fields** global metadata modal.
- [ ] **Event** block instance cards still show **Calendar segments** panel (**20.3.4.1**).
- [ ] **`cd client && npm run lint`** and **`npm run type-check`** pass.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.4.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
