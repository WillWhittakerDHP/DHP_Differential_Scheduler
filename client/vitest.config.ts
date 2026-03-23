import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue() as Plugin],
  test: {
    globals: true,
    environment: 'jsdom',
    passWithNoTests: true,
    // WHY: In this repo's environment, the default tinypool worker strategy has intermittently crashed
    pool: 'threads',
    fileParallelism: false,
    poolOptions: {
      threads: {
        singleThread: true,
        isolate: true,
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        '**/*.config.*',
        '**/mockData/**',
        '**/mocks/**',
        '**/factories/**',
        '**/__tests__/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // WHY: Match vite.config.ts so tests resolve shared package imports (e.g. safeDefaults → loggerCore).
      '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
    },
  },
})
