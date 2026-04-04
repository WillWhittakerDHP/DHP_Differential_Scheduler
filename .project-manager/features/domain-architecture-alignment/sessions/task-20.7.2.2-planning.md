# Plan: task 20.7.2.2 — Invariant audit (ARCHITECTURE.md §14)

## Contract
- **Tier:** task | **ID:** 20.7.2.2
- **Scope:** Write **`## 2. Invariant audit`** in **`preflight-evidence-20.7.2.md`**: a **pass / fail / unknown** table grounded in **ARCHITECTURE.md §14** (and §10 where it tightens PartFinalizer / events / `property_details`), covering **lineage**, **zero-out ordering**, **relational events**, **client PartFinalizer boundary**, and **`property_details` vs configuration** — with each **fail** or **unknown** row naming an **owning extension phase** (**20.8–20.13**) and pointer to **`phase-20.x-guide.md`**. **Tasks 20.7.2.1** (done) and **20.7.2.3** (migration + §4 boundary prose) are **out of scope** here.
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

**20.7.2.1** delivered **§1** in **`preflight-evidence-20.7.2.md`**. This task fills **§2** (replace the stub). **`§3` / `§4`** remain for **20.7.2.3**.

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** Close-out phases **20.8+** assume the preflight package exists; without it, execution work re-litigates **`event_assignments`** and **`property_details`** boundaries.
- **Domains:** Booking + admin + migrations — **evidence is mostly markdown**; code changes only for **documented** follow-ons (separate task).
- **Dependencies:** **Session 20.7.1** delivered **`architecture-alignment-closeout-master-plan.md`**; this session adds **evidence** files under **`.project-manager/`** (or append to **`DOMAIN_REWRITE_WORKLOG.md`** with clear headings).
- **Risks:** Scope creep into product refactors — **mitigate** by PASS/FAIL table + “deferred to phase X” rows.

## Story

**This task extends** the preflight package with a formal **§14 drift table** **because** session **20.7.2** acceptance requires every **fail/unknown** gap to have an **owning close-out phase** before execution work in **20.8+** starts.

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

- **Authority:** `.project-manager/ARCHITECTURE.md` **§10** (resolution order, `property_details`), **§11**, **§12**, **§14** (numbered invariants + sub-bullets **2a–2c**, **3a–3g**, **4a–4c**).
- **Client PartFinalizer / booking:** `client/src/utils/booking/partFinalizer.ts` (orchestrates part finals; filters **`zeroOutPart`**); `partFinalizerSlotShape.ts` / `partFinalizerSlotShapeHelpers.ts` (slot-shape / event duration aggregation); `appointmentSlotBuilder.ts` ( **`eventAssignmentsByPartShape`** keyed by part shape name — **§14.3d** tension noted in **§1**); `blockFinalizer.ts` / `PartFinal.ts` if zero-out rollup needs citation.
- **Relational events:** `client/src/constants/relationships.ts` (`event_assignments`); **§1** watchpoint + `fetchToGlobalTransformer` `parentKind` override for **`eventAssignments`**.
- **`property_details` (appointment vs config):** `client/src/utils/booking/appointmentDataBuilders.ts`, `availabilityPropertyDetailsSlice.ts`, wizard handlers — **evidence for §14.5** row; deeper **§10.4 / §12** prose is **20.7.2.3**.
- **Phase guides for ownership labels:** `phases/phase-20.8-guide.md` (schema/API, event routing enforcement), **20.9** (admin), **20.10** (booking pipeline, lineage, zero-out, placement), **20.11** (migrations narrative — only if a gap is migration-shaped), **20.12** (cleanup/vocabulary), **20.13** (truth docs).

## Analysis

- **Problem:** Execution phases need a **single table** that states whether the repo still satisfies **§14** or where drift is **unknown**, without mixing in migration policy (**20.7.2.3**).
- **Boundary:** Markdown-only update to **`preflight-evidence-20.7.2.md`**; no product code unless a follow-on task is filed under **20.8+**.
- **Method:** One table row per **§14** bullet (and key sub-bullets **3d, 3e, 3f** explicitly named in session acceptance). Use **pass** when code + architecture align; **fail** when contradiction is demonstrable; **unknown** when not verified in this pass — always assign **owning phase** for **fail/unknown**.

## Design

1. Open **`preflight-evidence-20.7.2.md`** and replace the **§2** stub with:
   - Short intro referencing **§14** verbatim intent (“If any assertion below is violated…”).
   - **Markdown table:** columns **`Invariant (§14 ref)`** | **`Status`** | **`Evidence (paths / notes)`** | **`Owning phase`** | **`Guide link`**.
2. **Row coverage (minimum):** **§14.1** domain separation; **§14.2** (+ **2a–c** optionally condensed); **§14.3** with explicit rows or sub-rows for **lineage (3d)**, **relational events (3e)**, **client PartFinalizer (3f)**, **per-block-instance provenance (3g)**; **§14.4** events-as-data; **§14.5** `property_details` (appointment data not configuration) — **may be unknown** pending **20.7.2.3** detail, but row must exist; **§14.6** user orchestrators.
3. **Owning phase heuristic (default):**
   - Schema, API, event-routing integrity → **20.8**
   - Admin/editor surfaces → **20.9**
   - Booking pipeline, lineage, zero-out, placement, PartFinalizer behavior → **20.10**
   - Migration/seed/conversion narrative → **20.11**
   - Transitional code / vocabulary → **20.12**
   - Doc reconciliation / feature end → **20.13**
4. Cross-link **§1** for **`event_assignments`** / **`parentKind`** — do not duplicate the full watchpoint; one sentence pointer is enough.

## Goal

Deliver a complete **`## 2. Invariant audit`** section in **`preflight-evidence-20.7.2.md`** satisfying session **20.7.2** acceptance: lineage, zero-out, relational events, client PartFinalizer, **`property_details`** separation — each **fail/unknown** has **owning phase 20.8–20.13**.

## Files

- **Update:** `.project-manager/features/domain-architecture-alignment/preflight-evidence-20.7.2.md` (**§2** only; leave **§3–§4** stubs for **20.7.2.3**).
- **Read:** `.project-manager/ARCHITECTURE.md` §10–§14; phase guides **`phase-20.8-guide.md`–`phase-20.13-guide.md`** (titles only for table); client paths listed in **Codebase recon**.

## Approach

1. Re-read **§14** and list every invariant to appear as a row (merge tiny sub-bullets where redundant).
2. For each row, assign **pass / fail / unknown** from **documented** code paths (short citations); use **unknown** when the audit does not trace code end-to-end.
3. For every **fail** or **unknown**, set **Owning phase** and **`phase-20.x-guide.md`** link per heuristic.
4. Add a one-line **See also:** pointer to **§1** for event-routing specifics.

## Checkpoint

- A reader can answer “Which §14 rows are red?” and “Which phase guide owns each?” using only **`preflight-evidence-20.7.2.md` §2**.

## Deliverables

- **`preflight-evidence-20.7.2.md`** with **§2** complete (not a stub).

## Acceptance Criteria

- [ ] **§2** is a table (or equivalent structured list) with **pass / fail / unknown** per **§14**-scoped check; **lineage**, **zero-out**, **relational events**, **client PartFinalizer**, **`property_details`** are all explicitly addressed (session **20.7.2** AC).
- [ ] Each **fail** or **unknown** names an **owning phase** in **20.8–20.13** and points to the matching **`phase-20.x-guide.md`**.
- [ ] No replacement of **§3** or **§4** content (**20.7.2.3**).
- [ ] No undocumented production code change in this task.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.7.2-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/task-20.7.2.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
