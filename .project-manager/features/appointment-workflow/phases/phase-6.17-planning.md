# Plan: phase 6.17 — Generalized Dependency-Aware Delete Wizard

## Contract

- **Tier:** phase | **ID:** 6.17
- **Scope:** Generalized admin delete workflow — preflight, wizard, resolve/finalize, policy registry
- **Governance:** Read function/composable/component playbooks before large composable or router edits

## Work Profile

- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** architectural
- **Governance domains:** docs, client-server contract
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** light
- **Downstream advice:** Planning doc is advisory; phase guide owns session list. Implement contracts in 6.17.1 before deep server/UI work.

## Where we left off

Phase registered via `/phase-add 6.17`; full intent in `phase-6.17-guide.md` and Feature 6 / PROJECT_PLAN.

## Goal

Deliver a **reusable dependency-aware delete** path for admin entities: **preflight** returns structured dependencies and policy actions; **wizard** collects reassignment/removal decisions; **resolve/finalize** applies server-side mutations and final delete in a clear transaction story; **client** invalidates generic entity cache. Replaces one-shot DELETE as the only path for supported types. **Not** a single-table hack — registry/config + typed policies (`reassign_required`, `safe_auto_remove`, `confirm_bulk_remove`, `hard_blocked`, `allow_direct_delete`).

## Files

- `phases/phase-6.17-guide.md` — canonical phase scope, sessions, success criteria
- **Client:** `client/src/composables/entityCrud/useEntityCrud.ts`, `useEntityCrudMutations.ts`, `client/src/utils/admin/entityListDelete.ts`, `client/src/composables/admin/entityCardActionsPersistence.ts`; new wizard/composable/service as designed in 6.17.3–6.17.4
- **Server:** `server/src/routes/internal/entities/entityCrudRouter.ts`; preflight/resolve/finalize handlers; relationship helpers
- **Shared (if used):** types for preflight payload, policy enum, finalize body

## Approach

1. **Contracts (6.17.1)** — Define dependency node/edge types, policy enum, preflight + finalize DTOs; document HTTP shape (separate from long-running DELETE).
2. **Server (6.17.2)** — Registry per entity key: preflight query, apply resolution, final delete; transactions; structured 4xx with machine-readable codes.
3. **Client wizard (6.17.3)** — Composable orchestrates preflight → steps → finalize; thin modal/shell.
4. **Wire (6.17.4)** — List delete + entity card + mutations call the funnel when entity is registered.
5. **Rollout (6.17.5)** — `partShape`, `blockShape`, `annotationShape` (+ related); extension doc; lint + app start.

## Checkpoint

- Preflight/finalize contracts are stable and documented
- At least one entity flows end-to-end through wizard + server
- Unsupported entities unchanged or explicitly excluded
- No silent destructive cascade; policies explicit in code + docs

## How we build the tierDown to achieve them

- **Session 6.17.1:** Delete dependency model + API contract
- **Session 6.17.2:** Server preflight / resolution / finalize infrastructure
- **Session 6.17.3:** Reusable client delete wizard + composable/service
- **Session 6.17.4:** Wire generic delete entry points (list + entity card)
- **Session 6.17.5:** Entity-policy rollout for initial supported entities + extension documentation

---

## Reference (read before implementation)

- TierUp guide: `.project-manager/features/appointment-workflow/feature-appointment-workflow-guide.md`
- Phase 6.6 (related): soft vs hard delete — align wording only
- Governance: `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `COMPOSABLE_AUTHORING_PLAYBOOK.md`, `COMPONENT_AUTHORING_PLAYBOOK.md`, `TYPE_AUTHORING_PLAYBOOK.md`
- Project policy: testing suspended until Phase 3.0 — no new test files unless explicitly allowed
