/**
 * Drive Time Calculator Service
 * 
 * LEARNING: Calculates dynamic drive times for constraints using Google Routes API
 * WHY: Replaces static DriveTimeConfig.minutes with real-time calculated drive times
 * PATTERN: Takes static constraints and location context, returns constraints with calculated minutes
 * 
 * Session 2.2.3: Created for drive time API integration
 */

import type { OverlapConstraint } from './constraintExtractors'
import type { DefaultLocation } from '@/configs/availabilitySettings'
import type { CalendarEvent } from '@/services/calendarApiService'
import { fetchDriveTime, type RouteLocation } from '@/services/mapsApiService'
import { createLogger } from '@/utils/logger'

const logger = createLogger('driveTimeCalculator')

/**
 * Context for drive time calculations
 * LEARNING: Provides location data needed to calculate drive times
 * WHY: Separates location data from constraint logic
 * 
 * Session 2.2.3: Removed slotPosition - filtering now handled by shouldApplyDriveTimeConstraint
 */
export interface DriveTimeCalculationContext {
  defaultLocation?: DefaultLocation
  calendarEvents?: CalendarEvent[]
  slotDate: Date
}

/**
 * Convert DefaultLocation to RouteLocation
 * LEARNING: Maps our location format to Routes API format
 * WHY: DefaultLocation uses placeId as primary identifier
 * PATTERN: placeId is required, coordinates/address are fallbacks only
 */
function defaultLocationToRouteLocation(location: DefaultLocation): RouteLocation {
  // placeId is primary and required
  if (location.placeId) {
    return { placeId: location.placeId }
  }
  // Fallbacks only if placeId somehow missing (shouldn't happen in normal flow)
  if (location.coordinates) {
    return { coordinates: location.coordinates }
  }
  if (location.address) {
    return { address: location.address }
  }
  throw new Error('DefaultLocation must have placeId')
}

/**
 * Convert calendar event placeId to RouteLocation
 * LEARNING: Calendar events use placeId as primary location identifier
 * WHY: placeId provides best accuracy for route calculations
 * PATTERN: placeId is primary throughout codebase, address only at UI boundary
 */
function eventPlaceIdToRouteLocation(placeId: string | undefined): RouteLocation | null {
  if (!placeId) {
    return null
  }
  return { placeId }
}

/**
 * Find calendar events for a specific date
 * LEARNING: Filters events to those on the given date
 * WHY: Need to find appointments on the same day to determine first/last
 * 
 * @param events Calendar events
 * @param date Date to filter events for
 * @returns Events on the specified date, sorted by start time
 */
function getEventsForDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
  const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD
  
  return events
    .filter(event => {
      const eventDate = new Date(event.start).toISOString().split('T')[0]
      return eventDate === dateStr
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
}

/**
 * Calculate drive time for a constraint
 * LEARNING: Handles different applyTo scenarios and location resolution
 * WHY: Centralizes drive time calculation logic for all constraint types
 * 
 * @param constraint Drive time constraint to calculate for
 * @param context Calculation context with location data
 * @returns Updated constraint with calculated minutes, or original if calculation fails
 */
async function calculateConstraintDriveTime(
  constraint: OverlapConstraint,
  context: DriveTimeCalculationContext
): Promise<OverlapConstraint> {
  // Only calculate for drive time constraints
  if (constraint.type !== 'driveTimeTo' && constraint.type !== 'driveTimeFrom') {
    return constraint
  }

  const { defaultLocation, calendarEvents, slotDate } = context
  
  // Session 2.2.3: Simplified logic - calculate drive times for all constraints
  // Filtering by skipDayStart/skipDayEnd is handled by shouldApplyDriveTimeConstraint
  // For 'all' and 'skipDayStart'/'skipDayEnd', we calculate using representative events
  
  const eventsForDate = calendarEvents ? getEventsForDate(calendarEvents, slotDate) : []
  
  if (eventsForDate.length === 0) {
    // No events for this day - return original constraint (will use fallback minutes)
    return constraint
  }
  
  if (constraint.type === 'driveTimeTo' && defaultLocation) {
    // Drive time TO appointment: from default location to first event
    // WHY: First event represents the earliest appointment, so drive time applies to all slots before it
    const firstEvent = eventsForDate[0]
    const destination = eventPlaceIdToRouteLocation(firstEvent.placeId)
    
    if (destination) {
      const source = defaultLocationToRouteLocation(defaultLocation)
      const driveTime = await fetchDriveTime(source, destination, constraint.minutes)
      
      if (driveTime && driveTime.minutes !== constraint.minutes) {
        return { ...constraint, minutes: driveTime.minutes }
      }
    }
  } else if (constraint.type === 'driveTimeFrom' && defaultLocation) {
    // Drive time FROM appointment: from last event to default location
    // WHY: Last event represents the latest appointment, so drive time applies to all slots after it
    const lastEvent = eventsForDate[eventsForDate.length - 1]
    const source = eventPlaceIdToRouteLocation(lastEvent.placeId)
    
    if (source) {
      const destination = defaultLocationToRouteLocation(defaultLocation)
      const driveTime = await fetchDriveTime(source, destination, constraint.minutes)
      
      if (driveTime && driveTime.minutes !== constraint.minutes) {
        return { ...constraint, minutes: driveTime.minutes }
      }
    }
  }
  
  // Return original constraint if no calculation performed
  return constraint

  // Calculate drive time with fallback to static minutes
  try {
    const result = await fetchDriveTime(
      origin,
      destination,
      true, // useTraffic
      constraint.minutes // fallbackMinutes
    )

    if (!result) {
      logger.warn('[calculateConstraintDriveTime] No route found, using static minutes')
      return constraint
    }

    // Use calculated minutes if available
    if (result._meta?.source === 'calculated' || result._meta?.source === 'cache') {
      logger.debug(
        `[calculateConstraintDriveTime] Calculated drive time: ${result.durationMinutes} min ` +
        `(source: ${result._meta.source}, constraint: ${constraint.type})`
      )
      return {
        ...constraint,
        minutes: result.durationMinutes
      }
    }

    // If source is 'estimated' (fallback), keep original constraint
    logger.debug(
      `[calculateConstraintDriveTime] Using estimated/fallback value, keeping static minutes: ${constraint.minutes}`
    )
    return constraint

  } catch (error) {
    logger.error('[calculateConstraintDriveTime] Error calculating drive time:', error)
    // Return original constraint on error (fallback to static minutes)
    return constraint
  }
}

/**
 * Calculate drive times for constraints
 * 
 * LEARNING: Main function to replace static minutes with calculated drive times
 * WHY: Enables dynamic drive time buffers based on actual travel times
 * PATTERN: Processes constraints in parallel, falls back to static values on error
 * 
 * @param constraints Array of overlap constraints (may include drive time constraints)
 * @param context Calculation context with location data
 * @returns Constraints with calculated minutes where possible
 */
export async function calculateDriveTimeConstraints(
  constraints: OverlapConstraint[],
  context: DriveTimeCalculationContext
): Promise<OverlapConstraint[]> {
  // Filter to only drive time constraints that need calculation
  const driveTimeConstraints = constraints.filter(
    c => (c.type === 'driveTimeTo' || c.type === 'driveTimeFrom') && c.applyTo !== 'none'
  )

  if (driveTimeConstraints.length === 0) {
    // No drive time constraints to calculate
    return constraints
  }

  logger.debug(
    `[calculateDriveTimeConstraints] Calculating drive times for ${driveTimeConstraints.length} constraints`
  )

  // Calculate drive times for all drive time constraints in parallel
  const calculatedConstraints = await Promise.all(
    driveTimeConstraints.map(constraint => calculateConstraintDriveTime(constraint, context))
  )

  // Replace original constraints with calculated ones
  const result = constraints.map(constraint => {
    const calculated = calculatedConstraints.find(
      c => c.type === constraint.type && c.applyTo === constraint.applyTo
    )
    return calculated || constraint
  })

  return result
}
