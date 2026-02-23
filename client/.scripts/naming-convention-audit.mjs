import fs from 'node:fs'
import path from 'node:path'
import {
  getAuditReportHeaderLines,
  loadCentralAllowlist,
  listAuditFiles,
  resolveAuditPaths,
  writeAuditReports,
  toRepoPath as toRepoPathUtil,
  categorizeMatches,
  summarizeExceptions,
  renderAllowedExceptionsSection,
  parseChangedOnlyFlag,
} from './shared-audit-utils.mjs'
import {
  createSourceFileFromContent,
  extractVueScriptWithLineOffset,
  loadTsMorph,
} from './shared-ast-facade.mjs'

/**
 * Naming Convention Audit Script
 *
 * Goal: Enforce consistent naming across the codebase: PascalCase components,
 * use-prefix composables, UPPER_SNAKE constants, camelCase functions, etc.
 *
 * Scope: client/src and server/src (ts, js, vue, mjs).
 *
 * Output:
 *   - client/.audit-reports/naming-convention-audit.json
 *   - client/.audit-reports/naming-convention-audit.md
 */

const AUDIT_TYPE = 'naming-convention'

function toRepoPath(p, projectRoot) { return toRepoPathUtil(p, projectRoot) }

const PASCAL = /^[A-Z][a-zA-Z0-9]*$/
const CAMEL = /^[a-z][a-zA-Z0-9]*$/
const UPPER_SNAKE = /^[A-Z][A-Z0-9_]*$/
const USE_PREFIX = /^use[A-Z][a-zA-Z0-9]*$/

function checkFileName(repoPath, fileName) {
  const violations = []
  if (fileName.endsWith('.vue')) {
    const base = fileName.slice(0, -4)
    if (!PASCAL.test(base) && base.length > 0) {
      violations.push({ ruleId: 'componentFileName', lineNumber: 1, message: `Component file should be PascalCase: ${fileName}` })
    }
  }
  if (repoPath.includes('/composables/') && (fileName.endsWith('.ts') || fileName.endsWith('.js'))) {
    const base = fileName.replace(/\.[jt]s$/, '')
    if (!USE_PREFIX.test(base) && base.length > 0) {
      violations.push({ ruleId: 'composableFileName', lineNumber: 1, message: `Composable file should be use[Name].ts: ${fileName}` })
    }
  }
  if (repoPath.includes('/constants/') && (fileName.endsWith('.ts') || fileName.endsWith('.js'))) {
    const base = fileName.replace(/\.[jt]s$/, '')
    if (!CAMEL.test(base) && !UPPER_SNAKE.test(base) && base.length > 0) {
      violations.push({ ruleId: 'constantsFileName', lineNumber: 1, message: `Constants file should be camelCase or UPPER_SNAKE: ${fileName}` })
    }
  }
  if (repoPath.includes('/types/') && (fileName.endsWith('.ts') || fileName.endsWith('.js'))) {
    const base = fileName.replace(/\.[jt]s$/, '')
    if (!CAMEL.test(base) && base.length > 0 && !base.includes('.d.')) {
      violations.push({ ruleId: 'typesFileName', lineNumber: 1, message: `Types file should be camelCase: ${fileName}` })
    }
  }
  return violations
}

const EXPORT_FUNCTION_RE = /^\s*export\s+function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/gm
const EXPORT_CONST_RE = /^\s*export\s+const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/gm

/**
 * AST: collect export naming findings (const, function, type, interface).
 * Returns same shape as checkExports: { ruleId, lineNumber, line }[].
 */
function collectExportFindingsFromAst(sourceFile, getLine, repoPath, SyntaxKind) {
  const findings = []
  const isConstantsFile = repoPath.includes('/constants/')
  const isComposablesFile = repoPath.includes('/composables/')

  const exported = sourceFile.getExportedDeclarations?.()
  if (!exported) return findings

  for (const [name, decls] of exported) {
    if (!name || name === 'default') continue
    for (const decl of decls) {
      const lineNum = getLine(decl)
      const lineSnippet = (typeof decl.getText === 'function' ? decl.getText() : '').trim().slice(0, 80) || name
      const kind = typeof decl.getKind === 'function' ? decl.getKind() : null

      if (kind === SyntaxKind.VariableDeclaration) {
        if (isConstantsFile && !UPPER_SNAKE.test(name)) {
          findings.push({ ruleId: 'constantExport', lineNumber: lineNum, line: lineSnippet })
        }
        continue
      }
      if (kind === SyntaxKind.FunctionDeclaration) {
        if (isComposablesFile && !USE_PREFIX.test(name)) {
          findings.push({ ruleId: 'composableExport', lineNumber: lineNum, line: lineSnippet })
        } else if (!isComposablesFile && !CAMEL.test(name)) {
          findings.push({ ruleId: 'functionExport', lineNumber: lineNum, line: lineSnippet })
        }
        continue
      }
      if (kind === SyntaxKind.TypeAliasDeclaration || kind === SyntaxKind.InterfaceDeclaration) {
        if (!PASCAL.test(name)) {
          findings.push({ ruleId: 'typeExport', lineNumber: lineNum, line: lineSnippet })
        }
      }
    }
  }

  return findings
}

