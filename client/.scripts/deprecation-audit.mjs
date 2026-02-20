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

/**
 * Deprecation & Legacy Accommodation Audit Script (expanded)
 *
 * Goal: Find everything in the codebase that is deprecated, accommodating legacy behavior,
 * or papering over problems with lazy defaults.
 *
 * TWO SECTIONS in one audit:
 *
 * Section 1: Annotated Deprecations (comment-based)
 *   - @deprecated JSDoc tags
 *   - // Deprecated comments
 *   - (deprecated - use X) inline notes
 *   - // LEGACY: markers
 *   - "kept for migration/backward compatibility" phrases
 *
 * Section 2: Runtime Legacy Accommodation (code patterns)
 *   - Keywords in runtime code: legacy, compat, fallback, backward, workaround, hack, shim, polyfill
 *   - Unhelpful defaults: || '', || [], || 0, || {}, ?? '', ?? []
 *   - Default function parameters with string literals
 *   - Optional chaining with fallback values
 *
 * Exception Handling:
 *   - Inline: // @audit-allow:deprecation:<ruleId> - <reason>
 *   - Config: .audit-reports/deprecation-audit-config.json
 *
 * Scope:
 *   - Included: client/src (ts, js, vue) and server/src (ts, mjs)
 *   - Excluded: __tests__, test files, spec files, @core, @layouts, migrations
 *
 * Output:
 *   - client/.audit-reports/deprecation-audit.json
 *   - client/.audit-reports/deprecation-audit.md
 */

const AUDIT_TYPE = 'deprecation'

// ─── Section 1: Annotated Deprecation rules ───
const ANNOTATION_RULES = [
  { id: 'jsdoc-deprecated', label: 'JSDoc @deprecated', severity: 'warning',
    test: (l) => /@deprecated\b/i.test(l) },
  { id: 'comment-deprecated', label: 'Deprecated comment', severity: 'warning',
    test: (l) => /\/\/\s*(?:deprecated|DEPRECATED)\b/i.test(l) },
  { id: 'paren-deprecated', label: 'Parenthetical deprecation note', severity: 'warning',
    test: (l) => /\(deprecated[^)]*\)/i.test(l) },
  { id: 'block-deprecated', label: 'Block comment deprecation', severity: 'warning',
    test: (l) => /\*\s*(?:deprecated|DEPRECATED)\b/i.test(l) },
  { id: 'legacy-marker', label: 'Legacy marker comment', severity: 'info',
    test: (l) => /\/\/\s*(?:legacy|LEGACY)\s*[-:]/i.test(l) },
  { id: 'compat-marker', label: 'Migration compatibility marker', severity: 'info',
    test: (l) => /(?:kept for|for)\s+(?:migration|backward)\s+compatibility/i.test(l) },
]

