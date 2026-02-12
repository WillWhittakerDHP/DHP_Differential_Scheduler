import fs from 'node:fs'
import path from 'node:path'

const CWD = path.resolve(process.cwd())
const CLIENT_AUDIT = path.join(CWD, '.audit-reports')
const PROJECT_ROOT_AUDIT = path.join(CWD, 'client', '.audit-reports')
const IS_CLIENT_DIR = fs.existsSync(CLIENT_AUDIT)
const AUDIT_DIR = IS_CLIENT_DIR ? CLIENT_AUDIT : PROJECT_ROOT_AUDIT
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD

const AUDIT_JSON = path.join(AUDIT_DIR, 'coverage-risk-crossref-audit.json')
const OUT_MD = path.join(AUDIT_DIR, 'coverage-risk-crossref-audit-summary.md')

function toRepoPath(p) { return path.relative(PROJECT_ROOT, p).replaceAll(path.sep, '/') }

function render(data) {
  const lines = []
  lines.push('# Coverage-Risk Crossref Audit Summary (Generated)')
  lines.push('')
  lines.push(`Generated from \`${toRepoPath(AUDIT_JSON)}\`.`)
  lines.push('')
  if (data.error) {
    lines.push(`**Error:** ${data.error}`)
    lines.push('')
    return lines.join('\n')
  }
  const summary = data.summary || {}
  lines.push(`- High fan-in untested: **${summary.highFanInUntested ?? 0}**`)
  lines.push(`- High fan-in tested: **${summary.highFanInTested ?? 0}**`)
  lines.push(`- Coverage of critical files: **${summary.coverageOfCriticalFiles ?? 'N/A'}**`)
  lines.push(`- Risk files: **${summary.totalRiskFiles ?? 0}**`)
  lines.push('')
  const riskFiles = Array.isArray(data.riskFiles) ? data.riskFiles : []
  const top = riskFiles.slice(0, 20)
  if (top.length > 0) {
    lines.push('## Top 20 risk files')
    lines.push('')
    lines.push('| File | Fan-in | Has test | Risk score | Priority |')
    lines.push('| --- | ---: | --- | ---: | --- |')
    for (const f of top) {
      lines.push(`| \`${f.repoPath}\` | ${f.fanIn} | ${f.hasTest ? 'Yes' : 'No'} | ${f.riskScore} | ${f.priority} |`)
    }
    lines.push('')
  }
  return lines.join('\n')
}

function main() {
  if (!fs.existsSync(AUDIT_JSON)) {
    console.log('Skipped: run audit:coverage-risk-crossref first.')
    process.exitCode = 0
    return
  }
  const data = JSON.parse(fs.readFileSync(AUDIT_JSON, 'utf8'))
  fs.writeFileSync(OUT_MD, render(data))
  console.log('Wrote:', toRepoPath(OUT_MD))
  process.exitCode = 0
}

main()
