# Audit Execution Order - Rationale and Recommendations

## Current Order (package.json `audit:all`)

```
Phase 0: Type Governance
  0. audit:type-similarity

Phase 1: Type Safety
  1. typecheck:audit

Phase 2: Code Quality
  2. audit:component-logic
  3. audit:composables-logic
  4. audit:loop-mutations
  5. audit:hardcoding
  6. audit:function-complexity     ← NEW

Phase 3: Code Cleanup
  7. audit:pattern-detection
  8. audit:duplication
  9. audit:unused-code
 10. audit:error-handling          ← NEW (merged from fallback + error-logging)
 11. audit:deprecation             ← EXPANDED (now includes runtime legacy/compat)
 12. audit:security
 13. audit:todo-aging              ← NEW

Phase 4: Structure
 14. audit:import-graph            ← NEW
 15. audit:file-cohesion           ← NEW
 16. audit:api-contract            ← NEW

Phase 5: Testing
 17. audit:test

Cross-Audit
 18. audit:meta                    ← NEW (reads all audit JSONs)
```

## Phase Descriptions

### Phase 0: Type Governance (Structural Similarity)
- **audit:type-similarity** - Find structurally identical/similar types BEFORE typechecking
  - Recommends UNIFY, BRAND, EXTEND, or REVIEW for each group
  - Catch structural duplication before it causes type errors

### Phase 1: Foundational (Type Safety)
- **typecheck:audit** - Fix type errors (informed by Phase 0's findings)

### Phase 2: Code Quality (Logic & Patterns)
- **audit:component-logic** - Fix component complexity (Vue SFCs with too much logic)
- **audit:composables-logic** - Fix composable complexity
- **audit:loop-mutations** - Refactor mutations to functional patterns (map/reduce/filter)
- **audit:hardcoding** - Extract hardcoded values to constants/config
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

### Phase 5: Testing
- **audit:test** - Write tests for cleaned-up code

### Cross-Audit: Meta Report
- **audit:meta** - Unified dashboard: health scores, hotspots, trends, exception creep

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
Type Governance → Typecheck → Code Quality → Cleanup → Structure → Tests → Meta
      ↓               ↓           ↓             ↓          ↓          ↓       ↓
  Structural       Types       Logic        Dedupe     Architecture Coverage Dashboard
  Similarity       Errors      Patterns     Legacy     Imports      Valid.   Health
  (UNIFY/BRAND)               Complexity   Security   Cohesion              Trends
                              Func-Cmplx   TODO-Age   API-Contract          Hotspots
```

## Alternative: Parallel Execution Groups

For faster execution, audits within phases can run in parallel:

```bash
# Phase 0
npm run audit:type-similarity

# Phase 1
npm run typecheck:audit

# Phase 2 (parallel)
npm run audit:component-logic & npm run audit:composables-logic & \
npm run audit:loop-mutations & npm run audit:hardcoding & \
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
