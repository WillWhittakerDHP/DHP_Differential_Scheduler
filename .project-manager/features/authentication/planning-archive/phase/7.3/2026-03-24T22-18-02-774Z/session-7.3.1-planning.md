<!-- harness-planning-rollup tier=session id=7.3.1 consolidatedAt=2026-03-24T22:18:02.767Z -->

# Consolidated planning: session 7.3.1

## Session 7.3.1 (parent)

## Goal

Deliver a **magic-link strategy core** on the server: cryptographically sound token handling (store **hash** only), Sequelize-backed lifecycle on `MagicLink` (create, lookup, expiry, consume), and an `AuthStrategy` with `name: 'magic_link'` whose **`verifyToken`** resolves identity from a raw token per agreed rules. **`requestLogin`** and mail/logging stay in **7.3.2**; HTTP verify + `sessionManager` + cookie stay in **7.3.3**.

## Files

- **New:** `server/src/auth/strategies/magicLinkStrategy.ts` (or split helper file if complexity warrants), optional `server/src/auth/strategies/magicLinkToken.ts` for hash/TTL helpers.
- **Existing:** `server/src/auth/strategies/strategyTypes.ts`, `server/src/db/models/auth/magic_link.ts`, `server/src/auth/index.ts` (or auth registry) for registering the strategy when wired in a later task.
- **Tests:** Suspended project-wide — do not add test files; verify via manual notes or server logs in checkpoints.

## Approach

1. Define token format, hashing (e.g. SHA-256 of secret raw token), default TTL and `purpose` string; log validation failures with the project logger (no silent catches).
2. Implement persistence helpers: create row with `tokenHash`, `expiresAt`, optional `email`/`userId`; lookup by hash; enforce `expiresAt` and `consumedAt`; set `consumedAt` on successful consumption (single-use).
3. Implement `verifyToken` to return `AuthOpResult` with `userId` when valid, or `VALIDATION` / `UNAUTHORIZED` / `INTERNAL_ERROR` as appropriate — **without** creating a session (that is 7.3.3).
4. Register or export the strategy so **7.3.2** can call a shared “issue link” function and **7.3.3** can reuse `verifyToken` from the route layer.

## Checkpoint

- A raw token never appears in the database; only `tokenHash` is stored.
- Expired or consumed tokens do not authenticate; attempts are logged appropriately.
- `verifyToken` behavior is deterministic and matches `AuthStrategy` / `AuthOpResult` types.
- No new migrations unless the existing `magic_links` schema is proven insufficient (unlikely).

---

## Task 7.3.1.2 (source: task-7.3.1.2-planning.md)

### Goal

Add a small persistence module that: (1) **creates** a `MagicLink` row with `tokenHash`, `expiresAt`, and optional `email` / `userId` / `purpose`; (2) **loads** a row by `tokenHash` when not consumed; (3) **consumes** a valid row in a **single-use** flow (set `consumedAt`) after checks for **not found**, **expired**, and **already consumed**; (4) returns **typed outcomes** (discriminated union or similar) so the strategy layer maps to `AuthOpResult` without Sequelize types leaking everywhere. Use `models.MagicLink` from `../config/models.js` like `sessionManager.ts`.

### Files

- **New:** `server/src/auth/magicLinkPersistence.ts` (alongside session manager; keeps strategies folder for strategy + token only).
- **Use:** `server/src/config/models.js` (`models.MagicLink`), `server/src/auth/strategies/magicLinkToken.ts` (`hashMagicLinkTokenForStorage`), `server/src/utils/logger.js`.
- **Reference:** `server/src/db/models/auth/magic_link.ts` (field names).
- **Tests:** Suspended — no new test files.

### Approach

