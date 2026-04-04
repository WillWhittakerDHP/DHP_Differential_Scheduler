# Plan: task 20.7.2.1 — Event-routing watchpoint (`event_assignments`)

## Contract
- **Tier:** task | **ID:** 20.7.2.1
- **Scope:** Write **§1 — Event-routing watchpoint** in **`preflight-evidence-20.7.2.md`**: document how **`event_assignments`** / **`eventAssignments`** flow from global data through booking slot builders into **`PartFinalizer`**, cite **≥2** concrete client paths (booking + admin), and list **pass vs risk** for any ambiguity. **Tasks 20.7.2.2–20.7.2.3** are **out of scope** here.
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

**Session 20.7.2** accepted; first executable slice is **20.7.2.1**. **`preflight-evidence-20.7.2.md`** may not exist yet — create it with this section first; **20.7.2.2** / **20.7.2.3** append later tasks.

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** Close-out phases **20.8+** assume the preflight package exists; without it, execution work re-litigates **`event_assignments`** and **`property_details`** boundaries.
- **Domains:** Booking + admin + migrations — **evidence is mostly markdown**; code changes only for **documented** follow-ons (separate task).
- **Dependencies:** **Session 20.7.1** delivered **`architecture-alignment-closeout-master-plan.md`**; this session adds **evidence** files under **`.project-manager/`** (or append to **`DOMAIN_REWRITE_WORKLOG.md`** with clear headings).
- **Risks:** Scope creep into product refactors — **mitigate** by PASS/FAIL table + “deferred to phase X” rows.

## Story

**This task adds** the first block of the preflight evidence package **because** **`phase-20.7-guide.md`** requires a written **event-routing watchpoint** before close-out phases **20.8+** assume the contract is clear.

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

- **Paths reviewed:** `client/src/utils/booking/appointmentSlotBuilder.ts` (builds `eventAssignmentsByPartShape` from `eventAssignmentsRelationships`); `client/src/utils/booking/partFinalizerSlotShape.ts` / `partFinalizerSlotShapeHelpers.ts` (consume **`eventAssignmentsByPartShape`** for **`resolvedEvent`**); `client/src/utils/admin/codeFirstMetadataCache.ts` + `codeFirstSelectInputConfigs.ts` (admin **`eventAssignments`** collection contract on block instances); `shared/constants/collectionFieldKeys.ts` or relationship keys if cited for **`event`** routing.
- **Patterns:** **ARCHITECTURE.md** §10.1 — events are relational **`event_assignments`**, not scalar overrides on part rows; **`partFinalizer`** path must align with that contract.
- **Gaps:** Any server-only write path that mutates event placement without going through the same relational model — note as **risk** with file cite if found during doc work.

## Analysis

- **Problem:** Agents need **one** narrative that ties **admin** editing of **`eventAssignments`** to **booking** resolution without re-reading the whole pipeline.
- **Boundary:** Documentation + **read-only** code citations; no behavior change unless a **separate** follow-on task is filed.
- **Follow-on:** Invariant table and migration policy belong to **20.7.2.2** / **20.7.2.3**.

## Design

1. Create **`preflight-evidence-20.7.2.md`** at feature root with title, date, link to **`architecture-alignment-closeout-master-plan.md`** and **`ARCHITECTURE.md`** §10–§11.
2. Add **`## 1. Event-routing watchpoint`** with subsections: **Data flow (booking)**, **Admin surface**, **Ambiguity / risks** (bulleted, each with repo path).
3. Explicitly state **pass** vs **risk** for each ambiguity called out in **`phase-20.7-guide.md`** Session **20.7.2** (“confirm live meaning where code appears ambiguous”).

## Goal

Deliver **§1 — Event-routing watchpoint** in **`preflight-evidence-20.7.2.md`** with cited client paths for **booking** and **admin** and a clear **risk register** paragraph.

## Files

- **Create or update:** `.project-manager/features/domain-architecture-alignment/preflight-evidence-20.7.2.md` (at minimum §1; stub headings for §2–§4 optional with “TBD — tasks 20.7.2.2 / 20.7.2.3”).
- **Read-only for citations:** `client/src/utils/booking/appointmentSlotBuilder.ts`, `partFinalizerSlotShape.ts`, `partFinalizerSlotShapeHelpers.ts`, `client/src/utils/admin/codeFirstMetadataCache.ts`, `codeFirstSelectInputConfigs.ts`.

## Approach

1. Create the markdown file and write **§1** full content.
2. Grep **`event_assignments`** / **`eventAssignments`** under **`client/src`** for any extra hot paths worth one line each (cap list ~8 bullets).
3. End §1 with a **Next** line pointing to **task 20.7.2.2** / **20.7.2.3** for remaining sections.

## Checkpoint

- **`phase-20.7-guide.md`** Session **20.7.2** task “Confirm live meaning of **`event_assignments`**…” is addressable from §1 alone (or explicitly marked **risk** with owner **phase 20.10** booking alignment if unresolved).

## Deliverables

- **`preflight-evidence-20.7.2.md`** containing a complete **§1 Event-routing watchpoint**.

## Acceptance Criteria

- [ ] **≥2** cited code paths: **one** booking pipeline file (**`appointmentSlotBuilder`** or **`partFinalizer*`**), **one** admin file (**`codeFirstMetadataCache`** or **`codeFirstSelectInputConfigs`**).
- [ ] Paragraph or table that states **pass** or **risk** for each ambiguity the guide calls out (or “none observed” with justification).
- [ ] No edits to **20.7.2.2** / **20.7.2.3** scope (invariant audit / migration policy) in this task diff.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.7.2-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
