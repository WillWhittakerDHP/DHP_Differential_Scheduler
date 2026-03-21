import type { Component, ComputedRef } from 'vue'
import type { FieldComponent } from '@/types/forms/fieldComponent'

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
