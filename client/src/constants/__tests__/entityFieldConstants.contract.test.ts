/**
 * Contract tests for constants/entityFieldConstants.ts.
 * Covers: FIELD_NAMES, TEMPORARY_ID_PATTERNS, DEFAULT_VALUES, ENTITY_STATUS, DISPLAY_LABELS.
 * Validates: no accidental breaking changes to entity field constants (client mirror of server).
 * Dependencies: vitest.
 */

import { describe, it, expect } from 'vitest'
import {
  FIELD_NAMES,
  TEMPORARY_ID_PATTERNS,
  DEFAULT_VALUES,
  ENTITY_STATUS,
  DISPLAY_LABELS,
} from '@/constants/entityFieldConstants'

describe('entityFieldConstants contract', () => {
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
    it('CREATED_AT equals createdAt', () => {
      expect(FIELD_NAMES.CREATED_AT).toBe('createdAt')
    })
    it('UPDATED_AT equals updatedAt', () => {
      expect(FIELD_NAMES.UPDATED_AT).toBe('updatedAt')
    })
    it('ANNOTATIONS equals annotations', () => {
      expect(FIELD_NAMES.ANNOTATIONS).toBe('annotations')
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

  describe('ENTITY_STATUS', () => {
    it('ACTIVE equals Active', () => {
      expect(ENTITY_STATUS.ACTIVE).toBe('Active')
    })
    it('INACTIVE equals Inactive', () => {
      expect(ENTITY_STATUS.INACTIVE).toBe('Inactive')
    })
  })

  describe('DISPLAY_LABELS', () => {
    it('NAME equals Name', () => {
      expect(DISPLAY_LABELS.NAME).toBe('Name')
    })
  })
})