1. **`createPendingMagicLink`** — `MagicLink.create({ tokenHash, expiresAt, email, userId, purpose })`; log + return `null` on failure (match `createAuthSession` pattern).
2. **`findPendingMagicLinkByTokenHash`** — `findOne` where `tokenHash` matches and `consumedAt` is null (optional helper for strategy or internal use).
3. **`consumeMagicLinkByRawToken`** (or `tryConsume…`) — hash raw token → find pending row → if missing → `not_found`; if `expiresAt <= now` → `expired` (do not set `consumedAt`); else **`update` `consumedAt`** (prefer **transaction** `findOne` + `update`/`save` to reduce double-consume races) → return `ok` with `userId` / `email` from row.
4. Export explicit TypeScript types for outcomes (`MagicLinkConsumeResult`). No `AuthOpResult` in this file (7.3.1.3 adapts).

### Checkpoint

- Only **hashes** hit the database in queries for lookup-by-token flows.
- Expired links are rejected without marking consumed (unless product later changes — document in code comment if you intentionally consume expired).
- Successful path sets `consumedAt` exactly once; concurrent double-submit handled as well as a simple transaction allows.
- Logger used on unexpected DB errors; no empty `catch`.

---

### Design

```
createPendingMagicLink({ tokenHash, expiresAt, email?, userId?, purpose? })
  try MagicLink.create(...) catch log error -> null

consumeMagicLinkByRawToken(rawToken):
  hash <- hashMagicLinkTokenForStorage(rawToken)
  BEGIN TRANSACTION
  row <- MagicLink.findOne({ where: { tokenHash: hash, consumedAt: null } })
  if !row -> return not_found
  if row.expiresAt <= now -> return expired
  row.consumedAt <- now; await row.save()
  COMMIT -> return ok { userId: row.userId, email: row.email }
```

---

---

## Task 7.3.1.3 (source: task-7.3.1.3-planning.md)

### Goal

1. Implement **`verifyToken`**: trim/validate non-empty token → `consumeMagicLinkByRawToken` → on **`ok`**, return `{ ok: true, userId }` when `userId` is present; if `ok` but `userId` is null, return **`UNAUTHORIZED`** (link not bound to a user yet) with a clear message. On **`not_found`** / **`expired`** → **`UNAUTHORIZED`**. On **`error`** → **`INTERNAL_ERROR`**. Empty token → **`VALIDATION`**.
2. Export **`createMagicLinkStrategy()`** (or a const **`magicLinkStrategy`**) satisfying **`AuthStrategy`**; omit **`requestLogin`** here unless you implement a thin stub that returns **`NOT_IMPLEMENTED`** — prefer instead a **named export** **`issueMagicLinkForEmail`** (or similar) that **7.3.2** imports: generates raw token, hashes, **`createPendingMagicLink`** with `email`, optional `userId`, `purpose` from **`DEFAULT_MAGIC_LINK_PURPOSE`**, **`computeMagicLinkExpiresAt`**, returns `{ rawToken, row }` or `null` on persist failure (caller handles delivery).
3. Optionally re-export strategy from **`server/src/auth/index.ts`** for discoverability (minimal barrel change).

### Files

- **New:** `server/src/auth/strategies/magicLinkStrategy.ts`
- **Use:** `./magicLinkToken.js`, `../magicLinkPersistence.js`, `./strategyTypes.js`
- **Maybe update:** `server/src/auth/index.ts` (export strategy + issue helper)
- **Tests:** Suspended — no new test files

### Approach

1. Keep **`verifyToken`** in a dedicated async function to stay under complexity thresholds; map consume outcomes in a small `switch` or table-driven helper.
2. **`issueMagicLinkForEmail`**: validate non-empty email → `generateRawMagicLinkToken` → `hashMagicLinkTokenForStorage` → `createPendingMagicLink` — log and return `null` if create fails; otherwise return `{ rawToken, magicLinkId }` (do not log raw token at info level).
3. Use **`createLogger('auth.magicLinkStrategy')`** only where needed (avoid duplicate logs already in persistence).

### Checkpoint

- `verifyToken` typings match **`AuthStrategy`** / **`AuthOpResult`** exactly.
- Valid consumed link with `userId` yields **`ok: true`** with that id; missing user on otherwise valid consume is **`UNAUTHORIZED`**.
- Issue helper produces a row whose `token_hash` matches hash of returned raw token; TTL consistent with env default.

---

### Design

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

---
