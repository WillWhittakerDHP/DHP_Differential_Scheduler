/**
 * Contract test for config/app.ts.
 * Asserts that key config exports exist (envConfig). May require test DB for full app load.
 * Dependencies: jest.
 */

import { envConfig } from '../app'

describe('app config contract', () => {
  it('exports envConfig with expected shape', () => {
    expect(envConfig).toBeDefined()
    expect(typeof envConfig.PORT).toBe('number')
    expect(envConfig.NODE_ENV).toBeDefined()
  })
})
