# Audit golden sample fixtures (Phase A)

Layout: `fixtures/audits/<auditType>/<ruleId>/tp/` and `fp/`.

- **tp/** — true positives: files that should be reported by the rule (detector must find at least one finding).
- **fp/** — false positives: files that should not be reported (detector must find zero findings).

Run: `node .scripts/audit-golden-runner.mjs` from `client/`. Output: `.audit-reports/audit-golden-results.json` and `audit-golden-results.md`.

First-wave rules with fixtures: type-import (type-used-as-value), type-escape (as-any, ts-ignore), error-handling (empty-catch). Some rules (e.g. empty-catch) rely on AST; if the audit uses AST for catch and the fixture path is outside normal src, one run may miss until the runner or audit is adjusted.
