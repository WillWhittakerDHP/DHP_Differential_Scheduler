import fs from 'node:fs'
import path from 'node:path'
import { getTestsDisabled } from './audit-exceptions.mjs'

/**
 * Coverage-Risk Crossref Audit Script
 *
 * Goal: Cross-reference import-graph (fan-in) with test-audit (coverage).
 * Flags high-risk files: heavily depended on (high fan-in) but untested.
 *
 * When testsDisabled is true in audit-global-config.json, writes an empty/no-op
 * report so the meta report is not cluttered with coverage-risk findings until
 * Phase 3.0 (BETA_LAUNCH_CHECKLIST). Re-enable via checklist item 3.0a.
 *
 * Reads: import-graph-audit.json, test-audit.json (unless tests disabled)
 * Output:
 *   - client/.audit-reports/coverage-risk-crossref-audit.json
 *   - client/.audit-reports/coverage-risk-crossref-audit.md
 */

const CWD = path.resolve(process.cwd())
const IS_CLIENT_DIR = fs.existsSync(path.join(CWD, 'src'))
const PROJECT_ROOT = IS_CLIENT_DIR ? path.resolve(CWD, '..') : CWD
const _CLIENT_ROOT = IS_CLIENT_DIR ? CWD : path.join(PROJECT_ROOT, 'client')
const OUT_DIR = IS_CLIENT_DIR
  ? path.join(CWD, '.audit-reports')
  : path.join(CWD, 'client', '.audit-reports')
const OUT_JSON = path.join(OUT_DIR, 'coverage-risk-crossref-audit.json')
const OUT_MD = path.join(OUT_DIR, 'coverage-risk-crossref-audit.md')
const IMPORT_GRAPH_JSON = path.join(OUT_DIR, 'import-graph-audit.json')
const TEST_AUDIT_JSON = path.join(OUT_DIR, 'test-audit.json')

function ensureDir(d) { fs.mkdirSync(d, { recursive: true }) }
function toRepoPath(p) { return path.relative(PROJECT_ROOT, p).replaceAll(path.sep, '/') }

/** Normalize path for matching: strip extension, normalize slashes */
function normalizePath(repoPath) {
  return repoPath.replaceAll(path.sep, '/').replace(/\.[a-z]+$/i, '')
}

/** riskScore = fanIn * (hasTest ? 0.3 : 1.5) + (exportCount > 5 ? 5 : 0). P0 >= 30, P1 >= 15 */
function computeRiskScore(fanIn, hasTest, exportCount) {
  const multiplier = hasTest ? 0.3 : 1.5
  const exportBonus = exportCount > 5 ? 5 : 0
  return Math.round(fanIn * multiplier + exportBonus)
}

function assignPriority(riskScore) {
  if (riskScore >= 30) return 'P0'
  if (riskScore >= 15) return 'P1'
  return 'P2'
}

