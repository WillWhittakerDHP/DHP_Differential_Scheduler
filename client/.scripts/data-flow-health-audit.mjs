#!/usr/bin/env node
/**
 * Data Flow Health Audit
 *
 * Detects architectural data flow anti-patterns: invisible dependency chains,
 * untyped boundary crossings, transformer bypasses, and mixed state channels.
 *
 * Two-phase architecture:
 *   Phase A (per-file): 5 rules detecting patterns visible within a single file,
 *     plus side-effect collection of provide/inject/API maps for Phase B.
 *   Phase B (cross-file): 5 rules consuming Phase A maps + cross-audit JSON inputs
 *     to detect multi-file data flow anti-patterns.
 *
 * Cross-audit inputs (graceful degradation if missing):
 *   - import-graph-audit.json (fan-in, adjacency)
 *   - api-contract-audit.json (endpoints, shared types)
 *   - type-constant-inventory-audit.json (type definitions, consumer files)
 *
 * Output:
 *   - client/.audit-reports/data-flow-health-audit.json
 *   - client/.audit-reports/data-flow-health-audit.md
 */

import fs from 'node:fs'
import path from 'node:path'
import {
  AUDIT_REPORT_AI_INSTRUCTIONS_COMBINED,
  getAuditReportHeaderLines,
  listAuditFiles,
  resolveAuditPaths,
  writeAuditReports,
  toRepoPath as toRepoPathUtil,
  loadCentralAllowlist,
  isMatchAllowed,
  parseInlineExceptions,
  CONFIDENCE_LEVELS,
} from './shared-audit-utils.mjs'
import { extractVueScriptWithLineOffset } from './shared-ast-facade.mjs'

const AUDIT_TYPE = 'data-flow-health'

const RULE_META = [
  { ruleId: 'untyped-inject', label: 'Untyped Inject', severity: 'P1', weight: 2, phase: 'A', description: 'String-keyed inject() creates invisible, untyped dependency; use InjectionKey.', recommendedFix: 'Create const MyKey: InjectionKey<MyType> = Symbol("MyKey") and use inject(MyKey).' },
  { ruleId: 'query-data-passthrough', label: 'Query Data Passthrough', severity: 'P2', weight: 1, phase: 'A', description: 'useQuery .data exposed without transformation.', recommendedFix: 'Wrap query data in computed(() => transform(data)) with explicit typing.' },
  { ruleId: 'direct-api-in-component', label: 'Direct API in Component', severity: 'P1', weight: 2, phase: 'A', description: '.vue file imports from utils/api or services layer directly.', recommendedFix: 'Route API access through a composable for proper data flow.' },
  { ruleId: 'mutation-without-type-params', label: 'Mutation Without Type Params', severity: 'P2', weight: 1, phase: 'A', description: 'useMutation() without type parameters leaves variables and response as unknown.', recommendedFix: 'Add <TData, TError, TVariables> type parameters to useMutation.' },
  { ruleId: 'reactive-state-shadow', label: 'Reactive State Shadow', severity: 'info', weight: 0, phase: 'A', description: 'File imports store state AND creates local reactive state; possible dual source of truth.', recommendedFix: 'Verify single source of truth; remove redundant local state or store import.' },
  { ruleId: 'provide-inject-depth', label: 'Provide/Inject Depth', severity: 'P1', weight: 2, phase: 'B', description: 'Provide/inject chain spans 3+ component levels.', recommendedFix: 'Consider direct composable access or intermediate provide relay.' },
  { ruleId: 'type-boundary-gap', label: 'Type Boundary Gap', severity: 'P1', weight: 2, phase: 'B', description: 'Type used in composable but not at component boundary.', recommendedFix: 'Import the type at the component level for proper type flow.' },
  { ruleId: 'transformer-bypass', label: 'Transformer Bypass', severity: 'P2', weight: 1, phase: 'B', description: 'API data reaches component without passing through transformer layer.', recommendedFix: 'Add a transformation step between API response and component consumption.' },
  { ruleId: 'orphaned-injection-key', label: 'Orphaned Injection Key', severity: 'P2', weight: 1, phase: 'B', description: 'Provide key with no matching inject or vice versa.', recommendedFix: 'Remove dead provide/inject channel or add the missing counterpart.' },
  { ruleId: 'bidirectional-data-channel', label: 'Bidirectional Data Channel', severity: 'info', weight: 0, phase: 'B', description: 'Same data accessible via both inject and direct composable import.', recommendedFix: 'Consolidate to single channel to avoid ambiguity.' },
]

const RULE_WEIGHTS = Object.fromEntries(RULE_META.map(r => [r.ruleId, r.weight]))

function toRepoPath(absPath, projectRoot) {
  return toRepoPathUtil(absPath, projectRoot)
}

