import fs from 'node:fs'
import path from 'node:path'
import {
  getAuditReportHeaderLines,
  listAuditFiles,
  resolveAuditPaths,
  writeAuditReports,
  toRepoPath as toRepoPathUtil,
  parseChangedOnlyFlag,
} from './shared-audit-utils.mjs'

/**
 * Component Logic Audit Script (Vue SFC)
 *
 * Goal: produce a deterministic inventory of "non-UI" hotspots living in `.vue` files
 * so we can migrate logic into composables and keep components thin.
 *
 * Exception Handling:
 * - Config: .audit/component-logic-audit-config.json (allowlist patterns/specific)
 *
 * Output:
 * - client/.audit/component-logic-audit.json
 * - client/.audit/component-logic-audit.md
 *
 * Notes:
 * - We intentionally do NOT try to fully parse Vue SFC blocks. We do a fast line-based scan.
 * - The audit is best-effort; it flags likely hotspots for manual classification.
 */

/** @type {Array<{id: string, label: string, test: (line: string) => boolean}>} */
const RULES = [
  { id: 'computed', label: 'computed()', test: (l) => /\bcomputed\s*\(/.test(l) },
  { id: 'ref', label: 'ref()', test: (l) => /\bref\s*\(/.test(l) },
  { id: 'reactive', label: 'reactive()', test: (l) => /\breactive\s*\(/.test(l) },
  { id: 'watch', label: 'watch()', test: (l) => /\bwatch\s*\(/.test(l) },
  { id: 'watchEffect', label: 'watchEffect()', test: (l) => /\bwatchEffect\s*\(/.test(l) },
  { id: 'async', label: 'async', test: (l) => /\basync\b/.test(l) },
  { id: 'await', label: 'await', test: (l) => /\bawait\b/.test(l) },
  { id: 'map', label: '.map()', test: (l) => /\.map\s*\(/.test(l) },
  { id: 'reduce', label: '.reduce()', test: (l) => /\.reduce\s*\(/.test(l) },
  { id: 'filter', label: '.filter()', test: (l) => /\.filter\s*\(/.test(l) },
  { id: 'sort', label: '.sort()', test: (l) => /\.sort\s*\(/.test(l) },
  { id: 'console', label: 'console.*', test: (l) => /\bconsole\.(log|warn|error|debug)\b/.test(l) },
  { id: 'alert', label: 'alert()', test: (l) => /\balert\s*\(/.test(l) },
  { id: 'dom', label: 'DOM access', test: (l) => /\b(document|window)\b/.test(l) },
  { id: 'inlineConfig', label: 'inline :config={...}', test: (l) => /:config\s*=\s*"\{/.test(l) },
  { id: 'provideInject', label: 'provide/inject', test: (l) => /\b(provide|inject)\b/.test(l) },
  { id: 'vueQuery', label: 'vue-query usage', test: (l) => /\buse(Query|Mutation|QueryClient)\b/.test(l) },
]

// Tier 1: only these drive "requiring review" and score. Tier 2 = computed, ref, reactive, filter, sort, provideInject, vueQuery (inventory only).
const TIER1_RULE_IDS = ['watch', 'watchEffect', 'async', 'await', 'map', 'reduce', 'dom', 'inlineConfig', 'console', 'alert']

/**
 * @param {string} absPath
 * @returns {string}
 */
function toRepoPath(absPath, projectRoot) {
  return toRepoPathUtil(absPath, projectRoot)
}

/**
 * @param {string} repoPath
 * @returns {string}
 */
function toStableId(repoPath) {
  return repoPath.replaceAll('/', '__')
}

/**
 * @param {string} contents
 * @returns {string[]}
 */
function splitLines(contents) {
  return contents.replaceAll('\r\n', '\n').split('\n')
}

/**
 * @param {string} line
 * @returns {string}
 */
function normalizeLine(line) {
  return line.trimEnd()
}

// Skip provideInject when line is only an import (no usage).
function isProvideInjectImportOnly(line) {
  return /^\s*import\s+/.test(line) && /\b(provide|inject)\b/.test(line)
}

/**
 * @param {string[]} lines
 * @returns {{counts: Record<string, number>, matches: Array<{ruleId: string, lineNumber: number, line: string}>}}
 */
function scanLines(lines) {
  /** @type {Record<string, number>} */
  const counts = Object.fromEntries(RULES.map(r => [r.id, 0]))

  /** @type {Array<{ruleId: string, lineNumber: number, line: string}>} */
  const matches = []

  for (let i = 0; i < lines.length; i += 1) {
    const raw = normalizeLine(lines[i])
    const lineNumber = i + 1
    for (const rule of RULES) {
      if (rule.test(raw)) {
        if (rule.id === 'computed' && isSimpleReactiveWrapper(raw, lines, i)) continue
        if (rule.id === 'provideInject' && isProvideInjectImportOnly(raw)) continue
        counts[rule.id] += 1
        matches.push({ ruleId: rule.id, lineNumber, line: raw.trim() })
      }
    }
  }

  return { counts, matches }
}

/**
 * Check if a computed is a simple reactive wrapper (computed(() => props.xyz))
 * @param {string} line - The line containing the computed
 * @param {string[]} lines - All lines for context
 * @param {number} lineIndex - Index of the current line
 * @returns {boolean}
 */
function isSimpleReactiveWrapper(line, lines, lineIndex) {
  // Check if computed is just wrapping a prop: computed(() => props.xyz)
  const isPropWrapper = /computed\s*\(\s*\(\)\s*=>\s*props\.\w+/.test(line)
  // Check if computed is passed to composable (next few lines)
  const nextLines = lines.slice(lineIndex, Math.min(lineIndex + 5, lines.length)).join('\n')
  const isComposableParam = /use\w+\([^)]*computed/.test(nextLines)
  
  return isPropWrapper || isComposableParam
}

function recalculateCounts(matches) {
  const counts = Object.fromEntries(TIER1_RULE_IDS.map(id => [id, 0]))
  for (const m of matches) {
    if (counts[m.ruleId] !== undefined) counts[m.ruleId]++
  }
  return counts
}

function calculateScoreFromTier1(reviewCounts) {
  return TIER1_RULE_IDS.reduce((sum, k) => sum + (reviewCounts[k] || 0), 0)
}

function assignPriority(score, config) {
  const p0Min = Number(config?.priorities?.p0MinSeverityScore ?? 15)
  const p1Min = Number(config?.priorities?.p1MinSeverityScore ?? 8)
  
  if (score >= p0Min) return 'P0'
  if (score >= p1Min) return 'P1'
  return 'P2'
}

function compareCounts(a, b) {
  if (b.score !== a.score) return b.score - a.score
  const aT1 = (a.requiresReview || []).length
  const bT1 = (b.requiresReview || []).length
  if (bT1 !== aT1) return bT1 - aT1
  return a.repoPath.localeCompare(b.repoPath)
}

function renderMarkdownReport(files) {
  const auditHeader = getAuditReportHeaderLines()
  const header = [
    '# Component Logic Audit (Generated)',
    '',
    'This file is generated by `client/scripts/component-logic-audit.mjs`.',
    '',
    'Scope: `client/src/{components,views,layouts}/**/*.vue` (excluding `@core`, `@layouts`).',
    '',
    '## Summary',
    '',
    `- Total files: **${files.length}**`,
    '',
    '## Top hotspots (by heuristic score)',
    '',
    '| File | watch | async/await | map/reduce | DOM | inline :config | console/alert |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: |',
  ]

  const top = files.slice(0, 25).map(f => {
    const c = f.counts
    const asyncAwait = (c.async || 0) + (c.await || 0)
    const mapReduce = (c.map || 0) + (c.reduce || 0)
    const consoleAlert = (c.console || 0) + (c.alert || 0)
    return `| \`${f.repoPath}\` | ${c.computed || 0} | ${c.watch || 0} | ${asyncAwait} | ${mapReduce} | ${c.dom || 0} | ${c.inlineConfig || 0} | ${consoleAlert} |`
  })

  const perFile = [
    '',
    '## Per-file matches (line-level)',
    '',
    'Legend: `ruleId@lineNumber: line`',
    '',
  ]

  for (const f of files) {
    perFile.push(`### \`${f.repoPath}\``)
    perFile.push('')
    const c = f.counts
    perFile.push(`- counts: computed=${c.computed || 0}, ref=${c.ref || 0}, watch=${c.watch || 0}, async=${c.async || 0}, await=${c.await || 0}, map=${c.map || 0}, reduce=${c.reduce || 0}, dom=${c.dom || 0}, inlineConfig=${c.inlineConfig || 0}, console=${c.console || 0}, alert=${c.alert || 0}`)
    perFile.push('')

    if (f.matches.length === 0) {
      perFile.push('- (no matches)')
      perFile.push('')
      continue
    }

    // limit per file to keep report usable
    const maxMatches = 80
    const shown = f.matches.slice(0, maxMatches)
    perFile.push('```')
    for (const m of shown) {
      perFile.push(`${m.ruleId}@${m.lineNumber}: ${m.line}`)
    }
    if (f.matches.length > maxMatches) {
      perFile.push(`... (${f.matches.length - maxMatches} more matches omitted)`)
    }
    perFile.push('```')
    perFile.push('')
  }

  return [...auditHeader, ...header, ...top, ...perFile].join('\n')
}

function main() {
  const paths = resolveAuditPaths('component-logic')
  const includeDirs = [
    path.join(paths.clientSrc, 'components'),
    path.join(paths.clientSrc, 'views'),
    path.join(paths.clientSrc, 'layouts'),
  ]
  const delta = parseChangedOnlyFlag(process.argv, paths.projectRoot)

  // Load priority config
  let priorityConfig = {}
  try {
    const configRaw = fs.readFileSync(paths.configPath, 'utf8')
    priorityConfig = JSON.parse(configRaw)
  } catch (_error) {
    // Config might not exist or be invalid, use defaults
  }

  const vueFilesAbs = listAuditFiles('component-logic', includeDirs)
  const scanned = []

  for (const abs of vueFilesAbs) {
    const repoPath = toRepoPath(abs, paths.projectRoot)
    if (delta.enabled && !delta.changedFiles.has(repoPath)) continue

    const contents = fs.readFileSync(abs, 'utf8')
    const lines = splitLines(contents)
    const { counts: _counts, matches } = scanLines(lines)
    const requiresReview = matches.filter(m => TIER1_RULE_IDS.includes(m.ruleId))
    const reviewCounts = recalculateCounts(requiresReview)
    const score = calculateScoreFromTier1(reviewCounts)
    const priority = assignPriority(score, priorityConfig)

    scanned.push({
      id: toStableId(repoPath),
      repoPath,
      absPath: abs,
      counts: reviewCounts,
      matches,
      requiresReview,
      score,
      priority,
    })
  }

  scanned.sort(compareCounts)

  const tier1FileCount = scanned.filter(f => (f.requiresReview || []).length > 0).length
  const filesWithFindings = scanned.filter(f => f.score > 0 || (f.requiresReview || []).length > 0)

  const jsonOutput = {
    generatedAt: new Date().toISOString(),
    totalScanned: scanned.length,
    exceptionSummary: { totalRequiresReview: tier1FileCount },
    files: filesWithFindings,
  }
  if (delta.enabled) { jsonOutput.deltaMode = true; jsonOutput.baseRef = delta.baseRef }
  const { outJson, outMd } = writeAuditReports('component-logic', jsonOutput, renderMarkdownReport(filesWithFindings))

  console.log(`Wrote:\n- ${toRepoPath(outJson, paths.projectRoot)}\n- ${toRepoPath(outMd, paths.projectRoot)}\nFiles scanned: ${scanned.length}`)
}

main()


