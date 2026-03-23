import fs from 'node:fs'
import {
  getAuditReportHeaderLines,
  loadCentralAllowlist,
  listAuditFiles,
  resolveAuditPaths,
  writeAuditReports,
  toRepoPath as toRepoPathUtil,
  parseChangedOnlyFlag,
  parseInlineExceptions,
  isMatchAllowed,
} from './shared-audit-utils.mjs'
import {
  clearParseCache,
  createSourceFileFromContent,
  extractVueScriptWithLineOffset,
  forEachDescendant,
  loadTsMorph,
} from './shared-ast-facade.mjs'

/**
 * Dual-role export audit — symbols that are defined, referenced in-file, and exported.
 *
 * Signal for extraction (helpers) or naming / public vs internal API clarity.
 *
 * Output: client/.audit-reports/dual-role-export-audit.{json,md}
 *
 * Suppressions:
 * - Central: audit-global-config.json allowlists.dual-role-export
 * - Inline (declaration line): `// @audit-allow:dual-role-export:<ruleId> - reason`
 *   ruleIds: `value-used-and-exported`, `type-used-and-exported`
 *
 * Performance: skips files with at most one top-level `export` line (unless reportTypeExports);
 * uses ts-morph `getSymbol()` + in-file identifier walk (not findReferences). ~2–3 min full-repo.
 */

const AUDIT_TYPE = 'dual-role-export'

function toRepoPath(absPath, projectRoot) {
  return toRepoPathUtil(absPath, projectRoot)
}

/** POSIX wc -l style line count */
function countLinesWcStyle(content) {
  const parts = content.split(/\r?\n/)
  if (parts.length > 0 && parts[parts.length - 1] === '') {
    return parts.length - 1
  }
  return parts.length
}

/**
 * Fast skip: dual-role value findings require 2+ named value exports or (per config) long files.
 * If there is at most one top-level export line and no `export { a, b }` local clause, AST cannot yield
 * multiple named value exports — skip ts-morph (type findings are off by default).
 * @param {string} scriptContent
 */
function likelyAtMostOneExportLine(scriptContent) {
  if (/\bexport\s*\{[^}]*,[^}]*\}\s*(?!from\b)/.test(scriptContent)) return false
  const lines = scriptContent.match(/^\s*export\s+/gm) || []
  return lines.length <= 1
}

/**
 * @param {import('ts-morph').Node} node
 * @param {typeof import('ts-morph').Node} Node
 */
function isDeclarationInFile(node, sourceFile) {
  try {
    return node.getSourceFile() === sourceFile
  } catch {
    return false
  }
}

/**
 * @param {import('ts-morph').Node} node
 * @param {typeof import('ts-morph').Node} Node
 */
function isValueDeclaration(node, Node, excludeEnums) {
  if (Node.isFunctionDeclaration(node)) return true
  if (Node.isClassDeclaration(node)) return true
  if (Node.isVariableDeclaration(node)) return true
  if (Node.isModuleDeclaration(node) && node.getNameNode()) return true
  if (Node.isEnumDeclaration(node)) return !excludeEnums
  return false
}

/**
 * @param {import('ts-morph').Node} node
 * @param {typeof import('ts-morph').Node} Node
 */
function isTypeDeclaration(node, Node) {
  return Node.isInterfaceDeclaration(node) || Node.isTypeAliasDeclaration(node)
}

/**
 * @param {import('ts-morph').Node} node
 * @param {typeof import('ts-morph').Node} Node
 */
function getDeclarationNameNode(node, Node) {
  if (Node.isVariableDeclaration(node)) return node.getNameNode()
  if (Node.isFunctionDeclaration(node)) return node.getNameNode()
  if (Node.isClassDeclaration(node)) return node.getNameNode()
  if (Node.isEnumDeclaration(node)) return node.getNameNode()
  if (Node.isInterfaceDeclaration(node)) return node.getNameNode()
  if (Node.isTypeAliasDeclaration(node)) return node.getNameNode()
  if (Node.isModuleDeclaration(node)) return node.getNameNode()
  return undefined
}

/**
 * Same-file uses of the symbol declared at nameNode, excluding declaration name identifiers.
 * Uses ts-morph getSymbol() (in-memory Project TypeChecker often returns undefined for export names).
 * @param {import('ts-morph').Identifier} nameNode
 * @param {import('ts-morph').SourceFile} sourceFile
 * @param {typeof import('ts-morph').Node} Node
 * @param {typeof import('typescript')} ts
 */
