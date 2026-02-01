import fs from 'node:fs'
import path from 'node:path'

/**
 * Deprecation Audit Summary Script
 *
 * Generates a condensed summary report from the deprecation audit JSON output.
 * Useful for quick review and integration with other audit summaries.
 */

// Detect if we're running from client/ or project root
const CWD = path.resolve(process.cwd())
const CLIENT_AUDIT = path.join(CWD, '.audit-reports')
const PROJECT_ROOT_AUDIT = path.join(CWD, 'client', '.audit-reports')
const IS_CLIENT_DIR = fs.existsSync(CLIENT_AUDIT)
const AUDIT_DIR = IS_CLIENT_DIR ? CLIENT_AUDIT : PROJECT_ROOT_AUDIT
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD

const AUDIT_JSON = path.join(AUDIT_DIR, 'deprecation-audit.json')
const OUT_MD = path.join(AUDIT_DIR, 'deprecation-audit-summary.md')

function toRepoPath(absPath) {
  return path.relative(PROJECT_ROOT, absPath).replaceAll(path.sep, '/')
}

function loadJson() {
  const raw = fs.readFileSync(AUDIT_JSON, 'utf8')
  return JSON.parse(raw)
}

function render(data) {
  const files = Array.isArray(data.files) ? data.files : []
  const issues = Array.isArray(data.issues) ? data.issues : []
  const summary = data.summary || {}

  const lines = []
  lines.push('# Deprecation Audit Summary (Generated)')
  lines.push('')
  lines.push(`Generated from \`${toRepoPath(AUDIT_JSON)}\`.`)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Files scanned: **${summary.totalFiles || 0}**`)
  lines.push(`- Files with deprecations: **${files.length}**`)
  lines.push(`- Total deprecation markers: **${summary.totalDeprecations || issues.length}**`)
  lines.push(`- With replacement suggestion: **${summary.withReplacement || 0}**`)
  lines.push(`- Without replacement: **${summary.withoutReplacement || 0}**`)
  lines.push('')

  // Quick actions section
  const withReplacement = issues.filter(i => i.replacement)
  if (withReplacement.length > 0) {
    lines.push('## Quick Wins (ready for cleanup)')
    lines.push('')
    lines.push('| Deprecated | Replace With | File | Line |')
    lines.push('| --- | --- | --- | ---: |')
    
    // Show top 15 quick wins
    for (const issue of withReplacement.slice(0, 15)) {
      const item = issue.deprecatedItem || '(unknown)'
      lines.push(`| \`${item}\` | \`${issue.replacement}\` | \`${issue.file}\` | ${issue.line} |`)
    }
    
    if (withReplacement.length > 15) {
      lines.push('')
      lines.push(`*... and ${withReplacement.length - 15} more. See full report.*`)
    }
    lines.push('')
  }

  lines.push('## Files by Priority')
  lines.push('')
  lines.push('| File | Priority | Score | Deprecations | Ready |')
  lines.push('| --- | --- | ---: | ---: | ---: |')

  // Sort files by priority, then by score
  const priorityOrder = { P0: 0, P1: 1, P2: 2 }
  const sortedFiles = files.sort((a, b) => {
    const aPriority = priorityOrder[a.priority] ?? 2
    const bPriority = priorityOrder[b.priority] ?? 2
    if (aPriority !== bPriority) return aPriority - bPriority
    return b.score - a.score
  })

  for (const f of sortedFiles) {
    const priority = f.priority || 'P2'
    const readyCount = f.issues ? f.issues.filter(i => i.replacement).length : 0
    lines.push(
      `| \`${f.repoPath}\` | ${priority} | ${f.score || 0} | ${f.issues?.length || 0} | ${readyCount} |`
    )
  }

  lines.push('')
  lines.push('## Notes')
  lines.push('')
  lines.push('- This is a *signal* index. Use the full report for details: `client/.audit-reports/deprecation-audit.md`.')
  lines.push('- **Ready**: Deprecations with explicit replacement suggestions (safe to clean up)')
  lines.push('- **P0**: High deprecation density (cleanup soon)')
  lines.push('- **P1**: Moderate deprecations (schedule cleanup)')
  lines.push('- **P2**: Low priority (cleanup when convenient)')
  lines.push('')
  return lines.join('\n')
}

function main() {
  if (!fs.existsSync(AUDIT_JSON)) {
    console.log(`Skipped: ${toRepoPath(AUDIT_JSON)} not found. Run audit:deprecation first.`)
    process.exitCode = 0
    return
  }
  
  const data = loadJson()
  fs.writeFileSync(OUT_MD, render(data))
  const files = Array.isArray(data.files) ? data.files : []
  console.log(`Wrote: ${toRepoPath(OUT_MD)} (files with deprecations: ${files.length})`)
  process.exitCode = 0
}

main()
