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
  simpleGlobMatch,
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
 * Pure-path relax: under configured utils globs, with no Vue/side-effect signals in the
 * function body and no file-level downgrade, uses pureThresholds from config.
 * Every finding includes purityAxis (pure|mixed|impure) and suggestedRemediation.
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

const DEFAULT_REMEDIATION = {
  pure: 'Split into smaller named pure functions under utils; prefer table-style tests; avoid growing a single mega-helper.',
  mixed:
    'First: extract deterministic logic (no ref/watch/inject) to client/src/utils/<domain>/ (or server/src/utils/<domain>/) with named helpers; keep the composable as thin orchestration. Re-run this audit. Then address remaining branches/length in the composable if needed.',
  impure:
    'First: isolate pure decision/transform logic in utils; keep I/O, mutations, and Vue wiring in the composable or route handler. Re-run this audit. Then simplify the orchestration layer.',
}

function toRepoPath(p, projectRoot) {
  return toRepoPathUtil(p, projectRoot)
}

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
  const hasNestingOrBranches = violations.some((v) => v.rule === 'nesting' || v.rule === 'branches')
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
 */
const TERNARY_RE = /[^?]\s*\?\s*[^?:][^]*?(?<![{(,])\s*:/

function loadPurityAxisConfig(config) {
  const pa = config.purityAxis || {}
  const rt = pa.remediationTemplates || {}
  return {
    pathGlobsPure: Array.isArray(pa.pathGlobsPure) ? pa.pathGlobsPure : [],
    pathGlobsMixed: Array.isArray(pa.pathGlobsMixed) ? pa.pathGlobsMixed : [],
    fileDowngradePatterns: Array.isArray(pa.fileDowngradePatterns) ? pa.fileDowngradePatterns : [],
    bodyVuePatterns: Array.isArray(pa.bodyVuePatterns) ? pa.bodyVuePatterns : [],
    bodySideEffectPatterns: Array.isArray(pa.bodySideEffectPatterns) ? pa.bodySideEffectPatterns : [],
    remediationTemplates: {
      pure: typeof rt.pure === 'string' ? rt.pure : DEFAULT_REMEDIATION.pure,
      mixed: typeof rt.mixed === 'string' ? rt.mixed : DEFAULT_REMEDIATION.mixed,
      impure: typeof rt.impure === 'string' ? rt.impure : DEFAULT_REMEDIATION.impure,
    },
  }
}

function matchesAnyPattern(text, patternStrings) {
  if (!text || !patternStrings?.length) return false
  for (const s of patternStrings) {
    try {
      // eslint-disable-next-line security/detect-non-literal-regexp
      if (new RegExp(s).test(text)) return true
    } catch {
      /* invalid pattern in config */
    }
  }
  return false
}

function matchesAnyGlob(repoPath, globs) {
  if (!repoPath || !globs?.length) return false
  for (const g of globs) {
    if (simpleGlobMatch(repoPath, g)) return true
  }
  return false
}

/**
 * Use relaxed thresholds only for utils-path functions with clean body and file.
 */
function eligibleForPureThresholds(repoPath, funcBody, rawFileContent, pc) {
  if (!matchesAnyGlob(repoPath, pc.pathGlobsPure)) return false
  if (matchesAnyPattern(rawFileContent, pc.fileDowngradePatterns)) return false
  if (matchesAnyPattern(funcBody, pc.bodyVuePatterns)) return false
  if (matchesAnyPattern(funcBody, pc.bodySideEffectPatterns)) return false
  return true
}

/**
 * Axis for remediation copy; heuristic (see FUNCTION_AUTHORING_PLAYBOOK).
 */
function classifyPurityAxis(repoPath, funcBody, usedPureThresholds, pc) {
  if (matchesAnyPattern(funcBody, pc.bodySideEffectPatterns)) return 'impure'
  if (matchesAnyPattern(funcBody, pc.bodyVuePatterns)) return 'impure'
  if (matchesAnyGlob(repoPath, pc.pathGlobsMixed)) return 'mixed'
  if (usedPureThresholds) return 'pure'
  const norm = (repoPath || '').replaceAll('\\', '/')
  if (norm.startsWith('client/src/')) return 'mixed'
  return 'mixed'
}

function remediationForAxis(axis, pc) {
  return pc.remediationTemplates[axis] || DEFAULT_REMEDIATION[axis] || DEFAULT_REMEDIATION.mixed
}

function collectViolations(funcLength, maxNesting, branches, params, returns, thresholds) {
  const violationsRaw = []
  if (maxNesting > thresholds.maxNesting) {
    violationsRaw.push({ rule: 'nesting', value: maxNesting, threshold: thresholds.maxNesting })
  }
  if (branches > thresholds.maxBranches) {
    violationsRaw.push({ rule: 'branches', value: branches, threshold: thresholds.maxBranches })
  }
  if (funcLength > thresholds.maxFunctionLines) {
    violationsRaw.push({ rule: 'length', value: funcLength, threshold: thresholds.maxFunctionLines })
  }
  if (params > thresholds.maxParams) {
    violationsRaw.push({ rule: 'params', value: params, threshold: thresholds.maxParams })
  }
  if (returns > thresholds.maxReturns) {
    violationsRaw.push({ rule: 'returns', value: returns, threshold: thresholds.maxReturns })
  }
  return violationsRaw
}

/**
 * Detect function boundaries and measure complexity metrics
 * @param {string} rawFileContent - Full file source (for file-level downgrade patterns)
 * @param {object} purityConfig - From loadPurityAxisConfig
 */
function analyzeFile(content, isVueSetup, defaultThresholds, pureThresholds, repoPath, rawFileContent, purityConfig) {
  const lines = content.split('\n')
  const functions = []
  const fileText = rawFileContent ?? content

  const funcStartRe =
    /(?:(?:export\s+)?(?:async\s+)?function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(|(\w+)\s*\([^)]*\)\s*\{)/

  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const match = line.match(funcStartRe)

    if (match) {
      const name = match[1] || match[2] || match[3] || `anonymous@${i + 1}`
      const startLine = i

      let depth = 0
      let foundStart = false
      let endLine = i

      for (let j = i; j < lines.length; j++) {
        for (const ch of lines[j]) {
          if (ch === '{') {
            depth++
            foundStart = true
          }
          if (ch === '}') depth--
          if (foundStart && depth === 0) {
            endLine = j
            break
          }
        }
        if (foundStart && depth === 0) break
        if (j - i > 500) {
          endLine = j
          break
        }
      }

      const funcLines = lines.slice(startLine, endLine + 1)
      const funcLength = funcLines.length
      const funcBodyText = funcLines.join('\n')

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

      if (maxNesting > 0) maxNesting -= 1

      const paramMatch = line.match(/\(([^)]*)\)/)
      const params =
        paramMatch && paramMatch[1].trim()
          ? paramMatch[1].split(',').filter((p) => p.trim() !== '').length
          : 0

      const usedPureThresholds = eligibleForPureThresholds(repoPath, funcBodyText, fileText, purityConfig)
      const activeThresholds = usedPureThresholds ? pureThresholds : defaultThresholds

      const violationsRaw = collectViolations(funcLength, maxNesting, branches, params, returns, activeThresholds)

      if (violationsRaw.length === 0) {
        i = endLine + 1
        continue
      }

      const violations = assignTiers(violationsRaw, activeThresholds, maxNesting, branches)
      const purityAxis = classifyPurityAxis(repoPath, funcBodyText, usedPureThresholds, purityConfig)
      const suggestedRemediation = remediationForAxis(purityAxis, purityConfig)

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
        thresholdProfile: usedPureThresholds ? 'pure' : 'default',
        purityAxis,
        suggestedRemediation,
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

  if (isVueSetup && lines.length > defaultThresholds.maxScriptSetupLines) {
    const scriptSetupViolation = [
      {
        rule: 'script-setup-length',
        value: lines.length,
        threshold: defaultThresholds.maxScriptSetupLines,
        tier: 2,
      },
    ]
    const scriptBodyText = content
    const purityAxis = classifyPurityAxis(repoPath, scriptBodyText, false, purityConfig)
    const suggestedRemediation = remediationForAxis(purityAxis, purityConfig)
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
      thresholdProfile: 'default',
      purityAxis,
      suggestedRemediation,
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

function renderMarkdownReport(filesWithFindings, totalScanned, puritySummaryLines) {
  const lines = []
  lines.push(...getAuditReportHeaderLines())
  lines.push('# Function Complexity Audit (Generated)')
  lines.push('')
  lines.push('This file is generated by `client/.scripts/function-complexity-audit.mjs`.')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(
    'Tier 1 (nesting, branches, length-when-branchy) drives score and file count; Tier 2 (params, returns, length-only, script-setup-length) is report-only. Route handlers and script-setup length-only are excluded.'
  )
  lines.push('')
  lines.push(
    '**Purity axis:** each finding includes `purityAxis` (pure / mixed / impure) and `suggestedRemediation`. Mixed and impure remediation prioritizes extracting deterministic logic to `utils` first. Relaxed thresholds apply only under `pathGlobsPure` when the function body has no Vue/side-effect signals (see `function-complexity-audit-config.json`). Do not move Vue orchestration into `utils` to game thresholds.'
  )
  lines.push('')
  if (puritySummaryLines?.length) {
    for (const s of puritySummaryLines) lines.push(s)
    lines.push('')
  }
  lines.push(`- Files scanned: **${totalScanned}**`)
  lines.push(`- Files with complex functions: **${filesWithFindings.length}**`)

  let totalFns = 0
  const violationCounts = {}
  const tier1Counts = {}
  const axisCounts = { pure: 0, mixed: 0, impure: 0 }
  for (const f of filesWithFindings) {
    totalFns += f.functions.length
    for (const fn of f.functions) {
      if (fn.purityAxis && axisCounts[fn.purityAxis] !== undefined) axisCounts[fn.purityAxis]++
      for (const v of fn.violations) {
        violationCounts[v.rule] = (violationCounts[v.rule] || 0) + 1
        if (v.tier === 1) tier1Counts[v.rule] = (tier1Counts[v.rule] || 0) + 1
      }
    }
  }
  lines.push(`- Complex functions found: **${totalFns}**`)
  lines.push(
    `- Violations: nesting=${violationCounts.nesting || 0}, branches=${violationCounts.branches || 0}, length=${violationCounts.length || 0}, params=${violationCounts.params || 0}, returns=${violationCounts.returns || 0}`
  )
  lines.push(
    `- Tier 1 violations (score): nesting=${tier1Counts.nesting || 0}, branches=${tier1Counts.branches || 0}, length=${tier1Counts.length || 0}`
  )
  lines.push(
    `- Findings by purityAxis: pure=${axisCounts.pure}, mixed=${axisCounts.mixed}, impure=${axisCounts.impure}`
  )
  lines.push('')

  lines.push('## Top hotspots')
  lines.push('')
  lines.push('| File | Priority | Score | Complex Fns | Worst Nesting | Worst Length |')
  lines.push('| --- | --- | ---: | ---: | ---: | ---: |')

  for (const f of filesWithFindings.slice(0, 30)) {
    const worstNesting = Math.max(...f.functions.map((fn) => fn.maxNesting), 0)
    const worstLength = Math.max(...f.functions.map((fn) => fn.length), 0)
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
      const vList = fn.violations.map((v) => `${v.rule}=${v.value}>${v.threshold}`).join(', ')
      const axis = fn.purityAxis || '?'
      const profile = fn.thresholdProfile || 'default'
      lines.push(
        `- **${fn.name}** (L${fn.startLine}-${fn.endLine}, ${fn.length} lines, **${axis}** / ${profile}): ${vList}`
      )
      lines.push(`  - *Remediation:* ${fn.suggestedRemediation || ''}`)
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
  try {
    config = JSON.parse(fs.readFileSync(paths.configPath, 'utf8'))
  } catch {
    /* defaults */
  }

  const thresholds = {
    maxNesting: config.thresholds?.maxNesting ?? DEFAULTS.maxNesting,
    maxBranches: config.thresholds?.maxBranches ?? DEFAULTS.maxBranches,
    maxFunctionLines: config.thresholds?.maxFunctionLines ?? DEFAULTS.maxFunctionLines,
    maxScriptSetupLines: config.thresholds?.maxScriptSetupLines ?? DEFAULTS.maxScriptSetupLines,
    maxParams: config.thresholds?.maxParams ?? DEFAULTS.maxParams,
    maxReturns: config.thresholds?.maxReturns ?? DEFAULTS.maxReturns,
  }

  const pureThresholds = {
    ...thresholds,
    maxNesting: config.pureThresholds?.maxNesting ?? thresholds.maxNesting + 1,
    maxBranches: config.pureThresholds?.maxBranches ?? 15,
    maxFunctionLines: config.pureThresholds?.maxFunctionLines ?? 110,
    maxScriptSetupLines: thresholds.maxScriptSetupLines,
    maxParams: config.pureThresholds?.maxParams ?? 6,
    maxReturns: config.pureThresholds?.maxReturns ?? 8,
  }

  const purityConfig = loadPurityAxisConfig(config)

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

    const functions = analyzeFile(content, isVueSetup, thresholds, pureThresholds, repoPath, rawContent, purityConfig)
    if (functions.length === 0) continue

    const fileScore = calculateScore(functions)
    if (fileScore === 0) continue

    const filePriority = assignPriority(fileScore, config)
    scanned.push({ repoPath, functions, score: fileScore, priority: filePriority })
  }

  scanned.sort((a, b) => b.score - a.score || a.repoPath.localeCompare(b.repoPath))

  const puritySummaryLines = [
    `- Default thresholds: nesting≤${thresholds.maxNesting}, branches≤${thresholds.maxBranches}, lines≤${thresholds.maxFunctionLines}, …`,
    `- Pure thresholds (utils path + clean body): nesting≤${pureThresholds.maxNesting}, branches≤${pureThresholds.maxBranches}, lines≤${pureThresholds.maxFunctionLines}, …`,
  ]

  const out = {
    generatedAt: new Date().toISOString(),
    totalScanned: allFiles.length,
    totalAllowed: allowedCount,
    tierModel: 'tier1',
    tier1Rules: ['nesting', 'branches', 'length-when-branchy'],
    thresholds,
    pureThresholds,
    purityAxis: {
      pathGlobsPure: purityConfig.pathGlobsPure,
      pathGlobsMixed: purityConfig.pathGlobsMixed,
      note: 'purityAxis and suggestedRemediation on each function; relaxed thresholds only when thresholdProfile is pure.',
    },
    ...(delta.enabled ? { deltaMode: true, baseRef: delta.baseRef } : {}),
    files: scanned,
  }

  const { outJson, outMd } = writeAuditReports(
    'function-complexity',
    out,
    renderMarkdownReport(scanned, allFiles.length, puritySummaryLines)
  )

  console.log(`Wrote:\n- ${toRepoPath(outJson, paths.projectRoot)}\n- ${toRepoPath(outMd, paths.projectRoot)}`)
  console.log(`Files with complex functions: ${scanned.length} (${allowedCount} allowlisted)`)
  process.exitCode = 0
}

main()
