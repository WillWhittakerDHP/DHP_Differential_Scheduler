import fs from 'node:fs'
import path from 'node:path'
import { getAuditReportHeaderLines } from './audit-exceptions.mjs'

/**
 * Pre-Typecheck Meta Report Script
 *
 * Reads only the pre-typecheck audit JSON outputs and produces a unified meta report
 * so you can build a repair plan before running the full audit:all or typecheck:audit.
 *
 * Strategy: Consistent with audit-meta-report.mjs — same path resolution, load JSON,
 * aggregate per-audit summaries and file-level hotspots, emit JSON + MD.
 *
 * Pre-typecheck audits (order): type-similarity, dep-freshness, import-hygiene,
 * import-graph, api-contract, type-escape, type-import.
 *
 * Output:
 *   - client/.audit-reports/pre-typecheck-meta-report.json
 *   - client/.audit-reports/pre-typecheck-meta-report.md
 */

const CWD = path.resolve(process.cwd())
const CLIENT_AUDIT = path.join(CWD, '.audit-reports')
const PROJECT_ROOT_AUDIT = path.join(CWD, 'client', '.audit-reports')
const IS_CLIENT_DIR = fs.existsSync(CLIENT_AUDIT)
const AUDIT_DIR = IS_CLIENT_DIR ? CLIENT_AUDIT : PROJECT_ROOT_AUDIT
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD

const OUT_JSON = path.join(AUDIT_DIR, 'pre-typecheck-meta-report.json')
const OUT_MD = path.join(AUDIT_DIR, 'pre-typecheck-meta-report.md')
const PREVIOUS_JSON = path.join(AUDIT_DIR, 'pre-typecheck-meta-report-previous.json')

function toRepoPath(p) {
  return path.relative(PROJECT_ROOT, p).replaceAll(path.sep, '/')
}

