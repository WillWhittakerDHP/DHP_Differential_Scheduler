import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { loadConfigAllowlist, checkConfigAllowlist } from './audit-exceptions.mjs'

/**
 * Duplication Audit Script (DRY opportunities)
 *
 * Goal: produce a deterministic inventory of repeated code patterns that are good candidates
 * for extraction into shared utilities/composables.
 *
 * Scope:
 * - Included: client/src (ts, js, vue files) and server/src (ts, mjs files)
 * - Excluded: __tests__, test files, spec files, @core, @layouts
 *
 * For `.vue`, we only scan `<script>` blocks (to avoid template-driven noise).
 *
 * Exception Handling:
 * - Config: .audit/duplication-audit-config.json (allowlist patterns/specific)
 *
 * Output:
 * - client/.audit/duplication-audit.json
 * - client/.audit/duplication-audit.md
 *
 * Notes:
 * - Heuristic + best-effort normalization. This is a review queue, not a semantic judgement.
 * - Deterministic ordering and stable IDs so diffs are meaningful.
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
const OUT_JSON = path.join(OUT_DIR, 'duplication-audit.json')
const OUT_MD = path.join(OUT_DIR, 'duplication-audit.md')
const CONFIG_PATH = path.join(OUT_DIR, 'duplication-audit-config.json')

// Tunables (keep deterministic + simple)
const WINDOW_LINES = 10
const MIN_LINE_LEN = 18
const MIN_WINDOWS_PER_GROUP = 2

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
 * Check if a file should be excluded from duplication scanning
 * Uses config-based allowlist for file-level exclusions
 */
