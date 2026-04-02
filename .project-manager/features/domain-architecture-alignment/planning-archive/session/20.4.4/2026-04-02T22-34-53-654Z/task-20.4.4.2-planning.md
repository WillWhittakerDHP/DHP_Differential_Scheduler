# Plan: task 20.4.4.2 — 20.4.4.2

## Contract
- **Tier:** task | **ID:** 20.4.4.2
- **Scope:** 20.4.4.2
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
- [ ] #### Task 20.4.4.2: Minimizer + grep-gated `@shared` `differentialRole*` cleanup **Goal:** **`minimizerEventShapes`** — simplify legacy override branch only if grep proves safe; **`shared/`** — remove **only** unreferenced symbols (full-repo grep). **Files:** `minimizerEventShapes.ts`, `shared/utils/differentialRoleUtils.ts`, `shared/constants/differentialRoleMappings.ts`, types as needed **Approach:** Grep-before-delete; document deferrals in task log if nothing is safe to remove. **Checkpoint:** Client (+ server if shared touched) lint/typecheck clean; admin differential-role UI intact (See tier-up guide linked below)

## Parent context (session planning — Analysis excerpt)

- **Why now:** **20.4.3** cleared override **threading**; this session removes **dead API** and dedupes **perspective** resolution.
- **Boundaries:** **`client/src/utils/booking/*`** first; **`@shared`** edits only with **full-repo grep** (client + server importers).
- **Risks:** Deleting **`shared/types/differentialRole`** or **`differentialRoleUtils`** wholesale — **rejected**;… _(truncated)_

## Story
**This task** drops dead minimizer logic that depended on **`differentialEventRoleOverrides`** (booking no longer produces non-empty maps after **20.4.3**) **and** removes **`@shared`** exports that full-repo grep shows have **zero** importers, **because** phase **20.4** is closing out placement-only scheduling without carrying unused API surface.

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

- **Paths reviewed:** `client/src/utils/booking/minimizerEventShapes.ts`; `client/src/utils/eventAttendeeUtils.ts`; `client/src/types/appointmentModels.ts`; `client/src/configs/field/display/appliedDisplay/blockInstanceDisplays.ts`; `shared/utils/differentialRoleUtils.ts`; `shared/utils/eventPlacementUtils.ts`; `shared/constants/differentialRoleMappings.ts`; `shared/types/differentialRole.ts`; ripgrep `differentialEventRoleOverrides`, `differentialRole`, `toApiDifferentialRole`, `sanitizeDifferentialRoleInput`, `DIFFERENTIAL_ROLE_SELECT_OPTIONS` across repo (code + excluding `.project-manager` for “dead symbol” checks where noted).
- **Patterns / call sites:** **`listMinimizerSegmentsFromAppointmentShape`** branches on **`hasNonEmptyDifferentialRoleOverrides(shape.differentialEventRoleOverrides)`**; placement-only path uses **`sanitizeEventPlacementKindInput(...) === 'floating'`**. Callers: **`useMinimizerPartsScheduling.ts`**, **`minimizerDurationFromAppointmentShape.ts`**. **`eventAttendeeUtils`** still implements **non-empty override** branches for **`resolvePrimarySecondaryEventShapesForBooking`** / **`resolveDifferentialMajorMinorFromEventShapes`** (unchanged this task). **`differentialRoleUtils`**: **`effectiveDifferentialRole`**, **`sanitizeDifferentialEventRoleOverridesInput`**, **`parseDifferentialRole`**, internals — actively imported; **`toApiDifferentialRole`** / **`sanitizeDifferentialRoleInput`** — **no** importers outside their defining file. **`differentialRoleMappings`**: **`DIFFERENTIAL_ROLE_LABELS`** — **`DifferentialEventRoleOverridesField.vue`**; **`DIFFERENTIAL_ROLE_SELECT_OPTIONS`** — **no** TS/Vue/JS importers (dead export).
- **Gaps / unknowns:** Hand-crafted or ancient persisted JSON that still embeds **`differentialEventRoleOverrides`** on an **`AppointmentShape`** would no longer affect minimizer segment listing after simplification; **20.4.3** + grep show **no** booking/server writers — risk accepted as alignment with placement-only policy.

