import fs from 'node:fs'
import path from 'node:path'
import { loadConfigAllowlist, checkConfigAllowlist } from './audit-exceptions.mjs'

/**
 * Pattern Detection Audit Script
 *
 * Goal: Produce a deterministic inventory of code patterns (string literals, types, enums,
 * config locations, function patterns) to help identify duplication opportunities and
 * maintain consistency across the codebase.
 *
 * Scope:
 * - Included: client/src (ts, js, vue files) and server/src (ts, mjs files)
 * - Excluded: __tests__, test files, spec files, @core, @layouts
 *
 * For `.vue`, we only scan `<script>` blocks (to avoid template-driven noise).
 *
 * Exception Handling:
 * - Config: .audit-reports/pattern-detection-audit-config.json (allowlist patterns/specific)
 *
 * Output:
 * - client/.audit-reports/pattern-detection-audit.json
 * - client/.audit-reports/pattern-detection-audit.md
 *
 * Notes:
 * - Heuristic + best-effort pattern detection. This is an inventory for review, not enforcement.
 * - Deterministic ordering and stable IDs so diffs are meaningful.
 */

// Detect if we're running from client/ or project root
const CWD = path.resolve(process.cwd())
const IS_CLIENT_DIR = fs.existsSync(path.join(CWD, 'src'))
const PROJECT_ROOT = IS_CLIENT_DIR ? path.resolve(CWD, '..') : CWD

const CLIENT_ROOT = IS_CLIENT_DIR ? CWD : path.join(PROJECT_ROOT, 'client')
const CLIENT_SRC = path.join(CLIENT_ROOT, 'src')
const SERVER_ROOT = path.join(PROJECT_ROOT, 'server')
const SERVER_SRC = path.join(SERVER_ROOT, 'src')

const OUT_DIR = fs.existsSync(CLIENT_SRC) 
  ? path.join(CWD, '.audit-reports')
  : path.join(CWD, 'client', '.audit-reports')
const OUT_JSON = path.join(OUT_DIR, 'pattern-detection-audit.json')
const OUT_MD = path.join(OUT_DIR, 'pattern-detection-audit.md')
const CONFIG_PATH = path.join(OUT_DIR, 'pattern-detection-audit-config.json')

const _AUDIT_TYPE = 'pattern-detection'

// Minimum occurrences to consider a pattern significant
const MIN_STRING_LITERAL_OCCURRENCES = 3
const _MIN_TYPE_USAGE_OCCURRENCES = 2

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

function toRepoPath(absPath) {
  return path.relative(PROJECT_ROOT, absPath).replaceAll(path.sep, '/')
}

function _toStableId(repoPath) {
  return repoPath.replaceAll('/', '__')
}

/**
 * Check if a file should be excluded from pattern detection scanning
 */
function isExcluded(repoPath, configAllowlist) {
  // Check if file matches any exclusion pattern in config
  const result = checkConfigAllowlist(repoPath, '*', 1, configAllowlist)
  return result.allowed
}

function isScannable(absPath) {
  return absPath.endsWith('.ts') || absPath.endsWith('.js') || absPath.endsWith('.vue') || absPath.endsWith('.mjs')
}

/**
 * Check if a file should be excluded from scanning
 */
function shouldExcludeDir(repoPath) {
  // Exclude migration files (one-time scripts with patterns)
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
  return false
}

/**
 * Recursively list all TypeScript/JavaScript/Vue/MJS files
 */
function listFilesRecursive(dir) {
  /** @type {string[]} */
  const out = []
  if (!fs.existsSync(dir)) return out
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const abs = path.join(dir, e.name)
    const repoPath = toRepoPath(abs)
    
    // Skip excluded directories/files
    if (shouldExcludeDir(repoPath)) {
      continue
    }
    
    if (e.isDirectory()) {
      out.push(...listFilesRecursive(abs))
      continue
    }
    if (e.isFile() && isScannable(abs)) out.push(abs)
  }
  return out
}

/**
 * Extract script blocks from Vue files
 */
