import fs from 'node:fs'
import path from 'node:path'

// Detect if we're running from client/ or project root
const CWD = path.resolve(process.cwd())
const CLIENT_AUDIT = path.join(CWD, '.audit-reports')
const PROJECT_ROOT_AUDIT = path.join(CWD, 'client', '.audit-reports')
const IS_CLIENT_DIR = fs.existsSync(CLIENT_AUDIT)
const AUDIT_DIR = IS_CLIENT_DIR ? CLIENT_AUDIT : PROJECT_ROOT_AUDIT
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD

const AUDIT_JSON = path.join(AUDIT_DIR, 'component-logic-audit.json')
const OUT_MD = path.join(AUDIT_DIR, 'component-logic-audit-summary.md')

function toRepoPath(absPath) {
  return path.relative(PROJECT_ROOT, absPath).replaceAll(path.sep, '/')
}

function loadJson() {
  const raw = fs.readFileSync(AUDIT_JSON, 'utf8')
  return JSON.parse(raw)
}

function score(counts) {
  const keys = ['dom', 'watch', 'watchEffect', 'async', 'await', 'reduce', 'map', 'computed', 'inlineConfig', 'console', 'alert']
  return keys.reduce((sum, k) => sum + (counts[k] || 0), 0)
}

function renderIndex(files) {
  const lines = []
  lines.push('# Component Logic Audit Summary (Generated)')
  lines.push('')
  lines.push(`Generated from \`${toRepoPath(AUDIT_JSON)}\`.`)
  lines.push('')
  const MAX_ROWS = 30
  lines.push(`## Top ${Math.min(files.length, MAX_ROWS)} files (ranked by score)`)
  lines.push('')
  lines.push('| File | Priority | score | computed | ref | watch | async | await | map | reduce | DOM | inline :config | console | alert |')
  lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')

  const shown = files.slice(0, MAX_ROWS)
  for (const f of shown) {
    const c = f.counts || {}
    const priority = f.priority || 'P2'
    lines.push(
      `| \`${f.repoPath}\` | ${priority} | ${score(c)} | ${c.computed || 0} | ${c.ref || 0} | ${c.watch || 0} | ${c.async || 0} | ${c.await || 0} | ${c.map || 0} | ${c.reduce || 0} | ${c.dom || 0} | ${c.inlineConfig || 0} | ${c.console || 0} | ${c.alert || 0} |`
    )
  }

  if (files.length > MAX_ROWS) {
    lines.push('')
    lines.push(`*...and ${files.length - MAX_ROWS} more files. See full report for details.*`)
  }

  lines.push('')
  lines.push('## Notes')
  lines.push('')
  lines.push('- This is a *signal* index, not a semantic judgement. A `computed()` can be UI-only or domain logic depending on what it computes.')
  lines.push('- Use the full line-level report for exact match lines: `client/.audit/component-logic-audit.md`.')
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


