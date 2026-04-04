# Plan: task 20.7.3.1 — Preflight crosswalk → phase guides (20.8–20.13)

## Contract
- **Tier:** task | **ID:** 20.7.3.1
- **Scope:** Add **concise backlog bullets** (or a **`### Preflight follow-ups (Session 20.7.2)`** subsection) to **`phase-20.8-guide.md`–`phase-20.13-guide.md`** so every **unknown** / **fail** row and material **§1.4 risk** in **`preflight-evidence-20.7.2.md`** maps to the **intended** extension phase; optionally add **`across-ladder.json`** notes for session **20.7.3** if the schema supports it. **Out of scope:** **`preflight-evidence-20.7.2.md` §3–§4**, **`phase-20.7-log.md`**, feature/session handoffs — **task 20.7.3.2**.
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

**Session 20.7.3** accepted; first executable slice is **20.7.3.1** (guide crosswalk). **`preflight-evidence-20.7.2.md` §1–§2** are the source of truth.

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** Without guide-level backlog rows, **20.8+** agents re-derive gaps from scratch; preflight investment must **land visibly** in **`phase-20.x-guide.md`**.
- **Boundaries:** **`.project-manager/`** documentation only; no **`client/`** / **`server/`** product change unless a follow-on **task** under **20.8+** files it.
- **Dependencies:** **20.7.2** complete for **§1–§2**; **§3–§4** completed in this session.
- **Risks:** Duplicating long **20.1–20.6** narratives — **mitigate** with short bullets + links to **`preflight-evidence-20.7.2.md`** / **ARCHITECTURE.md**.

## Story

**This task updates** six **phase guides** under Feature **20** **because** preflight conclusions must be **visible** on the extension ladder before **`/phase-start 20.8`**, not buried only in **`preflight-evidence-20.7.2.md`**.

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

- **Paths reviewed:** `.project-manager/features/domain-architecture-alignment/preflight-evidence-20.7.2.md` (**§1.4** risks, **§2** table, **§2.1** summary); `.project-manager/features/domain-architecture-alignment/phases/phase-20.8-guide.md` … **`phase-20.13-guide.md`** (existing **Objectives** / **Overview** structure); `.project-manager/features/domain-architecture-alignment/across-ladder.json` (keys for phases/sessions).
- **Patterns:** Each §2 row already has **Owning phase** + guide link — task work is **editorial propagation** into those guides, not re-auditing code.
- **Gaps:** If a guide has no natural **Objectives** list, add a short **Preflight** subsection after **Overview** or under **Phase intent**.

## Analysis

- **Problem:** Execution agents read **`phase-20.x-guide.md`** first; without mirrored bullets, **§14** gaps stay only in preflight.
- **Boundary:** **`.project-manager/features/domain-architecture-alignment/phases/*.md`** + optional **`across-ladder.json`**; no **`client/`** / **`server/`** edits.
- **Task 20.7.3.2** will complete **§3–§4** and handoffs — **do not** do that here.

## Design

1. For **phase 20.8:** map §2 rows tagged **20.8** (**§14.1**, **§14.3**, **§14.3a–c**) + **§1** risks that imply **API/schema/event routing** integrity.
2. For **20.9:** **§14.2a–c**, **§14.6**, admin/orchestration semantics + **§1.4** dual admin surface coordination.
3. For **20.10:** **§14.3d**, **§14.3g**, **§10.3** zero-out, **§14.4a–c**, **§14.5** (pointer until §4 lands), **§1.4** **part_shape** / booking pipeline risks.
4. For **20.11:** migration/narrative follow-ups only if preflight implies **seed/conversion** (light pointer; heavy prose in **§3** is **20.7.3.2**).
5. For **20.12:** vocabulary/cleanup pointers only if a risk is “retire alias” (optional; may be empty).
6. For **20.13:** doc reconciliation / truth alignment pointer for **§2** **unknown**s that are **doc-verification** shaped.
7. **`across-ladder.json`:** If JSON has **`notes`** / **`description`** per session, set **20.7.3** to *“Crosswalk preflight → phase guides 20.8–20.13 (task 20.7.3.1).”* If not, **skip** JSON (no invalid keys).

## Goal

After this task, each **owning phase** guide (**20.8–20.13**) lists **its** preflight-sourced items with a link to **`../preflight-evidence-20.7.2.md`** (or repo-relative equivalent) and **`.project-manager/ARCHITECTURE.md`** where relevant.

## Files

- **Edit:** `phases/phase-20.8-guide.md` … `phases/phase-20.13-guide.md`
- **Optional edit:** `across-ladder.json` (only if structure supports session notes without breaking consumers)
- **Read-only:** `preflight-evidence-20.7.2.md`

## Approach

1. Open **`preflight-evidence-20.7.2.md`** §2 table; group rows by **Owning phase** column.
2. Merge **§1.4** three risks into the same groups (**20.8–20.10** primarily).
3. Patch each **`phase-20.x-guide.md`** with **3–8 bullets** max per phase (no copy-paste of full §2 table).
4. If **`across-ladder.json`** has a safe field for **20.7.3**, add one line; else omit.

## Checkpoint

- A reader opening **`phase-20.10-guide.md`** sees **lineage / zero-out / property_details** follow-ups without opening preflight first (preflight remains authoritative for detail).

## Deliverables

- Six phase guides updated (**20.8–20.13**).
- Optional **`across-ladder.json`** touch documented in task-end notes if done.

## Acceptance Criteria

- [ ] Every **§2** row with **unknown** (and **fail** if any) has a **matching** bullet in the guide for its **Owning phase** column.
- [ ] **§1.4** risks (**parentKind**, dual admin **`eventAssignments`**, **part_shape** map) appear under **20.8** / **20.9** / **20.10** as appropriate.
- [ ] No changes to **`preflight-evidence-20.7.2.md` §3–§4** in this task diff.
- [ ] No **`client/`** / **`server/`** product code.

## Definition of Done

- [ ] Deliverables / acceptance criteria for **20.7.3.1** met (markdown under **`.project-manager/`**).
- [ ] App / lint — **N/A** unless product files touched.

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.7.3-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
