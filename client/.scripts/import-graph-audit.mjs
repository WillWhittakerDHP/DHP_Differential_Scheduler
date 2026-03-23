import fs from 'node:fs'
import path from 'node:path'
import {
  getAuditReportHeaderLines,
  listAuditFiles,
  resolveAuditPaths,
  writeAuditReports,
  toRepoPath as toRepoPathUtil,
  parseChangedOnlyFlag,
  loadCentralAllowlist,
  checkConfigAllowlist,
} from './shared-audit-utils.mjs'

/**
 * Import Graph / Circular Dependency Audit Script
 *
 * Goal: Build a directed import graph and detect:
 *   - Circular import chains (A -> B -> C -> A)
 *   - Fan-out hotspots (files importing too many modules, > 15)
 *   - Fan-in hotspots (files imported by too many consumers, > 20)
 *   - Cross-boundary imports (client importing from server or vice versa)
 *
 * Technique:
 *   - Parse import/require statements with regex
 *   - Build adjacency list (directed graph)
 *   - Detect cycles with iterative DFS (adapted Tarjan's)
 *   - Compute fan-in/fan-out per file
 *
 * Scope:
 *   - Included: client/src (ts, js, vue) and server/src (ts, mjs)
 *   - Excluded: node_modules, __tests__, @core, @layouts
 *
 * Output:
 *   - client/.audit-reports/import-graph-audit.json
 *   - client/.audit-reports/import-graph-audit.md
 */

const DEFAULTS = { maxFanOut: 15, maxFanIn: 20, maxComposableChainDepth: 2 }

function toRepoPath(p, projectRoot) { return toRepoPathUtil(p, projectRoot) }

/**
 * Extract import specifiers from file content
 * Returns resolved repo-relative paths where possible
 */
function extractImports(content, absPath, projectRoot) {
  const imports = []
  const dir = path.dirname(absPath)

  // Match ES imports: import ... from 'xxx'
  const esImportRe = /(?:import\s+(?:[\s\S]*?)\s+from\s+|import\s+)['"]([^'"]+)['"]/g
  // Match require: require('xxx')
  const requireRe = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  // Match dynamic import: import('xxx')
  // Excludes defineAsyncComponent(() => import('xxx')) which are intentional lazy loads
  // that break runtime cycles (common Vue pattern for recursive components).
  const dynamicRe = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g

  // Build a set of specifiers used inside defineAsyncComponent so we can skip them
  const asyncComponentRe = /defineAsyncComponent\s*\(\s*\(\)\s*=>\s*import\s*\(\s*['"]([^'"]+)['"]\s*\)\s*\)/g
  const asyncComponentSpecifiers = new Set(
    [...content.matchAll(asyncComponentRe)].map(m => m[1])
  )

  for (const re of [esImportRe, requireRe, dynamicRe]) {
    for (const match of content.matchAll(re)) {
      const specifier = match[1]
      // Skip external packages
      if (!specifier.startsWith('.') && !specifier.startsWith('@/') && !specifier.startsWith('~')) continue

      // Skip dynamic imports wrapped in defineAsyncComponent (lazy loads, not real deps)
      if (re === dynamicRe && asyncComponentSpecifiers.has(specifier)) continue

      let resolved = specifier
      if (specifier.startsWith('.')) {
        // Resolve relative path
        resolved = path.resolve(dir, specifier)
        resolved = toRepoPath(resolved, projectRoot)
      } else if (specifier.startsWith('@/')) {
        // Vue alias - resolve to client/src/
        resolved = 'client/src/' + specifier.substring(2)
      }

      // Normalize: strip extension variations, add common ones
      imports.push(normalizeImportPath(resolved))
    }
  }

  return [...new Set(imports)]
}

function normalizeImportPath(importPath) {
  // Remove file extensions for comparison
  return importPath.replace(/\.(ts|js|vue|mjs|tsx|jsx)$/, '')
}

/**
 * Extract re-exported type names and their source module from file content.
 * Returns array of { typeNames: string[], fromResolved: string } (fromResolved = repo-relative path without extension).
 */
