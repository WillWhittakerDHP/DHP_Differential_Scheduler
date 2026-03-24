<!-- harness-planning-rollup tier=phase id=7.3 consolidatedAt=2026-03-24T22:18:02.774Z -->

# Consolidated planning: phase 7.3

## Phase 7.3 (parent)

## Goal

Implement **magic-link authentication** on the server: a `magicLinkStrategy` (or equivalent) that fits the existing strategy contract, persistence using the `magic_links` model, a **request-link** path (email in production-shaped hook; **console or structured log in dev**), and a **verify** path that validates the token, creates a server session via the session manager, and sets the **httpOnly session cookie**. Leave password and OAuth out of this phase.

## Files

- **New / extended server:** `server/src/auth/strategies/` (magic link strategy), `server/src/routes/internal/auth/authRouter.ts` (request + verify handlers), optional `server/src/services/` or `server/src/auth/` helper for outbound email vs dev logging.
- **Existing seams:** `server/src/auth/strategies/strategyTypes.ts`, `server/src/auth/sessionManager.ts`, `server/src/auth/sessionCookie.ts`, `server/src/db/models/auth/magic_link.ts`.
- **Planning:** this file, `phase-7.3-guide.md`, and post-phase `phase-7.3-handoff.md` when 7.3 ends.

## Approach

1. Implement magic-link token lifecycle (create, store, expiry, single-use or rotation policy) against the existing DB model; keep branching shallow and log failures with the project logger.
2. Expose HTTP endpoints consistent with Phase 7.2 router patterns; wire verify flow to **session create + cookie set** so `requireAuth` succeeds on the next request.
3. Abstract **email delivery** behind a small interface or env-gated implementation so dev never requires SMTP.
4. Defer **client** login forms and deep guard alignment to **7.3** only as needed for manual smoke (e.g. hitting verify URL); full Vue work stays in **7.4**.

## Checkpoint

- Requesting a magic link for a known user identity produces a persisted token and a visible delivery signal (email or dev log).
- Visiting the verify URL (or POST, per design) with a valid token yields a session and cookie; invalid/expired tokens return clear errors and logs.
- No new migrations unless the team discovers a gap versus `magic_links` / sessions schema from 7.1.

---

## Session 7.3.1 (source: session-7.3.1-planning.md)

### Goal

Deliver a **magic-link strategy core** on the server: cryptographically sound token handling (store **hash** only), Sequelize-backed lifecycle on `MagicLink` (create, lookup, expiry, consume), and an `AuthStrategy` with `name: 'magic_link'` whose **`verifyToken`** resolves identity from a raw token per agreed rules. **`requestLogin`** and mail/logging stay in **7.3.2**; HTTP verify + `sessionManager` + cookie stay in **7.3.3**.

### Files

- **New:** `server/src/auth/strategies/magicLinkStrategy.ts` (or split helper file if complexity warrants), optional `server/src/auth/strategies/magicLinkToken.ts` for hash/TTL helpers.
- **Existing:** `server/src/auth/strategies/strategyTypes.ts`, `server/src/db/models/auth/magic_link.ts`, `server/src/auth/index.ts` (or auth registry) for registering the strategy when wired in a later task.
- **Tests:** Suspended project-wide — do not add test files; verify via manual notes or server logs in checkpoints.

### Approach

1. Define token format, hashing (e.g. SHA-256 of secret raw token), default TTL and `purpose` string; log validation failures with the project logger (no silent catches).
2. Implement persistence helpers: create row with `tokenHash`, `expiresAt`, optional `email`/`userId`; lookup by hash; enforce `expiresAt` and `consumedAt`; set `consumedAt` on successful consumption (single-use).
3. Implement `verifyToken` to return `AuthOpResult` with `userId` when valid, or `VALIDATION` / `UNAUTHORIZED` / `INTERNAL_ERROR` as appropriate — **without** creating a session (that is 7.3.3).
4. Register or export the strategy so **7.3.2** can call a shared “issue link” function and **7.3.3** can reuse `verifyToken` from the route layer.

### Checkpoint

- A raw token never appears in the database; only `tokenHash` is stored.
- Expired or consumed tokens do not authenticate; attempts are logged appropriately.
- `verifyToken` behavior is deterministic and matches `AuthStrategy` / `AuthOpResult` types.
- No new migrations unless the existing `magic_links` schema is proven insufficient (unlikely).

---

---

## Session 7.3.2 (source: session-7.3.2-planning.md)

### Goal