function snippetFromLine(line, maxLen = 80) {
  const trimmed = line.trim()
  return trimmed.length > maxLen ? trimmed.slice(0, maxLen - 3) + '...' : trimmed
}

// ─── Cross-Audit Input Loader ─────────────────────────────────────────────────

function loadAuditJson(fileName, paths) {
  const filePath = path.join(paths.outDir, fileName)
  if (!fs.existsSync(filePath)) {
    console.warn(`[${AUDIT_TYPE}] ${fileName} not found; dependent rules will be skipped`)
    return { available: false, data: null, path: filePath, reason: 'file not found' }
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(raw)
    return { available: true, data, path: filePath, reason: null }
  } catch (err) {
    console.warn(`[${AUDIT_TYPE}] Failed to parse ${fileName}: ${err.message}`)
    return { available: false, data: null, path: filePath, reason: `parse error: ${err.message}` }
  }
}

// ─── Phase A: Per-File Rules + Map Collection ─────────────────────────────────

function scanPhaseA(allFiles, allowlist, projectRoot) {
  const findings = []
  const provideSites = []
  const injectSites = []
  const apiAccessSites = []

  for (const absPath of allFiles) {
    let content
    try {
      content = fs.readFileSync(absPath, 'utf8')
    } catch {
      continue
    }

    const repoPath = toRepoPath(absPath, projectRoot)
    const isVue = absPath.endsWith('.vue')
    const inlineExceptions = parseInlineExceptions(content, AUDIT_TYPE)

    let scriptContent = content
    let scriptStartLine = 1
    if (isVue) {
      const extracted = extractVueScriptWithLineOffset(content)
      if (extracted) {
        scriptContent = extracted.scriptContent
        scriptStartLine = extracted.startLineInFile
      } else {
        scriptContent = ''
      }
    }

    const scriptLines = scriptContent.split('\n')

    // ── Collect provide/inject/API maps (side effects for Phase B) ──

    for (let i = 0; i < scriptLines.length; i++) {
      const line = scriptLines[i]
      const lineNum = isVue ? scriptStartLine + i : i + 1

      // Provide sites — greedy .* handles nested generics (e.g. provide<Ref<string>>('key', ...))
      const provideMatch = line.match(/\bprovide\b.*\(\s*(['"])(.*?)\1/)
      if (provideMatch) {
        provideSites.push({
          file: repoPath,
          line: lineNum,
          key: provideMatch[2],
          isTyped: false,
          valueExpr: snippetFromLine(line),
        })
      }
      const provideSymbolMatch = line.match(/\bprovide\b.*\(\s*(\w+)/)
      if (provideSymbolMatch && !provideMatch) {
        provideSites.push({
          file: repoPath,
          line: lineNum,
          key: provideSymbolMatch[1],
          isTyped: true,
          valueExpr: snippetFromLine(line),
        })
      }

      // Inject sites — greedy .* handles nested generics (e.g. inject<Ref<string>>('key'))
      const injectStringMatch = line.match(/\binject\b.*\(\s*(['"])(.*?)\1/)
      if (injectStringMatch) {
        injectSites.push({
          file: repoPath,
          line: lineNum,
          key: injectStringMatch[2],
          isTyped: false,
          defaultExpr: snippetFromLine(line),
        })
      }
      const injectSymbolMatch = line.match(/\binject\b.*\(\s*(\w+)/)
      if (injectSymbolMatch && !injectStringMatch) {
        injectSites.push({
          file: repoPath,
          line: lineNum,
          key: injectSymbolMatch[1],
          isTyped: true,
          defaultExpr: snippetFromLine(line),
        })
      }

      // API access sites (useQuery/useMutation in composables)
      if (!isVue) {
        const queryMatch = line.match(/use(?:Query|InfiniteQuery)\s*[<(]/)
        if (queryMatch) {
          const hasTransform = scriptContent.includes('computed(') || scriptContent.includes('transform')
          apiAccessSites.push({
            file: repoPath,
            line: lineNum,
            queryName: snippetFromLine(line, 40),
            hasTransform,
          })
        }
      }
    }

    // ── Rule: untyped-inject ──
    const injectStringRe = /inject\(\s*['"]/g
    for (let i = 0; i < scriptLines.length; i++) {
      const line = scriptLines[i]
      injectStringRe.lastIndex = 0
      if (injectStringRe.test(line)) {
        const lineNum = isVue ? scriptStartLine + i : i + 1
        const result = isMatchAllowed(repoPath, 'untyped-inject', lineNum, inlineExceptions, allowlist, line)
        if (!result.allowed) {
          findings.push({
            file: repoPath,
            lineNumber: lineNum,
            ruleId: 'untyped-inject',
            snippet: snippetFromLine(line),
            message: "String-keyed inject() creates invisible, untyped dependency; use InjectionKey.",
            fixHint: 'Create const MyKey: InjectionKey<MyType> = Symbol("MyKey") and use inject(MyKey).',
            confidence: CONFIDENCE_LEVELS.HIGH,
            phase: 'A',
          })
        }
      }
    }

    // ── Rule: query-data-passthrough (composable files only) ──
    if (!isVue && /use[A-Z]/.test(path.basename(absPath))) {
      const dataPassRe = /(?:return\s*\{[^}]*\.data\b|(?:const|let)\s+\w+\s*=\s*\w+\.data(?:\.value)?)/
      for (let i = 0; i < scriptLines.length; i++) {
        const line = scriptLines[i]
        if (dataPassRe.test(line) && /(?:Query|query)/.test(scriptContent)) {
          const lineNum = i + 1
          const hasComputedWrap = scriptLines.slice(Math.max(0, i - 3), i + 4).some(l => /computed\s*\(/.test(l))
          if (!hasComputedWrap) {
            const result = isMatchAllowed(repoPath, 'query-data-passthrough', lineNum, inlineExceptions, allowlist, line)
            if (!result.allowed) {
              findings.push({
                file: repoPath,
                lineNumber: lineNum,
                ruleId: 'query-data-passthrough',
                snippet: snippetFromLine(line),
                message: 'Query data exposed without transformation; wrap in computed with explicit typing.',
                fixHint: 'Wrap in computed(() => transform(queryResult.data.value)).',
                confidence: CONFIDENCE_LEVELS.MEDIUM,
                phase: 'A',
              })
            }
          }
        }
      }
    }

    // ── Rule: direct-api-in-component (.vue files only) ──
    if (isVue) {
      const apiImportRe = /from\s+['"]@\/(?:utils\/api|services)\//
      for (let i = 0; i < scriptLines.length; i++) {
        const line = scriptLines[i]
        if (apiImportRe.test(line)) {
          const lineNum = scriptStartLine + i
          const result = isMatchAllowed(repoPath, 'direct-api-in-component', lineNum, inlineExceptions, allowlist, line)
          if (!result.allowed) {
            findings.push({
              file: repoPath,
              lineNumber: lineNum,
              ruleId: 'direct-api-in-component',
              snippet: snippetFromLine(line),
              message: 'Component imports API layer directly; route through a composable for proper data flow.',
              fixHint: 'Move API call to a composable and import the composable instead.',
              confidence: CONFIDENCE_LEVELS.HIGH,
              phase: 'A',
            })
          }
        }
      }
    }

    // ── Rule: mutation-without-type-params ──
    const mutationRe = /useMutation\(\s*[^<]/g
    for (let i = 0; i < scriptLines.length; i++) {
      const line = scriptLines[i]
      mutationRe.lastIndex = 0
      if (mutationRe.test(line)) {
        const lineNum = isVue ? scriptStartLine + i : i + 1
        const result = isMatchAllowed(repoPath, 'mutation-without-type-params', lineNum, inlineExceptions, allowlist, line)
        if (!result.allowed) {
          findings.push({
            file: repoPath,
            lineNumber: lineNum,
            ruleId: 'mutation-without-type-params',
            snippet: snippetFromLine(line),
            message: 'useMutation without type parameters; add <TData, TError, TVariables> for typed data flow.',
            fixHint: 'Add type parameters: useMutation<ResponseType, Error, RequestType>({...}).',
            confidence: CONFIDENCE_LEVELS.HIGH,
            phase: 'A',
          })
        }
      }
    }

    // ── Rule: reactive-state-shadow ──
    const hasStoreImport = /(?:from\s+['"]@\/stores\/|use\w+Store\(\))/.test(scriptContent)
    const hasLocalRef = /\bref\s*\(/.test(scriptContent) || /\breactive\s*\(/.test(scriptContent)
    if (hasStoreImport && hasLocalRef) {
      const storeNames = []
      const storeRe = /(?:const|let)\s+\{([^}]+)\}\s*=\s*use\w+Store\(\)/g
      let storeMatch
      while ((storeMatch = storeRe.exec(scriptContent)) !== null) {
        storeNames.push(...storeMatch[1].split(',').map(s => s.trim()))
      }

      if (storeNames.length > 0) {
        const refNameRe = /(?:const|let)\s+(\w+)\s*=\s*(?:ref|reactive)\s*\(/g
        let refMatch
        while ((refMatch = refNameRe.exec(scriptContent)) !== null) {
          const localName = refMatch[1]
          const overlap = storeNames.some(sn =>
            localName.toLowerCase().includes(sn.toLowerCase()) ||
            sn.toLowerCase().includes(localName.toLowerCase())
          )
          if (overlap) {
            const lineNum = isVue
              ? scriptStartLine + scriptContent.slice(0, refMatch.index).split('\n').length - 1
              : scriptContent.slice(0, refMatch.index).split('\n').length
            const result = isMatchAllowed(repoPath, 'reactive-state-shadow', lineNum, inlineExceptions, allowlist)
            if (!result.allowed) {
              findings.push({
                file: repoPath,
                lineNumber: lineNum,
                ruleId: 'reactive-state-shadow',
                snippet: `Store prop '${storeNames.join(', ')}' shadowed by local ref '${localName}'`,
                message: 'File imports store state AND creates local reactive state; verify single source of truth.',
                fixHint: 'Remove redundant local state or store import.',
                confidence: CONFIDENCE_LEVELS.LOW,
                phase: 'A',
              })
            }
          }
        }
      }
    }
  }

  return { findings, provideSites, injectSites, apiAccessSites }
}

// ─── Phase B: Cross-File Flow Rules ───────────────────────────────────────────

function correlateFlowPaths(ctx) {
  const {
    provideSites, injectSites, apiAccessSites,
    importGraph, apiContract, typeInventory,
    allFiles, allowlist, projectRoot,
  } = ctx

  const findings = []
  const skippedRules = []

  const fileContentCache = new Map()
  function getFileContentAndInlineExceptions(repoPath) {
    if (fileContentCache.has(repoPath)) return fileContentCache.get(repoPath)
    const absPath = allFiles.find((f) => toRepoPath(f, projectRoot) === repoPath)
    let content = ''
    try {
      if (absPath) content = fs.readFileSync(absPath, 'utf8')
    } catch {
      // leave content empty
    }
    const inlineExceptions = parseInlineExceptions(content, AUDIT_TYPE)
    const out = { content, inlineExceptions }
    fileContentCache.set(repoPath, out)
    return out
  }

  function isPhaseBFindingAllowed(repoPath, ruleId, lineNumber, lineContent) {
    const { content, inlineExceptions } = getFileContentAndInlineExceptions(repoPath)
    const line = lineContent ?? content.split('\n')[lineNumber - 1]
    const result = isMatchAllowed(repoPath, ruleId, lineNumber, inlineExceptions, allowlist, line)
    return result.allowed
  }

  // ── Rule: provide-inject-depth ──
  if (importGraph.available && importGraph.data) {
    const igData = importGraph.data
    const adjacency = buildAdjacencyFromImportGraph(igData)

    const provideByKey = new Map()
    for (const ps of provideSites) {
      if (!provideByKey.has(ps.key)) provideByKey.set(ps.key, [])
      provideByKey.get(ps.key).push(ps)
    }

    for (const is of injectSites) {
      const providers = provideByKey.get(is.key) ?? []
      for (const ps of providers) {
        const depth = findShortestPathLength(adjacency, ps.file, is.file)
        if (depth >= 3) {
          if (isPhaseBFindingAllowed(is.file, 'provide-inject-depth', is.line)) continue
          const depthLabel = depth === Infinity ? '3+ (no direct import path)' : String(depth)
          findings.push({
            file: is.file,
            lineNumber: is.line,
            ruleId: 'provide-inject-depth',
            snippet: `inject('${is.key}') — provider in ${ps.file}`,
            message: `Provide/inject chain spans ${depthLabel} levels (${ps.file} → ... → ${is.file}); consider direct composable access.`,
            fixHint: 'Use a composable instead of deep provide/inject.',
            confidence: CONFIDENCE_LEVELS.MEDIUM,
            phase: 'B',
            flowPath: [ps.file, is.file],
            detail: { providerFile: ps.file, consumerFile: is.file, depth: depth === Infinity ? -1 : depth, key: is.key },
          })
        }
      }
    }
  } else {
    skippedRules.push('provide-inject-depth')
  }

  // ── Rule: type-boundary-gap ──
  if (typeInventory.available && typeInventory.data) {
    const tiData = typeInventory.data
    const types = tiData.types ?? tiData.inventory ?? []

    for (const typeDef of types) {
      const typeName = typeDef.name ?? typeDef.typeName
      if (!typeName) continue

      const consumers = Array.isArray(typeDef.consumers) ? typeDef.consumers : []
      const composableConsumers = consumers.filter(c => {
        const f = typeof c === 'string' ? c : c.file
        return f && (f.includes('/composables/') || f.includes('/composable'))
      })

      if (composableConsumers.length === 0) continue

      const componentConsumers = consumers.filter(c => {
        const f = typeof c === 'string' ? c : c.file
        return f && f.endsWith('.vue')
      })

      for (const cc of composableConsumers) {
        const composableFile = typeof cc === 'string' ? cc : cc.file
        const composableStem = path.basename(composableFile, path.extname(composableFile))

        const componentsUsingComposable = allFiles
          .filter(f => f.endsWith('.vue'))
          .filter(f => {
            try {
              const content = fs.readFileSync(f, 'utf8')
              return content.includes(composableStem)
            } catch {
              return false
            }
          })
          .map(f => toRepoPath(f, projectRoot))

        const typeImportingComponents = componentConsumers.map(c => typeof c === 'string' ? c : c.file)

        for (const compFile of componentsUsingComposable) {
          if (!typeImportingComponents.some(tc => compFile.includes(tc) || tc.includes(compFile))) {
            if (isPhaseBFindingAllowed(compFile, 'type-boundary-gap', 1)) continue
            findings.push({
              file: compFile,
              lineNumber: 1,
              ruleId: 'type-boundary-gap',
              snippet: `Type '${typeName}' from composable '${composableStem}' not imported`,
              message: `Type '${typeName}' used in composable but not at component boundary; component receives untyped data.`,
              fixHint: `Import '${typeName}' in ${compFile} for proper type flow.`,
              confidence: CONFIDENCE_LEVELS.LOW,
              phase: 'B',
              flowPath: [composableFile, compFile],
              detail: { typeName, composableFile, componentFile: compFile },
            })
          }
        }
      }
    }
  } else {
    skippedRules.push('type-boundary-gap')
  }

  // ── Rule: transformer-bypass ──
  if (apiContract.available || apiAccessSites.length > 0) {
    for (const site of apiAccessSites) {
      let fileContent
      try {
        const absPath = allFiles.find(f => toRepoPath(f, projectRoot) === site.file)
        if (absPath) fileContent = fs.readFileSync(absPath, 'utf8')
      } catch {
        continue
      }
      if (!fileContent) continue

      const hasTransformerImport = /from\s+['"].*(?:transform|adapter|mapper|converter)/i.test(fileContent)
      if (!hasTransformerImport && !site.hasTransform) {
        const lineContent = fileContent.split('\n')[site.line - 1]
        if (isPhaseBFindingAllowed(site.file, 'transformer-bypass', site.line, lineContent)) continue
        findings.push({
          file: site.file,
          lineNumber: site.line,
          ruleId: 'transformer-bypass',
          snippet: site.queryName,
          message: 'API data reaches component without passing through transformer layer.',
          fixHint: 'Add a transformation step between API response and consumption.',
          confidence: CONFIDENCE_LEVELS.LOW,
          phase: 'B',
          detail: { queryName: site.queryName },
        })
      }
    }
  } else {
    skippedRules.push('transformer-bypass')
  }

  // ── Rule: orphaned-injection-key ──
  {
    const provideKeys = new Set(provideSites.map(ps => ps.key))
    const injectKeys = new Set(injectSites.map(is => is.key))

    for (const ps of provideSites) {
      if (!injectKeys.has(ps.key)) {
        if (isPhaseBFindingAllowed(ps.file, 'orphaned-injection-key', ps.line)) continue
        findings.push({
          file: ps.file,
          lineNumber: ps.line,
          ruleId: 'orphaned-injection-key',
          snippet: `provide('${ps.key}') with no matching inject`,
          message: `Provide key '${ps.key}' has no matching inject; dead channel or broken chain.`,
          fixHint: 'Remove the unused provide or add the missing inject consumer.',
          confidence: CONFIDENCE_LEVELS.MEDIUM,
          phase: 'B',
          detail: { key: ps.key, direction: 'provide-without-inject' },
        })
      }
    }

    for (const is of injectSites) {
      if (!provideKeys.has(is.key)) {
        if (isPhaseBFindingAllowed(is.file, 'orphaned-injection-key', is.line)) continue
        findings.push({
          file: is.file,
          lineNumber: is.line,
          ruleId: 'orphaned-injection-key',
          snippet: `inject('${is.key}') with no matching provide`,
          message: `Inject key '${is.key}' has no matching provide; broken dependency chain.`,
          fixHint: 'Add the missing provide or remove this inject.',
          confidence: CONFIDENCE_LEVELS.MEDIUM,
          phase: 'B',
          detail: { key: is.key, direction: 'inject-without-provide' },
        })
      }
    }
  }

  // ── Rule: bidirectional-data-channel ──
  {
    const injectByFile = new Map()
    for (const is of injectSites) {
      if (!injectByFile.has(is.file)) injectByFile.set(is.file, [])
      injectByFile.get(is.file).push(is)
    }

    for (const [file, fileInjects] of injectByFile) {
      const absPath = allFiles.find(f => toRepoPath(f, projectRoot) === file)
      if (!absPath) continue
      let fileContent
      try {
        fileContent = fs.readFileSync(absPath, 'utf8')
      } catch {
        continue
      }

      const composableImports = []
      const importRe = /import\s+\{([^}]+)\}\s+from\s+['"]@\/composables\//g
      let importMatch
      while ((importMatch = importRe.exec(fileContent)) !== null) {
        composableImports.push(...importMatch[1].split(',').map(s => s.trim()))
      }

      if (composableImports.length === 0) continue

      for (const inj of fileInjects) {
        const keyLower = inj.key.toLowerCase()
        const overlap = composableImports.some(ci =>
          ci.toLowerCase().includes(keyLower) || keyLower.includes(ci.toLowerCase().replace(/^use/, ''))
        )
        if (overlap) {
          if (isPhaseBFindingAllowed(file, 'bidirectional-data-channel', inj.line)) continue
          findings.push({
            file,
            lineNumber: inj.line,
            ruleId: 'bidirectional-data-channel',
            snippet: `inject('${inj.key}') + composable import in same file`,
            message: `Data '${inj.key}' accessible via both inject and direct composable import; consolidate to single channel.`,
            fixHint: 'Choose one channel: either inject or composable import.',
            confidence: CONFIDENCE_LEVELS.LOW,
            phase: 'B',
            detail: { key: inj.key, composableImports },
          })
        }
      }
    }
  }

  return { findings, skippedRules }
}

// ─── Import Graph Helpers ─────────────────────────────────────────────────────

function buildAdjacencyFromImportGraph(igData) {
  const adj = new Map()
  const files = igData.files ?? []
  for (const f of files) {
    const from = f.file ?? f.repoPath
    if (!from) continue
    const imports = f.imports ?? f.dependencies ?? []
    if (!adj.has(from)) adj.set(from, new Set())
    for (const imp of imports) {
      const target = typeof imp === 'string' ? imp : imp.file ?? imp.target
      if (target) adj.get(from).add(target)
    }
  }
  return adj
}

function findShortestPathLength(adjacency, source, target) {
  if (source === target) return 0
  const visited = new Set([source])
  const queue = [[source, 0]]
  while (queue.length > 0) {
    const [current, depth] = queue.shift()
    const neighbors = adjacency.get(current)
    if (!neighbors) continue
    for (const neighbor of neighbors) {
      if (neighbor === target) return depth + 1
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push([neighbor, depth + 1])
      }
    }
  }
  return Infinity
}

// ─── Blast-Radius Enrichment ──────────────────────────────────────────────────

function enrichFindings(allFindings, importGraphResult) {
  const fanInMap = new Map()
  if (importGraphResult.available && importGraphResult.data) {
    const files = importGraphResult.data.files ?? []
    for (const f of files) {
      const key = f.file ?? f.repoPath
      if (key) fanInMap.set(key, f.fanIn ?? 0)
    }
    const violations = importGraphResult.data.fanInViolations ?? []
    for (const v of violations) {
      fanInMap.set(v.file, v.fanIn ?? 0)
    }
  }

  return allFindings.map(f => {
    const affectedFiles = f.flowPath
      ? f.flowPath.length
      : (fanInMap.get(f.file) ?? 1)
    const isPublicBoundary = detectPublicBoundary(f)
    return { ...f, affectedFiles, isPublicBoundary }
  })
}

function detectPublicBoundary(finding) {
  if (finding.ruleId === 'untyped-inject' || finding.ruleId === 'provide-inject-depth') return true
  if (finding.ruleId === 'type-boundary-gap') return true
  if (finding.ruleId === 'direct-api-in-component') return true
  return false
}

// ─── Repair Waves ─────────────────────────────────────────────────────────────

function buildRepairWaves(enrichedFindings) {
  const contained = []
  const moderate = []
  const systemic = []
  for (const f of enrichedFindings) {
    const affected = f.affectedFiles ?? 1
    if (affected <= 2 || f.phase === 'A') {
      contained.push(f)
    } else if (affected >= 3 && affected <= 5) {
      moderate.push(f)
    } else {
      systemic.push(f)
    }
  }
  return { contained, moderate, systemic }
}

// ─── File Scoring ─────────────────────────────────────────────────────────────

function scoreFile(fileFindings) {
  return fileFindings.reduce((sum, f) => sum + (RULE_WEIGHTS[f.ruleId] ?? 0), 0)
}

function priorityFromScore(score) {
  if (score >= 6) return 'P0'
  if (score >= 3) return 'P1'
  return 'P2'
}

// ─── Markdown Report ──────────────────────────────────────────────────────────

function renderMarkdownReport(payload) {
  const lines = []
  lines.push(...getAuditReportHeaderLines())
  lines.push('# Data Flow Health Audit')
  lines.push('')
  lines.push(`Generated: ${payload.generatedAt}`)
  lines.push('')

  lines.push('## Overview')
  lines.push('')
  lines.push(`- Files scanned: **${payload.totalScanned}**`)
  lines.push(`- Findings: **${payload.findings.length}**`)
  lines.push(`- Files with findings: **${payload.files.length}**`)
  lines.push(`- Phase A (per-file) findings: **${payload.findings.filter(f => f.phase === 'A').length}**`)
  lines.push(`- Phase B (cross-file) findings: **${payload.findings.filter(f => f.phase === 'B').length}**`)
  lines.push('')

  lines.push('## Input Audit Status')
  lines.push('')
  lines.push('| Input Audit | Available | Path |')
  lines.push('| --- | --- | --- |')
  const ia = payload.inputAudits
  lines.push(`| import-graph | ${ia.importGraph.available ? 'Yes' : 'No'} | \`${ia.importGraph.path ?? ''}\` |`)
  lines.push(`| api-contract | ${ia.apiContract.available ? 'Yes' : 'No'} | \`${ia.apiContract.path ?? ''}\` |`)
  lines.push(`| type-inventory | ${ia.typeInventory.available ? 'Yes' : 'No'} | \`${ia.typeInventory.path ?? ''}\` |`)
  lines.push('')

  if (payload.skippedRules.length > 0) {
    lines.push('### Skipped rules (missing input audits)')
    lines.push('')
    for (const r of payload.skippedRules) {
      lines.push(`- \`${r}\``)
    }
    lines.push('')
  }

  lines.push('## Ruleset')
  lines.push('')
  lines.push('| Rule | Phase | Severity | Weight | Description |')
  lines.push('| --- | --- | --- | ---: | --- |')
  for (const r of payload.ruleset) {
    lines.push(`| ${r.ruleId} | ${r.phase} | ${r.severity} | ${r.weight} | ${r.description} |`)
  }
  lines.push('')

  const byRule = {}
  for (const f of payload.findings) {
    byRule[f.ruleId] = (byRule[f.ruleId] || 0) + 1
  }
  const sortedRules = Object.entries(byRule).sort((a, b) => b[1] - a[1])
  if (sortedRules.length > 0) {
    lines.push('## By rule')
    lines.push('')
    lines.push('| Rule | Phase | Severity | Count |')
    lines.push('| --- | --- | --- | ---: |')
    for (const [ruleId, count] of sortedRules) {
      const meta = RULE_META.find(r => r.ruleId === ruleId)
      lines.push(`| ${ruleId} | ${meta?.phase ?? '?'} | ${meta?.severity ?? '?'} | ${count} |`)
    }
    lines.push('')
  }

  lines.push('## Flow Maps Summary')
  lines.push('')
  const fm = payload.flowMaps
  lines.push(`- Provide sites: **${fm.provideSites}**`)
  lines.push(`- Inject sites: **${fm.injectSites}**`)
  lines.push(`- Matched pairs: **${fm.matchedPairs}**`)
  lines.push(`- Unmatched provides: **${fm.unmatchedProvides}**`)
  lines.push(`- Unmatched injects: **${fm.unmatchedInjects}**`)
  lines.push('')

  const waves = payload.repairWaves
  lines.push('## Repair Waves')
  lines.push('')
  lines.push(`- **Wave 1 — Contained** (affectedFiles ≤ 2 or per-file): ${waves.contained.length} finding(s)`)
  lines.push(`- **Wave 2 — Moderate** (affectedFiles 3–5): ${waves.moderate.length} finding(s)`)
  lines.push(`- **Wave 3 — Systemic** (affectedFiles ≥ 6): ${waves.systemic.length} finding(s)`)
  lines.push('')

  if (payload.files.length > 0) {
    const MAX = 40
    lines.push(`## Top ${Math.min(payload.files.length, MAX)} files by score`)
    lines.push('')
    lines.push('| File | Priority | Score | Affected |')
    lines.push('| --- | --- | ---: | ---: |')
    for (const f of payload.files.slice(0, MAX)) {
      lines.push(`| \`${f.file}\` | ${f.priority} | ${f.score} | ${f.affectedFiles ?? 0} |`)
    }
    if (payload.files.length > MAX) {
      lines.push(`| *...and ${payload.files.length - MAX} more* | | | |`)
    }
    lines.push('')
  }

  if (payload.findings.length > 0) {
    const MAX = 60
    lines.push(`## All findings (first ${MAX})`)
    lines.push('')
    lines.push('| File | Line | Rule | Phase | Message | Affected |')
    lines.push('| --- | ---: | --- | --- | --- | ---: |')
    for (const f of payload.findings.slice(0, MAX)) {
      const msg = f.message.length > 50 ? f.message.slice(0, 47) + '...' : f.message
      lines.push(`| \`${f.file}\` | ${f.lineNumber} | ${f.ruleId} | ${f.phase} | ${msg} | ${f.affectedFiles ?? 0} |`)
    }
    if (payload.findings.length > MAX) {
      lines.push(`| *...and ${payload.findings.length - MAX} more* | | | | | |`)
    }
    lines.push('')
  }

  lines.push('## Notes')
  lines.push('')
  lines.push('- **Phase A rules** (per-file): untyped-inject, query-data-passthrough, direct-api-in-component, mutation-without-type-params, reactive-state-shadow.')
  lines.push('- **Phase B rules** (cross-file): provide-inject-depth, type-boundary-gap, transformer-bypass, orphaned-injection-key, bidirectional-data-channel.')
  lines.push('- Repair waves: Wave 1 (contained) = isolated fixes; Wave 2 (moderate) = fix boundary then flow path; Wave 3 (systemic) = coordinated architectural refactor.')
  lines.push('- Cross-audit inputs are optional; rules that depend on missing inputs are skipped and listed above.')
  lines.push('')

  return lines.join('\n')
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const paths = resolveAuditPaths(AUDIT_TYPE)
  const { projectRoot, clientSrc } = paths
  const allowlist = loadCentralAllowlist(AUDIT_TYPE)

  const scanDirs = [
    path.join(clientSrc, 'composables'),
    path.join(clientSrc, 'components'),
    path.join(clientSrc, 'views'),
    path.join(clientSrc, 'layouts'),
    path.join(clientSrc, 'utils', 'api'),
    path.join(clientSrc, 'services'),
  ]
  const allFiles = listAuditFiles(AUDIT_TYPE, scanDirs)

  // Load cross-audit inputs (graceful degradation)
  const importGraph = loadAuditJson('import-graph-audit.json', paths)
  const apiContract = loadAuditJson('api-contract-audit.json', paths)
  const typeInventory = loadAuditJson('type-constant-inventory-audit.json', paths)

  // Phase A: per-file scan + map collection
  const { findings: phaseAFindings, provideSites, injectSites, apiAccessSites } =
    scanPhaseA(allFiles, allowlist, projectRoot)

  // Phase B: cross-file correlation
  const { findings: phaseBFindings, skippedRules } = correlateFlowPaths({
    provideSites, injectSites, apiAccessSites,
    importGraph, apiContract, typeInventory,
    allFiles, allowlist, projectRoot,
  })

  // Merge, enrich, score, wave, report
  const allFindings = [...phaseAFindings, ...phaseBFindings]
  const enriched = enrichFindings(allFindings, importGraph)
  const repairWaves = buildRepairWaves(enriched)

  // Flow maps summary
  const provideKeySet = new Set(provideSites.map(ps => ps.key))
  const injectKeySet = new Set(injectSites.map(is => is.key))
  const matchedPairs = [...provideKeySet].filter(k => injectKeySet.has(k)).length
  const flowMaps = {
    provideSites: provideSites.length,
    injectSites: injectSites.length,
    matchedPairs,
    unmatchedProvides: [...provideKeySet].filter(k => !injectKeySet.has(k)).length,
    unmatchedInjects: [...injectKeySet].filter(k => !provideKeySet.has(k)).length,
  }

  // File-level summaries
  const fileMap = new Map()
  for (const f of enriched) {
    if (!fileMap.has(f.file)) fileMap.set(f.file, [])
    fileMap.get(f.file).push(f)
  }
  const files = [...fileMap.entries()]
    .map(([file, findings]) => {
      const score = scoreFile(findings)
      const maxAffected = Math.max(...findings.map(f => f.affectedFiles ?? 1))
      return { file, score, priority: priorityFromScore(score), affectedFiles: maxAffected }
    })
    .sort((a, b) => b.score - a.score)

  const payload = {
    instructionsForAi: AUDIT_REPORT_AI_INSTRUCTIONS_COMBINED,
    generatedAt: new Date().toISOString(),
    totalScanned: allFiles.length,
    inputAudits: {
      importGraph: { available: importGraph.available, path: importGraph.path, reason: importGraph.reason },
      apiContract: { available: apiContract.available, path: apiContract.path, reason: apiContract.reason },
      typeInventory: { available: typeInventory.available, path: typeInventory.path, reason: typeInventory.reason },
    },
    skippedRules,
    ruleset: RULE_META.map(r => ({
      ruleId: r.ruleId,
      label: r.label,
      severity: r.severity,
      weight: r.weight,
      phase: r.phase,
      description: r.description,
      recommendedFix: r.recommendedFix,
    })),
    findings: enriched,
    flowMaps,
    files,
    repairWaves,
  }

  const mdContent = renderMarkdownReport(payload)
  const { outJson, outMd } = writeAuditReports(AUDIT_TYPE, payload, mdContent)
  console.log(`Wrote: ${path.relative(process.cwd(), outJson)}`)
  console.log(`Wrote: ${path.relative(process.cwd(), outMd)}`)
  console.log(`Scanned ${allFiles.length} files, found ${enriched.length} finding(s) across ${files.length} file(s).`)
  console.log(`Flow maps: ${provideSites.length} provide sites, ${injectSites.length} inject sites, ${matchedPairs} matched pairs.`)
  if (skippedRules.length > 0) {
    console.log(`Skipped rules (missing inputs): ${skippedRules.join(', ')}`)
  }
}

main()
