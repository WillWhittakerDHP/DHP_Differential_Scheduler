import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

/**
 * Audit Meta Report Script
 *
 * Goal: Read ALL audit JSON outputs and produce a unified dashboard showing:
 *   - Health score per file (weighted sum across all audits)
 *   - Top 10 hotspot files (appearing in most audits with highest combined scores)
 *   - Audit-over-audit trend (if previous run's JSON exists, show delta)
 *   - Cross-audit correlations
 *   - Deterministic exception analysis (structural vs specific suppressions)
 *
 * Exception Tracking Philosophy:
 *   "Exception creep" is only meaningful when NEW suppressions are added —
 *   not when existing glob patterns match more files as the codebase grows.
 *   This script separates:
 *     - Structural exceptions: glob patterns in config files (architectural decisions)
 *     - Specific suppressions: inline @audit-allow comments and specific config entries
 *   Only specific suppressions represent real "creep" worth monitoring.
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
  { id: 'bundle-size-budget', file: 'bundle-size-budget-audit.json', weight: 1.5 },
  { id: 'coverage-risk-crossref', file: 'coverage-risk-crossref-audit.json', weight: 2 },
  { id: 'naming-convention', file: 'naming-convention-audit.json', weight: 0.5 },
  { id: 'api-versioning', file: 'api-versioning-audit.json', weight: 1.5 },
  { id: 'data-flow', file: 'data-flow-audit.json', weight: 2 },
  { id: 'dep-freshness', file: 'dep-freshness-audit.json', weight: 1 },
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

// --------------------------------------------------------------------------
// Deterministic Exception Analysis
//
// WHY: The old approach summed all "totalAllowed" across audits into one number.
// That number grew whenever new files matched existing glob patterns — which is
// NOT meaningful creep. A new Vue composable matching a composables glob is an
// architectural expectation, not a suppression.
//
// PATTERN: We separate exceptions into two categories:
//   1. Structural (pattern-based): Glob patterns in config files. These are
//      architectural decisions. We track them as a ratio (allowed/scanned)
//      and detect changes by hashing the config files themselves.
//   2. Specific (suppression-based): Inline @audit-allow comments and
//      specific file/line entries in configs. These are the real "creep"
//      signal — someone actively chose to suppress a finding.
//
// COMPARISON: Think of it like .gitignore vs git stash:
//   - Structural = .gitignore patterns (whole categories excluded by design)
//   - Specific = git stash (individual items set aside, should be reviewed)
// --------------------------------------------------------------------------

/**
 * Compute a SHA-256 hash of a config file's allowlist content.
 * Returns null if the file doesn't exist or can't be read.
 * LEARNING: We hash only the allowlist section so that changes to
 * priority thresholds (which don't affect exception counts) don't
 * trigger false "config changed" alerts.
 */
function hashConfigAllowlist(configFilePath) {
  if (!fs.existsSync(configFilePath)) return null
  try {
    const raw = JSON.parse(fs.readFileSync(configFilePath, 'utf8'))
    const allowlistContent = JSON.stringify(raw.allowlist ?? {})
    return crypto.createHash('sha256').update(allowlistContent).digest('hex').slice(0, 16)
  } catch {
    return null
  }
}

/**
 * Build a config fingerprint map for all audit config files.
 * This lets us detect when the actual allowlist rules changed
 * between runs (vs just more files matching existing rules).
 */
function computeConfigFingerprints(auditDir) {
  const configFiles = [
    ...AUDIT_SOURCES.map(src => ({
      auditId: src.id,
      fileName: `${src.id}-audit-config.json`,
    })),
    { auditId: 'typecheck', fileName: 'typecheck/typecheck-audit-config.json' },
  ]

  return configFiles.reduce((fingerprints, { auditId, fileName }) => {
    const hash = hashConfigAllowlist(path.join(auditDir, fileName))
    if (hash !== null) {
      fingerprints[auditId] = hash
    }
    return fingerprints
  }, {})
}

/**
 * Count the total glob patterns defined across all config files.
 * This gives a quick sense of how many architectural exclusions exist.
 */
function countConfigPatterns(auditDir) {
  const configGlobs = [
    ...AUDIT_SOURCES.map(src => `${src.id}-audit-config.json`),
    'typecheck/typecheck-audit-config.json',
  ]

  return configGlobs.reduce((total, fileName) => {
    const filePath = path.join(auditDir, fileName)
    if (!fs.existsSync(filePath)) return total
    try {
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      const patterns = raw.allowlist?.patterns ?? []
      const specific = raw.allowlist?.specific ?? []
      return total + patterns.length + specific.length
    } catch {
      return total
    }
  }, 0)
}

/**
 * Compute the full deterministic exception analysis.
 *
 * Returns a structured breakdown that separates structural (pattern-based)
 * exceptions from specific (inline + config-specific) suppressions, and
 * includes config fingerprints for change detection.
 */
