import fs from 'node:fs'
import path from 'node:path'
import childProcess from 'node:child_process'
import {
  parseInlineExceptions,
} from './audit-exceptions.mjs'

/**
 * Typecheck Audit Script (vue-tsc + tsc)
 *
 * Mirrors the `client/.audit/` workflow:
 * - deterministic JSON output
 * - full Markdown report
 * - machine-friendly pool + priority scoring (P0/P1/P2)
 *
 * Runs TypeScript checks on both:
 * - Client: vue-tsc (for Vue SFC support)
 * - Server: tsc (standard TypeScript)
 *
 * Exception Handling:
 * - Inline: // @audit-allow:typecheck:<TScode> - <reason>
 * - Config: .typecheck/typecheck-audit-config.json (allowlist patterns/specific)
 *
 * Output:
 * - client/.typecheck/typecheck-audit.json
 * - client/.typecheck/typecheck-audit.md
 */

const AUDIT_TYPE = 'typecheck'

// Detect if we're running from client/ or project root
const CWD = path.resolve(process.cwd())
const IS_CLIENT_DIR = fs.existsSync(path.join(CWD, 'src'))
const PROJECT_ROOT = IS_CLIENT_DIR ? path.resolve(CWD, '..') : CWD

const CLIENT_ROOT = IS_CLIENT_DIR ? CWD : path.join(PROJECT_ROOT, 'client')
const SERVER_ROOT = path.join(PROJECT_ROOT, 'server')

const OUT_DIR = path.join(CLIENT_ROOT, '.audit-reports/typecheck')
const OUT_JSON = path.join(OUT_DIR, 'typecheck-audit.json')
const OUT_MD = path.join(OUT_DIR, 'typecheck-audit.md')
const CONFIG_PATH = path.join(OUT_DIR, 'typecheck-audit-config.json')

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

function toRepoPath(absPath) {
  return path.relative(PROJECT_ROOT, absPath).replaceAll(path.sep, '/')
}

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return null
  }
  const raw = fs.readFileSync(CONFIG_PATH, 'utf8')
  return JSON.parse(raw)
}

/**
 * Simple glob-like pattern matching (mirrors audit-exceptions.mjs)
 * Uses tokenization to avoid regex replacement conflicts
 */
function simpleGlobMatch(filePath, pattern) {
  const normalizedPath = filePath.replaceAll('\\', '/')
  const normalizedPattern = pattern.replaceAll('\\', '/')
  
  // Tokenize the pattern
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
      let end = i + 1
      while (end < normalizedPattern.length && !['*', '?'].includes(normalizedPattern[end])) {
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
      case 'GLOBSTAR_SLASH': regexStr += '(?:[^/]+/)*'; break
      case 'SLASH_GLOBSTAR': regexStr += '/.*'; break
      case 'GLOBSTAR': regexStr += '.*'; break
      case 'STAR': regexStr += '[^/]*'; break
      case 'QUESTION': regexStr += '[^/]'; break
      case 'LITERAL': regexStr += seg.value.replace(/[.+^${}()|[\]\\]/g, '\\$&'); break
    }
  }
  
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
    return normalizedPath === normalizedPattern || normalizedPath.endsWith('/' + normalizedPattern)
  }
}

/**
 * Check if an error is allowed by config allowlist or inline exception
 */
