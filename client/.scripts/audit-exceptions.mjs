import fs from 'node:fs'
import { execSync } from 'node:child_process'

/**
 * Audit Exception Utility
 * 
 * Shared module for handling audit exceptions across all audit scripts.
 * Supports two complementary approaches:
 * 
 * 1. INLINE COMMENTS - For specific, one-off exceptions with inline justification
 *    Format: // @audit-allow:<auditType>:<ruleId> - <reason>
 *    Example: // @audit-allow:hardcoding:entityKeyString - Required for entity routing
 * 
 * 2. CONFIG FILE - For patterns/broad exceptions
 *    Location: .audit/<auditType>-audit-config.json
 *    Schema: See loadConfigAllowlist() for structure
 * 
 * Philosophy:
 * - Exceptions should be VISIBLE (tracked in reports)
 * - Exceptions should be JUSTIFIED (require a reason)
 * - Exceptions should be AUDITABLE (can review exception creep)
 * - Easy to ADD when legitimate, easy to REMOVE when stale
 */

/**
 * Detect if a .js file is compiled output from a TypeScript source (sibling .ts exists).
 * Audits should skip these to avoid false positives from transpiled polyfills and helpers.
 *
 * @param {string} absPath - Absolute file path
 * @returns {boolean}
 */
export function isCompiledJsFile(absPath) {
  if (!absPath.endsWith('.js')) return false
  const tsPath = absPath.slice(0, -3) + '.ts'
  return fs.existsSync(tsPath)
}

/**
 * Detect if a file is a seed script (test data seeding, DB seed utilities, etc.).
 * Seed scripts contain intentionally hardcoded data, mutations, and simplified patterns
 * that are not representative of production code quality — auditing them creates noise.
 *
 * Matches:
 *   - Files with 'seed' in their filename (e.g., seedTestData.ts, seed_admin_data.mjs)
 *   - Files in test/setup directories (test infrastructure)
 *
 * Note: Migration files containing 'seed' (e.g., 20260114_seed_admin_...) are already
 * excluded by migration-path checks in each audit's exclusion logic.
 *
 * @param {string} repoPath - Repo-relative file path
 * @returns {boolean}
 */
export function isSeedScript(repoPath) {
  // Test infrastructure directories (seed helpers, fixture builders, etc.)
  if (repoPath.includes('/test/setup/')) return true
  // Files with 'seed' in the filename
  const fileName = repoPath.split('/').pop() || ''
  return /seed/i.test(fileName)
}

/**
 * Parse inline @audit-allow comments from file content
 * 
 * @param {string} content - File content
 * @param {string} auditType - The audit type to filter (e.g., 'hardcoding', 'loop-mutation', 'typecheck')
 * @returns {Array<{lineNumber: number, ruleId: string, reason: string}>}
 */
export function parseInlineExceptions(content, auditType) {
  const lines = content.replaceAll('\r\n', '\n').split('\n')
  const exceptions = []
  
  // Match: // @audit-allow:<auditType>:<ruleId> - <reason>
  // Also support block comments: /* @audit-allow:... */
  const patterns = [
    // Line comment: // @audit-allow:hardcoding:entityKeyString - reason here
    // eslint-disable-next-line security/detect-non-literal-regexp
    new RegExp(`//\\s*@audit-allow:${auditType}:([\\w-]+)\\s*-\\s*(.+)$`),
    // Block comment: /* @audit-allow:hardcoding:entityKeyString - reason here */
    // eslint-disable-next-line security/detect-non-literal-regexp
    new RegExp(`/\\*\\s*@audit-allow:${auditType}:([\\w-]+)\\s*-\\s*(.+?)\\s*\\*/`),
  ]
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    for (const pattern of patterns) {
      const match = line.match(pattern)
      if (match) {
        exceptions.push({
          lineNumber: i + 1,
          ruleId: match[1].trim(),
          reason: match[2].trim(),
        })
      }
    }
  }
  
  return exceptions
}

