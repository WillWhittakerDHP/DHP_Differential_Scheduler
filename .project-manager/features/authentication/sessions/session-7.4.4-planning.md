# Plan: session 7.4.4 — Enactment GC-7-E1 — Selective requireAuth/requireRole on internal routes per product rules; maintain anonymous allowlist for booking wizard paths; document router-level policy in handoff; align with appointment ownership and CSRF ordering; update GAP_CLOSURE_CHECKLIST GC-7-E1 to done or split follow-up rows when verified (lint + smoke).

## Contract
- **Tier:** session | **ID:** 7.4.4
- **Scope:** Enactment GC-7-E1 — Selective requireAuth/requireRole on internal routes per product rules; maintain anonymous allowlist for booking wizard paths; document router-level policy in handoff; align with appointment ownership and CSRF ordering; update GAP_CLOSURE_CHECKLIST GC-7-E1 to done or split follow-up rows when verified (lint + smoke).
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
Phase **7.4** parent guide was created to host harness sessions; **7.4.1–7.4.3** are checked complete (historical GC-7.4 client tranche, no session handoffs). **8.6 / 8.7** delivered real **CSRF** and **appointment `checkOwnership`** on the server. **GC-7-E1** remains open: internal APIs are not uniformly gated by **`requireAuth` / `requireRole`**, and a global blanket on `/internal` would break the anonymous booking wizard.

## Story
**This session delivers** a documented **router-level enactment policy** (which internal routes stay anonymous for the wizard vs require authenticated staff/admin) and **selective middleware** on Express routers **so that** admin configuration and dangerous mutations are identity-gated without breaking public booking flows **and** **GC-7-E1** can move to **done** after lint + smoke.
**Estimated size:** M

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
- **Problem:** `v1Router.use("/internal", …)` mounts many sub-routers **without** a global `requireAuth`. That was intentional so the **booking wizard** can call internal read/write paths with an **anonymous session** (cookie + CSRF) where product rules allow. Admins need **staff/admin** identity on sensitive routers. Without an explicit matrix, drift risks **IDOR** or **broken wizard** if someone adds blanket auth.
- **Boundaries:** Crosses **Auth**, **Booking**, **Admin** (ARCHITECTURE domains). Server-only changes in `server/src/routes/internal/**` and possibly `server/src/middlewares/security.ts` / small doc under `server/docs/` or feature handoff. Client: confirm **`client/src/router/index.ts`** admin gating still aligns with **`GET /internal/auth/session/me`** (already used for admin entry); document policy in **session handoff**.
- **Patterns:** Per-route middleware stacks — canonical order for mutating routes: **`csrfProtection` → `requireAuth` → `requireRole(…)` → `checkOwnership(…)`** (when ownership applies). **`checkOwnership`** already logs when **`req.user`** is missing; routes that rely on ownership for real enforcement must run **`requireAuth` first** for authenticated callers. **GET** remains CSRF-exempt per `security.ts` **SAFE_HTTP_METHODS**.
- **Risks:** Over-gating wizard **POST/PATCH** (availability, appointments, properties) breaks booking; under-gating admin metadata or entity CRUD exposes configuration. **Mitigation:** inventory client `apiClient` usage by route prefix before changing middleware; smoke both paths.
- **Alternatives considered:** (1) Global `router.use(requireAuth)` on `InternalRouter` with a large **exclusion list** — fragile. (2) Split **public-internal** vs **admin-internal** mount points — larger refactor. **Chosen:** selective middleware on **existing sub-routers** or **router groups** plus a written matrix.

## Goal
1. Produce an **allowlist / matrix** (wizard-safe vs auth-required internal routes) agreed with product rules and current Vue usage.
2. Apply **`requireAuth` / `requireRole`** only where required; preserve anonymous access for wizard-critical paths.
3. Document **router-level policy** in **`session-7.4.4-handoff.md`** (and optionally `server/docs/` stub if project prefers server-local security docs).
4. Verify **middleware order** with **CSRF** and **appointment `checkOwnership`** on affected mutating routes.
5. Update **`GAP_CLOSURE_CHECKLIST.md`** **GC-7-E1** to **done** (or split follow-up rows) after **server + client lint** and **smoke** (anonymous wizard + logged-in admin).

## Files
- `server/src/routes/internal/index.ts` — optional grouped `Router()` mounts with shared middleware (if cleaner than per-file edits).
- `server/src/routes/internal/**/*.ts` — appointment, availability, properties, admin-metadata, entities, users, settings routers (inventory-driven).
- `server/src/routes/internal/auth/authRouter.ts` — reference for existing **`session/me`**, **`requireRole`** patterns.
- `server/src/middlewares/security.ts` — reference only unless a small shared helper is justified.
- `client/src/router/index.ts` — document alignment with admin vs public routes (may need no code change).
- `client/src/utils/api` / composables — trace which paths the wizard calls (inventory support).
- `.project-manager/features/authentication/sessions/session-7.4.4-handoff.md` — policy summary for next agent (created at session-end; plan content here).
- `.project-manager/GAP_CLOSURE_CHECKLIST.md` — **GC-7-E1** row.

## Approach
1. **Inventory:** From client booking/admin composables and `server/src/routes/internal/index.ts`, list endpoints the wizard needs **without** logged-in **User** (anonymous session OK).
2. **Matrix:** Table: path prefix / method / anonymous OK? / role if not / notes (CSRF, ownership).
3. **Implement:** Add middleware at the **smallest stable boundary** (sub-router `use` or route group), preserving **csrf → auth → role → ownership** on mutations.
4. **Verify:** `cd server && npm run lint`, `cd client && npm run lint`; smoke admin panel + booking wizard (create flow touches).
5. **Docs & checklist:** Handoff paragraph + checklist **done** or explicit follow-up IDs.

## Checkpoint
- Matrix reviewed (no wizard path accidentally behind `requireAuth`).
- At least one **admin-only** mutating route proven gated (e.g. metadata or force-create already uses `requireRole` — extend pattern consistently).
- Lint clean; smoke notes recorded in session log.

## Deliverables
- Updated server middleware on agreed routers.
- **Session handoff** section documenting internal API policy.
- **GC-7-E1** closure or split rows in gap checklist.

## Decomposition
- **Task 7.4.4.1:** **Allowlist matrix** — inventory wizard vs admin internal API calls; document in planning or `server/docs` snippet referenced by handoff.
- **Task 7.4.4.2:** **Apply selective `requireAuth` / `requireRole`** (and ordering with **CSRF** / **`checkOwnership`**) on agreed routers; lint + smoke; update **GC-7-E1** and handoff.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child tasks complete
- [ ] Session log and handoff updated
- [ ] **GC-7-E1** updated per verification (or follow-up rows filed)

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/phases/phase-7.4-guide.md`
- Feature handoff (transition context): `.project-manager/features/authentication/feature-authentication-handoff.md`
- _Note: `session-7.4.3-handoff.md` does not exist (7.4.3 was a harness sequencing placeholder)._
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
