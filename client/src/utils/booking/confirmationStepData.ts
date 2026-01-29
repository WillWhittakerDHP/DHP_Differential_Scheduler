import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { PriceData, SummaryData } from '@/composables/booking/useConfirmationStepData'
import { calculatePartsTotals } from './partsTotals'
import {
  createFinalizedParts,
  filterZeroedParts
} from './partShapeAggregator'

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

/**
 * Block instance fee calculation result
 * LEARNING: Represents base fee, overage fee, and total fee for a block instance
 * WHY: Separates base fees from square footage-based overage fees
 * PATTERN: Object with baseFee, overageFee, and totalFee properties
 */
export interface BlockInstanceFeeResult {
  baseFee: number
  overageFee: number
  totalFee: number
}

/**
 * Calculate base fee and overage fee from all partInstances in a blockInstance.
 * LEARNING: Uses snapshot data from appointment if available for historical accuracy
 * WHY: Calculates fees based on pricing at booking time, not current pricing
 * PATTERN: Snapshots are merged into BookingBlockInstance before calculation
 * 
 * Fee calculation:
 * - Base fee: sum of all baseFee values from all parts in the block
 * - Overage fee: sum of (rateOverBaseFee * squareFootage) for each part in the block
 * - Total fee: base fee + overage fee
 * 
 * Multiplier precedence (for allowMultiple services):
 * 1. Appointment quantities (from appointment.serviceQuantities/propertyQuantities)
 * 2. aduCount (from propertyDetails.additionalUnits)
 * 3. 1 (no multiplier)
 * 
 * @param blockInstance - Block instance with part instances
 * @param squareFootage - Property square footage for overage fee calculation
 * @param aduCount - Optional ADU count multiplier for allowMultiple blocks
 * @returns Object with baseFee, overageFee, and totalFee
 */
