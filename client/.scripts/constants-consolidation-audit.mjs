import fs from 'node:fs'
import path from 'node:path'
import {
  loadConfigAllowlist,
  categorizeMatches,
  summarizeExceptions,
  checkConfigAllowlist,
  parseChangedOnlyFlag,
  renderAllowedExceptionsSection,
  isCompiledJsFile,
  isGloballyExcluded,
} from './audit-exceptions.mjs'

/**
 * Constants Consolidation Audit Script
 *
 * Goal: Inventory all constant files (*Constants.ts, files in constants/ directories) and detect:
 * - Identical values across files (HOIST candidates)
 * - Structural pattern duplication (TEMPLATE candidates)
 * - Inline occurrences of already-defined constants (HOIST/ENUM candidates)
 *
 * Scope:
 * - Included: client/src and server/src (ts, js, mjs files)
 * - Excluded: __tests__, test files, spec files, @core, @layouts, migrations
 *
 * Exception Handling:
 * - Inline: // @audit-allow:constants-consolidation:<ruleId> - <reason>
 * - Config: .audit-reports/constants-consolidation-audit-config.json
 *
 * Output:
 * - client/.audit-reports/constants-consolidation-audit.json
 * - client/.audit-reports/constants-consolidation-audit.md
 */

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
const OUT_JSON = path.join(OUT_DIR, 'constants-consolidation-audit.json')
const OUT_MD = path.join(OUT_DIR, 'constants-consolidation-audit.md')
const CONFIG_PATH = path.join(OUT_DIR, 'constants-consolidation-audit-config.json')

const AUDIT_TYPE = 'constants-consolidation'

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

function toRepoPath(absPath) {
  return path.relative(PROJECT_ROOT, absPath).replaceAll(path.sep, '/')
}

function toStableId(repoPath) {
  return repoPath.replaceAll('/', '__')
}

function isExcluded(repoPath, configAllowlist) {
  if (isGloballyExcluded(repoPath)) return true
  const result = checkConfigAllowlist(repoPath, '*', 1, configAllowlist)
  return result.allowed
}

function isScannable(absPath) {
  return absPath.endsWith('.ts') || absPath.endsWith('.js') || absPath.endsWith('.mjs')
}

function isConstantsFile(repoPath) {
  // Match: *Constants.ts, *constants.ts, files in */constants/ directories
  const fileName = path.basename(repoPath)
  const dirName = path.dirname(repoPath)
  return (
    /Constants\.ts$/i.test(fileName) ||
    /constants\.ts$/i.test(fileName) ||
    /constants.*\.ts$/i.test(fileName) ||
    dirName.includes('/constants/') ||
    dirName.includes('\\constants\\')
  )
}

/**
 * @param {string} dir
 * @returns {string[]}
 */
function listFilesRecursive(dir) {
  /** @type {string[]} */
  const out = []
  if (!fs.existsSync(dir)) return out
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const abs = path.join(dir, e.name)
    const repoPath = toRepoPath(abs)
    
    if (isExcluded(repoPath, null)) {
      continue
    }
    
    if (e.isDirectory()) {
      out.push(...listFilesRecursive(abs))
      continue
    }
    if (e.isFile() && isScannable(abs) && !isCompiledJsFile(abs)) out.push(abs)
  }
  return out
}

function splitLines(contents) {
  return contents.replaceAll('\r\n', '\n').split('\n')
}

/**
 * Extract the value portion of an export const declaration
 * Handles: strings, numbers, objects (with as const), arrays
 */
