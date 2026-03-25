# Plan: session 8.5.5 — Joi gap closure **batch C** (verification + documentation). **GC-8-JOI** is already **done** (8.5.4); this session records evidence for auth + stragglers, optional checklist Notes, and server lint.

## Contract
- **Tier:** session | **ID:** 8.5.5
- **Scope:** Batch C verification — `internal/auth` mount (separate from `internal/index.ts`), dev-only GET router (N/A), optional **GC-8-JOI** Notes line; server lint. See `GAP_CLOSURE_HARNESS_ADD_PROMPTS.md` for original batch framing.
- **Governance (harness snapshot):**
  - Governance Context (Session)
  - Function Governance
  - Clean — no violations detected.
  - Component Governance
  - Clean — no violations detected.
  - 3. Script logic can move to composable/util? → extract (Tier1 hotspots: watch, async, map/reduce, DOM)
  - `client/src/composables/booking/useAvailabilitySubStepContent.ts` — oversized-return: Return surface has 15 properties; decompose into focused composables

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** cross_cutting
- **Governance domains:** docs, architecture
- **Gate profile:** standard
- **Suggested depth:** full — advisory; agent decides in Analysis / Decomposition
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition.

## Where we left off
Session 8.5.5 verification complete — see `session-8.5.5-log.md`; run `/session-end 8.5.5` when ready. <!-- harness-across-ladder:start -->

## Story
**This session delivers** a documented **batch C** verification pass (auth router + any stragglers under `server/src/routes/internal`) **so that** the optional third slice from `GAP_CLOSURE_HARNESS_ADD_PROMPTS.md` is explicitly closed with evidence, even though **GC-8-JOI** was already marked **done** in session 8.5.4.
**Estimated size:** S

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
| **Auth / Sessions** | Router guards; future `composables/auth/` | `routes/internal/auth`, `auth/`, `db/models/auth` | Sessions, users, magic links (evolving) | Auth contracts in `@shared` as they stabilize |
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

## 5. Per-domain conventions

### Booking / wizard

- **Composable prefixes:** `useBooking*`, `useAvailability*`, `useWizard*`, `useAppointment*`, `useProperty*` (orchestrators such as `useAvailabilityOrchestrator`, `useBookingWizardSetup`).
- **Components:** under `components/booking/` (steps in `components/booking/steps/`).
- **Depends on** admin metadata (wizard blocks, availability rules) — document cross-domain deps in planning **Analysis**.

### Admin

- **Prefixes:** `useAdmin*`, `useEntity*`, entity CRUD around `EntityBase<GlobalEntityKey>` + `ENTITY_CONFIGS`.
- **Pattern:** Generic admin components + config objects + transformers.

### Auth

- **Emerging domain;** keep route and model changes aligned with `routes/internal/auth` and `db/models/auth`. Consumed by all domains via middleware/guards over time.

### Integrations

- Prefer **dedicated services** and **external routes**; avoid mixing full-URL axios into `apiClient` call sites without reason.

### Beta

- Isolated feedback capture; keep `beta` paths grouped under composables/views/components/beta.

---

## Analysis

- **Context:** Sessions **8.5.3** (batch A) and **8.5.4** (batch B) audited `InternalRouter` mounts in `server/src/routes/internal/index.ts` and fixed GAPs; **GC-8-JOI** was set to **done** in 8.5.4. The playbook’s **batch C** is an optional final sweep: dev-only routers, edge paths, and anything missed.
- **Gap vs prior work:** The main internal tree is mounted from `internal/index.ts`. **`/v1/internal/auth`** is registered separately in `server/src/routes/index.ts` but lives under `server/src/routes/internal/auth/` — it was **not** in the batch A/B mount list. Auth POST routes already use **`validateRequest` + Joi** (`loginBodySchema`, `magicLinkRequestBodySchema`, etc.); GET routes need no body validation.
- **Dev router:** `devStatusRouter` is **GET-only** — N/A for POST/PUT/PATCH Joi sweep (confirmed in 8.5.4 batch B).
- **This session’s value:** Written confirmation in planning + session log that batch C scope is reviewed; optional **Notes** line on **GC-8-JOI** citing batch C (status stays **done**).

## Goal

Complete **batch C** as **verification + documentation**: (1) confirm `internal/auth` mutating routes use `validateRequest` or are documented exceptions; (2) confirm no additional `routes/internal/**` routers are mounted outside the batch A/B inventory without review; (3) run **server lint**; (4) add a **GC-8-JOI** Notes bullet for batch C (or session-log-only if checklist row is already crowded).

## Files

- `server/src/routes/index.ts` — mount layout (`/internal/auth` vs `/internal`)
- `server/src/routes/internal/auth/authRouter.ts` — read-only verification
- `server/src/routes/internal/index.ts` — batch A/B mount inventory (read-only)
- `.project-manager/GAP_CLOSURE_CHECKLIST.md` — optional Notes refinement for GC-8-JOI
- Session log / handoff — batch C summary

## Approach

1. **Task 8.5.5.1:** Read auth router + route index; record verdict table (mutating routes → COVERED / N/A); one paragraph “no further GAPs” for batch C scope.
2. **Task 8.5.5.2:** `cd server && npm run lint`; update checklist Notes (optional) and session log; **`/session-end 8.5.5`** when tasks complete.

## Checkpoint

- Batch C verification narrative exists (task planning or session log).
- Server lint clean.
- Harness docs updated for session close.

## Deliverables

- Batch C verification record (auth + mount layout).
- Server lint evidence.
- Optional GC-8-JOI Notes append; session log entry.

## Decomposition

- **Task 8.5.5.1:** Audit batch C scope — `internal/auth` + mount layout vs batches A/B; document COVERED/N/A; confirm no new GAPs
- **Task 8.5.5.2:** Server lint + optional `GAP_CLOSURE_CHECKLIST` Notes + session documentation; prepare for session-end

## Acceptance Criteria

- Auth mutating POST routes are confirmed to use `validateRequest` (or equivalent) per file read.
- Explicit statement that dev/internal sweep has no remaining unvalidated mutating routes in scope.
- Server lint passes.

## Definition of Done

- [ ] Server lint passes
- [ ] Session tasks complete; session log reflects batch C
- [ ] Session-end when ready

## Coverage check (agent)

**Goal:** Close batch C as verification + docs given GC-8-JOI already done.

**Decomposition:** Task 8.5.5.1 = evidence gathering; 8.5.5.2 = lint + checklist/session hygiene. **Enough steps** to enact the goal; no code changes required unless a new GAP is found (unlikely).

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/phases/phase-8.5-guide.md`
- Handoff (full transition context): `.project-manager/features/security-hardening/sessions/session-8.5.4-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
