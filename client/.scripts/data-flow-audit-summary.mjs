import fs from 'node:fs'
import path from 'node:path'

const CWD = path.resolve(process.cwd())
const CLIENT_AUDIT = path.join(CWD, '.audit-reports')
const PROJECT_ROOT_AUDIT = path.join(CWD, 'client', '.audit-reports')
const IS_CLIENT_DIR = fs.existsSync(CLIENT_AUDIT)
const AUDIT_DIR = IS_CLIENT_DIR ? CLIENT_AUDIT : PROJECT_ROOT_AUDIT
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD

const AUDIT_JSON = path.join(AUDIT_DIR, 'data-flow-audit.json')
const OUT_MD = path.join(AUDIT_DIR, 'data-flow-audit-summary.md')

function toRepoPath(p) { return path.relative(PROJECT_ROOT, p).replaceAll(path.sep, '/') }

function render(data) {
  const lines = []
  lines.push('# Data Flow Audit Summary (Generated)')
  lines.push('')
  lines.push(`Generated from \`${toRepoPath(AUDIT_JSON)}\`.`)
  lines.push('')
  const summary = data.exceptionSummary || {}
  lines.push(`- Requiring review: **${summary.totalRequiresReview ?? 0}**`)
  lines.push(`- Allowed: **${summary.totalAllowed ?? 0}**`)
  lines.push('')
  const files = Array.isArray(data.files) ? data.files : []
  if (files.length > 0) {
    lines.push('| File | Count | Priority |')
    lines.push('| --- | ---: | --- |')
    for (const f of files.slice(0, 25)) {
      lines.push(`| \`${f.repoPath}\` | ${f.count ?? 0} | ${f.priority ?? 'P2'} |`)
    }
    lines.push('')
  }
  return lines.join('\n')
}

function main() {
  if (!fs.existsSync(AUDIT_JSON)) {
    console.log('Skipped: run audit:data-flow first.')
    process.exitCode = 0
    return
  }
  const data = JSON.parse(fs.readFileSync(AUDIT_JSON, 'utf8'))
  fs.writeFileSync(OUT_MD, render(data))
  console.log('Wrote:', toRepoPath(OUT_MD))
  process.exitCode = 0
}

main()
