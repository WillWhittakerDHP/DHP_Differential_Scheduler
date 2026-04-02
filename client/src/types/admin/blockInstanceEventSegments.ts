import type { ComputedRef, Ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { NewEventInstanceData } from '@/types/admin/instancesTabEventInstance'

/** Public contract for {@link useBlockInstanceEventSegments}. */
export interface UseBlockInstanceEventSegmentsReturn {
  eventShapes: ComputedRef<GlobalEntity<'eventShape'>[]>
  eventInstancesDisplay: ComputedRef<GlobalEntity<'eventInstance'>[]>
  eventInstancesList: Ref<GlobalEntity<'eventInstance'>[]>
  eventInstancesContainer: Ref<HTMLElement | null>
  eventInstancesPanelsContainer: Ref<ComponentPublicInstance | HTMLElement | null>
  expandedInstances: Ref<string[]>
  isPanelExpanded: (id: string) => boolean
  isCreatingEventInstance: Ref<boolean>
  newEventInstanceData: Ref<NewEventInstanceData | null>
  isCreatingEventInstanceLoading: Ref<boolean>
  templateWarnings: ComputedRef<{
    titleTemplate: string[]
    descriptionTemplate: string[]
    locationTemplate: string[]
  }>
  templateVariables: ReadonlyArray<{ name: string; description: string; example: string }>
  canSubmitNewEventInstance: ComputedRef<boolean>
  newSegmentPanelValue: ComputedRef<string>
  isLoadingEventInstances: ComputedRef<boolean>
  hasEventInstances: ComputedRef<boolean>
  openCreateEventInstanceForm: () => void
  handleEventInstanceCreate: () => Promise<void>
  handleEventInstanceCancelled: () => void
  handleDeleteEventInstance: (id: string) => Promise<void>
  bindEventInstancesContainer: (el: unknown) => void
  bindEventInstancesPanelsContainer: (el: unknown) => void
}
