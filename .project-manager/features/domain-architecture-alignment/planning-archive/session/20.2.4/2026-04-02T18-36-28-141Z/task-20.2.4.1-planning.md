# Plan: task 20.2.4.1 — Appointments + calendar / invites (segment identity & placement)

## Contract
- **Tier:** task | **ID:** 20.2.4.1
- **Scope:** Verify appointment CRUD persists client booking payload without server-side resolution; ensure **`createInvitesForAppointment`** uses **`event_instances`** + related **`event_shapes`** (`placementKind`, `anchorEdge`) so Google Calendar event creation order reflects **placement policy**; document **single `selectedTimeSlots` window** behavior for all segments until a future per-segment payload exists. **Out of scope:** task **20.2.4.2** (differential-role entity cleanup, phase wrap-up).
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
- Session **20.2.4** started; **`/accepted-plan`** completed; first task is **20.2.4.1**.

## Parent context (session planning — Analysis excerpt)

- FEATURE_20 **§5.1:** appointment persistence + calendar services must use **raw storage + client payload**; calendar reads **segment identity** and **placement policy** from **`event_instances` / `event_shapes`**. **§5.2:** no alternate booking calculator on server.

## Story
**This task changes** invite/calendar orchestration **so that** Google Calendar rows are created from **scoped segment rows** in **placement order** (shape-level policy), link-strip flags stay clearly **segment-owned**, and appointment persistence is **explicitly verified** as persistence-only — **because** Phase **20.2** must satisfy **§5.1–5.2** before **20.2.4.2** cleanup and phase-end.

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

- **Paths reviewed:** `server/src/routes/internal/appointments/appointmentCrudRouter.ts` + `appointmentHelpers.ts` (includes, fee/snapshot/selection sync — persistence-only); `server/src/services/invites/inviteOrchestrationService.ts` (`findEventInstancesForBlockInstances` loads `EventShape` with `placementKind`/`anchorEdge` but iteration order was **not** placement-stable); `inviteAppointmentShared.ts` (`linkStripSetForEventShape` — name implies shape but callers pass **instance** link flags); `server/src/services/google/calendar/eventCreationService.ts` + `buildCalendarEventResource.ts` (no placement — correct); `shared/utils/eventPlacementUtils.ts` (sanitizers + `eventShapeDifferentialRoleFromPlacementFields` — **no** sort comparator today).
- **Patterns / call sites:** **`extractStartTime` / `extractEndTime`** use **first** `selectedTimeSlots` entry for **every** segment’s Google event — intentional until client stores per-segment windows on the appointment payload.
- **Gaps / unknowns:** None blocking; if product later needs per-segment times, that is a **client payload + migration** follow-up, not server PartFinalizer.

## Analysis
- **Problem:** FEATURE_20 requires calendar creation to **read** segment identity and placement policy. Loading shape fields satisfied the first part; **using** placement for **deterministic segment ordering** was missing, and the link-strip helper name suggested shape-owned flags though flags live on **instances** (post–Feature 20).
- **Boundaries:** Server **invites** + **appointments** only; shared util for ordering keeps ranking **one place** and matches client’s placement vocabulary (`EventPlacementKind`).
- **Risks:** Wrong sort order if `placementKind` null on legacy rows — treat as **`primary`** in comparator (align with sanitizers). Do not change Google timing without an explicit payload contract.
- **Alternatives:** Sort in SQL via Sequelize `order` — heavier; in-memory sort after fetch is enough for small segment counts.

