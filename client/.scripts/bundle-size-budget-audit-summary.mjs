import fs from 'node:fs'
import path from 'node:path'

const CWD = path.resolve(process.cwd())
const CLIENT_AUDIT = path.join(CWD, '.audit-reports')
const PROJECT_ROOT_AUDIT = path.join(CWD, 'client', '.audit-reports')
const IS_CLIENT_DIR = fs.existsSync(CLIENT_AUDIT)
const AUDIT_DIR = IS_CLIENT_DIR ? CLIENT_AUDIT : PROJECT_ROOT_AUDIT
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD

const AUDIT_JSON = path.join(AUDIT_DIR, 'bundle-size-budget-audit.json')
const OUT_MD = path.join(AUDIT_DIR, 'bundle-size-budget-audit-summary.md')

function toRepoPath(p) { return path.relative(PROJECT_ROOT, p).replaceAll(path.sep, '/') }

function render(data) {
  const lines = []
  lines.push('# Bundle Size Budget Audit Summary (Generated)')
  lines.push('')
  lines.push(`Generated from \`${toRepoPath(AUDIT_JSON)}\`.`)
  lines.push('')
  if (data.error) {
    lines.push(`**Error:** ${data.error}`)
    lines.push('')
    return lines.join('\n')
  }
  const totals = data.totals || {}
  const budgetResults = data.budgetResults || {}
  const allPass = Object.values(budgetResults).every(b => b.pass)
  lines.push(`- Chunks: **${data.totalScanned || 0}**`)
  lines.push(`- Total JS (gzip): **${(totals.totalJsKb ?? 0).toFixed(1)} KB**`)
  lines.push(`- Total CSS (gzip): **${(totals.totalCssKb ?? 0).toFixed(1)} KB**`)
  lines.push(`- Budgets: **${allPass ? 'All pass' : 'Violations'}**`)
  lines.push('')
  lines.push('| Budget | Limit | Actual | Pass |')
  lines.push('| --- | ---: | ---: | --- |')
  for (const [key, b] of Object.entries(budgetResults)) {
    lines.push(`| ${key} | ${b.budget} KB | ${b.actual.toFixed(1)} KB | ${b.pass ? 'Yes' : 'No'} |`)
  }
  lines.push('')
  return lines.join('\n')
}

function main() {
  if (!fs.existsSync(AUDIT_JSON)) {
    console.log('Skipped: run audit:bundle-size-budget first.')
    process.exitCode = 0
    return
  }
  const data = JSON.parse(fs.readFileSync(AUDIT_JSON, 'utf8'))
  fs.writeFileSync(OUT_MD, render(data))
  console.log('Wrote:', toRepoPath(OUT_MD))
  process.exitCode = 0
}

main()
