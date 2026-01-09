/**
 * VITEST CONFIGURATION
 * 
 * Configuration for Vitest test runner with coverage thresholds.
 */

import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/utils/__tests__/setup.ts'],
    // LEARNING: Force a stable, single-process pool.
    // WHY: In this repo's environment, the default tinypool worker strategy has intermittently crashed
    //      (stack overflow / minThreads vs maxThreads conflicts). Single fork is deterministic.
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
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**',
        '**/mocks/**',
        '**/factories/**',
        '**/__tests__/**',
        'src/@core/**', // Exclude third-party template code
        'src/@layouts/**', // Exclude third-party template code
      ],
      thresholds: {
        global: {
          branches: 60,
          functions: 60,
          lines: 60,
          statements: 60,
        },
        // Critical business logic - high coverage
        'src/utils/transformers/': {
          branches: 80,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'src/composables/useBooking*.ts': {
          branches: 80,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'src/utils/differentialScheduling.ts': {
          branches: 80,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'src/utils/timeSlotCalculations.ts': {
          branches: 80,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@core': fileURLToPath(new URL('./src/@core', import.meta.url)),
      '@layouts': fileURLToPath(new URL('./src/@layouts', import.meta.url)),
    },
  },
})