function checkErrorAllowed(error, config, inlineExceptions) {
  // Check inline exceptions first (most specific)
  for (const exception of inlineExceptions) {
    // Exception applies to same line or next line
    const applies = (
      exception.lineNumber === error.line ||
      exception.lineNumber === error.line - 1
    )
    
    if (applies && (exception.ruleId === error.code || exception.ruleId === '*')) {
      return { allowed: true, reason: exception.reason, source: 'inline' }
    }
  }
  
  // Check config-based allowlist
  const allowlist = config?.allowlist
  if (!allowlist) {
    return { allowed: false, reason: null, source: null }
  }
  
  // Pattern-based allowances
  for (const pattern of (allowlist.patterns || [])) {
    const globMatch = simpleGlobMatch(error.repoPath, pattern.glob)
    if (globMatch) {
      const codes = Array.isArray(pattern.codes) ? pattern.codes : [pattern.codes]
      if (codes.includes(error.code) || codes.includes('*')) {
        return { allowed: true, reason: pattern.reason, source: 'pattern' }
      }
    }
  }
  
  // Specific file/line allowances
  for (const specific of (allowlist.specific || [])) {
    const fileMatch = error.repoPath === specific.file || error.repoPath.endsWith(specific.file)
    if (fileMatch && specific.code === error.code) {
      if (specific.lineRange) {
        const [start, end] = specific.lineRange
        if (error.line >= start && error.line <= end) {
          return { allowed: true, reason: specific.reason, source: 'specific' }
        }
      } else {
        return { allowed: true, reason: specific.reason, source: 'specific' }
      }
    }
  }
  
  return { allowed: false, reason: null, source: null }
}

/**
 * Cache for file contents (avoid re-reading for each error)
 */
const fileContentCache = new Map()

function getFileContent(absPath) {
  if (fileContentCache.has(absPath)) {
    return fileContentCache.get(absPath)
  }
  
  try {
    const content = fs.readFileSync(absPath, 'utf8')
    fileContentCache.set(absPath, content)
    return content
  } catch {
    fileContentCache.set(absPath, '')
    return ''
  }
}

/**
 * Cache for inline exceptions by file
 */
const inlineExceptionCache = new Map()

function getInlineExceptions(repoPath) {
  if (inlineExceptionCache.has(repoPath)) {
    return inlineExceptionCache.get(repoPath)
  }
  
  const absPath = path.join(PROJECT_ROOT, repoPath)
  const content = getFileContent(absPath)
  const exceptions = parseInlineExceptions(content, AUDIT_TYPE)
  inlineExceptionCache.set(repoPath, exceptions)
  return exceptions
}

