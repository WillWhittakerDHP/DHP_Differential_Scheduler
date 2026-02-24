import fs from 'node:fs'
import path from 'node:path'
import {
  loadCentralAllowlist,
  listAuditFiles,
  resolveAuditPaths,
  getAuditScanDirs,
  writeAuditReports,
  toRepoPath as toRepoPathUtil,
  checkConfigAllowlist,
  parseChangedOnlyFlag,
  runTwoPhaseFilter,
  createSuppressionHitTracker,
  AUDIT_REPORT_AI_INSTRUCTIONS_COMBINED,
  getAuditReportHeaderLines,
} from './shared-audit-utils.mjs'
import {
  createSourceFileFromContent,
  createTypedProject,
  extractVueScriptWithLineOffset,
  forEachDescendant,
  getSymbolAtNode,
  isTypeOnlySymbol,
  loadTsMorph,
} from './shared-ast-facade.mjs'
import { enrichFinding, CONFIDENCE_LEVELS } from './shared-audit-utils.mjs'

/**
 * Type-Import Audit Script
 *
 * Surfaces type-only import consistency issues:
 *   - value-import-from-type-only-file: value import from a file that exports only types
 *   - type-used-as-value: symbol imported as "import type" but used in value position
 *
 * Scope: client/src and server/src (.ts, .tsx, .vue). For .vue, scan <script> only.
 *
 * Output: .audit-reports/type-import-audit.json, .audit-reports/type-import-audit.md
 */

const EXTENSIONS = ['.ts', '.tsx', '.vue', '.js']

function toRepoPath(p, projectRoot) { return toRepoPathUtil(p, projectRoot) }

function extractScriptContent(content, absPath) {
  if (!absPath.endsWith('.vue')) return content
  const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/i)
  return scriptMatch ? scriptMatch[1] : ''
}

/** Resolve specifier to absolute path of source file, or null if not under client/src or server/src */
function resolveSpecifierToAbs(specifier, importerAbs, importerClientSrc) {
  if (specifier.startsWith('.')) {
    const base = path.resolve(path.dirname(importerAbs), specifier)
    for (const ext of EXTENSIONS) {
      const candidate = base.endsWith(ext) ? base : base + ext
      if (fs.existsSync(candidate)) return candidate
    }
    const noExt = base.replace(/\.(ts|tsx|vue|mjs|js)$/, '')
    for (const ext of EXTENSIONS) {
      const candidate = noExt + ext
      if (fs.existsSync(candidate)) return candidate
    }
    return null
  }
  if (specifier.startsWith('@/')) {
    const base = path.join(importerClientSrc, specifier.substring(2).replace(/\.(ts|tsx|vue|mjs|js)$/, ''))
    for (const ext of EXTENSIONS) {
      const candidate = base + ext
      if (fs.existsSync(candidate)) return candidate
    }
    return null
  }
  return null
}

/** Heuristic: does this file export only types (no export const/function/class/default value)? Fallback when typed project not used. */
function isTypeOnlyFileRegex(absPath) {
  if (!fs.existsSync(absPath)) return false
  const raw = fs.readFileSync(absPath, 'utf-8')
  const content = absPath.endsWith('.vue')
    ? (raw.match(/<script[^>]*>([\s\S]*?)<\/script>/i)?.[1] ?? '')
    : raw
  const hasValueExport = /\bexport\s+(async\s+)?(const|let|var|function|class|default\s+)\b/.test(content) ||
    /\bexport\s+default\s+/.test(content) ||
    /\bexport\s+(?!type\s)\s*\{[^}]*\}\s*from\s+['"]/.test(content)
  if (hasValueExport) return false
  const hasTypeExport = /\bexport\s+type\b/.test(content) || /\bexport\s+interface\b/.test(content)
  return hasTypeExport
}

