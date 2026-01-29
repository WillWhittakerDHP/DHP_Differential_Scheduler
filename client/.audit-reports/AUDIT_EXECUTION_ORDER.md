# Audit Execution Order - Rationale and Recommendations

## Current Order (package.json)

```
1. typecheck:audit
2. audit:component-logic
3. audit:composables-logic
4. audit:loop-mutations
5. audit:hardcoding
6. audit:duplication
7. audit:test
8. audit:fallback
9. audit:unused-code
```

## Recommended Order

### Phase 1: Foundational (Type Safety)
1. **typecheck:audit** - Fix type errors first (foundational - everything depends on types)

### Phase 2: Code Quality (Logic & Patterns)
2. **audit:component-logic** - Fix component complexity
3. **audit:composables-logic** - Fix composable complexity
4. **audit:loop-mutations** - Refactor mutations to functional patterns
5. **audit:hardcoding** - Extract hardcoded values to constants

### Phase 3: Code Cleanup (Duplication & Unused Code)
6. **audit:duplication** - Remove duplicated code
7. **audit:unused-code** - Remove unused exports/types
8. **audit:fallback** - Review and fix fallback patterns

### Phase 4: Testing (Write Tests Last)
9. **audit:test** - Write tests for cleaned-up code

## Rationale

### Why Typecheck First?
- Type errors prevent other audits from running correctly
- Type safety is foundational - other improvements depend on correct types
- Type errors can cascade and create false positives in other audits

### Why Code Quality Before Cleanup?
- Fix logic/complexity issues before removing duplication
- Removing duplicated bad code is wasteful - fix it first, then deduplicate
- Hardcoding removal should happen before duplication (constants can be reused)

### Why Cleanup Before Tests?
- Don't write tests for code you're going to delete
- Don't write tests for duplicated code (write once after deduplication)
- Tests should cover the final, cleaned-up codebase

### Why Tests Last?
- Tests should validate the final, cleaned-up code
- Writing tests before cleanup means rewriting tests after cleanup
- Test coverage is more meaningful when code is stable

## Proposed New Order

```bash
"audit:all": "npm run typecheck:audit && npm run audit:component-logic && npm run audit:composables-logic && npm run audit:loop-mutations && npm run audit:hardcoding && npm run audit:duplication && npm run audit:unused-code && npm run audit:fallback && npm run audit:test && npm run typecheck:summary && npm run audit:component-logic:summary && npm run audit:composables-logic:summary && npm run audit:loop-mutations:summary && npm run audit:hardcoding:summary && npm run audit:duplication:summary && npm run audit:unused-code:summary && npm run audit:test:summary"
```

## Benefits

1. **Efficiency**: Fix issues in order of dependency
2. **Accuracy**: Later audits see cleaner code (fewer false positives)
3. **Test Quality**: Tests written for final code, not intermediate states
4. **Reduced Rework**: Don't write tests for code that gets deleted/refactored

## Execution Flow

```
Typecheck → Code Quality → Cleanup → Tests
    ↓            ↓            ↓         ↓
  Types      Logic       Dedupe    Coverage
  Errors     Patterns    Unused    Validation
```

## Alternative: Parallel Execution Groups

For faster execution, audits within phases could run in parallel:

```bash
# Phase 1: Typecheck (must run first)
npm run typecheck:audit

# Phase 2: Code Quality (can run in parallel)
npm run audit:component-logic & \
npm run audit:composables-logic & \
npm run audit:loop-mutations & \
npm run audit:hardcoding & \
wait

# Phase 3: Cleanup (can run in parallel)
npm run audit:duplication & \
npm run audit:unused-code & \
npm run audit:fallback & \
wait

# Phase 4: Tests (run last)
npm run audit:test

# Summaries (can run in parallel)
npm run typecheck:summary & \
npm run audit:component-logic:summary & \
...
```

However, sequential execution is safer and easier to debug.
