import fs from 'node:fs'
import path from 'node:path'

/**
 * Error Logging Audit Script
 *
 * Goal: Scan application code for silent error handling and console usage that should use the project's logger utility.
 *
 * Scope:
 * - Included: client/src (ts, js, vue files) and server/src (ts, mjs files)
 * - Excluded: __tests__, test files, spec files, migrations, scripts, @core, @layouts
 *
 * Output:
 * - client/.audit-reports/error-logging-audit.json
 * - client/.audit-reports/error-logging-audit.md
 *
 * Notes:
 * - Intentionally line-based and heuristic (fast + deterministic).
 * - This audit should never fail CI; it reports signals for manual cleanup.
 * - Priorities: P0 (silent catches), P1 (console in catches), P2 (all console), P3 (excluded)
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
const OUT_JSON = path.join(OUT_DIR, 'error-logging-audit.json')
const OUT_MD = path.join(OUT_DIR, 'error-logging-audit.md')

// Patterns to detect - ordered by priority (P0 highest, P2 lowest)
const PATTERNS = [
  // P0: Silent catches (critical - bugs hide here)
  { 
    pattern: /catch\s*\([^)]*\)\s*\{\s*\}/, 
    label: 'Empty catch block', 
    priority: 'P0',
    severity: 'critical',
    suggestion: 'Replace with explicit error handling - silent failures hide bugs'
  },
  { 
    pattern: /\.catch\s*\(\s*\(\s*\)\s*=>\s*\{\s*\}\s*\)/, 
    label: 'Silent .catch()', 
    priority: 'P0',
    severity: 'critical',
    suggestion: 'Replace with explicit error handling - silent failures hide bugs'
  },
  { 
    pattern: /catch\s*\([^)]*\)\s*\{[^}]*\/\/.*\}/, 
    label: 'Catch block with only comment', 
    priority: 'P0',
    severity: 'critical',
    suggestion: 'Replace with explicit error handling - silent failures hide bugs'
  },
  
  // P1: Console in catch blocks (high - inconsistent error handling)
  { 
    pattern: /catch\s*\([^)]*\)\s*\{[^}]*console\.(log|error|warn|info|debug)\s*\(/, 
    label: 'Console in catch block', 
    priority: 'P1',
    severity: 'warning',
    suggestion: 'Replace console.* with logger.error() for consistent error handling'
  },
  
  // P2: All console usage (medium - should use logger for control)
  { 
    pattern: /console\.(log|error|warn|info|debug)\s*\(/, 
    label: 'Console usage', 
    priority: 'P2',
    severity: 'info',
    suggestion: 'Replace with logger for centralized log level control'
  },
]

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

function toRepoPath(absPath) {
  return path.relative(PROJECT_ROOT, absPath).replaceAll(path.sep, '/')
}

/**
 * Check if a file should be excluded from scanning (P3 - acceptable)
 */
function isExcluded(repoPath) {
  // Exclude migration files (one-time scripts with intentional patterns)
  if (repoPath.includes('/migrations/') || repoPath.includes('/migration') || /migration.*\.(js|mjs|ts)$/i.test(repoPath)) {
    return true
  }
  // Exclude test files and directories (test setup often uses console intentionally)
  if (repoPath.includes('__tests__') || repoPath.includes('.test.') || repoPath.includes('.spec.')) {
    return true
  }
  // Exclude tooling scripts (audit scripts, etc.)
  if (repoPath.includes('/.scripts/') || repoPath.includes('/scripts/')) {
    return true
  }
  // Exclude the logger itself (it uses console intentionally)
  if (repoPath === 'client/src/utils/logger.ts' || repoPath === 'server/src/utils/logger.ts') {
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
 * Scan a file for error logging patterns
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
    
    // Scan for patterns (check in priority order - P0 first, then P1, then P2)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineNumber = i + 1
      const trimmed = line.trim()
      
      // Skip comments to reduce false positives
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
        continue
      }
      
      // Check each pattern (in priority order)
      for (const { pattern, label, priority, severity, suggestion } of PATTERNS) {
        if (pattern.test(line)) {
          // For P2 console usage, skip if it's inside a catch block (already covered by P1)
          if (priority === 'P2') {
            // Check if this line is inside a catch block by looking backwards
            let inCatchBlock = false
            let braceCount = 0
            for (let j = i; j >= 0; j--) {
              const prevLine = lines[j]
              if (prevLine.includes('catch')) {
                inCatchBlock = true
                break
              }
              // Count braces to detect if we're still in the catch block
              const openBraces = (prevLine.match(/\{/g) || []).length
              const closeBraces = (prevLine.match(/\}/g) || []).length
              braceCount += openBraces - closeBraces
              if (braceCount < 0) break // We've exited the catch block
            }
            if (inCatchBlock && braceCount >= 0) {
              continue // Skip - this is already covered by P1 pattern
            }
          }
          
          issues.push({
            severity,
            priority,
            message: `Found ${label}`,
            file: repoPath,
            line: lineNumber,
            code: trimmed.length > 100 ? trimmed.substring(0, 100) + '...' : trimmed,
            suggestion,
          })
          break // Only report one pattern per line (highest priority wins)
        }
      }
    }
  } catch (error) {
    issues.push({
      severity: 'error',
      priority: 'P0',
      message: `Failed to scan file: ${error instanceof Error ? error.message : String(error)}`,
      file: toRepoPath(filePath),
    })
  }
  
  return issues
}

