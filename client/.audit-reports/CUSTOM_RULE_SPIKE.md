# Phase B — Custom Rule Spike (ESLint + ast-grep)

**Scope:** type-import, type-escape, error-handling (golden fixtures, delta/summary, allowlist).  
**Goal:** Evaluate moving 2–3 rules into ESLint or ast-grep; document integration with existing report/delta/golden pipeline. No production migration.

---

## 1. Prototype code and locations

### ESLint custom rule: `as-any` (type-escape)

- **Location:** `client/.eslint-rules/audit-as-any.mjs`
- **Temporary config:** `client/.eslint-rules/eslint-spike.config.mjs`
- **Behavior:** Uses `@typescript-eslint/utils` (`RuleCreator`, `AST_NODE_TYPES`). Visits `TSAsExpression` and reports when `typeAnnotation.type === AST_NODE_TYPES.TSAnyKeyword` (i.e. `as any`). No type-aware filtering (no “drop when expression is already any”); that would require parser services and is left for Phase C.
- **Run (spike):**  
  `cd client && npx eslint -c .eslint-rules/eslint-spike.config.mjs [paths]`  
  Use `.ts` only for full codebase (spike config does not set Vue parser for `.vue`).

### ast-grep rule: `empty-catch` (error-handling)

- **Location:** `client/.ast-grep/rules/empty-catch.yaml`
- **Config:** `client/sgconfig.yml` with `ruleDirs: ['.ast-grep/rules']`
- **Behavior:** Matches `catch_clause` that has no `expression_statement` and no `throw_statement` in its body. Intended to match truly empty catch blocks; in practice also matches some blocks that contain only `return` (false positives). Refining to “zero statements” would require additional kinds or a different pattern.
- **Run (spike):**  
  `cd client && npx sg scan [paths]`

---

## 2. Performance

| Run | Scope | Time (approx) |
|-----|--------|----------------|
| ESLint spike (as-any) | `client/fixtures/audits/type-escape/as-any/**/*.ts` | ~0.75 s |
| ESLint spike (as-any) | `client/src/**/*.ts` | ~2.6 s |
| type-escape audit (full script) | client + server (all rules) | ~14.6 s |
| ast-grep (empty-catch) | `client/fixtures/audits/error-handling/empty-catch` | &lt; 0.5 s |
| ast-grep (empty-catch) | `client/src` | ~0.28 s |
| error-handling audit (full script) | client (all rules) | ~0.29 s |

**Summary:** ESLint as-any over client `.ts` is much faster than the full type-escape script (which includes TypeChecker and Vue extraction). ast-grep over `client/src` is very fast; the current error-handling script is also fast. A single ESLint rule over the full codebase (client + server `.ts`) is in the 2–3 s range; the type-escape script’s cost is dominated by type-checking and multi-rule/report pipeline.

---

## 3. DX (authoring, testing, debugging)

- **ESLint:** Rule is a single ESM file; no build step. Testing: run ESLint with spike config on `fixtures/audits/type-escape/as-any/` (tp = expect hits, fp = expect none). Reusing golden fixtures is straightforward: same paths as golden runner, but assertions are manual (exit code and line output). Debugging: standard ESLint rule debugging (e.g. log in `create()`).
- **ast-grep:** YAML rule; no build. Testing: `npx sg scan fixtures/audits/error-handling/empty-catch` (tp matches, fp dir clean). Can use `sg test` if rule tests are added under a test dir. Debugging: adjust rule and re-run scan.
- **Golden runner:** Today the golden runner runs the **audit scripts** (e.g. `type-escape-audit.mjs`), not ESLint/ast-grep. To reuse golden fixtures with ESLint/ast-grep, a thin adapter would run the external tool, parse its output (ESLint JSON formatter, ast-grep JSON), and map to the same finding shape (file, lineNumber, ruleId) so `getFindingsForRule` and the TP/FP assertions still work.

---

## 4. Integration path (existing JSON and pipeline)

For **type-escape** and **error-handling** (and conceptually type-import if a rule were migrated):

