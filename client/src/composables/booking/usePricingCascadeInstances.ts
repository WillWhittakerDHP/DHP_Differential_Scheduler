
import { computed, type ComputedRef, type Ref } from 'vue'
import type { BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'

export interface UsePricingCascadeInstancesOptions {
  parentPartInstance: ComputedRef<BookingPartInstance | null> | Ref<BookingPartInstance | null>
  allPartInstances: ComputedRef<BookingPartInstance[]> | Ref<BookingPartInstance[]>
}

export interface UsePricingCascadeInstancesReturn {
  cascadePartInstanceIds: ComputedRef<string[]>
  cascadePartInstances: ComputedRef<BookingPartInstance[]>
  hasCascades: ComputedRef<boolean>
}

export function usePricingCascadeInstances(
  options: UsePricingCascadeInstancesOptions
): UsePricingCascadeInstancesReturn {
  const { parentPartInstance, allPartInstances } = options

  const cascadePartInstanceIds = computed((): string[] => {
    const parent = parentPartInstance.value
    if (!parent) return []
    const raw = parent.activePartIds
    return raw !== undefined && raw !== null && Array.isArray(raw) ? raw : []
  })

  const cascadePartInstances = computed((): BookingPartInstance[] => {
    const all = allPartInstances.value
    if (!all || all.length === 0) return []
    const ids = new Set(cascadePartInstanceIds.value)
    if (ids.size === 0) return []
    const byId = new Map(all.map((p) => [p.id, p]))
    return cascadePartInstanceIds.value
      .map((id) => byId.get(id))
      .filter((p): p is BookingPartInstance => p !== undefined)
  })

  const hasCascades = computed((): boolean => cascadePartInstances.value.length > 0)

  return {
    cascadePartInstanceIds,
    cascadePartInstances,
    hasCascades,
  }
}
