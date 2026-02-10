import fs from 'node:fs'
import path from 'node:path'
import { loadConfigAllowlist, checkConfigAllowlist, isCompiledJsFile, isSeedScript } from './audit-exceptions.mjs'

/**
 * Composables Logic Audit Script (TypeScript composables)
 *
 * Goal: produce a deterministic inventory of composable hotspots + suggestions to:
 * - eliminate redundancies (overlap/dup candidates)
 * - introduce naming regularity
 * - place composables in the right folders (admin/booking/root) or utils/
 * - reduce complexity/opacity (split "god" composables, separate query/actions/state)
 *
 * Scope:
 * - Included: `client/src/composables/` (TypeScript/JavaScript composables)
 * - Excluded: `__tests__/`, `*.test.*`, `*.spec.*`
 *
 * Exception Handling:
 * - Config: .audit/composables-logic-audit-config.json (allowlist patterns/specific)
 *
 * Output:
 * - client/.audit/composables-logic-audit.json
 * - client/.audit/composables-logic-audit.md
 *
 * Notes:
 * - This is a fast line-based scan + lightweight heuristics.
 * - It intentionally over-flags; the report is a starting point for a deep refactor plan.
 */

// Detect if we're running from client/ or project root
const CWD = path.resolve(process.cwd())
const CLIENT_SRC = path.join(CWD, 'src')
const _PROJECT_ROOT_SRC = path.join(CWD, 'client', 'src')

// If src exists in cwd, we're in client/; otherwise assume project root
const IS_CLIENT_DIR = fs.existsSync(CLIENT_SRC)
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD
const COMPOSABLES_DIR = IS_CLIENT_DIR
  ? path.join(CWD, 'src', 'composables')
  : path.join(CWD, 'client', 'src', 'composables')

const OUT_DIR = IS_CLIENT_DIR
  ? path.join(CWD, '.audit-reports')
  : path.join(CWD, 'client', '.audit-reports')
const OUT_JSON = path.join(OUT_DIR, 'composables-logic-audit.json')
const OUT_MD = path.join(OUT_DIR, 'composables-logic-audit.md')
const CONFIG_PATH = path.join(OUT_DIR, 'composables-logic-audit-config.json')

