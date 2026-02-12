# Audit Execution Order - Rationale and Recommendations

## Current Order (package.json `audit:all`)

```
Phase 0: Type Governance + Dependencies
  0. audit:type-similarity
  0b. audit:dep-freshness          (npm outdated, major/minor/patch behind)

Phase 1: Type Safety
  1. typecheck:audit

Phase 2: Code Quality
  2. audit:component-logic
  3. audit:composables-logic
  4. audit:loop-mutations
  --- Naming & constants (run in order) ---
  5. audit:naming-convention       (PascalCase, use-prefix, UPPER_SNAKE, etc.)
  6. audit:constants-consolidation (duplicates, canonical constant files)
  7. audit:hardcoding              (extract literals → constants)
  ---
  8. audit:function-complexity

Phase 3: Code Cleanup
  9. audit:pattern-detection
 10. audit:duplication
 11. audit:unused-code
 12. audit:error-handling
 13. audit:deprecation
 14. audit:security
 15. audit:todo-aging

Phase 4: Structure
 16. audit:import-graph
 17. audit:file-cohesion
 18. audit:api-contract
 18b. audit:api-versioning         (baseline diff, breaking changes)
 18c. audit:data-flow              (unvalidated req.body/params/query)
 18d. audit:bundle-size-budget     (requires prior build)

Phase 5: Testing
 19. audit:test

Cross-Audit
 20. audit:coverage-risk-crossref   (reads import-graph + test, high fan-in untested)
 21. audit:meta                    (reads all audit JSONs)
```

## Phase Descriptions

### Phase 0: Type Governance + Dependencies
- **audit:type-similarity** - Find structurally identical/similar types BEFORE typechecking
  - Recommends UNIFY, BRAND, EXTEND, or REVIEW for each group
  - Catch structural duplication before it causes type errors
- **audit:dep-freshness** - npm outdated for client and server; categorizes major/minor/patch behind

