import type { DriveTimeFeeConfig } from '@shared/types/availabilityTypes'
import type { BookingBlockInstance, BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { PriceData } from '@/types/wizardStepData'
import { asEmptyArray } from '@/utils/safeDefaults'
import type { AppointmentFeeBreakdownDriveOptions, ConfirmationDriveContext } from '@/utils/booking/confirmationStepDataTypes'
import {
  CONFIRMATION_PLACEHOLDER_DELIVERY_CHARGES,
  CONFIRMATION_PLACEHOLDER_DELIVERY_FREE,
  DRIVE_TIME_LINE_ITEM_LABEL,
  driveTimeFeeFromContext,
  type WizardSelectionState,
} from './confirmationStepDataShared'
import { getEffectivePartsForFee } from './pricingCascadeResolver'
import { buildAppointmentFeeBreakdown } from './confirmationStepDataBreakdown'
import { normalizePercentageOffForFee } from '@/utils/booking/pricingPercentageOff'

function calculateTotalCouponDiscount(
  wizard: WizardSelectionState,
  squareFootage: number | null,
  aduCount?: number | null
): number {
  const sqft = squareFootage ?? 0
  const adu = aduCount ?? 1
  const allPartInstances: BookingPartInstance[] = [
    ...asEmptyArray(wizard.selectedServices).flatMap((s) => asEmptyArray(s.partInstances)),
    ...asEmptyArray(wizard.selectedPropertyTypeBlocks).flatMap((p) => asEmptyArray(p.partInstances)),
    ...asEmptyArray(wizard.selectedOptionTypeBlocks).flatMap((o) => asEmptyArray(o.partInstances)),
    ...asEmptyArray(wizard.selectedLineItemBlocks).flatMap((l) => asEmptyArray(l.partInstances)),
  ]
  const blocks: BookingBlockInstance[] = [
    ...asEmptyArray(wizard.selectedServices),
    ...asEmptyArray(wizard.selectedPropertyTypeBlocks),
    ...asEmptyArray(wizard.selectedOptionTypeBlocks),
    ...asEmptyArray(wizard.selectedLineItemBlocks),
  ]
  let totalDiscount = 0
  for (const block of blocks) {
    const rawParts: BookingPartInstance[] = block.partInstances != null ? block.partInstances : []
    const effectiveParts: BookingPartInstance[] =
      allPartInstances.length > 0 ? getEffectivePartsForFee(rawParts, allPartInstances) : rawParts
    const multiplier = block.allowMultiple ? adu : 1
    for (const p of effectiveParts) {
      const baseFee = p.baseFee ?? 0
      const feePerUnit = p.feePerUnit ?? 0
      const pct = normalizePercentageOffForFee(p.percentageOff)
      // Align with PartFinal: % off applies only to positive components; negative baseFee is a fixed discount.
      const discountFromPct =
        (baseFee > 0 ? (baseFee * pct) / 100 : 0) +
        (feePerUnit > 0 && sqft > 0 ? (feePerUnit * sqft * pct) / 100 : 0)
      const discountFromNegative = baseFee < 0 ? Math.abs(baseFee) : 0
      totalDiscount += (discountFromPct + discountFromNegative) * multiplier
    }
  }
  return totalDiscount
}

/**
 * Build confirmation {@link PriceData} for display and fee preview.
 */
export function buildConfirmationPriceData(
  wizard: WizardSelectionState,
  squareFootage: number | null,
  aduCount?: number | null,
  driveContext?: ConfirmationDriveContext | null,
  driveTimeFeeSettings?: DriveTimeFeeConfig | null,
  driveTimeSystemBlock?: { blockInstanceId: string; blockShapeRef: string } | null
): PriceData {
  const driveInBreakdown =
    driveContext != null && driveTimeSystemBlock != null && Number.isFinite(driveContext.totalDriveMinutes)
  const driveOpts: AppointmentFeeBreakdownDriveOptions | null = driveInBreakdown
    ? {
        driveContext,
        driveTimeFeeSettings,
        driveTimeSystemBlock,
      }
    : null

  const { summary, entries } = buildAppointmentFeeBreakdown(wizard, squareFootage, aduCount, driveOpts)

  const lineItemBlocks = asEmptyArray(wizard.selectedLineItemBlocks)
  const lineItemEntries = entries.filter((e) =>
    lineItemBlocks.some((b) => b.id === e.blockInstanceId)
  )
  const lineItemBlockFees = lineItemEntries.reduce(
    (acc, e) => ({
      baseFee: acc.baseFee + e.baseFee,
      overageFee: acc.overageFee + e.overageFee,
      totalFee: acc.totalFee + e.totalFee,
    }),
    { baseFee: 0, overageFee: 0, totalFee: 0 }
  )

  const blockLineItems = lineItemBlocks.map((block) => {
    const entry = entries.find((e) => e.blockInstanceId === block.id)
    const amount = entry?.totalFee ?? 0
    return { label: block.name, amount, isFree: amount === 0 }
  })

  const driveTimeFeeAmount =
    driveInBreakdown && driveTimeSystemBlock != null
      ? entries.find((e) => e.blockInstanceId === driveTimeSystemBlock.blockInstanceId)?.totalFee ?? 0
      : driveTimeFeeFromContext(driveContext, driveTimeFeeSettings)
  const driveLineItems =
    driveContext != null
      ? [{ label: DRIVE_TIME_LINE_ITEM_LABEL, amount: driveTimeFeeAmount, isFree: driveTimeFeeAmount === 0 }]
      : []
  const lineItems = [...blockLineItems, ...driveLineItems]

  const couponDiscount = calculateTotalCouponDiscount(wizard, squareFootage, aduCount)
  const blocksPlusDriveTotal = driveInBreakdown ? summary.totalFee : summary.totalFee + driveTimeFeeAmount
  const bagTotal = blocksPlusDriveTotal + couponDiscount
  const orderTotal = blocksPlusDriveTotal
  const deliveryCharges = CONFIRMATION_PLACEHOLDER_DELIVERY_CHARGES
  const deliveryFree = CONFIRMATION_PLACEHOLDER_DELIVERY_FREE
  const finalTotal = orderTotal + (deliveryFree ? 0 : deliveryCharges)

  return {
    totalFee: blocksPlusDriveTotal,
    currency: summary.currency,
    bagTotal,
    couponDiscount,
    orderTotal,
    deliveryCharges,
    deliveryFree,
    finalTotal,
    baseFeeTotal: summary.baseFeeTotal,
    overageFeeTotal: summary.overageFeeTotal,
    lineItemFees: {
      baseFee: lineItemBlockFees.baseFee,
      overageFee: lineItemBlockFees.overageFee,
      totalFee: lineItemBlockFees.totalFee
    },
    lineItems,
  }
}
