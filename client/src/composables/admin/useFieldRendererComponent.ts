/**
 * WHY: useFieldRendererComponent Composable

WHY: Moves component type determin...
 */
import { computed, type Component, type ComputedRef } from 'vue'
import type { FieldComponent } from '@/utils/forms/fieldComponentDispatcher'

export interface UseFieldRendererComponentOptions {
  componentType: { value: FieldComponent }
  
  componentMap: Record<FieldComponent['type'], Component | null>
  
  hasFieldContext: ComputedRef<boolean> | boolean
}

export interface UseFieldRendererComponentReturn {
  componentToRender: ComputedRef<Component | null>
  
  hasValidComponent: ComputedRef<boolean>
  
  shouldShowError: ComputedRef<boolean>
}

/**
 * WHY: Field renderer component composable
WHY: Extracts component rendering lo...
 */
export function useFieldRendererComponent(
  options: UseFieldRendererComponentOptions
): UseFieldRendererComponentReturn {
  const { componentType, componentMap, hasFieldContext } = options

  /**
   * LEARNING: Normalize hasFieldContext to computed for reactivity
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
    // LEARNING: Use same computed as template
    // PATTERN: Negate hasValidComponent to match template v-else
    return !hasValidComponent.value
  })

  return {
    componentToRender,
    hasValidComponent,
    shouldShowError
  }
}
