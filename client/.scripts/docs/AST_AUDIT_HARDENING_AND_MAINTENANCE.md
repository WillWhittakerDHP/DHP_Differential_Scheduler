# AST Audit — Hardening and Maintenance (Phase 4)

## Performance and determinism

- **Parse caching:** `shared-ast-facade.mjs` caches parsed source files by `(filePath, contentHash)` with a cap of 500 entries. Use `useCache: false` when processing many files in one run to avoid retaining hundreds of ts-morph projects (e.g. naming-convention audit).
- **Stable ordering:** Each migrated audit sorts findings (e.g. by file, line, ruleId) before output so report diffs are minimal across reruns.

## When to use regex vs AST

- **Use AST when:** You need to distinguish type vs value position, scope (e.g. mutation inside a callback), or structural context (e.g. catch block body). AST avoids false positives from comments, strings, and line-window heuristics.
- **Use regex when:** The rule is simple (e.g. “file contains @ts-ignore”), file-level, or line-based with no need for context. Regex is faster and avoids ts-morph memory/parse cost.

## How to add an AST rule

1. **Use the shared facade:** Import from `shared-ast-facade.mjs`: `createSourceFileFromContent`, `extractVueScriptWithLineOffset`, `forEachDescendant`, `loadTsMorph`.
2. **Vue SFC:** For `.vue` files, call `extractVueScriptWithLineOffset(content)` to get `scriptContent` and `startLineInFile`; pass `scriptContent` to `createSourceFileFromContent` with `lineOffset: startLineInFile` so reported line numbers match the file.
3. **Traverse:** Use `forEachDescendant(sourceFile, visit)` or `sourceFile.getDescendants()` / `getDescendantsOfKind(SyntaxKind.X)`. Use `(await loadTsMorph()).SyntaxKind` for kind checks.
4. **Line numbers:** Use the `getLine(node)` returned by `createSourceFileFromContent` so Vue offsets are applied.
5. **Output shape:** Emit findings in the same shape as existing rules (e.g. `{ file, lineNumber, ruleId, snippet, message }`) so categorizeMatches, allowlists, and report writers stay unchanged.
## Maintenance guardrails

- **Allowlist growth:** Prefer fixing code or refining the rule over adding allowlist entries. After AST migration, remove allowlist entries that were only suppressing regex false positives (see Phase 2 rationale).
- **Rule IDs:** Do not change existing `ruleId` values; they are referenced by central allowlists and summaries.
- **Report contract:** Keep JSON/Markdown top-level fields and summary scripts compatible; avoid breaking changes unless versioned.