function extractVueScriptBlocks(vueContent) {
  const blocks = []
  const re = /<script\b[^>]*>([\s\S]*?)<\/script>/gi
  for (const match of vueContent.matchAll(re)) {
    blocks.push(match[1] || '')
  }
  return blocks.join('\n')
}

/**
 * Scan file for patterns
 */
function scanFile(filePath, allFiles, configAllowlist) {
  const repoPath = toRepoPath(filePath)
  if (isExcluded(repoPath, configAllowlist)) {
    return { repoPath, patterns: { stringLiterals: [], typeDefinitions: [], enumPatterns: [], configLocations: [], functionPatterns: [], commonPatterns: [] } }
  }
  
  const patterns = {
    stringLiterals: [], // String literals that appear multiple times
    typeDefinitions: [], // export type, export interface
    enumPatterns: [], // const X = [...] as const
    configLocations: [], // Files in configs/ directories
    functionPatterns: [], // Function naming patterns
    commonPatterns: [], // Status workflows, etc.
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8')
    
    // Extract script blocks from Vue files
    if (filePath.endsWith('.vue')) {
      content = extractVueScriptBlocks(content)
      if (!content) return { repoPath, patterns: { stringLiterals: [], typeDefinitions: [], enumPatterns: [], configLocations: [], functionPatterns: [], commonPatterns: [] } }
    }
    
    const lines = content.split('\n')
    
    // Detect config location
    if (repoPath.includes('/configs/') || repoPath.includes('/config/')) {
      patterns.configLocations.push({
        type: 'config-file',
        file: repoPath,
        description: 'Configuration file location',
      })
    }
    
    // Scan for type definitions
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      
      // export type X = ...
      const typeExportMatch = trimmed.match(/export\s+type\s+(\w+)\s*=/)
      if (typeExportMatch) {
        patterns.typeDefinitions.push({
          name: typeExportMatch[1],
          file: repoPath,
          line: i + 1,
          definition: trimmed.substring(0, 100),
        })
      }
      
      // export interface X ...
      const interfaceExportMatch = trimmed.match(/export\s+interface\s+(\w+)/)
      if (interfaceExportMatch) {
        patterns.typeDefinitions.push({
          name: interfaceExportMatch[1],
          file: repoPath,
          line: i + 1,
          definition: trimmed.substring(0, 100),
          isInterface: true,
        })
      }
      
      // const X = [...] as const (enum-like pattern)
      const enumLikeMatch = trimmed.match(/export\s+const\s+(\w+)\s*=\s*\[([^\]]+)\]\s*as\s+const/)
      if (enumLikeMatch) {
        const enumName = enumLikeMatch[1]
        const values = enumLikeMatch[2].split(',').map(v => v.trim().replace(/['"]/g, ''))
        patterns.enumPatterns.push({
          name: enumName,
          file: repoPath,
          line: i + 1,
          values: values,
          definition: trimmed.substring(0, 150),
        })
      }
      
      // Status workflow patterns
      if (trimmed.includes("'submitted'") || trimmed.includes("'confirmed'") || trimmed.includes("'started'")) {
        patterns.commonPatterns.push({
          type: 'status-workflow',
          file: repoPath,
          line: i + 1,
          pattern: 'AppointmentStatus workflow',
          code: trimmed.substring(0, 100),
        })
      }
      
      // String literals in status checks
      const statusStringMatch = trimmed.match(/status\s*[=:]\s*['"]([\w-]+)['"]/)
      if (statusStringMatch) {
        patterns.stringLiterals.push({
          value: statusStringMatch[1],
          file: repoPath,
          line: i + 1,
          context: 'status-check',
          code: trimmed.substring(0, 100),
        })
      }
      
      // Function naming patterns (useXxx, getXxx, etc.)
      const composableMatch = trimmed.match(/export\s+(?:async\s+)?function\s+(use|get|create|update|delete)([A-Z]\w+)/)
      if (composableMatch) {
        patterns.functionPatterns.push({
          prefix: composableMatch[1],
          name: composableMatch[2],
          file: repoPath,
          line: i + 1,
          pattern: `${composableMatch[1]}${composableMatch[2]}`,
        })
      }
    }
  } catch (_error) {
    // Skip files we can't read
  }
  
  return { repoPath, patterns }
}

/**
 * Aggregate patterns across all files
 */
function aggregatePatterns(filePatterns) {
  const aggregated = {
    stringLiterals: new Map(), // value -> { count, locations: [] }
    typeDefinitions: new Map(), // name -> { definition, locations: [] }
    enumPatterns: new Map(), // name -> { values, locations: [] }
    configLocations: [],
    functionPatterns: new Map(), // pattern -> { prefix, locations: [] }
    commonPatterns: [], // Status workflows, etc.
  }
  
  for (const { repoPath, patterns } of filePatterns) {
    // Aggregate string literals
    for (const sl of patterns.stringLiterals) {
      if (!aggregated.stringLiterals.has(sl.value)) {
        aggregated.stringLiterals.set(sl.value, { count: 0, locations: [] })
      }
      const entry = aggregated.stringLiterals.get(sl.value)
      entry.count++
      entry.locations.push({ file: repoPath, line: sl.line, context: sl.context, code: sl.code })
    }
    
    // Aggregate type definitions
    for (const td of patterns.typeDefinitions) {
      if (!aggregated.typeDefinitions.has(td.name)) {
        aggregated.typeDefinitions.set(td.name, { definition: td.definition, isInterface: td.isInterface || false, locations: [] })
      }
      const entry = aggregated.typeDefinitions.get(td.name)
      entry.locations.push({ file: repoPath, line: td.line })
    }
    
    // Aggregate enum patterns
    for (const ep of patterns.enumPatterns) {
      if (!aggregated.enumPatterns.has(ep.name)) {
        aggregated.enumPatterns.set(ep.name, { values: ep.values, definition: ep.definition, locations: [] })
      }
      const entry = aggregated.enumPatterns.get(ep.name)
      entry.locations.push({ file: repoPath, line: ep.line })
    }
    
    // Aggregate config locations
    aggregated.configLocations.push(...patterns.configLocations)
    
    // Aggregate function patterns
    for (const fp of patterns.functionPatterns) {
      const key = fp.pattern
      if (!aggregated.functionPatterns.has(key)) {
        aggregated.functionPatterns.set(key, { prefix: fp.prefix, locations: [] })
      }
      const entry = aggregated.functionPatterns.get(key)
      entry.locations.push({ file: repoPath, line: fp.line, name: fp.name })
    }
    
    // Aggregate common patterns
    aggregated.commonPatterns.push(...patterns.commonPatterns)
  }
  
  return aggregated
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1, str2) {
  const m = str1.length
  const n = str2.length
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))
  
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // deletion
          dp[i][j - 1] + 1,     // insertion
          dp[i - 1][j - 1] + 1  // substitution
        )
      }
    }
  }
  
  return dp[m][n]
}

