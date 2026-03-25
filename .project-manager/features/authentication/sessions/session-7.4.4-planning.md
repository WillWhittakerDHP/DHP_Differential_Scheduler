<!-- harness-planning-rollup tier=session id=7.4.4 consolidatedAt=2026-03-25T19:36:40.555Z -->

# Consolidated planning: session 7.4.4

## Session 7.4.4 (parent)

## Story

**This session delivers** a documented **router-level enactment policy** (which internal routes stay anonymous for the wizard vs require authenticated staff/admin) and **selective middleware** on Express routers **so that** admin configuration and dangerous mutations are identity-gated without breaking public booking flows **and** **GC-7-E1** can move to **done** after lint + smoke.
**Estimated size:** M

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

---

## Task 7.4.4.1 (source: task-7.4.4.1-planning.md)

### Story

**This task publishes** a single **source-of-truth matrix** (which internal subtrees allow anonymous browser sessions vs require authenticated staff/admin) **because** **task 7.4.4.2** must apply `requireAuth` / `requireRole` **selectively** aligned with real **Vue `apiClient`** usage and **Express** mount points.

---

### Analysis

- **Problem:** `InternalRouter` has **no** global `requireAuth`; wizard uses **anonymous session** + **CSRF** on mutating routes. Admins need identity on sensitive paths. Without a matrix, **7.4.4.2** risks wrong gates.
- **Canonical order (mutations):** `csrfProtection` → `requireAuth` → `requireRole(…)` → `checkOwnership(…)` when applicable.

### Goal

1. Finalize **inventory** (grep-backed) and **matrix v1** above, adjusting rows after one pass over `server/src/routes/internal/**/*.ts` method-level.
2. Write **`server/docs/INTERNAL_API_ENACTMENT_MATRIX.md`** and link from **`SECURITY_STUBS.md`**.
3. Leave **no** `requireAuth` / `requireRole` behavior change in this task (deferred to **7.4.4.2**).

### Files

- **New:** `server/docs/INTERNAL_API_ENACTMENT_MATRIX.md`
- **Update:** `server/docs/SECURITY_STUBS.md` (link only)
- **Read-only for inventory:** `client/src/utils/api/**/*.ts`, `client/src/services/calendarApiService.ts`, `client/src/composables/booking/**/*.ts`, `server/src/routes/internal/index.ts`, key routers under `server/src/routes/internal/`

### Approach

1. Run targeted **ripgrep** for `apiClient` and endpoint helpers; reconcile with **`InternalRouter`** mounts.
2. Draft matrix in doc; mark **TBD** rows explicitly for **7.4.4.2** follow-up if unsure.
3. Add **SECURITY_STUBS** pointer; run **`cd server && npm run lint`** only if TS touched (unlikely); doc-only change is fine.

### Checkpoint

- Matrix lists **every** `InternalRouter` child prefix from `internal/index.ts` with a **default policy** cell.
- **`list-for-admin-entry`** flagged **staff/admin required**.
- Wizard **`POST /availability/computed-data`** remains **anonymous OK** in matrix.

### Deliverables

- `server/docs/INTERNAL_API_ENACTMENT_MATRIX.md` committed-ready content
- `server/docs/SECURITY_STUBS.md` cross-link

### Acceptance Criteria

- [ ] Matrix file exists and is readable by **7.4.4.2** without opening this planning doc
- [ ] At least one **explicit** “anonymous OK” row for wizard (**computed-data** + general appointment flow)
- [ ] At least one **explicit** “staff/admin required” row (**list-for-admin-entry**)
- [ ] **SECURITY_STUBS** references the matrix

### Design

### Client inventory (relative to `/api/v1/internal`)

