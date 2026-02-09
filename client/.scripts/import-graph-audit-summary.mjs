import fs from 'node:fs'
import path from 'node:path'

const CWD = path.resolve(process.cwd())
const CLIENT_AUDIT = path.join(CWD, '.audit-reports')
const PROJECT_ROOT_AUDIT = path.join(CWD, 'client', '.audit-reports')
const IS_CLIENT_DIR = fs.existsSync(CLIENT_AUDIT)
const AUDIT_DIR = IS_CLIENT_DIR ? CLIENT_AUDIT : PROJECT_ROOT_AUDIT
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD

const AUDIT_JSON = path.join(AUDIT_DIR, 'import-graph-audit.json')
const OUT_MD = path.join(AUDIT_DIR, 'import-graph-audit-summary.md')

function toRepoPath(p) { return path.relative(PROJECT_ROOT, p).replaceAll(path.sep, '/') }

function render(data) {
  const MAX_ROWS = 30
  const lines = []
  lines.push('# Import Graph Audit Summary (Generated)')
  lines.push('')
  lines.push(`Generated from \`${toRepoPath(AUDIT_JSON)}\`.`)
  lines.push('')
  lines.push(`- Circular dependencies: **${(data.cycles || []).length}**`)
  lines.push(`- Fan-out violations: **${(data.fanOutViolations || []).length}**`)
  lines.push(`- Fan-in violations: **${(data.fanInViolations || []).length}**`)
  lines.push(`- Cross-boundary imports: **${(data.crossBoundary || []).length}**`)
  lines.push('')

  const files = Array.isArray(data.files) ? data.files : []
  if (files.length > 0) {
    lines.push(`## Top ${Math.min(files.length, MAX_ROWS)} files by score`)
    lines.push('')
    lines.push('| File | Priority | Score |')
    lines.push('| --- | --- | ---: |')
    for (const f of files.slice(0, MAX_ROWS)) {
      lines.push(`| \`${f.file}\` | ${f.priority || 'P2'} | ${f.score || 0} |`)
    }
    if (files.length > MAX_ROWS) {
      lines.push('')
      lines.push(`*...and ${files.length - MAX_ROWS} more files.*`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

function main() {
  if (!fs.existsSync(AUDIT_JSON)) { console.log('Skipped: run audit:import-graph first.'); process.exitCode = 0; return }
  const data = JSON.parse(fs.readFileSync(AUDIT_JSON, 'utf8'))
  fs.writeFileSync(OUT_MD, render(data))
  console.log(`Wrote: ${toRepoPath(OUT_MD)}`)
  process.exitCode = 0
}

main()
