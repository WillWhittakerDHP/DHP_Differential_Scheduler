import fs from 'node:fs'
import path from 'node:path'

/**
 * Fallback Audit Script
 *
 * Goal: Scan application code for defaults, silent fallbacks, and legacy/backwards compatibility patterns
 * that should be removed for dynamic/config-driven, explicit failures, and fresh code.
 *
 * Scope:
 * - Included: client/src (ts, js, vue files) and server/src (ts, mjs files)
 * - Excluded: __tests__, test files, spec files, @core, @layouts
 *
 * Output:
 * - client/.audit-reports/fallback-audit.json
 * - client/.audit-reports/fallback-audit.md
 *
 * Notes:
 * - Intentionally line-based and heuristic (fast + deterministic).
 * - This audit should never fail CI; it reports signals for manual cleanup.
 */

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
const OUT_JSON = path.join(OUT_DIR, 'fallback-audit.json')
const OUT_MD = path.join(OUT_DIR, 'fallback-audit.md')

// Keywords to scan for
const KEYWORD_PATTERNS = [
  { keyword: 'default', label: 'Default values' },
  { keyword: 'fallback', label: 'Fallback patterns' },
  { keyword: 'legacy', label: 'Legacy code' },
  { keyword: 'compat', label: 'Backwards compatibility' },
  { keyword: 'deprecated', label: 'Deprecated code' },
  { keyword: 'silent', label: 'Silent failures' },
  { keyword: 'ignore', label: 'Error ignoring' },
]

// Patterns that indicate problematic code
const PROBLEMATIC_PATTERNS = [
  { pattern: /\?\?\s*['"`]/, label: 'Nullish coalescing with default string', severity: 'warning' },
  { pattern: /\|\|\s*['"`]/, label: 'Logical OR with default string', severity: 'warning' },
  { pattern: /catch\s*\([^)]*\)\s*\{[^}]*\}/, label: 'Empty catch block', severity: 'critical' },
  { pattern: /catch\s*\([^)]*\)\s*\{[^}]*\/\/.*\}/, label: 'Catch block with only comment', severity: 'critical' },
  { pattern: /try\s*\{[^}]*\}\s*catch[^}]*\{\s*\}/, label: 'Silent catch block', severity: 'critical' },
  { pattern: /@ts-ignore|@ts-expect-error/, label: 'Type suppression', severity: 'warning' },
  { pattern: /eslint-disable/, label: 'ESLint suppression', severity: 'warning' },
  // New patterns for default parameters, optional chaining, and config objects
  { pattern: /(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>)\s*\([^)]*=\s*['"`][^'"`]+['"`]/, label: 'Default function parameter with string literal', severity: 'warning' },
  { pattern: /\?\.\w+\s*\?\?\s*['"`\w]/, label: 'Optional chaining with default value', severity: 'warning' },
  { pattern: /\{\s*\w+\s*:\s*\w+\s*\?\?\s*['"`]/, label: 'Configuration object property with default', severity: 'warning' },
]

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

function toRepoPath(absPath) {
  return path.relative(PROJECT_ROOT, absPath).replaceAll(path.sep, '/')
}

/**
 * Check if a file should be excluded from scanning
 */
function isExcluded(repoPath) {
  // Exclude migration files (one-time scripts with intentional patterns)
  if (repoPath.includes('/migrations/') || repoPath.includes('/migration') || /migration.*\.(js|mjs|ts)$/i.test(repoPath)) {
    return true
  }
  // Exclude test files and directories (test setup often uses defaults intentionally)
  if (repoPath.includes('__tests__') || repoPath.includes('.test.') || repoPath.includes('.spec.')) {
    return true
  }
  // Exclude @core and @layouts for client files only
  if (repoPath.startsWith('client/src') && (repoPath.includes('@core/') || repoPath.includes('@layouts/'))) {
    return true
  }
  // Exclude node_modules, dist, etc.
  if (repoPath.includes('node_modules') || repoPath.includes('/dist/') || repoPath.includes('.git/')) {
    return true
  }
  return false
}

/**
 * Extract script content from Vue files
 */
function extractVueScriptBlocks(vueContent) {
  const blocks = []
  const re = /<script\b[^>]*>([\s\S]*?)<\/script>/gi
  for (const match of vueContent.matchAll(re)) {
    blocks.push(match[1] || '')
  }
  return blocks
}

/**
 * Recursively list files with specified extensions
 */
function listFilesRecursive(dirPath, extensions) {
  const files = []
  
  if (!fs.existsSync(dirPath)) {
    return files
  }
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      const repoPath = toRepoPath(fullPath)
      
      // Skip excluded directories/files
      if (isExcluded(repoPath)) {
        continue
      }
      
      if (entry.isDirectory()) {
        files.push(...listFilesRecursive(fullPath, extensions))
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name)
        if (extensions.includes(ext)) {
          files.push(fullPath)
        }
      }
    }
  } catch (_error) {
    // Directory might not exist or be inaccessible
  }
  
  return files
}

