/**
 * Overlap Constraint Checker
 * 
 * LEARNING: Handles overlap constraint checking and drive time constraint application logic
 * WHY: Separated from slotAvailabilityOrchestrator to reduce complexity and break circular dependencies
 * PATTERN: Pure utility functions - no side effects
 */

import type { OverlapConstraint, ConstraintCheckResult } from '@shared/types/availabilityTypes'
import type { SlotPositionContext } from './slotAvailabilityOrchestrator'
import { timeRangesOverlap, type ParsedBusyTimeRange } from './timeSlotTypes'

// Re-export for backward compatibility
export type { ParsedBusyTimeRange }

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
 * Check if drive time constraint should apply based on applyTo rule
 * LEARNING: Consolidated driveTimeTo/driveTimeFrom logic into single function
 * WHY: Eliminates duplication - both types use identical logic, only differ by which slot time is checked
 * PATTERN: Pure function with early returns
 * 
 * @param slotTime - Slot time to check (slotStart for driveTimeTo, slotEnd for driveTimeFrom)
 * @param businessHoursStart - Business hours start time
 * @param businessHoursEnd - Business hours end time
 * @param bufferMs - Buffer window in milliseconds
 * @param applyTo - ApplyTo rule (skipDayStart, skipDayEnd, all, none)
 * @returns true if constraint should apply
 */
function shouldApplyDriveTime(
  slotTime: Date,
  businessHoursStart: Date,
  businessHoursEnd: Date,
  bufferMs: number,
  applyTo: 'skipDayStart' | 'skipDayEnd' | 'all' | 'none' | undefined
): boolean {
  switch (applyTo) {
    case 'all':
      return true
    case 'skipDayStart':
      return !isSlotAtDayStart(slotTime, businessHoursStart, bufferMs)
    case 'skipDayEnd':
      return !isSlotAtDayEnd(slotTime, businessHoursEnd, bufferMs)
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
  
  // LEARNING: Use consolidated helper function - driveTimeTo checks slotStart, driveTimeFrom checks slotEnd
  // WHY: Single function handles both types, caller determines which slot time to pass
  // PATTERN: Delegate to unified handler with appropriate slot time
  const slotTime = constraint.type === 'driveTimeTo' ? slotStart : slotEnd
  return shouldApplyDriveTime(
    slotTime,
    businessHoursStart,
    businessHoursEnd,
    bufferMs,
    constraint.applyTo
  )
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
): ConstraintCheckResult {
  if (parsedBusyTimes.length === 0) {
    return { passes: true, violations: [] }
  }

  // LEARNING: Compute direct overlap sources once per slot (not per constraint)
  // WHY: Avoids redundant busy-period scans - same result used for all constraints
  // PATTERN: Compute once, reuse throughout function
  const directOverlapSources = parsedBusyTimes
    .filter(busy => timeRangesOverlap(
      { start: slotStart, end: slotEnd },
      { start: busy.start, end: busy.end }
    ))
    .map(busy => busy.source ?? 'event')
  const hasDirectOverlap = directOverlapSources.length > 0

  // If no overlap constraints, check basic overlap
  if (!overlapConstraints || overlapConstraints.length === 0) {
    // PATTERN: Use .direct suffix for basic overlaps (no buffer configured)
    // Generate source-specific violations
    const violations: string[] = []
    if (hasDirectOverlap) {
      const uniqueSources = [...new Set(directOverlapSources)]
      for (const source of uniqueSources) {
        violations.push(`overlap.${source}.direct`)
      }
    }
    return { passes: !hasDirectOverlap, violations }
  }

  // LEARNING: Filter constraints based on position context for drive time applyTo logic
  // WHY: driveTimeTo/driveTimeFrom have applyTo rules (skipDayStart, skipDayEnd, all, none)
  // PATTERN: Use shouldApplyDriveTimeConstraint to filter before checking overlaps
  const applicableConstraints = overlapConstraints.filter(constraint => 
    shouldApplyDriveTimeConstraint(constraint, slotStart, slotEnd, positionContext)
  )
  
  // If no applicable constraints after filtering, check basic overlap
  if (applicableConstraints.length === 0) {
    // PATTERN: Use .direct suffix for basic overlaps (constraints filtered out)
    // Generate source-specific violations
    const violations: string[] = []
    if (hasDirectOverlap) {
      const uniqueSources = [...new Set(directOverlapSources)]
      for (const source of uniqueSources) {
        violations.push(`overlap.${source}.direct`)
      }
    }
    return { passes: !hasDirectOverlap, violations }
  }

  // LEARNING: Use functional approach to collect violations
  // PATTERN: Filter constraints, check overlaps, collect violations, check for hard failures
  
  /**
   * LEARNING: Check constraint overlap and distinguish direct vs buffer
   * WHY: Provides granular feedback on WHY a slot is blocked
   * PATTERN: Returns { overlaps: boolean, isDirect: boolean }
   * - overlaps: true if there's any overlap (direct or buffer)
   * - isDirect: true if direct overlap exists (slot touches busy period without buffer)
   * 
   * REFACTORED: Drive time constraints now use dynamic lookups per overlapping busy period's placeId
   */
  const checkConstraintOverlap = (constraint: OverlapConstraint, hasDirectOverlap: boolean): { overlaps: boolean; isDirect: boolean } => {
    // Direct overlap already computed - use passed value
    const directOverlap = hasDirectOverlap
    
    // For drive time constraints, read drive times directly from busy periods
    if (constraint.type === 'driveTimeTo' || constraint.type === 'driveTimeFrom') {
      // Find all busy periods that would overlap with buffer-expanded slot
      const overlappingBusyPeriods = parsedBusyTimes.filter(busy => {
        // Read drive time from busy period, fallback to constraint's static minutes
        const driveMinutes = (constraint.type === 'driveTimeTo' ? busy.driveTimeTo : busy.driveTimeFrom)
          ?? constraint.minutes
        const bufferMs = driveMinutes * 60 * 1000
        
        // Expand slot by buffer based on placement
        let checkStart = slotStart
        let checkEnd = slotEnd
        
        if (constraint.placement === 'before' || constraint.placement === 'both') {
          checkStart = new Date(slotStart.getTime() - bufferMs)
        }
        
        if (constraint.placement === 'after' || constraint.placement === 'both') {
          checkEnd = new Date(slotEnd.getTime() + bufferMs)
        }
        
        return timeRangesOverlap(
          { start: checkStart, end: checkEnd },
          { start: busy.start, end: busy.end }
        )
      })
      
      return {
        overlaps: overlappingBusyPeriods.length > 0,
        isDirect: directOverlap
      }
    }
    
    // For non-drive-time constraints, use static buffer
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
  
  // LEARNING: Direct overlap violations use source-specific attribution
  // WHY: Enables dev-mode overlay to show distinct colors for different busy period sources
  // PATTERN: Generate one violation per unique source (e.g., overlap.event.direct, overlap.outOfOffice.direct)
  if (hasDirectOverlap) {
    const uniqueSources = [...new Set(directOverlapSources)]
    for (const source of uniqueSources) {
      allViolations.push(`overlap.${source}.direct`)
    }
    hasHardFailure = true  // Direct conflicts are always hard failures
  }
  
  // Check buffer-only overlaps for all constraints
  for (const constraint of applicableConstraints) {
    const result = checkConstraintOverlap(constraint, hasDirectOverlap)
    
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
    return { passes: false, violations: allViolations }
  }

  // No hard failures - slot is available but may have flexible violations
  return { passes: true, violations: allViolations }
}
