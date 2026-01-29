import fs from 'node:fs'
import path from 'node:path'
import { loadConfigAllowlist, checkConfigAllowlist, parseInlineExceptions } from './audit-exceptions.mjs'

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
const CLIENT_SRC = path.join(CWD, 'src')
const PROJECT_ROOT_SRC = path.join(CWD, 'client', 'src')

const IS_CLIENT_DIR = fs.existsSync(CLIENT_SRC)
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD
const SRC_DIR = IS_CLIENT_DIR ? CLIENT_SRC : PROJECT_ROOT_SRC

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
  return absPath.endsWith('.ts') || absPath.endsWith('.js') || absPath.endsWith('.vue')
}

function isExcluded(repoPath) {
  // Exclude test files and directories
  if (repoPath.includes('__tests__') || repoPath.includes('.test.') || repoPath.includes('.spec.')) {
    return true
  }
  // Exclude @core and @layouts
  if (repoPath.includes('@core/') || repoPath.includes('@layouts/')) {
    return true
  }
  return false
}

/**
 * Recursively list all TypeScript/JavaScript/Vue files
 */
function listFilesRecursive(dir) {
  const files = []
  if (!fs.existsSync(dir)) return files
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        files.push(...listFilesRecursive(fullPath))
      } else if (entry.isFile() && isScannable(fullPath)) {
        files.push(fullPath)
      }
    }
  } catch (error) {
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
      const importPattern = new RegExp(`import\\s+.*\\b${exportName}\\b.*from`, 's')
      const namedImportPattern = new RegExp(`import\\s*\\{[^}]*\\b${exportName}\\b[^}]*\\}`, 's')
      const typeImportPattern = new RegExp(`import\\s+type\\s+.*\\b${exportName}\\b`, 's')
      
      if (importPattern.test(content) || namedImportPattern.test(content) || typeImportPattern.test(content)) {
        return true
      }
    } catch (error) {
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
 * Check if a function is called in the file or other files
 */
function isFunctionUsed(funcName, allFiles, currentFile) {
  // First check current file
  try {
    const currentContent = fs.readFileSync(currentFile, 'utf-8')
    // Check for function calls (but not declarations)
    const callPattern = new RegExp(`\\b${funcName}\\s*\\(`, 'g')
    const declarationPattern = new RegExp(`(function|const)\\s+${funcName}`, 'g')
    
    const calls = currentContent.match(callPattern) || []
    const declarations = currentContent.match(declarationPattern) || []
    
    // If there are more calls than declarations, it's used
    if (calls.length > declarations.length) {
      return true
    }
  } catch (error) {
    // Skip if can't read
  }
  
  // Check other files
  for (const file of allFiles) {
    if (file === currentFile) continue
    
    try {
      const content = fs.readFileSync(file, 'utf-8')
      const callPattern = new RegExp(`\\b${funcName}\\s*\\(`, 'g')
      if (callPattern.test(content)) {
        return true
      }
    } catch (error) {
      // Skip files we can't read
    }
  }
  
  return false
}

/**
 * Scan a file for unused code patterns
 */
function scanFile(filePath, allFiles, configAllowlist) {
  const issues = []
  const repoPath = toRepoPath(filePath)
  
  if (isExcluded(repoPath)) {
    return issues
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')
    
    // Check inline exceptions
    const inlineExceptions = parseInlineExceptions(content, AUDIT_TYPE)
    const exceptionRuleIds = new Set(inlineExceptions.map(e => e.ruleId))
    
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
      
      // Check allowlist
      if (checkConfigAllowlist(repoPath, 'unused-export', exp.line || 1, configAllowlist).allowed) {
        continue
      }
      if (exceptionRuleIds.has('unused-export')) {
        continue
      }
      
      if (!isExportUsed(exp.name, allFiles, filePath)) {
        issues.push({
          severity: 'warning',
          type: 'unused-export',
          message: `Unused export: ${exp.name} (${exp.type})`,
          file: repoPath,
          line: exp.line || 1,
          code: lines[exp.line - 1]?.trim() || '',
          suggestion: 'Remove if unused or document why kept',
        })
      }
    }
    
    // Check for commented-out exports
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      
      // Check allowlist
      if (checkConfigAllowlist(repoPath, 'commented-export', i + 1, configAllowlist).allowed) {
        continue
      }
      if (exceptionRuleIds.has('commented-export')) {
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
      // Check allowlist
      if (checkConfigAllowlist(repoPath, 'unused-function', func.line, configAllowlist).allowed) {
        continue
      }
      if (exceptionRuleIds.has('unused-function')) {
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
      
      // Check allowlist
      if (checkConfigAllowlist(repoPath, 'todo-marker', i + 1, configAllowlist).allowed) {
        continue
      }
      if (exceptionRuleIds.has('todo-marker')) {
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
    
  } catch (error) {
    issues.push({
      severity: 'error',
      type: 'scan-error',
      message: `Failed to scan file: ${error instanceof Error ? error.message : String(error)}`,
      file: repoPath,
    })
  }
  
  return issues
}

function calculateScore(issues) {
  // Scoring: unused exports = 3, commented exports = 2, unused functions = 1, TODO markers = 1
  return issues.reduce((sum, issue) => {
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
  lines.push('Scope: `client/src/**/*.{ts,js,vue}`')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Files scanned: **${totalFiles}**`)
  lines.push(`- Files with issues: **${filesWithPriority.length}**`)
  lines.push(`- Issues found: **${issues.length}**`)
  lines.push(`- Unused exports: ${issues.filter(i => i.type === 'unused-export').length}`)
  lines.push(`- Commented exports: ${issues.filter(i => i.type === 'commented-export').length}`)
  lines.push(`- Unused functions: ${issues.filter(i => i.type === 'unused-function').length}`)
  lines.push(`- TODO markers: ${issues.filter(i => i.type === 'todo-marker').length}`)
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
  } catch (error) {
    // Config might not exist or be invalid, use defaults
  }
  
  const issues = []
  const recommendations = []
  const filesWithIssues = new Map()
  
  try {
    // List all files
    const allFiles = listFilesRecursive(SRC_DIR)
    
    if (allFiles.length === 0) {
      issues.push({
        severity: 'info',
        type: 'no-files',
        message: 'No files found in src directory',
        file: toRepoPath(SRC_DIR),
      })
    }
    
    // Scan each file
    for (const file of allFiles) {
      const fileIssues = scanFile(file, allFiles, configAllowlist)
      issues.push(...fileIssues)
      
      if (fileIssues.length > 0) {
        const repoPath = toRepoPath(file)
        filesWithIssues.set(repoPath, fileIssues)
      }
    }
    
    // Generate recommendations
    const unusedExportsCount = issues.filter(i => i.type === 'unused-export').length
    const commentedCount = issues.filter(i => i.type === 'commented-export').length
    const unusedFuncCount = issues.filter(i => i.type === 'unused-function').length
    const todoCount = issues.filter(i => i.type === 'todo-marker').length
    
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
    
    if (issues.length === 0) {
      recommendations.push('No unused code patterns found')
    }
    
  } catch (error) {
    issues.push({
      severity: 'error',
      type: 'scan-error',
      message: `Failed to audit files: ${error instanceof Error ? error.message : String(error)}`,
      file: toRepoPath(SRC_DIR),
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
  
  const allFiles = listFilesRecursive(SRC_DIR)
  const summary = `Scanned ${allFiles.length} file(s). Found ${issues.length} issue(s): ${issues.filter(i => i.type === 'unused-export').length} unused exports, ${issues.filter(i => i.type === 'commented-export').length} commented exports, ${issues.filter(i => i.type === 'unused-function').length} unused functions, ${issues.filter(i => i.type === 'todo-marker').length} TODO markers`
  
  const output = {
    generatedAt: new Date().toISOString(),
    check: 'Unused Code',
    status,
    issues,
    files: filesWithPriority,
    recommendations,
    summary,
  }
  
  fs.writeFileSync(OUT_JSON, JSON.stringify(output, null, 2))
  fs.writeFileSync(OUT_MD, renderMarkdownReport(filesWithPriority, issues, summary, allFiles.length))
  
  console.log(`Wrote:\n- ${toRepoPath(OUT_JSON)}\n- ${toRepoPath(OUT_MD)}\nFiles scanned: ${allFiles.length}, Issues: ${issues.length}`)
}

main()
