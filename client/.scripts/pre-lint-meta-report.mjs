/**
 * Pre-Lint Meta Report Script
 *
 * Reads lint-audit.json and lint-warnings-audit.json and produces a unified
 * meta report so you can build a repair plan before running audit:all.
 *
 * Output:
 *   - client/.audit-reports/pre-lint-meta-report.json
 *   - client/.audit-reports/pre-lint-meta-report.md
 */

import fs from 'node:fs'
import path from 'node:path'
import { getAuditReportHeaderLines } from './shared-audit-utils.mjs'

const CWD = path.resolve(process.cwd())
const CLIENT_AUDIT = path.join(CWD, '.audit-reports')
const PROJECT_ROOT_AUDIT = path.join(CWD, 'client', '.audit-reports')
const IS_CLIENT_DIR = fs.existsSync(CLIENT_AUDIT)
const AUDIT_DIR = IS_CLIENT_DIR ? CLIENT_AUDIT : PROJECT_ROOT_AUDIT
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD

const OUT_JSON = path.join(AUDIT_DIR, 'pre-lint-meta-report.json')
const OUT_MD = path.join(AUDIT_DIR, 'pre-lint-meta-report.md')
const PREVIOUS_JSON = path.join(AUDIT_DIR, 'pre-lint-meta-report-previous.json')

function toRepoPath(p) {
  return path.relative(PROJECT_ROOT, p).replaceAll(path.sep, '/')
}

const PRE_LINT_SOURCES = [
  { id: 'lint', file: 'lint-audit.json', weight: 1 },
  { id: 'lint-warnings', file: 'lint-warnings-audit.json', weight: 1 },
]

function loadAuditJson(auditFile) {
  const filePath = path.join(AUDIT_DIR, auditFile)
  if (!fs.existsSync(filePath)) return null
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return null
  }
}

function getAuditSummary(id, data) {
  if (!data) return { auditId: id, totalFindings: 0, filesWithFindings: 0, detail: '' }
  const files = Array.isArray(data.files) ? data.files : []
  const findings = Array.isArray(data.findings) ? data.findings : []

  if (id === 'lint') {
    return {
      auditId: id,
      totalFindings: findings.length,
      filesWithFindings: files.length,
      detail: `Errors + warnings: ${findings.length} in ${files.length} files`,
    }
  }
  if (id === 'lint-warnings') {
    return {
      auditId: id,
      totalFindings: findings.length,
      filesWithFindings: files.length,
      detail: `Warnings only: ${findings.length} in ${files.length} files`,
    }
  }
  return {
    auditId: id,
    totalFindings: findings.length,
    filesWithFindings: files.length,
    detail: '',
  }
}

function aggregateFileScores(auditResults) {
  const fileScores = new Map()
  for (const { id, data, weight } of auditResults) {
    if (!data) continue
    const files = Array.isArray(data.files) ? data.files : []
    for (const f of files) {
      const repoPath = f.repoPath || f.file || ''
      if (!repoPath) continue
      const score = (f.score || 0) * weight
      if (!fileScores.has(repoPath)) fileScores.set(repoPath, [])
      fileScores.get(repoPath).push({ auditId: id, score })
    }
  }
  return fileScores
}

function computeHealthScores(fileScores) {
  const results = []
  for (const [repoPath, scores] of fileScores) {
    const totalScore = scores.reduce((sum, s) => sum + s.score, 0)
    const auditCount = new Set(scores.map((s) => s.auditId)).size
    const auditIds = [...new Set(scores.map((s) => s.auditId))]
    results.push({ repoPath, totalScore, auditCount, auditIds })
  }
  return results.sort((a, b) => b.totalScore - a.totalScore || b.auditCount - a.auditCount)
}

function renderMarkdownReport(result) {
  const lines = []
  lines.push('# Pre-Lint Meta Report (Generated)')
  lines.push('')
  lines.push(...getAuditReportHeaderLines())
  lines.push('')
  lines.push('Use this report to build a **repair plan** before running `audit:all`.')
  lines.push('')
  lines.push(`Generated at: ${result.generatedAt}`)
  lines.push('')

  lines.push('## Pre-Lint Audit Summary')
  lines.push('')
  lines.push('| Audit | Files with findings | Total findings | Detail |')
  lines.push('| --- | ---: | ---: | --- |')
  for (const s of result.auditSummaries) {
    const detail = (s.detail || '').replace(/\|/g, '\\|')
    lines.push(`| ${s.auditId} | ${s.filesWithFindings} | ${s.totalFindings} | ${detail} |`)
  }
  lines.push('')
  lines.push(`Audits loaded: ${result.auditSummaries.length} / ${PRE_LINT_SOURCES.length}`)
  lines.push('')

  const totalFindings = result.auditSummaries.reduce((sum, s) => sum + s.totalFindings, 0)
  lines.push('## Repair plan readiness')
  lines.push('')
  lines.push(`**Total pre-lint findings:** ${totalFindings}`)
  if (totalFindings === 0) {
    lines.push('')
    lines.push('No findings in pre-lint audits. Safe to run `npm run audit:all`.')
  } else {
    lines.push('')
    lines.push('Address the findings above (see each audit\'s JSON/MD in `.audit-reports/`) before running full audit.')
  }
  lines.push('')

  if (result.hotspots.length > 0) {
    lines.push('## Top hotspot files (pre-lint)')
    lines.push('')
    lines.push('| File | Score | Audits | Which audits |')
    lines.push('| --- | ---: | ---: | --- |')
    for (const f of result.hotspots.slice(0, 15)) {
      lines.push(`| \`${f.repoPath}\` | ${f.totalScore.toFixed(1)} | ${f.auditCount} | ${f.auditIds.join(', ')} |`)
    }
    lines.push('')
  }

  lines.push('## Next steps')
  lines.push('')
  lines.push('1. Run pre-lint audits: `npm run audit:pre-lint`')
  lines.push('2. Run this meta report: `npm run audit:pre-lint:meta`')
  lines.push('3. Fix findings using lint-audit.md and lint-warnings-audit.md in `client/.audit-reports/`')
  lines.push('4. Re-run pre-lint + meta until total findings are acceptable')
  lines.push('5. Run `npm run audit:all`')
  lines.push('')

  return lines.join('\n')
}

function main() {
  const auditResults = PRE_LINT_SOURCES.map((src) => ({
    ...src,
    data: loadAuditJson(src.file),
  }))

  const loadedCount = auditResults.filter((a) => a.data !== null).length
  console.log(`Loaded ${loadedCount}/${PRE_LINT_SOURCES.length} pre-lint audit reports`)

  const auditSummaries = auditResults.map(({ id, data }) => getAuditSummary(id, data))
  const fileScores = aggregateFileScores(auditResults)
  const hotspots = computeHealthScores(fileScores)

  const result = {
    generatedAt: new Date().toISOString(),
    auditSummaries,
    hotspots: hotspots.slice(0, 30),
  }

  if (fs.existsSync(OUT_JSON)) {
    try {
      fs.copyFileSync(OUT_JSON, PREVIOUS_JSON)
    } catch { /* non-critical */ }
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(result, null, 2))
  fs.writeFileSync(OUT_MD, renderMarkdownReport(result))

  console.log(`Wrote:\n- ${toRepoPath(OUT_JSON)}\n- ${toRepoPath(OUT_MD)}`)
  const total = auditSummaries.reduce((sum, s) => sum + s.totalFindings, 0)
  console.log(`Total pre-lint findings: ${total} (hotspot files: ${hotspots.length})`)
  process.exitCode = 0
}

main()