function extractReExportedTypeNames(content, absPath, projectRoot) {
  const dir = path.dirname(absPath)
  const results = []
  const re = /export\s+type\s*\{([^}]+)\}\s*from\s+['"]([^'"]+)['"]/g
  for (const match of content.matchAll(re)) {
    const namesStr = match[1]
    const specifier = match[2]
    const typeNames = namesStr.split(',').map((n) => n.trim()).filter(Boolean)
    if (typeNames.length === 0) continue
    let fromResolved = specifier
    if (specifier.startsWith('.')) {
      fromResolved = path.resolve(dir, specifier)
      fromResolved = toRepoPath(fromResolved, projectRoot)
    } else if (specifier.startsWith('@/')) {
      fromResolved = 'client/src/' + specifier.substring(2)
    } else {
      continue
    }
    fromResolved = normalizeImportPath(fromResolved)
    results.push({ typeNames, fromResolved })
  }
  return results
}

/**
 * Get exported type/interface names from a file (regex).
 */
function getTypeExportsFromFile(content) {
  const names = new Set()
  const typeRe = /export\s+(?:type|interface)\s+([A-Za-z_][A-Za-z0-9_]*)\b/g
  for (const match of content.matchAll(typeRe)) {
    names.add(match[1])
  }
  return names
}

/**
 * Detect cycles using iterative DFS with Tarjan's SCC approach (simplified)
 */
function detectCycles(adjacencyList) {
  const cycles = []
  const visited = new Set()
  const inStack = new Set()

  for (const startNode of adjacencyList.keys()) {
    if (visited.has(startNode)) continue

    // Iterative DFS
    const stack = [{ node: startNode, path: [startNode], neighborIdx: 0 }]
    inStack.add(startNode)

    while (stack.length > 0) {
      const frame = stack[stack.length - 1]
      const neighbors = adjacencyList.get(frame.node) || []

      if (frame.neighborIdx >= neighbors.length) {
        // All neighbors explored
        stack.pop()
        inStack.delete(frame.node)
        visited.add(frame.node)
        continue
      }

      const neighbor = neighbors[frame.neighborIdx]
      frame.neighborIdx++

      if (inStack.has(neighbor)) {
        // Found a cycle
        const cycleStart = frame.path.indexOf(neighbor)
        if (cycleStart !== -1) {
          const cycle = [...frame.path.slice(cycleStart), neighbor]
          // Normalize cycle (rotate to lexicographic minimum) for deduplication
          const normalized = normalizeCycle(cycle)
          const key = normalized.join(' -> ')
          if (!cycles.some(c => c.key === key)) {
            cycles.push({ key, chain: normalized, length: normalized.length - 1 })
          }
        }
      } else if (!visited.has(neighbor)) {
        stack.push({ node: neighbor, path: [...frame.path, neighbor], neighborIdx: 0 })
        inStack.add(neighbor)
      }
    }
  }

  return cycles.sort((a, b) => a.length - b.length || a.key.localeCompare(b.key))
}

function normalizeCycle(cycle) {
  // Remove the duplicate last element, find min, rotate
  const nodes = cycle.slice(0, -1)
  let minIdx = 0
  for (let i = 1; i < nodes.length; i++) {
    if (nodes[i] < nodes[minIdx]) minIdx = i
  }
  const rotated = [...nodes.slice(minIdx), ...nodes.slice(0, minIdx), nodes[minIdx]]
  return rotated
}

function detectCrossBoundary(importerPath, importedPath) {
  const importerIsClient = importerPath.startsWith('client/')
  const importerIsServer = importerPath.startsWith('server/')
  const importedIsClient = importedPath.startsWith('client/')
  const importedIsServer = importedPath.startsWith('server/')

  if (importerIsClient && importedIsServer) return 'client->server'
  if (importerIsServer && importedIsClient) return 'server->client'

  // Composable domain boundaries: root composable (composables/useXxx.ts) should not import admin/booking
  const inComposablesRoot = /composables\/[^/]+\.(ts|js|vue)$/.test(importerPath) &&
    !/composables\/(admin|booking)\//.test(importerPath)
  const importsAdmin = importedPath.includes('composables/admin')
  const importsBooking = importedPath.includes('composables/booking')
  if (inComposablesRoot && (importsAdmin || importsBooking)) {
    return 'composable-root->domain'
  }
  return null
}

/**
 * Compute max composable-to-composable chain depth per composable file.
 * Depth 0 = no composable imports; depth 3+ hurts testability (flag as violation).
 * Returns { depths: Map, violations: Array }.
 */
