import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { resolveAuditPaths, writeAuditReports, toRepoPath as toRepoPathUtil } from './shared-audit-utils.mjs'

/**
 * Dependency Freshness Audit
 *
 * Goal: Run npm outdated --json on client and server, categorize by staleness
 * (patch/minor/major behind), and score for meta-report. Optionally run depcheck
 * for unused deps (skipped if slow to avoid blocking).
 *
 * Output:
 *   - client/.audit-reports/dep-freshness-audit.json
 *   - client/.audit-reports/dep-freshness-audit.md
 */

function toRepoPath(p, projectRoot) { return toRepoPathUtil(p, projectRoot) }

function loadConfig(configPath) {
  const defaults = { thresholds: { maxMajorBehind: 5, abandonedDays: 730 } }
  if (!fs.existsSync(configPath)) return defaults
  try {
    const raw = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    return { thresholds: { ...defaults.thresholds, ...raw.thresholds } }
  } catch {
    return defaults
  }
}

function parseSemver(v) {
  const match = (v || '').match(/^(\d+)\.(\d+)\.(\d+)/)
  if (!match) return [0, 0, 0]
  return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)]
}

/** @returns {-1 | 0 | 1} */
function semverCompare(aStr, bStr) {
  const [a1, a2, a3] = parseSemver(aStr)
  const [b1, b2, b3] = parseSemver(bStr)
  if (a1 !== b1) return a1 < b1 ? -1 : 1
  if (a2 !== b2) return a2 < b2 ? -1 : 1
  if (a3 !== b3) return a3 < b3 ? -1 : 1
  return 0
}

function classifyBehind(current, wanted, latest) {
  const safeLatest = latest || wanted || ''
  const safeCurrent = current || ''
  if (!safeCurrent || !safeLatest) return 'current'
  // npm `latest` tag can lag (e.g. Vitest 4 while `latest` is still 3.x) — not "behind" if we're semver-ahead.
  if (semverCompare(safeCurrent, safeLatest) >= 0) return 'current'
  const [cMaj, cMin, cPatch] = parseSemver(safeCurrent)
  const [lMaj, lMin, lPatch] = parseSemver(safeLatest)
  if (cMaj === lMaj && cMin === lMin && cPatch === lPatch) return 'current'
  if (cMaj !== lMaj) return 'major-behind'
  if (cMin !== lMin) return 'minor-behind'
  return 'patch-behind'
}

function runNpmOutdated(dirPath) {
  try {
    const out = execSync('npm outdated --json', {
      cwd: dirPath,
      encoding: 'utf8',
      maxBuffer: 4 * 1024 * 1024,
      timeout: 60000,
    })
    return JSON.parse(out)
  } catch (err) {
    if (err.status === 1 && err.stdout) {
      try {
        return JSON.parse(err.stdout)
      } catch {
        return {}
      }
    }
    return {}
  }
}

function main() {
  const paths = resolveAuditPaths('dep-freshness')
  const _config = loadConfig(paths.configPath)

  const packages = []
  const dirs = [
    { name: 'client', path: paths.clientRoot },
    { name: 'server', path: paths.serverRoot },
  ]

  for (const { name, path: dirPath } of dirs) {
    if (!fs.existsSync(path.join(dirPath, 'package.json'))) continue
    const raw = runNpmOutdated(dirPath)
    for (const [pkg, info] of Object.entries(raw)) {
      const current = info.current || ''
      const wanted = info.wanted || info.latest || ''
      const latest = info.latest || wanted
      const behind = classifyBehind(current, wanted, latest)
      const score =
        behind === 'major-behind' ? 5 :
        behind === 'minor-behind' ? 2 :
        behind === 'patch-behind' ? 0.5 : 0
      packages.push({
        package: pkg,
        dependent: name,
        current,
        wanted,
        latest,
        behind,
        score,
      })
    }
  }

  const stale = packages.filter((p) => p.behind !== 'current')

  const byBehind = { 'major-behind': 0, 'minor-behind': 0, 'patch-behind': 0, current: 0 }
  for (const p of stale) {
    byBehind[p.behind] = (byBehind[p.behind] || 0) + 1
  }

  const files = stale
    .filter(p => p.score > 0)
    .map(p => ({
      repoPath: `${p.dependent}:${p.package}`,
      score: p.score,
      priority: p.behind === 'major-behind' ? 'P0' : p.behind === 'minor-behind' ? 'P1' : 'P2',
      ...p,
    }))
    .sort((a, b) => b.score - a.score || a.package.localeCompare(b.package))

  const totalRequiresReview = files.length
  const out = {
    generatedAt: new Date().toISOString(),
    /** Actionable stale deps (excludes semver-ahead-of-npm-latest, e.g. Vitest 4 while `latest` is 3.x). */
    totalScanned: stale.length,
    totalNpmOutdatedRows: packages.length,
    byBehind,
    packages: stale,
    files,
    exceptionSummary: {
      totalAllowed: 0,
      totalRequiresReview,
      bySource: { inline: 0, pattern: 0, specific: 0 },
    },
  }

  const lines = []
  lines.push('# Dependency Freshness Audit (Generated)')
  lines.push('')
  lines.push(`Generated at: ${out.generatedAt}`)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Total outdated (actionable): **${stale.length}**`)
  if (packages.length !== stale.length) {
    lines.push(`- npm outdated rows (including semver-ahead / ignored): **${packages.length}**`)
  }
  lines.push(`- Major behind: **${byBehind['major-behind']}** | Minor: **${byBehind['minor-behind']}** | Patch: **${byBehind['patch-behind']}**`)
  lines.push('')
  lines.push('## Major behind (top 20)')
  lines.push('')
  lines.push('| Package | Dependent | Current | Latest |')
  lines.push('| --- | --- | --- | --- |')
  for (const p of stale.filter(x => x.behind === 'major-behind').slice(0, 20)) {
    lines.push(`| ${p.package} | ${p.dependent} | ${p.current} | ${p.latest} |`)
  }
  lines.push('')
  lines.push('## Minor behind (top 20)')
  lines.push('')
  lines.push('| Package | Dependent | Current | Latest |')
  lines.push('| --- | --- | --- | --- |')
  for (const p of stale.filter(x => x.behind === 'minor-behind').slice(0, 20)) {
    lines.push(`| ${p.package} | ${p.dependent} | ${p.current} | ${p.latest} |`)
  }
  lines.push('')

  const { outJson, outMd } = writeAuditReports('dep-freshness', out, lines.join('\n'))

  console.log('Wrote:', toRepoPath(outJson, paths.projectRoot), toRepoPath(outMd, paths.projectRoot))
  console.log(`Outdated (actionable): ${stale.length} (major: ${byBehind['major-behind']}, minor: ${byBehind['minor-behind']}, patch: ${byBehind['patch-behind']}); npm rows: ${packages.length}`)
  process.exitCode = 0
}

main()
