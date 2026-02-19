import fs from 'node:fs'
import path from 'node:path'
import {
  getAuditReportHeaderLines,
  loadCentralAllowlist,
  categorizeMatches,
  summarizeExceptions,
  checkConfigAllowlist,
  parseChangedOnlyFlag,
  isCompiledJsFile,
  isGloballyExcluded,
} from './audit-exceptions.mjs'

/**
 * Loop Mutation Audit Script
 *
 * Goal: produce a deterministic inventory of places we likely mutate arrays/objects in loops
 * (especially "transformation via forEach + push") so we can prefer functional transforms
 * (`map/reduce/filter`) and reduce side effects.
 *
 * Scope:
 * - Included: client/src (ts, js, vue files) and server/src (ts, mjs files)
 * - Excluded: __tests__, test files, spec files, @core, @layouts
 *
 * Output:
 * - client/.audit/loop-mutation-audit.json
 * - client/.audit/loop-mutation-audit.md
 *
 * Exception Handling:
 * - Inline: // @audit-allow:loop-mutation:<ruleId> - <reason>
 * - Config: .audit/loop-mutation-audit-config.json (allowlist patterns/specific)
 *
 * Notes:
 * - Intentionally line-based and heuristic (fast + deterministic).
 * - This audit should never fail CI; it reports signals for manual cleanup.
 */

// Detect if we're running from client/ or project root
const CWD = path.resolve(process.cwd())
const IS_CLIENT_DIR = fs.existsSync(path.join(CWD, 'src'))
const PROJECT_ROOT = IS_CLIENT_DIR ? path.resolve(CWD, '..') : CWD

const CLIENT_ROOT = IS_CLIENT_DIR ? CWD : path.join(PROJECT_ROOT, 'client')
const CLIENT_SRC = path.join(CLIENT_ROOT, 'src')
const SERVER_ROOT = path.join(PROJECT_ROOT, 'server')
const SERVER_SRC = path.join(SERVER_ROOT, 'src')

const OUT_DIR = fs.existsSync(CLIENT_SRC) 
  ? path.join(CWD, '.audit-reports')
  : path.join(CWD, 'client', '.audit-reports')
const OUT_JSON = path.join(OUT_DIR, 'loop-mutation-audit.json')
const OUT_MD = path.join(OUT_DIR, 'loop-mutation-audit.md')
const CONFIG_PATH = path.join(OUT_DIR, 'loop-mutation-audit-config.json')

const AUDIT_TYPE = 'loop-mutation'

