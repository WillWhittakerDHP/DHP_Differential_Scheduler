import fs from 'node:fs'
import path from 'node:path'
import { loadConfigAllowlist, checkConfigAllowlist, parseInlineExceptions, checkInlineException, isCompiledJsFile, isGloballyExcluded } from './audit-exceptions.mjs'

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
 * - Supports config-based allowlist for known exceptions
 */

const AUDIT_TYPE = 'unused-code'

// Detect if we're running from client/ or project root
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
const OUT_JSON = path.join(OUT_DIR, 'unused-code-audit.json')
const OUT_MD = path.join(OUT_DIR, 'unused-code-audit.md')
const CONFIG_PATH = path.join(OUT_DIR, 'unused-code-audit-config.json')

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

function toRepoPath(absPath) {
  return path.relative(PROJECT_ROOT, absPath).replaceAll(path.sep, '/')
}

function isScannable(absPath) {
  return absPath.endsWith('.ts') || absPath.endsWith('.js') || absPath.endsWith('.vue') || absPath.endsWith('.mjs')
}

function isExcluded(repoPath) {
  if (isGloballyExcluded(repoPath)) return true
  if (repoPath.includes('/types/')) return true
  if (repoPath.endsWith('.d.ts')) return true
  return false
}

/**
 * Recursively list all TypeScript/JavaScript/Vue/MJS files
 */
function listFilesRecursive(dir) {
  const files = []
  if (!fs.existsSync(dir)) return files
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      const repoPath = toRepoPath(fullPath)
      
      // Skip excluded directories/files
      if (isExcluded(repoPath)) {
        continue
      }
      
      if (entry.isDirectory()) {
        files.push(...listFilesRecursive(fullPath))
      } else if (entry.isFile() && isScannable(fullPath) && !isCompiledJsFile(fullPath)) {
        files.push(fullPath)
      }
    }
  } catch (_error) {
    // Directory might not exist or be inaccessible
  }
  
  return files
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
  const quotedDouble = new RegExp(`["']\\s*${escaped}\\s*["']`)
  const quotedSingle = new RegExp(`['"]\\s*${escaped}\\s*['"]`)
  const eventBindingDouble = new RegExp(`@\\w+\\s*=\\s*["']\\s*${escaped}\\s*["']`)
  const eventBindingSingle = new RegExp(`@\\w+\\s*=\\s*['"]\\s*${escaped}\\s*['"]`)
  const propBinding = new RegExp(`:\\w+\\s*=\\s*["']\\s*${escaped}\\s*["']`)
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
function loadPatternDetectionData() {
  try {
    const patternJson = path.join(OUT_DIR, 'pattern-detection-audit.json')
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
function loadHardcodingData() {
  try {
    const hardcodingJson = path.join(OUT_DIR, 'hardcoding-audit.json')
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
function loadTypecheckData() {
  try {
    const typecheckJson = path.join(OUT_DIR, 'typecheck', 'typecheck-audit.json')
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
function scanFile(filePath, allFiles, configAllowlist, patternData, _hardcodingData, _typecheckErrorFiles) {
  const issues = []
  const repoPath = toRepoPath(filePath)
  
  if (isExcluded(repoPath)) {
    return issues
  }
  
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
  const scriptFiles = listScriptFiles(scriptsDir)
  const findings = []

  for (const absPath of scriptFiles) {
    const repoPath = toRepoPath(absPath)
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
    const allScriptFiles = listScriptFiles(scriptsDir)
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

/**
 * Recursively list script files in a directory
 */
function listScriptFiles(dir) {
  const files = []
  if (!fs.existsSync(dir)) return files
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        files.push(...listScriptFiles(full))
      } else if (entry.isFile() && isScannable(full) && !isCompiledJsFile(full)) {
        files.push(full)
      }
    }
  } catch {
    // Skip unreadable dirs
  }
  return files
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
  ensureDir(OUT_DIR)
  
  // Load config
  const configAllowlist = loadConfigAllowlist(CONFIG_PATH)
  let priorityConfig = {}
  try {
    const configRaw = fs.readFileSync(CONFIG_PATH, 'utf8')
    priorityConfig = JSON.parse(configRaw)
  } catch (_error) {
    // Config might not exist or be invalid, use defaults
  }
  
  // Load data from other audits for pipeline optimization
  const patternData = loadPatternDetectionData()
  const hardcodingData = loadHardcodingData()
  const typecheckErrorFiles = loadTypecheckData()
  
  let skippedFilesCount = 0
  
  const issues = []
  const recommendations = []
  const filesWithIssues = new Map()
  
  try {
    // List all files from both client and server
    const clientFiles = listFilesRecursive(CLIENT_SRC)
    const serverFiles = listFilesRecursive(SERVER_SRC)
    const allFiles = [...clientFiles, ...serverFiles]
    
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
      const repoPath = toRepoPath(file)
      // Double-check exclusion (in case file listing missed it)
      if (isExcluded(repoPath)) {
        continue
      }
      
      const fileIssues = scanFile(file, allFiles, configAllowlist)
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
  
  const clientFiles = listFilesRecursive(CLIENT_SRC)
  const serverFiles = listFilesRecursive(SERVER_SRC)
  const totalFiles = clientFiles.length + serverFiles.length
  
  const deadScripts = issues.filter(i => i.type === 'dead-script').length
  const summaryText = `Scanned ${totalFiles} file(s) (${clientFiles.length} client, ${serverFiles.length} server). Found ${issues.length} issue(s): ${issues.filter(i => i.type === 'unused-export').length} unused exports, ${issues.filter(i => i.type === 'commented-export').length} commented exports, ${issues.filter(i => i.type === 'unused-function').length} unused functions, ${issues.filter(i => i.type === 'todo-marker').length} TODO markers, ${deadScripts} dead scripts`
  
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
  
  fs.writeFileSync(OUT_JSON, JSON.stringify(output, null, 2))
  fs.writeFileSync(OUT_MD, renderMarkdownReport(filesWithPriority, issues, summary, totalFiles))
  
  const skippedMsg = skippedFilesCount > 0 ? `, Skipped: ${skippedFilesCount} (type errors)` : ''
  const pipelineMsg = (patternData || hardcodingData || typecheckErrorFiles) ? ', Using pipeline data' : ''
  console.log(`Wrote:\n- ${toRepoPath(OUT_JSON)}\n- ${toRepoPath(OUT_MD)}\nFiles scanned: ${totalFiles} (${clientFiles.length} client, ${serverFiles.length} server)${skippedMsg}${pipelineMsg}, Issues: ${issues.length}`)
}

main()