function computeComposableChainDepths(adjacencyList, maxDepth) {
  const COMPOSABLE_RE = /composables\//
  const composableNodes = new Set(
    [...adjacencyList.keys()].filter((k) => COMPOSABLE_RE.test(k))
  )

  const subgraph = new Map()
  for (const node of composableNodes) {
    const neighbors = (adjacencyList.get(node) || []).filter((n) =>
      composableNodes.has(n)
    )
    subgraph.set(node, neighbors)
  }

  const memo = new Map()
  function getDepth(node, visiting) {
    if (memo.has(node)) return memo.get(node)
    if (visiting.has(node)) return { depth: 0, chain: [node] }
    visiting.add(node)
    const neighbors = subgraph.get(node) || []
    if (neighbors.length === 0) {
      memo.set(node, { depth: 0, chain: [node] })
      visiting.delete(node)
      return memo.get(node)
    }
    let maxChild = { depth: -1, chain: [] }
    for (const n of neighbors) {
      const child = getDepth(n, visiting)
      if (child.depth > maxChild.depth) maxChild = child
    }
    const result = {
      depth: maxChild.depth + 1,
      chain: [node, ...maxChild.chain],
    }
    memo.set(node, result)
    visiting.delete(node)
    return result
  }

  const depths = new Map()
  for (const node of composableNodes) {
    depths.set(node, getDepth(node, new Set()))
  }

  const violations = [...depths.entries()]
    .filter(([, v]) => v.depth > maxDepth)
    .map(([file, v]) => ({ file, depth: v.depth, chain: v.chain }))
    .sort((a, b) => b.depth - a.depth)

  return { depths, violations }
}

function assignPriority(score, config) {
  const p0Min = Number(config?.priorities?.p0MinSeverityScore ?? 15)
  const p1Min = Number(config?.priorities?.p1MinSeverityScore ?? 6)
  if (score >= p0Min) return 'P0'
  if (score >= p1Min) return 'P1'
  return 'P2'
}

function renderMarkdownReport(result) {
  const lines = []
  lines.push(...getAuditReportHeaderLines())
  lines.push('# Import Graph Audit (Generated)')
  lines.push('')
  lines.push('This file is generated by `client/.scripts/import-graph-audit.mjs`.')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Files analyzed: **${result.totalFiles}**`)
  lines.push(`- Circular dependencies: **${result.cycles.length}**`)
  lines.push(`- Fan-out violations (> ${result.thresholds.maxFanOut}): **${result.fanOutViolations.length}**`)
  lines.push(`- Fan-in violations (> ${result.thresholds.maxFanIn}): **${result.fanInViolations.length}**`)
  const chainDepthViolations = result.composableChainDepthViolations ?? []
  lines.push(`- Composable chain-depth violations (> ${result.thresholds.maxComposableChainDepth}): **${chainDepthViolations.length}**`)
  lines.push(`- Cross-boundary imports: **${result.crossBoundary.length}**`)
  lines.push('')

  if (result.cycles.length > 0) {
    lines.push('## Circular Dependencies')
    lines.push('')
    for (const c of result.cycles.slice(0, 20)) {
      lines.push(`- **Cycle (${c.length} files):** ${c.chain.join(' → ')}`)
    }
    if (result.cycles.length > 20) {
      lines.push(`- *...and ${result.cycles.length - 20} more cycles.*`)
    }
    lines.push('')
  }

  if (result.fanOutViolations.length > 0) {
    lines.push('## Fan-out hotspots')
    lines.push('')
    lines.push('| File | Imports |')
    lines.push('| --- | ---: |')
    for (const f of result.fanOutViolations.slice(0, 20)) {
      lines.push(`| \`${f.file}\` | ${f.fanOut} |`)
    }
    lines.push('')
  }

  if (result.fanInViolations.length > 0) {
    lines.push('## Fan-in hotspots')
    lines.push('')
    lines.push('| File | Importers |')
    lines.push('| --- | ---: |')
    for (const f of result.fanInViolations.slice(0, 20)) {
      lines.push(`| \`${f.file}\` | ${f.fanIn} |`)
    }
    lines.push('')
  }

  if (chainDepthViolations.length > 0) {
    lines.push('## Composable Chain Depth')
    lines.push('')
    lines.push('Composables with composable-calls-composable chain depth exceeding threshold (hurts unit testability). Consider flattening: extract pure logic or thin orchestrators.')
    lines.push('')
    lines.push('| Composable | Depth | Longest Chain |')
    lines.push('| --- | ---: | --- |')
    for (const v of chainDepthViolations.slice(0, 20)) {
      const chainLabel = v.chain.map((n) => path.basename(n, path.extname(n))).join(' → ')
      lines.push(`| \`${v.file}\` | ${v.depth} | ${chainLabel} |`)
    }
    if (chainDepthViolations.length > 20) {
      lines.push('')
      lines.push(`*...and ${chainDepthViolations.length - 20} more. See full report.*`)
    }
    lines.push('')
  }

  if (result.crossBoundary.length > 0) {
    lines.push('## Cross-boundary imports')
    lines.push('')
    const composableDomain = result.crossBoundary.filter(cb => cb.direction === 'composable-root->domain')
    const otherBoundary = result.crossBoundary.filter(cb => cb.direction !== 'composable-root->domain')
    if (composableDomain.length > 0) {
      lines.push('### Composable domain boundary (root → admin/booking)')
      lines.push('')
      lines.push('Root composables importing admin or booking modules. Consider moving under `src/composables/admin/` or `src/composables/booking/`.')
      lines.push('')
      for (const cb of composableDomain.slice(0, 30)) {
        lines.push(`- \`${cb.from}\` → \`${cb.to}\``)
      }
      if (composableDomain.length > 30) {
        lines.push(`- … (${composableDomain.length - 30} more)`)
      }
      lines.push('')
    }
    if (otherBoundary.length > 0) {
      lines.push('### Other (client↔server)')
      lines.push('')
      for (const cb of otherBoundary.slice(0, 20)) {
        lines.push(`- \`${cb.from}\` → \`${cb.to}\` (${cb.direction})`)
      }
      lines.push('')
    }
  }

  return lines.join('\n')
}

