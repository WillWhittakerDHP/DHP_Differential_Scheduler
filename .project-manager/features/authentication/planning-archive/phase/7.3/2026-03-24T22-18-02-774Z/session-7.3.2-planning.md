<!-- harness-planning-rollup tier=session id=7.3.2 consolidatedAt=2026-03-24T22:18:02.769Z -->

# Consolidated planning: session 7.3.2

## Session 7.3.2 (parent)

## Goal

Ship a **request magic link** flow on the server: validate input (email), resolve or accept identity context as scoped, call **`issueMagicLinkForEmail`**, then **deliver** the magic link URL or raw token via a **small mailer abstraction** — **production path** uses real transport when env is set; **development** uses **`createLogger`** (or structured console) so engineers never need Postfix to test. Responses must not leak whether an email exists (generic success). **Verify** and **Set-Cookie** stay in **7.3.3**.

## Files

- **New:** `server/src/auth/magicLinkDelivery.ts` (or `server/src/services/email/magicLinkMailer.ts`) — `sendMagicLinkMessage({ to, verifyUrlOrBody })` with env switch.
- **Extend:** `server/src/routes/internal/auth/authRouter.ts` — `POST` route(s) for request-link; **`csrfProtection`** + **`validateRequest`** + Joi.
- **Config:** `server/.env.example` — SMTP or API keys only as stubs; document **`APP_BASE_URL`** / verify URL prefix for link building.
- **Use:** `issueMagicLinkForEmail` from `server/src/auth/strategies/magicLinkStrategy.ts` (or barrel `auth/index.ts`).

## Approach

1. **Delivery module:** Define a function (no new npm dependency unless already in `package.json`) — if no mailer, log at **info** with stable message key and **redact** full token in logs; if env enables outbound email later, implement one adapter.
2. **Route:** `POST /api/v1/internal/auth/.../magic-link/request` (exact path aligned with existing auth prefix); body `{ email }`; always return **200** or **202** with neutral message after rate-limit considerations (document if rate-limit deferred).
3. **Link format:** Build verify URL as `${APP_BASE_URL}/auth/verify?token=` + encodeURIComponent(rawToken) (or agreed path for 7.3.3) — single source helper **`buildMagicLinkVerifyUrl(rawToken)`** in auth utils.
4. **Security:** CSRF on POST; never log raw token at **error** level; validation errors **400** with Joi.

## Checkpoint

- Dev: requesting a link logs delivery intent and includes a followable URL in log (or mailer noop output).
- Prod-shaped env: code path exists to call mailer (even if integration tested later).
- No verify/session side effects in this session’s routes.

---

## Task 7.3.2.1 (source: task-7.3.2.1-planning.md)

### Goal

Add **`sendMagicLinkDelivery`** (name may vary) as the **single entry** for outbound magic-link notifications: **`to`** (email), **`subject`**, **`textBody`** (includes URL line). **Default / local dev:** **`createLogger`** at **info** with a **stable message id** and **redacted** body (never log full URL token — truncate query value or replace with `[REDACTED]`). **Optional env** (e.g. `MAGIC_LINK_DELIVERY_MODE=log|smtp`): if **`smtp`** is chosen but no mail library exists in **`server/package.json`**, **log a warn once** and **fall back to log mode** (no silent noop). Document vars in **`server/.env.example`**.

### Files

- **New:** `server/src/auth/magicLinkDelivery.ts`
- **Update:** `server/.env.example` (comments only; no secrets)
- **Reference:** `server/src/utils/logger.ts`

### Approach

1. Export **`sendMagicLinkDelivery(input: { to: string; subject: string; textBody: string }): Promise<void>`** with explicit return type.
2. Implement **`redactMagicLinkBodyForLogs(text: string): string`** — replace `token=` / similar query values with a placeholder (regex or URL-parse safe for our link shape).
3. Branch on env: **`log`** path logs structured fields `{ to, subject, bodyPreview: redacted }`; future **`smtp`** branch is a **stub** that warns and delegates to log until Phase 7.3+ adds a real transport.
4. No new npm dependencies in this task.

### Checkpoint

- Calling the helper in isolation produces visible **info** logs in dev without printing a full magic-link secret.
- Misconfiguration (e.g. invalid mode) is **warned**, not swallowed.

---

### Design

```
sendMagicLinkDelivery({ to, subject, textBody }):
  mode <- process.env.MAGIC_LINK_DELIVERY_MODE ?? 'log'
  if mode == 'smtp':
    logger.warn('SMTP not implemented; using log delivery')
    mode <- 'log'
  if mode == 'log':
    logger.info('magic_link.delivery.log', { to, subject, bodyPreview: redactMagicLinkBodyForLogs(textBody) })
```

---

---

## Task 7.3.2.2 (source: task-7.3.2.2-planning.md)

### Goal

