/**
 * WHY: Component-logic audit - move .map() out of PropertyConfirmationModal template.
 * Returns a computed label from an array of items with a name property.
 */
import { computed, type Ref } from 'vue'

export function usePropertyTypesLabel(
  selectedPropertyTypes: Ref<{ name: string }[]>
): { propertyTypesLabel: ReturnType<typeof computed<string>> } {
  const propertyTypesLabel = computed(() =>
    selectedPropertyTypes.value.map((pt) => pt.name).join(', ')
  )
  return { propertyTypesLabel }
}
