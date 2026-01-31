import fs from 'node:fs'
import path from 'node:path'
import {
  loadConfigAllowlist,
  categorizeMatches,
  renderAllowedExceptionsSection,
  summarizeExceptions,
  checkConfigAllowlist,
} from './audit-exceptions.mjs'

/**
 * Hardcoding Audit Script
 *
 * Goal: produce a deterministic inventory of "hardcoded branching" that could (often) be
 * config-driven or generic. This is NOT a ban on hardcoding — it's a review queue.
 *
 * Scope:
 * - Included: client/src (ts, js, vue files) and server/src (ts, mjs files)
 * - Excluded: __tests__, test files, spec files, @core, @layouts
 *
 * Output:
 * - client/.audit/hardcoding-audit.json
 * - client/.audit/hardcoding-audit.md
 *
 * Exception Handling:
 * - Inline: // @audit-allow:hardcoding:<ruleId> - <reason>
 * - Config: .audit/hardcoding-audit-config.json (allowlist patterns/specific)
 *
 * Notes:
 * - Fast line-based scan (plus small project-aware signals like entity key strings).
 * - The audit never fails CI; it reports.
 */

// Detect if we're running from client/ or project root
const CWD = path.resolve(process.cwd())
const IS_CLIENT_DIR = fs.existsSync(path.join(CWD, 'src'))
const PROJECT_ROOT = IS_CLIENT_DIR ? path.resolve(CWD, '..') : CWD

const CLIENT_ROOT = IS_CLIENT_DIR ? CWD : path.join(PROJECT_ROOT, 'client')
const CLIENT_SRC = path.join(CLIENT_ROOT, 'src')
const SERVER_ROOT = path.join(PROJECT_ROOT, 'server')
const SERVER_SRC = path.join(SERVER_ROOT, 'src')
const ENTITIES_CONST = path.join(CLIENT_SRC, 'constants', 'entities.ts')

const OUT_DIR = fs.existsSync(CLIENT_SRC) 
  ? path.join(CWD, '.audit-reports')
  : path.join(CWD, 'client', '.audit-reports')
const OUT_JSON = path.join(OUT_DIR, 'hardcoding-audit.json')
const OUT_MD = path.join(OUT_DIR, 'hardcoding-audit.md')
const CONFIG_PATH = path.join(OUT_DIR, 'hardcoding-audit-config.json')

const AUDIT_TYPE = 'hardcoding'

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

function toRepoPath(absPath) {
  return path.relative(PROJECT_ROOT, absPath).replaceAll(path.sep, '/')
}

function toStableId(repoPath) {
  return repoPath.replaceAll('/', '__')
}

/**
 * Check if a file should be excluded from hardcoding scanning
 * Uses config-based allowlist for file-level exclusions
 */
function isExcluded(repoPath, configAllowlist) {
  // Check if file matches any exclusion pattern in config
  const result = checkConfigAllowlist(repoPath, '*', 1, configAllowlist)
  return result.allowed
}

function isScannable(absPath) {
  return absPath.endsWith('.ts') || absPath.endsWith('.js') || absPath.endsWith('.vue') || absPath.endsWith('.mjs')
}

/**
 * Check if a file should be excluded from scanning
 */
function shouldExcludeDir(repoPath) {
  // Exclude migration files (one-time scripts with intentionally hardcoded values)
  if (repoPath.includes('/migrations/') || repoPath.includes('/migration') || /migration.*\.(js|mjs|ts)$/i.test(repoPath)) {
    return true
  }
  // Exclude test files and directories (test data often has hardcoded values intentionally)
  if (repoPath.includes('__tests__') || repoPath.includes('.test.') || repoPath.includes('.spec.')) {
    return true
  }
  // Exclude @core and @layouts for client files only
  if (repoPath.startsWith('client/src') && (repoPath.includes('@core/') || repoPath.includes('@layouts/'))) {
    return true
  }
  // Exclude node_modules, dist, etc.
  if (repoPath.includes('node_modules') || repoPath.includes('/dist/') || repoPath.includes('.git/')) {
    return true
  }
  return false
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
    if (e.isFile() && isScannable(abs)) out.push(abs)
  }
  return out
}

function splitLines(contents) {
  return contents.replaceAll('\r\n', '\n').split('\n')
}

function normalizeLine(line) {
  return line.trimEnd()
}

