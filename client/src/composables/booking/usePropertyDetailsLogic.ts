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
import { getIcon } from '@/utils/iconMapper'
import type { GlobalEntity } from '@/types/entities'

/**
 * Property details structure
 */
export interface PropertyDetailsData {
  address: string
  unit: string
  city: string
  state: string
  zipCode: string
  propertySize: number | null
  numberOfUnits: number | null
  mlsNumber: string
  squareFootage: number | null
  bedrooms: number | null
  bathrooms: number | null
  foundationAccess: 'basement' | 'crawlspace' | 'slab' | null
  additionalUnits: number | null
}

/**
 * Component item structure
 */
export interface ComponentItem {
  id: string
  name: string
  description?: string
  icon?: string
  active: boolean
}

/**
 * Selection card item with components
 */
export interface SelectionCardItemWithComponents extends BookingBlockInstance {
  composite?: boolean
  instanceComponents?: ComponentItem[]
}

/**
 * usePropertyDetailsLogic composable parameters
 */
export interface UsePropertyDetailsLogicParams {
  wizard: {
    selectedPropertyTypeBlocks: Ref<BookingBlockInstance[]>
    availablePropertyTypeBlocks: Ref<BookingBlockInstance[]>
    selectedUserTypeBlock: Ref<{ id: string } | null>
  }
  loadedWizardState: Ref<WizardStateData | null> | null
  formData: {
    address: Ref<string>
    unit: Ref<string>
    city: Ref<string>
    state: Ref<string>
    zipCode: Ref<string>
    propertySize: Ref<number | null>
    numberOfUnits: Ref<number | null>
    mlsNumber: Ref<string>
    squareFootage: Ref<number | null>
    bedrooms: Ref<number | null>
    bathrooms: Ref<number | null>
    foundationAccess: Ref<'basement' | 'crawlspace' | 'slab' | null>
    additionalUnits: Ref<number | null>
  }
}

/**
 * usePropertyDetailsLogic composable return type
 */
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
    // loadedWizardState available for future loaded appointment state handling
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

  const isMultiFamily = computed(() => {
    return wizard.selectedPropertyTypeBlocks.value.some(
      selected => selected.name.toLowerCase().includes('multi')
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
    
    // Get block instance from globalData to access blockShapeRef
    const globalBlockInstance = getGlobalEntityById('blockInstance', blockInstance.id)
    if (!globalBlockInstance) return false
    
    const blockInstanceWithShapeRef = globalBlockInstance as GlobalEntity<'blockInstance'> & { blockShapeRef: string }
    const blockShapeRef = blockInstanceWithShapeRef.blockShapeRef
    
    // Get blockShape entity to check composable property
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
      // Check if adjustment is composable and get visible components
      const isComposable = isComposableBlock(adjustment)
      let instanceComponents: ComponentItem[] = []
      
      if (isComposable) {
        const instanceComponentsRelationships = componentEntity.getComponents(adjustment.id)
        if (instanceComponentsRelationships && instanceComponentsRelationships.length > 0) {
          const globalData = getGlobalData()
          if (globalData) {
            instanceComponents = instanceComponentsRelationships
              .map(ac => {
                const componentBlockInstance = getGlobalEntityById('blockInstance', ac.childId)
                if (!componentBlockInstance) return null
                
                // Get blockShape to check if component's blockShape is composable
                const componentWithShapeRef = componentBlockInstance as GlobalEntity<'blockInstance'> & { blockShapeRef: string }
                const componentBlockShape = getGlobalEntityById('blockShape', componentWithShapeRef.blockShapeRef)
                if (!componentBlockShape) return null
                
                const componentBlockShapeWithComposable = componentBlockShape as GlobalEntity<'blockShape'> & { composable?: boolean }
                // Only include components whose blockShape is composable
                if (componentBlockShapeWithComposable.composable !== true) return null
                
                // Get annotations (descriptions) for this component
                const componentWithAnnotations = componentBlockInstance as GlobalEntity<'blockInstance'> & { 
                  annotations?: Array<{ text: string; userTypeBlock: string | null; isDefault?: boolean }>
                  description?: string
                }
                
                // Filter descriptions by user type
                let filteredDescription = ''
                if (componentWithAnnotations.annotations && componentWithAnnotations.annotations.length > 0) {
                  const selectedUserTypeBlockId = wizard.selectedUserTypeBlock.value?.id || null
                  const matchingDescriptions = componentWithAnnotations.annotations.filter(ann => {
                    return ann.userTypeBlock === selectedUserTypeBlockId || ann.userTypeBlock === null
                  })
                  
                  if (matchingDescriptions.length > 0) {
                    const userTypeBlockSpecific = matchingDescriptions.find(ann => ann.userTypeBlock === selectedUserTypeBlockId)
                    const defaultDesc = matchingDescriptions.find(ann => ann.isDefault === true)
                    const selectedDesc = userTypeBlockSpecific || defaultDesc || matchingDescriptions[0]
                    filteredDescription = selectedDesc.text
                  }
                } else {
                  filteredDescription = componentWithAnnotations.description || ''
                }
                
                // Map icon
                const iconValue = (componentBlockInstance as GlobalEntity<'blockInstance'> & { icon?: string }).icon || ''
                const mappedIcon = getIcon(iconValue)
                
                return {
                  id: componentBlockInstance.id,
                  name: componentBlockInstance.name,
                  description: filteredDescription,
                  icon: mappedIcon,
                  active: true // All components from instanceComponents are active
                }
              })
              .filter((component): component is NonNullable<typeof component> => component !== null)
          }
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
    // TODO: Implement MLS data synchronization
  }

  return {
    requiresUnitNumber,
    isMultiFamily,
    propertyTypeBlocksWithComponents,
    stepData,
    syncMLSData
  }
}

