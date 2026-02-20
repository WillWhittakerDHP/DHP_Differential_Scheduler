import fs from 'node:fs'
import path from 'node:path'
import {
  getAuditReportHeaderLines,
  loadCentralAllowlist,
  listAuditFiles,
  checkConfigAllowlist,
  parseChangedOnlyFlag,
} from './shared-audit-utils.mjs'

/**
 * Function Complexity Audit Script
 *
 * Goal: Identify overly complex functions/methods by measuring:
 *   - Nesting depth (if/else/try/catch/switch nesting > 3 levels)
 *   - Branch count (if/else/ternary/switch-case > 8 per function)
 *   - Function length (> 50 lines for functions, > 100 for Vue script setup)
 *   - Parameter count (> 4 params)
 *   - Return count (> 4 return statements)
 *
 * Scope:
 *   - Included: client/src (ts, js, vue) and server/src (ts, mjs)
 *   - Excluded: __tests__, test files, @core, @layouts, migrations
 *
 * Output:
 *   - client/.audit-reports/function-complexity-audit.json
 *   - client/.audit-reports/function-complexity-audit.md
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
const OUT_JSON = path.join(OUT_DIR, 'function-complexity-audit.json')
const OUT_MD = path.join(OUT_DIR, 'function-complexity-audit.md')
const CONFIG_PATH = path.join(OUT_DIR, 'function-complexity-audit-config.json')

// Thresholds (overridable via config)
const DEFAULTS = {
  maxNesting: 3,
  maxBranches: 8,
  maxFunctionLines: 50,
  maxScriptSetupLines: 100,
  maxParams: 4,
  maxReturns: 4,
}

function ensureDir(d) { fs.mkdirSync(d, { recursive: true }) }
function toRepoPath(p) { return path.relative(PROJECT_ROOT, p).replaceAll(path.sep, '/') }

function extractVueScriptSetup(content) {
  const match = content.match(/<script\s+[^>]*setup[^>]*>([\s\S]*?)<\/script>/i)
  return match ? match[1] : null
}

function extractVueScriptBlocks(content) {
  const blocks = []
  const re = /<script\b[^>]*>([\s\S]*?)<\/script>/gi
  for (const m of content.matchAll(re)) blocks.push(m[1] || '')
  return blocks
}

/**
 * Detect function boundaries and measure complexity metrics
 */
