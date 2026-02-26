import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import {
  listAuditFiles,
  loadCentralAllowlist,
  resolveAuditPaths,
  writeAuditReports,
  toRepoPath as toRepoPathUtil,
} from './shared-audit-utils.mjs'

/**
 * Type Similarity Audit Script (Structural Type Governance)
 *
 * Goal: Produce a deterministic inventory of structurally identical or similar type
 * definitions across the codebase. Identifies candidates for:
 *   - UNIFY: Same concept duplicated (import from single source)
 *   - BRAND: Different concept, same shape (add branding to distinguish)
 *   - EXTEND: One type is a superset of another (use extends/intersection)
 *   - REVIEW: High structural overlap needing human judgment
 *
 * Scope:
 * - Included: client/src, server/src, shared/ (ts, js, vue files)
 * - Excluded: __tests__, test files, spec files, @core, @layouts, node_modules
 *
 * For `.vue`, we only scan `<script>` blocks.
 *
 * Scanning targets:
 * - `export type X = { ... }` and `type X = { ... }` (object-shaped type aliases)
 * - `export interface X { ... }` and `interface X { ... }`
 * - Inline object shapes in function parameters and return types
 * - Type aliases for primitives (e.g., `type Minutes = number`)
 *
 * Exception Handling:
 * - Config: .audit-reports/type-similarity-audit-config.json (allowlist patterns/specific)
 *
 * Output:
 * - client/.audit-reports/type-similarity-audit.json
 * - client/.audit-reports/type-similarity-audit.md
 *
 * Architecture Decision:
 * This audit runs BEFORE typecheck:audit in the audit:all chain because:
 * - Unifying duplicate types eliminates entire categories of type errors
 * - Branding structurally identical types makes typecheck catch misuse
 * - It informs which typecheck pools are caused by duplication vs logic bugs
 *
 * Notes:
 * - Heuristic + best-effort parsing (no full TS compiler). This is a review queue.
 * - Deterministic ordering and stable IDs so diffs are meaningful.
 */

// ─── Tunables ───────────────────────────────────────────────────────────────
// LEARNING: These thresholds control sensitivity. Lower = more findings, higher = fewer false positives.
const MIN_PROPERTIES_FOR_STRUCTURAL = 2   // Minimum properties to compare structure
const OVERLAP_THRESHOLD_PERCENT = 75      // Percentage overlap for "high overlap" grouping
const MIN_GROUP_SIZE = 2                  // Minimum types in a group to report

// ─── Utility Functions ──────────────────────────────────────────────────────

function toRepoPath(absPath, projectRoot) {
  return toRepoPathUtil(absPath, projectRoot)
}

function shortHash(text) {
  return crypto.createHash('sha1').update(text).digest('hex').slice(0, 12)
}

/**
 * Extract script content from Vue SFC files
 * @param {string} vueContent
 * @returns {string}
 */
function extractVueScriptContent(vueContent) {
  const blocks = []
  const re = /<script\b[^>]*>([\s\S]*?)<\/script>/gi
  for (const match of vueContent.matchAll(re)) {
    blocks.push(match[1] || '')
  }
  return blocks.join('\n')
}

// ─── Type Parsing ───────────────────────────────────────────────────────────

/**
 * LEARNING: We use heuristic regex-based parsing rather than a full TypeScript AST.
 * WHY: No dependency on TypeScript compiler API, runs fast, good enough for structural comparison.
 * PATTERN: Parse declaration headers, then extract the body between balanced braces.
 *
 * @typedef {{
 *   name: string,
 *   kind: 'interface' | 'type-alias-object' | 'type-alias-primitive' | 'type-alias-union',
 *   file: string,
 *   line: number,
 *   exported: boolean,
 *   properties: Array<{name: string, type: string, optional: boolean}>,
 *   rawBody: string,
 *   fingerprint: string,
 *   primitiveAlias?: string,
 *   unionMembers?: string[]
 * }} ParsedTypeDefinition
 */

/**
 * Extract the body between balanced braces starting from a position.
 * Returns the content between the outermost { and }, handling nesting.
 *
 * @param {string} content - Full file content
 * @param {number} startIdx - Position to start searching from (should be at or before '{')
 * @returns {{body: string, endIdx: number} | null}
 */
