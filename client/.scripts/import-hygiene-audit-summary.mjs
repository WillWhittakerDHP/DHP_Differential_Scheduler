import fs from 'node:fs'
import path from 'node:path'

const CWD = path.resolve(process.cwd())
const CLIENT_AUDIT = path.join(CWD, '.audit-reports')
const PROJECT_ROOT_AUDIT = path.join(CWD, 'client', '.audit-reports')
const IS_CLIENT_DIR = fs.existsSync(CLIENT_AUDIT)
const AUDIT_DIR = IS_CLIENT_DIR ? CLIENT_AUDIT : PROJECT_ROOT_AUDIT

const AUDIT_JSON = path.join(AUDIT_DIR, 'import-hygiene-audit.json')
const OUT_MD = path.join(AUDIT_DIR, 'import-hygiene-audit-summary.md')

function toRepoPath(absPath) {
  const root = IS_CLIENT_DIR ? CWD : CWD
  return path.relative(root, absPath).replaceAll(path.sep, '/')
}

function loadJson() {
  const raw = fs.readFileSync(AUDIT_JSON, 'utf8')
  return JSON.parse(raw)
}

function render(data) {
  const lines = []
  lines.push('# Import Hygiene Audit Summary (Generated)')
  lines.push('')
  lines.push(`Generated from \`${toRepoPath(AUDIT_JSON)}\`.`)
  lines.push('')

  lines.push('## Overview')
  lines.push('')
  lines.push(`| Metric | Count |`)
  lines.push(`| --- | ---: |`)
  lines.push(`| Files scanned | ${data.totalScanned ?? 0} |`)
  lines.push(`| Barrel directories | ${data.barrelCount ?? 0} |`)
  lines.push(`| Barrel bypass violations | ${(data.barrelBypass ?? []).length} |`)
  lines.push(`| Inconsistent import paths | ${(data.inconsistentPaths ?? []).length} |`)
  lines.push(`| Duplicate re-exports | ${(data.duplicateReexports ?? []).length} |`)
  lines.push(`| Deep relative imports | ${(data.relativeWhenAlias ?? []).length} |`)
  lines.push('')

  const MAX_ROWS = 20
  const files = Array.isArray(data.files) ? data.files : []

  if (files.length > 0) {
    lines.push(`## Top ${Math.min(files.length, MAX_ROWS)} files (ranked by severity)`)
    lines.push('')
    lines.push('| File | Priority | Score | Barrel Bypass | Deep Relative |')
    lines.push('| --- | --- | ---: | ---: | ---: |')

    for (const f of files.slice(0, MAX_ROWS)) {
      lines.push(
        `| \`${f.file}\` | ${f.priority} | ${f.score} | ${f.barrelBypass || 0} | ${f.relativeWhenAlias || 0} |`
      )
    }

    if (files.length > MAX_ROWS) {
      lines.push('')
      lines.push(`*...and ${files.length - MAX_ROWS} more files. See full report for details.*`)
    }
    lines.push('')
  }

  lines.push('## Notes')
  lines.push('')
  lines.push('- Full report with line-level detail: `client/.audit-reports/import-hygiene-audit.md`')
  lines.push('- Barrel bypass = importing directly from a file when a barrel index.ts exists in that directory')
  lines.push('- Deep relative = relative imports traversing 3+ parent directories (use @/ alias instead)')
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
