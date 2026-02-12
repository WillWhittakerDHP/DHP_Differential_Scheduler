import { jest, beforeAll, beforeEach, afterAll } from '@jest/globals'
import { setupTestDb, teardownTestDb, clearTestData } from './testDb.js'

beforeAll(async () => {
  await setupTestDb()
}, 30000) // 30 second timeout for database setup

beforeEach(async () => {
  await clearTestData()
}, 10000) // 10 second timeout

afterAll(async () => {
  await teardownTestDb()
}, 10000) // 10 second timeout

global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
}

