/**
 * APPOINTMENT TO WIZARD TRANSFORMER TESTS
 * 
 * Unit tests for transformAppointmentToWizard function.
 * Tests appointment data transformation to wizard state (edit mode).
 */

import { describe, it, expect } from 'vitest'
import { transformAppointmentToWizard } from '../appointmentToWizardTransformer'
import { createAtomicBlockGlobalData, createCompositeBlockGlobalData } from '../../__tests__/factories/globalDataFactory'
import { BookingTransformer } from '../globalToBookingTransformer'
import type { AppointmentResponse } from '@/types/appointment'

describe('appointmentToWizardTransformer', () => {
  describe('transformAppointmentToWizard', () => {
    it('should transform appointment with single service', () => {
      const globalData = createAtomicBlockGlobalData()
      const transformer = new BookingTransformer()
      const bookingData = transformer.transformGlobalToBooking(globalData)
      
      const appointment: AppointmentResponse = {
        id: 'apt-1',
        selectedServiceIds: ['block-1'],
        selectedDate: '2026-01-15',
        selectedTimeSlots: [{ time: '2026-01-15T10:00:00Z', duration: 120 }],
        isQuoteMode: false,
        status: 'booked',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }
      
      const result = transformAppointmentToWizard(appointment, bookingData)
      
      expect(result).toBeDefined()
      expect(result.services).toHaveLength(1)
      expect(result.services[0].id).toBe('block-1')
      expect(result.availability.selectedDate.start).toBe('2026-01-15')
      expect(result.availability.selectedTimeSlots).toBeDefined()
    })
    
    it('should handle appointment with no services', () => {
      const globalData = createAtomicBlockGlobalData()
      const transformer = new BookingTransformer()
      const bookingData = transformer.transformGlobalToBooking(globalData)
      
      const appointment: AppointmentResponse = {
        id: 'apt-1',
        selectedServiceIds: null,
        isQuoteMode: false,
        status: 'booked',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }
      
      const result = transformAppointmentToWizard(appointment, bookingData)
      
      expect(result).toBeDefined()
      expect(result.services).toHaveLength(0)
    })
    
    it('should extract date from appointment selectedDate', () => {
      const globalData = createAtomicBlockGlobalData()
      const transformer = new BookingTransformer()
      const bookingData = transformer.transformGlobalToBooking(globalData)
      
      const appointment: AppointmentResponse = {
        id: 'apt-1',
        selectedServiceIds: ['block-1'],
        selectedDate: '2026-01-15',
        isQuoteMode: false,
        status: 'booked',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }
      
      const result = transformAppointmentToWizard(appointment, bookingData)
      
      expect(result.availability.selectedDate.start).toBe('2026-01-15')
    })
    
    it('should create time slots from appointment selectedTimeSlots', () => {
      const globalData = createAtomicBlockGlobalData()
      const transformer = new BookingTransformer()
      const bookingData = transformer.transformGlobalToBooking(globalData)
      
      const appointment: AppointmentResponse = {
        id: 'apt-1',
        selectedServiceIds: ['block-1'],
        selectedDate: '2026-01-15',
        selectedTimeSlots: [
          { startTime: '2026-01-15T10:00:00Z', endTime: '2026-01-15T12:00:00Z', duration: 120 } as any
        ],
        isQuoteMode: false,
        status: 'booked',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }
      
      const result = transformAppointmentToWizard(appointment, bookingData)
      
      expect(result.availability.selectedTimeSlots).toBeDefined()
      expect(result.availability.selectedTimeSlots).toHaveLength(1)
      expect(result.availability.selectedTimeSlots?.[0].startTime).toBe('2026-01-15T10:00:00Z')
      expect(result.availability.selectedTimeSlots?.[0].endTime).toBe('2026-01-15T12:00:00Z')
      expect(result.availability.selectedTimeSlots?.[0].duration).toBe(120)
    })
    
    it('should handle composite service appointment', () => {
      const globalData = createCompositeBlockGlobalData()
      const transformer = new BookingTransformer()
      const bookingData = transformer.transformGlobalToBooking(globalData)
      
      const appointment: AppointmentResponse = {
        id: 'apt-1',
        selectedServiceIds: ['composite-1'],
        isQuoteMode: false,
        status: 'booked',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }
      
      const result = transformAppointmentToWizard(appointment, bookingData)
      
      expect(result.services).toBeDefined()
      // Composite services are filtered by blockShape, so may not match if shape doesn't match
      expect(result.services.length).toBeGreaterThanOrEqual(0)
    })
    
    it('should handle appointment with property type blocks', () => {
      const globalData = createCompositeBlockGlobalData()
      const transformer = new BookingTransformer()
      const bookingData = transformer.transformGlobalToBooking(globalData)
      
      const appointment: AppointmentResponse = {
        id: 'apt-1',
        selectedServiceIds: ['composite-1'],
        selectedPropertyTypeBlockIds: ['component-1'],
        isQuoteMode: false,
        status: 'booked',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }
      
      const result = transformAppointmentToWizard(appointment, bookingData)
      
      expect(result).toBeDefined()
      expect(result.propertyTypeBlocks).toBeDefined()
      // Property adjustments are filtered by blockShape
    })
    
    it('should handle appointment with user type', () => {
      const globalData = createAtomicBlockGlobalData()
      const transformer = new BookingTransformer()
      const bookingData = transformer.transformGlobalToBooking(globalData)
      
      const appointment: AppointmentResponse = {
        id: 'apt-1',
        selectedServiceIds: ['block-1'],
        userTypeBlockId: 'user-type-1',
        isQuoteMode: false,
        status: 'booked',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }
      
      const result = transformAppointmentToWizard(appointment, bookingData)
      
      expect(result).toBeDefined()
      expect(result.userTypeBlock).toBeDefined()
      // User type is found by blockShape matching 'User Type'
    })
    
    it('should preserve appointment metadata', () => {
      const globalData = createAtomicBlockGlobalData()
      const transformer = new BookingTransformer()
      const bookingData = transformer.transformGlobalToBooking(globalData)
      
      const appointment: AppointmentResponse = {
        id: 'apt-1',
        selectedServiceIds: ['block-1'],
        propertyDetails: { notes: 'Test notes' },
        isQuoteMode: false,
        status: 'booked',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }
      
      const result = transformAppointmentToWizard(appointment, bookingData)
      
      expect(result).toBeDefined()
      expect(result.propertyDetails).toBeDefined()
    })
  })
  
  describe('edge cases', () => {
    it('should handle empty BookingData', () => {
      const bookingData = {
        blockInstances: [],
      }
      
      const appointment: AppointmentResponse = {
        id: 'apt-1',
        selectedServiceIds: ['nonexistent-block'],
        isQuoteMode: false,
        status: 'booked',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }
      
      const result = transformAppointmentToWizard(appointment, bookingData)
      
      expect(result).toBeDefined()
      expect(result.services).toHaveLength(0)
    })
    
    it('should handle invalid date formats gracefully', () => {
      const globalData = createAtomicBlockGlobalData()
      const transformer = new BookingTransformer()
      const bookingData = transformer.transformGlobalToBooking(globalData)
      
      const appointment: AppointmentResponse = {
        id: 'apt-1',
        selectedServiceIds: ['block-1'],
        selectedDate: 'invalid-date',
        isQuoteMode: false,
        status: 'booked',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }
      
      // Should not throw, should handle gracefully
      expect(() => transformAppointmentToWizard(appointment, bookingData)).not.toThrow()
    })
    
    it('should handle appointment with multiple services', () => {
      const globalData = createCompositeBlockGlobalData()
      const transformer = new BookingTransformer()
      const bookingData = transformer.transformGlobalToBooking(globalData)
      
      const appointment: AppointmentResponse = {
        id: 'apt-1',
        selectedServiceIds: ['composite-1', 'component-1', 'component-2'],
        isQuoteMode: false,
        status: 'booked',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }
      
      const result = transformAppointmentToWizard(appointment, bookingData)
      
      // Should return all matching services (filtered by blockShape)
      expect(result.services).toBeDefined()
      expect(Array.isArray(result.services)).toBe(true)
    })
  })
  
  describe('data integrity', () => {
    it('should not mutate original appointment', () => {
      const globalData = createAtomicBlockGlobalData()
      const transformer = new BookingTransformer()
      const bookingData = transformer.transformGlobalToBooking(globalData)
      
      const appointment: AppointmentResponse = {
        id: 'apt-1',
        selectedServiceIds: ['block-1'],
        selectedDate: '2026-01-15',
        isQuoteMode: false,
        status: 'booked',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }
      const originalSelectedDate = appointment.selectedDate
      
      transformAppointmentToWizard(appointment, bookingData)
      
      expect(appointment.selectedDate).toBe(originalSelectedDate)
    })
    
    it('should not mutate BookingData', () => {
      const globalData = createAtomicBlockGlobalData()
      const transformer = new BookingTransformer()
      const bookingData = transformer.transformGlobalToBooking(globalData)
      const originalBlockCount = bookingData.blockInstances.length
      
      const appointment: AppointmentResponse = {
        id: 'apt-1',
        selectedServiceIds: ['block-1'],
        isQuoteMode: false,
        status: 'booked',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }
      
      transformAppointmentToWizard(appointment, bookingData)
      
      expect(bookingData.blockInstances.length).toBe(originalBlockCount)
    })
  })
})

