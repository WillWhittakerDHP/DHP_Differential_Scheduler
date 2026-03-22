#!/usr/bin/env node
/**
 * Config health auto-fix script.
 *
 * Detects and repairs three categories of config drift in audit-global-config.json:
 *
 * 1. Path Integrity Drift — specific file references that don't resolve on disk.
 *    Auto-fix: tries appending common extensions (.ts, .js, .vue) and updates the entry.
 *
 * 2. Stale Entry Drift — allowlist entries with zero suppression hits across recent runs.
 *    Auto-fix: removes entries flagged by prune suggestions (remove-review).
 *
 * 3. Annotation Coverage Drift — inventory items missing from inventory-annotations.json.
 *    Report-only: lists files needing manual annotation.
 *
 * CLI:
 *   node config-fix.mjs              # apply fixes
 *   node config-fix.mjs --dry-run    # preview without writing
 *
 * Programmatic (for tier-end integration):
 *   import { runConfigFix, renderConfigFixSummary } from './config-fix.mjs'
 *   const result = runConfigFix({ dryRun: false })
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateAllowlistPruneSuggestions } from './shared-audit-utils.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientRoot = path.resolve(__dirname, '..')
const repoRoot = path.resolve(clientRoot, '..')
const reportsDir = path.join(clientRoot, '.audit-reports')
const globalConfigPath = path.join(reportsDir, 'audit-global-config.json')
const annotationsPath = path.join(reportsDir, 'inventory-annotations.json')

const CANDIDATE_EXTENSIONS = ['.ts', '.js', '.vue', '.mjs']

/**
 * Walk all specific allowlist entries and repair broken file references by
 * trying common TypeScript/Vue extensions.
 *
 * @param {object} config - Parsed audit-global-config.json (mutated in place)
 * @returns {{ fixed: Array<{auditType: string, oldPath: string, newPath: string}>, unfixable: Array<{auditType: string, file: string}> }}
 */
function fixPathIntegrity(config) {
  const fixed = []
  const unfixable = []
  const allowlists = config?.allowlists ?? {}

  for (const [auditType, allowlist] of Object.entries(allowlists)) {
    const specific = Array.isArray(allowlist?.specific) ? allowlist.specific : []
    for (const entry of specific) {
      if (!entry || typeof entry.file !== 'string') continue
      const absPath = path.join(repoRoot, entry.file)
      if (fs.existsSync(absPath)) continue

      let resolved = null

      for (const ext of CANDIDATE_EXTENSIONS) {
        if (fs.existsSync(absPath + ext)) {
          resolved = path.relative(repoRoot, absPath + ext).replaceAll('\\', '/')
          break
        }
      }

      if (!resolved) {
        const parsed = path.parse(absPath)
        if (parsed.ext) {
          for (const ext of CANDIDATE_EXTENSIONS) {
            const candidate = path.join(parsed.dir, parsed.name + ext)
            if (fs.existsSync(candidate)) {
              resolved = path.relative(repoRoot, candidate).replaceAll('\\', '/')
              break
            }
          }
        }
      }

      if (resolved) {
        fixed.push({ auditType, oldPath: entry.file, newPath: resolved })
        entry.file = resolved
      } else {
        unfixable.push({ auditType, file: entry.file })
      }
    }
  }

  return { fixed, unfixable }
}

/**
 * Remove allowlist entries flagged by prune suggestions (zero suppression hits).
 * Processes removals in reverse index order to avoid index shifting.
 *
 * @param {object} config - Parsed audit-global-config.json (mutated in place)
 * @returns {{ removed: Array<{auditType: string, entryKey: string, reason: string}>, skipped: Array<{auditType: string, entryKey: string, reason: string}> }}
 */
function fixStaleEntries(config) {
  const { suggestions } = generateAllowlistPruneSuggestions()
  const removed = []
  const skipped = []

  const byAudit = Object.create(null)
  for (const s of suggestions) {
    if (s.recommendation !== 'remove-review') continue
    if (!byAudit[s.auditType]) byAudit[s.auditType] = []
    byAudit[s.auditType].push(s)
  }

  for (const [auditType, items] of Object.entries(byAudit)) {
    const allowlist = config?.allowlists?.[auditType]
    if (!allowlist) {
      for (const s of items) skipped.push({ auditType, entryKey: s.entryKey, reason: `No allowlist section for ${auditType}` })
      continue
    }

    const ARRAY_KEY_MAP = { pattern: 'patterns', specific: 'specific', linePattern: 'linePatterns' }

    const parsed = items
      .map(s => {
        const match = s.entryKey.match(/^(pattern|specific|linePattern):(\d+)$/)
        if (!match) return null
        return { ...s, arrayKey: ARRAY_KEY_MAP[match[1]], index: parseInt(match[2], 10) }
      })
      .filter(Boolean)

    parsed.sort((a, b) => {
      if (a.arrayKey !== b.arrayKey) return a.arrayKey.localeCompare(b.arrayKey)
      return b.index - a.index
    })

    for (const item of parsed) {
      const arr = allowlist[item.arrayKey]
      if (!Array.isArray(arr) || item.index >= arr.length) {
        skipped.push({ auditType, entryKey: item.entryKey, reason: 'Index out of bounds (config may have changed)' })
        continue
      }
      arr.splice(item.index, 1)
      removed.push({ auditType, entryKey: item.entryKey, reason: item.reason })
    }
  }

  return { removed, skipped }
}

