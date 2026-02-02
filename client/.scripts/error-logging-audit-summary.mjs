import fs from 'node:fs'
import path from 'node:path'

// Detect if we're running from client/ or project root
const CWD = path.resolve(process.cwd())
const CLIENT_AUDIT = path.join(CWD, '.audit-reports')
const PROJECT_ROOT_AUDIT = path.join(CWD, 'client', '.audit-reports')
const IS_CLIENT_DIR = fs.existsSync(CLIENT_AUDIT)
const AUDIT_DIR = IS_CLIENT_DIR ? CLIENT_AUDIT : PROJECT_ROOT_AUDIT
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD

const AUDIT_JSON = path.join(AUDIT_DIR, 'error-logging-audit.json')
const OUT_MD = path.join(AUDIT_DIR, 'error-logging-audit-summary.md')

function toRepoPath(absPath) {
  return path.relative(PROJECT_ROOT, absPath).replaceAll(path.sep, '/')
}

function loadJson() {
  if (!fs.existsSync(AUDIT_JSON)) {
    throw new Error(`Audit JSON not found: ${toRepoPath(AUDIT_JSON)}`)
  }
  const raw = fs.readFileSync(AUDIT_JSON, 'utf8')
  return JSON.parse(raw)
}

function render(data) {
  const files = Array.isArray(data.files) ? data.files : []
  const issues = Array.isArray(data.issues) ? data.issues : []

  const lines = []
  lines.push('# Error Logging Audit Summary (Generated)')
  lines.push('')
  lines.push(`Generated from \`${toRepoPath(AUDIT_JSON)}\`.`)
  lines.push('')
  lines.push('## Context')
  lines.push('')
  lines.push(`- **Status**: ${data.status || 'unknown'}`)
  lines.push(`- **Total Issues**: ${issues.length}`)
  lines.push(`- **Files with Issues**: ${files.length}`)
  lines.push(`- **P0 (Silent Catches)**: ${issues.filter(i => i.priority === 'P0').length}`)
  lines.push(`- **P1 (Console in Catches)**: ${issues.filter(i => i.priority === 'P1').length}`)
  lines.push(`- **P2 (All Console)**: ${issues.filter(i => i.priority === 'P2').length}`)
  lines.push('')
  lines.push('## Full index (ranked by priority)')
  lines.push('')
  lines.push('| File | Priority | Score | P0 Issues | P1 Issues | P2 Issues |')
  lines.push('| --- | --- | ---: | ---: | ---: | ---: |')

  for (const f of files) {
    const p0Count = (f.issues || []).filter(i => i.priority === 'P0').length
    const p1Count = (f.issues || []).filter(i => i.priority === 'P1').length
    const p2Count = (f.issues || []).filter(i => i.priority === 'P2').length
    const priority = f.priority || 'P3'
    lines.push(
      `| \`${f.repoPath}\` | ${priority} | ${f.score || 0} | ${p0Count} | ${p1Count} | ${p2Count} |`
    )
  }

  lines.push('')
  lines.push('## Notes')
  lines.push('')
  lines.push('- **P0**: Silent/empty catch blocks - bugs hide here, must fix')
  lines.push('- **P1**: Console usage in catch blocks - inconsistent error handling')
  lines.push('- **P2**: All other console.* in production code - should use logger for control')
  lines.push('- **P3**: Console in migrations/scripts/tests - acceptable, no action needed')
  lines.push('')
  lines.push('- This is a *signal* index. Use the full report for line-level matches and suggestions: `client/.audit-reports/error-logging-audit.md`.')
  lines.push('')
  return lines.join('\n')
}

function main() {
  try {
    const data = loadJson()
    fs.writeFileSync(OUT_MD, render(data))
    const files = Array.isArray(data.files) ? data.files : []
    console.log(`Wrote: ${toRepoPath(OUT_MD)} (files: ${files.length})`)
    process.exitCode = 0
  } catch (error) {
    console.error(`Error generating summary: ${error instanceof Error ? error.message : String(error)}`)
    process.exitCode = 1
  }
}

main()
