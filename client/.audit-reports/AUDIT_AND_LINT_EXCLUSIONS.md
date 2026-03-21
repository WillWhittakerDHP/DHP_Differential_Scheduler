# Audit and Lint Exclusions

We do not touch: test files, code we did not write (e.g. Vuetify core), or build output.

## Global audit exclusions

Source: client/.audit-reports/audit-global-config.json, key globalExclusions.

Used by all audits that use listAuditFiles() from shared-audit-utils.mjs (they skip paths where isGloballyExcluded(repoPath) is true). Lint and typecheck audits also call isGloballyExcluded when iterating.

Patterns include: **/__tests__/**, **/*.test.*, **/*.spec.* (test files), **/@core/**, **/@layouts/** (core/library), **/node_modules/**, **/dist/**, **/.scripts/**, etc.

## ESLint ignores (aligned)

Source: client/eslint.config.js, ignores array.

ESLint is aligned with the same do-not-touch set: dist/**, fixtures/**, src/@core/**, src/@layouts/**, and all src test patterns (__tests__, *.test.*, *.spec.*). So we do not lint test files, core/layout code, or build output.

## Composable-inventory-audit

This audit has its own walkDir and does not use listAuditFiles. To align with global exclusions: import isGloballyExcluded from shared-audit-utils.mjs and in walkDir after the EXCLUDED_PATTERNS check add: if (isGloballyExcluded(repoPath)) continue.