function analyzeFile(content, isVueSetup, thresholds) {
  const lines = content.split('\n')
  const functions = []

  // Detect function declarations (named functions, arrow functions, methods)
  const funcStartRe = /(?:(?:export\s+)?(?:async\s+)?function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(|(\w+)\s*\([^)]*\)\s*\{)/
  
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const match = line.match(funcStartRe)
    
    if (match) {
      const name = match[1] || match[2] || match[3] || `anonymous@${i + 1}`
      const startLine = i
      
      // Find function end by brace matching
      let depth = 0
      let foundStart = false
      let endLine = i
      
      for (let j = i; j < lines.length; j++) {
        for (const ch of lines[j]) {
          if (ch === '{') { depth++; foundStart = true }
          if (ch === '}') depth--
          if (foundStart && depth === 0) { endLine = j; break }
        }
        if (foundStart && depth === 0) break
        // Safety: don't scan more than 500 lines for one function
        if (j - i > 500) { endLine = j; break }
      }
      
      const funcLines = lines.slice(startLine, endLine + 1)
      const funcLength = funcLines.length
      
      // Count metrics
      let maxNesting = 0
      let currentNesting = 0
      let branches = 0
      let returns = 0
      
      for (const fl of funcLines) {
        // Track nesting
        if (/\b(if|for|while|switch|try)\b/.test(fl)) {
          currentNesting++
          if (currentNesting > maxNesting) maxNesting = currentNesting
          branches++
        }
        if (/\belse\b/.test(fl)) branches++
        if (/\bcase\b/.test(fl)) branches++
        if (/[?]/.test(fl) && /[:]/.test(fl)) branches++ // ternary heuristic
        if (/\breturn\b/.test(fl)) returns++
        
        // Track brace-based nesting reduction
        const opens = (fl.match(/\{/g) || []).length
        const closes = (fl.match(/\}/g) || []).length
        currentNesting += opens - closes
        if (currentNesting < 0) currentNesting = 0
      }
      
      // Count parameters
      const paramMatch = line.match(/\(([^)]*)\)/)
      const params = paramMatch && paramMatch[1].trim()
        ? paramMatch[1].split(',').filter(p => p.trim() !== '').length
        : 0
      
      // Determine violations
      const violations = []
      if (maxNesting > thresholds.maxNesting) violations.push({ rule: 'nesting', value: maxNesting, threshold: thresholds.maxNesting })
      if (branches > thresholds.maxBranches) violations.push({ rule: 'branches', value: branches, threshold: thresholds.maxBranches })
      if (funcLength > thresholds.maxFunctionLines) violations.push({ rule: 'length', value: funcLength, threshold: thresholds.maxFunctionLines })
      if (params > thresholds.maxParams) violations.push({ rule: 'params', value: params, threshold: thresholds.maxParams })
      if (returns > thresholds.maxReturns) violations.push({ rule: 'returns', value: returns, threshold: thresholds.maxReturns })
      
      if (violations.length > 0) {
        functions.push({
          name,
          startLine: startLine + 1,
          endLine: endLine + 1,
          length: funcLength,
          maxNesting,
          branches,
          params,
          returns,
          violations,
        })
      }
      
      i = endLine + 1
      continue
    }
    i++
  }
  
  // For Vue script setup, also check the entire block length
  if (isVueSetup && lines.length > thresholds.maxScriptSetupLines) {
    functions.push({
      name: '<script setup>',
      startLine: 1,
      endLine: lines.length,
      length: lines.length,
      maxNesting: 0,
      branches: 0,
      params: 0,
      returns: 0,
      violations: [{ rule: 'script-setup-length', value: lines.length, threshold: thresholds.maxScriptSetupLines }],
    })
  }
  
  return functions
}

const VIOLATION_SCORE = { nesting: 5, branches: 3, length: 2, params: 2, returns: 1, 'script-setup-length': 3 }

function calculateScore(functions) {
  return functions.reduce((sum, fn) =>
    sum + fn.violations.reduce((vs, v) => vs + (VIOLATION_SCORE[v.rule] || 1), 0), 0)
}

function assignPriority(score, config) {
  const p0Min = Number(config?.priorities?.p0MinSeverityScore ?? 12)
  const p1Min = Number(config?.priorities?.p1MinSeverityScore ?? 5)
  if (score >= p0Min) return 'P0'
  if (score >= p1Min) return 'P1'
  return 'P2'
}