function countInternalReferences(nameNode, sourceFile, Node, ts) {
  const raw = nameNode.getSymbol()
  const target = raw?.getAliasedSymbol?.() ?? raw
  if (!target) return 0

  function isBindingName(id) {
    const p = id.getParent()
    if (Node.isVariableDeclaration(p) && p.getNameNode() === id) return true
    if (p.getKind() === ts.SyntaxKind.Parameter && p.getNameNode() === id) return true
    if (Node.isFunctionDeclaration(p) && p.getNameNode() === id) return true
    if (Node.isClassDeclaration(p) && p.getNameNode() === id) return true
    if (Node.isEnumDeclaration(p) && p.getNameNode() === id) return true
    if (Node.isInterfaceDeclaration(p) && p.getNameNode() === id) return true
    if (Node.isTypeAliasDeclaration(p) && p.getNameNode() === id) return true
    if (Node.isModuleDeclaration(p) && p.getNameNode() === id) return true
    return false
  }

  const nameText = nameNode.getText()
  let count = 0
  forEachDescendant(sourceFile, (n) => {
    if (n.getKind() !== ts.SyntaxKind.Identifier) return
    /** @type {import('ts-morph').Identifier} */
    const id = /** @type {*} */ (n)
    if (id.getText() !== nameText) return
    if (isBindingName(id)) return
    const sym = id.getSymbol()
    const eff = sym?.getAliasedSymbol?.() ?? sym
    if (eff === target) count++
  })
  return count
}

/**
 * @param {import('ts-morph').SourceFile} sourceFile
 * @param {typeof import('ts-morph').Node} Node
 * @param {{ excludeEnums: boolean }} opts
 * @returns {number}
 */
function countNamedValueExportNames(sourceFile, Node, opts) {
  let n = 0
  for (const [exportName, decls] of sourceFile.getExportedDeclarations()) {
    if (exportName === 'default') continue
    const list = Array.isArray(decls) ? decls : [decls]
    let hasValue = false
    for (const d of list) {
      const node = Array.isArray(d) ? d[0] : d
      if (!node || !isDeclarationInFile(node, sourceFile)) continue
      if (isValueDeclaration(node, Node, opts.excludeEnums)) hasValue = true
    }
    if (hasValue) n++
  }
  return n
}

/**
 * @param {import('ts-morph').SourceFile} sourceFile
 * @param {typeof import('ts-morph').Node} Node
 * @param {typeof import('typescript')} ts
 * @param {(node: import('ts-morph').Node) => number} getLine
 * @param {string} repoPath
 * @param {object} cfg
 * @returns {{ findings: object[], rawCandidates: number }}
 */
function collectFindings(sourceFile, Node, ts, getLine, repoPath, cfg) {
  const findings = []
  let rawCandidates = 0

  const namedValueExportNames = countNamedValueExportNames(sourceFile, Node, {
    excludeEnums: cfg.excludeEnums,
  })

  const lineCount = countLinesWcStyle(sourceFile.getFullText())
  const skipValueForFile =
    namedValueExportNames <= cfg.maxNamedValueExportsForSkip ||
    (namedValueExportNames < cfg.minExports && lineCount < cfg.minLines)

  const onlyDefaultExport =
    [...sourceFile.getExportedDeclarations().keys()].length === 1 &&
    sourceFile.getExportedDeclarations().has('default')

  const skipDefaultPath = cfg.excludeDefaultExport && onlyDefaultExport

  for (const [exportName, decls] of sourceFile.getExportedDeclarations()) {
    const list = Array.isArray(decls) ? decls : [decls]
    for (const d of list) {
      const node = Array.isArray(d) ? d[0] : d
      if (!node || !isDeclarationInFile(node, sourceFile)) continue

      const nameNode = getDeclarationNameNode(node, Node)
      if (!nameNode || !Node.isIdentifier(nameNode)) continue

      const isDefaultExportName = exportName === 'default'
      const ruleValue = 'value-used-and-exported'
      const ruleType = 'type-used-and-exported'

      const isValue = isValueDeclaration(node, Node, cfg.excludeEnums)
      const isType = isTypeDeclaration(node, Node)

      if (isValue) {
        rawCandidates++
        if (skipValueForFile) continue
        if (isDefaultExportName && skipDefaultPath) continue
        const internalRefCount = countInternalReferences(nameNode, sourceFile, Node, ts)
        if (internalRefCount < cfg.minInternalRefs) continue
        const lineNumber = getLine(nameNode)
        findings.push({
          file: repoPath,
          lineNumber,
          ruleId: ruleValue,
          symbol: nameNode.getText(),
          kind: node.getKindName(),
          internalRefCount,
          exportName,
        })
      } else if (isType && cfg.reportTypeExports) {
        rawCandidates++
        const internalRefCount = countInternalReferences(nameNode, sourceFile, Node, ts)
        if (internalRefCount < cfg.minInternalRefs) continue
        const lineNumber = getLine(nameNode)
        findings.push({
          file: repoPath,
          lineNumber,
          ruleId: ruleType,
          symbol: nameNode.getText(),
          kind: node.getKindName(),
          internalRefCount,
          exportName,
        })
      }
    }
  }

  return { findings, rawCandidates }
}

