/**
 * PATTERN: Composable for managing field context access and tracking missing contex...
 */
import { computed } from 'vue'
import { useNotification } from '@/composables/useNotification'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import type { UseFieldContextManagerOptions, UseFieldContextManagerReturn } from '@/types/admin/fieldContextManager'


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

  function getFieldContext(fieldKey: GlobalFieldKey<GlobalEntityKey>): FieldContextTypeGrouped<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>> | undefined {
    const context = originalGetFieldContext(fieldKey)

    const isPending =
      isMetadataLoading.value ||
      fieldsNeedingContexts.value.includes(fieldKey)

    // PATTERN: Gate warnings on isMetadataReady and !isPending
    if (!context && !isPending && isMetadataReady.value) {
      showWarning(`Field "${String(fieldKey)}" is missing configuration. Check /admin-metadata.`, 6000)
    }

    return context
  }

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
