import fs from 'node:fs'
import path from 'node:path'
import {
  getAuditReportHeaderLines,
  listAuditFiles,
  resolveAuditPaths,
  writeAuditReports,
  toRepoPath as toRepoPathUtil,
  parseChangedOnlyFlag,
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

const DEFAULTS = { maxFanOut: 15, maxFanIn: 20 }

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
  const fanOutViolations = Array.from(fanOut.entries())
    .filter(([_, count]) => count > thresholds.maxFanOut)
    .map(([file, count]) => ({ file, fanOut: count }))
    .sort((a, b) => b.fanOut - a.fanOut)

  // Find fan-in violations
  const fanInViolations = Array.from(fanIn.entries())
    .filter(([_, count]) => count > thresholds.maxFanIn)
    .map(([file, count]) => ({ file, fanIn: count }))
    .sort((a, b) => b.fanIn - a.fanIn)

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
    crossBoundary,
    files,
  }

  const { outJson, outMd } = writeAuditReports('import-graph', result, renderMarkdownReport(result))

  console.log(`Wrote:\n- ${toRepoPath(outJson, paths.projectRoot)}\n- ${toRepoPath(outMd, paths.projectRoot)}`)
  console.log(`Cycles: ${cycles.length}, Fan-out violations: ${fanOutViolations.length}, Fan-in violations: ${fanInViolations.length}, Cross-boundary: ${crossBoundary.length}`)
  process.exitCode = 0
}

main()
