import fs from 'node:fs'
import {
  getAuditReportHeaderLines,
  loadCentralAllowlist,
  listAuditFiles,
  resolveAuditPaths,
  getAuditScanDirs,
  writeAuditReports,
  toRepoPath as toRepoPathUtil,
  categorizeMatches,
  summarizeExceptions,
  parseChangedOnlyFlag,
  runTwoPhaseFilter,
  createSuppressionHitTracker,
  enrichFinding,
  CONFIDENCE_LEVELS,
} from './shared-audit-utils.mjs'
import {
  createSourceFileFromContent,
  extractVueScriptWithLineOffset,
  forEachDescendant,
  loadTsMorph,
} from './shared-ast-facade.mjs'

/**
 * Error Handling Audit Script (merged from fallback-audit + error-logging-audit)
 *
 * Goal: produce a deterministic inventory of silent error handling, unsafe catch blocks,
 * console usage, and type suppressions across the codebase.
 *
 * Rule categories:
 * - silent-catch (P0): empty catch, .catch(() => {}), catch with only comments
 * - console-in-catch (P1): console.log/warn/error inside catch blocks
 * - alert-in-catch (P1): alert() in catch — use logger + notifyError instead
 * - type-suppression (P1): as any, @ts-ignore, @ts-expect-error, eslint-disable
 * - console-general (P2): console usage outside error paths
 * - catch-without-logger (P2): catch block does not call logger.error/warn/info/debug
 * - console-no-logger (P2): console.* usage without createLogger import (file-level)
 *
 * Scope:
 * - Included: client/src (ts, js, vue) and server/src (ts, mjs)
 * - Excluded: __tests__, test files, spec files, @core, @layouts, migrations
 *
 * Exception Handling:
 * - Inline: // @audit-allow:error-handling:<ruleId> - <reason>
 * - Config: .audit-reports/error-handling-audit-config.json
 *
 * Output:
 * - client/.audit-reports/error-handling-audit.json
 * - client/.audit-reports/error-handling-audit.md
 */

const AUDIT_TYPE = 'error-handling'

