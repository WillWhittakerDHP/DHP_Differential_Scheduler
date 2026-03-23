# Security middleware stubs

In `src/middlewares/security.ts`, **`requireAuth`** is **session-backed** (Feature 7 **7.2.3.1**); **`requireRole`** is a real factory (**7.2.3.2**) and must run **after** `requireAuth`. **`csrfProtection`** (validation) and CSRF **issuance** are **active** (Phase 8.6.1.x) — see below. **`checkOwnership`** is **active** (Phase **8.7.1.2**; documented here in **8.7.2.1**) — registry + enforcement in **`ownershipRegistry.ts`** / **`ownershipEnforcement.ts`**. None of these are global — routes opt in.

---

## CSRF issuance (active) — Task 8.6.1.1

**Location:** `server/src/middlewares/csrfIssuance.ts` (`ensureCsrfTokenAttached`)  
**Order:** Registered in `app.ts` **after** `cookieParser()` and **before** `ROUTE_PATHS.API`.

| Contract | Value |
|----------|--------|
| Session store | `Session.sess` JSONB key `csrfToken` (64-char hex from 32 random bytes) |
| Readable cookie | Name: **`csrf_token`** — `httpOnly: false`, `sameSite: lax`, `secure` in production |
| Header for mutating requests (validation active) | **`X-CSRF-Token`** — send the same value as `csrf_token` |
| When skipped | No session cookie, or session row missing/expired — no cookie set |

**Exports from `csrfIssuance.ts`:** `CSRF_HEADER_NAME`, `readStoredCsrfToken`, `ensureCsrfTokenAttached`. The readable cookie name (`csrf_token`) and `Session.sess` key (`csrfToken`) are **module-private constants** in that file — this doc lists their string values for parity with the Vue client (8.6.2).

### How to verify (manual)

1. Log in so you have a valid session cookie (Feature 7).
2. `GET` any API route with that cookie (e.g. `curl -v` with `-b` cookie jar after login).
3. Response `Set-Cookie` should include **`csrf_token`** (non-HttpOnly).
4. Confirm `sessions.sess` JSON for your `sid` contains `"csrfToken"`.

## CSRF validation (active) — Task 8.6.1.2

**Location:** `server/src/middlewares/security.ts` (`csrfProtection`)

| Rule | Behavior |
|------|-----------|
| Safe methods | `GET`, `HEAD`, `OPTIONS` → no check |
| No session cookie | **Skip** CSRF (allows `POST /auth/login`, `POST /auth/magic-link/request` before a session exists) |
| Session cookie but no DB row | **403** `FORBIDDEN` — CSRF validation failed |
| Session row but no `sess.csrfToken` | **403** — client should issue token via a safe request first (`ensureCsrfTokenAttached` on GET) |
| Header missing or mismatch | **403** — compared with `crypto.timingSafeEqual` (UTF-8 buffers, same length) |

## Vue SPA — CSRF header wiring (Session 8.6.2)

**Purpose:** One place for the Vue team to implement CSRF without reading `security.ts`. Mutating browser calls to internal API routes that use **`csrfProtection`** must send **`X-CSRF-Token`** when a **session cookie** is present, or the server responds **403** (`FORBIDDEN`, message **CSRF validation failed**).

**CSRF env vars:** None. Names are **code constants** in `server/src/middlewares/csrfIssuance.ts` — do not add `CSRF_*` to `server/.env.example` for this contract.

### Canonical names (keep in sync with server)

| Role | Value | Server reference (`csrfIssuance.ts`) |
|------|--------|--------------------------------------|
| Readable cookie | `csrf_token` | private constant (same string) |
| Request header | `X-CSRF-Token` | exported `CSRF_HEADER_NAME` |
| DB `Session.sess` key | `csrfToken` | private constant (same string) |

In the client, use the **same string literals** or define matching constants in `client/src/` (e.g. next to your API module) so they stay aligned with the server file above.

### End-to-end flow

