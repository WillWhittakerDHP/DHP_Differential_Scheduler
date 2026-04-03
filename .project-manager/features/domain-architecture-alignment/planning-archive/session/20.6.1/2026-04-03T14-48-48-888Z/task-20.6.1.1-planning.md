# Plan: task 20.6.1.1 — 20.6.1.1

## Contract
- **Tier:** task | **ID:** 20.6.1.1
- **Scope:** 20.6.1.1
- **Governance (harness snapshot):**
  - Governance Context (Task)
  - File-Scoped Violations
  - No existing violations in task files.
  - Thresholds (Quick Reference)

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
- [ ] #### Task 20.6.1.1: Client cutover off admin-metadata API **Goal:** No runtime calls to **`/admin-metadata`** or **`/admin-metadata/batch`**; remove **`['adminMetadata']`** prefetch and mutations; replace **FieldRenderer** / metadata editor dependencies with explicit non-metadata patterns. **Files:** `client/src/router/index.ts`, `client/src/utils/api/adminMetadataApi.ts`, `client/src/composables/admin/useMetadataCache.ts`, `client/src/composables/admin/useAdminMetadataMutations.ts`, related call sites (see **`session-20.6.1-planning.md`**) **Approach:** Inventory consumers with ripgrep; (See tier-up guide linked below)

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** **§8.6** / **§6.3a** require **full** metadata infrastructure removal. **20.5** documented retirement **ordering**; **20.6.1** executes **client + API + server model** teardown for the metadata stack (DDL in same session or follow-up task if split for safety).
- **Boundaries:** **Admin** client + **server internal routes** + **DB models**; must **not** ch… _(truncated)_

## Story
**This task changes** the **Vue client** so it **never calls** **`/admin-metadata`** or **`/admin-metadata/batch`**, and **does not rely** on TanStack **`['adminMetadata']`** network hydration **because** **Task 20.6.1.2** will remove the server routes—**the client must be decoupled first** per Pass 5 retirement ordering.

---
## Architecture context (harness-injected)

## 1. System overview

Bonsai Differential Scheduler is a **Vue 3 + Express + Sequelize** application with a **shared type layer** (`shared/` / `@shared`). It serves:

- **Public booking users** — wizard-style scheduling and property/availability flows.
- **Admin configurators** — domain-specific editors for shapes/instances, wizard settings, availability rules, integrations (target: **no** DB-driven admin metadata pipeline; see `FEATURE_20_ARCHITECTURE_REDESIGN.md` §6.3).

TanStack **Vue Query** manages server-state caching. Composables typically expose **`ComputedRef<T>`** for read-only query data. Until the metadata stack is removed (Feature 20 Pass 6), some admin routes may still prefetch legacy metadata — treat that as **transitional**, not the end state.

---

## 2. Domain map

| Domain | Client paths | Server paths | Key models / areas | Shared types |
|--------|----------------|-------------|---------------------|--------------|
| **Booking / Wizard** | `client/src/composables/booking/`, `useBooking.ts`, `useAppointment.ts`, `useProperty.ts`, `components/booking/`, `views/booking/`, `types/booking/`, `configs/wizardSteps`, `configs/availabilitySettings` | `server/src/routes/internal/appointments`, `availability`, `properties`, `services/availability*`, `db/models` booking-related | Appointments, selections, time slots, properties, fees | `@shared/types` availability, appointment-related |
| **Admin / Config** | `composables/admin/`, `components/admin/`, `views/admin/`, `types/admin/`, `configs/` | `routes/internal/entities`, `relationships`, `admin-metadata` (legacy until removed), `*-settings`, `db/models` admin | Shapes, instances, wizard settings, calendar settings, business rules | `@shared/types/entities` |
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

