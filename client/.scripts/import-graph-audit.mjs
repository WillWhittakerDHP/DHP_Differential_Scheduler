import fs from 'node:fs'
import path from 'node:path'
import {
  loadConfigAllowlist,
  checkConfigAllowlist,
  parseChangedOnlyFlag,
  isCompiledJsFile,
  isSeedScript,
} from './audit-exceptions.mjs'

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

const CWD = path.resolve(process.cwd())
const IS_CLIENT_DIR = fs.existsSync(path.join(CWD, 'src'))
const PROJECT_ROOT = IS_CLIENT_DIR ? path.resolve(CWD, '..') : CWD

const CLIENT_ROOT = IS_CLIENT_DIR ? CWD : path.join(PROJECT_ROOT, 'client')
const CLIENT_SRC = path.join(CLIENT_ROOT, 'src')
const SERVER_ROOT = path.join(PROJECT_ROOT, 'server')
const SERVER_SRC = path.join(SERVER_ROOT, 'src')

const OUT_DIR = IS_CLIENT_DIR
  ? path.join(CWD, '.audit-reports')
  : path.join(CWD, 'client', '.audit-reports')
const OUT_JSON = path.join(OUT_DIR, 'import-graph-audit.json')
const OUT_MD = path.join(OUT_DIR, 'import-graph-audit.md')
const CONFIG_PATH = path.join(OUT_DIR, 'import-graph-audit-config.json')

const DEFAULTS = { maxFanOut: 15, maxFanIn: 20 }

function ensureDir(d) { fs.mkdirSync(d, { recursive: true }) }
function toRepoPath(p) { return path.relative(PROJECT_ROOT, p).replaceAll(path.sep, '/') }

function isExcluded(repoPath, configAllowlist) {
  // Exclude migration files (one-time scripts, import patterns are expected)
  if (repoPath.includes('/migrations/') || repoPath.includes('/migration') || /migration.*\.(js|mjs|ts)$/i.test(repoPath)) {
    return true
  }
  if (repoPath.includes('__tests__') || repoPath.includes('.test.') || repoPath.includes('.spec.')) return true
  if (isSeedScript(repoPath)) return true
  if (repoPath.startsWith('client/src') && (repoPath.includes('@core/') || repoPath.includes('@layouts/'))) return true
  if (repoPath.includes('node_modules') || repoPath.includes('/dist/') || repoPath.includes('.git/')) return true
  if (repoPath.includes('.scripts/') || repoPath.includes('.audit-reports/')) return true
  const result = checkConfigAllowlist(repoPath, '*', 1, configAllowlist)
  return result.allowed
}

function isScannable(p) {
  return p.endsWith('.ts') || p.endsWith('.js') || p.endsWith('.vue') || p.endsWith('.mjs')
}

function listFilesRecursive(dirPath) {
  const files = []
  if (!fs.existsSync(dirPath)) return files
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    for (const e of entries) {
      const full = path.join(dirPath, e.name)
      const rp = toRepoPath(full)
      if (rp.includes('node_modules') || rp.includes('/dist/') || rp.includes('.git/')) continue
      if (e.isDirectory()) files.push(...listFilesRecursive(full))
      else if (e.isFile() && isScannable(full) && !isCompiledJsFile(full)) files.push(full)
    }
  } catch { /* inaccessible */ }
  return files
}

/**
 * Extract import specifiers from file content
 * Returns resolved repo-relative paths where possible
 */
function extractImports(content, absPath) {
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
        resolved = toRepoPath(resolved)
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
    for (const cb of result.crossBoundary.slice(0, 20)) {
      lines.push(`- \`${cb.from}\` → \`${cb.to}\` (${cb.direction})`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

function main() {
  ensureDir(OUT_DIR)

  const configAllowlist = loadConfigAllowlist(CONFIG_PATH)
  const delta = parseChangedOnlyFlag(process.argv, PROJECT_ROOT)

  let config = {}
  try { config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')) } catch { /* defaults */ }

  const thresholds = {
    maxFanOut: config.thresholds?.maxFanOut ?? DEFAULTS.maxFanOut,
    maxFanIn: config.thresholds?.maxFanIn ?? DEFAULTS.maxFanIn,
  }

  const clientFiles = listFilesRecursive(CLIENT_SRC)
  const serverFiles = listFilesRecursive(SERVER_SRC)
  const allFiles = [...clientFiles, ...serverFiles]

  // Build adjacency list
  const adjacencyList = new Map()
  const fanOut = new Map()
  const fanIn = new Map()
  const crossBoundary = []

  for (const abs of allFiles) {
    const repoPath = toRepoPath(abs)
    if (isExcluded(repoPath, configAllowlist)) continue

    const content = fs.readFileSync(abs, 'utf-8')
    const imports = extractImports(content, abs)
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

  fs.writeFileSync(OUT_JSON, JSON.stringify(result, null, 2))
  fs.writeFileSync(OUT_MD, renderMarkdownReport(result))

  console.log(`Wrote:\n- ${toRepoPath(OUT_JSON)}\n- ${toRepoPath(OUT_MD)}`)
  console.log(`Cycles: ${cycles.length}, Fan-out violations: ${fanOutViolations.length}, Fan-in violations: ${fanInViolations.length}, Cross-boundary: ${crossBoundary.length}`)
  process.exitCode = 0
}

main()
