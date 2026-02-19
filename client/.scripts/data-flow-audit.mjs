import fs from 'node:fs'
import path from 'node:path'
import {
  getAuditReportHeaderLines,
  loadCentralAllowlist,
  checkConfigAllowlist,
  categorizeMatches,
  summarizeExceptions,
  renderAllowedExceptionsSection,
  isGloballyExcluded,
  shouldPruneDirectory,
} from './audit-exceptions.mjs'

/**
 * Data Flow Validation Audit (Lightweight)
 *
 * Goal: Flag server route handlers that use req.body, req.params, or req.query
 * without evidence of validation (Joi, Zod, validate, schema, sanitize).
 * Heuristic only; not full taint analysis.
 *
 * Scope: server/src/routes (all .ts files)
 *
 * Output:
 *   - client/.audit-reports/data-flow-audit.json
 *   - client/.audit-reports/data-flow-audit.md
 */

const CWD = path.resolve(process.cwd())
const IS_CLIENT_DIR = fs.existsSync(path.join(CWD, 'src'))
const PROJECT_ROOT = IS_CLIENT_DIR ? path.resolve(CWD, '..') : CWD
const SERVER_ROOT = path.join(IS_CLIENT_DIR ? CWD : PROJECT_ROOT, 'server')
const ROUTES_DIR = path.join(SERVER_ROOT, 'src', 'routes')

const OUT_DIR = IS_CLIENT_DIR
  ? path.join(CWD, '.audit-reports')
  : path.join(CWD, 'client', '.audit-reports')
const OUT_JSON = path.join(OUT_DIR, 'data-flow-audit.json')
const OUT_MD = path.join(OUT_DIR, 'data-flow-audit.md')
const CONFIG_PATH = path.join(OUT_DIR, 'data-flow-audit-config.json')

const AUDIT_TYPE = 'data-flow'

function ensureDir(d) { fs.mkdirSync(d, { recursive: true }) }
function toRepoPath(p) { return path.relative(PROJECT_ROOT, p).replaceAll(path.sep, '/') }

const REQ_BODY = /\breq\.body\b/
const REQ_PARAMS = /\breq\.params\b/
const REQ_QUERY = /\breq\.query\b/
const VALIDATION_HINT = /\b(Joi|Zod|validate|\.schema\b|sanitize|parse\(|validateSync|validateAsync)/
const SEQUELIZE_CREATE_UPDATE = /\.(create|update|bulkCreate)\s*\(\s*req\.body/

function isExcluded(repoPath, configAllowlist) {
  if (isGloballyExcluded(repoPath)) return true
  const result = checkConfigAllowlist(repoPath, '*', 1, configAllowlist)
  return result.allowed
}

function listFilesRecursive(dirPath) {
  const files = []
  if (!fs.existsSync(dirPath)) return files
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    for (const e of entries) {
      const full = path.join(dirPath, e.name)
      if (e.isDirectory()) {
        if (shouldPruneDirectory(e.name)) continue
        files.push(...listFilesRecursive(full))
      } else if (e.isFile() && full.endsWith('.ts')) files.push(full)
    }
  } catch { /* inaccessible */ }
  return files
}

function scanFile(absPath, repoPath, content) {
  const matches = []
  const hasValidation = VALIDATION_HINT.test(content)
  const lines = content.split('\n')

  const seen = new Set()
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!hasValidation && REQ_BODY.test(line) && !seen.has('reqBodyUnvalidated')) {
      seen.add('reqBodyUnvalidated')
      matches.push({ ruleId: 'reqBodyUnvalidated', lineNumber: i + 1, line: line.trim().slice(0, 80) })
    }
    if (!hasValidation && REQ_PARAMS.test(line) && !seen.has('reqParamsUnvalidated')) {
      seen.add('reqParamsUnvalidated')
      matches.push({ ruleId: 'reqParamsUnvalidated', lineNumber: i + 1, line: line.trim().slice(0, 80) })
    }
    if (!hasValidation && REQ_QUERY.test(line) && !seen.has('reqQueryUnvalidated')) {
      seen.add('reqQueryUnvalidated')
      matches.push({ ruleId: 'reqQueryUnvalidated', lineNumber: i + 1, line: line.trim().slice(0, 80) })
    }
    if (SEQUELIZE_CREATE_UPDATE.test(line) && !seen.has('massAssignmentRisk')) {
      seen.add('massAssignmentRisk')
      matches.push({ ruleId: 'massAssignmentRisk', lineNumber: i + 1, line: line.trim().slice(0, 80) })
    }
  }
  return matches
}