Ship a **request magic link** flow on the server: validate input (email), resolve or accept identity context as scoped, call **`issueMagicLinkForEmail`**, then **deliver** the magic link URL or raw token via a **small mailer abstraction** — **production path** uses real transport when env is set; **development** uses **`createLogger`** (or structured console) so engineers never need Postfix to test. Responses must not leak whether an email exists (generic success). **Verify** and **Set-Cookie** stay in **7.3.3**.

### Files

- **New:** `server/src/auth/magicLinkDelivery.ts` (or `server/src/services/email/magicLinkMailer.ts`) — `sendMagicLinkMessage({ to, verifyUrlOrBody })` with env switch.
- **Extend:** `server/src/routes/internal/auth/authRouter.ts` — `POST` route(s) for request-link; **`csrfProtection`** + **`validateRequest`** + Joi.
- **Config:** `server/.env.example` — SMTP or API keys only as stubs; document **`APP_BASE_URL`** / verify URL prefix for link building.
- **Use:** `issueMagicLinkForEmail` from `server/src/auth/strategies/magicLinkStrategy.ts` (or barrel `auth/index.ts`).

### Approach

1. **Delivery module:** Define a function (no new npm dependency unless already in `package.json`) — if no mailer, log at **info** with stable message key and **redact** full token in logs; if env enables outbound email later, implement one adapter.
2. **Route:** `POST /api/v1/internal/auth/.../magic-link/request` (exact path aligned with existing auth prefix); body `{ email }`; always return **200** or **202** with neutral message after rate-limit considerations (document if rate-limit deferred).
3. **Link format:** Build verify URL as `${APP_BASE_URL}/auth/verify?token=` + encodeURIComponent(rawToken) (or agreed path for 7.3.3) — single source helper **`buildMagicLinkVerifyUrl(rawToken)`** in auth utils.
4. **Security:** CSRF on POST; never log raw token at **error** level; validation errors **400** with Joi.

### Checkpoint

- Dev: requesting a link logs delivery intent and includes a followable URL in log (or mailer noop output).
- Prod-shaped env: code path exists to call mailer (even if integration tested later).
- No verify/session side effects in this session’s routes.

---

---

## Session 7.3.3 (source: session-7.3.3-planning.md)

### Goal

Complete the magic-link **consume** path on the server: expose a **GET** (and optionally **POST**) route under **`/api/v1/internal/auth`** that accepts the raw token, delegates to **`magicLinkStrategy.verifyToken`**, on success calls **`issueAuthSessionWithCookie`** so **`requireAuth`** works on subsequent requests. Return **JSON** with stable **`AUTH_FAILURE_CODES`** (or agreed shapes) for invalid/expired/consumed links; **`createLogger`** on unexpected paths. No silent failures.

### Files

- **`server/src/routes/internal/auth/authRouter.ts`** — verify route(s); thin handlers.
- **`server/src/auth/sessionFacade.ts`** / **`server/src/auth/index.ts`** — reuse **`issueAuthSessionWithCookie`** (and types as needed).
- **`server/src/auth/strategies/magicLinkStrategy.ts`** — already implements **`verifyToken`**; route imports **`magicLinkStrategy`** (or factory export).
- **`server/.env.example`** — any new flags only if needed (e.g. post-verify redirect base); otherwise document smoke URL for verify API.
- **Planning / handoff:** this file, session guide updates after tasks.

### Approach

1. **Task 7.3.3.1:** Add **`GET /magic-link/verify`** (full path **`/api/v1/internal/auth/magic-link/verify`**) with **`token`** query param (email links use query strings; **no CSRF** on GET link-open — do not reuse **`csrfProtection`** for this GET). Validate non-empty token → **`verifyToken`** → on **`ok`**, **`issueAuthSessionWithCookie`** with `userId` from result → **200** JSON (e.g. `{ ok: true, userId }` minimal). On strategy failure, map to **401**/**400** with **`code`** from **`AUTH_FAILURE_CODES`** and safe **`message`**.
2. **Task 7.3.3.2:** Hardening and docs: align error JSON shape with existing auth responses; ensure **`logger.warn`**/**`error`** where appropriate; document manual smoke (curl/browser) and relationship to client **`/auth/verify`** in session log or `.env.example` notes; **`npm run lint`** (server) clean.

### Checkpoint

- Valid token from **`issueMagicLinkForEmail` + request flow** → verify route returns **200**, **`Set-Cookie`** present, **`GET /session/me`** with that cookie returns **200** with user id.
- Bad/missing token → **4xx** JSON with **`code`**, no cookie set.
- Server lint and compile pass.

---

---
