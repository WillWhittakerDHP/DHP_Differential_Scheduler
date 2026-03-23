import fs from 'node:fs'
import path from 'node:path'
import {
  getAuditReportHeaderLines,
  loadCentralAllowlist,
  listAuditFiles,
  resolveAuditPaths,
  writeAuditReports,
  toRepoPath as toRepoPathUtil,
  checkConfigAllowlist,
  checkLinePatternAllowlist,
  parseInlineExceptions,
  checkInlineException,
} from './shared-audit-utils.mjs'

/**
 * Unused Code Audit Script
 *
 * Goal: Detect unused exports, functions, and abandoned code in client/src
 * to identify cleanup opportunities and reduce technical debt.
 *
 * Scope:
 * - Included: client/src directory (all .ts, .js, .vue files)
 * - Excluded: __tests__, test files, spec files, @core, @layouts
 *
 * Output:
 * - client/.audit-reports/unused-code-audit.json
 * - client/.audit-reports/unused-code-audit.md
 *
 * Notes:
 * - Heuristic/regex-based approach (consistent with other audits)
 * - May have false positives - manual review required
 * - Supports config-based allowlist for known exceptions (glob patterns, linePatterns on export lines)
 * - unused-function: nested helpers listed on a top-level `return { ... }` inside an exported `use*`
 *   composable are treated as used (Vue consumers bind via destructuring; TS return types before `{` are skipped).
 *   Limitation: return types containing `{` before the function body brace may confuse `indexOf('{', ...)`.
 */

const AUDIT_TYPE = 'unused-code'
const _paths = resolveAuditPaths(AUDIT_TYPE)
const PROJECT_ROOT = _paths.projectRoot
const SERVER_ROOT = _paths.serverRoot

function toRepoPath(absPath, projectRoot) {
  return toRepoPathUtil(absPath, projectRoot)
}

/**
 * Extract exported names from a file
 */
function extractExports(content) {
  const exports = []
  
  // Named exports: export function name, export const name, export async function name
  const functionExports = content.matchAll(/export\s+(async\s+)?function\s+(\w+)/g)
  for (const match of functionExports) {
    exports.push({ name: match[2], type: 'function', line: null })
  }
  
  const constExports = content.matchAll(/export\s+const\s+(\w+)/g)
  for (const match of constExports) {
    exports.push({ name: match[1], type: 'const', line: null })
  }
  
  // Type exports
  const typeExports = content.matchAll(/export\s+(type|interface)\s+(\w+)/g)
  for (const match of typeExports) {
    exports.push({ name: match[2], type: 'type', line: null })
  }
  
  // Class exports
  const classExports = content.matchAll(/export\s+class\s+(\w+)/g)
  for (const match of classExports) {
    exports.push({ name: match[1], type: 'class', line: null })
  }
  
  // Default exports (track but don't check usage - too many false positives)
  // export default ...
  
  return exports
}

/**
 * Check if an export is used in other files
 */
function isExportUsed(exportName, allFiles, currentFile) {
  for (const file of allFiles) {
    if (file === currentFile) continue
    
    try {
      const content = fs.readFileSync(file, 'utf-8')
      // Check for import statements
      // eslint-disable-next-line security/detect-non-literal-regexp
      const importPattern = new RegExp(`import\\s+.*\\b${exportName}\\b.*from`, 's')
      // eslint-disable-next-line security/detect-non-literal-regexp
      const namedImportPattern = new RegExp(`import\\s*\\{[^}]*\\b${exportName}\\b[^}]*\\}`, 's')
      // eslint-disable-next-line security/detect-non-literal-regexp
      const typeImportPattern = new RegExp(`import\\s+type\\s+.*\\b${exportName}\\b`, 's')
      
      if (importPattern.test(content) || namedImportPattern.test(content) || typeImportPattern.test(content)) {
        return true
      }
    } catch (_error) {
      // Skip files we can't read
    }
  }
  
  return false
}

/**
 * Extract function declarations (non-exported)
 */
function extractFunctions(content) {
  const functions = []
  const lines = content.split('\n')
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // Match function declarations (not exports, not methods)
    const funcMatch = line.match(/^\s*(async\s+)?function\s+(\w+)\s*\(/)
    if (funcMatch && !line.includes('export')) {
      functions.push({ name: funcMatch[2], line: i + 1 })
    }
    
    // Match arrow function assignments (const name = ...)
    const arrowMatch = line.match(/^\s*const\s+(\w+)\s*=\s*(async\s+)?\([^)]*\)\s*=>/)
    if (arrowMatch && !line.includes('export')) {
      functions.push({ name: arrowMatch[1], line: i + 1 })
    }
  }
  
  return functions
}

