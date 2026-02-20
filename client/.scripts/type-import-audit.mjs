import fs from 'node:fs'
import path from 'node:path'
import {
  loadCentralAllowlist,
  listAuditFiles,
  resolveAuditPaths,
  writeAuditReports,
  toRepoPath as toRepoPathUtil,
  checkConfigAllowlist,
  parseChangedOnlyFlag,
  AUDIT_REPORT_AI_INSTRUCTIONS_COMBINED,
  getAuditReportHeaderLines,
} from './shared-audit-utils.mjs'

/**
 * Type-Import Audit Script
 *
 * Surfaces type-only import consistency issues:
 *   - value-import-from-type-only-file: value import from a file that exports only types
 *   - type-used-as-value: symbol imported as "import type" but used in value position
 *
 * Scope: client/src and server/src (.ts, .tsx, .vue). For .vue, scan <script> only.
 *
 * Output: .audit-reports/type-import-audit.json, .audit-reports/type-import-audit.md
 */

const EXTENSIONS = ['.ts', '.tsx', '.vue', '.js']

function toRepoPath(p, projectRoot) { return toRepoPathUtil(p, projectRoot) }

function extractScriptContent(content, absPath) {
  if (!absPath.endsWith('.vue')) return content
  const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/i)
  return scriptMatch ? scriptMatch[1] : ''
}

/** Resolve specifier to absolute path of source file, or null if not under client/src or server/src */
function resolveSpecifierToAbs(specifier, importerAbs, importerClientSrc) {
  if (specifier.startsWith('.')) {
    const base = path.resolve(path.dirname(importerAbs), specifier)
    for (const ext of EXTENSIONS) {
      const candidate = base.endsWith(ext) ? base : base + ext
      if (fs.existsSync(candidate)) return candidate
    }
    const noExt = base.replace(/\.(ts|tsx|vue|mjs|js)$/, '')
    for (const ext of EXTENSIONS) {
      const candidate = noExt + ext
      if (fs.existsSync(candidate)) return candidate
    }
    return null
  }
  if (specifier.startsWith('@/')) {
    const base = path.join(importerClientSrc, specifier.substring(2).replace(/\.(ts|tsx|vue|mjs|js)$/, ''))
    for (const ext of EXTENSIONS) {
      const candidate = base + ext
      if (fs.existsSync(candidate)) return candidate
    }
    return null
  }
  return null
}

/** Heuristic: does this file export only types (no export const/function/class/default value)? */
function isTypeOnlyFile(absPath) {
  if (!fs.existsSync(absPath)) return false
  const raw = fs.readFileSync(absPath, 'utf-8')
  const content = absPath.endsWith('.vue')
    ? (raw.match(/<script[^>]*>([\s\S]*?)<\/script>/i)?.[1] ?? '')
    : raw
  const hasValueExport = /\bexport\s+(async\s+)?(const|let|var|function|class|default\s+)\b/.test(content) ||
    /\bexport\s+default\s+/.test(content) ||
    // Value re-export (export { X } from '...' but not export type { X } from '...')
    /\bexport\s+(?!type\s)\s*\{[^}]*\}\s*from\s+['"]/.test(content)
  if (hasValueExport) return false
  const hasTypeExport = /\bexport\s+type\b/.test(content) || /\bexport\s+interface\b/.test(content)
  return hasTypeExport
}

/** Extract value imports: import { X } from '...' or import X from '...' (no "type" keyword) */
function extractValueImports(content) {
  const out = []
  const re = /import\s+(?!type\s)(?:\{([^}]*)\}|(\w+))\s+from\s+['"]([^'"]+)['"]/g
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    for (const m of lines[i].matchAll(re)) {
      const specifier = m[3]
      const symbols = m[1] ? m[1].split(',').map(s => s.replace(/\s+as\s+.*$/, '').trim()).filter(Boolean) : (m[2] ? [m[2]] : [])
      out.push({ lineNumber: i + 1, specifier, symbols })
    }
  }
  return out
}

/** Extract import type { A, B } and return list of type-only symbols per line */
function extractTypeOnlyImports(content) {
  const out = []
  const re = /import\s+type\s+\{([^}]+)\}\s+from\s+['"][^'"]+['"]/g
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    for (const m of lines[i].matchAll(re)) {
      const symbols = m[1].split(',').map(s => s.replace(/\s+as\s+.*$/, '').trim()).filter(Boolean)
      out.push({ lineNumber: i + 1, symbols })
    }
  }
  return out
}

