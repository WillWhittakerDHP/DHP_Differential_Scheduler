import fs from 'node:fs'
import path from 'node:path'
import {
  getAuditReportHeaderLines,
  loadCentralAllowlist,
  listAuditFiles,
  resolveAuditPaths,
  writeAuditReports,
  toRepoPath as toRepoPathUtil,
  categorizeMatches,
  renderAllowedExceptionsSection,
  summarizeExceptions,
  checkConfigAllowlist,
  parseChangedOnlyFlag,
} from './shared-audit-utils.mjs'

/**
 * CSS Extraction Audit Script
 *
 * Goal: identify CSS that could be extracted to shared/theme files, inline styles
 * that should be classes, and style-block hygiene (empty blocks, unscoped, magic colors).
 *
 * Scope:
 * - Included: client/src (all .vue for style/template analysis), composables and utils .ts for css-in-ts
 * - Excluded: __tests__, test files, @core, @layouts (global exclusions)
 *
 * Output:
 * - client/.audit-reports/css-audit.json
 * - client/.audit-reports/css-audit.md
 *
 * Exception Handling:
 * - Inline: // @audit-allow:css:<ruleId> - <reason>
 * - Config: audit-global-config.json allowlists.css
 */

const AUDIT_TYPE = 'css'
const LARGE_STYLE_LINE_THRESHOLD = 80

const RULE_IDS = [
  'large-style-block',
  'empty-style-block',
  'unscoped-style',
  'inline-style-static',
  'inline-style-dynamic',
  'important-override',
  'deep-selector',
  'magic-color',
  'css-in-ts',
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

/**
 * Find all <style> blocks: [{ startLine, endLine, content, scoped }]
 */
function extractStyleBlocks(lines) {
  const blocks = []
  let i = 0
  while (i < lines.length) {
    const openMatch = lines[i].match(/<style([^>]*)>/)
    if (openMatch) {
      const openLine = i + 1
      const attrs = (openMatch[1] || '').toLowerCase()
      const scoped = /\bscoped\b/.test(attrs)
      let j = i + 1
      while (j < lines.length && !lines[j].includes('</style>')) j++
      const endLine = j < lines.length ? j + 1 : j
      const content = lines.slice(i + 1, j).join('\n')
      blocks.push({ startLine: openLine, endLine, content, scoped, openTagLine: lines[i].trim() })
      i = j + 1
    } else {
      i++
    }
  }
  return blocks
}

/**
 * Check if we're inside <template> (before first <script> or <style>).
 */
function getTemplateLineRange(lines) {
  let templateStart = -1
  let templateEnd = -1
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/<template\b/)) {
      templateStart = i + 1
      let j = i + 1
      while (j < lines.length && !lines[j].match(/<\/template>/)) j++
      templateEnd = j < lines.length ? j + 1 : j
      break
    }
  }
  return { templateStart, templateEnd }
}

/**
 * Scan a .vue file for CSS-related findings.
 * @param {string} contents
 * @param {string} _repoPath
 * @returns {{ counts: Record<string, number>, matches: Array<{ ruleId: string, lineNumber: number, line: string }> }}
 */
