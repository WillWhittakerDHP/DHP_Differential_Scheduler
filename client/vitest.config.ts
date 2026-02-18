
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

// WHY: @vitejs/plugin-vue types are built against vite 7.x, but vitest bundles vite 5.x internally.
// The runtime plugin works fine — only the type signatures clash across major versions.
export default defineConfig({
  plugins: [vue() as any],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/utils/__tests__/setup.ts'],
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
    },
  },
})