/**
 * Skip a string or template literal starting at index i (opening quote already consumed position i).
 * @returns {number} index after closing quote
 */
function skipQuotedString(s, i) {
  const q = s[i]
  if (q !== '"' && q !== "'" && q !== '`') return i + 1
  i++
  while (i < s.length) {
    const c = s[i]
    if (c === '\\') {
      i += 2
      continue
    }
    if (q === '`' && c === '$' && s[i + 1] === '{') {
      let j = i + 2
      let depth = 1
      while (j < s.length && depth > 0) {
        if (s[j] === '{') depth++
        else if (s[j] === '}') depth--
        j++
      }
      i = j
      continue
    }
    if (c === q) return i + 1
    i++
  }
  return s.length
}

/**
 * Given '(' at openIdx, return index immediately after matching ')'.
 */
function skipBalancedParens(s, openIdx) {
  if (s[openIdx] !== '(') return -1
  let depth = 0
  let i = openIdx
  while (i < s.length) {
    const c = s[i]
    if (c === '"' || c === "'" || c === '`') {
      i = skipQuotedString(s, i)
      continue
    }
    if (c === '/' && s[i + 1] === '/') {
      i = s.indexOf('\n', i)
      if (i === -1) return -1
      i++
      continue
    }
    if (c === '/' && s[i + 1] === '*') {
      const end = s.indexOf('*/', i + 2)
      i = end === -1 ? s.length : end + 2
      continue
    }
    if (c === '(') depth++
    else if (c === ')') {
      depth--
      if (depth === 0) return i + 1
    }
    i++
  }
  return -1
}

/**
 * Given '{' at openIdx, return { inner, end } where inner excludes outer braces, end is index of closing '}'.
 */
function extractBalancedBraces(s, openIdx) {
  if (s[openIdx] !== '{') return null
  let depth = 0
  let i = openIdx
  while (i < s.length) {
    const c = s[i]
    if (c === '"' || c === "'" || c === '`') {
      i = skipQuotedString(s, i)
      continue
    }
    if (c === '/' && s[i + 1] === '/') {
      i = s.indexOf('\n', i)
      if (i === -1) return null
      i++
      continue
    }
    if (c === '/' && s[i + 1] === '*') {
      const end = s.indexOf('*/', i + 2)
      i = end === -1 ? s.length : end + 2
      continue
    }
    if (c === '{') depth++
    else if (c === '}') {
      depth--
      if (depth === 0) {
        return { inner: s.slice(openIdx + 1, i), end: i }
      }
    }
    i++
  }
  return null
}

/**
 * Collect object literal bodies from `return { ... }` at composable body depth 0 (not inside nested blocks).
 */
function collectTopLevelReturnObjectLiterals(composableBodyInner) {
  /** @type {string[]} */
  const literals = []
  const s = composableBodyInner
  let depth = 0
  let i = 0
  while (i < s.length) {
    const c = s[i]
    if (c === '"' || c === "'" || c === '`') {
      i = skipQuotedString(s, i)
      continue
    }
    if (c === '/' && s[i + 1] === '/') {
      const nl = s.indexOf('\n', i)
      i = nl === -1 ? s.length : nl + 1
      continue
    }
    if (c === '/' && s[i + 1] === '*') {
      const end = s.indexOf('*/', i + 2)
      i = end === -1 ? s.length : end + 2
      continue
    }
    if (c === '{') {
      depth++
      i++
      continue
    }
    if (c === '}') {
      depth = Math.max(0, depth - 1)
      i++
      continue
    }
    if (depth === 0 && s.startsWith('return', i)) {
      const before = i > 0 ? s[i - 1] : ' '
      if (/\w/.test(before)) {
        i++
        continue
      }
      const afterKw = i + 'return'.length
      if (afterKw < s.length && /\w/.test(s[afterKw])) {
        i++
        continue
      }
      let k = afterKw
      while (k < s.length && /\s/.test(s[k])) k++
      if (s[k] === '{') {
        const block = extractBalancedBraces(s, k)
        if (block) {
          literals.push(block.inner)
          i = block.end + 1
          continue
        }
      }
    }
    i++
  }
  return literals
}

/**
 * True if identifier appears as an own property of a return object (shorthand or value).
 */
