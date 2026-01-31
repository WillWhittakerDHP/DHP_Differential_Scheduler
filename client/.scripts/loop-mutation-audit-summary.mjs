import fs from 'node:fs'
import path from 'node:path'

// Detect if we're running from client/ or project root
const CWD = path.resolve(process.cwd())
const CLIENT_AUDIT = path.join(CWD, '.audit-reports')
const PROJECT_ROOT_AUDIT = path.join(CWD, 'client', '.audit-reports')
const IS_CLIENT_DIR = fs.existsSync(CLIENT_AUDIT)
const AUDIT_DIR = IS_CLIENT_DIR ? CLIENT_AUDIT : PROJECT_ROOT_AUDIT
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD

const AUDIT_JSON = path.join(AUDIT_DIR, 'loop-mutation-audit.json')
const OUT_MD = path.join(AUDIT_DIR, 'loop-mutation-audit-summary.md')

function toRepoPath(absPath) {
  return path.relative(PROJECT_ROOT, absPath).replaceAll(path.sep, '/')
}

function loadJson() {
  const raw = fs.readFileSync(AUDIT_JSON, 'utf8')
  return JSON.parse(raw)
}

function render(files) {
  const lines = []
  lines.push('# Loop Mutation Audit Summary (Generated)')
  lines.push('')
  lines.push(`Generated from \`${toRepoPath(AUDIT_JSON)}\`.`)
  lines.push('')
  lines.push('## Full index (ranked)')
  lines.push('')
  lines.push('| File | Priority | score | forEach | for-loops | mutators | assigns | forEach→mutation hits |')
  lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |')

  for (const f of files) {
    const c = f.counts || {}
    const forLoops = (c.forLoop || 0) + (c.forOf || 0) + (c.forIn || 0) + (c.while || 0) + (c.doWhile || 0)
    const mutators = (c.push || 0) + (c.splice || 0) + (c.sort || 0) + (c.reverse || 0) + (c.pop || 0) + (c.shift || 0) + (c.unshift || 0)
    const assigns = (c.assignIndex || 0) + (c.assignProp || 0)
    const hits = Array.isArray(f.forEachMutationHits) ? f.forEachMutationHits.length : 0
    const priority = f.priority || 'P2'
    lines.push(`| \`${f.repoPath}\` | ${priority} | ${f.score || 0} | ${c.forEach || 0} | ${forLoops} | ${mutators} | ${assigns} | ${hits} |`)
  }

  lines.push('')
  lines.push('## Notes')
  lines.push('')
  lines.push('- This is a *signal* index. Use the full report for line-level matches and hit lists: `client/.audit/loop-mutation-audit.md`.')
  lines.push('')
  return lines.join('\n')
}

function main() {
  const data = loadJson()
  const files = Array.isArray(data.files) ? data.files : []
  fs.writeFileSync(OUT_MD, render(files))
  console.log(`Wrote: ${toRepoPath(OUT_MD)} (files: ${files.length})`)
  process.exitCode = 0
}

main()