function extractConstValue(lines, startLineIndex) {
  const line = lines[startLineIndex]
  const equalsIndex = line.indexOf('=')
  if (equalsIndex === -1) return null
  
  let valueStart = equalsIndex + 1
  // Skip whitespace after =
  while (valueStart < line.length && /\s/.test(line[valueStart])) valueStart++
  
  // Check if value starts on same line
  const restOfLine = line.slice(valueStart).trim()
  
  // String literal: '...' or "..."
  if (restOfLine.startsWith("'") || restOfLine.startsWith('"')) {
    const quote = restOfLine[0]
    const endQuote = restOfLine.indexOf(quote, 1)
    if (endQuote !== -1) {
      return {
        type: 'string',
        value: restOfLine.slice(1, endQuote),
        endLine: startLineIndex,
        endCol: valueStart + endQuote + 1,
      }
    }
  }
  
  // Number literal
  if (/^-?\d+(\.\d+)?$/.test(restOfLine.trim())) {
    return {
      type: 'number',
      value: restOfLine.trim(),
      endLine: startLineIndex,
      endCol: line.length,
    }
  }
  
  // Object literal: { ... } or { ... } as const
  if (restOfLine.startsWith('{')) {
    return extractObjectValue(lines, startLineIndex, valueStart)
  }
  
  // Array literal: [ ... ]
  if (restOfLine.startsWith('[')) {
    return extractArrayValue(lines, startLineIndex, valueStart)
  }
  
  return null
}

/**
 * Extract object value with brace-depth tracking
 */
function extractObjectValue(lines, startLineIndex, startCol) {
  let depth = 0
  let inString = false
  let stringChar = null
  let i = startLineIndex
  let j = startCol
  
  const objLines = []
  let objContent = ''
  
  while (i < lines.length) {
    const line = lines[i]
    
    for (let k = (i === startLineIndex ? j : 0); k < line.length; k++) {
      const char = line[k]
      const prevChar = k > 0 ? line[k - 1] : null
      
      if (!inString && (char === '"' || char === "'")) {
        inString = true
        stringChar = char
      } else if (inString && char === stringChar && prevChar !== '\\') {
        inString = false
        stringChar = null
      }
      
      if (!inString) {
        if (char === '{') {
          depth++
          if (depth === 1 && i === startLineIndex && k >= j) {
            // Start collecting
          }
        } else if (char === '}') {
          depth--
          if (depth === 0) {
            objContent += line.slice(i === startLineIndex ? j : 0, k + 1)
            objLines.push(objContent)
            return {
              type: 'object',
              value: parseObjectContent(objContent),
              endLine: i,
              endCol: k + 1,
            }
          }
        }
      }
      
      if (depth > 0) {
        if (k === 0 && i > startLineIndex) {
          objContent += '\n'
        }
        if (i === startLineIndex && k >= j) {
          objContent += char
        } else if (i > startLineIndex) {
          objContent += char
        }
      }
    }
    
    if (depth > 0 && i > startLineIndex) {
      objContent += '\n'
    }
    i++
    j = 0
  }
  
  return null // Unclosed object
}

/**
 * Parse object content into key-value pairs
 */
function parseObjectContent(content) {
  const result = {}
  // Remove outer braces
  const inner = content.trim().replace(/^\{/, '').replace(/\}$/, '').trim()
  
  // Simple regex-based parsing for key: value pairs
  // Match: KEY: 'value' or KEY: "value" or KEY: { ... } or KEY: number
  const keyValueRe = /(\w+)\s*:\s*((?:'[^']*'|"[^"]*"|\d+|true|false|null|\{[^}]*\}|\[[^\]]*\]))/g
  let match
  while ((match = keyValueRe.exec(inner)) !== null) {
    const key = match[1]
    let value = match[2].trim()
    
    // Remove quotes from strings
    if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
      value = value.slice(1, -1)
    }
    
    result[key] = value
  }
  
  return result
}

/**
 * Extract array value
 */
