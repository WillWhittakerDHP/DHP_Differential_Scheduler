# Composable Authoring Playbook

## Purpose and scope

This document governs how composables and function boundaries are designed, exposed, and tested. It complements:

- **Harness playbook alignment** (`.project-manager/HARNESS_PLAYBOOK_ALIGNMENT.md`) — `client/src` layout vs obsolete `frontend-root` naming in old docs.
- **Type Authoring Playbook** (`.project-manager/TYPE_AUTHORING_PLAYBOOK.md`) — types at boundaries follow that playbook; this one focuses on composable shape, mutation ownership, and complexity.
- **Cursor rules** (`.cursor/rules/composable-governance.mdc`) — flat contracts, action-based mutation, Ref/ComputedRef boundaries; always-applied.
- **Audit scripts** — composable-health, composables-logic, function-complexity — which enforce and report on composable and function hygiene.

The playbook is the source of truth for rationale and examples; cursor rules are condensed references; audits provide automated enforcement.

---

## Decision tree: keep flat vs split vs facade

1. **Is the public contract already flat and test-friendly?**  
   - If yes → keep as-is; ensure explicit return type and no `Ref|ComputedRef` unions at boundary.
2. **Does the composable mix orchestration, state, and mutation in one large return?**  
   - If return surface has 10+ properties or high complexity score → split by responsibility (`useXxxState`, `useXxxActions`, `useXxxQuery`).
3. **Do consumers need a different shape than the internal composable returns?**  
   - If yes → single provider translation point (e.g. in parent component or facade composable); expose one stable flat contract to consumers.
4. **Is the file importing 6+ composable modules?**  
   - If yes → decompose or introduce a focused facade; avoid “kitchen sink” composables.

---

## Composable contract table

| Creating a...                        | Return Type                                   | Rationale                             |
| ------------------------------------ | --------------------------------------------- | ------------------------------------- |
| Internal mutable state               | `Ref<T>`                                      | Single source of mutation truth       |
| Derived read-only field              | `ComputedRef<T>`                              | Prevent accidental writes             |
| Intentional read/write derived field | `WritableComputedRef<T>`                      | Explicit bidirectional semantics      |
| Public composable contract field     | Prefer plain value or stable `ComputedRef<T>` | Flat, test-friendly consumer API      |
| Public mutation entrypoint           | Named action function                         | Traceable, explicit state transitions  |

---

## Decision table: preferred patterns vs avoid

| Decision Point             | Preferred Pattern              | Avoid                                          |
| -------------------------- | ------------------------------ | ---------------------------------------------- |
| Consumer testing surface   | Flat contract                  | Deep nested grouped objects unless justified   |
| Boundary ambiguity         | Single canonical ref flavor    | `Ref<T> \| ComputedRef<T>` unions at boundary  |
| High complexity composable | Split by state/actions/query   | Giant orchestrator with mixed concerns         |
| Provider/consumer mismatch | Single provider translation    | Repeated consumer-side narrowing               |

---

## Mutation boundary policy

- **Action-first mutation:** Expose state changes via named functions (`setX`, `updateX`, `toggleX`, `clearX`) rather than handing out writable refs at the boundary.
- **Internal mutability:** Use `Ref<T>` inside the composable; expose read-only views as `ComputedRef<T>` and write paths as action functions.
- **WritableComputedRef:** Use only when the field is intentionally getter+setter (e.g. v-model binding); do not use to “fix” type errors by widening to writable.

---

## Injection boundary policy

- **Single translation point:** When the composable returns a grouped shape (e.g. state/actions/computed), the **provider** (e.g. root component or facade) translates to a flat contract once; consumers receive that flat contract via `inject(Key)`.
- **Typed keys only:** Use `InjectionKey<ContextType>`; never string-keyed or untyped `Symbol()` for shared context.
- **Stable consumer contract:** The type behind the injection key should match what consumers see; no `Ref|ComputedRef` unions in that type.

---

## Function governance policy

Thresholds are enforced by the function-complexity audit; align design with these limits:

- **Nesting:** Max 3 levels (if/else, try/catch, switch). Deeper nesting → extract helpers or split logic.
- **Branches:** Max 8 branches per function. More → split or use lookup tables / strategy functions.
- **Length when branchy:** Functions with many branches should stay under 50 lines; otherwise extract.
- **Explicit return types:** Exported boundary functions (including composables) must have explicit return types.
- **No silent failure:** Do not swallow errors or return silently on invalid input; log and propagate or throw. See `coding-standards.mdc`.

---

## Definition of Done for composable changes

- `vue-tsc --noEmit` passes with no new errors.
- `npm run lint` passes in the client directory.
- Exported composables have explicit return types.
- No new `Ref<T> | ComputedRef<T>` unions at public boundaries.
- New or changed provide/inject uses typed `InjectionKey<ContextType>`.
- If the composable grew past 10 return properties or high complexity, split or document allowlist reason.
- Composable-health and function-complexity audits do not regress for touched files.

---

## Common mistakes / anti-patterns

| Mistake | Why it fails | Correct approach |
| ------- | ------------- | ----------------- |
| Returning `Ref<T> \| ComputedRef<T>` from composable | Ambiguous contract; consumers must branch | Pick one flavor per field; prefer `ComputedRef<T>` for read-only |
| Exposing writable ref at boundary “for convenience” | Uncontrolled mutation; hard to test | Expose action functions (`setX`, `updateX`) instead |
| String-keyed `provide('key', value)` | No type safety at inject site | `InjectionKey<ContextType>` and provide/inject with that key |
| Giant composable with 10+ return properties | Hard to test; mixed concerns | Split into state/actions/query or focused composables |
| Deep nesting or 8+ branches in one function | Hard to reason about; audit violation | Extract helpers, use lookup tables, or split function |
| Silent catch or empty fallback | Hides bugs; violates coding-standards.mdc | Log and rethrow or return typed error result |

---

## Baseline score formula (session tier)

The `composable-governance` baseline score (0–100) is derived in `.cursor/commands/audit/background-audit-runner.ts` (`computeGovernanceScores`). Formula: start at 100; subtract composable-health findings (missing-return-type 5, oversized-return 2, excessive-composable-imports 2, untyped-provide 2 per finding) and function-complexity P0 file count × 3; cap at 0. Same category is stored at session-start and compared at session-end.

---

## Audit rule cross-reference mapping

| Playbook rule                    | Audit script           | ruleId / signal                          |
| -------------------------------- | ---------------------- | ---------------------------------------- |
| Explicit return types            | composable-health       | missing-return-type                      |
| Small return surface             | composable-health       | oversized-return                         |
| Bounded composable imports       | composable-health       | excessive-composable-imports              |
| Typed provide/inject             | composable-health       | untyped-provide                          |
| Split high-complexity composable | composables-logic      | split_candidate, complexity score ≥ 20   |
| Low nesting/branching            | function-complexity     | nesting, branches, length-when-branchy   |

---

## Cross-references

- **Type playbook:** `.project-manager/TYPE_AUTHORING_PLAYBOOK.md` (boundary types, null/undefined, InjectionKey).
- **Cursor rules:** `composable-governance.mdc`, `coding-standards.mdc` (return types, error handling, documentation), `component-governance.mdc` (reusability).
- **Audit scripts:** `client/.scripts/composable-health-audit.mjs`, `composables-logic-audit.mjs`, `function-complexity-audit.mjs` (reports in `client/.audit-reports/`).
