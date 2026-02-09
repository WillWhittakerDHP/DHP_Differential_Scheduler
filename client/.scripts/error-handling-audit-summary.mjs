import fs from 'node:fs'
import path from 'node:path'

const CWD = path.resolve(process.cwd())
const CLIENT_AUDIT = path.join(CWD, '.audit-reports')
const PROJECT_ROOT_AUDIT = path.join(CWD, 'client', '.audit-reports')
const IS_CLIENT_DIR = fs.existsSync(CLIENT_AUDIT)
const AUDIT_DIR = IS_CLIENT_DIR ? CLIENT_AUDIT : PROJECT_ROOT_AUDIT
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD

const AUDIT_JSON = path.join(AUDIT_DIR, 'error-handling-audit.json')
const OUT_MD = path.join(AUDIT_DIR, 'error-handling-audit-summary.md')

function toRepoPath(absPath) {
  return path.relative(PROJECT_ROOT, absPath).replaceAll(path.sep, '/')
}

function render(data) {
  const files = Array.isArray(data.files) ? data.files : []
  const MAX_ROWS = 30

  const lines = []
  lines.push('# Error Handling Audit Summary (Generated)')
  lines.push('')
  lines.push(`Generated from \`${toRepoPath(AUDIT_JSON)}\`.`)
  lines.push('')

  const summary = data.exceptionSummary || {}
  lines.push(`- Requiring review: **${summary.totalRequiresReview || 0}**`)
  lines.push(`- Allowed exceptions: ${summary.totalAllowed || 0}`)
  lines.push('')

  lines.push(`## Top ${Math.min(files.length, MAX_ROWS)} files (ranked by score)`)
  lines.push('')
  lines.push('| File | Priority | Score | P0 | P1 | P2 |')
  lines.push('| --- | --- | ---: | ---: | ---: | ---: |')

  const shown = files.slice(0, MAX_ROWS)
  for (const f of shown) {
    const review = Array.isArray(f.requiresReview) ? f.requiresReview : []
    const counts = { P0: 0, P1: 0, P2: 0 }
    for (const m of review) {
      if (['empty-catch', 'silent-catch-promise', 'catch-comment-only'].includes(m.ruleId)) counts.P0++
      else if (['console-in-catch', 'ts-ignore', 'ts-expect-error', 'as-any', 'eslint-disable'].includes(m.ruleId)) counts.P1++
      else counts.P2++
    }
    lines.push(`| \`${f.repoPath}\` | ${f.priority || 'P2'} | ${f.score || 0} | ${counts.P0} | ${counts.P1} | ${counts.P2} |`)
  }

  if (files.length > MAX_ROWS) {
    lines.push('')
    lines.push(`*...and ${files.length - MAX_ROWS} more files. See full report for details.*`)
  }

  lines.push('')
  lines.push('## Notes')
  lines.push('')
  lines.push('- P0: Silent error swallowing (empty catch, silent .catch())')
  lines.push('- P1: Console in catch blocks, type suppressions (@ts-ignore, as any)')
  lines.push('- P2: General console usage')
  lines.push('')
  return lines.join('\n')
}

function main() {
  const raw = fs.readFileSync(AUDIT_JSON, 'utf8')
  const data = JSON.parse(raw)
  fs.writeFileSync(OUT_MD, render(data))
  const files = Array.isArray(data.files) ? data.files : []
  console.log(`Wrote: ${toRepoPath(OUT_MD)} (files: ${files.length})`)
  process.exitCode = 0
}

main()