function extractArrayValue(lines, startLineIndex, startCol) {
  let depth = 0
  let inString = false
  let stringChar = null
  let i = startLineIndex
  let j = startCol
  
  let arrContent = ''
  
  while (i < lines.length) {
    const line = lines[i]
    
    for (let k = (i === startLineIndex ? j : 0); k < line.length; k++) {
      const char = line[k]
      const prevChar = k > 0 ? line[k - 1] : null
      
      if (!inString && (char === '"' || char === "'")) {
        inString = true
        stringChar = char
      } else if (inString && char === stringChar && prevChar !== '\\') {
        inString = false
        stringChar = null
      }
      
      if (!inString) {
        if (char === '[') {
          depth++
        } else if (char === ']') {
          depth--
          if (depth === 0) {
            arrContent += line.slice(i === startLineIndex ? j : 0, k + 1)
            return {
              type: 'array',
              value: parseArrayContent(arrContent),
              endLine: i,
              endCol: k + 1,
            }
          }
        }
      }
      
      if (depth > 0) {
        if (i === startLineIndex && k >= j) {
          arrContent += char
        } else if (i > startLineIndex) {
          arrContent += char
        }
      }
    }
    
    if (depth > 0 && i > startLineIndex) {
      arrContent += '\n'
    }
    i++
    j = 0
  }
  
  return null
}

/**
 * Parse array content into array of values
 */
