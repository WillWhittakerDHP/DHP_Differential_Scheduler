#!/usr/bin/env node
/**
 * Single summary runner: loads audit JSON, looks up renderer by audit type, writes summary MD.
 * Usage: node .scripts/audit-summary.mjs <audit-type>
 * Example: node .scripts/audit-summary.mjs type-import
 * For typecheck: node .scripts/audit-summary.mjs typecheck (reads from .audit-reports/typecheck/)
 */

import fs from 'node:fs'
import {
  getAuditReportHeaderLines,
  resolveAuditPaths,
  resolveSummaryPaths,
  toRepoPath,
  getPreviousAuditJsonPath,
  loadPreviousAuditSnapshot,
  computeFindingDelta,
  findingIdentityKey,
  DELTA_FINDING_EXTRACTORS,
} from './shared-audit-utils.mjs'
import { SUMMARY_RENDERERS } from './audit-summary-renderers.mjs'

const AUDIT_TYPES = Object.keys(SUMMARY_RENDERERS).sort()

function usage() {
  console.error('Usage: node .scripts/audit-summary.mjs <audit-type>')
  console.error('Known audit types:', AUDIT_TYPES.join(', '))
}

function main() {
  const auditType = process.argv[2]
  if (!auditType) {
    usage()
    process.exitCode = 1
    return
  }

  const render = SUMMARY_RENDERERS[auditType]
  if (!render) {
    console.error(`Unknown audit type: ${auditType}`)
    usage()
    process.exitCode = 1
    return
  }

  const pathOptions = auditType === 'typecheck' ? { auditOutputSubdir: 'typecheck' } : {}
  const summaryPaths = resolveSummaryPaths(auditType, pathOptions)

  if (!fs.existsSync(summaryPaths.auditJson)) {
    console.error(`Run audit:${auditType} first. Missing: ${summaryPaths.auditJson}`)
    process.exitCode = 1
    return
  }

  const data = JSON.parse(fs.readFileSync(summaryPaths.auditJson, 'utf8'))
  const projectRoot = resolveAuditPaths(auditType, auditType === 'typecheck' ? { outputSubdir: 'typecheck' } : {}).projectRoot
  const context = { projectRoot, auditJsonPath: summaryPaths.auditJson, toRepoPath: (p) => toRepoPath(p, projectRoot) }

  const extractor = DELTA_FINDING_EXTRACTORS[auditType]
  if (extractor) {
    const previousPath = getPreviousAuditJsonPath(auditType, pathOptions)
    const previousData = loadPreviousAuditSnapshot(previousPath)
    const currentFindings = extractor(data)
    const previousFindings = previousData ? extractor(previousData) : []
    context.delta = computeFindingDelta(currentFindings, previousFindings, findingIdentityKey)
  }

  const body = render(data, context)
  const header = getAuditReportHeaderLines().join('\n')
  const mdContent = header ? `${header}\n\n${body}` : body

  fs.writeFileSync(summaryPaths.summaryMd, mdContent)
  console.log(`Wrote: ${context.toRepoPath(summaryPaths.summaryMd)}`)
  process.exitCode = 0
}

main()
