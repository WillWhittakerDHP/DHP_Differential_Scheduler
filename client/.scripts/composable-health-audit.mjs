/* eslint-disable security/detect-non-literal-regexp */
/**
 * Composable-Health Audit
 *
 * Surfaces structural anti-patterns in Vue composables: missing return types,
 * oversized return surfaces, module-level reactive state, excessive composable
 * imports, spread-return passthrough, untyped provide, facade passthrough,
 * watcher-without-dispose, and barrel re-exports.
 *
 * Two-pass: regex for literal patterns (5 rules), AST for structural analysis (5 rules).
 * Enriches findings with isExported and consumerCount for repair-wave prioritization.
 *
 * Output: .audit-reports/composable-health-audit.json, .audit-reports/composable-health-audit.md
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
  forEachDescendant,
  loadTsMorph,
} from './shared-ast-facade.mjs'

const RULE_WEIGHTS = {
  'module-level-ref': 0,
  'module-level-reactive': 0,
  'excessive-composable-imports': 2,
  'spread-return': 0,
  'untyped-provide': 2,
  'missing-return-type': 3,
  'oversized-return': 2,
  'watcher-no-scope-dispose': 0,
  'facade-passthrough': 0,
  're-export-barrel': 1,
}

const REGEX_RULES = [
  { ruleId: 'module-level-ref', pattern: /\b(?:ref|shallowRef)\s*\(/g, message: 'Module-level reactive state; verify singleton intent or move into composable body' },
  { ruleId: 'module-level-reactive', pattern: /\b(?:reactive|shallowReactive)\s*\(/g, message: 'Module-level reactive state; verify singleton intent or move into composable body' },
  { ruleId: 'excessive-composable-imports', pattern: /from\s+['"]@\/composables\//g, message: 'High composable fan-out; consider decomposing or using a focused facade' },
  { ruleId: 'spread-return', pattern: /return\s*\{\s*\.\.\./g, message: 'Spread-return from sub-composable; verify the passthrough adds value' },
  { ruleId: 'untyped-provide', pattern: /provide\(\s*['"]/g, message: 'String-keyed provide(); use a typed InjectionKey for type safety' },
]

const RULE_META = {
  'module-level-ref': { severity: 'info', description: 'Module-level ref/shallowRef before composable declaration', recommendedFix: 'If singleton is intentional, add @audit-allow comment. Otherwise move ref() inside the composable function.' },
  'module-level-reactive': { severity: 'info', description: 'Module-level reactive/shallowReactive before composable declaration', recommendedFix: 'If singleton is intentional, add @audit-allow comment. Otherwise move reactive() inside the composable function.' },
  'excessive-composable-imports': { severity: 'P1', description: 'File imports 6+ composable modules', recommendedFix: 'Decompose into smaller focused composables or introduce a facade' },
  'spread-return': { severity: 'info', description: 'Spread-return from sub-composable', recommendedFix: 'If the composable only adds 1-2 properties on top of the spread, consumers could import the sub-composable directly' },
  'untyped-provide': { severity: 'P1', description: 'String-keyed provide() without InjectionKey', recommendedFix: 'Create const MyKey: InjectionKey<MyType> = Symbol("MyKey") and use provide(MyKey, value)' },
  'missing-return-type': { severity: 'P0', description: 'Exported composable missing explicit return type', recommendedFix: 'Add an explicit return type annotation to satisfy the workspace explicit-return-types rule' },
  'oversized-return': { severity: 'P1', description: 'Composable return surface has 10+ properties', recommendedFix: 'Decompose into focused composables that each return a smaller, cohesive API surface' },
  'watcher-no-scope-dispose': { severity: 'info', description: 'Composable creates watchers without onScopeDispose', recommendedFix: 'Safe in setup() but may leak in standalone EffectScope usage; add onScopeDispose if used outside setup()' },
  'facade-passthrough': { severity: 'info', description: 'Facade passthrough composable with no transformation', recommendedFix: 'Consider whether the indirection adds value or if consumers should import the sub-composable directly' },
  're-export-barrel': { severity: 'P2', description: 'File only re-exports from other composable files', recommendedFix: 'Merge re-exports into source or consumer to reduce indirection' },
}

function toRepoPath(p, projectRoot) {
  return toRepoPathUtil(p, projectRoot)
}

function snippetFromLine(line, maxLen = 80) {
  const trimmed = line.trim()
  return trimmed.length > maxLen ? trimmed.slice(0, maxLen - 3) + '...' : trimmed
}

/**
 * Find the 1-based line number of the first composable declaration in the file.
 * Looks for `export function use` or `export const use`.
 */
