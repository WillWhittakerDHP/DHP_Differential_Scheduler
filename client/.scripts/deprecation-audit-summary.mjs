import fs from 'node:fs'
import path from 'node:path'

/**
 * Deprecation & Legacy Accommodation Audit Summary Script
 *
 * Generates a condensed summary from the expanded deprecation audit JSON output.
 * Covers both annotated deprecations and runtime legacy accommodation patterns.
 */

const CWD = path.resolve(process.cwd())
const CLIENT_AUDIT = path.join(CWD, '.audit-reports')
const PROJECT_ROOT_AUDIT = path.join(CWD, 'client', '.audit-reports')
const IS_CLIENT_DIR = fs.existsSync(CLIENT_AUDIT)
const AUDIT_DIR = IS_CLIENT_DIR ? CLIENT_AUDIT : PROJECT_ROOT_AUDIT
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD

const AUDIT_JSON = path.join(AUDIT_DIR, 'deprecation-audit.json')
const OUT_MD = path.join(AUDIT_DIR, 'deprecation-audit-summary.md')

function toRepoPath(absPath) {
  return path.relative(PROJECT_ROOT, absPath).replaceAll(path.sep, '/')
}

function render(data) {
  const files = Array.isArray(data.files) ? data.files : []
  const summary = data.exceptionSummary || {}
  const MAX_ROWS = 30

  const lines = []
  lines.push('# Deprecation & Legacy Accommodation Audit Summary (Generated)')
  lines.push('')
  lines.push(`Generated from \`${toRepoPath(AUDIT_JSON)}\`.`)
  lines.push('')
  lines.push(`- Files with findings: **${files.length}**`)
  lines.push(`- Requiring review: **${summary.totalRequiresReview || 0}**`)
  lines.push(`- Allowed exceptions: ${summary.totalAllowed || 0}`)
  lines.push('')

  // Count by section across all files
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

  lines.push(`## Top ${Math.min(files.length, MAX_ROWS)} files (ranked by score)`)
  lines.push('')
  lines.push('| File | Priority | Score | Annotations | Legacy/Compat |')
  lines.push('| --- | --- | ---: | ---: | ---: |')

  const shown = files.slice(0, MAX_ROWS)
  for (const f of shown) {
    const review = Array.isArray(f.requiresReview) ? f.requiresReview : []
    const ann = review.filter(m => m.section === 'annotation').length
    const leg = review.filter(m => m.section === 'legacy-accommodation').length
    lines.push(`| \`${f.repoPath}\` | ${f.priority || 'P2'} | ${f.score || 0} | ${ann} | ${leg} |`)
  }

  if (files.length > MAX_ROWS) {
    lines.push('')
    lines.push(`*...and ${files.length - MAX_ROWS} more files. See full report for details.*`)
  }

  lines.push('')
  lines.push('## Notes')
  lines.push('')
  lines.push('- **Annotations**: `@deprecated`, `// Deprecated`, `(deprecated)`, `// LEGACY:`, compat markers')
  lines.push('- **Legacy/Compat**: Runtime keywords, `|| \'\'`, `?? \'\'`, default params, chaining fallbacks')
  lines.push('- See full report: `client/.audit-reports/deprecation-audit.md`')
  lines.push('')
  return lines.join('\n')
}

function main() {
  if (!fs.existsSync(AUDIT_JSON)) {
    console.log(`Skipped: ${toRepoPath(AUDIT_JSON)} not found. Run audit:deprecation first.`)
    process.exitCode = 0
    return
  }

  const raw = fs.readFileSync(AUDIT_JSON, 'utf8')
  const data = JSON.parse(raw)
  fs.writeFileSync(OUT_MD, render(data))
  const files = Array.isArray(data.files) ? data.files : []
  console.log(`Wrote: ${toRepoPath(OUT_MD)} (files: ${files.length})`)
  process.exitCode = 0
}

main()