function parseArrayContent(content) {
  const inner = content.trim().replace(/^\[/, '').replace(/\]$/, '').trim()
  if (!inner) return []
  
  // Simple split by comma, handling strings
  const items = []
  let current = ''
  let inString = false
  let stringChar = null
  
  for (let i = 0; i < inner.length; i++) {
    const char = inner[i]
    const prevChar = i > 0 ? inner[i - 1] : null
    
    if (!inString && (char === '"' || char === "'")) {
      inString = true
      stringChar = char
      current += char
    } else if (inString && char === stringChar && prevChar !== '\\') {
      inString = false
      stringChar = null
      current += char
    } else if (!inString && char === ',' && current.trim()) {
      items.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  if (current.trim()) {
    items.push(current.trim())
  }
  
  return items.map(item => {
    // Remove quotes
    if ((item.startsWith("'") && item.endsWith("'")) || (item.startsWith('"') && item.endsWith('"'))) {
      return item.slice(1, -1)
    }
    return item
  })
}

/**
 * Phase 1: Inventory all constants files and parse exports
 */
function inventoryConstantsFiles(files) {
  /** @type {Array<{name: string, value: any, type: string, shape: string, file: string, line: number}>} */
  const catalog = []
  
  const constantsFiles = files.filter(abs => {
    const repoPath = toRepoPath(abs)
    return isConstantsFile(repoPath) && !isExcluded(repoPath, null)
  })
  
  for (const abs of constantsFiles) {
    const repoPath = toRepoPath(abs)
    const content = fs.readFileSync(abs, 'utf8')
    const lines = splitLines(content)
    
    // Match: export const NAME = ...
    const exportConstRe = /export\s+const\s+(\w+)\s*=/g
    let match
    
    while ((match = exportConstRe.exec(content)) !== null) {
      const exportName = match[1]
      const matchIndex = match.index
      
      // Find line number
      const beforeMatch = content.slice(0, matchIndex)
      const lineNumber = beforeMatch.split('\n').length
      
      // Extract value
      const valueInfo = extractConstValue(lines, lineNumber - 1)
      if (!valueInfo) continue
      
      // Build shape fingerprint for objects
      let shape = ''
      if (valueInfo.type === 'object') {
        const keys = Object.keys(valueInfo.value).sort()
        shape = keys.join('|')
      } else if (valueInfo.type === 'array') {
        shape = `array[${valueInfo.value.length}]`
      } else {
        shape = valueInfo.type
      }
      
      catalog.push({
        name: exportName,
        value: valueInfo.value,
        type: valueInfo.type,
        shape,
        file: repoPath,
        line: lineNumber,
      })
    }
  }
  
  return { catalog, constantsFiles: constantsFiles.map(toRepoPath) }
}

/**
 * Phase 2: Cross-file value deduplication
 */
function findValueDuplicates(catalog) {
  /** @type {Array<{id: string, classification: string, locations: Array, score: number}>} */
  const groups = []
  
  // Group by exact value (for strings/numbers)
  const valueMap = new Map()
  for (const entry of catalog) {
    if (entry.type === 'string' || entry.type === 'number') {
      const key = `${entry.type}:${entry.value}`
      if (!valueMap.has(key)) {
        valueMap.set(key, [])
      }
      valueMap.get(key).push(entry)
    }
  }
  
  // Find duplicates (2+ locations)
  for (const [key, entries] of valueMap.entries()) {
    if (entries.length >= 2) {
      const [type, value] = key.split(':')
      const id = `hoist-${type}-${value.replace(/[^a-zA-Z0-9]/g, '-')}`
      groups.push({
        id,
        classification: 'HOIST',
        description: `Identical ${type} value '${value}' in ${entries.length} locations`,
        locations: entries.map(e => ({
          file: e.file,
          export: e.name,
          line: e.line,
          inline: false,
        })),
        score: entries.length * 8, // 8 points per duplicate location
      })
    }
  }
  
  // Compare objects for key overlap and full identity
  const objectEntries = catalog.filter(e => e.type === 'object')
  for (let i = 0; i < objectEntries.length; i++) {
    for (let j = i + 1; j < objectEntries.length; j++) {
      const a = objectEntries[i]
      const b = objectEntries[j]
      
      if (a.file === b.file) continue // Same file, skip
      
      const aKeys = Object.keys(a.value).sort()
      const bKeys = Object.keys(b.value).sort()
      
      // Full identity
      if (aKeys.length === bKeys.length && aKeys.every((k, idx) => k === bKeys[idx])) {
        const allValuesMatch = aKeys.every(k => a.value[k] === b.value[k])
        if (allValuesMatch) {
          const id = `hoist-object-${a.name}-${b.name}`
          groups.push({
            id,
            classification: 'HOIST',
            description: `Identical object structure for ${a.name} and ${b.name}`,
            locations: [
              { file: a.file, export: a.name, line: a.line, inline: false },
              { file: b.file, export: b.name, line: b.line, inline: false },
            ],
            score: 16, // 8 per location
          })
        }
      }
    }
  }
  
  return groups
}

/**
 * Phase 3: Structural pattern detection
 */
function findStructuralPatterns(catalog) {
  /** @type {Array<{id: string, classification: string, locations: Array, score: number}>} */
  const groups = []
  
  // Group by shape fingerprint
  const shapeMap = new Map()
  for (const entry of catalog) {
    if (entry.type === 'object' && entry.shape) {
      if (!shapeMap.has(entry.shape)) {
        shapeMap.set(entry.shape, [])
      }
      shapeMap.get(entry.shape).push(entry)
    }
  }
  
  // Find shapes with 2+ occurrences
  for (const [shape, entries] of shapeMap.entries()) {
    if (entries.length >= 2) {
      // Check if they're in different files
      const uniqueFiles = new Set(entries.map(e => e.file))
      if (uniqueFiles.size >= 2) {
        const id = `template-${shape.replace(/[^a-zA-Z0-9]/g, '-')}`
        groups.push({
          id,
          classification: 'TEMPLATE',
          description: `Structural pattern with keys: ${shape.replace(/\|/g, ', ')}`,
          locations: entries.map(e => ({
            file: e.file,
            export: e.name,
            line: e.line,
            inline: false,
          })),
          score: entries.length * 5, // 5 points per structural match
        })
      }
    }
  }
  
  return groups
}

/**
 * Phase 4: Inline orphan detection
 */
function findInlineOrphans(catalog, allFiles) {
  /** @type {Array<{id: string, classification: string, locations: Array, score: number}>} */
  const groups = []
  
  // Build map of unique string values from catalog
  const stringValues = new Set()
  const valueToExport = new Map()
  
  for (const entry of catalog) {
    if (entry.type === 'string') {
      const value = entry.value
      if (value.length >= 4) { // Skip short strings to avoid false positives
        stringValues.add(value)
        if (!valueToExport.has(value)) {
          valueToExport.set(value, [])
        }
        valueToExport.get(value).push(entry)
      }
    } else if (entry.type === 'object') {
      // Extract string values from object
      for (const [key, val] of Object.entries(entry.value)) {
        if (typeof val === 'string' && val.length >= 4) {
          stringValues.add(val)
          if (!valueToExport.has(val)) {
            valueToExport.set(val, [])
          }
          valueToExport.get(val).push(entry)
        }
      }
    }
  }
  
  // Scan non-constant files for inline occurrences
  const nonConstantsFiles = allFiles.filter(abs => {
    const repoPath = toRepoPath(abs)
    return !isConstantsFile(repoPath) && !isExcluded(repoPath, null) && isScannable(abs)
  })
  
  /** @type {Map<string, Array<{file: string, line: number}>>} */
  const inlineOccurrences = new Map()
  
  for (const abs of nonConstantsFiles) {
    const repoPath = toRepoPath(abs)
    const content = fs.readFileSync(abs, 'utf8')
    const lines = splitLines(content)
    
    for (const value of stringValues) {
      // Skip common programming tokens
      if (['true', 'false', 'null', 'undefined', 'function', 'const', 'let', 'var'].includes(value)) {
        continue
      }
      
      // Build regex to find the value as a string literal
      const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`['"]${escaped}['"]`, 'g')
      
      for (let i = 0; i < lines.length; i++) {
        if (regex.test(lines[i])) {
          const key = value
          if (!inlineOccurrences.has(key)) {
            inlineOccurrences.set(key, [])
          }
          inlineOccurrences.get(key).push({ file: repoPath, line: i + 1 })
        }
      }
    }
  }
  
  // Create groups for values that exist in constants but are used inline
  for (const [value, occurrences] of inlineOccurrences.entries()) {
    const constantEntries = valueToExport.get(value)
    if (constantEntries && constantEntries.length > 0 && occurrences.length > 0) {
      const id = `inline-orphan-${value.replace(/[^a-zA-Z0-9]/g, '-')}`
      groups.push({
        id,
        classification: 'HOIST',
        description: `Value '${value}' defined in constants but used inline in ${occurrences.length} locations`,
        locations: [
          ...constantEntries.map(e => ({
            file: e.file,
            export: e.name,
            line: e.line,
            inline: false,
          })),
          ...occurrences.map(occ => ({
            file: occ.file,
            export: null,
            line: occ.line,
            inline: true,
          })),
        ],
        score: constantEntries.length * 8 + occurrences.length * 4, // 8 per constant, 4 per inline
      })
    }
  }
  
  return groups
}

function assignPriority(score, config) {
  const p0Min = Number(config?.priorities?.p0MinSeverityScore ?? 20)
  const p1Min = Number(config?.priorities?.p1MinSeverityScore ?? 10)
  
  if (score >= p0Min) return 'P0'
  if (score >= p1Min) return 'P1'
  return 'P2'
}

function generateSuggestion(group) {
  if (group.classification === 'HOIST') {
    const constantLocations = group.locations.filter(l => !l.inline)
    if (constantLocations.length >= 2) {
      // Determine shared location (server/src/constants/ or client/src/constants/)
      const serverLocs = constantLocations.filter(l => l.file.startsWith('server/'))
      const clientLocs = constantLocations.filter(l => l.file.startsWith('client/'))
      
      if (serverLocs.length > 0) {
        return `Create shared constant in server/src/constants/ and import everywhere. Consider consolidating into server/src/constants/errors.ts or server/src/constants/common.ts`
      } else if (clientLocs.length > 0) {
        return `Create shared constant in client/src/constants/ and import everywhere`
      }
    } else {
      return `Replace inline usage with imported constant from ${constantLocations[0]?.file || 'constants file'}`
    }
  } else if (group.classification === 'TEMPLATE') {
    return `Consider creating a factory function or base template object. Example: buildCrudErrorMessages(entityName) or extend base ERROR_MESSAGES object`
  }
  return 'Review for consolidation opportunity'
}

function renderMarkdownReport(data) {
  const { consolidationGroups, constantsFiles, totalExportsScanned, exceptionSummary, constantsFilesWithNamingViolations } = data
  const lines = []
  lines.push('# Constants Consolidation Audit (Generated)')
  lines.push('')
  lines.push('This file is generated by `client/.scripts/constants-consolidation-audit.mjs`.')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Constants files scanned: **${constantsFiles.length}**`)
  lines.push(`- Total exports scanned: **${totalExportsScanned}**`)
  lines.push(`- Consolidation groups found: **${consolidationGroups.length}**`)
  lines.push(`- **Requiring review: ${exceptionSummary?.totalRequiresReview || 0}**`)
  lines.push(`- Allowed (with justification): ${exceptionSummary?.totalAllowed || 0}`)
  lines.push('')
  if (constantsFilesWithNamingViolations && constantsFilesWithNamingViolations.length > 0) {
    lines.push('## Constants files with naming violations (fix naming first)')
    lines.push('')
    lines.push('The following constant files have naming-convention findings. Fix naming before consolidating. See `naming-convention-audit` report.')
    lines.push('')
    for (const repoPath of constantsFilesWithNamingViolations) {
      lines.push(`- \`${repoPath}\``)
    }
    lines.push('')
  }
  lines.push('## Consolidation Groups (ranked by score)')
  lines.push('')
  lines.push('| Classification | Priority | Score | Description | Locations |')
  lines.push('| --- | --- | ---: | --- | ---: |')
  
  // Sort groups by score
  const sortedGroups = [...consolidationGroups].sort((a, b) => b.score - a.score)
  
  for (const group of sortedGroups) {
    const priority = assignPriority(group.score, {})
    const locCount = group.locations.length
    lines.push(
      `| ${group.classification} | ${priority} | ${group.score} | ${group.description} | ${locCount} |`
    )
  }
  
  lines.push('')
  lines.push('## Detailed Findings')
  lines.push('')
  
  for (const group of sortedGroups) {
    const priority = assignPriority(group.score, {})
    lines.push(`### ${group.id} (${priority})`)
    lines.push('')
    lines.push(`- **Classification**: ${group.classification}`)
    lines.push(`- **Score**: ${group.score}`)
    lines.push(`- **Description**: ${group.description}`)
    lines.push(`- **Suggestion**: ${generateSuggestion(group)}`)
    lines.push('')
    lines.push('**Locations:**')
    lines.push('')
    
    for (const loc of group.locations) {
      if (loc.inline) {
        lines.push(`- \`${loc.file}\` (inline, line ${loc.line})`)
      } else {
        lines.push(`- \`${loc.file}\` → \`${loc.export}\` (line ${loc.line})`)
      }
    }
    
    lines.push('')
  }
  
  // Add allowed exceptions section if any
  const filesWithAllowed = data.files?.filter(f => f.allowed && f.allowed.length > 0) || []
  if (filesWithAllowed.length > 0) {
    lines.push(...renderAllowedExceptionsSection(filesWithAllowed))
  }
  
  return lines.join('\n')
}

