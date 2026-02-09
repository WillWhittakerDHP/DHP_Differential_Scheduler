import fs from 'node:fs'
import path from 'node:path'

const CWD = path.resolve(process.cwd())
const CLIENT_AUDIT = path.join(CWD, '.audit-reports')
const PROJECT_ROOT_AUDIT = path.join(CWD, 'client', '.audit-reports')
const IS_CLIENT_DIR = fs.existsSync(CLIENT_AUDIT)
const AUDIT_DIR = IS_CLIENT_DIR ? CLIENT_AUDIT : PROJECT_ROOT_AUDIT
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD

const AUDIT_JSON = path.join(AUDIT_DIR, 'todo-aging-audit.json')
const OUT_MD = path.join(AUDIT_DIR, 'todo-aging-audit-summary.md')

function toRepoPath(p) { return path.relative(PROJECT_ROOT, p).replaceAll(path.sep, '/') }

function render(data) {
  const files = Array.isArray(data.files) ? data.files : []
  const totals = data.totals || {}
  const MAX_ROWS = 30
  const lines = []
  lines.push('# TODO Aging Audit Summary (Generated)')
  lines.push('')
  lines.push(`Generated from \`${toRepoPath(AUDIT_JSON)}\`.`)
  lines.push('')
  lines.push(`- Total markers: **${totals.totalMarkers || 0}**`)
  lines.push(`- Ancient (> 180d): **${totals.ancient || 0}** | Stale (90-180d): **${totals.stale || 0}** | Aging (30-90d): ${totals.aging || 0} | Fresh (< 30d): ${totals.fresh || 0}`)
  lines.push(`- Orphaned (no ticket): **${totals.orphaned || 0}**`)
  lines.push('')
  lines.push(`## Top ${Math.min(files.length, MAX_ROWS)} files`)
  lines.push('')
  lines.push('| File | Priority | Score | Total | Ancient | Stale | Orphaned |')
  lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: |')
  for (const f of files.slice(0, MAX_ROWS)) {
    const markers = Array.isArray(f.markers) ? f.markers : []
    const ancient = markers.filter(m => m.category === 'ancient').length
    const stale = markers.filter(m => m.category === 'stale').length
    const orphaned = markers.filter(m => m.orphaned).length
    lines.push(`| \`${f.repoPath}\` | ${f.priority || 'P2'} | ${f.score || 0} | ${markers.length} | ${ancient} | ${stale} | ${orphaned} |`)
  }
  if (files.length > MAX_ROWS) {
    lines.push('')
    lines.push(`*...and ${files.length - MAX_ROWS} more files.*`)
  }
  lines.push('')
  return lines.join('\n')
}

function main() {
  if (!fs.existsSync(AUDIT_JSON)) { console.log('Skipped: run audit:todo-aging first.'); process.exitCode = 0; return }
  const data = JSON.parse(fs.readFileSync(AUDIT_JSON, 'utf8'))
  fs.writeFileSync(OUT_MD, render(data))
  console.log(`Wrote: ${toRepoPath(OUT_MD)}`)
  process.exitCode = 0
}

main()
