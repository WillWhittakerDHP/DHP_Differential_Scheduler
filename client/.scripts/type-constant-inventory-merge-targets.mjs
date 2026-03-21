#!/usr/bin/env node
/**
 * Initial pass: from type-constant-inventory-audit.json, produce a merge-targets report.
 * - Group queued extractions by target path (merge target → list of source files + types).
 * - List duplicate type names (consolidation candidates).
 * - List cleanup candidates (misplaced + unused).
 * Run from client/: node .scripts/type-constant-inventory-merge-targets.mjs
 */

import fs from 'node:fs'
import path from 'node:path'

const AUDIT_JSON = '.audit-reports/type-constant-inventory-audit.json'
const OUT_MD = '.audit-reports/type-constant-inventory-merge-targets.md'

function main() {
  const cwd = process.cwd()
  const auditPath = path.join(cwd, AUDIT_JSON)
  if (!fs.existsSync(auditPath)) {
    console.error('Run audit first: npm run audit:type-constant-inventory')
    process.exitCode = 1
    return
  }

  const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'))
  const health = audit.classificationHealth || {}
  const queued = health.inlineTypes?.queued || []
  const duplicateFindings = health.duplicateTypeNames || []
  const cleanupCandidates = audit.cleanupCandidates || []

  // Group by target path
  const byTarget = new Map()
  for (const q of queued) {
    const target = q.targetPath || '(no target)'
    if (!byTarget.has(target)) byTarget.set(target, [])
    byTarget.get(target).push({
      sourceFile: q.sourceFile,
      exportedTypes: q.exportedTypes || [],
      priority: q.priority || '?',
    })
  }

  const lines = []
  lines.push('# Type/Constant Inventory — Merge Targets (Initial Pass)')
  lines.push('')
  lines.push('Generated from `type-constant-inventory-audit.json`. Use this to plan extractions and consolidations.')
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('## 1. Extraction merge targets (by target file)')
  lines.push('')
  lines.push('Each target path is a suggested type file; sources are composables (or utils) to extract types from.')
  lines.push('')
  const sortedTargets = [...byTarget.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  for (const [targetPath, sources] of sortedTargets) {
    lines.push(`### \`${targetPath}\``)
    lines.push('')
    for (const s of sources) {
      lines.push(`- **Source:** \`${s.sourceFile}\``)
      lines.push(`  - Types: ${s.exportedTypes.join(', ')}`)
      lines.push(`  - Priority: ${s.priority}`)
      lines.push('')
    }
  }
  lines.push('---')
  lines.push('')
  lines.push('## 2. Duplicate type names (consolidation candidates)')
  lines.push('')
  lines.push('Same type/interface name in multiple files — pick one canonical location and merge or re-export.')
  lines.push('')
  if (duplicateFindings.length === 0) {
    lines.push('_None._')
  } else {
    for (const d of duplicateFindings) {
      lines.push(`- **${d.typeName}**`)
      for (const f of d.files) lines.push(`  - \`${f}\``)
      lines.push('')
    }
  }
  lines.push('---')
  lines.push('')
  lines.push('## 3. Cleanup candidates (misplaced + unused)')
  lines.push('')
  if (cleanupCandidates.length === 0) {
    lines.push('_None (or unused-code-audit not run)._')
  } else {
    lines.push('| File | Type/Constant | Issue |')
    lines.push('| --- | --- | --- |')
    for (const c of cleanupCandidates) {
      lines.push(`| \`${c.file}\` | ${c.typeOrConstant} | ${c.placementIssue} |`)
    }
  }
  lines.push('')
  const outPath = path.join(cwd, OUT_MD)
  fs.writeFileSync(outPath, lines.join('\n'))
  console.log(`Wrote: ${outPath}`)
  console.log(`  Merge targets (by target path): ${sortedTargets.length}`)
  console.log(`  Duplicate type names: ${duplicateFindings.length}`)
  console.log(`  Cleanup candidates: ${cleanupCandidates.length}`)
}

main()
