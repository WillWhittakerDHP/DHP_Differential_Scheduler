/**
 * EventInstancesSection receives instancesTabContext from InstancesTab and passes it here.
 */
import {
  computed,
  reactive,
  type ComputedRef,
  type ComponentPublicInstance,
  type UnwrapNestedRefs,
} from 'vue'
import type { InstancesTabContext } from '@/types/admin/adminInjectionKeys'
import type { GlobalEntity } from '@/types/entities'

/** Ref bundle passed into `reactive()`; public shape after reactive is `EventInstancesSectionDisplayReactive`. */
export type EventInstancesSectionDisplayRefs = {
  eventInstancesDisplay: ComputedRef<GlobalEntity<'eventInstance'>[]>
  eventShapesList: ComputedRef<GlobalEntity<'eventShape'>[]>
  hasEventInstances: ComputedRef<boolean>
  isLoading: ComputedRef<boolean>
  templateWarningsUnwrapped: ComputedRef<{
    titleTemplate: string[]
    descriptionTemplate: string[]
    locationTemplate: string[]
  }>
}

export type EventInstancesSectionDisplayReactive = UnwrapNestedRefs<EventInstancesSectionDisplayRefs>

export interface EventInstancesSectionActions {
  toggleEventInstanceMetadata: () => void
  bindEventInstancesContainer: (el: unknown) => void
  bindEventInstancesPanelsContainer: (el: unknown) => void
}

export interface UseEventInstancesSectionReturn {
  ctx: InstancesTabContext
  expandedInstances: InstancesTabContext['expandedInstances']
  display: EventInstancesSectionDisplayReactive
  actions: EventInstancesSectionActions
  canSubmitNewEventInstance: ComputedRef<boolean>
}

export function useEventInstancesSection(context: InstancesTabContext): UseEventInstancesSectionReturn {
  const resolvedCtx: InstancesTabContext = context

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

  const canSubmitNewEventInstance = computed(() => {
    const d = resolvedCtx.newEventInstanceData.value
    return typeof d?.name === 'string' && d.name.trim() !== ''
  })

  function bindEventInstancesContainer(el: unknown): void {
    if (!resolvedCtx.eventInstancesContainer) return
    resolvedCtx.eventInstancesContainer.value = (el as HTMLElement | null) ?? null
  }

  function bindEventInstancesPanelsContainer(el: unknown): void {
    if (!resolvedCtx.eventInstancesPanelsContainer || el == null) return
    const holder = resolvedCtx.eventInstancesPanelsContainer as { value: ComponentPublicInstance | HTMLElement | null }
    holder.value = el as ComponentPublicInstance | HTMLElement
  }

  const display = reactive<EventInstancesSectionDisplayRefs>({
    eventInstancesDisplay,
    eventShapesList,
    hasEventInstances,
    isLoading,
    templateWarningsUnwrapped,
  })

  return {
    ctx: resolvedCtx,
    expandedInstances,
    display,
    actions: {
      toggleEventInstanceMetadata,
      bindEventInstancesContainer,
      bindEventInstancesPanelsContainer,
    },
    canSubmitNewEventInstance,
  }
}
