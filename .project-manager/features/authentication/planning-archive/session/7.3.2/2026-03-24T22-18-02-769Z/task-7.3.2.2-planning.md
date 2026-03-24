# Plan: task 7.3.2.2 — Verify URL helper + request-link flow (no router mount)

## Contract
- **Tier:** task | **ID:** 7.3.2.2
- **Scope:** **`buildMagicLinkVerifyUrl(rawToken)`** and a **single orchestration function** that validates email, calls **`issueMagicLinkForEmail`**, builds the verify URL, and calls **`sendMagicLinkDelivery`**. **No** `router.post` in **`authRouter.ts`** here — task **7.3.2.3** mounts the route + final docs. **No** verify/session cookie (session **7.3.3**).
- **Governance:** Clean — no violations detected

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
Task **7.3.2.1** added **`sendMagicLinkDelivery`**. **7.3.1.3** exports **`issueMagicLinkForEmail`**.

## Goal
1. **`buildMagicLinkVerifyUrl(rawToken: string): string`** — `${base}/auth/verify?token=` + **`encodeURIComponent(rawToken)`**. **`base`** from **`process.env.APP_BASE_URL`** or **`process.env.VITE_APP_BASE_URL`**, trimmed, no trailing slash (same idea as `inviteContextBuilder` / product URL for the Vue app). If base is missing, **log warn** and use **`http://localhost:3002`** (or document a single fallback constant aligned with client dev port).
2. **`requestMagicLinkForEmail(email: string): Promise<{ delivered: boolean }>`** (name flexible) — trim + validate non-empty email (simple regex or reuse patterns); call **`issueMagicLinkForEmail`**: on **`null`**, still return **`{ delivered: true }`** (anti-enumeration); on success build URL, **`sendMagicLinkDelivery`** with subject/body lines including the verify URL (plain text).
3. Export Joi schema object for **`{ email }`** for **7.3.2.3** to pass to **`validateRequest`**.

## Files
- **New:** `server/src/auth/magicLinkRequest.ts` (helpers + orchestration + Joi schema export)
- **Reference:** `server/src/services/invites/inviteContextBuilder.ts` (base URL), `issueMagicLinkForEmail`, `sendMagicLinkDelivery`

## Approach
1. Extract or duplicate **minimal** base-URL resolution in one private helper to avoid coupling invites module to auth.
2. Keep orchestration **under branch limits**; split private **`normalizeAppBaseUrl`** if needed.
3. Email validation: Joi-compatible rules mirrored in a small **string predicate** for the programmatic path, or call **`issueMagicLinkForEmail`** only after Joi would pass (7.3.2.3 validates HTTP — here accept trimmed string and validate format in code).

## Checkpoint
- Unit-style manual check: with env set, **`buildMagicLinkVerifyUrl('x')`** returns a string containing **`token=x`** (encoded).
- **`requestMagicLinkForEmail`** always resolves without throwing; logs/errors only via existing loggers inside **`issueMagicLinkForEmail`** / delivery.

---
## Design Before Execute (pseudocode)

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
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/sessions/session-7.3.2-guide.md`
- Handoff (full transition context): `.project-manager/features/authentication/sessions/task-7.3.2.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
