import fs from 'node:fs'
import path from 'node:path'

const CWD = path.resolve(process.cwd())
const CLIENT_AUDIT = path.join(CWD, '.audit-reports')
const PROJECT_ROOT_AUDIT = path.join(CWD, 'client', '.audit-reports')
const IS_CLIENT_DIR = fs.existsSync(CLIENT_AUDIT)
const AUDIT_DIR = IS_CLIENT_DIR ? CLIENT_AUDIT : PROJECT_ROOT_AUDIT
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD

const AUDIT_JSON = path.join(AUDIT_DIR, 'file-cohesion-audit.json')
const OUT_MD = path.join(AUDIT_DIR, 'file-cohesion-audit-summary.md')

function toRepoPath(p) { return path.relative(PROJECT_ROOT, p).replaceAll(path.sep, '/') }

function render(data) {
  const files = Array.isArray(data.files) ? data.files : []
  const MAX_ROWS = 30
  const lines = []
  lines.push('# File Cohesion Audit Summary (Generated)')
  lines.push('')
  lines.push(`Generated from \`${toRepoPath(AUDIT_JSON)}\`.`)
  lines.push('')
  lines.push(`- Files with violations: **${files.length}**`)
  lines.push('')
  lines.push(`## Top ${Math.min(files.length, MAX_ROWS)} files`)
  lines.push('')
  lines.push('| File | Category | Priority | Score | Lines | Exports | Violations |')
  lines.push('| --- | --- | --- | ---: | ---: | ---: | --- |')
  for (const f of files.slice(0, MAX_ROWS)) {
    const violations = Array.isArray(f.violations) ? f.violations : []
    const vNames = violations.map(v => v.rule).join(', ')
    lines.push(`| \`${f.repoPath}\` | ${f.category || '-'} | ${f.priority || 'P2'} | ${f.score || 0} | ${f.lineCount || 0} | ${f.exportCount || 0} | ${vNames} |`)
  }
  if (files.length > MAX_ROWS) {
    lines.push('')
    lines.push(`*...and ${files.length - MAX_ROWS} more files.*`)
  }
  lines.push('')
  return lines.join('\n')
}

function main() {
  if (!fs.existsSync(AUDIT_JSON)) { console.log('Skipped: run audit:file-cohesion first.'); process.exitCode = 0; return }
  const data = JSON.parse(fs.readFileSync(AUDIT_JSON, 'utf8'))
  fs.writeFileSync(OUT_MD, render(data))
  console.log(`Wrote: ${toRepoPath(OUT_MD)}`)
  process.exitCode = 0
}

main()