- **Paths reviewed:** `client/src/router/index.ts` (admin prefetch → **`getAdminMetadataBatchEndpoint`**); `client/src/utils/api/adminMetadataApi.ts`; `client/src/utils/api/apiExportBundleB.ts`; `client/src/composables/admin/useMetadataCache.ts` (singleton + **`useQuery`** **`fetchAllAdminMetadata`**); `client/src/composables/admin/useEntityMetadata.ts` → **`resolveEntityFieldMetadataRecord`**; `client/src/utils/admin/resolveEntityFieldMetadataRecord.ts`, `metadataCacheResolvers.ts`; `client/src/composables/admin/useAdminMetadataMutations.ts`, `adminMetadataSaveRequest.ts`; `client/src/composables/admin/useAdmin.ts`, `useEntityCardFieldContextAndVisibility.ts` (**`useFieldContextManager`**); `client/src/utils/entityDefaults.ts`, `client/src/utils/transformers/fetchToGlobalTransformer.ts`; `client/src/components/admin/metadata/AdminPrimitiveMetadataEditor.vue`, `MetadataEditModal.vue`; `client/src/components/admin/generic/fields/FieldRenderer.vue`, `EntityCardContent.vue`, `EntityFormContent.vue`, `DynamicForm.vue`, `EntityCardSubPanels.vue`, `EntityCardPrimaryTitleRow.vue`; invalidations in `useStatusButtonToggle.ts`, `usePrimitiveMetadataSave.ts`; messaging in `formFieldsMetadataWarningResolution.ts`, `useFieldContextManager.ts`, `useFieldRendererErrorWatch.ts`, `useBaseCollectionFieldCore.ts`, `PrimitiveInputs.vue`, `fieldContextDisplayConfigGuard.ts`.
- **Patterns / call sites:** **`MetadataCache`** shape lives in **`@/types/admin/metadataCache`**. **`useEntityMetadata`** pulls rows from **`metadataData`** (API-backed). **`FieldRenderer`** expects **`FieldMetadataEntry`** (label, fieldType, etc.). Router **prefills** query cache on **`/admin`** entry.
- **Gaps / unknowns:** There is **no** single **`ENTITY_CONFIGS`** file in client today; **code-first** `FieldMetadataEntry` maps may need to be **introduced or consolidated** from existing admin field config (e.g. entity card / form field lists). Exact parity with DB-driven metadata per entity is **TBD** during implementation—smoke-test admin flows and extend synthetic maps iteratively.

## Analysis
- **Problem:** Admin UI still **depends on HTTP metadata**; removing the API in **20.6.1.2** without this task **breaks** admin.
- **Boundaries:** **Client admin only**; no server edits in **20.6.1.1**; booking/wizard paths must stay unchanged.
- **Pattern:** Keep **`FieldMetadataEntry`** / **`FieldRenderer`** stable where possible; **swap the data source** from “remote cache” to **in-repo definitions** (or structured empty + overrides at call sites).
- **Risks:** **Regression** in entity forms if synthetic metadata is incomplete; mitigate with **incremental entity coverage** and manual smoke. **`useAdminMetadataMutations`** / **AdminPrimitiveMetadataEditor** become dead if metadata rows are gone—remove or replace with no-op + deprecation path per product.
- **Alternatives:** Leave a stub API client — **rejected** (task requires **zero** runtime calls).

## Design

### Target state
1. **No** `apiClient.get`/`post` to paths starting with **`/admin-metadata`** anywhere under **`client/src`**.
2. **`useMetadataCache`**: does **not** use **`useQuery`** with a network **`queryFn`**. It exposes the same **public** **`UseMetadataCacheReturn`** surface so downstream composables change minimally.
3. **`metadataData`**: sourced from **synchronous** or **computed** **code-defined** `MetadataCache` (see below), not from the server.
4. **Router guard:** Remove **`getAdminMetadataBatchEndpoint`** prefetch; do not import **`adminMetadataApi`** in **`router/index.ts`**.
5. **Mutations:** Remove **`useAdminMetadataMutations`** usage and **POST** paths; delete or stub **`adminMetadataSaveRequest.ts`**; **AdminPrimitiveMetadataEditor** / **MetadataEditModal** either removed, or rewritten to non-metadata flows—verify importers; default: **remove dead UI** that only exists for DB metadata.
6. **User-visible strings:** Replace “configure in **/admin-metadata**” with neutral “field configuration missing” where metadata is no longer a concept.