1. User has a **session** (HttpOnly session cookie from Feature 7).
2. Issue the CSRF cookie: call any **safe** internal API with **`credentials: 'include'`** so the server runs **`ensureCsrfTokenAttached`** and responds with **`Set-Cookie: csrf_token=...`** (non-HttpOnly).
3. Read the token (e.g. parse `document.cookie` for `csrf_token`, or read it from your wrapper after the response).
4. On **POST**, **PUT**, **PATCH**, **DELETE** to protected routes, send **`X-CSRF-Token: <same value>`** and **`credentials: 'include'`**.

**Skip path:** If there is **no** session cookie, **`csrfProtection`** does not require a header (e.g. first **`POST /auth/login`** / **`POST /auth/magic-link/request`**). After login, the session exists — subsequent mutating calls **must** include the header.

### `fetch` shape (pseudo-code)

```javascript
await fetch(`${apiBase}/v1/internal/...`, {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfTokenFromCookie,
  },
  body: JSON.stringify(body),
})
```

For **axios**, use `withCredentials: true` and set `headers['X-CSRF-Token']` the same way.

### Session 8.6.2 implementation checklist

- [x] Wire the **shared API layer** (`client/src/utils/api` default axios instance + **`calendarApiService`** internal POST) so **mutating** methods attach **`X-CSRF-Token`** when a **`csrf_token`** cookie is present.
- [x] Use **`credentials: 'include'`** (fetch) or **`withCredentials: true`** (axios) for same-site API calls so both session and **`csrf_token`** cookies are sent.
- [x] After login or app load, ensure at least one **GET** (or other safe) internal request runs **before** the first mutating call so **`csrf_token`** exists (normal admin/entity loads and booking reads satisfy this).
- [ ] Smoke-test admin or booking CRUD after wiring (manual — run before closing session **8.6.2**).

### Breaking change (until 8.6.2 ships)

The SPA may get **403** on CRUD even for logged-in users if **`X-CSRF-Token`** is missing. **`createCrudRouter`** applies **`csrfProtection`** to **POST** / **PUT** / **PATCH** / **DELETE** on CRUD routers.

---

## Environment variable inventory (Phase 8.4)

**Last updated:** 2026-03-22  
**Scope:** All `process.env` (server) and `import.meta.env` (client) usage across the codebase.

### Server (`process.env`)

