import fs from 'node:fs'
import path from 'node:path'

/**
 * Deprecation Audit Script
 *
 * Goal: Scan application code for deprecated fields, methods, and patterns that should be removed.
 * Unlike fallback-audit (which skips comments), this specifically looks for deprecation annotations
 * in comments to identify code that needs cleanup.
 *
 * Scope:
 * - Included: client/src (ts, js, vue files) and server/src (ts, mjs files)
 * - Excluded: __tests__, test files, spec files, @core, @layouts, migrations
 *
 * Output:
 * - client/.audit-reports/deprecation-audit.json
 * - client/.audit-reports/deprecation-audit.md
 *
 * Notes:
 * - Specifically targets comment-based deprecation markers
 * - Extracts replacement suggestions when available
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
const OUT_JSON = path.join(OUT_DIR, 'deprecation-audit.json')
const OUT_MD = path.join(OUT_DIR, 'deprecation-audit.md')

/**
 * Deprecation patterns to detect
 * These patterns look for deprecation markers in comments
 */
const DEPRECATION_PATTERNS = [
  // JSDoc @deprecated tag
  {
    pattern: /@deprecated\b/i,
    label: 'JSDoc @deprecated',
    severity: 'warning',
  },
  // Inline comment deprecation markers
  {
    pattern: /\/\/\s*(?:deprecated|DEPRECATED)\b/i,
    label: 'Deprecated comment',
    severity: 'warning',
  },
  // Parenthetical deprecation notes (like in type definitions)
  {
    pattern: /\(deprecated[^)]*\)/i,
    label: 'Parenthetical deprecation note',
    severity: 'warning',
  },
  // Block comment deprecation
  {
    pattern: /\*\s*(?:deprecated|DEPRECATED)\b/i,
    label: 'Block comment deprecation',
    severity: 'warning',
  },
  // Legacy markers that indicate old code
  {
    pattern: /\/\/\s*(?:legacy|LEGACY)\s*[-:]/i,
    label: 'Legacy marker',
    severity: 'info',
  },
  // Migration compatibility markers
  {
    pattern: /(?:kept for|for)\s+(?:migration|backward)\s+compatibility/i,
    label: 'Migration compatibility',
    severity: 'info',
  },
]

/**
 * Patterns to extract replacement suggestions
 */
const REPLACEMENT_PATTERNS = [
  /use\s+(\w+)\s+instead/i,
  /replaced?\s+(?:by|with)\s+(\w+)/i,
  /deprecated[,\s]+use\s+(\w+)/i,
  /\(deprecated[^)]*use\s+(\w+)[^)]*\)/i,
  /migrate\s+to\s+(\w+)/i,
  /prefer\s+(\w+)/i,
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
  // Exclude test files and directories
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
  // Exclude audit scripts themselves
  if (repoPath.includes('.scripts/') || repoPath.includes('.audit-reports/')) {
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
  } catch {
    // Directory might not exist or be inaccessible
  }
  
  return files
}

/**
 * Extract replacement suggestion from a line
 */
