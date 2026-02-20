import fs from 'node:fs'
import path from 'node:path'
import {
  loadCentralAllowlist,
  listAuditFiles,
  checkConfigAllowlist,
  parseChangedOnlyFlag,
  AUDIT_REPORT_AI_INSTRUCTIONS_COMBINED,
  getAuditReportHeaderLines,
} from './shared-audit-utils.mjs'

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
const OUT_JSON = path.join(OUT_DIR, 'type-escape-audit.json')
const OUT_MD = path.join(OUT_DIR, 'type-escape-audit.md')
const CONFIG_PATH = path.join(OUT_DIR, 'type-escape-audit-config.json')

const RULE_WEIGHTS = {
  'as-any': 3,
  'as-unknown': 2,
  'as-unknown-as': 4,
  'ts-ignore': 2,
  'ts-expect-error': 1,
  'as-keyof-typeof': 2,
  'as-typeof-index': 2,
  'as-keyof-named': 1,
}

function ensureDir(d) { fs.mkdirSync(d, { recursive: true }) }
function toRepoPath(p) { return path.relative(PROJECT_ROOT, p).replaceAll(path.sep, '/') }

const RULES = [
  { ruleId: 'as-any', pattern: /\bas\s+any\b/g, message: 'Type assertion to any' },
  { ruleId: 'as-unknown-as', pattern: /\bas\s+unknown\s+as\s+/g, message: 'Double assertion escape hatch' },
  { ruleId: 'as-unknown', pattern: /\bas\s+unknown\b(?!\s+as\s+)/g, message: 'Single as unknown' },
  { ruleId: 'ts-ignore', pattern: /@ts-ignore/g, message: 'Suppresses next line' },
  { ruleId: 'ts-expect-error', pattern: /@ts-expect-error/g, message: 'Suppresses next line (expected error)' },
  { ruleId: 'as-keyof-typeof', pattern: /\bas\s+keyof\s+typeof\b/g, message: 'Key type assertion — variable type does not match object key type' },
  { ruleId: 'as-typeof-index', pattern: /\bas\s+\(typeof\s+\w+\)\s*\[/g, message: 'Const array element assertion — value cast to array element type' },
  { ruleId: 'as-keyof-named', pattern: /\bas\s+keyof\s+[A-Z]\w+/g, message: 'Named type key assertion — value asserted as key of specific type' },
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
  return undefined
}

function scanFile(content, repoPath, absPath, configAllowlist) {
  const scriptContent = extractScriptContent(content, absPath)
  const lines = scriptContent.split('\n')
  const findings = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    for (const rule of RULES) {
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

function main() {
  ensureDir(OUT_DIR)

  const configAllowlist = loadCentralAllowlist('type-escape')
  const delta = parseChangedOnlyFlag(process.argv, PROJECT_ROOT)

  let config = {}
  try { config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')) } catch { /* defaults */ }

  const allFiles = listAuditFiles('type-escape', [CLIENT_SRC, SERVER_SRC])

  const allFindings = []
  const fileScores = new Map()
  let scannedCount = 0

  for (const abs of allFiles) {
    const repoPath = toRepoPath(abs)
    if (delta.enabled && !delta.changedFiles.has(repoPath)) continue

    scannedCount++
    const content = fs.readFileSync(abs, 'utf-8')
    const findings = scanFile(content, repoPath, abs, configAllowlist)

    for (const f of findings) {
      allFindings.push(f)
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
    files,
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(result, null, 2))
  fs.writeFileSync(OUT_MD, renderMarkdownReport(result))

  console.log(`Wrote:\n- ${toRepoPath(OUT_JSON)}\n- ${toRepoPath(OUT_MD)}`)
  console.log(`Findings: ${allFindings.length} (files with findings: ${files.length})`)
  process.exitCode = 0
}

main()
