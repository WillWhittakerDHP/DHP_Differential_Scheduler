/**
 * Contract tests for routes/internal/entities/entityConstants.ts.
 * Asserts field names, temporary ID patterns, and expected values (mirror of client entityFieldConstants).
 * Dependencies: jest.
 */

import {
  FIELD_NAMES,
  TEMPORARY_ID_PATTERNS,
  DEFAULT_VALUES,
  ERROR_MESSAGES,
} from '../entityConstants'

describe('entityConstants contract', () => {
  describe('FIELD_NAMES', () => {
    it('ORDER_INDEX equals orderIndex', () => {
      expect(FIELD_NAMES.ORDER_INDEX).toBe('orderIndex')
    })
    it('BOOKING_MODE equals bookingMode', () => {
      expect(FIELD_NAMES.BOOKING_MODE).toBe('bookingMode')
    })
    it('ID equals id', () => {
      expect(FIELD_NAMES.ID).toBe('id')
    })
    it('ENTITY_KEY equals entityKey', () => {
      expect(FIELD_NAMES.ENTITY_KEY).toBe('entityKey')
    })
  })

  describe('TEMPORARY_ID_PATTERNS', () => {
    it('NEW_PREFIX equals new-', () => {
      expect(TEMPORARY_ID_PATTERNS.NEW_PREFIX).toBe('new-')
    })
  })

  describe('DEFAULT_VALUES', () => {
    it('BOOKING_MODE equals standalone', () => {
      expect(DEFAULT_VALUES.BOOKING_MODE).toBe('standalone')
    })
  })

  describe('ERROR_MESSAGES', () => {
    it('has ENTITY_NOT_FOUND with placeholder', () => {
      expect(ERROR_MESSAGES.ENTITY_NOT_FOUND).toContain('{displayName}')
    })
    it('VALIDATION_FAILED is defined', () => {
      expect(ERROR_MESSAGES.VALIDATION_FAILED).toBeDefined()
    })
  })
})
