/**
 * JEST SETUP
 * 
 * Global test setup for all Jest tests.
 * Configures database, mocks, and test environment.
 */

import { setupTestDb, teardownTestDb, clearTestData } from './testDb.js'

// Setup test database before all tests
beforeAll(async () => {
  await setupTestDb()
}, 30000) // 30 second timeout for database setup

// Clear data before each test
beforeEach(async () => {
  await clearTestData()
}, 10000) // 10 second timeout

// Close database connection after all tests
afterAll(async () => {
  await teardownTestDb()
}, 10000) // 10 second timeout

// Suppress console.log during tests (can be overridden in individual tests)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
}

