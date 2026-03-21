import fs from 'node:fs'
import {
  getAuditReportHeaderLines,
  listAuditFiles,
  resolveAuditPaths,
  writeAuditReports,
  toRepoPath as toRepoPathUtil,
  parseChangedOnlyFlag,
  loadCentralAllowlist,
  checkConfigAllowlist,
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

// Thresholds (overridable via config)
const DEFAULTS = {
  maxNesting: 3,
  maxBranches: 8,
  maxFunctionLines: 50,
  maxScriptSetupLines: 100,
  maxParams: 4,
  maxReturns: 4,
}

function toRepoPath(p, projectRoot) { return toRepoPathUtil(p, projectRoot) }

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

/** Route path pattern for permissible handler heuristic. */
const ROUTES_PATH_RE = /\/(?:routes|src\/routes)\//

/** Return true to skip this function (excluded from report and score). */
function isPermissibleComplexFunction(fn, context) {
  const { repoPath, isVueSetup: _isVueSetup, firstLine } = context
  if (fn.name === '<script setup>') {
    const onlyScriptSetupLength =
      fn.violations.length === 1 && fn.violations[0].rule === 'script-setup-length'
    return onlyScriptSetupLength
  }
  if (repoPath && ROUTES_PATH_RE.test(repoPath) && firstLine) {
    const hasReq = /\breq\b/.test(firstLine)
    const hasRes = /\bres\b/.test(firstLine)
    if (hasReq && hasRes) return true
  }
  return false
}

/** Tier 1 = drives score and file count. Tier 2 = report-only. */
function assignTiers(violations, _thresholds, _maxNesting, _branches) {
  const hasNestingOrBranches =
    violations.some((v) => v.rule === 'nesting' || v.rule === 'branches')
  return violations.map((v) => {
    let tier = 2
    if (v.rule === 'nesting' || v.rule === 'branches') tier = 1
    else if (v.rule === 'length' && hasNestingOrBranches) tier = 1
    return { ...v, tier }
  })
}

/**
 * Matches real ternary expressions ( condition ? a : b ) while rejecting:
 *   - optional chaining  obj?.prop
 *   - nullish coalescing obj ?? fallback
 *   - TypeScript optional property  field?: Type
 *   - type annotations  key: Type
 * Heuristic: require `?` followed (with possible whitespace/tokens) by `:` on the
 * same line, but NOT preceded by `?` (optional chaining) or followed by `?` (nullish).
 */
const TERNARY_RE = /[^?]\s*\?\s*[^?:][^]*?(?<![{(,])\s*:/

/**
 * Detect function boundaries and measure complexity metrics
 */
function analyzeFile(content, isVueSetup, thresholds, repoPath = null) {
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
      
      // Count metrics — brace-only nesting to avoid double-counting
      let maxNesting = 0
      let braceDepth = 0
      let branches = 0
      let returns = 0

      for (const fl of funcLines) {
        const opens = (fl.match(/\{/g) || []).length
        const closes = (fl.match(/\}/g) || []).length
        braceDepth += opens - closes
        if (braceDepth < 0) braceDepth = 0
        if (braceDepth > maxNesting) maxNesting = braceDepth

        if (/\b(if|else\s+if|for|while|switch|try)\b/.test(fl)) branches++
        if (/\belse\b/.test(fl) && !/\belse\s+if\b/.test(fl)) branches++
        if (/\bcase\b/.test(fl)) branches++
        if (TERNARY_RE.test(fl)) branches++
        if (/\breturn\b/.test(fl)) returns++
      }

      // Subtract 1 for the function's own opening brace
      if (maxNesting > 0) maxNesting -= 1
      
      // Count parameters
      const paramMatch = line.match(/\(([^)]*)\)/)
      const params = paramMatch && paramMatch[1].trim()
        ? paramMatch[1].split(',').filter(p => p.trim() !== '').length
        : 0
      
      // Determine violations
      const violationsRaw = []
      if (maxNesting > thresholds.maxNesting) violationsRaw.push({ rule: 'nesting', value: maxNesting, threshold: thresholds.maxNesting })
      if (branches > thresholds.maxBranches) violationsRaw.push({ rule: 'branches', value: branches, threshold: thresholds.maxBranches })
      if (funcLength > thresholds.maxFunctionLines) violationsRaw.push({ rule: 'length', value: funcLength, threshold: thresholds.maxFunctionLines })
      if (params > thresholds.maxParams) violationsRaw.push({ rule: 'params', value: params, threshold: thresholds.maxParams })
      if (returns > thresholds.maxReturns) violationsRaw.push({ rule: 'returns', value: returns, threshold: thresholds.maxReturns })

      if (violationsRaw.length === 0) {
        i = endLine + 1
        continue
      }

      const violations = assignTiers(violationsRaw, thresholds, maxNesting, branches)
      const fn = {
        name,
        startLine: startLine + 1,
        endLine: endLine + 1,
        length: funcLength,
        maxNesting,
        branches,
        params,
        returns,
        violations,
      }
      if (repoPath != null && isPermissibleComplexFunction(fn, { repoPath, isVueSetup, firstLine: line })) {
        i = endLine + 1
        continue
      }
      functions.push(fn)
      
      i = endLine + 1
      continue
    }
    i++
  }
  
  // For Vue script setup, also check the entire block length
  if (isVueSetup && lines.length > thresholds.maxScriptSetupLines) {
    const scriptSetupViolation = [
      { rule: 'script-setup-length', value: lines.length, threshold: thresholds.maxScriptSetupLines, tier: 2 },
    ]
    const scriptSetupFn = {
      name: '<script setup>',
      startLine: 1,
      endLine: lines.length,
      length: lines.length,
      maxNesting: 0,
      branches: 0,
      params: 0,
      returns: 0,
      violations: scriptSetupViolation,
    }
    if (repoPath == null || !isPermissibleComplexFunction(scriptSetupFn, { repoPath, isVueSetup })) {
      functions.push(scriptSetupFn)
    }
  }

  return functions
}

