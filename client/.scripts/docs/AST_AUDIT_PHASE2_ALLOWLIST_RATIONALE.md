# Phase 2 — Allowlist Tuning Rationale (AST Audit Refactor)

After migrating type-import, loop-mutation, error-handling, naming-convention, and type-escape to AST-based detection, allowlist entries that existed only to suppress **regex heuristic false positives** were reviewed.

## type-import

- **Removed (13 entries):** All `type-used-as-value` specific entries. With AST, the audit uses identifier usage-context analysis and no longer flags symbols that are used only in type positions (e.g. in type assertions, return types, parameter types). Those entries were noise-workarounds for the previous regex-based “symbol in value position” heuristic.
- **Kept (1 entry):** `value-import-from-type-only-file` for `client/src/views/admin/AdminPanel.vue` — intentional architectural exception (Vue SFC default export from type-only file).
- **Net reduction:** 13 entries.

## type-escape, loop-mutation, error-handling, naming-convention

- **No changes.** type-escape allowlist was already empty. loop-mutation, error-handling, and naming-convention entries are intentional policy/architectural exceptions (Vue patterns, logger exclusions, Sequelize/convention). No entries were removed as regex-only workarounds.

## Verification

- Run `node .scripts/type-import-audit.mjs`: `type-used-as-value` remains 0; `value-import-from-type-only-file` unchanged.
- No regression in audit signal quality for type-import.