function extractReplacement(line) {
  for (const pattern of REPLACEMENT_PATTERNS) {
    const match = line.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  return null
}

/**
 * Extract the deprecated item name from context
 */
function extractDeprecatedItem(lines, lineIndex) {
  const currentLine = lines[lineIndex]
  const nextLine = lines[lineIndex + 1] || ''
  const _prevLine = lines[lineIndex - 1] || ''
  
  // Try to extract from current line (inline comment after property)
  // e.g., "propertyId?: string | null; // Deprecated"
  const inlineMatch = currentLine.match(/^\s*(\w+)\??:/);
  if (inlineMatch) {
    return inlineMatch[1]
  }
  
  // Try to extract from next line (comment before property)
  const nextLineMatch = nextLine.match(/^\s*(\w+)\??:/);
  if (nextLineMatch) {
    return nextLineMatch[1]
  }
  
  // Try to extract function/method name
  const funcMatch = currentLine.match(/(?:function|const|let|var)\s+(\w+)/) ||
                    nextLine.match(/(?:function|const|let|var)\s+(\w+)/)
  if (funcMatch) {
    return funcMatch[1]
  }
  
  return null
}

/**
 * Scan a file for deprecation patterns
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
      content = scriptBlocks.join('\n')
    }
    
    const lines = content.split('\n')
    
    // Scan for deprecation patterns
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineNumber = i + 1
      
      for (const { pattern, label, severity } of DEPRECATION_PATTERNS) {
        if (pattern.test(line)) {
          const trimmed = line.trim()
          const replacement = extractReplacement(line)
          const deprecatedItem = extractDeprecatedItem(lines, i)
          
          issues.push({
            severity,
            message: `Found ${label}`,
            file: repoPath,
            line: lineNumber,
            code: trimmed.length > 120 ? trimmed.substring(0, 120) + '...' : trimmed,
            deprecatedItem,
            replacement,
            suggestion: replacement
              ? `Replace with \`${replacement}\` and remove deprecated code`
              : 'Review and remove deprecated code when safe',
          })
          
          // Only match one pattern per line to avoid duplicates
          break
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
  // Calculate severity score: warnings = 2 points, info = 1 point
  return issues.reduce((sum, issue) => {
    if (issue.severity === 'error') {
      return sum + 5
    } else if (issue.severity === 'warning') {
      return sum + 2
    } else if (issue.severity === 'info') {
      return sum + 1
    }
    return sum
  }, 0)
}

function assignPriority(score, config) {
  const p0Min = Number(config?.priorities?.p0MinSeverityScore ?? 10)
  const p1Min = Number(config?.priorities?.p1MinSeverityScore ?? 4)
  
  if (score >= p0Min) return 'P0'
  if (score >= p1Min) return 'P1'
  return 'P2'
}

function renderMarkdownReport(filesWithPriority, issues, summary, totalFiles) {
  const lines = []
  lines.push('# Deprecation Audit (Generated)')
  lines.push('')
  lines.push('This file is generated by `client/.scripts/deprecation-audit.mjs`.')
  lines.push('')
  lines.push('Scope: `client/src` (ts, js, vue files) and `server/src` (ts, mjs files)')
  lines.push('')
  lines.push('## Purpose')
  lines.push('')
  lines.push('Identifies deprecated code that should be cleaned up, including:')
  lines.push('- `@deprecated` JSDoc tags')
  lines.push('- `// Deprecated` comments')
  lines.push('- `(deprecated - use X)` inline notes')
  lines.push('- Legacy and migration compatibility markers')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Files scanned: **${totalFiles}**`)
  lines.push(`- Files with deprecations: **${filesWithPriority.length}**`)
  lines.push(`- Deprecation markers found: **${issues.length}**`)
  lines.push(`- With replacement suggestion: ${issues.filter(i => i.replacement).length}`)
  lines.push(`- Without replacement: ${issues.filter(i => !i.replacement).length}`)
  lines.push('')
  
  if (issues.length === 0) {
    lines.push('✅ No deprecation markers found - codebase is clean')
    lines.push('')
    return lines.join('\n')
  }
  
  // Group by whether they have replacements
  const withReplacement = issues.filter(i => i.replacement)
  const withoutReplacement = issues.filter(i => !i.replacement)
  
  if (withReplacement.length > 0) {
    lines.push('## Ready to Remove (have replacement suggestions)')
    lines.push('')
    lines.push('These deprecations specify what to use instead - good candidates for cleanup:')
    lines.push('')
    
    const grouped = new Map()
    for (const issue of withReplacement) {
      if (!grouped.has(issue.file)) {
        grouped.set(issue.file, [])
      }
      grouped.get(issue.file).push(issue)
    }
    
    for (const [file, fileIssues] of grouped) {
      lines.push(`### \`${file}\``)
      lines.push('')
      for (const issue of fileIssues) {
        const item = issue.deprecatedItem ? `\`${issue.deprecatedItem}\`` : 'item'
        lines.push(`- **Line ${issue.line}**: ${item} → use \`${issue.replacement}\``)
        lines.push(`  \`\`\``)
        lines.push(`  ${issue.code}`)
        lines.push(`  \`\`\``)
        lines.push('')
      }
    }
  }
  
  if (withoutReplacement.length > 0) {
    lines.push('## Needs Review (no replacement specified)')
    lines.push('')
    lines.push('These deprecations need investigation to determine if they can be removed:')
    lines.push('')
    
    const grouped = new Map()
    for (const issue of withoutReplacement) {
      if (!grouped.has(issue.file)) {
        grouped.set(issue.file, [])
      }
      grouped.get(issue.file).push(issue)
    }
    
    for (const [file, fileIssues] of grouped) {
      lines.push(`### \`${file}\``)
      lines.push('')
      for (const issue of fileIssues) {
        lines.push(`- **Line ${issue.line}** (${issue.severity}): ${issue.message}`)
        lines.push(`  \`\`\``)
        lines.push(`  ${issue.code}`)
        lines.push(`  \`\`\``)
        lines.push('')
      }
    }
  }
  
  lines.push('## Files by Priority')
  lines.push('')
  
  // Sort files by priority (P0 first, then P1, then P2), then by score
  const priorityOrder = { P0: 0, P1: 1, P2: 2 }
  const sortedFiles = filesWithPriority.sort((a, b) => {
    const aPriority = priorityOrder[a.priority] ?? 2
    const bPriority = priorityOrder[b.priority] ?? 2
    if (aPriority !== bPriority) return aPriority - bPriority
    return b.score - a.score
  })
  
  lines.push('| File | Priority | Score | Deprecations | With Replacement |')
  lines.push('| --- | --- | ---: | ---: | ---: |')
  
  for (const fileData of sortedFiles) {
    const withRepl = fileData.issues.filter(i => i.replacement).length
    lines.push(`| \`${fileData.repoPath}\` | ${fileData.priority} | ${fileData.score} | ${fileData.issues.length} | ${withRepl} |`)
  }
  
  lines.push('')
  lines.push('## Notes')
  lines.push('')
  lines.push('- **P0**: High deprecation density (cleanup soon)')
  lines.push('- **P1**: Moderate deprecations (schedule cleanup)')
  lines.push('- **P2**: Low priority (cleanup when convenient)')
  lines.push('')
  
  return lines.join('\n')
}

function main() {
  ensureDir(OUT_DIR)
  
  // Load priority config
  let priorityConfig = {}
  try {
    const configRaw = fs.readFileSync(path.join(OUT_DIR, 'deprecation-audit-config.json'), 'utf8')
    priorityConfig = JSON.parse(configRaw)
  } catch {
    // Config might not exist or be invalid, use defaults
  }
  
  const issues = []
  const recommendations = []
  const filesWithIssues = new Map() // Track issues per file for priority calculation
  
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
  const withReplacement = issues.filter(i => i.replacement)
  const withoutReplacement = issues.filter(i => !i.replacement && i.severity !== 'error')
  
  if (withReplacement.length > 0) {
    recommendations.push(
      `Found ${withReplacement.length} deprecation(s) with replacement suggestions - these are ready for cleanup`
    )
  }
  
  if (withoutReplacement.length > 0) {
    recommendations.push(
      `Found ${withoutReplacement.length} deprecation(s) without replacement - review before removing`
    )
  }
  
  if (issues.length === 0) {
    recommendations.push('No deprecation markers found - codebase is clean')
  }
  
  // Determine status
  const hasErrors = issues.some(i => i.severity === 'error')
  const hasWarnings = issues.some(i => i.severity === 'warning')
  
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
  
  const totalFiles = allFiles.length
  
  const summary = `Scanned ${totalFiles} file(s) (${clientFiles.length} client, ${serverFiles.length} server). Found ${issues.length} deprecation marker(s): ${withReplacement.length} with replacement, ${withoutReplacement.length} without`
  
  const output = {
    generatedAt: new Date().toISOString(),
    check: 'Deprecation',
    status,
    summary: {
      totalFiles,
      clientFiles: clientFiles.length,
      serverFiles: serverFiles.length,
      totalDeprecations: issues.length,
      withReplacement: withReplacement.length,
      withoutReplacement: withoutReplacement.length,
    },
    issues,
    files: filesWithPriority,
    recommendations,
  }
  
  fs.writeFileSync(OUT_JSON, JSON.stringify(output, null, 2))
  fs.writeFileSync(OUT_MD, renderMarkdownReport(filesWithPriority, issues, summary, totalFiles))
  
  console.log(`Wrote:\n- ${toRepoPath(OUT_JSON)}\n- ${toRepoPath(OUT_MD)}\nFiles scanned: ${totalFiles} (${clientFiles.length} client, ${serverFiles.length} server), Deprecations: ${issues.length}`)
}

main()
