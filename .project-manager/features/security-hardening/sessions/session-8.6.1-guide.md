# Session 8.6.1 Guide: CSRF protection (double-submit cookie)

**Purpose:** Harness anchor for CSRF enactment on state-changing internal routes.

**Tier:** Session (maps to **Phase 8.6** in the feature guide)

---

## Quick Start

**Session ID:** 8.6.1  
**Delivered behavior**

- **`GET /api/v1/internal/auth/csrf-token`** — sets **`csrf_secret`** httpOnly cookie, returns `{ csrfToken }`.
- **`csrfProtection`** — validates **`X-CSRF-Token`** or body **`_csrf`** against the secret (`server/src/middlewares/csrfTokens.ts`, wired from `security.ts`).
- **Client** — `apiClient` uses **`withCredentials`**; `authStore.initializeAuth` fetches CSRF before unsafe calls; `apiClientCore` attaches header on POST/PUT/PATCH/DELETE.

**Primary files**

- `server/src/middlewares/csrfTokens.ts`
- `server/src/middlewares/security.ts` — `csrfProtection`
- `server/src/routes/internal/auth/authRouter.ts` — `/csrf-token`, `/logout`
- `client/src/utils/api/apiClientCore.ts`, `client/src/utils/api/csrfContext.ts`, `client/src/stores/authStore.ts`

**Success criteria**

- [x] Mutations that use `csrfProtection` fail without a valid token when the CSRF cookie is present.
- [x] SPA obtains token on bootstrap after session verify / login.

**Harness anchor:** `session-start 8.6.1` or **`phase-start 8.6`**.

---

## Notes

- See `server/docs/SECURITY_STUBS.md` (CSRF section).
