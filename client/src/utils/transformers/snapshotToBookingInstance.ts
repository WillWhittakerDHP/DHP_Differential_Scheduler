/**
 * Snapshot to Booking Instance Merger
 * 
 * LEARNING: Merges snapshot data with current block instance
 * WHY: Preserves pricing/names at booking time while allowing structure updates
 * PATTERN: Spread current instance, override with snapshot fields
 */

import type { BookingBlockInstance } from './globalToBookingTransformer'
import type { BlockInstanceSnapshot } from '@/types/appointment'

/**
 * Merge snapshot data with current block instance
 * LEARNING: Use snapshot for historical accuracy, fall back to current for missing data
 * WHY: Preserves pricing/names at booking time while allowing structure updates
 * PATTERN: Spread current instance, override with snapshot fields
 * 
 * @param currentInstance - Current block instance from booking data
 * @param snapshot - Snapshot from appointment (may be null/undefined)
 * @returns Merged block instance with snapshot values overriding current values
 */
export function mergeSnapshotWithCurrent(
  currentInstance: BookingBlockInstance,
  snapshot: BlockInstanceSnapshot | null | undefined
): BookingBlockInstance {
  if (!snapshot) return currentInstance
  
  return {
    ...currentInstance,
    // Override with snapshot values (historical data like name, price, etc.)
    name: snapshot.name,
    icon: snapshot.icon,
    baseSqFt: snapshot.baseSqFt,
    allowMultiple: snapshot.allowMultiple,
    // LEARNING: Don't override differential from snapshot - it's a configuration flag, not historical data
    // WHY: differential is a feature flag that should reflect current service configuration, not historical state
    // PATTERN: Preserve current instance's differential value instead of snapshot's
    // differential: snapshot.differential, // REMOVED - use current instance's value instead
    // Merge part instances - match by ID, use snapshot if found, otherwise keep current
    partInstances: currentInstance.partInstances.map(currentPart => {
      const snapshotPart = snapshot.partInstances.find(sp => sp.id === currentPart.id)
      if (!snapshotPart) return currentPart
      
      return {
        ...currentPart,
        name: snapshotPart.name,
        baseFee: snapshotPart.baseFee,
        baseTime: snapshotPart.baseTime,
        rateOverBaseFee: snapshotPart.rateOverBaseFee,
        rateOverBaseTime: snapshotPart.rateOverBaseTime
      }
    })
  }
}

