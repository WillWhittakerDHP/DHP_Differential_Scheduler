import fs from 'node:fs'
import path from 'node:path'

// Detect if we're running from client/ or project root
const CWD = path.resolve(process.cwd())
const CLIENT_AUDIT = path.join(CWD, '.audit-reports')
const PROJECT_ROOT_AUDIT = path.join(CWD, 'client', '.audit-reports')
const IS_CLIENT_DIR = fs.existsSync(CLIENT_AUDIT)
const AUDIT_DIR = IS_CLIENT_DIR ? CLIENT_AUDIT : PROJECT_ROOT_AUDIT
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD

const AUDIT_JSON = path.join(AUDIT_DIR, 'unused-code-audit.json')
const OUT_MD = path.join(AUDIT_DIR, 'unused-code-audit-summary.md')

function toRepoPath(absPath) {
  return path.relative(PROJECT_ROOT, absPath).replaceAll(path.sep, '/')
}

function loadJson() {
  const raw = fs.readFileSync(AUDIT_JSON, 'utf8')
  return JSON.parse(raw)
}

function countIssuesByType(issues, type) {
  return issues.filter(i => i.type === type).length
}

function renderIndex(files) {
  const lines = []
  lines.push('# Unused Code Audit Summary (Generated)')
  lines.push('')
  lines.push(`Generated from \`${toRepoPath(AUDIT_JSON)}\`.`)
  lines.push('')
  lines.push('## Full index (all files)')
  lines.push('')
  lines.push('| File | Priority | Score | Unused Exports | Commented | Unused Functions | TODO Markers |')
  lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: |')

  // Sort by priority (P0 first), then by score
  const priorityOrder = { P0: 0, P1: 1, P2: 2 }
  const sortedFiles = files.sort((a, b) => {
    const aPriority = priorityOrder[a.priority] ?? 2
    const bPriority = priorityOrder[b.priority] ?? 2
    if (aPriority !== bPriority) return aPriority - bPriority
    return b.score - a.score
  })

  for (const f of sortedFiles) {
    const issues = f.issues || []
    const priority = f.priority || 'P2'
    const unusedExports = countIssuesByType(issues, 'unused-export')
    const commented = countIssuesByType(issues, 'commented-export')
    const unusedFunctions = countIssuesByType(issues, 'unused-function')
    const todoMarkers = countIssuesByType(issues, 'todo-marker')
    
    lines.push(
      `| \`${f.repoPath}\` | ${priority} | ${f.score || 0} | ${unusedExports} | ${commented} | ${unusedFunctions} | ${todoMarkers} |`
    )
  }

  lines.push('')
  lines.push('## Notes')
  lines.push('')
  lines.push('- This is a *signal* index, not a semantic judgement. Some exports may be intentionally unused (e.g., public API, future use).')
  lines.push('- Use the full line-level report for exact match lines: `client/.audit-reports/unused-code-audit.md`.')
  lines.push('- Heuristic-based detection may have false positives - manual review required.')
  lines.push('')
  return lines.join('\n')
}

function main() {
  const data = loadJson()
  const files = Array.isArray(data.files) ? data.files : []
  fs.writeFileSync(OUT_MD, renderIndex(files))
   
  console.log(`Wrote: ${toRepoPath(OUT_MD)} (files: ${files.length})`)
}

main()
