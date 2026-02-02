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
  
  // Calculate drive time based on constraint type
  try {
    if (constraint.type === 'driveTimeTo' && defaultLocation) {
      // Drive time TO appointment: from default location to first event
      // WHY: First event represents the earliest appointment, so drive time applies to all slots before it
      const firstEvent = eventsForDate[0]
      const destination = eventPlaceIdToRouteLocation(firstEvent.placeId)
      
      if (!destination) {
        logger.warn(
          `[calculateConstraintDriveTime] No placeId for first event (${firstEvent.summary || 'unnamed'}), ` +
          `using static minutes: ${constraint.minutes}`
        )
        return constraint
      }
      
      const source = defaultLocationToRouteLocation(defaultLocation)
      logger.debug(
        `[calculateConstraintDriveTime] Calculating driveTimeTo: defaultLocation → first event ` +
        `(fallback: ${constraint.minutes} min)`
      )
      
      const driveTime = await fetchDriveTime(
        source,
        destination,
        true, // useTraffic
        constraint.minutes // fallbackMinutes
      )
      
      if (!driveTime) {
        logger.warn('[calculateConstraintDriveTime] No route found, using static minutes')
        return constraint
      }
      
      // Use calculated minutes if source is calculated or cached
      if (driveTime._meta?.source === 'calculated' || driveTime._meta?.source === 'cache') {
        logger.debug(
          `[calculateConstraintDriveTime] Calculated driveTimeTo: ${driveTime.durationMinutes} min ` +
          `(source: ${driveTime._meta.source}, was: ${constraint.minutes} min)`
        )
        return { ...constraint, minutes: driveTime.durationMinutes }
      }
      
      // If source is 'estimated' (fallback), keep original constraint
      logger.debug(
        `[calculateConstraintDriveTime] Using estimated/fallback value for driveTimeTo, ` +
        `keeping static minutes: ${constraint.minutes}`
      )
      return constraint
      
    } else if (constraint.type === 'driveTimeFrom' && defaultLocation) {
      // Drive time FROM appointment: from last event to default location
      // WHY: Last event represents the latest appointment, so drive time applies to all slots after it
      const lastEvent = eventsForDate[eventsForDate.length - 1]
      const source = eventPlaceIdToRouteLocation(lastEvent.placeId)
      
      if (!source) {
        logger.warn(
          `[calculateConstraintDriveTime] No placeId for last event (${lastEvent.summary || 'unnamed'}), ` +
          `using static minutes: ${constraint.minutes}`
        )
        return constraint
      }
      
      const destination = defaultLocationToRouteLocation(defaultLocation)
      logger.debug(
        `[calculateConstraintDriveTime] Calculating driveTimeFrom: last event → defaultLocation ` +
        `(fallback: ${constraint.minutes} min)`
      )
      
      const driveTime = await fetchDriveTime(
        source,
        destination,
        true, // useTraffic
        constraint.minutes // fallbackMinutes
      )
      
      if (!driveTime) {
        logger.warn('[calculateConstraintDriveTime] No route found, using static minutes')
        return constraint
      }
      
      // Use calculated minutes if source is calculated or cached
      if (driveTime._meta?.source === 'calculated' || driveTime._meta?.source === 'cache') {
        logger.debug(
          `[calculateConstraintDriveTime] Calculated driveTimeFrom: ${driveTime.durationMinutes} min ` +
          `(source: ${driveTime._meta.source}, was: ${constraint.minutes} min)`
        )
        return { ...constraint, minutes: driveTime.durationMinutes }
      }
      
      // If source is 'estimated' (fallback), keep original constraint
      logger.debug(
        `[calculateConstraintDriveTime] Using estimated/fallback value for driveTimeFrom, ` +
        `keeping static minutes: ${constraint.minutes}`
      )
      return constraint
    }
    
    // No calculation performed (missing defaultLocation or constraint type not handled)
    logger.debug(
      `[calculateConstraintDriveTime] Skipping calculation for ${constraint.type} ` +
      `(defaultLocation: ${defaultLocation ? 'present' : 'missing'})`
    )
    return constraint
    
  } catch (error) {
    // Error during calculation - log with context and return original constraint (fallback to static minutes)
    logger.error(
      `[calculateConstraintDriveTime] Error calculating ${constraint.type} drive time:`,
      error instanceof Error ? error.message : String(error),
      {
        constraintType: constraint.type,
        applyTo: constraint.applyTo,
        fallbackMinutes: constraint.minutes,
        hasDefaultLocation: !!defaultLocation,
        eventCount: eventsForDate.length,
        slotDate: slotDate.toISOString()
      }
    )
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

  const startTime = performance.now()
  logger.debug(
    `[calculateDriveTimeConstraints] Calculating drive times for ${driveTimeConstraints.length} constraints ` +
    `(date: ${context.slotDate.toISOString().split('T')[0]})`
  )

  try {
    // Calculate drive times for all drive time constraints in parallel
    const calculatedConstraints = await Promise.all(
      driveTimeConstraints.map(constraint => calculateConstraintDriveTime(constraint, context))
    )

    const duration = performance.now() - startTime
    const calculatedCount = calculatedConstraints.filter(
      c => c.minutes !== constraints.find(orig => 
        orig.type === c.type && orig.applyTo === c.applyTo
      )?.minutes
    ).length

    logger.debug(
      `[calculateDriveTimeConstraints] Completed in ${duration.toFixed(0)}ms: ` +
      `${calculatedCount}/${driveTimeConstraints.length} constraints updated ` +
      `(${duration < 2000 ? '✓' : '⚠'} performance: ${duration < 2000 ? 'good' : 'slow'})`
    )

    // Warn if performance is slow
    if (duration >= 2000) {
      logger.warn(
        `[calculateDriveTimeConstraints] Performance warning: calculation took ${duration.toFixed(0)}ms ` +
        `(target: <2000ms). Consider optimizing or reducing parallel calculations.`
      )
    }

    // Replace original constraints with calculated ones
    const result = constraints.map(constraint => {
      const calculated = calculatedConstraints.find(
        c => c.type === constraint.type && c.applyTo === constraint.applyTo
      )
      return calculated || constraint
    })

    return result
    
  } catch (error) {
    const duration = performance.now() - startTime
    logger.error(
      `[calculateDriveTimeConstraints] Failed after ${duration.toFixed(0)}ms:`,
      error instanceof Error ? error.message : String(error),
      {
        constraintCount: driveTimeConstraints.length,
        slotDate: context.slotDate.toISOString(),
        hasDefaultLocation: !!context.defaultLocation,
        eventCount: context.calendarEvents?.length || 0
      }
    )
    // Return original constraints on error (fallback to static values)
    return constraints
  }
}
