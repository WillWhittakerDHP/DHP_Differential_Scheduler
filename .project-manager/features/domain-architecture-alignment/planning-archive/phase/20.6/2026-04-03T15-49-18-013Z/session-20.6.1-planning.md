<!-- harness-planning-rollup tier=session id=20.6.1 consolidatedAt=2026-04-03T14:48:48.888Z -->

# Consolidated planning: session 20.6.1

## Session 20.6.1 (parent)

## Story

**This session delivers** removal of the **admin metadata HTTP stack** (client prefetch/mutations + server **`/admin-metadata`** routers/models) **so that** admin UI no longer depends on DB-driven field-metadata rows and **Pass 6** can proceed to **EntityCard** deletion in **20.6.2** without a live metadata API.

**Estimated size:** **L** (router prefetch, many composables, **FieldRenderer** / metadata editors, server models, migration).

---

## Analysis

- **Problem / why now:** **§8.6** / **§6.3a** require **full** metadata infrastructure removal. **20.5** documented retirement **ordering**; **20.6.1** executes **client + API + server model** teardown for the metadata stack (DDL in same session or follow-up task if split for safety).
- **Boundaries:** **Admin** client + **server internal routes** + **DB models**; must **not** change booking **PartFinalizer** or appointment submit payloads.
- **Patterns:** Prefer **explicit** field definitions and existing **entity** admin patterns from Pass **20.3**; avoid new generic metadata abstractions.
- **Risks:** Stripping prefetch before replacements **breaks admin screens**; mitigate with ordered tasks and smoke checks. **Remote DB:** author migrations only; run locally when **DB_HOST** is localhost.
- **Alternatives:** Leave API stub returning empty — **rejected** (plan requires **full** removal).

## Goal

**Session 20.6.1:** Remove the **admin metadata** feature from the **client and server**: no **`/admin-metadata`** or **`/admin-metadata/batch`** callers, no **TanStack** `adminMetadata` cache, no metadata **Sequelize** models in active use, and a **migration** to drop the relevant tables (authored in-repo; execute per **DB_HOST** policy). Admin screens must remain usable via **non-metadata** configuration paths agreed in task implementation orders.

**Phase context:** This session owns only the **metadata stack** slice of **§8.6**; **EntityCard** is **20.6.2**.

## Files

