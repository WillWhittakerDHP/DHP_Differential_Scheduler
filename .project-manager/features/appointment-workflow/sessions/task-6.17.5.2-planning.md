# Plan: task 6.17.5.2 — Client allowlist + list wiring + delete-contract docs

## Contract
- **Tier:** task | **ID:** 6.17.5.2
- **Scope:** Client + documentation only (server registry completed in **6.17.5.1**)
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
- [ ] #### Task 6.17.5.2: Client + docs — contract allowlist, BlockShape list wizard, extension guide **Goal:** Match **`dependencyDeleteRegistry`** on the client; wire **BlockShapeList**; document extension steps (**6.17.5.1** shipped server strategies).

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** Phase **6.17** success criteria require rollout beyond **`partShape`** and documentation for adding entities. Infrastructure and generic UI wiring exist; remaining work is **domain-specific strategies** + **client allowlist alignment** + **operator-facing extension doc**.
- **Domains:** Admin config **server** (delete strategies, Sequelize), **client** ad… _(truncated)_

## Story
**This task changes** the **client allowlist** and **BlockShapeList** delete path **so that** **`blockShape`** and **`annotationShape`** use **`AdminEntityDeleteWizard`** + preflight/finalize everywhere **`partShape`** already does, and operators/engineers have a **single checklist** for future keys.

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
| **Auth / Sessions** | Router guards; future `composables/auth/` | `routes/internal/auth`, `auth/`, `db/models/auth` | Sessions, users, magic links (evolving); **`users.user_role`** (ENUM + API) | Auth contracts in `@shared` as they stabilize; **canonical role strings** via `@shared` (`USER_ROLE_VALUES` — Feature 6 Phase 6.18) |
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

- **Paths reviewed:** `client/src/utils/admin/dependencyDeleteContractKeys.ts` (today **`['partShape']` only**); `client/src/views/admin/entities/PartShapeList.vue` (reference: wizard + `entityListDelete({ contractDelete })` + `invalidateQueries(['globalData'])`); `client/src/views/admin/entities/BlockShapeList.vue` (still **raw** `entityListDelete` without wizard); `client/src/components/admin/generic/EntityCard.vue` + `useEntityCardActions.ts` (**`usesDependencyDeleteContract(entityKey)`** — adding keys to allowlist enables **card** path automatically); `client/src/views/admin/tabs/components/ShapesTabAnnotationPanel.vue` / **`ShapesTabBlockPanel.vue`** (**`@delete`** handlers from **`useShapesTabDeletion`** are **no-op**; actual delete runs **inside** **`EntityCard`** — no list URL for annotation shapes, only expansion panels); `server/src/services/entityDelete/dependencyDeleteRegistry.ts` (source of truth: **`partShape`**, **`blockShape`**, **`annotationShape`**); `.project-manager/features/appointment-workflow/docs/delete-preflight-api-v1.md` (header still “spec only” — update).
- **Patterns / call sites:** **Lists** that use **`entityListDelete`** without **`contractDelete`** need the **PartShapeList** pattern. **Annotation shapes** have **no** dedicated list route like **BlockShapeList**; **contract** coverage = **EntityCard** on Shapes tab once allowlist includes **`annotationShape`**.
- **Gaps / unknowns:** None blocking; confirm **`GlobalEntityKey`** union includes **`blockShape`** / **`annotationShape`** (it does).

## Analysis
- **Problem / why now:** **6.17.5.1** registered server strategies; without client allowlist + **BlockShapeList**, operators still hit **raw** delete on block list and miss wizard on annotation **cards**.
- **Domains:** **Vue admin client** + **project-manager docs** only.
- **Dependencies:** **6.17.5.1** merged (registry contains three keys).
- **Risks:** Allowlist **drift** from server — **mitigation** keep **SYNC** comment and order keys consistently (`partShape`, `blockShape`, `annotationShape`).
- **Alternatives:** Per-view `if (entityKey === …)` — **rejected**; use **`usesDependencyDeleteContract`** only.

## Design
1. Extend **`DEPENDENCY_DELETE_CONTRACT_ENTITY_KEYS`** to **`['partShape', 'blockShape', 'annotationShape']`** (same set as **`dependencyDeleteRegistry`**).
2. **`BlockShapeList.vue`:** Copy **PartShapeList** wiring: refs, **`AdminEntityDeleteWizard`**, **`entityKey="blockShape"`**, **`contractDelete`** opening dialog with **`name`** fallback label, **`@finalized`** → invalidate **`globalData`** + reset refs.
3. **Docs:** At top of **`delete-preflight-api-v1.md`**, state **implemented** + **rolled-out entity types**; append **“Adding a new entity key”** numbered checklist (server: strategy + registry; client: allowlist; list: `contractDelete` if list exists; card: automatic via **EntityCard**; optional: legacy **DELETE** guard in **entityCrudRouter** if applicable).
4. **Optional one-line** touch **`phase-6.17-guide.md`** or **`session-6.17.5-guide.md`** only if harness/session DoD expects checkbox — prefer **minimal**.

## Goal
Align the **Vue client** with the **three** registry keys (**`partShape`**, **`blockShape`**, **`annotationShape`**): expand **`dependencyDeleteContractKeys`**, wire **`BlockShapeList`** to the **dependency-delete wizard**, and update **delete-preflight** documentation with **rollout status** and an **extension checklist**.

## Files
- `client/src/utils/admin/dependencyDeleteContractKeys.ts`
- `client/src/views/admin/entities/BlockShapeList.vue`
- `.project-manager/features/appointment-workflow/docs/delete-preflight-api-v1.md`

## Approach
1. Edit **`dependencyDeleteContractKeys.ts`** — add **`blockShape`** and **`annotationShape`**; preserve **SYNC** comment pointing at **`dependencyDeleteRegistry.ts`**.
2. Refactor **`BlockShapeList.vue`** using **`PartShapeList.vue`** as template (imports, wizard state, **`contractDelete`**, **`onDeleteWizardFinalized`**).
3. Update **`delete-preflight-api-v1.md`**: status line; new sections **Rollout** + **Adding a new entity key**.
4. **`cd client && npm run lint`** and **`npx vue-tsc -b`**.

## Checkpoint
- **Block shapes** page: delete opens wizard when dependencies exist; clean row can finalize; cache refreshes.
- **Annotation shape** card on Shapes tab: delete uses wizard (allowlist).
- **Docs** describe live rollout and extension steps without contradicting **phase-6.17-guide** policy names.

## Deliverables
- Updated allowlist + **BlockShapeList** wizard wiring.
- Revised **delete-preflight-api-v1.md** (status + checklist).

## Acceptance Criteria
- [ ] `DEPENDENCY_DELETE_CONTRACT_ENTITY_KEYS` lists exactly **`partShape`**, **`blockShape`**, **`annotationShape`** (order flexible but comment lists server file).
- [ ] **BlockShapeList** matches **PartShapeList** contract-delete pattern (wizard + invalidation).
- [ ] **EntityCard** / Shapes tab: **`annotationShape`** cards use wizard (via allowlist; no separate list file required).
- [ ] **delete-preflight-api-v1.md** no longer claims “spec only” as sole status; includes **how to add** checklist.
- [ ] Client **lint** + **vue-tsc** pass.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.17.5-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.17.5.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
