import fs from 'node:fs'
import path from 'node:path'
import {
  getAuditReportHeaderLines,
  isGloballyExcluded,
  resolveAuditPaths,
  shouldPruneDirectory,
  writeAuditReports,
  toRepoPath,
} from './shared-audit-utils.mjs'

/**
 * Composable and Component Inventory Audit
 *
 * Produces a structured inventory of composables, utils, and components with
 * auto-extracted metadata, optional manual annotations, classification health,
 * domain health, and cross-category overlap detection.
 *
 * Scope:
 * - Composables: client/src/composables and @core/composable (ts, js)
 * - Utils: client/src/utils (ts, js)
 * - Components: client/src/components (vue)
 * - Excluded: global exclusions (audit-global-config.json: tests, @core, @layouts, dist, etc.) plus types.ts
 *
 * Output: client/.audit-reports/inventory-audit.json, inventory-audit.md
 */

const _paths = resolveAuditPaths('inventory')
const PROJECT_ROOT = _paths.projectRoot
const CLIENT_SRC = _paths.clientSrc
const COMPOSABLES_DIR = path.join(CLIENT_SRC, 'composables')
const CORE_COMPOSABLE_DIR = path.join(CLIENT_SRC, '@core', 'composable')
const UTILS_DIR = path.join(CLIENT_SRC, 'utils')
const COMPONENTS_DIR = path.join(CLIENT_SRC, 'components')
const ANNOTATIONS_PATH = path.join(_paths.outDir, 'inventory-annotations.json')

const INVENTORY_EXCLUDED_PATTERNS = [
  (p) => path.basename(p) === 'types.ts',
]

function toRepoPathLocal(absPath) {
  return toRepoPath(absPath, PROJECT_ROOT)
}

function toStableId(repoPath) {
  return repoPath.replaceAll('/', '__')
}

/** Recursively collect files under dir with given extensions; repo paths relative to project root.
 *  Uses shouldPruneDirectory() and isGloballyExcluded() from shared-audit-utils so we respect
 *  audit-global-config.json (tests, @core, @layouts, dist, node_modules, etc.).
 */
function walkDir(dir, extensions, projectRoot, out = []) {
  if (!fs.existsSync(dir)) return out
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const abs = path.join(dir, e.name)
    const repoPath = path.relative(projectRoot, abs).replaceAll(path.sep, '/')
    if (e.isDirectory()) {
      if (shouldPruneDirectory(e.name)) continue
      walkDir(abs, extensions, projectRoot, out)
      continue
    }
    if (!e.isFile()) continue
    const ext = path.extname(e.name)
    if (!extensions.includes(ext)) continue
    if (isGloballyExcluded(repoPath)) continue
    if (INVENTORY_EXCLUDED_PATTERNS.some((fn) => fn(repoPath))) continue
    out.push({ absPath: abs, repoPath })
  }
  return out
}

function extractExportedUseFunctions(contents) {
  const out = new Set()
  const functionRegex = /export\s+function\s+(use[A-Za-z0-9_]+)\s*\(/g
  const constRegex = /export\s+const\s+(use[A-Za-z0-9_]+)\s*=/g
  let m
  while ((m = functionRegex.exec(contents)) !== null) out.add(m[1])
  while ((m = constRegex.exec(contents)) !== null) out.add(m[1])
  return Array.from(out.values()).sort()
}

function extractExportedFunctions(contents) {
  const out = new Set()
  const functionRegex = /export\s+function\s+([A-Za-z0-9_]+)\s*\(/g
  const constRegex = /export\s+const\s+([A-Za-z0-9_]+)\s*=/g
  let m
  while ((m = functionRegex.exec(contents)) !== null) out.add(m[1])
  while ((m = constRegex.exec(contents)) !== null) out.add(m[1])
  return Array.from(out.values()).sort()
}

function extractReturnKeys(contents) {
  const idx = contents.indexOf('return {')
  if (idx === -1) return []
  const slice = contents.slice(idx, idx + 4000)
  const endIdx = slice.indexOf('}')
  if (endIdx === -1) return []
  const body = slice.slice('return {'.length, endIdx)
  const keyRegex = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*(?:,|:)/gm
  const keys = new Set()
  let m
  while ((m = keyRegex.exec(body)) !== null) keys.add(m[1])
  return Array.from(keys.values()).sort()
}

/** Strip single-line (//) and block comments so comment text doesn't trigger false positives. */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '')
}