function renderMarkdownReport(filesWithFindings, totalScanned) {
  const lines = []
  lines.push(...getAuditReportHeaderLines())
  lines.push('# Function Complexity Audit (Generated)')
  lines.push('')
  lines.push('This file is generated by `client/.scripts/function-complexity-audit.mjs`.')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Files scanned: **${totalScanned}**`)
  lines.push(`- Files with complex functions: **${filesWithFindings.length}**`)

  let totalFns = 0
  const violationCounts = {}
  for (const f of filesWithFindings) {
    totalFns += f.functions.length
    for (const fn of f.functions) {
      for (const v of fn.violations) {
        violationCounts[v.rule] = (violationCounts[v.rule] || 0) + 1
      }
    }
  }
  lines.push(`- Complex functions found: **${totalFns}**`)
  lines.push(`- Violations: nesting=${violationCounts.nesting || 0}, branches=${violationCounts.branches || 0}, length=${violationCounts.length || 0}, params=${violationCounts.params || 0}, returns=${violationCounts.returns || 0}`)
  lines.push('')

  lines.push('## Top hotspots')
  lines.push('')
  lines.push('| File | Priority | Score | Complex Fns | Worst Nesting | Worst Length |')
  lines.push('| --- | --- | ---: | ---: | ---: | ---: |')

  for (const f of filesWithFindings.slice(0, 30)) {
    const worstNesting = Math.max(...f.functions.map(fn => fn.maxNesting), 0)
    const worstLength = Math.max(...f.functions.map(fn => fn.length), 0)
    lines.push(`| \`${f.repoPath}\` | ${f.priority} | ${f.score} | ${f.functions.length} | ${worstNesting} | ${worstLength} |`)
  }

  if (filesWithFindings.length > 30) {
    lines.push('')
    lines.push(`*...and ${filesWithFindings.length - 30} more files.*`)
  }

  lines.push('')
  lines.push('## Per-file details')
  lines.push('')

  for (const f of filesWithFindings.slice(0, 40)) {
    lines.push(`### \`${f.repoPath}\` [${f.priority}]`)
    lines.push('')
    for (const fn of f.functions) {
      const vList = fn.violations.map(v => `${v.rule}=${v.value}>${v.threshold}`).join(', ')
      lines.push(`- **${fn.name}** (L${fn.startLine}-${fn.endLine}, ${fn.length} lines): ${vList}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

function main() {
  ensureDir(OUT_DIR)

  const configAllowlist = loadCentralAllowlist('function-complexity')
  const delta = parseChangedOnlyFlag(process.argv, PROJECT_ROOT)

  let config = {}
  try { config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')) } catch { /* defaults */ }

  const thresholds = {
    maxNesting: config.thresholds?.maxNesting ?? DEFAULTS.maxNesting,
    maxBranches: config.thresholds?.maxBranches ?? DEFAULTS.maxBranches,
    maxFunctionLines: config.thresholds?.maxFunctionLines ?? DEFAULTS.maxFunctionLines,
    maxScriptSetupLines: config.thresholds?.maxScriptSetupLines ?? DEFAULTS.maxScriptSetupLines,
    maxParams: config.thresholds?.maxParams ?? DEFAULTS.maxParams,
    maxReturns: config.thresholds?.maxReturns ?? DEFAULTS.maxReturns,
  }

  const allFiles = listAuditFiles('function-complexity', [CLIENT_SRC, SERVER_SRC])
  const scanned = []

  for (const abs of allFiles) {
    const repoPath = toRepoPath(abs)
    if (delta.enabled && !delta.changedFiles.has(repoPath)) continue

    const rawContent = fs.readFileSync(abs, 'utf-8')
    let content = rawContent
    let isVueSetup = false

    if (abs.endsWith('.vue')) {
      const setup = extractVueScriptSetup(rawContent)
      if (setup) {
        content = setup
        isVueSetup = true
      } else {
        const blocks = extractVueScriptBlocks(rawContent)
        if (blocks.length === 0) continue
        content = blocks.join('\n')
      }
    }

    const functions = analyzeFile(content, isVueSetup, thresholds)
    if (functions.length === 0) continue

    const fileScore = calculateScore(functions)
    const filePriority = assignPriority(fileScore, config)

    scanned.push({ repoPath, functions, score: fileScore, priority: filePriority })
  }

  scanned.sort((a, b) => b.score - a.score || a.repoPath.localeCompare(b.repoPath))

  const out = {
    generatedAt: new Date().toISOString(),
    totalScanned: allFiles.length,
    thresholds,
    ...(delta.enabled ? { deltaMode: true, baseRef: delta.baseRef } : {}),
    files: scanned,
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2))
  fs.writeFileSync(OUT_MD, renderMarkdownReport(scanned, allFiles.length))

  console.log(`Wrote:\n- ${toRepoPath(OUT_JSON)}\n- ${toRepoPath(OUT_MD)}`)
  console.log(`Files with complex functions: ${scanned.length}`)
  process.exitCode = 0
}

main()