function checkExports(content, repoPath, lineOffset) {
  const matches = []
  const isConstantsFile = repoPath.includes('/constants/')
  const isComposablesFile = repoPath.includes('/composables/')
  const reConst = /^\s*export\s+const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/gm
  const reFunc = /^\s*export\s+function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/gm
  const reType = /^\s*export\s+type\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/gm
  const reIface = /^\s*export\s+interface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\{/gm
  let m
  while ((m = reConst.exec(content)) !== null) {
    const name = m[1]
    const lineNum = content.slice(0, m.index).split('\n').length + lineOffset
    if (isConstantsFile && !UPPER_SNAKE.test(name) && name !== 'default') {
      matches.push({ ruleId: 'constantExport', lineNumber: lineNum, line: m[0].trim().slice(0, 80) })
    }
  }
  while ((m = reFunc.exec(content)) !== null) {
    const name = m[1]
    const lineNum = content.slice(0, m.index).split('\n').length + lineOffset
    if (isComposablesFile && !USE_PREFIX.test(name)) {
      matches.push({ ruleId: 'composableExport', lineNumber: lineNum, line: m[0].trim().slice(0, 80) })
    } else if (!isComposablesFile && !CAMEL.test(name) && name !== 'default') {
      matches.push({ ruleId: 'functionExport', lineNumber: lineNum, line: m[0].trim().slice(0, 80) })
    }
  }
  while ((m = reType.exec(content)) !== null) {
    const name = m[1]
    const lineNum = content.slice(0, m.index).split('\n').length + lineOffset
    if (!PASCAL.test(name)) matches.push({ ruleId: 'typeExport', lineNumber: lineNum, line: m[0].trim().slice(0, 80) })
  }
  while ((m = reIface.exec(content)) !== null) {
    const name = m[1]
    const lineNum = content.slice(0, m.index).split('\n').length + lineOffset
    if (!PASCAL.test(name)) matches.push({ ruleId: 'typeExport', lineNumber: lineNum, line: m[0].trim().slice(0, 80) })
  }
  return matches
}

function checkComposableSemanticNaming(content, repoPath, lineOffset) {
  if (!repoPath.includes('/composables/')) return []
  const matches = []
  const hasReactive = /\b(computed|ref|watch)\s*\(/.test(content) || /\buse(Query|Mutation)\b/.test(content)
  const hasWatchers = /\bwatch\s*\(/.test(content) || /\bwatchEffect\s*\(/.test(content)

  EXPORT_FUNCTION_RE.lastIndex = 0
  let m
  while ((m = EXPORT_FUNCTION_RE.exec(content)) !== null) {
    const name = m[1]
    const lineNum = (content.slice(0, m.index).split('\n').length) + lineOffset
    if (!USE_PREFIX.test(name)) continue
    if (/use.*(Model|ViewModel)$/i.test(name) && !hasReactive) {
      matches.push({ ruleId: 'composableSemanticModel', lineNumber: lineNum, line: `Export ${name}: name implies reactive but file appears non-reactive` })
    }
    if (name.includes('Config') && hasWatchers) {
      matches.push({ ruleId: 'composableSemanticConfig', lineNumber: lineNum, line: `Export ${name}: name implies pure config but file uses watchers` })
    }
  }
  EXPORT_CONST_RE.lastIndex = 0
  while ((m = EXPORT_CONST_RE.exec(content)) !== null) {
    const name = m[1]
    const lineNum = (content.slice(0, m.index).split('\n').length) + lineOffset
    if (!USE_PREFIX.test(name)) continue
    if (/use.*(Model|ViewModel)$/i.test(name) && !hasReactive) {
      matches.push({ ruleId: 'composableSemanticModel', lineNumber: lineNum, line: `Export ${name}: name implies reactive but file appears non-reactive` })
    }
    if (name.includes('Config') && hasWatchers) {
      matches.push({ ruleId: 'composableSemanticConfig', lineNumber: lineNum, line: `Export ${name}: name implies pure config but file uses watchers` })
    }
  }
  return matches
}

function renderMarkdownReport(scanned, exceptionSummary) {
  const lines = []
  lines.push(...getAuditReportHeaderLines())
  lines.push('# Naming Convention Audit (Generated)')
  lines.push('')
  lines.push(`Generated at: ${new Date().toISOString()}`)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Total allowed: **${exceptionSummary.totalAllowed}**`)
  lines.push(`- Requiring review: **${exceptionSummary.totalRequiresReview}**`)
  lines.push('')
  const withFindings = scanned.filter(f => f.requiresReview.length > 0)
  lines.push('## Files with naming violations')
  lines.push('')
  if (withFindings.length === 0) {
    lines.push('None.')
  } else {
    lines.push('| File | Rule | Line | Snippet |')
    lines.push('| --- | --- | ---: | --- |')
    for (const f of withFindings.slice(0, 60)) {
      for (const m of f.requiresReview) {
        const snippet = (m.line || '').slice(0, 50)
        lines.push(`| \`${f.repoPath}\` | ${m.ruleId} | ${m.lineNumber} | ${snippet} |`)
      }
    }
    if (withFindings.length > 60) {
      lines.push('')
      lines.push(`*...and more files.*`)
    }
  }
  lines.push('')
  lines.push(...renderAllowedExceptionsSection(scanned.filter(f => f.allowed.length > 0)))
  return lines.join('\n')
}