/**
 * Scan a file for keyword patterns and problematic code
 */
function scanFile(filePath) {
  const issues = []
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8')
    const repoPath = toRepoPath(filePath)
    
    // Extract script blocks from Vue files
    if (filePath.endsWith('.vue')) {
      const scriptBlocks = extractVueScriptBlocks(content)
      if (scriptBlocks.length === 0) {
        return issues // No script blocks to scan
      }
      content = scriptBlocks.join('\n') // Combine all script blocks
    }
    
    const lines = content.split('\n')
    
    // Scan for keywords
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineNumber = i + 1
      
      // Check keyword patterns (case-insensitive)
      for (const { keyword, label } of KEYWORD_PATTERNS) {
        // eslint-disable-next-line security/detect-non-literal-regexp
        const regex = new RegExp(`\\b${keyword}\\b`, 'i')
        if (regex.test(line)) {
          // Skip comments and strings to reduce false positives
          const trimmed = line.trim()
          if (!trimmed.startsWith('//') && !trimmed.startsWith('*') && !trimmed.startsWith('/*')) {
            issues.push({
              severity: 'warning',
              message: `Found "${label}" keyword: ${keyword}`,
              file: repoPath,
              line: lineNumber,
              code: trimmed.length > 100 ? trimmed.substring(0, 100) + '...' : trimmed,
              suggestion: 'Review for removal - prefer dynamic/config-driven approach or explicit failures',
            })
          }
        }
      }
      
      // Check problematic patterns
      const trimmed = line.trim()
      for (const { pattern, label, severity } of PROBLEMATIC_PATTERNS) {
        if (pattern.test(line)) {
          issues.push({
            severity,
            message: `Found ${label}`,
            file: repoPath,
            line: lineNumber,
            code: trimmed.length > 100 ? trimmed.substring(0, 100) + '...' : trimmed,
            suggestion: severity === 'critical' 
              ? 'Replace with explicit error handling - silent failures hide bugs'
              : 'Review for removal - prefer explicit error handling or type safety',
          })
        }
      }
    }
  } catch (error) {
    issues.push({
      severity: 'error',
      message: `Failed to scan file: ${error instanceof Error ? error.message : String(error)}`,
      file: toRepoPath(filePath),
    })
  }
  
  return issues
}

function calculateScore(issues) {
  // Calculate severity score: critical issues = 5 points, warnings = 1 point
  return issues.reduce((sum, issue) => {
    if (issue.severity === 'critical' || issue.severity === 'error') {
      return sum + 5
    } else if (issue.severity === 'warning') {
      return sum + 1
    }
    return sum
  }, 0)
}

function assignPriority(score, config) {
  const p0Min = Number(config?.priorities?.p0MinSeverityScore ?? 5)
  const p1Min = Number(config?.priorities?.p1MinSeverityScore ?? 2)
  
  if (score >= p0Min) return 'P0'
  if (score >= p1Min) return 'P1'
  return 'P2'
}

