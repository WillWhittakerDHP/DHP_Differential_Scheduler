/**
 * Resolve system Drive time block for fee breakdown persistence (Phase 6.11.5).
 */
import type { BookingData } from '@/types/transformers/bookingData'
import {
  SYSTEM_DRIVE_TIME_BLOCK_INSTANCE_ID,
  SYSTEM_DRIVE_TIME_BLOCK_INSTANCE_NAME,
  SYSTEM_DRIVE_TIME_BLOCK_SHAPE_REF,
} from '@/constants/systemDriveTimeBlock'

export interface SystemDriveTimeBlockRef {
  blockInstanceId: string
  blockShapeRef: string
}

/**
 * Prefer live booking data (after global fetch); fall back to seeded UUIDs when row not yet in cache.
 */
export function resolveSystemDriveTimeBlockForFees(
  bookingData: BookingData | null | undefined
): SystemDriveTimeBlockRef {
  const fromData = bookingData?.lineItemBlocks?.find((b) => b.name === SYSTEM_DRIVE_TIME_BLOCK_INSTANCE_NAME)
  if (fromData) {
    return { blockInstanceId: fromData.id, blockShapeRef: fromData.blockShapeRef }
  }
  return {
    blockInstanceId: SYSTEM_DRIVE_TIME_BLOCK_INSTANCE_ID,
    blockShapeRef: SYSTEM_DRIVE_TIME_BLOCK_SHAPE_REF,
  }
}