async function main() {
  const paths = resolveAuditPaths(AUDIT_TYPE)
  const configAllowlist = loadCentralAllowlist('naming-convention')
  const delta = parseChangedOnlyFlag(process.argv, paths.projectRoot)

  const { SyntaxKind } = await loadTsMorph()

  const allFiles = listAuditFiles(AUDIT_TYPE, [paths.clientSrc, paths.serverSrc])
  const scanned = []

  for (const abs of allFiles) {
    const repoPath = toRepoPath(abs, paths.projectRoot)
    if (delta.enabled && !delta.changedFiles.has(repoPath)) continue

    const content = fs.readFileSync(abs, 'utf8')
    const fileName = path.basename(abs)
    const fileViolations = checkFileName(repoPath, fileName)

    let exportMatches
    const useAst = process.env.AUDIT_NAMING_USE_AST === '1' && /\.(ts|tsx)$/i.test(abs)
    if (useAst) {
      let scriptContent = content
      let lineOffset = 0
      if (abs.endsWith('.vue')) {
        const extracted = extractVueScriptWithLineOffset(content)
        if (extracted) {
          scriptContent = extracted.scriptContent
          lineOffset = extracted.startLineInFile
        }
      }
      if (scriptContent.trim().length > 0) {
        const virtualPath = abs.endsWith('.vue') ? abs.replace(/\.vue$/, '.vue.ts') : abs
        const { sourceFile, getLine } = await createSourceFileFromContent(virtualPath, scriptContent, { lineOffset, useCache: false })
        exportMatches = collectExportFindingsFromAst(sourceFile, getLine, repoPath, SyntaxKind)
      } else {
        exportMatches = []
      }
    } else {
      exportMatches = checkExports(content, repoPath, 0)
    }

    const composableSemanticMatches = checkComposableSemanticNaming(content, repoPath, 0)

    const matches = [
      ...fileViolations.map(v => ({ ruleId: v.ruleId, lineNumber: v.lineNumber, line: v.message })),
      ...exportMatches,
      ...composableSemanticMatches,
    ]
    if (matches.length === 0) continue

    const { allowed, requiresReview } = categorizeMatches(matches, repoPath, content, AUDIT_TYPE, configAllowlist)
    scanned.push({
      repoPath,
      allowed,
      requiresReview,
    })
  }

  const exceptionSummary = summarizeExceptions(scanned)
  const totalScanned = allFiles.length
  const files = scanned
    .filter(f => f.requiresReview.length > 0)
    .map(f => ({
      repoPath: f.repoPath,
      score: f.requiresReview.length * 2,
      priority: f.requiresReview.length >= 5 ? 'P0' : f.requiresReview.length >= 2 ? 'P1' : 'P2',
      count: f.requiresReview.length,
    }))
    .sort((a, b) => b.score - a.score || a.repoPath.localeCompare(b.repoPath))

  const out = {
    generatedAt: new Date().toISOString(),
    totalScanned,
    ...(delta.enabled ? { deltaMode: true, baseRef: delta.baseRef } : {}),
    exceptionSummary,
    files,
    scanned: scanned.filter(f => f.requiresReview.length > 0 || f.allowed.length > 0),
  }

  const { outJson, outMd } = writeAuditReports(AUDIT_TYPE, out, renderMarkdownReport(scanned, exceptionSummary))

  console.log('Wrote:', toRepoPath(outJson, paths.projectRoot), toRepoPath(outMd, paths.projectRoot))
  console.log(`Naming violations: ${exceptionSummary.totalRequiresReview} (allowed: ${exceptionSummary.totalAllowed})`)
  process.exitCode = 0
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
