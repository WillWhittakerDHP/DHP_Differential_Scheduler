/**
 * AVAILABILITY ROUTER INTEGRATION TESTS
 * 
 * Integration tests for availability router endpoint.
 * Tests POST endpoint for calculating available time slots.
 * Phase 7: Remaining API Routes
 * 
 * WHAT: Tests availability calculation endpoint that returns time slots for appointments
 * HOW: Mocks makeAvailabilities function and tests request validation
 * WHY: Ensures availability API correctly validates input and returns time slots
 * DEPENDENCIES: makeAvailabilities utility function
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import request from 'supertest'
import express, { Express } from 'express'
import { AvailabilityRouter as availabilityRouter } from '../availabilityRouter'

// Mock makeAvailabilities function
jest.mock('../../../utils/availabilities/makeAvailabilties', () => ({
  makeAvailabilities: jest.fn(),
}))

describe('Availability Router Integration Tests', () => {
  let app: Express

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/api/availability', availabilityRouter)
    jest.clearAllMocks()
  })

  describe('POST /api/availability', () => {
    it('should calculate availabilities with valid request', async () => {
      const { makeAvailabilities } = require('../../../utils/availabilities/makeAvailabilties')
      const mockTimeSlots = [
        {
          slotStart: new Date('2024-01-01T08:00:00Z'),
          slotEnd: new Date('2024-01-01T09:00:00Z'),
          duration: 60,
        },
        {
          slotStart: new Date('2024-01-01T09:00:00Z'),
          slotEnd: new Date('2024-01-01T10:00:00Z'),
          duration: 60,
        },
      ]
      makeAvailabilities.mockResolvedValue(mockTimeSlots)

      const requestBody = {
        serviceId: 'service-1',
        dateRange: {
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-02T00:00:00Z',
        },
        duration: 60,
        timezone: 'America/New_York',
      }

      const response = await request(app)
        .post('/api/availability')
        .send(requestBody)
        .expect(200)

      expect(response.body).toHaveProperty('availabilities')
      expect(response.body.availabilities).toHaveLength(2)
      expect(response.body.availabilities[0]).toHaveProperty('slotStart')
      expect(response.body.availabilities[0]).toHaveProperty('slotEnd')
      expect(response.body.availabilities[0]).toHaveProperty('duration')
      expect(makeAvailabilities).toHaveBeenCalled()
    })

    it('should use default timezone when not provided', async () => {
      const { makeAvailabilities } = require('../../../utils/availabilities/makeAvailabilties')
      makeAvailabilities.mockResolvedValue([])

      const requestBody = {
        serviceId: 'service-1',
        dateRange: {
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-02T00:00:00Z',
        },
        duration: 60,
      }

      await request(app)
        .post('/api/availability')
        .send(requestBody)
        .expect(200)

      expect(makeAvailabilities).toHaveBeenCalled()
      const callArgs = makeAvailabilities.mock.calls[0]
      expect(callArgs[4]).toBe('America/New_York') // adminSettings.timezone
    })

    it('should return 400 when serviceId is missing', async () => {
      const requestBody = {
        dateRange: {
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-02T00:00:00Z',
        },
        duration: 60,
      }

      const response = await request(app)
        .post('/api/availability')
        .send(requestBody)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('serviceId is required.')
    })

    it('should return 400 when dateRange is missing', async () => {
      const requestBody = {
        serviceId: 'service-1',
        duration: 60,
      }

      const response = await request(app)
        .post('/api/availability')
        .send(requestBody)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('dateRange with start and end is required.')
    })

    it('should return 400 when dateRange.start is missing', async () => {
      const requestBody = {
        serviceId: 'service-1',
        dateRange: {
          end: '2024-01-02T00:00:00Z',
        },
        duration: 60,
      }

      const response = await request(app)
        .post('/api/availability')
        .send(requestBody)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('dateRange with start and end is required.')
    })

    it('should return 400 when dateRange.end is missing', async () => {
      const requestBody = {
        serviceId: 'service-1',
        dateRange: {
          start: '2024-01-01T00:00:00Z',
        },
        duration: 60,
      }

      const response = await request(app)
        .post('/api/availability')
        .send(requestBody)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('dateRange with start and end is required.')
    })

    it('should return 400 when duration is missing', async () => {
      const requestBody = {
        serviceId: 'service-1',
        dateRange: {
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-02T00:00:00Z',
        },
      }

      const response = await request(app)
        .post('/api/availability')
        .send(requestBody)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('duration (number) is required.')
    })

    it('should return 400 when duration is not a number', async () => {
      const requestBody = {
        serviceId: 'service-1',
        dateRange: {
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-02T00:00:00Z',
        },
        duration: '60', // string instead of number
      }

      const response = await request(app)
        .post('/api/availability')
        .send(requestBody)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('duration (number) is required.')
    })

    it('should serialize time slots to ISO strings', async () => {
      const { makeAvailabilities } = require('../../../utils/availabilities/makeAvailabilties')
      const mockTimeSlots = [
        {
          slotStart: new Date('2024-01-01T08:00:00Z'),
          slotEnd: new Date('2024-01-01T09:00:00Z'),
          duration: 60,
        },
      ]
      makeAvailabilities.mockResolvedValue(mockTimeSlots)

      const requestBody = {
        serviceId: 'service-1',
        dateRange: {
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-02T00:00:00Z',
        },
        duration: 60,
      }

      const response = await request(app)
        .post('/api/availability')
        .send(requestBody)
        .expect(200)

      expect(response.body.availabilities[0].slotStart).toBe('2024-01-01T08:00:00.000Z')
      expect(response.body.availabilities[0].slotEnd).toBe('2024-01-01T09:00:00.000Z')
      expect(typeof response.body.availabilities[0].slotStart).toBe('string')
      expect(typeof response.body.availabilities[0].slotEnd).toBe('string')
    })

    it('should handle empty availabilities array', async () => {
      const { makeAvailabilities } = require('../../../utils/availabilities/makeAvailabilties')
      makeAvailabilities.mockResolvedValue([])

      const requestBody = {
        serviceId: 'service-1',
        dateRange: {
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-02T00:00:00Z',
        },
        duration: 60,
      }

      const response = await request(app)
        .post('/api/availability')
        .send(requestBody)
        .expect(200)

      expect(response.body.availabilities).toEqual([])
    })

    it('should handle makeAvailabilities errors', async () => {
      const { makeAvailabilities } = require('../../../utils/availabilities/makeAvailabilties')
      makeAvailabilities.mockRejectedValue(new Error('Calculation error'))

      const requestBody = {
        serviceId: 'service-1',
        dateRange: {
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-02T00:00:00Z',
        },
        duration: 60,
      }

      const response = await request(app)
        .post('/api/availability')
        .send(requestBody)
        .expect(500)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Failed to generate availabilities.')
      expect(response.body.details).toBe('Calculation error')
    })

    it('should pass correct parameters to makeAvailabilities', async () => {
      const { makeAvailabilities } = require('../../../utils/availabilities/makeAvailabilties')
      makeAvailabilities.mockResolvedValue([])

      const requestBody = {
        serviceId: 'service-1',
        dateRange: {
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-02T00:00:00Z',
        },
        duration: 90,
        timezone: 'America/Los_Angeles',
      }

      await request(app)
        .post('/api/availability')
        .send(requestBody)
        .expect(200)

      expect(makeAvailabilities).toHaveBeenCalledTimes(1)
      const callArgs = makeAvailabilities.mock.calls[0]
      
      // Check that freeBusyResponse structure is passed
      expect(callArgs[0]).toHaveProperty('calendars')
      expect(callArgs[0].calendars).toHaveProperty('primary')
      expect(callArgs[0].calendars.primary).toHaveProperty('busy')
      
      // Check date range
      expect(callArgs[1]).toBe('2024-01-01T00:00:00Z')
      expect(callArgs[2]).toBe('2024-01-02T00:00:00Z')
      
      // Check duration
      expect(callArgs[3]).toBe(90)
      
      // Check serviceId
      expect(callArgs[4]).toBe('service-1')
      
      // Check adminSettings structure
      expect(callArgs[5]).toHaveProperty('leadTime')
      expect(callArgs[5]).toHaveProperty('freeHours')
      expect(callArgs[5]).toHaveProperty('workHours')
      expect(callArgs[5]).toHaveProperty('timezone')
      expect(callArgs[5]).toHaveProperty('minuteIncrement')
      expect(callArgs[5]).toHaveProperty('permissibleStartRule')
      expect(callArgs[5].timezone).toBe('America/Los_Angeles')
    })

    it('should handle invalid date range (end before start)', async () => {
      const { makeAvailabilities } = require('../../../utils/availabilities/makeAvailabilties')
      makeAvailabilities.mockResolvedValue([])

      const requestBody = {
        serviceId: 'service-1',
        dateRange: {
          start: '2024-01-02T00:00:00Z',
          end: '2024-01-01T00:00:00Z', // End before start
        },
        duration: 60,
      }

      // Should still pass validation and let makeAvailabilities handle it
      await request(app)
        .post('/api/availability')
        .send(requestBody)
        .expect(200)

      expect(makeAvailabilities).toHaveBeenCalled()
    })

    it('should handle very large duration values', async () => {
      const { makeAvailabilities } = require('../../../utils/availabilities/makeAvailabilties')
      makeAvailabilities.mockResolvedValue([])

      const requestBody = {
        serviceId: 'service-1',
        dateRange: {
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-02T00:00:00Z',
        },
        duration: 999999, // Very large duration
      }

      await request(app)
        .post('/api/availability')
        .send(requestBody)
        .expect(200)

      expect(makeAvailabilities).toHaveBeenCalled()
    })

    it('should handle zero duration', async () => {
      const { makeAvailabilities } = require('../../../utils/availabilities/makeAvailabilties')
      makeAvailabilities.mockResolvedValue([])

      const requestBody = {
        serviceId: 'service-1',
        dateRange: {
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-02T00:00:00Z',
        },
        duration: 0,
      }

      await request(app)
        .post('/api/availability')
        .send(requestBody)
        .expect(200)

      expect(makeAvailabilities).toHaveBeenCalled()
    })

    it('should handle negative duration', async () => {
      const { makeAvailabilities } = require('../../../utils/availabilities/makeAvailabilties')
      makeAvailabilities.mockResolvedValue([])

      const requestBody = {
        serviceId: 'service-1',
        dateRange: {
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-02T00:00:00Z',
        },
        duration: -60, // Negative duration
      }

      // Should pass validation (number check) but makeAvailabilities should handle it
      await request(app)
        .post('/api/availability')
        .send(requestBody)
        .expect(200)

      expect(makeAvailabilities).toHaveBeenCalled()
    })

    it('should handle invalid timezone format', async () => {
      const { makeAvailabilities } = require('../../../utils/availabilities/makeAvailabilties')
      makeAvailabilities.mockResolvedValue([])

      const requestBody = {
        serviceId: 'service-1',
        dateRange: {
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-02T00:00:00Z',
        },
        duration: 60,
        timezone: 'Invalid/Timezone', // Invalid timezone
      }

      // Should still pass and let makeAvailabilities handle it
      await request(app)
        .post('/api/availability')
        .send(requestBody)
        .expect(200)

      expect(makeAvailabilities).toHaveBeenCalled()
    })

    it('should handle empty serviceId string', async () => {
      const requestBody = {
        serviceId: '', // Empty string
        dateRange: {
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-02T00:00:00Z',
        },
        duration: 60,
      }

      // Empty string is falsy, so should fail validation
      const response = await request(app)
        .post('/api/availability')
        .send(requestBody)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('serviceId is required.')
    })

    it('should handle null serviceId', async () => {
      const requestBody = {
        serviceId: null,
        dateRange: {
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-02T00:00:00Z',
        },
        duration: 60,
      }

      const response = await request(app)
        .post('/api/availability')
        .send(requestBody)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should handle invalid date format in dateRange', async () => {
      const { makeAvailabilities } = require('../../../utils/availabilities/makeAvailabilties')
      makeAvailabilities.mockResolvedValue([])

      const requestBody = {
        serviceId: 'service-1',
        dateRange: {
          start: 'invalid-date',
          end: '2024-01-02T00:00:00Z',
        },
        duration: 60,
      }

      // Should pass validation and let makeAvailabilities handle date parsing
      await request(app)
        .post('/api/availability')
        .send(requestBody)
        .expect(200)

      expect(makeAvailabilities).toHaveBeenCalled()
    })

    it('should handle very long date range', async () => {
      const { makeAvailabilities } = require('../../../utils/availabilities/makeAvailabilties')
      makeAvailabilities.mockResolvedValue([])

      const requestBody = {
        serviceId: 'service-1',
        dateRange: {
          start: '2024-01-01T00:00:00Z',
          end: '2025-12-31T23:59:59Z', // Very long range (1 year)
        },
        duration: 60,
      }

      await request(app)
        .post('/api/availability')
        .send(requestBody)
        .expect(200)

      expect(makeAvailabilities).toHaveBeenCalled()
    })
  })
})

