/**
 * LEARNING: Field Context Manager
 * WHY: Encapsulates field context retrieval with warnings for missing contexts
 * PATTERN: Composable for managing field context access and tracking missing contexts
 * 
 * Used by:
 * - EntityCard.vue
 */

import { computed, type ComputedRef } from 'vue'
import { useNotification } from '@/composables/useNotification'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextType } from '@/composables/fieldContext/types'

export interface UseFieldContextManagerOptions {
  getFieldContext: (fieldKey: GlobalFieldKey<GlobalEntityKey>) => FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>> | undefined
  fieldsByLocation: ComputedRef<{
    directInline: GlobalFieldKey<GlobalEntityKey>[]
    directStacked: GlobalFieldKey<GlobalEntityKey>[]
    subPanels: {
      parts: GlobalFieldKey<GlobalEntityKey>[]
      relationships: GlobalFieldKey<GlobalEntityKey>[]
      annotations: GlobalFieldKey<GlobalEntityKey>[]
      events: GlobalFieldKey<GlobalEntityKey>[]
    }
  }>
  isMetadataLoading: ComputedRef<boolean>
  isMetadataReady: ComputedRef<boolean>
  fieldsNeedingContexts: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
}

export interface UseFieldContextManagerReturn {
  getFieldContext: (fieldKey: GlobalFieldKey<GlobalEntityKey>) => FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>> | undefined
  fieldsMissingContexts: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
}

export function useFieldContextManager(
  options: UseFieldContextManagerOptions
): UseFieldContextManagerReturn {
  const {
    getFieldContext: originalGetFieldContext,
    fieldsByLocation,
    isMetadataLoading,
    isMetadataReady,
    fieldsNeedingContexts,
  } = options

  const { warning: showWarning } = useNotification()

  /**
   * LEARNING: Wrapped getFieldContext with warnings for missing contexts
   * WHY: Fail visibly - warn when fields don't have contexts instead of silently hiding them
   * PATTERN: Wrap original function to add error handling and notifications
   */
  function getFieldContext(fieldKey: GlobalFieldKey<GlobalEntityKey>): FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>> | undefined {
    const context = originalGetFieldContext(fieldKey)

    const isPending =
      isMetadataLoading.value ||
      fieldsNeedingContexts.value.includes(fieldKey)

    // PATTERN: Gate warnings on isMetadataReady and !isPending
    if (!context && !isPending && isMetadataReady.value) {
      showWarning(`Field "${String(fieldKey)}" is missing configuration. Check /admin-input-metadata or /admin-relationship-metadata.`, 6000)
    }

    return context
  }

  /**
   * LEARNING: Track fields missing contexts for UI display
   * WHY: Show which fields are missing contexts in the UI
   * PATTERN: Computed property that filters fields by location and missing contexts
   */
  const fieldsMissingContexts = computed(() => {
    const locations = fieldsByLocation.value
    const allCategorizedFields = [
      ...locations.directInline,
      ...locations.directStacked,
      ...locations.subPanels.parts,
      ...locations.subPanels.relationships,
      ...locations.subPanels.annotations
    ]
    
    return allCategorizedFields.filter(fieldKey => !getFieldContext(fieldKey))
  })

  return {
    getFieldContext,
    fieldsMissingContexts,
  }
}
