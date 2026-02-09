import fs from 'node:fs'
import path from 'node:path'

// Detect if we're running from client/ or project root
const CWD = path.resolve(process.cwd())
const CLIENT_AUDIT = path.join(CWD, '.audit-reports')
const PROJECT_ROOT_AUDIT = path.join(CWD, 'client', '.audit-reports')
const IS_CLIENT_DIR = fs.existsSync(CLIENT_AUDIT)
const AUDIT_DIR = IS_CLIENT_DIR ? CLIENT_AUDIT : PROJECT_ROOT_AUDIT
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD

const AUDIT_JSON = path.join(AUDIT_DIR, 'hardcoding-audit.json')
const OUT_MD = path.join(AUDIT_DIR, 'hardcoding-audit-summary.md')

function toRepoPath(absPath) {
  return path.relative(PROJECT_ROOT, absPath).replaceAll(path.sep, '/')
}

function loadJson() {
  const raw = fs.readFileSync(AUDIT_JSON, 'utf8')
  return JSON.parse(raw)
}

function render(data) {
  const files = Array.isArray(data.files) ? data.files : []
  const entityKeys = Array.isArray(data.entityKeys) ? data.entityKeys : []

  const lines = []
  lines.push('# Hardcoding Audit Summary (Generated)')
  lines.push('')
  lines.push(`Generated from \`${toRepoPath(AUDIT_JSON)}\`.`)
  lines.push('')
  lines.push('## Context')
  lines.push('')
  lines.push(`- Entity keys: ${entityKeys.length ? entityKeys.map(k => `\`${k}\``).join(', ') : '(none detected)'}`)
  lines.push('')
  const MAX_ROWS = 30
  lines.push(`## Top ${Math.min(files.length, MAX_ROWS)} files (ranked)`)
  lines.push('')
  lines.push('| File | Priority | score | switch(entityKey) | entityKey strings | case | field===string | omitFields | headers | label maps |')
  lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')

  const shown = files.slice(0, MAX_ROWS)
  for (const f of shown) {
    const c = f.counts || {}
    const priority = f.priority || 'P2'
    lines.push(
      `| \`${f.repoPath}\` | ${priority} | ${f.score || 0} | ${c.switchEntityKey || 0} | ${c.entityKeyString || 0} | ${c.caseString || 0} | ${c.fieldEqualsString || 0} | ${c.omitFieldsArray || 0} | ${c.headersArray || 0} | ${c.inlineLabelMap || 0} |`
    )
  }

  if (files.length > MAX_ROWS) {
    lines.push('')
    lines.push(`*...and ${files.length - MAX_ROWS} more files. See full report for details.*`)
  }

  lines.push('')
  lines.push('## Notes')
  lines.push('')
  lines.push('- This is a *signal* index. Use the full report for line-level matches and suggestions: `client/.audit/hardcoding-audit.md`.')
  lines.push('')
  return lines.join('\n')
}

function main() {
  const data = loadJson()
  fs.writeFileSync(OUT_MD, render(data))
  const files = Array.isArray(data.files) ? data.files : []
  console.log(`Wrote: ${toRepoPath(OUT_MD)} (files: ${files.length})`)
  process.exitCode = 0
}

main()