## Analysis
- **Problem / why now:** Session **20.4.4** final slice: remove minimizer **legacy override** branch that no longer has a producer on the booking path, and prune **unreferenced** shared exports (**§6.2-style**) without touching types or admin field contracts.
- **Boundaries:** **`client/src/utils/booking/minimizerEventShapes.ts`** (booking); **`shared/utils`**, **`shared/constants`** — grep-gated deletes only; **do not** remove **`shared/types/differentialRole.ts`**, **`effectiveDifferentialRole`**, **`sanitizeDifferentialEventRoleOverridesInput`**, or **`DIFFERENTIAL_ROLE_LABELS`** (admin + **`eventPlacementUtils`** / **`eventAttendeeUtils`** still need them).
- **Patterns:** Keep **placement_kind** as source of truth for minimizer discovery (matches **20.4.3**). **`eventAttendeeUtils`** override branches stay until a later task explicitly removes all override arity from booking helpers.
- **Risks:** If a hidden caller passed non-empty overrides into **`listMinimizerSegmentsFromAppointmentShape`**, behavior would change — mitigated by full-repo grep showing **no** **`differentialEventRoleOverrides`** writes under **`client/`** except reads in **`minimizerEventShapes`** and optional type / display config.
- **Alternatives:** **Defer** minimizer simplification — **rejected** here because grep evidence is strong and the branch adds complexity and imports for a dead path.

## Design
1. **`minimizerEventShapes.ts`:** Remove **`useOverridePath`** branch, **`effectiveDifferentialRole`**, **`DifferentialRole`**, and **`hasNonEmptyDifferentialRoleOverrides`** imports. Single loop: include finals where **`sanitizeEventPlacementKindInput(eventShape.placementKind) === 'floating'`** (non-floating / marginal unchanged). Update file header / function JSDoc to describe **placement-only** minimizer discovery (no override map).
2. **`shared/constants/differentialRoleMappings.ts`:** Delete **`DIFFERENTIAL_ROLE_SELECT_OPTIONS`** (and its array) — **grep-clean** dead export; keep **`DIFFERENTIAL_ROLE_LABELS`**.
3. **`shared/utils/differentialRoleUtils.ts`:** Delete **`toApiDifferentialRole`** and **`sanitizeDifferentialRoleInput`** — **grep-clean**; keep **`INVALID_LEGACY_*`**, **`parseDifferentialRole`**, **`isDifferentialRoleStorage`**, **`isDifferentialRoleOverrideValue`**, **`sanitizeDifferentialEventRoleOverridesInput`**, **`effectiveDifferentialRole`** (still used).
4. **Verification:** `cd client && npx vue-tsc --noEmit && npm run lint`; `cd server && npm run lint` (shared touched). Re-grep removed symbol names → only docs or absent.

## Goal
Close **phase 20.4** session **4**: perspective API matches **placement-only** booking; **no dead `resolveEventShapes` parameters**; **§6.2**-style shared pruning **grep-gated**; **admin** + **server** contracts preserved.

## Files
- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (**§6.2**, **§8.4**)
- **PM:** `phases/phase-20.4-guide.md`, `sessions/session-20.4.4-guide.md`, `sessions/session-20.4.3-handoff.md`
- **Implementation:** `client/src/utils/booking/perspectiveResolver.ts`; `client/src/utils/booking/minimizerEventShapes.ts`; `shared/utils/differentialRoleUtils.ts`, `shared/constants/differentialRoleMappings.ts`, `shared/types/differentialRole*` — **only if grep-clean**

## Approach
1. Run **20.4.4.1** then **20.4.4.2**; **`vue-tsc`** + **`npm run lint`** (`client/`) per task; **server lint** if **shared/** or **server/** touched.
2. **Grep-before-delete** for any **shared** removal.

## Checkpoint
- **Perspective** / slot **end-time** behavior unchanged for **no-override** templates.
- **Admin** **`DifferentialEventRoleOverridesField`** and block-instance saves unaffected.

## Deliverables
- Simplified **`listMinimizerSegmentsFromAppointmentShape`** (placement-only floating check; no override branch).
- Removed dead exports: **`DIFFERENTIAL_ROLE_SELECT_OPTIONS`**, **`toApiDifferentialRole`**, **`sanitizeDifferentialRoleInput`**.
- Task log note if any planned deletion is skipped (not expected).

## Acceptance Criteria
- [ ] Full-repo grep shows **no** remaining references to removed symbols in `client/`, `server/`, `shared/` (excluding `.project-manager`).
- [ ] **`DifferentialEventRoleOverridesField.vue`** still builds (still uses **`DIFFERENTIAL_ROLE_LABELS`**, **`sanitizeDifferentialEventRoleOverridesInput`**).
- [ ] **`eventPlacementUtils`** / **`eventAttendeeUtils`** unchanged except any knock-on type fixes from shared deletes (none expected).
- [ ] Client + server lint and **`vue-tsc`** pass.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/task-20.4.4.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