/** Phase B: use TypeChecker to decide if file exports only types. Returns null if semantic check not available. */
function isTypeOnlyFileSemantic(typedProject, absPath, SyntaxKind) {
  if (!typedProject) return null
  const normalized = path.isAbsolute(absPath) ? absPath : path.join(process.cwd(), absPath)
  const sf = typedProject.getSourceFile(normalized)
  if (!sf) return null
  const exported = sf.getExportedDeclarations()
  if (exported.size === 0) return false
  const typeOnlyKinds = new Set([SyntaxKind.InterfaceDeclaration, SyntaxKind.TypeAliasDeclaration])
  for (const [, decls] of exported) {
    for (const decl of decls) {
      const kind = decl.getKind()
      if (!typeOnlyKinds.has(kind)) return false
    }
  }
  return true
}

function isTypeOnlyFile(absPath, typedProject, SyntaxKind) {
  const semantic = isTypeOnlyFileSemantic(typedProject, absPath, SyntaxKind)
  if (semantic !== null) return semantic
  return isTypeOnlyFileRegex(absPath)
}

/**
 * AST: collect value imports (no "type" keyword). Returns { lineNumber, specifier, symbols }[].
 * lineNumber is 1-based; use getLine(decl) for correct file/script line.
 */
function collectValueImportsFromAst(sourceFile, getLine) {
  const out = []
  for (const decl of sourceFile.getImportDeclarations()) {
    if (decl.isTypeOnly()) continue
    const specifier = decl.getModuleSpecifierValue()
    const symbols = []
    const defaultImport = decl.getDefaultImport()
    if (defaultImport) symbols.push(defaultImport.getText())
    for (const spec of decl.getNamedImports()) {
      const name = spec.getName()
      if (name) symbols.push(name)
    }
    if (symbols.length === 0) continue
    out.push({ lineNumber: getLine(decl), specifier, symbols })
  }
  return out
}

/**
 * AST: collect names that are imported with "import type { ... }".
 */
function collectTypeOnlyImportNamesFromAst(sourceFile) {
  const names = new Set()
  for (const decl of sourceFile.getImportDeclarations()) {
    if (!decl.isTypeOnly()) continue
    for (const spec of decl.getNamedImports()) {
      const name = spec.getName()
      if (name) names.add(name)
    }
  }
  return names
}

/**
 * AST: true if this identifier node is used in a value position (call, new, typeof, property access name).
 */
function isIdentifierInValuePosition(identifierNode, SyntaxKind) {
  const parent = identifierNode.getParent()
  if (!parent) return false
  const kind = parent.getKind()
  if (kind === SyntaxKind.CallExpression && parent.getExpression?.() === identifierNode) return true
  if (kind === SyntaxKind.NewExpression && parent.getExpression?.() === identifierNode) return true
  if (kind === SyntaxKind.TypeOfExpression && parent.getExpression?.() === identifierNode) return true
  if (kind === SyntaxKind.PropertyAccessExpression && parent.getNameNode?.() === identifierNode) return true
  return false
}

/**
 * AST: find usages of type-only-imported names in value positions. Returns { lineNumber, symbol }[].
 */
function collectTypeUsedAsValueFromAst(sourceFile, typeOnlyNames, getLine, SyntaxKind) {
  const findings = []
  forEachDescendant(sourceFile, (node) => {
    if (node.getKind() !== SyntaxKind.Identifier) return
    const name = node.getText()
    if (!typeOnlyNames.has(name)) return
    if (!isIdentifierInValuePosition(node, SyntaxKind)) return
    findings.push({ lineNumber: getLine(node), symbol: name })
  })
  return findings
}

/**
 * Phase B: validate type-used-as-value with TypeChecker. Returns true to keep finding (symbol is type-only), false to drop.
 * When typedProject is null, returns true (keep all). For .vue we skip semantic validation (line mapping differs).
 */
function validateTypeUsedAsValueCandidate(candidate, absPath, typedProject, typeChecker, sk) {
  if (!typedProject || !typeChecker) return true
  if (absPath.endsWith('.vue')) return true
  const normalized = path.isAbsolute(absPath) ? absPath : path.join(process.cwd(), absPath)
  const sf = typedProject.getSourceFile(normalized)
  if (!sf) return true
  const targetLine = candidate.lineNumber
  const targetName = candidate.symbol
  let found = null
  forEachDescendant(sf, (node) => {
    if (node.getKind() !== sk.Identifier) return
    if (node.getText() !== targetName) return
    const lineCol = sf.getLineAndColumnAtPos(node.getStart())
    if (lineCol && lineCol.line === targetLine) {
      found = node
      return false
    }
  })
  if (!found) return true
  const symbol = getSymbolAtNode(found, typeChecker)
  if (!symbol) return true
  return isTypeOnlySymbol(symbol, sk)
}

