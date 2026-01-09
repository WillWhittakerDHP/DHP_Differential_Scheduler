/**
 * Block Instance to Snapshot Transformer
 * 
 * LEARNING: Captures snapshot of block instance data at booking time
 * WHY: Preserves pricing/names for historical accuracy in appointments
 * PATTERN: Extract critical fields from BookingBlockInstance to snapshot format
 */

import type { BookingBlockInstance } from './globalToBookingTransformer'
import type { BlockInstanceSnapshot } from '@/types/appointment'

/**
 * Transform a BookingBlockInstance to a snapshot
 * LEARNING: Captures only critical fields needed for historical accuracy
 * WHY: Preserves pricing, names, and structure at booking time
 * PATTERN: Map BookingBlockInstance to BlockInstanceSnapshot format
 */
export function blockInstanceToSnapshot(
  blockInstance: BookingBlockInstance
): BlockInstanceSnapshot {
  return {
    id: blockInstance.id,
    name: blockInstance.name,
    icon: blockInstance.icon,
    baseSqFt: blockInstance.baseSqFt,
    allowMultiple: blockInstance.allowMultiple,
    differential: blockInstance.differential,
    partInstances: blockInstance.partInstances.map(pi => ({
      id: pi.id,
      name: pi.name,
      baseFee: pi.baseFee,
      baseTime: pi.baseTime,
      rateOverBaseFee: pi.rateOverBaseFee,
      rateOverBaseTime: pi.rateOverBaseTime
    }))
  }
}

