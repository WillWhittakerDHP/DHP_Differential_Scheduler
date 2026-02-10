import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import {
  loadConfigAllowlist,
  checkConfigAllowlist,
  parseChangedOnlyFlag,
  isCompiledJsFile,
  isSeedScript,
} from './audit-exceptions.mjs'

/**
 * TODO Aging Audit Script
 *
 * Goal: Find TODO, FIXME, HACK, XXX, TEMP, WORKAROUND comments, determine their age
 * via git blame, and categorize by freshness. Helps prevent tech debt from aging silently.
 *
 * Categories:
 *   fresh   (< 30 days)   - acceptable, recently added
 *   aging   (30-90 days)  - should have a plan
 *   stale   (90-180 days) - overdue for action
 *   ancient (> 180 days)  - critical tech debt
 *
 * Also flags orphaned TODOs with no ticket reference.
 *
 * Scope:
 *   - Included: client/src (ts, js, vue) and server/src (ts, mjs)
 *   - Excluded: __tests__, test files, @core, @layouts, migrations, node_modules
 *
 * Exception Handling:
 *   - Inline: // @audit-allow:todo-aging:<ruleId> - <reason>
 *   - Config: .audit-reports/todo-aging-audit-config.json
 *
 * Output:
 *   - client/.audit-reports/todo-aging-audit.json
 *   - client/.audit-reports/todo-aging-audit.md
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
const OUT_JSON = path.join(OUT_DIR, 'todo-aging-audit.json')
const OUT_MD = path.join(OUT_DIR, 'todo-aging-audit.md')
const CONFIG_PATH = path.join(OUT_DIR, 'todo-aging-audit-config.json')

const MARKER_RE = /\b(TODO|FIXME|HACK|XXX|TEMP|WORKAROUND)\b/i
const TICKET_RE = /#\d+|[A-Z]{2,}-\d+/

function ensureDir(d) { fs.mkdirSync(d, { recursive: true }) }
function toRepoPath(p) { return path.relative(PROJECT_ROOT, p).replaceAll(path.sep, '/') }

function isExcluded(repoPath, configAllowlist) {
  if (repoPath.includes('/migrations/') || /migration.*\.(js|mjs|ts)$/i.test(repoPath)) return true
  if (repoPath.includes('__tests__') || repoPath.includes('.test.') || repoPath.includes('.spec.')) return true
  if (isSeedScript(repoPath)) return true
  if (repoPath.startsWith('client/src') && (repoPath.includes('@core/') || repoPath.includes('@layouts/'))) return true
  if (repoPath.includes('node_modules') || repoPath.includes('/dist/') || repoPath.includes('.git/')) return true
  if (repoPath.includes('.scripts/') || repoPath.includes('.audit-reports/')) return true
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

/**
 * Get commit dates for specific lines using git blame --porcelain
 */
function getBlameDate(absPath, lineNumbers) {
  const dates = new Map()
  if (lineNumbers.length === 0) return dates

  try {
    // Build line ranges for blame
    const output = execSync(
      `git blame --porcelain "${absPath}"`,
      { cwd: PROJECT_ROOT, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024, timeout: 30000 }
    )

    let currentLine = 0
    let currentTimestamp = 0
    for (const blameLine of output.split('\n')) {
      // Lines starting with a hash are commit headers: <hash> <orig-line> <final-line> [<count>]
      const headerMatch = blameLine.match(/^[0-9a-f]{40}\s+\d+\s+(\d+)/)
      if (headerMatch) {
        currentLine = parseInt(headerMatch[1], 10)
      }
      if (blameLine.startsWith('committer-time ')) {
        currentTimestamp = parseInt(blameLine.split(' ')[1], 10)
        if (lineNumbers.includes(currentLine)) {
          dates.set(currentLine, new Date(currentTimestamp * 1000))
        }
      }
    }
  } catch {
    // git blame might fail for uncommitted files, etc.
  }
  return dates
}

function classifyAge(commitDate) {
  const now = new Date()
  const days = Math.floor((now - commitDate) / (1000 * 60 * 60 * 24))
  if (days < 30) return { category: 'fresh', days }
  if (days < 90) return { category: 'aging', days }
  if (days < 180) return { category: 'stale', days }
  return { category: 'ancient', days }
}

const AGE_SCORE = { fresh: 0, aging: 1, stale: 3, ancient: 5 }
const ORPHAN_BONUS = 2

function assignPriority(score, config) {
  const p0Min = Number(config?.priorities?.p0MinSeverityScore ?? 15)
  const p1Min = Number(config?.priorities?.p1MinSeverityScore ?? 7)
  if (score >= p0Min) return 'P0'
  if (score >= p1Min) return 'P1'
  return 'P2'
}

