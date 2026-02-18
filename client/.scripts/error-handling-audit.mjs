import fs from 'node:fs'
import path from 'node:path'
import {
  loadConfigAllowlist,
  categorizeMatches,
  summarizeExceptions,
  checkConfigAllowlist,
  parseChangedOnlyFlag,
  isCompiledJsFile,
  isGloballyExcluded,
} from './audit-exceptions.mjs'

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

const CWD = path.resolve(process.cwd())
const IS_CLIENT_DIR = fs.existsSync(path.join(CWD, 'src'))
const PROJECT_ROOT = IS_CLIENT_DIR ? path.resolve(CWD, '..') : CWD

const CLIENT_ROOT = IS_CLIENT_DIR ? CWD : path.join(PROJECT_ROOT, 'client')
const CLIENT_SRC = path.join(CLIENT_ROOT, 'src')
const SERVER_ROOT = path.join(PROJECT_ROOT, 'server')
const SERVER_SRC = path.join(SERVER_ROOT, 'src')

const OUT_DIR = IS_CLIENT_DIR
  ? path.join(CWD, '.audit-reports')
  : path.join(CWD, 'client', '.audit-reports')
const OUT_JSON = path.join(OUT_DIR, 'error-handling-audit.json')
const OUT_MD = path.join(OUT_DIR, 'error-handling-audit.md')
const CONFIG_PATH = path.join(OUT_DIR, 'error-handling-audit-config.json')

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
  
  // Check if file uses console.*
  const hasConsoleUsage = /\bconsole\.(log|warn|error|debug|info)\s*\(/.test(content)
  if (!hasConsoleUsage) {
    return null
  }
  
  // Check if file imports createLogger
  // Pattern matches: import { createLogger } from '...' or import { createLogger } from "..."
  // Also matches: import createLogger from '...' or const { createLogger } = require('...')
  const hasLoggerImport = /import\s+(?:\{[^}]*createLogger[^}]*\}|\*\s+as\s+createLogger|createLogger)\s+from/.test(content) ||
                          /import\s+createLogger\s+from/.test(content) ||
                          /const\s+\{\s*createLogger\s*\}\s*=\s*require/.test(content) ||
                          /require\s*\([^)]*['"]logger['"]/.test(content)
  
  if (!hasLoggerImport) {
    return {
      ruleId: 'console-no-logger',
      lineNumber: 1, // File-level finding, use line 1 as placeholder
      line: 'Raw console.* used without logger utility -- use createLogger() from utils/logger instead.',
    }
  }
  
  return null
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

function toRepoPath(absPath) {
  return path.relative(PROJECT_ROOT, absPath).replaceAll(path.sep, '/')
}

function toStableId(repoPath) {
  return repoPath.replaceAll('/', '__')
}

function isExcluded(repoPath, configAllowlist) {
  if (isGloballyExcluded(repoPath)) return true
  if (repoPath.includes('logger') && (repoPath.endsWith('.ts') || repoPath.endsWith('.js'))) return true
  const result = checkConfigAllowlist(repoPath, '*', 1, configAllowlist)
  return result.allowed
}

function isScannable(absPath) {
  return absPath.endsWith('.ts') || absPath.endsWith('.js') || absPath.endsWith('.vue') || absPath.endsWith('.mjs')
}

function listFilesRecursive(dirPath) {
  const files = []
  if (!fs.existsSync(dirPath)) return files
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      const repoPath = toRepoPath(fullPath)
      if (repoPath.includes('node_modules') || repoPath.includes('/dist/') || repoPath.includes('.git/')) continue
      if (entry.isDirectory()) {
        files.push(...listFilesRecursive(fullPath))
      } else if (entry.isFile() && isScannable(fullPath) && !isCompiledJsFile(fullPath)) {
        files.push(fullPath)
      }
    }
  } catch { /* directory inaccessible */ }
  return files
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

function scanFile(filePath, _configAllowlist) {
  const repoPath = toRepoPath(filePath)
  let content = fs.readFileSync(filePath, 'utf-8')

  if (filePath.endsWith('.vue')) {
    const scriptBlocks = extractVueScriptBlocks(content)
    if (scriptBlocks.length === 0) return { matches: [], content }
    content = scriptBlocks.join('\n')
  }

  const lines = content.split('\n')
  const catchContextMap = detectCatchBlocks(lines)
  const matches = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNumber = i + 1
    const trimmed = line.trim()
    if (trimmed === '') continue

    const ctx = catchContextMap.get(i) || { inCatchBlock: false }

    for (const rule of RULES) {
      // Special handling for catch-comment-only: only report once per catch block
      if (rule.id === 'catch-comment-only') {
        if (ctx.inCatchBlock && ctx.catchBlockLines &&
            ctx.catchBlockLines.length > 0 &&
            ctx.catchBlockLines.every(cl => /^\s*(\/\/.*)?$/.test(cl))) {
          // Only report on the first line of the catch block
          const isFirstLine = !catchContextMap.has(i - 1) || !catchContextMap.get(i - 1).inCatchBlock
          if (isFirstLine) {
            matches.push({ ruleId: rule.id, lineNumber, line: trimmed })
          }
        }
        continue
      }
      // Special handling for catch-without-logger: only report once per catch block
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

  // File-level check: console usage without logger import
  const fileLevelFinding = checkConsoleWithoutLogger(content, repoPath)
  if (fileLevelFinding) {
    matches.push(fileLevelFinding)
  }

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

function main() {
  ensureDir(OUT_DIR)

  const configAllowlist = loadConfigAllowlist(CONFIG_PATH)
  const delta = parseChangedOnlyFlag(process.argv, PROJECT_ROOT)

  let priorityConfig = {}
  try {
    const configRaw = fs.readFileSync(CONFIG_PATH, 'utf8')
    priorityConfig = JSON.parse(configRaw)
  } catch { /* defaults */ }

  const clientFiles = listFilesRecursive(CLIENT_SRC)
  const serverFiles = listFilesRecursive(SERVER_SRC)
  const absFiles = [...clientFiles, ...serverFiles]
  const scanned = []

  for (const abs of absFiles) {
    const repoPath = toRepoPath(abs)
    if (delta.enabled && !delta.changedFiles.has(repoPath)) continue
    if (isExcluded(repoPath, configAllowlist)) continue

    const { matches, content } = scanFile(abs, configAllowlist)
    if (matches.length === 0) continue

    const { allowed, requiresReview } = categorizeMatches(matches, repoPath, content, AUDIT_TYPE, configAllowlist)
    const fileScore = calculateScore(requiresReview)
    const filePriority = assignPriority(fileScore, priorityConfig)

    scanned.push({
      id: toStableId(repoPath),
      repoPath,
      allowed,
      requiresReview,
      score: fileScore,
      priority: filePriority,
    })
  }

  scanned.sort((a, b) => b.score - a.score || a.repoPath.localeCompare(b.repoPath))

  const exceptionSummary = summarizeExceptions(scanned)
  const filesWithFindings = scanned.filter(f => f.score > 0 || f.requiresReview.length > 0)

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
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2))
  fs.writeFileSync(OUT_MD, renderMarkdownReport(filesWithFindings, exceptionSummary))

  console.log(`Wrote:\n- ${toRepoPath(OUT_JSON)}\n- ${toRepoPath(OUT_MD)}`)
  console.log(`Files scanned: ${absFiles.length}, Findings: ${exceptionSummary.totalRequiresReview} requiring review, ${exceptionSummary.totalAllowed} allowed`)
  process.exitCode = 0
}

main()