/**
 * Load config-based allowlist from JSON file
 * 
 * Expected structure:
 * {
 *   "allowlist": {
 *     "patterns": [
 *       {
 *         "glob": "src/api/transformers/**\/*.ts",
 *         "ruleIds": ["entityKeyString", "caseString"],
 *         "reason": "Transformers necessarily reference entity keys"
 *       }
 *     ],
 *     "specific": [
 *       {
 *         "file": "src/constants/entities.ts",
 *         "ruleId": "entityKeyString",
 *         "lineRange": [1, 100],  // optional - if omitted, applies to whole file
 *         "reason": "Canonical entity definitions"
 *       }
 *     ]
 *   }
 * }
 * 
 * @param {string} configPath - Path to the config JSON file
 * @returns {{patterns: Array, specific: Array} | null}
 */
export function loadConfigAllowlist(configPath) {
  if (!fs.existsSync(configPath)) {
    return null
  }
  
  try {
    const raw = fs.readFileSync(configPath, 'utf8')
    const config = JSON.parse(raw)
    
    return {
      patterns: config?.allowlist?.patterns || [],
      specific: config?.allowlist?.specific || [],
    }
  } catch (err) {
    console.warn(`Warning: Could not parse config at ${configPath}: ${err.message}`)
    return null
  }
}

/**
 * Simple glob-like pattern matching (no external dependencies)
 * Supports: ** (any path), * (any segment), exact matches
 * 
 * @param {string} filePath - The file path to test
 * @param {string} pattern - The glob pattern
 * @returns {boolean}
 */
function simpleGlobMatch(filePath, pattern) {
  // Normalize separators
  const normalizedPath = filePath.replaceAll('\\', '/')
  const normalizedPattern = pattern.replaceAll('\\', '/')
  
  // Use a tokenization approach instead of chained replaceAll
  // This avoids replacing parts of our own regex patterns
  
  // First, tokenize the pattern into segments
  const segments = []
  let i = 0
  while (i < normalizedPattern.length) {
    if (normalizedPattern.slice(i, i + 3) === '**/') {
      segments.push({ type: 'GLOBSTAR_SLASH' })
      i += 3
    } else if (normalizedPattern.slice(i, i + 3) === '/**') {
      segments.push({ type: 'SLASH_GLOBSTAR' })
      i += 3
    } else if (normalizedPattern.slice(i, i + 2) === '**') {
      segments.push({ type: 'GLOBSTAR' })
      i += 2
    } else if (normalizedPattern[i] === '*') {
      segments.push({ type: 'STAR' })
      i += 1
    } else if (normalizedPattern[i] === '?') {
      segments.push({ type: 'QUESTION' })
      i += 1
    } else {
      // Find the next special char
      let end = i + 1
      while (end < normalizedPattern.length && 
             !['*', '?'].includes(normalizedPattern[end])) {
        end++
      }
      segments.push({ type: 'LITERAL', value: normalizedPattern.slice(i, end) })
      i = end
    }
  }
  
  // Build regex from segments
  let regexStr = ''
  for (const seg of segments) {
    switch (seg.type) {
      case 'GLOBSTAR_SLASH':
        // **/ = zero or more directory segments
        regexStr += '(?:[^/]+/)*'
        break
      case 'SLASH_GLOBSTAR':
        // /** = slash + any remaining path
        regexStr += '/.*'
        break
      case 'GLOBSTAR':
        // ** = match anything
        regexStr += '.*'
        break
      case 'STAR':
        // * = match anything except /
        regexStr += '[^/]*'
        break
      case 'QUESTION':
        // ? = match single char except /
        regexStr += '[^/]'
        break
      case 'LITERAL':
        // Escape regex special chars in literal
        regexStr += seg.value.replace(/[.+^${}()|[\]\\]/g, '\\$&')
        break
    }
  }
  
  // For patterns starting with **, allow match from start
  // For other patterns, allow match at path boundaries
  if (normalizedPattern.startsWith('**')) {
    regexStr = '^' + regexStr + '$'
  } else {
    regexStr = '(?:^|/)' + regexStr + '$'
  }
  
  try {
    // eslint-disable-next-line security/detect-non-literal-regexp
    const regex = new RegExp(regexStr)
    return regex.test(normalizedPath)
  } catch {
    // If regex is invalid, fall back to exact match
    return normalizedPath === normalizedPattern || normalizedPath.endsWith('/' + normalizedPattern)
  }
}

/**
 * Check if a match is allowed by config patterns
 * 
 * @param {string} repoPath - Repo-relative file path
 * @param {string} ruleId - The rule ID that matched
 * @param {number} lineNumber - Line number of the match
 * @param {{patterns: Array, specific: Array} | null} allowlist - Loaded config allowlist
 * @returns {{allowed: boolean, reason: string | null, source: 'pattern' | 'specific' | null}}
 */