function findFirstComposableLine(lines) {
  for (let i = 0; i < lines.length; i++) {
    if (/export\s+(function|const)\s+use[A-Z]/.test(lines[i])) {
      return i + 1
    }
  }
  return lines.length + 1
}

/**
 * Regex scan: match REGEX_RULES with composable-specific logic.
 * module-level-ref/reactive only flag lines BEFORE the first composable declaration.
 * excessive-composable-imports is file-level (count >= 6).
 */
function scanFileRegex(content, repoPath, absPath, configAllowlist) {
  const lines = content.split('\n')
  const findings = []
  const composableStartLine = findFirstComposableLine(lines)

  let composableImportCount = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    for (const rule of REGEX_RULES) {
      if (rule.pattern.global) rule.pattern.lastIndex = 0

      if (rule.ruleId === 'excessive-composable-imports') {
        const matches = [...line.matchAll(rule.pattern)]
        composableImportCount += matches.length
        continue
      }

      if (rule.ruleId === 'module-level-ref' || rule.ruleId === 'module-level-reactive') {
        if (lineNum >= composableStartLine) continue
        if (/^\s*(\/\/|\/\*|\*)/.test(line)) continue
        if (/import\s/.test(line)) continue
      }

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

  if (composableImportCount >= 6) {
    const result = checkConfigAllowlist(repoPath, 'excessive-composable-imports', 1, configAllowlist)
    if (!result.allowed) {
      findings.push({
        file: repoPath,
        lineNumber: 1,
        ruleId: 'excessive-composable-imports',
        snippet: `${composableImportCount} composable imports`,
        message: `High composable fan-out (${composableImportCount} imports); consider decomposing or using a focused facade`,
        fixHint: RULE_META['excessive-composable-imports']?.recommendedFix,
        isFileLevel: true,
      })
    }
  }

  return findings
}

/**
 * Count how many files import a given composable function name.
 */
function countComposableConsumers(composableName, allAbsPaths) {
  const escaped = composableName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const needle = new RegExp(
    `import\\s+\\{[^}]*\\b${escaped}\\b|import\\s+${escaped}\\b`
  )
  let count = 0
  for (const abs of allAbsPaths) {
    try {
      const c = fs.readFileSync(abs, 'utf8')
      if (needle.test(c)) count += 1
    } catch {
      // skip unreadable
    }
  }
  return count
}

/**
 * Count how many files import from a given file path (heuristic: path stem in import from).
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
      const c = fs.readFileSync(abs, 'utf8')
      if (needle.test(c)) count += 1
    } catch {
      // skip
    }
  }
  return count
}

/**
 * Heuristic: is this line part of an exported declaration?
 */
function regexFindingIsExported(content, lineNumber) {
  const lines = content.split('\n')
  const idx = lineNumber - 1
  for (let i = idx; i >= Math.max(0, idx - 5); i--) {
    const line = lines[i] ?? ''
    if (/^\s*export\s+(function|const|default)\b/.test(line)) return true
    if (/^\s*(function|const)\s+use[A-Z]/.test(line) && i < idx) break
  }
  return false
}

/**
 * Extract composable function name from a line (best-effort).
 */
function extractComposableName(line) {
  const match = line.match(/(?:export\s+)?(?:function|const)\s+(use[A-Za-z0-9_]+)/)
  return match ? match[1] : null
}

/**
 * AST analysis: missing-return-type, oversized-return, watcher-no-scope-dispose,
 * facade-passthrough, re-export-barrel.
 */
async function collectAstFindings(sourceFile, getLine, repoPath, getLineText, configAllowlist) {
  const { SyntaxKind } = await loadTsMorph()
  const findings = []
  const statements = sourceFile.getStatements()

  // ── File-level: re-export barrel check ──
  let allStatementsAreReExports = true
  for (const stmt of statements) {
    const kind = stmt.getKind()
    if (kind !== SyntaxKind.ExportDeclaration) {
      allStatementsAreReExports = false
      break
    }
    if (!stmt.getModuleSpecifier?.()) {
      allStatementsAreReExports = false
      break
    }
  }
  if (allStatementsAreReExports && statements.length > 0) {
    const lineNum = getLine(statements[0])
    const result = checkConfigAllowlist(repoPath, 're-export-barrel', lineNum, configAllowlist)
    if (!result.allowed) {
      findings.push({
        file: repoPath,
        lineNumber: lineNum,
        ruleId: 're-export-barrel',
        snippet: snippetFromLine(getLineText(lineNum)),
        message: RULE_META['re-export-barrel'].description,
        fixHint: RULE_META['re-export-barrel'].recommendedFix,
        isFileLevel: true,
      })
    }
  }

  // ── File-level: watcher-no-scope-dispose check ──
  let hasWatcher = false
  let hasScopeDispose = false
  forEachDescendant(sourceFile, (node) => {
    const kind = node.getKind()
    if (kind === SyntaxKind.CallExpression) {
      const exprText = node.getExpression?.().getText?.() ?? ''
      if (exprText === 'watch' || exprText === 'watchEffect') hasWatcher = true
      if (exprText === 'onScopeDispose') hasScopeDispose = true
    }
  })
  if (hasWatcher && !hasScopeDispose) {
    const result = checkConfigAllowlist(repoPath, 'watcher-no-scope-dispose', 1, configAllowlist)
    if (!result.allowed) {
      findings.push({
        file: repoPath,
        lineNumber: 1,
        ruleId: 'watcher-no-scope-dispose',
        snippet: 'watch()/watchEffect() without onScopeDispose',
        message: RULE_META['watcher-no-scope-dispose'].description,
        fixHint: RULE_META['watcher-no-scope-dispose'].recommendedFix,
        isFileLevel: true,
      })
    }
  }

  // ── Node-level traversal (single pass) ──
  forEachDescendant(sourceFile, (node) => {
    const kind = node.getKind()

    // FunctionDeclaration: missing-return-type + facade-passthrough
    if (kind === SyntaxKind.FunctionDeclaration) {
      const name = node.getName?.() ?? ''
      if (name.startsWith('use') && node.isExported?.()) {
        // missing-return-type
        if (!node.getReturnTypeNode?.()) {
          const lineNum = getLine(node)
          const result = checkConfigAllowlist(repoPath, 'missing-return-type', lineNum, configAllowlist)
          if (!result.allowed) {
            findings.push({
              file: repoPath,
              lineNumber: lineNum,
              ruleId: 'missing-return-type',
              snippet: snippetFromLine(getLineText(lineNum)),
              message: RULE_META['missing-return-type'].description,
              fixHint: RULE_META['missing-return-type'].recommendedFix,
              isExported: true,
              composableName: name,
            })
          }
        }

        // facade-passthrough: body has <= 3 statements, one is a composable call, return is that value
        const body = node.getBody?.()
        if (body) {
          const bodyStatements = body.getStatements?.() ?? []
          if (bodyStatements.length <= 3 && bodyStatements.length >= 1) {
            let composableCallVar = null
            let hasReturnOfVar = false
            let hasReturnSpread = false
            for (const stmt of bodyStatements) {
              const stmtKind = stmt.getKind()
              if (stmtKind === SyntaxKind.VariableStatement) {
                const decls = stmt.getDeclarationList?.()?.getDeclarations?.() ?? []
                for (const d of decls) {
                  const init = d.getInitializer?.()
                  if (init?.getKind?.() === SyntaxKind.CallExpression) {
                    const callName = init.getExpression?.().getText?.() ?? ''
                    if (callName.startsWith('use')) {
                      composableCallVar = d.getName?.()
                    }
                  }
                }
              }
              if (stmtKind === SyntaxKind.ReturnStatement && composableCallVar) {
                const expr = stmt.getExpression?.()
                if (expr) {
                  const exprText = expr.getText?.() ?? ''
                  if (exprText === composableCallVar) hasReturnOfVar = true
                  if (exprText.startsWith(`{ ...${composableCallVar}`)) hasReturnSpread = true
                }
              }
            }
            if (composableCallVar && (hasReturnOfVar || hasReturnSpread)) {
              const lineNum = getLine(node)
              const result = checkConfigAllowlist(repoPath, 'facade-passthrough', lineNum, configAllowlist)
              if (!result.allowed) {
                findings.push({
                  file: repoPath,
                  lineNumber: lineNum,
                  ruleId: 'facade-passthrough',
                  snippet: snippetFromLine(getLineText(lineNum)),
                  message: RULE_META['facade-passthrough'].description,
                  fixHint: RULE_META['facade-passthrough'].recommendedFix,
                  isExported: true,
                  composableName: name,
                })
              }
            }
          }
        }
      }
    }

    // VariableDeclaration with arrow function: missing-return-type
    if (kind === SyntaxKind.VariableDeclaration) {
      const name = node.getName?.() ?? ''
      if (name.startsWith('use')) {
        const init = node.getInitializer?.()
        const isArrow = init?.getKind?.() === SyntaxKind.ArrowFunction
        if (isArrow) {
          const parent = node.getParent?.()?.getParent?.()
          const isExported = parent?.isExported?.() === true
          if (isExported && !init.getReturnTypeNode?.()) {
            const lineNum = getLine(node)
            const result = checkConfigAllowlist(repoPath, 'missing-return-type', lineNum, configAllowlist)
            if (!result.allowed) {
              findings.push({
                file: repoPath,
                lineNumber: lineNum,
                ruleId: 'missing-return-type',
                snippet: snippetFromLine(getLineText(lineNum)),
                message: RULE_META['missing-return-type'].description,
                fixHint: RULE_META['missing-return-type'].recommendedFix,
                isExported: true,
                composableName: name,
              })
            }
          }
        }
      }
    }

    // ReturnStatement: oversized-return (if inside use* function)
    if (kind === SyntaxKind.ReturnStatement) {
      const expr = node.getExpression?.()
      if (expr?.getKind?.() === SyntaxKind.ObjectLiteralExpression) {
        const propCount = expr.getProperties?.()?.length ?? 0
        if (propCount >= 10) {
          let enclosingFn = node.getParent?.()
          while (enclosingFn && enclosingFn.getKind?.() !== SyntaxKind.FunctionDeclaration && enclosingFn.getKind?.() !== SyntaxKind.ArrowFunction) {
            enclosingFn = enclosingFn.getParent?.()
          }
          if (enclosingFn) {
            let fnName = ''
            if (enclosingFn.getKind?.() === SyntaxKind.FunctionDeclaration) {
              fnName = enclosingFn.getName?.() ?? ''
            } else if (enclosingFn.getKind?.() === SyntaxKind.ArrowFunction) {
              const varDecl = enclosingFn.getParent?.()
              fnName = varDecl?.getName?.() ?? ''
            }
            if (fnName.startsWith('use')) {
              const lineNum = getLine(node)
              const result = checkConfigAllowlist(repoPath, 'oversized-return', lineNum, configAllowlist)
              if (!result.allowed) {
                findings.push({
                  file: repoPath,
                  lineNumber: lineNum,
                  ruleId: 'oversized-return',
                  snippet: `Return surface has ${propCount} properties`,
                  message: `Return surface has ${propCount} properties; decompose into focused composables`,
                  fixHint: RULE_META['oversized-return'].recommendedFix,
                  isExported: enclosingFn.isExported?.() === true || enclosingFn.getParent?.()?.getParent?.()?.isExported?.() === true,
                  composableName: fnName,
                })
              }
            }
          }
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
    const usage = f.consumerCount ?? 0
    if (!exp || usage === 0) local.push(idx)
    else if (usage >= 4) highFanIn.push(idx)
    else lowFanIn.push(idx)
  })
  return { local, lowFanIn, highFanIn }
}

function renderMarkdownReport(result) {
  const lines = []
  lines.push('# Composable-Health Audit (Generated)')
  lines.push('')
  lines.push(...getAuditReportHeaderLines())
  lines.push('')
  lines.push('This file is generated by `client/.scripts/composable-health-audit.mjs`.')
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
  lines.push('| Rule | Severity | Count |')
  lines.push('| --- | --- | ---: |')
  for (const [ruleId, count] of Object.entries(byRule).sort((a, b) => b[1] - a[1])) {
    const severity = RULE_META[ruleId]?.severity ?? 'info'
    lines.push(`| ${ruleId} | ${severity} | ${count} |`)
  }
  lines.push('')

  const waves = result.repairWaves ?? { local: [], lowFanIn: [], highFanIn: [] }
  lines.push('## Repair Waves')
  lines.push('')
  lines.push(`- **Local** (not exported or zero consumers): ${waves.local?.length ?? 0} — fix with zero cascade.`)
  lines.push(`- **Low fan-in** (exported, 1–3 consumers): ${waves.lowFanIn?.length ?? 0} — fix composable then consumers in same pass.`)
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
    lines.push('| File | Line | Rule | consumerCount |')
    lines.push('| --- | ---: | --- | ---: |')
    for (const f of topHigh) {
      lines.push(`| \`${f.file}\` | ${f.lineNumber} | ${f.ruleId} | ${f.consumerCount ?? 0} |`)
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
  const paths = resolveAuditPaths('composable-health')
  const configAllowlist = loadCentralAllowlist('composable-health')
  const scanDirs = getAuditScanDirs('composable-health', paths)
  const allFiles = listAuditFiles('composable-health', scanDirs)

  // Broader file list for consumer counting (all .ts/.vue files in src/)
  const broadScanDirs = getAuditScanDirs('type-health', paths)
  const broadFiles = listAuditFiles('type-health', broadScanDirs)

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
    if (abs.endsWith('.ts') || abs.endsWith('.tsx')) {
      if (content.trim().length > 0) {
        const { sourceFile, getLine } = await createSourceFileFromContent(abs, content)
        const getLineText = (lineNum) => content.split('\n')[lineNum - 1] ?? ''
        astFindings = await collectAstFindings(sourceFile, getLine, repoPath, getLineText, configAllowlist)
      }
    }

    const merged = [...regexFindings, ...astFindings]
    for (const f of merged) {
      const isExported = f.isFileLevel
        ? true
        : (f.isExported ?? regexFindingIsExported(content, f.lineNumber))
      const composableName = f.composableName ?? extractComposableName(content.split('\n')[f.lineNumber - 1] ?? '')
      const consumerCount = f.isFileLevel
        ? countFileFanIn(repoPath, broadFiles, paths.projectRoot)
        : (composableName ? countComposableConsumers(composableName, broadFiles) : 0)
      const enriched = {
        ...f,
        isExported,
        consumerCount,
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
  const { outJson, outMd } = writeAuditReports('composable-health', result, md)

  console.log(`Wrote:\n- ${toRepoPath(outJson, paths.projectRoot)}\n- ${toRepoPath(outMd, paths.projectRoot)}`)
  console.log(`Findings: ${allFindings.length} (files with findings: ${files.length})`)
  process.exitCode = 0
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
