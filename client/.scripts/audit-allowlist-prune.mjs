#!/usr/bin/env node
/**
 * Phase A: Record suppression hits from latest audit JSONs and generate allowlist-prune-suggestions.
 * Run after one or more audits (e.g. audit:type-import, audit:error-handling). Reads .audit-reports/<audit>-audit.json
 * for suppressionHits, appends to allowlist-hit-history.json, then writes allowlist-prune-suggestions.json and .md.
 *
 * Usage: node .scripts/audit-allowlist-prune.mjs [audit-type ...]
 * Example: node .scripts/audit-allowlist-prune.mjs type-import error-handling
 * With no args: processes all audit types that have a recent JSON with suppressionHits.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  resolveAuditPaths,
  recordSuppressionHits,
  generateAllowlistPruneSuggestions,
  loadAllowlistHitHistory,
} from './shared-audit-utils.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const AUDIT_TYPES_WITH_HITS = ['type-import', 'error-handling']

function main() {
  const args = process.argv.slice(2)
  const requested = args.length > 0 ? args : AUDIT_TYPES_WITH_HITS
  const clientDir = path.resolve(__dirname, '..')
  const outDir = path.join(clientDir, '.audit-reports')

  for (const auditType of requested) {
    const paths = resolveAuditPaths(auditType)
    const jsonPath = paths.outJson
    if (!fs.existsSync(jsonPath)) continue
    let data
    try {
      data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    } catch {
      continue
    }
    const hits = data.suppressionHits
    if (hits && typeof hits === 'object') {
      recordSuppressionHits(auditType, hits)
      console.log(`Recorded suppression hits for ${auditType}`)
    }
  }

  const { jsonPath, mdPath, suggestions } = generateAllowlistPruneSuggestions()
  console.log(`Wrote: ${path.relative(process.cwd(), jsonPath)}`)
  console.log(`Wrote: ${path.relative(process.cwd(), mdPath)}`)
  console.log(`Suggestions: ${suggestions.length} entries with zero hits in last N runs`)
}

main()