// ─── Section 2: Runtime Legacy Accommodation rules ───
const LEGACY_RUNTIME_RULES = [
  // Keywords in runtime code (skip comments)
  { id: 'legacy-keyword', label: 'Legacy keyword in runtime code', severity: 'warning',
    test: (l) => {
      const trimmed = l.trim()
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return false
      return /\b(legacy|compat|backward|workaround|shim|polyfill)\b/i.test(l)
    }},
  { id: 'fallback-keyword', label: 'Fallback keyword in runtime code', severity: 'info',
    test: (l) => {
      const trimmed = l.trim()
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return false
      // Avoid matching variable names that happen to contain 'fallback' as substring
      return /\bfallback\b/i.test(l)
    }},
  // Unhelpful defaults - silent empty values that mask errors
  { id: 'unhelpful-default-or', label: 'Unhelpful default (|| empty)', severity: 'warning',
    test: (l) => /\|\|\s*['"]['"]/.test(l) || /\|\|\s*\[\s*\]/.test(l) || /\|\|\s*\{\s*\}/.test(l) },
  { id: 'unhelpful-default-nullish', label: 'Unhelpful default (?? empty)', severity: 'warning',
    test: (l) => /\?\?\s*['"]['"]/.test(l) || /\?\?\s*\[\s*\]/.test(l) || /\?\?\s*\{\s*\}/.test(l) },
  // Default function parameters with string/array/object literals
  { id: 'default-param', label: 'Default function parameter', severity: 'info',
    test: (l) => /(?:function\s+\w+|=>)\s*\([^)]*=\s*['"`]/.test(l) || /\(\s*\w+\s*=\s*['"`]/.test(l) },
  // Optional chaining with fallback values
  { id: 'chaining-fallback', label: 'Optional chaining with default', severity: 'info',
    test: (l) => /\?\.\w+\s*(?:\?\?|\|\|)\s*['"`\d]/.test(l) },
]

const ALL_RULES = [...ANNOTATION_RULES, ...LEGACY_RUNTIME_RULES]

/** Optional description and recommendedFix per rule for emitted ruleset (JSON + optional MD). */
const DEPRECATION_RULE_META = {
  'jsdoc-deprecated': { description: 'JSDoc @deprecated tag present.', recommendedFix: 'Document replacement or remove when no longer used; add migration note if needed.' },
  'comment-deprecated': { description: 'Line comment containing "deprecated" or "DEPRECATED".', recommendedFix: 'Add replacement or remove; use @deprecated JSDoc where applicable.' },
  'paren-deprecated': { description: 'Parenthetical (deprecated ...) note in code.', recommendedFix: 'Replace with supported API or document migration path.' },
  'block-deprecated': { description: 'Block comment containing deprecation.', recommendedFix: 'Document replacement and timeline for removal.' },
  'legacy-marker': { description: '// LEGACY: or // legacy comment.', recommendedFix: 'Plan removal or document why legacy path is still needed.' },
  'compat-marker': { description: '"kept for migration/backward compatibility" phrase.', recommendedFix: 'Add ticket or timeline to remove when migration is complete.' },
  'legacy-keyword': { description: 'Runtime code uses legacy/compat/backward/workaround/shim/polyfill.', recommendedFix: 'Refactor to supported path or document and scope usage.' },
  'fallback-keyword': { description: 'Runtime code uses "fallback" keyword.', recommendedFix: 'Ensure fallback is intentional and logged if it masks errors.' },
  'unhelpful-default-or': { description: '|| \'\', || [], || {} used as default.', recommendedFix: 'Prefer explicit handling or ?? for null/undefined; avoid masking errors.' },
  'unhelpful-default-nullish': { description: '?? \'\', ?? [], ?? {} used as default.', recommendedFix: 'Use when intentional; avoid silencing null/undefined from APIs.' },
  'default-param': { description: 'Default function parameter with string/array/object literal.', recommendedFix: 'Ensure default is intentional and documented.' },
  'chaining-fallback': { description: 'Optional chaining (?.) with ?? or || default.', recommendedFix: 'Ensure default is correct and does not hide missing data.' },
}

const REPLACEMENT_PATTERNS = [
  /use\s+(\w+)\s+instead/i,
  /replaced?\s+(?:by|with)\s+(\w+)/i,
  /deprecated[,\s]+use\s+(\w+)/i,
  /\(deprecated[^)]*use\s+(\w+)[^)]*\)/i,
  /migrate\s+to\s+(\w+)/i,
  /prefer\s+(\w+)/i,
]

function toRepoPath(absPath, projectRoot) {
  return toRepoPathUtil(absPath, projectRoot)
}

function toStableId(repoPath) { return repoPath.replaceAll('/', '__') }

function extractVueScriptBlocks(vueContent) {
  const blocks = []
  const re = /<script\b[^>]*>([\s\S]*?)<\/script>/gi
  for (const match of vueContent.matchAll(re)) blocks.push(match[1] || '')
  return blocks
}

function extractReplacement(line) {
  for (const pattern of REPLACEMENT_PATTERNS) {
    const match = line.match(pattern)
    if (match && match[1]) return match[1]
  }
  return null
}

function scanFile(filePath, projectRoot) {
  const _repoPath = toRepoPath(filePath, projectRoot)
  let content = fs.readFileSync(filePath, 'utf-8')

  if (filePath.endsWith('.vue')) {
    const scriptBlocks = extractVueScriptBlocks(content)
    if (scriptBlocks.length === 0) return { matches: [], content }
    content = scriptBlocks.join('\n')
  }

  const lines = content.split('\n')
  const matches = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNumber = i + 1
    const trimmed = line.trim()
    if (trimmed === '') continue

    let _matched = false
    for (const rule of ALL_RULES) {
      if (rule.test(line)) {
        const replacement = ANNOTATION_RULES.includes(rule) ? extractReplacement(line) : null
        matches.push({
          ruleId: rule.id,
          lineNumber,
          line: trimmed.length > 120 ? trimmed.substring(0, 120) + '...' : trimmed,
          section: ANNOTATION_RULES.includes(rule) ? 'annotation' : 'legacy-accommodation',
          ...(replacement ? { replacement } : {}),
        })
        _matched = true
        break // One match per line per section to avoid duplicates
      }
    }
  }

  return { matches, content }
}

const SEVERITY_SCORE = { warning: 2, info: 1, error: 5 }

function calculateScore(requiresReview) {
  return requiresReview.reduce((sum, m) => {
    const rule = ALL_RULES.find(r => r.id === m.ruleId)
    return sum + (SEVERITY_SCORE[rule?.severity] || 1)
  }, 0)
}

function assignPriority(score, config) {
  const p0Min = Number(config?.priorities?.p0MinSeverityScore ?? 10)
  const p1Min = Number(config?.priorities?.p1MinSeverityScore ?? 4)
  if (score >= p0Min) return 'P0'
  if (score >= p1Min) return 'P1'
  return 'P2'
}

function renderMarkdownReport(filesWithFindings, exceptionSummary) {
  const lines = []
  lines.push(...getAuditReportHeaderLines())
  lines.push('# Deprecation & Legacy Accommodation Audit (Generated)')
  lines.push('')
  lines.push('This file is generated by `client/.scripts/deprecation-audit.mjs`.')
  lines.push('')
  lines.push('Scope: `client/src` (ts, js, vue) and `server/src` (ts, mjs)')
  lines.push('')
  lines.push('## Purpose')
  lines.push('')
  lines.push('Identifies deprecated code and runtime legacy accommodation patterns:')
  lines.push('- **Annotated Deprecations**: `@deprecated`, `// Deprecated`, `(deprecated)`, `// LEGACY:`, compat markers')
  lines.push('- **Runtime Legacy Accommodation**: `legacy`/`compat`/`fallback` keywords in code, `|| \'\'`, `?? \'\'`, default params')
  lines.push('')

  // Count by section
  let annotationCount = 0
  let legacyCount = 0
  for (const f of filesWithFindings) {
    for (const m of f.requiresReview) {
      if (m.section === 'annotation') annotationCount++
      else legacyCount++
    }
  }

  lines.push('## Summary')
  lines.push('')
  lines.push(`- Files with findings: **${filesWithFindings.length}**`)
  lines.push(`- Requiring review: **${exceptionSummary.totalRequiresReview}**`)
  lines.push(`- Allowed (with justification): ${exceptionSummary.totalAllowed}`)
  lines.push(`- Annotated deprecations: **${annotationCount}**`)
  lines.push(`- Runtime legacy accommodation: **${legacyCount}**`)
  lines.push('')

  lines.push('## Rules')
  lines.push('')
  for (const r of ALL_RULES) {
    const meta = DEPRECATION_RULE_META[r.id]
    lines.push(`- **${r.id}** (${r.severity}): ${r.label}`)
    if (meta?.description) lines.push(`  - What: ${meta.description}`)
    if (meta?.recommendedFix) lines.push(`  - Fix: ${meta.recommendedFix}`)
    lines.push('')
  }

  lines.push('## Top hotspots (by score)')
  lines.push('')
  lines.push('| File | Priority | Score | Annotations | Legacy/Compat |')
  lines.push('| --- | --- | ---: | ---: | ---: |')

  const hotspots = filesWithFindings.slice(0, 30)
  for (const f of hotspots) {
    const ann = f.requiresReview.filter(m => m.section === 'annotation').length
    const leg = f.requiresReview.filter(m => m.section === 'legacy-accommodation').length
    lines.push(`| \`${f.repoPath}\` | ${f.priority} | ${f.score} | ${ann} | ${leg} |`)
  }

  if (filesWithFindings.length > 30) {
    lines.push('')
    lines.push(`*...and ${filesWithFindings.length - 30} more files. See JSON report for details.*`)
  }

  lines.push('')
  lines.push('## Per-file findings')
  lines.push('')

  for (const f of filesWithFindings.slice(0, 50)) {
    lines.push(`### \`${f.repoPath}\` [${f.priority}] (score: ${f.score})`)
    lines.push('')
    const shown = f.requiresReview.slice(0, 40)
    lines.push('```')
    for (const m of shown) {
      const tag = m.section === 'annotation' ? '[DEPR]' : '[LEGACY]'
      lines.push(`${tag} ${m.ruleId}@${m.lineNumber}: ${m.line}`)
    }
    if (f.requiresReview.length > 40) {
      lines.push(`... (${f.requiresReview.length - 40} more)`)
    }
    lines.push('```')
    lines.push('')
  }

  lines.push('## Notes')
  lines.push('')
  lines.push('- **[DEPR]**: Annotated deprecation markers in comments')
  lines.push('- **[LEGACY]**: Runtime legacy accommodation patterns in code')
  lines.push('- **P0**: High density (cleanup soon)')
  lines.push('- **P1**: Moderate (schedule cleanup)')
  lines.push('- **P2**: Low priority (cleanup when convenient)')
  lines.push('')

  return lines.join('\n')
}

function main() {
  const paths = resolveAuditPaths(AUDIT_TYPE)
  const configAllowlist = loadCentralAllowlist(AUDIT_TYPE)
  const delta = parseChangedOnlyFlag(process.argv, paths.projectRoot)

  let priorityConfig = {}
  try {
    const configRaw = fs.readFileSync(paths.configPath, 'utf8')
    priorityConfig = JSON.parse(configRaw)
  } catch { /* defaults */ }

  const allFiles = listAuditFiles(AUDIT_TYPE, [paths.clientSrc, paths.serverSrc])
  const scanned = []

  for (const file of allFiles) {
    const repoPath = toRepoPath(file, paths.projectRoot)
    if (delta.enabled && !delta.changedFiles.has(repoPath)) continue

    const { matches, content } = scanFile(file, paths.projectRoot)
    if (matches.length === 0) continue

    const { allowed, requiresReview } = categorizeMatches(matches, repoPath, content, AUDIT_TYPE, configAllowlist)
    const fileScore = calculateScore(requiresReview)
    const filePriority = assignPriority(fileScore, priorityConfig)

    scanned.push({
      id: toStableId(repoPath),
      repoPath,
      allowed,
      requiresReview,
      score: fileScore,
      priority: filePriority,
    })
  }

  scanned.sort((a, b) => b.score - a.score || a.repoPath.localeCompare(b.repoPath))

  const exceptionSummary = summarizeExceptions(scanned)
  const filesWithFindings = scanned.filter(f => f.score > 0 || f.requiresReview.length > 0)

  const ruleset = ALL_RULES.map((r) => ({
    ruleId: r.id,
    label: r.label,
    severity: r.severity,
    description: DEPRECATION_RULE_META[r.id]?.description ?? '',
    recommendedFix: DEPRECATION_RULE_META[r.id]?.recommendedFix ?? '',
  }))
  const output = {
    generatedAt: new Date().toISOString(),
    check: 'Deprecation',
    totalScanned: allFiles.length,
    ...(delta.enabled ? { deltaMode: true, baseRef: delta.baseRef } : {}),
    exceptionSummary,
    files: filesWithFindings,
    ruleset,
  }

  const { outJson, outMd } = writeAuditReports(AUDIT_TYPE, output, renderMarkdownReport(filesWithFindings, exceptionSummary))

  console.log(`Wrote:\n- ${toRepoPath(outJson, paths.projectRoot)}\n- ${toRepoPath(outMd, paths.projectRoot)}`)
  console.log(`Files scanned: ${allFiles.length}, Findings: ${exceptionSummary.totalRequiresReview} requiring review, ${exceptionSummary.totalAllowed} allowed`)
  process.exitCode = 0
}

main()
