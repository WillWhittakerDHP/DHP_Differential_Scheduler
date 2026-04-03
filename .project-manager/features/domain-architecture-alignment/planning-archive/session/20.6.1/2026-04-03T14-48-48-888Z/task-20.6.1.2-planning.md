# Plan: task 20.6.1.2 — 20.6.1.2

## Contract
- **Tier:** task | **ID:** 20.6.1.2
- **Scope:** 20.6.1.2
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
- [x] Task **20.6.1.1** complete (client code-first metadata; no runtime `/admin-metadata`).
- [ ] #### Task 20.6.1.2: Server routes, models, migration — **in progress** (this doc).

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** **§8.6** / **§6.3a** require **full** metadata infrastructure removal. **20.5** documented retirement **ordering**; **20.6.1** executes **client + API + server model** teardown for the metadata stack (DDL in same session or follow-up task if split for safety).
- **Boundaries:** **Admin** client + **server internal routes** + **DB models**; must **not** ch… _(truncated)_

## Story
**This task changes** the **Express internal API** and **Sequelize layer** by **removing** the legacy **admin field-metadata** HTTP surface and **DB tables** that backed it, **because** **20.6.1.1** moved the Vue admin UI to **code-first metadata** and **§6.3a / §8.6** require retiring that infrastructure so it cannot drift back into the product path.

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

- **Paths reviewed:**
  - **Mount:** `server/src/routes/internal/index.ts` — `router.use('/admin-metadata', adminMetadataRouter)` (only **unified** metadata route mounted here).
  - **Routers (legacy stack):** `server/src/routes/internal/admin-metadata/**` (active); `admin-primitive-metadata/**` and `admin-relationship-metadata/**` exist with CRUD routers but are **not** mounted on `InternalRouter` (dead HTTP path; still compiled).
  - **Models:** `server/src/db/models/index.ts` registers **AdminMetadata**, **AdminMetadataSelectOption**, **AdminPrimitiveMetadata**, **AdminPrimitiveMetadataSelectOption**, **AdminRelationshipMetadata**, **AdminRelationshipMetadataSelectOption** with associations; `sequelizeModelAssociationsPartA/B.ts`, `sequelizeModelsBag.ts`, `server/src/config/app.ts` export model symbols.
  - **Table names (Sequelize):** `admin_metadata`, `admin_metadata_select_options`, `admin_primitive_metadata`, `admin_primitive_metadata_select_options`, `admin_relationship_metadata`, `admin_relationship_metadata_select_options` (from model `tableName`).
  - **Utils tied to routes:** `server/src/utils/adminMetadataComposer.ts`, `adminMetadataEntryAssembly.ts`, `adminMetadataPayload.ts`, `adminMetadataInputConfigCodec.ts`, `adminMetadataInputConfigPersist.ts`, `adminPrimitiveMetadataComposer.ts`, `adminRelationshipMetadataComposer.ts`, `adminPrimitiveRelationshipAssembly.ts`.
  - **Schemas / validators:** `server/src/routes/schemas/adminMetadata*.ts`, `adminPrimitiveMetadataSchemas.ts`, `adminRelationshipMetadataSchemas.ts`; `server/src/routes/internal/shared/metadataValidatorFactory.ts`; `server/src/routes/helpers/adminMetadataErrorHelpers.ts`.
  - **Baseline DDL reference:** `server/src/db/migrations/20260320_000001_baseline_schema.sql` defines `admin_metadata` and related ENUM types; later migrations mutate rows/columns — **drop migration** must match **current** live schema on deploy targets (verify column renames vs baseline).
- **Patterns / call sites:** No other server feature imports `getAdminMetadata` outside the admin-metadata route tree and the composers above. **GLOBAL_CONFIG_IDS** used by composers is re-exported from `@shared/constants/globalConfigIds` via `adminMetadataConstants.ts` — **keep shared**; delete only route-local constants/helpers.
- **Gaps / unknowns:** Confirm whether any **external** or **script** callers still hit `/internal/admin-metadata` (grep ops/docs). Enum types `enum_admin_metadata_*` may remain after `DROP TABLE` unless migration explicitly drops them — decide **CASCADE** vs leave orphans per DBA policy.