## Design
1. Add **`compareEventSegmentsForCalendarOrder(a, b)`** in **`shared/utils/eventPlacementUtils.ts`**: rank `placementKind` **`primary` < `secondary` < `marginal` < `floating`**; tie-break **`anchorEdge`** (`start` before `end` before null); final tie-break stable string compare on **`eventInstance.id`**. Document that this mirrors **scheduling presentation order**, not duration math.
2. **`inviteOrchestrationService.ts`**: after building `uniqueInstances`, sort with the comparator (instances need nested `eventShape` — ensure type allows access). Optional **`logger.debug`** listing ordered segment ids + placement (low volume).
3. **`inviteAppointmentShared.ts`**: add **`linkStripSetForSegmentLinkFlags`** as the canonical name; implement **`linkStripSetForEventShape`** as a thin deprecated alias calling it (or reverse: keep export name for minimal diff — **prefer** new name + alias to satisfy clarity without breaking imports in **eventInstancePreviewService**). Actually preview service passes `segment` with instance flags — same helper. Plan: rename internal implementation to `linkStripSetForSegmentLinkFlags`, export both names.
4. **`extractStartTime` / `extractEndTime`** (or `createEventForInstance` header): **WHY** comment — all segments share the **first** wizard slot until per-segment times exist on **`appointments`**.
5. **Appointment persistence:** Read-through `appointmentCrudRouter` mutation path; if already persistence-only, add a **short comment** near create/update handler or in **`appointmentHelpers`** module doc pointing to ARCHITECTURE **§10** / FEATURE_20 **§4.5** (no server finalizer). **No behavior change** unless a concrete gap is found.

## Goal
For **task 20.2.4.1** only: align **invite → Google Calendar** with FEATURE_20 **§5.1** by **applying** `event_shapes.placementKind` / `anchorEdge` to **segment processing order**, clarify **segment vs shape** naming for link-strip helpers, and **document/verify** appointment routes as **persistence-only** (no booking recomputation).

## Files
- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (**§5.1–5.2**), `.project-manager/ARCHITECTURE.md` (**§10** booking boundary)
- **Implementation:** `shared/utils/eventPlacementUtils.ts`, `server/src/services/invites/inviteOrchestrationService.ts`, `server/src/services/invites/inviteAppointmentShared.ts`, `server/src/services/invites/eventInstancePreviewService.ts` (import rename if needed), optionally `server/src/routes/internal/appointments/appointmentHelpers.ts` or `appointmentCrudRouter.ts` (comment-only)

## Approach
1. Implement shared **placement sort** comparator + unit-safe ordering (pure function, explicit return type).
2. Wire sort into **`createInvitesForAppointment`** after dedupe.
3. Refactor link-strip helper naming + update **preview** import if export changes.
4. Add **timing WHY** comment(s) on slot extraction.
5. Appointment path **verification** + doc comment if no code change.
6. **`cd server && npx tsc --noEmit`** and **`cd server && npm run lint`** on touched paths (client lint if shared types trigger — usually not).

## Checkpoint
- Task **20.2.4.2** will handle differential-role entity cleanup and phase docs — do not mix into this PR unless trivial.

## Deliverables
- Shared **calendar-order** comparator + sorted invite iteration.
- Clearer **link-strip** API naming (alias preserved).
- **Comments** documenting shared **single-slot** timing and **persistence-only** appointments.

## Acceptance Criteria
- **`createInvitesForAppointment`** creates Google events in **non-arbitrary** order derived from **`event_shapes.placementKind`** / **`anchorEdge`** (stable tie-breaks).
- **No** server-side recomputation of booking totals; appointment mutations unchanged in behavior except optional documentation.
- **`linkStripSetForEventShape`** callers still work; new name documents **instance** link flags.
- Server **`tsc`** + **`eslint`** pass for edited files.

## Implementation Orders
1. `shared/utils/eventPlacementUtils.ts` — add **`compareEventSegmentsForCalendarOrder`** (or similarly named) taking two objects with `{ id: string, eventShape?: { placementKind?, anchorEdge? } }`.
2. `server/src/services/invites/inviteOrchestrationService.ts` — sort `uniqueInstances` before the `for` loop; add debug log optional.
3. `server/src/services/invites/inviteAppointmentShared.ts` — **`linkStripSetForSegmentLinkFlags`** + alias **`linkStripSetForEventShape`**.
4. `server/src/services/invites/eventInstancePreviewService.ts` — switch to preferred helper name if imported directly.
5. `inviteOrchestrationService.ts` — **WHY** comment on **`extractStartTime`** / **`extractEndTime`**.
6. Appointments — verification + module/section comment re persistence boundary.
7. Run **`npx tsc --noEmit`** and **`npm run lint`** under **`server/`**.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.2.4-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
