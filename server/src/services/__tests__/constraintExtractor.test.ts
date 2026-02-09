/**
 * CONSTRAINT EXTRACTOR TESTS
 * 
 * Unit tests for server-side constraint extraction utility functions.
 * Tests pure functions for extracting constraints from AvailabilitySettingsData.
 * 
 * What it covers:
 * - extractRangeConstraints: Extract range constraints (businessHours, leadTime, dateRange)
 * - extractOverlapConstraints: Extract overlap constraints (buffers)
 * - extractCapacityConstraints: Extract capacity constraints (daily, calendarWeek, rollingWeek)
 * - validateRangeConstraint: Validate range constraint configuration
 * - validateOverlapConstraint: Validate overlap constraint configuration
 * - validateCapacityConstraint: Validate capacity constraint configuration
 * 
 * How it works:
 * - Tests extraction with valid settings
 * - Tests error handling for missing required constraints
 * - Tests validation for various constraint configurations
 * - Tests edge cases (empty settings, off enforcement, etc.)
 * 
 * Dependencies:
 * - jest for testing
 * - Ported from client/src/utils/booking/__tests__/constraintExtractors.test.ts
 */

import { describe, it, expect } from '@jest/globals'
import {
  extractRangeConstraints,
  extractOverlapConstraints,
  extractCapacityConstraints,
  validateRangeConstraint,
  validateOverlapConstraint,
  validateCapacityConstraint
} from '../constraintExtractor'
import type { AvailabilitySettingsData } from '../../db/models/admin/business_settings'
import type {
  RangeConstraint,
  OverlapConstraint,
  CapacityConstraint,
  RFC3339DateTime,
} from '../../../../shared/types/availabilityTypes.js'

function createAvailabilitySettingsData(
  overrides: Partial<AvailabilitySettingsData> = {}
): AvailabilitySettingsData {
  return {
    businessHours: {
      0: { start: '2000-01-01T09:00:00Z', end: '2000-01-01T17:00:00Z' },
      1: { start: '2000-01-01T09:00:00Z', end: '2000-01-01T17:00:00Z' },
      2: { start: '2000-01-01T09:00:00Z', end: '2000-01-01T17:00:00Z' },
      3: { start: '2000-01-01T09:00:00Z', end: '2000-01-01T17:00:00Z' },
      4: { start: '2000-01-01T09:00:00Z', end: '2000-01-01T17:00:00Z' },
      5: { start: '2000-01-01T09:00:00Z', end: '2000-01-01T17:00:00Z' },
      6: { start: '2000-01-01T09:00:00Z', end: '2000-01-01T17:00:00Z' }
    },
    minuteIncrement: 15,
    rangeConstraints: {
      businessHours: {
        type: 'businessHours',
        enforcement: 'hard',
        config: {
          hours: {
            0: { start: '2000-01-01T09:00:00Z', end: '2000-01-01T17:00:00Z' },
            1: { start: '2000-01-01T09:00:00Z', end: '2000-01-01T17:00:00Z' },
            2: { start: '2000-01-01T09:00:00Z', end: '2000-01-01T17:00:00Z' },
            3: { start: '2000-01-01T09:00:00Z', end: '2000-01-01T17:00:00Z' },
            4: { start: '2000-01-01T09:00:00Z', end: '2000-01-01T17:00:00Z' },
            5: { start: '2000-01-01T09:00:00Z', end: '2000-01-01T17:00:00Z' },
            6: { start: '2000-01-01T09:00:00Z', end: '2000-01-01T17:00:00Z' }
          }
        }
      }
    },
    ...overrides
  } as AvailabilitySettingsData
}