const VIOLATION_SCORE = { nesting: 5, branches: 3, length: 2, params: 2, returns: 1, 'script-setup-length': 3 }

function calculateScore(functions) {
  return functions.reduce(
    (sum, fn) =>
      sum +
      fn.violations
        .filter((v) => v.tier === 1)
        .reduce((vs, v) => vs + (VIOLATION_SCORE[v.rule] || 1), 0),
    0
  )
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
  lines.push('Tier 1 (nesting, branches, length-when-branchy) drives score and file count; Tier 2 (params, returns, length-only, script-setup-length) is report-only. Route handlers and script-setup length-only are excluded.')
  lines.push('')
  lines.push(`- Files scanned: **${totalScanned}**`)
  lines.push(`- Files with complex functions: **${filesWithFindings.length}**`)

  let totalFns = 0
  const violationCounts = {}
  const tier1Counts = {}
  for (const f of filesWithFindings) {
    totalFns += f.functions.length
    for (const fn of f.functions) {
      for (const v of fn.violations) {
        violationCounts[v.rule] = (violationCounts[v.rule] || 0) + 1
        if (v.tier === 1) tier1Counts[v.rule] = (tier1Counts[v.rule] || 0) + 1
      }
    }
  }
  lines.push(`- Complex functions found: **${totalFns}**`)
  lines.push(`- Violations: nesting=${violationCounts.nesting || 0}, branches=${violationCounts.branches || 0}, length=${violationCounts.length || 0}, params=${violationCounts.params || 0}, returns=${violationCounts.returns || 0}`)
  lines.push(`- Tier 1 violations (score): nesting=${tier1Counts.nesting || 0}, branches=${tier1Counts.branches || 0}, length=${tier1Counts.length || 0}`)
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

function isFileAllowlisted(repoPath, allowlist) {
  const result = checkConfigAllowlist(repoPath, '*', 0, allowlist)
  return result.allowed
}

function main() {
  const paths = resolveAuditPaths('function-complexity')
  const delta = parseChangedOnlyFlag(process.argv, paths.projectRoot)
  const configAllowlist = loadCentralAllowlist('function-complexity')
  let config = {}
  try { config = JSON.parse(fs.readFileSync(paths.configPath, 'utf8')) } catch { /* defaults */ }

  const thresholds = {
    maxNesting: config.thresholds?.maxNesting ?? DEFAULTS.maxNesting,
    maxBranches: config.thresholds?.maxBranches ?? DEFAULTS.maxBranches,
    maxFunctionLines: config.thresholds?.maxFunctionLines ?? DEFAULTS.maxFunctionLines,
    maxScriptSetupLines: config.thresholds?.maxScriptSetupLines ?? DEFAULTS.maxScriptSetupLines,
    maxParams: config.thresholds?.maxParams ?? DEFAULTS.maxParams,
    maxReturns: config.thresholds?.maxReturns ?? DEFAULTS.maxReturns,
  }

  const allFiles = listAuditFiles('function-complexity', [paths.clientSrc, paths.serverSrc])
  const scanned = []
  let allowedCount = 0

  for (const abs of allFiles) {
    const repoPath = toRepoPath(abs, paths.projectRoot)
    if (delta.enabled && !delta.changedFiles.has(repoPath)) continue

    if (isFileAllowlisted(repoPath, configAllowlist)) {
      allowedCount++
      continue
    }

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

    const functions = analyzeFile(content, isVueSetup, thresholds, repoPath)
    if (functions.length === 0) continue

    const fileScore = calculateScore(functions)
    if (fileScore === 0) continue

    const filePriority = assignPriority(fileScore, config)
    scanned.push({ repoPath, functions, score: fileScore, priority: filePriority })
  }

  scanned.sort((a, b) => b.score - a.score || a.repoPath.localeCompare(b.repoPath))

  const out = {
    generatedAt: new Date().toISOString(),
    totalScanned: allFiles.length,
    totalAllowed: allowedCount,
    tierModel: 'tier1',
    tier1Rules: ['nesting', 'branches', 'length-when-branchy'],
    thresholds,
    ...(delta.enabled ? { deltaMode: true, baseRef: delta.baseRef } : {}),
    files: scanned,
  }

  const { outJson, outMd } = writeAuditReports('function-complexity', out, renderMarkdownReport(scanned, allFiles.length))

  console.log(`Wrote:\n- ${toRepoPath(outJson, paths.projectRoot)}\n- ${toRepoPath(outMd, paths.projectRoot)}`)
  console.log(`Files with complex functions: ${scanned.length} (${allowedCount} allowlisted)`)
  process.exitCode = 0
}

main()