function renderMarkdownReport(filesWithFindings, totals) {
  const lines = []
  lines.push('# TODO Aging Audit (Generated)')
  lines.push('')
  lines.push('This file is generated by `client/.scripts/todo-aging-audit.mjs`.')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Files scanned: **${totals.totalScanned}**`)
  lines.push(`- Files with markers: **${filesWithFindings.length}**`)
  lines.push(`- Total markers: **${totals.totalMarkers}**`)
  lines.push(`- Fresh (< 30d): ${totals.fresh} | Aging (30-90d): ${totals.aging} | Stale (90-180d): ${totals.stale} | Ancient (> 180d): ${totals.ancient}`)
  lines.push(`- Orphaned (no ticket ref): **${totals.orphaned}**`)
  lines.push('')

  lines.push('## Top hotspots')
  lines.push('')
  lines.push('| File | Priority | Score | Total | Ancient | Stale | Aging | Fresh | Orphaned |')
  lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')

  for (const f of filesWithFindings.slice(0, 30)) {
    const cats = { fresh: 0, aging: 0, stale: 0, ancient: 0 }
    let orphaned = 0
    for (const m of f.markers) {
      cats[m.category]++
      if (m.orphaned) orphaned++
    }
    lines.push(`| \`${f.repoPath}\` | ${f.priority} | ${f.score} | ${f.markers.length} | ${cats.ancient} | ${cats.stale} | ${cats.aging} | ${cats.fresh} | ${orphaned} |`)
  }

  if (filesWithFindings.length > 30) {
    lines.push('')
    lines.push(`*...and ${filesWithFindings.length - 30} more files.*`)
  }

  lines.push('')
  lines.push('## Ancient markers (> 180 days)')
  lines.push('')

  const ancientFiles = filesWithFindings.filter(f => f.markers.some(m => m.category === 'ancient'))
  if (ancientFiles.length === 0) {
    lines.push('None found.')
  } else {
    for (const f of ancientFiles.slice(0, 20)) {
      lines.push(`### \`${f.repoPath}\``)
      lines.push('')
      lines.push('```')
      for (const m of f.markers.filter(m => m.category === 'ancient').slice(0, 20)) {
        lines.push(`${m.marker}@${m.lineNumber} (${m.days}d${m.orphaned ? ', orphaned' : ''}): ${m.line}`)
      }
      lines.push('```')
      lines.push('')
    }
  }

  return lines.join('\n')
}

function main() {
  ensureDir(OUT_DIR)

  const configAllowlist = loadConfigAllowlist(CONFIG_PATH)
  const delta = parseChangedOnlyFlag(process.argv, PROJECT_ROOT)

  let priorityConfig = {}
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8')
    priorityConfig = JSON.parse(raw)
  } catch { /* defaults */ }

  const clientFiles = listFilesRecursive(CLIENT_SRC)
  const serverFiles = listFilesRecursive(SERVER_SRC)
  const allFiles = [...clientFiles, ...serverFiles]
  const scanned = []
  const totals = { totalScanned: allFiles.length, totalMarkers: 0, fresh: 0, aging: 0, stale: 0, ancient: 0, orphaned: 0 }

  for (const abs of allFiles) {
    const repoPath = toRepoPath(abs)
    if (delta.enabled && !delta.changedFiles.has(repoPath)) continue
    if (isExcluded(repoPath, configAllowlist)) continue

    const content = fs.readFileSync(abs, 'utf-8')
    const lines = content.split('\n')
    const matchedLines = []

    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(MARKER_RE)
      if (match) {
        matchedLines.push({ lineNumber: i + 1, marker: match[1].toUpperCase(), line: lines[i].trim().substring(0, 120) })
      }
    }

    if (matchedLines.length === 0) continue

    // Get blame dates for matched lines
    const blameDates = getBlameDate(abs, matchedLines.map(m => m.lineNumber))

    const markers = matchedLines.map(m => {
      const commitDate = blameDates.get(m.lineNumber)
      const age = commitDate ? classifyAge(commitDate) : { category: 'ancient', days: 999 }
      const orphaned = !TICKET_RE.test(m.line)
      return { ...m, category: age.category, days: age.days, orphaned }
    })

    const fileScore = markers.reduce((sum, m) => sum + (AGE_SCORE[m.category] || 0) + (m.orphaned ? ORPHAN_BONUS : 0), 0)
    const filePriority = assignPriority(fileScore, priorityConfig)

    // Update totals
    for (const m of markers) {
      totals.totalMarkers++
      totals[m.category]++
      if (m.orphaned) totals.orphaned++
    }

    scanned.push({ repoPath, markers, score: fileScore, priority: filePriority })
  }

  scanned.sort((a, b) => b.score - a.score || a.repoPath.localeCompare(b.repoPath))

  const out = {
    generatedAt: new Date().toISOString(),
    totalScanned: allFiles.length,
    ...(delta.enabled ? { deltaMode: true, baseRef: delta.baseRef } : {}),
    totals,
    files: scanned,
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2))
  fs.writeFileSync(OUT_MD, renderMarkdownReport(scanned, totals))

  console.log(`Wrote:\n- ${toRepoPath(OUT_JSON)}\n- ${toRepoPath(OUT_MD)}`)
  console.log(`Markers: ${totals.totalMarkers} (ancient: ${totals.ancient}, stale: ${totals.stale}, aging: ${totals.aging}, fresh: ${totals.fresh}, orphaned: ${totals.orphaned})`)
  process.exitCode = 0
}

main()
