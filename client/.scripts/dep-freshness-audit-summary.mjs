import fs from 'node:fs'
import path from 'node:path'

const CWD = path.resolve(process.cwd())
const CLIENT_AUDIT = path.join(CWD, '.audit-reports')
const PROJECT_ROOT_AUDIT = path.join(CWD, 'client', '.audit-reports')
const IS_CLIENT_DIR = fs.existsSync(CLIENT_AUDIT)
const AUDIT_DIR = IS_CLIENT_DIR ? CLIENT_AUDIT : PROJECT_ROOT_AUDIT
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD

const AUDIT_JSON = path.join(AUDIT_DIR, 'dep-freshness-audit.json')
const OUT_MD = path.join(AUDIT_DIR, 'dep-freshness-audit-summary.md')

function toRepoPath(p) { return path.relative(PROJECT_ROOT, p).replaceAll(path.sep, '/') }

function render(data) {
  const lines = []
  lines.push('# Dep Freshness Audit Summary (Generated)')
  lines.push('')
  lines.push(`Generated from \`${toRepoPath(AUDIT_JSON)}\`.`)
  lines.push('')
  const byBehind = data.byBehind || {}
  lines.push(`- Major behind: **${byBehind['major-behind'] ?? 0}**`)
  lines.push(`- Minor behind: **${byBehind['minor-behind'] ?? 0}**`)
  lines.push(`- Patch behind: **${byBehind['patch-behind'] ?? 0}**`)
  lines.push(`- Total outdated: **${data.totalScanned ?? 0}**`)
  lines.push('')
  const packages = Array.isArray(data.packages) ? data.packages : []
  const major = packages.filter(p => p.behind === 'major-behind').slice(0, 15)
  if (major.length > 0) {
    lines.push('## Major behind')
    lines.push('')
    for (const p of major) {
      lines.push(`- \`${p.package}\` (${p.dependent}): ${p.current} → ${p.latest}`)
    }
    lines.push('')
  }
  return lines.join('\n')
}

function main() {
  if (!fs.existsSync(AUDIT_JSON)) {
    console.log('Skipped: run audit:dep-freshness first.')
    process.exitCode = 0
    return
  }
  const data = JSON.parse(fs.readFileSync(AUDIT_JSON, 'utf8'))
  fs.writeFileSync(OUT_MD, render(data))
  console.log('Wrote:', toRepoPath(OUT_MD))
  process.exitCode = 0
}

main()