function computeExceptionAnalysis(auditResults, auditDir) {
  // PATTERN: Use reduce to build the per-audit breakdown without mutation
  const perAudit = auditResults
    .filter(({ data }) => data !== null)
    .reduce((breakdown, { id, data }) => {
      const summary = data.exceptionSummary ?? {}
      const bySource = summary.bySource ?? {}
      const totalScanned = data.totalScanned ?? 0

      const patternCount = bySource.pattern ?? 0
      const inlineCount = bySource.inline ?? 0
      const specificCount = bySource.specific ?? 0
      const totalAllowed = summary.totalAllowed ?? 0

      // Only include audits that have any exceptions
      if (totalAllowed > 0) {
        breakdown.push({
          auditId: id,
          structural: patternCount,
          specific: inlineCount + specificCount,
          total: totalAllowed,
          totalScanned,
          // LEARNING: Ratio tells us "how many exceptions per scanned file"
          // A stable ratio means the codebase grew but patterns didn't change
          ratio: totalScanned > 0
            ? Math.round((patternCount / totalScanned) * 1000) / 1000
            : 0,
        })
      }
      return breakdown
    }, [])

  // Aggregate totals across all audits
  const totals = perAudit.reduce(
    (sums, entry) => ({
      structural: sums.structural + entry.structural,
      specific: sums.specific + entry.specific,
      total: sums.total + entry.total,
    }),
    { structural: 0, specific: 0, total: 0 },
  )

  // Config fingerprints for change detection
  const configFingerprints = computeConfigFingerprints(auditDir)
  const configPatternCount = countConfigPatterns(auditDir)

  return {
    totals,
    perAudit,
    configFingerprints,
    configPatternCount,
  }
}

/**
 * Compare current exception analysis against previous run.
 * Returns a structured diff showing what actually changed.
 */
function computeExceptionDiff(current, previous) {
  if (!previous) {
    return {
      totalDelta: 0,
      structuralDelta: 0,
      specificDelta: 0,
      configsChanged: [],
      verdict: 'first-run',
    }
  }

  const prevTotals = previous.totals ?? { structural: 0, specific: 0, total: 0 }
  const totalDelta = current.totals.total - prevTotals.total
  const structuralDelta = current.totals.structural - prevTotals.structural
  const specificDelta = current.totals.specific - prevTotals.specific

  // Detect which config allowlists actually changed
  const prevFingerprints = previous.configFingerprints ?? {}
  const configsChanged = Object.entries(current.configFingerprints).reduce(
    (changed, [auditId, hash]) => {
      if (prevFingerprints[auditId] !== hash) {
        changed.push(auditId)
      }
      return changed
    },
    [],
  )

  // LEARNING: Determine the "verdict" — is this real creep or harmless growth?
  // Real creep = specific suppressions increased OR config allowlists were expanded
  // Harmless growth = only structural count changed with same configs
  let verdict = 'stable'
  if (specificDelta > 0) {
    verdict = 'suppression-creep'
  } else if (configsChanged.length > 0 && structuralDelta > 0) {
    verdict = 'config-expanded'
  } else if (structuralDelta > 0 && configsChanged.length === 0) {
    verdict = 'codebase-growth'
  } else if (totalDelta < 0) {
    verdict = 'improving'
  }

  return {
    totalDelta,
    structuralDelta,
    specificDelta,
    configsChanged,
    verdict,
  }
}