function isIdentifierInReturnObjectLiteral(objInner, identifier) {
  const esc = identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  /* eslint-disable security/detect-non-literal-regexp */
  // Shorthand properties: start of line (after {) or after comma; allow indentation (m).
  const shorthand = new RegExp(`(^|,)\\s*${esc}\\s*(?=\\s*[,}])`, 'm')
  const asValue = new RegExp(`\\b[A-Za-z_$][\\w$]*\\s*:\\s*${esc}\\b`)
  /* eslint-enable security/detect-non-literal-regexp */
  return shorthand.test(objInner) || asValue.test(objInner)
}

const EXPORT_USE_COMPOSABLE_HEAD = /export\s+(async\s+)?function\s+(use[A-Z]\w*)/g

/**
 * Position of '(' starting the composable parameter list (after optional TypeScript generics).
 */
function findComposableParamsOpenParen(content, searchFrom) {
  let i = searchFrom
  let angle = 0
  while (i < content.length) {
    const c = content[i]
    if (c === '"' || c === "'" || c === '`') {
      i = skipQuotedString(content, i)
      continue
    }
    if (c === '/' && content[i + 1] === '/') {
      const nl = content.indexOf('\n', i)
      i = nl === -1 ? content.length : nl + 1
      continue
    }
    if (c === '/' && content[i + 1] === '*') {
      const end = content.indexOf('*/', i + 2)
      i = end === -1 ? content.length : end + 2
      continue
    }
    if (c === '<') angle++
    else if (c === '>') angle = Math.max(0, angle - 1)
    else if (c === '(' && angle === 0) return i
    i++
  }
  return -1
}

/**
 * Composable handlers passed through return { handleFoo, ... } are used from Vue templates via
 * destructuring; the naive call-count check flags them as unused. Treat as used when the name
 * appears on a top-level return object literal inside an exported use* function.
 *
 * @param {string} content - full file text
 * @param {string} funcName
 * @param {string} repoPath - repo-relative path for scoping (composables-heavy)
 * @returns {boolean}
 */
function isIdentifierReturnedFromUseComposable(content, funcName, repoPath) {
  const normalized = repoPath.replaceAll('\\', '/')
  const looksComposableFile =
    normalized.includes('/composables/') || /export\s+(async\s+)?function\s+use[A-Z]/.test(content)
  if (!looksComposableFile) return false

  EXPORT_USE_COMPOSABLE_HEAD.lastIndex = 0
  let m
  while ((m = EXPORT_USE_COMPOSABLE_HEAD.exec(content)) !== null) {
    const afterName = m.index + m[0].length
    const openParen = findComposableParamsOpenParen(content, afterName)
    if (openParen < 0) continue
    const afterParams = skipBalancedParens(content, openParen)
    if (afterParams < 0) continue
    let j = afterParams
    while (j < content.length && /\s/.test(content[j])) j++
    // TypeScript: ): ReturnType { — skip annotation before function body `{`
    if (content[j] === ':') {
      const bodyOpen = content.indexOf('{', j + 1)
      if (bodyOpen === -1) continue
      j = bodyOpen
    }
    if (content[j] !== '{') continue
    const bodyBlock = extractBalancedBraces(content, j)
    if (!bodyBlock) continue
    const returnObjects = collectTopLevelReturnObjectLiterals(bodyBlock.inner)
    for (const objText of returnObjects) {
      if (isIdentifierInReturnObjectLiteral(objText, funcName)) {
        return true
      }
    }
  }
  return false
}

/**
 * Extract the template section from a Vue SFC for usage checks.
 * Returns content between the root <template> and its matching </template>.
 * Uses lastIndexOf('</template>') so nested <template #slot>...</template> slots
 * do not truncate the root template (Vue SFC has one root template block).
 */
function extractVueTemplateSection(content) {
  const templateStart = content.indexOf('<template')
  if (templateStart === -1) return null
  const afterTemplateTag = content.indexOf('>', templateStart) + 1
  const lastTemplateClose = content.lastIndexOf('</template>')
  if (lastTemplateClose === -1) return null
  return content.slice(afterTemplateTag, lastTemplateClose)
}

/**
 * Check if a function name is referenced in Vue template (event handlers, prop bindings).
 * Matches @event="funcName", :prop="funcName", "funcName", 'funcName' in template section only.
 */
function isFuncReferencedInVueTemplate(funcName, templateSection) {
  if (!templateSection || !funcName) return false
  // Escape for regex: only word chars expected in function names
  const escaped = funcName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  /* eslint-disable security/detect-non-literal-regexp */
  const quotedDouble = new RegExp(`["']\\s*${escaped}\\s*["']`)
  const quotedSingle = new RegExp(`['"]\\s*${escaped}\\s*['"]`)
  const eventBindingDouble = new RegExp(`@\\w+\\s*=\\s*["']\\s*${escaped}\\s*["']`)
  const eventBindingSingle = new RegExp(`@\\w+\\s*=\\s*['"]\\s*${escaped}\\s*['"]`)
  const propBinding = new RegExp(`:\\w+\\s*=\\s*["']\\s*${escaped}\\s*["']`)
  /* eslint-enable security/detect-non-literal-regexp */
  return (
    quotedDouble.test(templateSection) ||
    quotedSingle.test(templateSection) ||
    eventBindingDouble.test(templateSection) ||
    eventBindingSingle.test(templateSection) ||
    propBinding.test(templateSection)
  )
}