function mergeConfig(base, fileConfig) {
  return {
    minLines: Number(fileConfig?.thresholds?.minLines ?? base.minLines),
    minExports: Number(fileConfig?.thresholds?.minExports ?? base.minExports),
    maxNamedValueExportsForSkip: Number(
      fileConfig?.thresholds?.maxNamedValueExportsForSkip ?? base.maxNamedValueExportsForSkip,
    ),
    minInternalRefs: Number(fileConfig?.thresholds?.minInternalRefs ?? base.minInternalRefs),
    reportTypeExports: Boolean(fileConfig?.thresholds?.reportTypeExports ?? base.reportTypeExports),
    excludeEnums: Boolean(fileConfig?.thresholds?.excludeEnums ?? base.excludeEnums),
    excludeDefaultExport: Boolean(
      fileConfig?.thresholds?.excludeDefaultExport ?? base.excludeDefaultExport,
    ),
  }
}

const DEFAULT_THRESHOLDS = {
  minLines: 120,
  minExports: 2,
  /** If named value exports are at most this many, skip all value findings (composable pattern). */
  maxNamedValueExportsForSkip: 1,
  minInternalRefs: 1,
  reportTypeExports: false,
  excludeEnums: false,
  excludeDefaultExport: true,
}

function filterWithAllowlists(findings, repoPath, fullContent, configAllowlist) {
  const inline = parseInlineExceptions(fullContent, AUDIT_TYPE)
  const kept = []
  const suppressed = []
  const lines = fullContent.split('\n')
  for (const f of findings) {
    const lineContent = lines[f.lineNumber - 1] ?? ''
    const allowed = isMatchAllowed(
      repoPath,
      f.ruleId,
      f.lineNumber,
      inline,
      configAllowlist,
      lineContent,
    )
    if (allowed.allowed) {
      suppressed.push({
        ...f,
        suppression: { source: allowed.source, reason: allowed.reason },
      })
    } else {
      kept.push(f)
    }
  }
  return { kept, suppressed }
}

function aggregateFiles(keptFindings) {
  /** @type {Map<string, { repoPath: string, score: number, symbols: object[] }>} */
  const byFile = new Map()
  for (const f of keptFindings) {
    if (!byFile.has(f.file)) {
      byFile.set(f.file, { repoPath: f.file, score: 0, symbols: [] })
    }
    const entry = byFile.get(f.file)
    entry.score += 1 + Math.min(3, Math.floor(f.internalRefCount / 2))
    entry.symbols.push({
      symbol: f.symbol,
      ruleId: f.ruleId,
      lineNumber: f.lineNumber,
      internalRefCount: f.internalRefCount,
      kind: f.kind,
    })
  }
  return [...byFile.values()].sort((a, b) => b.score - a.score || a.repoPath.localeCompare(b.repoPath))
}

function renderMarkdownReport(files, keptFindings, totalScanned, configSnapshot, delta) {
  const lines = []
  lines.push(...getAuditReportHeaderLines())
  lines.push('# Dual-role export audit (generated)')
  lines.push('')
  lines.push('Generated by `client/.scripts/dual-role-export-audit.mjs`.')
  lines.push('')
  lines.push('**Signal:** exported symbol is also referenced elsewhere in the same module — consider a helper file or clearer public vs internal boundary.')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Files scanned: **${totalScanned}**`)
  lines.push(`- Findings (after allowlist): **${keptFindings.length}**`)
  lines.push(`- Files with findings: **${files.length}**`)
  if (delta?.enabled) {
    lines.push(`- Delta mode: base \`${delta.baseRef}\``)
  }
  lines.push('')
  lines.push('### Thresholds used')
  lines.push('')
  lines.push('```json')
  lines.push(JSON.stringify(configSnapshot, null, 2))
  lines.push('```')
  lines.push('')
  lines.push('## Top files')
  lines.push('')
  lines.push('| File | Score | Symbols |')
  lines.push('| --- | ---: | --- |')
  for (const f of files.slice(0, 40)) {
    const sym = f.symbols.map((s) => `${s.symbol}(${s.ruleId})`).join(', ')
    lines.push(`| \`${f.repoPath}\` | ${f.score} | ${sym.slice(0, 200)}${sym.length > 200 ? '…' : ''} |`)
  }
  if (files.length > 40) {
    lines.push('')
    lines.push(`*…and ${files.length - 40} more files.*`)
  }
  lines.push('')
  lines.push('## Findings (first 80)')
  lines.push('')
  for (const x of keptFindings.slice(0, 80)) {
    lines.push(
      `- \`${x.file}\`:${x.lineNumber} **${x.symbol}** (${x.kind}) — ${x.ruleId}, internal refs: ${x.internalRefCount}`,
    )
  }
  if (keptFindings.length > 80) {
    lines.push('')
    lines.push(`*…and ${keptFindings.length - 80} more (see JSON).*`)
  }
  lines.push('')
  return lines.join('\n')
}

