/* eslint-disable security/detect-non-literal-regexp */
/**
 * Type-Health Audit
 *
 * Surfaces composition/structure anti-patterns: nested utility types, excessive unions,
 * indirection (ReturnType<typeof ref>, etc.), Record<string, any>, and Vue ref flavor confusion.
 *
 * Two-pass: regex for literal patterns (9 rules), AST for union/intersection/generics/re-export (4 rules).
 * Enriches findings with isExported and usageCount for repair-wave prioritization.
 *
 * Output: .audit-reports/type-health-audit.json, .audit-reports/type-health-audit.md
 */

import fs from 'node:fs'
import path from 'node:path'
import {
  loadCentralAllowlist,
  listAuditFiles,
  resolveAuditPaths,
  getAuditScanDirs,
  writeAuditReports,
  toRepoPath as toRepoPathUtil,
  checkConfigAllowlist,
  getAuditReportHeaderLines,
  AUDIT_REPORT_AI_INSTRUCTIONS_COMBINED,
} from './shared-audit-utils.mjs'
import {
  createSourceFileFromContent,
  extractVueScriptWithLineOffset,
  forEachDescendant,
  loadTsMorph,
} from './shared-ast-facade.mjs'

const RULE_WEIGHTS = {
  'nested-partial': 3,
  'nested-omit': 2,
  'nested-pick': 2,
  'nested-required': 2,
  'nested-returntype': 3,
  'record-string-any': 4,
  'record-string-unknown': 1,
  'typeof-ref-return': 2,
  'typeof-computed-return': 2,
  'writable-computed-ref-usage': 0,
  'excessive-union': 1,
  'triple-intersection': 1,
  'single-letter-generic': 1,
  're-export-only-file': 0,
}

const REGEX_RULES = [
  { ruleId: 'nested-partial', pattern: /Partial<\s*Partial</g, message: 'Flatten to single Partial or named type' },
  { ruleId: 'nested-omit', pattern: /Omit<\s*Omit</g, message: 'Combine into single Omit' },
  { ruleId: 'nested-pick', pattern: /Pick<\s*Pick</g, message: 'Combine into single Pick' },
  { ruleId: 'nested-required', pattern: /Required<\s*Required</g, message: 'Flatten to single Required' },
  { ruleId: 'nested-returntype', pattern: /ReturnType<\s*ReturnType</g, message: 'Extract to named type alias' },
  { ruleId: 'record-string-any', pattern: /Record<string,\s*any>/g, message: 'Use specific interface or mapped type' },
  { ruleId: 'record-string-unknown', pattern: /Record<string,\s*unknown>/g, message: 'Use specific interface' },
  { ruleId: 'typeof-ref-return', pattern: /ReturnType<typeof\s+ref</g, message: 'Use Ref directly' },
  { ruleId: 'typeof-computed-return', pattern: /ReturnType<typeof\s+computed</g, message: 'Use ComputedRef directly' },
  { ruleId: 'writable-computed-ref-usage', pattern: /WritableComputedRef/g, message: 'Audit: is two-way binding needed?' },
]

const RULE_META = {
  'nested-partial': { severity: 'P0', description: 'Nested Partial<>', recommendedFix: 'Flatten to single Partial or named type' },
  'nested-omit': { severity: 'P1', description: 'Nested Omit<>', recommendedFix: 'Combine into single Omit' },
  'nested-pick': { severity: 'P1', description: 'Nested Pick<>', recommendedFix: 'Combine into single Pick' },
  'nested-required': { severity: 'P1', description: 'Nested Required<>', recommendedFix: 'Flatten to single Required' },
  'nested-returntype': { severity: 'P0', description: 'Nested ReturnType<ReturnType<...>>', recommendedFix: 'Extract inner type to a named alias' },
  'record-string-any': { severity: 'P0', description: 'Record<string, any>', recommendedFix: 'Use specific interface or mapped type' },
  'record-string-unknown': { severity: 'P2', description: 'Record<string, unknown>', recommendedFix: 'Use specific interface' },
  'typeof-ref-return': { severity: 'P1', description: 'ReturnType<typeof ref<...>>', recommendedFix: 'Use Ref directly' },
  'typeof-computed-return': { severity: 'P1', description: 'ReturnType<typeof computed<...>>', recommendedFix: 'Use ComputedRef directly' },
  'writable-computed-ref-usage': { severity: 'info', description: 'WritableComputedRef usage', recommendedFix: 'Audit: is two-way binding needed?' },
  'excessive-union': { severity: 'P2', description: 'Union with 5+ branches', recommendedFix: 'Extract to discriminated union or enum' },
  'triple-intersection': { severity: 'P2', description: 'Intersection with 3+ segments', recommendedFix: 'Merge into single interface with extends' },
  'single-letter-generic': { severity: 'P2', description: 'Single-letter type parameter', recommendedFix: 'Use descriptive name per workspace rule' },
  're-export-only-file': { severity: 'info', description: 'File only re-exports types', recommendedFix: 'Merge re-exports into source or consumer' },
}

