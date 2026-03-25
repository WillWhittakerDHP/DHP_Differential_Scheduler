# Internal API enactment matrix (GC-7-E1)

**Purpose:** Single planning artifact for **selective** `requireAuth` / `requireRole` on Express internal routes. The Vue SPA uses `apiClient` with `baseURL` **`/api/v1/internal`** (`client/src/utils/api/apiClientCore.ts`). **Global** `requireAuth` on all of `/internal` would break the **booking wizard**, which relies on an **anonymous browser session** (HttpOnly session cookie + CSRF) without a logged-in `User` for many flows.

**Scope:** Policy intent for **`server/src/routes/internal/index.ts`** mounts and **`/internal/auth`** (`server/src/routes/index.ts`). **Enactment** lands incrementally per priorities below; this file stays the **matrix** for future gates.

**Last updated:** 2026-03-25 (task **7.4.4.2**: `GET /appointments/list-for-admin-entry` gated in `appointmentRouter.ts`)

---

## Canonical middleware order (mutating routes)

When a route requires multiple guards:

1. **`csrfProtection`** — validates `X-CSRF-Token` for unsafe methods when a session exists (`server/src/middlewares/security.ts`).
2. **`requireAuth`** — resolves `Session` → `User` → **`req.user`** (cookie-backed).
3. **`requireRole(...)`** — after `requireAuth`; **403** if role not allowed.
4. **`checkOwnership(...)`** — after `requireAuth` when row-level checks apply (`ownershipRegistry.ts` / `ownershipEnforcement.ts`).

**GET / HEAD / OPTIONS** skip CSRF validation; issuance may still run on responses via `ensureCsrfTokenAttached` in `app.ts`.

---

## Mount map (`/api/v1/internal/...`)

Express mounts **`InternalRouter`** at `v1Router.use("/internal", …)` (`server/src/routes/index.ts`). Paths below are the **first segment** after `/api/v1/internal` (see `server/src/routes/internal/index.ts`).

| Mount prefix | Primary client callers | Anonymous wizard session OK? | Staff / admin required? | Notes |
|--------------|-------------------------|------------------------------|-------------------------|--------|
| `/entities` | Admin entity CRUD; global transformers prefetch | **Reads:** often yes (metadata shapes for booking UI) | **Mutations (POST/PUT/PATCH/DELETE):** yes — internal staff roles per `checkOwnership` / dynamic entity rules | CRUD uses `csrfProtection` + `checkOwnership`; confirm `requireAuth` ordering in enactment pass |
| `/relationships` | Admin + booking (instances, annotations) | Mixed — wizard reads relationship data | **Mutations:** staff / ownership per route | See relationship CRUD routers |
| `/properties` | Wizard (property selection); admin | Mixed | **Mutations:** staff-scoped / ownership per registry | `property` / `propertyType` rules in `ownershipRegistry.ts` |
| `/users` | Admin; rare wizard | **Default:** no for CRUD | **Yes** for user record access | Tighten with `requireAuth` + role where not already implied |
| `/appointments` | Wizard (create/update); admin tables | **Yes** for core booking flows | **Ownership** via `checkOwnership('appointment', …)`; **not** a blanket `requireAuth` on the router | **`GET /list-for-admin-entry`:** **`requireAuth`** + **`requireRole(agent, transaction_manager, seller, admin)`** (task **7.4.4.2**) |
| `/appointment-fee-summaries` | Admin / appointment flows | TBD | **Likely staff** for sensitive fee data | Confirm callers; align with `appointmentFeeSummary` ownership |
| `/availability` | Wizard — **`POST /availability/computed-data`** | **Yes** (core wizard) | — | Route uses `csrfProtection` + `validateRequest` today |
| `/business-settings` | Admin; wizard **GET** availability policy | **GET** `availability_settings` often yes for booking UX | **PUT/PATCH** mutations **staff/admin** | `businessSetting` special cases in ownership registry |
| `/calendar-settings` | Admin; booking may read | **GET** may be wizard | **Mutations:** staff | Singleton / staff patterns |
| `/wizard-settings` | Admin + booking **GET** (theme, copy) | **GET** yes | **PUT** staff | Logo upload route has CSRF + ownership |
| `/organization-defaults` | Admin; wizard may read org defaults | **GET** often yes | **PUT** staff | Align per method |
| `/business-rules` | Admin (`BUSINESS_RULES_ROUTE`) | No | **Yes** | Config surface |
| `/admin-metadata` | Admin metadata saves | No | **Yes** | Batch + CRUD |
| `/dev` | Dev panel only | N/A | Env-gated / non-prod | `DevStatusRouter` |
| `/beta-feedback` | Beta view | TBD | Prefer authenticated submit | Product decision |
| `/property-mappings` | Admin integrations | No | **Yes** | Staff configuration |
| `/event-instance-preview` | Wizard / admin tooling | **Often yes** for preview | Confirm CSRF on **POST** | Small router |

---

## Auth routes (`/api/v1/internal/auth/...`)

Mounted **before** the generic `/internal` stack: `v1Router.use("/internal/auth", authRateLimiter, AuthRouter)` (`server/src/routes/index.ts`).

| Area | Policy notes |
|------|----------------|
| `GET /session/me` | **`requireAuth`** — identity for SPA gating |
| `GET /session/agent-ping` | **`requireAuth`** + **`requireRole(agent)`** — demo ping |
| Magic link **POST** / **GET** verify | Per `authRouter.ts` — CSRF on mutating routes where applicable; verify **GET** exempt from CSRF by design |

---

## Explicit priorities for enactment (7.4.4.2+)

1. ~~**`GET /api/v1/internal/appointments/list-for-admin-entry`**~~ — **Done (2026-03-25):** **`requireAuth`** + **`requireRole`** in `appointmentRouter.ts`.
2. **`POST /api/v1/internal/availability/computed-data`** — **must remain** callable for the wizard with **anonymous** user identity (session + CSRF only), unless product explicitly changes — **do not** add blanket `requireAuth` here without a wizard alternative.
3. **Settings GETs** used during booking (`wizard-settings`, `calendar-settings`, `organization-defaults`, `business-settings/availability_settings`) — typically **readable** without named user; **mutations** remain **staff/admin**.

---

## Related code

- Internal mounts: `server/src/routes/internal/index.ts`
- Top-level API: `server/src/routes/index.ts`
- Middleware: `server/src/middlewares/security.ts`
- Ownership: `server/src/middlewares/ownershipRegistry.ts`, `ownershipEnforcement.ts`

---

## Related docs

- `server/docs/SECURITY_STUBS.md` — CSRF, `requireAuth`, `requireRole`, `checkOwnership` behavior and smoke tables

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-25 | **7.4.4.2:** `GET /appointments/list-for-admin-entry` — `requireAuth` + `requireRole(USER_ROLE_AGENT, 'transaction_manager', 'seller', 'admin')` (`appointmentRouter.ts`). |
