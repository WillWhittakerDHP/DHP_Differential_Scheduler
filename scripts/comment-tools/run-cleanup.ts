#!/usr/bin/env node
/**
 * CLI entrypoint for comment cleanup. Uses shared commentCleanup from .cursor/commands.
 * Run via: npm run comments:cleanup  (invokes this via cleanup-comments.mjs + tsx)
 */
import { commentCleanup, PHASE_CLEANUP_CONFIG } from '../../.cursor/commands/comments/commentCleanup';

(async () => {
  const result = await commentCleanup({ ...PHASE_CLEANUP_CONFIG, dryRun: false });
  console.log(result.summary);
  process.exit(result.success ? 0 : 1);
})();
