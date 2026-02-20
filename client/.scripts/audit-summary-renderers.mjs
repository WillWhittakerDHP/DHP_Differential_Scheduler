/**
 * Registry of summary renderers: auditType -> (data, context) => markdown body.
 * The runner prepends getAuditReportHeaderLines(); renderers return body only.
 * context = { projectRoot, auditJsonPath, toRepoPath }
 */

function genFrom(ctx) {
  return `Generated from \`${ctx.toRepoPath(ctx.auditJsonPath)}\`.`
}

export const SUMMARY_RENDERERS = {
  'api-contract'(data, ctx) {
    const lines = []
    const findings = Array.isArray(data.findings) ? data.findings : []
    lines.push('# API Contract Audit Summary (Generated)')
    lines.push('')
    lines.push(genFrom(ctx))
    lines.push('')
    lines.push(`- Client endpoints: **${data.clientEndpoints ?? 0}**`)
    lines.push(`- Server endpoints: **${data.serverEndpoints ?? 0}**`)
    lines.push(`- Shared types: **${(data.sharedTypes || []).length}**`)
    lines.push(`- Findings: **${findings.length}**`)
    lines.push('')
    const byType = {}
    for (const f of findings) {
      byType[f.type] = (byType[f.type] || 0) + 1
    }
    const sorted = Object.entries(byType).sort((a, b) => b[1] - a[1])
    lines.push('## Findings by type')
    lines.push('')
    lines.push('| Category | Count |')
    lines.push('| --- | ---: |')
    for (const [type, count] of sorted) {
      lines.push(`| ${type} | ${count} |`)
    }
    lines.push('')
    return lines.join('\n')
  },

  'api-versioning'(data, ctx) {
    const lines = []
    lines.push('# API Versioning Audit Summary (Generated)')
    lines.push('')
    lines.push(genFrom(ctx))
    lines.push('')
    if (data.error) {
      lines.push(`**Error:** ${data.error}`)
      lines.push('')
      return lines.join('\n')
    }
    const s = data.summary || {}
    lines.push(`- Breaking: **${s.breaking ?? 0}**`)
    lines.push(`- Non-breaking: **${s.nonBreaking ?? 0}**`)
    lines.push(`- Unchanged: **${s.unchanged ?? 0}**`)
    lines.push('')
    const breaking = Array.isArray(data.breakingChanges) ? data.breakingChanges : []
    if (breaking.length > 0) {
      lines.push('## Breaking changes')
      lines.push('')
      for (const b of breaking) {
        lines.push(`- \`${b.endpoint}\` (${b.type || 'change'})`)
      }
      lines.push('')
    }
    return lines.join('\n')
  },

  'bundle-size-budget'(data, ctx) {
    const lines = []
    lines.push('# Bundle Size Budget Audit Summary (Generated)')
    lines.push('')
    lines.push(genFrom(ctx))
    lines.push('')
    if (data.error) {
      lines.push(`**Error:** ${data.error}`)
      lines.push('')
      return lines.join('\n')
    }
    const totals = data.totals || {}
    const results = data.budgetResults || {}
    const violations = Object.values(results).filter(b => !b.pass).length
    lines.push(`- Chunks: **${data.totalScanned ?? 0}**`)
    lines.push(`- Total JS (gzip): **${(totals.totalJsKb ?? 0).toFixed(1)} KB**`)
    lines.push(`- Total CSS (gzip): **${(totals.totalCssKb ?? 0).toFixed(1)} KB**`)
    lines.push(`- Budget violations: **${violations}**`)
    lines.push('')
    lines.push('| Budget | Limit (KB) | Actual (KB) | Pass |')
    lines.push('| --- | ---: | ---: | --- |')
    for (const [key, b] of Object.entries(results)) {
      lines.push(`| ${key} | ${b.budget} | ${(b.actual ?? 0).toFixed(1)} | ${b.pass ? 'Yes' : 'No'} |`)
    }
    lines.push('')
    return lines.join('\n')
  },

  'constants-consolidation'(data, ctx) {
    const lines = []
    const groups = Array.isArray(data.consolidationGroups) ? data.consolidationGroups : []
    const summary = data.exceptionSummary || {}
    lines.push('# Constants Consolidation Audit Summary (Generated)')
    lines.push('')
    lines.push(genFrom(ctx))
    lines.push('')
    lines.push(`- Constants files: **${data.totalConstantsFiles ?? 0}**`)
    lines.push(`- Exports scanned: **${data.totalExportsScanned ?? 0}**`)
    lines.push(`- Consolidation groups: **${groups.length}**`)
    lines.push(`- Requiring review: **${summary.totalRequiresReview ?? 0}** | Allowed: **${summary.totalAllowed ?? 0}**`)
    lines.push('')
    const sorted = groups.slice().sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    const MAX = 30
    lines.push(`## Top ${Math.min(sorted.length, MAX)} Consolidation Groups`)
    lines.push('')
    lines.push('| Classification | Priority | Score | Description | Locations |')
    lines.push('| --- | --- | ---: | --- | ---: |')
    for (const g of sorted.slice(0, MAX)) {
      const locs = Array.isArray(g.locations) ? g.locations.length : 0
      lines.push(`| ${g.classification ?? ''} | ${g.priority ?? 'P2'} | ${g.score ?? 0} | ${(g.suggestion || '').slice(0, 40)}... | ${locs} |`)
    }
    if (sorted.length > MAX) {
      lines.push('')
      lines.push(`*...and ${sorted.length - MAX} more. See full report.*`)
    }
    lines.push('')
    lines.push('## Notes')
    lines.push('')
    lines.push('- **HOIST**: Same value in multiple files → single constant. **TEMPLATE**: Structural duplication. **ENUM**: Inline literals → enum/const.')
    lines.push('- **P0/P1/P2**: Priority from config. See full report: `client/.audit-reports/constants-consolidation-audit.md`.')
    lines.push('')
    return lines.join('\n')
  },

  'component-logic'(data, ctx) {
    const files = Array.isArray(data.files) ? data.files : []
    const lines = []
    const tier1Keys = ['dom', 'watch', 'watchEffect', 'async', 'await', 'reduce', 'map', 'inlineConfig', 'console', 'alert']
    function score(c) { return tier1Keys.reduce((sum, k) => sum + (c[k] || 0), 0) }
    lines.push('# Component Logic Audit Summary (Generated)')
    lines.push('')
    lines.push(genFrom(ctx))
    lines.push('')
    const MAX_ROWS = 30
    lines.push(`## Top ${Math.min(files.length, MAX_ROWS)} files (Tier 1 score)`)
    lines.push('')
    lines.push('| File | Priority | score | watch | async | await | map | reduce | DOM | inline :config | console | alert |')
    lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')
    for (const f of files.slice(0, MAX_ROWS)) {
      const c = f.counts || {}
      lines.push(`| \`${f.repoPath}\` | ${f.priority || 'P2'} | ${score(c)} | ${c.watch || 0} | ${c.async || 0} | ${c.await || 0} | ${c.map || 0} | ${c.reduce || 0} | ${c.dom || 0} | ${c.inlineConfig || 0} | ${c.console || 0} | ${c.alert || 0} |`)
    }
    if (files.length > MAX_ROWS) {
      lines.push('')
      lines.push(`*...and ${files.length - MAX_ROWS} more files. See full report for details.*`)
    }
    lines.push('')
    lines.push('## Notes')
    lines.push('')
    lines.push('- This is a *signal* index. Use the full report: `client/.audit-reports/component-logic-audit.md`.')
    lines.push('')
    return lines.join('\n')
  },

  'composables-logic'(data, ctx) {
    const files = Array.isArray(data.files) ? data.files : []
    const lines = []
    const keys = ['dom', 'vueQuery', 'watch', 'watchEffect', 'async', 'await', 'reduce', 'map', 'computed', 'ref', 'console']
    function score(c) { return keys.reduce((sum, k) => sum + (c[k] || 0), 0) }
    lines.push('# Composables Logic Audit Summary (Generated)')
    lines.push('')
    lines.push(genFrom(ctx))
    lines.push('')
    const MAX_ROWS = 30
    lines.push(`## Top ${Math.min(files.length, MAX_ROWS)} composable files`)
    lines.push('')
    lines.push('| File | Priority | score | exports(use*) | vue-query | watch | computed | ref | async | await | DOM | console |')
    lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')
    for (const f of files.slice(0, MAX_ROWS)) {
      const c = f.counts || {}
      const watch = (c.watch || 0) + (c.watchEffect || 0)
      const exports = Array.isArray(f.exportUseFunctions) ? f.exportUseFunctions.length : 0
      lines.push(`| \`${f.repoPath}\` | ${f.priority || 'P2'} | ${score(c)} | ${exports} | ${c.vueQuery || 0} | ${watch} | ${c.computed || 0} | ${c.ref || 0} | ${c.async || 0} | ${c.await || 0} | ${c.dom || 0} | ${c.console || 0} |`)
    }
    if (files.length > MAX_ROWS) {
      lines.push('')
      lines.push(`*...and ${files.length - MAX_ROWS} more. See full report.*`)
    }
    lines.push('')
    lines.push('## Notes')
    lines.push('')
    lines.push('- This is a *signal* index. Use the full report: `client/.audit-reports/composables-logic-audit.md`.')
    lines.push('')
    return lines.join('\n')
  },

  'coverage-risk-crossref'(data, ctx) {
    const lines = []
    lines.push('# Coverage-Risk Crossref Audit Summary (Generated)')
    lines.push('')
    lines.push(genFrom(ctx))
    lines.push('')
    if (data.error) {
      lines.push(`**Error:** ${data.error}`)
      lines.push('')
      return lines.join('\n')
    }
    const s = data.summary || {}
    lines.push(`- High fan-in untested: **${s.highFanInUntested ?? 0}**`)
    lines.push(`- High fan-in tested: **${s.highFanInTested ?? 0}**`)
    lines.push(`- Coverage of critical files: **${s.coverageOfCriticalFiles ?? '0%'}**`)
    lines.push(`- Risk files: **${s.totalRiskFiles ?? 0}**`)
    lines.push('')
    const riskFiles = Array.isArray(data.riskFiles) ? data.riskFiles : []
    lines.push('## Top 20 risk files')
    lines.push('')
    lines.push('| File | Fan-in | Has test | Risk score | Priority |')
    lines.push('| --- | ---: | --- | ---: | --- |')
    for (const f of riskFiles.slice(0, 20)) {
      lines.push(`| \`${f.repoPath}\` | ${f.fanIn ?? 0} | ${f.hasTest ? 'Yes' : 'No'} | ${f.riskScore ?? 0} | ${f.priority ?? 'P2'} |`)
    }
    lines.push('')
    return lines.join('\n')
  },

  'css'(data, ctx) {
    const files = Array.isArray(data.files) ? data.files : []
    const lines = []
    const countKeys = ['large-style-block', 'empty-style-block', 'unscoped-style', 'inline-style-static', 'inline-style-dynamic', 'important-override', 'deep-selector', 'magic-color', 'css-in-ts']
    lines.push('# CSS Extraction Audit Summary (Generated)')
    lines.push('')
    lines.push(genFrom(ctx))
    lines.push('')
    lines.push(`- Files with findings: **${files.length}**`)
    lines.push('')
    const MAX_ROWS = 30
    lines.push(`## Top ${Math.min(files.length, MAX_ROWS)} files`)
    lines.push('')
    lines.push('| File | Priority | score | large-style | empty | unscoped | inline-static | inline-dynamic | !important | :deep | magic-color | css-in-ts |')
    lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')
    for (const f of files.slice(0, MAX_ROWS)) {
      const c = f.counts || {}
      const cells = countKeys.map(k => c[k] || 0)
      lines.push(`| \`${f.repoPath}\` | ${f.priority || 'P2'} | ${f.score || 0} | ${cells.join(' | ')} |`)
    }
    if (files.length > MAX_ROWS) {
      lines.push('')
      lines.push(`*...and ${files.length - MAX_ROWS} more. See full report.*`)
    }
    lines.push('')
    lines.push('## Notes')
    lines.push('')
    lines.push('- This is a *signal* index. Use the full report: `client/.audit-reports/css-audit.md`.')
    lines.push('')
    return lines.join('\n')
  },

  'data-flow'(data, ctx) {
    const lines = []
    const summary = data.exceptionSummary || {}
    const files = Array.isArray(data.files) ? data.files : []
    lines.push('# Data Flow Audit Summary (Generated)')
    lines.push('')
    lines.push(genFrom(ctx))
    lines.push('')
    lines.push(`- Requiring review: **${summary.totalRequiresReview ?? 0}**`)
    lines.push(`- Allowed: **${summary.totalAllowed ?? 0}**`)
    lines.push('')
    if (files.length > 0) {
      lines.push('## Top 25 files')
      lines.push('')
      lines.push('| File | Count | Priority |')
      lines.push('| --- | ---: | --- |')
      for (const f of files.slice(0, 25)) {
        lines.push(`| \`${f.repoPath}\` | ${f.count ?? 0} | ${f.priority ?? 'P2'} |`)
      }
      lines.push('')
    }
    return lines.join('\n')
  },

  'dep-freshness'(data, ctx) {
    const lines = []
    const byBehind = data.byBehind || {}
    const packages = Array.isArray(data.packages) ? data.packages : []
    lines.push('# Dep Freshness Audit Summary (Generated)')
    lines.push('')
    lines.push(genFrom(ctx))
    lines.push('')
    lines.push(`- Major behind: **${byBehind['major-behind'] ?? 0}**`)
    lines.push(`- Minor behind: **${byBehind['minor-behind'] ?? 0}**`)
    lines.push(`- Patch behind: **${byBehind['patch-behind'] ?? 0}**`)
    lines.push(`- Total scanned: **${data.totalScanned ?? 0}**`)
    lines.push('')
    const majorBehind = packages.filter(p => p.behind === 'major-behind').slice(0, 15)
    if (majorBehind.length > 0) {
      lines.push('## Major behind (first 15)')
      lines.push('')
      for (const p of majorBehind) {
        lines.push(`- \`${p.package}\` (${p.dependent}): ${p.current} → ${p.latest}`)
      }
      lines.push('')
    }
    return lines.join('\n')
  },

  'deprecation'(data, ctx) {
    const files = Array.isArray(data.files) ? data.files : []
    const summary = data.exceptionSummary || {}
    const lines = []
    lines.push('# Deprecation & Legacy Accommodation Audit Summary (Generated)')
    lines.push('')
    lines.push(genFrom(ctx))
    lines.push('')
    lines.push(`- Files with findings: **${files.length}**`)
    lines.push(`- Requiring review: **${summary.totalRequiresReview ?? 0}**`)
    lines.push(`- Allowed exceptions: **${summary.totalAllowed ?? 0}**`)
    lines.push('')
    let annotationCount = 0
    let legacyCount = 0
    for (const f of files) {
      const review = Array.isArray(f.requiresReview) ? f.requiresReview : []
      for (const m of review) {
        if (m.section === 'annotation') annotationCount++
        else legacyCount++
      }
    }
    lines.push(`- Annotated deprecations: **${annotationCount}**`)
    lines.push(`- Runtime legacy accommodation: **${legacyCount}**`)
    lines.push('')
    const MAX_ROWS = 30
    lines.push(`## Top ${Math.min(files.length, MAX_ROWS)} files (ranked by score)`)
    lines.push('')
    lines.push('| File | Priority | Score | Annotations | Legacy/Compat |')
    lines.push('| --- | --- | ---: | ---: | ---: |')
    for (const f of files.slice(0, MAX_ROWS)) {
      const review = Array.isArray(f.requiresReview) ? f.requiresReview : []
      const ann = review.filter(m => m.section === 'annotation').length
      const leg = review.filter(m => m.section === 'legacy-accommodation').length
      lines.push(`| \`${f.repoPath}\` | ${f.priority || 'P2'} | ${f.score || 0} | ${ann} | ${leg} |`)
    }
    if (files.length > MAX_ROWS) {
      lines.push('')
      lines.push(`*...and ${files.length - MAX_ROWS} more. See full report for details.*`)
    }
    lines.push('')
    lines.push('## Notes')
    lines.push('')
    lines.push('- **Annotations**: @deprecated, // Deprecated, (deprecated), LEGACY/compat markers.')
    lines.push('- **Legacy/Compat**: Runtime keywords, || \'\', ?? \'\', default params, chaining fallbacks.')
    lines.push('- See full report: `client/.audit-reports/deprecation-audit.md`.')
    lines.push('')
    return lines.join('\n')
  },

  'duplication'(data, ctx) {
    const groups = Array.isArray(data.groups) ? data.groups : []
    const lines = []
    lines.push('# Duplication Audit Summary (Generated)')
    lines.push('')
    lines.push(genFrom(ctx))
    lines.push('')
    lines.push('## Index (ranked)')
    lines.push('')
    lines.push('| Group | Priority | unique files | occurrences | lineCount | sample locations |')
    lines.push('| --- | --- | ---: | ---: | ---: | --- |')
    for (const g of groups) {
      const sample = Array.isArray(g.locations)
        ? g.locations.slice(0, 3).map(l => `\`${l.repoPath}@${l.startLine}\``).join(', ')
        : ''
      lines.push(`| \`${g.groupId}\` | ${g.priority || 'P2'} | ${g.uniqueFiles || 0} | ${g.occurrences || 0} | ${g.lineCount || 0} | ${sample}${g.locations?.length > 3 ? ', …' : ''} |`)
    }
    lines.push('')
    lines.push('## Notes')
    lines.push('')
    lines.push('- This is a *signal* index. Use the full report: `client/.audit-reports/duplication-audit.md`.')
    lines.push('')
    return lines.join('\n')
  },

  'error-handling'(data, ctx) {
    const files = Array.isArray(data.files) ? data.files : []
    const summary = data.exceptionSummary || {}
    const lines = []
    lines.push('# Error Handling Audit Summary (Generated)')
    lines.push('')
    lines.push(genFrom(ctx))
    lines.push('')
    lines.push(`- Requiring review: **${summary.totalRequiresReview ?? 0}**`)
    lines.push(`- Allowed exceptions: **${summary.totalAllowed ?? 0}**`)
    lines.push('')
    const MAX_ROWS = 30
    lines.push(`## Top ${Math.min(files.length, MAX_ROWS)} files (ranked by score)`)
    lines.push('')
    lines.push('| File | Priority | Score | P0 | P1 | P2 |')
    lines.push('| --- | --- | ---: | ---: | ---: | ---: |')
    for (const f of files.slice(0, MAX_ROWS)) {
      const review = Array.isArray(f.requiresReview) ? f.requiresReview : []
      const counts = { P0: 0, P1: 0, P2: 0 }
      const p0Rules = ['empty-catch', 'silent-catch-promise', 'catch-comment-only']
      const p1Rules = ['console-in-catch', 'ts-ignore', 'ts-expect-error', 'as-any', 'eslint-disable']
      for (const m of review) {
        if (p0Rules.includes(m.ruleId)) counts.P0++
        else if (p1Rules.includes(m.ruleId)) counts.P1++
        else counts.P2++
      }
      lines.push(`| \`${f.repoPath}\` | ${f.priority || 'P2'} | ${f.score || 0} | ${counts.P0} | ${counts.P1} | ${counts.P2} |`)
    }
    if (files.length > MAX_ROWS) {
      lines.push('')
      lines.push(`*...and ${files.length - MAX_ROWS} more. See full report for details.*`)
    }
    lines.push('')
    lines.push('## Notes')
    lines.push('')
    lines.push('- **P0**: Silent error swallowing (empty catch, silent .catch()).')
    lines.push('- **P1**: Console in catch, type suppressions (@ts-ignore, as any).')
    lines.push('- **P2**: General console usage.')
    lines.push('')
    return lines.join('\n')
  },

  'file-cohesion'(data, ctx) {
    const files = Array.isArray(data.files) ? data.files : []
    const lines = []
    lines.push('# File Cohesion Audit Summary (Generated)')
    lines.push('')
    lines.push(genFrom(ctx))
    lines.push('')
    lines.push(`- Files with violations: **${files.length}**`)
    lines.push('')
    const MAX_ROWS = 30
    lines.push(`## Top ${Math.min(files.length, MAX_ROWS)} files`)
    lines.push('')
    lines.push('| File | Category | Priority | Score | Lines | Exports | Violations |')
    lines.push('| --- | --- | --- | ---: | ---: | ---: | --- |')
    for (const f of files.slice(0, MAX_ROWS)) {
      const violations = Array.isArray(f.violations) ? f.violations.map(v => v.rule).join(', ') : ''
      lines.push(`| \`${f.repoPath}\` | ${f.category ?? ''} | ${f.priority || 'P2'} | ${f.score || 0} | ${f.lines ?? 0} | ${f.exports ?? 0} | ${violations} |`)
    }
    if (files.length > MAX_ROWS) {
      lines.push('')
      lines.push(`*...and ${files.length - MAX_ROWS} more. See full report.*`)
    }
    lines.push('')
    return lines.join('\n')
  },

  'function-complexity'(data, ctx) {
    const files = Array.isArray(data.files) ? data.files : []
    const lines = []
    lines.push('# Function Complexity Audit Summary (Generated)')
    lines.push('')
    lines.push(genFrom(ctx))
    lines.push('')
    lines.push(`- Files with complex functions: **${files.length}**`)
    lines.push('')
    const MAX_ROWS = 30
    lines.push(`## Top ${Math.min(files.length, MAX_ROWS)} files`)
    lines.push('')
    lines.push('| File | Priority | Score | Complex Fns | Worst Nesting | Worst Length |')
    lines.push('| --- | --- | ---: | ---: | ---: | ---: |')
    for (const f of files.slice(0, MAX_ROWS)) {
      const fns = Array.isArray(f.functions) ? f.functions : []
      const worstNesting = fns.length ? Math.max(...fns.map(x => x.maxNesting ?? 0)) : 0
      const worstLength = fns.length ? Math.max(...fns.map(x => x.length ?? 0)) : 0
      lines.push(`| \`${f.repoPath}\` | ${f.priority || 'P2'} | ${f.score || 0} | ${fns.length} | ${worstNesting} | ${worstLength} |`)
    }
    if (files.length > MAX_ROWS) {
      lines.push('')
      lines.push(`*...and ${files.length - MAX_ROWS} more. See full report.*`)
    }
    lines.push('')
    return lines.join('\n')
  },

  'hardcoding'(data, ctx) {
    const files = Array.isArray(data.files) ? data.files : []
    const entityKeys = Array.isArray(data.entityKeys) ? data.entityKeys : []
    const lines = []
    lines.push('# Hardcoding Audit Summary (Generated)')
    lines.push('')
    lines.push(genFrom(ctx))
    lines.push('')
    lines.push('## Context')
    lines.push('')
    lines.push(`- Entity keys: ${entityKeys.length ? entityKeys.map(k => `\`${k}\``).join(', ') : '(none detected)'}`)
    lines.push('')
    const MAX_ROWS = 30
    lines.push(`## Top ${Math.min(files.length, MAX_ROWS)} files (ranked)`)
    lines.push('')
    lines.push('| File | Priority | score | switch(entityKey) | entityKey strings | case | field===string | omitFields | headers | label maps |')
    lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')
    for (const f of files.slice(0, MAX_ROWS)) {
      const c = f.counts || {}
      lines.push(`| \`${f.repoPath}\` | ${f.priority || 'P2'} | ${f.score || 0} | ${c.switchEntityKey || 0} | ${c.entityKeyString || 0} | ${c.caseString || 0} | ${c.fieldEqualsString || 0} | ${c.omitFieldsArray || 0} | ${c.headersArray || 0} | ${c.inlineLabelMap || 0} |`)
    }
    if (files.length > MAX_ROWS) {
      lines.push('')
      lines.push(`*...and ${files.length - MAX_ROWS} more files. See full report for details.*`)
    }
    lines.push('')
    lines.push('## Notes')
    lines.push('')
    lines.push('- This is a *signal* index. Use the full report: `client/.audit-reports/hardcoding-audit.md`.')
    lines.push('')
    return lines.join('\n')
  },

  'import-graph'(data, ctx) {
    const lines = []
    const cycles = Array.isArray(data.cycles) ? data.cycles : []
    const fanOut = Array.isArray(data.fanOutViolations) ? data.fanOutViolations : []
    const fanIn = Array.isArray(data.fanInViolations) ? data.fanInViolations : []
    const crossBoundary = data.crossBoundaryViolations ?? 0
    const files = Array.isArray(data.files) ? data.files : []
    lines.push('# Import Graph Audit Summary (Generated)')
    lines.push('')
    lines.push(genFrom(ctx))
    lines.push('')
    lines.push(`- Cycles: **${cycles.length}**`)
    lines.push(`- Fan-out violations: **${fanOut.length}**`)
    lines.push(`- Fan-in violations: **${fanIn.length}**`)
    lines.push(`- Cross-boundary: **${crossBoundary}**`)
    lines.push('')
    const MAX_ROWS = 30
    lines.push(`## Top ${Math.min(files.length, MAX_ROWS)} files by score`)
    lines.push('')
    lines.push('| File | Priority | Score |')
    lines.push('| --- | --- | ---: |')
    for (const f of files.slice(0, MAX_ROWS)) {
      lines.push(`| \`${f.repoPath}\` | ${f.priority || 'P2'} | ${f.score || 0} |`)
    }
    if (files.length > MAX_ROWS) {
      lines.push('')
      lines.push(`*...and ${files.length - MAX_ROWS} more. See full report.*`)
    }
    lines.push('')
    return lines.join('\n')
  },

  'import-hygiene'(data, ctx) {
    const lines = []
    const files = Array.isArray(data.files) ? data.files : []
    lines.push('# Import Hygiene Audit Summary (Generated)')
    lines.push('')
    lines.push(genFrom(ctx))
    lines.push('')
    lines.push('## Overview')
    lines.push('')
    lines.push('| Metric | Count |')
    lines.push('| --- | ---: |')
    lines.push(`| Files scanned | ${data.totalScanned ?? 0} |`)
    lines.push(`| Barrel dirs | ${data.barrelCount ?? 0} |`)
    lines.push(`| Barrel bypass | ${(data.barrelBypass || []).length} |`)
    lines.push(`| Inconsistent paths | ${(data.inconsistentPaths || []).length} |`)
    lines.push(`| Duplicate re-exports | ${(data.duplicateReexports || []).length} |`)
    lines.push(`| Relative when alias | ${(data.relativeWhenAlias || []).length} |`)
    lines.push(`| Type/value re-export | ${(data.typeValueReexport || []).length} |`)
    lines.push('')
    const MAX_ROWS = 20
    lines.push(`## Top ${Math.min(files.length, MAX_ROWS)} files`)
    lines.push('')
    lines.push('| File | Priority | Score | Barrel Bypass | Deep Relative | Type/Value Re-export |')
    lines.push('| --- | --- | ---: | ---: | ---: | ---: |')
    for (const f of files.slice(0, MAX_ROWS)) {
      const c = f.counts || {}
      lines.push(`| \`${f.repoPath}\` | ${f.priority || 'P2'} | ${f.score || 0} | ${c.barrelBypass ?? 0} | ${c.deepRelative ?? 0} | ${c.typeValueReexport ?? 0} |`)
    }
    if (files.length > MAX_ROWS) {
      lines.push('')
      lines.push(`*...and ${files.length - MAX_ROWS} more. See full report.*`)
    }
    lines.push('')
    lines.push('## Notes')
    lines.push('')
    lines.push('- Full report: `client/.audit-reports/import-hygiene-audit.md`. Barrel bypass / deep relative / type-value re-export definitions in full report.')
    lines.push('')
    return lines.join('\n')
  },

  'loop-mutation'(data, ctx) {
    const files = Array.isArray(data.files) ? data.files : []
    const lines = []
    lines.push('# Loop Mutation Audit Summary (Generated)')
    lines.push('')
    lines.push(genFrom(ctx))
    lines.push('')
    const MAX_ROWS = 30
    lines.push(`## Top ${Math.min(files.length, MAX_ROWS)} files (ranked)`)
    lines.push('')
    lines.push('| File | Priority | score | forEach | for-loops | mutators | assigns | forEach→mutation hits |')
    lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |')
    for (const f of files.slice(0, MAX_ROWS)) {
      const c = f.counts || {}
      const forLoops = (c.forLoop || 0) + (c.forOf || 0) + (c.forIn || 0) + (c.while || 0) + (c.doWhile || 0)
      const mutators = (c.push || 0) + (c.splice || 0) + (c.sort || 0) + (c.reverse || 0) + (c.pop || 0) + (c.shift || 0) + (c.unshift || 0)
      const assigns = (c.assignIndex || 0) + (c.assignProp || 0)
      const hits = Array.isArray(f.forEachMutationHits) ? f.forEachMutationHits.length : 0
      lines.push(`| \`${f.repoPath}\` | ${f.priority || 'P2'} | ${f.score || 0} | ${c.forEach || 0} | ${forLoops} | ${mutators} | ${assigns} | ${hits} |`)
    }
    if (files.length > MAX_ROWS) {
      lines.push('')
      lines.push(`*...and ${files.length - MAX_ROWS} more files. See full report for details.*`)
    }
    lines.push('')
    lines.push('## Notes')
    lines.push('')
    lines.push('- This is a *signal* index. Use the full report: `client/.audit-reports/loop-mutation-audit.md`.')
    lines.push('')
    return lines.join('\n')
  },

  'lint'(data, _ctx) {
    const lines = []
    const findings = Array.isArray(data.findings) ? data.findings : []
    const files = Array.isArray(data.files) ? data.files : []
    lines.push('# Lint Audit Summary (Generated)')
    lines.push('')
    lines.push(`Generated from \`lint-audit.json\`.`)
    lines.push('')
    lines.push('## Overview')
    lines.push('')
    lines.push('| Metric | Count |')
    lines.push('| --- | ---: |')
    lines.push(`| Total scanned | ${data.totalScanned ?? 0} |`)
    lines.push(`| Findings | ${findings.length} |`)
    lines.push(`| Files with findings | ${files.length} |`)
    lines.push('')
    const byRule = {}
    for (const f of findings) {
      byRule[f.ruleId] = (byRule[f.ruleId] || 0) + 1
    }
    const sortedRules = Object.entries(byRule).sort((a, b) => b[1] - a[1])
    lines.push('## By rule')
    lines.push('')
    lines.push('| Rule | Count |')
    lines.push('| --- | ---: |')
    for (const [rule, count] of sortedRules) {
      lines.push(`| ${rule} | ${count} |`)
    }
    lines.push('')
    const MAX_ROWS = 20
    lines.push(`## Top ${Math.min(files.length, MAX_ROWS)} files`)
    lines.push('')
    lines.push('| File | Priority | Score |')
    lines.push('| --- | --- | ---: |')
    for (const f of files.slice(0, MAX_ROWS)) {
      lines.push(`| \`${f.repoPath}\` | ${f.priority || 'P2'} | ${f.score || 0} |`)
    }
    if (files.length > MAX_ROWS) {
      lines.push('')
      lines.push(`*...and ${files.length - MAX_ROWS} more. See full report.*`)
    }
    lines.push('')
    lines.push('## Notes')
    lines.push('')
    lines.push('- Full report: `client/.audit-reports/lint-audit.md`.')
    lines.push('')
    return lines.join('\n')
  },

  'lint-warnings'(data, _ctx) {
    const lines = []
    const findings = Array.isArray(data.findings) ? data.findings : []
    const files = Array.isArray(data.files) ? data.files : []
    lines.push('# Lint-Warnings Audit Summary (Generated)')
    lines.push('')
    lines.push('Generated from `lint-warnings-audit.json`. Warnings only.')
    lines.push('')
    lines.push('## Overview')
    lines.push('')
    lines.push('| Metric | Count |')
    lines.push('| --- | ---: |')
    lines.push(`| Total scanned | ${data.totalScanned ?? 0} |`)
    lines.push(`| Findings | ${findings.length} |`)
    lines.push(`| Files with findings | ${files.length} |`)
    lines.push('')
    const byRule = {}
    for (const f of findings) {
      byRule[f.ruleId] = (byRule[f.ruleId] || 0) + 1
    }
    const sortedRules = Object.entries(byRule).sort((a, b) => b[1] - a[1])
    lines.push('## By rule')
    lines.push('')
    lines.push('| Rule | Count |')
    lines.push('| --- | ---: |')
    for (const [rule, count] of sortedRules) {
      lines.push(`| ${rule} | ${count} |`)
    }
    lines.push('')
    const MAX_ROWS = 20
    lines.push(`## Top ${Math.min(files.length, MAX_ROWS)} files`)
    lines.push('')
    lines.push('| File | Priority | Score |')
    lines.push('| --- | --- | ---: |')
    for (const f of files.slice(0, MAX_ROWS)) {
      lines.push(`| \`${f.repoPath}\` | ${f.priority || 'P2'} | ${f.score || 0} |`)
    }
    if (files.length > MAX_ROWS) {
      lines.push('')
      lines.push(`*...and ${files.length - MAX_ROWS} more. See full report.*`)
    }
    lines.push('')
    lines.push('## Notes')
    lines.push('')
    lines.push('- Full report: `client/.audit-reports/lint-warnings-audit.md`.')
    lines.push('')
    return lines.join('\n')
  },

  'naming-convention'(data, ctx) {
    const lines = []
    const summary = data.exceptionSummary || {}
    const files = Array.isArray(data.files) ? data.files : []
    lines.push('# Naming Convention Audit Summary (Generated)')
    lines.push('')
    lines.push(genFrom(ctx))
    lines.push('')
    lines.push(`- Requiring review: **${summary.totalRequiresReview ?? 0}**`)
    lines.push(`- Allowed: **${summary.totalAllowed ?? 0}**`)
    lines.push('')
    const MAX_ROWS = 25
    lines.push(`## Top ${Math.min(files.length, MAX_ROWS)} files`)
    lines.push('')
    lines.push('| File | Violations | Priority |')
    lines.push('| --- | ---: | --- |')
    for (const f of files.slice(0, MAX_ROWS)) {
      const count = Array.isArray(f.requiresReview) ? f.requiresReview.length : 0
      lines.push(`| \`${f.repoPath}\` | ${count} | ${f.priority || 'P2'} |`)
    }
    lines.push('')
    return lines.join('\n')
  },

  'pattern-detection'(data, ctx) {
    const aggregated = data.aggregated || {}
    const stringLiterals = aggregated.stringLiterals || {}
    const typeDefinitions = aggregated.typeDefinitions || {}
    const enumPatterns = aggregated.enumPatterns || {}
    const configLocations = aggregated.configLocations || []
    const functionPatterns = aggregated.functionPatterns || {}
    const commonPatterns = aggregated.commonPatterns || []
    const lines = []
    lines.push('# Pattern Detection Audit Summary (Generated)')
    lines.push('')
    lines.push(genFrom(ctx))
    lines.push('')
    lines.push('## Quick Index')
    lines.push('')
    lines.push('| Category | Count |')
    lines.push('| --- | ---: |')
    lines.push(`| String literals (3+ occurrences) | ${Object.keys(stringLiterals).filter(k => stringLiterals[k].count >= 3).length} |`)
    lines.push(`| Type definitions | ${Object.keys(typeDefinitions).length} |`)
    lines.push(`| Enum patterns | ${Object.keys(enumPatterns).length} |`)
    lines.push(`| Config locations | ${configLocations.length} |`)
    lines.push(`| Function patterns | ${Object.keys(functionPatterns).length} |`)
    lines.push(`| Common patterns | ${commonPatterns.length} |`)
    lines.push('')
    lines.push('## Top String Literals (by occurrence count)')
    lines.push('')
    lines.push('| Value | Occurrences |')
    lines.push('| --- | ---: |')
    const topStrings = Object.entries(stringLiterals)
      .filter(([, entry]) => entry.count >= 3)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 20)
    for (const [value, entry] of topStrings) {
      lines.push(`| \`${value}\` | ${entry.count} |`)
    }
    if (topStrings.length === 0) {
      lines.push('| _No frequent string literals found_ | |')
    }
    lines.push('')
    lines.push('## Notes')
    lines.push('')
    lines.push('- Full report: `client/.audit-reports/pattern-detection-audit.md`. String literals with 3+ occurrences may be candidates for enum/constant extraction.')
    lines.push('')
    return lines.join('\n')
  },

  'security'(data, ctx) {
    const categories = Array.isArray(data.categories) ? data.categories : []
    const files = Array.isArray(data.files) ? data.files : []
    const summary = data.summary || {}
    const lines = []
    lines.push('# Security Audit Summary (Generated)')
    lines.push('')
    lines.push(genFrom(ctx))
    lines.push('')
    lines.push('## Summary')
    lines.push('')
    lines.push(`- Total errors: **${summary.totalErrors || 0}**`)
    lines.push(`- Total warnings: **${summary.totalWarnings || 0}**`)
    lines.push(`- Files with issues: **${files.filter(f => f.issues && f.issues.length > 0).length}**`)
    lines.push('')
    const priorityOrder = { P0: 0, P1: 1, P2: 2 }
    const sortedCategories = categories.slice().sort((a, b) => {
      const ap = priorityOrder[a.priority] ?? 2
      const bp = priorityOrder[b.priority] ?? 2
      if (ap !== bp) return ap - bp
      return (b.score ?? 0) - (a.score ?? 0)
    })
    lines.push('## Categories (sorted by priority)')
    lines.push('')
    lines.push('| Category | Priority | Score | Errors | Warnings |')
    lines.push('| --- | --- | ---: | ---: | ---: |')
    for (const cat of sortedCategories) {
      lines.push(`| ${cat.name} | ${cat.priority || 'P2'} | ${cat.score || 0} | ${cat.errors?.length || 0} | ${cat.warnings?.length || 0} |`)
    }
    lines.push('')
    const sortedFiles = files
      .filter(f => f.issues && f.issues.length > 0)
      .sort((a, b) => {
        const ap = priorityOrder[a.priority] ?? 2
        const bp = priorityOrder[b.priority] ?? 2
        if (ap !== bp) return ap - bp
        return (b.score ?? 0) - (a.score ?? 0)
      })
    lines.push('## Files with Issues (sorted by priority)')
    lines.push('')
    lines.push('| File | Priority | Score | Categories | Issues |')
    lines.push('| --- | --- | ---: | --- | ---: |')
    for (const f of sortedFiles) {
      const categoriesList = f.categories ? f.categories.join(', ') : ''
      lines.push(`| \`${f.repoPath}\` | ${f.priority || 'P2'} | ${f.score || 0} | ${categoriesList} | ${f.issues.length} |`)
    }
    lines.push('')
    lines.push('## Notes')
    lines.push('')
    lines.push('- This is a *signal* index. Use the full report: `client/.audit-reports/security-audit.md`.')
    lines.push('- **P0**: Critical. **P1**: Important. **P2**: Low priority.')
    lines.push('')
    return lines.join('\n')
  },

  'test'(data, ctx) {
    const lines = []
    const summary = data.summary || {}
    const untestedSource = Array.isArray(data.untestedSource) ? data.untestedSource : []
    lines.push('# Test Audit Summary (Generated)')
    lines.push('')
    lines.push(genFrom(ctx))
    lines.push('')
    lines.push('## Quick Stats')
    lines.push('')
    lines.push(`- Coverage: **${summary.coveragePercentage ?? 0}%**`)
    lines.push(`- Untested source files: **${summary.untestedSourceFiles ?? 0}**`)
    lines.push(`- Orphaned test files: **${summary.orphanedTestFiles ?? 0}**`)
    lines.push('')
    const withExports = untestedSource.filter(s => (s.exportCount ?? 0) > 0)
    const sorted = withExports.slice().sort((a, b) => (b.priority?.overall ?? 0) - (a.priority?.overall ?? 0))
    lines.push('## Top 20 untested files (with exports)')
    lines.push('')
    lines.push('| File | Priority | Score | Reliability | ROI | Exports |')
    lines.push('| --- | --- | ---: | ---: | ---: | ---: |')
    for (const f of sorted.slice(0, 20)) {
      const p = f.priority || {}
      lines.push(`| \`${f.repoPath}\` | ${p.overall ?? 'P2'} | ${p.overall ?? 0} | ${p.reliability ?? 0} | ${p.roi ?? 0} | ${f.exportCount ?? 0} |`)
    }
    lines.push('')
    lines.push('Full report: `client/.audit-reports/test-audit.md`.')
    lines.push('')
    return lines.join('\n')
  },

  'todo-aging'(data, ctx) {
    const lines = []
    const totals = data.totals || {}
    const files = Array.isArray(data.files) ? data.files : []
    lines.push('# TODO Aging Audit Summary (Generated)')
    lines.push('')
    lines.push(genFrom(ctx))
    lines.push('')
    lines.push(`- Total markers: **${totals.totalMarkers ?? 0}**`)
    lines.push(`- Ancient: **${totals.ancient ?? 0}** | Stale: **${totals.stale ?? 0}** | Aging: **${totals.aging ?? 0}** | Fresh: **${totals.fresh ?? 0}** | Orphaned: **${totals.orphaned ?? 0}**`)
    lines.push('')
    const MAX_ROWS = 30
    lines.push(`## Top ${Math.min(files.length, MAX_ROWS)} files`)
    lines.push('')
    lines.push('| File | Priority | Score | Total | Ancient | Stale | Orphaned |')
    lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: |')
    for (const f of files.slice(0, MAX_ROWS)) {
      const markers = Array.isArray(f.markers) ? f.markers : []
      const ancient = markers.filter(m => m.category === 'ancient').length
      const stale = markers.filter(m => m.category === 'stale').length
      const orphaned = markers.filter(m => m.orphaned).length
      lines.push(`| \`${f.repoPath}\` | ${f.priority || 'P2'} | ${f.score || 0} | ${markers.length} | ${ancient} | ${stale} | ${orphaned} |`)
    }
    if (files.length > MAX_ROWS) {
      lines.push('')
      lines.push(`*...and ${files.length - MAX_ROWS} more. See full report.*`)
    }
    lines.push('')
    return lines.join('\n')
  },

  'type-escape'(data, ctx) {
    const lines = []
    const findings = Array.isArray(data.findings) ? data.findings : []
    const files = Array.isArray(data.files) ? data.files : []
    lines.push('# Type-Escape Audit Summary (Generated)')
    lines.push('')
    lines.push(genFrom(ctx))
    lines.push('')
    lines.push('## Overview')
    lines.push('')
    lines.push('| Metric | Count |')
    lines.push('| --- | ---: |')
    lines.push(`| Total scanned | ${data.totalScanned ?? 0} |`)
    lines.push(`| Findings | ${findings.length} |`)
    lines.push(`| Files with findings | ${files.length} |`)
    lines.push('')
    const byRule = {}
    for (const f of findings) {
      byRule[f.ruleId] = (byRule[f.ruleId] || 0) + 1
    }
    const sortedRules = Object.entries(byRule).sort((a, b) => b[1] - a[1])
    lines.push('## By rule')
    lines.push('')
    lines.push('| Rule | Count |')
    lines.push('| --- | ---: |')
    for (const [rule, count] of sortedRules) {
      lines.push(`| ${rule} | ${count} |`)
    }
    lines.push('')
    const MAX_ROWS = 20
    lines.push(`## Top ${Math.min(files.length, MAX_ROWS)} files`)
    lines.push('')
    lines.push('| File | Priority | Score |')
    lines.push('| --- | --- | ---: |')
    for (const f of files.slice(0, MAX_ROWS)) {
      lines.push(`| \`${f.repoPath}\` | ${f.priority || 'P2'} | ${f.score || 0} |`)
    }
    if (files.length > MAX_ROWS) {
      lines.push('')
      lines.push(`*...and ${files.length - MAX_ROWS} more. See full report.*`)
    }
    lines.push('')
    lines.push('## Notes')
    lines.push('')
    lines.push('- Full report: `client/.audit-reports/type-escape-audit.md`. Rules: as-any, as-unknown, etc.')
    lines.push('')
    return lines.join('\n')
  },

  'type-import'(data, ctx) {
    const lines = []
    const files = Array.isArray(data.files) ? data.files : []
    const valueImport = Array.isArray(data.valueImportFromTypeOnlyFile) ? data.valueImportFromTypeOnlyFile : []
    const typeUsedAsValue = Array.isArray(data.typeUsedAsValue) ? data.typeUsedAsValue : []
    lines.push('# Type-Import Audit Summary (Generated)')
    lines.push('')
    lines.push(genFrom(ctx))
    lines.push('')
    lines.push('## Overview')
    lines.push('')
    lines.push('| Metric | Count |')
    lines.push('| --- | ---: |')
    lines.push(`| Files scanned | ${data.totalScanned ?? 0} |`)
    lines.push(`| value-import-from-type-only-file | ${valueImport.length} |`)
    lines.push(`| type-used-as-value | ${typeUsedAsValue.length} |`)
    lines.push(`| Files with findings | ${files.length} |`)
    lines.push('')
    const MAX_ROWS = 20
    lines.push(`## Top ${Math.min(files.length, MAX_ROWS)} files (by score)`)
    lines.push('')
    lines.push('| File | Score |')
    lines.push('| --- | ---: |')
    for (const f of files.slice(0, MAX_ROWS)) {
      lines.push(`| \`${f.file}\` | ${f.score ?? 0} |`)
    }
    if (files.length > MAX_ROWS) {
      lines.push('')
      lines.push(`*...and ${files.length - MAX_ROWS} more files. See full report for details.*`)
    }
    lines.push('')
    lines.push('## Notes')
    lines.push('')
    lines.push('- Full report: `client/.audit-reports/type-import-audit.md`. value-import-from-type-only-file: importing a value from a file that only exports types. type-used-as-value: symbol imported with "import type" but used in value position.')
    lines.push('')
    return lines.join('\n')
  },

  'type-similarity'(data, ctx) {
    const lines = []
    const groups = Array.isArray(data.groups) ? data.groups : []
    const actionCounts = { UNIFY: 0, BRAND: 0, EXTEND: 0, REVIEW: 0 }
    for (const g of groups) {
      const a = g.action || 'REVIEW'
      if (actionCounts[a] !== undefined) actionCounts[a]++
    }
    lines.push('# Type Similarity Audit Summary (Generated)')
    lines.push('')
    lines.push(genFrom(ctx))
    lines.push('')
    lines.push('## Quick Stats')
    lines.push('')
    lines.push(`- File count: **${data.fileCount ?? 0}**`)
    lines.push(`- Total definitions: **${data.totalDefinitions ?? 0}**`)
    lines.push(`- Groups: **${groups.length}**`)
    lines.push('')
    lines.push('## Action table')
    lines.push('')
    lines.push('| Action | Count | Meaning |')
    lines.push('| --- | ---: | --- |')
    lines.push('| UNIFY | ' + actionCounts.UNIFY + ' | Merge duplicate shapes |')
    lines.push('| BRAND | ' + actionCounts.BRAND + ' | Nominal typing |')
    lines.push('| EXTEND | ' + actionCounts.EXTEND + ' | Extend shared base |')
    lines.push('| REVIEW | ' + actionCounts.REVIEW + ' | Manual review |')
    lines.push('')
    lines.push('## Index (ranked)')
    lines.push('')
    lines.push('| Priority | Action | Relationship | Types | Files | Score |')
    lines.push('| --- | --- | --- | --- | ---: | ---: |')
    for (const g of groups) {
      const types = Array.isArray(g.members) ? g.members.map(m => m.name).join(', ') : ''
      const fileCount = g.uniqueFiles ?? 0
      lines.push(`| ${g.priority || 'P2'} | ${g.action || 'REVIEW'} | ${g.relationship ?? ''} | ${types.slice(0, 40)}... | ${fileCount} | ${g.score ?? 0} |`)
    }
    lines.push('')
    lines.push('## Notes')
    lines.push('')
    lines.push('- This is a *signal* index. Use the full report: `client/.audit-reports/type-similarity-audit.md`. Run after type-import/type-escape cleanup.')
    lines.push('')
    return lines.join('\n')
  },

  'typecheck'(data, ctx) {
    const lines = []
    const pools = Array.isArray(data.pools) ? data.pools : []
    const files = Array.isArray(data.files) ? data.files : []
    lines.push('# Typecheck Audit Summary (Generated)')
    lines.push('')
    lines.push(genFrom(ctx))
    lines.push('')
    lines.push('## Pool index (ranked)')
    lines.push('')
    lines.push('| Priority | Pool | score | errors | files | severity | blast | repetition | unsafeCasts | suppressions |')
    lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')
    for (const p of pools) {
      lines.push(`| ${p.priority} | \`${p.poolId}\` | ${p.totalScore} | ${p.errorCount} | ${p.fileCount} | ${p.severityScore} | ${p.blastRadiusScore} | ${p.repetitionScore} | ${p.unsafeCastHits} | ${p.suppressionHits} |`)
    }
    lines.push('')
    lines.push('## File index (ranked)')
    lines.push('')
    lines.push('| File | errors | unsafeCasts | suppressions |')
    lines.push('| --- | ---: | ---: | ---: |')
    for (const f of files) {
      lines.push(`| \`${f.repoPath}\` | ${f.errorCount} | ${f.unsafeCastHits} | ${f.suppressionHits} |`)
    }
    lines.push('')
    lines.push('## Notes')
    lines.push('')
    lines.push('- This is a *signal* index. Use `client/.audit-reports/typecheck/typecheck-audit.md` for detailed errors.')
    lines.push('- Priority from config: `client/.audit-reports/typecheck/typecheck-audit-config.json`.')
    lines.push('')
    return lines.join('\n')
  },

  'unused-code'(data, ctx) {
    const files = Array.isArray(data.files) ? data.files : []
    function countByType(issues, type) {
      return issues.filter(i => i.type === type).length
    }
    const priorityOrder = { P0: 0, P1: 1, P2: 2 }
    const sorted = files.slice().sort((a, b) => {
      const ap = priorityOrder[a.priority] ?? 2
      const bp = priorityOrder[b.priority] ?? 2
      if (ap !== bp) return ap - bp
      return (b.score ?? 0) - (a.score ?? 0)
    })
    const lines = []
    lines.push('# Unused Code Audit Summary (Generated)')
    lines.push('')
    lines.push(genFrom(ctx))
    lines.push('')
    lines.push('## Full index (all files)')
    lines.push('')
    lines.push('| File | Priority | Score | Unused Exports | Commented | Unused Functions | TODO Markers |')
    lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: |')
    for (const f of sorted) {
      const issues = f.issues || []
      const priority = f.priority || 'P2'
      lines.push(`| \`${f.repoPath}\` | ${priority} | ${f.score || 0} | ${countByType(issues, 'unused-export')} | ${countByType(issues, 'commented-export')} | ${countByType(issues, 'unused-function')} | ${countByType(issues, 'todo-marker')} |`)
    }
    lines.push('')
    lines.push('## Notes')
    lines.push('')
    lines.push('- This is a *signal* index. Use the full report: `client/.audit-reports/unused-code-audit.md`.')
    lines.push('- Heuristic-based detection may have false positives - manual review required.')
    lines.push('')
    return lines.join('\n')
  },
}
