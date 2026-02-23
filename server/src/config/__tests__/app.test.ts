
import { envConfig } from '../app'

describe('app config contract', () => {
  it('exports envConfig with expected shape', () => {
    expect(envConfig).toBeDefined()
    expect(typeof envConfig.PORT).toBe('number')
    expect(envConfig.NODE_ENV).toBeDefined()
  })
})
