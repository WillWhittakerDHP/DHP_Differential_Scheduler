/**
 * CONSTRAINT EXTRACTORS TESTS
 * 
 * Unit tests for constraint extraction utility functions.
 * Tests pure functions for extracting constraints from AvailabilitySettings.
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
 * - vitest for testing
 */

import { describe, it, expect } from 'vitest'
import {
  extractRangeConstraints,
  extractOverlapConstraints,
  extractCapacityConstraints,
  validateRangeConstraint,
  validateOverlapConstraint,
  validateCapacityConstraint
} from '../constraintExtractors'
import type {
  AvailabilitySettings,
  RangeConstraint,
  ConstraintEnforcement
} from '@/configs/availabilitySettings'
import type { OverlapConstraint, CapacityConstraint } from '../constraintExtractors'

function createAvailabilitySettings(
  overrides: Partial<AvailabilitySettings> = {}
): AvailabilitySettings {
  return {
    businessHours: {
      0: { start: '2000-01-01T09:00:00Z' as any, end: '2000-01-01T17:00:00Z' as any },
      1: { start: '2000-01-01T09:00:00Z' as any, end: '2000-01-01T17:00:00Z' as any },
      2: { start: '2000-01-01T09:00:00Z' as any, end: '2000-01-01T17:00:00Z' as any },
      3: { start: '2000-01-01T09:00:00Z' as any, end: '2000-01-01T17:00:00Z' as any },
      4: { start: '2000-01-01T09:00:00Z' as any, end: '2000-01-01T17:00:00Z' as any },
      5: { start: '2000-01-01T09:00:00Z' as any, end: '2000-01-01T17:00:00Z' as any },
      6: { start: '2000-01-01T09:00:00Z' as any, end: '2000-01-01T17:00:00Z' as any }
    },
    minuteIncrement: 15,
    rangeConstraints: {
      businessHours: {
        type: 'businessHours',
        enforcement: 'hard',
        config: {
          hours: {
            0: { start: '2000-01-01T09:00:00Z' as any, end: '2000-01-01T17:00:00Z' as any },
            1: { start: '2000-01-01T09:00:00Z' as any, end: '2000-01-01T17:00:00Z' as any },
            2: { start: '2000-01-01T09:00:00Z' as any, end: '2000-01-01T17:00:00Z' as any },
            3: { start: '2000-01-01T09:00:00Z' as any, end: '2000-01-01T17:00:00Z' as any },
            4: { start: '2000-01-01T09:00:00Z' as any, end: '2000-01-01T17:00:00Z' as any },
            5: { start: '2000-01-01T09:00:00Z' as any, end: '2000-01-01T17:00:00Z' as any },
            6: { start: '2000-01-01T09:00:00Z' as any, end: '2000-01-01T17:00:00Z' as any }
          }
        }
      }
    },
    ...overrides
  } as AvailabilitySettings
}