/** @type {Array<{id: string, label: string, test: (line: string) => boolean}>} */
const RULES = [
  // Vue reactivity / lifecycle
  { id: 'computed', label: 'computed()', test: (l) => /\bcomputed\s*\(/.test(l) },
  { id: 'ref', label: 'ref()', test: (l) => /\bref\s*\(/.test(l) },
  { id: 'reactive', label: 'reactive()', test: (l) => /\breactive\s*\(/.test(l) },
  { id: 'watch', label: 'watch()', test: (l) => /\bwatch\s*\(/.test(l) },
  { id: 'watchEffect', label: 'watchEffect()', test: (l) => /\bwatchEffect\s*\(/.test(l) },
  { id: 'lifecycle', label: 'lifecycle hooks', test: (l) => /\b(onMounted|onUnmounted|onBeforeUnmount)\b/.test(l) },

  // Async + orchestration
  { id: 'async', label: 'async', test: (l) => /\basync\b/.test(l) },
  { id: 'await', label: 'await', test: (l) => /\bawait\b/.test(l) },

  // Vue Query
  { id: 'vueQuery', label: 'vue-query usage', test: (l) => /\buse(Query|Mutation|QueryClient)\b/.test(l) },

  // Data shaping
  { id: 'map', label: '.map()', test: (l) => /\.map\s*\(/.test(l) },
  { id: 'reduce', label: '.reduce()', test: (l) => /\.reduce\s*\(/.test(l) },
  { id: 'filter', label: '.filter()', test: (l) => /\.filter\s*\(/.test(l) },
  { id: 'sort', label: '.sort()', test: (l) => /\.sort\s*\(/.test(l) },

  // Side effects / environment
  { id: 'dom', label: 'DOM access', test: (l) => /\b(document|window)\b/.test(l) },
  { id: 'timers', label: 'timers', test: (l) => /\b(setTimeout|setInterval)\b/.test(l) },
  { id: 'console', label: 'console.*', test: (l) => /\bconsole\.(log|warn|error|debug)\b/.test(l) },
]

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

/**
 * Check if a file should be excluded from composables logic scanning
 * Uses config-based allowlist for file-level exclusions
 */
function isExcluded(repoPath, configAllowlist) {
  // Exclude migration files (one-time scripts, not composables)
  if (repoPath.includes('/migrations/') || repoPath.includes('/migration') || /migration.*\.(js|mjs|ts)$/i.test(repoPath)) {
    return true
  }
  // Exclude test files and directories (test utilities have different patterns)
  if (repoPath.includes('__tests__') || repoPath.includes('.test.') || repoPath.includes('.spec.')) {
    return true
  }
  // Exclude seed scripts (test data seeding, not composable patterns)
  if (isSeedScript(repoPath)) return true
  // Check if file matches any exclusion pattern in config
  const result = checkConfigAllowlist(repoPath, '*', 1, configAllowlist)
  return result.allowed
}

function isTsOrJs(absPath) {
  return absPath.endsWith('.ts') || absPath.endsWith('.js')
}

function listFilesRecursive(dir) {
  /** @type {string[]} */
  const out = []
  if (!fs.existsSync(dir)) return out
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const abs = path.join(dir, e.name)
    const repoPath = toRepoPath(abs)
    
    // Skip migrations and test files
    if (repoPath.includes('/migrations/') || repoPath.includes('/migration') || 
        /migration.*\.(js|mjs|ts)$/i.test(repoPath) ||
        repoPath.includes('__tests__') || repoPath.includes('.test.') || repoPath.includes('.spec.')) {
      continue
    }
    
    if (e.isDirectory()) {
      out.push(...listFilesRecursive(abs))
      continue
    }
    if (e.isFile() && isTsOrJs(abs) && !isCompiledJsFile(abs)) out.push(abs)
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

function extractExportedUseFunctions(contents) {
  // best-effort: handles "export function useXxx(" and "export const useXxx ="
  const out = new Set()
  const functionRegex = /export\s+function\s+(use[A-Za-z0-9_]+)\s*\(/g
  const constRegex = /export\s+const\s+(use[A-Za-z0-9_]+)\s*=/g
  let m
  while ((m = functionRegex.exec(contents)) !== null) out.add(m[1])
  while ((m = constRegex.exec(contents)) !== null) out.add(m[1])
  return Array.from(out.values()).sort()
}

function extractImportSpecifiers(contents) {
  // best-effort: extract module specifiers from "from '...'"
  const out = new Set()
  const importRegex = /\bfrom\s+['"]([^'"]+)['"]/g
  let m
  while ((m = importRegex.exec(contents)) !== null) out.add(m[1])
  return Array.from(out.values()).sort()
}

function extractReturnKeys(contents) {
  // best-effort: find first "return { ... }" in a file and extract top-level keys
  // We keep it simple and resilient: no deep parsing.
  const idx = contents.indexOf('return {')
  if (idx === -1) return []

  const slice = contents.slice(idx, idx + 4000) // cap to avoid runaway
  const endIdx = slice.indexOf('}')
  if (endIdx === -1) return []
  const body = slice.slice('return {'.length, endIdx)

  // match "key," or "key:" patterns at start of lines
  const keyRegex = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*(?:,|:)/gm
  const keys = new Set()
  let m
  while ((m = keyRegex.exec(body)) !== null) keys.add(m[1])
  return Array.from(keys.values()).sort()
}

function classifyFile(repoPath, counts, exportUseFns, importSpecifiers) {
  const suggestions = []

  const inAdmin = repoPath.includes('/src/composables/admin/')
  const inBooking = repoPath.includes('/src/composables/booking/')
  const inRoot = repoPath.includes('/src/composables/') && !inAdmin && !inBooking

  // Heuristic: pure helper candidates (no reactive, no query, no lifecycle)
  const reactiveCount = (counts.ref || 0) + (counts.computed || 0) + (counts.watch || 0) + (counts.watchEffect || 0) + (counts.reactive || 0)
  const orchestrationCount = (counts.async || 0) + (counts.await || 0) + (counts.vueQuery || 0) + (counts.lifecycle || 0) + (counts.timers || 0) + (counts.dom || 0)

  const looksPure = reactiveCount === 0 && orchestrationCount === 0
  if (looksPure) {
    suggestions.push({
      kind: 'move_candidate',
      priority: 'P1',
      message: 'Looks like a pure helper module (no Vue reactivity / lifecycle / vue-query). Consider moving to `src/utils/` and exporting non-`use*` helpers.',
    })
  }

  // Heuristic: "god composable" / opacity risk
  // Vue Query usage is the correct pattern, not complexity - reduce its weight
  const vueQueryCount = counts.vueQuery || 0
  const vueQueryWeight = vueQueryCount * 0.5 // Count Vue Query as 0.5x instead of full weight
  
  const dataShaping = (counts.map || 0) + (counts.reduce || 0) + (counts.filter || 0) + (counts.sort || 0)
  const complexityScore = reactiveCount + (orchestrationCount - vueQueryCount) + dataShaping + vueQueryWeight
  
  if (complexityScore >= 35) {
    suggestions.push({
      kind: 'split_candidate',
      priority: 'P0',
      message: 'High complexity score. Consider splitting into `useXxxState` + `useXxxActions` + `useXxxQuery` and keeping the SFC-facing API thin.',
    })
  } else if (complexityScore >= 20) {
    suggestions.push({
      kind: 'split_candidate',
      priority: 'P1',
      message: 'Moderate complexity score. Consider separating query/mutations from derived state and formatting.',
    })
  }

  // Naming regularity suggestions
  for (const fn of exportUseFns) {
    if (/use.*(Model|ViewModel)$/i.test(fn) && !(counts.computed || counts.ref || counts.watch || counts.vueQuery)) {
      suggestions.push({
        kind: 'naming',
        priority: 'P2',
        message: `Export \`${fn}\` ends with Model/ViewModel but file appears non-reactive; consider renaming to a pure helper or moving logic into a real view-model composable.`,
      })
    }
    if (fn.includes('Config') && (counts.watch || 0) > 0) {
      suggestions.push({
        kind: 'naming',
        priority: 'P1',
        message: `\`${fn}\` suggests "Config" but uses watchers. Consider splitting: keep config builders pure and move watchers/orchestration elsewhere.`,
      })
    }
  }

  // Placement suggestions: if a root composable heavily imports booking/admin modules, suggest moving.
  const importsText = importSpecifiers.join(' ')
  const importsAdmin = /@\/composables\/admin\//.test(importsText) || /\badmin\//.test(importsText)
  const importsBooking = /@\/composables\/booking\//.test(importsText) || /\bbooking\//.test(importsText)

  if (inRoot && importsAdmin) {
    suggestions.push({
      kind: 'placement',
      priority: 'P1',
      message: 'Root composable imports admin-specific modules. Consider moving under `src/composables/admin/` to reduce cross-surface coupling.',
    })
  }
  if (inRoot && importsBooking) {
    suggestions.push({
      kind: 'placement',
      priority: 'P1',
      message: 'Root composable imports booking-specific modules. Consider moving under `src/composables/booking/` to keep domains isolated.',
    })
  }

  if ((counts.dom || 0) > 0) {
    suggestions.push({
      kind: 'side_effects',
      priority: 'P0',
      message: 'Contains direct DOM access. Prefer isolating DOM work behind a small composable/utility and keeping core logic testable.',
    })
  }

  if ((counts.console || 0) >= 3) {
    suggestions.push({
      kind: 'logging',
      priority: 'P2',
      message: 'Heavy console logging detected. Consider routing logs through a single debug logger utility (or guard behind a single flag).',
    })
  }

  return { complexityScore, suggestions }
}

function assignPriority(complexityScore, config) {
  const p0Min = Number(config?.priorities?.p0MinSeverityScore ?? 35)
  const p1Min = Number(config?.priorities?.p1MinSeverityScore ?? 20)
  
  if (complexityScore >= p0Min) return 'P0'
  if (complexityScore >= p1Min) return 'P1'
  return 'P2'
}

function compareHotspots(a, b) {
  if (b.complexityScore !== a.complexityScore) return b.complexityScore - a.complexityScore
  const aQuery = a.counts.vueQuery || 0
  const bQuery = b.counts.vueQuery || 0
  if (bQuery !== aQuery) return bQuery - aQuery
  return a.repoPath.localeCompare(b.repoPath)
}

function findOverlapGroups(files) {
  // Group by export function names and by return-key signatures.
  /** @type {Record<string, string[]>} */
  const byExportFn = {}
  /** @type {Record<string, string[]>} */
  const byReturnKeys = {}

  for (const f of files) {
    for (const fn of f.exportUseFunctions) {
      byExportFn[fn] = byExportFn[fn] || []
      byExportFn[fn].push(f.repoPath)
    }

    const keySig = f.returnKeys.length >= 6 ? f.returnKeys.join('|') : null
    if (keySig) {
      byReturnKeys[keySig] = byReturnKeys[keySig] || []
      byReturnKeys[keySig].push(f.repoPath)
    }
  }

  const duplicateExportNames = Object.entries(byExportFn)
    .filter(([, paths]) => paths.length >= 2)
    .map(([fn, paths]) => ({ fn, paths: paths.sort() }))

  const overlappingReturnShapes = Object.entries(byReturnKeys)
    .filter(([, paths]) => paths.length >= 2)
    .map(([sig, paths]) => ({ sig, paths: paths.sort() }))

  return { duplicateExportNames, overlappingReturnShapes }
}

function renderMarkdownReport(files, overlap) {
  const lines = []
  lines.push('# Composables Logic Audit (Generated)')
  lines.push('')
  lines.push('This file is generated by `client/scripts/composables-logic-audit.mjs`.')
  lines.push('')
  lines.push('Scope:')
  lines.push('- Included: `client/src/composables/**/*.{ts,js}`')
  lines.push('- Excluded: `**/__tests__/**`, `**/*.test.*`, `**/*.spec.*`')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Total composable files scanned: **${files.length}**`)
  lines.push('')
  lines.push('## Top hotspots (heuristic)')
  lines.push('')
  lines.push('| File | score | vue-query | watch | computed/ref | async/await | DOM | suggestions |')
  lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')
  for (const f of files.slice(0, 25)) {
    const c = f.counts
    const reactive = (c.computed || 0) + (c.ref || 0) + (c.reactive || 0)
    const asyncAwait = (c.async || 0) + (c.await || 0)
    lines.push(`| \`${f.repoPath}\` | ${f.complexityScore} | ${c.vueQuery || 0} | ${(c.watch || 0) + (c.watchEffect || 0)} | ${reactive} | ${asyncAwait} | ${c.dom || 0} | ${f.suggestions.length} |`)
  }
  lines.push('')

  lines.push('## Redundancy candidates (heuristic)')
  lines.push('')
  lines.push('### Duplicate exported composable names')
  lines.push('')
  if (overlap.duplicateExportNames.length === 0) {
    lines.push('- (none detected)')
  } else {
    for (const g of overlap.duplicateExportNames) {
      lines.push(`- **\`${g.fn}\`**`)
      for (const p of g.paths) lines.push(`  - \`${p}\``)
    }
  }
  lines.push('')

  lines.push('### Similar return “shapes” (same returned keys)')
  lines.push('')
  lines.push('LEARNING: This is a strong signal for consolidation when the files are in the same domain and differ only by API hooks.')
  lines.push('')
  if (overlap.overlappingReturnShapes.length === 0) {
    lines.push('- (none detected)')
  } else {
    const topGroups = overlap.overlappingReturnShapes.slice(0, 15)
    for (const g of topGroups) {
      lines.push(`- **Return keys**: \`${g.sig.split('|').slice(0, 10).join(', ')}${g.sig.split('|').length > 10 ? ', …' : ''}\``)
      for (const p of g.paths) lines.push(`  - \`${p}\``)
    }
    if (overlap.overlappingReturnShapes.length > topGroups.length) {
      lines.push(`- … (${overlap.overlappingReturnShapes.length - topGroups.length} more groups omitted)`)
    }
  }
  lines.push('')

  lines.push('## Per-file suggestions (actionable)')
  lines.push('')
  lines.push('Legend:')
  lines.push('- **P0**: fix soon (architecture/side-effect risk)')
  lines.push('- **P1**: high leverage cleanup (dup/placement/naming)')
  lines.push('- **P2**: polish / consistency')
  lines.push('')

  for (const f of files) {
    if (f.suggestions.length === 0) continue
    lines.push(`### \`${f.repoPath}\``)
    lines.push('')
    lines.push(`- exports: ${f.exportUseFunctions.length ? f.exportUseFunctions.map(n => `\`${n}\``).join(', ') : '(none detected)'}`)
    lines.push(`- score: **${f.complexityScore}**`)
    if (f.returnKeys.length) {
      lines.push(`- return keys (first return): ${f.returnKeys.slice(0, 20).map(k => `\`${k}\``).join(', ')}${f.returnKeys.length > 20 ? ', …' : ''}`)
    }
    lines.push('')
    for (const s of f.suggestions) {
      lines.push(`- **${s.priority}** (${s.kind}): ${s.message}`)
    }
    lines.push('')
  }

  lines.push('## Per-file matches (line-level)')
  lines.push('')
  lines.push('Legend: `ruleId@lineNumber: line`')
  lines.push('')

  for (const f of files) {
    lines.push(`### \`${f.repoPath}\``)
    lines.push('')
    const c = f.counts
    lines.push(`- counts: vueQuery=${c.vueQuery || 0}, watch=${(c.watch || 0) + (c.watchEffect || 0)}, computed=${c.computed || 0}, ref=${c.ref || 0}, async=${c.async || 0}, await=${c.await || 0}, dom=${c.dom || 0}, console=${c.console || 0}`)
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
  const configAllowlist = loadConfigAllowlist(CONFIG_PATH)
  
  // Load priority config
  let priorityConfig = {}
  try {
    const configRaw = fs.readFileSync(CONFIG_PATH, 'utf8')
    priorityConfig = JSON.parse(configRaw)
  } catch (_error) {
    // Config might not exist or be invalid, use defaults
  }

  const absFiles = listFilesRecursive(COMPOSABLES_DIR)
  const scanned = []

  for (const abs of absFiles) {
    const repoPath = toRepoPath(abs)
    if (isExcluded(repoPath, configAllowlist)) continue

    const contents = fs.readFileSync(abs, 'utf8')
    const lines = splitLines(contents)
    const { counts, matches } = scanLines(lines)
    const exportUseFunctions = extractExportedUseFunctions(contents)
    const importSpecifiers = extractImportSpecifiers(contents)
    const returnKeys = extractReturnKeys(contents)
    const { complexityScore, suggestions } = classifyFile(repoPath, counts, exportUseFunctions, importSpecifiers)
    const filePriority = assignPriority(complexityScore, priorityConfig)

    scanned.push({
      id: toStableId(repoPath),
      repoPath,
      absPath: abs,
      counts,
      matches,
      exportUseFunctions,
      importSpecifiers,
      returnKeys,
      complexityScore,
      priority: filePriority,
      suggestions,
    })
  }

  scanned.sort(compareHotspots)

  const overlap = findOverlapGroups(scanned)

  // Filter out zero-score files from JSON output to reduce report bloat
  const filesWithFindings = scanned.filter(f => f.complexityScore > 0 || f.matches.length > 0)

  fs.writeFileSync(
    OUT_JSON,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        scope: {
          included: ['client/src/composables/**/*.{ts,js}'],
          excluded: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*'],
        },
        totalScanned: scanned.length,
        overlap,
        files: filesWithFindings,
      },
      null,
      2
    )
  )

  fs.writeFileSync(OUT_MD, renderMarkdownReport(scanned, overlap))

  console.log(`Wrote:\n- ${toRepoPath(OUT_JSON)}\n- ${toRepoPath(OUT_MD)}\nFiles scanned: ${scanned.length}`)
}

main()


