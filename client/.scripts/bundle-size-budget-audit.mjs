import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import {
  getAuditReportHeaderLines,
  resolveAuditPaths,
  writeAuditReports,
  toRepoPath,
} from './shared-audit-utils.mjs'

const _paths = resolveAuditPaths('bundle-size-budget')
const DIST_DIR = path.join(_paths.clientRoot, 'dist')
const ASSETS_DIR = path.join(DIST_DIR, 'assets')

/**
 * Bundle Size Budget Audit Script
 *
 * Goal: Measure production build chunk sizes (raw + gzip), compare against
 * configurable budgets, and flag violations. Tracks total JS, total CSS,
 * largest single chunk, and entry point size.
 *
 * Scope:
 *   - Reads client/dist/assets/*.js and *.css (requires prior `npm run build`)
 *
 * Output:
 *   - client/.audit-reports/bundle-size-budget-audit.json
 *   - client/.audit-reports/bundle-size-budget-audit.md
 */

function loadConfig() {
  const defaults = {
    budgets: {
      totalJsKb: 800,
      totalCssKb: 200,
      largestChunkKb: 250,
      entryPointKb: 150,
    },
  }
  if (!fs.existsSync(_paths.configPath)) return defaults
  try {
    const raw = JSON.parse(fs.readFileSync(_paths.configPath, 'utf8'))
    return { budgets: { ...defaults.budgets, ...raw.budgets } }
  } catch {
    return defaults
  }
}

function getGzipSize(buffer) {
  return zlib.gzipSync(buffer, { level: 6 }).length
}

function scanAssets() {
  const chunks = []
  if (!fs.existsSync(ASSETS_DIR)) return chunks
  const entries = fs.readdirSync(ASSETS_DIR, { withFileTypes: true })
  for (const e of entries) {
    if (!e.isFile()) continue
    const ext = path.extname(e.name).toLowerCase()
    if (ext !== '.js' && ext !== '.css') continue
    const absPath = path.join(ASSETS_DIR, e.name)
    const buffer = fs.readFileSync(absPath)
    const sizeBytes = buffer.length
    const gzipBytes = getGzipSize(buffer)
    const type = ext === '.js' ? 'js' : 'css'
    const isEntry = /^index-[a-zA-Z0-9]+\.js$/i.test(e.name)
    chunks.push({
      file: `assets/${e.name}`,
      sizeKb: Math.round((sizeBytes / 1024) * 100) / 100,
      gzipKb: Math.round((gzipBytes / 1024) * 100) / 100,
      type,
      isEntry,
    })
  }
  return chunks
}

function computeTotals(chunks) {
  const jsChunks = chunks.filter(c => c.type === 'js')
  const cssChunks = chunks.filter(c => c.type === 'css')
  const totalJsKb = jsChunks.reduce((s, c) => s + c.gzipKb, 0)
  const totalCssKb = cssChunks.reduce((s, c) => s + c.gzipKb, 0)
  const largestChunkKb = chunks.length > 0 ? Math.max(...chunks.map(c => c.gzipKb)) : 0
  const entryChunk = jsChunks.find(c => c.isEntry)
  const entryPointKb = entryChunk ? entryChunk.gzipKb : 0
  return { totalJsKb, totalCssKb, largestChunkKb, entryPointKb }
}

function checkBudgets(totals, budgets) {
  const result = {}
  const keys = ['totalJsKb', 'totalCssKb', 'largestChunkKb', 'entryPointKb']
  for (const key of keys) {
    const budget = budgets[key]
    const actual = totals[key]
    if (budget == null) continue
    result[key] = {
      budget,
      actual: Math.round(actual * 100) / 100,
      pass: actual <= budget,
      pctOfBudget: budget > 0 ? Math.round((actual / budget) * 100) : 0,
    }
  }
  return result
}

function assignPriority(budgetResults, _chunks) {
  const violations = Object.values(budgetResults).filter(b => !b.pass).length
  const nearLimit = Object.values(budgetResults).filter(b => b.pctOfBudget >= 80 && b.pass).length
  if (violations > 0) return 'P0'
  if (nearLimit > 0) return 'P1'
  return 'P2'
}

