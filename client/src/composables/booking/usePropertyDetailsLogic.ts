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
}

export interface UsePropertyDetailsLogicReturn {
  requiresUnitNumber: ComputedRef<boolean>
  isMultiFamily: ComputedRef<boolean>
  propertyTypeBlocksWithComponents: ComputedRef<SelectionCardItemWithComponents[]>

  stepData: ComputedRef<PropertyDetailsData>
  syncMLSData: () => void
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
    formData
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
    syncMLSData
  }
}

