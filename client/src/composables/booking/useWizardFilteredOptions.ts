import { computed, type Ref } from 'vue'
import type { BookingData, BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { getStateControlBlockInstances, getBlockShapeIdByType } from '@/utils/blockInstanceUtils'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useWizardFilteredOptions')

/**
 * Generic cascade filter result
 * LEARNING: Discriminated union for success/error states
 * WHY: Type-safe error handling with clear error messages
 */
type CascadeFilterResult = 
  | { success: true; instances: BookingBlockInstance[] }
  | { success: false; error: string; instances: BookingBlockInstance[] }

/**
 * Generic cascade filtering helper
 * 
 * LEARNING: Reusable pattern for filtering block instances by parent cascades
 * WHY: Eliminates code duplication across services, availability options, and property types
 * PATTERN: Generic helper that handles single or array parents, collects cascade IDs, filters instances
 * 
 * @param bookingData - Booking data containing all block instances
 * @param parentInstances - Single parent or array of parents that contain cascade IDs
 * @param currentSelection - Currently selected instances (to preserve on error/empty)
 * @param relationshipName - Name of relationship for error messages (e.g., 'services', 'availability options')
 * @returns Filtered instances and optional error message
 */
function filterInstancesByCascade(
  bookingData: BookingData | null,
  parentInstances: BookingBlockInstance | BookingBlockInstance[] | null,
  currentSelection: BookingBlockInstance[],
  relationshipName: string
): CascadeFilterResult {
  if (!bookingData) {
    return { 
      success: false, 
      error: 'Booking data not loaded',
      instances: currentSelection 
    }
  }

  const parents = parentInstances 
    ? (Array.isArray(parentInstances) ? parentInstances : [parentInstances])
    : []

  if (parents.length === 0) {
    if (currentSelection.length > 0) {
      return { success: true, instances: currentSelection }
    }
    return { 
      success: false,
      error: `Please select a parent option to view available ${relationshipName}`,
      instances: []
    }
  }

  const allowedIds = new Set<string>()
  // WHY: Functional approach avoids forEach with Set.add mutations
  const allActiveBlockIds = parents
    .flatMap(parent => parent.activeBlockIds || [])
  allActiveBlockIds.forEach(id => allowedIds.add(id))

  if (allowedIds.size === 0) {
    return {
      success: false,
      error: `Selected parent has no ${relationshipName} cascades configured. Please configure bookingCascades in the admin panel.`,
      instances: currentSelection
    }
  }

  const cascadedInstances = bookingData.blockInstances.filter(
    instance => allowedIds.has(instance.id)
  )

  const missingSelected = currentSelection.filter(
    selected => !cascadedInstances.some(instance => instance.id === selected.id)
  )

  return {
    success: true,
    instances: [...cascadedInstances, ...missingSelected]
  }
}

export type UseWizardFilteredOptionsParams = {
  bookingData: Ref<BookingData | null>
  selectedUserType: Ref<BookingBlockInstance | null>
  selectedServiceTypeBlocks: Ref<BookingBlockInstance[]>
  selectedAvailabilityOptions: Ref<BookingBlockInstance[]>
  selectedPropertyTypeBlocks: Ref<BookingBlockInstance[]>
}

import type { WizardComputedProperties } from '@/types/wizard'

// FIX: Use shared WizardComputedProperties type from wizard.ts
export type UseWizardFilteredOptionsReturn = WizardComputedProperties

/**
 * Booking wizard selection flow filters.
 *
 * LEARNING: Keeps "available options" logic out of `useBookingWizard` so the wizard composable stays focused on state + commands.
 * WHY: These computed filters are large, cross-cutting, and are reused by multiple step composables/components.
 */
export function useWizardFilteredOptions(params: UseWizardFilteredOptionsParams): UseWizardFilteredOptionsReturn {
  const {
    bookingData,
    selectedUserType,
    selectedServiceTypeBlocks,
    selectedAvailabilityOptions,
    selectedPropertyTypeBlocks,
  } = params

  const availableUserTypeBlocks = computed((): BookingBlockInstance[] => {
    if (!bookingData.value) return []

    const allStateControlInstances = getStateControlBlockInstances(bookingData.value)
    
    if (allStateControlInstances.length === 0) return []
    
    // WHY: Works with whatever state control block shape exists, regardless of name changes
    // PATTERN: Group instances by blockShapeRef, use the one that has instances
    const instancesByShapeRef = new Map<string, BookingBlockInstance[]>()
    // WHY: Functional approach avoids forEach with Map mutations
    allStateControlInstances.reduce((map, instance) => {
      const existing = map.get(instance.blockShapeRef) || []
      map.set(instance.blockShapeRef, [...existing, instance])
      return map
    }, instancesByShapeRef)
    
    const userTypeBlockShapeRef = Array.from(instancesByShapeRef.keys())[0]
    
    if (!userTypeBlockShapeRef) return []
    
    const result = instancesByShapeRef.get(userTypeBlockShapeRef) || []

    return result
  })

  /**
   * LEARNING: Services filtered by booking cascades from selected user type
   * WHY: User Type → Services cascade determines which services are available
   * PATTERN: Uses generic filterInstancesByCascade helper
   */
  const availableServices = computed((): BookingBlockInstance[] => {
    const result = filterInstancesByCascade(
      bookingData.value,
      selectedUserType.value,
      selectedServiceTypeBlocks.value,
      'services'
    )
    return result.instances
  })

  const servicesCascadeError = computed((): string | null => {
    const result = filterInstancesByCascade(
      bookingData.value,
      selectedUserType.value,
      selectedServiceTypeBlocks.value,
      'services'
    )
    return result.success ? null : result.error
  })

  /**
   * LEARNING: Availability options filtered by cascades from selected services
   * WHY: Services → Availability Options cascade determines which options are available
   * PATTERN: Uses generic filterInstancesByCascade helper, then filters by block shape type
   * FIX: Always filter by type after cascade filtering - don't trust cascade shape inference
   *      This prevents Property blocks from appearing in Availability Options section
   */
  const availableAvailabilityOptions = computed((): BookingBlockInstance[] => {
    const result = filterInstancesByCascade(
      bookingData.value,
      selectedServiceTypeBlocks.value,
      selectedAvailabilityOptions.value,
      'availability options'
    )
    
    if (!bookingData.value) {
      return []
    }
    
    const optionBlockShapeId = getBlockShapeIdByType(bookingData.value, BLOCK_SHAPE_TYPES.OPTION)
    
    if (!optionBlockShapeId) {
      console.warn('[useWizardFilteredOptions] Option block shape (type="option") not found')
      return []
    }
    
    if (result.instances.length === 0) {
      if (selectedServiceTypeBlocks.value.length > 0) {
        console.warn('[useWizardFilteredOptions] No cascade results from selected services. Falling back to all Option blocks.')
        return bookingData.value.blockInstances.filter(
          instance => instance.blockShapeRef === optionBlockShapeId && instance.active
        )
      }
      return []
    }
    
    const filtered = result.instances.filter(
      instance => instance.blockShapeRef === optionBlockShapeId
    )
    
    if (selectedServiceTypeBlocks.value.length > 0 && filtered.length === 0 && result.instances.length > 0) {
      console.warn('[useWizardFilteredOptions] Cascade results filtered out - no Option blocks found in cascade results', {
        totalCascadeResults: result.instances.length,
        optionBlockShapeId,
        cascadeInstanceTypes: result.instances.map(inst => {
          const shape = bookingData.value?.blockShapes.find(bs => String(bs.id) === String(inst.blockShapeRef))
          return shape ? `${inst.name} (${shape.name}, type: ${shape.type})` : `${inst.name} (unknown shape)`
        })
      })
    }
    
    return filtered
  })

  const availabilityOptionsCascadeError = computed((): string | null => {
    const result = filterInstancesByCascade(
      bookingData.value,
      selectedServiceTypeBlocks.value,
      selectedAvailabilityOptions.value,
      'availability options'
    )
    return result.success ? null : result.error
  })

  /**
   * LEARNING: Property type blocks filtered by cascades from selected services
   * WHY: Services → Property Types cascade determines which property types are available
   * PATTERN: Uses generic filterInstancesByCascade helper, then filters by block shape type
   * FIX: Always filter by type after cascade filtering - don't trust cascade shape inference
   *      This ensures only Property blocks are returned, not Option blocks
   */
  const availablePropertyTypeBlocks = computed((): BookingBlockInstance[] => {
    const result = filterInstancesByCascade(
      bookingData.value,
      selectedServiceTypeBlocks.value,
      selectedPropertyTypeBlocks.value,
      'property types'
    )
    
    if (!bookingData.value || result.instances.length === 0) {
      return result.instances
    }
    
    const propertyTypeBlockShapeId = getBlockShapeIdByType(bookingData.value, BLOCK_SHAPE_TYPES.PROPERTY)
    
    if (!propertyTypeBlockShapeId) {
      logger.warn('Property block shape (type="property") not found')
      return []
    }
    
    return result.instances.filter(
      instance => instance.blockShapeRef === propertyTypeBlockShapeId
    )
  })

  const propertyTypesCascadeError = computed((): string | null => {
    const result = filterInstancesByCascade(
      bookingData.value,
      selectedServiceTypeBlocks.value,
      selectedPropertyTypeBlocks.value,
      'property types'
    )
    return result.success ? null : result.error
  })

  /**
   * LEARNING: Line item blocks filtered from booking data
   * WHY: Line items are block instances with bookingMode: "addOn" available for separate selection
   * PATTERN: Filter from bookingData.lineItemBlocks (already filtered and transformed)
   * NOTE: Line items don't use cascade filtering - they're always available for selection
   */
  const availableLineItemBlocks = computed((): BookingBlockInstance[] => {
    if (!bookingData.value) return []
    
    // PATTERN: Return lineItemBlocks array directly, already filtered and sorted by transformer
    return bookingData.value.lineItemBlocks || []
  })

  const accServices = computed((): BookingBlockInstance[] => selectedServiceTypeBlocks.value)
  const accProperty = computed((): BookingBlockInstance[] => selectedPropertyTypeBlocks.value)
  const accAvailability = computed((): BookingBlockInstance[] => selectedAvailabilityOptions.value)

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
    accAvailability,
  }
}


