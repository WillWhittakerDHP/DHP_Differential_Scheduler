import fs from 'node:fs'
import path from 'node:path'

// Detect if we're running from client/ or project root
const CWD = path.resolve(process.cwd())
const CLIENT_AUDIT = path.join(CWD, '.audit-reports')
const PROJECT_ROOT_AUDIT = path.join(CWD, 'client', '.audit-reports')
const IS_CLIENT_DIR = fs.existsSync(CLIENT_AUDIT)
const AUDIT_DIR = IS_CLIENT_DIR ? CLIENT_AUDIT : PROJECT_ROOT_AUDIT
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD

const AUDIT_JSON = path.join(AUDIT_DIR, 'test-audit.json')
const OUT_MD = path.join(AUDIT_DIR, 'test-audit-summary.md')

function toRepoPath(absPath) {
  return path.relative(PROJECT_ROOT, absPath).replaceAll(path.sep, '/')
}

function loadJson() {
  if (!fs.existsSync(AUDIT_JSON)) {
    console.error(`Error: Test audit JSON not found at ${AUDIT_JSON}`)
    console.error(`Please run 'npm run audit:test' first to generate the audit data.`)
    process.exit(1)
  }
  const raw = fs.readFileSync(AUDIT_JSON, 'utf8')
  return JSON.parse(raw)
}

function renderSummary(data) {
  const lines = []
  lines.push('# Test Audit Summary (Generated)')
  lines.push('')
  lines.push(`Generated from \`${toRepoPath(AUDIT_JSON)}\`.`)
  lines.push('')
  lines.push('## Quick Stats')
  lines.push('')
  lines.push(`- **Coverage**: ${data.summary.coveragePercentage}%`)
  lines.push(`- **Untested**: ${data.summary.untestedSourceFiles} files`)
  lines.push(`- **Orphaned**: ${data.summary.orphanedTestFiles} tests`)
  lines.push('')
  
  lines.push('## Top Untested Files (by Priority Score)')
  lines.push('')
  lines.push('Files sorted by **Priority Score** (weighted: Reliability 40%, ROI 30%, Independence 20%, Cognitive Load 10%).')
  lines.push('')
  lines.push('| File | Priority | Reliability | ROI | Exports |')
  lines.push('| --- | ---: | ---: | ---: | ---: |')
  
  const topUntested = data.untestedSource
    .filter(s => s.exportCount > 0)
    .sort((a, b) => (b.priority?.overall || 0) - (a.priority?.overall || 0))
    .slice(0, 20)
  
  for (const s of topUntested) {
    const p = s.priority || {}
    lines.push(`| \`${s.repoPath}\` | **${p.overall?.toFixed(1) || 'N/A'}** | ${p.reliability || 0} | ${p.roi || 0} | ${s.exportCount} |`)
  }
  
  lines.push('')
  lines.push('## Full Report')
  lines.push('')
  lines.push(`See \`${toRepoPath(AUDIT_DIR)}/test-audit.md\` for the complete analysis.`)
  lines.push('')
  
  return lines.join('\n')
}

function main() {
  const data = loadJson()
  fs.writeFileSync(OUT_MD, renderSummary(data))
  console.log(`Wrote: ${toRepoPath(OUT_MD)}`)
}

main()
