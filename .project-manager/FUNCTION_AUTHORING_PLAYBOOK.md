# Function Authoring Playbook

## Purpose and scope

This document governs how functions are designed and maintained: complexity bounds, return types, error handling, and extract-vs-allowlist decisions. It complements:

- **Type Authoring Playbook** (`.project-manager/TYPE_AUTHORING_PLAYBOOK.md`) — types at boundaries.
- **Composable Authoring Playbook** (`.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`) — composable shape and function policy inside composables.
- **Cursor rules** (`.cursor/rules/function-governance.mdc`) — thresholds, return types, no silent errors; always-applied.
- **Audit script** — `client/.scripts/function-complexity-audit.mjs` (reports in `client/.audit-reports/function-complexity-audit.{md,json}`).

The playbook is the source of truth for rationale and thresholds; cursor rules are condensed references; the audit provides automated enforcement.

---

## Threshold table

Thresholds are defined in `client/.audit-reports/function-complexity-audit-config.json` and enforced by the function-complexity audit.

| Concern                        | Threshold / Rule              | Audit signal                |
| ------------------------------ | ----------------------------- | --------------------------- |
| Nesting depth                  | ≤ 3 levels                    | nesting                     |
| Branch count                   | ≤ 8 per function              | branches                    |
| Function length (when branchy) | ≤ 50 lines                    | length-when-branchy         |
| Script setup length            | ≤ 100 lines                   | script-setup-length         |
| Params / returns               | ≤ 4 each                      | params, returns             |
| Return type                    | Explicit on exported/boundary  | explicit-return-types rule  |
| Error handling                 | No silent catch                | explicit-error-handling.mdc |

**Priority bands:** P0 = score ≥ 12; P1 = score ≥ 5; P2 &lt; 5. Route handlers and other permissible contexts may be allowlisted in `client/.audit-reports/audit-global-config.json` under `allowlists.function-complexity`.

---

## Decision tree: extract vs keep vs allowlist

1. **Does the function exceed nesting, branches, or length thresholds?**
   - If no → keep; ensure explicit return type and no silent error swallowing.
2. **Is it a route handler or other allowlisted context (e.g. validation factory)?**
   - If yes → add or confirm allowlist entry in `audit-global-config.json`; document reason. Otherwise treat as violation.
3. **Can the complexity be reduced by extracting helpers or using lookup tables?**
   - If yes → extract to named utilities or split into smaller functions; re-run audit.
4. **Is the function in a composable or UI-facing module?**
   - Prefer extraction and low nesting; avoid branch-heavy logic in UI-facing code.

---

## Return type and error-handling policy

- **Explicit return types:** All exported functions and boundary functions (e.g. callbacks passed to components) must have an explicit return type. Align with `function-governance.mdc`.
- **No silent catch:** Do not swallow errors in empty catch blocks or return silently on invalid input. Log and rethrow, or return a typed error result. Align with `coding-standards.mdc`.
- **Transformations:** Prefer named utility functions with explicit return types; keep transformations testable and free of hidden side effects.

---

## Definition of Done for function changes

- `vue-tsc --noEmit` passes with no new errors.
- `npm run lint` passes in the client (and server if touched).
- New or changed exported/boundary functions have explicit return types.
- No new silent error swallowing (empty catch or silent fallback).
- If the function exceeds complexity thresholds, it is either refactored (extract helpers) or allowlisted with a documented reason in `audit-global-config.json`.
- Function-complexity audit does not regress for touched files (or new allowlist entry is justified).

---

## Common mistakes / anti-patterns

| Mistake | Why it fails | Correct approach |
| ------- | ------------- | ----------------- |
| Deep nesting (4+ levels) | Hard to read and test; audit violation | Extract inner logic to named helpers or use early returns |
| Branch explosion (8+ branches) | High cyclomatic complexity; audit violation | Use lookup tables, strategy functions, or split by case |
| Long branchy function (>50 lines with branches) | Hard to maintain; audit violation | Extract branches into small functions or utilities |
| Missing return type on exported function | Breaks explicit-return-types rule; unclear contract | Add explicit return type annotation |
| Empty catch or silent fallback | Hides bugs; violates explicit-error-handling | Log and rethrow or return typed error; document expected failures |
| Allowlisting without justification | Technical debt; drift from thresholds | Document reason in allowlist and in code comment |

---

## Audit rule cross-reference

The function-complexity audit reports violations with rule names and priority (P0/P1/P2).

| Playbook rule           | Audit / rule                    | Signal / ruleId           |
| ----------------------- | ------------------------------- | ------------------------- |
| Nesting ≤ 3             | function-complexity             | nesting                    |
| Branches ≤ 8            | function-complexity             | branches                   |
| Length when branchy ≤ 50| function-complexity             | length-when-branchy        |
| Script setup ≤ 100      | function-complexity             | script-setup-length        |
| Params / returns ≤ 4    | function-complexity             | params, returns            |
| Explicit return types   | function-governance.mdc + composable-health | missing-return-type (composables) |
| No silent catch         | coding-standards.mdc     | N/A (manual / review)      |

---

## Baseline score formula (session tier)

The `function-governance` baseline score (0–100) is derived in `.cursor/commands/audit/background-audit-runner.ts` (`computeGovernanceScores`). Formula: start at 100; subtract P0 file count × 3 and P1 file count × 1 (from `function-complexity-audit.json` `files[]` by `priority`); cap at 0. Same category is stored at session-start and compared at session-end.

---

## Cross-references

- **Cursor rules:** `function-governance.mdc`, `coding-standards.mdc` (return types, error handling, transform-over-drill).
- **Audit script:** `client/.scripts/function-complexity-audit.mjs` (reports in `client/.audit-reports/`).
- **Config:** `client/.audit-reports/function-complexity-audit-config.json`, `client/.audit-reports/audit-global-config.json` (allowlists.function-complexity).