### Phase 1: Foundational (Type Safety)
- **typecheck:audit** - Fix type errors (informed by Phase 0's findings)

### Phase 2: Code Quality (Logic & Patterns)
- **audit:component-logic** - Fix component complexity (Vue SFCs with too much logic)
- **audit:composables-logic** - Fix composable complexity
- **audit:loop-mutations** - Refactor mutations to functional patterns (map/reduce/filter)
- **Naming & constants** (run in order):
  - **audit:naming-convention** - Enforce form of names (PascalCase components, use-prefix composables, UPPER_SNAKE constants, camelCase functions). Establishes the shape of constant files and exports.
  - **audit:constants-consolidation** - Find duplicate constants and canonical locations; assumes consistent naming. Optionally reads naming-convention output to flag constants files with naming violations.
  - **audit:hardcoding** - Find literals to extract to constants; new extractions should follow naming and live in canonical locations. Optionally reads constants-consolidation output for canonical constant file guidance.
- **audit:function-complexity** - Nesting depth, branch count, function length, parameter count

### Phase 3: Code Cleanup
- **audit:pattern-detection** - Detect naming/pattern duplicates
- **audit:duplication** - Remove duplicated code blocks
- **audit:unused-code** - Remove unused exports/types
- **audit:error-handling** - Silent catches, console in catch, type suppressions, general console
- **audit:deprecation** - Annotated deprecations + runtime legacy accommodation (keywords, unhelpful defaults)
- **audit:security** - Security-sensitive patterns
- **audit:todo-aging** - TODO/FIXME/HACK aging via git blame, orphaned markers

### Phase 4: Structure (Architecture)
- **audit:import-graph** - Circular dependencies, fan-in/fan-out hotspots, cross-boundary imports
- **audit:file-cohesion** - Oversized files, high export counts, mixed concerns
- **audit:api-contract** - Client/server type mismatches, unvalidated request bodies
- **audit:api-versioning** - Compares api-contract output to baseline; flags removed endpoints (breaking). Use `--accept` to update baseline.
- **audit:data-flow** - Flags route handlers using req.body/params/query without validation (Joi/Zod/sanitize). Lightweight heuristic.
- **audit:bundle-size-budget** - Measures dist/assets chunk sizes (gzip), compares to config budgets. Requires prior `npm run build`.

### Phase 5: Testing
- **audit:test** - Write tests for cleaned-up code

### Cross-Audit
- **audit:coverage-risk-crossref** - Reads import-graph + test audit; flags high fan-in files with no tests (risk score).
- **audit:meta** - Unified dashboard: health scores, hotspots, trends, deterministic exception analysis

## Rationale

### Why Type Similarity Before Typecheck?
- Identifies duplicate types whose drift CAUSES type errors
- Unifying duplicates can eliminate entire typecheck error pools
- Informs whether typecheck errors are from duplication vs actual logic bugs
- Recommends branding for structurally identical but semantically different types

### Why Code Quality Before Cleanup?
- Fix logic/complexity issues before removing duplication
- Removing duplicated bad code is wasteful - fix it first, then deduplicate
- Hardcoding removal should happen before duplication (constants can be reused)

### Why Naming & Constants in This Order?
- **naming-convention** defines the shape of constant files and exports (PascalCase, UPPER_SNAKE, etc.). Run it first so constant files have a consistent form.
- **constants-consolidation** finds duplicate constants and canonical locations; it assumes consistent naming. Run it second so we know where constants live.
- **hardcoding** finds literals to extract; new extractions should follow naming and go into the canonical constant files identified by constants-consolidation. Run it last so suggestions can reference those locations (when the constants-consolidation JSON is available).

### Why Structure After Cleanup?
- Architecture-level analysis (imports, file size, API contracts) is most meaningful after
  code quality and cleanup have been addressed
- Circular dependencies and mixed concerns show patterns that emerge from cleanup

### Why Tests Last?
- Tests should validate the final, cleaned-up code
- Writing tests before cleanup means rewriting tests after cleanup
- Test coverage is more meaningful when code is stable

### Why Meta Report After Everything?
- It aggregates results from ALL other audits
- Provides the unified dashboard and trend tracking
- Shows cross-audit correlations (files appearing in many audits)

## Features Available to All Audits

### Delta Mode (`--changed-only`)
Run any audit on only changed files:
```bash
npm run audit:hardcoding -- --changed-only
npm run audit:hardcoding -- --changed-only --base=main
```

### Exception Handling
- Inline: `// @audit-allow:<audit-type>:<ruleId> - <reason>`
- Config: `.audit-reports/<audit-name>-audit-config.json` (allowlist patterns/specific)

## Execution Flow

```
Type Gov + Deps → Typecheck → Code Quality → Cleanup → Structure → Tests → Crossref → Meta
       ↓              ↓            ↓            ↓           ↓          ↓         ↓        ↓
  TypeSim         Types       Logic       Dedupe    Architecture  Coverage   Risk     Dashboard
  DepFresh        Errors      Patterns    Legacy    Imports       Test      (fan-in   Health
  (UNIFY/BRAND)               Complexity  Security  Cohesion      audit     untested) Trends
                               Func-Cmplx  TODO-Age  API-Contract            + meta
                               Naming & constants:
                                 naming-convention → constants-consolidation → hardcoding
                                           API-Ver   DataFlow
                                           Bundle
```

## Alternative: Parallel Execution Groups

For faster execution, audits within phases can run in parallel:

```bash
# Phase 0
npm run audit:type-similarity

# Phase 1
npm run typecheck:audit

# Phase 2 (parallel; Naming & constants run in order: naming → constants-consolidation → hardcoding)
npm run audit:component-logic & npm run audit:composables-logic & \
npm run audit:loop-mutations & npm run audit:naming-convention & \
npm run audit:constants-consolidation & npm run audit:hardcoding & \
npm run audit:function-complexity & wait

# Phase 3 (parallel)
npm run audit:pattern-detection & npm run audit:duplication & \
npm run audit:unused-code & npm run audit:error-handling & \
npm run audit:deprecation & npm run audit:security & \
npm run audit:todo-aging & wait

# Phase 4 (parallel)
npm run audit:import-graph & npm run audit:file-cohesion & \
npm run audit:api-contract & wait

# Phase 5
npm run audit:test

# Meta (must be last)
npm run audit:meta
```

However, sequential execution (`audit:all`) is safer and easier to debug.
