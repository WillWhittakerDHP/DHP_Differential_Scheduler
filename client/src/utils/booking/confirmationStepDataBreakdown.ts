import type {
  AppointmentFeeSummaryCreate,
  AppointmentFeeEntryCreate,
  AppointmentFeeBreakdownPayload,
} from '@shared/types/appointmentFeeTypes'
import type { BookingBlockInstance, BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'
import { asEmptyArray } from '@/utils/safeDefaults'
import type { AppointmentFeeBreakdownDriveOptions } from '@/utils/booking/confirmationStepDataTypes'
import type { WizardSelectionState } from './confirmationStepDataShared'
import { DRIVE_TIME_LINE_ITEM_LABEL, driveTimeFeeFromContext } from './confirmationStepDataShared'
import { calculateBlockInstanceFee, type BlockInstanceFeeResult } from './confirmationStepDataFee'

/**
 * Build fee breakdown payload for appointment submission (summary + per-block entries).
 */
export function buildAppointmentFeeBreakdown(
  wizard: WizardSelectionState,
  squareFootage: number | null,
  aduCount?: number | null,
  driveOptions?: AppointmentFeeBreakdownDriveOptions | null
): AppointmentFeeBreakdownPayload {
  const sqft = squareFootage ?? 0
  const adu = aduCount ?? 1

  const allPartInstances: BookingPartInstance[] = [
    ...asEmptyArray(wizard.selectedServices).flatMap((s) => asEmptyArray(s.partInstances)),
    ...asEmptyArray(wizard.selectedPropertyTypeBlocks).flatMap((p) => asEmptyArray(p.partInstances)),
    ...asEmptyArray(wizard.selectedOptionTypeBlocks).flatMap((o) => asEmptyArray(o.partInstances)),
    ...asEmptyArray(wizard.selectedLineItemBlocks).flatMap((l) => asEmptyArray(l.partInstances)),
  ]

  const blocksWithFees: Array<{ block: BookingBlockInstance; fee: BlockInstanceFeeResult }> = [
    ...wizard.selectedServices.map((block) => ({
      block,
      fee: calculateBlockInstanceFee(block, sqft, aduCount, allPartInstances),
    })),
    ...wizard.selectedPropertyTypeBlocks.map((block) => ({
      block,
      fee: calculateBlockInstanceFee(block, sqft, aduCount, allPartInstances),
    })),
    ...wizard.selectedOptionTypeBlocks.map((block) => ({
      block,
      fee: calculateBlockInstanceFee(block, sqft, aduCount, allPartInstances),
    })),
    ...asEmptyArray(wizard.selectedLineItemBlocks).map((block) => ({
      block,
      fee: calculateBlockInstanceFee(block, sqft, aduCount, allPartInstances),
    })),
  ]

  let entries: AppointmentFeeEntryCreate[] = blocksWithFees.map(({ block, fee }) => ({
    blockInstanceId: block.id,
    blockName: block.name,
    blockShapeRef: block.blockShapeRef,
    baseFee: fee.baseFee,
    overageFee: fee.overageFee,
    totalFee: fee.totalFee,
    quantity: block.allowMultiple ? adu : 1,
  }))

  let baseFeeTotal = blocksWithFees.reduce((sum, { fee }) => sum + fee.baseFee, 0)
  const overageFeeTotal = blocksWithFees.reduce((sum, { fee }) => sum + fee.overageFee, 0)
  let totalFee = baseFeeTotal + overageFeeTotal

  const dc = driveOptions?.driveContext
  const sys = driveOptions?.driveTimeSystemBlock
  if (dc != null && sys != null && Number.isFinite(dc.totalDriveMinutes)) {
    const driveFee = driveTimeFeeFromContext(dc, driveOptions?.driveTimeFeeSettings)
    entries = [
      ...entries,
      {
        blockInstanceId: sys.blockInstanceId,
        blockName: DRIVE_TIME_LINE_ITEM_LABEL,
        blockShapeRef: sys.blockShapeRef,
        baseFee: driveFee,
        overageFee: 0,
        totalFee: driveFee,
        quantity: 1,
      },
    ]
    baseFeeTotal += driveFee
    totalFee += driveFee
  }

  const summary: AppointmentFeeSummaryCreate = {
    baseFeeTotal,
    overageFeeTotal,
    totalFee,
    squareFootage: sqft,
    aduCount: adu,
    currency: 'USD',
    calculatedAt: new Date().toISOString(),
  }

  return { summary, entries }
}
