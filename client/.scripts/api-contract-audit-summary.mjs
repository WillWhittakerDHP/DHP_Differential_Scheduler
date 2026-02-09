import fs from 'node:fs'
import path from 'node:path'

const CWD = path.resolve(process.cwd())
const CLIENT_AUDIT = path.join(CWD, '.audit-reports')
const PROJECT_ROOT_AUDIT = path.join(CWD, 'client', '.audit-reports')
const IS_CLIENT_DIR = fs.existsSync(CLIENT_AUDIT)
const AUDIT_DIR = IS_CLIENT_DIR ? CLIENT_AUDIT : PROJECT_ROOT_AUDIT
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD

const AUDIT_JSON = path.join(AUDIT_DIR, 'api-contract-audit.json')
const OUT_MD = path.join(AUDIT_DIR, 'api-contract-audit-summary.md')

function toRepoPath(p) { return path.relative(PROJECT_ROOT, p).replaceAll(path.sep, '/') }

function render(data) {
  const findings = Array.isArray(data.findings) ? data.findings : []
  const lines = []
  lines.push('# API Contract Audit Summary (Generated)')
  lines.push('')
  lines.push(`Generated from \`${toRepoPath(AUDIT_JSON)}\`.`)
  lines.push('')
  lines.push(`- Client endpoints: **${data.clientEndpoints || 0}**`)
  lines.push(`- Server routes: **${data.serverEndpoints || 0}**`)
  lines.push(`- Shared types: **${(data.sharedTypes || []).length}**`)
  lines.push(`- Findings: **${findings.length}**`)
  lines.push('')

  const byCat = {}
  for (const f of findings) { byCat[f.type] = (byCat[f.type] || 0) + 1 }

  lines.push('## Findings by type')
  lines.push('')
  lines.push('| Category | Count |')
  lines.push('| --- | ---: |')
  for (const [type, count] of Object.entries(byCat).sort((a, b) => b[1] - a[1])) {
    lines.push(`| ${type} | ${count} |`)
  }
  lines.push('')
  return lines.join('\n')
}

function main() {
  if (!fs.existsSync(AUDIT_JSON)) { console.log('Skipped: run audit:api-contract first.'); process.exitCode = 0; return }
  const data = JSON.parse(fs.readFileSync(AUDIT_JSON, 'utf8'))
  fs.writeFileSync(OUT_MD, render(data))
  console.log(`Wrote: ${toRepoPath(OUT_MD)}`)
  process.exitCode = 0
}

main()