/**
 * Report annotation coverage gaps (report-only, no auto-fix).
 * Compares inventory audit outputs against inventory-annotations.json.
 *
 * @returns {{ unannotatedCount: number, unannotated: string[] }}
 */
function reportAnnotationGaps() {
  const composableInvPath = path.join(reportsDir, 'inventory-audit.json')
  const typeInvPath = path.join(reportsDir, 'type-constant-inventory-audit.json')

  let annotatedPaths = new Set()
  try {
    const raw = JSON.parse(fs.readFileSync(annotationsPath, 'utf8'))
    annotatedPaths = new Set(Object.keys(raw).filter(k => k !== '_meta'))
  } catch { /* no annotations file */ }

  const unannotated = []

  if (fs.existsSync(composableInvPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(composableInvPath, 'utf8'))
      const all = [...(data.composables ?? []), ...(data.utils ?? []), ...(data.components ?? [])]
      for (const item of all) {
        const file = item.repoPath ?? item.file ?? item.path
        if (file && !annotatedPaths.has(file)) unannotated.push(file)
      }
    } catch { /* skip */ }
  }

  if (fs.existsSync(typeInvPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(typeInvPath, 'utf8'))
      const all = [...(data.typeFiles ?? []), ...(data.constantFiles ?? []), ...(data.configFiles ?? [])]
      for (const item of all) {
        const file = item.repoPath ?? item.file ?? item.path
        if (file && !annotatedPaths.has(file)) unannotated.push(file)
      }
    } catch { /* skip */ }
  }

  return { unannotatedCount: unannotated.length, unannotated }
}

/**
 * Run all config health checks and optionally write fixes.
 *
 * @param {{ dryRun?: boolean }} [options]
 * @returns {{ pathIntegrity: object, staleEntries: object, annotationGaps: object, configWritten: boolean, totalFixes: number, error?: string }}
 */
export function runConfigFix(options = {}) {
  const dryRun = options.dryRun ?? false

  let config
  try {
    config = JSON.parse(fs.readFileSync(globalConfigPath, 'utf8'))
  } catch (err) {
    return {
      error: `Failed to parse audit-global-config.json: ${err instanceof Error ? err.message : String(err)}`,
      pathIntegrity: { fixed: [], unfixable: [] },
      staleEntries: { removed: [], skipped: [] },
      annotationGaps: { unannotatedCount: 0, unannotated: [] },
      configWritten: false,
      totalFixes: 0,
    }
  }

  const pathIntegrity = fixPathIntegrity(config)
  const staleEntries = fixStaleEntries(config)
  const annotationGaps = reportAnnotationGaps()

  const totalFixes = pathIntegrity.fixed.length + staleEntries.removed.length
  let configWritten = false

  if (totalFixes > 0 && !dryRun) {
    fs.writeFileSync(globalConfigPath, JSON.stringify(config, null, 2) + '\n')
    configWritten = true
  }

  return { pathIntegrity, staleEntries, annotationGaps, configWritten, totalFixes }
}

/**
 * Render a human-readable markdown summary.
 *
 * @param {ReturnType<typeof runConfigFix>} result
 * @returns {string}
 */
export function renderConfigFixSummary(result) {
  const lines = ['## Config Health Fix Report', '']

  if (result.error) {
    lines.push(`**Error:** ${result.error}`, '')
    return lines.join('\n')
  }

  const pi = result.pathIntegrity
  lines.push('### Path Integrity')
  if (pi.fixed.length > 0) {
    lines.push(`- Fixed: **${pi.fixed.length}**`)
    for (const f of pi.fixed) lines.push(`  - \`${f.oldPath}\` → \`${f.newPath}\` (${f.auditType})`)
  } else {
    lines.push('- No broken file references.')
  }
  if (pi.unfixable.length > 0) {
    lines.push(`- Unfixable: **${pi.unfixable.length}** (manual review needed)`)
    for (const u of pi.unfixable) lines.push(`  - \`${u.file}\` (${u.auditType})`)
  }
  lines.push('')

  const se = result.staleEntries
  lines.push('### Stale Entries')
  if (se.removed.length > 0) {
    lines.push(`- Removed: **${se.removed.length}**`)
    for (const r of se.removed) lines.push(`  - ${r.auditType} → ${r.entryKey}`)
  } else {
    lines.push('- No stale entries to prune.')
  }
  if (se.skipped.length > 0) {
    lines.push(`- Skipped: **${se.skipped.length}**`)
    for (const s of se.skipped) lines.push(`  - ${s.auditType} → ${s.entryKey}: ${s.reason}`)
  }
  lines.push('')

  const ag = result.annotationGaps
  lines.push('### Annotation Coverage')
  if (ag.unannotatedCount === 0) {
    lines.push('- 100% annotated.')
  } else {
    lines.push(`- Unannotated: **${ag.unannotatedCount}** files (manual annotation needed)`)
  }
  lines.push('')

  lines.push('### Result')
  lines.push(`- Total auto-fixes applied: **${result.totalFixes}**`)
  lines.push(`- Config written: ${result.configWritten ? 'yes' : 'no (dry-run or no changes)'}`)
  lines.push('')

  return lines.join('\n')
}

function main() {
  const dryRun = process.argv.includes('--dry-run')
  const result = runConfigFix({ dryRun })
  console.log(renderConfigFixSummary(result))

  if (result.error) {
    process.exitCode = 1
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
}
