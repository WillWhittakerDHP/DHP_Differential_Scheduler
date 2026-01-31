import fs from 'node:fs'
import path from 'node:path'

// Detect if we're running from client/ or project root
const CWD = path.resolve(process.cwd())
const CLIENT_AUDIT = path.join(CWD, '.audit-reports')
const PROJECT_ROOT_AUDIT = path.join(CWD, 'client', '.audit-reports')
const IS_CLIENT_DIR = fs.existsSync(CLIENT_AUDIT)
const AUDIT_DIR = IS_CLIENT_DIR ? CLIENT_AUDIT : PROJECT_ROOT_AUDIT
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD

const AUDIT_JSON = path.join(AUDIT_DIR, 'pattern-detection-audit.json')
const OUT_MD = path.join(AUDIT_DIR, 'pattern-detection-audit-summary.md')

function toRepoPath(absPath) {
  return path.relative(PROJECT_ROOT, absPath).replaceAll(path.sep, '/')
}

function loadJson() {
  const raw = fs.readFileSync(AUDIT_JSON, 'utf8')
  return JSON.parse(raw)
}

function render(data) {
  const aggregated = data.aggregated || {}
  const stringLiterals = aggregated.stringLiterals || {}
  const typeDefinitions = aggregated.typeDefinitions || {}
  const enumPatterns = aggregated.enumPatterns || {}
  const configLocations = aggregated.configLocations || []
  const functionPatterns = aggregated.functionPatterns || {}
  const commonPatterns = aggregated.commonPatterns || []

  const lines = []
  lines.push('# Pattern Detection Audit Summary (Generated)')
  lines.push('')
  lines.push(`Generated from \`${toRepoPath(AUDIT_JSON)}\`.`)
  lines.push('')
  lines.push('## Quick Index')
  lines.push('')
  lines.push('| Category | Count |')
  lines.push('| --- | ---: |')
  lines.push(`| String literals (3+ occurrences) | ${Object.keys(stringLiterals).filter(k => stringLiterals[k].count >= 3).length} |`)
  lines.push(`| Type definitions | ${Object.keys(typeDefinitions).length} |`)
  lines.push(`| Enum patterns | ${Object.keys(enumPatterns).length} |`)
  lines.push(`| Config locations | ${configLocations.length} |`)
  lines.push(`| Function patterns | ${Object.keys(functionPatterns).length} |`)
  lines.push(`| Common patterns | ${commonPatterns.length} |`)
  lines.push('')
  lines.push('## Top String Literals (by occurrence count)')
  lines.push('')
  lines.push('| Value | Occurrences |')
  lines.push('| --- | ---: |')
  const topStrings = Object.entries(stringLiterals)
    .filter(([_, entry]) => entry.count >= 3)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20)
  for (const [value, entry] of topStrings) {
    lines.push(`| \`${value}\` | ${entry.count} |`)
  }
  if (topStrings.length === 0) {
    lines.push('| _No frequent string literals found_ | |')
  }
  lines.push('')
  lines.push('## Notes')
  lines.push('')
  lines.push('- This is a *signal* index. Use the full report for detailed locations: `client/.audit-reports/pattern-detection-audit.md`.')
  lines.push('- String literals with 3+ occurrences may be candidates for enum/constant extraction.')
  lines.push('- Type definitions and enum patterns help identify where types are defined.')
  lines.push('')
  return lines.join('\n')
}

function main() {
  const data = loadJson()
  fs.writeFileSync(OUT_MD, render(data))
  const aggregated = data.aggregated || {}
  console.log(`Wrote: ${toRepoPath(OUT_MD)}`)
  console.log(`Patterns: ${Object.keys(aggregated.stringLiterals || {}).length} string literals, ${Object.keys(aggregated.typeDefinitions || {}).length} types, ${Object.keys(aggregated.enumPatterns || {}).length} enums`)
  process.exitCode = 0
}

main()