## Analysis
- **Problem / why now:** The client no longer consumes metadata HTTP (**20.6.1.1**). Keeping server routes and models invites **security surface**, **dead code**, and **schema/migration** cost. **§8.6** expects full teardown.
- **Boundaries:** **Server internal API** + **Sequelize** + **migrations** only. **Do not** change booking/wizard routes. **Shared** types: only remove if something metadata-specific lived in `@shared` (unlikely for these tables).
- **Dependencies:** **Must** land after **20.6.1.1** (client decoupled). **Migration execution:** follow repo rule — **no** `npm run migrate` against remote **DB_HOST** from this machine; **author** migration in-repo.
- **Risks:** Missing an import leaves **`tsc` / lint** red; wrong **`DROP`** order breaks FKs (drop **select_options** child tables before parents). **Down migration:** optional/restricted if production already applied — document **irreversible data loss**.
- **Alternatives:** Leave routes returning **410** — **rejected** (task asks removal + DDL). Soft-delete tables — **rejected**.

## Design

### Implementation order (pseudocode)

1. **Unmount HTTP**
   - Remove `import adminMetadataRouter` and `router.use('/admin-metadata', …)` from `server/src/routes/internal/index.ts`.

2. **Delete route modules** (entire directories after no imports remain)
   - `server/src/routes/internal/admin-metadata/`
   - `server/src/routes/internal/admin-primitive-metadata/`
   - `server/src/routes/internal/admin-relationship-metadata/`
   - `server/src/routes/internal/shared/metadataValidatorFactory.ts`
   - `server/src/routes/helpers/adminMetadataErrorHelpers.ts` (only referenced by deleted metadata error handlers)
   - Joi: `server/src/routes/schemas/adminMetadataSchemaHelpers.ts`, `adminMetadataSchemas.ts`, `adminPrimitiveMetadataSchemas.ts`, `adminRelationshipMetadataSchemas.ts`
   - **Keep** `server/src/routes/helpers/routerValidators.ts` — still exports `ValidationResult` and `validateRequiredFields` used outside metadata; **edit** the file comment to drop stale admin-metadata wording.

3. **Delete server utils** used only by the above
   - `adminMetadataComposer.ts`, `adminMetadataEntryAssembly.ts`, `adminMetadataPayload.ts`, `adminMetadataInputConfigCodec.ts`, `adminMetadataInputConfigPersist.ts`, `adminPrimitiveMetadataComposer.ts`, `adminRelationshipMetadataComposer.ts`, `adminPrimitiveRelationshipAssembly.ts`

4. **Remove Sequelize models + associations**
   - Delete model files under `server/src/db/models/admin/` for the six metadata models (keep unrelated admin models e.g. `block_shape`).
   - Edit `server/src/db/models/index.ts`: drop imports, `init`, `hasMany`/`belongsTo`, and exports for those six.
   - Edit `sequelizeModelAssociationsPartA.ts`, `sequelizeModelAssociationsPartB.ts`, `sequelizeModelsBag.ts`, `server/src/config/app.ts` to remove symbols.

5. **Migration (new file under `server/src/db/migrations/`)**
   - `up`: `DROP TABLE IF EXISTS … CASCADE` in order:
     - `admin_metadata_select_options`
     - `admin_metadata`
     - `admin_primitive_metadata_select_options`
     - `admin_primitive_metadata`
     - `admin_relationship_metadata_select_options`
     - `admin_relationship_metadata`
   - Optionally `DROP TYPE` for `enum_admin_metadata_*` **if** no remaining references (verify with `information_schema` / baseline); otherwise document leftover enums for manual cleanup.
   - `down`: **no-op** or comment explaining irreversibility (preferred for data tables).
   - File header comment: **execute only** when **DB_HOST** is `localhost` / `127.0.0.1` per project migration policy.

6. **Verify**
   - `cd server && npm run lint` and `npx tsc -b` (or project’s server build).
   - `rg 'admin-metadata|AdminMetadata|admin_metadata'` on `server/src` until only migration/historical references remain as intended.