/**
 * Group array of objects by a key
 */
function groupBy(arr, keyFn) {
  const groups = {}
  for (const item of arr) {
    const key = typeof keyFn === 'function' ? keyFn(item) : item[keyFn]
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  }
  return groups
}

/**
 * Extract candidates for duplication audit
 */
function extractDuplicationCandidates(aggregated) {
  const candidates = {
    similarTypeNames: [], // Groups of similar type names
    similarFunctionPatterns: [], // Files with similar function patterns
    repeatedStringFiles: [], // Files with repeated string literals
  }
  
  // Find similar type names (Levenshtein distance < 3)
  const typeNames = Object.keys(aggregated.typeDefinitions)
  for (let i = 0; i < typeNames.length; i++) {
    for (let j = i + 1; j < typeNames.length; j++) {
      const distance = levenshteinDistance(typeNames[i], typeNames[j])
      if (distance > 0 && distance < 3) {
        const type1 = aggregated.typeDefinitions[typeNames[i]]
        const type2 = aggregated.typeDefinitions[typeNames[j]]
        const files = new Set([
          ...type1.locations.map(l => l.file),
          ...type2.locations.map(l => l.file)
        ])
        if (files.size >= 2) {
          candidates.similarTypeNames.push({
            types: [typeNames[i], typeNames[j]],
            files: Array.from(files).sort(),
            distance
          })
        }
      }
    }
  }
  
  // Find files with similar function patterns (same prefix, multiple occurrences)
  const functionPatternsArray = Object.entries(aggregated.functionPatterns).map(([pattern, data]) => ({
    pattern,
    prefix: data.prefix,
    locations: data.locations
  }))
  const functionPatternGroups = groupBy(functionPatternsArray, 'prefix')
  
  for (const [prefix, patterns] of Object.entries(functionPatternGroups)) {
    if (patterns.length >= 3) {
      const files = new Set()
      patterns.forEach(p => p.locations.forEach(l => files.add(l.file)))
      if (files.size >= 2) {
        candidates.similarFunctionPatterns.push({
          prefix,
          files: Array.from(files).sort(),
          patternCount: patterns.length
        })
      }
    }
  }
  
  // Find files with repeated string literals (3+ occurrences across 2+ files)
  for (const [value, entry] of Object.entries(aggregated.stringLiterals)) {
    if (entry.count >= 3) {
      const files = new Set(entry.locations.map(l => l.file))
      if (files.size >= 2) {
        candidates.repeatedStringFiles.push({
          value,
          files: Array.from(files).sort(),
          occurrences: entry.count
        })
      }
    }
  }
  
  return candidates
}