function extractBalancedBraces(content, startIdx) {
  let openIdx = content.indexOf('{', startIdx)
  if (openIdx === -1) return null

  let depth = 0
  let inString = false
  let stringChar = ''

  for (let i = openIdx; i < content.length; i++) {
    const ch = content[i]
    const prev = i > 0 ? content[i - 1] : ''

    // Handle string literals (skip braces inside strings)
    if (inString) {
      if (ch === stringChar && prev !== '\\') {
        inString = false
      }
      continue
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inString = true
      stringChar = ch
      continue
    }

    // Handle single-line comments
    if (ch === '/' && i + 1 < content.length && content[i + 1] === '/') {
      const eol = content.indexOf('\n', i)
      i = eol === -1 ? content.length : eol
      continue
    }

    // Handle multi-line comments
    if (ch === '/' && i + 1 < content.length && content[i + 1] === '*') {
      const endComment = content.indexOf('*/', i + 2)
      i = endComment === -1 ? content.length : endComment + 1
      continue
    }

    if (ch === '{') depth++
    if (ch === '}') {
      depth--
      if (depth === 0) {
        return {
          body: content.slice(openIdx + 1, i).trim(),
          endIdx: i,
        }
      }
    }
  }

  return null
}

/**
 * Parse properties from a type/interface body string.
 * Handles nested objects by treating them as opaque type strings.
 *
 * @param {string} body - The content between { and }
 * @returns {Array<{name: string, type: string, optional: boolean}>}
 */
function parseProperties(body) {
  const properties = []
  if (!body.trim()) return properties

  // PATTERN: Split on semicolons and newlines, then parse each property line.
  // We need to be careful about nested objects and generics.
  const lines = body.split(/[;\n]/)

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) continue
    // Skip method signatures (contain parentheses before colon)
    if (/^\w+\s*\(/.test(line)) continue
    // Skip index signatures
    if (line.startsWith('[')) continue

    // Match property pattern: name?: type  or  readonly name: type
    const propMatch = line.match(/^(?:readonly\s+)?(\w+)(\??):\s*(.+?)(?:\/\/.*)?$/)
    if (propMatch) {
      const propName = propMatch[1]
      const optional = propMatch[2] === '?'
      let propType = propMatch[3].trim()

      // Remove trailing comma or semicolon from type
      propType = propType.replace(/[,;]\s*$/, '').trim()

      // Normalize common type patterns for comparison
      propType = normalizeTypeString(propType)

      properties.push({ name: propName, type: propType, optional })
    }
  }

  return properties.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Normalize a type string for structural comparison.
 * WHY: We want `RFC3339DateTime` and `string & { __brand: 'RFC3339DateTime' }` to compare
 * as similar, and we want consistent formatting.
 *
 * @param {string} typeStr
 * @returns {string}
 */
function normalizeTypeString(typeStr) {
  let normalized = typeStr.trim()

  // Collapse whitespace
  normalized = normalized.replaceAll(/\s+/g, ' ')

  // Remove branded type annotations for structural comparison
  // `string & { readonly __brand: 'X' }` → `string`
  normalized = normalized.replace(/\s*&\s*\{\s*(?:readonly\s+)?__brand:\s*['"][^'"]+['"]\s*\}/, '')

  // Normalize Date | string | RFC3339DateTime → all become the base type
  // Map branded aliases to their base types for structural comparison
  const brandedAliases = {
    'RFC3339DateTime': 'string',
    'ISO8601Date': 'string',
  }
  for (const [alias, base] of Object.entries(brandedAliases)) {
    // eslint-disable-next-line security/detect-non-literal-regexp
    normalized = normalized.replaceAll(new RegExp(`\\b${alias}\\b`, 'g'), base)
  }

  // Remove surrounding parentheses
  if (normalized.startsWith('(') && normalized.endsWith(')')) {
    normalized = normalized.slice(1, -1).trim()
  }

  return normalized
}

/**
 * Generate a structural fingerprint for a set of properties.
 * PATTERN: Sort properties alphabetically, normalize types, hash the result.
 * Two types with the same fingerprint are structurally identical.
 *
 * @param {Array<{name: string, type: string, optional: boolean}>} properties
 * @returns {string}
 */
function generateFingerprint(properties) {
  if (properties.length === 0) return 'empty'

  const normalized = properties
    .map(p => `${p.name}${p.optional ? '?' : ''}:${p.type}`)
    .sort()
    .join(',')

  return shortHash(normalized)
}

/**
 * Generate a human-readable structural signature (for display in reports).
 *
 * @param {Array<{name: string, type: string, optional: boolean}>} properties
 * @returns {string}
 */
function generateSignature(properties) {
  if (properties.length === 0) return '{}'

  const propStrings = properties
    .map(p => `${p.name}${p.optional ? '?' : ''}: ${p.type}`)

  return `{ ${propStrings.join(', ')} }`
}

/**
 * Scan a file for type/interface definitions.
 *
 * @param {string} filePath - Absolute path to the file
 * @returns {ParsedTypeDefinition[]}
 */