function renderMarkdownReport(filesWithPriority, issues, summary, totalFiles) {
  const lines = []
  lines.push('# Fallback Audit (Generated)')
  lines.push('')
  lines.push('This file is generated by `client/.scripts/fallback-audit.mjs`.')
  lines.push('')
  lines.push('Scope: `client/src` (ts, js, vue files) and `server/src` (ts, mjs files)')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Files scanned: **${totalFiles}**`)
  lines.push(`- Files with issues: **${filesWithPriority.length}**`)
  lines.push(`- Issues found: **${issues.length}**`)
  lines.push(`- Critical: ${issues.filter(i => i.severity === 'critical' || i.severity === 'error').length}`)
  lines.push(`- Warnings: ${issues.filter(i => i.severity === 'warning').length}`)
  lines.push('')
  
  if (issues.length === 0) {
    lines.push('✅ No fallback/legacy patterns found - session-tier commands are clean')
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
      lines.push(`- **${issue.severity.toUpperCase()}** (line ${issue.line}): ${issue.message}`)
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
  
  // Load priority config
  let priorityConfig = {}
  try {
    const configRaw = fs.readFileSync(path.join(OUT_DIR, 'fallback-audit-config.json'), 'utf8')
    priorityConfig = JSON.parse(configRaw)
  } catch (_error) {
    // Config might not exist or be invalid, use defaults
  }
  
  const issues = []
  const recommendations = []
  const filesWithIssues = new Map() // Track issues per file for priority calculation
  
  try {
    // List all files in client/src and server/src
    const clientFiles = listFilesRecursive(CLIENT_SRC, ['.ts', '.js', '.vue'])
    const serverFiles = listFilesRecursive(SERVER_SRC, ['.ts', '.mjs'])
    const allFiles = [...clientFiles, ...serverFiles]
    
    if (allFiles.length === 0) {
      issues.push({
        severity: 'info',
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
      
      const fileIssues = scanFile(file)
      issues.push(...fileIssues)
      
      if (fileIssues.length > 0) {
        filesWithIssues.set(repoPath, fileIssues)
      }
    }
    
    // Generate recommendations based on findings
    const criticalCount = issues.filter(i => i.severity === 'critical').length
    const warningCount = issues.filter(i => i.severity === 'warning').length
    
    if (criticalCount > 0) {
      recommendations.push(
        `Found ${criticalCount} critical issue(s) - silent failures should be replaced with explicit error handling`
      )
    }
    
    if (warningCount > 0) {
      recommendations.push(
        `Found ${warningCount} warning(s) - review defaults/fallbacks for removal in favor of dynamic/config-driven approaches`
      )
    }
    
    if (issues.length === 0) {
      recommendations.push('No fallback/legacy patterns found - session-tier commands are clean')
    }
    
  } catch (error) {
    issues.push({
      severity: 'error',
      message: `Failed to audit files: ${error instanceof Error ? error.message : String(error)}`,
      file: '',
    })
  }
  
  // Determine status
  const hasCritical = issues.some(i => i.severity === 'critical' || i.severity === 'error')
  const hasWarnings = issues.some(i => i.severity === 'warning')
  
  let status = 'pass'
  if (hasCritical) {
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
  
  const clientFiles = listFilesRecursive(CLIENT_SRC, ['.ts', '.js', '.vue'])
  const serverFiles = listFilesRecursive(SERVER_SRC, ['.ts', '.mjs'])
  const totalFiles = clientFiles.length + serverFiles.length
  
  const summary = `Scanned ${totalFiles} file(s) (${clientFiles.length} client, ${serverFiles.length} server). Found ${issues.length} issue(s): ${issues.filter(i => i.severity === 'critical' || i.severity === 'error').length} critical, ${issues.filter(i => i.severity === 'warning').length} warnings`
  
  const output = {
    generatedAt: new Date().toISOString(),
    check: 'Fallback',
    status,
    issues,
    files: filesWithPriority,
    recommendations,
    summary,
  }
  
  fs.writeFileSync(OUT_JSON, JSON.stringify(output, null, 2))
  fs.writeFileSync(OUT_MD, renderMarkdownReport(filesWithPriority, issues, summary, totalFiles))
  
  console.log(`Wrote:\n- ${toRepoPath(OUT_JSON)}\n- ${toRepoPath(OUT_MD)}\nFiles scanned: ${totalFiles} (${clientFiles.length} client, ${serverFiles.length} server), Issues: ${issues.length}`)
}

main()
