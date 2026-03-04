/**
 * WHY: Prop-based ctx reduces provide/inject depth; inject removed to satisfy bidirectional-data-channel.
 */
import { computed } from 'vue'
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

/** Requires ctx param (prop from parent); no inject to avoid provide-inject-depth and bidirectional-data-channel. */
export function useEventInstancesSection(ctx: InstancesTabContext): UseEventInstancesSectionReturn {

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