function renderMarkdownReport(scanned, exceptionSummary) {
  const lines = []
  lines.push(...getAuditReportHeaderLines())
  lines.push('# Data Flow Validation Audit (Generated)')
  lines.push('')
  lines.push(`Generated at: ${new Date().toISOString()}`)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Total allowed: **${exceptionSummary.totalAllowed}**`)
  lines.push(`- Requiring review: **${exceptionSummary.totalRequiresReview}**`)
  lines.push('')
  const withFindings = scanned.filter(f => f.requiresReview.length > 0)
  lines.push('## Files with potential unvalidated input')
  lines.push('')
  if (withFindings.length === 0) {
    lines.push('None.')
  } else {
    lines.push('| File | Rule | Line | Snippet |')
    lines.push('| --- | --- | ---: | --- |')
    for (const f of withFindings.slice(0, 50)) {
      for (const m of f.requiresReview) {
        lines.push(`| \`${f.repoPath}\` | ${m.ruleId} | ${m.lineNumber} | ${(m.line || '').slice(0, 50)} |`)
      }
    }
    if (withFindings.length > 50) lines.push('\n*...and more.*')
  }
  lines.push('')
  lines.push(...renderAllowedExceptionsSection(scanned.filter(f => f.allowed.length > 0)))
  return lines.join('\n')
}

function main() {
  ensureDir(OUT_DIR)
  const configAllowlist = loadCentralAllowlist('data-flow')

  const routeFiles = listFilesRecursive(ROUTES_DIR)
  const scanned = []

  for (const abs of routeFiles) {
    const repoPath = toRepoPath(abs)
    if (isExcluded(repoPath, configAllowlist)) continue

    const content = fs.readFileSync(abs, 'utf8')
    const matches = scanFile(abs, repoPath, content)
    if (matches.length === 0) continue

    const { allowed, requiresReview } = categorizeMatches(matches, repoPath, content, AUDIT_TYPE, configAllowlist)
    scanned.push({ repoPath, allowed, requiresReview })
  }

  const exceptionSummary = summarizeExceptions(scanned)
  const files = scanned
    .filter(f => f.requiresReview.length > 0)
    .map(f => ({
      repoPath: f.repoPath,
      score: f.requiresReview.length * 3,
      priority: f.requiresReview.some(m => m.ruleId === 'massAssignmentRisk') ? 'P0' : f.requiresReview.length >= 3 ? 'P1' : 'P2',
      count: f.requiresReview.length,
    }))
    .sort((a, b) => b.score - a.score || a.repoPath.localeCompare(b.repoPath))

  const out = {
    generatedAt: new Date().toISOString(),
    totalScanned: routeFiles.length,
    exceptionSummary,
    files,
    scanned: scanned.filter(f => f.requiresReview.length > 0 || f.allowed.length > 0),
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2))
  fs.writeFileSync(OUT_MD, renderMarkdownReport(scanned, exceptionSummary))

  console.log('Wrote:', toRepoPath(OUT_JSON), toRepoPath(OUT_MD))
  console.log(`Data-flow findings: ${exceptionSummary.totalRequiresReview} (allowed: ${exceptionSummary.totalAllowed})`)
  process.exitCode = 0
}

main()