describe('constraintExtractor', () => {
  describe('extractRangeConstraints', () => {
    it('should extract businessHours constraint', () => {
      const settings = createAvailabilitySettingsData()
      
      const result = extractRangeConstraints(settings)
      
      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('businessHours')
      expect(result[0].enforcement).toBe('hard')
    })

    it('should extract leadTime constraint when present', () => {
      const settings = createAvailabilitySettingsData({
        rangeConstraints: {
          businessHours: {
            type: 'businessHours',
            enforcement: 'hard',
            config: { hours: {} as any }
          },
          leadTime: {
            type: 'leadTime',
            enforcement: 'hard',
            config: { minutes: 60 }
          }
        }
      })
      
      const result = extractRangeConstraints(settings)
      
      expect(result).toHaveLength(2)
      expect(result[1].type).toBe('leadTime')
    })

    it('should extract dateRange constraint when present', () => {
      const settings = createAvailabilitySettingsData({
        rangeConstraints: {
          businessHours: {
            type: 'businessHours',
            enforcement: 'hard',
            config: { hours: {} as any }
          },
          dateRange: {
            type: 'dateRange',
            enforcement: 'hard',
            config: {
              start: '2026-01-01T00:00:00Z',
              end: '2026-12-31T23:59:59Z'
            }
          }
        }
      })
      
      const result = extractRangeConstraints(settings)
      
      expect(result).toHaveLength(2)
      expect(result[1].type).toBe('dateRange')
    })

    it('should throw error if businessHours constraint is missing', () => {
      const settings = createAvailabilitySettingsData({
        businessHours: undefined as any,
        rangeConstraints: undefined
      })
      
      expect(() => {
        extractRangeConstraints(settings)
      }).toThrow('Required rangeConstraints.businessHours is missing')
    })
  })

  describe('extractOverlapConstraints', () => {
    it('should extract appointment buffer constraint', () => {
      const settings = createAvailabilitySettingsData({
        buffers: {
          appointment: {
            type: 'appointment',
            placement: 'before',
            enforcement: 'hard',
            minutes: 15
          }
        }
      })
      
      const result = extractOverlapConstraints(settings)
      
      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('appointment')
      expect(result[0].placement).toBe('before')
      expect(result[0].minutes).toBe(15)
    })

    it('should extract driveTimeTo constraint with implicit before placement', () => {
      const settings = createAvailabilitySettingsData({
        buffers: {
          driveTimeTo: {
            enforcement: 'hard',
            minutes: 30,
            applyTo: 'all'
          }
        }
      })
      
      const result = extractOverlapConstraints(settings)
      
      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('driveTimeTo')
      expect(result[0].placement).toBe('before')
      expect(result[0].minutes).toBe(30)
      expect(result[0].applyTo).toBe('all')
    })

    it('should extract driveTimeFrom constraint with implicit after placement', () => {
      const settings = createAvailabilitySettingsData({
        buffers: {
          driveTimeFrom: {
            enforcement: 'flexible',
            minutes: 15,
            applyTo: 'skipDayEnd'
          }
        }
      })
      
      const result = extractOverlapConstraints(settings)
      
      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('driveTimeFrom')
      expect(result[0].placement).toBe('after')
      expect(result[0].minutes).toBe(15)
      expect(result[0].applyTo).toBe('skipDayEnd')
    })

    it('should skip driveTimeTo with applyTo none', () => {
      const settings = createAvailabilitySettingsData({
        buffers: {
          driveTimeTo: {
            enforcement: 'hard',
            minutes: 30,
            applyTo: 'none'
          }
        }
      })
      
      const result = extractOverlapConstraints(settings)
      
      expect(result).toHaveLength(0)
    })

    it('should skip buffers with placement off', () => {
      const settings = createAvailabilitySettingsData({
        buffers: {
          appointment: {
            type: 'appointment',
            placement: 'off',
            enforcement: 'hard',
            minutes: 15
          }
        }
      })
      
      const result = extractOverlapConstraints(settings)
      
      expect(result).toHaveLength(0)
    })

    it('should throw error if enforcement is missing', () => {
      const settings = createAvailabilitySettingsData({
        buffers: {
          appointment: {
            type: 'appointment',
            placement: 'before',
            enforcement: undefined as any,
            minutes: 15
          }
        }
      })
      
      expect(() => {
        extractOverlapConstraints(settings)
      }).toThrow('Buffer enforcement is required')
    })
  })

  describe('extractCapacityConstraints', () => {
    it('should extract daily capacity constraint', () => {
      const settings = createAvailabilitySettingsData({
        maxWorkHours: {
          day: {
            maxHours: 8,
            enforcement: 'hard'
          }
        }
      })
      
      const result = extractCapacityConstraints(settings)
      
      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('daily')
      expect(result[0].maxHours).toBe(8)
      expect(result[0].enforcement).toBe('hard')
    })

    it('should extract rollingWeek capacity constraint with direction', () => {
      const settings = createAvailabilitySettingsData({
        maxWorkHours: {
          rollingWeek: {
            maxHours: 40,
            enforcement: 'hard',
            direction: 'past'
          }
        }
      })
      
      const result = extractCapacityConstraints(settings)
      
      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('rollingWeek')
      expect(result[0].maxHours).toBe(40)
      expect(result[0].direction).toBe('past')
    })

    it('should skip constraints with enforcement off', () => {
      const settings = createAvailabilitySettingsData({
        maxWorkHours: {
          day: {
            maxHours: 8,
            enforcement: 'off'
          }
        }
      })
      
      const result = extractCapacityConstraints(settings)
      
      expect(result).toHaveLength(0)
    })

    it('should throw error if enforcement is missing', () => {
      const settings = createAvailabilitySettingsData({
        maxWorkHours: {
          day: {
            maxHours: 8,
            enforcement: undefined as any
          }
        }
      })
      
      expect(() => {
        extractCapacityConstraints(settings)
      }).toThrow('Capacity enforcement is required')
    })
  })

  describe('validateRangeConstraint', () => {
    it('should validate businessHours constraint', () => {
      const constraint: RangeConstraint = {
        category: 'range',
        type: 'businessHours',
        enforcement: 'hard',
        config: {
          hours: {
            0: { start: '2000-01-01T09:00:00Z' as RFC3339DateTime, end: '2000-01-01T17:00:00Z' as RFC3339DateTime },
            1: { start: '2000-01-01T09:00:00Z' as RFC3339DateTime, end: '2000-01-01T17:00:00Z' as RFC3339DateTime },
            2: { start: '2000-01-01T09:00:00Z' as RFC3339DateTime, end: '2000-01-01T17:00:00Z' as RFC3339DateTime },
            3: { start: '2000-01-01T09:00:00Z' as RFC3339DateTime, end: '2000-01-01T17:00:00Z' as RFC3339DateTime },
            4: { start: '2000-01-01T09:00:00Z' as RFC3339DateTime, end: '2000-01-01T17:00:00Z' as RFC3339DateTime },
            5: { start: '2000-01-01T09:00:00Z' as RFC3339DateTime, end: '2000-01-01T17:00:00Z' as RFC3339DateTime },
            6: { start: '2000-01-01T09:00:00Z' as RFC3339DateTime, end: '2000-01-01T17:00:00Z' as RFC3339DateTime },
          }
        }
      }
      
      const result = validateRangeConstraint(constraint)
      
      expect(result.valid).toBe(true)
    })

    it('should validate leadTime constraint', () => {
      const constraint: RangeConstraint = {
        category: 'range',
        type: 'leadTime',
        enforcement: 'hard',
        config: { minutes: 60 }
      }
      
      const result = validateRangeConstraint(constraint)
      
      expect(result.valid).toBe(true)
    })

    it('should validate dateRange constraint', () => {
      const constraint: RangeConstraint = {
        category: 'range',
        type: 'dateRange',
        enforcement: 'hard',
        config: {
          start: '2026-01-01T00:00:00Z',
          end: '2026-12-31T23:59:59Z'
        }
      }
      
      const result = validateRangeConstraint(constraint)
      
      expect(result.valid).toBe(true)
    })
  })

  describe('validateOverlapConstraint', () => {
    it('should validate overlap constraint', () => {
      const constraint: OverlapConstraint = {
        category: 'overlap',
        type: 'appointment',
        placement: 'before',
        enforcement: 'hard',
        minutes: 15
      }
      
      const result = validateOverlapConstraint(constraint)
      
      expect(result.valid).toBe(true)
    })

    it('should validate driveTimeTo constraint with valid applyTo', () => {
      const constraint: OverlapConstraint = {
        category: 'overlap',
        type: 'driveTimeTo',
        placement: 'before',
        enforcement: 'hard',
        minutes: 30,
        applyTo: 'skipDayStart'
      }
      
      const result = validateOverlapConstraint(constraint)
      
      expect(result.valid).toBe(true)
    })
  })

  describe('validateCapacityConstraint', () => {
    it('should validate capacity constraint', () => {
      const constraint: CapacityConstraint = {
        category: 'capacity',
        type: 'daily',
        enforcement: 'hard',
        maxHours: 8
      }
      
      const result = validateCapacityConstraint(constraint)
      
      expect(result.valid).toBe(true)
    })

    it('should validate rollingWeek constraint with direction', () => {
      const constraint: CapacityConstraint = {
        category: 'capacity',
        type: 'rollingWeek',
        enforcement: 'hard',
        maxHours: 40,
        direction: 'past'
      }
      
      const result = validateCapacityConstraint(constraint)
      
      expect(result.valid).toBe(true)
    })
  })
})
