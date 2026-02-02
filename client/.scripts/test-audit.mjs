import fs from 'node:fs'
import path from 'node:path'

/**
 * Test Audit Script
 *
 * Goal: Produce a deterministic inventory of testable code vs. existing tests to:
 * - Identify untested code (functions, classes, composables)
 * - Find orphaned tests (tests without corresponding source)
 * - Analyze test quality (behavioral tests vs. existence checks)
 * - Provide actionable recommendations for test alignment
 *
 * Scope:
 * - Included: client/src and server/src (excluding tests)
 * - Test files: *.test.{ts,tsx,mjs}, *.spec.{ts,tsx,mjs}, __tests__ directories
 *
 * Output:
 * - client/.audit/test-audit.json
 * - client/.audit/test-audit.md
 *
 * Notes:
 * - This is a fast AST-like scan using regex patterns (not full parsing)
 * - It intentionally over-flags; the report is a starting point for test strategy
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
const OUT_JSON = path.join(OUT_DIR, 'test-audit.json')
const OUT_MD = path.join(OUT_DIR, 'test-audit.md')

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

function toRepoPath(absPath) {
  return path.relative(PROJECT_ROOT, absPath).replaceAll(path.sep, '/')
}

function isTestFile(repoPath) {
  return (
    repoPath.includes('/__tests__/') ||
    /\.test\.(ts|tsx|js|jsx)$/.test(repoPath) ||
    /\.spec\.(ts|tsx|js|jsx)$/.test(repoPath)
  )
}

function isSourceFile(repoPath) {
  if (isTestFile(repoPath)) return false
  // Exclude migration files (one-time scripts, not part of application code)
  if (repoPath.includes('/migrations/') || repoPath.includes('/migration') || /migration.*\.(js|mjs|ts)$/i.test(repoPath)) {
    return false
  }
  if (repoPath.includes('/node_modules/')) return false
  if (repoPath.includes('/dist/')) return false
  if (repoPath.includes('/.audit/')) return false
  if (repoPath.includes('/.typecheck/')) return false
  return /\.(ts|tsx|js|jsx|vue|mjs)$/.test(repoPath)
}

function listFilesRecursive(dir) {
  /** @type {string[]} */
  const out = []
  if (!fs.existsSync(dir)) return out
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const abs = path.join(dir, e.name)
    if (e.isDirectory()) {
      // Skip certain directories
      if (e.name === 'node_modules' || e.name === 'dist' || e.name === '.audit-reports' || e.name === '.audit-reports/typecheck') {
        continue
      }
      out.push(...listFilesRecursive(abs))
      continue
    }
    if (e.isFile()) {
      const repoPath = toRepoPath(abs)
      if (isSourceFile(repoPath) || isTestFile(repoPath)) {
        out.push(abs)
      }
    }
  }
  return out
}

/**
 * Extract exported functions from source file
 */