| Area | Representative paths / helpers | Typical caller |
|------|----------------------------------|----------------|
| Appointments | `GET/POST/PATCH /appointments`, `GET/PATCH /appointments/:id`, `GET /appointments/:id/versions` (`appointmentApi.ts`, booking composables) | **Wizard** + **admin** business data |
| Admin entry list | `GET /appointments/list-for-admin-entry` (`useListForAdminEntry.ts`) | **Admin** only (sensitive aggregate) |
| Availability | `POST /availability/computed-data` (`calendarApiService.ts`) | **Wizard** |
| Properties / users | `getPropertyEndpoint`, `getUserEndpoint`, CRUD via entity composables | **Wizard** reads + **admin** mutations |
| Entities / relationships | `/entities/...`, `/relationships/...`, batch, order_index, bulk patch | **Admin** + **wizard** read-heavy global transformer |
| Settings (read-many) | `GET /wizard-settings`, `GET /calendar-settings`, `GET /organization-defaults`, `GET /business-settings/availability_settings` | **Wizard** + **admin** |
| Settings (mutations) | `PUT /wizard-settings`, `PUT /calendar-settings`, `PUT /organization-defaults`, `PUT /business-settings/availability_settings` | **Admin** |
| Admin metadata | `adminMetadataApi` / save helpers | **Admin** |
| Business rules | `businessRulesApi` | **Admin** |
| Beta | `betaFeedbackApi` | **Beta** view |
| Event preview | `POST /event-instance-preview` (helper) | **Wizard** / admin tooling |
| Property mappings | `propertyMappingsApi` | **Admin** |
| Auth (separate mount) | `/api/v1/internal/auth/*` (e.g. `session/me`) — **not** under `InternalRouter` only; see `routes/index.ts` | **Admin** gating / login |
| Dev | `/dev/status` (dev panel) | **Dev** only |

### Enactment matrix v1 (for 7.4.4.2)

Paths are **Express** segments under `v1Router.use("/internal", InternalRouter)` unless noted.

| Mount prefix | Anonymous session OK? | Role / gate (if not) | Notes |
|--------------|------------------------|----------------------|--------|
| `/availability` (POST `/computed-data`) | **Yes** (wizard) | — | Already `csrfProtection` + Joi |
| `/appointments` (CRUD + versions) | **Yes** with **`checkOwnership`** where enforced | — | `requireAuth` **not** globally; ownership uses `req.user` when present — align **7.4.4.2** with appointment policy |
| `/appointments/list-for-admin-entry` | **No** | **Staff/admin** (`requireAuth` + `requireRole`) | Currently unauthenticated — **high priority** in 7.4.4.2 |
| `/properties` | Mixed | Wizard reads/mutations per ownership rules; staff for admin-only ops | Validate per-method in CRUD router |
| `/users` | **No** for admin CRUD | **Staff/admin** | Wizard rarely calls directly — confirm grep |
| `/entities`, `/relationships`, `/admin-metadata`, metadata CRUD | **No** for mutating admin config | **Staff/admin** | Wizard may **GET** for global transformer — **7.4.4.2** may split by method |
| `/*-settings`, `/organization-defaults`, `/business-settings` | **GET** often **yes** for wizard; **PUT/PATCH/DELETE** **no** | **Staff/admin** on mutations | Matches product: public reads for booking UX |
| `/beta-feedback` | TBD | Likely **authenticated** for submit | Confirm product |
| `/event-instance-preview` | **Yes** if only wizard preview | — | Confirm CSRF on POST |
| `/property-mappings` | **No** | **Staff/admin** | Admin integration |
| `/appointment-fee-summaries` | TBD | Ownership / staff | Check router |
| `/dev` | Dev-only | Optional auth or env gate | Non-prod |
| `/auth/*` | Per-route (magic link, `session/me` needs auth) | See `authRouter.ts` | Outside `InternalRouter` aggregation |

### Deliverable file

Create **`server/docs/INTERNAL_API_ENACTMENT_MATRIX.md`** with this table + **“How to use”** (order: CSRF → auth → role → ownership). Add a one-line link under **`server/docs/SECURITY_STUBS.md`** pointing to the matrix.

---

## Task 7.4.4.2 (source: task-7.4.4.2-planning.md)

### Story

