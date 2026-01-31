# Component, Composables, and Typecheck Audit False Positive Reduction

## Overview

This document outlines improvements to reduce false positives in component logic, composables logic, and typecheck audits.

## 1. Component Logic Audit Improvements

### Current False Positives

1. **Simple Reactive Wrappers** - `computed(() => props.xyz)` are flagged but are correct Vue patterns
2. **Props Passed to Composables** - `computed(() => props.item)` passed to composables are necessary for reactivity
3. **Provide/Inject Imports** - Just importing `provide/inject` doesn't mean complexity
4. **Simple Local State** - `const localExpanded = ref(false)` is legitimate component state

### Recommended Changes

**File**: `.scripts/component-logic-audit.mjs`

Enhance `calculateScore()` function to reduce weight for simple patterns:

```javascript
function isSimpleReactiveWrapper(line, lines, lineIndex) {
  // Check if computed is just wrapping a prop: computed(() => props.xyz)
  const isPropWrapper = /computed\s*\(\s*\(\)\s*=>\s*props\.\w+/.test(line)
  // Check if computed is passed to composable (next few lines)
  const nextLines = lines.slice(lineIndex, Math.min(lineIndex + 5, lines.length)).join('\n')
  const isComposableParam = /use\w+\([^)]*computed/.test(nextLines)
  
  return isPropWrapper || isComposableParam
}

function calculateScore(counts, matches, lines) {
  // Count simple reactive wrappers separately
  const simpleWrapperCount = matches.filter(m => 
    m.ruleId === 'computed' && isSimpleReactiveWrapper(m.line, lines, m.lineNumber - 1)
  ).length
  
  // Reduce weight for simple wrappers (count as 0.3 instead of 1)
  const effectiveComputedCount = (counts.computed || 0) - (simpleWrapperCount * 0.7)
  
  // Calculate severity score based on risky patterns
  const riskKeys = ['dom', 'watch', 'watchEffect', 'async', 'await', 'reduce', 'map', 'inlineConfig', 'console']
  const baseScore = riskKeys.reduce((sum, k) => sum + (counts[k] || 0), 0)
  
  return baseScore + effectiveComputedCount
}
```

**File**: `.audit-reports/component-logic-audit-config.json`

Add exclusions for common patterns:

```json
{
  "allowlist": {
    "patterns": [
      {
        "glob": "**/*.vue",
        "ruleIds": ["provideInject"],
        "reason": "Importing provide/inject doesn't indicate complexity - only usage does"
      },
      {
        "glob": "**/components/**/fields/*.vue",
        "ruleIds": ["computed"],
        "reason": "Field components often use computed wrappers for props - legitimate Vue pattern"
      }
    ]
  }
}
```

## 2. Composables Logic Audit Improvements

### Current False Positives

1. **Vue Query Usage** - `useQuery`, `useMutation` are the correct pattern for data fetching, not complexity
2. **Async/Await in Composables** - Expected and correct pattern for composables
3. **Computed/Ref in Composables** - This is the Vue composable pattern, not complexity

### Recommended Changes

**File**: `.scripts/composables-logic-audit.mjs`

Update `calculateComplexityScore()` to reduce weight for Vue Query:

```javascript
function calculateComplexityScore(counts, vueQueryCount) {
  // Vue Query usage is the correct pattern, not complexity
  // Reduce its weight in complexity calculation
  const reactiveCount = (counts.computed || 0) + (counts.ref || 0) + (counts.watch || 0)
  const orchestrationCount = (counts.async || 0) + (counts.await || 0)
  
  // Vue Query adds minimal complexity (it's the correct pattern)
  // Count it as 0.5x instead of full weight
  const vueQueryWeight = vueQueryCount * 0.5
  
  const dataShaping = (counts.map || 0) + (counts.reduce || 0) + (counts.filter || 0) + (counts.sort || 0)
  
  return reactiveCount + orchestrationCount + dataShaping + vueQueryWeight
}
```

