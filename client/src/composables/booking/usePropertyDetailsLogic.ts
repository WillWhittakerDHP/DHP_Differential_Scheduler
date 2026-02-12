/**
 * usePropertyDetailsLogic Composable
 * 
 * LEARNING: Extracts property details step business logic from PropertyDetailsStep component
 * WHY: Moves property type block logic, property type checks, and data transformations to composable
 * PATTERN: Composable that provides reactive computed properties and helper functions
 */

import { computed, ref, type Ref, type ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import { useGlobal } from '@/composables/useGlobal'
import { useComponentEntity } from '@/composables/useComponentEntity'
import type { GlobalEntity } from '@/types/entities'
import type { PropertyDetailsData, PropertyFormData } from '@/types/propertyForm'
import { extractInstanceComponents } from '@/utils/instanceComponentUtils'
import type { PlaceDetails } from '@/services/mapsApiService'
import { fetchPropertyEnrichment } from '@/services/propertyEnrichmentApiService'
import { createLogger } from '@/utils/logger'

const logger = createLogger('usePropertyDetailsLogic')

function addressField(value: string | undefined | null, fieldName: string): string {
  if (value === undefined || value === null) {
    logger.debug('Address component missing', { fieldName })
    return ''
  }
  return value
}

// FIX: Use shared PropertyDetailsData type from propertyForm.ts

export interface ComponentItem {
  id: string
  name: string
  description?: string
  icon?: string
  active: boolean
}

export interface SelectionCardItemWithComponents extends BookingBlockInstance {
  composite?: boolean
  instanceComponents?: ComponentItem[]
}

export interface UsePropertyDetailsLogicParams {
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
  formData: PropertyFormData
  isAddressExpanded: Ref<boolean>
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
 * usePropertyDetailsLogic composable
 * 
 * LEARNING: Provides reactive computed properties for property details logic
 * WHY: Extracts business logic from component to composable
 * PATTERN: Composable that returns reactive computed properties
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
   * WHY: Shows/hides fields based on property type block selection
   * PATTERN: Computed boolean based on selected property type blocks (check if any matches)
   */
  const requiresUnitNumber = computed(() => {
    return wizard.selectedPropertyTypeBlocks.value.some((selected) => selected.requiresUnitNumber === true)
  })

  /**
   * WHY: Database flag (isMultiFamily) instead of hardcoded name matching
   * PATTERN: Database-driven validation for multi-family property detection
   */
  const isMultiFamily = computed(() => {
    return wizard.selectedPropertyTypeBlocks.value.some(
      selected => selected.isMultiFamily === true
    )
  })

  /**
   * LEARNING: Helper function to check if a block instance is composable
   * WHY: Only composable blocks can have option components (instanceComponents)
   * PATTERN: Check blockShape.composable property from globalData
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
   * WHY: Enables expandable cards to show nested components
   * PATTERN: Map available property type blocks and add component data
   */
  const propertyTypeBlocksWithComponents = computed(() => {
    return wizard.availablePropertyTypeBlocks.value.map(adjustment => {
      const isComposable = isComposableBlock(adjustment)
      let instanceComponents: ComponentItem[] = []
      
      if (isComposable) {
        const instanceComponentsRelationships = componentEntity.getComponents(adjustment.id)
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
   * LEARNING: Step data computed property
   * WHY: Enables parent to collect property form data for appointment creation
   * PATTERN: Computed ref that exposes all form field values
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
   * LEARNING: Handle place selection from AddressAutocomplete
   * WHY: Extracts address components and coordinates from Google Places API response
   * PATTERN: Populates form fields and expands UI to show editable fields
   */
  const handlePlaceSelected = (details: PlaceDetails): void => {
    const { addressComponents, coordinates, placeId } = details

    const streetNumber = addressField(addressComponents.streetNumber, 'streetNumber')
    const streetName = addressField(addressComponents.streetName, 'streetName')
    formData.address.value = `${streetNumber} ${streetName}`.trim()
    formData.city.value = addressField(addressComponents.city, 'city')
    formData.state.value = addressField(addressComponents.state, 'state')
    formData.zipCode.value = addressField(addressComponents.postalCode, 'postalCode')
    
    // Store location data for drive time calculations
    formData.candidatePlaceId.value = placeId
    formData.candidateCoordinates.value = coordinates
    
    // Expand to show editable fields
    isAddressExpanded.value = true

    // Trigger MLS enrichment (gate: valid placeId + address)
    syncMLSData().catch((err) => {
      logger.warn('MLS enrichment failed', { err })
    })
  }

  /**
   * LEARNING: Handle autocomplete errors
   * WHY: Fallback to manual entry if autocomplete API fails
   * PATTERN: Expand fields to allow manual entry
   */
  const handleAutocompleteError = (error: Error): void => {
    logger.warn('Autocomplete error, showing manual fields', { error })
    isAddressExpanded.value = true
  }

  /**
   * LEARNING: Change address handler
   * WHY: Returns to autocomplete-only mode when user wants to change address
   * PATTERN: Collapse expanded fields back to autocomplete-only
   */
  const changeAddress = (): void => {
    isAddressExpanded.value = false
  }

  /**
   * LEARNING: Sync MLS data from Bright MLS / RESO property enrichment
   * WHY: Fetches listing data when user selects address; populates form and suggests blocks
   * PATTERN: Gate on candidatePlaceId + address; call enrichment API; populate form; apply suggested blocks
   */
  const syncMLSData = async (): Promise<void> => {
    const placeId = formData.candidatePlaceId?.value
    const address = formData.address?.value?.trim()
    if (!placeId || !address) {
      return
    }
    // Skip synthetic/test place IDs (Google Place IDs are typically 20+ chars)
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

      formData.mlsNumber.value = enrichment.mlsNumber ?? ''
      formData.squareFootage.value = enrichment.squareFootage
      formData.bedrooms.value = enrichment.bedrooms
      formData.bathrooms.value = enrichment.bathrooms
      formData.foundationAccess.value = enrichment.foundationAccess
      formData.additionalUnits.value = enrichment.additionalUnits
      if (formData.source) formData.source.value = 'api'
      if (formData.suggestedBlockInstanceIds) {
        formData.suggestedBlockInstanceIds.value = enrichment.suggestedBlockInstanceIds ?? []
      }

      if (enrichment.squareFootage != null) {
        formData.propertySize.value = enrichment.squareFootage
      }

      const suggestedIds = enrichment.suggestedBlockInstanceIds ?? []
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

