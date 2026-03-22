#!/usr/bin/env node
/**
 * One-time triage merge: read type-constant-inventory-audit.json and add placement/priority/targetPath
 * to inventory-annotations.json for every inline type export and mixed file that lacks placement.
 * Run from client/: node .scripts/type-constant-inventory-triage-merge.mjs
 */

import fs from 'node:fs'
import path from 'node:path'

const AUDIT_JSON = '.audit-reports/type-constant-inventory-audit.json'
const ANNOTATIONS_JSON = '.audit-reports/inventory-annotations.json'

function toTargetPath(sourceFile) {
  // client/src/composables/admin/tables/useAppointmentsTableHandlers.ts -> client/src/types/admin/tables/appointmentsTableHandlers.ts
  if (!sourceFile.includes('/composables/')) return null
  const afterComposables = sourceFile.replace(/^client\/src\/composables\//, '')
  const match = afterComposables.match(/^(.+\/)?use([A-Z]\w+)\.ts$/)
  if (!match) return null
  const prefix = match[1] || ''
  const name = match[2]
  const camel = name.charAt(0).toLowerCase() + name.slice(1)
  return `client/src/types/${prefix}${camel}.ts`
}

function main() {
  const cwd = process.cwd()
  const auditPath = path.join(cwd, AUDIT_JSON)
  const annotationsPath = path.join(cwd, ANNOTATIONS_JSON)
  if (!fs.existsSync(auditPath)) {
    console.error('Run audit first: npm run audit:type-constant-inventory')
    process.exitCode = 1
    return
  }
  if (!fs.existsSync(annotationsPath)) {
    console.error('Missing inventory-annotations.json')
    process.exitCode = 1
    return
  }

  const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'))
  const annotations = JSON.parse(fs.readFileSync(annotationsPath, 'utf8'))

  let added = 0
  const inlineTypeExports = audit.inlineTypeExports || []
  for (const inv of inlineTypeExports) {
    const key = inv.sourceFile
    const existing = annotations[key]
    if (existing?.placement) continue
    const targetPath = toTargetPath(key)
    const priority = (inv.importedByCount > 0) ? 'high' : 'low'
    const entry = {
      ...(typeof existing === 'object' && existing !== null ? existing : {}),
      placement: 'needs-extraction',
      priority,
      targetPath: targetPath || undefined,
    }
    if (!annotations[key]) annotations[key] = {}
    Object.assign(annotations[key], entry)
    added++
  }

  const typeFiles = audit.typeFiles || []
  for (const t of typeFiles) {
    if (!t.alsoExportsRuntime) continue
    const key = t.repoPath
    const existing = annotations[key]
    if (existing?.placement) continue
    const entry = {
      ...(typeof existing === 'object' && existing !== null ? existing : {}),
      placement: 'needs-extraction',
      placementNote: 'Type file also exports runtime values; consider moving constants to constants/ or extract types.',
    }
    if (!annotations[key]) annotations[key] = {}
    Object.assign(annotations[key], entry)
    added++
  }

  const constantFiles = audit.constantFiles || []
  for (const c of constantFiles) {
    if (!c.alsoExportsTypes) continue
    const key = c.repoPath
    const existing = annotations[key]
    if (existing?.placement) continue
    const placement = c.placement === 'derived' || c.derivedPattern ? 'derived' : 'needs-extraction'
    const entry = {
      ...(typeof existing === 'object' && existing !== null ? existing : {}),
      placement,
      placementNote: placement === 'derived'
        ? 'Type derived from runtime constant via keyof typeof / (typeof X)[number] — cannot be separated'
        : 'Constants file also exports types; consider extracting types to types/.',
    }
    if (!annotations[key]) annotations[key] = {}
    Object.assign(annotations[key], entry)
    added++
  }

  fs.writeFileSync(annotationsPath, JSON.stringify(annotations, null, 2))
  console.log(`Triage merge complete: added placement for ${added} entries.`)
}

main()