/**
 * Check if a function is called in the file or other files
 */
function isFunctionUsed(funcName, allFiles, currentFile) {
  // First check current file
  try {
    const currentContent = fs.readFileSync(currentFile, 'utf-8')
    // Check for function calls (but not declarations)
    // eslint-disable-next-line security/detect-non-literal-regexp
    const callPattern = new RegExp(`\\b${funcName}\\s*\\(`, 'g')
    // eslint-disable-next-line security/detect-non-literal-regexp
    const declarationPattern = new RegExp(`(function|const)\\s+${funcName}`, 'g')
    
    const calls = currentContent.match(callPattern) || []
    const declarations = currentContent.match(declarationPattern) || []
    
    // If there are more calls than declarations, it's used
    if (calls.length > declarations.length) {
      return true
    }

    // Vue SFC: treat as used if template references the handler (e.g. @click="handleCreate")
    if (currentFile.endsWith('.vue') && currentContent.includes('<template')) {
      const templateSection = extractVueTemplateSection(currentContent)
      if (templateSection && isFuncReferencedInVueTemplate(funcName, templateSection)) {
        return true
      }
    }
  } catch (_error) {
    // Skip if can't read
  }
  
  // Check other files
  for (const file of allFiles) {
    if (file === currentFile) continue
    
    try {
      const content = fs.readFileSync(file, 'utf-8')
      // eslint-disable-next-line security/detect-non-literal-regexp
      const callPattern = new RegExp(`\\b${funcName}\\s*\\(`, 'g')
      if (callPattern.test(content)) {
        return true
      }
    } catch (_error) {
      // Skip files we can't read
    }
  }
  
  return false
}

/**
 * Load pattern-detection data if available
 */
function loadPatternDetectionData(outDir) {
  try {
    const patternJson = path.join(outDir, 'pattern-detection-audit.json')
    if (fs.existsSync(patternJson)) {
      const data = JSON.parse(fs.readFileSync(patternJson, 'utf8'))
      return data.aggregated || null
    }
  } catch (_error) {
    // Pattern-detection not run or invalid
  }
  return null
}

/**
 * Load hardcoding audit data if available
 */
function loadHardcodingData(outDir) {
  try {
    const hardcodingJson = path.join(outDir, 'hardcoding-audit.json')
    if (fs.existsSync(hardcodingJson)) {
      const data = JSON.parse(fs.readFileSync(hardcodingJson, 'utf8'))
      return data.files || null
    }
  } catch (_error) {
    // Hardcoding audit not run or invalid
  }
  return null
}

/**
 * Load typecheck audit data if available
 */
function loadTypecheckData(outDir) {
  try {
    const typecheckJson = path.join(outDir, 'typecheck', 'typecheck-audit.json')
    if (fs.existsSync(typecheckJson)) {
      const data = JSON.parse(fs.readFileSync(typecheckJson, 'utf8'))
      // Extract files with P0/P1 errors
      const errorFiles = new Set()
      if (data.errors) {
        for (const error of data.errors) {
          if (error.priority === 'P0' || error.priority === 'P1') {
            errorFiles.add(error.file)
          }
        }
      }
      return errorFiles.size > 0 ? errorFiles : null
    }
  } catch (_error) {
    // Typecheck audit not run or invalid
  }
  return null
}

/**
 * Check if an export is found in pattern-detection data
 */
function isExportInPatternDetection(exportName, patternData) {
  if (!patternData) return false
  
  // Check type definitions
  if (patternData.typeDefinitions && patternData.typeDefinitions[exportName]) {
    return true
  }
  
  // Check function patterns (extract name from pattern like "useAvailability" -> "Availability")
  if (patternData.functionPatterns) {
    for (const [pattern, _data] of Object.entries(patternData.functionPatterns)) {
      if (pattern.includes(exportName) || exportName.includes(pattern.replace(/^(use|get|create|update|delete)/, ''))) {
        return true
      }
    }
  }
  
  return false
}

/**
 * Scan a file for unused code patterns
 */
