import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

/**
 * Shared Audit Utils
 *
 * Shared module for audit infrastructure: exclusions, allowlists, file listing,
 * and report conventions. Not an audit script — used by all *-audit.mjs scripts.
 *
 * 1. GLOBAL EXCLUSIONS - Central patterns that apply to ALL audits
 *    Location: .audit-reports/audit-global-config.json
 *    Usage: isGloballyExcluded(repoPath)
 *
 * 2. INLINE COMMENTS - For specific, one-off exceptions with inline justification
 *    Format: // @audit-allow:<auditType>:<ruleId> - <reason>
 *
 * 3. CENTRAL ALLOWLIST - Single source of truth for all audit allowlists
 *    Location: .audit-reports/audit-global-config.json under "allowlists.<auditType>"
 *    Usage: loadCentralAllowlist(auditType)
 *
 * 4. PER-AUDIT CONFIG FILE - For priorities, thresholds, and other non-allowlist options only
 *    Location: .audit-reports/<auditType>-audit-config.json
 *
 * 5. NEVER-PERMISSIBLE CATEGORIES - Rule categories that must never be allowlisted (eliminate or migrate)
 *    Location: .audit-reports/audit-global-config.json under "neverPermissibleCategories.<categoryKey>"
 *    Usage: getNeverPermissibleReportSectionLines(), getNeverPermissibleSummaryLine(), getNeverPermissibleNotesLines(),
 *           getNeverPermissibleInstructionsForJson(), calculateScoreWithNeverPermissible()
 *
 * Report conventions (see AUDIT_REPORT_CONVENTIONS.md):
 * - Every audit that emits a .md report must push the standard header at the start of renderMarkdownReport()
 *   using getAuditReportHeaderLines().
 */

/**
 * Standard line to emit at the top of audit report markdown so AI/tooling treats
 * findings as canonical and does not change audit scripts without explicit user approval.
 * Include this in renderMarkdownReport() for any audit that emits a .md report.
 */
export const AUDIT_REPORT_AI_INSTRUCTIONS =
  '**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.'

/**
 * Instruction for AI when fixing findings: search for the same rule/pattern elsewhere and fix consistently.
 * Emit this (together with AUDIT_REPORT_AI_INSTRUCTIONS) at the top of every audit .md report and in JSON instructionsForAi.
 */
export const AUDIT_REPORT_AI_FIX_INSTRUCTIONS =
  '**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.'

/**
 * Returns the standard header lines for audit markdown reports: both AI instructions plus a blank line.
 * Use at the start of renderMarkdownReport(): lines.push(...getAuditReportHeaderLines())
 * For JSON, set instructionsForAi to getAuditReportHeaderLines().join('\n') or AUDIT_REPORT_AI_INSTRUCTIONS + '\n\n' + AUDIT_REPORT_AI_FIX_INSTRUCTIONS.
 * Convention: audits with rule definitions should also emit a top-level "ruleset" in JSON (ruleId, label, severity, description, recommendedFix).
 */
export function getAuditReportHeaderLines() {
  return [
    AUDIT_REPORT_AI_INSTRUCTIONS,
    '',
    AUDIT_REPORT_AI_FIX_INSTRUCTIONS,
    '',
  ]
}

/**
 * Single string combining both AI instructions for JSON instructionsForAi field.
 */
export const AUDIT_REPORT_AI_INSTRUCTIONS_COMBINED =
  AUDIT_REPORT_AI_INSTRUCTIONS + '\n\n' + AUDIT_REPORT_AI_FIX_INSTRUCTIONS

// ─── Phase A: Finding metadata schema (optional fields, non-breaking) ─────────
/** Confidence: high = AST + narrow context, medium = AST only, low = regex/heuristic */
export const CONFIDENCE_LEVELS = Object.freeze({ HIGH: 'high', MEDIUM: 'medium', LOW: 'low' })
/** Detection stage: detector = broad candidate, validator = precision pass */
export const DETECTION_STAGES = Object.freeze({ DETECTOR: 'detector', VALIDATOR: 'validator' })
/** Baseline state: filled during delta comparison */
export const BASELINE_STATES = Object.freeze({ NEW: 'new', REGRESSED: 'regressed', UNCHANGED: 'unchanged', RESOLVED: 'resolved' })
/** How the finding was suppressed (or unsuppressed). Plan enum: unsuppressed | suppressedByPattern | suppressedBySpecific | suppressedInline */
export const SUPPRESSION_STATUS = Object.freeze({
  UNSUPPRESSED: 'unsuppressed',
  SUPPRESSED_BY_PATTERN: 'suppressedByPattern',
  SUPPRESSED_BY_SPECIFIC: 'suppressedBySpecific',
  SUPPRESSED_INLINE: 'suppressedInline',
})

/**
 * Map allowlist source to suppressionStatus.
 * @param {'inline'|'pattern'|'specific'|'linePattern'|null} source
 * @returns {string}
 */
export function sourceToSuppressionStatus(source) {
  if (source === 'inline') return SUPPRESSION_STATUS.SUPPRESSED_INLINE
  if (source === 'pattern' || source === 'linePattern') return SUPPRESSION_STATUS.SUPPRESSED_BY_PATTERN
  if (source === 'specific') return SUPPRESSION_STATUS.SUPPRESSED_BY_SPECIFIC
  return SUPPRESSION_STATUS.UNSUPPRESSED
}

/**
 * Enrich a finding with optional Phase A metadata. Does not mutate; returns new object.
 * Use when building findings so reports can carry confidence, stage, whyFlagged, suppressionStatus, baselineState.
 *
 * @param {object} finding - Base finding (file, lineNumber, ruleId, line/snippet, message, etc.)
 * @param {{ confidence?: string, detectionStage?: string, whyFlagged?: string, suppressionStatus?: string, baselineState?: string }} meta
 * @returns {object}
 */
export function enrichFinding(finding, meta = {}) {
  const out = { ...finding }
  if (meta.confidence != null) out.confidence = meta.confidence
  if (meta.detectionStage != null) out.detectionStage = meta.detectionStage
  if (meta.whyFlagged != null) out.whyFlagged = meta.whyFlagged
  if (meta.suppressionStatus != null) out.suppressionStatus = meta.suppressionStatus
  if (meta.baselineState != null) out.baselineState = meta.baselineState
  return out
}

