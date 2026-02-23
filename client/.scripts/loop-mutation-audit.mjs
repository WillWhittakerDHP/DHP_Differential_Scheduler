import fs from 'node:fs'
import {
  getAuditReportHeaderLines,
  loadCentralAllowlist,
  listAuditFiles,
  resolveAuditPaths,
  writeAuditReports,
  toRepoPath as toRepoPathUtil,
  categorizeMatches,
  summarizeExceptions,
  parseChangedOnlyFlag,
} from './shared-audit-utils.mjs'
import {
  createSourceFileFromContent,
  extractVueScriptWithLineOffset,
  forEachDescendant,
  loadTsMorph,
} from './shared-ast-facade.mjs'

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
 *
 * Tiers: Tier 1 = matches that participate in a forEach→mutation hit (counted in requiring review and score).
 * Tier 2 = all other matches (not counted in main queue or score).
 * Permissible: assignProp (and optionally assignIndex) lines matching ref.value, spread, Set/Map, Array.from,
 * .value = filter/map/reduce, store/state, DOM, theme are filtered at scan time and never reach allowlist or requiring review.
 */

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

function toRepoPath(absPath, projectRoot) {
  return toRepoPathUtil(absPath, projectRoot)
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

/**
 * Excluded patterns: ref.value, spread, Set/Map, Array.from, .value = filter/map/reduce, store/state, DOM, themeConfig.
 * When true, the line is not counted and not pushed to matches (used at scan time for assignProp).
 */
function isPermissibleLoopMutation(line, ruleId) {
  if (ruleId !== 'assignProp') return false
  const t = line.trim()
  if (/\.value\s*=/.test(t)) return true
  if (/v-model|@\w+|:[\w-]+=/.test(t)) return true
  if (/\.(add|set|delete|clear|has)\s*\(/.test(t)) return true
  if (/\[.*\.\.\..*\]/.test(t)) return true
  if (/\{.*\.\.\..*\}/.test(t)) return true
  if (/\.value\s*=\s*.*\.(filter|map|reduce|flatMap)\s*\(/.test(t)) return true
  if (/Array\.from\s*\(/.test(t)) return true
  if (/store.*\.value\s*=|\.state\.\w+\s*=/.test(t)) return true
  if (/new\s+(Map|Set|WeakMap|WeakSet)\s*\(/.test(t)) return true
  if (/MutationObserver|querySelector|appendChild|removeChild/.test(t)) return true
  if (/themeConfig|themes\.value|colors\[/.test(t)) return true
  return false
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
        if (rule.id === 'assignProp' && isPermissibleLoopMutation(raw, rule.id)) continue
        counts[rule.id] += 1
        matches.push({ ruleId: rule.id, lineNumber, line: raw.trim() })
      }
    }
  }

  return { counts, matches }
}

const MUTATION_RULE_IDS = new Set(['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'assignIndex', 'assignProp', 'delete'])
const MUTATOR_METHOD_NAMES = new Set(['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'])

/**
 * AST: find forEach calls and mutations inside the same callback body.
 * Returns { forEachAt, mutationAt, mutationRuleId }[] with 1-based line numbers.
 *
 * @param {import('ts-morph').SourceFile} sourceFile
 * @param {(node: import('ts-morph').Node) => number} getLine
 * @param {{ SyntaxKind: object }} sk - SyntaxKind from loadTsMorph()
 * @returns {Promise<Array<{forEachAt: number, mutationAt: number, mutationRuleId: string}>>}
 */
async function collectForEachMutationHitsFromAst(sourceFile, getLine, sk) {
  const SyntaxKind = sk
  const hits = []

  function getCallbackBody(call) {
    const args = call.getArguments()
    if (args.length === 0) return null
    const cb = args[0]
    const kind = cb.getKind()
    if (kind === SyntaxKind.ArrowFunction) {
      const body = cb.getBody()
      return body.getKind?.() === SyntaxKind.Block ? body : null
    }
    if (kind === SyntaxKind.FunctionExpression) {
      return cb.getBody?.() ?? null
    }
    return null
  }

  function getMutationRuleId(node) {
    const kind = node.getKind()
    if (kind === SyntaxKind.CallExpression) {
      const expr = node.getExpression?.()
      if (expr?.getKind?.() === SyntaxKind.PropertyAccessExpression) {
        const name = expr.getName?.()
        if (name && MUTATOR_METHOD_NAMES.has(name)) return name
      }
      return null
    }
    if (kind === SyntaxKind.AssignmentExpression || kind === SyntaxKind.BinaryExpression) {
      const left = node.getLeft?.()
      if (!left) return null
      const leftKind = left.getKind()
      if (leftKind === SyntaxKind.ElementAccessExpression) return 'assignIndex'
      if (leftKind === SyntaxKind.PropertyAccessExpression) return 'assignProp'
      return null
    }
    if (kind === SyntaxKind.DeleteExpression) return 'delete'
    return null
  }

  for (const node of sourceFile.getDescendants?.() ?? []) {
    if (node.getKind() !== SyntaxKind.CallExpression) continue
    const expr = node.getExpression?.()
    if (!expr || expr.getKind() !== SyntaxKind.PropertyAccessExpression) continue
    if (expr.getName?.() !== 'forEach') continue

    const forEachLine = getLine(node)
    const body = getCallbackBody(node)
    if (!body) continue

    forEachDescendant(body, (desc) => {
      const ruleId = getMutationRuleId(desc)
      if (!ruleId) return
      hits.push({
        forEachAt: forEachLine,
        mutationAt: getLine(desc),
        mutationRuleId: ruleId,
      })
    })
  }

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

  lines.push('## Per-file matches requiring review (Tier 1)')
  lines.push('')
  lines.push('Legend: `ruleId@lineNumber: line`')
  lines.push('')

  for (const f of files) {
    lines.push(`### \`${f.repoPath}\``)
    lines.push('')
    const c = f.counts
    lines.push(`- counts (Tier 1): forEach=${c.forEach || 0}, forLoop=${c.forLoop || 0}, forOf=${c.forOf || 0}, forIn=${c.forIn || 0}, while=${c.while || 0}, push=${c.push || 0}, splice=${c.splice || 0}, sort=${c.sort || 0}, reverse=${c.reverse || 0}, assignIndex=${c.assignIndex || 0}, assignProp=${c.assignProp || 0}`)
    lines.push('')

    if (f.requiresReview.length === 0) {
      lines.push('- (no matches requiring review)')
      lines.push('')
      continue
    }

    const maxMatches = 80
    const shown = f.requiresReview.slice(0, maxMatches)
    lines.push('```')
    for (const m of shown) {
      lines.push(`${m.ruleId}@${m.lineNumber}: ${m.line}`)
    }
    if (f.requiresReview.length > maxMatches) {
      lines.push(`... (${f.requiresReview.length - maxMatches} more matches omitted)`)
    }
    lines.push('```')
    lines.push('')
  }

  return lines.join('\n')
}

async function main() {
  const paths = resolveAuditPaths(AUDIT_TYPE)

  const configAllowlist = loadCentralAllowlist('loop-mutation')
  const delta = parseChangedOnlyFlag(process.argv, paths.projectRoot)

  let priorityConfig = {}
  try {
    const configRaw = fs.readFileSync(paths.configPath, 'utf8')
    priorityConfig = JSON.parse(configRaw)
  } catch (_error) {
    // Config might not exist or be invalid, use defaults
  }

  const { SyntaxKind } = await loadTsMorph()
  const sk = { SyntaxKind }

  const absFiles = listAuditFiles(AUDIT_TYPE, [paths.clientSrc, paths.serverSrc])
  const clientFiles = absFiles.filter((p) => p.startsWith(paths.clientSrc))
  const serverFiles = absFiles.filter((p) => p.startsWith(paths.serverSrc))
  const scanned = []

  for (const abs of absFiles) {
    const repoPath = toRepoPath(abs, paths.projectRoot)
    if (delta.enabled && !delta.changedFiles.has(repoPath)) continue
    const contents = fs.readFileSync(abs, 'utf8')
    const lines = splitLines(contents)
    const { counts, matches } = scanLines(lines)

    const { allowed, requiresReview } = categorizeMatches(
      matches,
      repoPath,
      contents,
      AUDIT_TYPE,
      configAllowlist
    )

    let forEachMutationHits
    const useAst = /\.(ts|tsx|vue|js|mjs)$/i.test(abs)
    if (useAst) {
      let scriptContent = contents
      let lineOffset = 0
      if (abs.endsWith('.vue')) {
        const extracted = extractVueScriptWithLineOffset(contents)
        if (extracted) {
          scriptContent = extracted.scriptContent
          lineOffset = extracted.startLineInFile
        }
      }
      if (scriptContent.trim().length > 0) {
        const virtualPath = abs.endsWith('.vue') ? abs.replace(/\.vue$/, '.vue.ts') : abs
        const { sourceFile, getLine } = await createSourceFileFromContent(virtualPath, scriptContent, { lineOffset })
        const astHits = await collectForEachMutationHitsFromAst(sourceFile, getLine, sk)
        const forEachLinesInReview = new Set(requiresReview.filter((m) => m.ruleId === 'forEach').map((m) => m.lineNumber))
        const mutationLinesInReview = new Set(
          requiresReview.filter((m) => MUTATION_RULE_IDS.has(m.ruleId)).map((m) => m.lineNumber)
        )
        forEachMutationHits = astHits.filter(
          (h) => forEachLinesInReview.has(h.forEachAt) && mutationLinesInReview.has(h.mutationAt)
        )
      } else {
        forEachMutationHits = []
      }
    } else {
      forEachMutationHits = []
    }

    const lineNumbersInHits = new Set()
    for (const h of forEachMutationHits) {
      lineNumbersInHits.add(h.forEachAt)
      lineNumbersInHits.add(h.mutationAt)
    }
    const requiresReviewTier1 = requiresReview.filter((m) => lineNumbersInHits.has(m.lineNumber))
    const reviewCounts = recalculateCounts(requiresReviewTier1)
    const fileScore = score(reviewCounts, forEachMutationHits)
    const filePriority = assignPriority(fileScore, priorityConfig)

    scanned.push({
      id: toStableId(repoPath),
      repoPath,
      absPath: abs,
      counts,
      reviewCounts,
      matches,
      allowed,
      requiresReview: requiresReviewTier1,
      forEachMutationHits,
      score: fileScore,
      priority: filePriority,
    })
  }

  scanned.sort(compareFiles)
  
  // Calculate exception summary
  const exceptionSummary = summarizeExceptions(scanned)

  // Filter out zero-score files from JSON output to reduce report bloat.
  // Output uses Tier-1 counts so report and score align.
  const filesWithFindings = scanned
    .filter(f => f.score > 0 || f.requiresReview.length > 0)
    .map(f => ({
      id: f.id,
      repoPath: f.repoPath,
      absPath: f.absPath,
      counts: f.reviewCounts,
      matches: f.matches,
      allowed: f.allowed,
      requiresReview: f.requiresReview,
      forEachMutationHits: f.forEachMutationHits,
      score: f.score,
      priority: f.priority,
    }))

  const jsonPayload = {
    generatedAt: new Date().toISOString(),
    scope: {
      included: ['client/src/**/*.{ts,js,vue}', 'server/src/**/*.{ts,mjs}'],
      excluded: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*', 'client/src/@core/**', 'client/src/@layouts/**'],
    },
    totalScanned: scanned.length,
    ...(delta.enabled ? { deltaMode: true, baseRef: delta.baseRef } : {}),
    exceptionSummary,
    files: filesWithFindings,
  }
  const { outJson, outMd } = writeAuditReports(AUDIT_TYPE, jsonPayload, renderMarkdownReport(filesWithFindings, exceptionSummary))

  const clientFilesCount = clientFiles.length
  const serverFilesCount = serverFiles.length
  console.log(`Wrote:\n- ${toRepoPath(outJson, paths.projectRoot)}\n- ${toRepoPath(outMd, paths.projectRoot)}`)
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


