<!-- harness-planning-rollup tier=session id=7.3.3 consolidatedAt=2026-03-24T22:18:02.771Z -->

# Consolidated planning: session 7.3.3

## Session 7.3.3 (parent)

## Goal

Complete the magic-link **consume** path on the server: expose a **GET** (and optionally **POST**) route under **`/api/v1/internal/auth`** that accepts the raw token, delegates to **`magicLinkStrategy.verifyToken`**, on success calls **`issueAuthSessionWithCookie`** so **`requireAuth`** works on subsequent requests. Return **JSON** with stable **`AUTH_FAILURE_CODES`** (or agreed shapes) for invalid/expired/consumed links; **`createLogger`** on unexpected paths. No silent failures.

## Files

- **`server/src/routes/internal/auth/authRouter.ts`** — verify route(s); thin handlers.
- **`server/src/auth/sessionFacade.ts`** / **`server/src/auth/index.ts`** — reuse **`issueAuthSessionWithCookie`** (and types as needed).
- **`server/src/auth/strategies/magicLinkStrategy.ts`** — already implements **`verifyToken`**; route imports **`magicLinkStrategy`** (or factory export).
- **`server/.env.example`** — any new flags only if needed (e.g. post-verify redirect base); otherwise document smoke URL for verify API.
- **Planning / handoff:** this file, session guide updates after tasks.

## Approach

1. **Task 7.3.3.1:** Add **`GET /magic-link/verify`** (full path **`/api/v1/internal/auth/magic-link/verify`**) with **`token`** query param (email links use query strings; **no CSRF** on GET link-open — do not reuse **`csrfProtection`** for this GET). Validate non-empty token → **`verifyToken`** → on **`ok`**, **`issueAuthSessionWithCookie`** with `userId` from result → **200** JSON (e.g. `{ ok: true, userId }` minimal). On strategy failure, map to **401**/**400** with **`code`** from **`AUTH_FAILURE_CODES`** and safe **`message`**.
2. **Task 7.3.3.2:** Hardening and docs: align error JSON shape with existing auth responses; ensure **`logger.warn`**/**`error`** where appropriate; document manual smoke (curl/browser) and relationship to client **`/auth/verify`** in session log or `.env.example` notes; **`npm run lint`** (server) clean.

## Checkpoint

- Valid token from **`issueMagicLinkForEmail` + request flow** → verify route returns **200**, **`Set-Cookie`** present, **`GET /session/me`** with that cookie returns **200** with user id.
- Bad/missing token → **4xx** JSON with **`code`**, no cookie set.
- Server lint and compile pass.

---

## Task 7.3.3.1 (source: task-7.3.3.1-planning.md)

### Goal

Add **`GET /magic-link/verify`** on the internal auth router. Read **`token`** from **`req.query`**, call **`magicLinkStrategy.verifyToken`**. On **`ok`** with **`userId`**, call **`issueAuthSessionWithCookie(res, { strategy: 'magic_link' }, userId)`** and respond **200** `{ ok: true, userId }`. On failure, respond with **`code`** + **`message`** and appropriate **4xx/5xx** (validation **400**, unauthorized **401**, internal **500**). Log unexpected handler errors with **`createLogger`**.

### Files

- **`server/src/routes/internal/auth/authRouter.ts`** — register route; optional small named handler(s) to stay under complexity thresholds.

### Approach

1. Import **`magicLinkStrategy`**, **`issueAuthSessionWithCookie`**, and **`AuthRequestContext`** (empty `{}` context) from **`../../../auth/index.js`**.
2. Register **`router.get('/magic-link/verify', async handler)`** — **before** `export`, **no** **`csrfProtection`**.
3. Map **`AuthOpResult`** failure **`code`** to HTTP status via a tiny helper.
4. If **`issueAuthSessionWithCookie`** returns **`null`**, **500** + **`INTERNAL_ERROR`**.

### Checkpoint

- **`npm run lint`** and **`npm run compile`** (server) pass.
- Manual: request magic link → follow logged URL or call verify API with raw token → **200** + **`Set-Cookie`** → **`GET /api/v1/internal/auth/session/me`** with cookie returns user.

### Design

```
GET /magic-link/verify?token=
  token = string from query or ''
  result = await magicLinkStrategy.verifyToken({}, { token })
  if result.ok:
    if !result.userId → 500 INTERNAL_ERROR
    created = await issueAuthSessionWithCookie(res, { strategy: 'magic_link' }, result.userId)
    if !created → 500
    else → 200 { ok: true, userId }
  else:
    status = map(result.code): VALIDATION→400, UNAUTHORIZED→401, else→500
    res.status(status).json({ code, message })
```

---

---

## Task 7.3.3.2 (source: task-7.3.3.2-planning.md)

### Goal

1. **Logging:** For **`verifyToken`** failures, use **`logger.warn`** for expected client issues (**`VALIDATION`**, **`UNAUTHORIZED`**) and **`logger.error`** for **`INTERNAL_ERROR`** and true exceptions. Log when **`issueAuthSessionWithCookie`** returns **`null`** or **`ok`** without **`userId`** (already partially present — align levels).
2. **Docs:** Extend **`server/.env.example`** with commented **API** smoke URL for verify (**`/api/v1/.../magic-link/verify?token=`**) and one line that **`buildMagicLinkVerifyUrl`** targets the **Vue** path **`/auth/verify`** (session **7.4** will wire the client).

### Files

- **`server/src/routes/internal/auth/authRouter.ts`** — small **`logMagicLinkVerifyOutcome`** (or inline) helper; no new route surface.
- **`server/.env.example`** — smoke / relationship notes only.

### Approach

1. Add **`logMagicLinkVerifyFailure(code, message)`** in **`authRouter.ts`** (or private function) mapping **`AUTH_FAILURE_CODES`** to warn vs error.
2. Call it in the **`!result.ok`** branch before **`res.status(...).json`**.
3. Ensure **`issueAuthSessionWithCookie`** null path logs **`logger.error`** with a stable message key.
4. Append **`# Magic link API smoke`** block to **`.env.example`**.

### Checkpoint

- **`npm run lint`** / **`npm run compile`** (server) pass.
- Invalid token produces **warn** (not error spam); internal failures still **error**.

### Design

```
on !result.ok:
  if code === INTERNAL_ERROR → logger.error('magic-link verify internal', { code, message })
  else → logger.warn('magic-link verify rejected', { code, message })
on created === null → logger.error('magic-link session persist failed', ...)
```

---

---