/**
 * Two-phase detection: run detector candidates through a validator; attach detectionStage to passed items.
 * Phase A framework for detectorPass (broad) -> validatorPass (precision).
 *
 * @param {Array<object>} candidates - Raw findings from detector pass
 * @param {(candidate: object) => boolean} validate - Return true to keep the finding
 * @param {{ stagePassed?: string, stageDropped?: string }} [opts] - detectionStage for passed/dropped (default: 'validator' / 'detector')
 * @returns {{ passed: object[], dropped: object[] }}
 */
export function runTwoPhaseFilter(candidates, validate, opts = {}) {
  const stagePassed = opts.stagePassed ?? DETECTION_STAGES.VALIDATOR
  const stageDropped = opts.stageDropped ?? DETECTION_STAGES.DETECTOR
  const passed = []
  const dropped = []
  for (const c of candidates) {
    if (validate(c)) {
      passed.push({ ...c, detectionStage: stagePassed })
    } else {
      dropped.push({ ...c, detectionStage: stageDropped })
    }
  }
  return { passed, dropped }
}

/**
 * Compute a stable identity key for a finding (for delta comparison).
 * Uses file, lineNumber, ruleId, and normalized snippet (trimmed, truncated).
 *
 * @param {object} f - Finding with file, lineNumber, ruleId, line or snippet
 * @param {number} [snippetMaxLen=120]
 * @returns {string}
 */
export function findingIdentityKey(f, snippetMaxLen = 120) {
  const snippet = (f.line ?? f.snippet ?? '').trim().slice(0, snippetMaxLen)
  return `${f.file}\t${f.lineNumber}\t${f.ruleId}\t${snippet}`
}

/**
 * Path to the previous run's audit JSON (convention: *-audit-previous.json in same dir as audit JSON).
 *
 * @param {string} auditType
 * @param {{ auditOutputSubdir?: string }} [options]
 * @returns {string}
 */
export function getPreviousAuditJsonPath(auditType, options = {}) {
  const { auditDir } = resolveSummaryPaths(auditType, options)
  return path.join(auditDir, `${auditType}-audit-previous.json`)
}

/**
 * Load previous audit snapshot JSON if it exists.
 *
 * @param {string} previousJsonPath - From getPreviousAuditJsonPath()
 * @returns {object | null} Parsed payload or null if missing/invalid
 */
