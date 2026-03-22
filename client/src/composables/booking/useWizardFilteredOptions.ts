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
    selectedCouponBlocks
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

  const couponTypesResult = computed(() =>
    cascadeShapePipeline({
      bookingData: bookingData.value,
      parentInstances: selectedServiceTypeBlocks.value,
      currentSelection: selectedCouponBlocks.value,
      relationshipName: 'coupons',
      shapeType: BLOCK_SHAPE_TYPES.COUPON,
      allowFallbackToAllOfShape: false
    })
  )
  const availableCouponBlocks = computed(() => couponTypesResult.value.instances)
  const couponCascadeError = computed(() => couponTypesResult.value.error)

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
    availableCouponBlocks,
    availableLineItemBlocks,
    servicesCascadeError,
    availabilityOptionsCascadeError,
    propertyTypesCascadeError,
    couponCascadeError,
    accServices,
    accProperty,
    accAvailability
  }
}
