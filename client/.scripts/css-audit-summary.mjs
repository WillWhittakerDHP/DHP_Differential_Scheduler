import fs from 'node:fs'
import path from 'node:path'

// Detect if we're running from client/ or project root
const CWD = path.resolve(process.cwd())
const CLIENT_AUDIT = path.join(CWD, '.audit-reports')
const PROJECT_ROOT_AUDIT = path.join(CWD, 'client', '.audit-reports')
const IS_CLIENT_DIR = fs.existsSync(CLIENT_AUDIT)
const AUDIT_DIR = IS_CLIENT_DIR ? CLIENT_AUDIT : PROJECT_ROOT_AUDIT
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD

const AUDIT_JSON = path.join(AUDIT_DIR, 'css-audit.json')
const OUT_MD = path.join(AUDIT_DIR, 'css-audit-summary.md')

function toRepoPath(absPath) {
  return path.relative(PROJECT_ROOT, absPath).replaceAll(path.sep, '/')
}

function loadJson() {
  const raw = fs.readFileSync(AUDIT_JSON, 'utf8')
  return JSON.parse(raw)
}

function render(data) {
  const files = Array.isArray(data.files) ? data.files : []

  const lines = []
  lines.push('# CSS Extraction Audit Summary (Generated)')
  lines.push('')
  lines.push(`Generated from \`${toRepoPath(AUDIT_JSON)}\`.`)
  lines.push('')
  lines.push('## Context')
  lines.push('')
  lines.push(`- Total files with findings: ${files.length}`)
  lines.push('')
  const MAX_ROWS = 30
  lines.push(`## Top ${Math.min(files.length, MAX_ROWS)} files (ranked by score)`)
  lines.push('')
  lines.push(
    '| File | Priority | score | large-style | empty | unscoped | inline-static | inline-dynamic | !important | :deep | magic-color | css-in-ts |'
  )
  lines.push(
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |'
  )

  const shown = files.slice(0, MAX_ROWS)
  for (const f of shown) {
    const c = f.counts || {}
    const priority = f.priority || 'P2'
    lines.push(
      `| \`${f.repoPath}\` | ${priority} | ${f.score || 0} | ${c['large-style-block'] || 0} | ${c['empty-style-block'] || 0} | ${c['unscoped-style'] || 0} | ${c['inline-style-static'] || 0} | ${c['inline-style-dynamic'] || 0} | ${c['important-override'] || 0} | ${c['deep-selector'] || 0} | ${c['magic-color'] || 0} | ${c['css-in-ts'] || 0} |`
    )
  }

  if (files.length > MAX_ROWS) {
    lines.push('')
    lines.push(`*...and ${files.length - MAX_ROWS} more files. See full report for details.*`)
  }

  lines.push('')
  lines.push('## Notes')
  lines.push('')
  lines.push('- This is a *signal* index. Use the full report for line-level matches: `client/.audit-reports/css-audit.md`.')
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
