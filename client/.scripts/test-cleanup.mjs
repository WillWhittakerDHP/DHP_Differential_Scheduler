import fs from 'node:fs'
import path from 'node:path'

/**
 * Test Cleanup Script
 *
 * Goal: Generate test stubs for high-priority untested files based on test audit results
 * - Creates test files for files with priority >= 7.0
 * - Follows existing test patterns
 * - Generates cleanup report
 *
 * Usage:
 *   npm run audit:test:cleanup
 */

// Detect if we're running from client/ or project root
const CWD = path.resolve(process.cwd())
const CLIENT_SRC = path.join(CWD, 'src')
const _PROJECT_ROOT_SRC = path.join(CWD, 'client', 'src')

const IS_CLIENT_DIR = fs.existsSync(CLIENT_SRC)
const PROJECT_ROOT = IS_CLIENT_DIR ? CWD : CWD
const _SRC_DIR = IS_CLIENT_DIR
  ? path.join(CWD, 'src')
  : path.join(CWD, 'client', 'src')

const AUDIT_DIR = IS_CLIENT_DIR
  ? path.join(CWD, '.audit-reports')
  : path.join(CWD, 'client', '.audit-reports')
const AUDIT_JSON = path.join(AUDIT_DIR, 'test-audit.json')
const OUT_REPORT = path.join(AUDIT_DIR, 'test-cleanup-report.md')

const PRIORITY_THRESHOLD = 7.0 // Only generate tests for files with priority >= 7.0

function toRepoPath(absPath) {
  return path.relative(PROJECT_ROOT, absPath).replaceAll(path.sep, '/')
}

function loadAuditData() {
  if (!fs.existsSync(AUDIT_JSON)) {
    console.error(`Error: Test audit JSON not found at ${AUDIT_JSON}`)
    console.error(`Please run 'npm run audit:test' first to generate the audit data.`)
    process.exit(1)
  }
  const raw = fs.readFileSync(AUDIT_JSON, 'utf8')
  return JSON.parse(raw)
}

/**
 * Determine test file path for a source file
 */
function getTestFilePath(repoPath) {
  const dirName = path.dirname(repoPath)
  const baseName = path.basename(repoPath, path.extname(repoPath))
  
  // Check if __tests__ directory exists
  const testDir = path.join(dirName, '__tests__')
  const testDirAbs = path.join(PROJECT_ROOT, testDir)
  
  if (fs.existsSync(testDirAbs)) {
    return path.join(testDir, `${baseName}.test.ts`)
  }
  
  // Otherwise, create test file next to source
  return path.join(dirName, `${baseName}.test.ts`)
}

/**
 * Generate test stub content based on file type and exports
 */
