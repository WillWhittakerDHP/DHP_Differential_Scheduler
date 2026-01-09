#!/usr/bin/env node
/**
 * Test Generation Helper for AI Assistants
 *
 * Simple wrapper that makes it easy for AI assistants to generate tests
 * by calling the test logic generator in non-interactive mode.
 *
 * Usage from AI:
 *   node scripts/test-generate-for-ai.mjs <file-path> [test-type]
 *
 * Examples:
 *   node scripts/test-generate-for-ai.mjs src/utils/transformers/blockInstanceToSnapshot.ts comprehensive
 *   node scripts/test-generate-for-ai.mjs src/composables/booking/useAvailabilityLogic.ts behavioral
 */

import { spawn } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'

const CWD = path.resolve(process.cwd())
const CLIENT_ROOT = fs.existsSync(path.join(CWD, 'src'))
  ? CWD
  : path.join(CWD, 'client')

const GENERATOR_SCRIPT = path.join(CLIENT_ROOT, 'scripts', 'test-logic-generator.mjs')

const args = process.argv.slice(2)

if (args.length === 0) {
  console.error('Usage: node scripts/test-generate-for-ai.mjs <file-path> [test-type]')
  console.error('  test-type: basic, behavioral, edge-cases, comprehensive (default: comprehensive)')
  process.exit(1)
}

const filePath = args[0]
const testType = args[1] || 'comprehensive'

const config = {
  file: filePath,
  testType: testType
}

const configJson = JSON.stringify(config)

const child = spawn('node', [GENERATOR_SCRIPT, '--non-interactive', configJson], {
  cwd: CLIENT_ROOT,
  stdio: 'inherit',
  env: { ...process.env, NON_INTERACTIVE: 'true' }
})

child.on('close', (code) => {
  process.exit(code || 0)
})

child.on('error', (error) => {
  console.error('Error:', error.message)
  process.exit(1)
})
