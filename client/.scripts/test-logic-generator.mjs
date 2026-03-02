import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'

/**
 * Interactive Test Logic Generator
 *
 * Analyzes source code and presents interactive multiple-choice interface
 * to guide test generation based on:
 * - Function signatures and types
 * - Code comments (LEARNING, WHY, PATTERN)
 * - Conditional logic and edge cases
 * - Existing test patterns
 *
 * Usage: npm run audit:test:generate
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

function _toRepoPath(absPath) {
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
 * Extract function signature details from source code
 */
function extractFunctionDetails(contents, functionName) {
  // Try to find function definition
  // eslint-disable-next-line security/detect-non-literal-regexp
  const functionRegex = new RegExp(
    `export\\s+(?:async\\s+)?function\\s+${functionName}\\s*\\(([^)]*)\\)\\s*(?::\\s*([^{]+))?`,
    's'
  )
  const match = contents.match(functionRegex)
  
  if (!match) {
    // Try const arrow function
    // eslint-disable-next-line security/detect-non-literal-regexp
    const arrowRegex = new RegExp(
      `export\\s+const\\s+${functionName}\\s*=\\s*(?:async\\s+)?\\(([^)]*)\\)\\s*(?::\\s*([^{=]+))?\\s*=>`,
      's'
    )
    const arrowMatch = contents.match(arrowRegex)
    if (arrowMatch) {
      return {
        params: parseParams(arrowMatch[1] || ''),
        returnType: (arrowMatch[2] || '').trim()
      }
    }
    return null
  }
  
  return {
    params: parseParams(match[1] || ''),
    returnType: (match[2] || '').trim()
  }
}

function parseParams(paramString) {
  if (!paramString.trim()) return []
  
  return paramString.split(',').map(p => {
    const trimmed = p.trim()
    const parts = trimmed.split(':')
    const name = parts[0].trim()
    const type = parts[1]?.trim() || 'unknown'
    
    // Check if optional
    const isOptional = name.includes('?') || type.includes('| null') || type.includes('| undefined')
    
    return {
      name: name.replace('?', ''),
      type: type,
      optional: isOptional
    }
  })
}

/**
 * Extract behaviors from code comments
 */
function extractBehaviors(contents) {
  const behaviors = []
  
  // Extract WHY comments (help identify edge cases)
  let m
  const whyRegex = /WHY:\s*(.+?)(?:\n|PATTERN|$)/g
  while ((m = whyRegex.exec(contents)) !== null) {
    behaviors.push({
      type: 'why',
      text: m[1].trim(),
      priority: 'medium'
    })
  }
  
  // Extract PATTERN comments
  const patternRegex = /PATTERN:\s*(.+?)(?:\n|LEARNING|WHY|$)/g
  while ((m = patternRegex.exec(contents)) !== null) {
    behaviors.push({
      type: 'pattern',
      text: m[1].trim(),
      priority: 'medium'
    })
  }
  
  return behaviors
}

/**
 * Identify edge cases from code structure
 */
function identifyEdgeCases(contents, _functionName) {
  const edgeCases = []
  
  // Check for null/undefined handling
  if (contents.includes('if (!') || contents.includes('null') || contents.includes('undefined')) {
    edgeCases.push({
      type: 'null-undefined',
      description: 'Handle null/undefined inputs',
      priority: 'high'
    })
  }
  
  // Check for empty array handling
  if (contents.includes('.map(') || contents.includes('.filter(') || contents.includes('partInstances')) {
    edgeCases.push({
      type: 'empty-array',
      description: 'Handle empty arrays',
      priority: 'medium'
    })
  }
  
  // Check for optional parameters
  if (contents.includes('?:') || contents.includes('| null') || contents.includes('| undefined')) {
    edgeCases.push({
      type: 'optional-params',
      description: 'Handle optional/missing parameters',
      priority: 'medium'
    })
  }
  
  // Check for type guards
  if (contents.includes(': value is') || contents.includes('isComposable')) {
    edgeCases.push({
      type: 'type-validation',
      description: 'Validate input types',
      priority: 'high'
    })
  }
  
  return edgeCases
}

/**
 * Present multiple choice question
 */
