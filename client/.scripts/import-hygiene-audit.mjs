import fs from 'node:fs'
import path from 'node:path'
import {
  loadCentralAllowlist,
  listAuditFiles,
  resolveAuditPaths,
  writeAuditReports,
  toRepoPath as toRepoPathUtil,
  checkConfigAllowlist,
  parseChangedOnlyFlag,
  getAuditReportHeaderLines,
} from './shared-audit-utils.mjs'

/**
 * Import Hygiene Audit Script
 *
 * Detects import consistency and hygiene issues across the codebase:
 *
 *   RULE: barrel-bypass
 *     A file imports directly from a module that has a barrel index.ts,
 *     bypassing the public API surface.
 *
 *   RULE: inconsistent-path
 *     The same exported symbol is imported via different paths in different
 *     files (e.g. barrel in one, direct file in another).
 *
 *   RULE: duplicate-reexport
 *     A symbol is re-exported from multiple barrel / facade files, creating
 *     ambiguity about the canonical import path.
 *
 *   RULE: relative-when-alias
 *     A relative import traverses 3+ parent directories when a path alias
 *     (like @/) would be clearer.
 *
 *   RULE: inline-type-import
 *     A file uses inline type-only imports (e.g. import('@/types/...').TypeName)
 *     in type positions. Prefer top-level "import type { X } from '...'".
 *
 * Scope:
 *   - Included: client/src (ts, vue) and server/src (ts, mjs)
 *   - Excluded: global exclusions (audit-global-config.json)
 *
 * Output:
 *   - client/.audit-reports/import-hygiene-audit.json
 *   - client/.audit-reports/import-hygiene-audit.md
 */

function toRepoPath(p, projectRoot) { return toRepoPathUtil(p, projectRoot) }

// ─── Barrel Detection ─────────────────────────────────────────────────────────

/**
 * Build a set of directories that contain a barrel file (index.ts / index.js).
 * Returns Map<repoRelativeDir, absPathToIndex>
 */
function findBarrelDirs(allFiles, projectRoot) {
  const barrels = new Map()
  for (const abs of allFiles) {
    const basename = path.basename(abs)
    if (basename === 'index.ts' || basename === 'index.js') {
      const dirAbs = path.dirname(abs)
      const dirRepo = toRepoPath(dirAbs, projectRoot)
      barrels.set(dirRepo, abs)
    }
  }
  return barrels
}

// ─── Import Extraction ────────────────────────────────────────────────────────

/**
 * Extract raw import specifiers and the symbols they pull in.
 * Returns Array<{ specifier, symbols, lineNumber }>
 */
function extractImports(content, _absPath) {
  const imports = []
  const lines = content.split('\n')

  const esImportRe = /import\s+(?:type\s+)?(\{[^}]*\}|[\w*]+(?:\s*,\s*\{[^}]*\})?)\s+from\s+['"]([^'"]+)['"]/g
  const sideEffectRe = /import\s+['"]([^'"]+)['"]/g

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    for (const match of line.matchAll(esImportRe)) {
      const symbolsPart = match[1]
      const specifier = match[2]
      const symbols = parseSymbols(symbolsPart)
      imports.push({ specifier, symbols, lineNumber: i + 1 })
    }

    for (const match of line.matchAll(sideEffectRe)) {
      if (!esImportRe.test(line)) {
        imports.push({ specifier: match[1], symbols: [], lineNumber: i + 1 })
      }
    }
  }

  return imports
}

function parseSymbols(raw) {
  if (!raw) return []
  const cleaned = raw.replace(/[{}]/g, '').trim()
  if (!cleaned || cleaned === '*') return ['*']
  return cleaned.split(',').map(s => {
    const parts = s.trim().split(/\s+as\s+/)
    return parts[0].trim()
  }).filter(Boolean)
}

/**
 * Resolve a specifier to a repo-relative directory path (for barrel-bypass check).
 */
