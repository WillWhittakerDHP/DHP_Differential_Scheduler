
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import { createLogger } from '@/utils/logger'

const logger = createLogger('slotGenerationValidation')

/** Base for slot generation; MinimalSlotParams extends and adds includeFlags (P2 type-similarity). */
export interface SlotGenerationParamsBase {
  duration: number
  minuteIncrement: number
  startBoundary: RFC3339DateTime
  endBoundary: RFC3339DateTime
}

export type SlotGenerationParams = SlotGenerationParamsBase

/**
 * Validate slot generation parameters
 * 
 * @param params - Slot generation parameters to validate
 * @throws Error if any parameter is invalid
 */
export function validateSlotGenerationParams(params: SlotGenerationParams): void {
  const { duration, minuteIncrement, startBoundary, endBoundary } = params

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
  // PATTERN: Constant for maximum recommended value
  const MAX_RECOMMENDED_MINUTE_INCREMENT = 60
  if (minuteIncrement > MAX_RECOMMENDED_MINUTE_INCREMENT) {
    logger.warn('Large minuteIncrement may result in few slots', { minuteIncrement })
  }

  if (!startBoundary || !endBoundary) {
    logger.error('Missing boundary parameters')
    throw new Error('startBoundary and endBoundary are required')
  }

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
}
