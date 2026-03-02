/**
 * WHY: useFieldRendererComponent Composable

WHY: Moves component type determin...
 */
import { computed } from 'vue'
import type { UseFieldRendererComponentOptions, UseFieldRendererComponentReturn } from '@/types/admin/fieldRendererComponent'

export function useFieldRendererComponent(
  options: UseFieldRendererComponentOptions
): UseFieldRendererComponentReturn {
  const { componentType, componentMap, hasFieldContext } = options

  /**
   */
  const hasFieldContextRef = typeof hasFieldContext === 'boolean' 
    ? computed(() => hasFieldContext)
    : hasFieldContext

  const componentToRender = computed(() => {
    if (!hasFieldContextRef.value) {
      return null
    }
    const type = componentType.value
    return componentMap[type.type] || null
  })

  const hasValidComponent = computed(() => {
    return !!componentToRender.value
  })

  const shouldShowError = computed(() => {
    if (!hasFieldContextRef.value) {
      return false
    }
    // PATTERN: Negate hasValidComponent to match template v-else
    return !hasValidComponent.value
  })

  return {
    componentToRender,
    hasValidComponent,
    shouldShowError
  }
}
