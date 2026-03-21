# Comment Tools

Automated tools for auditing and cleaning up comments in your codebase.

## Overview

These tools help maintain high-quality, meaningful comments by:
- **Auditing** - Analyzing all comments and generating a detailed report
- **Cleaning** - Removing obvious/redundant comments while preserving valuable insights

## Tools

### 1. Comment Audit (`audit-comments.mjs`)

Analyzes all comments in the codebase and generates a deterministic report showing what would be removed, compressed, or kept.

**Usage:**
```bash
npm run comments:audit
# or
node scripts/comment-tools/audit-comments.mjs
```

**Output:**
- `COMMENT_AUDIT_REPORT.md` - Human-readable report with examples
- `comment-audit-data.json` - Machine-readable data for programmatic use

**What it shows:**
- Total comments by type (WHY, PATTERN, regular, etc.)
- How many would be removed vs. kept
- Examples of each category
- Files with the most comments
- Detailed per-file breakdown

### 2. Comment Cleanup (`cleanup-comments.mjs`)

Removes obvious/redundant comments based on the same criteria as the audit tool.

**Usage:**
```bash
npm run comments:cleanup
# or
node scripts/comment-tools/cleanup-comments.mjs
```

**⚠️ IMPORTANT:** Run `comments:audit` first to review what will be removed!

## Comment Classification

### What Gets REMOVED

**Obvious actions:**
- "gets", "fetches", "loads", "saves", "returns"
- "creates", "updates", "deletes"

**Generic verbs:**
- "ensures", "provides", "handles", "manages"

**Vague references:**
- "this function", "the value", "it does"
- "use composable", "use function", "use pattern"

**Common patterns:**
- "Inject loaded state..." (obvious from code)
- "Sync local data to parent..." (obvious from code)
- "Assign function to ref..." (obvious from code)

**Session/Phase notes:**
- `// Session X.Y.Z: ...` (temporary development notes)
- `// Phase X.Y: ...` (temporary development notes)

### What Gets KEPT

**Technical insights:**
- Specific transformations: "converts RFC3339 to ISO format"
- Problem prevention: "prevents race condition in async calls"
- Causal explanations: "because Vue reactivity doesn't track..."

**Architectural decisions:**
- Pattern explanations with "why"
- Architecture, approach, strategy details
- Technical concepts (reactivity, lifecycle, state management)

**Important context:**
- Workarounds, hacks, temporary fixes
- Edge cases, corner cases
- Performance optimizations
- Security concerns
- Limitations, constraints

**Protected comments:**
- TODO, FIXME
- Feature references (e.g., "Feature 4")
- Future work, plugin points
- NOTE: with important warnings

## Value Criteria

### For Typed Comments (WHY/PATTERN)

Must be **substantial** (>20 chars) AND contain **valuable patterns**:
- Specific transformations or conversions
- Problem prevention
- Technical concepts (reactivity, lifecycle, state)
- Specific formats/standards (RFC3339, UTC, ISO)

### For Regular Comments

Must be **substantial** (>25 chars) AND contain **valuable patterns**:
- Workarounds, bugs, issues
- Performance considerations
- Concurrency concerns
- Security notes
- Limitations or constraints
- Explanations of "why"

## Examples

### Before Cleanup

```typescript
// LEARNING: Inject loaded wizard state for populating form fields
// WHY: Enables populating contact information from loaded appointment
// PATTERN: Inject provided loadedWizardState and pass to composable
const loadedWizardState = inject('loadedWizardState');

// LEARNING: Use contacts step data composable for contact form state management
// WHY: Extracts contact form state and loaded wizard state handling from component
// PATTERN: Composable handles all contact form data and optional section visibility
const { stepData, validate } = useContactsStepData();
```

**Result:** 6 comments removed (all obvious)

### After Cleanup

```typescript
const loadedWizardState = inject('loadedWizardState');
const { stepData, validate } = useContactsStepData();
```

Much cleaner! The code is self-explanatory.

### Example of Kept Comment

```typescript
/**
 * WHY: Vue's reactivity doesn't track property access through Proxy getters,
 * so we need to explicitly trigger dependency tracking for nested objects.
 * This prevents stale renders when deeply nested state changes.
 */
function trackNestedObject(obj) {
  // implementation...
}
```

**Result:** Comment kept (explains non-obvious Vue reactivity behavior)

## Workflow

### First Time Use

1. **Audit first:**
   ```bash
   npm run comments:audit
   ```

2. **Review the report:**
   - Open `COMMENT_AUDIT_REPORT.md`
   - Check examples of what will be removed
   - Verify the criteria match your preferences

3. **Run cleanup:**
   ```bash
   npm run comments:cleanup
   ```

4. **Review changes:**
   - Check git diff to review removed comments
   - Ensure valuable comments were kept

5. **Commit:**
   ```bash
   git add .
   git commit -m "chore: remove excessive comments"
   ```

### Regular Maintenance

Run the audit periodically to catch excessive comments early:

```bash
# Monthly or after major feature work
npm run comments:audit
```

If the audit shows many removable comments, run cleanup:

```bash
npm run comments:cleanup
```

## Configuration

To adjust the criteria, edit the pattern arrays in both scripts:

**`obviousPatterns`** - Patterns to remove (make more aggressive)
**`valuablePatterns`** - Patterns to keep (make more selective)

## Statistics

Typical results from a first-time cleanup:
- **Before:** ~12,000 comments
- **After:** ~4,000 comments  
- **Removed:** ~8,000 comments (67%)
- **Files modified:** ~600 files (75%)

Your codebase will have:
- ✅ Focused, meaningful comments
- ✅ Real technical value in each comment
- ✅ Less noise, more signal
- ✅ Easier code reviews

## Tips

1. **Always audit first** - Review the report before running cleanup
2. **Commit before cleanup** - Easy to revert if needed
3. **Review the diff** - Check that valuable comments weren't removed
4. **Adjust criteria if needed** - Edit the pattern arrays to match your style
5. **Run periodically** - Keep comments clean as you develop

## See Also

- `.cursor/commands/comments/` - Comment management commands for Cursor
- `LEARNING_STRATEGIES.md` - Documentation on comment strategies