function toRepoPath(p, projectRoot) {
  return toRepoPathUtil(p, projectRoot)
}

function snippetFromLine(line, maxLen = 80) {
  const trimmed = line.trim()
  return trimmed.length > maxLen ? trimmed.slice(0, maxLen - 3) + '...' : trimmed
}

/**
 * Regex scan: match REGEX_RULES, skip writable-computed when line has "as WritableComputedRef", check allowlist.
 */
function scanFileRegex(content, repoPath, absPath, configAllowlist) {
  const isVue = absPath.endsWith('.vue')
  const scriptContent = isVue
    ? (content.match(/<script[^>]*>([\s\S]*?)<\/script>/i)?.[1] ?? '')
    : content
  const lines = scriptContent.split('\n')
  const findings = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = isVue ? (() => {
      const beforeScript = content.slice(0, content.indexOf(scriptContent))
      const startLine = (beforeScript.match(/\n/g) ?? []).length + 1
      return startLine + i
    })() : i + 1

    for (const rule of REGEX_RULES) {
      if (rule.ruleId === 'writable-computed-ref-usage' && /\bas\s+WritableComputedRef\b/.test(line)) continue
      if (rule.pattern.global) rule.pattern.lastIndex = 0
      const matches = line.matchAll(rule.pattern)
      for (const _ of matches) {
        const result = checkConfigAllowlist(repoPath, rule.ruleId, lineNum, configAllowlist)
        if (!result.allowed) {
          findings.push({
            file: repoPath,
            lineNumber: lineNum,
            ruleId: rule.ruleId,
            snippet: snippetFromLine(line),
            message: rule.message,
            fixHint: RULE_META[rule.ruleId]?.recommendedFix,
          })
        }
      }
    }
  }

  return findings
}

/**
 * Count how many files import a given type name (lightweight: regex scan).
 */
function countTypeConsumers(typeName, allAbsPaths) {
  const escaped = typeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const needle = new RegExp(
    `import\\s+type\\s+\\{[^}]*\\b${escaped}\\b[^}]*\\}|import\\s+type\\s+\\b${escaped}\\b`
  )
  let count = 0
  for (const abs of allAbsPaths) {
    try {
      const content = fs.readFileSync(abs, 'utf8')
      if (needle.test(content)) count += 1
    } catch {
      // skip
    }
  }
  return count
}

/**
 * Count how many files import from a given file (heuristic: path stem in import from).
 */
function countFileFanIn(repoPath, allAbsPaths, projectRoot) {
  const stem = path.basename(repoPath, path.extname(repoPath))
  if (!stem) return 0
  const escaped = stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const needle = new RegExp(`from\\s+['"][^'"]*\\b${escaped}\\b['"]`)
  let count = 0
  for (const abs of allAbsPaths) {
    if (toRepoPath(abs, projectRoot) === repoPath) continue
    try {
      const content = fs.readFileSync(abs, 'utf8')
      if (needle.test(content)) count += 1
    } catch {
      // skip
    }
  }
  return count
}

/**
 * Heuristic: is this line part of an exported declaration? Check same line or preceding for export/type/interface.
 */
function regexFindingIsExported(content, lineNumber, _ruleId) {
  const lines = content.split('\n')
  const idx = lineNumber - 1
  for (let i = idx; i >= Math.max(0, idx - 5); i--) {
    const line = lines[i] ?? ''
    if (/^\s*export\s+(type|interface|const|function|class)\b/.test(line)) return true
    if (/^\s*(type|interface)\s+[A-Za-z_]/.test(line) && i < idx) break
  }
  return false
}