function runVueTsc() {
  const vueTscBin = path.join(CLIENT_ROOT, 'node_modules', '.bin', 'vue-tsc')
  if (!fs.existsSync(vueTscBin)) {
    return {
      exitCode: 1,
      stdout: '',
      stderr: `vue-tsc not found at ${vueTscBin}`,
      command: `vue-tsc -b --pretty false`,
    }
  }
  
  const args = ['-b', '--pretty', 'false']
  const result = childProcess.spawnSync(vueTscBin, args, {
    cwd: CLIENT_ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  return {
    exitCode: result.status ?? 1,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    command: `vue-tsc ${args.join(' ')}`,
    scope: 'client',
  }
}

function runTsc(serverRoot) {
  const tscBin = path.join(serverRoot, 'node_modules', '.bin', 'tsc')
  if (!fs.existsSync(tscBin)) {
    return {
      exitCode: 1,
      stdout: '',
      stderr: `tsc not found at ${tscBin}`,
      command: `tsc --noEmit --pretty false`,
      scope: 'server',
    }
  }
  
  const args = ['--noEmit', '--pretty', 'false']
  const result = childProcess.spawnSync(tscBin, args, {
    cwd: serverRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  return {
    exitCode: result.status ?? 1,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    command: `tsc ${args.join(' ')}`,
    scope: 'server',
  }
}

/**
 * Parse TS output lines like:
 *   src/foo.ts(12,34): error TS2322: Message...
 */
function parseTscOutput(output) {
  const lines = output.replaceAll('\r\n', '\n').split('\n')

  /** @type {Array<{file: string, line: number, col: number, code: string, message: string, raw: string}>} */
  const errors = []

  const re = /^(?<file>.+?)\((?<line>\d+),(?<col>\d+)\):\s+error\s+(?<code>TS\d+):\s+(?<message>.+)$/
  for (const l of lines) {
    const m = l.match(re)
    if (!m || !m.groups) continue
    errors.push({
      file: m.groups.file,
      line: Number(m.groups.line),
      col: Number(m.groups.col),
      code: m.groups.code,
      message: m.groups.message,
      raw: l,
    })
  }

  return errors
}

function summarizeType(typeText) {
  if (!typeText) return ''
  return String(typeText)
    .trim()
    .replaceAll(/\s+/g, ' ')
    // collapse noisy expansions but keep top-level identifiers
    .replaceAll(/<[^>]*>/g, '<...>')
    .replaceAll(/\{[^}]*\}/g, '{...}')
    .replaceAll(/\([^)]*\)/g, '(...)')
    .slice(0, 160)
}

function stablePoolKey(err) {
  // Build stable, actionable grouping keys.
  // IMPORTANT: For common “assignability” errors we *keep* a summarized view of the source/target types.
  const msg = String(err.message).replaceAll(/\/Users\/[^ ]+/g, '/Users/...')

  if (err.code === 'TS2322') {
    const m = msg.match(/^Type '(.+)' is not assignable to type '(.+)'\./)
    if (m) {
      return `${err.code}::assign:${summarizeType(m[1])}=>${summarizeType(m[2])}`.slice(0, 500)
    }
  }

  if (err.code === 'TS2345') {
    const m = msg.match(/^Argument of type '(.+)' is not assignable to parameter of type '(.+)'\./)
    if (m) {
      return `${err.code}::arg:${summarizeType(m[1])}=>${summarizeType(m[2])}`.slice(0, 500)
    }
  }

  if (err.code === 'TS2339') {
    // Property mismatch: keep property name and the receiver type (summarized).
    const m = msg.match(/^Property '([^']+)' does not exist on type '(.+)'\./)
    if (m) {
      return `${err.code}::prop:${m[1]}@${summarizeType(m[2])}`.slice(0, 500)
    }
  }

  // Default: normalize only numeric coordinates/noise but keep quoted content (it often contains type names).
  const normalized = msg.replaceAll(/\b\d+\b/g, '0')
  return `${err.code}::${normalized}`.slice(0, 500)
}

function slugify(input) {
  return input
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')
    .slice(0, 120)
}

function scoreSeverity(code, config) {
  const weights = config?.weights?.severityByCodePrefix || {}
  const prefix = code.slice(0, 4) // e.g. TS23
  return Number(weights[prefix] ?? 6)
}

function compileRegexes(patterns) {
  if (!Array.isArray(patterns)) return []
  // eslint-disable-next-line security/detect-non-literal-regexp
  return patterns.map((p) => new RegExp(p, 'g'))
}

function scanTypeSmellsForFile(repoPath, config) {
  const abs = path.join(PROJECT_ROOT, repoPath)
  if (!fs.existsSync(abs)) return { unsafeCastHits: 0, suppressionHits: 0 }
  const raw = fs.readFileSync(abs, 'utf8')

  const unsafe = compileRegexes(config?.smells?.unsafeCasts || [])
  const suppressions = compileRegexes(config?.smells?.suppressions || [])

  const unsafeCastHits = unsafe.reduce((sum, re) => sum + (raw.match(re)?.length || 0), 0)
  const suppressionHits = suppressions.reduce((sum, re) => sum + (raw.match(re)?.length || 0), 0)

  return { unsafeCastHits, suppressionHits }
}

function assignPriority(pool, config) {
  const p0Min = Number(config?.priorities?.p0MinSeverityScore ?? 18)
  const p1Min = Number(config?.priorities?.p1MinSeverityScore ?? 10)

  if (pool.totalScore >= p0Min) return 'P0'
  if (pool.totalScore >= p1Min) return 'P1'
  return 'P2'
}

function renderMarkdown(data) {
  const { exceptionSummary } = data
  const lines = []
  lines.push('# Typecheck Audit (Generated)')
  lines.push('')
  lines.push(`Generated by \`client/scripts/typecheck-audit.mjs\`.`)
  lines.push('')
  lines.push('Exception handling:')
  lines.push('- Inline: `// @audit-allow:typecheck:<TScode> - <reason>`')
  lines.push('- Config: `.typecheck/typecheck-audit-config.json` (allowlist section)')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Generated at: **${data.generatedAt}**`)
  lines.push(`- Client command: \`${data.scope.client.command}\``)
  lines.push(`- Server command: \`${data.scope.server.command}\``)
  lines.push(`- Exit code: **${data.exitCode}**`)
  lines.push(`- **Errors requiring review: ${data.errors.length}**`)
  lines.push(`- Allowed (with justification): ${exceptionSummary.totalAllowed} (inline: ${exceptionSummary.bySource.inline}, pattern: ${exceptionSummary.bySource.pattern}, specific: ${exceptionSummary.bySource.specific})`)
  lines.push(`- Pools: **${data.pools.length}**`)
  lines.push('')

  lines.push('## Top pools (by score)')
  lines.push('')
  lines.push('| Priority | Pool | score | errors | files | unsafeCasts | suppressions |')
  lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: |')

  for (const p of data.pools.slice(0, 25)) {
    lines.push(
      `| ${p.priority} | \`${p.poolId}\` | ${p.totalScore} | ${p.errorCount} | ${p.fileCount} | ${p.unsafeCastHits} | ${p.suppressionHits} |`
    )
  }

  // Add allowed exceptions section
  lines.push('')
  lines.push('## Allowed Exceptions (for transparency)')
  lines.push('')
  lines.push('These errors matched audit rules but have documented justifications.')
  lines.push('Review periodically to ensure exceptions are still valid.')
  lines.push('')
  
  if (data.allowedErrors.length === 0) {
    lines.push('- (no exceptions configured)')
    lines.push('')
  } else {
    lines.push('| File | Code | Line | Source | Reason |')
    lines.push('| --- | --- | ---: | --- | --- |')
    
    for (const e of data.allowedErrors.slice(0, 50)) {
      const shortReason = e.allowedReason.length > 60 
        ? e.allowedReason.slice(0, 57) + '...' 
        : e.allowedReason
      lines.push(`| \`${e.repoPath}\` | ${e.code} | ${e.line} | ${e.allowedSource} | ${shortReason} |`)
    }
    
    if (data.allowedErrors.length > 50) {
      lines.push(`| ... | ... | ... | ... | (${data.allowedErrors.length - 50} more allowed errors) |`)
    }
    lines.push('')
  }

  lines.push('')
  lines.push('## Per-file errors requiring review')
  lines.push('')

  // Only show files with errors requiring review
  const filesWithErrors = data.files.filter(f => f.errorCount > 0)
  for (const f of filesWithErrors) {
    lines.push(`### \`${f.repoPath}\``)
    lines.push('')
    lines.push(`- errors: ${f.errorCount}, unsafeCasts: ${f.unsafeCastHits}, suppressions: ${f.suppressionHits}`)
    lines.push('')

    lines.push('```')
    for (const e of f.errors.slice(0, 60)) {
      lines.push(`${e.code}@${e.line}:${e.col} ${e.message}`)
    }
    if (f.errors.length > 60) {
      lines.push(`... (${f.errors.length - 60} more errors omitted)`)
    }
    lines.push('```')
    lines.push('')
  }

  return lines.join('\n')
}

