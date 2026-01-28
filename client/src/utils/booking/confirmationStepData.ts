import type { BookingBlockInstance, BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { PriceData, SummaryData } from '@/composables/booking/useConfirmationStepData'
import { getPartInstanceCategory } from './partShapeTimeSlotMapping'

type WizardSelectionState = {
  selectedServices: readonly BookingBlockInstance[]
  selectedPropertyTypeBlocks: readonly BookingBlockInstance[]
  selectedOptionTypeBlocks: readonly BookingBlockInstance[]
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
 * Sum baseFee from all partInstances in a blockInstance.
 * LEARNING: Uses snapshot data from appointment if available for historical accuracy
 * WHY: Calculates fees based on pricing at booking time, not current pricing
 * PATTERN: Snapshots are merged into BookingBlockInstance before calculation
 * 
 * Multiplier precedence (for allowMultiple services):
 * 1. Appointment quantities (from appointment.serviceQuantities/propertyQuantities)
 * 2. aduCount (from propertyDetails.additionalUnits)
 * 3. 1 (no multiplier)
 */
/**
 * Check if a category should be zeroed out
 * LEARNING: If any part instance in a category has zeroOutPart: true, the entire category is zeroed
 * WHY: Allows parts like "no Client Presentation" to zero out the entire category
 * PATTERN: Check if any part in category has zeroOutPart flag set
 */
function shouldZeroOutCategory(categoryParts: BookingPartInstance[]): boolean {
  return categoryParts.some(part => part.zeroOutPart === true)
}

export function calculateBlockInstanceFee(
  blockInstance: BookingBlockInstance,
  aduCount?: number | null
): number {
  // LEARNING: Group parts by category to check for zeroed categories
  // WHY: Need to identify which categories should be zeroed out
  // PATTERN: Group parts by category, then filter out zeroed categories
  const partsByCategory = new Map<string, BookingPartInstance[]>()
  
  blockInstance.partInstances.forEach(part => {
    const category = getPartInstanceCategory(part)
    if (category) {
      if (!partsByCategory.has(category)) {
        partsByCategory.set(category, [])
      }
      partsByCategory.get(category)!.push(part)
    }
  })
  
  // LEARNING: Identify zeroed categories
  // WHY: Need to exclude parts from zeroed categories from fee calculation
  const zeroedCategories = new Set<string>()
  partsByCategory.forEach((categoryParts, category) => {
    if (shouldZeroOutCategory(categoryParts)) {
      zeroedCategories.add(category)
    }
  })
  
  // LEARNING: Filter out parts from zeroed categories before calculating fees
  // WHY: Zeroed categories should not contribute to fees
  // PATTERN: Filter partInstances to exclude parts in zeroed categories
  const nonZeroedParts = blockInstance.partInstances.filter(part => {
    const category = getPartInstanceCategory(part)
    return !category || !zeroedCategories.has(category)
  })
  
  // LEARNING: Uses snapshot partInstance.baseFee if available (from appointment snapshots)
  // WHY: Preserves historical pricing even if admin updates fees later
  // NOTE: Only includes fees from non-zeroed parts
  const baseFee = nonZeroedParts.reduce((sum, partInstance) => sum + (partInstance.baseFee || 0), 0)
  
  // LEARNING: Multiply by quantity if allowMultiple is true
  // WHY: Some services need to be multiplied by quantity (e.g., ADU count)
  // NOTE: Quantities are stored in appointment.serviceQuantities/propertyQuantities, not on blockInstance
  //       This function receives quantities via wizard state which includes appointment quantities
  if (blockInstance.allowMultiple) {
    // TODO: Update to use appointment quantities from wizard state when available
    const multiplier = aduCount ?? 1
    return baseFee * multiplier
  }
  
  return baseFee
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

export function buildConfirmationPriceData(
  wizard: WizardSelectionState,
  aduCount?: number | null
): PriceData {
  const baseFee = wizard.selectedServices.reduce(
    (sum, service) => sum + calculateBlockInstanceFee(service, aduCount), 
    0
  )

  const propertyTypeBlockFees = wizard.selectedPropertyTypeBlocks.reduce(
    (sum, adjustment) => sum + calculateBlockInstanceFee(adjustment, aduCount),
    0
  )

  const optionTypeBlockFees = wizard.selectedOptionTypeBlocks.reduce(
    (sum, option) => sum + calculateBlockInstanceFee(option, aduCount),
    0
  )

  const adjustments = propertyTypeBlockFees + optionTypeBlockFees
  const totalFee = baseFee + adjustments

  const bagTotal = totalFee
  const couponDiscount = 0
  const orderTotal = bagTotal - couponDiscount
  const deliveryCharges = 5.0
  const deliveryFree = true
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
  }
}


