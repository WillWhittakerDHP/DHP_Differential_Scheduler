import type { Ref } from 'vue'
import type { PropertyDetailsStepData } from '@/types/wizard'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

export function formatFieldErrorsMessage(fieldErrors: Record<string, string>): string {
  const errors = Object.entries(fieldErrors)
  const errorMessages = errors.map(([field, error]) => `${field}: ${error}`).join(', ')
  return `Please fix the following: ${errorMessages}`
}

export function collectMissingPropertyDetailsFields(
  data: PropertyDetailsStepData | null | undefined,
  selectedBlocks: BookingBlockInstance[]
): string[] {
  const missingFields: string[] = []
  const hasPropertyTypeBlock = selectedBlocks.length > 0
  if (!hasPropertyTypeBlock) {
    missingFields.push('property type')
  }
  if (!data) {
    missingFields.push('address', 'city', 'state', 'zip code', 'property size')
    return missingFields
  }
  if (!data.address || data.address.trim().length < 3) missingFields.push('address')
  if (!data.city || data.city.trim().length < 2) missingFields.push('city')
  if (!data.state) missingFields.push('state')
  if (!data.zipCode || !/^\d{5}(-\d{4})?$/.test(data.zipCode)) missingFields.push('zip code')
  if (!data.propertySize || data.propertySize < 1) missingFields.push('property size')

  const isMultiFamily = selectedBlocks.some(
    (block) =>
      block.name?.toLowerCase().includes('multi') || block.name?.toLowerCase().includes('duplex')
  )
  if (isMultiFamily && (!data.numberOfUnits || data.numberOfUnits < 1)) {
    missingFields.push('number of units')
  }
  return missingFields
}

export function resolveWizardStep1ErrorMessage(params: {
  propertyDetailsFieldErrors: Ref<Record<string, string>>
  propertyDetailsStepData: Ref<PropertyDetailsStepData | null>
  selectedPropertyTypeBlocks: Ref<BookingBlockInstance[]>
}): string {
  const fieldErr = params.propertyDetailsFieldErrors.value
  if (fieldErr && Object.keys(fieldErr).length > 0) {
    return formatFieldErrorsMessage(fieldErr)
  }

  const hasPropertyTypeBlock = params.selectedPropertyTypeBlocks.value.length > 0
  if (!hasPropertyTypeBlock) {
    return 'Please select at least one property type'
  }

  const missing = collectMissingPropertyDetailsFields(
    params.propertyDetailsStepData.value ?? undefined,
    params.selectedPropertyTypeBlocks.value
  )

  return missing.length > 0 ? `Please complete: ${missing.join(', ')}` : 'Please complete all required fields'
}
