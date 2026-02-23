
import { describe, it, expect } from 'vitest'
import { roundDuration, type DurationRoundingConfig } from '../durationRounding'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'

describe('durationRounding', () => {
  describe('roundDuration', () => {
    it('should return original duration when rounding is disabled', () => {
      const settings: AvailabilitySettings = {
        businessHours: {} as any,
        minuteIncrement: 15,
        durationRounding: {
          enabled: false,
          increment: 15,
          method: 'roundUp'
        }
      }
      
      expect(roundDuration(37, settings)).toBe(37)
      expect(roundDuration(45, settings)).toBe(45)
      expect(roundDuration(90, settings)).toBe(90)
    })
    
    it('should round up when method is roundUp', () => {
      const settings: AvailabilitySettings = {
        businessHours: {} as any,
        minuteIncrement: 15,
        durationRounding: {
          enabled: true,
          increment: 15,
          method: 'roundUp'
        }
      }
      
      expect(roundDuration(37, settings)).toBe(45)
      expect(roundDuration(30, settings)).toBe(30)
      expect(roundDuration(91, settings)).toBe(105)
    })
    
    it('should round down when method is roundDown', () => {
      const settings: AvailabilitySettings = {
        businessHours: {} as any,
        minuteIncrement: 15,
        durationRounding: {
          enabled: true,
          increment: 15,
          method: 'roundDown'
        }
      }
      
      expect(roundDuration(37, settings)).toBe(30)
      expect(roundDuration(45, settings)).toBe(45)
      expect(roundDuration(91, settings)).toBe(90)
    })
    
    it('should round nearest when method is roundNearest', () => {
      const settings: AvailabilitySettings = {
        businessHours: {} as any,
        minuteIncrement: 15,
        durationRounding: {
          enabled: true,
          increment: 15,
          method: 'roundNearest'
        }
      }
      
      expect(roundDuration(37, settings)).toBe(45) // 37 is closer to 45 than 30
      expect(roundDuration(30, settings)).toBe(30)
      expect(roundDuration(45, settings)).toBe(45)
      expect(roundDuration(38, settings)).toBe(45) // 38 is closer to 45
      expect(roundDuration(32, settings)).toBe(30) // 32 is closer to 30
    })
    
    it('should use different increments when configured', () => {
      const settings: AvailabilitySettings = {
        businessHours: {} as any,
        minuteIncrement: 15,
        durationRounding: {
          enabled: true,
          increment: 30,
          method: 'roundUp'
        }
      }
      
      expect(roundDuration(37, settings)).toBe(60) // Rounds to 30-minute increment
      expect(roundDuration(45, settings)).toBe(60)
      expect(roundDuration(30, settings)).toBe(30)
    })
    
    it('should default to minuteIncrement when increment not specified', () => {
      const settings: AvailabilitySettings = {
        businessHours: {} as any,
        minuteIncrement: 10,
        durationRounding: {
          enabled: true,
          method: 'roundUp'
        }
      }
      
      expect(roundDuration(37, settings)).toBe(40) // Uses 10-minute increment
    })
    
    it('should handle null settings (defaults to disabled)', () => {
      expect(roundDuration(37, null)).toBe(37)
      expect(roundDuration(45, null)).toBe(45)
    })
    
    it('should handle settings without durationRounding (defaults to disabled)', () => {
      const settings: AvailabilitySettings = {
        businessHours: {} as any,
        minuteIncrement: 15
      }
      
      expect(roundDuration(37, settings)).toBe(37)
    })
    
    it('should handle zero duration', () => {
      const settings: AvailabilitySettings = {
        businessHours: {} as any,
        minuteIncrement: 15,
        durationRounding: {
          enabled: true,
          increment: 15,
          method: 'roundUp'
        }
      }
      
      expect(roundDuration(0, settings)).toBe(15) // Round up returns increment for 0
    })
    
    it('should handle negative duration', () => {
      const settings: AvailabilitySettings = {
        businessHours: {} as any,
        minuteIncrement: 15,
        durationRounding: {
          enabled: true,
          increment: 15,
          method: 'roundUp'
        }
      }
      
      expect(roundDuration(-10, settings)).toBe(15) // Round up returns increment for negative
    })
  })
})
