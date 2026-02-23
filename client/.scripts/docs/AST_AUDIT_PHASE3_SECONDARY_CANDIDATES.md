# Phase 3 — Secondary AST Migration Candidates

Evaluation of additional audits for AST migration (data-driven; only proceed where projected noise reduction is meaningful).

## import-hygiene-audit.mjs

- **Current approach:** Regex/pattern-based detection of import style (barrel vs direct), default exports, etc.
- **Projected benefit:** AST could resolve import declarations and re-exports precisely, reducing false positives on dynamic imports or complex re-export patterns.
- **Go/no-go:** **Defer.** Import-hygiene allowlist is large and mostly intentional (barrel vs direct, server routes). No baseline of “regex false positives” was collected; AST migration would be speculative. Revisit if allowlist churn or user reports justify it.

## hardcoding-audit.mjs

- **Current approach:** Line/regex patterns for magic strings, field mapping, case strings, etc.
- **Projected benefit:** AST could distinguish string literals in type positions vs value positions, and could scope findings to actual expression nodes.
- **Go/no-go:** **Defer.** Hardcoding rules are highly config/domain-specific; many allowlist entries are intentional (constants, configs). AST would require significant rule redefinition. Revisit if noise from comments/type-only strings becomes a problem.

## css-audit.mjs

- **Plan:** Defer CSS parser-domain work unless justified by residual noise. No evaluation needed for this phase.
