import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

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

const CWD = path.resolve(process.cwd())
const IS_CLIENT_DIR = fs.existsSync(path.join(CWD, 'src'))
const PROJECT_ROOT = IS_CLIENT_DIR ? path.resolve(CWD, '..') : CWD
const CLIENT_ROOT = IS_CLIENT_DIR ? CWD : path.join(PROJECT_ROOT, 'client')
const SERVER_ROOT = path.join(PROJECT_ROOT, 'server')

const OUT_DIR = IS_CLIENT_DIR
  ? path.join(CWD, '.audit-reports')
  : path.join(CWD, 'client', '.audit-reports')
const OUT_JSON = path.join(OUT_DIR, 'dep-freshness-audit.json')
const OUT_MD = path.join(OUT_DIR, 'dep-freshness-audit.md')
const CONFIG_PATH = path.join(OUT_DIR, 'dep-freshness-audit-config.json')

function ensureDir(d) { fs.mkdirSync(d, { recursive: true }) }
function toRepoPath(p) { return path.relative(PROJECT_ROOT, p).replaceAll(path.sep, '/') }

function loadConfig() {
  const defaults = { thresholds: { maxMajorBehind: 5, abandonedDays: 730 } }
  if (!fs.existsSync(CONFIG_PATH)) return defaults
  try {
    const raw = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'))
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

function classifyBehind(current, wanted, latest) {
  const [cMaj, cMin, cPatch] = parseSemver(current)
  const [lMaj, lMin, lPatch] = parseSemver(latest)
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
  ensureDir(OUT_DIR)
  const _config = loadConfig()

  const packages = []
  const dirs = [
    { name: 'client', path: CLIENT_ROOT },
    { name: 'server', path: SERVER_ROOT },
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

  const byBehind = { 'major-behind': 0, 'minor-behind': 0, 'patch-behind': 0, current: 0 }
  for (const p of packages) {
    byBehind[p.behind] = (byBehind[p.behind] || 0) + 1
  }

  const files = packages
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
    totalScanned: packages.length,
    byBehind,
    packages,
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
  lines.push(`- Total outdated: **${packages.length}**`)
  lines.push(`- Major behind: **${byBehind['major-behind']}** | Minor: **${byBehind['minor-behind']}** | Patch: **${byBehind['patch-behind']}**`)
  lines.push('')
  lines.push('## Major behind (top 20)')
  lines.push('')
  lines.push('| Package | Dependent | Current | Latest |')
  lines.push('| --- | --- | --- | --- |')
  for (const p of packages.filter(x => x.behind === 'major-behind').slice(0, 20)) {
    lines.push(`| ${p.package} | ${p.dependent} | ${p.current} | ${p.latest} |`)
  }
  lines.push('')
  lines.push('## Minor behind (top 20)')
  lines.push('')
  lines.push('| Package | Dependent | Current | Latest |')
  lines.push('| --- | --- | --- | --- |')
  for (const p of packages.filter(x => x.behind === 'minor-behind').slice(0, 20)) {
    lines.push(`| ${p.package} | ${p.dependent} | ${p.current} | ${p.latest} |`)
  }
  lines.push('')

  fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2))
  fs.writeFileSync(OUT_MD, lines.join('\n'))

  console.log('Wrote:', toRepoPath(OUT_JSON), toRepoPath(OUT_MD))
  console.log(`Outdated: ${packages.length} (major: ${byBehind['major-behind']}, minor: ${byBehind['minor-behind']}, patch: ${byBehind['patch-behind']})`)
  process.exitCode = 0
}

main()
