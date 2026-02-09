import fs from 'node:fs'
import path from 'node:path'

/**
 * Audit Meta Report Script
 *
 * Goal: Read ALL audit JSON outputs and produce a unified dashboard showing:
 *   - Health score per file (weighted sum across all audits)
 *   - Top 10 hotspot files (appearing in most audits with highest combined scores)
 *   - Audit-over-audit trend (if previous run's JSON exists, show delta)
 *   - Cross-audit correlations
 *   - Exception creep tracker
 *
 * This runs AFTER all other audits and reads their JSON outputs.
 *
 * Output:
 *   - client/.audit-reports/audit-meta-report.json
 *   - client/.audit-reports/audit-meta-report.md
 */

const CWD = path.resolve(process.cwd())
const CLIENT_AUDIT = path.join(CWD, '.audit-reports')
const PROJECT_ROOT_AUDIT = path.join(CWD, 'client', '.audit-reports')
const IS_CLIENT_DIR = fs.existsSync(CLIENT_AUDIT)
const AUDIT_DIR = IS_CLIENT_DIR ? CLIENT_AUDIT : PROJECT_ROOT_AUDIT
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD

const OUT_JSON = path.join(AUDIT_DIR, 'audit-meta-report.json')
const OUT_MD = path.join(AUDIT_DIR, 'audit-meta-report.md')
const PREVIOUS_JSON = path.join(AUDIT_DIR, 'audit-meta-report-previous.json')

function toRepoPath(p) { return path.relative(PROJECT_ROOT, p).replaceAll(path.sep, '/') }

/**
 * List of audits to aggregate, with their JSON filenames and score weight
 */