function isExcluded(repoPath, configAllowlist) {
  // Check if file matches any exclusion pattern in config
  // For duplication audit, we exclude entire files, so we check with a wildcard ruleId
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
  // Exclude migration files (one-time scripts, duplication is expected)
  if (repoPath.includes('/migrations/') || repoPath.includes('/migration') || /migration.*\.(js|mjs|ts)$/i.test(repoPath)) {
    return true
  }
  // Exclude test files and directories (test patterns are often intentionally duplicated)
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

function normalizeWhitespace(s) {
  return s.trim().replaceAll(/\s+/g, ' ')
}

function isCommentLine(trimmed) {
  return (
    trimmed.startsWith('//') ||
    trimmed.startsWith('/*') ||
    trimmed.startsWith('*') ||
    trimmed.startsWith('*/')
  )
}

function stripTrailingComment(line) {
  // Best-effort: remove trailing // ... while being conservative about URLs.
  const idx = line.indexOf('//')
  if (idx === -1) return line
  const before = line.slice(0, idx)
  const after = line.slice(idx)
  if (after.startsWith('///')) return line
  if (before.includes('http:') || before.includes('https:')) return line
  return before
}

function isIgnorableLine(norm) {
  if (!norm) return true
  if (isCommentLine(norm)) return true
  if (norm.startsWith('import ')) return true
  if (norm.startsWith('export type ')) return true
  if (norm.startsWith('export interface ')) return true
  if (norm.startsWith('type ')) return true
  if (norm === '{' || norm === '}' || norm === '};' || norm === '),' || norm === ');') return true
  return false
}

function shortHash(text) {
  return crypto.createHash('sha1').update(text).digest('hex').slice(0, 12)
}

/**
 * Extract scan targets from a file.
 * - For TS/JS: full file
 * - For Vue: each <script> block (with computed line offset)
 *
 * @param {string} repoPath
 * @param {string} contents
 * @returns {Array<{kind: 'file'|'vue_script', label: string, lines: string[], baseLineNumber: number}>}
 */
function extractTargets(repoPath, contents) {
  const lines = splitLines(contents)
  if (!repoPath.endsWith('.vue')) {
    return [{ kind: 'file', label: repoPath, lines, baseLineNumber: 1 }]
  }

  /** @type {Array<{kind: 'file'|'vue_script', label: string, lines: string[], baseLineNumber: number}>} */
  const out = []
  const re = /<script\b[^>]*>([\s\S]*?)<\/script>/g
  let m
  while ((m = re.exec(contents)) !== null) {
    const before = contents.slice(0, m.index)
    const baseLineNumber = before.replaceAll('\r\n', '\n').split('\n').length
    const scriptBody = m[1] || ''
    out.push({
      kind: 'vue_script',
      label: `${repoPath}::<script>`,
      lines: splitLines(scriptBody),
      baseLineNumber: baseLineNumber + 1,
    })
  }
  return out
}

/**
 * Convert raw lines into normalized, "kept" lines with original line numbers.
 * @param {string[]} lines
 * @param {number} baseLineNumber
 * @returns {Array<{lineNumber: number, text: string}>}
 */
function normalizeKeptLines(lines, baseLineNumber) {
  /** @type {Array<{lineNumber: number, text: string}>} */
  const kept = []
  for (let i = 0; i < lines.length; i += 1) {
    const originalLineNumber = baseLineNumber + i
    const raw = lines[i]
    const trimmed = raw.trim()
    if (!trimmed) continue
    if (isCommentLine(trimmed)) continue
    const noTrailing = stripTrailingComment(raw)
    const norm = normalizeWhitespace(noTrailing)
    if (isIgnorableLine(norm)) continue
    if (norm.length < MIN_LINE_LEN) continue
    kept.push({ lineNumber: originalLineNumber, text: norm })
  }
  return kept
}

/**
 * @param {Array<{lineNumber: number, text: string}>} kept
 * @returns {Array<{hash: string, windowText: string, startLine: number, endLine: number, lineCount: number}>}
 */
function buildWindows(kept) {
  /** @type {Array<{hash: string, windowText: string, startLine: number, endLine: number, lineCount: number}>} */
  const out = []
  if (kept.length < WINDOW_LINES) return out

  for (let i = 0; i <= kept.length - WINDOW_LINES; i += 1) {
    const slice = kept.slice(i, i + WINDOW_LINES)
    const windowText = slice.map(x => x.text).join('\n')
    const hash = shortHash(windowText)
    out.push({
      hash,
      windowText,
      startLine: slice[0].lineNumber,
      endLine: slice[slice.length - 1].lineNumber,
      lineCount: slice.length,
    })
  }

  return out
}

function calculateGroupScore(group) {
  // Score based on leverage: unique files * lineCount + occurrences
  return (group.uniqueFiles * group.lineCount) + group.occurrences
}

function assignPriority(score, config) {
  const p0Min = Number(config?.priorities?.p0MinSeverityScore ?? 10)
  const p1Min = Number(config?.priorities?.p1MinSeverityScore ?? 5)
  
  if (score >= p0Min) return 'P0'
  if (score >= p1Min) return 'P1'
  return 'P2'
}

function compareGroups(a, b) {
  // Rank by leverage: unique files * lineCount, then total occurrences.
  const aLeverage = a.uniqueFiles * a.lineCount
  const bLeverage = b.uniqueFiles * b.lineCount
  if (bLeverage !== aLeverage) return bLeverage - aLeverage
  if (b.occurrences !== a.occurrences) return b.occurrences - a.occurrences
  return a.groupId.localeCompare(b.groupId)
}

/**
 * Load pattern-detection candidates if available
 */
function loadPatternDetectionCandidates() {
  try {
    const patternJson = path.join(OUT_DIR, 'pattern-detection-audit.json')
    if (fs.existsSync(patternJson)) {
      const data = JSON.parse(fs.readFileSync(patternJson, 'utf8'))
      return data.candidates || null
    }
  } catch (error) {
    // Pattern-detection not run or invalid, continue without candidates
  }
  return null
}

/**
 * Prioritize files that have candidates from pattern-detection
 */
function prioritizeFilesWithCandidates(absFiles, candidates) {
  if (!candidates) return absFiles
  
  const candidateFiles = new Set()
  
  // Collect all candidate files
  if (candidates.similarTypeNames) {
    candidates.similarTypeNames.forEach(c => c.files.forEach(f => candidateFiles.add(f)))
  }
  if (candidates.similarFunctionPatterns) {
    candidates.similarFunctionPatterns.forEach(c => c.files.forEach(f => candidateFiles.add(f)))
  }
  if (candidates.repeatedStringFiles) {
    candidates.repeatedStringFiles.forEach(c => c.files.forEach(f => candidateFiles.add(f)))
  }
  
  // Sort: candidate files first
  const candidate = absFiles.filter(f => candidateFiles.has(toRepoPath(f)))
  const nonCandidate = absFiles.filter(f => !candidateFiles.has(toRepoPath(f)))
  return [...candidate, ...nonCandidate]
}

function renderMarkdownReport(data) {
  const lines = []
  lines.push('# Duplication Audit (Generated)')
  lines.push('')
  lines.push('This file is generated by `client/scripts/duplication-audit.mjs`.')
  lines.push('')
  lines.push('Scope:')
  lines.push('- Included: `client/src/**/*.{ts,js,vue}`')
  lines.push('- Excluded: See `.audit/duplication-audit-config.json` for exclusion patterns')
  lines.push('- Vue scanning: `<script>` blocks only (templates/styles excluded)')
  lines.push('')
  lines.push('Exception handling:')
  lines.push('- Config: `.audit/duplication-audit-config.json` (allowlist patterns/specific)')
  lines.push('')
  
  // Candidate Findings Section
  if (data.candidates) {
    lines.push('## Candidate Findings (from Pattern-Detection Audit)')
    lines.push('')
    lines.push('These candidates were identified by pattern-detection audit as high-probability duplication opportunities:')
    lines.push('')
    
    if (data.candidates.similarTypeNames && data.candidates.similarTypeNames.length > 0) {
      lines.push('### Similar Type Names')
      lines.push('')
      lines.push('| Types | Files | Distance |')
      lines.push('| --- | --- | ---: |')
      for (const candidate of data.candidates.similarTypeNames.slice(0, 20)) {
        const types = candidate.types.map(t => `\`${t}\``).join(' vs ')
        const files = candidate.files.slice(0, 3).map(f => `\`${f}\``).join(', ')
        const moreFiles = candidate.files.length > 3 ? ` (+${candidate.files.length - 3} more)` : ''
        lines.push(`| ${types} | ${files}${moreFiles} | ${candidate.distance} |`)
      }
      if (data.candidates.similarTypeNames.length > 20) {
        lines.push(`| ... | ... | (+${data.candidates.similarTypeNames.length - 20} more) |`)
      }
      lines.push('')
    }
    
    if (data.candidates.similarFunctionPatterns && data.candidates.similarFunctionPatterns.length > 0) {
      lines.push('### Similar Function Patterns')
      lines.push('')
      lines.push('| Prefix | Files | Pattern Count |')
      lines.push('| --- | --- | ---: |')
      for (const candidate of data.candidates.similarFunctionPatterns.slice(0, 20)) {
        const files = candidate.files.slice(0, 3).map(f => `\`${f}\``).join(', ')
        const moreFiles = candidate.files.length > 3 ? ` (+${candidate.files.length - 3} more)` : ''
        lines.push(`| \`${candidate.prefix}*\` | ${files}${moreFiles} | ${candidate.patternCount} |`)
      }
      if (data.candidates.similarFunctionPatterns.length > 20) {
        lines.push(`| ... | ... | (+${data.candidates.similarFunctionPatterns.length - 20} more) |`)
      }
      lines.push('')
    }
    
    if (data.candidates.repeatedStringFiles && data.candidates.repeatedStringFiles.length > 0) {
      lines.push('### Repeated String Literals (across multiple files)')
      lines.push('')
      lines.push('| Value | Files | Occurrences |')
      lines.push('| --- | --- | ---: |')
      for (const candidate of data.candidates.repeatedStringFiles.slice(0, 20)) {
        const files = candidate.files.slice(0, 3).map(f => `\`${f}\``).join(', ')
        const moreFiles = candidate.files.length > 3 ? ` (+${candidate.files.length - 3} more)` : ''
        lines.push(`| \`${candidate.value}\` | ${files}${moreFiles} | ${candidate.occurrences} |`)
      }
      if (data.candidates.repeatedStringFiles.length > 20) {
        lines.push(`| ... | ... | (+${data.candidates.repeatedStringFiles.length - 20} more) |`)
      }
      lines.push('')
    }
  }
  
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Files scanned: **${data.fileCount}**`)
  lines.push(`- Groups (window=${data.windowLines} lines, minOccurrences=${data.minGroupOccurrences}): **${data.groups.length}**`)
  if (data.candidates) {
    const candidateCount = (data.candidates.similarTypeNames?.length || 0) + 
                          (data.candidates.similarFunctionPatterns?.length || 0) + 
                          (data.candidates.repeatedStringFiles?.length || 0)
    lines.push(`- Candidate findings from pattern-detection: **${candidateCount}**`)
  }
  lines.push('')

  lines.push('## Top duplication groups (by leverage)')
  lines.push('')
  lines.push('| Group | unique files | occurrences | lineCount | sample locations |')
  lines.push('| --- | ---: | ---: | ---: | --- |')

  for (const g of data.groups.slice(0, 25)) {
    const sample = g.locations.slice(0, 3).map(l => `\`${l.repoPath}@${l.startLine}\``).join(', ')
    lines.push(`| \`${g.groupId}\` | ${g.uniqueFiles} | ${g.occurrences} | ${g.lineCount} | ${sample}${g.locations.length > 3 ? ', …' : ''} |`)
  }

  lines.push('')
  lines.push('## Per-group details (top)')
  lines.push('')
  lines.push('LEARNING: When a group spans multiple files in the same domain, it’s often a good extraction candidate (shared utility/composable).')
  lines.push('')

  const topDetail = data.groups.slice(0, 20)
  for (const g of topDetail) {
    lines.push(`### Group \`${g.groupId}\``)
    lines.push('')
    lines.push(`- unique files: **${g.uniqueFiles}**, occurrences: **${g.occurrences}**, lineCount: **${g.lineCount}**`)
    lines.push('')
    lines.push('Locations:')
    for (const l of g.locations.slice(0, 12)) {
      lines.push(`- \`${l.repoPath}\` @ lines ${l.startLine}-${l.endLine}`)
    }
    if (g.locations.length > 12) {
      lines.push(`- … (${g.locations.length - 12} more locations omitted)`)
    }
    lines.push('')
    lines.push('```')
    for (const t of g.windowText.split('\n').slice(0, 30)) {
      lines.push(t)
    }
    if (g.windowText.split('\n').length > 30) {
      lines.push('... (window truncated)')
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
  } catch (error) {
    // Config might not exist or be invalid, use defaults
  }

  const clientFiles = listFilesRecursive(CLIENT_SRC)
  const serverFiles = listFilesRecursive(SERVER_SRC)
  let absFiles = [...clientFiles, ...serverFiles]
  
  // Load pattern-detection candidates and prioritize files
  const candidates = loadPatternDetectionCandidates()
  if (candidates) {
    absFiles = prioritizeFilesWithCandidates(absFiles, candidates)
  }
  
  /** @type {Array<{id: string, repoPath: string, windows: Array<{hash: string, windowText: string, startLine: number, endLine: number, lineCount: number}>}>} */
  const perFile = []

  for (const abs of absFiles) {
    const repoPath = toRepoPath(abs)
    if (isExcluded(repoPath, configAllowlist)) continue
    // Double-check exclusion
    if (shouldExcludeDir(repoPath)) continue
    const contents = fs.readFileSync(abs, 'utf8')
    const targets = extractTargets(repoPath, contents)
    const allWindows = []

    for (const t of targets) {
      const kept = normalizeKeptLines(t.lines, t.baseLineNumber)
      const windows = buildWindows(kept).map(w => ({
        ...w,
        // Keep label for context in JSON; MD uses repoPath
        target: t.label,
      }))
      allWindows.push(...windows)
    }

    if (allWindows.length === 0) continue

    // Stable ordering within file
    allWindows.sort((a, b) => a.hash.localeCompare(b.hash) || a.startLine - b.startLine)

    perFile.push({
      id: toStableId(repoPath),
      repoPath,
      windows: allWindows,
    })
  }

  // Build groups by hash
  /** @type {Map<string, Array<{repoPath: string, startLine: number, endLine: number, windowText: string, target: string}>>} */
  const groupMap = new Map()

  for (const f of perFile) {
    for (const w of f.windows) {
      const list = groupMap.get(w.hash) || []
      list.push({
        repoPath: f.repoPath,
        startLine: w.startLine,
        endLine: w.endLine,
        windowText: w.windowText,
        target: w.target,
      })
      groupMap.set(w.hash, list)
    }
  }

  // Materialize groups (only multi-file / multi-occurrence)
  const groups = Array.from(groupMap.entries())
    .map(([hash, locations]) => {
      const uniqueFiles = new Set(locations.map(l => l.repoPath)).size
      const occurrences = locations.length
      const lineCount = WINDOW_LINES

      // Deterministic: choose lexicographically smallest windowText for display if somehow differs.
      const windowText = locations
        .map(l => l.windowText)
        .slice()
        .sort((a, b) => a.localeCompare(b))[0] || ''

      const groupId = `dup-${hash}`

      // Stable locations ordering
      const locs = locations
        .slice()
        .sort((a, b) => a.repoPath.localeCompare(b.repoPath) || a.startLine - b.startLine || a.endLine - b.endLine)

      const group = { groupId, hash, uniqueFiles, occurrences, lineCount, windowText, locations: locs }
      const groupScore = calculateGroupScore(group)
      const groupPriority = assignPriority(groupScore, priorityConfig)
      
      return { ...group, score: groupScore, priority: groupPriority }
    })
    .filter(g => g.occurrences >= MIN_WINDOWS_PER_GROUP && g.uniqueFiles >= 2)
    .sort(compareGroups)

  const out = {
    generatedAt: new Date().toISOString(),
    scope: {
      included: ['client/src/**/*.{ts,js,vue}', 'server/src/**/*.{ts,mjs}'],
      excluded: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*', 'client/src/@core/**', 'client/src/@layouts/**'],
      vueScanning: 'script-only',
    },
    windowLines: WINDOW_LINES,
    minGroupOccurrences: MIN_WINDOWS_PER_GROUP,
    fileCount: perFile.length,
    candidates: candidates || null,
    groups,
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2))
  fs.writeFileSync(OUT_MD, renderMarkdownReport(out))

  const clientFilesCount = clientFiles.length
  const serverFilesCount = serverFiles.length
  console.log(`Wrote:\n- ${toRepoPath(OUT_JSON)}\n- ${toRepoPath(OUT_MD)}\nFiles scanned: ${perFile.length} (${clientFilesCount} client, ${serverFilesCount} server), Groups: ${groups.length}`)
  process.exitCode = 0
}

main()