function detectsVueReactivity(contents) {
  const code = stripComments(contents)
  return (
    /\b(ref|computed|watch|watchEffect|reactive|onMounted|onUnmounted|onBeforeUnmount)\s*[( \s]/.test(code) ||
    /\buse(Query|Mutation|QueryClient)\b/.test(code) ||
    /import\s+(?!type\s)[^'"]*from\s+['"]vue['"]/.test(code) ||
    /from\s+['"]@tanstack\/vue-query['"]/.test(code)
  )
}

/** Detect if file calls other composables (use* functions) even if it has no direct Vue reactivity. */
function callsOtherComposables(contents) {
  const code = stripComments(contents)
  const importedComposables = code.match(/import\s+(?!type\s){[^}]*\buse[A-Z][A-Za-z0-9_]*\b[^}]*}\s+from/g)
  return importedComposables !== null && importedComposables.length > 0
}

/** Detect if file accepts Vue Ref/ComputedRef params and accesses .value — a composable pattern. */
function acceptsReactiveParams(contents) {
  const code = stripComments(contents)
  const importsRefTypes = /import\s+type\s+{[^}]*\b(Ref|ComputedRef|WritableComputedRef)\b/.test(code)
  const accessesValue = /\.\s*value\b/.test(code)
  return importsRefTypes && accessesValue
}

