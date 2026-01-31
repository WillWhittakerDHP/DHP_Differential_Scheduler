import fs from 'node:fs'
import path from 'node:path'

// Detect if we're running from client/ or project root
const CWD = path.resolve(process.cwd())
const CLIENT_AUDIT = path.join(CWD, '.audit-reports')
const PROJECT_ROOT_AUDIT = path.join(CWD, 'client', '.audit-reports')
const IS_CLIENT_DIR = fs.existsSync(CLIENT_AUDIT)
const AUDIT_DIR = IS_CLIENT_DIR ? CLIENT_AUDIT : PROJECT_ROOT_AUDIT
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD

const AUDIT_JSON = path.join(AUDIT_DIR, 'security-audit.json')
const OUT_MD = path.join(AUDIT_DIR, 'security-audit-summary.md')

function toRepoPath(absPath) {
  return path.relative(PROJECT_ROOT, absPath).replaceAll(path.sep, '/')
}

function loadJson() {
  const raw = fs.readFileSync(AUDIT_JSON, 'utf8')
  return JSON.parse(raw)
}

function render(data) {
  const categories = Array.isArray(data.categories) ? data.categories : []
  const files = Array.isArray(data.files) ? data.files : []
  const summary = data.summary || {}

  const lines = []
  lines.push('# Security Audit Summary (Generated)')
  lines.push('')
  lines.push(`Generated from \`${toRepoPath(AUDIT_JSON)}\`.`)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Total errors: **${summary.totalErrors || 0}**`)
  lines.push(`- Total warnings: **${summary.totalWarnings || 0}**`)
  lines.push(`- Files with issues: **${files.filter(f => f.issues && f.issues.length > 0).length}**`)
  lines.push('')
  lines.push('## Categories (sorted by priority)')
  lines.push('')
  lines.push('| Category | Priority | Score | Errors | Warnings |')
  lines.push('| --- | --- | ---: | ---: | ---: |')

  // Sort categories by priority
  const priorityOrder = { P0: 0, P1: 1, P2: 2 }
  const sortedCategories = categories.sort((a, b) => {
    const aPriority = priorityOrder[a.priority] ?? 2
    const bPriority = priorityOrder[b.priority] ?? 2
    if (aPriority !== bPriority) return aPriority - bPriority
    return b.score - a.score
  })

  for (const cat of sortedCategories) {
    const priority = cat.priority || 'P2'
    lines.push(
      `| ${cat.name} | ${priority} | ${cat.score || 0} | ${cat.errors?.length || 0} | ${cat.warnings?.length || 0} |`
    )
  }

  lines.push('')
  lines.push('## Files with Issues (sorted by priority)')
  lines.push('')
  lines.push('| File | Priority | Score | Categories | Issues |')
  lines.push('| --- | --- | ---: | --- | ---: |')

  // Sort files by priority, then by score
  const sortedFiles = files
    .filter(f => f.issues && f.issues.length > 0)
    .sort((a, b) => {
      const aPriority = priorityOrder[a.priority] ?? 2
      const bPriority = priorityOrder[b.priority] ?? 2
      if (aPriority !== bPriority) return aPriority - bPriority
      return b.score - a.score
    })

  for (const f of sortedFiles) {
    const priority = f.priority || 'P2'
    const categoriesList = f.categories ? f.categories.join(', ') : ''
    lines.push(
      `| \`${f.repoPath}\` | ${priority} | ${f.score || 0} | ${categoriesList} | ${f.issues.length} |`
    )
  }

  lines.push('')
  lines.push('## Notes')
  lines.push('')
  lines.push('- This is a *signal* index. Use the full report for line-level matches and details: `client/.audit-reports/security-audit.md`.')
  lines.push('- **P0**: Critical security issues (fix soon)')
  lines.push('- **P1**: Important security issues (high leverage cleanup)')
  lines.push('- **P2**: Low priority (best practices)')
  lines.push('')
  return lines.join('\n')
}

function main() {
  const data = loadJson()
  fs.writeFileSync(OUT_MD, render(data))
  const files = Array.isArray(data.files) ? data.files : []
  const filesWithIssues = files.filter(f => f.issues && f.issues.length > 0)
  console.log(`Wrote: ${toRepoPath(OUT_MD)} (files with issues: ${filesWithIssues.length})`)
  process.exitCode = 0
}

main()