function scanFileForTypes(filePath, projectRoot) {
  const repoPath = toRepoPath(filePath, projectRoot)
  let content
  try {
    content = fs.readFileSync(filePath, 'utf8')
  } catch {
    return []
  }

  // For Vue files, only scan script blocks
  if (filePath.endsWith('.vue')) {
    content = extractVueScriptContent(content)
    if (!content) return []
  }

  /** @type {ParsedTypeDefinition[]} */
  const definitions = []
  const _lines = content.split('\n')

  // ── Pattern 1: Interface declarations ──
  // Matches: export interface X { ... } or interface X { ... }
  // Also handles: export interface X extends Y { ... }
  const interfaceRegex = /^(\s*)(export\s+)?interface\s+(\w+)(?:\s+extends\s+[\w<>,\s]+)?\s*\{/gm
  let match
  while ((match = interfaceRegex.exec(content)) !== null) {
    const exported = Boolean(match[2])
    const name = match[3]
    const lineNumber = content.slice(0, match.index).split('\n').length

    const extracted = extractBalancedBraces(content, match.index)
    if (!extracted) continue

    const properties = parseProperties(extracted.body)
    const fingerprint = generateFingerprint(properties)

    definitions.push({
      name,
      kind: 'interface',
      file: repoPath,
      line: lineNumber,
      exported,
      properties,
      rawBody: extracted.body.slice(0, 500),
      fingerprint,
    })
  }

  // ── Pattern 2: Type alias with object shape ──
  // Matches: export type X = { ... } or type X = { ... }
  const typeObjectRegex = /^(\s*)(export\s+)?type\s+(\w+)(?:<[^>]*>)?\s*=\s*\{/gm
  while ((match = typeObjectRegex.exec(content)) !== null) {
    const exported = Boolean(match[2])
    const name = match[3]
    const lineNumber = content.slice(0, match.index).split('\n').length

    const extracted = extractBalancedBraces(content, match.index)
    if (!extracted) continue

    const properties = parseProperties(extracted.body)
    const fingerprint = generateFingerprint(properties)

    definitions.push({
      name,
      kind: 'type-alias-object',
      file: repoPath,
      line: lineNumber,
      exported,
      properties,
      rawBody: extracted.body.slice(0, 500),
      fingerprint,
    })
  }

  // ── Pattern 3: Type alias for primitive ──
  // Matches: type Minutes = number, type UserId = string, etc.
  // WHY: These are the prime branding candidates
  const typePrimitiveRegex = /^(\s*)(export\s+)?type\s+(\w+)\s*=\s*(string|number|boolean)\s*(?:[;&\n]|$)/gm
  while ((match = typePrimitiveRegex.exec(content)) !== null) {
    const exported = Boolean(match[2])
    const name = match[3]
    const primitiveType = match[4]
    const lineNumber = content.slice(0, match.index).split('\n').length

    definitions.push({
      name,
      kind: 'type-alias-primitive',
      file: repoPath,
      line: lineNumber,
      exported,
      properties: [],
      rawBody: `${name} = ${primitiveType}`,
      fingerprint: `primitive:${primitiveType}`,
      primitiveAlias: primitiveType,
    })
  }

  // ── Pattern 4: Type alias for union of string literals ──
  // Matches: type Status = 'active' | 'inactive' | 'pending'
  // WHY: Duplicate union types across files are common and should be unified
  const typeUnionRegex = /^(\s*)(export\s+)?type\s+(\w+)\s*=\s*(['"][^'"]+['"](?:\s*\|\s*['"][^'"]+['"])+)\s*$/gm
  while ((match = typeUnionRegex.exec(content)) !== null) {
    const exported = Boolean(match[2])
    const name = match[3]
    const unionBody = match[4]
    const lineNumber = content.slice(0, match.index).split('\n').length

    // Extract and sort union members for stable comparison
    const members = unionBody
      .split('|')
      .map(m => m.trim().replace(/^['"]|['"]$/g, ''))
      .sort()

    const fingerprint = shortHash(`union:${members.join('|')}`)

    definitions.push({
      name,
      kind: 'type-alias-union',
      file: repoPath,
      line: lineNumber,
      exported,
      properties: [],
      rawBody: `${name} = ${unionBody.slice(0, 200)}`,
      fingerprint,
      unionMembers: members,
    })
  }

  return definitions
}

// ─── Grouping & Classification ──────────────────────────────────────────────

/**
 * Calculate structural overlap percentage between two property sets.
 *
 * @param {Array<{name: string, type: string}>} propsA
 * @param {Array<{name: string, type: string}>} propsB
 * @returns {{overlapPercent: number, shared: string[], onlyA: string[], onlyB: string[]}}
 */
function calculateOverlap(propsA, propsB) {
  const mapA = new Map(propsA.map(p => [p.name, p.type]))
  const mapB = new Map(propsB.map(p => [p.name, p.type]))

  const allKeys = new Set([...mapA.keys(), ...mapB.keys()])
  const shared = []
  const onlyA = []
  const onlyB = []

  for (const key of allKeys) {
    const inA = mapA.has(key)
    const inB = mapB.has(key)
    if (inA && inB) {
      // Check if types also match
      if (mapA.get(key) === mapB.get(key)) {
        shared.push(key)
      } else {
        // Same property name, different type — still note it
        onlyA.push(`${key}(${mapA.get(key)})`)
        onlyB.push(`${key}(${mapB.get(key)})`)
      }
    } else if (inA) {
      onlyA.push(key)
    } else {
      onlyB.push(key)
    }
  }

  const totalUnique = allKeys.size
  const overlapPercent = totalUnique === 0 ? 0 : Math.round((shared.length / totalUnique) * 100)

  return { overlapPercent, shared, onlyA, onlyB }
}

/**
 * Determine the relationship between two types.
 *
 * @param {ParsedTypeDefinition} typeA
 * @param {ParsedTypeDefinition} typeB
 * @returns {'EXACT' | 'SUBSET' | 'HIGH_OVERLAP' | null}
 */
function classifyRelationship(typeA, typeB) {
  // Exact fingerprint match
  if (typeA.fingerprint === typeB.fingerprint) return 'EXACT'

  // Primitive aliases with same base type
  if (typeA.kind === 'type-alias-primitive' && typeB.kind === 'type-alias-primitive') {
    if (typeA.primitiveAlias === typeB.primitiveAlias) return 'EXACT'
    return null
  }

  // Union aliases — same members
  if (typeA.kind === 'type-alias-union' && typeB.kind === 'type-alias-union') {
    if (typeA.fingerprint === typeB.fingerprint) return 'EXACT'
    return null
  }

  // Need properties for deeper comparison
  if (typeA.properties.length < MIN_PROPERTIES_FOR_STRUCTURAL) return null
  if (typeB.properties.length < MIN_PROPERTIES_FOR_STRUCTURAL) return null

  // Check subset: A ⊂ B or B ⊂ A
  const { overlapPercent, shared } = calculateOverlap(typeA.properties, typeB.properties)
  const smallerSize = Math.min(typeA.properties.length, typeB.properties.length)

  if (shared.length === smallerSize && typeA.properties.length !== typeB.properties.length) {
    return 'SUBSET'
  }

  // High overlap
  if (overlapPercent >= OVERLAP_THRESHOLD_PERCENT) return 'HIGH_OVERLAP'

  return null
}

/**
 * Determine the recommended action for a group of similar types.
 *
 * @param {Array<ParsedTypeDefinition>} members
 * @param {'EXACT' | 'SUBSET' | 'HIGH_OVERLAP'} relationship
 * @returns {'UNIFY' | 'BRAND' | 'EXTEND' | 'REVIEW'}
 */
function classifyAction(members, relationship) {
  // LEARNING: The classification heuristic:
  // - Same name, different files → UNIFY (it's a duplicate)
  // - Different names, same shape, different files → BRAND (different concepts, same structure)
  // - Different names, same file → REVIEW (likely intentional)
  // - One is subset of another → EXTEND candidate
  // - High overlap → REVIEW
  //
  // WHY: The key distinction is between types that drifted (UNIFY) vs types that
  // genuinely represent different domain concepts but happen to share structure (BRAND).
  // Same-name duplicates are almost always drift; different-name matches are usually
  // intentional semantic boundaries that need branding to make TypeScript enforce.

  if (relationship === 'SUBSET') return 'EXTEND'
  if (relationship === 'HIGH_OVERLAP') return 'REVIEW'

  // For exact matches, check if names match (UNIFY) vs differ (BRAND/REVIEW)
  const uniqueNames = new Set(members.map(m => m.name))
  const uniqueFiles = new Set(members.map(m => m.file))

  if (uniqueNames.size === 1 && uniqueFiles.size > 1) {
    // Same name, different files → almost certainly a duplicate
    return 'UNIFY'
  }

  if (uniqueNames.size > 1 && uniqueFiles.size === 1) {
    // Different names, same file → likely intentional (REVIEW)
    return 'REVIEW'
  }

  if (uniqueNames.size > 1 && uniqueFiles.size > 1) {
    // Different names, different files → check for mixed scenario
    // Some members share names (UNIFY candidates) + some differ (BRAND candidates)
    // If ALL names are unique → BRAND (different concepts, same shape)
    // If some names repeat across boundaries → UNIFY
    const nameToFiles = new Map()
    for (const m of members) {
      const existing = nameToFiles.get(m.name) || []
      existing.push(m.file)
      nameToFiles.set(m.name, existing)
    }

    // Count how many names appear in multiple files (duplicates)
    const duplicatedNames = Array.from(nameToFiles.entries())
      .filter(([_, files]) => new Set(files).size > 1)

    if (duplicatedNames.length > 0 && duplicatedNames.length === nameToFiles.size) {
      // Every name is duplicated across files → pure UNIFY
      return 'UNIFY'
    }

    if (duplicatedNames.length === 0) {
      // No name appears in multiple files — all different names, all different files
      // These are the prime BRAND candidates: same structure, different concepts
      return 'BRAND'
    }

    // Mixed: some names are duplicated, some are unique
    // This is a complex group — flag for REVIEW so a human can decide
    // which to UNIFY (the duplicated names) and which to BRAND (the unique names)
    return 'REVIEW'
  }

  return 'REVIEW'
}

/**
 * Calculate a priority score for a similarity group.
 *
 * @param {object} group
 * @param {object} config
 * @returns {number}
 */
function calculateGroupScore(group) {
  // PATTERN: Score based on risk and leverage
  // - More members = more risk of drift
  // - Cross-boundary (client/server/shared) = higher risk
  // - Exported types = wider blast radius
  // - EXACT matches score higher than SUBSET/OVERLAP
  const relationshipWeight = { EXACT: 4, SUBSET: 2, HIGH_OVERLAP: 1 }
  const baseScore = relationshipWeight[group.relationship] || 1
  const memberScore = group.members.length * 2
  const exportedCount = group.members.filter(m => m.exported).length
  const exportedScore = exportedCount * 2

  const scopes = new Set(group.members.map(m => {
    if (m.file.startsWith('shared/')) return 'shared'
    if (m.file.startsWith('server/')) return 'server'
    return 'client'
  }))
  const crossBoundaryScore = scopes.size > 1 ? 5 : 0

  return baseScore + memberScore + exportedScore + crossBoundaryScore
}

/**
 * Assign priority based on score.
 *
 * @param {number} score
 * @param {object} config
 * @returns {'P0' | 'P1' | 'P2'}
 */
function assignPriority(score, config) {
  const p0Min = Number(config?.priorities?.p0MinScore ?? 12)
  const p1Min = Number(config?.priorities?.p1MinScore ?? 7)

  if (score >= p0Min) return 'P0'
  if (score >= p1Min) return 'P1'
  return 'P2'
}

// ─── Group Building ─────────────────────────────────────────────────────────

/**
 * Build similarity groups from all parsed type definitions.
 * Uses a union-find approach: types with the same fingerprint go in the same group,
 * then we do pairwise comparison for subset/overlap detection.
 *
 * @param {ParsedTypeDefinition[]} allDefinitions
 * @returns {Array<{groupId: string, relationship: string, action: string, members: ParsedTypeDefinition[], signature: string, score: number, priority: string}>}
 */
function buildGroups(allDefinitions, config) {
  const groups = []

  // ── Phase 1: Exact fingerprint matches ──
  // Group by fingerprint first (fast)
  const byFingerprint = new Map()
  for (const def of allDefinitions) {
    const existing = byFingerprint.get(def.fingerprint) || []
    existing.push(def)
    byFingerprint.set(def.fingerprint, existing)
  }

  // Create groups from fingerprint matches (2+ members)
  const fingerprintGrouped = new Set() // Track definitions already grouped
  for (const [fingerprint, members] of byFingerprint.entries()) {
    if (members.length < MIN_GROUP_SIZE) continue
    if (fingerprint === 'empty') continue // Skip empty types

    const action = classifyAction(members, 'EXACT')
    const signature = generateSignature(members[0].properties)
    const group = {
      groupId: `sim-exact-${fingerprint}`,
      relationship: 'EXACT',
      action,
      members: members.map(m => ({
        name: m.name,
        kind: m.kind,
        file: m.file,
        line: m.line,
        exported: m.exported,
        primitiveAlias: m.primitiveAlias || null,
        unionMembers: m.unionMembers || null,
      })),
      signature: members[0].kind === 'type-alias-primitive'
        ? `= ${members[0].primitiveAlias}`
        : members[0].kind === 'type-alias-union'
          ? `= ${(members[0].unionMembers || []).map(m => `'${m}'`).join(' | ')}`
          : signature,
      propertyCount: members[0].properties.length,
    }
    group.score = calculateGroupScore(group)
    group.priority = assignPriority(group.score, config)
    groups.push(group)

    for (const m of members) fingerprintGrouped.add(m)
  }

  // ── Phase 2: Subset and overlap detection ──
  // Compare non-grouped object types pairwise (only those with enough properties)
  // WHY: This catches { start, end } vs { start, end, placeId } relationships
  const objectTypes = allDefinitions.filter(d =>
    (d.kind === 'interface' || d.kind === 'type-alias-object') &&
    d.properties.length >= MIN_PROPERTIES_FOR_STRUCTURAL
  )

  // Build overlap groups using pairwise comparison
  // PATTERN: Track pairs already found to avoid duplicates
  const overlapPairs = []
  for (let i = 0; i < objectTypes.length; i++) {
    for (let j = i + 1; j < objectTypes.length; j++) {
      const typeA = objectTypes[i]
      const typeB = objectTypes[j]

      // Skip if already in an exact group together
      if (typeA.fingerprint === typeB.fingerprint) continue

      const relationship = classifyRelationship(typeA, typeB)
      if (relationship && relationship !== 'EXACT') {
        overlapPairs.push({ typeA, typeB, relationship })
      }
    }
  }

  // Merge overlapping pairs into groups
  // PATTERN: Use connected components — if A~B and B~C, they form one group
  const pairMap = new Map() // def -> set of connected defs + relationship

  for (const pair of overlapPairs) {
    if (!pairMap.has(pair.typeA)) pairMap.set(pair.typeA, [])
    if (!pairMap.has(pair.typeB)) pairMap.set(pair.typeB, [])
    pairMap.get(pair.typeA).push({ other: pair.typeB, relationship: pair.relationship })
    pairMap.get(pair.typeB).push({ other: pair.typeA, relationship: pair.relationship })
  }

  const visitedOverlap = new Set()
  for (const [root, connections] of pairMap.entries()) {
    if (visitedOverlap.has(root)) continue

    // BFS to find connected component
    const component = [root]
    visitedOverlap.add(root)
    let bestRelationship = 'HIGH_OVERLAP'
    const queue = [...connections]

    while (queue.length > 0) {
      const { other, relationship } = queue.shift()
      if (visitedOverlap.has(other)) continue
      visitedOverlap.add(other)
      component.push(other)

      // Upgrade relationship if any pair is SUBSET
      if (relationship === 'SUBSET') bestRelationship = 'SUBSET'

      const nextConnections = pairMap.get(other) || []
      queue.push(...nextConnections)
    }

    if (component.length < MIN_GROUP_SIZE) continue

    const action = classifyAction(component, bestRelationship)
    const representativeProps = component.reduce(
      (best, def) => (def.properties.length > best.properties.length ? def : best),
      component[0]
    )

    // Build overlap detail for the group
    const overlapDetail = {}
    if (component.length === 2) {
      const overlap = calculateOverlap(component[0].properties, component[1].properties)
      overlapDetail.overlapPercent = overlap.overlapPercent
      overlapDetail.sharedProperties = overlap.shared
      overlapDetail.uniqueToFirst = overlap.onlyA
      overlapDetail.uniqueToSecond = overlap.onlyB
    }

    const fingerprint = shortHash(component.map(c => `${c.name}@${c.file}`).sort().join('|'))
    const group = {
      groupId: `sim-${bestRelationship.toLowerCase()}-${fingerprint}`,
      relationship: bestRelationship,
      action,
      members: component.map(m => ({
        name: m.name,
        kind: m.kind,
        file: m.file,
        line: m.line,
        exported: m.exported,
        propertyCount: m.properties.length,
        signature: generateSignature(m.properties),
      })),
      signature: generateSignature(representativeProps.properties),
      propertyCount: representativeProps.properties.length,
      ...overlapDetail,
    }
    group.score = calculateGroupScore(group)
    group.priority = assignPriority(group.score, config)
    groups.push(group)
  }

  // Sort by score descending, then by groupId for stability
  groups.sort((a, b) => b.score - a.score || a.groupId.localeCompare(b.groupId))

  return groups
}

// ─── Markdown Report ────────────────────────────────────────────────────────

/**
 * Render the full Markdown report.
 */
function renderMarkdown(data) {
  const lines = []
  lines.push('# Type Similarity Audit (Generated)')
  lines.push('')
  lines.push('Generated by `client/.scripts/type-similarity-audit.mjs`.')
  lines.push('')
  lines.push('## Purpose')
  lines.push('')
  lines.push('Identifies structurally identical or similar type definitions across the codebase.')
  lines.push('Each group has a recommended action:')
  lines.push('- **UNIFY**: Same concept duplicated across files — import from a single source')
  lines.push('- **BRAND**: Different concepts with identical structure — add TypeScript branding to distinguish')
  lines.push('- **EXTEND**: One type is a superset of another — use `extends` or intersection')
  lines.push('- **REVIEW**: High structural overlap — needs human judgment')
  lines.push('')
  lines.push('## Scope')
  lines.push('')
  lines.push(`- Included: ${data.scope.included.join(', ')}`)
  lines.push(`- Excluded: ${data.scope.excluded.join(', ')}`)
  lines.push(`- Vue scanning: script blocks only`)
  lines.push('')

  lines.push('## Summary')
  lines.push('')
  lines.push(`- Generated at: **${data.generatedAt}**`)
  lines.push(`- Files scanned: **${data.fileCount}**`)
  lines.push(`- Type definitions found: **${data.totalDefinitions}**`)
  lines.push(`- Similarity groups: **${data.groups.length}**`)

  // Action breakdown
  const actionCounts = { UNIFY: 0, BRAND: 0, EXTEND: 0, REVIEW: 0 }
  for (const group of data.groups) {
    actionCounts[group.action] = (actionCounts[group.action] || 0) + 1
  }
  lines.push(`- UNIFY candidates: **${actionCounts.UNIFY}**`)
  lines.push(`- BRAND candidates: **${actionCounts.BRAND}**`)
  lines.push(`- EXTEND candidates: **${actionCounts.EXTEND}**`)
  lines.push(`- REVIEW candidates: **${actionCounts.REVIEW}**`)
  lines.push('')

  // Priority breakdown
  const priorityCounts = { P0: 0, P1: 0, P2: 0 }
  for (const group of data.groups) {
    priorityCounts[group.priority] = (priorityCounts[group.priority] || 0) + 1
  }
  lines.push(`- P0 (high): **${priorityCounts.P0}**, P1 (medium): **${priorityCounts.P1}**, P2 (low): **${priorityCounts.P2}**`)
  lines.push('')

  // ── Index table ──
  lines.push('## Groups (ranked by score)')
  lines.push('')
  lines.push('| Priority | Action | Relationship | Types | Files | Score | Signature |')
  lines.push('| --- | --- | --- | --- | ---: | ---: | --- |')

  for (const g of data.groups.slice(0, 40)) {
    const typeNames = g.members.map(m => `\`${m.name}\``).join(', ')
    const fileCount = new Set(g.members.map(m => m.file)).size
    const sigPreview = g.signature.length > 60 ? g.signature.slice(0, 57) + '...' : g.signature
    lines.push(`| ${g.priority} | ${g.action} | ${g.relationship} | ${typeNames} | ${fileCount} | ${g.score} | \`${sigPreview}\` |`)
  }

  if (data.groups.length > 40) {
    lines.push(`| ... | ... | ... | ... | ... | ... | (${data.groups.length - 40} more groups) |`)
  }
  lines.push('')

  // ── Detailed sections by action ──
  const actionOrder = ['UNIFY', 'BRAND', 'EXTEND', 'REVIEW']

  for (const action of actionOrder) {
    const actionGroups = data.groups.filter(g => g.action === action)
    if (actionGroups.length === 0) continue

    lines.push(`## ${action} Candidates (${actionGroups.length})`)
    lines.push('')

    const actionDescriptions = {
      UNIFY: 'These types are structurally identical and likely represent the same concept. Import from a single source to prevent drift.',
      BRAND: 'These types are structurally identical but may represent different concepts. Add TypeScript branding to make them explicitly distinct.',
      EXTEND: 'One type is a structural subset of another. Consider using `extends` or intersection types.',
      REVIEW: 'These types have high structural overlap. Review to determine if they should be unified, branded, or left as-is.',
    }
    lines.push(actionDescriptions[action])
    lines.push('')

    for (const g of actionGroups.slice(0, 15)) {
      lines.push(`### ${g.groupId}`)
      lines.push('')
      lines.push(`- Relationship: **${g.relationship}**, Priority: **${g.priority}**, Score: **${g.score}**`)
      lines.push(`- Structure: \`${g.signature}\``)
      lines.push('')
      lines.push('| Type | Kind | File | Line | Exported |')
      lines.push('| --- | --- | --- | ---: | --- |')
      for (const m of g.members) {
        lines.push(`| \`${m.name}\` | ${m.kind} | \`${m.file}\` | ${m.line} | ${m.exported ? 'yes' : 'no'} |`)
      }
      lines.push('')

      // Show overlap detail if available
      if (g.overlapPercent !== undefined) {
        lines.push(`Overlap: **${g.overlapPercent}%** shared properties`)
        if (g.sharedProperties?.length) {
          lines.push(`- Shared: ${g.sharedProperties.map(p => `\`${p}\``).join(', ')}`)
        }
        if (g.uniqueToFirst?.length) {
          lines.push(`- Only in \`${g.members[0]?.name}\`: ${g.uniqueToFirst.map(p => `\`${p}\``).join(', ')}`)
        }
        if (g.uniqueToSecond?.length) {
          lines.push(`- Only in \`${g.members[1]?.name}\`: ${g.uniqueToSecond.map(p => `\`${p}\``).join(', ')}`)
        }
        lines.push('')
      }
    }

    if (actionGroups.length > 15) {
      lines.push(`_(${actionGroups.length - 15} more ${action} groups omitted — see JSON for full data)_`)
      lines.push('')
    }
  }

  // ── Primitive alias inventory ──
  const primitiveGroups = data.groups.filter(g =>
    g.members.some(m => m.primitiveAlias)
  )
  if (primitiveGroups.length > 0) {
    lines.push('## Primitive Alias Inventory')
    lines.push('')
    lines.push('These type aliases map to bare primitives (`number`, `string`, `boolean`).')
    lines.push('They are prime candidates for branding — each represents a different concept')
    lines.push('but TypeScript treats them as interchangeable without branding.')
    lines.push('')
    lines.push('| Base Type | Aliases | Files |')
    lines.push('| --- | --- | --- |')
    for (const g of primitiveGroups) {
      const baseType = g.members[0]?.primitiveAlias || '?'
      const aliases = g.members.map(m => `\`${m.name}\``).join(', ')
      const files = [...new Set(g.members.map(m => `\`${m.file}\``))].join(', ')
      lines.push(`| \`${baseType}\` | ${aliases} | ${files} |`)
    }
    lines.push('')
  }

  lines.push('## Notes')
  lines.push('')
  lines.push('- This is a *signal* index generated by heuristic parsing (no full TS compiler).')
  lines.push('- Branded type annotations (e.g., `string & { __brand: "X" }`) are normalized away for structural comparison.')
  lines.push('- Run this audit before `typecheck:audit` — unifying duplicates eliminates entire pools of type errors.')
  lines.push('- See full data in `client/.audit-reports/type-similarity-audit.json`.')
  lines.push('')

  return lines.join('\n')
}

// ─── Main ───────────────────────────────────────────────────────────────────

function main() {
  const paths = resolveAuditPaths('type-similarity')
  const sharedRoot = path.join(paths.projectRoot, 'shared')

  let config = {}
  try {
    if (fs.existsSync(paths.configPath)) {
      config = JSON.parse(fs.readFileSync(paths.configPath, 'utf8'))
    }
  } catch {
    // Config might not exist yet, use defaults
  }

  // Collect files from all three source directories
  const allFiles = listAuditFiles('type-similarity', [paths.clientSrc, paths.serverSrc, sharedRoot])

  // Scan all files for type definitions
  const allDefinitions = []
  for (const absFile of allFiles) {
    const definitions = scanFileForTypes(absFile, paths.projectRoot)
    allDefinitions.push(...definitions)
  }

  // Build similarity groups
  const allGroups = buildGroups(allDefinitions, config)
  const allowlist = loadCentralAllowlist('type-similarity')
  const allowlistedGroupIds = new Set((allowlist.specific || []).map((e) => e.groupId).filter(Boolean))
  const groups = allGroups.filter((g) => !allowlistedGroupIds.has(g.groupId))

  // Build output (only non-allowlisted groups count as findings)
  const output = {
    generatedAt: new Date().toISOString(),
    scope: {
      included: ['client/src/**/*.{ts,js,vue}', 'server/src/**/*.{ts,mjs}', 'shared/**/*.ts'],
      excluded: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*', 'client/src/@core/**', 'client/src/@layouts/**'],
    },
    fileCount: allFiles.length,
    totalDefinitions: allDefinitions.length,
    groups,
    // Include raw definition inventory for cross-referencing with other audits
    definitions: allDefinitions.map(d => ({
      name: d.name,
      kind: d.kind,
      file: d.file,
      line: d.line,
      exported: d.exported,
      fingerprint: d.fingerprint,
      propertyCount: d.properties.length,
      primitiveAlias: d.primitiveAlias || null,
    })),
  }

  const { outJson, outMd } = writeAuditReports('type-similarity', output, renderMarkdown(output))

  // Console summary
  const actionCounts = { UNIFY: 0, BRAND: 0, EXTEND: 0, REVIEW: 0 }
  for (const group of groups) {
    actionCounts[group.action] = (actionCounts[group.action] || 0) + 1
  }

  console.log(`Wrote:\n- ${toRepoPath(outJson, paths.projectRoot)}\n- ${toRepoPath(outMd, paths.projectRoot)}`)
  const clientCount = allFiles.filter(f => f.startsWith(paths.clientSrc)).length
  const serverCount = allFiles.filter(f => f.startsWith(paths.serverSrc)).length
  const sharedCount = allFiles.filter(f => f.startsWith(sharedRoot)).length
  console.log(`Files scanned: ${allFiles.length} (${clientCount} client, ${serverCount} server, ${sharedCount} shared)`)
  console.log(`Type definitions: ${allDefinitions.length}, Similarity groups: ${groups.length}`)
  console.log(`Actions: UNIFY=${actionCounts.UNIFY}, BRAND=${actionCounts.BRAND}, EXTEND=${actionCounts.EXTEND}, REVIEW=${actionCounts.REVIEW}`)
  process.exitCode = 0
}

main()
