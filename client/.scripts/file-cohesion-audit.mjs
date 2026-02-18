import fs from 'node:fs'
import path from 'node:path'
import {
  loadConfigAllowlist,
  checkConfigAllowlist,
  parseChangedOnlyFlag,
  isCompiledJsFile,
  isGloballyExcluded,
} from './audit-exceptions.mjs'

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
const OUT_JSON = path.join(OUT_DIR, 'file-cohesion-audit.json')
const OUT_MD = path.join(OUT_DIR, 'file-cohesion-audit.md')
const CONFIG_PATH = path.join(OUT_DIR, 'file-cohesion-audit-config.json')

const DEFAULT_THRESHOLDS = {
  components: 500,
  composables: 400,
  utils: 300,
  services: 400,
  routes: 400,
  general: 350,
  maxExports: 10,
}

function ensureDir(d) { fs.mkdirSync(d, { recursive: true }) }
function toRepoPath(p) { return path.relative(PROJECT_ROOT, p).replaceAll(path.sep, '/') }

function isExcluded(repoPath, configAllowlist) {
  if (isGloballyExcluded(repoPath)) return true
  const result = checkConfigAllowlist(repoPath, '*', 1, configAllowlist)
  return result.allowed
}

function isScannable(p) {
  return p.endsWith('.ts') || p.endsWith('.js') || p.endsWith('.vue') || p.endsWith('.mjs')
}

function listFilesRecursive(dirPath) {
  const files = []
  if (!fs.existsSync(dirPath)) return files
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    for (const e of entries) {
      const full = path.join(dirPath, e.name)
      const rp = toRepoPath(full)
      if (rp.includes('node_modules') || rp.includes('/dist/') || rp.includes('.git/')) continue
      if (e.isDirectory()) files.push(...listFilesRecursive(full))
      else if (e.isFile() && isScannable(full) && !isCompiledJsFile(full)) files.push(full)
    }
  } catch { /* inaccessible */ }
  return files
}

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

function analyzeFile(absPath, thresholds) {
  const repoPath = toRepoPath(absPath)
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

  return { repoPath, category, lineCount, exportCount, mixedConcerns, hasExports, violations }
}

const VIOLATION_WEIGHT = { oversized: 3, 'high-exports': 2, 'mixed-concerns': 5, 'no-exports': 1 }

function calculateScore(violations, lineCount, lineThreshold) {
  let score = 0
  for (const v of violations) {
    if (v.rule === 'oversized') {
      // 3 points per 100 lines over threshold
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
  lines.push('# File Cohesion Audit (Generated)')
  lines.push('')
  lines.push('This file is generated by `client/.scripts/file-cohesion-audit.mjs`.')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Files scanned: **${totalScanned}**`)
  lines.push(`- Files with violations: **${filesWithFindings.length}**`)

  const violationCounts = {}
  for (const f of filesWithFindings) {
    for (const v of f.violations) {
      violationCounts[v.rule] = (violationCounts[v.rule] || 0) + 1
    }
  }
  lines.push(`- Oversized: ${violationCounts.oversized || 0} | High exports: ${violationCounts['high-exports'] || 0} | Mixed concerns: ${violationCounts['mixed-concerns'] || 0} | No exports: ${violationCounts['no-exports'] || 0}`)
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
  ensureDir(OUT_DIR)

  const configAllowlist = loadConfigAllowlist(CONFIG_PATH)
  const delta = parseChangedOnlyFlag(process.argv, PROJECT_ROOT)

  let config = {}
  try { config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')) } catch { /* defaults */ }

  const thresholds = { ...DEFAULT_THRESHOLDS, ...(config.thresholds || {}) }

  const clientFiles = listFilesRecursive(CLIENT_SRC)
  const serverFiles = listFilesRecursive(SERVER_SRC)
  const allFiles = [...clientFiles, ...serverFiles]
  const scanned = []

  for (const abs of allFiles) {
    const repoPath = toRepoPath(abs)
    if (delta.enabled && !delta.changedFiles.has(repoPath)) continue
    if (isExcluded(repoPath, configAllowlist)) continue

    const result = analyzeFile(abs, thresholds)
    // Filter out violations that are allowed by config (e.g. specific file + ruleId)
    result.violations = result.violations.filter(
      (v) => !checkConfigAllowlist(repoPath, v.rule, 1, configAllowlist).allowed
    )
    if (result.violations.length === 0) continue

    const lineThreshold = thresholds[result.category] || thresholds.general
    const score = calculateScore(result.violations, result.lineCount, lineThreshold)
    const priority = assignPriority(score, config)

    scanned.push({ ...result, score, priority })
  }

  scanned.sort((a, b) => b.score - a.score || a.repoPath.localeCompare(b.repoPath))

  const out = {
    generatedAt: new Date().toISOString(),
    totalScanned: allFiles.length,
    thresholds,
    ...(delta.enabled ? { deltaMode: true, baseRef: delta.baseRef } : {}),
    files: scanned,
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2))
  fs.writeFileSync(OUT_MD, renderMarkdownReport(scanned, allFiles.length))

  console.log(`Wrote:\n- ${toRepoPath(OUT_JSON)}\n- ${toRepoPath(OUT_MD)}`)
  console.log(`Files with violations: ${scanned.length}`)
  process.exitCode = 0
}

main()