describe('constraintExtractors', () => {
  describe('extractRangeConstraints', () => {
    it('should extract businessHours constraint', () => {
      const settings = createAvailabilitySettings()
      
      const result = extractRangeConstraints(settings)
      
      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('businessHours')
      expect(result[0].enforcement).toBe('hard')
    })

    it('should extract leadTime constraint when present', () => {
      const settings = createAvailabilitySettings({
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
      const settings = createAvailabilitySettings({
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

    it('should extract all range constraints', () => {
      const settings = createAvailabilitySettings({
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
      
      expect(result).toHaveLength(3)
      expect(result[0].type).toBe('businessHours')
      expect(result[1].type).toBe('leadTime')
      expect(result[2].type).toBe('dateRange')
    })

    it('should throw error if businessHours constraint is missing', () => {
      const settings = createAvailabilitySettings({
        businessHours: undefined as any,
        rangeConstraints: undefined
      })
      
      // Should throw error about missing required constraint
      expect(() => {
        extractRangeConstraints(settings)
      }).toThrow('Required rangeConstraints.businessHours is missing')
    })

    it('should throw error if legacy top-level businessHours exists without structured constraint', () => {
      const settings = createAvailabilitySettings({
        businessHours: {
          0: { start: '2000-01-01T09:00:00Z' as any, end: '2000-01-01T17:00:00Z' as any },
          1: { start: '2000-01-01T09:00:00Z' as any, end: '2000-01-01T17:00:00Z' as any },
          2: { start: '2000-01-01T09:00:00Z' as any, end: '2000-01-01T17:00:00Z' as any },
          3: { start: '2000-01-01T09:00:00Z' as any, end: '2000-01-01T17:00:00Z' as any },
          4: { start: '2000-01-01T09:00:00Z' as any, end: '2000-01-01T17:00:00Z' as any },
          5: { start: '2000-01-01T09:00:00Z' as any, end: '2000-01-01T17:00:00Z' as any },
          6: { start: '2000-01-01T09:00:00Z' as any, end: '2000-01-01T17:00:00Z' as any }
        },
        rangeConstraints: undefined
      })
      
      expect(() => {
        extractRangeConstraints(settings)
      }).toThrow('Legacy top-level businessHours field detected')
    })
  })

  describe('extractOverlapConstraints', () => {
    it('should extract appointment buffer constraint', () => {
      const settings = createAvailabilitySettings({
        buffers: {
          appointment: {
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

    it('should extract multiple buffer constraints', () => {
      const settings = createAvailabilitySettings({
        buffers: {
          appointment: {
            placement: 'before',
            enforcement: 'hard',
            minutes: 15
          },
          driveTime: {
            placement: 'after',
            enforcement: 'flexible',
            minutes: 30
          },
          lunch: {
            placement: 'both',
            enforcement: 'hard',
            minutes: 60
          }
        }
      })
      
      const result = extractOverlapConstraints(settings)
      
      expect(result).toHaveLength(3)
      expect(result[0].type).toBe('appointment')
      expect(result[1].type).toBe('driveTime')
      expect(result[2].type).toBe('lunch')
    })

    it('should skip buffers with placement off', () => {
      const settings = createAvailabilitySettings({
        buffers: {
          appointment: {
            placement: 'off',
            enforcement: 'hard',
            minutes: 15
          }
        }
      })
      
      const result = extractOverlapConstraints(settings)
      
      expect(result).toHaveLength(0)
    })

    it('should skip buffers with zero minutes', () => {
      const settings = createAvailabilitySettings({
        buffers: {
          appointment: {
            placement: 'before',
            enforcement: 'hard',
            minutes: 0
          }
        }
      })
      
      const result = extractOverlapConstraints(settings)
      
      expect(result).toHaveLength(0)
    })

    it('should throw error if enforcement is missing', () => {
      const settings = createAvailabilitySettings({
        buffers: {
          appointment: {
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

    it('should return empty array when no buffers', () => {
      const settings = createAvailabilitySettings({
        buffers: undefined
      })
      
      const result = extractOverlapConstraints(settings)
      
      expect(result).toHaveLength(0)
    })
  })

  describe('extractCapacityConstraints', () => {
    it('should extract daily capacity constraint', () => {
      const settings = createAvailabilitySettings({
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

    it('should extract calendarWeek capacity constraint', () => {
      const settings = createAvailabilitySettings({
        maxWorkHours: {
          calendarWeek: {
            maxHours: 40,
            enforcement: 'flexible'
          }
        }
      })
      
      const result = extractCapacityConstraints(settings)
      
      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('calendarWeek')
      expect(result[0].maxHours).toBe(40)
      expect(result[0].enforcement).toBe('flexible')
    })

    it('should extract rollingWeek capacity constraint with direction', () => {
      const settings = createAvailabilitySettings({
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

    it('should extract all capacity constraints', () => {
      const settings = createAvailabilitySettings({
        maxWorkHours: {
          day: {
            maxHours: 8,
            enforcement: 'hard'
          },
          calendarWeek: {
            maxHours: 40,
            enforcement: 'flexible'
          },
          rollingWeek: {
            maxHours: 40,
            enforcement: 'hard',
            direction: 'centered'
          }
        }
      })
      
      const result = extractCapacityConstraints(settings)
      
      expect(result).toHaveLength(3)
      expect(result[0].type).toBe('daily')
      expect(result[1].type).toBe('calendarWeek')
      expect(result[2].type).toBe('rollingWeek')
    })

    it('should skip constraints with enforcement off', () => {
      const settings = createAvailabilitySettings({
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
      const settings = createAvailabilitySettings({
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

    it('should return empty array when no maxWorkHours', () => {
      const settings = createAvailabilitySettings({
        maxWorkHours: undefined
      })
      
      const result = extractCapacityConstraints(settings)
      
      expect(result).toHaveLength(0)
    })
  })

  describe('validateRangeConstraint', () => {
    it('should validate businessHours constraint', () => {
      const constraint: RangeConstraint = {
        type: 'businessHours',
        enforcement: 'hard',
        config: {
          hours: {
            0: { start: '2000-01-01T09:00:00Z' as any, end: '2000-01-01T17:00:00Z' as any }
          }
        }
      }
      
      const result = validateRangeConstraint(constraint)
      
      expect(result.valid).toBe(true)
    })

    it('should invalidate businessHours constraint with missing config', () => {
      const constraint: RangeConstraint = {
        type: 'businessHours',
        enforcement: 'hard',
        config: {} as any
      }
      
      const result = validateRangeConstraint(constraint)
      
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid businessHours')
    })

    it('should validate leadTime constraint', () => {
      const constraint: RangeConstraint = {
        type: 'leadTime',
        enforcement: 'hard',
        config: { minutes: 60 }
      }
      
      const result = validateRangeConstraint(constraint)
      
      expect(result.valid).toBe(true)
    })

    it('should invalidate leadTime constraint with negative minutes', () => {
      const constraint: RangeConstraint = {
        type: 'leadTime',
        enforcement: 'hard',
        config: { minutes: -10 }
      }
      
      const result = validateRangeConstraint(constraint)
      
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid leadTime')
    })

    it('should validate dateRange constraint', () => {
      const constraint: RangeConstraint = {
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

    it('should invalidate dateRange constraint with invalid dates', () => {
      const constraint: RangeConstraint = {
        type: 'dateRange',
        enforcement: 'hard',
        config: {
          start: 'invalid-date',
          end: '2026-12-31T23:59:59Z'
        }
      }
      
      const result = validateRangeConstraint(constraint)
      
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid dateRange')
    })
  })

  describe('validateOverlapConstraint', () => {
    it('should validate overlap constraint', () => {
      const constraint: OverlapConstraint = {
        type: 'appointment',
        placement: 'before',
        enforcement: 'hard',
        minutes: 15
      }
      
      const result = validateOverlapConstraint(constraint)
      
      expect(result.valid).toBe(true)
    })

    it('should invalidate overlap constraint with negative minutes', () => {
      const constraint: OverlapConstraint = {
        type: 'appointment',
        placement: 'before',
        enforcement: 'hard',
        minutes: -5
      }
      
      const result = validateOverlapConstraint(constraint)
      
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid overlap constraint minutes')
    })

    it('should invalidate overlap constraint with invalid placement', () => {
      const constraint: OverlapConstraint = {
        type: 'appointment',
        placement: 'invalid' as any,
        enforcement: 'hard',
        minutes: 15
      }
      
      const result = validateOverlapConstraint(constraint)
      
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid overlap constraint placement')
    })
  })

  describe('validateCapacityConstraint', () => {
    it('should validate capacity constraint', () => {
      const constraint: CapacityConstraint = {
        type: 'daily',
        enforcement: 'hard',
        maxHours: 8
      }
      
      const result = validateCapacityConstraint(constraint)
      
      expect(result.valid).toBe(true)
    })

    it('should validate rollingWeek constraint with direction', () => {
      const constraint: CapacityConstraint = {
        type: 'rollingWeek',
        enforcement: 'hard',
        maxHours: 40,
        direction: 'past'
      }
      
      const result = validateCapacityConstraint(constraint)
      
      expect(result.valid).toBe(true)
    })

    it('should invalidate capacity constraint with negative maxHours', () => {
      const constraint: CapacityConstraint = {
        type: 'daily',
        enforcement: 'hard',
        maxHours: -5
      }
      
      const result = validateCapacityConstraint(constraint)
      
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid capacity constraint maxHours')
    })

    it('should invalidate rollingWeek constraint with invalid direction', () => {
      const constraint: CapacityConstraint = {
        type: 'rollingWeek',
        enforcement: 'hard',
        maxHours: 40,
        direction: 'invalid' as any
      }
      
      const result = validateCapacityConstraint(constraint)
      
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid capacity constraint direction')
    })
  })
})
