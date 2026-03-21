/**
 * Inventory Reuse Check (session-start helper)
 *
 * Reads type-constant-inventory-audit.json and inventory-audit.json (composable inventory),
 * extracts keywords from the session guide, matches against both inventories, and outputs
 * a formatted "Reuse Check" section to stdout. Run from client directory.
 *
 * Usage: node .scripts/inventory-reuse-check.mjs <session-guide-path>
 * Exit: 0, stdout = formatted section or empty
 */

import fs from 'node:fs'
import path from 'node:path'

const guidePath = process.argv[2]
if (!guidePath) process.exit(0)

// When invoked from session-start hook, cwd is client root.
const clientRoot = process.cwd()
const auditDir = path.join(clientRoot, '.audit-reports')

const typeConstantPath = path.join(auditDir, 'type-constant-inventory-audit.json')
const composableInventoryPath = path.join(auditDir, 'inventory-audit.json')

if (!fs.existsSync(typeConstantPath) && !fs.existsSync(composableInventoryPath)) process.exit(0)

let guideContent = ''
try {
  guideContent = fs.readFileSync(path.resolve(guidePath), 'utf8')
} catch (_e) {
  process.exit(0)
}

function extractKeywords(text) {
  const composables = [...text.matchAll(/use[A-Z][A-Za-z0-9_]*/g)].map((m) => m[0])
  const typeLike = [...text.matchAll(/[A-Z][A-Za-z0-9_]*(?:Type|Props|Config|Payload|Return)\b/g)].map((m) => m[0])
  const constants = [...text.matchAll(/\b[A-Z][A-Z0-9_]{2,}\b/g)].map((m) => m[0])
  const domainWords = ['booking', 'admin', 'form', 'crud', 'entity', 'table', 'wizard', 'appointment', 'property', 'user', 'field', 'validation', 'config', 'constants']
  const domains = domainWords.filter((d) => text.toLowerCase().includes(d))
  return {
    composables: [...new Set(composables)],
    typeLike: [...new Set(typeLike)],
    constants: [...new Set(constants)].slice(0, 20),
    domains: [...new Set(domains)],
  }
}

const keywords = extractKeywords(guideContent)
const hasRelevant = keywords.composables.length > 0 || keywords.typeLike.length > 0 || keywords.domains.length > 0
if (!hasRelevant) process.exit(0)

let typeConstant = null
let composableInventory = null
try {
  if (fs.existsSync(typeConstantPath)) typeConstant = JSON.parse(fs.readFileSync(typeConstantPath, 'utf8'))
} catch (_e) { /* ignore missing file */ }
try {
  if (fs.existsSync(composableInventoryPath)) composableInventory = JSON.parse(fs.readFileSync(composableInventoryPath, 'utf8'))
} catch (_e) { /* ignore missing file */ }

const sections = []

if (typeConstant && typeConstant.typeFiles) {
  const byDomain = new Map()
  for (const t of typeConstant.typeFiles) {
    const d = t.annotatedDomain ?? t.directoryDomain ?? 'root'
    if (!byDomain.has(d)) byDomain.set(d, [])
    byDomain.get(d).push(t)
  }
  const matchedDomains = keywords.domains.length ? keywords.domains : ['root', 'admin', 'booking', 'entity']
  const typeLines = []
  for (const domain of matchedDomains) {
    const entries = byDomain.get(domain) || []
    for (const t of entries.slice(0, 8)) {
      const tier = t.reuseTier ?? 'unknown'
      typeLines.push(`- \`${t.repoPath}\` — ${(t.exports || []).slice(0, 3).join(', ')} [${tier}]`)
    }
  }
  const byName = typeConstant.typeFiles.filter((t) =>
    keywords.typeLike.some((k) => t.exports?.includes(k) || t.name?.includes(k))
  )
  for (const t of byName.slice(0, 5)) {
    typeLines.push(`- \`${t.repoPath}\` — ${(t.exports || []).slice(0, 3).join(', ')} [${t.reuseTier ?? 'unknown'}]`)
  }
  if (typeLines.length > 0) {
    sections.push('## Reuse Check (from Inventory Audits)\n\n### Types in this domain:\n' + [...new Set(typeLines)].slice(0, 12).join('\n'))
  }
}

if (typeConstant && typeConstant.constantFiles) {
  const constLines = []
  const byDomain = new Map()
  for (const c of typeConstant.constantFiles) {
    const d = c.annotatedDomain ?? c.directoryDomain ?? 'root'
    if (!byDomain.has(d)) byDomain.set(d, [])
    byDomain.get(d).push(c)
  }
  const matchedDomains = keywords.domains.length ? keywords.domains : ['root', 'admin', 'booking', 'entity']
  for (const domain of matchedDomains) {
    const entries = byDomain.get(domain) || []
    for (const c of entries.slice(0, 5)) {
      const tier = c.reuseTier ?? 'unknown'
      const exports = (c.exports || []).slice(0, 3).join(', ')
      constLines.push(`- \`${c.repoPath}\` — ${exports} [${tier}]`)
    }
  }
  if (constLines.length > 0) {
    sections.push('\n### Constants/configs in this domain:\n' + [...new Set(constLines)].slice(0, 8).join('\n'))
  }
}

if (composableInventory && composableInventory.composables) {
  const compLines = []
  const byDomain = new Map()
  for (const c of composableInventory.composables) {
    const d = c.annotatedDomain ?? c.directoryDomain ?? 'root'
    if (!byDomain.has(d)) byDomain.set(d, [])
    byDomain.get(d).push(c)
  }
  const matchedDomains = keywords.domains.length ? keywords.domains : ['root', 'admin', 'booking', 'entityCrud', 'formFields']
  for (const domain of matchedDomains) {
    const entries = byDomain.get(domain) || []
    for (const c of entries.slice(0, 6)) {
      const name = c.name ?? c.repoPath?.replace(/.*\//, '').replace(/\.ts$/, '')
      const tier = c.reuseTier ?? 'unknown'
      compLines.push(`- \`${name}\` (${domain}) — ${c.purpose || '(no annotation)'} [${tier}]`)
    }
  }
  const byName = composableInventory.composables.filter((c) => {
    const name = c.name ?? ''
    return keywords.composables.some((k) => name === k || name.includes(k))
  })
  for (const c of byName.slice(0, 5)) {
    const name = c.name ?? c.repoPath
    compLines.push(`- \`${name}\` — ${c.purpose || '(no annotation)'} [${c.reuseTier ?? 'unknown'}]`)
  }
  if (compLines.length > 0) {
    sections.push('\n### Composables in this domain:\n' + [...new Set(compLines)].slice(0, 10).join('\n'))
  }
}

if (typeConstant && typeConstant.inlineTypeExports && keywords.domains.length > 0) {
  const inline = typeConstant.inlineTypeExports.filter((inv) =>
    keywords.domains.some((d) => inv.sourceFile?.toLowerCase().includes(d))
  )
  if (inline.length > 0) {
    const lines = inline.slice(0, 4).map((inv) => `- \`${inv.sourceFile}\` exports \`${(inv.exportedTypes || []).join(', ')}\` — consider extracting`)
    sections.push('\n### Queued extractions in this domain:\n' + lines.join('\n'))
  }
}

if (sections.length === 0) process.exit(0)

const generated = typeConstant?.generatedAt ?? composableInventory?.generatedAt ?? ''
const dateLine = generated ? `\n\n> Inventory last refreshed: ${generated.slice(0, 10)}. Run \`npm run audit:type-constant-inventory && npm run audit:inventory\` to update.` : ''
process.stdout.write(sections.join('\n') + dateLine + '\n')
process.exit(0)
