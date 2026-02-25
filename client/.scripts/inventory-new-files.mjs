/**
 * Inventory New Files (session-end helper)
 *
 * Runs git diff --name-only --diff-filter=A to find newly added files,
 * filters to types/constants/configs/composables/components and *Types.ts,
 * checks inventory-annotations.json for which are unannotated, and outputs
 * a formatted list with annotation template to stdout.
 *
 * Usage: node .scripts/inventory-new-files.mjs [--base=<ref>]
 * Default base: HEAD~20 (last 20 commits)
 * Exit: 0, stdout = formatted section or empty
 */

import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const clientRoot = process.cwd()
const auditDir = path.join(clientRoot, '.audit-reports')
const annotationsPath = path.join(auditDir, 'inventory-annotations.json')

const args = process.argv.slice(2)
let baseRef = 'HEAD~20'
for (const a of args) {
  if (a.startsWith('--base=')) baseRef = a.slice(7)
}

const relevantPatterns = [
  /^client\/src\/types\//,
  /^client\/src\/constants\//,
  /^client\/src\/configs\//,
  /^client\/src\/composables\//,
  /^client\/src\/components\//,
  /\/types\.ts$/,
  /Types\.ts$/,
]

function isRelevant(repoPath) {
  const normalized = repoPath.replace(/\\/g, '/')
  if (normalized.includes('__tests__') || /\.(test|spec)\.(ts|js|vue)$/i.test(normalized)) return false
  return relevantPatterns.some((p) => p.test(normalized))
}

let newFiles = []
try {
  const out = execSync(`git diff --name-only --diff-filter=A ${baseRef}`, {
    encoding: 'utf8',
    cwd: path.resolve(clientRoot, '..'),
  })
  newFiles = out
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((p) => p.startsWith('client/'))
    .filter(isRelevant)
} catch (_e) {
  process.exit(0)
}

if (newFiles.length === 0) process.exit(0)

let annotations = {}
try {
  if (fs.existsSync(annotationsPath)) {
    const data = JSON.parse(fs.readFileSync(annotationsPath, 'utf8'))
    const { _meta, ...entries } = data
    annotations = entries
  }
} catch (_e) { /* ignore missing file */ }

const unannotated = newFiles.filter((f) => !annotations[f])
if (unannotated.length === 0) process.exit(0)

function classify(repoPath) {
  if (repoPath.includes('/types/') || repoPath.endsWith('types.ts') || /Types\.ts$/.test(repoPath)) return 'type file'
  if (repoPath.startsWith('client/src/constants/')) return 'constants file'
  if (repoPath.startsWith('client/src/configs/')) return 'config file'
  if (repoPath.startsWith('client/src/composables/')) return 'composable'
  if (repoPath.startsWith('client/src/components/') && repoPath.endsWith('.vue')) return 'component'
  return 'other'
}

function suggestDomain(repoPath) {
  if (repoPath.includes('/booking/')) return 'booking'
  if (repoPath.includes('/admin/')) return 'admin'
  if (repoPath.includes('/entity/') || repoPath.includes('/entityCrud/')) return 'entity'
  if (repoPath.includes('/formFields/') || repoPath.includes('/fieldContext/')) return 'formFields'
  return ''
}

const lines = [
  '## New Files Created This Session (' + unannotated.length + ' unannotated)',
  '',
  ...unannotated.map((f) => `- \`${f}\` (${classify(f)})`),
  '',
  'Annotation template for inventory-annotations.json:',
  '',
]

const template = {}
for (const f of unannotated) {
  const domain = suggestDomain(f)
  template[f] = {
    purpose: '',
    domain: domain || '',
    reuseTier: '',
    tags: [],
  }
  if (classify(f) === 'composable') {
    template[f].placement = 'needs-extraction'
    template[f].priority = ''
    const segs = f.replace(/^client\/src\/composables\//, '').split('/')
    const name = segs[segs.length - 1].replace(/\.ts$/, '').replace(/^use/, '')
    template[f].targetPath = `client/src/types/${domain || 'root'}/${name}.ts`
  }
  if (classify(f) === 'constants file') {
    template[f].placement = 'derived'
    template[f].placementNote = 'Type derived via keyof typeof (if applicable)'
  }
}

lines.push(JSON.stringify(template, null, 2))
process.stdout.write(lines.join('\n') + '\n')
process.exit(0)