function main() {
  ensureDir(OUT_DIR)

  if (getTestsDisabled()) {
    const out = {
      generatedAt: new Date().toISOString(),
      testsDisabled: true,
      inputSources: { importGraph: 'import-graph-audit.json', testAudit: 'test-audit.json' },
      totalFiles: 0,
      riskFiles: [],
      summary: { highFanInUntested: 0, highFanInTested: 0, lowFanInUntested: 0, coverageOfCriticalFiles: '100%' },
      files: [],
      exceptionSummary: { totalAllowed: 0, totalRequiresReview: 0, bySource: { inline: 0, pattern: 0, specific: 0 } },
    }
    fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2))
    const mdLines = [
      '# Coverage-Risk Crossref Audit (Generated)',
      '',
      `Generated at: ${out.generatedAt}`,
      '',
      '**Coverage-risk is suppressed while tests are disabled.** Set `testsDisabled` to `false` in `client/.audit-reports/audit-global-config.json` (see BETA_LAUNCH_CHECKLIST Phase 3.0a) and re-run this audit to populate findings.',
      '',
    ]
    fs.writeFileSync(OUT_MD, mdLines.join('\n'))
    console.log('Wrote:', toRepoPath(OUT_JSON), toRepoPath(OUT_MD))
    console.log('Tests disabled (audit-global-config.json): coverage-risk suppressed.')
    process.exitCode = 0
    return
  }

  if (!fs.existsSync(IMPORT_GRAPH_JSON)) {
    const out = {
      generatedAt: new Date().toISOString(),
      error: 'Missing import-graph-audit.json. Run audit:import-graph first.',
      inputSources: { importGraph: 'import-graph-audit.json', testAudit: 'test-audit.json' },
      totalFiles: 0,
      riskFiles: [],
      summary: { highFanInUntested: 0, highFanInTested: 0, lowFanInUntested: 0, coverageOfCriticalFiles: '0%' },
      files: [],
      exceptionSummary: { totalAllowed: 0, totalRequiresReview: 0, bySource: { inline: 0, pattern: 0, specific: 0 } },
    }
    fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2))
    fs.writeFileSync(OUT_MD, '# Coverage-Risk Crossref Audit\n\nRun audit:import-graph and audit:test first.\n')
    console.log('Wrote:', toRepoPath(OUT_JSON), toRepoPath(OUT_MD))
    console.log('Missing import-graph-audit.json. Run audit:import-graph first.')
    process.exitCode = 0
    return
  }

  if (!fs.existsSync(TEST_AUDIT_JSON)) {
    const out = {
      generatedAt: new Date().toISOString(),
      error: 'Missing test-audit.json. Run audit:test first.',
      inputSources: { importGraph: 'import-graph-audit.json', testAudit: 'test-audit.json' },
      totalFiles: 0,
      riskFiles: [],
      summary: { highFanInUntested: 0, highFanInTested: 0, lowFanInUntested: 0, coverageOfCriticalFiles: '0%' },
      files: [],
      exceptionSummary: { totalAllowed: 0, totalRequiresReview: 0, bySource: { inline: 0, pattern: 0, specific: 0 } },
    }
    fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2))
    fs.writeFileSync(OUT_MD, '# Coverage-Risk Crossref Audit\n\nRun audit:test first.\n')
    console.log('Wrote:', toRepoPath(OUT_JSON), toRepoPath(OUT_MD))
    console.log('Missing test-audit.json. Run audit:test first.')
    process.exitCode = 0
    return
  }

  const importGraph = JSON.parse(fs.readFileSync(IMPORT_GRAPH_JSON, 'utf8'))
  const testAudit = JSON.parse(fs.readFileSync(TEST_AUDIT_JSON, 'utf8'))

  const fanInByFile = new Map()
  for (const v of importGraph.fanInViolations || []) {
    fanInByFile.set(normalizePath(v.file), v.fanIn)
  }
  for (const f of importGraph.files || []) {
    const key = normalizePath(f.file)
    if (!fanInByFile.has(key)) fanInByFile.set(key, 0)
  }
  const fanInViolationSet = new Set((importGraph.fanInViolations || []).map(v => normalizePath(v.file)))

  const sourceByNormalized = new Map()
  for (const s of testAudit.sourceAnalysis || []) {
    const key = normalizePath(s.repoPath)
    sourceByNormalized.set(key, s)
  }

  const riskFiles = []
  let highFanInUntested = 0
  let highFanInTested = 0
  const criticalTested = []

  for (const [normPath, fanIn] of fanInByFile) {
    const source = sourceByNormalized.get(normPath)
    const hasTest = source ? source.hasTest === true : false
    const exportCount = source ? (source.exportCount ?? 0) : 0
    const repoPath = source ? source.repoPath : normPath

    if (fanIn >= 20) {
      if (hasTest) {
        highFanInTested++
        criticalTested.push(repoPath)
      } else {
        highFanInUntested++
      }
    }

    const riskScore = computeRiskScore(fanIn, hasTest, exportCount)
    if (riskScore >= 15) {
      riskFiles.push({
        repoPath,
        fanIn,
        hasTest,
        exportCount,
        riskScore,
        priority: assignPriority(riskScore),
      })
    }
  }

  let lowFanInUntested = 0
  for (const s of testAudit.sourceAnalysis || []) {
    const key = normalizePath(s.repoPath)
    if (s.hasTest === true) continue
    if (fanInViolationSet.has(key)) continue
    lowFanInUntested++
  }

  riskFiles.sort((a, b) => b.riskScore - a.riskScore || a.repoPath.localeCompare(b.repoPath))

  const totalCritical = highFanInUntested + highFanInTested
  const coverageOfCriticalFiles = totalCritical > 0
    ? `${Math.round((criticalTested.length / totalCritical) * 100)}%`
    : '100%'

  const summary = {
    highFanInUntested,
    highFanInTested,
    lowFanInUntested,
    coverageOfCriticalFiles,
    totalRiskFiles: riskFiles.length,
    totalFilesWithFanIn: fanInByFile.size,
  }

  const files = riskFiles.map(f => ({
    repoPath: f.repoPath,
    score: f.riskScore,
    priority: f.priority,
    fanIn: f.fanIn,
    hasTest: f.hasTest,
    exportCount: f.exportCount,
  }))

  const totalRequiresReview = riskFiles.filter(f => f.priority === 'P0' || f.priority === 'P1').length

  const out = {
    generatedAt: new Date().toISOString(),
    inputSources: { importGraph: 'import-graph-audit.json', testAudit: 'test-audit.json' },
    totalFiles: fanInByFile.size,
    riskFiles,
    summary,
    files,
    exceptionSummary: {
      totalAllowed: 0,
      totalRequiresReview,
      bySource: { inline: 0, pattern: 0, specific: 0 },
    },
  }

  const lines = []
  lines.push('# Coverage-Risk Crossref Audit (Generated)')
  lines.push('')
  lines.push(`Generated at: ${out.generatedAt}`)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- High fan-in untested: **${summary.highFanInUntested}**`)
  lines.push(`- High fan-in tested: **${summary.highFanInTested}**`)
  lines.push(`- Coverage of critical files (fan-in ≥ 20): **${summary.coverageOfCriticalFiles}**`)
  lines.push(`- Risk files (score ≥ 15): **${riskFiles.length}**`)
  lines.push('')
  lines.push('## Top risk files (high fan-in, no or low coverage)')
  lines.push('')
  lines.push('| File | Fan-in | Has test | Exports | Risk score | Priority |')
  lines.push('| --- | ---: | --- | ---: | ---: | --- |')
  for (const f of riskFiles.slice(0, 40)) {
    lines.push(`| \`${f.repoPath}\` | ${f.fanIn} | ${f.hasTest ? 'Yes' : 'No'} | ${f.exportCount} | ${f.riskScore} | ${f.priority} |`)
  }
  if (riskFiles.length > 40) {
    lines.push('')
    lines.push(`*...and ${riskFiles.length - 40} more.*`)
  }
  lines.push('')
  fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2))
  fs.writeFileSync(OUT_MD, lines.join('\n'))

  console.log('Wrote:', toRepoPath(OUT_JSON), toRepoPath(OUT_MD))
  console.log(`Risk files: ${riskFiles.length} | High fan-in untested: ${summary.highFanInUntested} | Critical coverage: ${summary.coverageOfCriticalFiles}`)
  process.exitCode = 0
}

main()
