#!/usr/bin/env node
/**
 * Verifies GitHub CLI is installed and authenticated for harness PR creation (`gh pr create`).
 * Run: npm run check:gh
 */

import { spawnSync } from 'node:child_process'

function run(cmd, args) {
  return spawnSync(cmd, args, { encoding: 'utf8' })
}

const gh = run('gh', ['--version'])
if (gh.status !== 0 || !gh.stdout) {
  console.error('GitHub CLI (gh) is not installed or not on PATH.\n')
  console.error('Install: https://cli.github.com/  (macOS: brew install gh)\n')
  process.exit(1)
}

console.log(gh.stdout.trim())

const auth = run('gh', ['auth', 'status'])
if (auth.status !== 0) {
  console.error('\ngh is installed but not authenticated.\n')
  console.error('Interactive (recommended on your Mac):')
  console.error('  gh auth login -h github.com -p https -w\n')
  console.error('Non-interactive / CI: use a PAT with repo scope:')
  console.error('  export GH_TOKEN=ghp_...   # or GITHUB_TOKEN in Actions')
  console.error('  echo "$GH_TOKEN" | gh auth login --with-token -h github.com\n')
  if (auth.stderr?.trim()) console.error(auth.stderr.trim())
  process.exit(1)
}

console.log(auth.stdout.trim())
console.log('\nOK — gh is ready for harness PR creation (session-end / phase-end / feature-end).')
process.exit(0)