function extractExportedFunctions(contents) {
  const functions = new Set()
  
  // export function functionName(...)
  const functionRegex = /export\s+(?:async\s+)?function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g
  let m
  while ((m = functionRegex.exec(contents)) !== null) {
    functions.add(m[1])
  }
  
  // export const functionName = (...)
  const constFunctionRegex = /export\s+const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(?:async\s+)?\(/g
  while ((m = constFunctionRegex.exec(contents)) !== null) {
    functions.add(m[1])
  }
  
  // export const functionName = function(...)
  const namedFunctionRegex = /export\s+const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(?:async\s+)?function\s*\(/g
  while ((m = namedFunctionRegex.exec(contents)) !== null) {
    functions.add(m[1])
  }
  
  return Array.from(functions).sort()
}

/**
 * Extract exported classes from source file
 */
function extractExportedClasses(contents) {
  const classes = new Set()
  
  // export class ClassName
  const classRegex = /export\s+(?:default\s+)?class\s+([A-Za-z_$][A-Za-z0-9_$]*)/g
  let m
  while ((m = classRegex.exec(contents)) !== null) {
    classes.add(m[1])
  }
  
  return Array.from(classes).sort()
}

/**
 * Extract exported composables (use* functions)
 */
function extractComposables(contents) {
  const composables = new Set()
  
  // export function useXxx(...)
  const useFunctionRegex = /export\s+function\s+(use[A-Za-z0-9_$]+)\s*\(/g
  let m
  while ((m = useFunctionRegex.exec(contents)) !== null) {
    composables.add(m[1])
  }
  
  // export const useXxx = (...)
  const useConstRegex = /export\s+const\s+(use[A-Za-z0-9_$]+)\s*=/g
  while ((m = useConstRegex.exec(contents)) !== null) {
    composables.add(m[1])
  }
  
  return Array.from(composables).sort()
}

/**
 * Extract class methods (public methods that should be tested)
 */
function extractClassMethods(contents, _className) {
  const methods = new Set()
  
  // public methodName(...) or methodName(...) [defaults to public in JS/TS]
  const methodRegex = new RegExp(`(?:public\\s+)?([A-Za-z_$][A-Za-z0-9_$]*)\\s*\\([^)]*\\)\\s*(?:[:{])`, 'g')
  let m
  while ((m = methodRegex.exec(contents)) !== null) {
    // Skip constructor, private methods, getters/setters
    if (m[1] === 'constructor' || m[1].startsWith('_') || m[1].startsWith('private')) {
      continue
    }
    methods.add(m[1])
  }
  
  return Array.from(methods).sort()
}

/**
 * Analyze test file to see what it tests
 */
function analyzeTestFile(contents, _testFilePath) {
  const testedItems = new Set()
  const testPatterns = []
  
  // Look for imports of source files
  const importRegex = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g
  let m
  while ((m = importRegex.exec(contents)) !== null) {
    const _importPath = m[1]
    // Extract function/class names from imports
    const namedImportRegex = /import\s+\{([^}]+)\}\s+from/
    const namedMatch = contents.match(namedImportRegex)
    if (namedMatch) {
      const imports = namedMatch[1].split(',').map(i => i.trim().split(' as ')[0].trim())
      imports.forEach(imp => testedItems.add(imp))
    }
  }
  
  // Look for describe/it blocks that mention function/class names
  const describeRegex = /describe\s*\(['"]([^'"]+)['"]/g
  while ((m = describeRegex.exec(contents)) !== null) {
    testPatterns.push({ type: 'describe', pattern: m[1] })
  }
  
  const itRegex = /it\s*\(['"]([^'"]+)['"]/g
  while ((m = itRegex.exec(contents)) !== null) {
    testPatterns.push({ type: 'it', pattern: m[1] })
  }
  
  // Analyze test quality indicators
  const hasBehavioralTests = /(should|when|given|expect|assert)/i.test(contents)
  const hasEdgeCases = /(edge|error|exception|invalid|missing|null|undefined|empty)/i.test(contents)
  const hasMocking = /(mock|vi\.mock|jest\.mock|spy)/i.test(contents)
  const hasSetup = /(beforeEach|beforeAll|setup|fixture)/i.test(contents)
  
  return {
    testedItems: Array.from(testedItems),
    testPatterns,
    quality: {
      hasBehavioralTests,
      hasEdgeCases,
      hasMocking,
      hasSetup,
      qualityScore: (hasBehavioralTests ? 2 : 0) + (hasEdgeCases ? 2 : 0) + (hasMocking ? 1 : 0) + (hasSetup ? 1 : 0)
    }
  }
}

/**
 * Extract import specifiers from source file
 */
function extractImportSpecifiers(contents) {
  const out = new Set()
  const importRegex = /\bfrom\s+['"]([^'"]+)['"]/g
  let m
  while ((m = importRegex.exec(contents)) !== null) out.add(m[1])
  return Array.from(out.values()).sort()
}

/**
 * Calculate reliability score (0-10)
 * Higher = more critical for system stability
 */
function calculateReliabilityScore(repoPath, functions, classes, composables, contents) {
  let score = 0
  
  // Domain analysis (booking > admin > utils > UI)
  if (repoPath.includes('/utils/transformers/')) score += 4 // Transformers are critical
  if (repoPath.includes('/utils/') && !repoPath.includes('/transformers/')) score += 2
  if (repoPath.includes('/composables/booking/')) score += 5 // Booking logic is critical
  if (repoPath.includes('/composables/admin/')) score += 3
  if (repoPath.includes('/composables/')) score += 2
  if (repoPath.includes('/@core/') || repoPath.includes('/@layouts/')) score += 1 // UI is lower priority
  
  // File type analysis
  if (repoPath.includes('Transformer') || repoPath.includes('transformer')) score += 3
  if (repoPath.includes('calculate') || repoPath.includes('Calculate')) score += 3
  if (repoPath.includes('validate') || repoPath.includes('Validate')) score += 2
  if (repoPath.includes('generate') || repoPath.includes('Generate')) score += 2
  
  // Function naming patterns
  const criticalPatterns = [
    /(calculate|transform|validate|generate|normalize|filter|merge|compose)/i
  ]
  const allExports = [...functions, ...classes, ...composables].join(' ')
  criticalPatterns.forEach(pattern => {
    if (pattern.test(allExports)) score += 1
  })
  
  // Business logic indicators
  if (contents.includes('differential') || contents.includes('scheduling')) score += 2
  if (contents.includes('availability') || contents.includes('timeSlot')) score += 2
  if (contents.includes('fee') || contents.includes('rate')) score += 2
  
  return Math.min(score, 10)
}

/**
 * Calculate independence score (0-10)
 * Higher = more isolated/easier to test
 */
function calculateIndependenceScore(contents, importSpecifiers) {
  let score = 10 // Start high, deduct for dependencies
  
  // Fewer imports = more independent
  const importCount = importSpecifiers.length
  if (importCount > 20) score -= 4
  else if (importCount > 10) score -= 2
  else if (importCount > 5) score -= 1
  
  // Vue reactivity makes testing harder
  const vueReactivity = /(ref|reactive|computed|watch|watchEffect)/.test(contents)
  if (vueReactivity) score -= 2
  
  // External API calls reduce independence
  const hasApiCalls = /(fetch|axios|apiClient|useQuery|useMutation)/.test(contents)
  if (hasApiCalls) score -= 3
  
  // DOM access reduces independence
  const hasDomAccess = /(document|window|HTMLElement)/.test(contents)
  if (hasDomAccess) score -= 2
  
  // Pure function indicators (no side effects)
  const isPureFunction = !vueReactivity && !hasApiCalls && !hasDomAccess && importCount < 5
  if (isPureFunction) score += 2
  
  return Math.max(Math.min(score, 10), 0)
}

/**
 * Calculate ROI score (0-10)
 * Higher = more value from testing
 */
function calculateROIScore(exportCount, repoPath, contents) {
  let score = 0
  
  // More exports = more value
  if (exportCount >= 10) score += 4
  else if (exportCount >= 5) score += 3
  else if (exportCount >= 3) score += 2
  else if (exportCount >= 1) score += 1
  
  // Business logic vs presentation
  if (repoPath.includes('/utils/')) score += 3
  if (repoPath.includes('/composables/')) score += 2
  if (repoPath.includes('/transformers/')) score += 4
  
  // Reusable utilities
  if (contents.includes('export function') && exportCount > 1) score += 2
  
  // Core functionality
  if (repoPath.includes('booking') || repoPath.includes('scheduling')) score += 2
  
  return Math.min(score, 10)
}

/**
 * Calculate cognitive load score (0-10)
 * Higher = more complex/harder to understand
 */
function calculateCognitiveLoadScore(contents, functions, classes, composables) {
  let score = 0
  
  // Lines of code
  const lines = contents.split('\n').length
  if (lines > 500) score += 4
  else if (lines > 300) score += 3
  else if (lines > 200) score += 2
  else if (lines > 100) score += 1
  
  // Number of exports
  const exportCount = functions.length + classes.length + composables.length
  if (exportCount > 10) score += 2
  else if (exportCount > 5) score += 1
  
  // Complexity indicators
  const ifElseCount = (contents.match(/\bif\s*\(/g) || []).length
  const loopCount = (contents.match(/\b(for|while|forEach|map|filter|reduce)\s*\(/g) || []).length
  const asyncCount = (contents.match(/\basync\b/g) || []).length
  const nestedCount = (contents.match(/\{[\s\S]*\{[\s\S]*\{/g) || []).length
  
  score += Math.min(Math.floor(ifElseCount / 5), 2)
  score += Math.min(Math.floor(loopCount / 10), 2)
  score += Math.min(Math.floor(asyncCount / 3), 2)
  score += Math.min(Math.floor(nestedCount / 3), 2)
  
  // Documentation reduces cognitive load
  const hasDocs = /(\/\*\*|\/\/\s*LEARNING|\/\/\s*WHY|\/\/\s*PATTERN)/.test(contents)
  if (hasDocs) score = Math.max(score - 2, 0)
  
  return Math.min(score, 10)
}

/**
 * Calculate overall priority score (0-10)
 * Combines all dimensions with weighted average
 */
function calculatePriorityScore(reliability, independence, roi, cognitiveLoad) {
  // Weighted combination:
  // Reliability: 40% (most important - critical code must be tested)
  // ROI: 30% (value of testing)
  // Independence: 20% (ease of testing)
  // Cognitive Load: 10% (complexity - higher complexity needs tests)
  
  const weightedScore = 
    (reliability * 0.4) +
    (roi * 0.3) +
    (independence * 0.2) +
    (cognitiveLoad * 0.1)
  
  return Math.round(weightedScore * 10) / 10 // Round to 1 decimal
}

/**
 * Assign P0/P1/P2 priority bucket based on overall score
 */
function assignPriorityBucket(overallScore, config) {
  const p0Min = Number(config?.priorities?.p0MinPriorityScore ?? 7.0)
  const p1Min = Number(config?.priorities?.p1MinPriorityScore ?? 4.0)
  
  if (overallScore >= p0Min) return 'P0'
  if (overallScore >= p1Min) return 'P1'
  return 'P2'
}

/**
 * Find corresponding test file for a source file
 */
function findTestFile(sourcePath, allTestFiles) {
  const repoPath = toRepoPath(sourcePath)
  const baseName = path.basename(repoPath, path.extname(repoPath))
  const dirName = path.dirname(repoPath)
  
  // Look for test file in same directory
  const sameDirTest = allTestFiles.find(testPath => {
    const testRepoPath = toRepoPath(testPath)
    const testDir = path.dirname(testRepoPath)
    const testBase = path.basename(testRepoPath, path.extname(testRepoPath))
    return testDir === dirName && (testBase === `${baseName}.test` || testBase === `${baseName}.spec`)
  })
  
  if (sameDirTest) return sameDirTest
  
  // Look for test file in __tests__ directory
  const testDirPath = path.join(dirName, '__tests__')
  const testDirTest = allTestFiles.find(testPath => {
    const testRepoPath = toRepoPath(testPath)
    const testDir = path.dirname(testRepoPath)
    const testBase = path.basename(testRepoPath, path.extname(testRepoPath))
    return testDir === testDirPath && (testBase === baseName || testBase === `${baseName}.test` || testBase === `${baseName}.spec`)
  })
  
  return testDirTest || null
}

function main() {
  ensureDir(OUT_DIR)
  
  // Load priority config
  const CONFIG_PATH = path.join(OUT_DIR, 'test-audit-config.json')
  let priorityConfig = {}
  try {
    const configRaw = fs.readFileSync(CONFIG_PATH, 'utf8')
    priorityConfig = JSON.parse(configRaw)
  } catch (_error) {
    // Config might not exist or be invalid, use defaults
  }
  
  const clientFiles = listFilesRecursive(CLIENT_SRC)
  const serverFiles = listFilesRecursive(SERVER_SRC)
  const allFiles = [...clientFiles, ...serverFiles]
  const sourceFiles = allFiles.filter(f => isSourceFile(toRepoPath(f)))
  const testFiles = allFiles.filter(f => isTestFile(toRepoPath(f)))
  
  const clientSourceCount = clientFiles.filter(f => isSourceFile(toRepoPath(f))).length
  const serverSourceCount = serverFiles.filter(f => isSourceFile(toRepoPath(f))).length
  const clientTestCount = clientFiles.filter(f => isTestFile(toRepoPath(f))).length
  const serverTestCount = serverFiles.filter(f => isTestFile(toRepoPath(f))).length
  
  console.log(`Scanning ${sourceFiles.length} source files (${clientSourceCount} client, ${serverSourceCount} server) and ${testFiles.length} test files (${clientTestCount} client, ${serverTestCount} server)...`)
  
  // Analyze source files
  const sourceAnalysis = sourceFiles.map(absPath => {
    const repoPath = toRepoPath(absPath)
    const contents = fs.readFileSync(absPath, 'utf8')
    const functions = extractExportedFunctions(contents)
    const classes = extractExportedClasses(contents)
    const composables = extractComposables(contents)
    const importSpecifiers = extractImportSpecifiers(contents)
    
    // Extract methods from classes
    const classMethods = {}
    for (const className of classes) {
      classMethods[className] = extractClassMethods(contents, className)
    }
    
    const testFile = findTestFile(absPath, testFiles)
    const exportCount = functions.length + classes.length + composables.length
    
    // Calculate priority scores
    const reliability = calculateReliabilityScore(repoPath, functions, classes, composables, contents)
    const independence = calculateIndependenceScore(contents, importSpecifiers)
    const roi = calculateROIScore(exportCount, repoPath, contents)
    const cognitiveLoad = calculateCognitiveLoadScore(contents, functions, classes, composables)
    const priorityScore = calculatePriorityScore(reliability, independence, roi, cognitiveLoad)
    const priorityBucket = assignPriorityBucket(priorityScore, priorityConfig)
    
    return {
      repoPath,
      absPath,
      functions,
      classes,
      composables,
      classMethods,
      hasTest: !!testFile,
      testFile: testFile ? toRepoPath(testFile) : null,
      exportCount,
      priority: {
        reliability,
        independence,
        roi,
        cognitiveLoad,
        overall: priorityScore,
        bucket: priorityBucket
      }
    }
  })
  
  // Analyze test files
  const testAnalysis = testFiles.map(absPath => {
    const repoPath = toRepoPath(absPath)
    const contents = fs.readFileSync(absPath, 'utf8')
    const analysis = analyzeTestFile(contents, repoPath)
    
    // Try to find corresponding source file
    const baseName = path.basename(repoPath, path.extname(repoPath))
      .replace(/\.(test|spec)$/, '')
    const dirName = path.dirname(repoPath)
    
    // Look for source file
    const possibleSourcePaths = [
      path.join(path.dirname(dirName), `${baseName}.ts`),
      path.join(path.dirname(dirName), `${baseName}.tsx`),
      path.join(dirName.replace('/__tests__', ''), `${baseName}.ts`),
      path.join(dirName.replace('/__tests__', ''), `${baseName}.tsx`),
    ]
    
    const sourceFile = possibleSourcePaths.find(p => {
      const abs = path.join(PROJECT_ROOT, p)
      return fs.existsSync(abs) && isSourceFile(p)
    })
    
    return {
      repoPath,
      absPath,
      ...analysis,
      hasSource: !!sourceFile,
      sourceFile: sourceFile || null
    }
  })
  
  // Calculate coverage
  const untestedSource = sourceAnalysis.filter(s => !s.hasTest)
  const orphanedTests = testAnalysis.filter(t => !t.hasSource)
  
  // Group by directory for better organization
  const byDirectory = new Map()
  for (const source of sourceAnalysis) {
    const dir = path.dirname(source.repoPath)
    if (!byDirectory.has(dir)) {
      byDirectory.set(dir, { sources: [], tests: [] })
    }
    byDirectory.get(dir).sources.push(source)
  }
  for (const test of testAnalysis) {
    const dir = path.dirname(test.repoPath)
    if (!byDirectory.has(dir)) {
      byDirectory.set(dir, { sources: [], tests: [] })
    }
    byDirectory.get(dir).tests.push(test)
  }
  
  const output = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalSourceFiles: sourceAnalysis.length,
      totalTestFiles: testAnalysis.length,
      untestedSourceFiles: untestedSource.length,
      orphanedTestFiles: orphanedTests.length,
      coveragePercentage: sourceAnalysis.length > 0
        ? Math.round(((sourceAnalysis.length - untestedSource.length) / sourceAnalysis.length) * 100)
        : 0
    },
    untestedSource: untestedSource.map(s => ({
      repoPath: s.repoPath,
      functions: s.functions,
      classes: s.classes,
      composables: s.composables,
      exportCount: s.exportCount,
      priority: s.priority
    })),
    orphanedTests: orphanedTests.map(t => ({
      repoPath: t.repoPath,
      quality: t.quality
    })),
    byDirectory: Array.from(byDirectory.entries()).map(([dir, data]) => ({
      directory: dir,
      sourceCount: data.sources.length,
      testCount: data.tests.length,
      untestedCount: data.sources.filter(s => !s.hasTest).length
    })),
    sourceAnalysis,
    testAnalysis
  }
  
  fs.writeFileSync(OUT_JSON, JSON.stringify(output, null, 2))
  
  // Generate markdown report
  const mdLines = []
  mdLines.push('# Test Audit Report (Generated)')
  mdLines.push('')
  mdLines.push(`Generated at: ${output.generatedAt}`)
  mdLines.push('')
  mdLines.push('## Summary')
  mdLines.push('')
  mdLines.push(`- **Total source files**: ${output.summary.totalSourceFiles}`)
  mdLines.push(`- **Total test files**: ${output.summary.totalTestFiles}`)
  mdLines.push(`- **Untested source files**: ${output.summary.untestedSourceFiles}`)
  mdLines.push(`- **Orphaned test files**: ${output.summary.orphanedTestFiles}`)
  mdLines.push(`- **Coverage**: ${output.summary.coveragePercentage}%`)
  mdLines.push('')
  
  mdLines.push('## Untested Source Files (Priority: High)')
  mdLines.push('')
  mdLines.push('These files export functions/classes/composables but have no corresponding test file.')
  mdLines.push('Files are sorted by **Priority Score** (weighted: Reliability 40%, ROI 30%, Independence 20%, Cognitive Load 10%).')
  mdLines.push('')
  
  const highPriorityUntested = untestedSource
    .filter(s => s.exportCount > 0)
    .sort((a, b) => (b.priority?.overall || 0) - (a.priority?.overall || 0))
    .slice(0, 50)
  
  if (highPriorityUntested.length === 0) {
    mdLines.push('- (none)')
  } else {
    mdLines.push('| File | Priority | Reliability | ROI | Independence | Cognitive Load | Exports |')
    mdLines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: |')
    for (const s of highPriorityUntested) {
      const p = s.priority || {}
      mdLines.push(`| \`${s.repoPath}\` | **${p.overall?.toFixed(1) || 'N/A'}** | ${p.reliability || 0} | ${p.roi || 0} | ${p.independence || 0} | ${p.cognitiveLoad || 0} | ${s.exportCount} |`)
    }
  }
  mdLines.push('')
  
  mdLines.push('## Orphaned Test Files (Priority: Medium)')
  mdLines.push('')
  mdLines.push('These test files may not have corresponding source files, or the mapping failed.')
  mdLines.push('')
  
  if (orphanedTests.length === 0) {
    mdLines.push('- (none)')
  } else {
    mdLines.push('| Test File | Quality Score |')
    mdLines.push('| --- | ---: |')
    for (const t of orphanedTests.slice(0, 30)) {
      mdLines.push(`| \`${t.repoPath}\` | ${t.quality.qualityScore} |`)
    }
  }
  mdLines.push('')
  
  mdLines.push('## Coverage by Directory')
  mdLines.push('')
  mdLines.push('| Directory | Sources | Tests | Untested | Coverage % |')
  mdLines.push('| --- | ---: | ---: | ---: | ---: |')
  
  const sortedDirs = Array.from(byDirectory.entries())
    .map(([dir, data]) => {
      const untested = data.sources.filter(s => !s.hasTest).length
      const coverage = data.sources.length > 0
        ? Math.round(((data.sources.length - untested) / data.sources.length) * 100)
        : 100
      return { dir, ...data, untested, coverage }
    })
    .sort((a, b) => a.untested - b.untested)
    .slice(0, 30)
  
  for (const { dir, sources, untested, coverage } of sortedDirs) {
    mdLines.push(`| \`${dir}\` | ${sources.length} | ${sources.filter(s => s.hasTest).length} | ${untested} | ${coverage}% |`)
  }
  mdLines.push('')
  
  mdLines.push('## Recommendations')
  mdLines.push('')
  mdLines.push('### 1. High Priority: Test Critical Business Logic')
  mdLines.push('')
  mdLines.push('Focus on testing files with high **Priority Scores** (sorted above).')
  mdLines.push('')
  mdLines.push('**Priority Scoring Breakdown:**')
  mdLines.push('- **Reliability** (0-10): Criticality for system stability. Higher = more critical.')
  mdLines.push('  - Booking logic, transformers, calculations, validators score highest')
  mdLines.push('- **ROI** (0-10): Return on investment from testing. Higher = more value.')
  mdLines.push('  - More exports, reusable utilities, business logic score higher')
  mdLines.push('- **Independence** (0-10): How isolated/testable the code is. Higher = easier to test.')
  mdLines.push('  - Pure functions, fewer dependencies score higher')
  mdLines.push('- **Cognitive Load** (0-10): Code complexity. Higher = more complex, needs tests.')
  mdLines.push('  - More lines, more complexity indicators, less documentation = higher')
  mdLines.push('')
  mdLines.push('**Overall Priority** = (Reliability × 0.4) + (ROI × 0.3) + (Independence × 0.2) + (Cognitive Load × 0.1)')
  mdLines.push('')
  mdLines.push('Focus on testing:')
  mdLines.push('- Transformers (data transformation logic) - High Reliability + ROI')
  mdLines.push('- Composables with complex state management - High Cognitive Load')
  mdLines.push('- Utility functions used across the codebase - High ROI')
  mdLines.push('- Booking/scheduling logic - High Reliability')
  mdLines.push('')
  
  mdLines.push('### 2. Test Quality Guidelines')
  mdLines.push('')
  mdLines.push('When writing/updating tests, ensure they:')
  mdLines.push('- Test **behaviors**, not just existence')
  mdLines.push('- Include edge cases (null, undefined, empty, invalid inputs)')
  mdLines.push('- Test error handling and error states')
  mdLines.push('- Use proper setup/teardown (beforeEach, afterEach)')
  mdLines.push('- Mock external dependencies appropriately')
  mdLines.push('')
  
  mdLines.push('### 3. Test Structure')
  mdLines.push('')
  mdLines.push('Follow this pattern:')
  mdLines.push('```typescript')
  mdLines.push('describe("FunctionName", () => {')
  mdLines.push('  describe("behavior description", () => {')
  mdLines.push('    it("should do X when Y", () => {')
  mdLines.push('      // Arrange')
  mdLines.push('      // Act')
  mdLines.push('      // Assert')
  mdLines.push('    })')
  mdLines.push('  })')
  mdLines.push('})')
  mdLines.push('```')
  mdLines.push('')
  
  fs.writeFileSync(OUT_MD, mdLines.join('\n'))
  
  console.log(`\n✅ Test audit complete!`)
  console.log(`📊 Coverage: ${output.summary.coveragePercentage}%`)
  console.log(`📝 Untested files: ${output.summary.untestedSourceFiles}`)
  console.log(`🔍 Orphaned tests: ${output.summary.orphanedTestFiles}`)
  console.log(`\n📄 Reports:`)
  console.log(`   - ${toRepoPath(OUT_JSON)}`)
  console.log(`   - ${toRepoPath(OUT_MD)}`)
}

main()
