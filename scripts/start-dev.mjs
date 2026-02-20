/**
 * Start dev server (and optionally test watcher) based on root .env.
 * Loads TEST_ENABLED from project root .env; when 'true', runs
 * server + client + test:watch. Otherwise server + client only.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

/** Load root .env and set process.env for KEY=value lines (strip quotes). */
function loadRootEnv() {
  const envPath = path.join(ROOT, '.env')
  if (!fs.existsSync(envPath)) return
  const raw = fs.readFileSync(envPath, 'utf8')
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  }
}

loadRootEnv()
process.env.NODE_ENV = 'development'

const testsEnabled = process.env.TEST_ENABLED === 'true'

// Build first
execSync('npm run build', { stdio: 'inherit', cwd: ROOT, env: process.env })

// Then run server + client (+ optional test watcher)
const concurrentArgs = [
  'npm run server:dev',
  'wait-on tcp:3001 && npm run client:dev',
]
const names = ['server', 'client']
const colors = ['blue', 'green']

if (testsEnabled) {
  concurrentArgs.push('wait-on tcp:3001 && npm run client:test:watch')
  names.push('tests')
  colors.push('yellow')
}

const concurrentlyCmd = `npx concurrently ${concurrentArgs.map(a => `"${a}"`).join(' ')} --names "${names.join(',')}" --prefix-colors "${colors.join(',')}"`
execSync(concurrentlyCmd, { stdio: 'inherit', cwd: ROOT, env: process.env })