| Variable | Source files | Required | Purpose |
|----------|--------------|----------|---------|
| `NODE_ENV` | `envConfig.ts`, `database.mjs`, `Users.ts`, `errorHandler.test.ts`, `googleOauthRoutes.ts` | No (default: development) | Runtime environment |
| `APP_STAGE` | `envHelpers.ts` | No (default: local) | Deployment stage |
| `SERVER_PORT` / `PORT` | `index.ts` | No (default: 3001) | HTTP server port |
| `DB_HOST` | `database.mjs`, `db-reset.mjs`, `run-migrations.mjs`, `testDb.ts` | Yes (prod) | PostgreSQL host |
| `DB_PORT` | Same | No (default: 5432) | PostgreSQL port |
| `DB_NAME` | Same, `copy-service-config-to-option.mjs` | Yes (prod) | PostgreSQL database name |
| `DB_USER` | Same | Yes (prod) | PostgreSQL user |
| `DB_PASSWORD` | Same | Yes (prod) | PostgreSQL password (secret) |
| `TEST_DB_NAME` | `testDb.ts` | No (default: scheduler_test) | Test database name |
| `APP_BASE_URL` | `inviteContextBuilder.ts` | Yes (prod) | Base URL for invite links |
| `VITE_APP_BASE_URL` | `inviteContextBuilder.ts` | No (fallback) | Alternate base URL |
| `LOG_LEVEL` | `logger.ts` | No | Server log level |
| `DEBUG_SCOPES` | `logger.ts` | No | Debug scopes filter |
| `LOG_CALLSITE` / `VITE_LOG_CALLSITE` | `logger.ts` | No | Log callsite tracking |
| `GOOGLE_CLIENT_ID` | `googleOAuth.ts`, `googleOauthRoutes.ts`, `write-gmail-mcp-creds.mjs` | Yes (OAuth) | Google OAuth client ID (secret) |
| `GOOGLE_CLIENT_SECRET` | `googleOAuth.ts`, `write-gmail-mcp-creds.mjs` | Yes (OAuth) | Google OAuth client secret (secret) |
| `GOOGLE_REDIRECT_URI` | `googleOAuth.ts`, `googleOauthRoutes.ts` | Yes (OAuth) | OAuth redirect URI |
| `GOOGLE_SCOPES` | `googleOAuth.ts` | No (has default) | Google API scopes (comma-separated) |
| `GOOGLE_API_KEY` | `googleApiConfig.ts` | No (optional) | Google API key for some APIs (secret) |
| `GOOGLE_CALENDAR_RATE_LIMIT_PER_MINUTE` | `rateLimiter.ts` | No (default: 60) | Calendar API rate limit |
| `GOOGLE_CALENDAR_CACHE_TTL_MINUTES` | `calendarEventsCache.ts` | No (default: 5) | Calendar cache TTL |
| `ORGANIZER_EMAIL` | `importCalendarData.ts` | No (has default) | Default organizer for calendar import |
| `BRIGHT_MLS_API_URL` | `brightMlsApiClient.ts`, `brightMlsAuth.ts` | Conditional | Bright MLS API base URL |
| `BRIGHT_MLS_CLIENT_ID` | `brightMlsAuth.ts` | Conditional | Bright MLS client ID (secret) |
| `BRIGHT_MLS_CLIENT_SECRET` | `brightMlsAuth.ts` | Conditional | Bright MLS client secret (secret) |
| `BRIGHT_MLS_ACCESS_TOKEN` | `brightMlsAuth.ts` | Conditional | Bright MLS Bearer token (secret) |
| `BRIGHT_MLS_TOKEN_URL` | `brightMlsAuth.ts` | Conditional | OAuth token endpoint |
| `BRIGHT_MLS_RATE_LIMIT_PER_SECOND` | `brightMlsApiClient.ts` | No (default: 2) | Bright MLS rate limit |
| `BRIGHT_MLS_RATE_LIMIT_PER_DAY` | `brightMlsApiClient.ts` | No (default: 40000) | Bright MLS daily limit |
| `PROPERTY_ENRICHMENT_CACHE_TTL_MINUTES` | `propertyEnrichmentCache.ts` | No (default: 60) | Property enrichment cache TTL |
| `ADDRESS_GEOCODING_CACHE_TTL_DAYS` | `addressGeocodingCache.ts` | No | Geocoding cache TTL |
| `DRIVE_TIME_CACHE_TTL_HOURS` | `driveTimeCache.ts` | No (default: 24) | Drive-time cache TTL |

### Client (`import.meta.env`)

| Variable | Source files | Required | Purpose |
|----------|--------------|----------|---------|
| `VITE_API_BASE_URL` | `propertyEnrichmentApiService.ts`, `api/index.ts`, `calendarApiService.ts`, `mapsApiService.ts`, `ApiDevPanel.vue` | No (default: localhost:3001 or /api/v1/internal) | API base URL |
| `VITE_AVAILABILITY_CACHE_TTL` | `availabilitySettings/api.ts` | No | Availability cache TTL (ms) |
| `VITE_APP_STAGE` | `devMode.ts` | No (default: local) | Deployment stage |
| `VITE_INCLUDE_DEV_FLAGS` | `devMode.ts` | No | Enable dev-only flags |
| `VITE_LOG_LEVEL` | `logger.ts` | No | Client log level |
| `VITE_DEBUG_SCOPES` | `logger.ts` | No | Debug scopes filter |
| `VITE_LOG_CALLSITE` | `logger.ts` | No | Log callsite tracking |
| `DEV` | `devMode.ts`, `logger.ts` | No (Vite built-in) | Vite dev mode flag |

### Config loaders

- **Server:** `server/src/config/envConfig.ts` — loads `.env.${NODE_ENV}` via dotenv; validates `DB_*`, `PORT`, `NODE_ENV`, `APP_STAGE`.
- **Server:** `server/src/db/config/database.mjs` — Sequelize config reads `DB_*` directly.
- **Client:** Vite injects `import.meta.env.*` at build time; only `VITE_*` and `DEV`/`MODE` are exposed.

### Safe-handling notes

