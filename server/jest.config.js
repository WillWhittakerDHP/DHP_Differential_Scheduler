/**
 * JEST CONFIGURATION FOR SERVER
 * 
 * Configuration for Jest test runner with coverage thresholds.
 */

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
    }],
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup/jestSetup.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/test/**',
    '!src/db/migrations/**',
    '!src/db/seeders/**',
    '!src/db/seedScripts/**',
    '!src/scripts/**',
    '!src/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
    // Critical business logic - high coverage
    './src/utils/availabilities/': {
      branches: 80,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/routes/': {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageReporters: ['text', 'json', 'html', 'lcov'],
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
}

