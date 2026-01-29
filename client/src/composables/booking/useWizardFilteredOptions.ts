import { computed, type Ref } from 'vue'
import type { BookingData, BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { getStateControlBlockInstances, getBlockShapeIdByType } from '@/utils/blockInstanceUtils'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'

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
  // No booking data available
  if (!bookingData) {
    return { 
      success: false, 
      error: 'Booking data not loaded',
      instances: currentSelection 
    }
  }

  // Normalize to array for consistent processing
  const parents = parentInstances 
    ? (Array.isArray(parentInstances) ? parentInstances : [parentInstances])
    : []

  // No parent selected - return empty unless there's a current selection
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

  // Collect cascade IDs from all parents
  const allowedIds = new Set<string>()
  // LEARNING: Use flatMap to collect all activeBlockIds without forEach mutations
  // WHY: Functional approach avoids forEach with Set.add mutations
  const allActiveBlockIds = parents
    .flatMap(parent => parent.activeBlockIds || [])
  allActiveBlockIds.forEach(id => allowedIds.add(id))

  // No cascades configured on parents
  if (allowedIds.size === 0) {
    return {
      success: false,
      error: `Selected parent has no ${relationshipName} cascades configured. Please configure bookingCascades in the admin panel.`,
      instances: currentSelection
    }
  }

  // Filter instances by cascade IDs (generic - no hardcoded block shapes)
  const cascadedInstances = bookingData.blockInstances.filter(
    instance => allowedIds.has(instance.id)
  )

  // Preserve currently selected items that aren't in filtered results
  // WHY: Allows keeping selections when changing filters (better UX)
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
  selectedServices: Ref<BookingBlockInstance[]>
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
    selectedServices,
    selectedAvailabilityOptions,
    selectedPropertyTypeBlocks,
  } = params

  const availableUserTypeBlocks = computed((): BookingBlockInstance[] => {
    if (!bookingData.value) return []

    // Get all state control block instances
    const allStateControlInstances = getStateControlBlockInstances(bookingData.value)
    
    if (allStateControlInstances.length === 0) return []
    
    // Group by blockShapeRef to find which state control block shape has instances
    // LEARNING: Dynamic filtering by blockShapeRef - no hardcoded names
    // WHY: Works with whatever state control block shape exists, regardless of name changes
    // PATTERN: Group instances by blockShapeRef, use the one that has instances
    const instancesByShapeRef = new Map<string, BookingBlockInstance[]>()
    // LEARNING: Use reduce to build Map instead of forEach with Map.set mutations
    // WHY: Functional approach avoids forEach with Map mutations
    allStateControlInstances.reduce((map, instance) => {
      const existing = map.get(instance.blockShapeRef) || []
      map.set(instance.blockShapeRef, [...existing, instance])
      return map
    }, instancesByShapeRef)
    
    // Use the blockShapeRef that has instances (if multiple, use first one)
    // This is dynamic - works with whatever state control block shape exists
    const userTypeBlockShapeRef = Array.from(instancesByShapeRef.keys())[0]
    
    if (!userTypeBlockShapeRef) return []
    
    // Return instances for that blockShapeRef
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
      selectedServices.value,
      'services'
    )
    return result.instances
  })

  const servicesCascadeError = computed((): string | null => {
    const result = filterInstancesByCascade(
      bookingData.value,
      selectedUserType.value,
      selectedServices.value,
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
      selectedServices.value,
      selectedAvailabilityOptions.value,
      'availability options'
    )
    
    // Always filter by block shape type - don't trust cascade configuration
    if (!bookingData.value) {
      return []
    }
    
    // LEARNING: Get Option block shape ID by type (stable semantic identifier)
    // WHY: Type is immutable and independent of display name, prevents wrong blocks from showing
    const optionBlockShapeId = getBlockShapeIdByType(bookingData.value, BLOCK_SHAPE_TYPES.OPTION)
    
    if (!optionBlockShapeId) {
      // Block shape not found - log warning and return empty to prevent showing wrong blocks
      console.warn('[useWizardFilteredOptions] Option block shape (type="option") not found')
      return []
    }
    
    // If cascade returned no results, check if we should fall back to all Option blocks
    // LEARNING: Fallback to all Option blocks if no cascades configured
    // WHY: Better UX than showing empty - allows selection even if cascades aren't set up
    if (result.instances.length === 0) {
      if (selectedServices.value.length > 0) {
        console.warn('[useWizardFilteredOptions] No cascade results from selected services. Falling back to all Option blocks.')
        // Fallback: return all active Option blocks
        return bookingData.value.blockInstances.filter(
          instance => instance.blockShapeRef === optionBlockShapeId && instance.active
        )
      }
      return []
    }
    
    // Filter cascade results by block shape ID (ensures only Option blocks are returned)
    const filtered = result.instances.filter(
      instance => instance.blockShapeRef === optionBlockShapeId
    )
    
    if (selectedServices.value.length > 0 && filtered.length === 0 && result.instances.length > 0) {
      console.warn('[useWizardFilteredOptions] Cascade results filtered out - no Option blocks found in cascade results', {
        totalCascadeResults: result.instances.length,
        optionBlockShapeId,
        cascadeInstanceTypes: result.instances.map(inst => {
          // LEARNING: Convert both IDs to strings for consistent comparison
          // WHY: Ensures type-safe comparison (UUIDs might be strings or numbers)
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
      selectedServices.value,
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
      selectedServices.value,
      selectedPropertyTypeBlocks.value,
      'property types'
    )
    
    // Always filter by block shape type - don't trust cascade configuration
    if (!bookingData.value || result.instances.length === 0) {
      return result.instances
    }
    
    // LEARNING: Get Property block shape ID by type (stable semantic identifier)
    // WHY: Type is immutable and independent of display name, ensures correct blocks are shown
    const propertyTypeBlockShapeId = getBlockShapeIdByType(bookingData.value, BLOCK_SHAPE_TYPES.PROPERTY)
    
    if (!propertyTypeBlockShapeId) {
      // Block shape not found - log warning and return empty to prevent showing wrong blocks
      console.warn('[useWizardFilteredOptions] Property block shape (type="property") not found')
      return []
    }
    
    // Filter cascade results by block shape ID (ensures only Property blocks are returned)
    return result.instances.filter(
      instance => instance.blockShapeRef === propertyTypeBlockShapeId
    )
  })

  const propertyTypesCascadeError = computed((): string | null => {
    const result = filterInstancesByCascade(
      bookingData.value,
      selectedServices.value,
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
    
    // LEARNING: Return all line item blocks from booking data
    // WHY: Line items are always available for selection (no cascade dependencies)
    // PATTERN: Return lineItemBlocks array directly, already filtered and sorted by transformer
    return bookingData.value.lineItemBlocks || []
  })

  const accServices = computed((): BookingBlockInstance[] => selectedServices.value)
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


