/**
 * Part Finalizer
 * 
 * LEARNING: Groups parts by part shape and creates PartFinal instances
 * WHY: Part shape is the semantic unit - all instances of same shape should be totaled
 * PATTERN: Pure functions for aggregation and flag-based grouping
 */

import type { BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { PartFinal } from './PartFinal'
import type { BlockFinal } from './BlockFinal'
import type { EventInstance, EventShape } from '@/types/events'
import { createPartFinal } from './PartFinal'
import { toBoolean } from '@/utils/ternary/ternaryUtils'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import { 
  getMajorEventShape, 
  getMinorEventShape 
} from '@/utils/eventAttendeeUtils'
import type { EventShapeEntity } from '@/types/entities'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import { EVENT_PERSPECTIVE_KEYS } from '@/configs/eventPerspectiveLabels'
import { createLogger } from '@/utils/logger'

const logger = createLogger('partFinalizer')

/**
 * Group parts by part shape
 * LEARNING: Groups part instances by their partShape property
 * WHY: Part shape is the semantic unit - all instances of same shape should be totaled together
 * PATTERN: Use reduce to build Map of part shape name to array of parts
 * 
 * @param parts - Array of BookingPartInstance objects
 * @returns Map of part shape name to array of parts with that shape
 */
function groupPartsByShape(
  parts: BookingPartInstance[]
): Map<string, BookingPartInstance[]> {
  return parts.reduce((grouped, part) => {
    const partShape = part.partShape || ''
    if (!grouped.has(partShape)) {
      grouped.set(partShape, [])
    }
    grouped.get(partShape)!.push(part)
    return grouped
  }, new Map<string, BookingPartInstance[]>())
}

/**
 * Create PartFinal instances from part instances
 * LEARNING: Groups parts by shape and creates PartFinal with dual-track durations
 * WHY: Part shape is the semantic unit - all instances of same shape should be totaled
 * PATTERN: Group by shape, then create PartFinal with rounding settings
 * 
 * @param parts - Array of BookingPartInstance objects
 * @param settings - Optional availability settings for rounding configuration
 * @returns Array of PartFinal instances
 */
export function createPartFinals(
  parts: BookingPartInstance[],
  settings?: AvailabilitySettings | null
): PartFinal[] {
  const partsByShape = groupPartsByShape(parts)
  
  return Array.from(partsByShape.entries()).map(([partShape, shapeParts]) =>
    createPartFinal(partShape, shapeParts, settings)
  )
}

/**
 * Filter out PartFinal instances that should be zeroed out
 * LEARNING: Removes PartFinal instances where zeroOutPart === true
 * WHY: Zeroed parts should not contribute to calculations
 * PATTERN: Filter based on zeroOutPart flag
 * 
 * @param partFinals - Array of PartFinal instances
 * @returns Array of PartFinal instances excluding zeroed parts
 */
export function filterZeroedParts(
  partFinals: PartFinal[]
): PartFinal[] {
  return partFinals.filter(part => !part.zeroOutPart)
}

/**
 * Calculate SlotShape from BlockFinal instances (single-pass optimization)
 * LEARNING: Single iteration through blockFinals instead of multiple separate filter+reduce operations
 * WHY: More efficient - O(n) instead of O(5n), reduces array iterations
 * PATTERN: Accumulate all totals in one pass, iterating over blocks and their finalized parts
 * 
 * BlockFinal Refactor: Now accepts BlockFinal[] instead of PartFinal[]
 * WHY: Makes it explicit that we're accumulating finalized blocks, preserving block-level context
 * PATTERN: Iterate over BlockFinal[], then iterate over each blockFinal.finalizedParts
 * 
 * Session Event Refactor: Computes eventFinals array dynamically from EventInstance[]
 * WHY: Enables fully generic event system - no hardcoded event names, matches PartFinal[] pattern
 * PATTERN: Build EventFinal[] array from EventInstance[] stored on AppointmentShape
 * NOTE: Events are looked up from eventAssignmentsByPartShape keyed by partShape name
 * 
 * LEARNING: Events are appointment-level features, not part properties
 * WHY: Events are configured at shape level (PartShape → EventInstance), stored on AppointmentShape
 * PATTERN: Look up EventInstance[] for each partShape, read metadata from EventShape
 * 
 * @param blockFinals - Array of BlockFinal instances
 * @param eventAssignmentsByPartShape - Record mapping partShape name → EventInstance[]
 * @param eventShapes - Array of EventShape objects for metadata lookup
 * @param globalData - Optional GlobalData for attendee-based logic (if not provided, falls back to name-based logic)
 * @param availabilitySettings - Optional AvailabilitySettings for major/minor attendee configuration
 * @returns SlotShape with eventFinals array and duration totals
 */
export function calculateSlotShape(
  blockFinals: BlockFinal[],
  eventAssignmentsByPartShape: Record<string, EventInstance[]> = {},
  eventShapes: EventShape[] = [],
  globalData?: GlobalData,
  availabilitySettings?: AvailabilitySettings | null
): import('@/types/appointment').SlotShape {
  // DUAL-TRACK ARCHITECTURE: Track both raw and rounded durations
  let rawDuration = 0
  let roundedDuration = 0
  
  // PATTERN: Map<eventShapeId, duration> for accumulation, then convert to array
  // Track both raw and rounded separately
  const eventRawDurationsByShapeId = new Map<string, number>()
  const eventRoundedDurationsByShapeId = new Map<string, number>()
  
  const eventShapeById = new Map(eventShapes.map(es => [es.id, es]))
  
  // PATTERN: Use availabilitySettings to get major/minor attendee IDs, fall back to name-based logic if not available
  let majorAttendeeIds: string[] = []
  let minorAttendeeIds: string[] = []
  let useAttendeeBasedLogic = false
  
  if (globalData && availabilitySettings?.differentialPerspectives) {
    majorAttendeeIds = availabilitySettings.differentialPerspectives.majorAttendees || []
    minorAttendeeIds = availabilitySettings.differentialPerspectives.minorAttendees || []
    useAttendeeBasedLogic = majorAttendeeIds.length > 0 || minorAttendeeIds.length > 0
  }
  
  const eventShapeEntities = eventShapes as EventShapeEntity[]
  
  // PATTERN: Use reduce to accumulate durations and event durations immutably
  // LEARNING: Iterate over BlockFinal[], then accumulate from each blockFinal.finalizedParts
  // WHY: Makes it explicit that we're accumulating finalized blocks, preserving block-level context
  const { totalRawDuration, totalRoundedDuration, eventRawDurations, eventRoundedDurations } = blockFinals.reduce(
    (blockAcc, blockFinal) => {
      // PATTERN: Accumulate from all finalized parts within this block
      return blockFinal.finalizedParts.reduce(
        (partAcc, part) => {
          const baseTime = part.baseTime
          const roundedTime = part.roundedTime
          const newRawDuration = partAcc.totalRawDuration + baseTime
          const newRoundedDuration = partAcc.totalRoundedDuration + roundedTime
          
          const events = eventAssignmentsByPartShape[part.partShape] || []
          
          // PATTERN: Process events and accumulate durations by event shape
          const updatedEventRawDurations = new Map(partAcc.eventRawDurations)
          const updatedEventRoundedDurations = new Map(partAcc.eventRoundedDurations)
          
          for (const eventInstance of events) {
            const eventShape = eventShapeById.get(eventInstance.eventShapeRef)
            if (!eventShape) continue
            
            const eventShapeId = eventShape.id
            
            // PATTERN: Check isTernary flag, use ternaryDefault if available, otherwise fail gracefully
            if (eventShape.isTernary) {
              const ternaryValue = eventShape.ternaryDefault
              if (ternaryValue === null) {
                logger.error('Cannot determine ternary value for event shape - ternaryDefault is null', {
                  eventShapeName: eventShape.name,
                  eventShapeId: eventShape.id
                })
                continue // Skip this event - graceful failure
              }
              
              const isActive = toBoolean(ternaryValue, 'strict')
              
              if (isActive) {
                // DUAL-TRACK: Accumulate both raw and rounded
                const currentRawDuration = updatedEventRawDurations.get(eventShapeId) || 0
                const currentRoundedDuration = updatedEventRoundedDurations.get(eventShapeId) || 0
                updatedEventRawDurations.set(eventShapeId, currentRawDuration + baseTime)
                updatedEventRoundedDurations.set(eventShapeId, currentRoundedDuration + roundedTime)
                
                // PATTERN: Just log event processing, offset calculation happens after all events are processed
                if (useAttendeeBasedLogic) {
                  const majorEventShape = getMajorEventShape(eventShapeEntities, majorAttendeeIds)
                  const minorEventShape = getMinorEventShape(eventShapeEntities, minorAttendeeIds)
                  // WHY: Eliminates hardcoded perspective strings, enables config-driven approach
                  // PATTERN: Use EVENT_PERSPECTIVE_KEYS constants for perspective determination
                  const eventPerspective = majorEventShape?.id === eventShape.id ? EVENT_PERSPECTIVE_KEYS.MAJOR : (minorEventShape?.id === eventShape.id ? EVENT_PERSPECTIVE_KEYS.MINOR : EVENT_PERSPECTIVE_KEYS.OTHER)
                }
              }
            } else {
              // DUAL-TRACK: Accumulate both raw and rounded for boolean events
              const currentRawDuration = updatedEventRawDurations.get(eventShapeId) || 0
              const currentRoundedDuration = updatedEventRoundedDurations.get(eventShapeId) || 0
              updatedEventRawDurations.set(eventShapeId, currentRawDuration + baseTime)
              updatedEventRoundedDurations.set(eventShapeId, currentRoundedDuration + roundedTime)
              
              // PATTERN: Just log event processing, offset calculation happens after all events are processed
              if (useAttendeeBasedLogic) {
                const majorEventShape = getMajorEventShape(eventShapeEntities, majorAttendeeIds)
                const minorEventShape = getMinorEventShape(eventShapeEntities, minorAttendeeIds)
                const eventPerspective = majorEventShape?.id === eventShape.id ? 'major' : (minorEventShape?.id === eventShape.id ? 'minor' : 'other')
              }
            }
          }
          
          return {
            totalRawDuration: newRawDuration,
            totalRoundedDuration: newRoundedDuration,
            eventRawDurations: updatedEventRawDurations,
            eventRoundedDurations: updatedEventRoundedDurations
          }
        },
        blockAcc
      )
    },
    {
      totalRawDuration: 0,
      totalRoundedDuration: 0,
      eventRawDurations: eventRawDurationsByShapeId,
      eventRoundedDurations: eventRoundedDurationsByShapeId
    }
  )
  
  rawDuration = totalRawDuration
  roundedDuration = totalRoundedDuration
  // Update the Maps with accumulated values
  eventRawDurations.forEach((value, key) => eventRawDurationsByShapeId.set(key, value))
  eventRoundedDurations.forEach((value, key) => eventRoundedDurationsByShapeId.set(key, value))
  
  // LEARNING: Convert Map to EventFinal[] array with dual-track durations
  // WHY: Provides array of event shapes with both raw and rounded durations, matching PartFinal[] pattern
  // PATTERN: Map over eventRawDurations entries, create EventFinal for each with both accumulated durations
  // PATTERN: Iterate over eventRawDurations to only include event shapes that have durations accumulated
  const eventFinals: import('@/types/appointment').EventFinal[] = Array.from(eventRawDurations.entries())
    .map(([eventShapeId, rawDuration]) => {
      const eventShape = eventShapeById.get(eventShapeId)
      if (!eventShape) {
        return null
      }
      const roundedDuration = eventRoundedDurations.get(eventShapeId) || 0
      return {
        eventShape,
        rawDuration,
        roundedDuration
      }
    })
    .filter((ef): ef is import('@/types/appointment').EventFinal => ef !== null)
    .filter(ef => ef.rawDuration > 0) // Only include events with raw duration > 0
  
  // LEARNING: Calculate differentialOffset as the difference between major and minor event durations
  // PATTERN: Calculate offset from final event durations after all parts have been processed
  // DUAL-TRACK: Calculate both raw and rounded differential offsets
  let rawDifferentialOffset = 0
  let roundedDifferentialOffset = 0
  if (useAttendeeBasedLogic) {
    const majorEventShape = getMajorEventShape(eventShapeEntities, majorAttendeeIds)
    // PATTERN: Filter out major event shape before searching for minor event shape
    const eventShapesExcludingMajor = majorEventShape 
      ? eventShapeEntities.filter(es => es.id !== majorEventShape.id)
      : eventShapeEntities
    const minorEventShape = getMinorEventShape(eventShapesExcludingMajor, minorAttendeeIds)
    
    if (majorEventShape) {
      const majorRawDuration = eventRawDurations.get(majorEventShape.id) || 0
      const majorRoundedDuration = eventRoundedDurations.get(majorEventShape.id) || 0
      if (minorEventShape) {
        const minorRawDuration = eventRawDurations.get(minorEventShape.id) || 0
        const minorRoundedDuration = eventRoundedDurations.get(minorEventShape.id) || 0
        rawDifferentialOffset = majorRawDuration - minorRawDuration
        roundedDifferentialOffset = majorRoundedDuration - minorRoundedDuration
      } else {
        rawDifferentialOffset = majorRawDuration
        roundedDifferentialOffset = majorRoundedDuration
      }
    }
  }
  
  const result = { 
    rawDuration,
    roundedDuration,
    eventFinals,
    rawDifferentialOffset,
    roundedDifferentialOffset
  }
  let logMajorEventShape: EventShapeEntity | null = null
  let logMinorEventShape: EventShapeEntity | null = null
  if (useAttendeeBasedLogic) {
    logMajorEventShape = getMajorEventShape(eventShapeEntities, majorAttendeeIds)
    const eventShapesExcludingMajorForLog = logMajorEventShape 
      ? eventShapeEntities.filter(es => es.id !== logMajorEventShape!.id)
      : eventShapeEntities
    logMinorEventShape = getMinorEventShape(eventShapesExcludingMajorForLog, minorAttendeeIds)
  }
  return result
}

/**
 * Calculate total duration for a group of PartFinal instances
 * LEARNING: Sums baseTime from all parts in group
 * WHY: Provides total duration for flag-based groups
 * PATTERN: Reduce to sum baseTime values
 * 
 * @param parts - Array of PartFinal instances
 * @returns Total duration in minutes
 */
export function sumPartFinalsDuration(parts: PartFinal[]): number {
  return parts.reduce((sum, part) => sum + part.baseTime, 0)
}
