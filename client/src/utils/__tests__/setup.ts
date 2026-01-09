/**
 * VITEST SETUP
 * 
 * Global test setup for all Vitest tests.
 * Configures mocks, test environment, and global utilities.
 */

import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Reduce noisy debug logging during tests.
// NOTE: `import.meta.env.*` in Vitest is derived from environment variables.
vi.stubEnv('VITE_LOG_LEVEL', 'OFF')

// Setup Vue Test Utils config
config.global.stubs = {
  teleport: true,
  Transition: false,
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as any

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any

// Suppress console errors during tests (can be overridden in individual tests)
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    // Suppress known Vue warnings in tests
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Not implemented: HTMLFormElement.prototype.submit') ||
       args[0].includes('Could not parse CSS stylesheet'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