function calculateScore(issues) {
  // Calculate severity score: critical (P0) = 10 points, warning (P1) = 5 points, info (P2) = 1 point
  return issues.reduce((sum, issue) => {
    if (issue.priority === 'P0' || issue.severity === 'critical' || issue.severity === 'error') {
      return sum + 10
    } else if (issue.priority === 'P1' || issue.severity === 'warning') {
      return sum + 5
    } else if (issue.priority === 'P2' || issue.severity === 'info') {
      return sum + 1
    }
    return sum
  }, 0)
}

function assignPriority(score, config) {
  const p0Min = Number(config?.priorities?.p0MinSeverityScore ?? 10)
  const p1Min = Number(config?.priorities?.p1MinSeverityScore ?? 5)
  const p2Min = Number(config?.priorities?.p2MinSeverityScore ?? 1)
  
  if (score >= p0Min) return 'P0'
  if (score >= p1Min) return 'P1'
  if (score >= p2Min) return 'P2'
  return 'P3'
}

function renderMarkdownReport(filesWithPriority, issues, summary, totalFiles) {
  const lines = []
  lines.push('# Error Logging Audit (Generated)')
  lines.push('')
  lines.push('This file is generated by `client/.scripts/error-logging-audit.mjs`.')
  lines.push('')
  lines.push('Scope: `client/src` (ts, js, vue files) and `server/src` (ts, mjs files)')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Files scanned: **${totalFiles}**`)
  lines.push(`- Files with issues: **${filesWithPriority.length}**`)
  lines.push(`- Issues found: **${issues.length}**`)
  lines.push(`- P0 (silent catches): ${issues.filter(i => i.priority === 'P0').length}`)
  lines.push(`- P1 (console in catches): ${issues.filter(i => i.priority === 'P1').length}`)
  lines.push(`- P2 (all console): ${issues.filter(i => i.priority === 'P2').length}`)
  lines.push('')
  
  if (issues.length === 0) {
    lines.push('✅ No error logging issues found - all errors use the logger utility')
    lines.push('')
    return lines.join('\n')
  }
  
  lines.push('## Issues by File (sorted by priority)')
  lines.push('')
  
  // Sort files by priority (P0 first, then P1, then P2), then by score
  const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 }
  const sortedFiles = filesWithPriority.sort((a, b) => {
    const aPriority = priorityOrder[a.priority] ?? 3
    const bPriority = priorityOrder[b.priority] ?? 3
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
    const configRaw = fs.readFileSync(path.join(OUT_DIR, 'error-logging-audit-config.json'), 'utf8')
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
        priority: 'P3',
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
    
  } catch (error) {
    issues.push({
      severity: 'error',
      priority: 'P0',
      message: `Failed to audit files: ${error instanceof Error ? error.message : String(error)}`,
      file: '',
    })
  }
  
  // Calculate counts after all issues are collected
  const p0Count = issues.filter(i => i.priority === 'P0').length
  const p1Count = issues.filter(i => i.priority === 'P1').length
  const p2Count = issues.filter(i => i.priority === 'P2').length
  
  // Generate recommendations based on findings
  if (p0Count > 0) {
    recommendations.push(
      `Found ${p0Count} P0 issue(s) - silent catch blocks should be replaced with explicit error handling using logger`
    )
  }
  
  if (p1Count > 0) {
    recommendations.push(
      `Found ${p1Count} P1 issue(s) - console usage in catch blocks should be replaced with logger.error()`
    )
  }
  
  if (p2Count > 0) {
    recommendations.push(
      `Found ${p2Count} P2 issue(s) - console usage should be replaced with logger for centralized log level control`
    )
  }
  
  if (issues.length === 0) {
    recommendations.push('No error logging issues found - all errors use the logger utility')
  }
  
  // Determine status
  const hasP0 = issues.some(i => i.priority === 'P0')
  const hasP1 = issues.some(i => i.priority === 'P1')
  const hasP2 = issues.some(i => i.priority === 'P2')
  
  let status = 'pass'
  if (hasP0) {
    status = 'error'
  } else if (hasP1) {
    status = 'warning'
  } else if (hasP2) {
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
  
  const summary = `Scanned ${totalFiles} file(s) (${clientFiles.length} client, ${serverFiles.length} server). Found ${issues.length} issue(s): ${p0Count} P0 (silent catches), ${p1Count} P1 (console in catches), ${p2Count} P2 (all console)`
  
  const output = {
    generatedAt: new Date().toISOString(),
    check: 'ErrorLogging',
    status,
    issues,
    files: filesWithPriority,
    recommendations,
    summary,
  }
  
  fs.writeFileSync(OUT_JSON, JSON.stringify(output, null, 2))
  fs.writeFileSync(OUT_MD, renderMarkdownReport(filesWithPriority, issues, summary, totalFiles))
  
  console.log(`Wrote:\n- ${toRepoPath(OUT_JSON)}\n- ${toRepoPath(OUT_MD)}\nFiles scanned: ${totalFiles} (${clientFiles.length} client, ${serverFiles.length} server), Issues: ${issues.length} (P0: ${p0Count}, P1: ${p1Count}, P2: ${p2Count})`)
}

main()
