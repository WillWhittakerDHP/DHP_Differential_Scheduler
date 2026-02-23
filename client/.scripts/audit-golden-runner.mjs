#!/usr/bin/env node
/**
 * Golden sample validation runner for Phase A.
 *
 * Runs target audit only on fixture dirs (AUDIT_FIXTURE_DIRS), then asserts:
 * - TP: every file under <ruleId>/tp/ produces at least one finding for that ruleId.
 * - FP: every file under <ruleId>/fp/ produces zero findings for that ruleId.
 *
 * Usage: node .scripts/audit-golden-runner.mjs [audit-type] [--json]
 * Example: node .scripts/audit-golden-runner.mjs type-escape --json
 * With no args: runs all audit types that have fixtures.
 *
 * Fixture layout: fixtures/audits/<auditType>/<ruleId>/tp/*.(ts|vue) and fp/*
 * Output: .audit-reports/audit-golden-results.json and audit-golden-results.md
 */

import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { resolveAuditPaths, getAuditReportHeaderLines } from './shared-audit-utils.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FIXTURES_BASE = path.resolve(__dirname, '..', 'fixtures', 'audits')
const EXTENSIONS = ['.ts', '.tsx', '.vue']

/** Which audit script to run per audit type */
const AUDIT_SCRIPTS = {
  'type-import': 'type-import-audit.mjs',
  'type-escape': 'type-escape-audit.mjs',
  'error-handling': 'error-handling-audit.mjs',
}

/**
 * Extract findings for a given ruleId from audit JSON. Returns array of { file } (repo-relative or absolute).
 * @param {string} auditType
 * @param {object} data - Parsed audit JSON
 * @param {string} ruleId
 * @returns {Array<{ file: string }>}
 */
function getFindingsForRule(auditType, data, ruleId) {
  if (auditType === 'type-import') {
    const key = ruleId === 'value-import-from-type-only-file' ? 'valueImportFromTypeOnlyFile' : 'typeUsedAsValue'
    const arr = Array.isArray(data[key]) ? data[key] : []
    return arr.map((f) => ({ file: f.file }))
  }
  if (auditType === 'type-escape') {
    const findings = Array.isArray(data.findings) ? data.findings : []
    return findings.filter((f) => f.ruleId === ruleId).map((f) => ({ file: f.file ?? f.repoPath }))
  }
  if (auditType === 'error-handling') {
    const files = Array.isArray(data.files) ? data.files : []
    const out = []
    for (const f of files) {
      const repoPath = f.repoPath ?? f.file
      const review = Array.isArray(f.requiresReview) ? f.requiresReview : []
      for (const m of review) {
        if (m.ruleId === ruleId) out.push({ file: repoPath })
      }
    }
    return out
  }
  return []
}

/**
 * List fixture files under a directory (recursive, by extension).
 * @param {string} dir
 * @returns {string[]} Absolute paths
 */
function listFixtureFiles(dir) {
  if (!fs.existsSync(dir)) return []
  const out = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const abs = path.join(dir, e.name)
    if (e.isDirectory()) {
      out.push(...listFixtureFiles(abs))
      continue
    }
    if (e.isFile() && EXTENSIONS.some((ext) => e.name.endsWith(ext))) out.push(abs)
  }
  return out
}

/**
 * Discover (auditType, ruleId) that have at least tp/ or fp/ with fixture files.
 */
function discoverFixtureRules(auditTypeFilter = null) {
  const entries = []
  if (!fs.existsSync(FIXTURES_BASE)) return entries
  const auditDirs = fs.readdirSync(FIXTURES_BASE, { withFileTypes: true }).filter((e) => e.isDirectory())
  for (const ad of auditDirs) {
    const auditType = ad.name
    if (auditTypeFilter && auditType !== auditTypeFilter) continue
    if (!AUDIT_SCRIPTS[auditType]) continue
    const auditPath = path.join(FIXTURES_BASE, auditType)
    const ruleDirs = fs.readdirSync(auditPath, { withFileTypes: true }).filter((e) => e.isDirectory())
    for (const rd of ruleDirs) {
      const ruleId = rd.name
      const tpDir = path.join(auditPath, ruleId, 'tp')
      const fpDir = path.join(auditPath, ruleId, 'fp')
      const tpFiles = listFixtureFiles(tpDir)
      const fpFiles = listFixtureFiles(fpDir)
      if (tpFiles.length > 0 || fpFiles.length > 0) {
        entries.push({ auditType, ruleId, tpFiles, fpFiles })
      }
    }
  }
  return entries
}

/**
 * Normalize file path for comparison (use forward slashes, relative to project or fixture base).
 */
function normFile(absPath, projectRoot) {
  const rel = path.relative(projectRoot, absPath).replaceAll(path.sep, '/')
  return rel.startsWith('..') ? absPath.replaceAll(path.sep, '/') : rel
}

