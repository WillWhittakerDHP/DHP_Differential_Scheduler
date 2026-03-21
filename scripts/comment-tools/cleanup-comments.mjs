#!/usr/bin/env node
/**
 * Comment cleanup CLI. Logic lives in .cursor/commands/comments/commentCleanup.ts.
 * This file invokes the TS entrypoint via tsx so npm run comments:cleanup works.
 */
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../..');
const result = spawnSync('npx', ['tsx', 'scripts/comment-tools/run-cleanup.ts'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
});
process.exit(result.status ?? 1);