function askMultipleChoice(rl, question, options) {
  return new Promise((resolve) => {
    console.log(`\n${question}`)
    options.forEach((option, index) => {
      const label = typeof option === 'string' ? option : option.label
      console.log(`  ${index + 1}. ${label}`)
    })
    console.log(`  0. Skip/None`)
    
    rl.question('\nSelect option (number): ', (answer) => {
      const choice = parseInt(answer, 10)
      if (choice === 0) {
        resolve(null)
      } else if (choice > 0 && choice <= options.length) {
        const selected = typeof options[choice - 1] === 'string' 
          ? { value: options[choice - 1], label: options[choice - 1] }
          : options[choice - 1]
        resolve(selected)
      } else {
        console.log('❌ Invalid choice, please try again')
        resolve(askMultipleChoice(rl, question, options))
      }
    })
  })
}

/**
 * Present yes/no question
 */
function askYesNo(rl, question) {
  return new Promise((resolve) => {
    rl.question(`${question} (y/n): `, (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
    })
  })
}

/**
 * Generate test code based on function and choices
 */
function generateTestCode(functionName, functionDetails, behaviors, edgeCases, testType) {
  const tests = []
  
  if (testType === 'basic' || testType === 'comprehensive') {
    // Basic functionality test
    const paramNames = functionDetails?.params.map(p => p.name).join(', ') || 'input'
    tests.push(`  it('should ${functionName} correctly', () => {
    // Arrange
    const ${paramNames} = createTestInput() // TODO: Create based on function parameters
    
    // Act
    const result = ${functionName}(${paramNames})
    
    // Assert
    expect(result).toBeDefined()
    // TODO: Add specific assertions based on return type: ${functionDetails?.returnType || 'unknown'}
  })`)
  }
  
  if (testType === 'behavioral' || testType === 'comprehensive') {
    // Behavioral tests from comments
    behaviors.filter(b => b.type === 'learning').forEach(behavior => {
      const behaviorDesc = behavior.text.toLowerCase().replace(/\.$/, '')
      tests.push(`  it('should ${behaviorDesc}', () => {
    // Arrange
    const input = createTestInput()
    
    // Act
    const result = ${functionName}(input)
    
    // Assert
    // TODO: Assert that ${behavior.text}
    expect(result).toBeDefined()
  })`)
    })
  }
  
  if (testType === 'edge-cases' || testType === 'comprehensive') {
    // Edge case tests
    edgeCases.forEach(edgeCase => {
      if (edgeCase.type === 'null-undefined') {
        tests.push(`  it('should handle null/undefined input', () => {
    // Arrange
    const nullInput = null
    const undefinedInput = undefined
    
    // Act & Assert
    expect(() => ${functionName}(nullInput)).not.toThrow()
    expect(() => ${functionName}(undefinedInput)).not.toThrow()
    // TODO: Verify expected behavior with null/undefined
  })`)
      } else if (edgeCase.type === 'empty-array') {
        tests.push(`  it('should handle empty array', () => {
    // Arrange
    const inputWithEmptyArray = {
      ...createTestInput(),
      partInstances: []
    }
    
    // Act
    const result = ${functionName}(inputWithEmptyArray)
    
    // Assert
    expect(result).toBeDefined()
    // TODO: Verify expected behavior with empty array
  })`)
      } else if (edgeCase.type === 'type-validation') {
        tests.push(`  it('should validate input types', () => {
    // Arrange
    const invalidInput = 'not a valid input'
    
    // Act & Assert
    // TODO: Should throw error or return specific value?
    expect(() => ${functionName}(invalidInput)).toThrow()
    // or: expect(${functionName}(invalidInput)).toBe(expectedValue)
  })`)
      }
    })
  }
  
  return tests.join('\n\n')
}

/**
 * Find or create test file
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
 * Check if test file contains placeholder tests
 */
function hasPlaceholderTests(content, functionName) {
  // Check for placeholder patterns
  const placeholderPatterns = [
    /expect\(true\)\.toBe\(true\)/,
    /TODO:.*Add.*test/i,
    /TODO:.*Replace.*placeholder/i,
    /should handle basic case.*TODO/i
  ]
  
  // Only check if this function's tests exist - look for the describe block
  const escapedName = functionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // eslint-disable-next-line security/detect-non-literal-regexp
  const functionTestRegex = new RegExp(
    `describe\\(['"]${escapedName}['"].*?\\{([\\s\\S]*?)\\s*\\}`,
    'm'
  )
  
  const match = content.match(functionTestRegex)
  if (!match) return false
  
  const testSection = match[0]
  return placeholderPatterns.some(pattern => pattern.test(testSection))
}