function main() {
  const paths = resolveAuditPaths('import-graph')
  const delta = parseChangedOnlyFlag(process.argv, paths.projectRoot)

  let config = {}
  try { config = JSON.parse(fs.readFileSync(paths.configPath, 'utf8')) } catch { /* defaults */ }

  const thresholds = {
    maxFanOut: config.thresholds?.maxFanOut ?? DEFAULTS.maxFanOut,
    maxFanIn: config.thresholds?.maxFanIn ?? DEFAULTS.maxFanIn,
    maxComposableChainDepth: config.thresholds?.maxComposableChainDepth ?? DEFAULTS.maxComposableChainDepth,
  }

  const allFiles = listAuditFiles('import-graph', [paths.clientSrc, paths.serverSrc])

  // Build adjacency list
  const adjacencyList = new Map()
  const fanOut = new Map()
  const fanIn = new Map()
  const crossBoundary = []

  for (const abs of allFiles) {
    const repoPath = toRepoPath(abs, paths.projectRoot)

    const content = fs.readFileSync(abs, 'utf-8')
    const imports = extractImports(content, abs, paths.projectRoot)
    const normalizedSource = normalizeImportPath(repoPath)

    adjacencyList.set(normalizedSource, imports)
    fanOut.set(normalizedSource, imports.length)

    for (const imp of imports) {
      fanIn.set(imp, (fanIn.get(imp) || 0) + 1)

      const crossDir = detectCrossBoundary(repoPath, imp)
      if (crossDir) {
        crossBoundary.push({ from: repoPath, to: imp, direction: crossDir })
      }
    }
  }

  // Detect cycles
  const cycles = detectCycles(adjacencyList)

  // Find fan-out violations
  const importGraphAllowlist = loadCentralAllowlist('import-graph')

  const fanOutViolationsRaw = Array.from(fanOut.entries())
    .filter(([_, count]) => count > thresholds.maxFanOut)
    .map(([file, count]) => ({ file, fanOut: count }))
    .sort((a, b) => b.fanOut - a.fanOut)

  const fanOutViolations = importGraphAllowlist
    ? fanOutViolationsRaw.filter((v) => {
        const { allowed } = checkConfigAllowlist(v.file, 'fanOut', 0, importGraphAllowlist)
        return !allowed
      })
    : fanOutViolationsRaw

  // Find fan-in violations
  const fanInViolationsRaw = Array.from(fanIn.entries())
    .filter(([_, count]) => count > thresholds.maxFanIn)
    .map(([file, count]) => ({ file, fanIn: count }))
    .sort((a, b) => b.fanIn - a.fanIn)

  const fanInViolations = importGraphAllowlist
    ? fanInViolationsRaw.filter((v) => {
        const { allowed } = checkConfigAllowlist(v.file, 'fanIn', 0, importGraphAllowlist)
        return !allowed
      })
    : fanInViolationsRaw

  // Composable chain depth (composable-calls-composable; depth 3+ hurts testability)
  const { violations: composableChainDepthViolationsRaw } = computeComposableChainDepths(
    adjacencyList,
    thresholds.maxComposableChainDepth
  )
  const composableChainDepthViolations = importGraphAllowlist
    ? composableChainDepthViolationsRaw.filter((v) => {
        const { allowed } = checkConfigAllowlist(v.file, 'composableChainDepth', 0, importGraphAllowlist)
        return !allowed
      })
    : composableChainDepthViolationsRaw

  // Type mirror detection: types/ file exports types that a composable re-exports; both have consumers
  const typeMirrorPaths = []
  const absToNormalized = new Map()
  for (const abs of allFiles) {
    const repoPath = toRepoPath(abs, paths.projectRoot)
    absToNormalized.set(abs, normalizeImportPath(repoPath))
  }
  const typesFileExports = new Map()
  for (const abs of allFiles) {
    const repoPath = toRepoPath(abs, paths.projectRoot)
    const norm = normalizeImportPath(repoPath)
    if (!/\/types\//.test(repoPath) && !/^server\/src\/types\//.test(repoPath)) continue
    const content = fs.readFileSync(abs, 'utf-8')
    typesFileExports.set(norm, getTypeExportsFromFile(content))
  }
  for (const abs of allFiles) {
    const repoPath = toRepoPath(abs, paths.projectRoot)
    const norm = absToNormalized.get(abs)
    if (!/\/composables\//.test(repoPath)) continue
    const content = fs.readFileSync(abs, 'utf-8')
    const reExports = extractReExportedTypeNames(content, abs, paths.projectRoot)
    for (const { typeNames, fromResolved } of reExports) {
      const typesExports = typesFileExports.get(fromResolved)
      if (!typesExports || typesExports.size === 0) continue
      const sharedExports = typeNames.filter((n) => typesExports.has(n))
      if (sharedExports.length === 0) continue
      const consumersFromTypes = fanIn.get(fromResolved) ?? 0
      const consumersFromComposable = fanIn.get(norm) ?? 0
      if (consumersFromTypes > 0 && consumersFromComposable > 0) {
        typeMirrorPaths.push({
          from: fromResolved,
          mirror: norm,
          sharedExports,
          consumersFromTypes,
          consumersFromComposable,
          recommendation: 'Consolidate imports to one canonical path.',
        })
      }
    }
  }

  // Compute overall score per file for priority assignment
  const fileScores = new Map()
  for (const c of cycles) {
    for (const node of c.chain.slice(0, -1)) {
      fileScores.set(node, (fileScores.get(node) || 0) + 10)
    }
  }
  for (const f of fanOutViolations) {
    fileScores.set(f.file, (fileScores.get(f.file) || 0) + 3)
  }
  for (const f of fanInViolations) {
    fileScores.set(f.file, (fileScores.get(f.file) || 0) + 2)
  }
  for (const cb of crossBoundary) {
    fileScores.set(cb.from, (fileScores.get(cb.from) || 0) + 5)
  }
  for (const v of composableChainDepthViolations) {
    const overBy = v.depth - thresholds.maxComposableChainDepth
    fileScores.set(v.file, (fileScores.get(v.file) || 0) + (overBy >= 2 ? 8 : 4))
  }

  const files = Array.from(fileScores.entries())
    .map(([file, score]) => ({ file, score, priority: assignPriority(score, config) }))
    .sort((a, b) => b.score - a.score)

  const result = {
    generatedAt: new Date().toISOString(),
    totalFiles: allFiles.length,
    thresholds,
    ...(delta.enabled ? { deltaMode: true, baseRef: delta.baseRef } : {}),
    cycles,
    fanOutViolations,
    fanInViolations,
    composableChainDepthViolations,
    crossBoundary,
    typeMirrorPaths,
    files,
  }

  const { outJson, outMd } = writeAuditReports('import-graph', result, renderMarkdownReport(result))

  console.log(`Wrote:\n- ${toRepoPath(outJson, paths.projectRoot)}\n- ${toRepoPath(outMd, paths.projectRoot)}`)
  console.log(`Cycles: ${cycles.length}, Fan-out: ${fanOutViolations.length}, Fan-in: ${fanInViolations.length}, Composable chain depth: ${composableChainDepthViolations.length}, Cross-boundary: ${crossBoundary.length}, Type mirrors: ${typeMirrorPaths.length}`)
  process.exitCode = 0
}

main()
