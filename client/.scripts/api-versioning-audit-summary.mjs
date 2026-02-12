import fs from 'node:fs'
import path from 'node:path'

const CWD = path.resolve(process.cwd())
const CLIENT_AUDIT = path.join(CWD, '.audit-reports')
const PROJECT_ROOT_AUDIT = path.join(CWD, 'client', '.audit-reports')
const IS_CLIENT_DIR = fs.existsSync(CLIENT_AUDIT)
const AUDIT_DIR = IS_CLIENT_DIR ? CLIENT_AUDIT : PROJECT_ROOT_AUDIT
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD

const AUDIT_JSON = path.join(AUDIT_DIR, 'api-versioning-audit.json')
const OUT_MD = path.join(AUDIT_DIR, 'api-versioning-audit-summary.md')

function toRepoPath(p) { return path.relative(PROJECT_ROOT, p).replaceAll(path.sep, '/') }

function render(data) {
  const lines = []
  lines.push('# API Versioning Audit Summary (Generated)')
  lines.push('')
  lines.push(`Generated from \`${toRepoPath(AUDIT_JSON)}\`.`)
  lines.push('')
  if (data.error) {
    lines.push(`**Error:** ${data.error}`)
    lines.push('')
    return lines.join('\n')
  }
  const summary = data.summary || {}
  lines.push(`- Breaking: **${summary.breaking ?? 0}**`)
  lines.push(`- Non-breaking: **${summary.nonBreaking ?? 0}**`)
  lines.push(`- Unchanged: **${summary.unchanged ?? 0}**`)
  lines.push('')
  const breaking = Array.isArray(data.breakingChanges) ? data.breakingChanges : []
  if (breaking.length > 0) {
    lines.push('## Breaking changes')
    lines.push('')
    for (const b of breaking) {
      lines.push(`- \`${b.endpoint}\` (${b.type})`)
    }
    lines.push('')
  }
  return lines.join('\n')
}

function main() {
  if (!fs.existsSync(AUDIT_JSON)) {
    console.log('Skipped: run audit:api-versioning first.')
    process.exitCode = 0
    return
  }
  const data = JSON.parse(fs.readFileSync(AUDIT_JSON, 'utf8'))
  fs.writeFileSync(OUT_MD, render(data))
  console.log('Wrote:', toRepoPath(OUT_MD))
  process.exitCode = 0
}

main()
