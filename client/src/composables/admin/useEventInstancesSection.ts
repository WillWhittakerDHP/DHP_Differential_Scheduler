/**
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

export function useEventInstancesSection(context?: InstancesTabContext): UseEventInstancesSectionReturn {
  let ctx: InstancesTabContext | undefined = context ?? (inject(instancesTabContextKey) as InstancesTabContext | undefined)
  if (!ctx) throw new Error('EventInstancesSection must be used inside InstancesTab or receive instancesTabContext prop')
  const resolvedCtx: InstancesTabContext = ctx as InstancesTabContext

  const expandedInstances = resolvedCtx.expandedInstances

  const eventInstancesDisplay = computed(() => {
    const list = resolvedCtx.eventInstancesList.value
    const filtered = resolvedCtx.filteredEventInstances.value
    return list.length > 0 ? list : filtered
  })
  const eventShapesList = computed(() => resolvedCtx.eventShapes.value)
  const hasEventInstances = computed(() => {
    const arr = resolvedCtx.eventInstances.value
    return Array.isArray(arr) && arr.length > 0
  })
  const isLoading = computed(() => resolvedCtx.isLoadingEventInstances.value)
  const templateWarningsUnwrapped = computed(() => resolvedCtx.templateWarnings.value)

  function toggleEventInstanceMetadata(): void {
    resolvedCtx.eventInstanceMetadataModalOpen.value = !resolvedCtx.eventInstanceMetadataModalOpen.value
  }

  return {
    ctx: resolvedCtx,
    expandedInstances,
    eventInstancesDisplay,
    eventShapesList,
    hasEventInstances,
    isLoading,
    templateWarningsUnwrapped,
    toggleEventInstanceMetadata,
  }
}