async function main() {
  const paths = resolveAuditPaths('type-import')

  const configAllowlist = loadCentralAllowlist('type-import')
  const delta = parseChangedOnlyFlag(process.argv, paths.projectRoot)

  const { SyntaxKind } = await loadTsMorph()
  let typedProject = null
  let typeChecker = null
  if (!process.env.AUDIT_FIXTURE_DIRS) {
    try {
      const clientTsconfig = path.join(paths.clientRoot, 'tsconfig.json')
      if (fs.existsSync(clientTsconfig)) {
        const typed = await createTypedProject(clientTsconfig)
        typedProject = typed.project
        typeChecker = typed.typeChecker
      }
    } catch (_err) {
      // Proceed without TypeChecker
    }
  }

  const scanDirs = getAuditScanDirs('type-import', paths)
  const allFiles = listAuditFiles('type-import', scanDirs)

  const valueImportFromTypeOnlyFile = []
  const typeUsedAsValue = []
  const fileScores = new Map()
  let scannedCount = 0
  const suppressionHitTracker = createSuppressionHitTracker()

  for (const abs of allFiles) {
    const repoPath = toRepoPath(abs, paths.projectRoot)
    if (delta.enabled && !delta.changedFiles.has(repoPath)) continue

    scannedCount++
    const raw = fs.readFileSync(abs, 'utf-8')
    let content = extractScriptContent(raw, abs)
    let lineOffset = 0
    if (abs.endsWith('.vue')) {
      const extracted = extractVueScriptWithLineOffset(raw)
      if (extracted) {
        content = extracted.scriptContent
        lineOffset = extracted.startLineInFile
      }
    }

    if (content.trim().length === 0) continue

    const virtualPath = abs.endsWith('.vue') ? abs.replace(/\.vue$/, '.vue.ts') : abs
    let sourceFile
    let getLine
    const created = await createSourceFileFromContent(virtualPath, content, { lineOffset })
    sourceFile = created.sourceFile
    getLine = created.getLine

    const valueImports = collectValueImportsFromAst(sourceFile, getLine)
    for (const imp of valueImports) {
      if (!imp.specifier.startsWith('.') && !imp.specifier.startsWith('@/')) continue
      const targetAbs = resolveSpecifierToAbs(imp.specifier, abs, paths.clientSrc)
      if (!targetAbs) continue
      const targetRepo = toRepoPath(targetAbs, paths.projectRoot)
      if (!targetRepo.startsWith('client/src') && !targetRepo.startsWith('server/src')) continue
      if (targetRepo.endsWith('.d.ts')) continue
      if (!isTypeOnlyFile(targetAbs, typedProject, SyntaxKind)) continue
      for (const sym of imp.symbols) {
        const result = checkConfigAllowlist(repoPath, 'value-import-from-type-only-file', imp.lineNumber, configAllowlist)
        if (result.allowed) {
          if (result.entryKey) suppressionHitTracker.add(result.entryKey, 'value-import-from-type-only-file')
        } else {
          valueImportFromTypeOnlyFile.push({
            file: repoPath,
            lineNumber: imp.lineNumber,
            specifier: imp.specifier,
            symbol: sym,
            sourceFile: targetRepo,
          })
          fileScores.set(repoPath, (fileScores.get(repoPath) || 0) + 2)
        }
      }
    }

    const typeOnlyNames = collectTypeOnlyImportNamesFromAst(sourceFile)
    if (typeOnlyNames.size > 0) {
      const detectorCandidates = collectTypeUsedAsValueFromAst(sourceFile, typeOnlyNames, getLine, SyntaxKind)
      const validate = (c) => validateTypeUsedAsValueCandidate(c, abs, typedProject, typeChecker, { SyntaxKind })
      const { passed: validatorFindings } = runTwoPhaseFilter(detectorCandidates, validate)
      for (const u of validatorFindings) {
        const result = checkConfigAllowlist(repoPath, 'type-used-as-value', u.lineNumber, configAllowlist)
        if (result.allowed) {
          if (result.entryKey) suppressionHitTracker.add(result.entryKey, 'type-used-as-value')
        } else {
          const finding = {
            file: repoPath,
            lineNumber: u.lineNumber,
            symbol: u.symbol,
            detectionStage: u.detectionStage,
          }
          typeUsedAsValue.push(
            enrichFinding(finding, {
              confidence: typedProject && typeChecker ? CONFIDENCE_LEVELS.HIGH : undefined,
            })
          )
          fileScores.set(repoPath, (fileScores.get(repoPath) || 0) + 2)
        }
      }
    }
  }

  const files = Array.from(fileScores.entries())
    .map(([file, score]) => ({ file, score }))
    .sort((a, b) => b.score - a.score)

  const result = {
    instructionsForAi: AUDIT_REPORT_AI_INSTRUCTIONS_COMBINED,
    generatedAt: new Date().toISOString(),
    totalScanned: scannedCount,
    ...(delta.enabled ? { deltaMode: true, baseRef: delta.baseRef } : {}),
    valueImportFromTypeOnlyFile,
    typeUsedAsValue,
    files,
    suppressionHits: suppressionHitTracker.getCounts(),
  }

  const { outJson, outMd } = writeAuditReports('type-import', result, renderMarkdownReport(result))

  console.log(`Wrote:\n- ${toRepoPath(outJson, paths.projectRoot)}\n- ${toRepoPath(outMd, paths.projectRoot)}`)
  console.log(
    `value-import-from-type-only-file: ${valueImportFromTypeOnlyFile.length}, type-used-as-value: ${typeUsedAsValue.length}`
  )
  process.exitCode = 0
}