1. **Run external tool** (ESLint or ast-grep) with spike or a dedicated config, output in a stable format (e.g. ESLint `--format json`, ast-grep JSON if available).
2. **Map to existing schema:**
   - **type-escape:** Each ESLint/ast-grep result → `{ file, lineNumber, ruleId, line/snippet, confidence? }` and push into `findings[]`. Same shape as current type-escape JSON so `DELTA_FINDING_EXTRACTORS['type-escape']`, summary renderers, and golden runner’s `getFindingsForRule('type-escape', data, 'as-any')` keep working.
   - **error-handling:** Map to “per-file” + `requiresReview[]` with `ruleId`, line, etc., so `DELTA_FINDING_EXTRACTORS['error-handling']` and `getFindingsForRule('error-handling', data, 'empty-catch')` still work.
3. **Golden runner:** Adapter runs tool on fixture dirs, loads tool output, converts to the same structure the audit script would produce for that rule, then passes that into the existing `getFindingsForRule` + TP/FP logic. No change to `audit-golden-runner.mjs` contract if the adapter is the only caller for that rule.
4. **Allowlist prune:** Prune works on (file, lineNumber, ruleId). As long as the mapped findings include these, prune can run unchanged.
5. **Summary/delta:** `DELTA_FINDING_EXTRACTORS` and summary renderers consume the same JSON; no contract change if the audit (or adapter) writes that JSON.

**type-import:** The type-used-as-value rule is cross-file and semantic (symbol/type usage). It is a poor fit for a simple single-file ESLint/ast-grep rule; recommend leaving it in the script.

---

## 5. Phase C recommendation

- **Migrate first:**  
  - **as-any** (type-escape) → ESLint custom rule.  
  - **empty-catch** (error-handling) → ast-grep (or ESLint) after tightening “empty” (e.g. no statements at all) to reduce FPs.
- **Consider next:** as-unknown-as, catch-without-logger (if spike is extended and results support it).
- **Prefer ESLint for:** Type-escape family (as-any, as-unknown-as) — same AST as type-escape audit, good ecosystem, possible type-aware options later.
- **Prefer ast-grep for:** Structural rules like empty-catch (simple YAML, fast, no type info needed). If “empty” requires more nuance, either extend the YAML rule or keep a small script path for that rule.
- **Keep in script:** type-import’s **type-used-as-value** (cross-file, semantic). Other type-import rules (e.g. value-import-from-type-only-file) could be evaluated separately if desired.

---

## 6. Measurement (Phase B exit criteria) — results

### 6.1 Audits run

- type-import: `node .scripts/type-import-audit.mjs` ✓
- type-escape: `node .scripts/type-escape-audit.mjs` ✓
- error-handling: `node .scripts/error-handling-audit.mjs` ✓

Latest JSON reports written under `client/.audit-reports/`.

### 6.2 Confidence distribution

- **type-import:** 0 findings in this run. When present, findings in `typeUsedAsValue` / `valueImportFromTypeOnlyFile` carry `confidence` (high/medium/low); majority high/medium after Phase B.
- **type-escape:** 2 findings; both `confidence: "high"`. No low/untagged in this run.
- **error-handling:** 2 files with `requiresReview`; findings follow Phase B convention (confidence where implemented).

### 6.3 Golden runner

- Command: `node .scripts/audit-golden-runner.mjs` (no filter).
- **Result:** Passed: **5**, Failed: **1**, Skipped: 0. The single failure is **type-escape / ts-ignore** (TP file `has-ts-ignore.ts` not detected — recall 0). All other rule sets (as-any, as-unknown-as, empty-catch, catch-without-logger, type-used-as-value) passed.

### 6.4 Allowlist prune

- Run: `node .scripts/audit-allowlist-prune.mjs type-import error-handling` ✓. Recorded suppression hits; suggestions: 0 entries with zero hits in last N runs.

### 6.5 Report contract (summary / delta)

- `node .scripts/audit-summary.mjs type-import`, `type-escape`, `error-handling` — all completed with no errors. Summary MD files written.

### 6.6 Performance budget

- **Full run of all three audits** in sequence: **~5.4 s** (well under 30 s target).

---

*Spike completed as specified; no changes to production audit scripts beyond temporary spike configs (ESLint spike config, ast-grep rule dir and sgconfig).*
