# Plan: session 7.3.1 — Magic link strategy core

## Contract
- **Tier:** session | **ID:** 7.3.1
- **Scope:** Token generation, `magic_links` persistence, expiry/consumption rules, and a `magic_link` `AuthStrategy` implementation aligned with `strategyTypes.ts` — **no** auth HTTP routes (7.3.2) and **no** session+cookie wiring on verify (7.3.3).
- **Governance:** 3 governance highlights — read reports before filling slots

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** cross_cutting
- **Governance domains:** docs
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
Phase **7.3** has started on branch `phase-7.3`; Phases **7.1** (models) and **7.2** (session manager, cookies, `requireAuth`, auth router scaffold) are done. This session adds the **first real strategy module** behind that scaffold.

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

## How we build the tierDown to achieve them
- **Task 7.3.1.1:** Token + hash utilities and TTL/purpose config (env-backed where appropriate).
- **Task 7.3.1.2:** Magic link persistence — create, find active by token, consume, expiry checks on `MagicLink`.
- **Task 7.3.1.3:** `magicLinkStrategy` — implement `AuthStrategy.verifyToken`; export factory or singleton; prepare hook points for 7.3.2 (`requestLogin` / issue) and 7.3.3 (session + cookie after verify).

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/phases/phase-7.3-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