function main() {
  ensureDir(OUT_DIR)
  
  const configAllowlist = loadConfigAllowlist(CONFIG_PATH)
  const delta = parseChangedOnlyFlag(process.argv, PROJECT_ROOT)
  
  // Load priority config
  let priorityConfig = {}
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const configRaw = fs.readFileSync(CONFIG_PATH, 'utf8')
      priorityConfig = JSON.parse(configRaw)
    }
  } catch (_error) {
    // Config might not exist or be invalid, use defaults
  }
  
  // Get all files
  const clientFiles = listFilesRecursive(CLIENT_SRC)
  const serverFiles = listFilesRecursive(SERVER_SRC)
  const allFiles = [...clientFiles, ...serverFiles]
  
  // Phase 1: Inventory
  const { catalog, constantsFiles } = inventoryConstantsFiles(allFiles)

  // Optional: cross-reference with naming-convention audit (fix naming first in these files)
  const namingJsonPath = path.join(OUT_DIR, 'naming-convention-audit.json')
  /** @type {string[]} */
  let constantsFilesWithNamingViolations = []
  try {
    if (fs.existsSync(namingJsonPath)) {
      const namingData = JSON.parse(fs.readFileSync(namingJsonPath, 'utf8'))
      const namingViolationPaths = new Set(
        (namingData.files || []).map((f) => f.repoPath).filter(Boolean)
      )
      constantsFilesWithNamingViolations = constantsFiles.filter((repoPath) =>
        namingViolationPaths.has(repoPath)
      )
    }
  } catch (_e) {
    // Missing or invalid naming JSON: skip cross-reference
  }
  
  // Phase 2: Value deduplication
  const valueDuplicates = findValueDuplicates(catalog)
  
  // Phase 3: Structural patterns
  const structuralPatterns = findStructuralPatterns(catalog)
  
  // Phase 4: Inline orphans
  const inlineOrphans = findInlineOrphans(catalog, allFiles)
  
  // Combine all consolidation groups
  const consolidationGroups = [...valueDuplicates, ...structuralPatterns, ...inlineOrphans]
  
  // Assign priorities
  for (const group of consolidationGroups) {
    group.priority = assignPriority(group.score, priorityConfig)
    group.suggestion = generateSuggestion(group)
  }
  
  // Build per-file scores for meta-report compatibility
  /** @type {Map<string, {repoPath: string, score: number, matches: Array}>} */
  const fileScores = new Map()
  
  for (const group of consolidationGroups) {
    for (const loc of group.locations) {
      const filePath = loc.file
      if (!fileScores.has(filePath)) {
        fileScores.set(filePath, {
          repoPath: filePath,
          score: 0,
          matches: [],
        })
      }
      const fileData = fileScores.get(filePath)
      fileData.score += group.score / group.locations.length // Distribute score across locations
      fileData.matches.push({
        ruleId: group.classification.toLowerCase(),
        lineNumber: loc.line,
        line: loc.inline ? `inline: ${loc.export || 'value'}` : `export: ${loc.export}`,
      })
    }
  }
  
  const files = Array.from(fileScores.values())
    .filter(f => f.score > 0)
    .map(f => {
      const { allowed, requiresReview } = categorizeMatches(
        f.matches,
        f.repoPath,
        '', // Content not needed for this audit
        AUDIT_TYPE,
        configAllowlist
      )
      return {
        id: toStableId(f.repoPath),
        repoPath: f.repoPath,
        score: f.score,
        priority: assignPriority(f.score, priorityConfig),
        allowed,
        requiresReview,
      }
    })
  
  files.sort((a, b) => b.score - a.score || a.repoPath.localeCompare(b.repoPath))
  
  const exceptionSummary = summarizeExceptions(files)
  
  const out = {
    generatedAt: new Date().toISOString(),
    scope: {
      included: ['client/src/**/*.{ts,js}', 'server/src/**/*.{ts,mjs}'],
      excluded: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*'],
    },
    totalScanned: allFiles.length,
    totalConstantsFiles: constantsFiles.length,
    totalExportsScanned: catalog.length,
    ...(delta.enabled ? { deltaMode: true, baseRef: delta.baseRef } : {}),
    exceptionSummary,
    constantsFiles,
    ...(constantsFilesWithNamingViolations.length > 0
      ? { constantsFilesWithNamingViolations }
      : {}),
    consolidationGroups,
    files,
  }
  
  fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2))
  fs.writeFileSync(OUT_MD, renderMarkdownReport(out))
  
  console.log(`Wrote:\n- ${toRepoPath(OUT_JSON)}\n- ${toRepoPath(OUT_MD)}`)
  console.log(`Constants files: ${constantsFiles.length}, Exports: ${catalog.length}, Groups: ${consolidationGroups.length}`)
  console.log(`Findings: ${exceptionSummary.totalRequiresReview} requiring review, ${exceptionSummary.totalAllowed} allowed`)
  process.exitCode = 0
}

main()