1. **`buildMagicLinkVerifyUrl(rawToken: string): string`** — `${base}/auth/verify?token=` + **`encodeURIComponent(rawToken)`**. **`base`** from **`process.env.APP_BASE_URL`** or **`process.env.VITE_APP_BASE_URL`**, trimmed, no trailing slash (same idea as `inviteContextBuilder` / product URL for the Vue app). If base is missing, **log warn** and use **`http://localhost:3002`** (or document a single fallback constant aligned with client dev port).
2. **`requestMagicLinkForEmail(email: string): Promise<{ delivered: boolean }>`** (name flexible) — trim + validate non-empty email (simple regex or reuse patterns); call **`issueMagicLinkForEmail`**: on **`null`**, still return **`{ delivered: true }`** (anti-enumeration); on success build URL, **`sendMagicLinkDelivery`** with subject/body lines including the verify URL (plain text).
3. Export Joi schema object for **`{ email }`** for **7.3.2.3** to pass to **`validateRequest`**.

### Files

- **New:** `server/src/auth/magicLinkRequest.ts` (helpers + orchestration + Joi schema export)
- **Reference:** `server/src/services/invites/inviteContextBuilder.ts` (base URL), `issueMagicLinkForEmail`, `sendMagicLinkDelivery`

### Approach

1. Extract or duplicate **minimal** base-URL resolution in one private helper to avoid coupling invites module to auth.
2. Keep orchestration **under branch limits**; split private **`normalizeAppBaseUrl`** if needed.
3. Email validation: Joi-compatible rules mirrored in a small **string predicate** for the programmatic path, or call **`issueMagicLinkForEmail`** only after Joi would pass (7.3.2.3 validates HTTP — here accept trimmed string and validate format in code).

### Checkpoint

- Unit-style manual check: with env set, **`buildMagicLinkVerifyUrl('x')`** returns a string containing **`token=x`** (encoded).
- **`requestMagicLinkForEmail`** always resolves without throwing; logs/errors only via existing loggers inside **`issueMagicLinkForEmail`** / delivery.

---

### Design

```
normalizeAppBaseUrl(): string
  prefer APP_BASE_URL then VITE_APP_BASE_URL; trim; strip trailing /
  if empty -> warn + fallback localhost:3002

buildMagicLinkVerifyUrl(rawToken):
  return `${normalizeAppBaseUrl()}/auth/verify?token=${encodeURIComponent(rawToken)}`

requestMagicLinkForEmail(email):
  if invalid email shape -> return { delivered: true }  // still generic; optional: log debug
  row <- issueMagicLinkForEmail({ email, ... })
  if !row -> return { delivered: true }
  url <- buildMagicLinkVerifyUrl(row.rawToken)  // issue returns rawToken - issueMagicLinkForEmail returns { rawToken, magicLinkId } - use rawToken from issue result
  sendMagicLinkDelivery({ to: email, subject: '...', textBody: url + instructions })
  return { delivered: true }
```

Wait - issueMagicLinkForEmail returns `{ rawToken, magicLinkId }` - good.

---

---

## Task 7.3.2.3 (source: task-7.3.2.3-planning.md)

### Goal

Add **`POST /api/v1/internal/auth/magic-link/request`** (full path: `ROUTE_PATHS.API` + `v1` + `internal/auth` + route segment). Body `{ email }` validated with **`magicLinkRequestBodySchema`**; **`csrfProtection`** + **`validateRequest`**; handler delegates to **`submitMagicLinkRequest`** and returns **200** `{ delivered: true }`. Log unexpected errors; **500** with **`AUTH_FAILURE_CODES.INTERNAL_ERROR`**. Clarify **`APP_BASE_URL`** in `.env.example` for magic-link verify URLs.

### Files

- **`server/src/routes/internal/auth/authRouter.ts`** — new `POST` route; thin handler; imports from **`../../../auth/index.js`**.
- **`server/.env.example`** — one-line note that **`APP_BASE_URL`** is also used for magic-link verify links (Feature 7.3).

### Approach

1. Import **`magicLinkRequestBodySchema`**, **`submitMagicLinkRequest`** from auth barrel.
2. Register **`router.post('/magic-link/request', csrfProtection, validateRequest(magicLinkRequestBodySchema), async handler)`** — same middleware order as **`/login`**.
3. Handler: `await submitMagicLinkRequest(req.body.email)` → `res.status(200).json({ delivered: true })`; **`catch`**: **`logger.error`** + **500** `{ code: INTERNAL_ERROR, message }`.
4. Update file header comment to mention the magic-link request route.

### Checkpoint

- **Smoke (dev, `MAGIC_LINK_DELIVERY_MODE=log`):** `curl -X POST http://localhost:3001/api/v1/internal/auth/magic-link/request` with CSRF cookie/header as other mutating routes require — or use the client once wired; expect **200** and **`{ "delivered": true }`**; server log shows delivery (redacted) per **`sendMagicLinkDelivery`**.
- **Validation:** malformed body → **400** from **`validateRequest`** (same as `/login`).
- No verify/session cookies on this route (7.3.3).

---

### Design

```
POST /magic-link/request
  csrfProtection
  validateRequest(magicLinkRequestBodySchema)
  async (req, res) =>
    try:
      await submitMagicLinkRequest(req.body.email as string)
      res.json(200, { delivered: true })
    catch err:
      logger.error('magic-link request handler failed', { err })
      res.json(500, { code: INTERNAL_ERROR, message: 'Request failed' })
```

---