/** Derive directory domain from repo path and base segment (e.g. client/src/composables -> composables/admin/tables -> admin/tables). */
function deriveDomain(repoPath, baseSegment) {
  const idx = repoPath.indexOf(baseSegment)
  if (idx === -1) return 'unknown'
  const after = repoPath.slice(idx + baseSegment.length).replace(/^\//, '')
  const dir = path.dirname(after)
  return dir === '.' ? 'root' : dir.replaceAll(path.sep, '/')
}

function countLines(contents) {
  const lines = contents.replaceAll('\r\n', '\n').split('\n')
  return lines.filter((l) => l.trim() && !l.trim().startsWith('//') && !l.trim().startsWith('*')).length
}

function _extractFileComment(contents) {
  const lines = contents.split('\n')
  const first = lines.findIndex((l) => l.trim().startsWith('/**') || l.trim().startsWith('*') || l.trim().startsWith('//'))
  if (first === -1) return null
  const collected = []
  for (let i = first; i < Math.min(first + 8, lines.length); i++) {
    const t = lines[i].trim()
    if (t.startsWith('*') || t.startsWith('//')) {
      const text = t.replace(/^\*\/?\/?\s*/, '').trim()
      if (text && text !== '/**') collected.push(text)
    } else if (t === '*/') break
  }
  return collected.length ? collected.join(' ').slice(0, 200) : null
}

// --- Composables scan
function scanComposable(absPath, repoPath, contents) {
  const useExports = extractExportedUseFunctions(contents)
  const directoryDomain = repoPath.includes('@core/composable')
    ? '@core'
    : deriveDomain(repoPath, 'composables/')
  const usesVueReactivity = detectsVueReactivity(contents)
  const composesOtherComposables = callsOtherComposables(contents)
  const operatesOnRefs = acceptsReactiveParams(contents)
  const isComposable = useExports.length > 0
  return {
    id: toStableId(repoPath),
    repoPath,
    name: path.basename(repoPath, path.extname(repoPath)),
    directoryDomain,
    annotatedDomain: null,
    domainMatch: null,
    exports: useExports,
    returnKeys: extractReturnKeys(contents),
    lineCount: countLines(contents),
    usesVueReactivity,
    composesOtherComposables,
    operatesOnRefs,
    isComposable,
    purpose: null,
    reuseTier: 'unknown',
    tags: [],
  }
}

// --- Utils scan
function scanUtil(absPath, repoPath, contents) {
  const rawDomain = deriveDomain(repoPath, 'utils/')
  const directoryDomain = rawDomain === 'root' ? 'utils/.' : `utils/${rawDomain}`
  const usesVueReactivity = detectsVueReactivity(contents)
  return {
    id: toStableId(repoPath),
    repoPath,
    name: path.basename(repoPath, path.extname(repoPath)),
    directoryDomain,
    annotatedDomain: null,
    domainMatch: null,
    exports: extractExportedFunctions(contents),
    lineCount: countLines(contents),
    usesVueReactivity,
    purpose: null,
    reuseTier: 'unknown',
    tags: [],
  }
}

// --- Components: extract script block
function extractScriptBlock(contents) {
  const match = contents.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  return match ? match[1] : ''
}

function extractComponentProps(scriptContent) {
  const out = new Set()
  const defineProps = /defineProps\s*<\s*\{([^}]+)\}>/g
  const propsOption = /props:\s*\{([^}]+)\}/g
  let m
  while ((m = defineProps.exec(scriptContent)) !== null) {
    const keys = m[1].match(/(\w+)\s*[:?]/g)
    if (keys) keys.forEach((k) => out.add(k.replace(/\s*[:?].*$/, '').trim()))
  }
  while ((m = propsOption.exec(scriptContent)) !== null) {
    const keys = m[1].match(/(\w+)\s*[:{]/g)
    if (keys) keys.forEach((k) => out.add(k.replace(/\s*[:{].*$/, '').trim()))
  }
  return Array.from(out.values()).sort()
}

function extractComponentEmits(scriptContent) {
  const out = new Set()
  const defineEmits = /defineEmits\s*<\s*\{([^}]+)\}>/g
  const _emitsOption = /emits:\s*\[([^\]]+)\]|emits:\s*\{/g
  let m
  while ((m = defineEmits.exec(scriptContent)) !== null) {
    const keys = m[1].match(/'([^']+)'|"([^"]+)"|(\w+)/g)
    if (keys) keys.forEach((k) => out.add((k.match(/'([^']+)'|"([^"]+)"|(\w+)/) || [])[1] || (k.match(/\w+/) || [])[0]))
  }
  const em = scriptContent.match(/emits:\s*\[([^\]]+)\]/)
  if (em) {
    em[1].split(',').forEach((s) => {
      const t = s.trim().replace(/['"]/g, '')
      if (t) out.add(t)
    })
  }
  return Array.from(out.values()).filter(Boolean).sort()
}

function extractComposableUsage(scriptContent) {
  const out = new Set()
  const re = /\b(use[A-Za-z0-9_]+)\s*\(/g
  let m
  while ((m = re.exec(scriptContent)) !== null) out.add(m[1])
  return Array.from(out.values()).sort()
}

function scanComponent(absPath, repoPath, contents) {
  const scriptContent = extractScriptBlock(contents)
  const directoryDomain = deriveDomain(repoPath, 'components/')
  return {
    id: toStableId(repoPath),
    repoPath,
    name: path.basename(repoPath, '.vue'),
    directoryDomain,
    annotatedDomain: null,
    domainMatch: null,
    props: extractComponentProps(scriptContent),
    emits: extractComponentEmits(scriptContent),
    usesComposables: extractComposableUsage(scriptContent),
    purpose: null,
    reuseTier: 'unknown',
    tags: [],
  }
}

// --- Annotations
function loadAnnotations() {
  if (!fs.existsSync(ANNOTATIONS_PATH)) return { _meta: {}, entries: {} }
  try {
    const raw = fs.readFileSync(ANNOTATIONS_PATH, 'utf8')
    const data = JSON.parse(raw)
    const entries = { ...data }
    delete entries._meta
    return { _meta: data._meta || {}, entries }
  } catch {
    return { _meta: {}, entries: {} }
  }
}

function mergeAnnotations(composables, utils, components, annotations) {
  const _byPath = (arr) => {
    const map = new Map()
    for (const e of arr) map.set(e.repoPath, e)
    return map
  }
  const annot = annotations.entries || {}
  const _validDomains = annotations._meta?.validDomains || []
  const _validTags = annotations._meta?.validTags || []

  function enrich(entry) {
    const a = annot[entry.repoPath]
    if (!a) return entry
    const annotatedDomain = a.domain ?? null
    const domainMatch =
      annotatedDomain === null ? null : annotatedDomain === entry.directoryDomain
    return {
      ...entry,
      purpose: a.purpose ?? null,
      reuseTier: a.reuseTier ?? 'unknown',
      tags: Array.isArray(a.tags) ? a.tags : [],
      annotatedDomain,
      domainMatch,
    }
  }

  return {
    composables: composables.map(enrich),
    utils: utils.map(enrich),
    components: components.map(enrich),
  }
}

// --- Classification health
function detectClassificationHealth(composables, utils) {
  const utilsInDisguise = composables
    .filter((c) => c.isComposable !== false && !c.usesVueReactivity && !c.composesOtherComposables && !c.operatesOnRefs)
    .map((c) => ({ repoPath: c.repoPath, reason: 'In composables/ but uses zero Vue reactivity — consider moving to utils/' }))
  const composablesInDisguise = utils
    .filter((u) => u.usesVueReactivity)
    .map((u) => ({ repoPath: u.repoPath, reason: 'Util file imports Vue reactivity — consider moving to composables/' }))
  return { utilsInDisguise, composablesInDisguise }
}

// --- Domain health
function detectDomainMismatches(composables, utils, components) {
  const all = [...composables, ...utils, ...components]
  return all.filter((e) => e.annotatedDomain != null && e.annotatedDomain !== e.directoryDomain)
}

function detectNonComposables(composables) {
  return composables.filter((c) => c.isComposable === false)
}

function flagRootLevelComposables(composables) {
  return composables.filter((c) => c.directoryDomain === 'root')
}

// --- Overlap detection
function detectTagOverlaps(composables, utils, components) {
  const all = [...composables, ...utils, ...components].filter((e) => e.tags && e.tags.length > 0)
  const byTag = new Map()
  for (const e of all) {
    for (const tag of e.tags) {
      if (!byTag.has(tag)) byTag.set(tag, [])
      byTag.get(tag).push(e.repoPath)
    }
  }
  const overlapCandidates = []
  for (const [tag, entries] of byTag) {
    if (entries.length >= 3) {
      overlapCandidates.push({
        tag,
        entries,
        note: `${entries.length} entries share the "${tag}" tag — review whether any share responsibilities`,
      })
    }
  }
  return overlapCandidates
}

// --- Markdown report
function renderMarkdownReport(payload) {
  const lines = []
  lines.push(...getAuditReportHeaderLines())
  lines.push('# Inventory Audit (Generated)')
  lines.push('')
  lines.push('This file is generated by `client/.scripts/composable-inventory-audit.mjs`.')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  const s = payload.summary
  lines.push(`- Composables scanned: **${s.totalComposables}**`)
  lines.push(`- Utilities scanned: **${s.totalUtils}**`)
  lines.push(`- Components scanned: **${s.totalComponents}**`)
  lines.push(`- Annotated: **${s.annotated}** (${s.totalFiles ? Math.round((100 * s.annotated) / s.totalFiles) : 0}%)`)
  lines.push(`- Unannotated: **${s.unannotated}**`)
  lines.push('')
  lines.push('| Reuse Tier | Count |')
  lines.push('| --- | ---: |')
  for (const [tier, count] of Object.entries(s.byReuseTier || {})) {
    lines.push(`| ${tier} | ${count} |`)
  }
  lines.push('')
  lines.push('| Classification Issue | Count |')
  lines.push('| --- | ---: |')
  lines.push(`| Utils in disguise (composable files with no Vue reactivity) | ${(payload.classificationHealth?.utilsInDisguise || []).length} |`)
  lines.push(`| Composables in disguise (util files importing Vue) | ${(payload.classificationHealth?.composablesInDisguise || []).length} |`)
  lines.push('')

  // Composable catalog by domain
  const byDomain = new Map()
  for (const c of payload.composables || []) {
    const d = c.annotatedDomain ?? c.directoryDomain
    if (!byDomain.has(d)) byDomain.set(d, [])
    byDomain.get(d).push(c)
  }
  lines.push('## Composable Catalog')
  lines.push('')
  for (const [domain] of [...byDomain.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const entries = byDomain.get(domain)
    lines.push(`### Domain: ${domain}`)
    lines.push('')
    lines.push('| Composable | Exports | Return Keys | Purpose | Tier |')
    lines.push('| --- | --- | --- | --- | --- |')
    for (const e of entries) {
      const purpose = e.purpose || '(no annotation)'
      const returnKeys = (e.returnKeys || []).slice(0, 5).join(', ') + ((e.returnKeys?.length || 0) > 5 ? ', …' : '')
      lines.push(`| ${e.name} | ${(e.exports || []).join(', ')} | ${returnKeys} | ${purpose} | ${e.reuseTier} |`)
    }
    lines.push('')
  }

  // Utils catalog
  const utilsByDomain = new Map()
  for (const u of payload.utils || []) {
    const d = u.annotatedDomain ?? u.directoryDomain
    if (!utilsByDomain.has(d)) utilsByDomain.set(d, [])
    utilsByDomain.get(d).push(u)
  }
  lines.push('## Utility Catalog')
  lines.push('')
  for (const [domain] of [...utilsByDomain.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const entries = utilsByDomain.get(domain)
    lines.push(`### Domain: ${domain}`)
    lines.push('')
    lines.push('| Utility | Exports | Purpose | Tier |')
    lines.push('| --- | --- | --- | --- |')
    for (const e of entries) {
      const purpose = e.purpose || '(no annotation)'
      const exports = (e.exports || []).slice(0, 5).join(', ') + ((e.exports?.length || 0) > 5 ? ', …' : '')
      lines.push(`| ${e.name} | ${exports} | ${purpose} | ${e.reuseTier} |`)
    }
    lines.push('')
  }

  // Component catalog
  const compByDomain = new Map()
  for (const c of payload.components || []) {
    const d = c.annotatedDomain ?? c.directoryDomain
    if (!compByDomain.has(d)) compByDomain.set(d, [])
    compByDomain.get(d).push(c)
  }
  lines.push('## Component Catalog')
  lines.push('')
  for (const [domain] of [...compByDomain.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const entries = compByDomain.get(domain)
    lines.push(`### Domain: ${domain}`)
    lines.push('')
    lines.push('| Component | Props | Emits | Purpose | Tier |')
    lines.push('| --- | --- | --- | --- | --- |')
    for (const e of entries) {
      const purpose = e.purpose || '(no annotation)'
      const props = (e.props || []).slice(0, 4).join(', ') + ((e.props?.length || 0) > 4 ? '…' : '')
      const emits = (e.emits || []).slice(0, 4).join(', ') + ((e.emits?.length || 0) > 4 ? '…' : '')
      lines.push(`| ${e.name} | ${props} | ${emits} | ${purpose} | ${e.reuseTier} |`)
    }
    lines.push('')
  }

  // Classification health
  lines.push('## Classification Health')
  lines.push('')
  const utilsInDisguise = payload.classificationHealth?.utilsInDisguise || []
  lines.push('### Utils in Disguise (composable files with no Vue reactivity)')
  lines.push('')
  if (utilsInDisguise.length === 0) {
    lines.push('(none)')
  } else {
    lines.push('| File | Exports | Current Domain |')
    lines.push('| --- | --- | --- |')
    for (const u of utilsInDisguise) {
      const e = (payload.composables || []).find((c) => c.repoPath === u.repoPath)
      lines.push(`| ${e ? e.name : path.basename(u.repoPath)} | ${e?.exports?.join(', ') || '—'} | ${e?.directoryDomain || '—'} |`)
    }
  }
  lines.push('')
  const composablesInDisguise = payload.classificationHealth?.composablesInDisguise || []
  lines.push('### Composables in Disguise (util files importing Vue reactivity)')
  lines.push('')
  if (composablesInDisguise.length === 0) {
    lines.push('(none)')
  } else {
    for (const u of composablesInDisguise) {
      lines.push(`- \`${u.repoPath}\``)
    }
  }
  lines.push('')

  // Domain health
  lines.push('## Domain Health')
  lines.push('')
  const mismatches = payload.domainHealth?.mismatches || []
  if (mismatches.length > 0) {
    lines.push('### Placement Mismatches (annotatedDomain != directoryDomain)')
    for (const e of mismatches) {
      lines.push(`- \`${e.repoPath}\` — directory: ${e.directoryDomain}, annotated: ${e.annotatedDomain}`)
    }
    lines.push('')
  }
  const rootLevel = payload.domainHealth?.rootLevel || []
  if (rootLevel.length > 0) {
    lines.push('### Root-Level Composables')
    lines.push('')
    lines.push('| File | Exports | Suggested Domain |')
    lines.push('| --- | --- | --- |')
    for (const e of rootLevel) {
      const suggested = e.annotatedDomain || '?'
      lines.push(`| ${e.name} | ${(e.exports || []).join(', ')} | ${suggested} |`)
    }
    lines.push('')
  }

  // Overlap candidates
  lines.push('## Overlap Candidates')
  lines.push('')
  for (const o of payload.overlapCandidates || []) {
    lines.push(`### Tag: "${o.tag}" (${o.entries.length} entries)`)
    for (const repoPath of o.entries) {
      const e = [...(payload.composables || []), ...(payload.utils || []), ...(payload.components || [])].find((x) => x.repoPath === repoPath)
      const purpose = e?.purpose || '(no annotation)'
      lines.push(`- ${e?.name || path.basename(repoPath)} — ${purpose}`)
    }
    lines.push('')
    lines.push('Review: Do any of these share responsibilities that could be consolidated?')
    lines.push('')
  }

  return lines.join('\n')
}

function main() {
  // Collect files (custom walk to include @core/composable)
  const composableFiles = [
    ...walkDir(COMPOSABLES_DIR, ['.ts', '.js'], PROJECT_ROOT),
    ...walkDir(CORE_COMPOSABLE_DIR, ['.ts'], PROJECT_ROOT),
  ]
  const utilFiles = walkDir(UTILS_DIR, ['.ts', '.js'], PROJECT_ROOT)
  const componentFiles = walkDir(COMPONENTS_DIR, ['.vue'], PROJECT_ROOT)

  const composables = composableFiles.map(({ absPath, repoPath }) => {
    const contents = fs.readFileSync(absPath, 'utf8')
    return scanComposable(absPath, repoPath, contents)
  })

  const utils = utilFiles.map(({ absPath, repoPath }) => {
    const contents = fs.readFileSync(absPath, 'utf8')
    return scanUtil(absPath, repoPath, contents)
  })

  const components = componentFiles.map(({ absPath, repoPath }) => {
    const contents = fs.readFileSync(absPath, 'utf8')
    return scanComponent(absPath, repoPath, contents)
  })

  const annotations = loadAnnotations()
  const merged = mergeAnnotations(composables, utils, components, annotations)

  const classificationHealth = detectClassificationHealth(merged.composables, merged.utils)
  const domainHealth = {
    mismatches: detectDomainMismatches(merged.composables, merged.utils, merged.components),
    nonComposables: detectNonComposables(merged.composables),
    rootLevel: flagRootLevelComposables(merged.composables),
  }
  const overlapCandidates = detectTagOverlaps(merged.composables, merged.utils, merged.components)

  const allEntries = [...merged.composables, ...merged.utils, ...merged.components]
  const annotated = allEntries.filter((e) => e.purpose != null && e.purpose !== '').length
  const byReuseTier = {}
  for (const e of allEntries) {
    const t = e.reuseTier || 'unknown'
    byReuseTier[t] = (byReuseTier[t] || 0) + 1
  }

  const summary = {
    totalComposables: composables.length,
    totalUtils: utils.length,
    totalComponents: components.length,
    totalFiles: allEntries.length,
    annotated,
    unannotated: allEntries.length - annotated,
    byReuseTier,
    classificationIssues: {
      utilsInDisguise: classificationHealth.utilsInDisguise.length,
      composablesInDisguise: classificationHealth.composablesInDisguise.length,
    },
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    scope: {
      composablesIncluded: ['client/src/composables/**/*.{ts,js}', 'client/src/@core/composable/**/*.ts'],
      utilsIncluded: ['client/src/utils/**/*.{ts,js}'],
      componentsIncluded: ['client/src/components/**/*.vue'],
      excluded: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*', '**/types.ts'],
    },
    summary,
    composables: merged.composables,
    utils: merged.utils,
    components: merged.components,
    classificationHealth,
    domainHealth,
    overlapCandidates,
  }

  const mdContent = renderMarkdownReport(payload)
  const { outJson, outMd } = writeAuditReports('inventory', payload, mdContent)

  console.log(`Wrote:\n- ${toRepoPathLocal(outJson)}\n- ${toRepoPathLocal(outMd)}`)
  console.log(`Composables: ${composables.length}, Utils: ${utils.length}, Components: ${components.length}`)
}

main()