/**
 * Replace placeholder tests with actual test code
 */
function replacePlaceholderTests(content, functionName, newTestCode) {
  // Find the function's test section - match the entire describe block including nested describes
  const escapedName = functionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  
  // Match from the opening describe to the matching closing brace
  // This handles nested describe blocks properly
  let depth = 0
  let startIdx = -1
  let endIdx = -1
  
  // Find the start of the describe block
  // eslint-disable-next-line security/detect-non-literal-regexp
  const startPattern = new RegExp(`describe\\(['"]${escapedName}['"]`, 'm')
  const startMatch = content.match(startPattern)
  
  if (!startMatch) return content
  
  startIdx = startMatch.index
  let i = startIdx
  
  // Find the matching closing brace
  while (i < content.length) {
    if (content[i] === '{') {
      depth++
    } else if (content[i] === '}') {
      depth--
      if (depth === 0) {
        endIdx = i + 1
        break
      }
    }
    i++
  }
  
  if (endIdx === -1) return content
  
  // Extract the describe line and replace the body
  const beforeDescribe = content.substring(0, startIdx)
  const describeLine = content.substring(startIdx, content.indexOf('{', startIdx) + 1)
  const afterBlock = content.substring(endIdx)
  
  // Replace with new test code
  return beforeDescribe + describeLine + '\n' + newTestCode + '\n  }' + afterBlock
}

/**
 * Add tests to existing test file or create new one
 */
