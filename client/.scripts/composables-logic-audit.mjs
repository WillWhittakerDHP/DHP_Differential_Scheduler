import fs from 'node:fs'
import path from 'node:path'
import {
  getAuditReportHeaderLines,
  listAuditFiles,
  loadCentralAllowlist,
  categorizeMatches,
  resolveAuditPaths,
  writeAuditReports,
  toRepoPath,
} from './shared-audit-utils.mjs'

/**
 * Composables Logic Audit Script (TypeScript composables)
 *
 * Goal: identify composable complexity hotspots and suggest splits (state/actions/query
 * separation). Structural concerns (placement, naming, redundancy) are handled by
 * import-graph, naming-convention, and duplication audits respectively.
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
 */

const _paths = resolveAuditPaths('composables-logic')
const COMPOSABLES_DIR = path.join(_paths.clientSrc, 'composables')
const CONFIG_PATH = _paths.configPath

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

function toRepoPathLocal(absPath) {
  return toRepoPath(absPath, _paths.projectRoot)
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

// Vue Query usage is expected in composables; skip from match list (permissible).
function isPermissibleComposableMatch(ruleId) {
  return ruleId === 'vueQuery'
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
        if (isPermissibleComposableMatch(rule.id)) continue
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

function classifyFile(repoPath, counts) {
  const suggestions = []

  const reactiveCount = (counts.ref || 0) + (counts.computed || 0) + (counts.watch || 0) + (counts.watchEffect || 0) + (counts.reactive || 0)
  const orchestrationCount = (counts.async || 0) + (counts.await || 0) + (counts.vueQuery || 0) + (counts.lifecycle || 0) + (counts.timers || 0) + (counts.dom || 0)

  // Heuristic: "god composable" / opacity risk
  // Vue Query usage is the correct pattern, not complexity - reduce its weight
  const vueQueryCount = counts.vueQuery || 0
  const vueQueryWeight = vueQueryCount * 0.5
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

  if ((counts.dom || 0) > 0) {
    suggestions.push({
      kind: 'side_effects',
      priority: 'P0',
      message: 'Contains direct DOM access. Prefer isolating DOM work behind a small composable/utility and keeping core logic testable.',
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

function recalculateCounts(matches) {
  const counts = Object.fromEntries(RULES.map((r) => [r.id, 0]))
  for (const m of matches) {
    if (counts[m.ruleId] !== undefined) {
      counts[m.ruleId] += 1
    }
  }
  return counts
}

function compareHotspots(a, b) {
  if (b.complexityScore !== a.complexityScore) return b.complexityScore - a.complexityScore
  const aQuery = a.counts.vueQuery || 0
  const bQuery = b.counts.vueQuery || 0
  if (bQuery !== aQuery) return bQuery - aQuery
  return a.repoPath.localeCompare(b.repoPath)
}

function renderMarkdownReport(files) {
  const lines = []
  lines.push(...getAuditReportHeaderLines())
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

  lines.push('## Per-file suggestions (actionable)')
  lines.push('')
  lines.push('Legend:')
  lines.push('- **P0**: fix soon (architecture/side-effect risk)')
  lines.push('- **P1**: high leverage cleanup (split / side effects)')
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
  // Load priority config
  let priorityConfig = {}
  try {
    const configRaw = fs.readFileSync(CONFIG_PATH, 'utf8')
    priorityConfig = JSON.parse(configRaw)
  } catch (_error) {
    // Config might not exist or be invalid, use defaults
  }

  const configAllowlist = loadCentralAllowlist('composables-logic')
  const absFiles = listAuditFiles('composables-logic', [COMPOSABLES_DIR])
  const scanned = []

  for (const abs of absFiles) {
    const repoPath = toRepoPathLocal(abs)
    const contents = fs.readFileSync(abs, 'utf8')
    const lines = splitLines(contents)
    const { counts: _rawCounts, matches } = scanLines(lines)
    const { allowed: _allowed, requiresReview } = categorizeMatches(
      matches,
      repoPath,
      contents,
      'composables-logic',
      configAllowlist
    )
    const counts = recalculateCounts(requiresReview)
    const exportUseFunctions = extractExportedUseFunctions(contents)
    const returnKeys = extractReturnKeys(contents)
    const { complexityScore, suggestions } = classifyFile(repoPath, counts)
    const filePriority = assignPriority(complexityScore, priorityConfig)

    scanned.push({
      id: toStableId(repoPath),
      repoPath,
      absPath: abs,
      counts,
      matches: requiresReview,
      exportUseFunctions,
      returnKeys,
      complexityScore,
      priority: filePriority,
      suggestions,
    })
  }

  scanned.sort(compareHotspots)

  // Tier 1: only split_candidate and side_effects suggestions drive "requiring review" (for meta report).
  const tier1Count = scanned.filter(f =>
    f.suggestions.some(s => s.kind === 'split_candidate' || s.kind === 'side_effects')
  ).length

  const p1Min = Number(priorityConfig?.priorities?.p1MinSeverityScore ?? 20)
  const filesWithFindings = scanned.filter(
    f => f.suggestions.length > 0 || f.complexityScore >= p1Min
  )
  const payload = {
    generatedAt: new Date().toISOString(),
    scope: {
      included: ['client/src/composables/**/*.{ts,js}'],
      excluded: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*'],
    },
    totalScanned: scanned.length,
    exceptionSummary: { totalRequiresReview: tier1Count },
    files: filesWithFindings,
  }

  const { outJson, outMd } = writeAuditReports('composables-logic', payload, renderMarkdownReport(scanned))

  console.log(`Wrote:\n- ${toRepoPathLocal(outJson)}\n- ${toRepoPathLocal(outMd)}\nFiles scanned: ${scanned.length}`)
}

main()