/** Heuristic: is symbol S used in a value position (new S(, S.(, S(, typeof S)? */
function findTypeUsedAsValue(content, symbol) {
  // eslint-disable-next-line security/detect-non-literal-regexp
  const re = new RegExp(`\\b${escapeRegex(symbol)}\\s*\\(|\\bnew\\s+${escapeRegex(symbol)}\\s*\\(|\\.${escapeRegex(symbol)}\\b|typeof\\s+${escapeRegex(symbol)}`, 'g')
  const lines = content.split('\n')
  const hits = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/import\s+type\s+/.test(line)) continue
    for (const _ of line.matchAll(re)) {
      hits.push(i + 1)
      break
    }
  }
  return hits
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function main() {
  const paths = resolveAuditPaths('type-import')

  const configAllowlist = loadCentralAllowlist('type-import')
  const delta = parseChangedOnlyFlag(process.argv, paths.projectRoot)

  const allFiles = listAuditFiles('type-import', [paths.clientSrc, paths.serverSrc])

  const valueImportFromTypeOnlyFile = []
  const typeUsedAsValue = []
  const fileScores = new Map()
  let scannedCount = 0

  for (const abs of allFiles) {
    const repoPath = toRepoPath(abs, paths.projectRoot)
    if (delta.enabled && !delta.changedFiles.has(repoPath)) continue

    scannedCount++
    const raw = fs.readFileSync(abs, 'utf-8')
    const content = extractScriptContent(raw, abs)

    const valueImports = extractValueImports(content)
    for (const imp of valueImports) {
      if (!imp.specifier.startsWith('.') && !imp.specifier.startsWith('@/')) continue
      const targetAbs = resolveSpecifierToAbs(imp.specifier, abs, paths.clientSrc)
      if (!targetAbs) continue
      const targetRepo = toRepoPath(targetAbs, paths.projectRoot)
      if (!targetRepo.startsWith('client/src') && !targetRepo.startsWith('server/src')) continue
      if (targetRepo.endsWith('.d.ts')) continue
      if (!isTypeOnlyFile(targetAbs)) continue
      for (const sym of imp.symbols) {
        const result = checkConfigAllowlist(repoPath, 'value-import-from-type-only-file', imp.lineNumber, configAllowlist)
        if (!result.allowed) {
          valueImportFromTypeOnlyFile.push({
            file: repoPath,
            lineNumber: imp.lineNumber,
            specifier: imp.specifier,
            symbol: sym,
            sourceFile: targetRepo,
          })
          fileScores.set(repoPath, (fileScores.get(repoPath) || 0) + 2)
        }
      }
    }

    const typeImports = extractTypeOnlyImports(content)
    for (const imp of typeImports) {
      for (const sym of imp.symbols) {
        const lineNumbers = findTypeUsedAsValue(content, sym)
        for (const lineNum of lineNumbers) {
          const result = checkConfigAllowlist(repoPath, 'type-used-as-value', lineNum, configAllowlist)
          if (!result.allowed) {
            typeUsedAsValue.push({
              file: repoPath,
              lineNumber: lineNum,
              symbol: sym,
            })
            fileScores.set(repoPath, (fileScores.get(repoPath) || 0) + 2)
          }
        }
      }
    }
  }

  const files = Array.from(fileScores.entries())
    .map(([file, score]) => ({ file, score }))
    .sort((a, b) => b.score - a.score)

  const result = {
    instructionsForAi: AUDIT_REPORT_AI_INSTRUCTIONS_COMBINED,
    generatedAt: new Date().toISOString(),
    totalScanned: scannedCount,
    ...(delta.enabled ? { deltaMode: true, baseRef: delta.baseRef } : {}),
    valueImportFromTypeOnlyFile,
    typeUsedAsValue,
    files,
  }

  const { outJson, outMd } = writeAuditReports('type-import', result, renderMarkdownReport(result))

  console.log(`Wrote:\n- ${toRepoPath(outJson, paths.projectRoot)}\n- ${toRepoPath(outMd, paths.projectRoot)}`)
  console.log(
    `value-import-from-type-only-file: ${valueImportFromTypeOnlyFile.length}, type-used-as-value: ${typeUsedAsValue.length}`
  )
  process.exitCode = 0
}

function renderMarkdownReport(data) {
  const lines = []
  lines.push('# Type-Import Audit (Generated)')
  lines.push('')
  lines.push(...getAuditReportHeaderLines())
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Files scanned: **${data.totalScanned}**`)
  lines.push(`- value-import-from-type-only-file: **${(data.valueImportFromTypeOnlyFile ?? []).length}**`)
  lines.push(`- type-used-as-value: **${(data.typeUsedAsValue ?? []).length}**`)
  lines.push('')

  if ((data.valueImportFromTypeOnlyFile ?? []).length > 0) {
    lines.push('## value-import-from-type-only-file')
    lines.push('')
    lines.push('| File | Line | Specifier | Symbol | Source |')
    lines.push('| --- | ---: | --- | --- | --- |')
    for (const f of data.valueImportFromTypeOnlyFile.slice(0, 50)) {
      lines.push(`| \`${f.file}\` | ${f.lineNumber} | \`${f.specifier}\` | ${f.symbol} | \`${f.sourceFile}\` |`)
    }
    if (data.valueImportFromTypeOnlyFile.length > 50) {
      lines.push(`| *...and ${data.valueImportFromTypeOnlyFile.length - 50} more* | | | | |`)
    }
    lines.push('')
  }

  if ((data.typeUsedAsValue ?? []).length > 0) {
    lines.push('## type-used-as-value')
    lines.push('')
    lines.push('| File | Line | Symbol |')
    lines.push('| --- | ---: | --- |')
    for (const f of data.typeUsedAsValue.slice(0, 50)) {
      lines.push(`| \`${f.file}\` | ${f.lineNumber} | ${f.symbol} |`)
    }
    if (data.typeUsedAsValue.length > 50) {
      lines.push(`| *...and ${data.typeUsedAsValue.length - 50} more* | | |`)
    }
    lines.push('')
  }

  if ((data.files ?? []).length > 0) {
    lines.push('## Files by finding count (score)')
    lines.push('')
    lines.push('| File | Score |')
    lines.push('| --- | ---: |')
    for (const f of data.files.slice(0, 25)) {
      lines.push(`| \`${f.file}\` | ${f.score} |`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

main()
