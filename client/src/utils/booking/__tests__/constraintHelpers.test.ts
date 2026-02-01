/**
 * CONSTRAINT HELPERS TESTS
 * 
 * Unit tests for constraint helper functions:
 * - extractAllConstraints: Extracts all constraint types from settings
 * - ensureDateRangeInSettings: Ensures dateRange is set in rangeConstraints
 */

import { describe, it, expect } from 'vitest'
import { extractAllConstraints, ensureDateRangeInSettings } from '../constraintHelpers'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'

function createMinimalSettings(): AvailabilitySettings {
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
    }
  }
}

describe('extractAllConstraints', () => {
  it('should extract all constraint types from settings', () => {
    const settings = createMinimalSettings()
    
    const result = extractAllConstraints(settings)
    
    expect(result).toHaveProperty('rangeConstraints')
    expect(result).toHaveProperty('overlapConstraints')
    expect(result).toHaveProperty('capacityConstraints')
    expect(Array.isArray(result.rangeConstraints)).toBe(true)
    expect(Array.isArray(result.overlapConstraints)).toBe(true)
    expect(Array.isArray(result.capacityConstraints)).toBe(true)
  })

  it('should include businessHours in rangeConstraints', () => {
    const settings = createMinimalSettings()
    
    const result = extractAllConstraints(settings)
    
    expect(result.rangeConstraints.length).toBeGreaterThan(0)
    expect(result.rangeConstraints.some(c => c.type === 'businessHours')).toBe(true)
  })

  it('should propagate errors from individual extractors', () => {
    const settings = createMinimalSettings()
    // Remove required businessHours constraint and top-level businessHours to avoid legacy check
    delete settings.rangeConstraints!.businessHours
    delete settings.businessHours
    
    expect(() => extractAllConstraints(settings)).toThrow('Required rangeConstraints.businessHours is missing')
  })

  it('should extract overlap constraints when present', () => {
    const settings = createMinimalSettings()
    settings.buffers = {
      appointment: {
        placement: 'before',
        enforcement: 'hard',
        minutes: 15
      }
    }
    
    const result = extractAllConstraints(settings)
    
    expect(result.overlapConstraints.length).toBeGreaterThan(0)
    expect(result.overlapConstraints.some(c => c.type === 'appointment')).toBe(true)
  })

  it('should extract capacity constraints when present', () => {
    const settings = createMinimalSettings()
    settings.maxWorkHours = {
      day: {
        enforcement: 'hard',
        maxHours: 8
      }
    }
    
    const result = extractAllConstraints(settings)
    
    expect(result.capacityConstraints.length).toBeGreaterThan(0)
    expect(result.capacityConstraints.some(c => c.type === 'daily')).toBe(true)
  })
})

describe('ensureDateRangeInSettings', () => {
  it('should preserve existing dateRange when present', () => {
    const settings = createMinimalSettings()
    const existingDateRange = {
      type: 'dateRange' as const,
      enforcement: 'hard' as const,
      config: {
        start: '2026-01-01T00:00:00Z',
        end: '2026-01-31T23:59:59Z'
      }
    }
    settings.rangeConstraints!.dateRange = existingDateRange
    
    const newDateRange = { start: '2026-02-01T00:00:00Z', end: '2026-02-28T23:59:59Z' }
    const result = ensureDateRangeInSettings(settings, newDateRange)
    
    expect(result.rangeConstraints?.dateRange).toBe(existingDateRange)
    expect(result.rangeConstraints?.dateRange?.config.start).toBe('2026-01-01T00:00:00Z')
  })

  it('should create dateRange when missing', () => {
    const settings = createMinimalSettings()
    
    const dateRange = { start: '2026-01-01T00:00:00Z', end: '2026-01-31T23:59:59Z' }
    const result = ensureDateRangeInSettings(settings, dateRange)
    
    expect(result.rangeConstraints?.dateRange).toBeDefined()
    expect(result.rangeConstraints?.dateRange?.type).toBe('dateRange')
    expect(result.rangeConstraints?.dateRange?.enforcement).toBe('hard')
    expect(result.rangeConstraints?.dateRange?.config.start).toBe(dateRange.start)
    expect(result.rangeConstraints?.dateRange?.config.end).toBe(dateRange.end)
  })

  it('should preserve other rangeConstraints when creating dateRange', () => {
    const settings = createMinimalSettings()
    settings.rangeConstraints!.leadTime = {
      type: 'leadTime',
      enforcement: 'hard',
      config: { minutes: 60 }
    }
    
    const dateRange = { start: '2026-01-01T00:00:00Z', end: '2026-01-31T23:59:59Z' }
    const result = ensureDateRangeInSettings(settings, dateRange)
    
    expect(result.rangeConstraints?.businessHours).toBeDefined()
    expect(result.rangeConstraints?.leadTime).toBeDefined()
    expect(result.rangeConstraints?.dateRange).toBeDefined()
  })

  it('should create rangeConstraints object if missing', () => {
    const settings = createMinimalSettings()
    delete settings.rangeConstraints
    
    const dateRange = { start: '2026-01-01T00:00:00Z', end: '2026-01-31T23:59:59Z' }
    const result = ensureDateRangeInSettings(settings, dateRange)
    
    expect(result.rangeConstraints).toBeDefined()
    expect(result.rangeConstraints?.dateRange).toBeDefined()
  })
})