## Goal (Task 20.6.1.2 only)
**Remove** the **server-side** admin field-metadata stack: **unmount** `/admin-metadata`, **delete** obsolete route + schema + validator + composer code, **remove** the six **Sequelize** models from the active model graph, and **add** a **migration** that **drops** the six metadata tables (and optional ENUM cleanup), **without** breaking other internal routes. **Client** remains on code-first metadata from **20.6.1.1**.

**Phase context:** Session **20.6.1** completes client + server + DDL slice of **§8.6**; **EntityCard** work is **20.6.2**.

## Files (this task — server + migration)
- **Canonical:** `FEATURE_20_ARCHITECTURE_REDESIGN.md` (**§6.3a, §8.6**), `DOMAIN_REWRITE_WORKLOG.md`
- **Harness:** `sessions/session-20.6.1-guide.md`, `task-20.6.1.1-handoff.md`
- **Router:** `server/src/routes/internal/index.ts`
- **Delete (dirs/files):** `server/src/routes/internal/admin-metadata/**`, `admin-primitive-metadata/**`, `admin-relationship-metadata/**`, `server/src/routes/internal/shared/metadataValidatorFactory.ts`, `server/src/routes/helpers/adminMetadataErrorHelpers.ts`, `server/src/routes/schemas/adminMetadata*.ts`, `adminPrimitiveMetadataSchemas.ts`, `adminRelationshipMetadataSchemas.ts`, metadata-specific `server/src/utils/adminMetadata*.ts`, `adminPrimitive*Composer.ts`, `adminRelationship*Composer.ts`, `adminPrimitiveRelationshipAssembly.ts`, six model files under `server/src/db/models/admin/`
- **Edit:** `server/src/db/models/index.ts`, `sequelizeModelAssociationsPartA.ts`, `sequelizeModelAssociationsPartB.ts`, `sequelizeModelsBag.ts`, `server/src/config/app.ts`
- **Add:** `server/src/db/migrations/<timestamp>_drop_admin_metadata_stack.mjs` (name per repo convention)

## Approach
1. Follow **## Design** order: unmount → delete routes/utils/schemas → strip models → add **DROP** migration.
2. After each logical chunk: **`cd server && npm run lint`** and **`npx tsc -b`** (or repo-standard server typecheck).
3. Do **not** run migrations against non-local **DB_HOST** from this environment; **commit** migration for execution on the host that owns the DB.
4. **`/task-end 20.6.1.2`** when green; cascade per session guide (next task or **`/session-end 20.6.1`**).

## Checkpoint
- **User** runs **`/accepted-code`** → agent implements per **## Design** → **`/task-end 20.6.1.2`**.
- Session close: **`/session-end 20.6.1`** when **20.6.1.2** is complete; update **`DOMAIN_REWRITE_WORKLOG.md`** / **§9.1** drift as needed.

## Deliverables
- **No** `router.use('/admin-metadata', …)` in internal API.
- **Removed** Sequelize models and associations for all six metadata tables; **`app.ts`** / **models bag** updated.
- **Deleted** dead route + validator + composer + Joi schema files (no dangling imports).
- **New migration** dropping metadata tables in correct FK order, with header note on **DB_HOST** execution policy.
- **Server lint + `tsc`** clean.

## Acceptance Criteria
- [ ] `rg '/admin-metadata' server/src` finds **no** route mount or handler references (migration comments OK).
- [ ] `rg 'AdminMetadata|AdminPrimitiveMetadata|AdminRelationshipMetadata' server/src` — only acceptable hits are **migration** / historical SQL if any; **not** in `routes/` or `utils/` composers.
- [ ] `cd server && npm run lint` passes.
- [ ] Server TypeScript build passes (project-standard command, e.g. `npx tsc -b` from `server/`).
- [ ] `npm run start:dev` (or documented smoke) starts API without loading removed models.
- [ ] Migration file reviewed: **DROP** order safe; documents irreversibility / enum cleanup choice.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.1-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/task-20.6.1.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