const PRE_TYPECHECK_SOURCES = [
  { id: 'type-similarity', file: 'type-similarity-audit.json', weight: 1 },
  { id: 'dep-freshness', file: 'dep-freshness-audit.json', weight: 1 },
  { id: 'import-hygiene', file: 'import-hygiene-audit.json', weight: 1 },
  { id: 'import-graph', file: 'import-graph-audit.json', weight: 1.5 },
  { id: 'api-contract', file: 'api-contract-audit.json', weight: 1 },
  { id: 'type-escape', file: 'type-escape-audit.json', weight: 1 },
  { id: 'type-import', file: 'type-import-audit.json', weight: 1 },
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
 * Normalize totalFindings and filesWithFindings per audit (each has different JSON shape).
 */
function getAuditSummary(id, data) {
  if (!data) return { auditId: id, totalFindings: 0, filesWithFindings: 0, detail: '' }
  const files = Array.isArray(data.files) ? data.files : []
  const findings = Array.isArray(data.findings) ? data.findings : []

  switch (id) {
    case 'type-similarity': {
      const groups = data.groups ?? []
      return {
        auditId: id,
        totalFindings: groups.length,
        filesWithFindings: groups.length,
        detail: `Similarity groups (UNIFY/BRAND/EXTEND/REVIEW): ${groups.length}`,
      }
    }
    case 'dep-freshness': {
      const packages = data.packages ?? []
      const behind = data.byBehind ?? {}
      return {
        auditId: id,
        totalFindings: packages.length,
        filesWithFindings: packages.length,
        detail: `Outdated: ${packages.length} (major: ${behind['major-behind'] ?? 0}, minor: ${behind['minor-behind'] ?? 0}, patch: ${behind['patch-behind'] ?? 0})`,
      }
    }
    case 'import-hygiene': {
      const barrel = (data.barrelBypass ?? []).length
      const relative = (data.relativeWhenAlias ?? []).length
      const reexport = (data.typeValueReexport ?? []).length
      const inconsistent = (data.inconsistentPaths ?? []).length
      const duplicate = (data.duplicateReexports ?? []).length
      const total = barrel + relative + reexport + inconsistent * 2 + duplicate
      return {
        auditId: id,
        totalFindings: total,
        filesWithFindings: files.length,
        detail: `Barrel: ${barrel}, Deep relative: ${relative}, Type re-export: ${reexport}, Inconsistent: ${inconsistent}, Duplicate re-exports: ${duplicate}`,
      }
    }
    case 'import-graph': {
      const cycles = (data.cycles ?? []).length
      const fanOut = (data.fanOutViolations ?? []).length
      const fanIn = (data.fanInViolations ?? []).length
      const total = cycles * 10 + fanOut + fanIn
      return {
        auditId: id,
        totalFindings: total,
        filesWithFindings: fanOut + fanIn,
        detail: `Cycles: ${cycles}, Fan-out violations: ${fanOut}, Fan-in violations: ${fanIn}`,
      }
    }
    case 'api-contract':
      return {
        auditId: id,
        totalFindings: findings.length,
        filesWithFindings: new Set(findings.map(f => f.clientFile || f.serverFile).filter(Boolean)).size,
        detail: `Client/server type mismatches: ${findings.length}`,
      }
    case 'type-escape':
      return {
        auditId: id,
        totalFindings: findings.length,
        filesWithFindings: files.length,
        detail: `Type escape hatches (as any, ts-ignore, etc.): ${findings.length}`,
      }
    case 'type-import': {
      const v = (data.valueImportFromTypeOnlyFile ?? []).length
      const t = (data.typeUsedAsValue ?? []).length
      return {
        auditId: id,
        totalFindings: v + t,
        filesWithFindings: files.length,
        detail: `Value-from-type-only: ${v}, Type-used-as-value: ${t}`,
      }
    }
    default:
      return {
        auditId: id,
        totalFindings: findings.length || files.length,
        filesWithFindings: files.length,
        detail: '',
      }
  }
}

/**
 * Aggregate file-level scores from pre-typecheck audits (same pattern as audit-meta-report).
 */
function aggregateFileScores(auditResults) {
  const fileScores = new Map()

  for (const { id, data, weight } of auditResults) {
    if (!data) continue

    const files = Array.isArray(data.files) ? data.files : []
    for (const f of files) {
      const repoPath = f.repoPath || f.file || ''
      if (!repoPath) continue
      const score = (f.score || f.complexityScore || 0) * weight
      if (!fileScores.has(repoPath)) fileScores.set(repoPath, [])
      fileScores.get(repoPath).push({ auditId: id, score })
    }

    if (id === 'import-graph' && Array.isArray(data.files)) {
      for (const f of data.files) {
        const repoPath = f.file || ''
        if (!repoPath) continue
        if (!fileScores.has(repoPath)) fileScores.set(repoPath, [])
        fileScores.get(repoPath).push({ auditId: id, score: (f.score || 0) * weight })
      }
    }

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

function renderMarkdownReport(result) {
  const lines = []
  lines.push('# Pre-Typecheck Meta Report (Generated)')
  lines.push('')
  lines.push(...getAuditReportHeaderLines())
  lines.push('')
  lines.push('Use this report to build a **repair plan** before running `audit:all` or `typecheck:audit`.')
  lines.push('')
  lines.push(`Generated at: ${result.generatedAt}`)
  lines.push('')

  lines.push('## Pre-Typecheck Audit Summary')
  lines.push('')
  lines.push('| Audit | Files with findings | Total findings | Detail |')
  lines.push('| --- | ---: | ---: | --- |')
  for (const s of result.auditSummaries) {
    const detail = s.detail ? s.detail.replace(/\|/g, '\\|') : ''
    lines.push(`| ${s.auditId} | ${s.filesWithFindings} | ${s.totalFindings} | ${detail} |`)
  }
  lines.push('')
  lines.push(`Audits loaded: ${result.auditSummaries.length} / ${PRE_TYPECHECK_SOURCES.length}`)
  lines.push('')

  const totalFindings = result.auditSummaries.reduce((sum, s) => sum + s.totalFindings, 0)
  lines.push('## Repair plan readiness')
  lines.push('')
  lines.push(`**Total pre-typecheck findings:** ${totalFindings}`)
  if (totalFindings === 0) {
    lines.push('')
    lines.push('No findings in pre-typecheck audits. Safe to run `npm run typecheck:audit` or `npm run audit:all`.')
  } else {
    lines.push('')
    lines.push('Address the findings above (see each audit\'s JSON/MD in `.audit-reports/`) before relying on typecheck or full audit.')
  }
  lines.push('')

  if (result.hotspots.length > 0) {
    lines.push('## Top hotspot files (pre-typecheck only)')
    lines.push('')
    lines.push('Files appearing in multiple pre-typecheck audits — good repair candidates.')
    lines.push('')
    lines.push('| File | Score | Audits | Which audits |')
    lines.push('| --- | ---: | ---: | --- |')
    for (const f of result.hotspots.slice(0, 15)) {
      lines.push(`| \`${f.repoPath}\` | ${f.totalScore.toFixed(1)} | ${f.auditCount} | ${f.auditIds.join(', ')} |`)
    }
    lines.push('')
  }

  if (result.trend && result.trend.length > 0) {
    lines.push('## Trend (vs previous run)')
    lines.push('')
    for (const t of result.trend) {
      const arrow = t.delta > 0 ? '↑' : t.delta < 0 ? '↓' : '→'
      lines.push(`- **${t.auditId}**: ${t.previous} → ${t.current} (${arrow} ${t.delta > 0 ? '+' : ''}${t.delta})`)
    }
    lines.push('')
  }

  lines.push('## Next steps')
  lines.push('')
  lines.push('1. Run pre-typecheck audits: `npm run audit:pre-typecheck`')
  lines.push('2. Run this meta report: `npm run audit:pre-typecheck:meta`')
  lines.push('3. Fix findings using the per-audit reports in `client/.audit-reports/`')
  lines.push('4. Re-run pre-typecheck + meta until total findings are acceptable')
  lines.push('5. Run `npm run typecheck:audit` or `npm run audit:all`')
  lines.push('')

  return lines.join('\n')
}

function main() {
  const auditResults = PRE_TYPECHECK_SOURCES.map(src => ({
    ...src,
    data: loadAuditJson(src.file),
  }))

  const loadedCount = auditResults.filter(a => a.data !== null).length
  console.log(`Loaded ${loadedCount}/${PRE_TYPECHECK_SOURCES.length} pre-typecheck audit reports`)

  const auditSummaries = auditResults.map(({ id, data }) => getAuditSummary(id, data))
  const fileScores = aggregateFileScores(auditResults)
  const hotspots = computeHealthScores(fileScores)

  let trend = null
  if (fs.existsSync(PREVIOUS_JSON)) {
    try {
      const prev = JSON.parse(fs.readFileSync(PREVIOUS_JSON, 'utf8'))
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
    } catch { /* previous unreadable */ }
  }

  const result = {
    generatedAt: new Date().toISOString(),
    auditSummaries,
    hotspots: hotspots.slice(0, 30),
    trend,
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
  console.log(`Total pre-typecheck findings: ${total} (hotspot files: ${hotspots.length})`)
  process.exitCode = 0
}

main()