export function checkConfigAllowlist(repoPath, ruleId, lineNumber, allowlist) {
  if (!allowlist) {
    return { allowed: false, reason: null, source: null }
  }
  
  // Check pattern-based allowances (glob matching)
  for (const pattern of allowlist.patterns) {
    const globMatch = simpleGlobMatch(repoPath, pattern.glob)
    if (globMatch) {
      const ruleIds = Array.isArray(pattern.ruleIds) ? pattern.ruleIds : [pattern.ruleIds]
      if (ruleIds.includes(ruleId) || ruleIds.includes('*')) {
        return { allowed: true, reason: pattern.reason, source: 'pattern' }
      }
    }
  }
  
  // Check specific file/line allowances
  for (const specific of allowlist.specific) {
    const fileMatch = repoPath === specific.file || repoPath.endsWith(specific.file)
    if (fileMatch && specific.ruleId === ruleId) {
      // Check line range if specified
      if (specific.lineRange) {
        const [start, end] = specific.lineRange
        if (lineNumber >= start && lineNumber <= end) {
          return { allowed: true, reason: specific.reason, source: 'specific' }
        }
      } else {
        // No line range = whole file
        return { allowed: true, reason: specific.reason, source: 'specific' }
      }
    }
  }
  
  return { allowed: false, reason: null, source: null }
}

/**
 * Check if a match is allowed by inline comment
 * 
 * Inline comments apply to the NEXT non-empty line or the same line.
 * This mimics ESLint's disable-next-line behavior.
 * 
 * @param {number} matchLineNumber - Line number of the audit match
 * @param {string} ruleId - The rule ID that matched
 * @param {Array<{lineNumber: number, ruleId: string, reason: string}>} inlineExceptions
 * @returns {{allowed: boolean, reason: string | null}}
 */
export function checkInlineException(matchLineNumber, ruleId, inlineExceptions) {
  for (const exception of inlineExceptions) {
    // Exception applies to same line or next line
    const applies = (
      exception.lineNumber === matchLineNumber ||
      exception.lineNumber === matchLineNumber - 1
    )
    
    if (applies && (exception.ruleId === ruleId || exception.ruleId === '*')) {
      return { allowed: true, reason: exception.reason }
    }
  }
  
  return { allowed: false, reason: null }
}

/**
 * Comprehensive check: Is this match allowed by any exception mechanism?
 * 
 * @param {string} repoPath - Repo-relative file path
 * @param {string} ruleId - The rule ID that matched
 * @param {number} lineNumber - Line number of the match
 * @param {Array<{lineNumber: number, ruleId: string, reason: string}>} inlineExceptions - Parsed inline exceptions
 * @param {{patterns: Array, specific: Array} | null} configAllowlist - Loaded config allowlist
 * @returns {{allowed: boolean, reason: string | null, source: 'inline' | 'pattern' | 'specific' | null}}
 */
export function isMatchAllowed(repoPath, ruleId, lineNumber, inlineExceptions, configAllowlist) {
  // Check inline first (more specific)
  const inlineResult = checkInlineException(lineNumber, ruleId, inlineExceptions)
  if (inlineResult.allowed) {
    return { ...inlineResult, source: 'inline' }
  }
  
  // Then check config
  const configResult = checkConfigAllowlist(repoPath, ruleId, lineNumber, configAllowlist)
  if (configResult.allowed) {
    return configResult
  }
  
  return { allowed: false, reason: null, source: null }
}

/**
 * Separate matches into allowed and requiring-review categories
 * 
 * @param {Array<{ruleId: string, lineNumber: number, line: string}>} matches - All matches found
 * @param {string} repoPath - Repo-relative file path
 * @param {string} fileContent - File content for parsing inline exceptions
 * @param {string} auditType - Audit type for inline comment parsing
 * @param {{patterns: Array, specific: Array} | null} configAllowlist - Loaded config allowlist
 * @returns {{
 *   allowed: Array<{ruleId: string, lineNumber: number, line: string, reason: string, source: string}>,
 *   requiresReview: Array<{ruleId: string, lineNumber: number, line: string}>
 * }}
 */
