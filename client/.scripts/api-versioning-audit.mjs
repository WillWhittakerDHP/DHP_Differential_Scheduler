import fs from 'node:fs'
import path from 'node:path'

/**
 * API Versioning Audit Script
 *
 * Goal: Compare current api-contract-audit.json against a saved baseline to detect
 * breaking API changes: removed endpoints, changed shapes. Run with --accept to update baseline.
 *
 * Reads: api-contract-audit.json
 * Writes: api-versioning-baseline.json (when --accept), api-versioning-audit.json, .md
 */

const CWD = path.resolve(process.cwd())
const IS_CLIENT_DIR = fs.existsSync(path.join(CWD, 'src'))
const PROJECT_ROOT = IS_CLIENT_DIR ? path.resolve(CWD, '..') : CWD
const _CLIENT_ROOT = IS_CLIENT_DIR ? CWD : path.join(PROJECT_ROOT, 'client')
const OUT_DIR = IS_CLIENT_DIR
  ? path.join(CWD, '.audit-reports')
  : path.join(CWD, 'client', '.audit-reports')
const OUT_JSON = path.join(OUT_DIR, 'api-versioning-audit.json')
const OUT_MD = path.join(OUT_DIR, 'api-versioning-audit.md')
const CONTRACT_JSON = path.join(OUT_DIR, 'api-contract-audit.json')
const BASELINE_JSON = path.join(OUT_DIR, 'api-versioning-baseline.json')

function ensureDir(d) { fs.mkdirSync(d, { recursive: true }) }
function toRepoPath(p) { return path.relative(PROJECT_ROOT, p).replaceAll(path.sep, '/') }

function endpointKey(f) {
  return `${f.method || 'GET'} ${f.url || f.path || ''}`.trim()
}

function loadContract() {
  if (!fs.existsSync(CONTRACT_JSON)) return null
  return JSON.parse(fs.readFileSync(CONTRACT_JSON, 'utf8'))
}

function loadBaseline() {
  if (!fs.existsSync(BASELINE_JSON)) return null
  return JSON.parse(fs.readFileSync(BASELINE_JSON, 'utf8'))
}

function buildEndpointSet(findings) {
  const set = new Set()
  const byKey = new Map()
  for (const f of findings || []) {
    const key = endpointKey(f)
    set.add(key)
    byKey.set(key, f)
  }
  return { set, byKey }
}

function main() {
  ensureDir(OUT_DIR)
  const accept = process.argv.includes('--accept')

  if (!fs.existsSync(CONTRACT_JSON)) {
    const out = {
      generatedAt: new Date().toISOString(),
      error: 'Missing api-contract-audit.json. Run audit:api-contract first.',
      breakingChanges: [],
      nonBreaking: [],
      summary: { breaking: 0, nonBreaking: 0, unchanged: 0 },
    }
    fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2))
    fs.writeFileSync(OUT_MD, '# API Versioning Audit\n\nRun audit:api-contract first.\n')
    console.log('Wrote:', toRepoPath(OUT_JSON), toRepoPath(OUT_MD))
    console.log('Missing api-contract-audit.json. Run audit:api-contract first.')
    process.exitCode = 0
    return
  }

  const contract = loadContract()
  const currentFindings = contract.findings || []
  const current = buildEndpointSet(currentFindings)
  const baseline = loadBaseline()

  if (accept) {
    const baselineData = {
      generatedAt: new Date().toISOString(),
      findings: currentFindings.map(f => ({ method: f.method, url: f.url, type: f.type, severity: f.severity, serverFile: f.serverFile, clientFile: f.clientFile })),
      endpointKeys: [...current.set],
    }
    fs.writeFileSync(BASELINE_JSON, JSON.stringify(baselineData, null, 2))
    console.log('Baseline updated:', toRepoPath(BASELINE_JSON))
  }

  const breakingChanges = []
  const nonBreaking = []
  let unchanged = 0

  if (baseline && Array.isArray(baseline.endpointKeys)) {
    const baselineSet = new Set(baseline.endpointKeys)
    for (const key of baselineSet) {
      if (!current.set.has(key)) {
        breakingChanges.push({
          type: 'endpoint-removed',
          endpoint: key,
          severity: 'breaking',
        })
      } else {
        unchanged++
      }
    }
    for (const key of current.set) {
      if (!baselineSet.has(key)) {
        nonBreaking.push({
          type: 'endpoint-added',
          endpoint: key,
          severity: 'non-breaking',
        })
      }
    }
  } else {
    unchanged = current.set.size
  }

  const summary = { breaking: breakingChanges.length, nonBreaking: nonBreaking.length, unchanged }
  const baselineTimestamp = baseline ? baseline.generatedAt : null

  const out = {
    generatedAt: new Date().toISOString(),
    baselineTimestamp,
    breakingChanges,
    nonBreaking,
    summary,
    exceptionSummary: {
      totalAllowed: 0,
      totalRequiresReview: breakingChanges.length,
      bySource: { inline: 0, pattern: 0, specific: 0 },
    },
    files: breakingChanges.map(b => ({ repoPath: b.endpoint, score: 10, priority: 'P0' })),
  }

  const lines = []
  lines.push('# API Versioning Audit (Generated)')
  lines.push('')
  lines.push(`Generated at: ${out.generatedAt}`)
  if (baselineTimestamp) lines.push(`Baseline: ${baselineTimestamp}`)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Breaking: **${summary.breaking}**`)
  lines.push(`- Non-breaking (added): **${summary.nonBreaking}**`)
  lines.push(`- Unchanged: **${summary.unchanged}**`)
  lines.push('')
  if (breakingChanges.length > 0) {
    lines.push('## Breaking changes')
    lines.push('')
    for (const b of breakingChanges) {
      lines.push(`- **${b.type}**: \`${b.endpoint}\``)
    }
    lines.push('')
  }
  if (nonBreaking.length > 0) {
    lines.push('## Non-breaking (new endpoints)')
    lines.push('')
    for (const n of nonBreaking.slice(0, 30)) {
      lines.push(`- ${n.type}: \`${n.endpoint}\``)
    }
    if (nonBreaking.length > 30) lines.push(`\n*...and ${nonBreaking.length - 30} more.*`)
    lines.push('')
  }
  lines.push('Run with `--accept` to update the baseline.')
  lines.push('')

  fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2))
  fs.writeFileSync(OUT_MD, lines.join('\n'))

  console.log('Wrote:', toRepoPath(OUT_JSON), toRepoPath(OUT_MD))
  console.log(`Breaking: ${summary.breaking} | Non-breaking: ${summary.nonBreaking} | Unchanged: ${summary.unchanged}`)
  process.exitCode = 0
}

main()