function main() {
  const args = process.argv.slice(2)
  const jsonOut = args.includes('--json')
  const auditTypeFilter = args.find((a) => !a.startsWith('--')) || null

  const scriptDir = __dirname
  const clientDir = path.resolve(scriptDir, '..')
  const projectRoot = path.resolve(clientDir, '..')
  const paths = resolveAuditPaths('type-import') // any; we need projectRoot
  const outDir = path.join(clientDir, '.audit-reports')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  const fixtureRules = discoverFixtureRules(auditTypeFilter)
  const results = { generatedAt: new Date().toISOString(), rules: [], summary: { passed: 0, failed: 0, skipped: 0 } }

  for (const { auditType, ruleId, tpFiles, fpFiles } of fixtureRules) {
    const scriptName = AUDIT_SCRIPTS[auditType]
    const scriptPath = path.join(scriptDir, scriptName)
    if (!fs.existsSync(scriptPath)) {
      results.rules.push({ auditType, ruleId, status: 'skipped', reason: `script not found: ${scriptName}` })
      results.summary.skipped++
      continue
    }

    const fixtureDirs = [
      path.join(FIXTURES_BASE, auditType, ruleId, 'tp'),
      path.join(FIXTURES_BASE, auditType, ruleId, 'fp'),
    ].filter((d) => fs.existsSync(d))
    if (fixtureDirs.length === 0) {
      results.rules.push({ auditType, ruleId, status: 'skipped', reason: 'no tp or fp dirs' })
      results.summary.skipped++
      continue
    }

    const env = { ...process.env, AUDIT_FIXTURE_DIRS: fixtureDirs.join(path.delimiter) }
    let auditData = null
    try {
      execSync(`node "${scriptPath}"`, { cwd: clientDir, env, stdio: ['inherit', 'pipe', 'pipe'], encoding: 'utf8' })
      const auditJsonPath = path.join(outDir, `${auditType}-audit.json`)
      if (fs.existsSync(auditJsonPath)) {
        auditData = JSON.parse(fs.readFileSync(auditJsonPath, 'utf8'))
      }
    } catch (err) {
      results.rules.push({ auditType, ruleId, status: 'failed', reason: 'audit run failed', error: String(err.message) })
      results.summary.failed++
      continue
    }

    if (!auditData) {
      results.rules.push({ auditType, ruleId, status: 'failed', reason: 'no audit JSON produced' })
      results.summary.failed++
      continue
    }

    const findings = getFindingsForRule(auditType, auditData, ruleId)
    const findingFiles = new Set(
      findings.map((f) => {
        const file = (f.file || '').replaceAll('\\', '/')
        return file.startsWith('/') ? normFile(file, projectRoot) : file
      })
    )

    let passed = true
    const tpMissed = []
    const fpHit = []
    for (const tp of tpFiles) {
      const n = normFile(tp, projectRoot)
      if (!findingFiles.has(n)) {
        const rel = path.relative(FIXTURES_BASE, tp)
        if (!findingFiles.has(rel)) {
          tpMissed.push(rel)
          passed = false
        }
      }
    }
    for (const fp of fpFiles) {
      const n = normFile(fp, projectRoot)
      if (findingFiles.has(n)) {
        fpHit.push(n)
        passed = false
      } else {
        const rel = path.relative(FIXTURES_BASE, fp)
        if (findingFiles.has(rel)) {
          fpHit.push(rel)
          passed = false
        }
      }
    }

    const tpCount = tpFiles.length
    const fpCount = fpFiles.length
    const tpDetected = tpCount - tpMissed.length
    const fpDetected = fpHit.length
    const precision = tpDetected + fpDetected > 0 ? tpDetected / (tpDetected + fpDetected) : 1
    const recall = tpCount > 0 ? tpDetected / tpCount : 1

    results.rules.push({
      auditType,
      ruleId,
      status: passed ? 'passed' : 'failed',
      tpTotal: tpCount,
      tpDetected,
      tpMissed: tpMissed.slice(0, 10),
      fpTotal: fpCount,
      fpDetected,
      fpHit: fpHit.slice(0, 10),
      precision: Math.round(precision * 1000) / 1000,
      recall: Math.round(recall * 1000) / 1000,
    })
    if (passed) results.summary.passed++
    else results.summary.failed++
  }

  const jsonPath = path.join(outDir, 'audit-golden-results.json')
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2))

  const mdLines = [
    ...getAuditReportHeaderLines(),
    '',
    '# Audit Golden Sample Results',
    '',
    `Generated: ${results.generatedAt}`,
    '',
    '## Summary',
    '',
    `| Passed | Failed | Skipped |`,
    `| ---: | ---: | ---: |`,
    `| ${results.summary.passed} | ${results.summary.failed} | ${results.summary.skipped} |`,
    '',
    '## Per rule',
    '',
    '| Audit | Rule | Status | TP det | TP total | FP det | Precision | Recall |',
    '| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |',
  ]
  for (const r of results.rules) {
    mdLines.push(`| ${r.auditType} | ${r.ruleId} | ${r.status} | ${r.tpDetected ?? '-'} | ${r.tpTotal ?? '-'} | ${r.fpDetected ?? '-'} | ${r.precision ?? '-'} | ${r.recall ?? '-'} |`)
  }
  mdLines.push('')
  const mdPath = path.join(outDir, 'audit-golden-results.md')
  fs.writeFileSync(mdPath, mdLines.join('\n'))

  if (jsonOut) {
    console.log(JSON.stringify(results, null, 2))
  } else {
    console.log(`Wrote: ${path.relative(process.cwd(), jsonPath)}`)
    console.log(`Wrote: ${path.relative(process.cwd(), mdPath)}`)
    console.log(`Passed: ${results.summary.passed}, Failed: ${results.summary.failed}, Skipped: ${results.summary.skipped}`)
  }

  process.exitCode = results.summary.failed > 0 ? 1 : 0
}

main()