function scanFile(filePath, allFiles, configAllowlist, patternData, _hardcodingData, _typecheckErrorFiles, projectRoot) {
  const issues = []
  const repoPath = toRepoPath(filePath, projectRoot)
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')
    
    // Check inline exceptions (per-line: comment on line above or same line)
    const inlineExceptions = parseInlineExceptions(content, AUDIT_TYPE)
    
    // Extract exports and check if they're used
    const exports = extractExports(content)
    for (const exp of exports) {
      // Find line number
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(`export`) && lines[i].includes(exp.name)) {
          exp.line = i + 1
          break
        }
      }
      
      // Check allowlist (config and per-line inline)
      if (checkConfigAllowlist(repoPath, 'unused-export', exp.line || 1, configAllowlist).allowed) {
        continue
      }
      if (checkInlineException(exp.line || 1, 'unused-export', inlineExceptions).allowed) {
        continue
      }

      const exportLineContent = lines[exp.line - 1]?.trim() || ''
      if (
        configAllowlist?.linePatterns?.length > 0 &&
        checkLinePatternAllowlist(exportLineContent, 'unused-export', configAllowlist.linePatterns).allowed
      ) {
        continue
      }
      
      // Prioritize exports found in pattern-detection (they're more likely to be actual exports)
      const isInPatternDetection = patternData ? isExportInPatternDetection(exp.name, patternData) : false
      
      if (!isExportUsed(exp.name, allFiles, filePath)) {
        issues.push({
          severity: 'warning',
          type: 'unused-export',
          message: `Unused export: ${exp.name} (${exp.type})`,
          file: repoPath,
          line: exp.line || 1,
          code: lines[exp.line - 1]?.trim() || '',
          suggestion: 'Remove if unused or document why kept',
          fromPatternDetection: isInPatternDetection, // Flag for prioritization
        })
      }
    }
    
    // Check for commented-out exports
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      
      // Check allowlist (config and per-line inline)
      if (checkConfigAllowlist(repoPath, 'commented-export', i + 1, configAllowlist).allowed) {
        continue
      }
      if (checkInlineException(i + 1, 'commented-export', inlineExceptions).allowed) {
        continue
      }
      
      // Detect commented export
      if ((trimmed.startsWith('// export') || trimmed.startsWith('/* export') || trimmed.startsWith('* export')) &&
          (trimmed.includes('function') || trimmed.includes('const') || trimmed.includes('class'))) {
        issues.push({
          severity: 'info',
          type: 'commented-export',
          message: 'Commented-out export found',
          file: repoPath,
          line: i + 1,
          code: trimmed.length > 100 ? trimmed.substring(0, 100) + '...' : trimmed,
          suggestion: 'Review and either uncomment or remove',
        })
      }
    }
    
    // Check for unused functions (non-exported)
    const functions = extractFunctions(content)
    for (const func of functions) {
      // Check allowlist (config and per-line inline)
      if (checkConfigAllowlist(repoPath, 'unused-function', func.line, configAllowlist).allowed) {
        continue
      }
      if (checkInlineException(func.line, 'unused-function', inlineExceptions).allowed) {
        continue
      }
      
      if (!isFunctionUsed(func.name, allFiles, filePath)) {
        if (isIdentifierReturnedFromUseComposable(content, func.name, repoPath)) {
          continue
        }
        issues.push({
          severity: 'info',
          type: 'unused-function',
          message: `Unused function: ${func.name}`,
          file: repoPath,
          line: func.line,
          code: lines[func.line - 1]?.trim() || '',
          suggestion: 'Remove if unused or document why kept',
        })
      }
    }
    
    // Check for TODO/FIXME markers about unused code
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lowerLine = line.toLowerCase()
      
      // Check allowlist (config and per-line inline)
      if (checkConfigAllowlist(repoPath, 'todo-marker', i + 1, configAllowlist).allowed) {
        continue
      }
      if (checkInlineException(i + 1, 'todo-marker', inlineExceptions).allowed) {
        continue
      }
      
      if (lowerLine.includes('todo: remove') || 
          lowerLine.includes('fixme: unused') || 
          lowerLine.includes('todo: delete') ||
          lowerLine.includes('todo: cleanup')) {
        issues.push({
          severity: 'info',
          type: 'todo-marker',
          message: 'TODO/FIXME marker about unused code',
          file: repoPath,
          line: i + 1,
          code: line.trim().length > 100 ? line.trim().substring(0, 100) + '...' : line.trim(),
          suggestion: 'Review and clean up unused code',
        })
      }
    }
    
  } catch (_error) {
    issues.push({
      severity: 'error',
      type: 'scan-error',
      message: `Failed to scan file: ${_error instanceof Error ? _error.message : String(_error)}`,
      file: repoPath,
    })
  }
  
  return issues
}

