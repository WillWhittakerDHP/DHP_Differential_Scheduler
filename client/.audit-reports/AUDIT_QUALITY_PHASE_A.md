# Audit quality — Phase A (operating model and policy)

## Operating model

### Running audits and summaries

- **Audits**: Run per-audit scripts (e.g. `node .scripts/type-import-audit.mjs`) from `client/`. Output: `.audit-reports/<audit>-audit.json` and `.audit-reports/<audit>-audit.md`.
- **Summaries**: Run `node .scripts/audit-summary.mjs <audit-type>`. Reads the audit JSON and writes `.audit-reports/<audit>-audit-summary.md`. Prepends standard AI-instruction header.
- **Delta**: If `.audit-reports/<audit>-audit-previous.json` exists, the summary compares current vs previous findings (identity: file, lineNumber, ruleId, snippet) and renders delta-first: New → Regressed → Unchanged → Resolved, with per-rule counts. No automatic copy of current to previous; create/update `*-audit-previous.json` manually or via CI if you want delta on the next run.
- **Golden samples**: Fixtures under `client/fixtures/audits/<auditType>/<ruleId>/tp/` and `fp/`. Run `node .scripts/audit-golden-runner.mjs` to assert TP detected and FP not detected; output: `.audit-reports/audit-golden-results.json` and `.audit-reports/audit-golden-results.md`. Use `AUDIT_FIXTURE_DIRS` when running audits to restrict scanning to fixture dirs.
- **Allowlist pruning**: After running audits that emit `suppressionHits` (e.g. type-import, error-handling), run `node .scripts/audit-allowlist-prune.mjs [audit-type ...]` to record hits and generate `.audit-reports/allowlist-prune-suggestions.json` and `.md`. Entries with zero hits in the last N runs (default 5) are suggested for remove-review. No automatic removal.

### Finding metadata (Phase A schema)

Findings may include optional, non-breaking fields:

- **confidence**: `high` | `medium` | `low` (see Confidence scoring policy below).
- **detectionStage**: `detector` | `validator` (two-phase: broad candidate vs precision pass).
- **whyFlagged**: Short machine- or human-readable reason.
- **baselineState**: `new` | `regressed` | `unchanged` | `resolved` (set during delta comparison).
- **suppressionStatus**: `unsuppressed` | `suppressedByPattern` | `suppressedBySpecific` | `suppressedInline`.

Existing report shape and `ruleId`/allowlist contracts are unchanged.

---

## Confidence scoring policy

Deterministic rules for assigning **confidence** to findings:

| Level   | Criteria |
|--------|----------|
| **High**   | Structural AST plus narrow context checks (e.g. type-used-as-value with AST value-position check). |
| **Medium** | AST-based detection without full context proof (e.g. pattern in AST but not validated in broader scope). |
| **Low**    | Regex or broad heuristic only (e.g. line-based regex, no AST). |

Use in summaries: de-emphasize low-confidence debt; prioritize high-confidence regressions when reviewing deltas.

---

## Phase B entry criteria (planned)

Phase B will add **semantic precision and deeper analysis** on top of Phase A. Success criteria for entering Phase B:

- Phase A exit criteria are met (see plan): schema and summaries without breakage, delta and golden runner and two-phase and pruning in place).
- **Phase B goals**:
  - TypeChecker-backed semantic validation (TypeScript `Program`/`TypeChecker`).
  - Rich type-position vs value-position resolution for import/type rules.
  - Scope/control-flow/data-flow checks for error and mutation rules.
  - Optional pilot: selected rules as ESLint custom rules (`@typescript-eslint/parser` + `@typescript-eslint/utils`).
  - Optional: structural-rule pilot (e.g. ast-grep or Semgrep) for declarative policy.
- **Phase B success target**: Measurable drop in low-confidence findings, further allowlist reduction, improved precision on noisy rule families without report contract breakage.

---

*Generated as part of Phase A audit quality work. See `.cursor/plans/` for the full Phase A plan.*