// LEARNING: Keep the legacy function for backward compatibility in the JSON output.
// The totalExceptions field is still useful as a quick reference number.
function computeExceptionCreep(auditResults) {
  return auditResults.reduce((totalAllowed, { data }) => {
    if (!data) return totalAllowed
    return totalAllowed + (data.exceptionSummary?.totalAllowed ?? 0)
  }, 0)
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

  lines.push('## Exception Analysis')
  lines.push('')

  const analysis = result.exceptionAnalysis
  const diff = result.exceptionDiff

  if (analysis) {
    // Verdict banner — the single most important signal
    const verdictLabels = {
      'stable': 'Stable — no meaningful exception changes',
      'improving': 'Improving — total exceptions decreased',
      'codebase-growth': 'Codebase growth — same configs, more files matched existing patterns',
      'config-expanded': 'Config expanded — allowlist rules were added or modified',
      'suppression-creep': 'Suppression creep — new inline/specific exceptions were added',
      'first-run': 'First run — no previous data to compare',
    }
    const verdict = diff?.verdict ?? 'first-run'
    lines.push(`**Verdict:** ${verdictLabels[verdict] ?? verdict}`)
    lines.push('')

    // Summary table
    lines.push('### Totals')
    lines.push('')
    lines.push('| Category | Count | Description |')
    lines.push('| --- | ---: | --- |')
    lines.push(`| Structural (patterns) | ${analysis.totals.structural} | Glob patterns in config files — architectural decisions |`)
    lines.push(`| Specific (suppressions) | ${analysis.totals.specific} | Inline @audit-allow comments + specific config entries |`)
    lines.push(`| **Total allowed** | **${analysis.totals.total}** | |`)
    lines.push(`| Config pattern rules | ${analysis.configPatternCount} | Total glob/specific rules across all config files |`)
    lines.push('')

    // Delta from previous run
    if (diff && diff.verdict !== 'first-run') {
      lines.push('### Changes (vs previous run)')
      lines.push('')

      const formatDelta = (value) => {
        const arrow = value > 0 ? '↑' : value < 0 ? '↓' : '→'
        return `${arrow} ${value > 0 ? '+' : ''}${value}`
      }

      lines.push(`- **Total:** ${formatDelta(diff.totalDelta)}`)
      lines.push(`- **Structural:** ${formatDelta(diff.structuralDelta)} ${diff.structuralDelta > 0 && diff.configsChanged.length === 0 ? '*(same configs — just more files)*' : ''}`)
      lines.push(`- **Specific:** ${formatDelta(diff.specificDelta)} ${diff.specificDelta > 0 ? '**⚠️ Review new suppressions**' : ''}`)

      if (diff.configsChanged.length > 0) {
        lines.push(`- **Configs changed:** ${diff.configsChanged.join(', ')}`)
      }
      lines.push('')
    }

    // Per-audit breakdown
    if (analysis.perAudit.length > 0) {
      lines.push('### Per-Audit Breakdown')
      lines.push('')
      lines.push('| Audit | Structural | Specific | Total | Scanned | Ratio |')
      lines.push('| --- | ---: | ---: | ---: | ---: | ---: |')
      for (const entry of analysis.perAudit) {
        lines.push(`| ${entry.auditId} | ${entry.structural} | ${entry.specific} | ${entry.total} | ${entry.totalScanned} | ${entry.ratio} |`)
      }
      lines.push('')
      lines.push('> **Ratio** = structural exceptions / scanned files. A stable ratio across runs means the codebase grew but patterns did not change.')
      lines.push('')
    }
  } else {
    // Fallback for legacy data without analysis
    lines.push(`Total allowed exceptions across all audits: **${result.totalExceptions}**`)
    if (result.previousExceptions !== null) {
      const delta = result.totalExceptions - result.previousExceptions
      const arrow = delta > 0 ? '↑' : delta < 0 ? '↓' : '→'
      lines.push(`Previous run: ${result.previousExceptions} (${arrow} ${delta > 0 ? '+' : ''}${delta})`)
    }
    lines.push('')
  }

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

  // Deterministic exception analysis
  const exceptionAnalysis = computeExceptionAnalysis(auditResults, AUDIT_DIR)

  // Load previous run for trend comparison
  let trend = null
  let previousExceptions = null
  let previousExceptionAnalysis = null
  if (fs.existsSync(PREVIOUS_JSON)) {
    try {
      const prev = JSON.parse(fs.readFileSync(PREVIOUS_JSON, 'utf8'))
      previousExceptions = prev.totalExceptions ?? null
      previousExceptionAnalysis = prev.exceptionAnalysis ?? null

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

  // Compute exception diff against previous analysis
  const exceptionDiff = computeExceptionDiff(exceptionAnalysis, previousExceptionAnalysis)

  const result = {
    generatedAt: new Date().toISOString(),
    auditSummaries,
    hotspots: hotspots.slice(0, 50),
    // Legacy field — kept for backward compatibility
    totalExceptions,
    previousExceptions,
    // New deterministic analysis
    exceptionAnalysis,
    exceptionDiff,
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

  // Log the deterministic verdict for quick CI/terminal feedback
  const verdictEmoji = {
    'stable': '✅', 'improving': '✅', 'codebase-growth': '✅',
    'config-expanded': '⚠️', 'suppression-creep': '❌', 'first-run': 'ℹ️',
  }
  const verdict = exceptionDiff.verdict
  console.log(`Exception verdict: ${verdictEmoji[verdict] ?? '?'} ${verdict}`)
  console.log(`  Structural: ${exceptionAnalysis.totals.structural} | Specific: ${exceptionAnalysis.totals.specific} | Total: ${exceptionAnalysis.totals.total}`)

  if (exceptionDiff.specificDelta > 0) {
    console.log(`  ⚠️  Specific suppressions increased by +${exceptionDiff.specificDelta} — review new @audit-allow comments`)
  }
  if (exceptionDiff.configsChanged.length > 0) {
    console.log(`  ⚠️  Config allowlists changed: ${exceptionDiff.configsChanged.join(', ')}`)
  }

  process.exitCode = 0
}

main()