/**
 * Extract a type name from a line for usage counting (best-effort: first type/interface name on line).
 */
function extractEnclosingTypeName(line) {
  const typeMatch = line.match(/\b(?:type|interface)\s+([A-Za-z_][A-Za-z0-9_]*)\b/)
  if (typeMatch) return typeMatch[1]
  const refMatch = line.match(/ReturnType<typeof\s+(ref|computed)\s*</)
  if (refMatch) return null
  return null
}

/**
 * Single AST traversal: excessive-union, triple-intersection, single-letter-generic, re-export-only-file.
 */
async function collectAstFindings(sourceFile, getLine, repoPath, getLineText, configAllowlist) {
  const { SyntaxKind } = await loadTsMorph()
  const findings = []
  let allStatementsAreTypeOnlyReExports = true
  const statements = sourceFile.getStatements()

  for (const stmt of statements) {
    const kind = stmt.getKind()
    if (kind !== SyntaxKind.ExportDeclaration) {
      allStatementsAreTypeOnlyReExports = false
      break
    }
    if (!stmt.isTypeOnly?.() || !stmt.getModuleSpecifier?.()) {
      allStatementsAreTypeOnlyReExports = false
      break
    }
  }

  if (allStatementsAreTypeOnlyReExports && statements.length > 0) {
    const lineNum = getLine(statements[0])
    const result = checkConfigAllowlist(repoPath, 're-export-only-file', lineNum, configAllowlist)
    if (!result.allowed) {
      findings.push({
        file: repoPath,
        lineNumber: lineNum,
        ruleId: 're-export-only-file',
        snippet: snippetFromLine(getLineText(lineNum)),
        message: RULE_META['re-export-only-file'].message,
        fixHint: RULE_META['re-export-only-file'].recommendedFix,
        isFileLevel: true,
      })
    }
  }

  forEachDescendant(sourceFile, (node) => {
    const kind = node.getKind()

    if (kind === SyntaxKind.TypeAliasDeclaration) {
      const typeNode = node.getTypeNode?.()
      if (typeNode) {
        const typeKind = typeNode.getKind()
        if (typeKind === SyntaxKind.UnionType) {
          const typeNodes = typeNode.getTypeNodes?.() ?? []
          if (typeNodes.length >= 5) {
            const lineNum = getLine(node)
            const result = checkConfigAllowlist(repoPath, 'excessive-union', lineNum, configAllowlist)
            if (!result.allowed) {
              findings.push({
                file: repoPath,
                lineNumber: lineNum,
                ruleId: 'excessive-union',
                snippet: snippetFromLine(getLineText(lineNum)),
                message: RULE_META['excessive-union'].message,
                fixHint: RULE_META['excessive-union'].recommendedFix,
                isExported: node.isExported?.() === true,
              })
            }
          }
        }
        if (typeKind === SyntaxKind.IntersectionType) {
          const typeNodes = typeNode.getTypeNodes?.() ?? []
          if (typeNodes.length >= 3) {
            const lineNum = getLine(node)
            const result = checkConfigAllowlist(repoPath, 'triple-intersection', lineNum, configAllowlist)
            if (!result.allowed) {
              findings.push({
                file: repoPath,
                lineNumber: lineNum,
                ruleId: 'triple-intersection',
                snippet: snippetFromLine(getLineText(lineNum)),
                message: RULE_META['triple-intersection'].message,
                fixHint: RULE_META['triple-intersection'].recommendedFix,
                isExported: node.isExported?.() === true,
              })
            }
          }
        }
      }
    }

    if (kind === SyntaxKind.TypeParameterDeclaration) {
      const name = node.getName?.() ?? ''
      if (name.length === 1) {
        const lineNum = getLine(node)
        const result = checkConfigAllowlist(repoPath, 'single-letter-generic', lineNum, configAllowlist)
        if (!result.allowed) {
          const parent = node.getParent?.()
          const exported = parent?.isExported?.() === true
          findings.push({
            file: repoPath,
            lineNumber: lineNum,
            ruleId: 'single-letter-generic',
            snippet: snippetFromLine(getLineText(lineNum)),
            message: RULE_META['single-letter-generic'].message,
            fixHint: RULE_META['single-letter-generic'].recommendedFix,
            isExported: exported,
          })
        }
      }
    }
  })

  return findings
}

