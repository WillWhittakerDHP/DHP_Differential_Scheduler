/**
 * useFieldRendererComponent Composable
 * 
 * LEARNING: Extracts component rendering logic from FieldRenderer component
 * WHY: Moves component type determination and validation logic out of component into reusable composable
 * PATTERN: Composable that determines which component to render and validates component existence
 */

import { computed, type Component, type ComputedRef } from 'vue'
import type { FieldComponent } from '@/utils/forms/fieldComponentDispatcher'

export interface UseFieldRendererComponentOptions {
  /**
   * Field component type from useFieldComponent composable
   */
  componentType: { value: FieldComponent }
  
  /**
   * Component map for dynamic rendering
   */
  componentMap: Record<FieldComponent['type'], Component | null>
  
  /**
   * Whether field context exists (can be reactive)
   */
  hasFieldContext: ComputedRef<boolean> | boolean
}

export interface UseFieldRendererComponentReturn {
  /**
   * Component to render (or null if invalid)
   */
  componentToRender: ComputedRef<Component | null>
  
  /**
   * Whether component exists in map
   */
  hasValidComponent: ComputedRef<boolean>
  
  /**
   * Whether error UI should show
   */
  shouldShowError: ComputedRef<boolean>
}

/**
 * LEARNING: Field renderer component composable
 * WHY: Extracts component rendering logic from component to composable
 * PATTERN: Composable that determines component to render and validates it
 */
export function useFieldRendererComponent(
  options: UseFieldRendererComponentOptions
): UseFieldRendererComponentReturn {
  const { componentType, componentMap, hasFieldContext } = options

  /**
   * LEARNING: Normalize hasFieldContext to computed for reactivity
   * WHY: Accepts both boolean and ComputedRef<boolean> for flexibility
   * PATTERN: Convert to computed if needed, use .value to access boolean value
   */
  const hasFieldContextRef = typeof hasFieldContext === 'boolean' 
    ? computed(() => hasFieldContext)
    : hasFieldContext

  /**
   * LEARNING: Computed to get the component from map
   * WHY: Ensures reactive component lookup for :is binding
   * PATTERN: Computed property that returns component or null
   */
  const componentToRender = computed(() => {
    if (!hasFieldContextRef.value) {
      return null
    }
    const type = componentType.value
    return componentMap[type.type] || null
  })

  /**
   * LEARNING: Computed to determine if component exists in map
   * WHY: Single source of truth for component map lookup, used in template and watch
   * PATTERN: Computed property that checks component map lookup
   */
  const hasValidComponent = computed(() => {
    return !!componentToRender.value
  })

  /**
   * LEARNING: Computed to determine if error UI should show
   * WHY: Single source of truth for when error UI renders, can be watched
   * PATTERN: Computed property that checks component map lookup - matches template condition exactly
   */
  const shouldShowError = computed(() => {
    if (!hasFieldContextRef.value) {
      return false
    }
    // LEARNING: Use same computed as template
    // WHY: Ensures watch detects same condition that template uses
    // PATTERN: Negate hasValidComponent to match template v-else
    return !hasValidComponent.value
  })

  return {
    componentToRender,
    hasValidComponent,
    shouldShowError
  }
}
