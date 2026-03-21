/**
 */
import type { Ref, ComputedRef } from 'vue'
import { ref, watch } from 'vue'
import { measureMaxTextWidth } from '@/utils/dom/textMeasure'

const MIN_PROPERTY_TYPE_WIDTH_PX = 160
const SELECT_PADDING_PX = 56

/** Minimal shape needed for label extraction. */
export interface PropertyTypeLike {
  name?: string | null
}

export interface UsePropertyTypeSelectWidthParams {
  /** List of property types (or any items with name); reactive. */
  availablePropertyTypes: Ref<PropertyTypeLike[]> | ComputedRef<PropertyTypeLike[]>
}

export interface UsePropertyTypeSelectWidthReturn {
  /** Width in px for the select (min MIN_PROPERTY_TYPE_WIDTH_PX, or measured from labels). */
  propertyTypeSelectWidthPx: Ref<number>
}

/**
 * Watches availablePropertyTypes, computes labels with .map/.filter, measures text width, and updates a ref.
 * Keeps watch + map in composable for component-logic audit.
 */
export function usePropertyTypeSelectWidth(
  params: UsePropertyTypeSelectWidthParams
): UsePropertyTypeSelectWidthReturn {
  const propertyTypeSelectWidthPx = ref(MIN_PROPERTY_TYPE_WIDTH_PX)

  watch(
    () => params.availablePropertyTypes.value,
    (list) => {
      const labels = list.map((i) => i.name).filter(Boolean) as string[]
      if (labels.length === 0) {
        propertyTypeSelectWidthPx.value = MIN_PROPERTY_TYPE_WIDTH_PX
        return
      }
      const textWidth = measureMaxTextWidth(labels)
      propertyTypeSelectWidthPx.value = Math.max(
        MIN_PROPERTY_TYPE_WIDTH_PX,
        textWidth + SELECT_PADDING_PX
      )
    },
    { immediate: true }
  )

  return { propertyTypeSelectWidthPx }
}
