# Plan: task 7.3.1.1 — Token and hash utilities

## Contract
- **Tier:** task | **ID:** 7.3.1.1
- **Scope:** Cryptographic token generation, one-way hashing for `magic_links.token_hash`, TTL and optional purpose — **no** Sequelize calls, **no** `AuthStrategy` in this task.
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
Session **7.3.1** is open on `session-7.3.1`. This is the first task: shared helpers that **7.3.1.2** (persistence) and **7.3.1.3** (strategy) will import.

## Goal
Add a small **server-only** module that: (1) generates a high-entropy **raw** magic-link token suitable for URLs, (2) derives a **stable hash** to store in `magic_links.token_hash` (raw token never persisted), (3) exposes **default TTL** (seconds or ms — match what the model/DB expect) with override from **environment**, and (4) allows an optional **`purpose`** string constant for future audits. Misconfiguration (e.g. invalid env) must be **logged** via the project logger, not ignored.

## Files
- **New:** `server/src/auth/strategies/magicLinkToken.ts` (or `server/src/auth/magicLinkToken.ts` if you keep strategies folder for strategy classes only — prefer colocation with `strategies/` for Feature 7).
- **Reference only:** `server/src/db/models/auth/magic_link.ts` (confirm naming of `tokenHash` / field types), existing server logger pattern (`createLogger`).

## Approach
1. Use Node **`crypto.randomBytes`** (or `randomUUID` + extra entropy if product prefers) for raw token length (e.g. 32 bytes → base64url or hex for URL safety).
2. Hash with **`createHash('sha256')`** (or agreed algorithm) over the raw token; export `hashMagicLinkToken(raw: string): string` (or Buffer workflow) returning hex/base64 consistent with how lookups will compare.
3. Read **`MAGIC_LINK_TTL_SECONDS`** (or project-standard env name) with a documented default; parse safely; on NaN/≤0 log **warn** and fall back to default.
4. Export named constants for **max token age** used when creating rows (callers in 7.3.1.2 pass `expiresAt`); optionally export `DEFAULT_MAGIC_LINK_PURPOSE` string.
5. No Express imports; pure functions + thin env helper; explicit return types on exports.

## Checkpoint
- From a dev REPL or temporary log line: generate raw → hash → second hash matches first for same raw; different raw → different hash.
- TTL helper returns a positive number; bad env logs once per process behavior is acceptable if documented.
- No raw token appears in any string intended for DB persistence in this module.

---
## Design Before Execute (pseudocode)

```
generateRawMagicLinkToken(): string
  bytes <- randomBytes(N)
  return base64url(bytes) // or hex

hashForStorage(raw: string): string
  return sha256(raw) encoded consistently

getMagicLinkTtlSeconds(): number
  v <- env.MAGIC_LINK_TTL_SECONDS
  if invalid -> logger.warn(...); return DEFAULT_TTL
```

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/sessions/session-7.3.1-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
