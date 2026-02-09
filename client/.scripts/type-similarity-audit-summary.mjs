import fs from 'node:fs'
import path from 'node:path'

/**
 * Type Similarity Audit Summary Script
 *
 * Reads the full type-similarity-audit.json and produces a compact summary
 * Markdown file for quick review.
 *
 * Output: client/.audit-reports/type-similarity-audit-summary.md
 */

// Detect if we're running from client/ or project root
const CWD = path.resolve(process.cwd())
const CLIENT_AUDIT = path.join(CWD, '.audit-reports')
const PROJECT_ROOT_AUDIT = path.join(CWD, 'client', '.audit-reports')
const IS_CLIENT_DIR = fs.existsSync(CLIENT_AUDIT)
const AUDIT_DIR = IS_CLIENT_DIR ? CLIENT_AUDIT : PROJECT_ROOT_AUDIT
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD

const AUDIT_JSON = path.join(AUDIT_DIR, 'type-similarity-audit.json')
const OUT_MD = path.join(AUDIT_DIR, 'type-similarity-audit-summary.md')

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
  lines.push('# Type Similarity Audit Summary (Generated)')
  lines.push('')
  lines.push(`Generated from \`${toRepoPath(AUDIT_JSON)}\`.`)
  lines.push('')

  // Quick stats
  lines.push('## Quick Stats')
  lines.push('')
  lines.push(`- Files scanned: **${data.fileCount || 0}**`)
  lines.push(`- Type definitions: **${data.totalDefinitions || 0}**`)
  lines.push(`- Similarity groups: **${groups.length}**`)
  lines.push('')

  // Action breakdown
  const actionCounts = { UNIFY: 0, BRAND: 0, EXTEND: 0, REVIEW: 0 }
  for (const group of groups) {
    actionCounts[group.action] = (actionCounts[group.action] || 0) + 1
  }
  lines.push('| Action | Count | Meaning |')
  lines.push('| --- | ---: | --- |')
  lines.push(`| UNIFY | ${actionCounts.UNIFY} | Same concept duplicated — consolidate |`)
  lines.push(`| BRAND | ${actionCounts.BRAND} | Different concept, same shape — add branding |`)
  lines.push(`| EXTEND | ${actionCounts.EXTEND} | Superset/subset — use extends |`)
  lines.push(`| REVIEW | ${actionCounts.REVIEW} | High overlap — needs judgment |`)
  lines.push('')

  // Index (ranked)
  lines.push('## Index (ranked)')
  lines.push('')
  lines.push('| Priority | Action | Relationship | Types | Files | Score |')
  lines.push('| --- | --- | --- | --- | ---: | ---: |')
  for (const g of groups) {
    const typeNames = g.members.map(m => `\`${m.name}\``).join(', ')
    const fileCount = new Set(g.members.map(m => m.file)).size
    const priority = g.priority || 'P2'
    lines.push(`| ${priority} | ${g.action} | ${g.relationship} | ${typeNames} | ${fileCount} | ${g.score} |`)
  }

  lines.push('')
  lines.push('## Notes')
  lines.push('')
  lines.push('- This is a *signal* index. Use the full report for structural details: `client/.audit-reports/type-similarity-audit.md`.')
  lines.push('- Run before `typecheck:audit` to identify root-cause type duplication.')
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
