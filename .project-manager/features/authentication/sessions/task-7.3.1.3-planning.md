# Plan: task 7.3.1.3 — `magicLinkStrategy` module

## Contract
- **Tier:** task | **ID:** 7.3.1.3
- **Scope:** `AuthStrategy` with `name: 'magic_link'` and **`verifyToken`** delegating to `consumeMagicLinkByRawToken`, mapping results to **`AuthOpResult`** (`AUTH_FAILURE_CODES`). Optional **`issue`** helper for session **7.3.2** (request-link) using token + persistence utilities. **No** Express routes, **no** `createAuthSession` / cookies (that is later work in phase session **7.3.3** verify route).
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
Tasks **7.3.1.1** (`magicLinkToken.ts`) and **7.3.1.2** (`magicLinkPersistence.ts`) are done. This task wires them into the **`AuthStrategy`** contract so routers and later session code share one boundary.

## Goal
1. Implement **`verifyToken`**: trim/validate non-empty token → `consumeMagicLinkByRawToken` → on **`ok`**, return `{ ok: true, userId }` when `userId` is present; if `ok` but `userId` is null, return **`UNAUTHORIZED`** (link not bound to a user yet) with a clear message. On **`not_found`** / **`expired`** → **`UNAUTHORIZED`**. On **`error`** → **`INTERNAL_ERROR`**. Empty token → **`VALIDATION`**.
2. Export **`createMagicLinkStrategy()`** (or a const **`magicLinkStrategy`**) satisfying **`AuthStrategy`**; omit **`requestLogin`** here unless you implement a thin stub that returns **`NOT_IMPLEMENTED`** — prefer instead a **named export** **`issueMagicLinkForEmail`** (or similar) that **7.3.2** imports: generates raw token, hashes, **`createPendingMagicLink`** with `email`, optional `userId`, `purpose` from **`DEFAULT_MAGIC_LINK_PURPOSE`**, **`computeMagicLinkExpiresAt`**, returns `{ rawToken, row }` or `null` on persist failure (caller handles delivery).
3. Optionally re-export strategy from **`server/src/auth/index.ts`** for discoverability (minimal barrel change).

## Files
- **New:** `server/src/auth/strategies/magicLinkStrategy.ts`
- **Use:** `./magicLinkToken.js`, `../magicLinkPersistence.js`, `./strategyTypes.js`
- **Maybe update:** `server/src/auth/index.ts` (export strategy + issue helper)
- **Tests:** Suspended — no new test files

## Approach
1. Keep **`verifyToken`** in a dedicated async function to stay under complexity thresholds; map consume outcomes in a small `switch` or table-driven helper.
2. **`issueMagicLinkForEmail`**: validate non-empty email → `generateRawMagicLinkToken` → `hashMagicLinkTokenForStorage` → `createPendingMagicLink` — log and return `null` if create fails; otherwise return `{ rawToken, magicLinkId }` (do not log raw token at info level).
3. Use **`createLogger('auth.magicLinkStrategy')`** only where needed (avoid duplicate logs already in persistence).

## Checkpoint
- `verifyToken` typings match **`AuthStrategy`** / **`AuthOpResult`** exactly.
- Valid consumed link with `userId` yields **`ok: true`** with that id; missing user on otherwise valid consume is **`UNAUTHORIZED`**.
- Issue helper produces a row whose `token_hash` matches hash of returned raw token; TTL consistent with env default.

---
## Design Before Execute (pseudocode)

```
verifyToken(ctx, { token }):
  if !token.trim() -> VALIDATION
  r <- consumeMagicLinkByRawToken(token.trim())
  r.status == ok && r.userId -> { ok: true, userId: r.userId }
  r.status == ok && !r.userId -> UNAUTHORIZED("Magic link not bound to user")
  r.status in (not_found, expired) -> UNAUTHORIZED("Invalid or expired magic link")
  r.status == error -> INTERNAL_ERROR

issueMagicLinkForEmail({ email, userId?, purpose? }):
  raw <- generateRawMagicLinkToken()
  hash <- hashMagicLinkTokenForStorage(raw)
  exp <- computeMagicLinkExpiresAt(Date.now())
  row <- createPendingMagicLink({ tokenHash: hash, expiresAt: exp, email, userId, purpose })
  if !row return null
  return { rawToken: raw, magicLinkId: row.id }
```

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/sessions/session-7.3.1-guide.md`
- Handoff (full transition context): `.project-manager/features/authentication/sessions/task-7.3.1.2-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
