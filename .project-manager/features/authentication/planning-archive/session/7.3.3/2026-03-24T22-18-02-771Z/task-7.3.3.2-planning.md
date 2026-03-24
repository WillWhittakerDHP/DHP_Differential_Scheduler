# Plan: task 7.3.3.2 — Verify flow hardening + docs

## Contract
- **Tier:** task | **ID:** 7.3.3.2
- **Scope:** Logging and observability for **`GET /magic-link/verify`**, document dev smoke URLs and relation to client **`/auth/verify`**. No behavior change unless tightening log levels / messages.
- **Governance:** Clean — no violations detected

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function
- **Recommended context pack:** local_implementation_pack

## Where we left off
Task **7.3.3.1** shipped verify route + cookie. This task makes failures observable and documents how engineers exercise the API.

## Goal
1. **Logging:** For **`verifyToken`** failures, use **`logger.warn`** for expected client issues (**`VALIDATION`**, **`UNAUTHORIZED`**) and **`logger.error`** for **`INTERNAL_ERROR`** and true exceptions. Log when **`issueAuthSessionWithCookie`** returns **`null`** or **`ok`** without **`userId`** (already partially present — align levels).
2. **Docs:** Extend **`server/.env.example`** with commented **API** smoke URL for verify (**`/api/v1/.../magic-link/verify?token=`**) and one line that **`buildMagicLinkVerifyUrl`** targets the **Vue** path **`/auth/verify`** (session **7.4** will wire the client).

## Files
- **`server/src/routes/internal/auth/authRouter.ts`** — small **`logMagicLinkVerifyOutcome`** (or inline) helper; no new route surface.
- **`server/.env.example`** — smoke / relationship notes only.

## Approach
1. Add **`logMagicLinkVerifyFailure(code, message)`** in **`authRouter.ts`** (or private function) mapping **`AUTH_FAILURE_CODES`** to warn vs error.
2. Call it in the **`!result.ok`** branch before **`res.status(...).json`**.
3. Ensure **`issueAuthSessionWithCookie`** null path logs **`logger.error`** with a stable message key.
4. Append **`# Magic link API smoke`** block to **`.env.example`**.

## Checkpoint
- **`npm run lint`** / **`npm run compile`** (server) pass.
- Invalid token produces **warn** (not error spam); internal failures still **error**.

## Design Before Execute

```
on !result.ok:
  if code === INTERNAL_ERROR → logger.error('magic-link verify internal', { code, message })
  else → logger.warn('magic-link verify rejected', { code, message })
on created === null → logger.error('magic-link session persist failed', ...)
```

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide: `.project-manager/features/authentication/sessions/session-7.3.3-guide.md`
- Handoff: `.project-manager/features/authentication/sessions/task-7.3.3.1-handoff.md`
- Playbooks: `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`