async function main() {
  const paths = resolveAuditPaths(AUDIT_TYPE)
  const configAllowlist = loadCentralAllowlist(AUDIT_TYPE)
  const delta = parseChangedOnlyFlag(process.argv, paths.projectRoot)

  let fileConfig = {}
  try {
    fileConfig = JSON.parse(fs.readFileSync(paths.configPath, 'utf8'))
  } catch {
    /* optional */
  }

  const cfg = mergeConfig(DEFAULT_THRESHOLDS, fileConfig)
  const configSnapshot = { thresholds: cfg }

  const tsMorph = await import('ts-morph')
  const ts = await import('typescript')
  const { Node } = tsMorph
  await loadTsMorph()

  const absFiles = listAuditFiles(AUDIT_TYPE, [paths.clientSrc, paths.serverSrc])
  const allFindings = []
  const allSuppressed = []

  for (const abs of absFiles) {
    const repoPath = toRepoPath(abs, paths.projectRoot)
    if (delta.enabled && !delta.changedFiles.has(repoPath)) continue

    let fullContent
    try {
      fullContent = fs.readFileSync(abs, 'utf8')
    } catch (err) {
      if (err && err.code === 'ENOENT') continue
      throw err
    }
    let scriptContent = fullContent
    let lineOffset = 0
    if (abs.endsWith('.vue')) {
      const extracted = extractVueScriptWithLineOffset(fullContent)
      if (!extracted || extracted.scriptContent.trim() === '') continue
      scriptContent = extracted.scriptContent
      lineOffset = extracted.startLineInFile
    }

    if (!cfg.reportTypeExports && likelyAtMostOneExportLine(scriptContent)) continue

    const virtualPath = abs.endsWith('.vue') ? abs.replace(/\.vue$/, '.vue.ts') : abs
    const { sourceFile, getLine } = await createSourceFileFromContent(virtualPath, scriptContent, {
      lineOffset,
      // Never cache: full-repo runs OOM if hundreds of SourceFiles stay in parseCache / Project graphs.
      useCache: false,
    })

    try {
      const { findings } = collectFindings(sourceFile, Node, ts, getLine, repoPath, cfg)
      if (findings.length > 0) {
        const { kept, suppressed } = filterWithAllowlists(findings, repoPath, fullContent, configAllowlist)
        allFindings.push(...kept)
        allSuppressed.push(...suppressed)
      }
    } finally {
      try {
        if (typeof sourceFile.forget === 'function') sourceFile.forget()
      } catch {
        /* ignore */
      }
      clearParseCache()
    }
  }

  allFindings.sort(
    (a, b) =>
      a.file.localeCompare(b.file) ||
      a.lineNumber - b.lineNumber ||
      a.symbol.localeCompare(b.symbol),
  )

  const files = aggregateFiles(allFindings)

  const out = {
    generatedAt: new Date().toISOString(),
    totalScanned: absFiles.length,
    configSnapshot,
    ...(delta.enabled ? { deltaMode: true, baseRef: delta.baseRef } : {}),
    findings: allFindings,
    suppressed: allSuppressed,
    files,
  }

  const md = renderMarkdownReport(files, allFindings, absFiles.length, configSnapshot, delta)
  const { outJson, outMd } = writeAuditReports(AUDIT_TYPE, out, md)

  console.log(`Wrote:\n- ${toRepoPath(outJson, paths.projectRoot)}\n- ${toRepoPath(outMd, paths.projectRoot)}`)
  console.log(`Findings: ${allFindings.length} (suppressed: ${allSuppressed.length})`)
  process.exitCode = 0
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
