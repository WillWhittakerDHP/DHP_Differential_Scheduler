# Plan: task 20.2.3.2 — Event instance preview scoped by segment id

## Contract
- **Tier:** task | **ID:** 20.2.3.2
- **Scope:** **`POST /event-instance-preview`**, **`eventInstancePreviewService`**, shared **`@shared/types/eventInstancePreview`**, Joi body schema, **`useEventTemplatePreview`**, **`NewEventInstanceData` / `EventInstanceEditor` / `EventInstanceBuilderBody`** so real preview targets one **persisted** **event instance** row (no **`findOne({ eventShapeRef })`**). **Out of scope:** relationship routers (**20.2.3.1** done).
- **Governance:** Governance Context (Task)

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** cross_cutting
- **Governance domains:** function, composable
- **Gate profile:** fast
- **Suggested depth:** leaf — advisory; agent decides in Analysis / Decomposition
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition.

## Where we left off
Task **20.2.3.1** shipped relationship integrity. This task finishes session **20.2.3** preview slice from **session-20.2.3-planning.md**.

## Parent context (session planning — Analysis excerpt)

- **Preview** today keys off **`appointmentId` + `eventShapeRef`**; service loads **any** **`EventInstance`** with that shape → wrong segment when multiple exist. **FEATURE_20 §5.1** requires re-scoping to a **parent-owned segment** (canonical row = **`eventInstanceId`**).

## Story
**This task changes** the admin **real preview** HTTP contract and client caller **because** template resolution and link-strip flags must come from the **same** **event_instances** row the user is editing, not an arbitrary match by shape.

---
## Architecture context (harness-injected)

*(Standard domain map / data flow / type boundaries — see task file template or ARCHITECTURE.md.)*

---

## Codebase recon (agent-led — required)

- **Paths reviewed:** `server/src/services/invites/eventInstancePreviewService.ts` — **`EventInstance.findOne({ where: { eventShapeRef } })`**; `eventInstancePreviewRouter.ts` — **`toPreviewBody`** maps **`eventShapeRef`**; `shared/types/eventInstancePreview.ts`; `server/src/routes/schemas/eventInstancePreviewBodySchema.ts`; `client/src/composables/admin/useEventTemplatePreview.ts` — POST body **`appointmentId`**, **`eventShapeRef`**, templates; `EventInstanceBuilderBody.vue` — passes **`draft`** only; `EventInstanceEditor.vue` — **`cloneFromEntity`** has **`props.entity.id`** but draft type omits **`id`**; create flow (`EventInstancesSection`) has no persisted id until save.
- **Patterns / call sites:** **`linkStripSetForEventShape`** in service expects instance with **`includeRescheduleLink` / `includeCancelLink`** — must load **that** row by PK. Sample preview stays **client-only** (`resolveEventTemplates`); no server change for sample path.
- **Gaps / unknowns:** **Create** panel: **`eventInstanceId`** absent until POST succeeds — **real** preview should stay disabled with a clear UI string until an id exists (or only **edit** panels enable real preview).

## Analysis
- **Problem:** Ambiguous segment selection breaks preview vs invites for multi-segment shapes.
- **Boundaries:** Shared types + server preview route + admin composable + thin Vue wiring; **no** PartFinalizer / booking totals on server.
- **Breaking change:** API consumers must send **`eventInstanceId`**; **`eventShapeRef`** becomes redundant for server (optional to keep for logging only or remove from body — prefer **required `eventInstanceId`**, drop shape from POST to avoid drift).
- **Create vs edit:** Optional **`id`** on draft or separate **`eventInstanceId`** ref into composable; editor passes entity id; create passes **`null`** → composable skips POST and sets user-visible hint.