export function calculateBlockInstanceFee(
  blockInstance: BookingBlockInstance,
  squareFootage: number | null,
  aduCount?: number | null
): BlockInstanceFeeResult {
  // LEARNING: Create finalized parts and filter out zeroed parts
  // WHY: Zeroed parts should not contribute to fees
  // PATTERN: Group by part shape, create finalized parts, filter zeroed
  const finalizedParts = createFinalizedParts(blockInstance.partInstances || [])
  const nonZeroedFinalizedParts = filterZeroedParts(finalizedParts)
  
  // LEARNING: Extract non-zeroed part instances from finalized parts
  // WHY: Need original part instances for fee calculation
  // PATTERN: Flat map sourcePartInstances from non-zeroed finalized parts
  const nonZeroedParts = nonZeroedFinalizedParts.flatMap(fp => fp.sourcePartInstances)
  
  // LEARNING: Use shared utility to calculate parts totals
  // WHY: Ensures consistency with admin code and provides single source of truth
  // PATTERN: Use calculatePartsTotals utility for base calculations
  const partsTotals = calculatePartsTotals(nonZeroedParts)
  
  // LEARNING: Calculate base fee from parts totals
  // WHY: Base fees are fixed fees regardless of property size
  // PATTERN: Use totalBaseFee from shared utility
  const baseFee = partsTotals.totalBaseFee
  
  // LEARNING: Calculate overage fee: sum of (rateOverBaseFee * squareFootage) for each part
  // WHY: Overage fees scale with property square footage
  // PATTERN: Multiply totalRateOverBaseFee by squareFootage
  // NOTE: If squareFootage is null or 0, overage fee is 0
  const sqft = squareFootage ?? 0
  const overageFee = partsTotals.totalRateOverBaseFee * sqft
  
  // LEARNING: Calculate total fee before multiplier
  // WHY: Need base total to apply multiplier correctly
  const totalFeeBeforeMultiplier = baseFee + overageFee
  
  // LEARNING: Multiply by quantity if allowMultiple is true
  // WHY: Some services need to be multiplied by quantity (e.g., ADU count)
  // NOTE: Quantities are stored in appointment.serviceQuantities/propertyQuantities, not on blockInstance
  //       This function receives quantities via wizard state which includes appointment quantities
  if (blockInstance.allowMultiple) {
    // TODO: Update to use appointment quantities from wizard state when available
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
  propertyDetailsStepData?: PropertyDetailsStepData | null
): SummaryData {
  const serviceNames = wizard.selectedServices.map((s) => s.name)
  const serviceType =
    serviceNames.length > 0 ? (serviceNames.length === 1 ? serviceNames[0] : `${serviceNames.length} Services`) : 'No service selected'

  const propertyNames = wizard.selectedPropertyTypeBlocks.map((d) => d.name)
  const propertyType =
    propertyNames.length > 0 ? (propertyNames.length === 1 ? propertyNames[0] : propertyNames.join(', ')) : 'No property type selected'

  const addressParts: string[] = []
  if (propertyDetailsStepData) {
    const prop = propertyDetailsStepData
    if (prop.address) addressParts.push(prop.address)
    if (prop.unit) addressParts.push(`#${prop.unit}`)
    if (prop.city) addressParts.push(prop.city)
    if (prop.state) addressParts.push(prop.state)
    if (prop.zipCode) addressParts.push(prop.zipCode)
  }
  const address = addressParts.length > 0 ? addressParts.join(', ') : 'No address provided'

  const squareFootage = propertyDetailsStepData?.squareFootage
    ? `${propertyDetailsStepData.squareFootage}sqft`
    : propertyDetailsStepData?.propertySize
      ? `${propertyDetailsStepData.propertySize}sqft`
      : 'Not specified'

  return {
    serviceType,
    propertyType,
    address,
    squareFootage,
  }
}

/**
 * Build confirmation price data from wizard selections
 * LEARNING: Calculates fees from all selected block instances (services, property types, options)
 * WHY: Aggregates pricing information for display in confirmation step
 * PATTERN: Sum base fees and overage fees separately across all block types
 * 
 * @param wizard - Wizard selection state with selected block instances
 * @param squareFootage - Property square footage for overage fee calculation
 * @param aduCount - Optional ADU count multiplier for allowMultiple blocks
 * @returns Price data with total fees and breakdown
 */
export function buildConfirmationPriceData(
  wizard: WizardSelectionState,
  squareFootage: number | null,
  aduCount?: number | null
): PriceData {
  // LEARNING: Extract square footage from propertyDetailsStepData
  // WHY: Overage fees depend on property square footage
  // PATTERN: Use squareFootage parameter (extracted from propertyDetailsStepData by caller)
  const sqft = squareFootage ?? 0
  
  // LEARNING: Calculate fees for services
  // WHY: Base services contribute to total fee
  // PATTERN: Reduce to sum fees from all selected services
  const serviceFees = wizard.selectedServices.reduce(
    (acc, service) => {
      const feeResult = calculateBlockInstanceFee(service, sqft, aduCount)
      return {
        baseFee: acc.baseFee + feeResult.baseFee,
        overageFee: acc.overageFee + feeResult.overageFee,
        totalFee: acc.totalFee + feeResult.totalFee
      }
    },
    { baseFee: 0, overageFee: 0, totalFee: 0 }
  )

  // LEARNING: Calculate fees for property type blocks
  // WHY: Property type adjustments contribute to total fee
  // PATTERN: Reduce to sum fees from all selected property type blocks
  const propertyTypeBlockFees = wizard.selectedPropertyTypeBlocks.reduce(
    (acc, adjustment) => {
      const feeResult = calculateBlockInstanceFee(adjustment, sqft, aduCount)
      return {
        baseFee: acc.baseFee + feeResult.baseFee,
        overageFee: acc.overageFee + feeResult.overageFee,
        totalFee: acc.totalFee + feeResult.totalFee
      }
    },
    { baseFee: 0, overageFee: 0, totalFee: 0 }
  )

  // LEARNING: Calculate fees for option type blocks
  // WHY: Availability options contribute to total fee
  // PATTERN: Reduce to sum fees from all selected option type blocks
  const optionTypeBlockFees = wizard.selectedOptionTypeBlocks.reduce(
    (acc, option) => {
      const feeResult = calculateBlockInstanceFee(option, sqft, aduCount)
      return {
        baseFee: acc.baseFee + feeResult.baseFee,
        overageFee: acc.overageFee + feeResult.overageFee,
        totalFee: acc.totalFee + feeResult.totalFee
      }
    },
    { baseFee: 0, overageFee: 0, totalFee: 0 }
  )

  // LEARNING: Calculate fees for line item blocks
  // WHY: Line items are separate from main booking blocks and displayed individually
  // PATTERN: Reduce to sum fees from all selected line item blocks
  const lineItemBlockFees = wizard.selectedLineItemBlocks.reduce(
    (acc, lineItem) => {
      const feeResult = calculateBlockInstanceFee(lineItem, sqft, aduCount)
      return {
        baseFee: acc.baseFee + feeResult.baseFee,
        overageFee: acc.overageFee + feeResult.overageFee,
        totalFee: acc.totalFee + feeResult.totalFee
      }
    },
    { baseFee: 0, overageFee: 0, totalFee: 0 }
  )

  // LEARNING: Calculate individual line items for display
  // WHY: Each line item block should be displayed separately in confirmation step
  // PATTERN: Map each selected line item block to display object with label, amount, and isFree flag
  const lineItems = wizard.selectedLineItemBlocks.map(lineItem => {
    const feeResult = calculateBlockInstanceFee(lineItem, sqft, aduCount)
    return {
      label: lineItem.name,
      amount: feeResult.totalFee,
      isFree: feeResult.totalFee === 0
    }
  })

  // LEARNING: Sum all base fees and overage fees separately
  // WHY: Need to track base vs overage fees for potential display breakdown
  // PATTERN: Sum base fees and overage fees across all block types (including line items)
  const baseFeeTotal = serviceFees.baseFee + propertyTypeBlockFees.baseFee + optionTypeBlockFees.baseFee + lineItemBlockFees.baseFee
  const overageFeeTotal = serviceFees.overageFee + propertyTypeBlockFees.overageFee + optionTypeBlockFees.overageFee + lineItemBlockFees.overageFee
  const totalFee = baseFeeTotal + overageFeeTotal

  // LEARNING: Calculate order totals
  // WHY: Need bag total, order total, and final total for display
  // PATTERN: Apply discounts and delivery charges to calculate final total
  const bagTotal = totalFee
  const couponDiscount = 0 // TODO: Remove hardcoded value when coupon system is implemented
  const orderTotal = bagTotal - couponDiscount
  const deliveryCharges = 5.0 // TODO: Remove hardcoded value when business settings integration is implemented
  const deliveryFree = true // TODO: Remove hardcoded value when business settings integration is implemented
  const finalTotal = orderTotal + (deliveryFree ? 0 : deliveryCharges)

  return {
    totalFee,
    currency: 'USD',
    bagTotal,
    couponDiscount,
    orderTotal,
    deliveryCharges,
    deliveryFree,
    finalTotal,
    baseFeeTotal,
    overageFeeTotal,
    lineItemFees: {
      baseFee: lineItemBlockFees.baseFee,
      overageFee: lineItemBlockFees.overageFee,
      totalFee: lineItemBlockFees.totalFee
    },
    lineItems,
  }
}