function scanVueFile(contents, _repoPath) {
  const lines = splitLines(contents)
  const counts = Object.fromEntries(RULE_IDS.map((id) => [id, 0]))
  const matches = []

  const styleBlocks = extractStyleBlocks(lines)
  for (const block of styleBlocks) {
    const lineCount = block.content.trim() ? block.content.split('\n').length : 0

    if (lineCount > LARGE_STYLE_LINE_THRESHOLD) {
      counts['large-style-block'] += 1
      matches.push({
        ruleId: 'large-style-block',
        lineNumber: block.startLine,
        line: `<style> block has ${lineCount} lines; consider extracting to sidecar .scss`,
      })
    }
    if (lineCount === 0) {
      counts['empty-style-block'] += 1
      matches.push({
        ruleId: 'empty-style-block',
        lineNumber: block.startLine,
        line: '<style> block is empty; remove or add styles',
      })
    }
    if (!block.scoped) {
      counts['unscoped-style'] += 1
      matches.push({
        ruleId: 'unscoped-style',
        lineNumber: block.startLine,
        line: block.openTagLine,
      })
    }

    const styleLines = block.content.split('\n')
    for (let s = 0; s < styleLines.length; s++) {
      const line = styleLines[s]
      const lineNum = block.startLine + s + 1
      if (/\b!important\b/.test(line)) {
        counts['important-override'] += 1
        matches.push({ ruleId: 'important-override', lineNumber: lineNum, line: line.trim() })
      }
      if (/:deep\s*\(/.test(line)) {
        counts['deep-selector'] += 1
        matches.push({ ruleId: 'deep-selector', lineNumber: lineNum, line: line.trim() })
      }
      if (
        /#([0-9a-fA-F]{3,8})\b|rgb\s*\(|rgba\s*\(/.test(line) &&
        !/var\s*\(\s*--v-theme-/.test(line) &&
        !/var\s*\(\s*--[\w-]+/.test(line)
      ) {
        counts['magic-color'] += 1
        matches.push({ ruleId: 'magic-color', lineNumber: lineNum, line: line.trim() })
      }
    }
  }

  const { templateStart, templateEnd } = getTemplateLineRange(lines)
  if (templateStart > 0 && templateEnd > 0) {
    for (let i = templateStart - 1; i < templateEnd; i++) {
      const line = lines[i]
      if (/\bstyle\s*=\s*["']/.test(line)) {
        counts['inline-style-static'] += 1
        matches.push({ ruleId: 'inline-style-static', lineNumber: i + 1, line: line.trim() })
      }
      if (/:style\s*=|v-bind:style\s*=/.test(line)) {
        counts['inline-style-dynamic'] += 1
        matches.push({ ruleId: 'inline-style-dynamic', lineNumber: i + 1, line: line.trim() })
      }
    }
  }

  return { counts, matches }
}

/**
 * Scan a .ts file (composables or utils) for style objects / CSS-in-JS.
 * @param {string} contents
 * @param {number} lineOffset - 0 for single-file
 * @returns {Array<{ ruleId: string, lineNumber: number, line: string }>}
 */
function scanTsForCssInTs(contents, lineOffset = 0) {
  const lines = splitLines(contents)
  const matches = []
  const reStyleLike =
    /\{\s*(backgroundColor|color|borderColor|style:|padding|margin)\s*[:=]|['"]\s*:\s*['"]\s*[#rgb]/
  for (let i = 0; i < lines.length; i++) {
    if (reStyleLike.test(lines[i])) {
      matches.push({
        ruleId: 'css-in-ts',
        lineNumber: lineOffset + i + 1,
        line: lines[i].trim(),
      })
    }
  }
  return matches
}

function score(counts) {
  return (
    (counts['large-style-block'] || 0) * 8 +
    (counts['empty-style-block'] || 0) * 2 +
    (counts['unscoped-style'] || 0) * 6 +
    (counts['inline-style-static'] || 0) * 3 +
    (counts['inline-style-dynamic'] || 0) * 1 +
    (counts['important-override'] || 0) * 4 +
    (counts['deep-selector'] || 0) * 1 +
    (counts['magic-color'] || 0) * 2 +
    (counts['css-in-ts'] || 0) * 5
  )
}

function assignPriority(fileScore) {
  if (fileScore >= 20) return 'P0'
  if (fileScore >= 10) return 'P1'
  return 'P2'
}

function compareFiles(a, b) {
  if (b.score !== a.score) return b.score - a.score
  return a.repoPath.localeCompare(b.repoPath)
}

function recalculateCounts(matches) {
  const counts = Object.fromEntries(RULE_IDS.map((id) => [id, 0]))
  for (const m of matches) {
    if (counts[m.ruleId] !== undefined) counts[m.ruleId]++
  }
  return counts
}

function renderMarkdownReport(data) {
  const { files, exceptionSummary } = data
  const lines = []
  lines.push(...getAuditReportHeaderLines())
  lines.push('# CSS Extraction Audit (Generated)')
  lines.push('')
  lines.push('This file is generated by `client/.scripts/css-audit.mjs`.')
  lines.push('')
  lines.push('Scope:')
  lines.push('- Included: `client/src/**/*.vue` (style and template), `client/src/composables/**/*.ts`, `client/src/utils/**/*.ts` (css-in-ts)')
  lines.push('- Excluded: global exclusions (tests, @core, @layouts, etc.)')
  lines.push('')
  lines.push('Exception handling:')
  lines.push('- Inline: `// @audit-allow:css:<ruleId> - <reason>`')
  lines.push('- Config: `.audit-reports/audit-global-config.json` → allowlists.css')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Total files scanned: **${data.totalScanned}**`)
  lines.push(`- **Requiring review: ${exceptionSummary.totalRequiresReview}**`)
  lines.push(
    `- Allowed (with justification): ${exceptionSummary.totalAllowed} (inline: ${exceptionSummary.bySource.inline}, pattern: ${exceptionSummary.bySource.pattern}, specific: ${exceptionSummary.bySource.specific})`
  )
  lines.push('')
  lines.push('## Top hotspots (by heuristic score, excluding allowed)')
  lines.push('')
  lines.push(
    '| File | score | priority | large-style | empty | unscoped | inline-static | inline-dynamic | !important | :deep | magic-color | css-in-ts |'
  )
  lines.push(
    '| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |'
  )

  const hotspots = files.filter((f) => f.score > 0).slice(0, 30)
  for (const f of hotspots) {
    const c = f.counts || {}
    lines.push(
      `| \`${f.repoPath}\` | ${f.score} | ${f.priority || 'P2'} | ${c['large-style-block'] || 0} | ${c['empty-style-block'] || 0} | ${c['unscoped-style'] || 0} | ${c['inline-style-static'] || 0} | ${c['inline-style-dynamic'] || 0} | ${c['important-override'] || 0} | ${c['deep-selector'] || 0} | ${c['magic-color'] || 0} | ${c['css-in-ts'] || 0} |`
    )
  }

  const filesWithAllowed = files.filter((f) => f.allowed.length > 0).map((f) => ({ repoPath: f.repoPath, allowed: f.allowed }))
  lines.push('')
  lines.push(...renderAllowedExceptionsSection(filesWithAllowed))

  lines.push('')
  lines.push('## Per-file matches requiring review (line-level)')
  lines.push('')
  lines.push('Legend: `ruleId@lineNumber: line`')
  lines.push('')

  const filesWithReview = files.filter((f) => f.requiresReview.length > 0)
  for (const f of filesWithReview) {
    lines.push(`### \`${f.repoPath}\``)
    lines.push('')
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
  const paths = resolveAuditPaths(AUDIT_TYPE)
  const configAllowlist = loadCentralAllowlist(AUDIT_TYPE)
  const delta = parseChangedOnlyFlag(process.argv, paths.projectRoot)

  const allCssFiles = listAuditFiles(AUDIT_TYPE, [paths.clientSrc])
  const composablesDir = path.join(paths.clientSrc, 'composables')
  const utilsDir = path.join(paths.clientSrc, 'utils')
  const vueFiles = allCssFiles.filter(f => f.endsWith('.vue'))
  const tsFilesForCss = allCssFiles.filter(
    f => f.endsWith('.ts') && (f.startsWith(composablesDir + path.sep) || f.startsWith(utilsDir + path.sep))
  )

  const scanned = []

  for (const abs of vueFiles) {
    const repoPath = toRepoPath(abs, paths.projectRoot)
    if (delta.enabled && !delta.changedFiles.has(repoPath)) continue
    const contents = fs.readFileSync(abs, 'utf8')
    const { counts, matches } = scanVueFile(contents, repoPath)

    const { allowed, requiresReview } = categorizeMatches(
      matches,
      repoPath,
      contents,
      AUDIT_TYPE,
      configAllowlist
    )

    const reviewCounts = recalculateCounts(requiresReview)
    const fileScore = score(reviewCounts)
    scanned.push({
      id: toStableId(repoPath),
      repoPath,
      absPath: abs,
      counts,
      matches,
      allowed,
      requiresReview,
      score: fileScore,
      priority: assignPriority(fileScore),
    })
  }

  for (const abs of tsFilesForCss) {
    const repoPath = toRepoPath(abs, paths.projectRoot)
    if (delta.enabled && !delta.changedFiles.has(repoPath)) continue
    const contents = fs.readFileSync(abs, 'utf8')
    const matches = scanTsForCssInTs(contents, 0)
    if (matches.length === 0) continue

    const counts = Object.fromEntries(RULE_IDS.map((id) => [id, 0]))
    for (const m of matches) counts[m.ruleId] = (counts[m.ruleId] || 0) + 1

    const { allowed, requiresReview } = categorizeMatches(
      matches,
      repoPath,
      contents,
      AUDIT_TYPE,
      configAllowlist
    )

    const reviewCounts = recalculateCounts(requiresReview)
    const fileScore = score(reviewCounts)
    scanned.push({
      id: toStableId(repoPath),
      repoPath,
      absPath: abs,
      counts,
      matches,
      allowed,
      requiresReview,
      score: fileScore,
      priority: assignPriority(fileScore),
    })
  }

  scanned.sort(compareFiles)

  const exceptionSummary = summarizeExceptions(scanned)
  const filesWithFindings = scanned.filter((f) => f.score > 0 || f.requiresReview.length > 0)

  const out = {
    generatedAt: new Date().toISOString(),
    scope: {
      included: ['client/src/**/*.vue', 'client/src/composables/**/*.ts', 'client/src/utils/**/*.ts'],
      excluded: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*', 'client/src/@core/**', 'client/src/@layouts/**'],
    },
    totalScanned: scanned.length,
    ...(delta.enabled ? { deltaMode: true, baseRef: delta.baseRef } : {}),
    exceptionSummary,
    ruleset: RULE_IDS.map((id) => ({
      ruleId: id,
      label: id.replace(/-/g, ' '),
      severity: id === 'unscoped-style' || id === 'large-style-block' ? 'high' : 'medium',
    })),
    files: filesWithFindings,
  }

  const { outJson, outMd } = writeAuditReports(AUDIT_TYPE, out, renderMarkdownReport(out))

  console.log(`Wrote:\n- ${toRepoPath(outJson, paths.projectRoot)}\n- ${toRepoPath(outMd, paths.projectRoot)}`)
  console.log(`Files scanned: ${scanned.length} (Vue: ${vueFiles.length}, TS for css-in-ts: ${tsFilesForCss.length})`)
  console.log(`Findings: ${exceptionSummary.totalRequiresReview} requiring review, ${exceptionSummary.totalAllowed} allowed`)
  process.exitCode = 0
}

main()