- **Secrets:** `DB_PASSWORD`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_API_KEY`, `BRIGHT_MLS_*` credentials must never be committed. Use `.env` files (gitignored) or a secrets manager.
- **Server .env files:** `server/.env.development`, `server/.env.production` are loaded by envConfig; ensure `.gitignore` covers `.env*`.
- **Root .env:** Used for cross-cutting vars (e.g. `TEST_ENABLED`, `GIT_MCP_SERVER`); do not commit real values.

### Validation (Task 8.4.1.2 — 2026-03-22)

- **server/.env.example:** Updated with all required and optional vars from inventory. Template includes DB_*, Google OAuth, Bright MLS, cache TTLs, and logging vars.
- **Root .env.example:** Created for cross-cutting vars (TEST_ENABLED, GIT_MCP_SERVER, VITE_*).
- **Hardcoded secrets scan:** No API keys or tokens found in committed source. `database.mjs` uses `DB_PASSWORD || 'jklJKL'` as a dev fallback; production requires `DB_PASSWORD` (envConfig validates). Document as acceptable dev default; prod must set env.
- **.gitignore:** Confirms `.env` and `.env.*` — env files are not committed.

### Committed files scan — results (Task 8.4.2.1 — 2026-03-22)

**Methodology:** Audited `.gitignore` for credential-path coverage; ran pattern-based grep on tracked files (`git ls-files` over `client/src/**`, `server/src/**`) for: `(api_key|secret|password|token|bearer)=.*[20+ chars]`, `AIza[0-9A-Za-z-_]{35}`, `sk-[a-zA-Z0-9]{20,}`. Excluded `.env.example` and documentation.

**.gitignore coverage (verified):**

| Pattern | Purpose |
|---------|---------|
| `.env`, `.env.*` | All env files (except `.env.example` templates) |
| `!.env.example`, `!**/.env.example` | Allow template files only |
| `.google-tokens.json` | Google OAuth token storage |
| `.cursor/mcp.json` | MCP config with machine-specific paths |
| `.cursor/gmail-mcp-server` | Cloned Gmail MCP (third-party) |
| `backups/property-configs/property-config-*.json` | Dated config backups (may hold API keys) |

**Note:** `backups/property-configs/property-config-latest.json` is tracked. Ensure it does not contain real API keys; use placeholders or env refs if used for deployment.

**Scan results:**

- **No high-risk findings.** No hardcoded Google API keys (`AIza*`), OpenAI-style keys (`sk-*`), or bearer tokens in committed source.
- **DB_PASSWORD fallback:** `database.mjs`, `db-reset.mjs`, `run-migrations.mjs` use `process.env.DB_PASSWORD || 'jklJKL'` for local dev. Documented in Validation section above; production requires `DB_PASSWORD` env.
- **sessionToken:** `mapsRoutes.ts` uses `generateSessionToken()` — runtime-generated, not a hardcoded secret.

**Safe-handling guidelines (Task 8.4.2.2 — 2026-03-22)**

- **Pre-commit checklist:** Before committing, verify no API keys, tokens, or passwords are in source. Use `process.env.*` or `import.meta.env.*` for all secrets; reference `server/.env.example` and root `.env.example` for required vars.
- **Patterns to avoid:** Hardcoded `AIza*` (Google API), `sk-*` (OpenAI-style), bearer tokens, `password=...`, `secret=...` with literal values. Acceptable: `process.env.DB_PASSWORD || 'jklJKL'` for local dev only when production requires env.
- **Adding new credential paths:** When adding a new integration (OAuth, API client, token storage), add the credential file or directory to `.gitignore` before committing. Document the pattern in this section.
- **When to re-run the scan:** Before phase/session end, when adding new third-party integrations, or after significant refactors touching config loaders. Quick scan for high-risk patterns (Google API keys, OpenAI-style keys):

```bash
git ls-files client/src server/src | xargs grep -E 'AIza[0-9A-Za-z_-]{35}|sk-[a-zA-Z0-9]{20,}' 2>/dev/null || echo "No high-risk matches"
```

Excludes `.env.example` (template only). Any matches warrant manual review. For broader patterns, see methodology in "Committed files scan — results" above.

## Inbound rate limiting (active)

**Location:** `server/src/middlewares/rateLimit.ts`  
**Applied to:** `/api/v1/internal/*` routes

- **General limiter:** 100 requests per 15 minutes per IP. Excess requests receive **429 Too Many Requests** with `Retry-After` header.
- **Headers:** `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` (standard); `X-RateLimit-*` (legacy).
- **Auth-route limiter:** 10 requests per 15 minutes per IP on `/api/v1/internal/auth/*`. Placeholder route returns 501 until Feature 7 (Authentication) adds login routes.
- **IPv6 (express-rate-limit v8+):** Client keys use IPv6 subnet masking by default so many addresses in the same ISP subnet share one bucket (reduces bypass via address rotation). IPv4 behavior is unchanged.

### How to verify (general limiter)

With the server running (e.g. `npm run start:dev`), exhaust the limit and confirm 429. Use any GET under `/api/v1/internal/` (e.g. `/api/v1/internal/entities`):

```bash
# Send 101 requests; the 101st should return 429 with Retry-After
for i in $(seq 1 101); do
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/api/v1/internal/entities
done
```

Expect the first 100 responses to be `200` and the 101st to be `429`. To inspect the 429 response and headers:

```bash
# After exhausting the limit, one more request shows 429
curl -v http://localhost:3001/api/v1/internal/entities
# On 429: expect Retry-After header and JSON body: {"error":"Too many requests, please try again later."}
```

### How to verify (auth-route limiter)

Auth routes use a stricter limit (10 req/15 min). Send 11 requests to `/api/v1/internal/auth`; the 11th should return 429:

```bash
# Send 11 requests; the 11th should return 429
for i in $(seq 1 11); do
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/api/v1/internal/auth
done
```

Expect the first 10 responses to be `501` (placeholder) and the 11th to be `429`. To inspect the 429 response and headers:

```bash
# After exhausting the limit, one more request shows 429
curl -v http://localhost:3001/api/v1/internal/auth
# On 429: expect Retry-After header and JSON body: {"error":"Too many requests, please try again later."}
```

## Security headers (Helmet) (active)

**Location:** `server/src/app.ts`  
**Applied to:** All responses (global middleware via `app.use(helmet({...}))`)

**Configuration (Task 8.5.1.1 — 2026-03-22):**

| Option | Value | Rationale |
|--------|-------|-----------|
| `hsts.maxAge` | 31536000 (1 year) | Browsers remember HTTPS-only for 1 year; minimum for preload eligibility |
| `hsts.includeSubDomains` | true | Policy applies to all subdomains |
| `hsts.preload` | true | Eligible for browser HSTS preload lists |
| `referrerPolicy.policy` | strict-origin-when-cross-origin | Full URL for same-origin; origin-only for cross-origin HTTPS→HTTP; no referrer for HTTPS→HTTP downgrade |

Helmet also sets defaults for: Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, X-DNS-Prefetch-Control, etc. Session 8.5.2 will tune CSP for the Vue SPA.

**Note:** HSTS is only sent over HTTPS. In local dev (HTTP), `Strict-Transport-Security` may not appear. Production behind an HTTPS reverse proxy will send it. `Referrer-Policy` is sent for both HTTP and HTTPS.

### How to verify

With the server running (e.g. `npm run start:dev`):

```bash
curl -I http://localhost:3001/
```

Expected headers:

- **Referrer-Policy:** `strict-origin-when-cross-origin`
- **Strict-Transport-Security:** `max-age=31536000; includeSubDomains; preload` (when served over HTTPS)
- **X-Content-Type-Options:** `nosniff`
- **X-Frame-Options:** `SAMEORIGIN`
- **Content-Security-Policy:** (Helmet default; Session 8.5.2 will customize)

Alternatively, use browser DevTools → Network tab → select a request → Headers to inspect response headers.

## Request validation (active)

**Location:** `server/src/middlewares/validateRequest.ts`  
**Pattern:** `validateRequest(schema)` returns Express middleware that validates `req.body` against a Joi schema. On failure, responds 400 with `{ error: 'Validation failed', details: [...] }`. On success, calls `next()`.

**Sample route:** `POST /api/v1/internal/auth/login` — validates `{ email, password }`; valid payload → 501 (placeholder); invalid → 400 with Joi details. Session 8.3.2 will apply validation across internal routes.

### How to verify

With the server running, send an invalid payload and confirm 400 with validation details:

```bash
# No session cookie: CSRF check is skipped (see CSRF validation table).
curl -X POST http://localhost:3001/api/v1/internal/auth/login \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expect `400` with JSON body containing `error: 'Validation failed'` and `details` array with Joi error entries. Valid payload (e.g. `{"email":"a@b.com","password":"x"}`) returns `501` (placeholder).

**With a session cookie:** send **`X-CSRF-Token`** equal to `csrf_token` / `Session.sess.csrfToken` on mutating requests or receive **403**.

## Planned behavior

### csrfProtection

- **Issuance:** see **CSRF issuance (active)** above.
- **Validation (done 8.6.1.2):** see **CSRF validation (active)** above. Implementation: `server/src/middlewares/security.ts`.

### requireAuth

- **Current (Feature 7 — session):** Reads session id from the configured HttpOnly cookie (`getSessionIdFromRequest`), loads `Session` via `getAuthSessionBySid`, requires `session.userId`, loads `User`, sets `req.user = { id, role }` (`role` from `user.userRole`). **401** `{ code: UNAUTHORIZED }` when unauthenticated; **500** `{ code: INTERNAL_ERROR }` on unexpected resolver failures (logged). Depends on `cookieParser()` in `app.ts`. Resolver: `server/src/auth/resolveAuthenticatedUser.ts`.
- **Not applied globally:** Add `requireAuth` only on routes that should be protected.
- **Future (optional):** Bearer JWT or additional headers can be layered in strategies without removing cookie session as the primary browser contract.
- **Held-status usage:** When a client holds an appointment slot (`PATCH /appointments/:id` with `status: 'held'`), the server will set `held_by` to `req.user.id` once the route is protected with `requireAuth`. Until then, `held_by` remains `null` and the client "Hold Slot" button is disabled with a tooltip.

### requireRole

- **Current (Feature 7 — 7.2.3.2):** Factory `requireRole(...allowedRoles)` returns middleware that runs **after** `requireAuth`. Compares `req.user.role` to allowed strings. **403** `{ code: FORBIDDEN }` when role missing, not allowed, or `requireAuth` was omitted (`req.user` undefined — logged). Empty `allowedRoles` → warn + **403** for every request.
- **Override usage:** Gate routes with role strings that match `users.user_role` (shared constants), not necessarily literal `'admin'` unless that value exists in your enum.

### checkOwnership (active) — Phase 8.7.1.2

**Factory:** `checkOwnership(resourceName, paramKey?, _ownerField?)` in `server/src/middlewares/security.ts`. The third argument is reserved; the **owner column** (or `row_pk_is_user` rule) comes from **`ownershipRegistry.ts`**, not from the route.

**Core implementation:** `runOwnershipCheck` in `server/src/middlewares/ownershipEnforcement.ts` (called by the factory). **Order:** use **`requireAuth`** on the same route **before** `checkOwnership` so `req.user` is set. If `req.user` is missing, the check logs and returns **403**.

**Registry:** `OWNERSHIP_REGISTRY` / `OWNERSHIP_RESOURCE_NAMES` in `ownershipRegistry.ts`. Every `resourceName` passed to `checkOwnership(...)` must be registered. **Unknown `resourceName`:** fail closed — **403** `FORBIDDEN` + log (`warn`).

**Response shapes (ownership middleware only):**

| Outcome | Status | Body |
|--------|--------|------|
| Allowed | — | (middleware calls `next()`) |
| Denied (policy / unknown resource / missing user / null owner column / non-staff where required) | **403** | `{ code: FORBIDDEN, message: "Access denied" }` (same `code` as `requireRole`) |
| Missing or empty `req.params[paramKey]`, or row not found | **404** | `{ error: "Resource not found" }` |

**Registry entry kinds:**

1. **`sequelize`** — Load row with `Model.findByPk(id)` from `req.params[paramKey]`.
   - **`owner.mode: 'column'`** — Compare `req.user.id` to `row[owner.field]` (string-normalized). **Null/undefined owner value → 403** (no silent allow).
   - **`owner.mode: 'row_pk_is_user'`** — Compare `req.user.id` to the row primary key (e.g. **`user`** resource).
2. **`dynamic_entity`** — Used for **`entity`** CRUD: requires `req.entityConfig` (from entity route setup) and **`findByPk`** on the configured model. **Mutations are allowed only for internal staff roles** (see below); others get **403**.
3. **`special`** — Custom logic in `ownershipEnforcement.ts` (e.g. **`businessSetting`** keyed by `key` param + availability constant; **`calendarSetting`** / **`wizardSetting`** singleton admin paths; **`appointmentFeeSummary`** via parent **`Appointment.scheduledById`**; **`property`** / **`propertyType`** / staff-scoped integration models). See registry `reason` / `notes` for intent; behavior is defined in code.

**Internal staff roles** (bypass or replace strict row-level user match where enforcement implements it): **`agent`**, **`transaction_manager`**, **`seller`** (`isInternalStaffRole` in `ownershipEnforcement.ts`). Product rules may still require a loaded row to exist (404 when missing).

**Logging:** Denials and misconfiguration (e.g. `req.user` missing, unknown `resourceName`, unhandled special resource) are logged at **warn** or **error** with stable messages — see `ownershipLogger` / `checkOwnership:` prefixes in code.

**Manual IDOR / smoke checklist:** Session **8.7.2.2** (same doc or companion notes).

## Stub → real implementation mapping

| Stub | Location | Enactment (Feature 7) |
|------|----------|------------------------|
| `requireAuth` | `server/src/middlewares/security.ts` | **Done (7.2.3.1):** session cookie + DB; attach `req.user`. Optional: extend with JWT/header in later tasks. |
| `requireRole` | `server/src/middlewares/security.ts` | **Done (7.2.3.2):** variadic factory; 403 `FORBIDDEN`; order after `requireAuth`. |
| `checkOwnership` | `security.ts` + `ownershipRegistry.ts` + `ownershipEnforcement.ts` | **Done (8.7.1.2; docs 8.7.2.1):** registry-driven ownership; **403**/**404** shapes above; extend registry when adding new protected resources. |
| Appointment hold `heldBy` | `server/src/routes/internal/appointments/appointmentCrudRouter.ts` (sanitizeInput) | Replace `appointmentFields.heldBy = null` with `appointmentFields.heldBy = req.user?.id ?? null` (or require auth on PATCH and use `req.user.id`). |
| Appointment `overrideConstraints` | `server/src/routes/internal/appointments/appointmentCrudRouter.ts` (sanitizeInput) | Apply `requireRole('admin')` middleware to PATCH route (or the override-specific branch) so only admins can set `overrideConstraints`. |
| Client "Hold Slot" button | Client booking wizard | Remove `disabled` and tooltip; wire button to `holdSlot()` when auth is present. |
| Client "Override Constraints" button | Client admin appointments table | Remove `disabled` and tooltip; wire button to `applyOverrideConstraints()` when admin role is verified. |

## Phase 6.2 → Phase 6.7 relationship

Phase 6.2 establishes **stub foundations** for both held-status and admin constraint overrides. Phase 6.7 (Admin Force-Create & Constraint Overrides) will build the full implementation on top:

| Phase 6.2 (Stub) | Phase 6.7 (Full) |
|---|---|
| `override_constraints` JSONB column stores boolean flags | Full constraint engine reads these flags during slot computation |
| `sanitizeInput` validates keys against `ALLOWED_OVERRIDE_CONSTRAINTS` | Constraint override UI with per-constraint toggles and reason tracking |
| `requireRole('admin')` stub passes all requests | Real role check gates override-capable routes |
| Disabled "Override" button in admin table | Active override dialog with constraint picker and confirmation |

## Reference

- Implementation: `server/src/middlewares/security.ts`
- Appointment hold logic: `server/src/routes/internal/appointments/appointmentCrudRouter.ts` (`beforeUpdate`, `sanitizeInput`)
- Appointment override logic: `server/src/routes/internal/appointments/appointmentCrudRouter.ts` (`sanitizeInput`)
- Allowed override keys: `server/src/routes/internal/appointments/appointmentConstants.ts` (`ALLOWED_OVERRIDE_CONSTRAINTS`)
