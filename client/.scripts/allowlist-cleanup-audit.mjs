#!/usr/bin/env node
/**
 * Allowlist cleanup audit:
 * 1) Records suppression hits from recent audit JSONs and refreshes prune suggestions.
 * 2) Validates central allowlist integrity:
 *    - audit-global-config.json parses
 *    - specific file references exist
 *    - never-permissible ruleIds are not allowlisted
 *
 * Fails (non-zero exit) when integrity issues are found.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  resolveAuditPaths,
  recordSuppressionHits,
  generateAllowlistPruneSuggestions,
} from './shared-audit-utils.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientRoot = path.resolve(__dirname, '..')
const repoRoot = path.resolve(clientRoot, '..')
const reportsDir = path.join(clientRoot, '.audit-reports')
const globalConfigPath = path.join(reportsDir, 'audit-global-config.json')
const auditTypeDefault = ['error-handling', 'type-import']

function normalizeRuleIds(entry) {
  if (Array.isArray(entry?.ruleIds)) return entry.ruleIds
  if (typeof entry?.ruleId === 'string') return [entry.ruleId]
  return []
}

function toRelativeRepoPath(absPath) {
  return path.relative(repoRoot, absPath).replaceAll('\\', '/')
}

function collectSuppressionHits(auditTypes) {
  const processed = []
  const missingJson = []

  for (const auditType of auditTypes) {
    const paths = resolveAuditPaths(auditType)
    const jsonPath = paths.outJson
    if (!fs.existsSync(jsonPath)) {
      missingJson.push(toRelativeRepoPath(jsonPath))
      continue
    }

    let data
    try {
      data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    } catch {
      missingJson.push(toRelativeRepoPath(jsonPath))
      continue
    }

    const hits = data?.suppressionHits
    if (hits && typeof hits === 'object') {
      recordSuppressionHits(auditType, hits)
      processed.push(auditType)
    }
  }

  return { processed, missingJson }
}

function findMissingSpecificFiles(config) {
  const issues = []
  const allowlists = config?.allowlists ?? {}

  for (const [auditType, allowlist] of Object.entries(allowlists)) {
    const specificEntries = Array.isArray(allowlist?.specific) ? allowlist.specific : []
    for (const entry of specificEntries) {
      if (!entry || typeof entry.file !== 'string') continue
      const absFilePath = path.join(repoRoot, entry.file)
      if (!fs.existsSync(absFilePath)) {
        issues.push({
          auditType,
          file: entry.file,
          ruleIds: normalizeRuleIds(entry),
        })
      }
    }
  }

  return issues
}

function findNeverPermissibleAllowlists(config) {
  const issues = []
  const categories = config?.neverPermissibleCategories ?? {}
  const neverPermissibleIds = new Set(
    Object.values(categories)
      .flatMap((category) => (Array.isArray(category?.ruleIds) ? category.ruleIds : []))
      .filter((value) => typeof value === 'string')
  )

  if (neverPermissibleIds.size === 0) return issues

  const allowlists = config?.allowlists ?? {}
  for (const [auditType, allowlist] of Object.entries(allowlists)) {
    const patternEntries = Array.isArray(allowlist?.patterns) ? allowlist.patterns : []
    const specificEntries = Array.isArray(allowlist?.specific) ? allowlist.specific : []

    patternEntries.forEach((entry, index) => {
      const hitRuleIds = normalizeRuleIds(entry).filter((ruleId) => neverPermissibleIds.has(ruleId))
      if (hitRuleIds.length === 0) return
      issues.push({
        auditType,
        location: `patterns[${index}]`,
        ruleIds: hitRuleIds,
        scope: entry?.glob ?? '*',
      })
    })

    specificEntries.forEach((entry, index) => {
      const hitRuleIds = normalizeRuleIds(entry).filter((ruleId) => neverPermissibleIds.has(ruleId))
      if (hitRuleIds.length === 0) return
      issues.push({
        auditType,
        location: `specific[${index}]`,
        ruleIds: hitRuleIds,
        file: entry?.file ?? null,
      })
    })
  }

  return issues
}

function renderMarkdownReport(report) {
  const lines = [
    '# Allowlist Cleanup Audit (Generated)',
    '',
    `Generated at: ${report.generatedAt}`,
    '',
    '## Summary',
    '',
    `- Suppression hits recorded: **${report.suppressionHits.processed.length}** (${report.suppressionHits.processed.join(', ') || 'none'})`,
    `- Missing audit JSON inputs: **${report.suppressionHits.missingJson.length}**`,
    `- Prune suggestions: **${report.pruneSuggestions.count}**`,
    `- Missing allowlist specific file references: **${report.integrity.missingSpecificFiles.length}**`,
    `- Never-permissible allowlist violations: **${report.integrity.neverPermissibleViolations.length}**`,
    '',
  ]

  if (report.suppressionHits.missingJson.length > 0) {
    lines.push('## Missing Audit JSON Inputs', '')
    report.suppressionHits.missingJson.forEach((item) => lines.push(`- \`${item}\``))
    lines.push('')
  }

  if (report.integrity.missingSpecificFiles.length > 0) {
    lines.push('## Missing Specific File References', '')
    lines.push('| Audit | File | Rule IDs |')
    lines.push('| --- | --- | --- |')
    report.integrity.missingSpecificFiles.forEach((issue) => {
      const ruleIdsText = issue.ruleIds.length > 0 ? issue.ruleIds.join(', ') : '(none)'
      lines.push(`| ${issue.auditType} | \`${issue.file}\` | ${ruleIdsText} |`)
    })
    lines.push('')
  }

  if (report.integrity.neverPermissibleViolations.length > 0) {
    lines.push('## Never-Permissible Allowlist Violations', '')
    lines.push('| Audit | Location | Rule IDs | Scope |')
    lines.push('| --- | --- | --- | --- |')
    report.integrity.neverPermissibleViolations.forEach((issue) => {
      const scope = issue.file ? `\`${issue.file}\`` : `\`${issue.scope ?? '*'}\``
      lines.push(`| ${issue.auditType} | ${issue.location} | ${issue.ruleIds.join(', ')} | ${scope} |`)
    })
    lines.push('')
  }

  lines.push('## Result', '')
  if (report.integrity.hasFailures) {
    lines.push('- **FAIL**: Fix allowlist integrity issues before relying on audit outputs.')
  } else {
    lines.push('- **PASS**: No allowlist integrity issues detected.')
  }
  lines.push('')
  return lines.join('\n')
}

function writeReport(report) {
  const jsonPath = path.join(reportsDir, 'allowlist-cleanup-audit.json')
  const mdPath = path.join(reportsDir, 'allowlist-cleanup-audit.md')
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2))
  fs.writeFileSync(mdPath, renderMarkdownReport(report))
  return { jsonPath, mdPath }
}

function main() {
  const requestedAuditTypes = process.argv.slice(2)
  const auditTypes = requestedAuditTypes.length > 0 ? requestedAuditTypes : auditTypeDefault

  let config
  try {
    config = JSON.parse(fs.readFileSync(globalConfigPath, 'utf8'))
  } catch (error) {
    const parseFailureReport = {
      generatedAt: new Date().toISOString(),
      check: 'allowlist-cleanup',
      configPath: toRelativeRepoPath(globalConfigPath),
      integrity: {
        hasFailures: true,
        parseError: error instanceof Error ? error.message : String(error),
        missingSpecificFiles: [],
        neverPermissibleViolations: [],
      },
      suppressionHits: {
        auditTypes,
        processed: [],
        missingJson: [],
      },
      pruneSuggestions: { count: 0 },
    }
    const { jsonPath, mdPath } = writeReport(parseFailureReport)
    console.error(`Wrote:\n- ${toRelativeRepoPath(jsonPath)}\n- ${toRelativeRepoPath(mdPath)}`)
    console.error(`FAIL: could not parse ${toRelativeRepoPath(globalConfigPath)}`)
    process.exitCode = 1
    return
  }

  const suppressionHits = collectSuppressionHits(auditTypes)
  const prune = generateAllowlistPruneSuggestions()
  const missingSpecificFiles = findMissingSpecificFiles(config)
  const neverPermissibleViolations = findNeverPermissibleAllowlists(config)
  const hasFailures = missingSpecificFiles.length > 0 || neverPermissibleViolations.length > 0

  const report = {
    generatedAt: new Date().toISOString(),
    check: 'allowlist-cleanup',
    configPath: toRelativeRepoPath(globalConfigPath),
    suppressionHits: {
      auditTypes,
      processed: suppressionHits.processed,
      missingJson: suppressionHits.missingJson,
    },
    pruneSuggestions: {
      count: prune.suggestions.length,
      reportJson: toRelativeRepoPath(prune.jsonPath),
      reportMd: toRelativeRepoPath(prune.mdPath),
    },
    integrity: {
      hasFailures,
      parseError: null,
      missingSpecificFiles,
      neverPermissibleViolations,
    },
  }

  const { jsonPath, mdPath } = writeReport(report)
  console.log(`Wrote:\n- ${toRelativeRepoPath(jsonPath)}\n- ${toRelativeRepoPath(mdPath)}`)
  console.log(`Suppression hits recorded for: ${suppressionHits.processed.join(', ') || 'none'}`)
  console.log(`Prune suggestions: ${prune.suggestions.length}`)
  console.log(`Missing specific file refs: ${missingSpecificFiles.length}`)
  console.log(`Never-permissible violations: ${neverPermissibleViolations.length}`)

  if (hasFailures) {
    console.error('FAIL: allowlist cleanup audit found integrity issues.')
    process.exitCode = 1
  }
}

main()
