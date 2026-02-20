import fs from 'node:fs'
import path from 'node:path'
import { getAuditReportHeaderLines, loadCentralAllowlist, listAuditFiles, checkConfigAllowlist, parseChangedOnlyFlag } from './shared-audit-utils.mjs'

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

// Detect if we're running from client/ or project root
const CWD = path.resolve(process.cwd())
const CLIENT_SRC = path.join(CWD, 'src')
const _PROJECT_ROOT_SRC = path.join(CWD, 'client', 'src')

// If src exists in cwd, we're in client/; otherwise assume project root
const IS_CLIENT_DIR = fs.existsSync(CLIENT_SRC)
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD

/** @type {string[]} */
const INCLUDE_DIRS = IS_CLIENT_DIR
  ? [
      path.join(CWD, 'src', 'components'),
      path.join(CWD, 'src', 'views'),
      path.join(CWD, 'src', 'layouts'),
    ]
  : [
      path.join(CWD, 'client', 'src', 'components'),
      path.join(CWD, 'client', 'src', 'views'),
      path.join(CWD, 'client', 'src', 'layouts'),
    ]

const OUT_DIR = IS_CLIENT_DIR
  ? path.join(CWD, '.audit-reports')
  : path.join(CWD, 'client', '.audit-reports')
const OUT_JSON = path.join(OUT_DIR, 'component-logic-audit.json')
const OUT_MD = path.join(OUT_DIR, 'component-logic-audit.md')
const CONFIG_PATH = path.join(OUT_DIR, 'component-logic-audit-config.json')

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

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

/**
 * @param {string} absPath
 * @returns {string}
 */
function toRepoPath(absPath) {
  return path.relative(PROJECT_ROOT, absPath).replaceAll(path.sep, '/')
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

function calculateScore(counts, matches = [], lines = []) {
  // Count simple reactive wrappers separately
  const simpleWrapperCount = matches.filter(m => 
    m.ruleId === 'computed' && isSimpleReactiveWrapper(m.line, lines, m.lineNumber - 1)
  ).length
  
  // Reduce weight for simple wrappers (count as 0.3 instead of 1)
  const effectiveComputedCount = (counts.computed || 0) - (simpleWrapperCount * 0.7)
  
  // Calculate severity score based on risky patterns
  const riskKeys = ['dom', 'watch', 'watchEffect', 'async', 'await', 'reduce', 'map', 'inlineConfig', 'console']
  const baseScore = riskKeys.reduce((sum, k) => sum + (counts[k] || 0), 0)
  
  return baseScore + effectiveComputedCount
}

function assignPriority(score, config) {
  const p0Min = Number(config?.priorities?.p0MinSeverityScore ?? 15)
  const p1Min = Number(config?.priorities?.p1MinSeverityScore ?? 8)
  
  if (score >= p0Min) return 'P0'
  if (score >= p1Min) return 'P1'
  return 'P2'
}

function compareCounts(a, b) {
  // stable sort: most "risky" first
  const aScore = calculateScore(a.counts, a.matches || [], a.lines || [])
  const bScore = calculateScore(b.counts, b.matches || [], b.lines || [])

  if (bScore !== aScore) return bScore - aScore
  if (b.counts.computed !== a.counts.computed) return b.counts.computed - a.counts.computed
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
    '| File | computed | watch | async/await | map/reduce | DOM | inline :config | console/alert |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
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
  ensureDir(OUT_DIR)
  
  // Load exception config
  const configAllowlist = loadCentralAllowlist('component-logic')
  const delta = parseChangedOnlyFlag(process.argv, PROJECT_ROOT)
  
  // Load priority config
  let priorityConfig = {}
  try {
    const configRaw = fs.readFileSync(CONFIG_PATH, 'utf8')
    priorityConfig = JSON.parse(configRaw)
  } catch (_error) {
    // Config might not exist or be invalid, use defaults
  }

  const vueFilesAbs = listAuditFiles('component-logic', INCLUDE_DIRS)
  const scanned = []

  for (const abs of vueFilesAbs) {
    const repoPath = toRepoPath(abs)
    if (delta.enabled && !delta.changedFiles.has(repoPath)) continue

    const contents = fs.readFileSync(abs, 'utf8')
    const lines = splitLines(contents)
    const { counts, matches } = scanLines(lines)
    
    const score = calculateScore(counts, matches, lines)
    const priority = assignPriority(score, priorityConfig)

    scanned.push({
      id: toStableId(repoPath),
      repoPath,
      absPath: abs,
      counts,
      matches,
      lines,
      score,
      priority,
    })
  }

  scanned.sort(compareCounts)

  // Filter out zero-score files from JSON output to reduce report bloat
  const filesWithFindings = scanned.filter(f => f.score > 0 || f.matches.length > 0)

  const jsonOutput = { generatedAt: new Date().toISOString(), totalScanned: scanned.length, files: filesWithFindings }
  if (delta.enabled) { jsonOutput.deltaMode = true; jsonOutput.baseRef = delta.baseRef }
  fs.writeFileSync(OUT_JSON, JSON.stringify(jsonOutput, null, 2))
  fs.writeFileSync(OUT_MD, renderMarkdownReport(filesWithFindings))

   
  console.log(`Wrote:\n- ${toRepoPath(OUT_JSON)}\n- ${toRepoPath(OUT_MD)}\nFiles scanned: ${scanned.length}`)
}

main()