/** @type {Array<{id: string, label: string, severity: string, test: (line: string, context?: object) => boolean}>} */
const RULES = [
  // P0: Silent error swallowing
  {
    id: 'empty-catch',
    label: 'Empty catch block',
    severity: 'P0',
    test: (l) => /catch\s*\([^)]*\)\s*\{\s*\}/.test(l),
  },
  {
    id: 'silent-catch-promise',
    label: 'Silent .catch()',
    severity: 'P0',
    test: (l) => /\.catch\s*\(\s*\(\s*\)\s*=>\s*\{\s*\}\s*\)/.test(l) || /\.catch\s*\(\s*\(\s*\)\s*=>\s*(?:undefined|null|void\s+0)\s*\)/.test(l),
  },
  {
    id: 'catch-comment-only',
    label: 'Catch block with only comment',
    severity: 'P0',
    test: (l, ctx) => {
      if (!ctx || !ctx.inCatchBlock) return false
      // Detect if the only content of the catch block is a comment
      return ctx.catchBlockLines && ctx.catchBlockLines.every(cl => /^\s*\/\//.test(cl) || /^\s*$/.test(cl))
    },
  },

  // P1: Console in error paths
  {
    id: 'console-in-catch',
    label: 'console.* in catch block',
    severity: 'P1',
    test: (l, ctx) => {
      if (!ctx || !ctx.inCatchBlock) return false
      return /\bconsole\.(log|warn|error|debug|info)\s*\(/.test(l)
    },
  },
  // P1: alert() in catch — use logger + notifyError instead
  {
    id: 'alert-in-catch',
    label: 'alert() in catch block',
    severity: 'P1',
    test: (l, ctx) => {
      if (!ctx || !ctx.inCatchBlock) return false
      return /\balert\s*\(/.test(l)
    },
  },

  // P1: Type suppressions
  {
    id: 'ts-ignore',
    label: '@ts-ignore',
    severity: 'P1',
    test: (l) => /@ts-ignore/.test(l),
  },
  {
    id: 'ts-expect-error',
    label: '@ts-expect-error',
    severity: 'P1',
    test: (l) => /@ts-expect-error/.test(l),
  },
  {
    id: 'as-any',
    label: 'as any',
    severity: 'P1',
    test: (l) => /\bas\s+any\b/.test(l),
  },
  {
    id: 'eslint-disable',
    label: 'eslint-disable',
    severity: 'P1',
    test: (l) => /eslint-disable/.test(l),
  },

  // P2: General console usage (outside catch)
  {
    id: 'console-general',
    label: 'console.* usage',
    severity: 'P2',
    test: (l, ctx) => {
      if (ctx && ctx.inCatchBlock) return false // Already caught by console-in-catch
      return /\bconsole\.(log|warn|error|debug|info)\s*\(/.test(l)
    },
  },
  // P2: Catch block does not log the error — use logger.error() for ops visibility
  {
    id: 'catch-without-logger',
    label: 'Catch block does not log error',
    severity: 'P2',
    test: (l, ctx) => {
      if (!ctx || !ctx.inCatchBlock || !ctx.catchBlockLines?.length) return false
      const hasLoggerCall = ctx.catchBlockLines.some(cl => /logger\.(error|warn|info|debug)\s*\(/.test(cl))
      return !hasLoggerCall
    },
  },
  // P2: File-level rule for console usage without logger import
  // NOTE: This rule is checked at file level in scanFile(), not per-line
  {
    id: 'console-no-logger',
    label: 'console.* used without logger utility',
    severity: 'P2',
    test: () => false, // Never matches per-line, checked at file level
  },
]

/** Optional description and recommendedFix per rule for emitted ruleset (JSON + optional MD). */
const RULE_META = {
  'empty-catch': {
    description: 'Empty catch block (no handling or logging).',
    recommendedFix: 'Add createLogger and logger.error(err) at start of catch block, or rethrow.',
  },
  'silent-catch-promise': {
    description: 'Promise .catch() with no-op or void callback.',
    recommendedFix: 'Add error logging or pass error to a handler; avoid .catch(() => {}).',
  },
  'catch-comment-only': {
    description: 'Catch block whose only content is comments.',
    recommendedFix: 'Add at least logger.error(err) or rethrow for visibility.',
  },
  'console-in-catch': {
    description: 'console.log/warn/error/debug/info used inside a catch block.',
    recommendedFix: 'Use createLogger and logger.error(err) instead of console in catch.',
  },
  'alert-in-catch': {
    description: 'alert() used inside a catch block.',
    recommendedFix: 'Use logger + notifyError (or app toast) instead of alert().',
  },
  'ts-ignore': {
    description: 'TypeScript @ts-ignore comment suppressing type errors.',
    recommendedFix: 'Fix the type or use @ts-expect-error with a short comment; prefer type-safe code.',
  },
  'ts-expect-error': {
    description: 'TypeScript @ts-expect-error comment.',
    recommendedFix: 'Add brief comment explaining why; remove when upstream types are fixed.',
  },
  'as-any': {
    description: 'Type assertion "as any" bypassing type checking.',
    recommendedFix: 'Use a proper type or type guard; avoid as any where possible.',
  },
  'eslint-disable': {
    description: 'ESLint disable comment suppressing lint rules.',
    recommendedFix: 'Fix the underlying issue or scope the disable to the minimal line/block.',
  },
  'console-general': {
    description: 'console.* usage outside catch (general logging).',
    recommendedFix: 'Use createLogger and logger.debug/info/warn/error for app logging.',
  },
  'catch-without-logger': {
    description: 'Catch block that does not call logger.error/warn/info/debug.',
    recommendedFix: 'Add logger.error(err) (or equivalent) at start of catch for ops visibility.',
  },
  'console-no-logger': {
    description: 'File uses console.* but does not import createLogger.',
    recommendedFix: 'Import createLogger and replace console calls with logger methods.',
  },
}

/**
 * Check if file uses console.* without importing createLogger
 * WHY: Flags files that should use the logger utility instead of raw console calls
 * PATTERN: File-level check - scans entire file content for console usage and logger import
 */
function checkConsoleWithoutLogger(content, repoPath) {
  // Exclude server/src/config/app.ts - startup/bootstrap logging is acceptable
  if (repoPath === 'server/src/config/app.ts') {
    return null
  }

  // Phase B: Drop when file is under server/src/scripts/ or is CLI entry (no default export + process.argv)
  const normalizedPath = repoPath.replace(/\\/g, '/')
  if (normalizedPath.includes('server/src/scripts/')) {
    return null
  }
  const noDefaultExport = !/export\s+default\b/.test(content)
  const hasProcessArgv = /\bprocess\.argv\b/.test(content)
  if (noDefaultExport && hasProcessArgv) {
    return null
  }

  // Check if file uses console.*
  const hasConsoleUsage = /\bconsole\.(log|warn|error|debug|info)\s*\(/.test(content)
  if (!hasConsoleUsage) {
    return null
  }

  // Check if file imports createLogger
  const hasLoggerImport = /import\s+(?:\{[^}]*createLogger[^}]*\}|\*\s+as\s+createLogger|createLogger)\s+from/.test(content) ||
                          /import\s+createLogger\s+from/.test(content) ||
                          /const\s+\{\s*createLogger\s*\}\s*=\s*require/.test(content) ||
                          /require\s*\([^)]*['"]logger['"]/.test(content)

  if (!hasLoggerImport) {
    return enrichFinding(
      {
        ruleId: 'console-no-logger',
        lineNumber: 1,
        line: 'Raw console.* used without logger utility -- use createLogger() from utils/logger instead.',
      },
      { confidence: CONFIDENCE_LEVELS.MEDIUM }
    )
  }

  return null
}

/** Phase B: confidence for console-general — high if logger imported and used elsewhere, else medium */
function getConsoleGeneralConfidence(content) {
  const hasLoggerImport = /import\s+(?:\{[^}]*createLogger[^}]*\}|createLogger)\s+from/.test(content) ||
    /import\s+createLogger\s+from/.test(content) ||
    /\buseLogger\b/.test(content)
  const hasLoggerUsage = /\blogger\.(log|warn|error|debug|info)\s*\(/.test(content) || /\bcreateLogger\s*\(/.test(content)
  return hasLoggerImport && hasLoggerUsage ? CONFIDENCE_LEVELS.HIGH : CONFIDENCE_LEVELS.MEDIUM
}

function toRepoPath(absPath, projectRoot) {
  return toRepoPathUtil(absPath, projectRoot)
}

function toStableId(repoPath) {
  return repoPath.replaceAll('/', '__')
}

function extractVueScriptBlocks(vueContent) {
  const blocks = []
  const re = /<script\b[^>]*>([\s\S]*?)<\/script>/gi
  for (const match of vueContent.matchAll(re)) {
    blocks.push(match[1] || '')
  }
  return blocks
}

/**
 * Strip single-line and multi-line comments from source text for "comment-only" detection.
 */
function stripComments(text) {
  return text
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Phase B: Return true if catch-without-logger finding should be dropped (rethrow, handleError(err), or return error).
 * @param {object} kind - SyntaxKind enum (sk.SyntaxKind from loadTsMorph)
 */
function shouldDropCatchWithoutLoggerFinding(block, catchClause, kind) {
  const catchParamName = catchClause.getVariableDeclaration?.()?.getName?.() ?? catchClause.getVariableDeclaration?.()?.getText?.() ?? null
  let hasRethrow = false
  let hasErrorHandlerCall = false
  let hasReturnError = false
  forEachDescendant(block, (desc) => {
    if (desc.getKind() === kind.ThrowStatement) {
      hasRethrow = true
      return false
    }
    if (desc.getKind() === kind.CallExpression) {
      const args = desc.getArguments?.() ?? []
      const firstArg = args[0]
      if (firstArg && catchParamName && firstArg.getText?.()?.trim() === catchParamName) {
        hasErrorHandlerCall = true
        return false
      }
    }
    if (desc.getKind() === kind.ReturnStatement) {
      const expr = desc.getExpression?.()
      if (expr && expr.getKind() === kind.ObjectLiteralExpression) {
        const props = expr.getProperties?.() ?? []
        const hasErrorProp = props.some((p) => p.getName?.() === 'error' || p.getText?.().startsWith('error'))
        if (hasErrorProp) {
          hasReturnError = true
          return false
        }
      }
    }
  })
  return hasRethrow || hasErrorHandlerCall || hasReturnError
}

/**
 * AST: find TryStatement/CatchClause and evaluate catch block (empty, comment-only, console, alert, logger).
 * Returns matches with ruleId, lineNumber, line for: empty-catch, catch-comment-only, console-in-catch, alert-in-catch, catch-without-logger.
 * Phase B: Drops catch-without-logger when block rethrows, calls handleError(err), or returns { error }.
 */
async function collectCatchFindingsFromAst(sourceFile, getLine, getLineText, sk) {
  const kind = sk.SyntaxKind
  const findings = []

  for (const node of sourceFile.getDescendants?.() ?? []) {
    if (node.getKind() !== kind.TryStatement) continue
    const catchClause = node.getCatchClause?.()
    if (!catchClause) continue

    const block = catchClause.getBlock?.()
    if (!block) continue

    const catchLineNum = getLine(catchClause)
    const catchLineText = getLineText(catchLineNum) ?? ''

    const statements = block.getStatements?.() ?? []
    if (statements.length === 0) {
      findings.push({ ruleId: 'empty-catch', lineNumber: catchLineNum, line: catchLineText.trim().slice(0, 120) })
      continue
    }

    const blockText = block.getText?.() ?? ''
    const withoutComments = stripComments(blockText)
    const onlyBracesOrEmpty = /^[\s\{\}]*$/.test(withoutComments)
    if (onlyBracesOrEmpty) {
      findings.push({ ruleId: 'catch-comment-only', lineNumber: catchLineNum, line: catchLineText.trim().slice(0, 120) })
    }

    let hasConsole = false
    let hasAlert = false
    let hasLogger = false
    forEachDescendant(block, (desc) => {
      if (desc.getKind() !== kind.CallExpression) return
      const expr = desc.getExpression?.()
      if (!expr) return
      if (expr.getKind() === kind.PropertyAccessExpression) {
        const name = expr.getName?.()
        const obj = expr.getExpression?.()
        const objText = obj?.getText?.() ?? ''
        if (objText === 'console' && ['log', 'warn', 'error', 'debug', 'info'].includes(name)) hasConsole = true
        if (objText === 'logger' && ['error', 'warn', 'info', 'debug'].includes(name)) hasLogger = true
      }
      if (expr.getKind() === kind.Identifier && expr.getText?.() === 'alert') hasAlert = true
    })
    if (hasConsole) {
      findings.push({ ruleId: 'console-in-catch', lineNumber: getLine(block), line: catchLineText.trim().slice(0, 120) })
    }
    if (hasAlert) {
      findings.push({ ruleId: 'alert-in-catch', lineNumber: getLine(block), line: catchLineText.trim().slice(0, 120) })
    }
    if (!hasLogger && !onlyBracesOrEmpty) {
      if (!shouldDropCatchWithoutLoggerFinding(block, catchClause, kind)) {
        findings.push(enrichFinding(
          { ruleId: 'catch-without-logger', lineNumber: catchLineNum, line: catchLineText.trim().slice(0, 120) },
          { confidence: CONFIDENCE_LEVELS.HIGH }
        ))
      }
    }
  }

  return findings
}

/**
 * Detect catch block boundaries in code lines
 * Returns a Map of lineIndex -> { inCatchBlock: true, catchBlockLines: string[] }
 */
function detectCatchBlocks(lines) {
  const catchContextMap = new Map()
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    // Detect catch block start
    if (/\bcatch\s*\(/.test(line)) {
      // Find the opening brace
      let braceStart = -1
      let searchIdx = i
      while (searchIdx < lines.length && braceStart === -1) {
        const bracePos = lines[searchIdx].indexOf('{', searchIdx === i ? line.indexOf('catch') : 0)
        if (bracePos !== -1) {
          braceStart = searchIdx
        }
        searchIdx++
      }
      if (braceStart === -1) { i++; continue }

      // Find matching closing brace
      let depth = 0
      let braceEnd = -1
      for (let j = braceStart; j < lines.length; j++) {
        for (const ch of lines[j]) {
          if (ch === '{') depth++
          if (ch === '}') { depth--; if (depth === 0) { braceEnd = j; break } }
        }
        if (braceEnd !== -1) break
      }
      if (braceEnd === -1) braceEnd = Math.min(braceStart + 10, lines.length - 1)

      const catchLines = lines.slice(braceStart + 1, braceEnd)
      const contentLines = catchLines.filter(cl => cl.trim() !== '')

      for (let j = braceStart; j <= braceEnd; j++) {
        catchContextMap.set(j, {
          inCatchBlock: true,
          catchBlockLines: contentLines,
        })
      }
    }
    i++
  }
  return catchContextMap
}

const CATCH_RULE_IDS = new Set(['empty-catch', 'catch-comment-only', 'console-in-catch', 'alert-in-catch', 'catch-without-logger'])

function scanFile(filePath, _configAllowlist, projectRoot, options = {}) {
  const { catchFindingsFromAst = [], usedAstForCatch = false } = options
  const useAstCatch = usedAstForCatch || catchFindingsFromAst.length > 0

  const repoPath = toRepoPath(filePath, projectRoot)
  let content = fs.readFileSync(filePath, 'utf-8')

  if (filePath.endsWith('.vue')) {
    const scriptBlocks = extractVueScriptBlocks(content)
    if (scriptBlocks.length === 0) return { matches: [], content }
    content = scriptBlocks.join('\n')
  }

  const lines = content.split('\n')
  const catchContextMap = useAstCatch ? new Map() : detectCatchBlocks(lines)
  const matches = useAstCatch ? [...catchFindingsFromAst] : []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNumber = i + 1
    const trimmed = line.trim()
    if (trimmed === '') continue

    const ctx = catchContextMap.get(i) || { inCatchBlock: false }

    for (const rule of RULES) {
      if (useAstCatch && CATCH_RULE_IDS.has(rule.id)) continue

      if (rule.id === 'catch-comment-only') {
        if (ctx.inCatchBlock && ctx.catchBlockLines &&
            ctx.catchBlockLines.length > 0 &&
            ctx.catchBlockLines.every(cl => /^\s*(\/\/.*)?$/.test(cl))) {
          const isFirstLine = !catchContextMap.has(i - 1) || !catchContextMap.get(i - 1).inCatchBlock
          if (isFirstLine) matches.push({ ruleId: rule.id, lineNumber, line: trimmed })
        }
        continue
      }
      if (rule.id === 'catch-without-logger') {
        if (ctx.inCatchBlock && ctx.catchBlockLines?.length) {
          const hasLoggerCall = ctx.catchBlockLines.some(cl => /logger\.(error|warn|info|debug)\s*\(/.test(cl))
          if (!hasLoggerCall) {
            const isFirstLine = !catchContextMap.has(i - 1) || !catchContextMap.get(i - 1).inCatchBlock
            if (isFirstLine) {
              matches.push({ ruleId: rule.id, lineNumber, line: trimmed.length > 120 ? trimmed.substring(0, 120) + '...' : trimmed })
            }
          }
        }
        continue
      }

      if (rule.test(line, ctx)) {
        matches.push({ ruleId: rule.id, lineNumber, line: trimmed.length > 120 ? trimmed.substring(0, 120) + '...' : trimmed })
      }
    }
  }

  const fileLevelFinding = checkConsoleWithoutLogger(content, repoPath)
  if (fileLevelFinding) matches.push(fileLevelFinding)

  return { matches, content }
}

const SEVERITY_SCORE = { P0: 10, P1: 5, P2: 1 }

function calculateScore(requiresReview) {
  return requiresReview.reduce((sum, m) => {
    const rule = RULES.find(r => r.id === m.ruleId)
    return sum + (SEVERITY_SCORE[rule?.severity] || 1)
  }, 0)
}

function assignPriority(score, config) {
  const p0Min = Number(config?.priorities?.p0MinSeverityScore ?? 10)
  const p1Min = Number(config?.priorities?.p1MinSeverityScore ?? 5)
  if (score >= p0Min) return 'P0'
  if (score >= p1Min) return 'P1'
  return 'P2'
}

function renderMarkdownReport(filesWithFindings, exceptionSummary) {
  const lines = []
  lines.push(...getAuditReportHeaderLines())
  lines.push('# Error Handling Audit (Generated)')
  lines.push('')
  lines.push('This file is generated by `client/.scripts/error-handling-audit.mjs`.')
  lines.push('')
  lines.push('Scope: `client/src` (ts, js, vue) and `server/src` (ts, mjs)')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Files with findings: **${filesWithFindings.length}**`)
  lines.push(`- Requiring review: **${exceptionSummary.totalRequiresReview}**`)
  lines.push(`- Allowed (with justification): ${exceptionSummary.totalAllowed}`)
  lines.push('')

  // Count by severity
  const bySeverity = { P0: 0, P1: 0, P2: 0 }
  for (const f of filesWithFindings) {
    for (const m of f.requiresReview) {
      const rule = RULES.find(r => r.id === m.ruleId)
      if (rule) bySeverity[rule.severity] = (bySeverity[rule.severity] || 0) + 1
    }
  }
  lines.push(`- P0 (silent catches): **${bySeverity.P0}**`)
  lines.push(`- P1 (console-in-catch, alert-in-catch, type suppressions): **${bySeverity.P1}**`)
  lines.push(`- P2 (general console, catch-without-logger): **${bySeverity.P2}**`)
  lines.push('')

  lines.push('## Rules')
  lines.push('')
  for (const r of RULES) {
    const meta = RULE_META[r.id]
    lines.push(`- **${r.id}** (${r.severity}): ${r.label}`)
    if (meta?.description) lines.push(`  - What: ${meta.description}`)
    if (meta?.recommendedFix) lines.push(`  - Fix: ${meta.recommendedFix}`)
    lines.push('')
  }

  lines.push('## Top hotspots (by score)')
  lines.push('')
  lines.push('| File | Priority | Score | P0 | P1 | P2 |')
  lines.push('| --- | --- | ---: | ---: | ---: | ---: |')

  const hotspots = filesWithFindings.slice(0, 30)
  for (const f of hotspots) {
    const counts = { P0: 0, P1: 0, P2: 0 }
    for (const m of f.requiresReview) {
      const rule = RULES.find(r => r.id === m.ruleId)
      if (rule) counts[rule.severity]++
    }
    lines.push(`| \`${f.repoPath}\` | ${f.priority} | ${f.score} | ${counts.P0} | ${counts.P1} | ${counts.P2} |`)
  }

  if (filesWithFindings.length > 30) {
    lines.push('')
    lines.push(`*...and ${filesWithFindings.length - 30} more files. See JSON report for details.*`)
  }

  lines.push('')
  lines.push('## Per-file findings')
  lines.push('')

  for (const f of filesWithFindings.slice(0, 50)) {
    lines.push(`### \`${f.repoPath}\` [${f.priority}] (score: ${f.score})`)
    lines.push('')
    const shown = f.requiresReview.slice(0, 40)
    lines.push('```')
    for (const m of shown) {
      lines.push(`${m.ruleId}@${m.lineNumber}: ${m.line}`)
    }
    if (f.requiresReview.length > 40) {
      lines.push(`... (${f.requiresReview.length - 40} more)`)
    }
    lines.push('```')
    lines.push('')
  }

  return lines.join('\n')
}

async function main() {
  const paths = resolveAuditPaths(AUDIT_TYPE)

  const configAllowlist = loadCentralAllowlist(AUDIT_TYPE)
  const delta = parseChangedOnlyFlag(process.argv, paths.projectRoot)

  let priorityConfig = {}
  try {
    const configRaw = fs.readFileSync(paths.configPath, 'utf8')
    priorityConfig = JSON.parse(configRaw)
  } catch { /* defaults */ }

  const { SyntaxKind } = await loadTsMorph()
  const sk = { SyntaxKind }

  const scanDirs = getAuditScanDirs(AUDIT_TYPE, paths)
  const absFiles = listAuditFiles(AUDIT_TYPE, scanDirs)
  const scanned = []
  const suppressionHitTracker = createSuppressionHitTracker()

  for (const abs of absFiles) {
    const repoPath = toRepoPath(abs, paths.projectRoot)
    if (delta.enabled && !delta.changedFiles.has(repoPath)) continue

    let catchFindingsFromAst = []
    const useAst = /\.(ts|tsx|vue|js|mjs)$/i.test(abs)
    if (useAst) {
      let content = fs.readFileSync(abs, 'utf-8')
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
        const { sourceFile, getLine } = await createSourceFileFromContent(virtualPath, scriptContent, { lineOffset })
        const getLineText = (lineNum) => content.split('\n')[lineNum - 1] ?? ''
        const detectorCatch = await collectCatchFindingsFromAst(sourceFile, getLine, getLineText, sk)
        const { passed: validatedCatch } = runTwoPhaseFilter(detectorCatch, () => true)
        catchFindingsFromAst = validatedCatch
      }
    }

    const { matches, content } = scanFile(abs, configAllowlist, paths.projectRoot, {
      catchFindingsFromAst,
      usedAstForCatch: useAst,
    })
    if (matches.length === 0) continue

    const { allowed, requiresReview } = categorizeMatches(matches, repoPath, content, AUDIT_TYPE, configAllowlist, suppressionHitTracker)
    const enrichedReview = requiresReview.map((m) => {
      if (m.ruleId === 'console-general') {
        return enrichFinding(m, { confidence: getConsoleGeneralConfidence(content) })
      }
      return m
    })
    const fileScore = calculateScore(enrichedReview)
    const filePriority = assignPriority(fileScore, priorityConfig)

    scanned.push({
      id: toStableId(repoPath),
      repoPath,
      allowed,
      requiresReview: enrichedReview,
      score: fileScore,
      priority: filePriority,
    })
  }

  scanned.sort((a, b) => b.score - a.score || a.repoPath.localeCompare(b.repoPath))

  const exceptionSummary = summarizeExceptions(scanned)
  const filesWithFindings = scanned.filter(f => f.score > 0 || f.requiresReview.length > 0)

  const ruleset = RULES.map((r) => ({
    ruleId: r.id,
    label: r.label,
    severity: r.severity,
    description: RULE_META[r.id]?.description ?? '',
    recommendedFix: RULE_META[r.id]?.recommendedFix ?? '',
  }))
  const out = {
    generatedAt: new Date().toISOString(),
    scope: {
      included: ['client/src/**/*.{ts,js,vue}', 'server/src/**/*.{ts,mjs}'],
      excluded: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*', 'client/src/@core/**', 'client/src/@layouts/**'],
    },
    totalScanned: absFiles.length,
    ...(delta.enabled ? { deltaMode: true, baseRef: delta.baseRef } : {}),
    exceptionSummary,
    files: filesWithFindings,
    ruleset,
    suppressionHits: suppressionHitTracker.getCounts(),
  }

  const { outJson, outMd } = writeAuditReports(AUDIT_TYPE, out, renderMarkdownReport(filesWithFindings, exceptionSummary))

  console.log(`Wrote:\n- ${toRepoPath(outJson, paths.projectRoot)}\n- ${toRepoPath(outMd, paths.projectRoot)}`)
  console.log(`Files scanned: ${absFiles.length}, Findings: ${exceptionSummary.totalRequiresReview} requiring review, ${exceptionSummary.totalAllowed} allowed`)
  process.exitCode = 0
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