function renderMarkdownReport(data) {
  const { fileCount, scope } = data
  const aggregated = data.aggregated || {}
  const lines = []  
  lines.push('')
  lines.push('This file is generated by `client/.scripts/pattern-detection-audit.mjs`.')
  lines.push('')
  lines.push('Scope:')
  lines.push(`- Included: ${scope.included.join(', ')}`)
  lines.push(`- Excluded: ${scope.excluded.join(', ')}`)
  lines.push('')
  lines.push('Exception handling:')
  lines.push('- Config: `.audit-reports/pattern-detection-audit-config.json`')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Files scanned: **${fileCount}**`)
  lines.push(`- String literals found: **${Object.keys(aggregated.stringLiterals || {}).length}** (showing those with ${MIN_STRING_LITERAL_OCCURRENCES}+ occurrences)`)
  lines.push(`- Type definitions found: **${Object.keys(aggregated.typeDefinitions || {}).length}**`)
  lines.push(`- Enum patterns found: **${Object.keys(aggregated.enumPatterns || {}).length}**`)
  lines.push(`- Config locations found: **${aggregated.configLocations.length}**`)
  lines.push(`- Function patterns found: **${Object.keys(aggregated.functionPatterns || {}).length}**`)
  lines.push(`- Common patterns found: **${aggregated.commonPatterns.length}**`)
  lines.push('')
  
  // String Literals Section
  lines.push('## String Literals (Potential Enum/Key Candidates)')
  lines.push('')
  lines.push(`Showing string literals that appear ${MIN_STRING_LITERAL_OCCURRENCES} or more times:`)
  lines.push('')
  const frequentStrings = Object.entries(aggregated.stringLiterals || {})
    .filter(([_, entry]) => entry.count >= MIN_STRING_LITERAL_OCCURRENCES)
    .sort((a, b) => b[1].count - a[1].count)
  
  if (frequentStrings.length === 0) {
    lines.push('_No frequent string literals found._')
    lines.push('')
  } else {
    lines.push('| Value | Occurrences | Locations |')
    lines.push('| --- | ---: | --- |')
    for (const [value, entry] of frequentStrings.slice(0, 50)) {
      const locationCount = entry.locations.length
      const sampleLocations = entry.locations.slice(0, 3).map(l => `\`${l.file}:${l.line}\``).join(', ')
      const moreText = locationCount > 3 ? ` (+${locationCount - 3} more)` : ''
      lines.push(`| \`${value}\` | ${entry.count} | ${sampleLocations}${moreText} |`)
    }
    lines.push('')
  }
  
  // Type Definitions Section
  lines.push('## Type Definitions')
  lines.push('')
  lines.push('| Type Name | Kind | Definition Location |')
  lines.push('| --- | --- | --- |')
  const types = Object.entries(aggregated.typeDefinitions || {})
    .sort((a, b) => a[0].localeCompare(b[0]))
  for (const [name, entry] of types.slice(0, 100)) {
    const kind = entry.isInterface ? 'interface' : 'type'
    const location = entry.locations[0]
    lines.push(`| \`${name}\` | ${kind} | \`${location.file}:${location.line}\` |`)
  }
  if (types.length > 100) {
    lines.push(`| ... | ... | (+${types.length - 100} more) |`)
  }
  lines.push('')
  
  // Enum Patterns Section
  lines.push('## Enum-like Patterns (const X = [...] as const)')
  lines.push('')
  if (Object.keys(aggregated.enumPatterns || {}).length === 0) {
    lines.push('_No enum-like patterns found._')
    lines.push('')
  } else {
    lines.push('| Enum Name | Values | Definition Location |')
    lines.push('| --- | --- | --- |')
    const enums = Object.entries(aggregated.enumPatterns || {})
      .sort((a, b) => a[0].localeCompare(b[0]))
    for (const [name, entry] of enums) {
      const values = entry.values.slice(0, 5).map(v => `\`${v}\``).join(', ')
      const moreValues = entry.values.length > 5 ? ` (+${entry.values.length - 5} more)` : ''
      const location = entry.locations[0]
      lines.push(`| \`${name}\` | ${values}${moreValues} | \`${location.file}:${location.line}\` |`)
    }
    lines.push('')
  }
  
  // Config Locations Section
  lines.push('## Config File Locations')
  lines.push('')
  if (aggregated.configLocations.length === 0) {
    lines.push('_No config files found._')
    lines.push('')
  } else {
    lines.push('| File | Type |')
    lines.push('| --- | --- |')
    const uniqueConfigs = Array.from(new Set(aggregated.configLocations.map(c => c.file)))
      .sort()
    for (const configFile of uniqueConfigs) {
      lines.push(`| \`${configFile}\` | config-file |`)
    }
    lines.push('')
  }
  
  // Function Patterns Section
  lines.push('## Function Naming Patterns')
  lines.push('')
  lines.push('Common function naming patterns (use*, get*, create*, etc.):')
  lines.push('')
  lines.push('| Pattern | Prefix | Occurrences |')
  lines.push('| --- | --- | ---: |')
  const funcPatterns = Object.entries(aggregated.functionPatterns || {})
    .sort((a, b) => b[1].locations.length - a[1].locations.length)
  for (const [pattern, entry] of funcPatterns.slice(0, 30)) {
    lines.push(`| \`${pattern}\` | \`${entry.prefix}*\` | ${entry.locations.length} |`)
  }
  if (funcPatterns.length > 30) {
    lines.push(`| ... | ... | (+${funcPatterns.length - 30} more) |`)
  }
  lines.push('')
  
  // Common Patterns Section
  lines.push('## Common Patterns (Status Workflows, etc.)')
  lines.push('')
  if (aggregated.commonPatterns.length === 0) {
    lines.push('_No common patterns detected._')
    lines.push('')
  } else {
    const statusPatterns = aggregated.commonPatterns.filter(p => p.type === 'status-workflow')
    if (statusPatterns.length > 0) {
      lines.push('### Status Workflow Patterns')
      lines.push('')
      lines.push(`Found ${statusPatterns.length} occurrences of status workflow patterns:`)
      lines.push('')
      const uniqueFiles = Array.from(new Set(statusPatterns.map(p => p.file)))
      for (const file of uniqueFiles.slice(0, 20)) {
        const filePatterns = statusPatterns.filter(p => p.file === file)
        lines.push(`- \`${file}\`: ${filePatterns.length} occurrence(s)`)
      }
      if (uniqueFiles.length > 20) {
        lines.push(`- ... (+${uniqueFiles.length - 20} more files)`)
      }
      lines.push('')
    }
  }
  
  return lines.join('\n')
}

