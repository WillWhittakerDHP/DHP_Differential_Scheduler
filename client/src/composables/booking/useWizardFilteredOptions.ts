import { computed } from 'vue'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import { SYSTEM_DRIVE_TIME_BLOCK_INSTANCE_NAME } from '@/constants/systemDriveTimeBlock'
import { cascadeShapePipeline, getUserTypeBlocks } from '@/utils/booking/cascadeFilterPipeline'
import type {
  UseWizardFilteredOptionsParams,
  UseWizardFilteredOptionsReturn,
} from '@/types/booking/wizardFilteredOptions'

export function useWizardFilteredOptions(params: UseWizardFilteredOptionsParams): UseWizardFilteredOptionsReturn {
  const {
    bookingData,
    selectedUserType,
    selectedServiceTypeBlocks,
    selectedAvailabilityOptions,
    selectedPropertyTypeBlocks,
    selectedPriceBlocks
  } = params

  const availableUserTypeBlocks = computed(() => getUserTypeBlocks(bookingData.value))

  const servicesPipelineResult = computed(() =>
    cascadeShapePipeline({
      bookingData: bookingData.value,
      parentInstances: selectedUserType.value,
      currentSelection: selectedServiceTypeBlocks.value,
      relationshipName: 'services',
      shapeType: BLOCK_SHAPE_TYPES.SERVICE,
      allowFallbackToAllOfShape: false,
    })
  )
  const availableServices = computed(() => servicesPipelineResult.value.instances)
  const servicesCascadeError = computed(() => servicesPipelineResult.value.error)

  const availabilityOptionsResult = computed(() =>
    cascadeShapePipeline({
      bookingData: bookingData.value,
      parentInstances: selectedServiceTypeBlocks.value,
      currentSelection: selectedAvailabilityOptions.value,
      relationshipName: 'availability options',
      shapeType: BLOCK_SHAPE_TYPES.EVENT,
      allowFallbackToAllOfShape: false,
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
      shapeType: BLOCK_SHAPE_TYPES.TIME,
      allowFallbackToAllOfShape: false
    })
  )
  const availablePropertyTypeBlocks = computed(() => propertyTypesResult.value.instances)
  const propertyTypesCascadeError = computed(() => propertyTypesResult.value.error)

  const priceTypesResult = computed(() =>
    cascadeShapePipeline({
      bookingData: bookingData.value,
      parentInstances: selectedServiceTypeBlocks.value,
      currentSelection: selectedPriceBlocks.value,
      relationshipName: 'prices',
      shapeType: BLOCK_SHAPE_TYPES.PRICE,
      allowFallbackToAllOfShape: false
    })
  )
  const availablePriceBlocks = computed(() => priceTypesResult.value.instances)
  const priceCascadeError = computed(() => priceTypesResult.value.error)

  const availableLineItemBlocks = computed(() => {
    const raw = bookingData.value?.lineItemBlocks
    const list = raw !== undefined && raw !== null && Array.isArray(raw) ? raw : []
    return list.filter((b) => b.name !== SYSTEM_DRIVE_TIME_BLOCK_INSTANCE_NAME)
  })

  const accServices = computed(() => selectedServiceTypeBlocks.value)
  const accProperty = computed(() => selectedPropertyTypeBlocks.value)
  const accAvailability = computed(() => selectedAvailabilityOptions.value)

  return {
    availableUserTypeBlocks,
    availableServices,
    availableOptionTypeBlocks: availableAvailabilityOptions,
    availablePropertyTypeBlocks,
    availablePriceBlocks,
    availableLineItemBlocks,
    servicesCascadeError,
    availabilityOptionsCascadeError,
    propertyTypesCascadeError,
    priceCascadeError,
    accServices,
    accProperty,
    accAvailability
  }
}
