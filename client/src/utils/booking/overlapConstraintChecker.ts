/**
 * Overlap Constraint Checker
 * 
 * LEARNING: Handles overlap constraint checking and drive time constraint application logic
 * WHY: Separated from slotAvailabilityManager to reduce complexity and break circular dependencies
 * PATTERN: Pure utility functions - no side effects
 */

import type { OverlapConstraint, BusyPeriodSource } from '@shared/types/availabilityTypes'
import type { SlotPositionContext } from './slotAvailabilityManager'
import { timeRangesOverlap } from './timeSlotTypes'

/**
 * Parsed busy time range with Date objects
 * LEARNING: Internal representation of busy periods with parsed Date objects
 * WHY: Avoids repeated parsing of RFC3339 strings during overlap checks
 * PATTERN: Pre-parsed Date objects for efficient comparisons
 */
export interface ParsedBusyTimeRange {
  start: Date
  end: Date
  source?: BusyPeriodSource
}

/**
 * Check if slot is at day start (within buffer window of business hours start)
 * LEARNING: Extracted boundary detection logic for reuse
 * WHY: Reduces nesting and improves readability
 * PATTERN: Pure function with early returns
 * 
 * @param slotTime - Slot time to check (start or end depending on constraint type)
 * @param businessHoursStart - Business hours start time
 * @param bufferMs - Buffer window in milliseconds
 * @returns true if slot is at day start
 */
function isSlotAtDayStart(
  slotTime: Date,
  businessHoursStart: Date,
  bufferMs: number
): boolean {
  const slotTimeMs = slotTime.getTime()
  const dayStartMs = businessHoursStart.getTime()
  return slotTimeMs >= dayStartMs && slotTimeMs <= (dayStartMs + bufferMs)
}

/**
 * Check if slot is at day end (within buffer window of business hours end)
 * LEARNING: Extracted boundary detection logic for reuse
 * WHY: Reduces nesting and improves readability
 * PATTERN: Pure function with early returns
 * 
 * @param slotTime - Slot time to check (start or end depending on constraint type)
 * @param businessHoursEnd - Business hours end time
 * @param bufferMs - Buffer window in milliseconds
 * @returns true if slot is at day end
 */
function isSlotAtDayEnd(
  slotTime: Date,
  businessHoursEnd: Date,
  bufferMs: number
): boolean {
  const slotTimeMs = slotTime.getTime()
  const dayEndMs = businessHoursEnd.getTime()
  return slotTimeMs >= (dayEndMs - bufferMs) && slotTimeMs <= dayEndMs
}

/**
 * Check if driveTimeTo constraint should apply based on applyTo rule
 * LEARNING: Extracted driveTimeTo-specific logic
 * WHY: Reduces nesting and improves readability
 * PATTERN: Pure function with early returns
 * 
 * @param slotStart - Slot start time
 * @param businessHoursStart - Business hours start time
 * @param businessHoursEnd - Business hours end time
 * @param bufferMs - Buffer window in milliseconds
 * @param applyTo - ApplyTo rule (skipDayStart, skipDayEnd, all, none)
 * @returns true if constraint should apply
 */
function shouldApplyDriveTimeTo(
  slotStart: Date,
  businessHoursStart: Date,
  businessHoursEnd: Date,
  bufferMs: number,
  applyTo: 'skipDayStart' | 'skipDayEnd' | 'all' | 'none' | undefined
): boolean {
  switch (applyTo) {
    case 'all':
      return true
    case 'skipDayStart':
      return !isSlotAtDayStart(slotStart, businessHoursStart, bufferMs)
    case 'skipDayEnd':
      return !isSlotAtDayEnd(slotStart, businessHoursEnd, bufferMs)
    case 'none':
      return false
    default:
      return true
  }
}

/**
 * Check if driveTimeFrom constraint should apply based on applyTo rule
 * LEARNING: Extracted driveTimeFrom-specific logic
 * WHY: Reduces nesting and improves readability
 * PATTERN: Pure function with early returns
 * 
 * @param slotEnd - Slot end time
 * @param businessHoursStart - Business hours start time
 * @param businessHoursEnd - Business hours end time
 * @param bufferMs - Buffer window in milliseconds
 * @param applyTo - ApplyTo rule (skipDayStart, skipDayEnd, all, none)
 * @returns true if constraint should apply
 */
function shouldApplyDriveTimeFrom(
  slotEnd: Date,
  businessHoursStart: Date,
  businessHoursEnd: Date,
  bufferMs: number,
  applyTo: 'skipDayStart' | 'skipDayEnd' | 'all' | 'none' | undefined
): boolean {
  switch (applyTo) {
    case 'all':
      return true
    case 'skipDayStart':
      return !isSlotAtDayStart(slotEnd, businessHoursStart, bufferMs)
    case 'skipDayEnd':
      return !isSlotAtDayEnd(slotEnd, businessHoursEnd, bufferMs)
    case 'none':
      return false
    default:
      return true
  }
}

