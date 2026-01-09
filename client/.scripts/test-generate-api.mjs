import { spawn } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'

/**
 * Test Generation API Wrapper
 *
 * Provides a programmatic interface to the test logic generator
 * that can be called from AI assistants or other automation tools.
 *
 * Usage:
 *   node scripts/test-generate-api.mjs <file> [function1] [function2] ... [--test-type <type>]
 *   or
 *   node scripts/test-generate-api.mjs --config <config.json>
 */

const CWD = path.resolve(process.cwd())
const CLIENT_ROOT = fs.existsSync(path.join(CWD, 'src'))
  ? CWD
  : path.join(CWD, 'client')

const GENERATOR_SCRIPT = path.join(CLIENT_ROOT, 'scripts', 'test-logic-generator.mjs')

function runGenerator(config) {
  return new Promise((resolve, reject) => {
    const configJson = JSON.stringify(config)
    const child = spawn('node', [GENERATOR_SCRIPT, '--non-interactive', configJson], {
      cwd: CLIENT_ROOT,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, NON_INTERACTIVE: 'true' }
    })
    
    let stdout = ''
    let stderr = ''
    
    child.stdout.on('data', (data) => {
      stdout += data.toString()
    })
    
    child.stderr.on('data', (data) => {
      stderr += data.toString()
    })
    
    child.on('close', (code) => {
      if (code === 0) {
        // Try to extract JSON result from output
        const jsonMatch = stdout.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          try {
            resolve(JSON.parse(jsonMatch[0]))
          } catch {
            resolve({ success: true, output: stdout })
          }
        } else {
          resolve({ success: true, output: stdout })
        }
      } else {
        reject(new Error(`Generator failed: ${stderr || stdout}`))
      }
    })
    
    child.on('error', reject)
  })
}

function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Test Generation API

Usage:
  npm run audit:test:generate:api -- <file-path> [options]
  npm run audit:test:generate:api -- --file <path> [options]
  npm run audit:test:generate:api -- --config <config.json>

Options:
  --file <path>              Source file to generate tests for
  --functions <func1,func2>   Comma-separated list of functions (default: all)
  --test-type <type>         Test type: basic, behavioral, edge-cases, comprehensive (default: comprehensive)
  --config <file>             JSON config file

Examples:
  npm run audit:test:generate:api -- src/utils/transformers/blockInstanceToSnapshot.ts
  npm run audit:test:generate:api -- --file src/utils/transformers/blockInstanceToSnapshot.ts --test-type comprehensive
  npm run audit:test:generate:api -- --file src/utils/transformers/blockInstanceToSnapshot.ts --functions blockInstanceToSnapshot
`)
    process.exit(0)
  }
  
  let config = {}
  
  // Parse arguments (handle both --flag value and positional)
  let i = 0
  while (i < args.length) {
    if (args[i] === '--file' && args[i + 1]) {
      config.file = args[i + 1]
      i += 2
    } else if (args[i] === '--functions' && args[i + 1]) {
      config.functions = args[i + 1].split(',').map(f => f.trim())
      i += 2
    } else if (args[i] === '--test-type' && args[i + 1]) {
      config.testType = args[i + 1]
      i += 2
    } else if (args[i] === '--config' && args[i + 1]) {
      const configPath = args[i + 1]
      const configContent = fs.readFileSync(configPath, 'utf8')
      config = { ...config, ...JSON.parse(configContent) }
      i += 2
    } else if (!args[i].startsWith('--') && !config.file) {
      // First positional argument is the file path
      config.file = args[i]
      i += 1
    } else {
      i += 1
    }
  }
  
  // Set defaults
  if (!config.testType) {
    config.testType = 'comprehensive'
  }
  
  if (!config.file) {
    console.error('Error: File path required')
    console.error('Usage: npm run audit:test:generate:api -- <file-path>')
    process.exit(1)
  }
  
  runGenerator(config)
    .then(result => {
      // Output JSON for programmatic use
      console.log(JSON.stringify(result, null, 2))
    })
    .catch(error => {
      console.error('Error:', error.message)
      process.exit(1)
    })
}

main()