function renderMarkdownReport(data) {
  const lines = []
  lines.push('# Type-Import Audit (Generated)')
  lines.push('')
  lines.push(...getAuditReportHeaderLines())
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Files scanned: **${data.totalScanned}**`)
  lines.push(`- value-import-from-type-only-file: **${(data.valueImportFromTypeOnlyFile ?? []).length}**`)
  lines.push(`- type-used-as-value: **${(data.typeUsedAsValue ?? []).length}**`)
  lines.push('')

  if ((data.valueImportFromTypeOnlyFile ?? []).length > 0) {
    lines.push('## value-import-from-type-only-file')
    lines.push('')
    lines.push('| File | Line | Specifier | Symbol | Source |')
    lines.push('| --- | ---: | --- | --- | --- |')
    for (const f of data.valueImportFromTypeOnlyFile.slice(0, 50)) {
      lines.push(`| \`${f.file}\` | ${f.lineNumber} | \`${f.specifier}\` | ${f.symbol} | \`${f.sourceFile}\` |`)
    }
    if (data.valueImportFromTypeOnlyFile.length > 50) {
      lines.push(`| *...and ${data.valueImportFromTypeOnlyFile.length - 50} more* | | | | |`)
    }
    lines.push('')
  }

  if ((data.typeUsedAsValue ?? []).length > 0) {
    lines.push('## type-used-as-value')
    lines.push('')
    lines.push('| File | Line | Symbol |')
    lines.push('| --- | ---: | --- |')
    for (const f of data.typeUsedAsValue.slice(0, 50)) {
      lines.push(`| \`${f.file}\` | ${f.lineNumber} | ${f.symbol} |`)
    }
    if (data.typeUsedAsValue.length > 50) {
      lines.push(`| *...and ${data.typeUsedAsValue.length - 50} more* | | |`)
    }
    lines.push('')
  }

  if ((data.files ?? []).length > 0) {
    lines.push('## Files by finding count (score)')
    lines.push('')
    lines.push('| File | Score |')
    lines.push('| --- | ---: |')
    for (const f of data.files.slice(0, 25)) {
      lines.push(`| \`${f.file}\` | ${f.score} |`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
