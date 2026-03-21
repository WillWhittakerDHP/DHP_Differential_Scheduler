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
  AUDIT_REPORT_AI_INSTRUCTIONS_COMBINED,
  getAuditReportHeaderLines,
} from './shared-audit-utils.mjs'
import {
  createSourceFileFromContent,
  createTypedProject,
  extractVueScriptWithLineOffset,
  forEachDescendant,
  getTypeFromTypeNode,
  getTypeOfNode,
  loadTsMorph,
} from './shared-ast-facade.mjs'
import { enrichFinding, CONFIDENCE_LEVELS } from './shared-audit-utils.mjs'

/**
 * Type-Escape Audit Script
 *
 * Surfaces code that can hide or obscure type errors (type assertions, TS directives)
 * so it can be cleaned or justified before relying on typecheck.
 *
 * Rules: as-any, as-unknown, as-unknown-as, ts-ignore, ts-expect-error,
 *         as-keyof-typeof, as-typeof-index, as-keyof-named
 *
 * Scope: client/src and server/src (.ts, .tsx, .vue). For .vue, scan <script> only.
 * Excluded: global exclusions (audit-global-config.json) + central allowlist (audit-global-config.json allowlists.type-escape).
 *
 * Output: .audit-reports/type-escape-audit.json, .audit-reports/type-escape-audit.md
 */

const RULE_WEIGHTS = {
  'as-any': 3,
  'as-unknown': 2,
  'as-unknown-as': 4,
  'function-type': 3,
  'ts-ignore': 2,
  'ts-expect-error': 1,
  'as-keyof-typeof': 2,
  'as-typeof-index': 2,
  'as-keyof-named': 1,
  'as-computed-ref': 2,
  'as-ref': 2,
  'as-writable-computed': 2,
}

function toRepoPath(p, projectRoot) { return toRepoPathUtil(p, projectRoot) }

const RULES = [
  { ruleId: 'as-any', pattern: /\bas\s+any\b/g, message: 'Type assertion to any' },
  { ruleId: 'as-unknown-as', pattern: /\bas\s+unknown\s+as\s+/g, message: 'Double assertion escape hatch' },
  { ruleId: 'as-unknown', pattern: /\bas\s+unknown\b(?!\s+as\s+)/g, message: 'Single as unknown' },
  { ruleId: 'function-type', pattern: /:\s*Function\b/g, message: 'Function type bypasses signature checks' },
  { ruleId: 'ts-ignore', pattern: /@ts-ignore/g, message: 'Suppresses next line' },
  { ruleId: 'ts-expect-error', pattern: /@ts-expect-error/g, message: 'Suppresses next line (expected error)' },
  { ruleId: 'as-keyof-typeof', pattern: /\bas\s+keyof\s+typeof\b/g, message: 'Key type assertion — variable type does not match object key type' },
  { ruleId: 'as-typeof-index', pattern: /\bas\s+\(typeof\s+\w+\)\s*\[/g, message: 'Const array element assertion — value cast to array element type' },
  { ruleId: 'as-keyof-named', pattern: /\bas\s+keyof\s+[A-Z]\w+/g, message: 'Named type key assertion — value asserted as key of specific type' },
  { ruleId: 'as-computed-ref', pattern: /\bas\s+ComputedRef\b/g, message: 'Assertion to ComputedRef — fix source type instead' },
  { ruleId: 'as-ref', pattern: /\bas\s+Ref</g, message: 'Assertion to Ref — fix source type instead' },
  { ruleId: 'as-writable-computed', pattern: /\bas\s+WritableComputedRef\b/g, message: 'Assertion to WritableComputedRef — fix source type instead' },
]

function extractScriptContent(content, absPath) {
  if (!absPath.endsWith('.vue')) return content
  const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/i)
  return scriptMatch ? scriptMatch[1] : ''
}

function snippetFromLine(line, maxLen = 80) {
  const trimmed = line.trim()
  return trimmed.length > maxLen ? trimmed.slice(0, maxLen - 3) + '...' : trimmed
}

/**
 * Classifies key-assertion findings by their likely fix strategy.
 * Returns a short actionable hint string, or undefined for non-key-assertion rules.
 */