- **Canonical:** `FEATURE_20_ARCHITECTURE_REDESIGN.md` (**§6.3a, §8.6**), `DOMAIN_REWRITE_WORKLOG.md` (**admin metadata retirement** subsection)
- **Harness:** `phases/phase-20.6-guide.md` (**### Session 20.6.1**), `sessions/session-20.6.1-guide.md`
- **Client (expected touch):** `client/src/router/index.ts`, `client/src/utils/api/adminMetadataApi.ts`, `client/src/composables/admin/useMetadataCache.ts`, `client/src/composables/admin/useAdminMetadataMutations.ts`, `client/src/utils/admin/adminMetadataSaveRequest.ts`, `client/src/components/admin/metadata/**`, `client/src/components/admin/generic/fields/FieldRenderer.vue`, `client/src/utils/forms/formFieldsMetadataWarningResolution.ts`, call sites invalidating **`adminMetadata`** queries
- **Server (expected touch):** `server/src/routes/internal/index.ts`, `server/src/routes/internal/admin-metadata/**`, related **primitive/relationship** metadata routes if still mounted, `server/src/db/models/admin/adminMetadata*.ts`, `server/src/routes/schemas/adminMetadata*.ts`, model `index` / associations, **new** `server/src/db/migrations/*` for table drops

## Approach

1. **Task 20.6.1.1:** Client cutover — remove or replace every **runtime** dependency on **`/admin-metadata`** (prefetch, hooks, **FieldRenderer** metadata requirement, primitive metadata editor flows) so admin builds without metadata API calls.
2. **Task 20.6.1.2:** Server + DB — remove routers, Joi validators tied only to metadata, Sequelize models/associations; add migration to **drop** metadata tables; remove **`metadataValidatorFactory`** only if no remaining internal callers.
3. After each task: **client + server lint**, **app start** smoke on key admin routes; log decisions in **`session-20.6.1-log.md`** at session-end.

## Checkpoint

- **`/accepted-code`** then **implementation** per task orders; **`/task-end`** after each task; **`/session-end 20.6.1`** when both tasks complete.
- Run **§9.1 / §9.1a** drift checklist at session end; note metadata removal in **`DOMAIN_REWRITE_WORKLOG.md`** if not already reflected.

## Deliverables

- No remaining **`fetch`** / **`apiClient`** calls to **`/admin-metadata`** from `client/src`.
- No **`['adminMetadata']`** query cache population in router or composables (remove or replace with non-metadata data sources).
- Server: **`/admin-metadata`** router unmounted; metadata models removed from runtime graph; migration file(s) to drop tables listed in **§6.3a**.
- **`session-20.6.1-guide.md`** objectives checked; **`session-20.6.1-handoff.md`** updated with **Next Action** → **`/session-start 20.6.2`** (or **`/session-end`** then next session).

## Acceptance Criteria

- [ ] Admin app loads and critical entity admin paths work without metadata API (define smoke list in task planning).
- [ ] `cd client && npm run lint` and `cd server && npm run lint` pass.
- [ ] No references to removed routes in client; server `tsc` / build clean.
- [ ] Migration authored for metadata table drops; execution only on allowed **DB_HOST**.

---

## Task 20.6.1.1 (source: task-20.6.1.1-planning.md)

### Story

**This task changes** the **Vue client** so it **never calls** **`/admin-metadata`** or **`/admin-metadata/batch`**, and **does not rely** on TanStack **`['adminMetadata']`** network hydration **because** **Task 20.6.1.2** will remove the server routes—**the client must be decoupled first** per Pass 5 retirement ordering.

---

### Analysis

- **Problem / why now:** **§8.6** / **§6.3a** require **full** metadata infrastructure removal. **20.5** documented retirement **ordering**; **20.6.1** executes **client + API + server model** teardown for the metadata stack (DDL in same session or follow-up task if split for safety).
- **Boundaries:** **Admin** client + **server internal routes** + **DB models**; must **not** ch… _(truncated)_

### Goal

**Task 20.6.1.1 (client only):** Zero runtime HTTP to **`/admin-metadata`**; **`useMetadataCache`** backed by **code-first** (or static) **`MetadataCache`**; router **no prefetch**; metadata **mutation** pipeline removed; admin **smoke-critical** paths functional.

### Files

- **New (likely):** `client/src/utils/admin/codeFirstMetadataCache.ts` (or similar) — synthetic **`MetadataCache`**
- **Edit:** `client/src/composables/admin/useMetadataCache.ts`, `client/src/router/index.ts`, `client/src/utils/api/apiExportBundleB.ts`, `client/src/utils/api/index.ts` (if re-exports), all files from **Codebase recon** that reference **`admin-metadata`** or **`['adminMetadata']`** network behavior
- **Delete (when unused):** `client/src/utils/api/adminMetadataApi.ts`, `client/src/utils/admin/adminMetadataSaveRequest.ts`, `client/src/composables/admin/useAdminMetadataMutations.ts`, metadata-only components under `client/src/components/admin/metadata/` (verify importers)

### Approach

Follow **Implementation Orders** top to bottom. **Server** changes belong in **20.6.1.2** only.

### Checkpoint

- After **`/accepted-code`**: implement in repo; then **`/task-end 20.6.1.1`**.
- Do **not** start **20.6.1.2** until this task is ended and client is clean.

### Deliverables

- **Grep-clean:** no `apiClient` calls to `/admin-metadata` in `client/src`
- **Synthetic metadata** module + **`useMetadataCache`** rewrite
- **Router** without metadata prefetch
- **Removed** dead mutation/editor code paths tied to metadata POST
- **Client lint** + **vue-tsc** clean

### Acceptance Criteria

- [ ] `rg '/admin-metadata' client/src` shows **no** runtime URL construction used for **fetch** (string literals in comments/docs acceptable if scrubbed later).
- [ ] `cd client && npm run lint` passes.
- [ ] `npx vue-tsc -b` passes from `client/`.
- [ ] Manual smoke: authenticate → **`/admin`** → open at least **two** distinct entity editors that use **FieldRenderer** without hard failure (extend synthetic map as needed to meet this bar).

### Design

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

---

## Task 20.6.1.2 (source: task-20.6.1.2-planning.md)

### Story

**This task changes** the **Express internal API** and **Sequelize layer** by **removing** the legacy **admin field-metadata** HTTP surface and **DB tables** that backed it, **because** **20.6.1.1** moved the Vue admin UI to **code-first metadata** and **§6.3a / §8.6** require retiring that infrastructure so it cannot drift back into the product path.

---

### Analysis

- **Problem / why now:** **§8.6** / **§6.3a** require **full** metadata infrastructure removal. **20.5** documented retirement **ordering**; **20.6.1** executes **client + API + server model** teardown for the metadata stack (DDL in same session or follow-up task if split for safety).
- **Boundaries:** **Admin** client + **server internal routes** + **DB models**; must **not** ch… _(truncated)_

### Goal

**Remove** the **server-side** admin field-metadata stack: **unmount** `/admin-metadata`, **delete** obsolete route + schema + validator + composer code, **remove** the six **Sequelize** models from the active model graph, and **add** a **migration** that **drops** the six metadata tables (and optional ENUM cleanup), **without** breaking other internal routes. **Client** remains on code-first metadata from **20.6.1.1**.

**Phase context:** Session **20.6.1** completes client + server + DDL slice of **§8.6**; **EntityCard** work is **20.6.2**.

### Files

- **Canonical:** `FEATURE_20_ARCHITECTURE_REDESIGN.md` (**§6.3a, §8.6**), `DOMAIN_REWRITE_WORKLOG.md`
- **Harness:** `sessions/session-20.6.1-guide.md`, `task-20.6.1.1-handoff.md`
- **Router:** `server/src/routes/internal/index.ts`
- **Delete (dirs/files):** `server/src/routes/internal/admin-metadata/**`, `admin-primitive-metadata/**`, `admin-relationship-metadata/**`, `server/src/routes/internal/shared/metadataValidatorFactory.ts`, `server/src/routes/helpers/adminMetadataErrorHelpers.ts`, `server/src/routes/schemas/adminMetadata*.ts`, `adminPrimitiveMetadataSchemas.ts`, `adminRelationshipMetadataSchemas.ts`, metadata-specific `server/src/utils/adminMetadata*.ts`, `adminPrimitive*Composer.ts`, `adminRelationship*Composer.ts`, `adminPrimitiveRelationshipAssembly.ts`, six model files under `server/src/db/models/admin/`
- **Edit:** `server/src/db/models/index.ts`, `sequelizeModelAssociationsPartA.ts`, `sequelizeModelAssociationsPartB.ts`, `sequelizeModelsBag.ts`, `server/src/config/app.ts`
- **Add:** `server/src/db/migrations/<timestamp>_drop_admin_metadata_stack.mjs` (name per repo convention)

### Approach

1. Follow **## Design** order: unmount → delete routes/utils/schemas → strip models → add **DROP** migration.
2. After each logical chunk: **`cd server && npm run lint`** and **`npx tsc -b`** (or repo-standard server typecheck).
3. Do **not** run migrations against non-local **DB_HOST** from this environment; **commit** migration for execution on the host that owns the DB.
4. **`/task-end 20.6.1.2`** when green; cascade per session guide (next task or **`/session-end 20.6.1`**).

### Checkpoint

- **User** runs **`/accepted-code`** → agent implements per **## Design** → **`/task-end 20.6.1.2`**.
- Session close: **`/session-end 20.6.1`** when **20.6.1.2** is complete; update **`DOMAIN_REWRITE_WORKLOG.md`** / **§9.1** drift as needed.

### Deliverables

- **No** `router.use('/admin-metadata', …)` in internal API.
- **Removed** Sequelize models and associations for all six metadata tables; **`app.ts`** / **models bag** updated.
- **Deleted** dead route + validator + composer + Joi schema files (no dangling imports).
- **New migration** dropping metadata tables in correct FK order, with header note on **DB_HOST** execution policy.
- **Server lint + `tsc`** clean.

### Acceptance Criteria

- [ ] `rg '/admin-metadata' server/src` finds **no** route mount or handler references (migration comments OK).
- [ ] `rg 'AdminMetadata|AdminPrimitiveMetadata|AdminRelationshipMetadata' server/src` — only acceptable hits are **migration** / historical SQL if any; **not** in `routes/` or `utils/` composers.
- [ ] `cd server && npm run lint` passes.
- [ ] Server TypeScript build passes (project-standard command, e.g. `npx tsc -b` from `server/`).
- [ ] `npm run start:dev` (or documented smoke) starts API without loading removed models.
- [ ] Migration file reviewed: **DROP** order safe; documents irreversibility / enum cleanup choice.

### Design

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

---