**This task wires** `requireAuth` + `requireRole` on the **highest-priority** unauthenticated admin endpoint identified in the matrix **so that** appointment lists for admin entry are not exposed to anonymous browsers, **without** changing **`POST /availability/computed-data`** or other wizard-critical routes in this pass.

---

### Analysis

- **Problem:** Internal API is intentionally **not** globally behind `requireAuth` so the **booking wizard** works with anonymous identity (session cookie + CSRF only).
- **Matrix:** Task **7.4.4.1** defined priorities — especially **`GET /appointments/list-for-admin-entry`** must be **staff-only** (was world-readable).

### Goal

1. Gate **`GET /appointments/list-for-admin-entry`** with **`requireAuth`** + **`requireRole`** as designed.
2. Run **`cd server && npm run lint`** (and **`cd client && npm run lint`** if any client file is touched).
3. Update matrix + gap checklist + task/session notes per **Acceptance Criteria**.
4. Do **not** add blanket `requireAuth` on **`InternalRouter`** or **`POST /availability/computed-data`** in this task.

### Files

- **`server/src/routes/internal/appointments/appointmentRouter.ts`** — primary edit
- **`server/docs/INTERNAL_API_ENACTMENT_MATRIX.md`** — changelog / status
- **`.project-manager/GAP_CLOSURE_CHECKLIST.md`** — **GC-7-E1**
- **Optional:** `.project-manager/features/authentication/sessions/session-7.4.4-handoff.md` — if present, one-line policy “list-for-admin-entry gated”

### Approach

1. Implement middleware on **`appointmentRouter`**; keep handler unchanged.
2. Lint server.
3. Smoke mentally: anonymous **GET** → **401**; logged-in **agent**/**admin** → **200** (manual or describe for session log).
4. Update docs and checklist.

### Checkpoint

- Server compiles; **no** new lint errors.
- Matrix documents the implemented gate.
- **GC-7-E1** reflects closure or a explicit **follow-up** ID for remaining internal routes.

### Deliverables

- Express route gated per **Design**.
- Docs + checklist updated.

### Acceptance Criteria

- [ ] `list-for-admin-entry` returns **401** when no authenticated `User` session
- [ ] Same route returns **403** when user role is not in the allowlist (e.g. plain **client** if such a session can hit internal API)
- [ ] **200** for **agent** / **admin** / other allowed roles when session valid
- [ ] **`POST /availability/computed-data`** unchanged (no new `requireAuth` on that router)
- [ ] Server lint passes
- [ ] **GC-7-E1** row updated

### Design

### Route change

**File:** `server/src/routes/internal/appointments/appointmentRouter.ts`

**Before:** `router.get('/list-for-admin-entry', listForAdminEntryHandler)`

**After:**

```ts
router.get(
  '/list-for-admin-entry',
  requireAuth,
  requireRole(USER_ROLE_AGENT, 'transaction_manager', 'seller', 'admin'),
  listForAdminEntryHandler
)
```

**Imports:** `requireAuth`, `requireRole` from `../../../middlewares/security.js`; `USER_ROLE_AGENT` from `../../../constants/userRoles.js` (re-export of shared role constants).

**Rationale:** Matches **internal staff** definition used in ownership enforcement + **admin** for superuser-style accounts referenced elsewhere.

### Documentation

- Update **`INTERNAL_API_ENACTMENT_MATRIX.md`** — add an **“Implemented (date)”** note under priorities for `list-for-admin-entry` (or a small **Changelog** subsection).
- Update **`.project-manager/GAP_CLOSURE_CHECKLIST.md`** — **GC-7-E1**: set **Status** to **done** when lint + smoke verified, with **Notes** citing this task + route change (or **split** a follow-up row if broader enactment remains).

### Client

- **No change expected** if admin entry already uses **`apiClient`** with **`withCredentials: true`** (session cookie). If **`useListForAdminEntry`** runs only on authenticated admin routes, behavior is correct; unauthenticated users get **401** — confirm UX (error boundary / redirect) is acceptable.

---