export function loadPreviousAuditSnapshot(previousJsonPath) {
  if (!fs.existsSync(previousJsonPath)) return null
  try {
    const raw = fs.readFileSync(previousJsonPath, 'utf8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Compute delta between current and previous findings. Each finding must have file, lineNumber, ruleId, and optionally line/snippet.
 *
 * @param {Array<object>} currentFindings - Flat list with file, lineNumber, ruleId, line/snippet
 * @param {Array<object>} previousFindings - Same shape
 * @param {(f: object) => string} [getKey] - Identity key function (default: findingIdentityKey)
 * @returns {{ newFindings: object[], unchangedFindings: object[], resolvedFindings: object[], regressedFindings: object[], counts: object, byRule: object }}
 */
export function computeFindingDelta(currentFindings, previousFindings, getKey = findingIdentityKey) {
  const cur = Array.isArray(currentFindings) ? currentFindings : []
  const prev = Array.isArray(previousFindings) ? previousFindings : []
  const prevKeys = new Set(prev.map(getKey))
  const curKeys = new Set(cur.map(getKey))

  const newFindings = cur.filter(f => !prevKeys.has(getKey(f)))
  const unchangedFindings = cur.filter(f => prevKeys.has(getKey(f)))
  const resolvedFindings = prev.filter(f => !curKeys.has(getKey(f)))
  const regressedFindings = [] // Phase A: no severity/confidence comparison yet

  const byRule = {}
  function inc(r, state) {
    if (!byRule[r]) byRule[r] = { new: 0, unchanged: 0, resolved: 0, regressed: 0 }
    byRule[r][state]++
  }
  for (const f of newFindings) inc(f.ruleId || 'unknown', 'new')
  for (const f of unchangedFindings) inc(f.ruleId || 'unknown', 'unchanged')
  for (const f of resolvedFindings) inc(f.ruleId || 'unknown', 'resolved')
  for (const f of regressedFindings) inc(f.ruleId || 'unknown', 'regressed')

  return {
    newFindings,
    unchangedFindings,
    resolvedFindings,
    regressedFindings,
    counts: {
      new: newFindings.length,
      unchanged: unchangedFindings.length,
      resolved: resolvedFindings.length,
      regressed: regressedFindings.length,
    },
    byRule,
  }
}

/**
 * Extract a flat list of findings for delta comparison. Each item has { file, lineNumber, ruleId, line }.
 * Used by summary runner for audits that support delta. Missing extractor => no delta.
 *
 * @type {Record<string, (data: object) => Array<{ file: string, lineNumber: number, ruleId: string, line?: string }>>}
 */
export const DELTA_FINDING_EXTRACTORS = {
  'type-import'(data) {
    const out = []
    const v = Array.isArray(data.valueImportFromTypeOnlyFile) ? data.valueImportFromTypeOnlyFile : []
    const t = Array.isArray(data.typeUsedAsValue) ? data.typeUsedAsValue : []
    for (const f of v) {
      out.push({
        file: f.file,
        lineNumber: f.lineNumber,
        ruleId: 'value-import-from-type-only-file',
        line: [f.specifier, f.symbol].filter(Boolean).join(' '),
      })
    }
    for (const f of t) {
      out.push({
        file: f.file,
        lineNumber: f.lineNumber,
        ruleId: 'type-used-as-value',
        line: f.symbol ?? '',
      })
    }
    return out
  },
  'type-escape'(data) {
    const findings = Array.isArray(data.findings) ? data.findings : []
    return findings.map(f => ({
      file: f.file ?? f.repoPath,
      lineNumber: f.lineNumber,
      ruleId: f.ruleId ?? 'unknown',
      line: f.line ?? f.snippet ?? '',
    }))
  },
  'error-handling'(data) {
    const files = Array.isArray(data.files) ? data.files : []
    const out = []
    for (const f of files) {
      const repoPath = f.repoPath ?? f.file
      const review = Array.isArray(f.requiresReview) ? f.requiresReview : []
      for (const m of review) {
        out.push({
          file: repoPath,
          lineNumber: m.lineNumber,
          ruleId: m.ruleId ?? 'unknown',
          line: m.line ?? '',
        })
      }
    }
    return out
  },
}

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

// ─── Global Exclusions ────────────────────────────────────────────────────────
// Central exclusion patterns shared by ALL audit scripts.
// Loaded once per audit run from .audit-reports/audit-global-config.json.

let _globalExclusionsCache = undefined

/**
 * Resolve the path to audit-global-config.json from wherever the audit is run.
 * Works whether CWD is client/ or the project root.
 *
 * @returns {string} Absolute path to the global config file
 */
function resolveGlobalConfigPath() {
  const cwd = path.resolve(process.cwd())
  const isClientDir = fs.existsSync(path.join(cwd, 'src'))
  const clientRoot = isClientDir ? cwd : path.join(cwd, 'client')
  return path.join(clientRoot, '.audit-reports', 'audit-global-config.json')
}

/**
 * Resolve project root (same logic as audit scripts). Used for repo-relative paths.
 * @returns {string} Absolute path to project root
 */
function resolveProjectRoot() {
  const cwd = path.resolve(process.cwd())
  const isClientDir = fs.existsSync(path.join(cwd, 'src'))
  return isClientDir ? path.resolve(cwd, '..') : cwd
}

// ─── Audit path resolution and report writing ─────────────────────────────────

/**
 * Resolve all paths an audit script needs: CWD detection, project/client/server roots, output dir and report paths.
 *
 * @param {string} auditType - Audit key (e.g. 'hardcoding', 'type-import')
 * @param {{ outputSubdir?: string }} [options] - Optional. Use outputSubdir: 'typecheck' for typecheck audit (writes under .audit-reports/typecheck/)
 * @returns {{ cwd: string, isClientDir: boolean, projectRoot: string, clientRoot: string, clientSrc: string, serverRoot: string, serverSrc: string, outDir: string, outJson: string, outMd: string, configPath: string }}
 */
export function resolveAuditPaths(auditType, options = {}) {
  const cwd = path.resolve(process.cwd())
  const isClientDir = fs.existsSync(path.join(cwd, 'src'))
  const projectRoot = isClientDir ? path.resolve(cwd, '..') : cwd
  const clientRoot = isClientDir ? cwd : path.join(projectRoot, 'client')
  const clientSrc = path.join(clientRoot, 'src')
  const serverRoot = path.join(projectRoot, 'server')
  const serverSrc = path.join(serverRoot, 'src')

  let outDir
  if (options.outputSubdir) {
    outDir = path.join(clientRoot, '.audit-reports', options.outputSubdir)
  } else {
    outDir = isClientDir ? path.join(cwd, '.audit-reports') : path.join(cwd, 'client', '.audit-reports')
  }

  const outJson = path.join(outDir, `${auditType}-audit.json`)
  const outMd = path.join(outDir, `${auditType}-audit.md`)
  const configPath = path.join(outDir, `${auditType}-audit-config.json`)

  return {
    cwd,
    isClientDir,
    projectRoot,
    clientRoot,
    clientSrc,
    serverRoot,
    serverSrc,
    outDir,
    outJson,
    outMd,
    configPath,
  }
}

/**
 * Convert an absolute path to repo-relative path (forward slashes).
 * @param {string} absPath - Absolute file path
 * @param {string} projectRoot - Project root absolute path
 * @returns {string}
 */
export function toRepoPath(absPath, projectRoot) {
  return path.relative(projectRoot, absPath).replaceAll(path.sep, '/')
}

/**
 * Ensure a directory exists (mkdir -p).
 * @param {string} dirPath - Absolute path to directory
 */
export function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

/**
 * Write audit JSON and Markdown reports; ensures output dir exists.
 *
 * @param {string} auditType - Audit key (e.g. 'hardcoding')
 * @param {object} jsonPayload - Object to serialize as JSON (e.g. audit result)
 * @param {string} mdContent - Full markdown report content
 * @param {{ outputSubdir?: string }} [options] - Optional. Use outputSubdir: 'typecheck' for typecheck audit
 * @returns {{ outJson: string, outMd: string }} Paths written (for logging)
 */
export function writeAuditReports(auditType, jsonPayload, mdContent, options = {}) {
  const paths = resolveAuditPaths(auditType, options)
  ensureDir(paths.outDir)
  fs.writeFileSync(paths.outJson, JSON.stringify(jsonPayload, null, 2))
  fs.writeFileSync(paths.outMd, mdContent)
  return { outJson: paths.outJson, outMd: paths.outMd }
}

/**
 * Return the list of directories to scan for an audit. When AUDIT_FIXTURE_DIRS is set (e.g. by golden-sample runner),
 * returns those dirs (absolute); otherwise returns the default client/server src dirs.
 *
 * @param {string} _auditType - Audit type (for future use)
 * @param {{ projectRoot?: string, clientSrc: string, serverSrc: string }} paths - From resolveAuditPaths
 * @returns {string[]}
 */
export function getAuditScanDirs(_auditType, paths) {
  const envDirs = process.env.AUDIT_FIXTURE_DIRS
  if (envDirs && envDirs.trim()) {
    return envDirs.split(path.delimiter).map((p) => {
      const trimmed = p.trim()
      return path.isAbsolute(trimmed) ? trimmed : path.resolve(paths.projectRoot ?? process.cwd(), trimmed)
    }).filter(Boolean)
  }
  return [paths.clientSrc, paths.serverSrc]
}

/**
 * Resolve paths for the summary runner: where the audit JSON is and where to write the summary MD.
 * For typecheck, the audit writes under .audit-reports/typecheck/, so we pass auditOutputSubdir so the summary reads from there.
 *
 * @param {string} auditType - Audit key (e.g. 'type-import', 'typecheck')
 * @param {{ auditOutputSubdir?: string }} [options] - Optional. Use auditOutputSubdir: 'typecheck' when auditType is 'typecheck'
 * @returns {{ auditDir: string, auditJson: string, summaryMd: string }}
 */
export function resolveSummaryPaths(auditType, options = {}) {
  const paths = resolveAuditPaths(auditType, options.auditOutputSubdir ? { outputSubdir: options.auditOutputSubdir } : {})
  const auditDir = paths.outDir
  const auditJson = path.join(auditDir, `${auditType}-audit.json`)
  const summaryMd = path.join(auditDir, `${auditType}-audit-summary.md`)
  return { auditDir, auditJson, summaryMd }
}

let _rawConfigCache = undefined

function loadRawConfig() {
  if (_rawConfigCache !== undefined) return _rawConfigCache
  const configPath = resolveGlobalConfigPath()
  if (!fs.existsSync(configPath)) {
    _rawConfigCache = {}
    return _rawConfigCache
  }
  try {
    const raw = fs.readFileSync(configPath, 'utf8')
    _rawConfigCache = JSON.parse(raw)
  } catch (err) {
    console.warn(`Warning: Could not parse global audit config at ${configPath}: ${err.message}`)
    _rawConfigCache = {}
  }
  return _rawConfigCache
}

/**
 * Load scan extensions for an audit type. Uses overrides when present, else default.
 * @param {string} auditType - Audit key (e.g. 'unused-code', 'hardcoding')
 * @returns {string[]} Array of extensions (e.g. ['.ts', '.js', '.vue'])
 */
export function loadScanExtensions(auditType) {
  const config = loadRawConfig()
  const scan = config?.scanExtensions
  const defaultExts = scan?.default ?? ['.ts', '.js', '.vue']
  const overrides = scan?.overrides ?? {}
  return Array.isArray(overrides[auditType]) ? overrides[auditType] : defaultExts
}

/**
 * Load audit-specific exclusion patterns (in addition to global exclusions).
 * @param {string} auditType - Audit key (e.g. 'unused-code', 'error-handling')
 * @returns {Array<{pattern: string, reason: string}>}
 */
export function loadAuditExclusions(auditType) {
  const config = loadRawConfig()
  const list = config?.auditExclusions?.[auditType]
  return Array.isArray(list) ? list : []
}

/**
 * List all files an audit should scan, driven entirely by config.
 * Handles: extension filtering, global exclusions, compiled JS detection,
 * directory pruning, audit-specific exclusions, and file-level allowlist skip (ruleIds: ["*"]).
 *
 * @param {string} auditType - Audit key (e.g. 'unused-code', 'hardcoding')
 * @param {string[]} dirs - Absolute paths to scan (e.g. [CLIENT_SRC, SERVER_SRC])
 * @returns {string[]} Absolute file paths to scan
 */
export function listAuditFiles(auditType, dirs) {
  const extensions = loadScanExtensions(auditType)
  const auditExclusions = loadAuditExclusions(auditType)
  const allowlist = loadCentralAllowlist(auditType)
  const projectRoot = resolveProjectRoot()

  function absToRepo(absPath) {
    return path.relative(projectRoot, absPath).replaceAll(path.sep, '/')
  }

  function isFileExcludedByAudit(repoPath) {
    const normalized = repoPath.replaceAll('\\', '/')
    for (const entry of auditExclusions) {
      if (simpleGlobMatch(normalized, entry.pattern)) return true
    }
    return false
  }

  function isFileExcludedByAllowlist(repoPath) {
    if (!allowlist) return false
    for (const pattern of allowlist.patterns) {
      const ruleIds = Array.isArray(pattern.ruleIds) ? pattern.ruleIds : [pattern.ruleIds]
      if (ruleIds.includes('*') && simpleGlobMatch(repoPath, pattern.glob)) return true
    }
    for (const specific of allowlist.specific) {
      const fileMatch = repoPath === specific.file || repoPath.endsWith(specific.file)
      if (!fileMatch) continue
      const specificRuleIds = specific.ruleIds
        ? (Array.isArray(specific.ruleIds) ? specific.ruleIds : [specific.ruleIds])
        : specific.ruleId ? [specific.ruleId] : []
      if (specificRuleIds.includes('*')) return true
    }
    return false
  }

  function matchesExtension(absPath) {
    const ext = path.extname(absPath)
    return extensions.includes(ext)
  }

  function walk(dir, out) {
    if (!fs.existsSync(dir)) return
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const e of entries) {
      const abs = path.join(dir, e.name)
      const repoPath = absToRepo(abs)
      if (e.isDirectory()) {
        if (shouldPruneDirectory(e.name)) continue
        walk(abs, out)
        continue
      }
      if (!e.isFile()) continue
      if (!matchesExtension(abs)) continue
      if (isCompiledJsFile(abs)) continue
      if (isGloballyExcluded(repoPath)) continue
      if (isFileExcludedByAudit(repoPath)) continue
      if (isFileExcludedByAllowlist(repoPath)) continue
      out.push(abs)
    }
  }

  const out = []
  for (const d of dirs) {
    walk(d, out)
  }
  return out
}

/**
 * List files that are test files according to central config (globalExclusions with testFile: true).
 * Used by test-audit to enumerate test files.
 *
 * @param {string[]} dirs - Absolute paths to scan (e.g. [CLIENT_SRC, SERVER_SRC])
 * @returns {string[]} Absolute file paths that are test files
 */
export function listTestFiles(dirs) {
  const projectRoot = resolveProjectRoot()
  const exclusions = loadGlobalExclusions()
  const testEntries = exclusions.filter(e => e.testFile === true)
  const out = []

  function absToRepo(absPath) {
    return path.relative(projectRoot, absPath).replaceAll(path.sep, '/')
  }

  function walk(dir) {
    if (!fs.existsSync(dir)) return
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const e of entries) {
      const abs = path.join(dir, e.name)
      if (e.isDirectory()) {
        if (shouldPruneDirectory(e.name)) continue
        walk(abs)
        continue
      }
      if (!e.isFile()) continue
      const repoPath = absToRepo(abs)
      const normalized = repoPath.replaceAll('\\', '/')
      for (const entry of testEntries) {
        if (simpleGlobMatch(normalized, entry.pattern)) {
          out.push(abs)
          break
        }
      }
    }
  }

  for (const d of dirs) {
    walk(d)
  }
  return out
}

/**
 * Load global exclusion patterns from audit-global-config.json.
 * Result is cached for the lifetime of the process.
 *
 * @returns {Array<{pattern: string, reason: string}>}
 */
export function loadGlobalExclusions() {
  if (_globalExclusionsCache !== undefined) return _globalExclusionsCache

  const configPath = resolveGlobalConfigPath()
  if (!fs.existsSync(configPath)) {
    _globalExclusionsCache = []
    return _globalExclusionsCache
  }

  try {
    const raw = fs.readFileSync(configPath, 'utf8')
    const config = JSON.parse(raw)
    _globalExclusionsCache = config?.globalExclusions ?? []
  } catch (err) {
    console.warn(`Warning: Could not parse global audit config at ${configPath}: ${err.message}`)
    _globalExclusionsCache = []
  }

  return _globalExclusionsCache
}

/**
 * Check whether a repo-relative file path matches any global exclusion pattern.
 * Call this at the top of every audit script's isExcluded() function to apply
 * centralized exclusions (test files, @core, @layouts, node_modules, etc.).
 *
 * Test file exclusions (entries with "testFile": true) are only applied when
 * TEST_ENABLED is false. When testing is enabled, test files are included in
 * audit scans so audits can cover them.
 *
 * @param {string} repoPath - Repo-relative file path (e.g. "client/src/utils/foo.ts")
 * @returns {boolean} true if the file should be excluded from auditing
 */
export function isGloballyExcluded(repoPath) {
  const exclusions = loadGlobalExclusions()
  const normalized = repoPath.replaceAll('\\', '/')
  const testingOn = isTestingEnabled()

  for (const entry of exclusions) {
    if (entry.testFile && testingOn) continue
    if (simpleGlobMatch(normalized, entry.pattern)) return true
  }
  return false
}

let _pruneDirectoriesCache = undefined

/**
 * Derive directory names from global exclusion patterns for use in listFilesRecursive().
 * Exclusion patterns that match a single directory segment (e.g. node_modules, dist)
 * are used to skip recursing into those trees (performance). Cached for process lifetime.
 *
 * @returns {Set<string>}
 */
function getPruneDirectories() {
  if (_pruneDirectoriesCache !== undefined) return _pruneDirectoriesCache
  const exclusions = loadGlobalExclusions()
  const set = new Set()
  for (const entry of exclusions) {
    const p = entry.pattern.replaceAll('\\', '/')
    // **/dirname/** or **/.dirname/** -> add dirname or .dirname
    const match = p.match(/^\*\*\/([^/*]+)\/\*\*$/)
    if (match) set.add(match[1])
  }
  _pruneDirectoriesCache = set
  return _pruneDirectoriesCache
}

/**
 * Check whether a directory name should be pruned (not recursed into) when listing files.
 * Use in listFilesRecursive() to avoid crawling node_modules, dist, .git, etc.
 * Reads from audit-global-config.json globalExclusions (single source of truth).
 *
 * @param {string} dirName - Directory name only (e.g. "node_modules", "dist")
 * @returns {boolean} true if the directory should be skipped
 */
export function shouldPruneDirectory(dirName) {
  return getPruneDirectories().has(dirName)
}

/**
 * Whether testing is enabled for audits and workflow commands.
 *
 * Controlled by APP_STAGE or legacy TEST_ENABLED in project root .env.
 *   APP_STAGE=staging  → returns true (tests on)
 *   TEST_ENABLED=true → returns true (legacy)
 *   Otherwise → returns false (tests off)
 *
 * Same logic is used by workflow command prompts (TEST_CONFIG.enabled in
 * .cursor/commands/testing/utils/test-config.ts) and audit scripts.
 * See BETA_LAUNCH_CHECKLIST Phase 3.0 / 3.0a.
 *
 * @returns {boolean}
 */
export function isTestingEnabled() {
  return process.env.TEST_ENABLED === 'true' || process.env.APP_STAGE === 'staging'
}

/**
 * Whether the repo-relative path is a test file according to central config.
 * Uses globalExclusions entries with "testFile": true (same patterns as test-file exclusions).
 * Use in test-audit and elsewhere so test-file classification is a single source of truth.
 *
 * @param {string} repoPath - Repo-relative file path
 * @returns {boolean}
 */
export function isTestFileFromCentralConfig(repoPath) {
  const exclusions = loadGlobalExclusions()
  const testEntries = exclusions.filter(e => e.testFile === true)
  const normalized = repoPath.replaceAll('\\', '/')
  for (const entry of testEntries) {
    if (simpleGlobMatch(normalized, entry.pattern)) return true
  }
  return false
}

/**
 * Load allowlist for an audit type from the central audit-global-config.json.
 * Use this for audits that centralize allow/ignore lists (e.g. type-escape, type-import).
 * Returns { patterns, specific } for checkConfigAllowlist().
 *
 * @param {string} auditType - Key under allowlists (e.g. 'type-escape', 'type-import')
 * @returns {{patterns: Array, specific: Array, linePatterns: Array}}
 */
export function loadCentralAllowlist(auditType) {
  const configPath = resolveGlobalConfigPath()
  if (!fs.existsSync(configPath)) {
    return { patterns: [], specific: [], linePatterns: [] }
  }
  try {
    const raw = fs.readFileSync(configPath, 'utf8')
    const config = JSON.parse(raw)
    const entry = config?.allowlists?.[auditType]
    return {
      patterns: entry?.patterns ?? [],
      specific: entry?.specific ?? [],
      linePatterns: entry?.linePatterns ?? [],
    }
  } catch (err) {
    console.warn(`Warning: Could not parse central allowlist for ${auditType} at ${configPath}: ${err.message}`)
    return { patterns: [], specific: [], linePatterns: [] }
  }
}

// ─── Never-permissible categories (shared pattern) ───────────────────────────
// Rule categories that are NEVER permissible: no allowlisting; eliminate or migrate.
// Config: audit-global-config.json → neverPermissibleCategories.<categoryKey>
// Use: getNeverPermissibleReportSectionLines(), getNeverPermissibleSummaryLine(),
//      getNeverPermissibleNotesLines(), getNeverPermissibleInstructionsForJson(),
//      calculateScoreWithNeverPermissible().

/**
 * Load a never-permissible category from audit-global-config.json.
 * @param {string} categoryKey - Key under neverPermissibleCategories (e.g. 'legacy-backward-compat')
 * @returns {{ sectionTitle: string, instructions: string, summaryLine: string, notesLines: string[], instructionsForJson: string, ruleIds: string[], findingScore: number } | null}
 */
export function getNeverPermissibleCategory(categoryKey) {
  const config = loadRawConfig()
  const categories = config?.neverPermissibleCategories
  const cat = categories?.[categoryKey]
  if (!cat || typeof cat !== 'object') return null
  return {
    sectionTitle: cat.sectionTitle ?? 'CRITICAL: Findings are NEVER permissible',
    instructions: cat.instructions ?? '',
    summaryLine: cat.summaryLine ?? '',
    notesLines: Array.isArray(cat.notesLines) ? cat.notesLines : [],
    instructionsForJson: cat.instructionsForJson ?? cat.instructions ?? '',
    ruleIds: Array.isArray(cat.ruleIds) ? cat.ruleIds : [],
    findingScore: Number(cat.findingScore) || 10,
  }
}

/**
 * Markdown lines for the "never permissible" report section (## CRITICAL block).
 * Push these after scope/intro and before Purpose (or equivalent).
 * @param {string} categoryKey - Key under neverPermissibleCategories
 * @returns {string[]}
 */
export function getNeverPermissibleReportSectionLines(categoryKey) {
  const cat = getNeverPermissibleCategory(categoryKey)
  if (!cat || !cat.instructions) return []
  return [
    '',
    `## ${cat.sectionTitle}`,
    '',
    `**${cat.instructions}**`,
    '',
  ]
}

/**
 * Single summary line for the Summary section (e.g. bold lead-in).
 * @param {string} categoryKey - Key under neverPermissibleCategories
 * @returns {string}
 */
export function getNeverPermissibleSummaryLine(categoryKey) {
  const cat = getNeverPermissibleCategory(categoryKey)
  return (cat?.summaryLine ?? '').trim() || ''
}

/**
 * Note lines to append to the report's Notes section (each line can be '- **...**' or '- ...').
 * @param {string} categoryKey - Key under neverPermissibleCategories
 * @returns {string[]}
 */
export function getNeverPermissibleNotesLines(categoryKey) {
  const cat = getNeverPermissibleCategory(categoryKey)
  if (!cat?.notesLines?.length) return []
  return cat.notesLines.map((line) => (line.startsWith('- ') ? line : `- ${line}`))
}

/**
 * Short instructions string for JSON report (e.g. neverPermissibleInstructions).
 * @param {string} categoryKey - Key under neverPermissibleCategories
 * @returns {string}
 */
export function getNeverPermissibleInstructionsForJson(categoryKey) {
  const cat = getNeverPermissibleCategory(categoryKey)
  return (cat?.instructionsForJson ?? '').trim() || ''
}

/**
 * Compute total score for requiresReview, using high per-finding score for never-permissible rule IDs.
 * For each match: if match.ruleId is in the category's ruleIds, add category.findingScore; otherwise add getBaseScoreForMatch(match).
 * @param {Array<{ ruleId: string }>} requiresReview - List of findings
 * @param {(m: { ruleId: string }) => number} getBaseScoreForMatch - Function returning base score for one match
 * @param {string} categoryKey - Key under neverPermissibleCategories
 * @returns {number}
 */
export function calculateScoreWithNeverPermissible(requiresReview, getBaseScoreForMatch, categoryKey) {
  const cat = getNeverPermissibleCategory(categoryKey)
  const neverPermissibleIds = cat ? new Set(cat.ruleIds) : new Set()
  const highScore = cat?.findingScore ?? 10
  return requiresReview.reduce((sum, m) => {
    if (neverPermissibleIds.has(m.ruleId)) return sum + highScore
    return sum + getBaseScoreForMatch(m)
  }, 0)
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
    // eslint-disable-next-line security/detect-non-literal-regexp
    new RegExp(`//\\s*@audit-allow:${auditType}:([\\w-]+)\\s*-\\s*(.+)$`),
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
 * Simple glob-like pattern matching (no external dependencies)
 * Supports: ** (any path), * (any segment), exact matches
 *
 * @param {string} filePath - The file path to test
 * @param {string} pattern - The glob pattern
 * @returns {boolean}
 */
function simpleGlobMatch(filePath, pattern) {
  const normalizedPath = filePath.replaceAll('\\', '/')
  const normalizedPattern = pattern.replaceAll('\\', '/')

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
      while (end < normalizedPattern.length &&
             !['*', '?'].includes(normalizedPattern[end])) {
        end++
      }
      segments.push({ type: 'LITERAL', value: normalizedPattern.slice(i, end) })
      i = end
    }
  }

  let regexStr = ''
  for (const seg of segments) {
    switch (seg.type) {
      case 'GLOBSTAR_SLASH':
        regexStr += '(?:[^/]+/)*'
        break
      case 'SLASH_GLOBSTAR':
        regexStr += '/.*'
        break
      case 'GLOBSTAR':
        regexStr += '.*'
        break
      case 'STAR':
        regexStr += '[^/]*'
        break
      case 'QUESTION':
        regexStr += '[^/]'
        break
      case 'LITERAL':
        regexStr += seg.value.replace(/[.+^${}()|[\]\\]/g, '\\$&')
        break
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
 * Check if a match is allowed by config patterns
 *
 * @param {string} repoPath - Repo-relative file path
 * @param {string} ruleId - The rule ID that matched
 * @param {number} lineNumber - Line number of the match
 * @param {{patterns: Array, specific: Array} | null} allowlist - Loaded config allowlist
 * @returns {{allowed: boolean, reason: string | null, source: 'pattern' | 'specific' | null, entryKey?: string}}
 */
export function checkConfigAllowlist(repoPath, ruleId, lineNumber, allowlist) {
  if (!allowlist) {
    return { allowed: false, reason: null, source: null }
  }

  let i = 0
  for (const pattern of allowlist.patterns) {
    const globMatch = simpleGlobMatch(repoPath, pattern.glob)
    if (globMatch) {
      const ruleIds = Array.isArray(pattern.ruleIds) ? pattern.ruleIds : [pattern.ruleIds]
      if (ruleIds.includes(ruleId) || ruleIds.includes('*')) {
        return { allowed: true, reason: pattern.reason, source: 'pattern', entryKey: `pattern:${i}` }
      }
    }
    i++
  }

  i = 0
  for (const specific of allowlist.specific) {
    const fileMatch = repoPath === specific.file || repoPath.endsWith(specific.file)
    if (fileMatch) {
      const specificRuleIds = specific.ruleIds
        ? (Array.isArray(specific.ruleIds) ? specific.ruleIds : [specific.ruleIds])
        : specific.ruleId
          ? [specific.ruleId]
          : []
      if (specificRuleIds.includes(ruleId) || specificRuleIds.includes('*')) {
        if (specific.lineRange) {
          const [start, end] = specific.lineRange
          if (lineNumber >= start && lineNumber <= end) {
            return { allowed: true, reason: specific.reason, source: 'specific', entryKey: `specific:${i}` }
          }
        } else {
          return { allowed: true, reason: specific.reason, source: 'specific', entryKey: `specific:${i}` }
        }
      }
    }
    i++
  }

  return { allowed: false, reason: null, source: null }
}

/**
 * Check if a match is allowed by a line-content regex (e.g. logger metadata, simple return shape).
 *
 * @param {string} lineContent - The source line text
 * @param {string} ruleId - The rule ID that matched
 * @param {Array<{ruleId: string, pattern: string, reason: string}>} linePatterns - From config allowlist
 * @returns {{allowed: boolean, reason: string | null, source: 'linePattern' | null, entryKey?: string}}
 */
export function checkLinePatternAllowlist(lineContent, ruleId, linePatterns) {
  if (!linePatterns?.length || lineContent == null || lineContent === '') {
    return { allowed: false, reason: null, source: null }
  }

  let i = 0
  for (const entry of linePatterns) {
    if (entry.ruleId === ruleId || entry.ruleId === '*') {
      try {
        // eslint-disable-next-line security/detect-non-literal-regexp
        const re = new RegExp(entry.pattern)
        if (re.test(lineContent)) {
          return { allowed: true, reason: entry.reason ?? null, source: 'linePattern', entryKey: `linePattern:${i}` }
        }
      } catch (_err) {
        // Bad pattern in config; skip this entry
      }
    }
    i++
  }

  return { allowed: false, reason: null, source: null }
}

/**
 * Check if a match is allowed by inline comment
 *
 * @param {number} matchLineNumber - Line number of the audit match
 * @param {string} ruleId - The rule ID that matched
 * @param {Array<{lineNumber: number, ruleId: string, reason: string}>} inlineExceptions
 * @returns {{allowed: boolean, reason: string | null}}
 */
export function checkInlineException(matchLineNumber, ruleId, inlineExceptions) {
  for (const exception of inlineExceptions) {
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
 * @param {{patterns: Array, specific: Array, linePatterns?: Array} | null} configAllowlist - Loaded config allowlist
 * @param {string} [lineContent] - Optional source line text for line-pattern allowlist
 * @returns {{allowed: boolean, reason: string | null, source: 'inline' | 'pattern' | 'specific' | 'linePattern' | null, entryKey?: string}}
 */
export function isMatchAllowed(repoPath, ruleId, lineNumber, inlineExceptions, configAllowlist, lineContent) {
  const inlineResult = checkInlineException(lineNumber, ruleId, inlineExceptions)
  if (inlineResult.allowed) {
    return { ...inlineResult, source: 'inline', entryKey: undefined }
  }

  const configResult = checkConfigAllowlist(repoPath, ruleId, lineNumber, configAllowlist)
  if (configResult.allowed) {
    return configResult
  }

  if (lineContent != null && configAllowlist?.linePatterns?.length > 0) {
    const linePatternResult = checkLinePatternAllowlist(lineContent, ruleId, configAllowlist.linePatterns)
    if (linePatternResult.allowed) {
      return linePatternResult
    }
  }

  return { allowed: false, reason: null, source: null }
}

/**
 * Create a suppression hit tracker for Phase A allowlist pruning. Call add(entryKey, ruleId) when a finding is suppressed by an allowlist entry.
 *
 * @returns {{ add: (entryKey: string, ruleId: string) => void, getCounts: () => Record<string, number> }}
 */
export function createSuppressionHitTracker() {
  const counts = Object.create(null)
  return {
    add(entryKey, _ruleId) {
      if (entryKey != null && entryKey !== '') {
        counts[entryKey] = (counts[entryKey] || 0) + 1
      }
    },
    getCounts() {
      return { ...counts }
    },
  }
}

const ALLOWLIST_HIT_HISTORY_FILENAME = 'allowlist-hit-history.json'
const DEFAULT_PRUNE_RUNS_TO_CONSIDER = 5

function getAllowlistHitHistoryPath() {
  return path.join(resolveAuditPaths('type-import').outDir, ALLOWLIST_HIT_HISTORY_FILENAME)
}

/**
 * Return stable entry keys for an audit type's allowlist (pattern:0, specific:0, linePattern:0, ...).
 * @param {string} auditType
 * @returns {string[]}
 */
export function getAllAllowlistEntryKeys(auditType) {
  const w = loadCentralAllowlist(auditType)
  if (!w) return []
  const keys = []
  const patterns = Array.isArray(w.patterns) ? w.patterns : []
  for (let i = 0; i < patterns.length; i++) keys.push(`pattern:${i}`)
  const specific = Array.isArray(w.specific) ? w.specific : []
  for (let i = 0; i < specific.length; i++) keys.push(`specific:${i}`)
  const linePatterns = Array.isArray(w.linePatterns) ? w.linePatterns : []
  for (let i = 0; i < linePatterns.length; i++) keys.push(`linePattern:${i}`)
  return keys
}

/**
 * Load allowlist hit history from disk. Shape: { runs: Array<{ timestamp, auditType, hits }>, maxRuns: number }.
 * @returns {{ runs: Array<{timestamp: string, auditType: string, hits: Record<string, number}>>, maxRuns: number }}
 */
export function loadAllowlistHitHistory() {
  const p = getAllowlistHitHistoryPath()
  if (!fs.existsSync(p)) return { runs: [], maxRuns: DEFAULT_PRUNE_RUNS_TO_CONSIDER }
  try {
    const raw = fs.readFileSync(p, 'utf8')
    const data = JSON.parse(raw)
    return {
      runs: Array.isArray(data.runs) ? data.runs : [],
      maxRuns: typeof data.maxRuns === 'number' ? data.maxRuns : DEFAULT_PRUNE_RUNS_TO_CONSIDER,
    }
  } catch {
    return { runs: [], maxRuns: DEFAULT_PRUNE_RUNS_TO_CONSIDER }
  }
}

const MAX_HISTORY_RUNS = 100

/**
 * Append one run's suppression hits to history. Keeps last MAX_HISTORY_RUNS runs total.
 * @param {string} auditType
 * @param {Record<string, number>} hitCounts - entryKey -> count from createSuppressionHitTracker().getCounts()
 */
export function recordSuppressionHits(auditType, hitCounts) {
  const { runs, maxRuns } = loadAllowlistHitHistory()
  runs.push({
    timestamp: new Date().toISOString(),
    auditType,
    hits: hitCounts && typeof hitCounts === 'object' ? hitCounts : {},
  })
  const trimmed = runs.slice(-MAX_HISTORY_RUNS)
  const outDir = path.dirname(getAllowlistHitHistoryPath())
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(getAllowlistHitHistoryPath(), JSON.stringify({ runs: trimmed, maxRuns }, null, 2))
}

/**
 * Generate allowlist-prune-suggestions.json and .md: entries with zero hits for the last N runs get remove-review.
 * @param {{ runsToConsider?: number }} [opts]
 * @returns {{ jsonPath: string, mdPath: string, suggestions: Array<{auditType: string, entryKey: string, recommendation: string, reason: string}> }}
 */
export function generateAllowlistPruneSuggestions(opts = {}) {
  const runsToConsider = opts.runsToConsider ?? DEFAULT_PRUNE_RUNS_TO_CONSIDER
  const { runs } = loadAllowlistHitHistory()
  const byAudit = Object.create(null)
  for (const r of runs) {
    if (!byAudit[r.auditType]) byAudit[r.auditType] = []
    byAudit[r.auditType].push(r)
  }
  const suggestions = []
  const auditTypes = [...new Set(runs.map((r) => r.auditType))]
  for (const auditType of auditTypes) {
    const keys = getAllAllowlistEntryKeys(auditType)
    const recent = (byAudit[auditType] || []).slice(-runsToConsider)
    if (recent.length < runsToConsider) continue
    for (const entryKey of keys) {
      const allZero = recent.every((run) => (run.hits[entryKey] || 0) === 0)
      if (allZero) {
        suggestions.push({
          auditType,
          entryKey,
          recommendation: 'remove-review',
          reason: `Zero suppression hits in last ${recent.length} runs`,
        })
      }
    }
  }
  const outDir = path.dirname(getAllowlistHitHistoryPath())
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const jsonPath = path.join(outDir, 'allowlist-prune-suggestions.json')
  const mdPath = path.join(outDir, 'allowlist-prune-suggestions.md')
  const payload = { generatedAt: new Date().toISOString(), runsToConsider, suggestions }
  fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2))
  const mdLines = [
    '# Allowlist prune suggestions (Phase A)',
    '',
    `Generated: ${payload.generatedAt}. Entries with zero hits in last ${runsToConsider} runs.`,
    '',
    '| Audit type | Entry key | Recommendation | Reason |',
    '| --- | --- | --- | --- |',
    ...suggestions.map((s) => `| ${s.auditType} | ${s.entryKey} | ${s.recommendation} | ${s.reason} |`),
    '',
  ]
  fs.writeFileSync(mdPath, mdLines.join('\n'))
  return { jsonPath, mdPath, suggestions }
}

/**
 * Separate matches into allowed and requiring-review categories
 *
 * @param {Array<{ruleId: string, lineNumber: number, line: string}>} matches - All matches found
 * @param {string} repoPath - Repo-relative file path
 * @param {string} fileContent - File content for parsing inline exceptions
 * @param {string} auditType - Audit type for inline comment parsing
 * @param {{patterns: Array, specific: Array} | null} configAllowlist - Loaded config allowlist
 * @param {{ add: (entryKey: string, ruleId: string) => void } | null} [suppressionHitTracker] - Optional; record which allowlist entry suppressed each match
 * @returns {{
 *   allowed: Array<{ruleId: string, lineNumber: number, line: string, reason: string, source: string}>,
 *   requiresReview: Array<{ruleId: string, lineNumber: number, line: string}>
 * }}
 */
export function categorizeMatches(matches, repoPath, fileContent, auditType, configAllowlist, suppressionHitTracker = null) {
  const inlineExceptions = parseInlineExceptions(fileContent, auditType)

  const allowed = []
  const requiresReview = []

  for (const match of matches) {
    const result = isMatchAllowed(
      repoPath,
      match.ruleId,
      match.lineNumber,
      inlineExceptions,
      configAllowlist,
      match.line
    )

    const suppressionStatus = sourceToSuppressionStatus(result.source)

    if (result.allowed) {
      if (suppressionHitTracker && result.entryKey) suppressionHitTracker.add(result.entryKey, match.ruleId)
      allowed.push({
        ...match,
        reason: result.reason,
        source: result.source,
        suppressionStatus,
      })
    } else {
      requiresReview.push({ ...match, suppressionStatus: SUPPRESSION_STATUS.UNSUPPRESSED })
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
 * @returns {{totalAllowed: number, totalRequiresReview: number, bySource: {inline: number, pattern: number, specific: number, linePattern: number}}}
 */
export function summarizeExceptions(allFiles) {
  let totalAllowed = 0
  let totalRequiresReview = 0
  const bySource = { inline: 0, pattern: 0, specific: 0, linePattern: 0 }

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