function main() {
  ensureDir(OUT_DIR)
  
  // Load exception config
  const configAllowlist = loadConfigAllowlist(CONFIG_PATH)
  
  // Load priority config
  let _priorityConfig = {}
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const configRaw = fs.readFileSync(CONFIG_PATH, 'utf8')
      _priorityConfig = JSON.parse(configRaw)
    }
  } catch (_error) {
    // Config might not exist or be invalid, use defaults
  }

  const clientFiles = listFilesRecursive(CLIENT_SRC)
  const serverFiles = listFilesRecursive(SERVER_SRC)
  const absFiles = [...clientFiles, ...serverFiles]
  
  const filePatterns = []
  
  for (const abs of absFiles) {
    const repoPath = toRepoPath(abs)
    if (isExcluded(repoPath, configAllowlist)) continue
    if (shouldExcludeDir(repoPath)) continue
    
    const patterns = scanFile(abs, absFiles, configAllowlist)
    filePatterns.push(patterns)
  }
  
  // Aggregate patterns
  const aggregated = aggregatePatterns(filePatterns)
  
  // Extract candidates for duplication audit (convert Maps to objects for easier processing)
  const typeDefsObj = Object.fromEntries(aggregated.typeDefinitions.entries())
  const funcPatternsObj = Object.fromEntries(aggregated.functionPatterns.entries())
  const stringLiteralsObj = Object.fromEntries(aggregated.stringLiterals.entries())
  
  const candidates = extractDuplicationCandidates({
    typeDefinitions: typeDefsObj,
    functionPatterns: funcPatternsObj,
    stringLiterals: stringLiteralsObj
  })
  
  const out = {
    generatedAt: new Date().toISOString(),
    scope: {
      included: ['client/src/**/*.{ts,js,vue}', 'server/src/**/*.{ts,mjs}'],
      excluded: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*', 'client/src/@core/**', 'client/src/@layouts/**'],
    },
    fileCount: absFiles.length,
    candidates,
    aggregated: {
      stringLiterals: Object.fromEntries(
        Array.from(aggregated.stringLiterals.entries()).map(([k, v]) => [
          k,
          { count: v.count, locations: v.locations }
        ])
      ),
      typeDefinitions: Object.fromEntries(
        Array.from(aggregated.typeDefinitions.entries()).map(([k, v]) => [
          k,
          { definition: v.definition, isInterface: v.isInterface, locations: v.locations }
        ])
      ),
      enumPatterns: Object.fromEntries(
        Array.from(aggregated.enumPatterns.entries()).map(([k, v]) => [
          k,
          { values: v.values, definition: v.definition, locations: v.locations }
        ])
      ),
      configLocations: aggregated.configLocations,
      functionPatterns: Object.fromEntries(
        Array.from(aggregated.functionPatterns.entries()).map(([k, v]) => [
          k,
          { prefix: v.prefix, locations: v.locations }
        ])
      ),
      commonPatterns: aggregated.commonPatterns,
    },
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2))
  fs.writeFileSync(OUT_MD, renderMarkdownReport(out))
  
  const clientCount = clientFiles.length
  const serverCount = serverFiles.length
  console.log(`Wrote:\n- ${toRepoPath(OUT_JSON)}\n- ${toRepoPath(OUT_MD)}`)
  console.log(`Files scanned: ${absFiles.length} (${clientCount} client, ${serverCount} server)`)
  console.log(`Patterns found: ${Object.keys(aggregated.stringLiterals || {}).length} string literals, ${Object.keys(aggregated.typeDefinitions || {}).length} types, ${Object.keys(aggregated.enumPatterns || {}).length} enums, ${aggregated.configLocations.length} config files, ${Object.keys(aggregated.functionPatterns || {}).length} function patterns`)
  process.exitCode = 0
}

main()