function addTestsToFile(repoPath, functionName, testCode) {
  const testFilePath = getTestFilePath(repoPath)
  const testFileAbs = path.join(PROJECT_ROOT, testFilePath)
  
  // Ensure directory exists
  const testDir = path.dirname(testFileAbs)
  fs.mkdirSync(testDir, { recursive: true })
  
  let existingContent = ''
  if (fs.existsSync(testFileAbs)) {
    existingContent = fs.readFileSync(testFileAbs, 'utf8')
  }
  
  // Check if function already has tests
  if (existingContent.includes(`describe('${functionName}'`)) {
    // Check if they're placeholder tests
    if (hasPlaceholderTests(existingContent, functionName)) {
      console.log(`🔄 Replacing placeholder tests for ${functionName} in ${testFilePath}`)
      const updatedContent = replacePlaceholderTests(existingContent, functionName, testCode)
      fs.writeFileSync(testFileAbs, updatedContent, 'utf8')
      return true
    } else {
      console.log(`⚠️  Tests for ${functionName} already exist in ${testFilePath}`)
      return false
    }
  }
  
  // Generate import if needed
  const importPath = repoPath.replace(/\.ts$/, '').replace(/\.tsx$/, '').replace(/^src\//, '@/')
  const importStatement = `import { ${functionName} } from '${importPath}'`
  
  // If file doesn't exist, create it with header
  if (!existingContent) {
    const baseName = path.basename(repoPath, path.extname(repoPath))
    const header = `/**
 * ${baseName.toUpperCase()} TESTS
 * 
 * Unit tests for ${baseName}.
 * Generated by test-logic-generator
 */

import { describe, it, expect } from 'vitest'
${importStatement}

describe('${baseName}', () => {
  describe('${functionName}', () => {
${testCode}
  })
})
`
    fs.writeFileSync(testFileAbs, header, 'utf8')
  } else {
    // Add to existing file
    // Try to add import if missing
    if (!existingContent.includes(importStatement) && !existingContent.includes(functionName)) {
      const importRegex = /(import\s+.*\s+from\s+['"][^'"]+['"])/
      const lastImport = existingContent.match(importRegex)
      if (lastImport) {
        const insertPoint = lastImport.index + lastImport[0].length
        existingContent = existingContent.slice(0, insertPoint) + 
          `\n${importStatement}` + 
          existingContent.slice(insertPoint)
      }
    }
    
    // Add test code before final closing braces
    const lastDescribe = existingContent.lastIndexOf('describe(')
    if (lastDescribe !== -1) {
      const insertPoint = existingContent.lastIndexOf('})')
      existingContent = existingContent.slice(0, insertPoint) + 
        `\n  describe('${functionName}', () => {\n${testCode}\n  })\n` +
        existingContent.slice(insertPoint)
    }
  }
  
  return true
}

/**
 * Interactive test generation workflow
 */
async function interactiveTestGeneration() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  try {
    // Load audit data
    console.log('📊 Loading audit data...')
    const auditData = loadAuditData()
    const highPriorityFiles = auditData.untestedSource
      .filter(f => (f.priority?.overall || 0) >= 7.0 && f.exportCount > 0)
      .sort((a, b) => (b.priority?.overall || 0) - (a.priority?.overall || 0))
    
    console.log(`\n🧪 Interactive Test Logic Generator`)
    console.log(`Found ${highPriorityFiles.length} high-priority files to test\n`)
    
    if (highPriorityFiles.length === 0) {
      console.log('No high-priority files found. Run audit:test first.')
      return
    }
    
    // Ask which file to start with
    const fileOptions = highPriorityFiles.slice(0, 15).map((file) => ({
      value: file,
      label: `${file.repoPath} (Priority: ${file.priority?.overall.toFixed(1)}, ${file.exportCount} exports)`
    }))
    
    const selectedFile = await askMultipleChoice(
      rl,
      'Which file would you like to generate tests for?',
      fileOptions
    )
    
    if (!selectedFile) {
      console.log('No file selected. Exiting.')
      return
    }
    
    const file = selectedFile.value
    const absPath = path.join(PROJECT_ROOT, file.repoPath)
    
    if (!fs.existsSync(absPath)) {
      console.log(`❌ File not found: ${file.repoPath}`)
      return
    }
    
    const contents = fs.readFileSync(absPath, 'utf8')
    
    console.log(`\n📄 Analyzing: ${file.repoPath}`)
    console.log(`   Priority: ${file.priority?.overall.toFixed(1)}`)
    console.log(`   Reliability: ${file.priority?.reliability}, ROI: ${file.priority?.roi}`)
    console.log(`   Functions: ${file.functions.join(', ')}`)
    
    // For each function, analyze and present options
    for (const funcName of file.functions) {
      console.log(`\n\n🔍 Analyzing function: ${funcName}`)
      
      const functionDetails = extractFunctionDetails(contents, funcName)
      const behaviors = extractBehaviors(contents)
      const edgeCases = identifyEdgeCases(contents, funcName)
      
      // Show what we found
      if (behaviors.length > 0) {
        console.log('\n📝 Behaviors identified from comments:')
        behaviors.forEach((b, i) => {
          console.log(`   ${i + 1}. [${b.type.toUpperCase()}] ${b.text}`)
        })
      }
      
      if (edgeCases.length > 0) {
        console.log('\n⚠️  Edge cases identified:')
        edgeCases.forEach((ec, i) => {
          console.log(`   ${i + 1}. ${ec.description}`)
        })
      }
      
      if (functionDetails) {
        console.log('\n📋 Function signature:')
        console.log(`   Parameters: ${functionDetails.params.map(p => `${p.name}${p.optional ? '?' : ''}: ${p.type}`).join(', ')}`)
        console.log(`   Returns: ${functionDetails.returnType || 'unknown'}`)
      }
      
      // Present test generation options
      const testOptions = [
        { value: 'basic', label: 'Generate basic test template' },
        { value: 'behavioral', label: 'Generate behavioral tests based on comments' },
        { value: 'edge-cases', label: 'Generate edge case tests' },
        { value: 'comprehensive', label: 'Generate comprehensive test suite (all of the above)' }
      ]
      
      const testChoice = await askMultipleChoice(
        rl,
        `\nWhat type of tests should we generate for ${funcName}?`,
        testOptions
      )
      
      if (testChoice) {
        // Generate test code
        const generatedTests = generateTestCode(
          funcName,
          functionDetails,
          behaviors,
          edgeCases,
          testChoice.value
        )
        
        console.log('\n📋 Generated test code:')
        console.log('═'.repeat(70))
        console.log(generatedTests)
        console.log('═'.repeat(70))
        
        const approve = await askYesNo(rl, '\n✅ Approve and add to test file?')
        
        if (approve) {
          const added = addTestsToFile(file.repoPath, funcName, generatedTests)
          if (added) {
            console.log(`✅ Tests added to ${getTestFilePath(file.repoPath)}`)
          }
        } else {
          console.log('⏭️  Skipped')
        }
      }
      
      // Ask if user wants to continue with next function
      if (file.functions.length > 1 && funcName !== file.functions[file.functions.length - 1]) {
        const continueNext = await askYesNo(rl, `\nContinue with next function?`)
        if (!continueNext) break
      }
    }
    
    console.log('\n✅ Test generation session complete!')
    console.log('\n💡 Next steps:')
    console.log('   1. Review generated tests')
    console.log('   2. Fill in TODO comments with actual test logic')
    console.log('   3. Run tests: npm run test')
    console.log('   4. Run audit again: npm run audit:test')
    
  } catch (_error) {
    console.error('❌ Error:', _error.message)
    console.error(_error.stack)
  } finally {
    rl.close()
  }
}

