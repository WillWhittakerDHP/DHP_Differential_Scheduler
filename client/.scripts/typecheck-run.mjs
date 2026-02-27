import path from 'node:path'
import childProcess from 'node:child_process'
import { fileURLToPath } from 'node:url'

/**
 * Typecheck Audit Runner
 *
 * WHY: Streamlines the report-driven workflow to a single command, mirroring `.audit-reports`:
 * - Generates JSON + full Markdown (`typecheck-audit.mjs`)
 * - Generates index summary Markdown (`typecheck-audit-summary.mjs`)
 *
 * USAGE:
 * - From repo root: `node client/.scripts/typecheck-run.mjs`
 * - From anywhere:  `node /abs/path/to/client/.scripts/typecheck-run.mjs`
 */

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(SCRIPT_DIR, '../..')

function runNodeScript(relativeToRepoRoot) {
  const abs = path.join(REPO_ROOT, relativeToRepoRoot)
  const result = childProcess.spawnSync(process.execPath, [abs], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    env: process.env,
  })

  if (typeof result.status === 'number' && result.status !== 0) {
    process.exitCode = result.status
  }
}

function main() {
  runNodeScript(path.join('client', 'scripts', 'typecheck-audit.mjs'))
  runNodeScript(path.join('client', 'scripts', 'typecheck-audit-summary.mjs'))
}

main()