## Design
1. **`EventInstancePreviewRequestBody`:** **`eventInstanceId: string`** required; **`eventShapeRef`** removed (server derives shape from instance). Templates unchanged.
2. **Joi:** **`eventInstanceId`** UUID trim required; remove **`eventShapeRef`**.
3. **`previewEventInstanceTemplates`:** **`EventInstance.findByPk(body.eventInstanceId, { attributes: [...] })`**; if missing → **`Appointment not found`**-style pattern: throw **`Error('Event instance not found')`** → router maps to **404** (or **400** — match existing **Appointment** pattern: use **404** for missing instance). Load **`includeRescheduleLink`**, **`includeCancelLink`** (and any fields **`linkStripSetForEventShape`** needs). Remove **`findOne` by `eventShapeRef`**.
4. **Router:** Map **Event instance not found** to **404**; keep **Appointment not found** as today.
5. **Client:** Extend **`NewEventInstanceData`** with optional **`id?: string`**; **`cloneFromEntity`** sets **`id`**. **`useEventTemplatePreview`:** build POST with **`eventInstanceId: draft.id`** when truthy; when falsy, do not call API (**`realPreview`** null, **`realPreviewError`** optional static message or null). **`refreshRealPreview`:** if no **`id`**, clear real preview.
6. **Lint / tsc:** `server` + `client` on touched files.

## Goal
**Real** admin preview uses a **single persisted event instance** id end-to-end; server never selects a segment by **`eventShapeRef`** alone.

## Files
- `shared/types/eventInstancePreview.ts`
- `server/src/routes/schemas/eventInstancePreviewBodySchema.ts`
- `server/src/routes/internal/event-instance-preview/eventInstancePreviewRouter.ts`
- `server/src/services/invites/eventInstancePreviewService.ts`
- `client/src/types/admin/instancesTabEventInstance.ts` (**`NewEventInstanceData`**)
- `client/src/views/admin/tabs/components/EventInstanceEditor.vue` (**`cloneFromEntity`**)
- `client/src/composables/admin/useEventTemplatePreview.ts`

## Approach
1. Shared types + Joi + service + router (error mapping).
2. Client types + editor clone + composable POST body + guard when no id.
3. **`cd server && npm run lint`**, **`npx tsc --noEmit`**, **`cd client && npm run lint`**.

## Checkpoint
- **20.2.3.1** merged: relationships enforce segment ownership.
- Editing an existing instance: **real preview** works with **id**; creating new: no API until saved (product OK).

## Deliverables
- Updated preview contract + implementation + admin wiring above.

## Acceptance Criteria
- **POST** without **`eventInstanceId`** → **400** (Joi).
- **POST** with unknown id → **404** (or documented **400**) consistent with router.
- **POST** with valid id + appointment: response uses **`linkStripSetForEventShape`** from **that** row (no global shape **`findOne`**).
- **Client:** edit flow sends **`eventInstanceId`**; create flow does not error-loop when id missing.
- Server + client **lint** / **tsc** pass for touched paths.

## Implementation Orders
1. **`shared/types/eventInstancePreview.ts`** — request body: **`eventInstanceId`** only (plus appointment + templates).
2. **`eventInstancePreviewBodySchema.ts`** + **`eventInstancePreviewRouter.ts`** **`toPreviewBody`**.
3. **`eventInstancePreviewService.ts`** — **`findByPk`**, remove shape-based **`findOne`**.
4. **`NewEventInstanceData`** + **`EventInstanceEditor`** **`cloneFromEntity`** add **`id`**.
5. **`useEventTemplatePreview`** — POST payload and guards.
6. Run **lint** / **tsc** both packages.

## Definition of Done

- [ ] App starts (`npm run start:dev`) smoke
- [ ] `cd server && npm run lint`, `cd client && npm run lint`
- [ ] Session guide task **20.2.3.2** updated at **task-end**

---
## Reference
- Session planning: `.project-manager/features/domain-architecture-alignment/sessions/session-20.2.3-planning.md`
- FEATURE_20 §5.1 — event-instance-preview row
- `.project-manager/ARCHITECTURE.md` §10 — server does not resolve booking totals
