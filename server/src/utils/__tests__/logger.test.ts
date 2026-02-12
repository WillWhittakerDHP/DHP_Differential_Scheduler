/**
 * Contract tests for server utils/logger.ts.
 * Covers: LogLevel, AppLogger, createLogger, isScopeExplicitlyEnabled.
 * Validates: no accidental breaking changes to logger API.
 * Dependencies: jest.
 */

import type { LogLevel, AppLogger } from '../logger'
import { createLogger, isScopeExplicitlyEnabled } from '../logger'

describe('logger contract', () => {
  describe('LogLevel and AppLogger types', () => {
    it('LogLevel accepts expected literals', () => {
      const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'silent']
      expect(levels).toHaveLength(5)
    })

    it('AppLogger shape has required methods', () => {
      const logger = createLogger('test')
      expect(typeof logger.debug).toBe('function')
      expect(typeof logger.info).toBe('function')
      expect(typeof logger.warn).toBe('function')
      expect(typeof logger.error).toBe('function')
      expect(typeof logger.groupCollapsed).toBe('function')
      expect(typeof logger.groupEnd).toBe('function')
    })
  })

  describe('createLogger', () => {
    it('returns object satisfying AppLogger', () => {
      const logger: AppLogger = createLogger('contract-test')
      expect(logger).toBeDefined()
      logger.debug('test')
      logger.info('test')
      logger.warn('test')
      logger.error('test')
      logger.groupCollapsed('title')
      logger.groupEnd()
    })
  })

  describe('isScopeExplicitlyEnabled', () => {
    it('returns boolean', () => {
      const result = isScopeExplicitlyEnabled('test-scope')
      expect(typeof result).toBe('boolean')
    })
  })
})
