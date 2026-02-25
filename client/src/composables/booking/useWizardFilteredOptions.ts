import { computed } from 'vue'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import {
  filterByCascade,
  cascadeShapePipeline,
  getUserTypeBlocks
} from '@/utils/booking/cascadeFilterPipeline'
import type {
  UseWizardFilteredOptionsParams,
  UseWizardFilteredOptionsReturn,
} from '@/types/booking/wizardFilteredOptions'

export type {
  UseWizardFilteredOptionsParams,
  UseWizardFilteredOptionsReturn,
} from '@/types/booking/wizardFilteredOptions'

export function useWizardFilteredOptions(params: UseWizardFilteredOptionsParams): UseWizardFilteredOptionsReturn {
  const {
    bookingData,
    selectedUserType,
    selectedServiceTypeBlocks,
    selectedAvailabilityOptions,
    selectedPropertyTypeBlocks
  } = params

  const availableUserTypeBlocks = computed(() => getUserTypeBlocks(bookingData.value))

  const servicesResult = computed(() =>
    filterByCascade({
      bookingData: bookingData.value,
      parentInstances: selectedUserType.value,
      currentSelection: selectedServiceTypeBlocks.value,
      relationshipName: 'services'
    })
  )
  const availableServices = computed(() => servicesResult.value.instances)
  const servicesCascadeError = computed(() =>
    servicesResult.value.success ? null : servicesResult.value.error
  )

  const availabilityOptionsResult = computed(() =>
    cascadeShapePipeline({
      bookingData: bookingData.value,
      parentInstances: selectedServiceTypeBlocks.value,
      currentSelection: selectedAvailabilityOptions.value,
      relationshipName: 'availability options',
      shapeType: BLOCK_SHAPE_TYPES.OPTION,
      allowFallbackToAllOfShape: true,
      logShapeMismatch: true
    })
  )
  const availableAvailabilityOptions = computed(() => availabilityOptionsResult.value.instances)
  const availabilityOptionsCascadeError = computed(() => availabilityOptionsResult.value.error)

  const propertyTypesResult = computed(() =>
    cascadeShapePipeline({
      bookingData: bookingData.value,
      parentInstances: selectedServiceTypeBlocks.value,
      currentSelection: selectedPropertyTypeBlocks.value,
      relationshipName: 'property types',
      shapeType: BLOCK_SHAPE_TYPES.PROPERTY,
      allowFallbackToAllOfShape: false
    })
  )
  const availablePropertyTypeBlocks = computed(() => propertyTypesResult.value.instances)
  const propertyTypesCascadeError = computed(() => propertyTypesResult.value.error)

  const availableLineItemBlocks = computed(() => {
    const raw = bookingData.value?.lineItemBlocks
    return raw !== undefined && raw !== null && Array.isArray(raw) ? raw : []
  })

  const accServices = computed(() => selectedServiceTypeBlocks.value)
  const accProperty = computed(() => selectedPropertyTypeBlocks.value)
  const accAvailability = computed(() => selectedAvailabilityOptions.value)

  return {
    availableUserTypeBlocks,
    availableServices,
    availableOptionTypeBlocks: availableAvailabilityOptions,
    availablePropertyTypeBlocks,
    availableLineItemBlocks,
    servicesCascadeError,
    availabilityOptionsCascadeError,
    propertyTypesCascadeError,
    accServices,
    accProperty,
    accAvailability
  }
}
