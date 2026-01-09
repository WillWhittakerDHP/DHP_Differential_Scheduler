import fs from 'node:fs'
import path from 'node:path'

// Detect if we're running from client/ or project root
const CWD = path.resolve(process.cwd())
const CLIENT_AUDIT = path.join(CWD, '.audit-reports')
const PROJECT_ROOT_AUDIT = path.join(CWD, 'client', '.audit-reports')
const IS_CLIENT_DIR = fs.existsSync(CLIENT_AUDIT)
const AUDIT_DIR = IS_CLIENT_DIR ? CLIENT_AUDIT : PROJECT_ROOT_AUDIT
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD

const AUDIT_JSON = path.join(AUDIT_DIR, 'duplication-audit.json')
const OUT_MD = path.join(AUDIT_DIR, 'duplication-audit-summary.md')

function toRepoPath(absPath) {
  return path.relative(PROJECT_ROOT, absPath).replaceAll(path.sep, '/')
}

function loadJson() {
  const raw = fs.readFileSync(AUDIT_JSON, 'utf8')
  return JSON.parse(raw)
}

function render(data) {
  const groups = Array.isArray(data.groups) ? data.groups : []

  const lines = []
  lines.push('# Duplication Audit Summary (Generated)')
  lines.push('')
  lines.push(`Generated from \`${toRepoPath(AUDIT_JSON)}\`.`)
  lines.push('')
  lines.push('## Index (ranked)')
  lines.push('')
  lines.push('| Group | unique files | occurrences | lineCount | sample locations |')
  lines.push('| --- | ---: | ---: | ---: | --- |')
  for (const g of groups) {
    const sample = Array.isArray(g.locations)
      ? g.locations.slice(0, 3).map(l => `\`${l.repoPath}@${l.startLine}\``).join(', ')
      : ''
    lines.push(`| \`${g.groupId}\` | ${g.uniqueFiles || 0} | ${g.occurrences || 0} | ${g.lineCount || 0} | ${sample}${g.locations?.length > 3 ? ', …' : ''} |`)
  }

  lines.push('')
  lines.push('## Notes')
  lines.push('')
  lines.push('- This is a *signal* index. Use the full report for per-group snippets and locations: `client/.audit/duplication-audit.md`.')
  lines.push('')
  return lines.join('\n')
}

function main() {
  const data = loadJson()
  fs.writeFileSync(OUT_MD, render(data))
  const groups = Array.isArray(data.groups) ? data.groups : []
  console.log(`Wrote: ${toRepoPath(OUT_MD)} (groups: ${groups.length})`)
  process.exitCode = 0
}

main()


