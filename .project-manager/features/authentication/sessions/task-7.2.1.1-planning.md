# Plan: task 7.2.1.1 — 7.2.1.1

## Contract
- **Tier:** task | **ID:** 7.2.1.1
- **Scope:** 7.2.1.1
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
Session `7.2.1` is started; this is the first task. Session guide defines two tasks; this task is contracts and router alignment only — auth config scaffolding is **Task 7.2.1.2**.

## Goal
Introduce shared **auth strategy contracts** and **typed auth results** on the server so Phase 7.3 (magic link) can implement a strategy without changing Express route shapes or inventing ad-hoc types per endpoint. Align the existing placeholder `authRouter` with those types and keep responses **501 / not implemented** for real auth flows until strategies exist.

## Files
- `server/src/auth/strategies/strategyTypes.ts` — strategy interface, request/result types, strategy name union
- `server/src/routes/internal/auth/authRouter.ts` — keep placeholder routes; use shared types for structured error/placeholder responses
- `server/src/routes/index.ts` — only if import path cleanup is required
- Optional: `server/src/auth/index.ts` — re-export `strategyTypes` only if it reduces router coupling

## Approach
1. Add `strategyTypes.ts` with an explicit `AuthStrategy` contract and discriminated result types (`ok: true` vs `ok: false` with stable error codes for future HTTP mapping).
2. Define minimal **context** types for strategy inputs so strategies do not depend on the whole app.
3. Update `authRouter` to return typed JSON bodies where helpful while still returning **501** for unimplemented login until 7.3.
4. Do **not** add `authConfig.ts` or session persistence in this task — that is **7.2.1.2**.
5. Run `server` lint after edits; no client changes in this task.

## Design Before Execute
```ts
// Pseudocode — strategy seam
type AuthStrategyName = 'magic_link' | 'password' | 'none'

interface AuthStrategy {
  readonly name: AuthStrategyName
  requestLogin?(input: { email: string }): Promise<AuthOpResult>
  verifyToken?(input: { token: string }): Promise<AuthOpResult>
}

type AuthOpResult =
  | { ok: true; userId?: string; sessionId?: string }
  | { ok: false; code: 'NOT_IMPLEMENTED' | 'VALIDATION' | 'UNAUTHORIZED'; message: string }

// Router: import types; handlers return 501 with { code, message } until strategy wired in 7.2.1.2/7.3
```

## Checkpoint
- `strategyTypes.ts` exists with explicit exported types and strategy interface; no `any` at public boundaries.
- `authRouter.ts` compiles against those types; placeholder routes remain **501** for real auth.
- No new `authConfig` or DB session code in this commit.
- `npm run lint` in `server/` passes for touched files.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/sessions/session-7.2.1-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