/**
 * Detect dead scripts in server/src/scripts/
 *
 * A "dead script" is a standalone file in server/src/scripts/ that is:
 *   1. NOT referenced in any package.json npm script
 *   2. NOT imported by any other file in the codebase
 *
 * These are typically one-off data fixup/backfill/check scripts that have
 * already been executed and serve no ongoing purpose. Git history preserves
 * them if ever needed for reference.
 */
function detectDeadScripts(allFiles) {
  const scriptsDir = path.join(SERVER_ROOT, 'src', 'scripts')
  if (!fs.existsSync(scriptsDir)) return []

  // Load all package.json files to check for script references
  const packageJsonPaths = [
    path.join(PROJECT_ROOT, 'package.json'),
    path.join(PROJECT_ROOT, 'server', 'package.json'),
    path.join(PROJECT_ROOT, 'client', 'package.json'),
  ]

  const packageScriptContents = packageJsonPaths
    .filter(p => fs.existsSync(p))
    .map(p => {
      try {
        const pkg = JSON.parse(fs.readFileSync(p, 'utf8'))
        return Object.values(pkg.scripts || {}).join('\n')
      } catch {
        return ''
      }
    })
    .join('\n')

  // List all script files (recursive, including helpers/)
  const scriptFiles = listAuditFiles('unused-code', [scriptsDir])
  const findings = []

  for (const absPath of scriptFiles) {
    const repoPath = toRepoPath(absPath, PROJECT_ROOT)
    const basename = path.basename(absPath)
    const basenameNoExt = basename.replace(/\.(ts|js|mjs|mts)$/, '')

    // Check 1: Is this script referenced in any package.json?
    // Scripts can be referenced as src/scripts/name.ext or dist/scripts/name.js
    const isInPackageJson =
      packageScriptContents.includes(`scripts/${basename}`) ||
      packageScriptContents.includes(`scripts/${basenameNoExt}.js`)

    if (isInPackageJson) continue

    // Check 2: Is this file imported by any other file?
    // Check all script files AND all codebase files for imports referencing this basename.
    // Handles absolute paths (scripts/name), relative paths (./helpers/name), and
    // TypeScript ESM imports that use .js extension for .ts files
    const allScriptFiles = listAuditFiles('unused-code', [scriptsDir])
    const filesToCheck = [...new Set([...allFiles, ...allScriptFiles])]
    const isImported = filesToCheck.some(otherFile => {
      if (otherFile === absPath) return false
      try {
        const content = fs.readFileSync(otherFile, 'utf-8')
        if (!content.includes(basenameNoExt)) return false
        if (!content.includes('from') && !content.includes('require')) return false
        // Match import path ending with the basename (with or without any extension)
        // Covers: /name', /name", /name.ts', /name.js', /name.mjs', etc.
        // eslint-disable-next-line security/detect-non-literal-regexp
        const importPattern = new RegExp(`/${basenameNoExt}(\\.\\w+)?['"]`)
        return importPattern.test(content)
      } catch {
        return false
      }
    })

    if (isImported) continue

    // This script is unreferenced -- flag it
    findings.push({
      severity: 'warning',
      type: 'dead-script',
      message: `Unreferenced script: ${basename} - not used by any package.json script or imported by other files`,
      file: repoPath,
      line: 1,
      code: '',
      suggestion: 'Delete this script (git history preserves it). One-off scripts that have already run add noise to audits and the codebase.',
    })
  }

  return findings
}

function calculateScore(issues) {
  // Scoring: dead scripts = 5, unused exports = 3, commented exports = 2, unused functions = 1, TODO markers = 1
  return issues.reduce((sum, issue) => {
    if (issue.type === 'dead-script') return sum + 5
    if (issue.type === 'unused-export') return sum + 3
    if (issue.type === 'commented-export') return sum + 2
    if (issue.type === 'unused-function') return sum + 1
    if (issue.type === 'todo-marker') return sum + 1
    return sum
  }, 0)
}

function assignPriority(score, config) {
  const p0Min = Number(config?.priorities?.p0MinSeverityScore ?? 10)
  const p1Min = Number(config?.priorities?.p1MinSeverityScore ?? 5)
  
  if (score >= p0Min) return 'P0'
  if (score >= p1Min) return 'P1'
  return 'P2'
}