function generateTestStub(repoPath, fileData) {
  const { functions, classes, composables, priority } = fileData
  const baseName = path.basename(repoPath, path.extname(repoPath))
  const isComposable = composables.length > 0
  const isTransformer = repoPath.includes('/transformers/')
  const _isUtility = repoPath.includes('/utils/') && !isTransformer
  
  // Determine import path (use @/ alias)
  const importPath = repoPath.replace(/\.ts$/, '').replace(/\.tsx$/, '').replace(/^src\//, '@/')
  const imports = []
  const testCases = []
  
  // Generate imports
  if (isComposable) {
    for (const comp of composables) {
      imports.push(`import { ${comp} } from '${importPath}'`)
    }
  } else if (classes.length > 0) {
    for (const cls of classes) {
      imports.push(`import { ${cls} } from '${importPath}'`)
    }
  } else if (functions.length > 0) {
    imports.push(`import { ${functions.join(', ')} } from '${importPath}'`)
  }
  
  // Generate test cases
  if (isComposable) {
    for (const comp of composables) {
      testCases.push(`  describe('${comp}', () => {
    it('should be defined', () => {
      // TODO: Add behavioral tests
      expect(true).toBe(true)
    })
  })`)
    }
  } else if (classes.length > 0) {
    for (const cls of classes) {
      testCases.push(`  describe('${cls}', () => {
    describe('constructor', () => {
      it('should create instance', () => {
        // TODO: Add constructor tests
        expect(true).toBe(true)
      })
    })
  })`)
    }
  } else if (functions.length > 0) {
    for (const fn of functions) {
      testCases.push(`  describe('${fn}', () => {
    it('should handle basic case', () => {
      // TODO: Add behavioral tests
      expect(true).toBe(true)
    })
    
    it('should handle edge cases', () => {
      // TODO: Add edge case tests (null, undefined, empty, invalid inputs)
      expect(true).toBe(true)
    })
  })`)
    }
  }
  
  const header = `/**
 * ${baseName.toUpperCase()} TESTS
 * 
 * Unit tests for ${baseName}.
 * Priority Score: ${priority.overall.toFixed(1)} (Reliability: ${priority.reliability}, ROI: ${priority.roi}, Independence: ${priority.independence}, Cognitive Load: ${priority.cognitiveLoad})
 * 
 * TODO: Replace placeholder tests with actual behavioral tests
 */`

  return `${header}

import { describe, it, expect } from 'vitest'
${imports.join('\n')}

describe('${baseName}', () => {
${testCases.join('\n\n')}
})
`
}

/**
 * Check if test file already exists
 */
function testFileExists(testFilePath) {
  const absPath = path.join(PROJECT_ROOT, testFilePath)
  return fs.existsSync(absPath)
}

function main() {
  console.log('🧹 Test Cleanup Script')
  console.log('')
  
  const auditData = loadAuditData()
  
  // Filter high-priority untested files
  const highPriorityUntested = auditData.untestedSource
    .filter(file => {
      const priority = file.priority?.overall || 0
      return priority >= PRIORITY_THRESHOLD && file.exportCount > 0
    })
    .sort((a, b) => (b.priority?.overall || 0) - (a.priority?.overall || 0))
  
  console.log(`Found ${highPriorityUntested.length} high-priority untested files (priority >= ${PRIORITY_THRESHOLD})`)
  console.log('')
  
  const actions = {
    created: [],
    skipped: [],
    errors: []
  }
  
  // Generate test stubs
  for (const file of highPriorityUntested) {
    const testFilePath = getTestFilePath(file.repoPath)
    const testFileAbs = path.join(PROJECT_ROOT, testFilePath)
    
    if (testFileExists(testFilePath)) {
      actions.skipped.push({
        source: file.repoPath,
        test: testFilePath,
        reason: 'Test file already exists'
      })
      continue
    }
    
    try {
      // Get full file data from sourceAnalysis
      const fullFileData = auditData.sourceAnalysis.find(
        s => s.repoPath === file.repoPath
      ) || file
      
      const testContent = generateTestStub(file.repoPath, fullFileData)
      
      // Ensure directory exists
      const testDir = path.dirname(testFileAbs)
      fs.mkdirSync(testDir, { recursive: true })
      
      // Write test file
      fs.writeFileSync(testFileAbs, testContent, 'utf8')
      
      actions.created.push({
        source: file.repoPath,
        test: testFilePath,
        priority: file.priority?.overall || 0
      })
      
      console.log(`✅ Created: ${testFilePath}`)
    } catch (error) {
      actions.errors.push({
        source: file.repoPath,
        test: testFilePath,
        error: error.message
      })
      console.error(`❌ Error creating ${testFilePath}: ${error.message}`)
    }
  }
  
  // Generate report
  const reportLines = []
  reportLines.push('# Test Cleanup Report (Generated)')
  reportLines.push('')
  reportLines.push(`Generated at: ${new Date().toISOString()}`)
  reportLines.push('')
  reportLines.push('## Summary')
  reportLines.push('')
  reportLines.push(`- **Test files created**: ${actions.created.length}`)
  reportLines.push(`- **Test files skipped**: ${actions.skipped.length}`)
  reportLines.push(`- **Errors**: ${actions.errors.length}`)
  reportLines.push('')
  
  if (actions.created.length > 0) {
    reportLines.push('## Created Test Files')
    reportLines.push('')
    reportLines.push('| Priority | Source File | Test File |')
    reportLines.push('| --- | ---: | --- | --- |')
    for (const action of actions.created.sort((a, b) => b.priority - a.priority)) {
      reportLines.push(`| ${action.priority.toFixed(1)} | \`${action.source}\` | \`${action.test}\` |`)
    }
    reportLines.push('')
  }
  
  if (actions.skipped.length > 0) {
    reportLines.push('## Skipped (Test File Already Exists)')
    reportLines.push('')
    reportLines.push('| Source File | Test File |')
    reportLines.push('| --- | --- |')
    for (const action of actions.skipped) {
      reportLines.push(`| \`${action.source}\` | \`${action.test}\` |`)
    }
    reportLines.push('')
  }
  
  if (actions.errors.length > 0) {
    reportLines.push('## Errors')
    reportLines.push('')
    reportLines.push('| Source File | Test File | Error |')
    reportLines.push('| --- | --- | --- |')
    for (const action of actions.errors) {
      reportLines.push(`| \`${action.source}\` | \`${action.test}\` | ${action.error} |`)
    }
    reportLines.push('')
  }
  
  reportLines.push('## Next Steps')
  reportLines.push('')
  reportLines.push('1. Review generated test files')
  reportLines.push('2. Replace placeholder tests with actual behavioral tests')
  reportLines.push('3. Add edge case tests (null, undefined, empty, invalid inputs)')
  reportLines.push('4. Add error handling tests')
  reportLines.push('5. Run tests: `npm run test`')
  reportLines.push('')
  
  fs.writeFileSync(OUT_REPORT, reportLines.join('\n'))
  
  console.log('')
  console.log(`✅ Cleanup complete!`)
  console.log(`📄 Created: ${actions.created.length} test files`)
  console.log(`⏭️  Skipped: ${actions.skipped.length} (already exist)`)
  if (actions.errors.length > 0) {
    console.log(`❌ Errors: ${actions.errors.length}`)
  }
  console.log(`📊 Report: ${toRepoPath(OUT_REPORT)}`)
}

main()
