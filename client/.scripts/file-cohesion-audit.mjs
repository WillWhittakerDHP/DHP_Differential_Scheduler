import fs from 'node:fs'
import {
  getAuditReportHeaderLines,
  loadCentralAllowlist,
  listAuditFiles,
  resolveAuditPaths,
  writeAuditReports,
  toRepoPath as toRepoPathUtil,
  checkConfigAllowlist,
  parseChangedOnlyFlag,
} from './shared-audit-utils.mjs'

/**
 * File Size / Module Cohesion Audit Script
 *
 * Goal: Identify oversized files, modules with too many exports,
 * mixed-concern files, and dead modules with no exports.
 *
 * Metrics:
 *   - File line count vs directory-aware thresholds
 *   - Export count per file (> 10 suggests too many responsibilities)
 *   - Mixed concerns (file imports from both UI and server layers)
 *   - Files with no exports (dead modules or undocumented side-effect files)
 *
 * Scope:
 *   - Included: client/src (ts, js, vue) and server/src (ts, mjs)
 *   - Excluded: __tests__, test files, @core, @layouts, migrations
 *
 * Output:
 *   - client/.audit-reports/file-cohesion-audit.json
 *   - client/.audit-reports/file-cohesion-audit.md
 */

/** Tier 1 = drives score and file count. Tier 2 = report-only. */
const TIER1_RULES = ['oversized', 'high-exports', 'mixed-concerns']

const DEFAULT_THRESHOLDS = {
  components: 500,
  composables: 400,
  utils: 300,
  services: 400,
  routes: 400,
  general: 350,
  maxExports: 10,
}

function toRepoPath(p, projectRoot) { return toRepoPathUtil(p, projectRoot) }

function categorizeFile(repoPath) {
  if (repoPath.includes('/components/') || repoPath.includes('/views/') || repoPath.includes('/layouts/')) return 'components'
  if (repoPath.includes('/composables/')) return 'composables'
  if (repoPath.includes('/utils/') || repoPath.includes('/helpers/')) return 'utils'
  if (repoPath.includes('/services/')) return 'services'
  if (repoPath.includes('/routes/') || repoPath.includes('/router/')) return 'routes'
  return 'general'
}

function countExports(content) {
  const matches = content.match(/\bexport\s+(?:default\s+|const\s+|function\s+|class\s+|interface\s+|type\s+|enum\s+|let\s+|var\s+|async\s+)/g)
  return matches ? matches.length : 0
}

