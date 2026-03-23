# Plan: session 7.2.1 — Strategy Contract and Auth Config Foundation

## Contract
- **Tier:** session | **ID:** 7.2.1
- **Scope:** Strategy Contract and Auth Config Foundation
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
Phase 7.2 was manually resumed on the existing `phase-7.2` branch because the harness phase-start validator blocked on a pre-existing branch. The phase guide is now in place and this session is the first concrete planning slice for the server auth infrastructure. Existing server auth code is still placeholder-level, so this session should lock the shared contracts and file boundaries before implementation continues.

## Goal
Define the first stable server-side authentication seam for Feature 7: a strategy contract and auth configuration foundation that later magic-link and password strategies can plug into without changing router or middleware boundaries.

- Turn the session goal into two implementation-ready tasks with explicit acceptance criteria.
- Lock the initial auth server file layout so later phases extend the same structure instead of scattering auth logic through routes.
- Keep this session infrastructure-focused: strategy contracts, config helpers, and router/module seams now; session persistence internals belong to Session 7.2.2.

## Files
- `server/src/routes/internal/auth/authRouter.ts` — current placeholder auth router to evolve into the new module boundary
- `server/src/routes/index.ts` — confirm auth router wiring stays aligned with the new auth module structure
- `server/src/config/authConfig.ts` — central auth config for strategy selection, cookie rules, and auth environment decisions
- `server/src/auth/strategies/strategyTypes.ts` — shared strategy contract and auth result types
- `server/src/auth/index.ts` or equivalent auth module barrel if needed to keep router wiring clean
- `.project-manager/features/authentication/sessions/session-7.2.1-guide.md` — canonical task breakdown for this session

## Approach
1. Start simple: define the shared auth vocabulary first, including strategy interface, auth payload/result types, and clear responsibilities for request-vs-verify flows.
2. Add a dedicated auth config layer that centralizes environment-driven strategy choice and cookie/session settings, so later middleware and strategies read one source of truth.
3. Refactor placeholder router structure only enough to consume the new contracts cleanly. Do not build magic-link behavior yet; create extension seams for Phase 7.3.
4. Keep session-manager persistence and cookie lifecycle implementation out of this session unless a minimal type reference is required. That complexity lands in Session 7.2.2.
5. After task planning is approved, implement in task order and validate that new auth infrastructure follows existing server patterns rather than introducing ad-hoc auth wiring.

## Checkpoint
- The codebase has a named auth contract that future strategies can implement without changing route signatures.
- Auth config decisions are centralized and documented, including what is intentionally deferred to the next session.
- The auth router no longer represents a dead-end placeholder architecture; it clearly points to the new server auth module layout.
- Task boundaries are specific enough that `/task-start 7.2.1.1` can begin implementation without another planning pass.

## How we build the tierDown to achieve them
- **Task 7.2.1.1:** Define shared auth strategy contracts and result types
- **Task 7.2.1.2:** Add auth config helpers and router-facing module scaffolding
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/authentication/phases/phase-7.2-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
