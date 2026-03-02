/**
 * WHY: Keeps EventInstancesSection.vue thin; moves display computeds and toggle out of SFC.
 */
import { computed, inject } from 'vue'
import { instancesTabContextKey } from '@/composables/admin/injectionKeys'
import type { InstancesTabContext } from '@/composables/admin/injectionKeys'
import type { ComputedRef } from 'vue'
import type { GlobalEntity } from '@/types/entities'

export interface UseEventInstancesSectionReturn {
  ctx: InstancesTabContext
  expandedInstances: InstancesTabContext['expandedInstances']
  eventInstancesDisplay: ComputedRef<GlobalEntity<'eventInstance'>[]>
  eventShapesList: ComputedRef<GlobalEntity<'eventShape'>[]>
  hasEventInstances: ComputedRef<boolean>
  isLoading: ComputedRef<boolean>
  templateWarningsUnwrapped: ComputedRef<{ titleTemplate: string[]; descriptionTemplate: string[]; locationTemplate: string[] }>
  toggleEventInstanceMetadata: () => void
}

export function useEventInstancesSection(): UseEventInstancesSectionReturn {
  const injected = inject(instancesTabContextKey)
  if (!injected) throw new Error('EventInstancesSection must be used inside InstancesTab')
  const ctx = injected as InstancesTabContext

  const expandedInstances = ctx.expandedInstances

  const eventInstancesDisplay = computed(() => {
    const list = ctx.eventInstancesList.value
    const filtered = ctx.filteredEventInstances.value
    return list.length > 0 ? list : filtered
  })
  const eventShapesList = computed(() => ctx.eventShapes.value)
  const hasEventInstances = computed(() => {
    const arr = ctx.eventInstances.value
    return Array.isArray(arr) && arr.length > 0
  })
  const isLoading = computed(() => ctx.isLoadingEventInstances.value)
  const templateWarningsUnwrapped = computed(() => ctx.templateWarnings.value)

  function toggleEventInstanceMetadata(): void {
    ctx.eventInstanceMetadataModalOpen.value = !ctx.eventInstanceMetadataModalOpen.value
  }

  return {
    ctx,
    expandedInstances,
    eventInstancesDisplay,
    eventShapesList,
    hasEventInstances,
    isLoading,
    templateWarningsUnwrapped,
    toggleEventInstanceMetadata,
  }
}
