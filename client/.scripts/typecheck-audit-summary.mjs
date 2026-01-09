import fs from 'node:fs'
import path from 'node:path'

// Detect if we're running from client/ or project root
const CWD = path.resolve(process.cwd())
const CLIENT_TYPECHECK = path.join(CWD, '.audit-reports/typecheck')
const PROJECT_ROOT_TYPECHECK = path.join(CWD, 'client', '.audit-reports/typecheck')
const IS_CLIENT_DIR = fs.existsSync(CLIENT_TYPECHECK)
const TYPECHECK_DIR = IS_CLIENT_DIR ? CLIENT_TYPECHECK : PROJECT_ROOT_TYPECHECK
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD

const IN_JSON = path.join(TYPECHECK_DIR, 'typecheck-audit.json')
const OUT_MD = path.join(TYPECHECK_DIR, 'typecheck-audit-summary.md')

function toRepoPath(absPath) {
  return path.relative(PROJECT_ROOT, absPath).replaceAll(path.sep, '/')
}

function loadJson() {
  const raw = fs.readFileSync(IN_JSON, 'utf8')
  return JSON.parse(raw)
}

function render(data) {
  const pools = Array.isArray(data.pools) ? data.pools : []
  const files = Array.isArray(data.files) ? data.files : []

  const lines = []
  lines.push('# Typecheck Audit Summary (Generated)')
  lines.push('')
  lines.push(`Generated from \`${toRepoPath(IN_JSON)}\`.`)
  lines.push('')
  lines.push('## Pool index (ranked)')
  lines.push('')
  lines.push('| Priority | Pool | score | errors | files | severity | blast | repetition | unsafeCasts | suppressions |')
  lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')
  for (const p of pools) {
    lines.push(
      `| ${p.priority} | \`${p.poolId}\` | ${p.totalScore} | ${p.errorCount} | ${p.fileCount} | ${p.severityScore} | ${p.blastRadiusScore} | ${p.repetitionScore} | ${p.unsafeCastHits} | ${p.suppressionHits} |`
    )
  }

  lines.push('')
  lines.push('## File index (ranked)')
  lines.push('')
  lines.push('| File | errors | unsafeCasts | suppressions |')
  lines.push('| --- | ---: | ---: | ---: |')
  for (const f of files) {
    lines.push(`| \`${f.repoPath}\` | ${f.errorCount} | ${f.unsafeCastHits} | ${f.suppressionHits} |`)
  }

  lines.push('')
  lines.push('## Notes')
  lines.push('')
  lines.push('- This is a *signal* index. Use `client/.typecheck/typecheck-audit.md` for detailed errors.')
  lines.push('- Priority (P0/P1/P2) is computed via config weights in `client/.typecheck/typecheck-audit-config.json`.')
  lines.push('')
  return lines.join('\n')
}

function main() {
  const data = loadJson()
  fs.writeFileSync(OUT_MD, render(data))
  console.log(`Wrote: ${toRepoPath(OUT_MD)} (pools: ${(data.pools || []).length}, files: ${(data.files || []).length})`)
}

main()