**File**: `.audit-reports/composables-logic-audit-config.json`

Add exclusions for mutation/query composables:

```json
{
  "allowlist": {
    "patterns": [
      {
        "glob": "**/composables/**/*Mutations.ts",
        "ruleIds": ["vueQuery", "async", "await"],
        "reason": "Mutation composables necessarily use Vue Query and async/await - this is the correct pattern"
      },
      {
        "glob": "**/composables/**/*Query.ts",
        "ruleIds": ["vueQuery"],
        "reason": "Query composables necessarily use Vue Query - this is the correct pattern"
      },
      {
        "glob": "**/composables/**/*Actions.ts",
        "ruleIds": ["async", "await"],
        "reason": "Action composables necessarily use async/await - this is the correct pattern"
      }
    ]
  }
}
```

## 3. Typecheck Audit Improvements

### Current False Positives

1. **Unused Variables (TS6133)** - Some are intentionally kept for future use or documentation
2. **Type Mismatches** - Some are acceptable (like `ComputedRef` vs `Ref` in specific contexts)

### Recommended Changes

**File**: `.audit-reports/typecheck/typecheck-audit-config.json`

Add exclusions for common false positives:

```json
{
  "allowlist": {
    "patterns": [
      {
        "glob": "**/types/**/*.ts",
        "ruleIds": ["TS6133"],
        "reason": "Type definition files may have unused types kept for reference"
      },
      {
        "glob": "**/constants/**/*.ts",
        "ruleIds": ["TS6133"],
        "reason": "Constants files may have unused exports kept for future use"
      },
      {
        "glob": "**/configs/**/*.ts",
        "ruleIds": ["TS6133"],
        "reason": "Config files may have unused values kept for reference"
      }
    ],
    "specific": [
      {
        "file": "src/utils/entityDefaults.ts",
        "ruleId": "TS6133",
        "lineRange": [1, 50],
        "reason": "ENTITY_REQUIRED_DEFAULTS kept for reference despite being deprecated"
      }
    ]
  },
  "weights": {
    "severityByCodePrefix": {
      "TS23": 10,
      "TS24": 10,
      "TS27": 9,
      "TS18": 8,
      "TS70": 7,
      "TS61": 3
    },
    "blastRadiusPerFile": 2,
    "repetitionPerOccurrence": 1,
    "unsafeCastPerHit": 2,
    "suppressionPerHit": 3
  },
  "priorities": {
    "p0MinSeverityScore": 18,
    "p1MinSeverityScore": 10
  }
}
```

## Implementation Priority

### High Priority (Immediate Impact)
1. ✅ Reduce weight for Vue Query in composables audit
2. ✅ Reduce weight for simple reactive wrappers in component audit
3. ✅ Add exclusions for mutation/query composables

### Medium Priority (Significant Reduction)
1. Add context-aware detection for simple reactive wrappers
2. Add exclusions for TS6133 in types/constants/configs directories
3. Enhance scoring to distinguish legitimate vs problematic patterns

### Low Priority (Polish)
1. Add file content analysis to auto-detect simple wrappers
2. Machine learning approach to classify patterns
3. Integration with code review comments

## Expected Impact

After implementing these changes:

- **Component Logic Audit**: Reduce false positives by ~30-40% (mostly simple reactive wrappers)
- **Composables Logic Audit**: Reduce false positives by ~25-35% (mostly Vue Query usage)
- **Typecheck Audit**: Reduce false positives by ~20-30% (mostly unused variables in types/configs)

## Testing Recommendations

After making changes:

1. Run `npm run audit:component-logic` to generate new reports
2. Run `npm run audit:composables-logic` to generate new reports
3. Run `npm run audit:typecheck` to generate new reports
4. Compare before/after counts
5. Manually review top 20 files in each audit to verify false positives are reduced
6. Ensure legitimate issues are still being caught