function inferFixHint(ruleId, line) {
  if (ruleId === 'function-type') {
    return 'Replace `Function` with explicit callable signature, e.g. `(input: InputType) => ReturnType`'
  }
  if (ruleId === 'as-keyof-typeof') {
    if (/\bfor\s*\(/.test(line) || /\bof\s+/.test(line) || /\bfor\b/.test(line))
      return 'Tighten array to `as const` or define a key union type'
    if (/\bday\b/i.test(line) || /\[\s*\d/.test(line))
      return 'Define a numeric union type for valid indices'
    if (/<\w+>/.test(line))
      return 'Add a type constraint connecting the generic parameter to the object type'
    return 'Type the indexing variable more narrowly to match the object key type'
  }
  if (ruleId === 'as-typeof-index') {
    return 'Use a type guard function instead of asserting into .includes()'
  }
  if (ruleId === 'as-keyof-named') {
    return 'Type the input parameter more narrowly to match the target key type'
  }
  if (ruleId === 'as-computed-ref' || ruleId === 'as-ref' || ruleId === 'as-writable-computed') {
    return 'Fix the composable return type so the assertion is unnecessary.'
  }
  return undefined
}

function inferFunctionTypeLikelyUse(filePath, snippet) {
  const normalizedPath = String(filePath).toLowerCase()
  const normalizedSnippet = String(snippet).toLowerCase()

  if (normalizedPath.includes('notification')) return 'Notification callbacks'
  if (normalizedPath.includes('display')) return 'Display formatters'
  if (normalizedPath.includes('cardaction')) return 'Action callbacks'
  if (normalizedPath.includes('relationshipcollectionfield')) return 'Collection handlers'
  if (normalizedPath.includes('partscollectionfield')) return 'Collection handlers'
  if (normalizedPath.includes('form') || normalizedSnippet.includes('watch(') || normalizedSnippet.includes('watcheffect('))
    return 'Form watchers/handlers'
  if (normalizedSnippet.includes('onsave') || normalizedSnippet.includes('onsubmit') || normalizedSnippet.includes('onclick'))
    return 'Callback/handler params'
  return 'Callback/handler params'
}

function buildFunctionTypeOffenders(findings) {
  const offenders = new Map()
  for (const finding of findings) {
    if (finding.ruleId !== 'function-type') continue
    const current = offenders.get(finding.file) ?? { file: finding.file, count: 0, likelyUse: '' }
    current.count += 1
    if (!current.likelyUse) {
      current.likelyUse = inferFunctionTypeLikelyUse(finding.file, finding.snippet)
    }
    offenders.set(finding.file, current)
  }

  return Array.from(offenders.values()).sort((a, b) => b.count - a.count || a.file.localeCompare(b.file))
}

/**
 * AST-based detection of `: Function` (parameter, property, variable, type-alias).
 * Uses shared AST facade; returns findings in same shape as regex scan for merging.
 *
 * @param {import('ts-morph').SourceFile} sourceFile
 * @param {(node: import('ts-morph').Node) => number} getLine - 1-based line (file line for Vue)
 * @param {string} repoPath
 * @param {(lineNum: number) => string} getLineText - line content by 1-based line number
 * @param {import('./shared-audit-utils.mjs').CentralAllowlist} configAllowlist
 * @returns {Promise<Array<{ file: string, lineNumber: number, ruleId: string, snippet: string, message: string, fixHint?: string }>>}
 */
async function collectAstFunctionTypeFindings(sourceFile, getLine, repoPath, getLineText, configAllowlist) {
  const { SyntaxKind } = await loadTsMorph()
  const findings = []
  const message = 'Function type bypasses signature checks'

  forEachDescendant(sourceFile, (node) => {
    const kind = node.getKind()
    if (kind !== SyntaxKind.TypeReference) return
    const text = node.getText()
    if (text !== 'Function') return

    const lineNum = getLine(node)
    const lineText = getLineText(lineNum) ?? ''
    const result = checkConfigAllowlist(repoPath, 'function-type', lineNum, configAllowlist)
    if (!result.allowed) {
      findings.push({
        file: repoPath,
        lineNumber: lineNum,
        ruleId: 'function-type',
        snippet: snippetFromLine(lineText),
        message,
        fixHint: inferFixHint('function-type', lineText),
      })
    }
  })

  return findings
}

/**
 * Phase B: find an AsExpression node at the given line in the typed project's source file.
 * @param {import('ts-morph').Project} typedProject
 * @param {string} fileAbsPath - Absolute path to the file (use same path as addSourceFileAtPath)
 * @param {number} lineNumber
 * @param {object} SyntaxKind
 * @returns {{ expression: import('ts-morph').Node, asExpression: import('ts-morph').Node } | null}
 */
function getAsExpressionAtLine(typedProject, fileAbsPath, lineNumber, SyntaxKind) {
  if (!typedProject) return null
  const canonical = path.resolve(fileAbsPath)
  let sf = typedProject.getSourceFile(canonical)
  if (!sf) sf = typedProject.getSourceFile(fileAbsPath)
  if (!sf) return null
  let found = null
  forEachDescendant(sf, (node) => {
    if (node.getKind() !== SyntaxKind.AsExpression) return
    const lineCol = sf.getLineAndColumnAtPos(node.getStart())
    if (lineCol && lineCol.line === lineNumber) {
      const expr = node.getExpression?.()
      if (expr) found = { expression: expr, asExpression: node }
      return false
    }
  })
  return found
}

/** Get the innermost expression from a chain of AsExpressions (e.g. (x as unknown) as Y -> x). */
function getInnermostExpression(expr, SyntaxKind) {
  let cur = expr
  while (cur && cur.getKind?.() === SyntaxKind.AsExpression) {
    cur = cur.getExpression?.()
  }
  return cur || expr
}

/**
 * Phase B: semantic filter for a finding. Returns { keep, confidence, whyFlagged? }.
 * as-any: drop when expression is already any; else high confidence.
 * as-unknown-as: high confidence when source/target compatible (unnecessary); else medium + whyFlagged.
 * @param {string} fileAbsPath - Absolute path of the file (same as addSourceFileAtPath)
 */
function applySemanticFilter(finding, typedProject, typeChecker, fileAbsPath, SyntaxKind) {
  if (!typedProject || !typeChecker) {
    return { keep: true, confidence: CONFIDENCE_LEVELS.LOW }
  }
  if (finding.ruleId === 'as-any') {
    const atLine = getAsExpressionAtLine(typedProject, fileAbsPath, finding.lineNumber, SyntaxKind)
    if (atLine) {
      const typeStr = getTypeOfNode(atLine.expression, typeChecker)
      const normalized = typeStr.trim().toLowerCase()
      if (normalized === 'any') return { keep: false, confidence: undefined }
      return { keep: true, confidence: CONFIDENCE_LEVELS.HIGH }
    }
  }
  if (finding.ruleId === 'as-unknown-as') {
    const atLine = getAsExpressionAtLine(typedProject, fileAbsPath, finding.lineNumber, SyntaxKind)
    if (atLine) {
      const inner = getInnermostExpression(atLine.expression, SyntaxKind)
      const sourceType = getTypeOfNode(inner, typeChecker)
      const typeNode = atLine.asExpression.getType?.()
      const targetType = typeNode ? getTypeFromTypeNode(typeNode, typeChecker) : 'unknown'
      const compatible = sourceType === targetType || sourceType === 'unknown'
      if (compatible) {
        return { keep: true, confidence: CONFIDENCE_LEVELS.HIGH, whyFlagged: 'unnecessary double assertion' }
      }
      return {
        keep: true,
        confidence: CONFIDENCE_LEVELS.MEDIUM,
        whyFlagged: `incompatible types: ${sourceType} -> unknown -> ${targetType}`,
      }
    }
  }
  if (finding.ruleId === 'function-type') {
    return { keep: true, confidence: CONFIDENCE_LEVELS.MEDIUM }
  }
  return { keep: true, confidence: CONFIDENCE_LEVELS.LOW }
}

function scanFile(content, repoPath, absPath, configAllowlist) {
  const scriptContent = extractScriptContent(content, absPath)
  const lines = scriptContent.split('\n')
  const findings = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    for (const rule of RULES) {
      if (rule.pattern.global) rule.pattern.lastIndex = 0
      const matches = line.matchAll(rule.pattern)
      for (const _ of matches) {
        const result = checkConfigAllowlist(repoPath, rule.ruleId, lineNum, configAllowlist)
        if (!result.allowed) {
          const finding = {
            file: repoPath,
            lineNumber: lineNum,
            ruleId: rule.ruleId,
            snippet: snippetFromLine(line),
            message: rule.message,
          }
          const hint = inferFixHint(rule.ruleId, line)
          if (hint) finding.fixHint = hint
          findings.push(finding)
        }
      }
    }
  }

  return findings
}

function assignPriority(score, config) {
  const p0Min = Number(config?.priorities?.p0MinSeverityScore ?? 15)
  const p1Min = Number(config?.priorities?.p1MinSeverityScore ?? 6)
  if (score >= p0Min) return 'P0'
  if (score >= p1Min) return 'P1'
  return 'P2'
}

function renderMarkdownReport(result) {
  const lines = []
  lines.push('# Type-Escape Audit (Generated)')
  lines.push('')
  lines.push(...getAuditReportHeaderLines())
  lines.push('')
  lines.push('This file is generated by `client/.scripts/type-escape-audit.mjs`.')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Files scanned: **${result.totalScanned}**`)
  lines.push(`- Total findings: **${result.findings.length}**`)
  lines.push('')

  const byRule = {}
  for (const f of result.findings) {
    byRule[f.ruleId] = (byRule[f.ruleId] || 0) + 1
  }
  lines.push('| Rule | Count |')
  lines.push('| --- | ---: |')
  for (const [ruleId, count] of Object.entries(byRule).sort((a, b) => b[1] - a[1])) {
    lines.push(`| ${ruleId} | ${count} |`)
  }
  lines.push('')

  const functionTypeOffenders = buildFunctionTypeOffenders(result.findings)
  if (functionTypeOffenders.length > 0) {
    lines.push('## Function Type (`: Function`) Offenders')
    lines.push('')
    lines.push('`Function` accepts any callable shape and bypasses parameter/return type checking.')
    lines.push('Prefer explicit callable signatures to preserve compile-time safety.')
    lines.push('')
    lines.push('| File | Count | Likely Use |')
    lines.push('| --- | ---: | --- |')
    for (const offender of functionTypeOffenders.slice(0, 25)) {
      lines.push(`| \`${offender.file}\` | ${offender.count} | ${offender.likelyUse} |`)
    }
    if (functionTypeOffenders.length > 25) {
      lines.push(`| *...and ${functionTypeOffenders.length - 25} more* | | |`)
    }
    lines.push('')
  }

  for (const rule of RULES) {
    const ruleFindings = result.findings.filter(f => f.ruleId === rule.ruleId)
    if (ruleFindings.length === 0) continue
    const hasHints = ruleFindings.some(f => f.fixHint)
    lines.push(`## ${rule.ruleId}`)
    lines.push('')
    if (hasHints) {
      lines.push('| File | Line | Snippet | Fix Hint |')
      lines.push('| --- | ---: | --- | --- |')
      for (const f of ruleFindings.slice(0, 40)) {
        const snip = f.snippet.replace(/\|/g, '\\|')
        const hint = (f.fixHint ?? '').replace(/\|/g, '\\|')
        lines.push(`| \`${f.file}\` | ${f.lineNumber} | \`${snip}\` | ${hint} |`)
      }
      if (ruleFindings.length > 40) {
        lines.push(`| *...and ${ruleFindings.length - 40} more* | | | |`)
      }
    } else {
      lines.push('| File | Line | Snippet |')
      lines.push('| --- | ---: | --- |')
      for (const f of ruleFindings.slice(0, 40)) {
        const snip = f.snippet.replace(/\|/g, '\\|')
        lines.push(`| \`${f.file}\` | ${f.lineNumber} | \`${snip}\` |`)
      }
      if (ruleFindings.length > 40) {
        lines.push(`| *...and ${ruleFindings.length - 40} more* | | |`)
      }
    }
    lines.push('')
  }

  if (result.files.length > 0) {
    lines.push('## Files by Severity')
    lines.push('')
    lines.push('| File | Priority | Score |')
    lines.push('| --- | --- | ---: |')
    for (const f of result.files.slice(0, 30)) {
      lines.push(`| \`${f.file}\` | ${f.priority} | ${f.score} |`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

async function main() {
  const paths = resolveAuditPaths('type-escape')

  const configAllowlist = loadCentralAllowlist('type-escape')
  const delta = parseChangedOnlyFlag(process.argv, paths.projectRoot)

  let config = {}
  try { config = JSON.parse(fs.readFileSync(paths.configPath, 'utf8')) } catch { /* defaults */ }

  const { SyntaxKind } = await loadTsMorph()

  const scanDirs = getAuditScanDirs('type-escape', paths)
  const allFiles = listAuditFiles('type-escape', scanDirs)

  let typedProject = null
  let typeChecker = null
  try {
    const clientTsconfig = path.join(paths.clientRoot, 'tsconfig.json')
    if (fs.existsSync(clientTsconfig)) {
      const typed = await createTypedProject(clientTsconfig)
      typedProject = typed.project
      typeChecker = typed.typeChecker
      if (process.env.AUDIT_FIXTURE_DIRS && typedProject) {
        for (const abs of allFiles) {
          if (abs.endsWith('.ts') || abs.endsWith('.tsx')) {
            try {
              if (!typedProject.getSourceFile(abs)) typedProject.addSourceFileAtPath(abs)
            } catch (_) { /* ignore */ }
          }
        }
        typeChecker = typedProject.getTypeChecker()
      }
    }
  } catch (_err) {
    // Proceed without TypeChecker
  }

  const allFindings = []
  const fileScores = new Map()
  let scannedCount = 0

  for (const abs of allFiles) {
    const repoPath = toRepoPath(abs, paths.projectRoot)
    if (delta.enabled && !delta.changedFiles.has(repoPath)) continue

    scannedCount++
    const content = fs.readFileSync(abs, 'utf-8')
    const regexFindings = scanFile(content, repoPath, abs, configAllowlist)

    const isVue = abs.endsWith('.vue')
    const isTs = abs.endsWith('.ts') || abs.endsWith('.tsx')
    let functionTypeFindings = []
    if (isTs || isVue) {
      let scriptContent = content
      let lineOffset = 0
      if (isVue) {
        const extracted = extractVueScriptWithLineOffset(content)
        if (extracted) {
          scriptContent = extracted.scriptContent
          lineOffset = extracted.startLineInFile
        } else {
          scriptContent = ''
        }
      }
      if (scriptContent.trim().length > 0) {
        const virtualPath = isVue ? abs.replace(/\.vue$/, '.vue.ts') : abs
        const { sourceFile, getLine } = await createSourceFileFromContent(virtualPath, scriptContent, { lineOffset })
        const getLineText = (lineNum) => content.split('\n')[lineNum - 1] ?? ''
        functionTypeFindings = await collectAstFunctionTypeFindings(sourceFile, getLine, repoPath, getLineText, configAllowlist)
      }
    }

    const nonFunctionType = regexFindings.filter((f) => f.ruleId !== 'function-type')
    const merged = [...nonFunctionType, ...functionTypeFindings]

    for (const f of merged) {
      const { keep, confidence, whyFlagged } = applySemanticFilter(f, typedProject, typeChecker, abs, SyntaxKind)
      if (!keep) continue
      const meta = {}
      if (confidence) meta.confidence = confidence
      if (whyFlagged) meta.whyFlagged = whyFlagged
      const enriched = enrichFinding(f, meta)
      allFindings.push(enriched)
      const score = (fileScores.get(repoPath) || 0) + (RULE_WEIGHTS[f.ruleId] ?? 1)
      fileScores.set(repoPath, score)
    }
  }

  const files = Array.from(fileScores.entries())
    .map(([file, score]) => ({
      file,
      score,
      priority: assignPriority(score, config),
    }))
    .sort((a, b) => b.score - a.score)

  const result = {
    instructionsForAi: AUDIT_REPORT_AI_INSTRUCTIONS_COMBINED,
    generatedAt: new Date().toISOString(),
    totalScanned: scannedCount,
    ...(delta.enabled ? { deltaMode: true, baseRef: delta.baseRef } : {}),
    findings: allFindings,
    functionTypeOffenders: buildFunctionTypeOffenders(allFindings),
    files,
  }

  const { outJson, outMd } = writeAuditReports('type-escape', result, renderMarkdownReport(result))

  console.log(`Wrote:\n- ${toRepoPath(outJson, paths.projectRoot)}\n- ${toRepoPath(outMd, paths.projectRoot)}`)
  console.log(`Findings: ${allFindings.length} (files with findings: ${files.length})`)
  process.exitCode = 0
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
