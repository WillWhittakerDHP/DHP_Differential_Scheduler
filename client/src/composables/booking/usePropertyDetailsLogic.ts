/**
 * usePropertyDetailsLogic Composable
 * 
 * LEARNING: Extracts property details step business logic from PropertyDetailsStep component
 * WHY: Moves property type block logic, property type checks, and data transformations to composable
 * PATTERN: Composable that provides reactive computed properties and helper functions
 */

import { computed, type Ref, type ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import { useGlobal } from '@/composables/useGlobal'
import { useComponentEntity } from '@/composables/useComponentEntity'
import type { GlobalEntity } from '@/types/entities'
import type { PropertyDetailsData, PropertyFormData } from '@/types/propertyForm'
import { extractInstanceComponents } from '@/utils/instanceComponentUtils'
import type { PlaceDetails } from '@/services/mapsApiService'

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
    selectedUserTypeBlock: Ref<{ id: string } | null>
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
  syncMLSData: () => void
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
   * WHY: Database flag (is_multi_family) instead of hardcoded name matching
   * PATTERN: Database-driven validation for multi-family property detection
   */
  const isMultiFamily = computed(() => {
    return wizard.selectedPropertyTypeBlocks.value.some(
      selected => selected.is_multi_family === true
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
    additionalUnits: formData.additionalUnits.value
  }))

  /**
   * LEARNING: Handle place selection from AddressAutocomplete
   * WHY: Extracts address components and coordinates from Google Places API response
   * PATTERN: Populates form fields and expands UI to show editable fields
   */
  const handlePlaceSelected = (details: PlaceDetails): void => {
    const { addressComponents, coordinates, placeId } = details
    
    // Map address components to form fields
    const streetNumber = addressComponents.streetNumber || ''
    const streetName = addressComponents.streetName || ''
    formData.address.value = `${streetNumber} ${streetName}`.trim()
    formData.city.value = addressComponents.city || ''
    formData.state.value = addressComponents.state || ''
    formData.zipCode.value = addressComponents.postalCode || ''
    
    // Store location data for drive time calculations
    // DEBUG: Log candidatePlaceId being set
    console.log('[usePropertyDetailsLogic] Setting candidatePlaceId:', placeId, 'from place-selected event')
    formData.candidatePlaceId.value = placeId
    formData.candidateCoordinates.value = coordinates
    
    // Expand to show editable fields
    isAddressExpanded.value = true
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
   * LEARNING: Sync MLS data function
   * WHY: Placeholder for future MLS data synchronization functionality
   * PATTERN: Empty function that can be implemented later
   */
  const syncMLSData = (): void => {
  }

  return {
    requiresUnitNumber,
    isMultiFamily,
    propertyTypeBlocksWithComponents,
    stepData,
    syncMLSData,
    handlePlaceSelected,
    handleAutocompleteError,
    changeAddress
  }
}

