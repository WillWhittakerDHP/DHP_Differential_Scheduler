/* eslint-disable security/detect-non-literal-regexp */
import fs from 'node:fs'
import path from 'node:path'
import {
  getAuditReportHeaderLines,
  isGloballyExcluded,
  loadGlobalExclusions,
  resolveAuditPaths,
  shouldPruneDirectory,
  toRepoPath,
  writeAuditReports,
} from './shared-audit-utils.mjs'

/**
 * Type and Constant Inventory Audit
 *
 * Catalogs type definitions and constants, detects classification issues
 * (inline types in composables, mixed files, constants/configs boundary),
 * merges with annotations, and cross-references with unused-code-audit.
 *
 * Phases:
 * 1. Scan dedicated type files (types/, colocated types.ts, *Types.ts)
 * 2. Scan constants + configs
 * 3. Scan composables/utils/components for inline type/constant exports
 * 4. Merge with inventory-annotations.json
 * 5. Classification and boundary health
 * 6. Overlap detection
 * 7. Cross-reference with unused-code-audit.json (cleanup candidates)
 */

const AUDIT_TYPE = 'type-constant-inventory'

// Regex patterns for extraction
const TYPE_REGEX = /export\s+type\s+([A-Za-z_][A-Za-z0-9_]*)\s*[=<{]/g
const INTERFACE_REGEX = /export\s+interface\s+([A-Za-z_][A-Za-z0-9_]*)\s*[<{]/g
const ENUM_REGEX = /export\s+(const\s+)?enum\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{/g
const CONST_REGEX = /export\s+const\s+([A-Za-z_][A-Za-z0-9_]*)\s*[=:]/g
const FUNCTION_REGEX = /export\s+(async\s+)?function\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/g
const AS_CONST_REGEX = /as\s+const\b/
const KEYOF_TYPEOF_REGEX = /keyof\s+typeof\s+[A-Za-z_][A-Za-z0-9_]*/
const TYPEOF_INDEX_REGEX = /\(typeof\s+[A-Za-z_][A-Za-z0-9_]*\)\s*\[\s*['"]?number/

function toStableId(repoPath) {
  return repoPath.replaceAll('/', '__')
}

function countLines(contents) {
  return contents.replace(/\r\n/g, '\n').split('\n').filter((l) => l.trim() !== '' && !l.trim().startsWith('//')).length
}

/**
 * Walk directory, return absolute paths.
 * Uses global audit exclusions: test files, @core, @layouts, node_modules, etc.
 * @param {string} dir - Absolute path to directory
 * @param {string[]} extensions - e.g. ['.ts']
 * @param {string[]} out - Mutable array to push paths into
 * @param {string} projectRoot - Project root for repo-relative exclusion check
 */
function walkDir(dir, extensions, out, projectRoot) {
  if (!fs.existsSync(dir)) return out
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const abs = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (shouldPruneDirectory(e.name)) continue
      walkDir(abs, extensions, out, projectRoot)
      continue
    }
    if (!e.isFile()) continue
    const ext = path.extname(e.name)
    if (!extensions.includes(ext)) continue
    const repoPath = toRepoPath(abs, projectRoot)
    if (isGloballyExcluded(repoPath)) continue
    out.push(abs)
  }
  return out
}

/** Collect type files: types/, @core/types.ts, @layouts/types.ts, composables subdir types.ts, components types dir and *Types.ts, utils *Types.ts */
function collectTypeFilePaths(clientSrc, projectRoot) {
  const out = []
  const typesDir = path.join(clientSrc, 'types')
  const composablesDir = path.join(clientSrc, 'composables')
  const componentsDir = path.join(clientSrc, 'components')
  const utilsDir = path.join(clientSrc, 'utils')

  walkDir(typesDir, ['.ts'], out, projectRoot)

  const coreTypes = path.join(clientSrc, '@core', 'types.ts')
  if (fs.existsSync(coreTypes) && !isGloballyExcluded(toRepoPath(coreTypes, projectRoot))) out.push(coreTypes)
  const layoutsTypes = path.join(clientSrc, '@layouts', 'types.ts')
  if (fs.existsSync(layoutsTypes) && !isGloballyExcluded(toRepoPath(layoutsTypes, projectRoot))) out.push(layoutsTypes)

  const composableFiles = walkDir(composablesDir, ['.ts'], [], projectRoot)
  out.push(...composableFiles.filter((abs) => abs.endsWith('types.ts') || /useEntityCrudTypes\.ts$/.test(abs)))

  const componentFiles = walkDir(componentsDir, ['.ts'], [], projectRoot)
  out.push(...componentFiles.filter((abs) => abs.includes('/types/') || /Types\.ts$/.test(abs)))

  const utilsFiles = walkDir(utilsDir, ['.ts'], [], projectRoot)
  out.push(...utilsFiles.filter((abs) => /Types?\.ts$/.test(path.basename(abs))))

  return [...new Set(out)].map((abs) => path.normalize(abs))
}

function deriveDomain(repoPath, baseSegment) {
  const normalized = repoPath.replace(/\\/g, '/')
  const after = baseSegment ? normalized.split(baseSegment)[1] : normalized
  if (!after) return 'root'
  const segments = after.replace(/^\//, '').split('/').filter(Boolean)
  if (segments.length === 0) return 'root'
  if (segments.length === 1) return segments[0]
  return segments.slice(0, 2).join('/')
}

function extractTypeExports(contents) {
  const types = []
  const interfaces = []
  const enums = []
  let m
  TYPE_REGEX.lastIndex = 0
  while ((m = TYPE_REGEX.exec(contents)) !== null) types.push(m[1])
  INTERFACE_REGEX.lastIndex = 0
  while ((m = INTERFACE_REGEX.exec(contents)) !== null) interfaces.push(m[1])
  ENUM_REGEX.lastIndex = 0
  while ((m = ENUM_REGEX.exec(contents)) !== null) enums.push(m[2])
  return { types, interfaces, enums, all: [...types, ...interfaces, ...enums] }
}

function extractConstExports(contents) {
  const names = []
  let m
  CONST_REGEX.lastIndex = 0
  while ((m = CONST_REGEX.exec(contents)) !== null) names.push(m[1])
  const usesAsConst = AS_CONST_REGEX.test(contents)
  return { names, usesAsConst }
}

function extractFunctionExports(contents) {
  const names = []
  let m
  FUNCTION_REGEX.lastIndex = 0
  while ((m = FUNCTION_REGEX.exec(contents)) !== null) names.push(m[2])
  return names
}

function detectDerivedPattern(contents) {
  return KEYOF_TYPEOF_REGEX.test(contents) || TYPEOF_INDEX_REGEX.test(contents)
}

/** Scan codebase for "import type { X }" or "import type X" to count consumers of a type name */
function countTypeConsumers(typeName, allAbsPaths, _projectRoot) {
  // typeName is a type name from our codebase, not user input
   
  const needle = new RegExp(`import\\s+type\\s+\\{[^}]*\\b${typeName}\\b[^}]*\\}|import\\s+type\\s+\\b${typeName}\\b`)
  let count = 0
  for (const abs of allAbsPaths) {
    try {
      const content = fs.readFileSync(abs, 'utf8')
      if (needle.test(content)) count += 1
    } catch (_e) {
      // skip
    }
  }
  return count
}

function loadAnnotations(paths) {
  const annotationsPath = path.join(paths.outDir, 'inventory-annotations.json')
  if (!fs.existsSync(annotationsPath)) return { _meta: {}, entries: {} }
  try {
    const raw = fs.readFileSync(annotationsPath, 'utf8')
    const data = JSON.parse(raw)
    const { _meta, ...entries } = data
    return { _meta: _meta || {}, entries: entries || {} }
  } catch (_e) {
    return { _meta: {}, entries: {} }
  }
}

function loadUnusedCodeAudit(paths) {
  const p = path.join(paths.outDir, 'unused-code-audit.json')
  if (!fs.existsSync(p)) return null
  try {
    const raw = fs.readFileSync(p, 'utf8')
    const data = JSON.parse(raw)
    if (data.issues && Array.isArray(data.issues)) return data
    if (data.files && Array.isArray(data.files)) return data
    return null
  } catch (_e) {
    return null
  }
}

function main() {
  const paths = resolveAuditPaths(AUDIT_TYPE)
  const { clientSrc, outDir: _outDir } = paths
  // Repo root for repo-relative paths (global exclusions). Always derive from clientSrc so it works whether cwd is repo root or client/.
  const projectRoot = path.resolve(clientSrc, '..', '..')

  const annotations = loadAnnotations(paths)
  const clientTypeFileAbsList = collectTypeFilePaths(clientSrc, projectRoot)
  const sharedTypesDir = path.join(projectRoot, 'shared', 'types')
  const sharedTypeAbsList = fs.existsSync(sharedTypesDir)
    ? walkDir(sharedTypesDir, ['.ts'], [], projectRoot)
    : []
  const typeFileAbsList = [...clientTypeFileAbsList, ...sharedTypeAbsList]
  const constantsDir = path.join(clientSrc, 'constants')
  const configsDir = path.join(clientSrc, 'configs')
  const constantAbsList = walkDir(constantsDir, ['.ts'], [], projectRoot)
  const configAbsList = walkDir(configsDir, ['.ts'], [], projectRoot)

  const composablesDir = path.join(clientSrc, 'composables')
  const utilsDir = path.join(clientSrc, 'utils')
  const _componentsDir = path.join(clientSrc, 'components')
  const composableAbsList = walkDir(composablesDir, ['.ts'], [], projectRoot)
  const utilsAbsList = walkDir(utilsDir, ['.ts'], [], projectRoot)
  const typeFileSet = new Set(typeFileAbsList.map((a) => path.normalize(a)))
  const inlineSourceAbsList = [
    ...composableAbsList.filter((a) => !typeFileSet.has(path.normalize(a))),
    ...utilsAbsList,
  ]

  // Phase 1: Scan type files
  const typeFiles = []
  for (const abs of typeFileAbsList) {
    const repoPath = toRepoPath(abs, projectRoot)
    const contents = fs.readFileSync(abs, 'utf8')
    const typeExports = extractTypeExports(contents)
    const constExports = extractConstExports(contents)
    const functionExports = extractFunctionExports(contents)
    const directoryDomain = repoPath.startsWith('shared/types/')
      ? deriveDomain(repoPath, 'shared/types/')
      : repoPath.startsWith('client/src/types/')
        ? deriveDomain(repoPath, 'client/src/types/')
        : repoPath.includes('/composables/')
          ? deriveDomain(repoPath, 'client/src/composables/')
          : repoPath.includes('/components/')
            ? deriveDomain(repoPath, 'client/src/components/')
            : repoPath.includes('/utils/')
              ? deriveDomain(repoPath, 'client/src/utils/')
              : repoPath.includes('@core') ? '@core' : repoPath.includes('@layouts') ? '@layouts' : 'root'
    let location = 'scattered'
    if (repoPath.startsWith('shared/types/') || repoPath.startsWith('client/src/types/')) location = 'dedicated'
    else if (repoPath.includes('/composables/') || repoPath.includes('/components/') || repoPath.includes('/utils/')) location = 'colocated'
    const ann = annotations.entries[repoPath] || {}
    typeFiles.push({
      id: toStableId(repoPath),
      repoPath,
      name: path.basename(abs, '.ts'),
      directoryDomain,
      annotatedDomain: ann.domain ?? null,
      domainMatch: ann.domain != null ? ann.domain === directoryDomain : null,
      location,
      exports: typeExports.all,
      exportKinds: { types: typeExports.types.length, interfaces: typeExports.interfaces.length, enums: typeExports.enums.length },
      alsoExportsRuntime: constExports.names.length > 0 || functionExports.length > 0,
      lineCount: countLines(contents),
      purpose: ann.purpose ?? null,
      reuseTier: ann.reuseTier ?? 'unknown',
      tags: Array.isArray(ann.tags) ? ann.tags : [],
      placement: ann.placement ?? null,
      priority: ann.priority ?? null,
      targetPath: ann.targetPath ?? null,
    })
  }

  // Phase 2: Scan constants + configs
  const constantFiles = []
  for (const abs of [...constantAbsList, ...configAbsList]) {
    const repoPath = toRepoPath(abs, projectRoot)
    const contents = fs.readFileSync(abs, 'utf8')
    const typeExports = extractTypeExports(contents)
    const constExports = extractConstExports(contents)
    const functionExports = extractFunctionExports(contents)
    const directoryDomain = repoPath.startsWith('client/src/constants/')
      ? deriveDomain(repoPath, 'client/src/constants/')
      : deriveDomain(repoPath, 'client/src/configs/')
    const category = repoPath.startsWith('client/src/constants/') ? 'constants' : 'configs'
    const ann = annotations.entries[repoPath] || {}
    constantFiles.push({
      id: toStableId(repoPath),
      repoPath,
      name: path.basename(abs, '.ts'),
      directoryDomain,
      annotatedDomain: ann.domain ?? null,
      domainMatch: ann.domain != null ? ann.domain === directoryDomain : null,
      category,
      exports: constExports.names,
      constCount: constExports.names.length,
      usesAsConst: constExports.usesAsConst,
      alsoExportsTypes: typeExports.all.length > 0,
      exportedTypeNames: typeExports.all,
      hasFactoryFunctions: functionExports.length > 0,
      lineCount: countLines(contents),
      purpose: ann.purpose ?? null,
      reuseTier: ann.reuseTier ?? 'unknown',
      tags: Array.isArray(ann.tags) ? ann.tags : [],
      placement: ann.placement ?? null,
      derivedPattern: detectDerivedPattern(contents),
    })
  }

  // Phase 3: Inline type/constant exports in composables/utils
  const allTsPaths = [...typeFileAbsList, ...constantAbsList, ...configAbsList, ...inlineSourceAbsList]
  const inlineTypeExports = []
  for (const abs of inlineSourceAbsList) {
    const repoPath = toRepoPath(abs, projectRoot)
    const contents = fs.readFileSync(abs, 'utf8')
    const typeExports = extractTypeExports(contents)
    const constExports = extractConstExports(contents)
    if (typeExports.all.length === 0 && constExports.names.filter((n) => !/^use[A-Z]/.test(n)).length === 0) continue
    const importedBy = typeExports.all.map((t) => countTypeConsumers(t, allTsPaths, projectRoot))
    const maxConsumers = Math.max(0, ...importedBy)
    inlineTypeExports.push({
      sourceFile: repoPath,
      exportedTypes: typeExports.all,
      exportedConstants: constExports.names.filter((n) => !/^use[A-Z]/.test(n)),
      primaryPurpose: 'composable',
      importedByCount: maxConsumers,
      recommendation: typeExports.all.length > 0 ? 'Consider extracting to a dedicated type file' : null,
    })
  }

  // Phase 4 already applied via annotations.entries in Phase 1 & 2

  // Phase 5: Classification health
  const mixedFiles = [
    ...typeFiles.filter((t) => t.alsoExportsRuntime).map((t) => ({ repoPath: t.repoPath, reason: 'In types/ but exports runtime values' })),
    ...constantFiles.filter((c) => c.alsoExportsTypes && c.placement !== 'derived' && !c.derivedPattern).map((c) => ({ repoPath: c.repoPath, reason: 'In constants/configs and exports type definitions' })),
  ]
  const inlineByPlacement = (placement) => {
    const byFile = new Map()
    for (const inv of inlineTypeExports) {
      const ann = annotations.entries[inv.sourceFile] || {}
      const p = ann.placement || 'unreviewed'
      if (p !== placement) continue
      byFile.set(inv.sourceFile, { ...inv, ...ann })
    }
    return Array.from(byFile.values())
  }
  const unreviewedInline = inlineTypeExports.filter((inv) => !annotations.entries[inv.sourceFile]?.placement)
  const queuedInline = inlineByPlacement('needs-extraction')
  const derivedInline = constantFiles.filter((c) => c.placement === 'derived' || c.derivedPattern)

  const duplicateTypeNames = new Map()
  for (const t of typeFiles) {
    for (const name of t.exports) {
      if (!duplicateTypeNames.has(name)) duplicateTypeNames.set(name, [])
      duplicateTypeNames.get(name).push(t.repoPath)
    }
  }
  for (const inv of inlineTypeExports) {
    for (const name of inv.exportedTypes) {
      if (!duplicateTypeNames.has(name)) duplicateTypeNames.set(name, [])
      if (!duplicateTypeNames.get(name).includes(inv.sourceFile)) duplicateTypeNames.get(name).push(inv.sourceFile)
    }
  }
  const duplicateFindings = Array.from(duplicateTypeNames.entries())
    .filter(([, files]) => files.length > 1)
    .map(([name, files]) => ({ typeName: name, files }))

  const configsWithLogic = constantFiles.filter((c) => c.hasFactoryFunctions)

  const constantsVsConfigsBoundary = {
    constants: constantFiles.filter((c) => c.category === 'constants'),
    configs: constantFiles.filter((c) => c.category === 'configs'),
  }

  // Phase 6: Overlap candidates (by tag)
  const byTag = new Map()
  for (const t of [...typeFiles, ...constantFiles]) {
    for (const tag of t.tags || []) {
      if (!byTag.has(tag)) byTag.set(tag, [])
      byTag.get(tag).push(t.repoPath)
    }
  }
  const overlapCandidates = Array.from(byTag.entries())
    .filter(([, entries]) => entries.length >= 3)
    .map(([tag, entries]) => ({ tag, entries, note: `${entries.length} entries share tag '${tag}'` }))

  // Phase 7: Unused cross-reference
  const unusedData = loadUnusedCodeAudit(paths)
  let cleanupCandidates = []
  if (unusedData && unusedData.files && Array.isArray(unusedData.files)) {
    const unusedByFile = new Set()
    for (const f of unusedData.files) {
      const file = f.file ?? f.repoPath ?? f.path
      if (file) unusedByFile.add(file)
    }
    const unusedExports = (unusedData.issues || []).filter((i) => i.type === 'unused-export' || (i.symbol && unusedByFile.has(i.file)))
    for (const inv of inlineTypeExports) {
      for (const typeName of inv.exportedTypes) {
        const isUnused = unusedExports.some((u) => (u.file === inv.sourceFile && u.symbol === typeName) || (u.file === inv.sourceFile && u.exportName === typeName))
        if (isUnused) cleanupCandidates.push({ file: inv.sourceFile, typeOrConstant: typeName, placementIssue: 'inline in composable', source: 'unused-code-audit' })
      }
    }
  }

  // Phase 7b: Generic monomorphic detection
  const genericTypeDefs = new Map()
  for (const abs of typeFileAbsList) {
    const repoPath = toRepoPath(abs, projectRoot)
    const contents = fs.readFileSync(abs, 'utf8')
    const typeRe = /export\s+type\s+([A-Za-z_][A-Za-z0-9_]*)\s*</g
    const ifaceRe = /export\s+interface\s+([A-Za-z_][A-Za-z0-9_]*)\s*</g
    for (const m of contents.matchAll(typeRe)) genericTypeDefs.set(m[1], { definedIn: repoPath })
    for (const m of contents.matchAll(ifaceRe)) genericTypeDefs.set(m[1], { definedIn: repoPath })
  }
  const allScanableAbs = walkDir(clientSrc, ['.ts', '.vue'], [], projectRoot)
  const monomorphicGenerics = []
  for (const [typeName, { definedIn }] of genericTypeDefs) {
    const argSet = new Set()
    const usageRe = new RegExp(`\\b${typeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<([^>]+)>`, 'g')
    let usageCount = 0
    for (const abs of allScanableAbs) {
      try {
        const content = fs.readFileSync(abs, 'utf8')
        const scriptContent = abs.endsWith('.vue')
          ? (content.match(/<script[^>]*>([\s\S]*?)<\/script>/i)?.[1] ?? '')
          : content
        for (const m of scriptContent.matchAll(usageRe)) {
          usageCount += 1
          argSet.add(m[1].trim())
        }
      } catch {
        // skip
      }
    }
    if (argSet.size === 1 && usageCount >= 3) {
      const alwaysInstantiatedWith = [...argSet][0]
      monomorphicGenerics.push({
        typeName,
        definedIn,
        alwaysInstantiatedWith,
        usageCount,
        recommendation: 'Consider removing the generic parameter or merging with the argument type',
      })
    }
  }

  const summary = {
    totalTypeFiles: typeFiles.length,
    totalConstantFiles: constantAbsList.length,
    totalConfigFiles: configAbsList.length,
    filesWithInlineTypes: inlineTypeExports.length,
    annotated: [...typeFiles, ...constantFiles].filter((e) => annotations.entries[e.repoPath]?.purpose != null).length,
    unannotated: [...typeFiles, ...constantFiles].length - [...typeFiles, ...constantFiles].filter((e) => annotations.entries[e.repoPath]?.purpose != null).length,
    classificationIssues: {
      mixedTypeConstantFiles: mixedFiles.length,
      inlineTypesInComposables: unreviewedInline.length + queuedInline.length,
      configsWithLogic: configsWithLogic.length,
      duplicateTypeNames: duplicateFindings.length,
      cleanupCandidates: cleanupCandidates.length,
      monomorphicGenerics: monomorphicGenerics.length,
    },
  }

  const globalExclusions = loadGlobalExclusions()
  const excludedPatterns = (globalExclusions || []).map((e) => e.pattern)

  const payload = {
    generatedAt: new Date().toISOString(),
    scope: {
      typeFilesIncluded: ['client/src/types/**/*.ts', 'client/src/composables/**/types.ts', 'client/src/configs/**/*.ts', 'shared/types/**/*.ts'],
      constantFilesIncluded: ['client/src/constants/**/*.ts'],
      configFilesIncluded: ['client/src/configs/**/*.ts'],
      inlineSourcesScanned: ['client/src/composables/**/*.ts', 'client/src/utils/**/*.ts'],
      excluded: excludedPatterns.length > 0 ? excludedPatterns : ['**/__tests__/**', '**/*.test.*', '**/*.spec.*'],
      excludedSource: 'audit-global-config.json globalExclusions',
    },
    summary,
    typeFiles,
    constantFiles,
    inlineTypeExports,
    classificationHealth: {
      mixedFiles,
      inlineTypes: { unreviewed: unreviewedInline, queued: queuedInline, derived: derivedInline },
      configsWithLogic: configsWithLogic.map((c) => ({ repoPath: c.repoPath, name: c.name })),
      duplicateTypeNames: duplicateFindings,
    },
    constantsVsConfigsBoundary,
    overlapCandidates,
    cleanupCandidates,
    monomorphicGenerics,
  }

  function renderMarkdownReport() {
    const lines = []
    lines.push(...getAuditReportHeaderLines())
    lines.push('# Type and Constant Inventory Audit (Generated)')
    lines.push('')
    lines.push(`Generated: ${payload.generatedAt}`)
    lines.push('')
    lines.push('## Summary')
    lines.push('')
    lines.push(`- Type files: **${summary.totalTypeFiles}**`)
    lines.push(`- Constant files: **${summary.totalConstantFiles}**`)
    lines.push(`- Config files: **${summary.totalConfigFiles}**`)
    lines.push(`- Files with inline type exports: **${summary.filesWithInlineTypes}**`)
    lines.push(`- Annotated: **${summary.annotated}** | Unannotated: **${summary.unannotated}**`)
    lines.push('')
    lines.push('| Classification Issue | Count |')
    lines.push('| --- | ---: |')
    lines.push(`| Mixed type+constant files | ${summary.classificationIssues.mixedTypeConstantFiles} |`)
    lines.push(`| Inline types in composables | ${summary.classificationIssues.inlineTypesInComposables} |`)
    lines.push(`| Configs with factory functions | ${summary.classificationIssues.configsWithLogic} |`)
    lines.push(`| Duplicate type names | ${summary.classificationIssues.duplicateTypeNames} |`)
    lines.push(`| Cleanup candidates (misplaced + unused) | ${summary.classificationIssues.cleanupCandidates} |`)
    lines.push(`| Monomorphic generics | ${summary.classificationIssues.monomorphicGenerics} |`)
    lines.push('')
    if (monomorphicGenerics.length > 0) {
      lines.push('## Monomorphic generics')
      lines.push('')
      lines.push('Generic types always instantiated with the same argument; consider removing the generic or merging with the argument type.')
      lines.push('')
      lines.push('| Type name | Defined in | Always used with | Usage count |')
      lines.push('| --- | --- | --- | ---: |')
      for (const m of monomorphicGenerics) {
        lines.push(`| ${m.typeName} | \`${m.definedIn}\` | \`${m.alwaysInstantiatedWith}\` | ${m.usageCount} |`)
      }
      lines.push('')
    }
    lines.push('## Type File Catalog (by domain)')
    lines.push('')
    const byDomain = new Map()
    for (const t of typeFiles) {
      const d = t.annotatedDomain ?? t.directoryDomain ?? 'root'
      if (!byDomain.has(d)) byDomain.set(d, [])
      byDomain.get(d).push(t)
    }
    for (const [domain, entries] of [...byDomain.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      lines.push(`### Domain: ${domain}`)
      lines.push('')
      lines.push('| File | Location | Exports | Also runtime? | Purpose | Tier |')
      lines.push('| --- | --- | --- | --- | --- | --- |')
      for (const t of entries) {
        lines.push(`| \`${t.repoPath}\` | ${t.location} | ${t.exports.slice(0, 5).join(', ')}${t.exports.length > 5 ? '…' : ''} | ${t.alsoExportsRuntime ? 'yes' : 'no'} | ${t.purpose ?? '(none)'} | ${t.reuseTier} |`)
      }
      lines.push('')
    }
    lines.push('## Constants vs Configs Boundary')
    lines.push('')
    lines.push('| Category | File | Const exports | Type exports | Factory fns |')
    lines.push('| --- | --- | ---: | ---: | --- |')
    for (const c of constantFiles) {
      lines.push(`| ${c.category} | \`${c.repoPath}\` | ${c.constCount} | ${c.exportedTypeNames?.length ?? 0} | ${c.hasFactoryFunctions ? 'yes' : 'no'} |`)
    }
    lines.push('')
    lines.push('## Inline Type Exports')
    lines.push('')
    lines.push('### Unreviewed')
    lines.push('')
    for (const inv of unreviewedInline) {
      lines.push(`- \`${inv.sourceFile}\`: ${inv.exportedTypes.join(', ')} (imported by ${inv.importedByCount} files)`)
    }
    if (unreviewedInline.length === 0) lines.push('_None._')
    lines.push('')
    lines.push('### Queued for Extraction')
    lines.push('')
    for (const q of queuedInline) {
      lines.push(`- \`${q.sourceFile}\` → ${q.targetPath ?? '(no target)'}: ${q.exportedTypes?.join(', ') ?? ''} [${q.priority ?? '?'}]`)
    }
    if (queuedInline.length === 0) lines.push('_None._')
    lines.push('')
    lines.push('## Cleanup Candidates (misplaced + unused)')
    lines.push('')
    if (cleanupCandidates.length === 0) {
      lines.push('_None (or unused-code-audit.json not available)._')
    } else {
      lines.push('| File | Type/Constant | Placement Issue |')
      lines.push('| --- | --- | --- |')
      for (const c of cleanupCandidates) {
        lines.push(`| \`${c.file}\` | ${c.typeOrConstant} | ${c.placementIssue} |`)
      }
    }
    lines.push('')
    lines.push('## Duplicate Type Names')
    lines.push('')
    for (const d of duplicateFindings) {
      lines.push(`- **${d.typeName}**: ${d.files.join(', ')}`)
    }
    if (duplicateFindings.length === 0) lines.push('_None._')
    lines.push('')
    return lines.join('\n')
  }

  const { outJson, outMd } = writeAuditReports(AUDIT_TYPE, payload, renderMarkdownReport())
  console.log(`Wrote:\n- ${toRepoPath(outJson, projectRoot)}\n- ${toRepoPath(outMd, projectRoot)}`)
  console.log(`Type files: ${typeFiles.length}, Constant files: ${constantFiles.length}, Inline exports: ${inlineTypeExports.length}`)
}

main()
