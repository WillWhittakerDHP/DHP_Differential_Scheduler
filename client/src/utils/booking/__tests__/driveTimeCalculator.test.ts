/**
 * Drive Time Calculator Tests
 * 
 * LEARNING: Unit tests for drive time calculation service
 * WHY: Ensures drive time constraints are calculated correctly with location data
 * PATTERN: Test location resolution, applyTo logic, and fallback behavior
 * 
 * Session 2.2.3: Created for drive time API integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { calculateDriveTimeConstraints, type DriveTimeCalculationContext } from '../driveTimeCalculator'
import type { OverlapConstraint } from '../constraintExtractors'
import { fetchDriveTime } from '@/services/mapsApiService'

// Mock the maps API service
vi.mock('@/services/mapsApiService', () => ({
  fetchDriveTime: vi.fn()
}))

describe('driveTimeCalculator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('calculateDriveTimeConstraints', () => {
    it('should return original constraints if no drive time constraints', async () => {
      const constraints: OverlapConstraint[] = [
        {
          type: 'appointment',
          placement: 'before',
          enforcement: 'hard',
          minutes: 15
        }
      ]

      const context: DriveTimeCalculationContext = {
        slotDate: new Date('2026-02-01T00:00:00Z'),
        defaultLocation: {
          address: '123 Main St',
          placeId: 'ChIJ123'
        },
        calendarEvents: []
      }

      const result = await calculateDriveTimeConstraints(constraints, context)

      expect(result).toEqual(constraints)
      expect(fetchDriveTime).not.toHaveBeenCalled()
    })

    it('should return original constraints if no location data', async () => {
      const constraints: OverlapConstraint[] = [
        {
          type: 'driveTimeTo',
          placement: 'before',
          enforcement: 'hard',
          minutes: 30,
          applyTo: 'first_only'
        }
      ]

      const context: DriveTimeCalculationContext = {
        slotDate: new Date('2026-02-01T00:00:00Z')
        // No defaultLocation or calendarEvents
      }

      const result = await calculateDriveTimeConstraints(constraints, context)

      expect(result).toEqual(constraints)
      expect(fetchDriveTime).not.toHaveBeenCalled()
    })

    it('should calculate driveTimeTo for first_only when isFirstOfDay', async () => {
      const constraints: OverlapConstraint[] = [
        {
          type: 'driveTimeTo',
          placement: 'before',
          enforcement: 'hard',
          minutes: 30, // Fallback
          applyTo: 'first_only'
        }
      ]

      const context: DriveTimeCalculationContext = {
        slotDate: new Date('2026-02-01T00:00:00Z'),
        defaultLocation: {
          address: '123 Main St',
          placeId: 'ChIJ123'
        },
        calendarEvents: [
          {
            id: 'event1',
            start: '2026-02-01T10:00:00Z',
            end: '2026-02-01T11:00:00Z',
            placeId: 'ChIJ456',
            summary: 'First Appointment'
          }
        ],
        slotPosition: {
          isFirstOfDay: true,
          isLastOfDay: false
        }
      }

      vi.mocked(fetchDriveTime).mockResolvedValue({
        durationMinutes: 25,
        durationSeconds: 1500,
        distanceMeters: 5000,
        distanceMiles: 3.1,
        _meta: { source: 'calculated' }
      })

      const result = await calculateDriveTimeConstraints(constraints, context)

      expect(result).toHaveLength(1)
      expect(result[0].minutes).toBe(25) // Calculated value
      expect(fetchDriveTime).toHaveBeenCalledWith(
        { placeId: 'ChIJ123' },
        { placeId: 'ChIJ456' },
        true,
        30 // fallbackMinutes
      )
    })

    it('should calculate driveTimeFrom for last_only when isLastOfDay', async () => {
      const constraints: OverlapConstraint[] = [
        {
          type: 'driveTimeFrom',
          placement: 'after',
          enforcement: 'hard',
          minutes: 15, // Fallback
          applyTo: 'last_only'
        }
      ]

      const context: DriveTimeCalculationContext = {
        slotDate: new Date('2026-02-01T00:00:00Z'),
        defaultLocation: {
          placeId: 'ChIJ123',
          address: '123 Main St',
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        calendarEvents: [
          {
            id: 'event1',
            start: '2026-02-01T10:00:00Z',
            end: '2026-02-01T11:00:00Z',
            placeId: 'ChIJ456',
            summary: 'Last Appointment'
          }
        ],
        slotPosition: {
          isFirstOfDay: false,
          isLastOfDay: true
        }
      }

      vi.mocked(fetchDriveTime).mockResolvedValue({
        durationMinutes: 18,
        durationSeconds: 1080,
        distanceMeters: 6000,
        distanceMiles: 3.7,
        _meta: { source: 'calculated' }
      })

      const result = await calculateDriveTimeConstraints(constraints, context)

      expect(result).toHaveLength(1)
      expect(result[0].minutes).toBe(18) // Calculated value
      expect(fetchDriveTime).toHaveBeenCalledWith(
        { address: '456 Oak Ave' },
        { coordinates: { lat: 40.7128, lng: -74.0060 } },
        true,
        15 // fallbackMinutes
      )
    })

    it('should use fallback when API returns estimated source', async () => {
      const constraints: OverlapConstraint[] = [
        {
          type: 'driveTimeTo',
          placement: 'before',
          enforcement: 'hard',
          minutes: 30,
          applyTo: 'first_only'
        }
      ]

      const context: DriveTimeCalculationContext = {
        slotDate: new Date('2026-02-01T00:00:00Z'),
        defaultLocation: {
          address: '123 Main St',
          placeId: 'ChIJ123'
        },
        calendarEvents: [
          {
            id: 'event1',
            start: '2026-02-01T10:00:00Z',
            end: '2026-02-01T11:00:00Z',
            placeId: 'ChIJ456',
            summary: 'First Appointment'
          }
        ],
        slotPosition: {
          isFirstOfDay: true,
          isLastOfDay: false
        }
      }

      vi.mocked(fetchDriveTime).mockResolvedValue({
        durationMinutes: 30,
        durationSeconds: 1800,
        distanceMeters: 0,
        distanceMiles: 0,
        _meta: { source: 'estimated' } // Fallback was used
      })

      const result = await calculateDriveTimeConstraints(constraints, context)

      expect(result).toHaveLength(1)
      expect(result[0].minutes).toBe(30) // Original fallback value (not changed)
    })

    it('should use fallback when API fails', async () => {
      const constraints: OverlapConstraint[] = [
        {
          type: 'driveTimeTo',
          placement: 'before',
          enforcement: 'hard',
          minutes: 30,
          applyTo: 'first_only'
        }
      ]

      const context: DriveTimeCalculationContext = {
        slotDate: new Date('2026-02-01T00:00:00Z'),
        defaultLocation: {
          address: '123 Main St',
          placeId: 'ChIJ123'
        },
        calendarEvents: [
          {
            id: 'event1',
            start: '2026-02-01T10:00:00Z',
            end: '2026-02-01T11:00:00Z',
            placeId: 'ChIJ456',
            summary: 'First Appointment'
          }
        ],
        slotPosition: {
          isFirstOfDay: true,
          isLastOfDay: false
        }
      }

      vi.mocked(fetchDriveTime).mockRejectedValue(new Error('API error'))

      const result = await calculateDriveTimeConstraints(constraints, context)

      expect(result).toHaveLength(1)
      expect(result[0].minutes).toBe(30) // Original fallback value
    })

    it('should skip calculation for applyTo=all without slot-specific context', async () => {
      const constraints: OverlapConstraint[] = [
        {
          type: 'driveTimeTo',
          placement: 'before',
          enforcement: 'hard',
          minutes: 30,
          applyTo: 'all'
        }
      ]

      const context: DriveTimeCalculationContext = {
        slotDate: new Date('2026-02-01T00:00:00Z'),
        defaultLocation: {
          address: '123 Main St',
          placeId: 'ChIJ123'
        },
        calendarEvents: [
          {
            id: 'event1',
            start: '2026-02-01T10:00:00Z',
            end: '2026-02-01T11:00:00Z',
            placeId: 'ChIJ456',
            summary: 'Appointment'
          }
        ]
        // No slotPosition - applyTo='all' requires slot-specific context
      }

      const result = await calculateDriveTimeConstraints(constraints, context)

      expect(result).toEqual(constraints) // Unchanged
      expect(fetchDriveTime).not.toHaveBeenCalled()
    })

    it('should handle multiple drive time constraints', async () => {
      const constraints: OverlapConstraint[] = [
        {
          type: 'driveTimeTo',
          placement: 'before',
          enforcement: 'hard',
          minutes: 30,
          applyTo: 'first_only'
        },
        {
          type: 'driveTimeFrom',
          placement: 'after',
          enforcement: 'hard',
          minutes: 15,
          applyTo: 'last_only'
        },
        {
          type: 'appointment',
          placement: 'before',
          enforcement: 'hard',
          minutes: 10
        }
      ]

      const context: DriveTimeCalculationContext = {
        slotDate: new Date('2026-02-01T00:00:00Z'),
        defaultLocation: {
          address: '123 Main St',
          placeId: 'ChIJ123'
        },
        calendarEvents: [
          {
            id: 'event1',
            start: '2026-02-01T10:00:00Z',
            end: '2026-02-01T11:00:00Z',
            placeId: 'ChIJ456',
            summary: 'First Appointment'
          },
          {
            id: 'event2',
            start: '2026-02-01T14:00:00Z',
            end: '2026-02-01T15:00:00Z',
            placeId: 'ChIJ789',
            summary: 'Last Appointment'
          }
        ],
        slotPosition: {
          isFirstOfDay: true,
          isLastOfDay: true // Same slot is both first and last (only one appointment)
        }
      }

      vi.mocked(fetchDriveTime)
        .mockResolvedValueOnce({
          durationMinutes: 25,
          durationSeconds: 1500,
          distanceMeters: 5000,
          distanceMiles: 3.1,
          _meta: { source: 'calculated' }
        })
        .mockResolvedValueOnce({
          durationMinutes: 18,
          durationSeconds: 1080,
          distanceMeters: 6000,
          distanceMiles: 3.7,
          _meta: { source: 'calculated' }
        })

      const result = await calculateDriveTimeConstraints(constraints, context)

      expect(result).toHaveLength(3)
      expect(result[0].minutes).toBe(25) // driveTimeTo calculated
      expect(result[1].minutes).toBe(18) // driveTimeFrom calculated
      expect(result[2].minutes).toBe(10) // appointment unchanged
      expect(fetchDriveTime).toHaveBeenCalledTimes(2)
    })

    it('should use placeId when available for defaultLocation', async () => {
      const constraints: OverlapConstraint[] = [
        {
          type: 'driveTimeTo',
          placement: 'before',
          enforcement: 'hard',
          minutes: 30,
          applyTo: 'first_only'
        }
      ]

      const context: DriveTimeCalculationContext = {
        slotDate: new Date('2026-02-01T00:00:00Z'),
        defaultLocation: {
          address: '123 Main St',
          placeId: 'ChIJ123', // PlaceId available
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        calendarEvents: [
          {
            id: 'event1',
            start: '2026-02-01T10:00:00Z',
            end: '2026-02-01T11:00:00Z',
            placeId: 'ChIJ456',
            summary: 'First Appointment'
          }
        ],
        slotPosition: {
          isFirstOfDay: true,
          isLastOfDay: false
        }
      }

      vi.mocked(fetchDriveTime).mockResolvedValue({
        durationMinutes: 25,
        durationSeconds: 1500,
        distanceMeters: 5000,
        distanceMiles: 3.1,
        _meta: { source: 'calculated' }
      })

      await calculateDriveTimeConstraints(constraints, context)

      // Should use placeId (priority over coordinates)
      expect(fetchDriveTime).toHaveBeenCalledWith(
        { placeId: 'ChIJ123' }, // placeId used, not coordinates
        { address: '456 Oak Ave' },
        true,
        30
      )
    })

    it('should use coordinates when placeId not available', async () => {
      const constraints: OverlapConstraint[] = [
        {
          type: 'driveTimeTo',
          placement: 'before',
          enforcement: 'hard',
          minutes: 30,
          applyTo: 'first_only'
        }
      ]

      const context: DriveTimeCalculationContext = {
        slotDate: new Date('2026-02-01T00:00:00Z'),
        defaultLocation: {
          address: '123 Main St',
          // No placeId, but has coordinates
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        calendarEvents: [
          {
            id: 'event1',
            start: '2026-02-01T10:00:00Z',
            end: '2026-02-01T11:00:00Z',
            placeId: 'ChIJ456',
            summary: 'First Appointment'
          }
        ],
        slotPosition: {
          isFirstOfDay: true,
          isLastOfDay: false
        }
      }

      vi.mocked(fetchDriveTime).mockResolvedValue({
        durationMinutes: 25,
        durationSeconds: 1500,
        distanceMeters: 5000,
        distanceMiles: 3.1,
        _meta: { source: 'calculated' }
      })

      await calculateDriveTimeConstraints(constraints, context)

      // Should use coordinates (priority over address)
      expect(fetchDriveTime).toHaveBeenCalledWith(
        { coordinates: { lat: 40.7128, lng: -74.0060 } },
        { address: '456 Oak Ave' },
        true,
        30
      )
    })

    it('should use address when only address available', async () => {
      const constraints: OverlapConstraint[] = [
        {
          type: 'driveTimeTo',
          placement: 'before',
          enforcement: 'hard',
          minutes: 30,
          applyTo: 'first_only'
        }
      ]

      const context: DriveTimeCalculationContext = {
        slotDate: new Date('2026-02-01T00:00:00Z'),
        defaultLocation: {
          address: '123 Main St'
          // No placeId or coordinates
        },
        calendarEvents: [
          {
            id: 'event1',
            start: '2026-02-01T10:00:00Z',
            end: '2026-02-01T11:00:00Z',
            placeId: 'ChIJ456',
            summary: 'First Appointment'
          }
        ],
        slotPosition: {
          isFirstOfDay: true,
          isLastOfDay: false
        }
      }

      vi.mocked(fetchDriveTime).mockResolvedValue({
        durationMinutes: 25,
        durationSeconds: 1500,
        distanceMeters: 5000,
        distanceMiles: 3.1,
        _meta: { source: 'calculated' }
      })

      await calculateDriveTimeConstraints(constraints, context)

      // Should use placeId (primary)
      expect(fetchDriveTime).toHaveBeenCalledWith(
        { placeId: 'ChIJ123' },
        { placeId: 'ChIJ456' },
        true,
        30
      )
    })
  })
})
