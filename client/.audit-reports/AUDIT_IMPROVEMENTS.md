# Audit False Positive Reduction Suggestions

This document outlines suggestions to reduce false positives in audit reports without requiring inline exceptions in every file.

## Overview

The audits are flagging legitimate patterns that should be excluded at the configuration level rather than requiring inline exceptions. This document provides specific recommendations for each audit type. The **hardcoding**, **constants-consolidation**, and **naming-convention** audits are grouped as the "Naming & constants" pipeline; see [AUDIT_EXECUTION_ORDER.md](AUDIT_EXECUTION_ORDER.md) for run order and rationale.

## 1. Hardcoding Audit Improvements

### Current False Positives

1. **Constants/Config Files** - Files like `businessControlsTabStrings.ts`, `selectableDisplayConfig.ts` are flagged for containing hardcoded strings, but these ARE the canonical source of truth
2. **Slot Names** - Vue slot names like `<slot name="description">` are flagged as `entityKeyString` but are legitimate template syntax
3. **Config Files Directory** - All files in `configs/` directory are intentional sources of hardcoded values

### Recommended Config Changes

**File**: `.audit-reports/hardcoding-audit-config.json`

```json
{
  "allowlist": {
    "patterns": [
      {
        "glob": "**/configs/**/*.{ts,js}",
        "ruleIds": ["magicLabel", "caseString"],
        "reason": "Config files are intentional sources of hardcoded values - canonical source of truth"
      },
      {
        "glob": "**/constants/**/*.ts",
        "ruleIds": ["*"],
        "reason": "Constants files are the canonical source for hardcoded values - this is by design"
      },
      {
        "glob": "**/*.vue",
        "ruleIds": ["entityKeyString"],
        "reason": "Vue slot names and template attributes legitimately use entity keys as strings"
      },
      {
        "glob": "**/utils/logger.ts",
        "ruleIds": ["caseString"],
        "reason": "Log level strings are standard and intentional - part of logger API"
      },
      {
        "glob": "**/types/**/*.ts",
        "ruleIds": ["entityKeyString", "caseString"],
        "reason": "Type definitions legitimately use string literals for type unions"
      }
    ]
  }
}
```

### Script Enhancement Suggestions

**File**: `.scripts/hardcoding-audit.mjs`

Add logic to detect constants/config files more intelligently:

```javascript
function isConstantsFile(repoPath, lines) {
  const hasConstExport = lines.some(l => 
    /export\s+(const|default)\s+\w+\s*=\s*\{/.test(l) ||
    /export\s+const\s+\w+\s*=\s*\{/.test(l)
  )
  const isInConfigsDir = repoPath.includes('/configs/')
  const isInConstantsDir = repoPath.includes('/constants/')
  const filenameIndicatesConfig = /(Config|Constants|Strings|Labels)\.(ts|js)$/.test(repoPath)
  
  return isInConfigsDir || isInConstantsDir || (hasConstExport && filenameIndicatesConfig)
}

if (isConstantsFile(repoPath, lines) && ruleId === 'magicLabel') {
  continue // Skip this match
}
```

## 2. Loop Mutation Audit Improvements

### Current False Positives

1. **Vue Ref Assignments** - `ref.value = ...` is flagged as `assignProp` but is legitimate Vue reactive state
2. **Vue Template Directives** - `v-model`, `@keyup.enter` are flagged as `assignProp` but are template syntax
3. **Vue Component Files** - Many `assignProp` hits in `.vue` files are Vue reactive patterns, not mutations
4. **Set/Map Operations** - `Set.add()`, `Map.set()` are legitimate for Set/Map operations

### Recommended Config Changes

**File**: `.audit-reports/loop-mutation-audit-config.json`

```json
{
  "allowlist": {
    "patterns": [
      {
        "glob": "**/*.vue",
        "ruleIds": ["assignProp"],
        "reason": "Vue component files use ref.value assignments and template directives - legitimate reactive patterns"
      },
      {
        "glob": "**/composables/**/*.ts",
        "ruleIds": ["assignProp"],
        "reason": "Vue composables legitimately mutate reactive state (ref.value = ...) - this is the Vue reactive pattern"
      },
      {
        "glob": "**/views/**/*.vue",
        "ruleIds": ["assignProp"],
        "reason": "Vue views use ref.value assignments for reactive state - legitimate Vue pattern"
      },
      {
        "glob": "**/components/**/*.vue",
        "ruleIds": ["assignProp"],
        "reason": "Vue components use ref.value assignments for reactive state - legitimate Vue pattern"
      }
    ]
  }
}
```

### Script Enhancement Suggestions

**File**: `.scripts/loop-mutation-audit.mjs`

Enhance `isLegitimateMutation` function:

```javascript
function isLegitimateMutation(mutationLine, mutationRuleId, forEachLine, repoPath) {
  if (mutationRuleId === 'assignProp' && /\.value\s*=/.test(mutationLine)) {
    return true
  }
  
  if (mutationRuleId === 'assignProp' && /v-model|@\w+|:[\w-]+=/.test(mutationLine)) {
    return true
  }
  
  if (mutationRuleId === 'assignProp' && /\.(add|set|delete|clear)\s*\(/.test(mutationLine)) {
    return true
  }
  
  if (mutationRuleId === 'assignProp' && repoPath.endsWith('.vue')) {
    if (/\.value\s*=|v-model|@\w+|:[\w-]+=/.test(mutationLine)) {
      return true
    }
  }
  
  if (/MutationObserver|querySelector|appendChild|removeChild/.test(mutationLine)) {
    return true
  }
  
  if (/themeConfig|themes\.value|colors\[/.test(mutationLine)) {
    return true
  }
  
  if (mutationRuleId === 'assignProp' && /\[.*\.\.\..*\]/.test(mutationLine)) {
    return true
  }
  
  if (mutationRuleId === 'assignProp' && /\.(filter|map|reduce|flatMap)\s*\(/.test(mutationLine)) {
    return true
  }
  
  return false
}
```

Also update the `assignProp` rule detection to be more context-aware:

```javascript
{ 
  id: 'assignProp', 
  label: 'obj.prop = ...', 
  test: (l) => {
    if (/v-model|@\w+|:[\w-]+=/.test(l)) return false
    if (/\.value\s*=/.test(l)) return true
    return /\.\w+\s*=/.test(l) && !/\/\/|['"]/.test(l.split('=')[0])
  }
}
```

## 3. Component Logic Audit Improvements

### Current False Positives

1. **Reactive Wrappers** - Components wrapping props in `computed(() => props.xyz)` are flagged, but this is correct Vue pattern
2. **Composable Parameters** - Computed properties passed to composables are flagged, but necessary for reactivity

### Recommended Approach

The component logic audit is actually working correctly - it's flagging complexity. However, we could:

1. **Reduce scoring weight** for computed properties that are simple reactive wrappers:
   - If computed is just `computed(() => props.xyz)`, count as 0.5 instead of 1
   - If computed is passed directly to composable, count as 0.5 instead of 1

2. **Add context detection** in `.scripts/component-logic-audit.mjs`:

```javascript
function isSimpleReactiveWrapper(line, lines, lineIndex) {
  const isPropWrapper = /computed\s*\(\s*\(\)\s*=>\s*props\.\w+/.test(line)
  const nextLines = lines.slice(lineIndex, lineIndex + 5).join('\n')
  const isComposableParam = /use\w+\(.*computed/.test(nextLines)
  
  return isPropWrapper || isComposableParam
}

const computedCount = matches.filter(m => m.ruleId === 'computed').length
const simpleWrapperCount = matches.filter(m => 
  m.ruleId === 'computed' && isSimpleReactiveWrapper(m.line, lines, m.lineNumber - 1)
).length
const effectiveComputedCount = computedCount - (simpleWrapperCount * 0.5)
```

## 4. General Improvements

### Better File Type Detection

Add helper functions to detect file purposes:

```javascript
function isConstantsFile(repoPath) {
  return repoPath.includes('/constants/') || 
         repoPath.includes('/configs/') ||
         /(Config|Constants|Strings|Labels)\.(ts|js)$/.test(repoPath)
}

function isVueComponent(repoPath) {
  return repoPath.endsWith('.vue')
}

function isTypeDefinition(repoPath) {
  return repoPath.includes('/types/') || repoPath.includes('/@types/')
}
```

### Context-Aware Rule Application

Apply rules differently based on file type:

```javascript
function shouldApplyRule(ruleId, repoPath, line) {
  if (ruleId === 'magicLabel' && isConstantsFile(repoPath)) {
    return false
  }
  
  if (ruleId === 'assignProp' && isVueComponent(repoPath) && /\.value\s*=/.test(line)) {
    return false
  }
  
  if (ruleId === 'entityKeyString' && isVueComponent(repoPath) && /<slot/.test(line)) {
    return false
  }
  
  return true
}
```

## 5. Implementation Priority

### High Priority (Immediate Impact)

1. **Exclude Vue ref assignments** from loop mutation audit (`assignProp` rule)
2. **Exclude configs/constants directories** from hardcoding audit (`magicLabel` rule)
3. **Exclude Vue template directives** from loop mutation audit

### Medium Priority (Significant Reduction)

1. **Enhance `isLegitimateMutation`** function with Vue-specific patterns
2. **Add file type detection** helpers
3. **Exclude slot names** from entityKeyString rule in Vue files

### Low Priority (Polish)

1. **Reduce scoring weight** for simple reactive wrappers in component logic audit
2. **Add context-aware rule application**
3. **Better detection of constants files** by content analysis

## 6. Expected Impact

After implementing these changes:

- **Hardcoding Audit**: Reduce false positives by ~60-70% (mostly config files)
- **Loop Mutation Audit**: Reduce false positives by ~50-60% (mostly Vue reactive patterns)
- **Component Logic Audit**: Slight reduction (~10-15%) for better accuracy

## 7. Testing Recommendations

After making changes:

1. Run `npm run audit:all` to generate new reports
2. Compare before/after counts
3. Manually review top 20 files in each audit to verify false positives are reduced
4. Ensure legitimate issues are still being caught

## 8. Maintenance

- Review audit configs quarterly
- Add new patterns to `isLegitimateMutation` as new false positives are discovered
- Document any new patterns in this file