/**
 * Non-interactive mode: Accept parameters via command line or JSON config
 */
function nonInteractiveMode(config) {
  const auditData = loadAuditData()
  const highPriorityFiles = auditData.untestedSource
    .filter(f => (f.priority?.overall || 0) >= 7.0 && f.exportCount > 0)
    .sort((a, b) => (b.priority?.overall || 0) - (a.priority?.overall || 0))
  
  const file = highPriorityFiles.find(f => f.repoPath === config.file) || highPriorityFiles[0]
  
  if (!file) {
    console.error('No file found matching criteria')
    return
  }
  
  const absPath = path.join(PROJECT_ROOT, file.repoPath)
  if (!fs.existsSync(absPath)) {
    console.error(`File not found: ${file.repoPath}`)
    return
  }
  
  const contents = fs.readFileSync(absPath, 'utf8')
  
  console.log(`📄 Generating tests for: ${file.repoPath}`)
  
  const results = []
  
  for (const funcName of config.functions || file.functions) {
    const functionDetails = extractFunctionDetails(contents, funcName)
    const behaviors = extractBehaviors(contents)
    const edgeCases = identifyEdgeCases(contents, funcName)
    
    const testType = config.testType || 'comprehensive'
    const generatedTests = generateTestCode(funcName, functionDetails, behaviors, edgeCases, testType)
    
    const added = addTestsToFile(file.repoPath, funcName, generatedTests)
    if (added) {
      results.push({ function: funcName, testFile: getTestFilePath(file.repoPath), success: true })
      console.log(`✅ Generated tests for ${funcName}`)
    } else {
      results.push({ function: funcName, success: false, reason: 'Tests already exist' })
      console.log(`⏭️  Skipped ${funcName} (tests already exist)`)
    }
  }
  
  return {
    file: file.repoPath,
    results
  }
}

function main() {
  // Check for non-interactive mode (via command line args or environment)
  const args = process.argv.slice(2)
  const isNonInteractive = process.env.NON_INTERACTIVE === 'true' || args.includes('--non-interactive')
  
  if (isNonInteractive) {
    // Try to read config from args
    let config = {}
    
    // Check for JSON config file
    const configFileIndex = args.indexOf('--config')
    if (configFileIndex !== -1 && args[configFileIndex + 1]) {
      const configPath = args[configFileIndex + 1]
      const configContent = fs.readFileSync(configPath, 'utf8')
      config = JSON.parse(configContent)
    } else {
      // Try to parse JSON from args (look for JSON string)
      const jsonArgIndex = args.findIndex(arg => arg.startsWith('{'))
      if (jsonArgIndex !== -1) {
        try {
          config = JSON.parse(args[jsonArgIndex])
        } catch (e) {
          console.error('Failed to parse JSON config:', e.message)
          process.exit(1)
        }
      } else {
        // Use defaults: first high-priority file, all functions, comprehensive tests
        config = {
          testType: 'comprehensive'
        }
      }
    }
    
    try {
      const result = nonInteractiveMode(config)
      console.log('\n✅ Test generation complete!')
      if (result) {
        // Output JSON result for programmatic use
        console.log('\n---RESULT---')
        console.log(JSON.stringify(result, null, 2))
        console.log('---ENDRESULT---')
      }
    } catch (_error) {
      console.error('Error:', _error.message)
      process.exit(1)
    }
  } else {
    // Interactive mode
    interactiveTestGeneration().catch(console.error)
  }
}

main()