function detectMixedConcerns(content) {
  const hasUIImports = /\bfrom\s+['"](?:vue|vuetify|@vue|pinia)/.test(content)
  const hasServerImports = /\bfrom\s+['"](?:express|sequelize|pg|knex|prisma)/.test(content)
  return hasUIImports && hasServerImports
}

function looksLikePureHelperInComposables(repoPath, content) {
  if (!repoPath.includes('/composables/')) return false
  const hasReactivity = /\b(computed|ref|reactive|watch|watchEffect)\s*\(/.test(content) ||
    /\b(onMounted|onUnmounted|onBeforeUnmount)\b/.test(content) ||
    /\buse(Query|Mutation|QueryClient)\b/.test(content)
  return !hasReactivity
}

function analyzeFile(absPath, thresholds, projectRoot) {
  const repoPath = toRepoPath(absPath, projectRoot)
  const content = fs.readFileSync(absPath, 'utf-8')
  const lineCount = content.split('\n').length
  const category = categorizeFile(repoPath)
  const lineThreshold = thresholds[category] || thresholds.general
  const exportCount = countExports(content)
  const mixedConcerns = detectMixedConcerns(content)
  const hasExports = exportCount > 0

  const violations = []

  if (lineCount > lineThreshold) {
    violations.push({
      rule: 'oversized',
      value: lineCount,
      threshold: lineThreshold,
      detail: `${lineCount} lines (${category} max: ${lineThreshold})`,
    })
  }

  if (exportCount > thresholds.maxExports) {
    violations.push({
      rule: 'high-exports',
      value: exportCount,
      threshold: thresholds.maxExports,
      detail: `${exportCount} exports (max: ${thresholds.maxExports})`,
    })
  }

  if (mixedConcerns) {
    violations.push({
      rule: 'mixed-concerns',
      value: 1,
      threshold: 0,
      detail: 'Imports from both UI (vue/vuetify) and server (express/sequelize) layers',
    })
  }

  // Only flag no-exports for non-Vue files and non-main/index files
  if (!hasExports && !absPath.endsWith('.vue') && !repoPath.includes('main.') && !repoPath.includes('index.') && !repoPath.includes('App.')) {
    violations.push({
      rule: 'no-exports',
      value: 0,
      threshold: 1,
      detail: 'No exports detected - dead module or undocumented side-effect file',
    })
  }

  if (looksLikePureHelperInComposables(repoPath, content)) {
    violations.push({
      rule: 'pureHelperInComposables',
      value: 1,
      threshold: 0,
      detail: 'Looks like a pure helper (no Vue reactivity / lifecycle / vue-query). Consider moving to `src/utils/`.',
    })
  }

  const violationsWithTier = violations.map((v) => ({
    ...v,
    tier: TIER1_RULES.includes(v.rule) ? 1 : 2,
  }))

  return { repoPath, category, lineCount, exportCount, mixedConcerns, hasExports, violations: violationsWithTier }
}

/** Skip at scan time: small composable with only pureHelperInComposables (never in report). */
const PURE_HELPER_PERMISSIBLE_LINE_CAP = 30

function isPermissibleCohesionFile(result) {
  if (result.category !== 'composables' || result.lineCount >= PURE_HELPER_PERMISSIBLE_LINE_CAP) return false
  const onlyPureHelper =
    result.violations.length === 1 && result.violations[0].rule === 'pureHelperInComposables'
  return onlyPureHelper
}

const VIOLATION_WEIGHT = { oversized: 3, 'high-exports': 2, 'mixed-concerns': 5, 'no-exports': 1, pureHelperInComposables: 1 }

/** Score from Tier 1 violations only (oversized, high-exports, mixed-concerns). */
function calculateScore(violations, lineCount, lineThreshold) {
  const tier1 = violations.filter((v) => v.tier === 1)
  let score = 0
  for (const v of tier1) {
    if (v.rule === 'oversized') {
      score += Math.ceil((lineCount - lineThreshold) / 100) * 3
    } else if (v.rule === 'high-exports') {
      score += (v.value - v.threshold) * 2
    } else {
      score += VIOLATION_WEIGHT[v.rule] || 1
    }
  }
  return score
}

function assignPriority(score, config) {
  const p0Min = Number(config?.priorities?.p0MinSeverityScore ?? 10)
  const p1Min = Number(config?.priorities?.p1MinSeverityScore ?? 4)
  if (score >= p0Min) return 'P0'
  if (score >= p1Min) return 'P1'
  return 'P2'
}

function renderMarkdownReport(filesWithFindings, totalScanned) {
  const lines = []
  lines.push(...getAuditReportHeaderLines())
  lines.push('# File Cohesion Audit (Generated)')
  lines.push('')
  lines.push('This file is generated by `client/.scripts/file-cohesion-audit.mjs`.')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push('Tier 1 (oversized, high-exports, mixed-concerns) drives score and file count; Tier 2 (no-exports, pureHelperInComposables) is report-only.')
  lines.push('')
  lines.push(`- Files scanned: **${totalScanned}**`)
  lines.push(`- Files with violations: **${filesWithFindings.length}**`)

  const violationCounts = {}
  const tier1Counts = {}
  for (const f of filesWithFindings) {
    for (const v of f.violations) {
      violationCounts[v.rule] = (violationCounts[v.rule] || 0) + 1
      if (v.tier === 1) tier1Counts[v.rule] = (tier1Counts[v.rule] || 0) + 1
    }
  }
  lines.push(`- Oversized: ${violationCounts.oversized || 0} | High exports: ${violationCounts['high-exports'] || 0} | Mixed concerns: ${violationCounts['mixed-concerns'] || 0} | No exports: ${violationCounts['no-exports'] || 0} | Pure helper in composables: ${violationCounts.pureHelperInComposables || 0}`)
  lines.push(`- Tier 1 violations (score): oversized=${tier1Counts.oversized || 0}, high-exports=${tier1Counts['high-exports'] || 0}, mixed-concerns=${tier1Counts['mixed-concerns'] || 0}`)
  lines.push('')

  lines.push('## Top hotspots')
  lines.push('')
  lines.push('| File | Category | Priority | Score | Lines | Exports | Violations |')
  lines.push('| --- | --- | --- | ---: | ---: | ---: | --- |')

  for (const f of filesWithFindings.slice(0, 30)) {
    const vNames = f.violations.map(v => v.rule).join(', ')
    lines.push(`| \`${f.repoPath}\` | ${f.category} | ${f.priority} | ${f.score} | ${f.lineCount} | ${f.exportCount} | ${vNames} |`)
  }

  if (filesWithFindings.length > 30) {
    lines.push('')
    lines.push(`*...and ${filesWithFindings.length - 30} more files.*`)
  }

  lines.push('')
  lines.push('## Per-file details')
  lines.push('')

  for (const f of filesWithFindings.slice(0, 40)) {
    lines.push(`### \`${f.repoPath}\` [${f.priority}]`)
    lines.push('')
    for (const v of f.violations) {
      lines.push(`- **${v.rule}**: ${v.detail}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

function main() {
  const paths = resolveAuditPaths('file-cohesion')
  const configAllowlist = loadCentralAllowlist('file-cohesion')
  const delta = parseChangedOnlyFlag(process.argv, paths.projectRoot)

  let config = {}
  try { config = JSON.parse(fs.readFileSync(paths.configPath, 'utf8')) } catch { /* defaults */ }

  const thresholds = { ...DEFAULT_THRESHOLDS, ...(config.thresholds || {}) }

  const allFiles = listAuditFiles('file-cohesion', [paths.clientSrc, paths.serverSrc])
  const scanned = []

  for (const abs of allFiles) {
    const repoPath = toRepoPath(abs, paths.projectRoot)
    if (delta.enabled && !delta.changedFiles.has(repoPath)) continue

    const result = analyzeFile(abs, thresholds, paths.projectRoot)
    result.violations = result.violations.filter(
      (v) => !checkConfigAllowlist(repoPath, v.rule, 1, configAllowlist).allowed
    )
    if (result.violations.length === 0) continue

    const lineThreshold = thresholds[result.category] || thresholds.general
    const score = calculateScore(result.violations, result.lineCount, lineThreshold)
    if (score === 0) continue
    if (isPermissibleCohesionFile(result)) continue

    const priority = assignPriority(score, config)
    scanned.push({ ...result, score, priority })
  }

  scanned.sort((a, b) => b.score - a.score || a.repoPath.localeCompare(b.repoPath))

  const out = {
    generatedAt: new Date().toISOString(),
    totalScanned: allFiles.length,
    tierModel: 'tier1',
    tier1Rules: TIER1_RULES,
    thresholds,
    ...(delta.enabled ? { deltaMode: true, baseRef: delta.baseRef } : {}),
    files: scanned,
  }

  const { outJson, outMd } = writeAuditReports('file-cohesion', out, renderMarkdownReport(scanned, allFiles.length))

  console.log(`Wrote:\n- ${toRepoPath(outJson, paths.projectRoot)}\n- ${toRepoPath(outMd, paths.projectRoot)}`)
  console.log(`Files with violations: ${scanned.length}`)
  process.exitCode = 0
}

main()