/** @type {Array<{id: string, label: string, test: (line: string) => boolean}>} */
const RULES = [
  // Loops
  { id: 'forEach', label: '.forEach()', test: (l) => /\.forEach\s*\(/.test(l) },
  { id: 'forLoop', label: 'for (...)', test: (l) => /^\s*for\s*\(/.test(l) },
  { id: 'forOf', label: 'for...of', test: (l) => /^\s*for\s*\([^)]*\sof\s+/.test(l) },
  { id: 'forIn', label: 'for...in', test: (l) => /^\s*for\s*\([^)]*\sin\s+/.test(l) },
  { id: 'while', label: 'while (...)', test: (l) => /^\s*while\s*\(/.test(l) },
  { id: 'doWhile', label: 'do...while', test: (l) => /^\s*do\b/.test(l) || /\bwhile\s*\([^)]*\)\s*;?\s*$/.test(l) },

  // Common mutators
  { id: 'push', label: '.push()', test: (l) => /\.push\s*\(/.test(l) },
  { id: 'pop', label: '.pop()', test: (l) => /\.pop\s*\(/.test(l) },
  { id: 'shift', label: '.shift()', test: (l) => /\.shift\s*\(/.test(l) },
  { id: 'unshift', label: '.unshift()', test: (l) => /\.unshift\s*\(/.test(l) },
  { id: 'splice', label: '.splice()', test: (l) => /\.splice\s*\(/.test(l) },
  { id: 'sort', label: '.sort()', test: (l) => /\.sort\s*\(/.test(l) },
  { id: 'reverse', label: '.reverse()', test: (l) => /\.reverse\s*\(/.test(l) },
  { id: 'assignIndex', label: 'arr[i] = ...', test: (l) => /\[[^\]]+\]\s*=/.test(l) },
  { 
    id: 'assignProp', 
    label: 'obj.prop = ...', 
    test: (l) => {
      // Exclude Vue template directives (they're not mutations)
      if (/v-model|@\w+|:[\w-]+=/.test(l)) return false
      // Standard property assignment
      return /\.\w+\s*=/.test(l)
    }
  },
  { id: 'delete', label: 'delete x', test: (l) => /\bdelete\s+\w/.test(l) },
]

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

/**
 * Check if a file should be excluded from mutation scanning
 * Uses config-based allowlist for file-level exclusions
 */
function isExcluded(repoPath, configAllowlist) {
  if (isGloballyExcluded(repoPath)) return true
  const result = checkConfigAllowlist(repoPath, '*', 1, configAllowlist)
  return result.allowed
}

function isScannable(absPath) {
  return absPath.endsWith('.ts') || absPath.endsWith('.js') || absPath.endsWith('.vue')
}

/**
 * Check if a file should be excluded from scanning
 */
function shouldExcludeDir(repoPath) {
  return isGloballyExcluded(repoPath)
}

/**
 * @param {string} dir
 * @returns {string[]}
 */
function listFilesRecursive(dir) {
  /** @type {string[]} */
  const out = []
  if (!fs.existsSync(dir)) return out
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const abs = path.join(dir, e.name)
    const repoPath = toRepoPath(abs)
    
    // Skip excluded directories/files
    if (shouldExcludeDir(repoPath)) {
      continue
    }
    
    if (e.isDirectory()) {
      out.push(...listFilesRecursive(abs))
      continue
    }
    if (e.isFile() && isScannable(abs) && !isCompiledJsFile(abs)) out.push(abs)
  }
  return out
}

function toRepoPath(absPath) {
  return path.relative(PROJECT_ROOT, absPath).replaceAll(path.sep, '/')
}

function toStableId(repoPath) {
  return repoPath.replaceAll('/', '__')
}

function splitLines(contents) {
  return contents.replaceAll('\r\n', '\n').split('\n')
}

function normalizeLine(line) {
  return line.trimEnd()
}

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
 * Check if a mutation is legitimate and should be excluded from audit
 * @param {string} mutationLine - The line containing the mutation
 * @param {string} mutationRuleId - Type of mutation (e.g., 'push', 'assignProp')
 * @param {string} forEachLine - The line containing the forEach
 * @param {string} repoPath - File path for context-aware detection
 * @returns {boolean} True if mutation should be excluded
 */
function isLegitimateMutation(mutationLine, mutationRuleId, forEachLine, _repoPath = '') {
  // Vue ref assignments - legitimate reactive state updates
  if (mutationRuleId === 'assignProp' && /\.value\s*=/.test(mutationLine)) {
    return true
  }
  
  // Vue template directives - not actual mutations (template syntax)
  if (mutationRuleId === 'assignProp' && /v-model|@\w+|:[\w-]+=/.test(mutationLine)) {
    return true
  }
  
  // Set/Map operations - legitimate for Set/Map data structures
  if (/\.(add|set|delete|clear|has)\s*\(/.test(mutationLine)) {
    return true
  }
  
  // Array spread operations - functional pattern, not mutation
  if (mutationRuleId === 'assignProp' && /\[.*\.\.\..*\]/.test(mutationLine)) {
    return true
  }
  
  // Object spread operations - functional pattern, not mutation
  if (mutationRuleId === 'assignProp' && /\{.*\.\.\..*\}/.test(mutationLine)) {
    return true
  }
  
  // Filter/map operations on ref.value - functional patterns
  if (mutationRuleId === 'assignProp' && /\.value\s*=\s*.*\.(filter|map|reduce|flatMap)\s*\(/.test(mutationLine)) {
    return true
  }
  
  // Array.from() + spread patterns - functional construction, not mutation
  if (/Array\.from\s*\(/.test(mutationLine)) {
    return true
  }
  
  // Pinia/store reactive state updates (.value = on store refs)
  if (mutationRuleId === 'assignProp' && /store.*\.value\s*=|\.state\.\w+\s*=/.test(mutationLine)) {
    return true
  }
  
  // Map constructor and WeakMap/WeakSet operations
  if (/new\s+(Map|Set|WeakMap|WeakSet)\s*\(/.test(mutationLine)) {
    return true
  }
  
  // DOM mutations in main.ts are legitimate side effects
  if (/MutationObserver|querySelector|appendChild|removeChild/.test(mutationLine)) {
    return true
  }
  
  // Theme config mutations in @core/initCore.ts are legitimate
  if (/themeConfig|themes\.value|colors\[/.test(mutationLine)) {
    return true
  }
  
  return false
}

function countForEachPushNearby(matches, repoPath = '') {
  // Heuristic: forEach with push/splice/etc in the next N lines is a good "replace with map/reduce" target.
  const window = 22
  /** @type {Array<{forEachAt: number, mutationAt: number, mutationRuleId: string}>} */
  const hits = []

  const forEachLines = matches.filter(m => m.ruleId === 'forEach').map(m => m.lineNumber)
  const mutationRules = new Set(['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'assignIndex', 'assignProp', 'delete'])
  const mutationMatches = matches.filter(m => mutationRules.has(m.ruleId))

  for (const fl of forEachLines) {
    const forEachMatch = matches.find(m => m.ruleId === 'forEach' && m.lineNumber === fl)
    const forEachLine = forEachMatch?.line || ''
    
    const inWindow = mutationMatches.filter(m => m.lineNumber > fl && m.lineNumber <= fl + window)
    for (const m of inWindow) {
      // Skip legitimate mutations (pass repoPath for context-aware detection)
      if (isLegitimateMutation(m.line, m.ruleId, forEachLine, repoPath)) {
        continue
      }
      hits.push({ forEachAt: fl, mutationAt: m.lineNumber, mutationRuleId: m.ruleId })
    }
  }

  // Stable ordering
  hits.sort((a, b) => a.forEachAt - b.forEachAt || a.mutationAt - b.mutationAt || a.mutationRuleId.localeCompare(b.mutationRuleId))
  return hits
}

function score(counts, forEachMutationHits) {
  // Stable, opinionated: prioritize "forEach + mutation" and heavy mutators.
  const mutatorCount = (
    (counts.push || 0) +
    (counts.splice || 0) +
    (counts.sort || 0) +
    (counts.reverse || 0) +
    (counts.assignIndex || 0) +
    (counts.assignProp || 0)
  )

  return (
    forEachMutationHits.length * 8 +
    mutatorCount * 2 +
    (counts.forEach || 0) +
    (counts.forLoop || 0) +
    (counts.forOf || 0) +
    (counts.forIn || 0)
  )
}

function assignPriority(score, config) {
  const p0Min = Number(config?.priorities?.p0MinSeverityScore ?? 12)
  const p1Min = Number(config?.priorities?.p1MinSeverityScore ?? 6)
  
  if (score >= p0Min) return 'P0'
  if (score >= p1Min) return 'P1'
  return 'P2'
}

function compareFiles(a, b) {
  if (b.score !== a.score) return b.score - a.score
  return a.repoPath.localeCompare(b.repoPath)
}

function renderMarkdownReport(files, exceptionSummary) {
  const lines = []
  lines.push(...getAuditReportHeaderLines())
  lines.push('# Loop Mutation Audit (Generated)')
  lines.push('')
  lines.push('This file is generated by `client/scripts/loop-mutation-audit.mjs`.')
  lines.push('')
  lines.push('Scope:')
  lines.push('- Included: `client/src/**/*.{ts,js,vue}`')
  lines.push('- Excluded: `**/__tests__/**`, `**/*.test.*`, `**/*.spec.*`, `src/@core/**`, `src/@layouts/**`')
  lines.push('')
  lines.push('Exception handling:')
  lines.push('- Inline: `// @audit-allow:loop-mutation:<ruleId> - <reason>`')
  lines.push('- Config: `.audit/loop-mutation-audit-config.json`')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Total files scanned: **${files.length}**`)
  lines.push(`- **Requiring review: ${exceptionSummary.totalRequiresReview}**`)
  lines.push(`- Allowed (with justification): ${exceptionSummary.totalAllowed} (inline: ${exceptionSummary.bySource.inline}, pattern: ${exceptionSummary.bySource.pattern}, specific: ${exceptionSummary.bySource.specific})`)
  lines.push('')
  lines.push('## Top hotspots (by heuristic score, excluding allowed)')
  lines.push('')
  lines.push('| File | score | forEach | for-loops | push/splice/sort/reverse | assign | forEach→mutation hits | allowed |')
  lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')

  // Only show files with score > 0 in top hotspots
  const hotspots = files.filter(f => f.score > 0).slice(0, 30)
  for (const f of hotspots) {
    const c = f.counts
    const forLoops = (c.forLoop || 0) + (c.forOf || 0) + (c.forIn || 0) + (c.while || 0) + (c.doWhile || 0)
    const mutators = (c.push || 0) + (c.splice || 0) + (c.sort || 0) + (c.reverse || 0)
    const assigns = (c.assignIndex || 0) + (c.assignProp || 0)
    lines.push(`| \`${f.repoPath}\` | ${f.score} | ${c.forEach || 0} | ${forLoops} | ${mutators} | ${assigns} | ${f.forEachMutationHits.length} | ${f.allowed.length} |`)
  }

  lines.push('')
  lines.push('## Action signals (heuristic)')
  lines.push('')
  lines.push('- **forEach→mutation hits** are strong refactor candidates: prefer `map()` (build new array), `reduce()` (accumulate), or `filter()` (selection).')
  lines.push('- Some mutations are legitimate (ordering, de-dupe with Set, imperative side-effects). This report is a review queue, not a blanket ban.')
  lines.push('')
  lines.push('## Per-file forEach→mutation hits (highest signal)')
  lines.push('')

  const hasHits = files.filter(f => f.forEachMutationHits.length > 0)
  if (hasHits.length === 0) {
    lines.push('- (none detected)')
    lines.push('')
  } else {
    for (const f of hasHits.slice(0, 60)) {
      lines.push(`### \`${f.repoPath}\``)
      lines.push('')
      lines.push(`- hits: ${f.forEachMutationHits.length}`)
      lines.push('')
      lines.push('```')
      for (const h of f.forEachMutationHits.slice(0, 40)) {
        lines.push(`forEach@${h.forEachAt} -> ${h.mutationRuleId}@${h.mutationAt}`)
      }
      if (f.forEachMutationHits.length > 40) {
        lines.push(`... (${f.forEachMutationHits.length - 40} more hits omitted)`)
      }
      lines.push('```')
      lines.push('')
    }
    if (hasHits.length > 60) {
      lines.push(`- … (${hasHits.length - 60} more files with hits omitted)`)
      lines.push('')
    }
  }

  lines.push('## Per-file matches (line-level)')
  lines.push('')
  lines.push('Legend: `ruleId@lineNumber: line`')
  lines.push('')

  for (const f of files) {
    lines.push(`### \`${f.repoPath}\``)
    lines.push('')
    const c = f.counts
    lines.push(`- counts: forEach=${c.forEach || 0}, forLoop=${c.forLoop || 0}, forOf=${c.forOf || 0}, forIn=${c.forIn || 0}, while=${c.while || 0}, push=${c.push || 0}, splice=${c.splice || 0}, sort=${c.sort || 0}, reverse=${c.reverse || 0}, assignIndex=${c.assignIndex || 0}, assignProp=${c.assignProp || 0}`)
    lines.push('')

    if (f.matches.length === 0) {
      lines.push('- (no matches)')
      lines.push('')
      continue
    }

    const maxMatches = 80
    const shown = f.matches.slice(0, maxMatches)
    lines.push('```')
    for (const m of shown) {
      lines.push(`${m.ruleId}@${m.lineNumber}: ${m.line}`)
    }
    if (f.matches.length > maxMatches) {
      lines.push(`... (${f.matches.length - maxMatches} more matches omitted)`)
    }
    lines.push('```')
    lines.push('')
  }

  return lines.join('\n')
}

function main() {
  ensureDir(OUT_DIR)
  
  // Load exception config
  const configAllowlist = loadCentralAllowlist('loop-mutation')
  const delta = parseChangedOnlyFlag(process.argv, PROJECT_ROOT)
  
  // Load priority config
  let priorityConfig = {}
  try {
    const configRaw = fs.readFileSync(CONFIG_PATH, 'utf8')
    priorityConfig = JSON.parse(configRaw)
  } catch (_error) {
    // Config might not exist or be invalid, use defaults
  }

  const clientFiles = listFilesRecursive(CLIENT_SRC)
  const serverFiles = listFilesRecursive(SERVER_SRC)
  const absFiles = [...clientFiles, ...serverFiles]
  const scanned = []

  for (const abs of absFiles) {
    const repoPath = toRepoPath(abs)
    if (delta.enabled && !delta.changedFiles.has(repoPath)) continue
    if (isExcluded(repoPath, configAllowlist)) continue
    // Double-check exclusion
    if (shouldExcludeDir(repoPath)) continue
    const contents = fs.readFileSync(abs, 'utf8')
    const lines = splitLines(contents)
    const { counts, matches } = scanLines(lines)
    
    // Categorize matches into allowed vs requiring-review
    const { allowed, requiresReview } = categorizeMatches(
      matches,
      repoPath,
      contents,
      AUDIT_TYPE,
      configAllowlist
    )
    
    // Calculate forEach→mutation hits only for requiresReview matches
    const forEachMutationHits = countForEachPushNearby(requiresReview, repoPath)
    
    // Score based on requiring-review only
    const reviewCounts = recalculateCounts(requiresReview)
    const fileScore = score(reviewCounts, forEachMutationHits)
    const filePriority = assignPriority(fileScore, priorityConfig)
    
    scanned.push({
      id: toStableId(repoPath),
      repoPath,
      absPath: abs,
      counts,
      matches,
      allowed,
      requiresReview,
      forEachMutationHits,
      score: fileScore,
      priority: filePriority,
    })
  }

  scanned.sort(compareFiles)
  
  // Calculate exception summary
  const exceptionSummary = summarizeExceptions(scanned)

  // Filter out zero-score files from JSON output to reduce report bloat
  const filesWithFindings = scanned.filter(f => f.score > 0 || f.requiresReview.length > 0)

  fs.writeFileSync(
    OUT_JSON,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        scope: {
          included: ['client/src/**/*.{ts,js,vue}', 'server/src/**/*.{ts,mjs}'],
          excluded: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*', 'client/src/@core/**', 'client/src/@layouts/**'],
        },
        totalScanned: scanned.length,
        ...(delta.enabled ? { deltaMode: true, baseRef: delta.baseRef } : {}),
        exceptionSummary,
        files: filesWithFindings,
      },
      null,
      2
    )
  )
  fs.writeFileSync(OUT_MD, renderMarkdownReport(filesWithFindings, exceptionSummary))

  const clientFilesCount = clientFiles.length
  const serverFilesCount = serverFiles.length
  console.log(`Wrote:\n- ${toRepoPath(OUT_JSON)}\n- ${toRepoPath(OUT_MD)}`)
  console.log(`Files scanned: ${scanned.length} (${clientFilesCount} client, ${serverFilesCount} server)`)
  console.log(`Findings: ${exceptionSummary.totalRequiresReview} requiring review, ${exceptionSummary.totalAllowed} allowed`)
  process.exitCode = 0
}

/**
 * Recalculate counts from a subset of matches (e.g., only requiring-review)
 */
function recalculateCounts(matches) {
  const counts = Object.fromEntries(RULES.map(r => [r.id, 0]))
  
  for (const match of matches) {
    if (counts[match.ruleId] !== undefined) {
      counts[match.ruleId]++
    }
  }
  
  return counts
}

main()