/**
 * Check if a drive time constraint should be applied based on slot position
 * LEARNING: Determines if slot is at business hours boundary
 * WHY: Drive time constraints can skip boundaries (skipDayStart/skipDayEnd) or apply everywhere (all)
 * PATTERN: Compare slot times to business hours boundaries
 * 
 * REFACTORED: Extracted helper functions to reduce nesting from 18 levels to <3
 * 
 * @param constraint - The overlap constraint to check
 * @param slotStart - Slot start time
 * @param slotEnd - Slot end time
 * @param context - Business hours context for this day
 * @returns true if constraint should be applied to this slot
 */
export function shouldApplyDriveTimeConstraint(
  constraint: OverlapConstraint,
  slotStart: Date,
  slotEnd: Date,
  context?: SlotPositionContext
): boolean {
  // Non-drive-time constraints always apply (no applyTo filtering)
  if (constraint.type !== 'driveTimeTo' && constraint.type !== 'driveTimeFrom') {
    return true
  }
  
  // If no context provided, only 'all' constraints apply
  // WHY: Without business hours info, we can't determine boundaries, so only 'all' is safe
  if (!context) {
    return constraint.applyTo === 'all' || constraint.applyTo === undefined
  }
  
  const { businessHoursStart, businessHoursEnd } = context
  const bufferMs = constraint.minutes * 60 * 1000
  
  // LEARNING: Use extracted helper functions to reduce nesting
  // WHY: Each helper handles one specific case, reducing complexity
  // PATTERN: Delegate to type-specific handlers
  if (constraint.type === 'driveTimeTo') {
    return shouldApplyDriveTimeTo(
      slotStart,
      businessHoursStart,
      businessHoursEnd,
      bufferMs,
      constraint.applyTo
    )
  } else {
    // constraint.type === 'driveTimeFrom'
    return shouldApplyDriveTimeFrom(
      slotEnd,
      businessHoursStart,
      businessHoursEnd,
      bufferMs,
      constraint.applyTo
    )
  }
}

/**
 * Check slot availability against busy periods and overlap constraints
 * LEARNING: Main function for checking if a slot is available
 * WHY: Centralizes overlap detection logic with constraint filtering
 * PATTERN: Pure function that returns availability status and violations
 * 
 * REFACTORED: Extracted helper functions to reduce nesting from 16 levels to <3
 * 
 * @param slotStart - Slot start time
 * @param slotEnd - Slot end time
 * @param parsedBusyTimes - Pre-parsed busy time ranges
 * @param overlapConstraints - Overlap constraints to check
 * @param positionContext - Business hours context for drive time constraints
 * @returns Availability status and violation strings
 */
