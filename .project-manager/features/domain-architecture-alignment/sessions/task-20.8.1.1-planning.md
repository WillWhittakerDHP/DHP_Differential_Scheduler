# Plan: task 20.8.1.1 — Ledger contract matrix (evidence + recommendation)

## Contract
- **Tier:** task | **ID:** 20.8.1.1
- **Scope:** Doc-only **contract matrix**: map `baseTime` / `baseFee` / `rateOverBaseTime` / `rateOverBaseFee` to **ARCHITECTURE.md** §10.1 (**base** vs **PerUnit** / `timePerUnit` / `feePerUnit` vocabulary); recommend **rename**, **map-only**, or **quarantine** for **task 20.8.1.2**. **No code or migration changes in this task.**
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

**Session 20.8.1** is open; this is the **first** task — inventory only, then **`/task-start 20.8.1.2`** implements the chosen path.

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** Phase **20.8** execution starts with the cheapest contract surface: part-instance ledger columns. Drift between **§10.1** vocabulary and **persisted field names** confuses admin metadata, booking totals, and new contributors.
- **Boundaries:** **Booking** (PartFinalizer, transformers), **server** persistence (models, versioning, snapshots), **admin** (code-first metadata rows), **`@shared`** only if API shapes change.
- **Patterns:** Follow existing Sequelize + transformer patterns; no silent renames — migrations authored in-repo; execution per **Migration authority** (localhost only for `npm run migrate` when applicable).
- **Risks:** Full rename touches DB, all API payloads, and wizard snapshots — may be **deferred** in favor of **quarantine + truth table** if scope explodes; document either way in **`phase-20.8-handoff`**.
- **Alternatives:** (A) Full rename to `timePerUnit` / `feePerUnit` / align `base*`. (B) Keep storage names; add **`ARCHITECTURE.md`** ledger column map + code comments at model boundary. (C) Hybrid: rename in **types** only with explicit serialization layer — only if justified in task **20.8.1.1** matrix.

## Story

**This task produces** a single, reviewable **ledger contract matrix** plus a **written recommendation** (rename vs quarantine) **because** **session 20.8.1** requires a decision before **20.8.1.2** touches migrations or code.

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
| **Admin / Config** | `composables/admin/`, `components/admin/`, `views/admin/`, `types/admin/`, `configs/` | `routes/internal/entities`, `relationships`, `*-settings`, `db/models` admin | Shapes, instances, wizard settings, calendar settings, business rules | `@shared/types/entities` |
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

- **Paths reviewed:** `server/src/db/models/booking/part_instance.ts`, `part_instance_version.ts` — Sequelize `baseTime`/`baseFee`/`rateOverBaseTime`/`rateOverBaseFee`; `server/src/services/instanceVersioning.ts`, `appointmentSnapshotLoader.ts` — copy into version snapshot / appointment payload; `server/src/db/models/booking/appointment.ts` — embedded part snapshot types; `server/src/db/migrations/20260320_000001_baseline_data.sql` — legacy **admin_metadata** seed rows still reference **`rateOverBaseFee`** / **`rateOverBaseTime`** (historical baseline; product admin is code-first now). Client: `client/src/types/entities.ts`, `client/src/types/booking/partFinal.ts`, `client/src/utils/booking/PartFinal.ts`, `client/src/utils/booking/confirmationStepDataFee.ts`, `client/src/utils/admin/codeFirstMetadataCache.ts`, `client/src/composables/admin/useAtomicPartLedgerRows.ts`, `client/src/constants/entitySchemaDefaults.ts`.
- **Patterns / call sites:** Storage and API identifiers use **`rateOverBase*`**; **ARCHITECTURE.md** §10.1 labels the **PerUnit** tier as **`timePerUnit`** / **`feePerUnit`** — semantic alignment (overage rates on atomics) but **different spellings** in DB/TS.
- **Gaps / unknowns:** Whether any **live** API still exposes alternate keys — matrix will list route/transformer paths; **20.8.1.2** validates with grep after decision.

## Analysis

- **Problem / why now:** Without a written matrix, **20.8.1.2** risks a partial rename or conflicting docs.
- **Boundaries:** This task is **documentation + planning artifact only** — no `client/` / `server/` / `shared/` edits except this **`.project-manager`** task-planning file (and optional session log note). **20.8.1.2** owns code/migrations.
- **Recommendation options:** **(A)** Full rename to match §10.1 vocabulary (high churn). **(B)** **Quarantine:** add **`ARCHITECTURE.md`** subsection “Storage column names” mapping `rateOverBaseTime` → “PerUnit time (per §10.1 **timePerUnit**)” etc. **(C)** Hybrid — types-only aliases (only if justified in 20.8.1.2).
- **Risks:** Baseline SQL and legacy seeds still say `rateOverBase*` — matrix must mention them as **historical** vs **runtime** sources.

## Design

1. **Matrix (in this file or `session-20.8.1-log.md`):** Columns — **Layer** (DB / Sequelize model / service / client type / PartFinalizer / admin metadata) | **Field names** | **§10.1 concept** (Base vs PerUnit time vs PerUnit fee) | **Notes / drift**.
2. **Recommendation paragraph:** One of **rename** / **quarantine** / **defer rename with rationale**; **must** be compatible with **phase-20.8** acceptance (“resolved **or explicitly quarantined**”).
3. **Handoff to 20.8.1.2:** Bullet list of **files to touch first** if rename; or **“add §10.1.x mapping only”** if quarantine.

