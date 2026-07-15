import type { DriveTimeFeeConfig } from '@shared/types/availabilityTypes'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { computeDriveTimeFee, mergeDriveTimeFeeConfig } from '@/utils/booking/computeDriveTimeFee'
import type { ConfirmationDriveContext } from '@/utils/booking/confirmationStepDataTypes'

/** Placeholder values until delivery/business-settings integration; single source for confirmation pricing. */
export const CONFIRMATION_PLACEHOLDER_DELIVERY_CHARGES = 5.0
export const CONFIRMATION_PLACEHOLDER_DELIVERY_FREE = true

export type WizardSelectionState = {
  selectedServices: readonly BookingBlockInstance[]
  selectedPropertyTypeBlocks: readonly BookingBlockInstance[]
  selectedOptionTypeBlocks: readonly BookingBlockInstance[]
  selectedLineItemBlocks: readonly BookingBlockInstance[]
}

export type PropertyDetailsStepData = {
  address: string
  unit: string
  city: string
  state: string
  zipCode: string
  propertySize: number | null
  squareFootage: number | null
  hvacCount?: number | null
  waterHeaterCount?: number | null
  kitchenApplianceCount?: number | null
}

/** UI label for the virtual drive-time row (Phase 6.11). */
export const DRIVE_TIME_LINE_ITEM_LABEL = 'Drive time'

export function driveTimeFeeFromContext(
  driveContext: ConfirmationDriveContext | null | undefined,
  driveTimeFeeSettings: DriveTimeFeeConfig | null | undefined
): number {
  if (driveContext == null) {
    return 0
  }
  if (!Number.isFinite(driveContext.totalDriveMinutes)) {
    return 0
  }
  const minutes = Math.max(0, driveContext.totalDriveMinutes)
  const cfg = mergeDriveTimeFeeConfig(driveTimeFeeSettings)
  return computeDriveTimeFee(minutes, cfg).fee
}