function assignPriority(score, config) {
  const p0Min = Number(config?.priorities?.p0MinSeverityScore ?? 15)
  const p1Min = Number(config?.priorities?.p1MinSeverityScore ?? 6)
  if (score >= p0Min) return 'P0'
  if (score >= p1Min) return 'P1'
  return 'P2'
}

function buildRepairWaves(findings) {
  const local = []
  const lowFanIn = []
  const highFanIn = []
  findings.forEach((f, idx) => {
    const exp = f.isExported === true
    const usage = f.usageCount ?? 0
    if (!exp || usage === 0) local.push(idx)
    else if (usage >= 4) highFanIn.push(idx)
    else lowFanIn.push(idx)
  })
  return { local, lowFanIn, highFanIn }
}

function renderMarkdownReport(result) {
  const lines = []
  lines.push('# Type-Health Audit (Generated)')
  lines.push('')
  lines.push(...getAuditReportHeaderLines())
  lines.push('')
  lines.push('This file is generated by `client/.scripts/type-health-audit.mjs`.')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Files scanned: **${result.totalScanned}**`)
  lines.push(`- Total findings: **${result.findings.length}**`)
  lines.push('')

  const byRule = {}
  for (const f of result.findings) {
    byRule[f.ruleId] = (byRule[f.ruleId] || 0) + 1
  }
  lines.push('| Rule | Count |')
  lines.push('| --- | ---: |')
  for (const [ruleId, count] of Object.entries(byRule).sort((a, b) => b[1] - a[1])) {
    lines.push(`| ${ruleId} | ${count} |`)
  }
  lines.push('')

  const waves = result.repairWaves ?? { local: [], lowFanIn: [], highFanIn: [] }
  lines.push('## Repair Waves')
  lines.push('')
  lines.push(`- **Local** (not exported or zero consumers): ${waves.local?.length ?? 0} — fix with zero cascade.`)
  lines.push(`- **Low fan-in** (exported, 1–3 consumers): ${waves.lowFanIn?.length ?? 0} — fix type then consumers in same pass.`)
  lines.push(`- **High fan-in** (exported, 4+ consumers): ${waves.highFanIn?.length ?? 0} — plan coordinated multi-file repair.`)
  lines.push('')
  const topLocal = (waves.local ?? []).slice(0, 10).map((i) => result.findings[i])
  if (topLocal.length > 0) {
    lines.push('### Top local (wave 1)')
    lines.push('| File | Line | Rule | Snippet |')
    lines.push('| --- | ---: | --- | --- |')
    for (const f of topLocal) {
      const snip = (f.snippet ?? '').replace(/\|/g, '\\|')
      lines.push(`| \`${f.file}\` | ${f.lineNumber} | ${f.ruleId} | \`${snip}\` |`)
    }
    lines.push('')
  }
  const topHigh = (waves.highFanIn ?? []).slice(0, 5).map((i) => result.findings[i])
  if (topHigh.length > 0) {
    lines.push('### Sample high fan-in (wave 3)')
    lines.push('| File | Line | Rule | usageCount |')
    lines.push('| --- | ---: | --- | ---: |')
    for (const f of topHigh) {
      lines.push(`| \`${f.file}\` | ${f.lineNumber} | ${f.ruleId} | ${f.usageCount ?? 0} |`)
    }
    lines.push('')
  }

  for (const ruleId of Object.keys(RULE_META)) {
    const ruleFindings = result.findings.filter((f) => f.ruleId === ruleId)
    if (ruleFindings.length === 0) continue
    const meta = RULE_META[ruleId]
    lines.push(`## ${ruleId}`)
    lines.push('')
    if (meta) lines.push(`*${meta.description}* — ${meta.recommendedFix ?? ''}`)
    lines.push('')
    lines.push('| File | Line | Snippet |')
    lines.push('| --- | ---: | --- |')
    for (const f of ruleFindings.slice(0, 40)) {
      const snip = (f.snippet ?? '').replace(/\|/g, '\\|')
      lines.push(`| \`${f.file}\` | ${f.lineNumber} | \`${snip}\` |`)
    }
    if (ruleFindings.length > 40) {
      lines.push(`| *...and ${ruleFindings.length - 40} more* | | |`)
    }
    lines.push('')
  }

  if (result.files?.length > 0) {
    lines.push('## Files by Severity')
    lines.push('')
    lines.push('| File | Priority | Score |')
    lines.push('| --- | --- | ---: |')
    for (const f of result.files.slice(0, 30)) {
      lines.push(`| \`${f.file}\` | ${f.priority} | ${f.score} |`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

async function main() {
  const paths = resolveAuditPaths('type-health')
  const configAllowlist = loadCentralAllowlist('type-health')
  const scanDirs = getAuditScanDirs('type-health', paths)
  const allFiles = listAuditFiles('type-health', scanDirs)

  let config = {}
  try {
    config = JSON.parse(fs.readFileSync(paths.configPath, 'utf8'))
  } catch {
    // defaults
  }

  const allFindings = []
  const fileScores = new Map()
  let scannedCount = 0

  for (const abs of allFiles) {
    const repoPath = toRepoPath(abs, paths.projectRoot)
    scannedCount++
    const content = fs.readFileSync(abs, 'utf-8')
    const regexFindings = scanFileRegex(content, repoPath, abs, configAllowlist)

    let astFindings = []
    const isTs = abs.endsWith('.ts') || abs.endsWith('.tsx')
    const isVue = abs.endsWith('.vue')
    if (isTs || isVue) {
      let scriptContent = content
      let lineOffset = 0
      if (isVue) {
        const extracted = extractVueScriptWithLineOffset(content)
        if (extracted) {
          scriptContent = extracted.scriptContent
          lineOffset = extracted.startLineInFile
        } else {
          scriptContent = ''
        }
      }
      if (scriptContent.trim().length > 0) {
        const virtualPath = isVue ? abs.replace(/\.vue$/, '.vue.ts') : abs
        const { sourceFile, getLine } = await createSourceFileFromContent(virtualPath, scriptContent, { lineOffset })
        const getLineText = (lineNum) => content.split('\n')[lineNum - 1] ?? ''
        astFindings = await collectAstFindings(sourceFile, getLine, repoPath, getLineText, configAllowlist)
      }
    }

    const merged = [...regexFindings, ...astFindings]
    for (const f of merged) {
      const isExported = f.isFileLevel
        ? true
        : (f.isExported ?? regexFindingIsExported(content, f.lineNumber, f.ruleId))
      const lineText = content.split('\n')[f.lineNumber - 1] ?? ''
      const typeName = extractEnclosingTypeName(lineText)
      const usageCount = f.isFileLevel
        ? countFileFanIn(repoPath, allFiles, paths.projectRoot)
        : (typeName ? countTypeConsumers(typeName, allFiles) : 0)
      const enriched = {
        ...f,
        isExported,
        usageCount,
      }
      allFindings.push(enriched)
      const score = (fileScores.get(repoPath) || 0) + (RULE_WEIGHTS[f.ruleId] ?? 1)
      fileScores.set(repoPath, score)
    }
  }

  const files = Array.from(fileScores.entries())
    .map(([file, score]) => ({
      file,
      score,
      priority: assignPriority(score, config),
    }))
    .sort((a, b) => b.score - a.score)

  const repairWaves = buildRepairWaves(allFindings)

  const ruleset = Object.entries(RULE_META).map(([ruleId, meta]) => ({
    ruleId,
    label: ruleId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    severity: meta.severity,
    description: meta.description,
    recommendedFix: meta.recommendedFix,
  }))

  const result = {
    instructionsForAi: AUDIT_REPORT_AI_INSTRUCTIONS_COMBINED,
    generatedAt: new Date().toISOString(),
    totalScanned: scannedCount,
    ruleset,
    findings: allFindings,
    files,
    repairWaves,
  }

  const md = renderMarkdownReport(result)
  const { outJson, outMd } = writeAuditReports('type-health', result, md)

  console.log(`Wrote:\n- ${toRepoPath(outJson, paths.projectRoot)}\n- ${toRepoPath(outMd, paths.projectRoot)}`)
  console.log(`Findings: ${allFindings.length} (files with findings: ${files.length})`)
  process.exitCode = 0
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