function renderMarkdownReport(filesWithPriority, issues, summary, totalFiles) {
  const lines = []
  lines.push(...getAuditReportHeaderLines())
  lines.push('# Unused Code Audit (Generated)')
  lines.push('')
  lines.push('This file is generated by `client/.scripts/unused-code-audit.mjs`.')
  lines.push('')
  lines.push('Scope: `client/src/**/*.{ts,js,vue}` and `server/src/**/*.{ts,mjs}`')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Files scanned: **${totalFiles}**`)
  if (summary.skippedFilesCount > 0) {
    lines.push(`- Files skipped (type errors): **${summary.skippedFilesCount}**`)
  }
  lines.push(`- Files with issues: **${filesWithPriority.length}**`)
  lines.push(`- Issues found: **${issues.length}**`)
  lines.push(`- Unused exports: ${issues.filter(i => i.type === 'unused-export').length}`)
  lines.push(`- Commented exports: ${issues.filter(i => i.type === 'commented-export').length}`)
  lines.push(`- Unused functions: ${issues.filter(i => i.type === 'unused-function').length}`)
  lines.push(`- TODO markers: ${issues.filter(i => i.type === 'todo-marker').length}`)
  lines.push(`- Dead scripts: ${issues.filter(i => i.type === 'dead-script').length}`)
  if (summary.usingPatternDetection) {
    lines.push(`- Using pattern-detection data: **Yes** (prioritizing exports found by pattern-detection)`)
  }
  lines.push('')
  
  if (issues.length === 0) {
    lines.push('✅ No unused code patterns found')
    lines.push('')
    return lines.join('\n')
  }
  
  lines.push('## Issues by File (sorted by priority)')
  lines.push('')
  
  // Sort files by priority (P0 first, then P1, then P2), then by score
  const priorityOrder = { P0: 0, P1: 1, P2: 2 }
  const sortedFiles = filesWithPriority.sort((a, b) => {
    const aPriority = priorityOrder[a.priority] ?? 2
    const bPriority = priorityOrder[b.priority] ?? 2
    if (aPriority !== bPriority) return aPriority - bPriority
    return b.score - a.score
  })
  
  for (const fileData of sortedFiles) {
    lines.push(`### \`${fileData.repoPath}\` [${fileData.priority}] (score: ${fileData.score})`)
    lines.push('')
    for (const issue of fileData.issues) {
      lines.push(`- **${issue.severity.toUpperCase()}** [${issue.type}] (line ${issue.line}): ${issue.message}`)
      if (issue.code) {
        lines.push('  ```')
        lines.push(`  ${issue.code}`)
        lines.push('  ```')
      }
      if (issue.suggestion) {
        lines.push(`  💡 ${issue.suggestion}`)
      }
      lines.push('')
    }
  }
  
  return lines.join('\n')
}

