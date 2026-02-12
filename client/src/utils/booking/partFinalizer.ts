/**
 * Part Finalizer
 * 
 * LEARNING: Groups parts by part shape and creates PartFinal instances
 * WHY: Part shape is the semantic unit - all instances of same shape should be totaled
 * PATTERN: Pure functions for aggregation and flag-based grouping
 */

import type { BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { PartFinal } from './PartFinal'
import type { BlockFinal } from './bookingFinalTypes'
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
import { createLogger } from '@/utils/logger'
import { roundDuration } from '@/utils/booking/durationRounding'

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
function partShapeKey(part: BookingPartInstance): string {
  const raw = part.partShape
  if (raw === undefined || raw === null || raw === '') {
    logger.debug('groupPartsByShape: partShape missing', { partId: part.id })
    return ''
  }
  return raw
}

function groupPartsByShape(
  parts: BookingPartInstance[]
): Map<string, BookingPartInstance[]> {
  return parts.reduce((grouped, part) => {
    const partShape = partShapeKey(part)
    if (!grouped.has(partShape)) {
      grouped.set(partShape, [])
    }
    grouped.get(partShape)!.push(part)
    return grouped
  }, new Map<string, BookingPartInstance[]>())
}

/**
 * Create PartFinal instances from part instances
 * LEARNING: Groups parts by shape and creates PartFinal with raw baseTime only
 * WHY: Part shape is the semantic unit - all instances of same shape should be totaled
 * PATTERN: Group by shape, then create PartFinal (rounding happens at event level)
 * 
 * @param parts - Array of BookingPartInstance objects
 * @returns Array of PartFinal instances
 */
export function createPartFinals(
  parts: BookingPartInstance[]
): PartFinal[] {
  const partsByShape = groupPartsByShape(parts)
  
  return Array.from(partsByShape.entries()).map(([partShape, shapeParts]) =>
    createPartFinal(partShape, shapeParts)
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
  
  // PATTERN: Map<eventShapeId, rawDuration> for accumulation, then round ONCE per event after accumulation
  const eventRawDurationsByShapeId = new Map<string, number>()
  
  const eventShapeById = new Map(eventShapes.map(es => [es.id, es]))
  
  // PATTERN: Use availabilitySettings to get major/minor attendee IDs, fall back to name-based logic if not available
  let majorAttendeeIds: string[] = []
  let minorAttendeeIds: string[] = []
  let useAttendeeBasedLogic = false
  
  if (globalData && availabilitySettings?.differentialPerspectives) {
    const rawMajor = availabilitySettings.differentialPerspectives.majorAttendees
    const rawMinor = availabilitySettings.differentialPerspectives.minorAttendees
    if (rawMajor === undefined || rawMajor === null) {
      logger.debug('calculateSlotShape: majorAttendees missing, using []')
    }
    if (rawMinor === undefined || rawMinor === null) {
      logger.debug('calculateSlotShape: minorAttendees missing, using []')
    }
    majorAttendeeIds = rawMajor !== undefined && rawMajor !== null ? rawMajor : []
    minorAttendeeIds = rawMinor !== undefined && rawMinor !== null ? rawMinor : []
    useAttendeeBasedLogic = majorAttendeeIds.length > 0 || minorAttendeeIds.length > 0
  }
  
  const eventShapeEntities = eventShapes as EventShapeEntity[]
  
  // PATTERN: Use reduce to accumulate raw durations only
  // LEARNING: Iterate over BlockFinal[], then accumulate from each blockFinal.finalizedParts
  // WHY: Makes it explicit that we're accumulating finalized blocks, preserving block-level context
  // NOTE: Rounding happens AFTER accumulation, once per event total
  const { totalRawDuration, eventRawDurations } = blockFinals.reduce(
    (blockAcc, blockFinal) => {
      // PATTERN: Accumulate from all finalized parts within this block
      return blockFinal.finalizedParts.reduce(
        (partAcc, part) => {
          const baseTime = part.baseTime
          const newRawDuration = partAcc.totalRawDuration + baseTime
          
          const rawEvents = eventAssignmentsByPartShape[part.partShape]
          const events = rawEvents !== undefined && rawEvents !== null ? rawEvents : []
          
          // PATTERN: Process events and accumulate raw durations by event shape
          const updatedEventRawDurations = new Map(partAcc.eventRawDurations)
          
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
                // Accumulate raw duration only - rounding happens after accumulation
                const currentRawDuration = updatedEventRawDurations.get(eventShapeId) || 0
                updatedEventRawDurations.set(eventShapeId, currentRawDuration + baseTime)
                
                // PATTERN: Just log event processing, offset calculation happens after all events are processed
                if (useAttendeeBasedLogic) {
                  getMajorEventShape(eventShapeEntities, majorAttendeeIds)
                  getMinorEventShape(eventShapeEntities, minorAttendeeIds)
                }
              }
            } else {
              // Accumulate raw duration only - rounding happens after accumulation
              const currentRawDuration = updatedEventRawDurations.get(eventShapeId) || 0
              updatedEventRawDurations.set(eventShapeId, currentRawDuration + baseTime)
              
              // PATTERN: Just log event processing, offset calculation happens after all events are processed
              if (useAttendeeBasedLogic) {
                getMajorEventShape(eventShapeEntities, majorAttendeeIds)
                getMinorEventShape(eventShapeEntities, minorAttendeeIds)
              }
            }
          }
          
          return {
            totalRawDuration: newRawDuration,
            eventRawDurations: updatedEventRawDurations
          }
        },
        blockAcc
      )
    },
    {
      totalRawDuration: 0,
      eventRawDurations: eventRawDurationsByShapeId
    }
  )
  
  rawDuration = totalRawDuration
  // Update the Map with accumulated values
  eventRawDurations.forEach((value, key) => eventRawDurationsByShapeId.set(key, value))
  
  // LEARNING: Round ONCE per event after accumulation (prevents double rounding inflation)
  // WHY: Rounding at part level causes inflation - round(sum of parts) != sum(round(part))
  // PATTERN: Accumulate raw values, then round each event total once
  const eventRoundedDurationsByShapeId = new Map<string, number>()
  eventRawDurationsByShapeId.forEach((rawDuration, eventShapeId) => {
    const roundedDuration = roundDuration(rawDuration, availabilitySettings || null)
    eventRoundedDurationsByShapeId.set(eventShapeId, roundedDuration)
  })
  
  // LEARNING: Convert Map to EventFinal[] array with dual-track durations
  // WHY: Provides array of event shapes with both raw and rounded durations, matching PartFinal[] pattern
  // PATTERN: Map over eventRawDurations entries, create EventFinal for each with both raw and rounded durations
  // PATTERN: Iterate over eventRawDurations to only include event shapes that have durations accumulated
  const eventFinals: import('@/types/appointment').EventFinal[] = Array.from(eventRawDurationsByShapeId.entries())
    .map(([eventShapeId, rawDuration]) => {
      const eventShape = eventShapeById.get(eventShapeId)
      if (!eventShape) {
        return null
      }
      const roundedDuration = eventRoundedDurationsByShapeId.get(eventShapeId) || 0
      return {
        eventShape,
        rawDuration,
        roundedDuration
      }
    })
    .filter((ef): ef is import('@/types/appointment').EventFinal => ef !== null)
    .filter(ef => ef.rawDuration > 0) // Only include events with raw duration > 0
  
  // LEARNING: SlotShape.roundedDuration = max event roundedDuration (slot span from start to latest event end)
  // WHY: In differential services, events overlap - slot ends when the longest event ends
  // PATTERN: Use max instead of sum to get the actual slot span
  const roundedDuration = eventFinals.length > 0
    ? Math.max(...eventFinals.map(ef => ef.roundedDuration))
    : 0
  
  // LEARNING: Calculate differentialOffset as the difference between major and minor event durations
  // PATTERN: Calculate offset from final event durations after all parts have been processed and rounded
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
      const majorRawDuration = eventRawDurationsByShapeId.get(majorEventShape.id) || 0
      const majorRoundedDuration = eventRoundedDurationsByShapeId.get(majorEventShape.id) || 0
      if (minorEventShape) {
        const minorRawDuration = eventRawDurationsByShapeId.get(minorEventShape.id) || 0
        const minorRoundedDuration = eventRoundedDurationsByShapeId.get(minorEventShape.id) || 0
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
