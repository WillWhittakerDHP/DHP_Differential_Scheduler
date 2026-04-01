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

## Analysis

- **Domains touched:** Primarily **Admin / Config** (generic entity CRUD, metadata-driven UI, `entityCrudRouter`, relationship helpers). Secondary: **shared contracts** for preflight/finalize DTOs and policy enums. **Booking** is not in the hot path; avoid leaking booking-specific rules into the delete registry.
- **Data flow (per ARCHITECTURE.md §3):** Admin composables/components → `apiClient` → internal entity routes → services/repos/Sequelize. Delete flow must stay **short HTTP calls**: preflight GET/POST, user interaction, then resolve/finalize — not a single blocking DELETE through the wizard.
- **Type boundaries:** Policy enum + graph DTOs that both client and server need → `@shared` (or `shared/`). Wizard step state and injection-only types → `client/src/types/admin/` or co-located with composable. Server-only resolution helpers → `server/src/types` or route-local modules.
- **Risks:** (1) **Transaction scope** — partial apply if finalize fails mid-flight; need clear rollback story and idempotency expectations. (2) **Registry drift** — entity registered on client but not server (or vice versa); document single source of truth. (3) **Silent cascade** — must never remove large subtrees without explicit policy + confirmation (phase guide contract). (4) **Performance** — preflight on huge graphs; consider caps/pagination in contract if needed in later sessions.
- **Cross-phase:** **Phase 6.6** (appointment soft/hard delete) is **terminology alignment only** for this phase; 6.17 is admin generic delete, not appointment lifecycle.
- **Testing:** Suspended until Phase 3.0 — manual smoke only (admin list + card delete, policies).

## Story / epic

Admins delete shapes and related catalog rows through generic CRUD. Today deletes are often **binary** and opaque when FKs or relationship rows block removal. We deliver a **dependency-aware funnel**: server explains what blocks deletion and how each edge is classified; the user resolves reassignment or confirms safe/bulk removal; server finalizes in transactions; the client refreshes global entity state — reusable across entity keys via a registry.

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

## Deliverables

1. **Shared + documented API contract** for delete preflight, resolution/finalize payloads, policy categories, and structured error codes (session 6.17.1).
2. **Server infrastructure:** registry-driven preflight, transactional resolve + final delete, structured 4xx (session 6.17.2).
3. **Client:** reusable delete wizard shell + composable/service orchestrating preflight → steps → finalize + cache invalidation (session 6.17.3).
4. **Wiring:** `entityListDelete`, entity card actions, `useEntityCrud` / mutations funnel registered entities into the wizard (session 6.17.4).
5. **Rollout + docs:** `partShape`, `blockShape`, `annotationShape` policies registered; extension guide for new entities (session 6.17.5).

## Acceptance criteria

- [ ] Supported entities use **preflight + wizard + finalize** when dependencies exist; not raw one-shot DELETE alone in those cases.
- [ ] Wizard surfaces **policy-aligned** actions (`reassign_required`, `safe_auto_remove`, `confirm_bulk_remove`, `hard_blocked`, `allow_direct_delete`) per phase guide table.
- [ ] **Reassignment** validated and applied server-side where required; **final delete** succeeds without orphans for rolled-out entities.
- [ ] **TanStack Query / global entity** invalidation keeps admin lists and detail consistent after finalize.
- [ ] Server returns **structured** dependency data and machine-readable errors (not only opaque 500).
- [ ] Documentation describes **how to register** a new entity and policies.
- [ ] **Lint + app start** after phase work; **no new automated test files** unless project policy changes.

## Decomposition

| Session | Leaf outcome | Depends on |
|---------|----------------|------------|
| **6.17.1** | Types + OpenAPI-level doc: dependency nodes/edges, policy enum, preflight response, resolve/finalize request bodies; router extension points named | — |
| **6.17.2** | Server registry + handlers: preflight query, apply resolution, final delete; transactions; error shape | 6.17.1 |
| **6.17.3** | `useDependencyAwareDelete` (or named equivalent) + thin modal; calls preflight/finalize; explicit return type; no deep logic in components | 6.17.1–2 |
| **6.17.4** | Single entry funnel from `entityListDelete`, `entityCardActionsPersistence`, mutations when `GlobalEntityKey` registered | 6.17.3 |
| **6.17.5** | Policies for part/block/annotation shapes + README or phase doc “how to add an entity” | 6.17.2–4 |

**Coverage check:** The five sessions sequence **contracts → server → client wizard → wire → rollout**, which fully covers the Goal and Approach. No parallel track is required for MVP; optional follow-up (perf, more entities) is out of scope until explicitly added.

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
