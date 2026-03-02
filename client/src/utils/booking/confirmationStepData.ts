import type { FeeEntryBase } from '@shared/types/appointmentFeeTypes'
import type { BookingBlockInstance, BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { PriceData, SummaryData } from '@/types/wizardStepData'
import type { AvailabilityStepData } from '@/types/booking/availabilityStepData'
import type {
  AppointmentFeeSummaryCreate,
  AppointmentFeeEntryCreate,
  AppointmentFeeBreakdownPayload,
} from '@shared/types/appointmentFeeTypes'
import { APPOINTMENTS_TABLE_UI } from '@/constants/appointmentsTableConstants'
import { calculatePartsTotals } from './partsTotals'
import {
  filterZeroedParts
} from './partFinalizer'
import { createBlockFinal } from './BlockFinal'
import { getEffectivePartsForFee } from './pricingCascadeResolver'
import { asEmptyArray } from '@/utils/safeDefaults'

/** Placeholder values until coupon and business-settings integration; single source for confirmation pricing. */
const CONFIRMATION_PLACEHOLDER_COUPON_DISCOUNT = 0
const CONFIRMATION_PLACEHOLDER_DELIVERY_CHARGES = 5.0
const CONFIRMATION_PLACEHOLDER_DELIVERY_FREE = true

type WizardSelectionState = {
  selectedServices: readonly BookingBlockInstance[] // Note: This is the parameter name, receives selectedServiceTypeBlocks
  selectedPropertyTypeBlocks: readonly BookingBlockInstance[]
  selectedOptionTypeBlocks: readonly BookingBlockInstance[]
  selectedLineItemBlocks: readonly BookingBlockInstance[]
}

type PropertyDetailsStepData = {
  address: string
  unit: string
  city: string
  state: string
  zipCode: string
  propertySize: number | null
  squareFootage: number | null
}

function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Invalid date'
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatTimeRange(startIso: string, endIso: string): string {
  const start = new Date(startIso)
  const end = new Date(endIso)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'Invalid time range'
  const to12h = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  return `${to12h(start)} - ${to12h(end)}`
}

/** Extends shared FeeEntryBase for single source of truth. */
type BlockInstanceFeeResult = FeeEntryBase

function calculateBlockInstanceFee(
  blockInstance: BookingBlockInstance,
  squareFootage: number | null,
  aduCount?: number | null,
  allPartInstances?: BookingPartInstance[] | null
): BlockInstanceFeeResult {
  const rawParts = blockInstance.partInstances ?? []
  const effectiveParts: BookingPartInstance[] =
    allPartInstances != null && allPartInstances.length > 0
      ? getEffectivePartsForFee(rawParts, allPartInstances)
      : rawParts
  const blockForFinal =
    effectiveParts === rawParts
      ? blockInstance
      : { ...blockInstance, partInstances: effectiveParts }
  // PATTERN: Create BlockFinal for consistency with new architecture
  const blockFinal = createBlockFinal(blockForFinal)
  const nonZeroedFinalizedParts = filterZeroedParts(blockFinal.finalizedParts)
  
  // PATTERN: Flat map sourcePartInstances from non-zeroed finalized parts
  const nonZeroedParts = nonZeroedFinalizedParts.flatMap(fp => fp.sourcePartInstances)
  
  // PATTERN: Use calculatePartsTotals utility for base calculations
  const partsTotals = calculatePartsTotals(nonZeroedParts)
  
  // PATTERN: Use totalBaseFee from shared utility
  const baseFee = partsTotals.totalBaseFee
  
  // PATTERN: Multiply totalRateOverBaseFee by squareFootage
  const sqft = squareFootage ?? 0
  const overageFee = partsTotals.totalRateOverBaseFee * sqft
  
  const totalFeeBeforeMultiplier = baseFee + overageFee
  
  if (blockInstance.allowMultiple) {
    const multiplier = aduCount ?? 1
    return {
      baseFee: baseFee * multiplier,
      overageFee: overageFee * multiplier,
      totalFee: totalFeeBeforeMultiplier * multiplier
    }
  }
  
  return {
    baseFee,
    overageFee,
    totalFee: totalFeeBeforeMultiplier
  }
}

export function buildConfirmationSummaryData(
  wizard: WizardSelectionState,
  propertyDetailsStepData?: PropertyDetailsStepData | null,
  availabilityStepData?: AvailabilityStepData | null
): SummaryData {
  const serviceNames = wizard.selectedServices.map((s) => s.name)
  const serviceType =
    serviceNames.length > 0 ? (serviceNames.length === 1 ? serviceNames[0] : `${serviceNames.length} Services`) : 'No service selected'

  const propertyNames = wizard.selectedPropertyTypeBlocks.map((d) => d.name)
  const propertyType =
    propertyNames.length > 0 ? (propertyNames.length === 1 ? propertyNames[0] : propertyNames.join(', ')) : 'No property type selected'

  // PATTERN: Build address parts array immutably using filter + map
  const addressParts = propertyDetailsStepData
    ? [
        propertyDetailsStepData.address,
        propertyDetailsStepData.unit ? `#${propertyDetailsStepData.unit}` : null,
        propertyDetailsStepData.city,
        propertyDetailsStepData.state,
        propertyDetailsStepData.zipCode
      ].filter((part): part is string => typeof part === 'string' && part !== '')
    : []
  const address = addressParts.length > 0 ? addressParts.join(', ') : 'No address provided'

  const squareFootage = propertyDetailsStepData?.squareFootage
    ? `${propertyDetailsStepData.squareFootage}sqft`
    : propertyDetailsStepData?.propertySize
      ? `${propertyDetailsStepData.propertySize}sqft`
      : APPOINTMENTS_TABLE_UI.NOT_SPECIFIED

  const appointmentDate = availabilityStepData?.candidateDate?.start
    ? new Date(availabilityStepData.candidateDate.start).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : undefined

  const appointmentTimes = availabilityStepData?.candidateTimeSlots?.length
    ? availabilityStepData.candidateTimeSlots
        .map((slot) => formatTimeRange(slot.startTime, slot.endTime))
        .join(' | ')
    : undefined

  const selectedMoveableIndex = availabilityStepData?.moveableScheduling?.selectedSlotIndex
  const moveableSlots = availabilityStepData?.moveableScheduling?.availableSlots ?? []
  const moveableSlot =
    typeof selectedMoveableIndex === 'number' && selectedMoveableIndex >= 0
      ? moveableSlots[selectedMoveableIndex] ?? null
      : null
  const moveableCompletion = moveableSlot
    ? formatDateTime(moveableSlot.startTime)
    : undefined

  const moveablePartShapeName = availabilityStepData?.moveableScheduling?.partShapeName

  const moveableDeadline = availabilityStepData?.moveableScheduling?.outerBoundary
    ? formatDateTime(availabilityStepData.moveableScheduling.outerBoundary)
    : undefined

  return {
    serviceType,
    propertyType,
    address,
    squareFootage,
    appointmentDate,
    appointmentTimes,
    moveablePartShapeName,
    moveableCompletion,
    moveableDeadline,
  }
}

/**
 * Build fee breakdown payload for appointment submission (summary + per-block entries).
 *
 * @param wizard - Wizard selection state with selected block instances
 * @param squareFootage - Property square footage for overage fee calculation
 * @param aduCount - Optional ADU count multiplier for allowMultiple blocks
 * @returns Payload with summary and entries for server to persist
 */
export function buildAppointmentFeeBreakdown(
  wizard: WizardSelectionState,
  squareFootage: number | null,
  aduCount?: number | null
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

  const entries: AppointmentFeeEntryCreate[] = blocksWithFees.map(({ block, fee }) => ({
    blockInstanceId: block.id,
    blockName: block.name,
    blockShapeRef: block.blockShapeRef,
    baseFee: fee.baseFee,
    overageFee: fee.overageFee,
    totalFee: fee.totalFee,
    quantity: block.allowMultiple ? adu : 1,
  }))

  const baseFeeTotal = blocksWithFees.reduce((sum, { fee }) => sum + fee.baseFee, 0)
  const overageFeeTotal = blocksWithFees.reduce((sum, { fee }) => sum + fee.overageFee, 0)
  const totalFee = baseFeeTotal + overageFeeTotal

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

export function buildConfirmationPriceData(
  wizard: WizardSelectionState,
  squareFootage: number | null,
  aduCount?: number | null
): PriceData {
  // PATTERN: Use squareFootage parameter (extracted from propertyDetailsStepData by caller)
  const { summary, entries } = buildAppointmentFeeBreakdown(wizard, squareFootage, aduCount)

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

  const lineItems = lineItemBlocks.map((block) => {
    const entry = entries.find((e) => e.blockInstanceId === block.id)
    const amount = entry?.totalFee ?? 0
    return { label: block.name, amount, isFree: amount === 0 }
  })

  const bagTotal = summary.totalFee
  const couponDiscount = CONFIRMATION_PLACEHOLDER_COUPON_DISCOUNT
  const orderTotal = bagTotal - couponDiscount
  const deliveryCharges = CONFIRMATION_PLACEHOLDER_DELIVERY_CHARGES
  const deliveryFree = CONFIRMATION_PLACEHOLDER_DELIVERY_FREE
  const finalTotal = orderTotal + (deliveryFree ? 0 : deliveryCharges)

  return {
    totalFee: summary.totalFee,
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