function main() {
  ensureDir(OUT_DIR)
  const config = loadConfig()

  // Run both client and server type checks
  const clientCheck = runVueTsc()
  const serverCheck = runTsc(SERVER_ROOT)
  
  // Combine outputs
  const clientCombined = `${clientCheck.stdout}\n${clientCheck.stderr}`.trim()
  const serverCombined = `${serverCheck.stdout}\n${serverCheck.stderr}`.trim()
  const _combined = `${clientCombined}\n${serverCombined}`.trim()
  
  const clientErrors = parseTscOutput(clientCombined).map(e => ({ ...e, scope: 'client' }))
  const serverErrors = parseTscOutput(serverCombined).map(e => ({ ...e, scope: 'server' }))
  const parsedErrors = [...clientErrors, ...serverErrors]

  // Normalize file paths to repo-relative when possible
  const allErrors = parsedErrors.map((e) => {
    let repoPath = e.file.startsWith('/') ? toRepoPath(e.file) : e.file
    // Ensure server files are prefixed with server/src
    if (e.scope === 'server' && !repoPath.startsWith('server/')) {
      // Try to normalize server paths
      const serverPath = path.join(SERVER_ROOT, 'src')
      if (e.file.startsWith(serverPath)) {
        repoPath = 'server/' + path.relative(SERVER_ROOT, e.file).replaceAll(path.sep, '/')
      } else if (e.file.includes('server/src')) {
        repoPath = e.file.replace(/.*(server\/src\/.*)/, '$1')
      } else {
        repoPath = `server/${repoPath}`
      }
    }
    // Ensure client files are prefixed with client/src
    if (e.scope === 'client' && !repoPath.startsWith('client/') && !repoPath.startsWith('src/')) {
      const clientPath = path.join(CLIENT_ROOT, 'src')
      if (e.file.startsWith(clientPath)) {
        repoPath = 'client/' + path.relative(CLIENT_ROOT, e.file).replaceAll(path.sep, '/')
      } else if (e.file.includes('client/src')) {
        repoPath = e.file.replace(/.*(client\/src\/.*)/, '$1')
      } else if (e.file.startsWith('src/')) {
        repoPath = `client/${repoPath}`
      }
    }
    return { ...e, repoPath }
  })
  
  // Filter out migration files (one-time scripts, type errors are less critical)
  const nonMigrationErrors = allErrors.filter(e => {
    const repoPath = e.repoPath || e.file
    return !(repoPath.includes('/migrations/') || repoPath.includes('/migration') || /migration.*\.(js|mjs|ts)$/i.test(repoPath))
  })
  
  // Categorize errors into allowed vs requiring-review
  const allowedErrors = []
  const errors = []
  
  for (const error of nonMigrationErrors) {
    const inlineExceptions = getInlineExceptions(error.repoPath)
    const result = checkErrorAllowed(error, config, inlineExceptions)
    
    if (result.allowed) {
      allowedErrors.push({
        ...error,
        allowedReason: result.reason,
        allowedSource: result.source,
      })
    } else {
      errors.push(error)
    }
  }
  
  // Calculate exception summary
  const exceptionSummary = {
    totalAllowed: allowedErrors.length,
    totalRequiresReview: errors.length,
    bySource: {
      inline: allowedErrors.filter(e => e.allowedSource === 'inline').length,
      pattern: allowedErrors.filter(e => e.allowedSource === 'pattern').length,
      specific: allowedErrors.filter(e => e.allowedSource === 'specific').length,
    }
  }

  // Build pools
  const poolMap = new Map()
  for (const e of errors) {
    const key = stablePoolKey(e)
    const list = poolMap.get(key) || []
    list.push(e)
    poolMap.set(key, list)
  }

  const weights = config?.weights || {}
  const blastWeight = Number(weights.blastRadiusPerFile ?? 2)
  const repetitionWeight = Number(weights.repetitionPerOccurrence ?? 1)
  const unsafeWeight = Number(weights.unsafeCastPerHit ?? 2)
  const suppressionWeight = Number(weights.suppressionPerHit ?? 3)

  const pools = Array.from(poolMap.entries()).map(([key, poolErrors]) => {
    const files = new Set(poolErrors.map((e) => e.repoPath))
    const severityScore = poolErrors.reduce((sum, e) => sum + scoreSeverity(e.code, config), 0)
    const blastRadiusScore = files.size * blastWeight
    const repetitionScore = poolErrors.length * repetitionWeight

    // Smells: count at file level across affected files
    let unsafeCastHits = 0
    let suppressionHits = 0
    for (const f of files) {
      const smells = scanTypeSmellsForFile(f, config)
      unsafeCastHits += smells.unsafeCastHits
      suppressionHits += smells.suppressionHits
    }

    const smellScore = unsafeCastHits * unsafeWeight + suppressionHits * suppressionWeight
    const totalScore = severityScore + blastRadiusScore + repetitionScore + smellScore

    const poolId = `${poolErrors[0].code}-${slugify(key)}`
    const pool = {
      poolId,
      groupKey: key,
      errorCount: poolErrors.length,
      fileCount: files.size,
      severityScore,
      blastRadiusScore,
      repetitionScore,
      unsafeCastHits,
      suppressionHits,
      totalScore,
      sample: poolErrors.slice(0, 3).map((e) => ({
        repoPath: e.repoPath,
        line: e.line,
        col: e.col,
        code: e.code,
        message: e.message,
      })),
    }

    return { ...pool, priority: assignPriority(pool, config) }
  })

  pools.sort((a, b) => b.totalScore - a.totalScore || a.poolId.localeCompare(b.poolId))

  // Per-file view
  const fileMap = new Map()
  for (const e of errors) {
    const list = fileMap.get(e.repoPath) || []
    list.push(e)
    fileMap.set(e.repoPath, list)
  }

  const files = Array.from(fileMap.entries())
    .map(([repoPath, fileErrors]) => {
      const smells = scanTypeSmellsForFile(repoPath, config)
      return {
        repoPath,
        errorCount: fileErrors.length,
        unsafeCastHits: smells.unsafeCastHits,
        suppressionHits: smells.suppressionHits,
        errors: fileErrors
          .slice()
          .sort((a, b) => a.repoPath.localeCompare(b.repoPath) || a.line - b.line || a.col - b.col),
      }
    })
    .sort((a, b) => b.errorCount - a.errorCount || b.unsafeCastHits - a.unsafeCastHits || a.repoPath.localeCompare(b.repoPath))

  const combinedExitCode = clientCheck.exitCode === 0 && serverCheck.exitCode === 0 ? 0 : 1
  const combinedCommand = `${clientCheck.command} && ${serverCheck.command}`
  
  const out = {
    generatedAt: new Date().toISOString(),
    scope: { 
      client: { command: clientCheck.command, cwd: toRepoPath(CLIENT_ROOT) },
      server: { command: serverCheck.command, cwd: toRepoPath(SERVER_ROOT) },
    },
    exitCode: combinedExitCode,
    command: combinedCommand,
    exceptionSummary,
    errors,
    allowedErrors,
    pools,
    files,
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2))
  fs.writeFileSync(OUT_MD, renderMarkdown(out))

  const clientErrorCount = errors.filter(e => e.scope === 'client').length
  const serverErrorCount = errors.filter(e => e.scope === 'server').length
  const clientAllowedCount = allowedErrors.filter(e => e.scope === 'client').length
  const serverAllowedCount = allowedErrors.filter(e => e.scope === 'server').length
  
  console.log(`Wrote:\n- ${toRepoPath(OUT_JSON)}\n- ${toRepoPath(OUT_MD)}`)
  console.log(`Client errors: ${clientErrorCount} requiring review, ${clientAllowedCount} allowed`)
  console.log(`Server errors: ${serverErrorCount} requiring review, ${serverAllowedCount} allowed`)
  console.log(`Total errors: ${errors.length} requiring review, ${allowedErrors.length} allowed`)
  console.log(`Pools: ${pools.length}`)
  process.exitCode = 0 // audit should not fail CI; it reports.
}

main()


