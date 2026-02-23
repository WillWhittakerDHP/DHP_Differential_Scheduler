/**
 * WHY: usePropertyDetailsLogic Composable

WHY: Moves property type block logic...
 */
import { computed, ref, type Ref, type ComputedRef } from 'vue'
import type { BookingBlockInstance, BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { ComponentItem as SelectionCardComponentItem, SelectionCardItem } from '@/components/booking/types/selectionCardTypes'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import { useGlobal } from '@/composables/useGlobal'
import { useComponentEntity } from '@/composables/useComponentEntity'
import { toGlobalEntityId, type GlobalEntity } from '@/types/entities'
import type { PropertyDetailsData, PropertyFormData } from '@/types/propertyForm'
import { extractInstanceComponents } from '@/utils/instanceComponentUtils'
import type { PlaceDetails } from '@/services/mapsApiService'
import { fetchPropertyEnrichment } from '@/services/propertyEnrichmentApiService'
import { createLogger } from '@/utils/logger'
import { extractOptionalString, safeArray } from '@/utils/transformers/transformerPrimitives'

const logger = createLogger('usePropertyDetailsLogic')

function addressField(value: string | undefined | null, fieldName: string): string {
  if (value === undefined || value === null) {
    logger.debug('Address component missing', { fieldName })
    return ''
  }
  return value
}

// FIX: Use shared PropertyDetailsData type from propertyForm.ts
// TYPE_SIMILARITY: Extend canonical ComponentItem from selectionCardTypes instead of duplicating shape
export interface ComponentItem extends SelectionCardComponentItem {
  description?: string
}

/** Extends SelectionCardItem so items are assignable to SelectionCardGroup without cast */
export interface SelectionCardItemWithComponents extends SelectionCardItem {
  blockShapeName?: string
  bookingMode?: string
  partInstances?: BookingPartInstance[]
}

/** Shared base for property form state (TYPE_SIMILARITY 1.15). */
export interface PropertyFormStateCore {
  formData: PropertyFormData
  isAddressExpanded: Ref<boolean>
}

export interface UsePropertyDetailsLogicParams extends PropertyFormStateCore {
  wizard: {
    selectedPropertyTypeBlocks: Ref<BookingBlockInstance[]>
    availablePropertyTypeBlocks: Ref<BookingBlockInstance[]>
    availableLineItemBlocks: Ref<BookingBlockInstance[]>
    selectedUserTypeBlock: Ref<{ id: string } | null>
    togglePropertyTypeBlock: (block: BookingBlockInstance) => void
    toggleLineItemBlock: (block: BookingBlockInstance) => void
    batchUpdate: (fn: () => void) => void
  }
  loadedWizardState: Ref<WizardStateData | null> | null
}

export interface UsePropertyDetailsLogicReturn {
  requiresUnitNumber: ComputedRef<boolean>
  isMultiFamily: ComputedRef<boolean>
  propertyTypeBlocksWithComponents: ComputedRef<SelectionCardItemWithComponents[]>

  stepData: ComputedRef<PropertyDetailsData>
  syncMLSData: () => Promise<void>
  isEnrichmentLoading: Ref<boolean>
  handlePlaceSelected: (details: PlaceDetails) => void
  handleAutocompleteError: (error: Error) => void
  changeAddress: () => void
}

/**
 * WHY: usePropertyDetailsLogic composable

WHY: Extracts business logic from co...
 */
export function usePropertyDetailsLogic(params: UsePropertyDetailsLogicParams): UsePropertyDetailsLogicReturn {
  const {
    wizard,
    formData,
    isAddressExpanded
  } = params

  const { getGlobalEntityById, getGlobalData } = useGlobal()
  const componentEntity = useComponentEntity<'blockInstance'>('blockInstance')

  /**
   */
  const requiresUnitNumber = computed(() => {
    return wizard.selectedPropertyTypeBlocks.value.some((selected) => selected.requiresUnitNumber === true)
  })

  /**
   */
  const isMultiFamily = computed(() => {
    return wizard.selectedPropertyTypeBlocks.value.some(
      selected => selected.isMultiFamily === true
    )
  })

  /**
   * WHY: /**
LEARNING: Helper function to check if a block instance is composable...
   */
  const isComposableBlock = (blockInstance: BookingBlockInstance | null): boolean => {
    if (!blockInstance) return false
    
    const globalData = getGlobalData()
    if (!globalData) return false
    
    const globalBlockInstance = getGlobalEntityById('blockInstance', blockInstance.id)
    if (!globalBlockInstance) return false
    
    const blockInstanceWithShapeRef = globalBlockInstance as GlobalEntity<'blockInstance'> & { blockShapeRef: string }
    const blockShapeRef = blockInstanceWithShapeRef.blockShapeRef
    
    const blockShape = getGlobalEntityById('blockShape', blockShapeRef)
    if (!blockShape) return false
    
    const blockShapeWithComposable = blockShape as GlobalEntity<'blockShape'> & { composable?: boolean }
    return blockShapeWithComposable.composable === true
  }

  /**
   */
  const propertyTypeBlocksWithComponents = computed(() => {
    return wizard.availablePropertyTypeBlocks.value.map(adjustment => {
      const isComposable = isComposableBlock(adjustment)
      let instanceComponents: ComponentItem[] = []
      
      if (isComposable) {
        const instanceComponentsRelationships = componentEntity.getComponents(toGlobalEntityId(adjustment.id))
        if (instanceComponentsRelationships && instanceComponentsRelationships.length > 0) {
          // FIX: Use shared utility function instead of duplicated logic
          instanceComponents = extractInstanceComponents({
            serviceId: adjustment.id,
            instanceComponentsRelationships,
            getGlobalEntityById: (entityKey: 'blockInstance' | 'blockShape', id: string) => {
              const entity = getGlobalEntityById(entityKey, id)
              if (entityKey === 'blockInstance') {
                return entity as GlobalEntity<'blockInstance'> | null
              } else {
                return entity as GlobalEntity<'blockShape'> | null
              }
            }
          })
        }
      }
      
      return {
        ...adjustment,
        composite: isComposable,
        instanceComponents: instanceComponents.length > 0 ? instanceComponents : undefined
      }
    })
  })


  /**
   */
  const stepData = computed<PropertyDetailsData>(() => ({
    address: formData.address.value,
    unit: formData.unit.value,
    city: formData.city.value,
    state: formData.state.value,
    zipCode: formData.zipCode.value,
    candidatePlaceId: formData.candidatePlaceId.value,
    candidateCoordinates: formData.candidateCoordinates.value,
    propertySize: formData.propertySize.value,
    numberOfUnits: formData.numberOfUnits.value,
    mlsNumber: formData.mlsNumber.value,
    squareFootage: formData.squareFootage.value,
    bedrooms: formData.bedrooms.value,
    bathrooms: formData.bathrooms.value,
    foundationAccess: formData.foundationAccess.value,
    additionalUnits: formData.additionalUnits.value,
    source: formData.source?.value,
    suggestedBlockInstanceIds: formData.suggestedBlockInstanceIds?.value
  }))

  const isEnrichmentLoading = ref(false)

  /**
   */
  const handlePlaceSelected = (details: PlaceDetails): void => {
    const { addressComponents, coordinates, placeId } = details

    const streetNumber = addressField(addressComponents.streetNumber, 'streetNumber')
    const streetName = addressField(addressComponents.streetName, 'streetName')
    formData.address.value = `${streetNumber} ${streetName}`.trim()
    formData.city.value = addressField(addressComponents.city, 'city')
    formData.state.value = addressField(addressComponents.state, 'state')
    formData.zipCode.value = addressField(addressComponents.postalCode, 'postalCode')
    
    formData.candidatePlaceId.value = placeId
    formData.candidateCoordinates.value = coordinates
    
    isAddressExpanded.value = true

    syncMLSData().catch((err) => {
      logger.warn('MLS enrichment failed', { err })
    })
  }

  /**
   */
  const handleAutocompleteError = (error: Error): void => {
    logger.warn('Autocomplete error, showing manual fields', { error })
    isAddressExpanded.value = true
  }

  /**
   */
  const changeAddress = (): void => {
    isAddressExpanded.value = false
  }

  /**
   */
  const syncMLSData = async (): Promise<void> => {
    const placeId = formData.candidatePlaceId?.value
    const address = formData.address?.value?.trim()
    if (!placeId || !address) {
      return
    }
    if (placeId.length < 15) {
      return
    }

    isEnrichmentLoading.value = true
    if (formData.suggestedBlockInstanceIds) formData.suggestedBlockInstanceIds.value = []

    try {
      const enrichment = await fetchPropertyEnrichment(
        address,
        formData.city?.value,
        formData.state?.value,
        formData.zipCode?.value
      )

      if (!enrichment) {
        return
      }

      formData.mlsNumber.value = extractOptionalString(enrichment.mlsNumber, 'enrichment.mlsNumber')
      formData.squareFootage.value = enrichment.squareFootage ?? null
      formData.bedrooms.value = enrichment.bedrooms ?? null
      formData.bathrooms.value = enrichment.bathrooms ?? null
      formData.foundationAccess.value = enrichment.foundationAccess ?? null
      formData.additionalUnits.value = enrichment.additionalUnits ?? null
      if (formData.source) formData.source.value = 'api'
      const suggestedIds = safeArray(enrichment.suggestedBlockInstanceIds)
      if (formData.suggestedBlockInstanceIds) {
        formData.suggestedBlockInstanceIds.value = suggestedIds
      }

      if (enrichment.squareFootage != null) {
        formData.propertySize.value = enrichment.squareFootage
      }
      if (suggestedIds.length > 0) {
        wizard.batchUpdate(() => {
          const propBlocks = wizard.availablePropertyTypeBlocks.value
          const lineBlocks = wizard.availableLineItemBlocks.value
          for (const id of suggestedIds) {
            const propBlock = propBlocks.find((b) => b.id === id)
            if (propBlock) {
              wizard.togglePropertyTypeBlock(propBlock)
              break
            }
            const lineBlock = lineBlocks.find((b) => b.id === id)
            if (lineBlock) {
              wizard.toggleLineItemBlock(lineBlock)
            }
          }
        })
      }
    } finally {
      isEnrichmentLoading.value = false
    }
  }

  return {
    requiresUnitNumber,
    isMultiFamily,
    propertyTypeBlocksWithComponents,
    stepData,
    syncMLSData,
    isEnrichmentLoading,
    handlePlaceSelected,
    handleAutocompleteError,
    changeAddress
  }
}