function renderMarkdownReport(data) {
  const lines = []
  lines.push(...getAuditReportHeaderLines())
  lines.push('# Bundle Size Budget Audit (Generated)')
  lines.push('')
  lines.push(`Generated at: ${data.generatedAt}`)
  if (data.buildTimestamp) lines.push(`Build timestamp: ${data.buildTimestamp}`)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Chunks scanned: **${data.totalScanned}**`)
  const totals = data.totals || {}
  lines.push(`- Total JS (gzip): **${(totals.totalJsKb ?? 0).toFixed(1)} KB**`)
  lines.push(`- Total CSS (gzip): **${(totals.totalCssKb ?? 0).toFixed(1)} KB**`)
  lines.push(`- Largest chunk: **${(totals.largestChunkKb ?? 0).toFixed(1)} KB**`)
  lines.push(`- Entry point: **${(totals.entryPointKb ?? 0).toFixed(1)} KB**`)
  lines.push('')
  lines.push('## Budgets')
  lines.push('')
  lines.push('| Budget | Limit (KB) | Actual (KB) | Pass | % of budget |')
  lines.push('| --- | ---: | ---: | --- | ---: |')
  const budgetResults = data.budgetResults || {}
  for (const [key, b] of Object.entries(budgetResults)) {
    const passStr = b.pass ? 'Yes' : 'No'
    lines.push(`| ${key} | ${b.budget} | ${b.actual.toFixed(1)} | ${passStr} | ${b.pctOfBudget}% |`)
  }
  lines.push('')
  lines.push('## Chunks')
  lines.push('')
  lines.push('| File | Type | Size (KB) | Gzip (KB) | Entry |')
  lines.push('| --- | --- | ---: | ---: | --- |')
  const chunks = Array.isArray(data.chunks) ? data.chunks : []
  for (const c of chunks) {
    lines.push(`| \`${c.file}\` | ${c.type} | ${c.sizeKb.toFixed(1)} | ${c.gzipKb.toFixed(1)} | ${c.isEntry ? 'Yes' : ''} |`)
  }
  lines.push('')
  return lines.join('\n')
}

function main() {
  const config = loadConfig()
  const budgets = config.budgets

  const chunks = scanAssets()
  if (chunks.length === 0) {
    const out = {
      generatedAt: new Date().toISOString(),
      totalScanned: 0,
      error: 'No build output found. Run "npm run build" in client/ first.',
      chunks: [],
      totals: { totalJsKb: 0, totalCssKb: 0, largestChunkKb: 0, entryPointKb: 0 },
      budgetResults: {},
      exceptionSummary: { totalAllowed: 0, totalRequiresReview: 0, bySource: { inline: 0, pattern: 0, specific: 0 } },
      files: [],
    }
    const { outJson, outMd } = writeAuditReports('bundle-size-budget', out, '# Bundle Size Budget Audit (Generated)\n\nNo build output found. Run `npm run build` in client/ first.\n')
    console.log('Wrote:', toRepoPath(outJson, _paths.projectRoot), toRepoPath(outMd, _paths.projectRoot))
    console.log('No dist/assets found. Run npm run build in client/ first.')
    process.exitCode = 0
    return
  }

  const totals = computeTotals(chunks)
  const budgetResults = checkBudgets(totals, budgets)
  const priority = assignPriority(budgetResults, chunks)
  const totalRequiresReview = Object.values(budgetResults).filter(b => !b.pass).length
  const buildTimestamp = (() => {
    try {
      const s = fs.statSync(path.join(DIST_DIR, 'index.html'))
      return s.mtime.toISOString()
    } catch {
      return null
    }
  })()

  const files = chunks.map(c => ({
    repoPath: c.file,
    score: c.gzipKb,
    priority: c.gzipKb >= (budgets.largestChunkKb ?? 250) * 0.8 ? 'P1' : 'P2',
    ...c,
  }))

  const out = {
    generatedAt: new Date().toISOString(),
    buildTimestamp,
    totalScanned: chunks.length,
    chunks,
    totals,
    budgetResults,
    exceptionSummary: {
      totalAllowed: 0,
      totalRequiresReview,
      bySource: { inline: 0, pattern: 0, specific: 0 },
    },
    files,
    priority,
  }

  const { outJson, outMd } = writeAuditReports('bundle-size-budget', out, renderMarkdownReport(out))

  console.log('Wrote:', toRepoPath(outJson, _paths.projectRoot), toRepoPath(outMd, _paths.projectRoot))
  console.log(`Chunks: ${chunks.length} | JS: ${totals.totalJsKb.toFixed(1)} KB | CSS: ${totals.totalCssKb.toFixed(1)} KB | Priority: ${priority}`)
  if (totalRequiresReview > 0) {
    console.log(`Budget violations: ${totalRequiresReview}`)
  }
  process.exitCode = 0
}

main()
