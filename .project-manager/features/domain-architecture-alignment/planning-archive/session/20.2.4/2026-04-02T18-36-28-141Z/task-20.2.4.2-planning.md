# Plan: task 20.2.4.2 — API cleanup (event-shape legacy differential-role) + Phase 20.2 closeout

## Contract
- **Tier:** task | **ID:** 20.2.4.2
- **Scope:** **Isolate** legacy **`differentialRole` / `differential_role`** handling for **`eventShape`** only (FEATURE_20 **§5.3**) — remove from global **`FIELD_NAMES`**; keep **reject + strip** behavior. Update **phase 20.2** guide/log/handoff and **`DOMAIN_REWRITE_WORKLOG.md`** for transition to **20.3**. **Out of scope:** availability/wizard “differential” features, client booking utils, **`shared/utils/differentialRoleUtils`** (still used for placement-derived roles).
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
- Task **20.2.4.1** complete (invite order + segment link-strip naming + appointment persistence doc).

## Parent context (session planning — Analysis excerpt)

- Session **20.2.4** closes Phase **20.2** API alignment. **§5.3:** remove or isolate differential-role-specific **route** surface for **event shapes**; **20.2.4.2** finishes docs so **`/phase-end 20.2`** / **20.3** can proceed.

## Story
**This task changes** server entity-layer **constants and file layout** so legacy **`differentialRole`** keys are **only** referenced as **event-shape legacy strip/reject** concerns, and updates **phase 20.2** PM artifacts **because** Feature 20 pass 2 must be **closed with traceable drift notes** before **Phase 20.3** (client/admin UX tranche).

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

- **Paths reviewed:** `server/src/routes/internal/entities/entityConstants.ts` — **`FIELD_NAMES.DIFFERENTIAL_ROLE`** / **`DIFFERENTIAL_ROLE_SNAKE`** (only used for event-shape legacy); `entitySanitizers.ts` — **`sanitizeEventShapeFields`** deletes those keys; `eventShapeEntityValidation.ts` — **`validateEventShapeCreateBody`** / row cleanup. Repo **`rg`**: no other **`FIELD_NAMES.DIFFERENTIAL`** consumers.
- **Patterns / call sites:** Legacy keys must **remain** rejected on write and stripped on sanitize so old clients do not break DB; isolation = **not** advertising them in the generic entity field-name table.
- **Gaps / unknowns:** None — availability **`differentialPerspectives`** and **`availability_differential_attendee`** are unrelated; do not touch.

## Analysis
- **Problem:** Global **`FIELD_NAMES`** still lists differential-role keys though they apply **only** to **`eventShape`** legacy compatibility — contradicts §5.3 “simplify / isolate” intent.
- **Boundaries:** Server **internal entities** only + **.project-manager** phase artifacts; **no** client or booking pipeline edits in this task.
- **Risks:** Accidentally removing validation — **must** preserve explicit error messages and **`delete`** on sanitize/serialize paths.
- **Alternatives:** Leave constants in **`entityConstants`** — rejected; colocating in **`eventShapeEntityValidation`** only would duplicate literals in **`entitySanitizers`** — use one small **`eventShapeLegacyDifferentialRoleKeys.ts`** module.

## Design
1. Add **`server/src/routes/internal/entities/eventShapeLegacyDifferentialRoleKeys.ts`** exporting **`EVENT_SHAPE_LEGACY_DIFFERENTIAL_ROLE_CAMEL`** and **`..._SNAKE`** (const strings + short WHY).
2. **`eventShapeEntityValidation.ts`**: import keys; replace **`FIELD_NAMES.DIFFERENTIAL_*`** usages.
3. **`entitySanitizers.ts`**: import keys; replace deletes.
4. **`entityConstants.ts`**: remove **`DIFFERENTIAL_ROLE`** entries from **`FIELD_NAMES`**.
5. **`phase-20.2-guide.md`**: mark **Overview Status** **Complete** (or equivalent); check **objectives** and session **20.2.4** complete; fix **Status** line if still “Not Started”.
6. **`phase-20.2-log.md`**: append **Session 20.2.4** completion (dedupe duplicate **20.2.2** log blocks only if trivial one-line fix — **optional**, avoid large unrelated edits).
7. **`phase-20.2-handoff.md`**: replace template with **Phase 20.2 → 20.3** real paths under **`domain-architecture-alignment`**, **Current Status**, **Next Action**, **Transition Context**.
8. **`DOMAIN_REWRITE_WORKLOG.md`**: add **Checkpoint 8** (or next) bullet: Phase **20.2** API pass closed — legacy differential-role keys isolated; calendar/appointments alignment from **20.2.4**; next **20.3** per **`FEATURE_20`** pass order.
9. **`session-20.2.4-guide.md`**: mark task **20.2.4.2** complete if present as checkbox.

## Goal
Finish **session 20.2.4** and **Phase 20.2** documentation: isolate **event-shape** legacy **`differentialRole`** API handling per **§5.3**, and record phase completion for **20.3** startup.

## Files
- **Server:** `server/src/routes/internal/entities/eventShapeLegacyDifferentialRoleKeys.ts` (new), `eventShapeEntityValidation.ts`, `entitySanitizers.ts`, `entityConstants.ts`
- **PM:** `.project-manager/features/domain-architecture-alignment/phases/phase-20.2-guide.md`, `phase-20.2-log.md`, `phase-20.2-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.2.4-guide.md`, `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md`
- **Canonical refs:** `FEATURE_20_ARCHITECTURE_REDESIGN.md` **§5.3**, **§8.2**, `phase-20.2-planning.md` Definition of Done

## Approach
1. Implement legacy-key module + wire three entity files; **`grep`** confirms no orphan **`FIELD_NAMES.DIFFERENTIAL`**.
2. Update phase/session guides, log, handoff, worklog per **Design**.
3. **`cd server && npx tsc --noEmit && npm run lint`** (entity-only code changes).

## Checkpoint
- After this task: **`/session-end 20.2.4`** then **`/phase-end 20.2`** (user-driven); next phase **`/phase-start 20.3`** per ladder.

## Deliverables
- Isolated legacy key constants + **unchanged** reject/strip behavior.
- **Phase 20.2** guide/log/handoff + **worklog** entry reflect completion and **20.3** handoff.
- Session **20.2.4** guide task **20.2.4.2** checked.

## Acceptance Criteria
- **`eventShape`** create/update still rejects body keys **`differentialRole`** / **`differential_role`** with the same user-facing guidance (placement fields).
- Sanitizers still **delete** those keys for **`eventShape`**.
- **`FIELD_NAMES`** no longer exports **`DIFFERENTIAL_ROLE`** (grep clean).
- **`phase-20.2-guide.md`** objectives and session **20.2.4** reflect completion; **`phase-20.2-handoff.md`** has real **Next Phase 20.3** context.
- Server **`tsc`** + **`eslint`** pass.

## Implementation Orders
1. Add **`eventShapeLegacyDifferentialRoleKeys.ts`**.
2. Update **`eventShapeEntityValidation.ts`**, **`entitySanitizers.ts`**, **`entityConstants.ts`**.
3. Update **`phase-20.2-guide.md`**, **`phase-20.2-log.md`**, **`phase-20.2-handoff.md`**, **`session-20.2.4-guide.md`**, **`DOMAIN_REWRITE_WORKLOG.md`**.
4. Run server **`tsc`** + **`lint`**.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.2.4-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/task-20.2.4.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