function extractEntityKeysBestEffort() {
  if (!fs.existsSync(ENTITIES_CONST)) return []
  const raw = fs.readFileSync(ENTITIES_CONST, 'utf8')

  // Best-effort: find ENTITY_KEYS = [ ... ] and extract string literals within the bracket block.
  const start = raw.indexOf('ENTITY_KEYS')
  if (start === -1) return []
  const bracketStart = raw.indexOf('[', start)
  const bracketEnd = raw.indexOf(']', bracketStart)
  if (bracketStart === -1 || bracketEnd === -1) return []
  const slice = raw.slice(bracketStart, bracketEnd + 1)

  const matches = Array.from(slice.matchAll(/['"]([^'"]+)['"]/g)).map((m) => m[1])
  return Array.from(new Set(matches)).sort()
}

function makeEntityKeyRegex(entityKeys) {
  if (!entityKeys.length) return null
  const escaped = entityKeys.map(k => k.replaceAll(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'))
  return new RegExp(`['"](?:${escaped.join('|')})['"]`, 'g')
}

/** @type {Array<{id: string, label: string, test: (line: string) => boolean}>} */
const BASE_RULES = [
  { id: 'switchEntityKey', label: 'switch(entityKey)', test: (l) => /\bswitch\s*\(\s*entityKey\s*\)/.test(l) },
  { id: 'switchTypeLike', label: 'switch(type/Entity/Key)', test: (l) => /\bswitch\s*\(\s*[^)]*(type|Type|Entity|entity|Key|key)\s*[^)]*\)/.test(l) },
  { id: 'caseString', label: "case '...'", test: (l) => /\bcase\s+['"][^'"]+['"]\s*:/.test(l) },
  { id: 'fieldEqualsString', label: "field === '...'", test: (l) => /\b(field|key)\s*===\s*['"][^'"]+['"]/.test(l) },
  { id: 'fieldMapping', label: 'Field mapping object', test: (l) => {
    // Detect object literals with property access patterns like:
    // { camelCaseKey: row.snake_case_key }
    // { key1: source.key1, key2: source.key2 }
    // Record<string, string> type annotations with object literals
    return /\{\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*:\s*[a-zA-Z_$][a-zA-Z0-9_$]*\.[a-z_]+/.test(l) ||
           /\{\s*['"][^'"]+['"]\s*:\s*[a-zA-Z_$][a-zA-Z0-9_$]*\.[a-z_]+/.test(l) ||
           /Record<string.*string>.*\{[\s\S]{0,500}:\s*[a-z_]+\./.test(l)
  }},
  { id: 'inlineLabelMap', label: '{ key: "Label", ... }', test: (l) => /\{\s*['"][^'"]+['"]\s*:\s*['"][^'"]+['"]/.test(l) },
  { id: 'omitFieldsArray', label: "omitFields: ['a', ...]", test: (l) => /\bomitFields\s*:\s*\[/.test(l) },
  { id: 'headersArray', label: 'headers: [ ... ]', test: (l) => /\bheaders\s*:\s*\[/.test(l) },
  { id: 'magicLabel', label: "Label-ish string", test: (l) => /['"][A-Z][A-Za-z0-9\s-]{6,}['"]/.test(l) },
]

function scanLines(lines, entityKeyRe) {
  /** @type {Record<string, number>} */
  const counts = Object.fromEntries(BASE_RULES.map(r => [r.id, 0]))
  if (entityKeyRe) counts.entityKeyString = 0

  /** @type {Array<{ruleId: string, lineNumber: number, line: string}>} */
  const matches = []

  for (let i = 0; i < lines.length; i += 1) {
    const raw = normalizeLine(lines[i])
    const lineNumber = i + 1

    for (const rule of BASE_RULES) {
      if (rule.test(raw)) {
        counts[rule.id] += 1
        matches.push({ ruleId: rule.id, lineNumber, line: raw.trim() })
      }
    }

    if (entityKeyRe && entityKeyRe.test(raw)) {
      // Reset lastIndex because we reuse global regex.
      entityKeyRe.lastIndex = 0
      counts.entityKeyString += 1
      matches.push({ ruleId: 'entityKeyString', lineNumber, line: raw.trim() })
    }
  }

  return { counts, matches }
}

function score(counts) {
  // Stable heuristic: prioritize entity routing and switch/case.
  return (
    (counts.switchEntityKey || 0) * 12 +
    (counts.entityKeyString || 0) * 6 +
    (counts.caseString || 0) * 4 +
    (counts.fieldEqualsString || 0) * 3 +
    (counts.fieldMapping || 0) * 3 +
    (counts.omitFieldsArray || 0) * 2 +
    (counts.headersArray || 0) * 2 +
    (counts.inlineLabelMap || 0) * 2 +
    (counts.magicLabel || 0)
  )
}

function suggest(repoPath, counts) {
  /** @type {Array<{priority: 'P0'|'P1'|'P2', kind: string, message: string}>} */
  const suggestions = []

  if ((counts.switchEntityKey || 0) > 0 || (counts.entityKeyString || 0) >= 2) {
    suggestions.push({
      priority: 'P1',
      kind: 'config_driven',
      message: 'Entity-key branching detected. Consider mapping via config (e.g. a record keyed by entityKey) rather than switch/case, especially if the logic repeats across files.',
    })
  }

  if ((counts.fieldEqualsString || 0) >= 2) {
    suggestions.push({
      priority: 'P1',
      kind: 'dynamic_fields',
      message: 'Repeated `field === "..."` checks detected. Consider driving this via field config (display/form config) or a reusable formatter map.',
    })
  }

  if ((counts.fieldMapping || 0) >= 2) {
    suggestions.push({
      priority: 'P1',
      kind: 'casing_utility',
      message: 'Field mapping objects detected. Consider replacing with casing conversion utilities (e.g., snakeToCamel, camelToSnake) instead of manual mappings. Mappings often indicate legacy accommodations or fallback strategies.',
    })
  }

  if ((counts.headersArray || 0) > 0) {
    suggestions.push({
      priority: 'P2',
      kind: 'reuse',
      message: 'Inline headers arrays detected. If multiple tables use similar headers, consider a shared table-model or header builder.',
    })
  }

  if ((counts.omitFieldsArray || 0) > 0) {
    suggestions.push({
      priority: 'P2',
      kind: 'config_consistency',
      message: 'Inline omitFields arrays detected. If omit rules are shared across entities, consider centralizing in config.',
    })
  }

  if (repoPath.endsWith('.vue') && ((counts.magicLabel || 0) >= 4 || (counts.inlineLabelMap || 0) >= 2)) {
    suggestions.push({
      priority: 'P2',
      kind: 'ui_strings',
      message: 'Many UI strings detected in an SFC. Consider moving large label maps / naming logic to a composable or config module.',
    })
  }

  return suggestions
}

function assignPriority(score, config) {
  const p0Min = Number(config?.priorities?.p0MinSeverityScore ?? 20)
  const p1Min = Number(config?.priorities?.p1MinSeverityScore ?? 10)
  
  if (score >= p0Min) return 'P0'
  if (score >= p1Min) return 'P1'
  return 'P2'
}

function compareFiles(a, b) {
  if (b.score !== a.score) return b.score - a.score
  return a.repoPath.localeCompare(b.repoPath)
}

function renderMarkdownReport(data) {
  const { entityKeys, files, exceptionSummary } = data
  const lines = []
  lines.push('# Hardcoding Audit (Generated)')
  lines.push('')
  lines.push('This file is generated by `client/scripts/hardcoding-audit.mjs`.')
  lines.push('')
  lines.push('Scope:')
  lines.push('- Included: `client/src/**/*.{ts,js,vue}`')
  lines.push('- Excluded: `**/__tests__/**`, `**/*.test.*`, `**/*.spec.*`, `src/@core/**`, `src/@layouts/**`')
  lines.push('')
  lines.push('Exception handling:')
  lines.push('- Inline: `// @audit-allow:hardcoding:<ruleId> - <reason>`')
  lines.push('- Config: `.audit/hardcoding-audit-config.json`')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Entity keys detected (from \`client/src/constants/entities.ts\`): ${entityKeys.length ? entityKeys.map(k => `\`${k}\``).join(', ') : '(none detected)'}`)
  lines.push(`- Total files scanned: **${files.length}**`)
  lines.push(`- **Requiring review: ${exceptionSummary.totalRequiresReview}**`)
  lines.push(`- Allowed (with justification): ${exceptionSummary.totalAllowed} (inline: ${exceptionSummary.bySource.inline}, pattern: ${exceptionSummary.bySource.pattern}, specific: ${exceptionSummary.bySource.specific})`)
  lines.push('')
  lines.push('## Top hotspots (by heuristic score, excluding allowed)')
  lines.push('')
  lines.push('| File | score | switch(entityKey) | entityKey strings | case strings | field===string | field mappings | omitFields | headers | label maps | allowed |')
  lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')

  // Only show files with score > 0 in top hotspots
  const hotspots = files.filter(f => f.score > 0).slice(0, 30)
  for (const f of hotspots) {
    const c = f.counts
    lines.push(
      `| \`${f.repoPath}\` | ${f.score} | ${c.switchEntityKey || 0} | ${c.entityKeyString || 0} | ${c.caseString || 0} | ${c.fieldEqualsString || 0} | ${c.fieldMapping || 0} | ${c.omitFieldsArray || 0} | ${c.headersArray || 0} | ${c.inlineLabelMap || 0} | ${f.allowed.length} |`
    )
  }

  // Add allowed exceptions section
  lines.push('')
  const filesWithAllowed = files.filter(f => f.allowed.length > 0).map(f => ({
    repoPath: f.repoPath,
    allowed: f.allowed,
  }))
  lines.push(...renderAllowedExceptionsSection(filesWithAllowed))

  lines.push('')
  lines.push('## Per-file suggestions')
  lines.push('')
  lines.push('Legend: **P1** = high leverage cleanup, **P2** = consistency/polish.')
  lines.push('')

  for (const f of files) {
    if (!f.suggestions.length) continue
    lines.push(`### \`${f.repoPath}\``)
    lines.push('')
    lines.push(`- score: **${f.score}**`)
    lines.push('')
    for (const s of f.suggestions) {
      lines.push(`- **${s.priority}** (${s.kind}): ${s.message}`)
    }
    lines.push('')
  }

  lines.push('## Per-file matches requiring review (line-level)')
  lines.push('')
  lines.push('Legend: `ruleId@lineNumber: line`')
  lines.push('')

  // Only show files with matches requiring review
  const filesWithReview = files.filter(f => f.requiresReview.length > 0)
  for (const f of filesWithReview) {
    lines.push(`### \`${f.repoPath}\``)
    lines.push('')
    const c = f.counts
    lines.push(
      `- total counts: switchEntityKey=${c.switchEntityKey || 0}, entityKeyString=${c.entityKeyString || 0}, caseString=${c.caseString || 0}, fieldEqualsString=${c.fieldEqualsString || 0}, fieldMapping=${c.fieldMapping || 0}, omitFieldsArray=${c.omitFieldsArray || 0}, headersArray=${c.headersArray || 0}, inlineLabelMap=${c.inlineLabelMap || 0}, magicLabel=${c.magicLabel || 0}`
    )
    lines.push(`- requiring review: ${f.requiresReview.length}, allowed: ${f.allowed.length}`)
    lines.push('')

    const maxMatches = 90
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

function main() {
  ensureDir(OUT_DIR)

  const entityKeys = extractEntityKeysBestEffort()
  const entityKeyRe = makeEntityKeyRegex(entityKeys)
  
  // Load exception config
  const configAllowlist = loadConfigAllowlist(CONFIG_PATH)
  
  // Load priority config
  let priorityConfig = {}
  try {
    const configRaw = fs.readFileSync(CONFIG_PATH, 'utf8')
    priorityConfig = JSON.parse(configRaw)
  } catch (error) {
    // Config might not exist or be invalid, use defaults
  }

  const clientFiles = listFilesRecursive(CLIENT_SRC)
  const serverFiles = listFilesRecursive(SERVER_SRC)
  const absFiles = [...clientFiles, ...serverFiles]
  const scanned = []

  for (const abs of absFiles) {
    const repoPath = toRepoPath(abs)
    if (isExcluded(repoPath, configAllowlist)) continue
    // Double-check exclusion
    if (shouldExcludeDir(repoPath)) continue
    const contents = fs.readFileSync(abs, 'utf8')
    const lines = splitLines(contents)
    const { counts, matches } = scanLines(lines, entityKeyRe)
    
    // Categorize matches into allowed vs requiring-review
    const { allowed, requiresReview } = categorizeMatches(
      matches,
      repoPath,
      contents,
      AUDIT_TYPE,
      configAllowlist
    )
    
    // Score based on requiring-review only (allowed exceptions don't count against score)
    const reviewCounts = recalculateCounts(requiresReview)
    const fileScore = score(reviewCounts)
    const filePriority = assignPriority(fileScore, priorityConfig)
    
    scanned.push({
      id: toStableId(repoPath),
      repoPath,
      absPath: abs,
      counts,
      matches,
      allowed,
      requiresReview,
      score: fileScore,
      priority: filePriority,
      suggestions: suggest(repoPath, reviewCounts),
    })
  }

  scanned.sort(compareFiles)
  
  // Calculate exception summary
  const exceptionSummary = summarizeExceptions(scanned)

  const out = {
    generatedAt: new Date().toISOString(),
    scope: {
      included: ['client/src/**/*.{ts,js,vue}', 'server/src/**/*.{ts,mjs}'],
      excluded: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*', 'client/src/@core/**', 'client/src/@layouts/**'],
    },
    exceptionSummary,
    entityKeys,
    files: scanned,
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2))
  fs.writeFileSync(OUT_MD, renderMarkdownReport(out))

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
  const counts = Object.fromEntries(BASE_RULES.map(r => [r.id, 0]))
  counts.entityKeyString = 0
  
  for (const match of matches) {
    if (counts[match.ruleId] !== undefined) {
      counts[match.ruleId]++
    }
  }
  
  return counts
}

main()