function main() {
  // Load config
  const configAllowlist = loadCentralAllowlist('unused-code')
  let priorityConfig = {}
  try {
    const configRaw = fs.readFileSync(_paths.configPath, 'utf8')
    priorityConfig = JSON.parse(configRaw)
  } catch (_error) {
    // Config might not exist or be invalid, use defaults
  }
  
  // Load data from other audits for pipeline optimization
  const patternData = loadPatternDetectionData()
  const hardcodingData = loadHardcodingData()
  const typecheckErrorFiles = loadTypecheckData(_paths.outDir)
  
  let skippedFilesCount = 0
  
  const issues = []
  const recommendations = []
  const filesWithIssues = new Map()
  let totalFiles = 0
  let clientCount = 0
  let serverCount = 0
  
  try {
    // List all files from both client and server
    const allFiles = listAuditFiles(AUDIT_TYPE, [_paths.clientSrc, _paths.serverSrc])
    
    if (allFiles.length === 0) {
      issues.push({
        severity: 'info',
        type: 'no-files',
        message: 'No files found in client/src or server/src directories',
        file: '',
      })
    }
    
    // Scan each file
    for (const file of allFiles) {
      const repoPath = toRepoPath(file, _paths.projectRoot)
      const fileIssues = scanFile(
        file,
        allFiles,
        configAllowlist,
        patternData,
        hardcodingData,
        typecheckErrorFiles,
        _paths.projectRoot
      )
      issues.push(...fileIssues)
      
      if (fileIssues.length > 0) {
        filesWithIssues.set(repoPath, fileIssues)
      }
    }
    
    // Detect dead scripts in server/src/scripts/
    const deadScriptFindings = detectDeadScripts(allFiles)
    issues.push(...deadScriptFindings)
    for (const finding of deadScriptFindings) {
      const repoPath = finding.file
      if (!filesWithIssues.has(repoPath)) {
        filesWithIssues.set(repoPath, [])
      }
      filesWithIssues.get(repoPath).push(finding)
    }

    // Generate recommendations
    const unusedExportsCount = issues.filter(i => i.type === 'unused-export').length
    const commentedCount = issues.filter(i => i.type === 'commented-export').length
    const unusedFuncCount = issues.filter(i => i.type === 'unused-function').length
    const todoCount = issues.filter(i => i.type === 'todo-marker').length
    const deadScriptCount = issues.filter(i => i.type === 'dead-script').length
    
    if (unusedExportsCount > 0) {
      recommendations.push(`Found ${unusedExportsCount} unused export(s) - review for removal`)
    }
    if (commentedCount > 0) {
      recommendations.push(`Found ${commentedCount} commented-out export(s) - review and clean up`)
    }
    if (unusedFuncCount > 0) {
      recommendations.push(`Found ${unusedFuncCount} unused function(s) - review for removal`)
    }
    if (todoCount > 0) {
      recommendations.push(`Found ${todoCount} TODO/FIXME marker(s) about unused code - review and clean up`)
    }
    if (deadScriptCount > 0) {
      recommendations.push(`Found ${deadScriptCount} dead script(s) in server/src/scripts/ - delete unreferenced one-off scripts (git preserves history)`)
    }
    
    if (issues.length === 0) {
      recommendations.push('No unused code patterns found')
    }
    
    totalFiles = allFiles.length
    clientCount = allFiles.filter(f => f.startsWith(_paths.clientSrc)).length
    serverCount = allFiles.filter(f => f.startsWith(_paths.serverSrc)).length
  } catch (_error) {
    issues.push({
      severity: 'error',
      type: 'scan-error',
      message: `Failed to audit files: ${_error instanceof Error ? _error.message : String(_error)}`,
      file: '',
    })
  }
  
  // Determine status
  const hasWarnings = issues.some(i => i.severity === 'warning')
  const hasErrors = issues.some(i => i.severity === 'error')
  
  let status = 'pass'
  if (hasErrors) {
    status = 'error'
  } else if (hasWarnings) {
    status = 'warning'
  }
  
  // Calculate priority for each file with issues
  const filesWithPriority = Array.from(filesWithIssues.entries()).map(([repoPath, fileIssues]) => {
    const fileScore = calculateScore(fileIssues)
    const filePriority = assignPriority(fileScore, priorityConfig)
    return {
      repoPath,
      issues: fileIssues,
      score: fileScore,
      priority: filePriority,
    }
  })
  
  const deadScripts = issues.filter(i => i.type === 'dead-script').length
  const summaryText = `Scanned ${totalFiles} file(s) (${clientCount} client, ${serverCount} server). Found ${issues.length} issue(s): ${issues.filter(i => i.type === 'unused-export').length} unused exports, ${issues.filter(i => i.type === 'commented-export').length} commented exports, ${issues.filter(i => i.type === 'unused-function').length} unused functions, ${issues.filter(i => i.type === 'todo-marker').length} TODO markers, ${deadScripts} dead scripts`
  
  const summary = {
    totalFiles,
    skippedFilesCount,
    filesWithIssues: filesWithPriority.length,
    totalIssues: issues.length,
    unusedExports: issues.filter(i => i.type === 'unused-export').length,
    commentedExports: issues.filter(i => i.type === 'commented-export').length,
    unusedFunctions: issues.filter(i => i.type === 'unused-function').length,
    todoMarkers: issues.filter(i => i.type === 'todo-marker').length,
    deadScripts,
    usingPatternDetection: !!patternData,
    usingHardcoding: !!hardcodingData,
    usingTypecheck: !!typecheckErrorFiles,
  }
  
  const output = {
    generatedAt: new Date().toISOString(),
    check: 'Unused Code',
    status,
    issues,
    files: filesWithPriority,
    recommendations,
    summary: summaryText,
    summaryData: summary,
  }
  
  const { outJson, outMd } = writeAuditReports(AUDIT_TYPE, output, renderMarkdownReport(filesWithPriority, issues, summary, totalFiles))

  const skippedMsg = skippedFilesCount > 0 ? `, Skipped: ${skippedFilesCount} (type errors)` : ''
  const pipelineMsg = (patternData || hardcodingData || typecheckErrorFiles) ? ', Using pipeline data' : ''
  console.log(`Wrote:\n- ${toRepoPath(outJson, _paths.projectRoot)}\n- ${toRepoPath(outMd, _paths.projectRoot)}\nFiles scanned: ${totalFiles} (${clientCount} client, ${serverCount} server)${skippedMsg}${pipelineMsg}, Issues: ${issues.length}`)
}

main()
