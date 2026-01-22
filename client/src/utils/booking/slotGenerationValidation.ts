/**
 * Slot Generation Validation Utility
 * 
 * LEARNING: Shared validation for slot generation parameters
 * WHY: Eliminates duplicate validation logic across multiple slot generation functions
 * PATTERN: Pure validation functions that throw descriptive errors
 * 
 * P2-5: Created to consolidate slot generation validation from multiple locations
 */

import type { RFC3339DateTime } from '@/types/datetime'
import type { BusinessHoursMap } from './timeSlotFitter'
import { createLogger } from '@/utils/logger'

const logger = createLogger('slotGenerationValidation')

/**
 * Parameters for slot generation validation
 */
export interface SlotGenerationParams {
  duration: number
  minuteIncrement: number
  startBoundary: RFC3339DateTime
  endBoundary: RFC3339DateTime
  businessHours: BusinessHoursMap
}

/**
 * Validate slot generation parameters
 * LEARNING: Comprehensive validation for all slot generation parameters
 * WHY: Prevents invalid slot generation, infinite loops, and runtime errors
 * PATTERN: Validate all parameters, throw descriptive errors with parameter values
 * 
 * @param params - Slot generation parameters to validate
 * @throws Error if any parameter is invalid
 */
export function validateSlotGenerationParams(params: SlotGenerationParams): void {
  const { duration, minuteIncrement, startBoundary, endBoundary, businessHours } = params

  // Validate duration
  if (!duration || duration <= 0) {
    logger.error('Invalid duration: must be > 0', { duration })
    throw new Error(`duration must be greater than 0, got: ${duration}`)
  }
  if (!Number.isInteger(duration)) {
    logger.warn('Non-integer duration will be rounded', { duration })
  }

  // Validate minuteIncrement
  if (!minuteIncrement || minuteIncrement <= 0) {
    logger.error('Invalid minuteIncrement: must be > 0', { minuteIncrement })
    throw new Error(`minuteIncrement must be greater than 0, got: ${minuteIncrement}`)
  }
  if (!Number.isInteger(minuteIncrement)) {
    logger.error('Invalid minuteIncrement: must be an integer', { minuteIncrement })
    throw new Error(`minuteIncrement must be a positive integer, got: ${minuteIncrement}`)
  }
  // P3-2: Extract magic number to constant
  // LEARNING: Maximum recommended minute increment for time slots
  // WHY: Large increments may result in very few available slots
  // PATTERN: Constant for maximum recommended value
  const MAX_RECOMMENDED_MINUTE_INCREMENT = 60
  if (minuteIncrement > MAX_RECOMMENDED_MINUTE_INCREMENT) {
    logger.warn('Large minuteIncrement may result in few slots', { minuteIncrement })
  }

  // Validate boundaries
  if (!startBoundary || !endBoundary) {
    logger.error('Missing boundary parameters')
    throw new Error('startBoundary and endBoundary are required')
  }

  // Cache boundary Date objects for validation
  const startBoundaryDate = new Date(startBoundary)
  const endBoundaryDate = new Date(endBoundary)

  // Validate Date objects are valid
  if (isNaN(startBoundaryDate.getTime())) {
    logger.error('Invalid startBoundary datetime', { startBoundary })
    throw new Error(`startBoundary must be a valid RFC3339 datetime, got: ${startBoundary}`)
  }
  if (isNaN(endBoundaryDate.getTime())) {
    logger.error('Invalid endBoundary datetime', { endBoundary })
    throw new Error(`endBoundary must be a valid RFC3339 datetime, got: ${endBoundary}`)
  }

  // Validate boundaries: start < end
  if (startBoundaryDate >= endBoundaryDate) {
    logger.debug('Invalid boundaries: start >= end', { startBoundary, endBoundary })
    throw new Error(`startBoundary must be before endBoundary, got: start=${startBoundary}, end=${endBoundary}`)
  }

  // Validate business hours
  if (!businessHours || typeof businessHours !== 'object') {
    logger.error('Invalid businessHours: must be an object')
    throw new Error('businessHours must be a BusinessHoursMap object')
  }

  // Check if at least one day has business hours
  const hasAnyHours = Object.keys(businessHours).length > 0
  if (!hasAnyHours) {
    logger.warn('No business hours defined for any day')
    throw new Error('businessHours must contain at least one day with hours defined')
  }
}
