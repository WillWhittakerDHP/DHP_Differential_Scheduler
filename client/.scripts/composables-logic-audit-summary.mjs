import fs from 'node:fs'
import path from 'node:path'

// Detect if we're running from client/ or project root
const CWD = path.resolve(process.cwd())
const CLIENT_AUDIT = path.join(CWD, '.audit-reports')
const PROJECT_ROOT_AUDIT = path.join(CWD, 'client', '.audit-reports')
const IS_CLIENT_DIR = fs.existsSync(CLIENT_AUDIT)
const AUDIT_DIR = IS_CLIENT_DIR ? CLIENT_AUDIT : PROJECT_ROOT_AUDIT
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD

const AUDIT_JSON = path.join(AUDIT_DIR, 'composables-logic-audit.json')
const OUT_MD = path.join(AUDIT_DIR, 'composables-logic-audit-summary.md')

function toRepoPath(absPath) {
  return path.relative(PROJECT_ROOT, absPath).replaceAll(path.sep, '/')
}

function loadJson() {
  const raw = fs.readFileSync(AUDIT_JSON, 'utf8')
  return JSON.parse(raw)
}

function score(counts) {
  const keys = ['dom', 'vueQuery', 'watch', 'watchEffect', 'async', 'await', 'reduce', 'map', 'computed', 'ref', 'console']
  return keys.reduce((sum, k) => sum + (counts[k] || 0), 0)
}

function renderIndex(files) {
  const lines = []
  lines.push('# Composables Logic Audit Summary (Generated)')
  lines.push('')
  lines.push(`Generated from \`${toRepoPath(AUDIT_JSON)}\`.`)
  lines.push('')
  lines.push('## Full index (all composable files)')
  lines.push('')
  lines.push('| File | score | exports(use*) | vue-query | watch | computed | ref | async | await | DOM | console |')
  lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')

  for (const f of files) {
    const c = f.counts || {}
    const exportsCount = Array.isArray(f.exportUseFunctions) ? f.exportUseFunctions.length : 0
    lines.push(
      `| \`${f.repoPath}\` | ${score(c)} | ${exportsCount} | ${c.vueQuery || 0} | ${(c.watch || 0) + (c.watchEffect || 0)} | ${c.computed || 0} | ${c.ref || 0} | ${c.async || 0} | ${c.await || 0} | ${c.dom || 0} | ${c.console || 0} |`
    )
  }

  lines.push('')
  lines.push('## Notes')
  lines.push('')
  lines.push('- This is a *signal* index; check the full report for suggestions and line-level matches.')
  lines.push('- Full report: `client/.audit/composables-logic-audit.md`.')
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


