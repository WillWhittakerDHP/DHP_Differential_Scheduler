# Plan: task 7.3.3.1 — Magic-link verify route + session cookie

## Contract
- **Tier:** task | **ID:** 7.3.3.1
- **Scope:** `GET /api/v1/internal/auth/magic-link/verify?token=` — `verifyToken` → `issueAuthSessionWithCookie` on success; JSON errors with `AUTH_FAILURE_CODES`. No CSRF on GET (email link). Task **7.3.3.2** covers docs/error polish.
- **Governance:** Clean — no violations detected

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate

## Where we left off
Session 7.3.3 planning locked verify API + session establishment; request route exists from 7.3.2.

## Goal
Add **`GET /magic-link/verify`** on the internal auth router. Read **`token`** from **`req.query`**, call **`magicLinkStrategy.verifyToken`**. On **`ok`** with **`userId`**, call **`issueAuthSessionWithCookie(res, { strategy: 'magic_link' }, userId)`** and respond **200** `{ ok: true, userId }`. On failure, respond with **`code`** + **`message`** and appropriate **4xx/5xx** (validation **400**, unauthorized **401**, internal **500**). Log unexpected handler errors with **`createLogger`**.

## Files
- **`server/src/routes/internal/auth/authRouter.ts`** — register route; optional small named handler(s) to stay under complexity thresholds.

## Approach
1. Import **`magicLinkStrategy`**, **`issueAuthSessionWithCookie`**, and **`AuthRequestContext`** (empty `{}` context) from **`../../../auth/index.js`**.
2. Register **`router.get('/magic-link/verify', async handler)`** — **before** `export`, **no** **`csrfProtection`**.
3. Map **`AuthOpResult`** failure **`code`** to HTTP status via a tiny helper.
4. If **`issueAuthSessionWithCookie`** returns **`null`**, **500** + **`INTERNAL_ERROR`**.

## Checkpoint
- **`npm run lint`** and **`npm run compile`** (server) pass.
- Manual: request magic link → follow logged URL or call verify API with raw token → **200** + **`Set-Cookie`** → **`GET /api/v1/internal/auth/session/me`** with cookie returns user.

## Design Before Execute (pseudocode)

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
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/sessions/session-7.3.3-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
