# Plan: task 7.3.1.2 — Magic link persistence layer

## Contract
- **Tier:** task | **ID:** 7.3.1.2
- **Scope:** Sequelize-backed create / lookup / single-use consume for `magic_links` rows, using **hashed** tokens only at the DB boundary. **No** `AuthStrategy`, **no** HTTP routes (7.3.1.3 / phase 7.3.2).
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
Task **7.3.1.1** shipped `magicLinkToken.ts` (`generateRawMagicLinkToken`, `hashMagicLinkTokenForStorage`, TTL helpers). This task persists rows and implements **consume** semantics for **7.3.1.3** (`verifyToken`).

## Goal
Add a small persistence module that: (1) **creates** a `MagicLink` row with `tokenHash`, `expiresAt`, and optional `email` / `userId` / `purpose`; (2) **loads** a row by `tokenHash` when not consumed; (3) **consumes** a valid row in a **single-use** flow (set `consumedAt`) after checks for **not found**, **expired**, and **already consumed**; (4) returns **typed outcomes** (discriminated union or similar) so the strategy layer maps to `AuthOpResult` without Sequelize types leaking everywhere. Use `models.MagicLink` from `../config/models.js` like `sessionManager.ts`.

## Files
- **New:** `server/src/auth/magicLinkPersistence.ts` (alongside session manager; keeps strategies folder for strategy + token only).
- **Use:** `server/src/config/models.js` (`models.MagicLink`), `server/src/auth/strategies/magicLinkToken.ts` (`hashMagicLinkTokenForStorage`), `server/src/utils/logger.js`.
- **Reference:** `server/src/db/models/auth/magic_link.ts` (field names).
- **Tests:** Suspended — no new test files.

## Approach
1. **`createPendingMagicLink`** — `MagicLink.create({ tokenHash, expiresAt, email, userId, purpose })`; log + return `null` on failure (match `createAuthSession` pattern).
2. **`findPendingMagicLinkByTokenHash`** — `findOne` where `tokenHash` matches and `consumedAt` is null (optional helper for strategy or internal use).
3. **`consumeMagicLinkByRawToken`** (or `tryConsume…`) — hash raw token → find pending row → if missing → `not_found`; if `expiresAt <= now` → `expired` (do not set `consumedAt`); else **`update` `consumedAt`** (prefer **transaction** `findOne` + `update`/`save` to reduce double-consume races) → return `ok` with `userId` / `email` from row.
4. Export explicit TypeScript types for outcomes (`MagicLinkConsumeResult`). No `AuthOpResult` in this file (7.3.1.3 adapts).

## Checkpoint
- Only **hashes** hit the database in queries for lookup-by-token flows.
- Expired links are rejected without marking consumed (unless product later changes — document in code comment if you intentionally consume expired).
- Successful path sets `consumedAt` exactly once; concurrent double-submit handled as well as a simple transaction allows.
- Logger used on unexpected DB errors; no empty `catch`.

---
## Design Before Execute (pseudocode)

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
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/sessions/session-7.3.1-guide.md`
- Handoff (full transition context): `.project-manager/features/authentication/sessions/task-7.3.1.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