export function categorizeMatches(matches, repoPath, fileContent, auditType, configAllowlist) {
  const inlineExceptions = parseInlineExceptions(fileContent, auditType)
  
  const allowed = []
  const requiresReview = []
  
  for (const match of matches) {
    const result = isMatchAllowed(
      repoPath,
      match.ruleId,
      match.lineNumber,
      inlineExceptions,
      configAllowlist
    )
    
    if (result.allowed) {
      allowed.push({
        ...match,
        reason: result.reason,
        source: result.source,
      })
    } else {
      requiresReview.push(match)
    }
  }
  
  return { allowed, requiresReview }
}

/**
 * Generate the "Allowed Exceptions" section for markdown reports
 * 
 * @param {Array<{repoPath: string, allowed: Array}>} filesWithAllowed - Files that have allowed exceptions
 * @returns {string[]} - Lines for the markdown section
 */
export function renderAllowedExceptionsSection(filesWithAllowed) {
  const lines = []
  lines.push('## Allowed Exceptions (for transparency)')
  lines.push('')
  lines.push('These items matched audit rules but have documented justifications.')
  lines.push('Review periodically to ensure exceptions are still valid.')
  lines.push('')
  
  const hasAny = filesWithAllowed.some(f => f.allowed.length > 0)
  
  if (!hasAny) {
    lines.push('- (no exceptions configured)')
    lines.push('')
    return lines
  }
  
  lines.push('| File | Rule | Line | Source | Reason |')
  lines.push('| --- | --- | ---: | --- | --- |')
  
  for (const file of filesWithAllowed) {
    for (const exception of file.allowed) {
      const shortReason = exception.reason.length > 60 
        ? exception.reason.slice(0, 57) + '...' 
        : exception.reason
      lines.push(`| \`${file.repoPath}\` | ${exception.ruleId} | ${exception.lineNumber} | ${exception.source} | ${shortReason} |`)
    }
  }
  
  lines.push('')
  return lines
}

/**
 * Generate summary stats for exceptions
 * 
 * @param {Array<{allowed: Array, requiresReview: Array}>} allFiles
 * @returns {{totalAllowed: number, totalRequiresReview: number, bySource: {inline: number, pattern: number, specific: number}}}
 */
export function summarizeExceptions(allFiles) {
  let totalAllowed = 0
  let totalRequiresReview = 0
  const bySource = { inline: 0, pattern: 0, specific: 0 }
  
  for (const file of allFiles) {
    totalAllowed += file.allowed.length
    totalRequiresReview += file.requiresReview.length
    
    for (const exception of file.allowed) {
      if (exception.source && bySource[exception.source] !== undefined) {
        bySource[exception.source]++
      }
    }
  }
  
  return { totalAllowed, totalRequiresReview, bySource }
}

/**
 * Parse --changed-only and --base=<ref> flags from process.argv
 * 
 * When --changed-only is present, runs `git diff --name-only <baseRef>` to get the list
 * of changed files. Audit scripts can use the returned set to filter their file scan.
 * 
 * Usage in audit scripts:
 *   const delta = parseChangedOnlyFlag(process.argv)
 *   // In file scan loop:
 *   if (delta.enabled && !delta.changedFiles.has(repoPath)) continue
 * 
 * CLI examples:
 *   npm run audit:hardcoding -- --changed-only
 *   npm run audit:hardcoding -- --changed-only --base=main
 * 
 * @param {string[]} argv - process.argv
 * @param {string} [projectRoot] - Project root for resolving repo-relative paths
 * @returns {{ enabled: boolean, baseRef: string, changedFiles: Set<string> }}
 */
export function parseChangedOnlyFlag(argv, projectRoot) {
  const enabled = argv.includes('--changed-only')
  if (!enabled) {
    return { enabled: false, baseRef: '', changedFiles: new Set() }
  }

  const baseFlag = argv.find(a => a.startsWith('--base='))
  const baseRef = baseFlag ? baseFlag.split('=')[1] : 'HEAD~1'

  try {
    const cwd = projectRoot || process.cwd()
    const output = execSync(`git diff --name-only ${baseRef}`, { cwd, encoding: 'utf8' })
    const files = output.trim().split('\n').filter(Boolean)
    return { enabled: true, baseRef, changedFiles: new Set(files) }
  } catch (err) {
    console.warn(`Warning: --changed-only failed (git diff ${baseRef}): ${err.message}`)
    return { enabled: true, baseRef, changedFiles: new Set() }
  }
}
