# Plan: task 6.16.3.2 — Rename tranche verification and phase 6.16 closure docs

## Contract
- **Tier:** task | **ID:** 6.16.3.2
- **Scope:** Close the **minimizer** rename tranche on the **application** layer: confirm migration `20260432_000049_rename_moveable_to_minimizer.mjs` is the canonical DB path; grep **client + shared + server source** (excluding historical `server/src/db/migrations/*.mjs`) for stale **storage/API** vocabulary; update **phase-6.16** and **session** docs; tiny comment/string hygiene only where it improves consistency. **Do not** run `npm run migrate` unless `DB_HOST` is localhost (migration authority rule).
- **Governance:** Governance Context (Task)

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function, docs
- **Gate profile:** fast
- **Suggested depth:** leaf — advisory; agent decides in Analysis / Decomposition
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition.

## Where we left off
Task **6.16.3.1** complete: downstream inventory in **`session-6.16.3-downstream-inventory.md`** and session log updated. This task finishes **rename tranche + documentation closure** for session 6.16.3.

---

## Parent context (session planning — Analysis excerpt)

Session **6.16.3** requires **rename discipline**: no half-renamed public API; migration notes for DB. **`differentialRoleUtils`** already rejects the obsolete storage spelling without embedding it as a grep-attracting literal. Remaining work is **audit + docs +** optional **cosmetic** renames in live source (comments, UI copy keys already migrated to `minimizer*` in wizard settings).

---

## Story
**This task changes** documentation and light source hygiene **because** phase 6.16 success criteria require an honest **rename tranche** status and **no** misleading `moveable` naming in active booking code comments where `minimizer` is the product term.

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

## Analysis

- **Problem:** Phase guide item **“Mechanical minimizer rename completed or explicitly phased”** needs a **recorded** tranche status tied to migration **`20260432_000049_rename_moveable_to_minimizer.mjs`** and current source. Historical migrations and `.project-manager` archives **may** still say `moveable`; that is **not** the same as product code drift.
- **Boundaries:** `shared/utils/differentialRoleUtils.ts` is canonical for rejecting obsolete role spellings; `server/src/db/models/booking/event_shape.ts` uses **`minimizer`** in ENUM; wizard settings models use **`minimizer_*`** column names post-migration.
- **Risks:** Running migrations against remote **DB_HOST** — **forbidden** here; document “run on localhost only.”
- **Alternatives:** Mass-edit archived planning files — **out of scope**; only **active** guides and session artifacts for 6.16.3.

## Design

1. **Grep pass:** `client/src`, `server/src` (exclude `server/src/db/migrations`), `shared` for `moveable` / `Moveable` in **source**; classify: **historical migration** (ignore), **comment/UI string** (fix if in active booking path), **data** (N/A).
2. **Artifact:** Append **“Rename tranche (6.16.3.2)”** subsection to **`session-6.16.3-downstream-inventory.md`** OR add **`session-6.16.3-rename-tranche.md`** with: migration id, grep summary, “DB execution: localhost only” note.
3. **Hygiene:** Replace stale **“Moveable flow”** wording in **`client/src/utils/booking/availabilityStepHandlers.ts`** comment with **minimizer** terminology (task 6.9.4.2 reference preserved by session id).
4. **Phase guide:** Update **`phase-6.16-guide.md`** success criteria checkboxes **only** for items satisfied by prior sessions + this audit (e.g. mechanical rename + margin + multi-minimizer where verified); leave calendar-split doc item **unchecked** if still gap per 6.16.3.1 inventory.
5. **Session log:** Add **### Task 6.16.3.2** with summary and pointers.
6. **Lint:** `cd client && npm run lint`, `cd server && npm run lint` after any TS edits.

## Goal

- Publish a **rename tranche summary** tied to migration **`20260432_000049_rename_moveable_to_minimizer.mjs`** and a **clean grep** of active source for obsolete public naming.
- Align **phase 6.16** documentation with **actual** completion state without checking boxes for undelivered calendar-split product work.

## Files (expected touch set)

| Area | Paths |
|------|--------|
| Docs | `session-6.16.3-downstream-inventory.md` (append) or new `session-6.16.3-rename-tranche.md`, `session-6.16.3-log.md`, `phases/phase-6.16-guide.md` |
| Client (optional) | `client/src/utils/booking/availabilityStepHandlers.ts` — comment only |
| Reference (read-only) | `server/src/db/migrations/20260432_000049_rename_moveable_to_minimizer.mjs`, `shared/utils/differentialRoleUtils.ts`, `server/src/db/models/booking/event_shape.ts` |

## Approach

1. Run scoped grep; record results in the rename tranche doc.
2. Apply minimal comment edit if grep shows only benign leftovers in target file.
3. Update phase guide checkboxes conservatively.
4. Update session log; run lint if TS changed.

## Checkpoint

Session 6.16.3 ready for **session-end** after this task and user acceptance of doc accuracy.

## Deliverables

- **Rename tranche** subsection or standalone markdown under **`.project-manager/features/appointment-workflow/sessions/`**.
- **Session log** entry for 6.16.3.2.
- **Phase guide** updated where criteria are **actually** met.

## Acceptance Criteria

- [ ] Grep audit of **active** source documented; migration file identified as canonical rename path.
- [ ] No **new** `moveable` / `Moveable` identifiers introduced in **product** TS/Vue under `client/src` / `server/src` (excluding migrations); any intentional historical reference in migrations left untouched.
- [ ] Phase **6.16** guide reflects honest status (rename tranche + prior session work); calendar split criterion remains **unchecked** if still a documented gap.
- [ ] Client + server lint pass after code edits.
- [ ] Migration **not** run against remote DB from this environment.

## Definition of Done

- [ ] App starts (`npm run start:dev`) when code touched
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`) when code touched
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated at task-end

---

## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide: `.project-manager/features/appointment-workflow/sessions/session-6.16.3-guide.md`
- Downstream inventory: `.project-manager/features/appointment-workflow/sessions/session-6.16.3-downstream-inventory.md`
- Architecture: `.project-manager/ARCHITECTURE.md`
- Workflow friction log: `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences: `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/`
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `COMPOSABLE_AUTHORING_PLAYBOOK.md`, `FUNCTION_AUTHORING_PLAYBOOK.md`, `COMPONENT_AUTHORING_PLAYBOOK.md`
- Friction reader: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