### Contract matrix (results)

| Layer | Storage / API field names | §10.1 concept | Notes |
|--------|---------------------------|---------------|--------|
| **Sequelize** `part_instance` | `baseTime`, `baseFee`, `rateOverBaseTime`, `rateOverBaseFee` | **Base** = `baseTime` / `baseFee` on orchestrator; **PerUnit** = `timePerUnit` / `feePerUnit` in doc — **implemented as** `rateOverBaseTime` / `rateOverBaseFee` | Names **do not** match §10.1 spellings; semantics = overage rates on atomics |
| **Sequelize** `part_instance_version` | same four | same | Versioning copies same column names |
| **Services** `instanceVersioning` | passes through `rateOverBaseFee`, `rateOverBaseTime` | PerUnit tier | Snapshot/version parity with part row |
| **Services** `appointmentSnapshotLoader` | `rateOverBaseFee`, `rateOverBaseTime` on appointment part payload | PerUnit tier | Typed in `appointment.ts` part snapshot |
| **Client types** `entities` / `partFinal` | `baseTime`, `baseFee`, `rateOverBaseTime`, `rateOverBaseFee` | same | Mirrors server |
| **PartFinalizer** `PartFinal.ts` | aggregates `rateOverBaseFee`, `rateOverBaseTime` | PerUnit tier | Booking totals / confirmation steps |
| **Admin code-first** `codeFirstMetadataCache` | `rateOverBaseTime`, `rateOverBaseFee` keys | PerUnit tier | Labels “Rate over base …” in UI metadata |
| **Legacy baseline SQL** `20260320_000001_baseline_data.sql` | seeds `rateOverBaseFee`, `rateOverBaseTime` in old `admin_metadata` / `entity_layout_config` | — | **Historical**; not the active code-first path |

### Recommendation (for 20.8.1.2)

**Quarantine + mapping doc (preferred for this increment):** Keep **DB + TypeScript identifiers** as `base*` / `rateOverBase*` to avoid a wide breaking migration and snapshot churn. Add a short **“Ledger column names vs §10.1”** subsection under **ARCHITECTURE.md §10.1** stating: `rateOverBaseTime` ≡ **PerUnit** time contribution (**timePerUnit** in the principles table); `rateOverBaseFee` ≡ **PerUnit** fee (**feePerUnit**); `baseTime`/`baseFee` ≡ **Base** tier. Optionally add **one-line model file comments** at `part_instance.ts` pointing to that subsection.

**Defer full rename** unless product requires API field renames for external consumers — a rename would touch migrations, all transformers, saved appointments, and admin metadata keys; track as a **later** phase if needed.

**First files for 20.8.1.2 if quarantine:** `.project-manager/ARCHITECTURE.md` (new bullets under §10.1); optional `server/src/db/models/booking/part_instance.ts` header comment.

## Goal

1. Complete the **contract matrix** covering all four ledger fields across persistence, versioning, and primary client consumers.
2. **Recommend** a single path for **20.8.1.2** (no implementation here).

## Files (read for matrix; no edits except this planning doc)

- **Server:** `server/src/db/models/booking/part_instance.ts`, `part_instance_version.ts`, `server/src/services/instanceVersioning.ts`, `server/src/services/appointmentSnapshotLoader.ts`, `server/src/db/models/booking/appointment.ts`
- **Client:** `client/src/types/entities.ts`, `client/src/types/booking/partFinal.ts`, `client/src/utils/booking/PartFinal.ts`, `client/src/utils/transformers/globalToBookingPartInstanceTransform.ts`, `client/src/utils/admin/codeFirstMetadataCache.ts`, `client/src/composables/admin/useAtomicPartLedgerRows.ts`
- **Docs:** `.project-manager/ARCHITECTURE.md` §10.1 (canonical vocabulary)

## Approach

1. `rg` / repo search for `baseTime`, `baseFee`, `rateOverBaseTime`, `rateOverBaseFee` under `server/src/db/models/booking/`, `server/src/services/`, `client/src/types/`, `client/src/utils/booking/`, `client/src/utils/admin/codeFirstMetadataCache.ts`.
2. Fill the matrix table; write **Recommendation** and **Next task (20.8.1.2)** bullets.
3. **Do not** run migrations or change product code.

## Checkpoint

- Matrix + recommendation **reviewed in chat** with Will; then run **`/accepted-code`** to approve task **20.8.1.1** (planning artifact complete — **no product code** to implement for this task).

## Deliverables

- **Ledger contract matrix** (markdown table) in this planning doc **or** session log.
- **One-paragraph recommendation** (rename vs quarantine) **or** explicit **defer** with rationale.
- **File list** for **20.8.1.2** first moves.

## Acceptance Criteria

- [x] All four fields appear in the matrix with at least **Sequelize model** + **PartFinalizer** + **admin code-first** rows
- [x] **Recommendation** states **rename** or **quarantine** (or hybrid) with rationale tied to §10.1 — **quarantine + mapping doc** chosen; rename deferred
- [x] **No** application code or migration files changed in **20.8.1.1**

## Out of scope

- **Task 20.8.1.2** — implementation, migrations, **`ARCHITECTURE.md`** edits (unless you choose to put the matrix in the log only and leave ARCH edits to 20.8.1.2)

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.8.1-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
