/**
 * Vitest config for .cursor/commands tests. Run with: npx vitest --config vitest.config.workspace.cursor.ts
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['.cursor/commands/**/*.test.ts'],
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      // Resolve .cursor/commands imports from repo root
    },
  },
});
