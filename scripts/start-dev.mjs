/**
 * Start dev server (and optionally test watcher) based on root .env.
 * Loads APP_STAGE and TEST_ENABLED from project root .env. When TEST_ENABLED=true
 * or APP_STAGE=staging, runs server + client + test:watch. Otherwise server + client only.
 *
 * Modes:
 *   npm run start:dev   → runs kill:ports only if main dev ports (server/client) are in use, or after explicit restart
 *   npm run restart:dev  → always kills dev ports first, then starts (--restart flag; explicit restart)
 */

import fs from 'node:fs'
import path from 'node:path'
import net from 'node:net'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SERVER_PORT = 3001
/** Keep in sync with `client` dev script / vite config (e.g. `vite --port 3002`). */
const CLIENT_DEV_PORT = 3002
const isRestart = process.argv.includes('--restart')

/** Returns true if something is accepting TCP connections on port at 127.0.0.1. */
function isPortInUse(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    const timeout = setTimeout(() => {
      socket.destroy()
      resolve(false)
    }, 2000)
    socket.once('connect', () => {
      clearTimeout(timeout)
      socket.destroy()
      resolve(true)
    })
    socket.once('error', () => {
      clearTimeout(timeout)
      resolve(false)
    })
    socket.connect(port, '127.0.0.1')
  })
}

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

const testsEnabled = process.env.TEST_ENABLED === 'true' || process.env.APP_STAGE === 'staging'

const serverAlreadyUp = await isPortInUse(SERVER_PORT)
const clientDevPortBusy = await isPortInUse(CLIENT_DEV_PORT)
const shouldKillPorts = isRestart || serverAlreadyUp || clientDevPortBusy

if (isRestart) {
  console.log('\n🔄 Restart requested — killing existing processes on dev ports...')
} else if (serverAlreadyUp || clientDevPortBusy) {
  const parts = []
  if (serverAlreadyUp) parts.push(`${SERVER_PORT} (server)`)
  if (clientDevPortBusy) parts.push(`${CLIENT_DEV_PORT} (client)`)
  console.log('\n🔄 Port(s) in use:', parts.join(', '), '— clearing dev ports before start.\n')
}

if (shouldKillPorts) {
  console.log('\n🔌 Killing open dev ports before starting...')
  try {
    execSync('npm run kill:ports', { stdio: 'inherit', cwd: ROOT, env: process.env })
    console.log('✅ Ports cleared.\n')
  } catch {
    console.log('⚠️  No processes found on dev ports (or kill-port unavailable). Continuing.\n')
  }
} else {
  console.log('\n🔌 Dev ports look free — skipping kill:ports.\n')
}

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