### Synthetic `MetadataCache`
- Add a module (e.g. **`client/src/utils/admin/codeFirstMetadataCache.ts`**) exporting **`buildCodeFirstMetadataCache(): MetadataCache`** with valid **`global`** keys and **`blockShapeSpecific`**.
- **Populate** from existing TS admin field definitions (discovered during coding). Start with **smoke-test** entities; extend until critical **FieldRenderer** paths resolve **`fieldType`** / **label**.

### Pseudocode (`useMetadataCache` core)
```
cache = ref(buildCodeFirstMetadataCache())
return { ensureMetadataLoaded: noop-or-once, getMetadata/getFieldMetadata via resolvers,
  invalidateMetadataCache: () => { cache.value = buildCodeFirstMetadataCache() },
  isLoading: ref(false), isLoaded: computed(true), error: ref(null),
  metadataData: computed(() => cache.value) }
```

## Implementation Orders
1. Add **`buildCodeFirstMetadataCache`** (empty-but-valid first; expand field maps iteratively).
2. Rewrite **`useMetadataCache.ts`** — remove network **`useQuery`**; wire **`metadataData`** to builder; keep singleton.
3. Edit **`router/index.ts`** — remove admin-metadata prefetch block and related imports.
4. Remove **`adminMetadataApi`** from barrels; delete file when no imports remain.
5. Remove **`useAdminMetadataMutations`**, **`adminMetadataSaveRequest.ts`**, and metadata-only editors after verifying importers.
6. Strip **`invalidateQueries` / `refetchQueries`** for **`['adminMetadata']`** where obsolete.
7. Update user-facing strings that cite **`/admin-metadata`**.
8. **`cd client && npm run lint`** and **`vue-tsc -b`**; smoke **`/admin`**.

**Out of scope:** Server (**20.6.1.2**).

## Goal
**Task 20.6.1.1 (client only):** Zero runtime HTTP to **`/admin-metadata`**; **`useMetadataCache`** backed by **code-first** (or static) **`MetadataCache`**; router **no prefetch**; metadata **mutation** pipeline removed; admin **smoke-critical** paths functional.

## Files
- **New (likely):** `client/src/utils/admin/codeFirstMetadataCache.ts` (or similar) — synthetic **`MetadataCache`**
- **Edit:** `client/src/composables/admin/useMetadataCache.ts`, `client/src/router/index.ts`, `client/src/utils/api/apiExportBundleB.ts`, `client/src/utils/api/index.ts` (if re-exports), all files from **Codebase recon** that reference **`admin-metadata`** or **`['adminMetadata']`** network behavior
- **Delete (when unused):** `client/src/utils/api/adminMetadataApi.ts`, `client/src/utils/admin/adminMetadataSaveRequest.ts`, `client/src/composables/admin/useAdminMetadataMutations.ts`, metadata-only components under `client/src/components/admin/metadata/` (verify importers)

## Approach
Follow **Implementation Orders** top to bottom. **Server** changes belong in **20.6.1.2** only.

## Checkpoint
- After **`/accepted-code`**: implement in repo; then **`/task-end 20.6.1.1`**.
- Do **not** start **20.6.1.2** until this task is ended and client is clean.

## Deliverables
- **Grep-clean:** no `apiClient` calls to `/admin-metadata` in `client/src`
- **Synthetic metadata** module + **`useMetadataCache`** rewrite
- **Router** without metadata prefetch
- **Removed** dead mutation/editor code paths tied to metadata POST
- **Client lint** + **vue-tsc** clean

## Acceptance Criteria
- [ ] `rg '/admin-metadata' client/src` shows **no** runtime URL construction used for **fetch** (string literals in comments/docs acceptable if scrubbed later).
- [ ] `cd client && npm run lint` passes.
- [ ] `npx vue-tsc -b` passes from `client/`.
- [ ] Manual smoke: authenticate → **`/admin`** → open at least **two** distinct entity editors that use **FieldRenderer** without hard failure (extend synthetic map as needed to meet this bar).

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] `cd client && npm run lint` passes (server lint optional for this client-only task unless touched)
- [ ] Session guide / log updated for **Task 20.6.1.1** completion

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.1-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