export function checkSlotAvailability(
  slotStart: Date,
  slotEnd: Date,
  parsedBusyTimes: ParsedBusyTimeRange[],
  overlapConstraints?: OverlapConstraint[],
  positionContext?: SlotPositionContext
): { available: boolean; violations: string[] } {
  if (parsedBusyTimes.length === 0) {
    return { available: true, violations: [] }
  }

  // LEARNING: Helper to get data-origin sources of all directly overlapping busy periods
  // WHY: Enables source-specific violation attribution (e.g., overlap.outOfOffice.direct vs overlap.freeBusy.direct)
  // PATTERN: Returns array of BusyPeriodSource values from matching busy periods
  const getDirectOverlapSources = (): BusyPeriodSource[] => {
    return parsedBusyTimes
      .filter(busy => timeRangesOverlap(
        { start: slotStart, end: slotEnd },
        { start: busy.start, end: busy.end }
      ))
      .map(busy => busy.source ?? 'freeBusy')
  }

  // If no overlap constraints, check basic overlap
  if (!overlapConstraints || overlapConstraints.length === 0) {
    const directOverlapSources = getDirectOverlapSources()
    const hasDirectOverlap = directOverlapSources.length > 0
    // PATTERN: Use .direct suffix for basic overlaps (no buffer configured)
    // Generate source-specific violations
    const violations: string[] = []
    if (hasDirectOverlap) {
      const uniqueSources = [...new Set(directOverlapSources)]
      for (const source of uniqueSources) {
        violations.push(`overlap.${source}.direct`)
      }
    }
    return { available: !hasDirectOverlap, violations }
  }

  // LEARNING: Filter constraints based on position context for drive time applyTo logic
  // WHY: driveTimeTo/driveTimeFrom have applyTo rules (skipDayStart, skipDayEnd, all, none)
  // PATTERN: Use shouldApplyDriveTimeConstraint to filter before checking overlaps
  const applicableConstraints = overlapConstraints.filter(constraint => 
    shouldApplyDriveTimeConstraint(constraint, slotStart, slotEnd, positionContext)
  )
  
  // If no applicable constraints after filtering, check basic overlap
  if (applicableConstraints.length === 0) {
    const directOverlapSources = getDirectOverlapSources()
    const hasDirectOverlap = directOverlapSources.length > 0
    // PATTERN: Use .direct suffix for basic overlaps (constraints filtered out)
    // Generate source-specific violations
    const violations: string[] = []
    if (hasDirectOverlap) {
      const uniqueSources = [...new Set(directOverlapSources)]
      for (const source of uniqueSources) {
        violations.push(`overlap.${source}.direct`)
      }
    }
    return { available: !hasDirectOverlap, violations }
  }

  // LEARNING: Use functional approach to collect violations
  // PATTERN: Filter constraints, check overlaps, collect violations, check for hard failures
  
  /**
   * LEARNING: Check constraint overlap and distinguish direct vs buffer
   * WHY: Provides granular feedback on WHY a slot is blocked
   * PATTERN: Returns { overlaps: boolean, isDirect: boolean }
   * - overlaps: true if there's any overlap (direct or buffer)
   * - isDirect: true if direct overlap exists (slot touches busy period without buffer)
   */
  const checkConstraintOverlap = (constraint: OverlapConstraint): { overlaps: boolean; isDirect: boolean } => {
    // First check direct overlap (no buffer) - use the sources function
    const directOverlapSources = getDirectOverlapSources()
    const directOverlap = directOverlapSources.length > 0
    
    // Then check buffer-expanded overlap
    const bufferMs = constraint.minutes * 60 * 1000
    let checkStart = slotStart
    let checkEnd = slotEnd

    if (constraint.placement === 'before' || constraint.placement === 'both') {
      checkStart = new Date(slotStart.getTime() - bufferMs)
    }

    if (constraint.placement === 'after' || constraint.placement === 'both') {
      checkEnd = new Date(slotEnd.getTime() + bufferMs)
    }

    const bufferOverlap = parsedBusyTimes.some(busy => 
      timeRangesOverlap(
        { start: checkStart, end: checkEnd },
        { start: busy.start, end: busy.end }
      )
    )

    return { 
      overlaps: bufferOverlap, // Buffer check includes direct overlap
      isDirect: directOverlap 
    }
  }

  // LEARNING: Check ALL constraints and collect ALL violations with proper attribution
  // WHY: Overlay needs to show all constraint types that block a slot with correct colors
  // PATTERN: Direct conflicts use source-specific attribution (e.g., overlap.outOfOffice.direct)
  
  const allViolations: string[] = []
  let hasHardFailure = false
  const directOverlapSources = getDirectOverlapSources()
  const hasDirectOverlap = directOverlapSources.length > 0
  
  // LEARNING: Direct overlap violations use source-specific attribution
  // WHY: Enables dev-mode overlay to show distinct colors for different busy period sources
  // PATTERN: Generate one violation per unique source (e.g., overlap.freeBusy.direct, overlap.outOfOffice.direct)
  if (hasDirectOverlap) {
    const uniqueSources = [...new Set(directOverlapSources)]
    for (const source of uniqueSources) {
      allViolations.push(`overlap.${source}.direct`)
    }
    hasHardFailure = true  // Direct conflicts are always hard failures
  }
  
  // Check buffer-only overlaps for all constraints
  for (const constraint of applicableConstraints) {
    const result = checkConstraintOverlap(constraint)
    
    // LEARNING: Only record buffer violations when overlap is DUE TO the buffer
    // WHY: If there's a direct overlap, that's already captured with source-specific violations above
    // PATTERN: Buffer violations only for !hasDirectOverlap && bufferOverlap
    const isBufferOnlyOverlap = result.overlaps && !hasDirectOverlap
    
    // For appointment constraint: also record buffer if it extends beyond direct overlap
    // For drive time constraints: only record buffer-only overlaps (they can never be "direct")
    // PATTERN: Include buffer minutes in violation string for tooltip display: 'overlap.{type}.buffer:{minutes}'
    if (constraint.type === 'appointment') {
      // Appointment buffer extends beyond direct overlap
      if (result.overlaps && !result.isDirect) {
        // Buffer-only for appointment (direct already recorded above if applicable)
        allViolations.push(`overlap.appointment.buffer:${constraint.minutes}`)
        if (constraint.enforcement === 'hard') {
          hasHardFailure = true
        }
      }
    } else if (constraint.type === 'driveTimeTo' || constraint.type === 'driveTimeFrom') {
      // Drive time constraints can ONLY be buffer violations
      if (isBufferOnlyOverlap) {
        allViolations.push(`overlap.${constraint.type}.buffer:${constraint.minutes}`)
        if (constraint.enforcement === 'hard') {
          hasHardFailure = true
        }
      }
    } else {
      // Other constraint types (e.g., lunch) - use original logic with minutes
      if (result.overlaps) {
        const suffix = result.isDirect ? 'direct' : `buffer:${constraint.minutes}`
        allViolations.push(`overlap.${constraint.type}.${suffix}`)
        if (constraint.enforcement === 'hard') {
          hasHardFailure = true
        }
      }
    }
  }
  
  // If any hard constraint failed, slot is unavailable but we return ALL violations for debugging
  if (hasHardFailure) {
    return { available: false, violations: allViolations }
  }

  // No hard failures - slot is available but may have flexible violations
  return { available: true, violations: allViolations }
}
