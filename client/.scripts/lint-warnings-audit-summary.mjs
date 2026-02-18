import fs from 'node:fs'
import path from 'node:path'

const CWD = path.resolve(process.cwd())
const CLIENT_AUDIT = path.join(CWD, '.audit-reports')
const PROJECT_ROOT_AUDIT = path.join(CWD, 'client', '.audit-reports')
const IS_CLIENT_DIR = fs.existsSync(CLIENT_AUDIT)
const AUDIT_DIR = IS_CLIENT_DIR ? CLIENT_AUDIT : PROJECT_ROOT_AUDIT

const AUDIT_JSON = path.join(AUDIT_DIR, 'lint-warnings-audit.json')
const OUT_MD = path.join(AUDIT_DIR, 'lint-warnings-audit-summary.md')

function loadJson() {
  const raw = fs.readFileSync(AUDIT_JSON, 'utf8')
  return JSON.parse(raw)
}

function render(data) {
  const lines = []
  lines.push('# Lint-Warnings Audit Summary (Generated)')
  lines.push('')
  lines.push('Generated from `lint-warnings-audit.json`. Warnings only.')
  lines.push('')

  lines.push('## Overview')
  lines.push('')
  lines.push('| Metric | Count |')
  lines.push('| --- | ---: |')
  lines.push(`| Files with warnings | ${data.totalScanned ?? 0} |`)
  lines.push(`| Total warning findings | ${(data.findings ?? []).length} |`)
  lines.push(`| Files in report | ${(data.files ?? []).length} |`)
  lines.push('')

  const byRule = {}
  for (const f of data.findings ?? []) {
    byRule[f.ruleId] = (byRule[f.ruleId] || 0) + 1
  }
  lines.push('## By rule')
  lines.push('')
  lines.push('| Rule | Count |')
  lines.push('| --- | ---: |')
  for (const [ruleId, count] of Object.entries(byRule).sort((a, b) => b[1] - a[1])) {
    lines.push(`| ${ruleId} | ${count} |`)
  }
  lines.push('')

  const MAX_ROWS = 20
  const files = Array.isArray(data.files) ? data.files : []

  if (files.length > 0) {
    lines.push(`## Top ${Math.min(files.length, MAX_ROWS)} files (by score)`)
    lines.push('')
    lines.push('| File | Priority | Score |')
    lines.push('| --- | --- | ---: |')

    for (const f of files.slice(0, MAX_ROWS)) {
      lines.push(`| \`${f.file}\` | ${f.priority} | ${f.score} |`)
    }

    if (files.length > MAX_ROWS) {
      lines.push('')
      lines.push(`*...and ${files.length - MAX_ROWS} more files. See full report for details.*`)
    }
    lines.push('')
  }

  lines.push('## Notes')
  lines.push('')
  lines.push('- Full report: `client/.audit-reports/lint-warnings-audit.md`')
  lines.push('')
  return lines.join('\n')
}

function main() {
  if (!fs.existsSync(AUDIT_JSON)) {
    console.error('lint-warnings-audit.json not found. Run: npm run audit:lint-warnings')
    process.exitCode = 1
    return
  }
  const data = loadJson()
  fs.writeFileSync(OUT_MD, render(data))
  const files = Array.isArray(data.files) ? data.files : []
  console.log(`Wrote: lint-warnings-audit-summary.md (files with warnings: ${files.length})`)
  process.exitCode = 0
}

main()
