# Audit Exception Handling

This document explains how to add, review, and remove exceptions from the audit tools.

## Philosophy

Exceptions should be:
- **Visible** - Tracked in audit reports, not hidden
- **Justified** - Require a reason explaining why it's acceptable
- **Auditable** - Can review exception trends over time for "exception creep"
- **Easy to modify** - Simple to add when legitimate, easy to remove when stale

## Two Ways to Add Exceptions

### 1. Inline Comments (Recommended for One-offs)

Add a comment on the line before (or same line as) the flagged code:

```typescript
// @audit-allow:hardcoding:entityKeyString - Entity routing by design, see ENTITY_CONFIG
const entityType = 'blockInstance'

// @audit-allow:loop-mutation:push - Building Vue reactive array, mutation is required
items.forEach(item => reactiveArray.value.push(transform(item)))

// @audit-allow:typecheck:TS2322 - Third-party types are incomplete
const result = apiResponse as unknown as ExpectedType
```

**Format:** `// @audit-allow:<auditType>:<ruleId> - <reason>`

Where:
- `<auditType>` = `hardcoding`, `loop-mutation`, or `typecheck`
- `<ruleId>` = The specific rule (e.g., `entityKeyString`, `push`, `TS2322`)
- `<reason>` = Why this exception is legitimate (required!)

### 2. Config File (Recommended for Patterns)

For broad patterns that apply to many files, use the config JSON files:

**Location:**
- `.audit/hardcoding-audit-config.json`
- `.audit/loop-mutation-audit-config.json`
- `.typecheck/typecheck-audit-config.json`

**Pattern-based example:**
```json
{
  "allowlist": {
    "patterns": [
      {
        "glob": "**/constants/**/*.ts",
        "ruleIds": ["entityKeyString", "caseString"],
        "reason": "Constants files are the canonical source for hardcoded values"
      }
    ]
  }
}
```

**Specific file/line example:**
```json
{
  "allowlist": {
    "specific": [
      {
        "file": "src/api/legacyAdapter.ts",
        "ruleId": "entityKeyString",
        "lineRange": [50, 100],
        "reason": "Legacy adapter requires explicit entity mapping - planned for removal in v2"
      }
    ]
  }
}
```

## When to Use Each Approach

| Scenario | Use |
|----------|-----|
| One-off exception with specific context | Inline comment |
| Known pattern across many files | Config pattern |
| Temporary workaround with known fix date | Inline comment (easier to find/remove) |
| Architectural decision affecting whole category | Config pattern |
| Third-party library quirk | Config pattern by glob |

## Reviewing Exceptions

The audit reports include an "Allowed Exceptions" section that shows:
- All currently allowed items
- The reason for each
- The source (inline vs config pattern vs specific)

**Periodic review questions:**
1. Is this exception still valid? (Code may have changed)
2. Is the reason still accurate?
3. Has the exception been duplicated unnecessarily?
4. Are there too many exceptions in one area? (May indicate deeper issue)

## Removing Exceptions

### Inline comments
Simply delete the `// @audit-allow:...` comment line.

### Config patterns
Remove the entry from the `patterns` or `specific` array in the config JSON.

## Rule IDs by Audit Type

### hardcoding-audit
- `switchEntityKey` - switch(entityKey) statements
- `switchTypeLike` - switch on type/entity/key variables
- `caseString` - case 'string': statements
- `fieldEqualsString` - field === 'string' comparisons
- `inlineLabelMap` - { key: "Label", ... } inline objects
- `omitFieldsArray` - omitFields: [...] arrays
- `headersArray` - headers: [...] arrays
- `magicLabel` - Label-like string literals
- `entityKeyString` - Entity key strings from entities.ts

### loop-mutation-audit
- `forEach` - .forEach() calls
- `forLoop` - traditional for loops
- `forOf` - for...of loops
- `forIn` - for...in loops
- `while` / `doWhile` - while loops
- `push` / `pop` / `shift` / `unshift` / `splice` - array mutators
- `sort` / `reverse` - in-place array operations
- `assignIndex` - arr[i] = ... assignments
- `assignProp` - obj.prop = ... assignments
- `delete` - delete statements

### typecheck-audit
Use TypeScript error codes: `TS2322`, `TS2345`, `TS2339`, etc.