const AUDIT_SOURCES = [
  { id: 'type-similarity', file: 'type-similarity-audit.json', weight: 1 },
  { id: 'component-logic', file: 'component-logic-audit.json', weight: 1 },
  { id: 'composables-logic', file: 'composables-logic-audit.json', weight: 1 },
  { id: 'loop-mutation', file: 'loop-mutation-audit.json', weight: 1 },
  { id: 'hardcoding', file: 'hardcoding-audit.json', weight: 1 },
  { id: 'function-complexity', file: 'function-complexity-audit.json', weight: 1.5 },
  { id: 'pattern-detection', file: 'pattern-detection-audit.json', weight: 0.5 },
  { id: 'duplication', file: 'duplication-audit.json', weight: 1 },
  { id: 'unused-code', file: 'unused-code-audit.json', weight: 0.5 },
  { id: 'error-handling', file: 'error-handling-audit.json', weight: 1.5 },
  { id: 'deprecation', file: 'deprecation-audit.json', weight: 1 },
  { id: 'security', file: 'security-audit.json', weight: 2 },
  { id: 'todo-aging', file: 'todo-aging-audit.json', weight: 0.5 },
  { id: 'import-graph', file: 'import-graph-audit.json', weight: 1.5 },
  { id: 'file-cohesion', file: 'file-cohesion-audit.json', weight: 1 },
  { id: 'api-contract', file: 'api-contract-audit.json', weight: 1 },
  { id: 'constants-consolidation', file: 'constants-consolidation-audit.json', weight: 1 },
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

/**
 * Extract file-level scores from each audit's JSON
 * Returns Map<repoPath, { auditId: string, score: number }[]>
 */
function aggregateFileScores(auditResults) {
  const fileScores = new Map()

  for (const { id, data, weight } of auditResults) {
    if (!data) continue

    // Most audits have a `files` array with `repoPath` and `score`
    const files = Array.isArray(data.files) ? data.files : []
    for (const f of files) {
      const repoPath = f.repoPath || f.file || ''
      if (!repoPath) continue
      const score = (f.score || f.complexityScore || 0) * weight

      if (!fileScores.has(repoPath)) {
        fileScores.set(repoPath, [])
      }
      fileScores.get(repoPath).push({ auditId: id, score })
    }

    // Import-graph stores files differently
    if (id === 'import-graph' && Array.isArray(data.files)) {
      for (const f of data.files) {
        const repoPath = f.file || ''
        if (!repoPath) continue
        if (!fileScores.has(repoPath)) fileScores.set(repoPath, [])
        fileScores.get(repoPath).push({ auditId: id, score: (f.score || 0) * weight })
      }
    }

    // API contract stores findings, not per-file scores
    if (id === 'api-contract' && Array.isArray(data.findings)) {
      for (const f of data.findings) {
        for (const fileKey of [f.clientFile, f.serverFile]) {
          if (!fileKey) continue
          if (!fileScores.has(fileKey)) fileScores.set(fileKey, [])
          fileScores.get(fileKey).push({ auditId: id, score: (f.severity === 'warning' ? 3 : 1) * weight })
        }
      }
    }
  }

  return fileScores
}

function computeHealthScores(fileScores) {
  const results = []

  for (const [repoPath, scores] of fileScores) {
    const totalScore = scores.reduce((sum, s) => sum + s.score, 0)
    const auditCount = new Set(scores.map(s => s.auditId)).size
    const auditIds = [...new Set(scores.map(s => s.auditId))]

    results.push({ repoPath, totalScore, auditCount, auditIds })
  }

  return results.sort((a, b) => b.totalScore - a.totalScore || b.auditCount - a.auditCount)
}

function computeExceptionCreep(auditResults) {
  let totalAllowed = 0
  for (const { data } of auditResults) {
    if (!data) continue
    if (data.exceptionSummary?.totalAllowed) {
      totalAllowed += data.exceptionSummary.totalAllowed
    }
  }
  return totalAllowed
}

function computeAuditSummaries(auditResults) {
  return auditResults
    .filter(a => a.data !== null)
    .map(({ id, data }) => {
      const files = Array.isArray(data.files) ? data.files : []
      const findings = Array.isArray(data.findings) ? data.findings : []
      const totalFindings = data.exceptionSummary?.totalRequiresReview ||
                           data.totals?.totalMarkers ||
                           findings.length ||
                           files.length

      return { auditId: id, filesWithFindings: files.length, totalFindings }
    })
}

function renderMarkdownReport(result) {
  const lines = []
  lines.push('# Audit Meta Report (Generated)')
  lines.push('')
  lines.push(`Generated at: ${result.generatedAt}`)
  lines.push('')

  lines.push('## Audit Coverage')
  lines.push('')
  lines.push('| Audit | Files | Findings |')
  lines.push('| --- | ---: | ---: |')
  for (const s of result.auditSummaries) {
    lines.push(`| ${s.auditId} | ${s.filesWithFindings} | ${s.totalFindings} |`)
  }
  lines.push('')
  lines.push(`Audits loaded: ${result.auditSummaries.length} / ${AUDIT_SOURCES.length}`)
  lines.push('')

  lines.push('## Top 10 Hotspot Files')
  lines.push('')
  lines.push('Files appearing across the most audits with the highest combined weighted score.')
  lines.push('')
  lines.push('| File | Score | Audits | Which Audits |')
  lines.push('| --- | ---: | ---: | --- |')
  for (const f of result.hotspots.slice(0, 10)) {
    lines.push(`| \`${f.repoPath}\` | ${f.totalScore.toFixed(1)} | ${f.auditCount} | ${f.auditIds.join(', ')} |`)
  }
  lines.push('')

  if (result.trend) {
    lines.push('## Trend (vs previous run)')
    lines.push('')
    for (const t of result.trend) {
      const arrow = t.delta > 0 ? '↑' : t.delta < 0 ? '↓' : '→'
      lines.push(`- **${t.auditId}**: ${t.previous} → ${t.current} (${arrow} ${t.delta > 0 ? '+' : ''}${t.delta})`)
    }
    lines.push('')
  }

  lines.push('## Exception Creep')
  lines.push('')
  lines.push(`Total allowed exceptions across all audits: **${result.totalExceptions}**`)
  if (result.previousExceptions !== null) {
    const delta = result.totalExceptions - result.previousExceptions
    const arrow = delta > 0 ? '↑' : delta < 0 ? '↓' : '→'
    lines.push(`Previous run: ${result.previousExceptions} (${arrow} ${delta > 0 ? '+' : ''}${delta})`)
  }
  lines.push('')

  lines.push('## Cross-Audit Correlations')
  lines.push('')
  lines.push('Files that appear in 3+ different audits often have systemic issues:')
  lines.push('')
  const multiAudit = result.hotspots.filter(f => f.auditCount >= 3)
  if (multiAudit.length === 0) {
    lines.push('No files appear in 3 or more audits.')
  } else {
    for (const f of multiAudit.slice(0, 15)) {
      lines.push(`- \`${f.repoPath}\` (${f.auditCount} audits): ${f.auditIds.join(', ')}`)
    }
  }
  lines.push('')

  return lines.join('\n')
}

function main() {
  // Load all audit JSONs
  const auditResults = AUDIT_SOURCES.map(src => ({
    ...src,
    data: loadAuditJson(src.file),
  }))

  const loadedCount = auditResults.filter(a => a.data !== null).length
  console.log(`Loaded ${loadedCount}/${AUDIT_SOURCES.length} audit reports`)

  // Aggregate file scores
  const fileScores = aggregateFileScores(auditResults)
  const hotspots = computeHealthScores(fileScores)
  const totalExceptions = computeExceptionCreep(auditResults)
  const auditSummaries = computeAuditSummaries(auditResults)

  // Load previous run for trend comparison
  let trend = null
  let previousExceptions = null
  if (fs.existsSync(PREVIOUS_JSON)) {
    try {
      const prev = JSON.parse(fs.readFileSync(PREVIOUS_JSON, 'utf8'))
      previousExceptions = prev.totalExceptions || null
      if (Array.isArray(prev.auditSummaries)) {
        trend = auditSummaries.map(current => {
          const prevAudit = prev.auditSummaries.find(p => p.auditId === current.auditId)
          return {
            auditId: current.auditId,
            current: current.totalFindings,
            previous: prevAudit?.totalFindings ?? 0,
            delta: current.totalFindings - (prevAudit?.totalFindings ?? 0),
          }
        })
      }
    } catch { /* previous report unreadable */ }
  }

  const result = {
    generatedAt: new Date().toISOString(),
    auditSummaries,
    hotspots: hotspots.slice(0, 50),
    totalExceptions,
    previousExceptions,
    trend,
  }

  // Save current as previous for next run's trend comparison
  if (fs.existsSync(OUT_JSON)) {
    try {
      fs.copyFileSync(OUT_JSON, PREVIOUS_JSON)
    } catch { /* non-critical */ }
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(result, null, 2))
  fs.writeFileSync(OUT_MD, renderMarkdownReport(result))

  console.log(`Wrote:\n- ${toRepoPath(OUT_JSON)}\n- ${toRepoPath(OUT_MD)}`)
  console.log(`Hotspot files: ${hotspots.length}, Total exceptions: ${totalExceptions}`)
  process.exitCode = 0
}

main()
