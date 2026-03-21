import fs from 'node:fs'
import path from 'node:path'
import { resolveAuditPaths, writeAuditReports, toRepoPath as toRepoPathUtil } from './shared-audit-utils.mjs'

/**
 * API Versioning Audit Script
 *
 * Goal: Compare current api-contract-audit.json against a saved baseline to detect
 * breaking API changes: removed endpoints, changed shapes. Run with --accept to update baseline.
 *
 * Reads: api-contract-audit.json
 * Writes: api-versioning-baseline.json (when --accept), api-versioning-audit.json, .md
 */

function toRepoPath(p, projectRoot) { return toRepoPathUtil(p, projectRoot) }

function endpointKey(f) {
  return `${f.method || 'GET'} ${f.url || f.path || ''}`.trim()
}

function loadContract(contractJson) {
  if (!fs.existsSync(contractJson)) return null
  return JSON.parse(fs.readFileSync(contractJson, 'utf8'))
}

function loadBaseline(baselineJson) {
  if (!fs.existsSync(baselineJson)) return null
  return JSON.parse(fs.readFileSync(baselineJson, 'utf8'))
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
  const paths = resolveAuditPaths('api-versioning')
  const contractJson = path.join(paths.outDir, 'api-contract-audit.json')
  const baselineJson = path.join(paths.outDir, 'api-versioning-baseline.json')
  const accept = process.argv.includes('--accept')

  if (!fs.existsSync(contractJson)) {
    const out = {
      generatedAt: new Date().toISOString(),
      error: 'Missing api-contract-audit.json. Run audit:api-contract first.',
      breakingChanges: [],
      nonBreaking: [],
      summary: { breaking: 0, nonBreaking: 0, unchanged: 0 },
    }
    const { outJson, outMd } = writeAuditReports('api-versioning', out, '# API Versioning Audit\n\nRun audit:api-contract first.\n')
    console.log('Wrote:', toRepoPath(outJson, paths.projectRoot), toRepoPath(outMd, paths.projectRoot))
    console.log('Missing api-contract-audit.json. Run audit:api-contract first.')
    process.exitCode = 0
    return
  }

  const contract = loadContract(contractJson)
  // Current API surface from contract's full endpoint list (endpointKeys), not findings, so versioning does not depend on allowlist or issue count.
  let current
  const contractEndpointKeys = contract.endpointKeys
  if (Array.isArray(contractEndpointKeys) && contractEndpointKeys.length > 0) {
    current = { set: new Set(contractEndpointKeys), byKey: new Map(contractEndpointKeys.map((k) => [k, { endpoint: k }])) }
  } else {
    if (contractEndpointKeys === undefined) {
      console.warn('api-versioning: contract.endpointKeys missing (old api-contract output). Falling back to findings. Re-run audit:api-contract to refresh.')
    }
    const currentFindings = contract.findings || []
    current = buildEndpointSet(currentFindings)
  }

  const baseline = loadBaseline(baselineJson)

  if (accept) {
    const endpointKeysToPersist = Array.isArray(contractEndpointKeys) && contractEndpointKeys.length > 0 ? contractEndpointKeys : [...current.set]
    const baselineData = {
      generatedAt: new Date().toISOString(),
      findings: (contract.findings || []).map(f => ({ method: f.method, url: f.url, type: f.type, severity: f.severity, serverFile: f.serverFile, clientFile: f.clientFile })),
      endpointKeys: endpointKeysToPersist,
    }
    fs.writeFileSync(baselineJson, JSON.stringify(baselineData, null, 2))
    console.log('Baseline updated:', toRepoPath(baselineJson, paths.projectRoot))
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

  const { outJson, outMd } = writeAuditReports('api-versioning', out, lines.join('\n'))

  console.log('Wrote:', toRepoPath(outJson, paths.projectRoot), toRepoPath(outMd, paths.projectRoot))
  console.log(`Breaking: ${summary.breaking} | Non-breaking: ${summary.nonBreaking} | Unchanged: ${summary.unchanged}`)
  process.exitCode = 0
}

main()