function resolveSpecifierDir(specifier, importerAbs, projectRoot, clientSrc) {
  if (specifier.startsWith('.')) {
    const resolved = path.resolve(path.dirname(importerAbs), specifier)
    return toRepoPath(path.dirname(resolved), projectRoot)
  }
  if (specifier.startsWith('@/')) {
    const resolved = path.join(clientSrc, specifier.substring(2))
    return toRepoPath(path.dirname(resolved), projectRoot)
  }
  return null
}

/**
 * Resolve a specifier to a repo-relative file path (without extension).
 */
function resolveSpecifierFile(specifier, importerAbs, projectRoot) {
  if (specifier.startsWith('.')) {
    return toRepoPath(path.resolve(path.dirname(importerAbs), specifier), projectRoot)
      .replace(/\.(ts|js|vue|mjs|tsx|jsx)$/, '')
  }
  if (specifier.startsWith('@/')) {
    return ('client/src/' + specifier.substring(2))
      .replace(/\.(ts|js|vue|mjs|tsx|jsx)$/, '')
  }
  return null
}

const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.vue', '.js']

/** Resolve repo-relative path (no extension) to absolute path of first existing file. */
function resolveRepoPathToAbs(repoPathNoExt, projectRoot) {
  const base = path.join(projectRoot, repoPathNoExt.replace(/\//g, path.sep))
  for (const ext of SOURCE_EXTENSIONS) {
    const candidate = base + ext
    if (fs.existsSync(candidate)) return candidate
  }
  return null
}

/**
 * Heuristic: does the source file export symbol only as a type (export type { X }, export interface X, export type X =)?
 */
function sourceExportsSymbolOnlyAsType(absPath, symbol) {
  if (!fs.existsSync(absPath)) return false
  const raw = fs.readFileSync(absPath, 'utf-8')
  const content = absPath.endsWith('.vue')
    ? (raw.match(/<script[^>]*>([\s\S]*?)<\/script>/i)?.[1] ?? '')
    : raw
  /* eslint-disable security/detect-non-literal-regexp */
  const hasTypeExport = new RegExp(`export\\s+type\\s+\\{[^}]*\\b${escapeRegex(symbol)}\\b[^}]*\\}`).test(content) ||
    new RegExp(`export\\s+interface\\s+${escapeRegex(symbol)}\\b`).test(content) ||
    new RegExp(`export\\s+type\\s+${escapeRegex(symbol)}\\s*=`).test(content)
  if (!hasTypeExport) return false
  const hasValueExport = new RegExp(`export\\s+(const|let|var|function|class)\\s+${escapeRegex(symbol)}\\b`).test(content) ||
    new RegExp(`export\\s+\\{[^}]*\\b${escapeRegex(symbol)}\\b[^}]*\\}\\s*;`).test(content)
  /* eslint-enable security/detect-non-literal-regexp */
  return !hasValueExport
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ─── Rule Checks ──────────────────────────────────────────────────────────────

/**
 * RULE: barrel-bypass
 * Check if a file imports from a specific file inside a directory that has a barrel.
 */
function checkBarrelBypass(imports, importerAbs, barrelDirs, projectRoot, clientSrc) {
  const findings = []
  const importerDir = toRepoPath(path.dirname(importerAbs), projectRoot)

  for (const imp of imports) {
    if (!imp.specifier.startsWith('.') && !imp.specifier.startsWith('@/')) continue
    if (imp.specifier.endsWith('/index') || imp.specifier.endsWith('/')) continue

    const targetDir = resolveSpecifierDir(imp.specifier, importerAbs, projectRoot, clientSrc)
    if (!targetDir) continue

    if (targetDir === importerDir) continue

    if (barrelDirs.has(targetDir)) {
      const targetFile = resolveSpecifierFile(imp.specifier, importerAbs, projectRoot)
      const barrelFile = toRepoPath(barrelDirs.get(targetDir), projectRoot)
        .replace(/\.(ts|js)$/, '')

      if (targetFile && targetFile !== barrelFile) {
        findings.push({
          ruleId: 'barrel-bypass',
          lineNumber: imp.lineNumber,
          specifier: imp.specifier,
          barrelDir: targetDir,
          message: `Imports from '${imp.specifier}' bypassing barrel at ${targetDir}/index`,
        })
      }
    }
  }
  return findings
}

/**
 * RULE: inline-type-import
 * Flag inline type-only imports (e.g. import('@/types/appointment').EventFinal) in type positions.
 * Prefer top-level "import type { X } from '...'" for clarity and so the import cleanup audit can track them.
 */
function checkInlineTypeImport(content) {
  const findings = []
  const lines = content.split('\n')
  // Match import('...') or import("...") followed by . (type access) — type-only inline import pattern
  const inlineTypeRe = /import\s*\(\s*['"]([^'"]+)['"]\s*\)\s*\./g
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    let match
    inlineTypeRe.lastIndex = 0
    while ((match = inlineTypeRe.exec(line)) !== null) {
      findings.push({
        ruleId: 'inline-type-import',
        lineNumber: i + 1,
        specifier: match[1],
        snippet: line.trim().slice(0, 80) + (line.trim().length > 80 ? '…' : ''),
      })
    }
  }
  return findings
}

/**
 * RULE: relative-when-alias
 * Flag relative imports that traverse 3+ parent directories.
 */
function checkRelativeWhenAlias(imports, importerAbs, projectRoot) {
  const findings = []
  const importerRepo = toRepoPath(importerAbs, projectRoot)
  const isClientFile = importerRepo.startsWith('client/src')

  if (!isClientFile) return findings

  for (const imp of imports) {
    if (!imp.specifier.startsWith('.')) continue
    const upCount = (imp.specifier.match(/\.\.\//g) || []).length
    if (upCount >= 3) {
      findings.push({
        ruleId: 'relative-when-alias',
        lineNumber: imp.lineNumber,
        specifier: imp.specifier,
        depth: upCount,
        message: `Relative import traverses ${upCount} parent dirs — consider using @/ alias`,
      })
    }
  }
  return findings
}

// ─── Inconsistent Path Detection (cross-file) ────────────────────────────────

/**
 * Build a map: normalizedTargetFile -> Array<{ importerFile, specifier, lineNumber }>
 * Then find targets imported via multiple distinct specifier styles.
 */
function detectInconsistentPaths(allImportsMap, projectRoot) {
  const targetUsages = new Map()

  for (const [importerRepo, imports] of allImportsMap.entries()) {
    for (const imp of imports) {
      const resolved = resolveSpecifierFile(imp.specifier, imp._importerAbs, projectRoot)
      if (!resolved) continue

      if (!targetUsages.has(resolved)) targetUsages.set(resolved, [])
      targetUsages.get(resolved).push({
        importerFile: importerRepo,
        specifier: imp.specifier,
        lineNumber: imp.lineNumber,
      })
    }
  }

  const findings = []
  for (const [target, usages] of targetUsages.entries()) {
    const uniqueSpecifiers = [...new Set(usages.map(u => u.specifier))]
    if (uniqueSpecifiers.length < 2) continue

    const hasBarrelStyle = uniqueSpecifiers.some(s =>
      s.endsWith('/index') || (!s.includes('/') && s.startsWith('@/'))
    )
    const hasDirectStyle = uniqueSpecifiers.some(s =>
      !s.endsWith('/index') && (s.includes('/') || s.startsWith('.'))
    )

    if (hasBarrelStyle && hasDirectStyle) {
      findings.push({
        ruleId: 'inconsistent-path',
        target,
        specifiers: uniqueSpecifiers,
        usageCount: usages.length,
        files: usages.map(u => u.importerFile),
        message: `'${target}' imported via ${uniqueSpecifiers.length} different paths across ${usages.length} files`,
      })
    }
  }
  return findings
}

/**
 * RULE: duplicate-reexport
 * Find symbols exported from multiple barrel/facade files.
 */
function detectDuplicateReexports(allFiles, barrelDirs, projectRoot) {
  const exportMap = new Map()

  for (const abs of allFiles) {
    const repoPath = toRepoPath(abs, projectRoot)
    const isBarrel = Array.from(barrelDirs.values()).some(b => toRepoPath(b, projectRoot) === repoPath)
    const isFacade = /^export\s+\*?\s+from/m.test(
      fs.readFileSync(abs, 'utf-8').split('\n').slice(0, 5).join('\n')
    )

    if (!isBarrel && !isFacade) continue

    const content = fs.readFileSync(abs, 'utf-8')
    const reexportRe = /export\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g
    const starReexportRe = /export\s+\*\s+from\s+['"]([^'"]+)['"]/g

    for (const match of content.matchAll(reexportRe)) {
      const symbols = match[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0].trim()).filter(Boolean)
      for (const sym of symbols) {
        if (!exportMap.has(sym)) exportMap.set(sym, [])
        exportMap.get(sym).push(repoPath)
      }
    }

    for (const match of content.matchAll(starReexportRe)) {
      const sourceSpec = match[1]
      const resolved = resolveSpecifierFile(sourceSpec, abs, projectRoot)
      if (resolved) {
        const key = `* from ${resolved}`
        if (!exportMap.has(key)) exportMap.set(key, [])
        exportMap.get(key).push(repoPath)
      }
    }
  }

  const findings = []
  for (const [symbol, files] of exportMap.entries()) {
    const uniqueFiles = [...new Set(files)]
    if (uniqueFiles.length >= 2 && !symbol.startsWith('*')) {
      findings.push({
        ruleId: 'duplicate-reexport',
        symbol,
        files: uniqueFiles,
        message: `'${symbol}' re-exported from ${uniqueFiles.length} files: ${uniqueFiles.join(', ')}`,
      })
    }
  }
  return findings
}

/**
 * RULE: type-value-reexport
 * In barrel files (index.ts), flag re-exports where the source exports the symbol only as a type
 * (should be "export type { X }" instead of "export { X }").
 */
function checkTypeValueReexport(barrelAbs, configAllowlist, projectRoot) {
  const repoPath = toRepoPath(barrelAbs, projectRoot)
  const content = fs.readFileSync(barrelAbs, 'utf-8')
  const findings = []
  const reexportRe = /export\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g
  let lineNum = 0
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    lineNum = i + 1
    const line = lines[i]
    for (const match of line.matchAll(reexportRe)) {
      const symbols = match[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0].trim()).filter(Boolean)
      const sourceSpec = match[2]
      if (!sourceSpec.startsWith('.') && !sourceSpec.startsWith('@/')) continue
      const sourceRepo = resolveSpecifierFile(sourceSpec, barrelAbs, projectRoot)
      if (!sourceRepo) continue
      const sourceAbs = resolveRepoPathToAbs(sourceRepo, projectRoot)
      if (!sourceAbs) continue
      for (const sym of symbols) {
        if (!sourceExportsSymbolOnlyAsType(sourceAbs, sym)) continue
        const result = checkConfigAllowlist(repoPath, 'type-value-reexport', lineNum, configAllowlist)
        if (!result.allowed) {
          findings.push({
            file: repoPath,
            lineNumber: lineNum,
            symbol: sym,
            sourceFile: sourceRepo,
          })
        }
      }
    }
  }
  return findings
}

// ─── Priority / Scoring ───────────────────────────────────────────────────────

const RULE_WEIGHTS = {
  'barrel-bypass': 3,
  'inconsistent-path': 5,
  'duplicate-reexport': 4,
  'relative-when-alias': 1,
  'type-value-reexport': 2,
  'inline-type-import': 1,
}

function assignPriority(score, config) {
  const p0Min = Number(config?.priorities?.p0MinSeverityScore ?? 15)
  const p1Min = Number(config?.priorities?.p1MinSeverityScore ?? 6)
  if (score >= p0Min) return 'P0'
  if (score >= p1Min) return 'P1'
  return 'P2'
}

// ─── Markdown Report ──────────────────────────────────────────────────────────

function renderMarkdownReport(result) {
  const lines = []
  lines.push('# Import Hygiene Audit (Generated)')
  lines.push('')
  lines.push(...getAuditReportHeaderLines())
  lines.push('')
  lines.push('This file is generated by `client/.scripts/import-hygiene-audit.mjs`.')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Files scanned: **${result.totalScanned}**`)
  lines.push(`- Barrel directories found: **${result.barrelCount}**`)
  lines.push(`- Barrel bypass violations: **${result.barrelBypass.length}**`)
  lines.push(`- Inconsistent import paths: **${result.inconsistentPaths.length}**`)
  lines.push(`- Duplicate re-exports: **${result.duplicateReexports.length}**`)
  lines.push(`- Deep relative imports: **${result.relativeWhenAlias.length}**`)
  lines.push(`- Type/value re-exports: **${(result.typeValueReexport || []).length}**`)
  lines.push(`- Inline type imports: **${(result.inlineTypeImport || []).length}**`)
  lines.push('')

  if ((result.inlineTypeImport || []).length > 0) {
    lines.push('## Inline type imports')
    lines.push('')
    lines.push('These files use inline type-only imports (e.g. `import(\'@/types/...\').TypeName`) in type positions.')
    lines.push('Prefer a top-level `import type { TypeName } from \'...\'` for clarity and consistency.')
    lines.push('')
    lines.push('| File | Line | Specifier | Snippet |')
    lines.push('| --- | ---: | --- | --- |')
    for (const f of (result.inlineTypeImport || []).slice(0, 40)) {
      lines.push(`| \`${f.file}\` | ${f.lineNumber} | \`${f.specifier}\` | \`${f.snippet || ''}\` |`)
    }
    if ((result.inlineTypeImport || []).length > 40) {
      lines.push(`| *...and ${result.inlineTypeImport.length - 40} more* | | | |`)
    }
    lines.push('')
  }

  if ((result.typeValueReexport || []).length > 0) {
    lines.push('## Type/value re-export')
    lines.push('')
    lines.push('Barrel files re-exporting a symbol that the source exports only as a type. Use `export type { X }` instead of `export { X }`.')
    lines.push('')
    lines.push('| File | Line | Symbol | Source |')
    lines.push('| --- | ---: | --- | --- |')
    for (const f of (result.typeValueReexport || []).slice(0, 25)) {
      lines.push(`| \`${f.file}\` | ${f.lineNumber} | ${f.symbol} | \`${f.sourceFile}\` |`)
    }
    if (result.typeValueReexport.length > 25) {
      lines.push(`| *...and ${result.typeValueReexport.length - 25} more* | | | |`)
    }
    lines.push('')
  }

  if (result.barrelBypass.length > 0) {
    lines.push('## Barrel Bypass Violations')
    lines.push('')
    lines.push('These imports go directly to a file inside a directory that has a barrel `index.ts`.')
    lines.push('Use the barrel import instead for consistent public API usage.')
    lines.push('')
    lines.push('| File | Line | Import | Barrel |')
    lines.push('| --- | ---: | --- | --- |')
    for (const f of result.barrelBypass.slice(0, 30)) {
      lines.push(`| \`${f.file}\` | ${f.lineNumber} | \`${f.specifier}\` | \`${f.barrelDir}/index\` |`)
    }
    if (result.barrelBypass.length > 30) {
      lines.push(`| *...and ${result.barrelBypass.length - 30} more* | | | |`)
    }
    lines.push('')
  }

  if (result.inconsistentPaths.length > 0) {
    lines.push('## Inconsistent Import Paths')
    lines.push('')
    lines.push('The same module is imported via different paths in different files.')
    lines.push('Choose one canonical import path and use it everywhere.')
    lines.push('')
    for (const f of result.inconsistentPaths.slice(0, 20)) {
      lines.push(`- **${f.target}** (${f.usageCount} usages across ${f.files.length} files)`)
      for (const s of f.specifiers) {
        lines.push(`  - \`${s}\``)
      }
    }
    if (result.inconsistentPaths.length > 20) {
      lines.push(`- *...and ${result.inconsistentPaths.length - 20} more.*`)
    }
    lines.push('')
  }

  if (result.duplicateReexports.length > 0) {
    lines.push('## Duplicate Re-exports')
    lines.push('')
    lines.push('These symbols are re-exported from multiple barrel/facade files.')
    lines.push('Consumers may import from different locations for the same symbol.')
    lines.push('')
    lines.push('| Symbol | Files |')
    lines.push('| --- | --- |')
    for (const f of result.duplicateReexports.slice(0, 20)) {
      lines.push(`| \`${f.symbol}\` | ${f.files.map(x => `\`${x}\``).join(', ')} |`)
    }
    lines.push('')
  }

  if (result.relativeWhenAlias.length > 0) {
    lines.push('## Deep Relative Imports')
    lines.push('')
    lines.push('These imports use long relative paths (3+ `../` traversals).')
    lines.push('Consider using the `@/` alias for clarity.')
    lines.push('')
    lines.push('| File | Line | Import | Depth |')
    lines.push('| --- | ---: | --- | ---: |')
    for (const f of result.relativeWhenAlias.slice(0, 30)) {
      lines.push(`| \`${f.file}\` | ${f.lineNumber} | \`${f.specifier}\` | ${f.depth} |`)
    }
    lines.push('')
  }

  if (result.files.length > 0) {
    lines.push('## Files by Severity')
    lines.push('')
    lines.push('| File | Priority | Score | Barrel Bypass | Deep Relative | Type/Value Re-export | Inline type import |')
    lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: |')
    for (const f of result.files.slice(0, 30)) {
      lines.push(`| \`${f.file}\` | ${f.priority} | ${f.score} | ${f.barrelBypass || 0} | ${f.relativeWhenAlias || 0} | ${f.typeValueReexport || 0} | ${f.inlineTypeImport || 0} |`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const paths = resolveAuditPaths('import-hygiene')
  const configAllowlist = loadCentralAllowlist('import-hygiene')
  const delta = parseChangedOnlyFlag(process.argv, paths.projectRoot)

  let config = {}
  try { config = JSON.parse(fs.readFileSync(paths.configPath, 'utf8')) } catch { /* defaults */ }

  const allFiles = listAuditFiles('import-hygiene', [paths.clientSrc, paths.serverSrc])

  const barrelDirs = findBarrelDirs(allFiles, paths.projectRoot)

  const allBarrelBypass = []
  const allRelativeWhenAlias = []
  const allInlineTypeImport = []
  const allImportsMap = new Map()
  const fileFindings = new Map()
  let scannedCount = 0

  for (const abs of allFiles) {
    const repoPath = toRepoPath(abs, paths.projectRoot)
    if (delta.enabled && !delta.changedFiles.has(repoPath)) continue

    scannedCount++
    const content = fs.readFileSync(abs, 'utf-8')

    let scriptContent = content
    if (abs.endsWith('.vue')) {
      const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/i)
      scriptContent = scriptMatch ? scriptMatch[1] : ''
    }

    const imports = extractImports(scriptContent, abs)
    const importsWithAbs = imports.map(i => ({ ...i, _importerAbs: abs }))
    allImportsMap.set(repoPath, importsWithAbs)

    const barrelFindings = checkBarrelBypass(imports, abs, barrelDirs, paths.projectRoot, paths.clientSrc)
    const relativeFindings = checkRelativeWhenAlias(imports, abs, paths.projectRoot)
    const inlineTypeFindings = checkInlineTypeImport(scriptContent).filter((f) => {
      const result = checkConfigAllowlist(repoPath, 'inline-type-import', f.lineNumber, configAllowlist)
      return !result.allowed
    })

    for (const f of barrelFindings) {
      allBarrelBypass.push({ file: repoPath, ...f })
    }
    for (const f of relativeFindings) {
      allRelativeWhenAlias.push({ file: repoPath, ...f })
    }
    for (const f of inlineTypeFindings) {
      allInlineTypeImport.push({ file: repoPath, ...f })
    }

    if (barrelFindings.length > 0 || relativeFindings.length > 0 || inlineTypeFindings.length > 0) {
      const existing = fileFindings.get(repoPath) || { barrelBypass: 0, relativeWhenAlias: 0, typeValueReexport: 0 }
      fileFindings.set(repoPath, {
        barrelBypass: barrelFindings.length,
        relativeWhenAlias: relativeFindings.length,
        typeValueReexport: existing.typeValueReexport || 0,
        inlineTypeImport: inlineTypeFindings.length,
      })
    }
  }

  const inconsistentPaths = detectInconsistentPaths(allImportsMap, paths.projectRoot)
  const duplicateReexports = detectDuplicateReexports(allFiles, barrelDirs, paths.projectRoot)

  const allTypeValueReexport = []
  for (const barrelAbs of barrelDirs.values()) {
    const findings = checkTypeValueReexport(barrelAbs, configAllowlist, paths.projectRoot)
    for (const f of findings) {
      allTypeValueReexport.push(f)
      const repoPath = f.file
      if (!fileFindings.has(repoPath)) {
        fileFindings.set(repoPath, { barrelBypass: 0, relativeWhenAlias: 0, typeValueReexport: 0 })
      }
      const counts = fileFindings.get(repoPath)
      counts.typeValueReexport = (counts.typeValueReexport || 0) + 1
    }
  }

  for (const ip of inconsistentPaths) {
    for (const f of ip.files) {
      if (!fileFindings.has(f)) {
        fileFindings.set(f, { barrelBypass: 0, relativeWhenAlias: 0, typeValueReexport: 0 })
      }
    }
  }

  const files = Array.from(fileFindings.entries())
    .map(([file, counts]) => {
      const score =
        (counts.barrelBypass || 0) * RULE_WEIGHTS['barrel-bypass'] +
        (counts.relativeWhenAlias || 0) * RULE_WEIGHTS['relative-when-alias'] +
        (counts.typeValueReexport || 0) * RULE_WEIGHTS['type-value-reexport'] +
        (counts.inlineTypeImport || 0) * RULE_WEIGHTS['inline-type-import']
      return {
        file,
        priority: assignPriority(score, config),
        score,
        ...counts,
      }
    })
    .sort((a, b) => b.score - a.score)

  const result = {
    generatedAt: new Date().toISOString(),
    totalScanned: scannedCount,
    barrelCount: barrelDirs.size,
    ...(delta.enabled ? { deltaMode: true, baseRef: delta.baseRef } : {}),
    barrelBypass: allBarrelBypass,
    inconsistentPaths,
    duplicateReexports,
    typeValueReexport: allTypeValueReexport,
    relativeWhenAlias: allRelativeWhenAlias,
    inlineTypeImport: allInlineTypeImport,
    files,
  }

  const { outJson, outMd } = writeAuditReports('import-hygiene', result, renderMarkdownReport(result))

  console.log(`Wrote:\n- ${toRepoPath(outJson, paths.projectRoot)}\n- ${toRepoPath(outMd, paths.projectRoot)}`)
  console.log(
    `Barrel bypasses: ${allBarrelBypass.length}, ` +
    `Inconsistent paths: ${inconsistentPaths.length}, ` +
    `Duplicate re-exports: ${duplicateReexports.length}, ` +
    `Type/value re-exports: ${allTypeValueReexport.length}, ` +
    `Deep relative: ${allRelativeWhenAlias.length}, ` +
    `Inline type imports: ${allInlineTypeImport.length}`
  )
  process.exitCode = 0
}

main()
