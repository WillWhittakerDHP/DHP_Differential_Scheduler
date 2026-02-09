import fs from 'node:fs'
import path from 'node:path'

const CWD = path.resolve(process.cwd())
const CLIENT_AUDIT = path.join(CWD, '.audit-reports')
const PROJECT_ROOT_AUDIT = path.join(CWD, 'client', '.audit-reports')
const IS_CLIENT_DIR = fs.existsSync(CLIENT_AUDIT)
const AUDIT_DIR = IS_CLIENT_DIR ? CLIENT_AUDIT : PROJECT_ROOT_AUDIT
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD

const AUDIT_JSON = path.join(AUDIT_DIR, 'constants-consolidation-audit.json')
const OUT_MD = path.join(AUDIT_DIR, 'constants-consolidation-audit-summary.md')

function toRepoPath(absPath) {
  return path.relative(PROJECT_ROOT, absPath).replaceAll(path.sep, '/')
}

function render(data) {
  const groups = Array.isArray(data.consolidationGroups) ? data.consolidationGroups : []
  const MAX_ROWS = 30

  const lines = []
  lines.push('# Constants Consolidation Audit Summary (Generated)')
  lines.push('')
  lines.push(`Generated from \`${toRepoPath(AUDIT_JSON)}\`.`)
  lines.push('')

  const summary = data.exceptionSummary || {}
  lines.push(`- Constants files scanned: **${data.totalConstantsFiles || 0}**`)
  lines.push(`- Total exports scanned: **${data.totalExportsScanned || 0}**`)
  lines.push(`- Consolidation groups: **${groups.length}**`)
  lines.push(`- Requiring review: **${summary.totalRequiresReview || 0}**`)
  lines.push(`- Allowed exceptions: ${summary.totalAllowed || 0}`)
  lines.push('')

  // Sort by score
  const sortedGroups = [...groups].sort((a, b) => b.score - a.score)

  lines.push(`## Top ${Math.min(sortedGroups.length, MAX_ROWS)} Consolidation Groups (ranked by score)`)
  lines.push('')
  lines.push('| Classification | Priority | Score | Description | Locations |')
  lines.push('| --- | --- | ---: | --- | ---: |')

  const shown = sortedGroups.slice(0, MAX_ROWS)
  for (const group of shown) {
    const priority = group.priority || 'P2'
    const locCount = Array.isArray(group.locations) ? group.locations.length : 0
    lines.push(
      `| ${group.classification} | ${priority} | ${group.score} | ${group.description} | ${locCount} |`
    )
  }

  if (sortedGroups.length > MAX_ROWS) {
    lines.push('')
    lines.push(`*...and ${sortedGroups.length - MAX_ROWS} more groups. See full report for details.*`)
  }

  lines.push('')
  lines.push('## Notes')
  lines.push('')
  lines.push('- **HOIST**: Identical values that should be moved to shared constants')
  lines.push('- **TEMPLATE**: Structural patterns that could use factory functions or base templates')
  lines.push('- **ENUM**: Related values that should be grouped into enums or const objects')
  lines.push('- **P0** (score >= 20): Immediate consolidation target')
  lines.push('- **P1** (score >= 10): Should consolidate soon')
  lines.push('- **P2** (score < 10): Nice to have')
  lines.push('')

  return lines.join('\n')
}

function main() {
  const raw = fs.readFileSync(AUDIT_JSON, 'utf8')
  const data = JSON.parse(raw)
  fs.writeFileSync(OUT_MD, render(data))
  const groups = Array.isArray(data.consolidationGroups) ? data.consolidationGroups : []
  console.log(`Wrote: ${toRepoPath(OUT_MD)} (groups: ${groups.length})`)
  process.exitCode = 0
}

main()
