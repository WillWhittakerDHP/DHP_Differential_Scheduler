import type { ComputedRef, Ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { OrderIndexUpdate } from '@/types/entityCrud/entityCrudTypes'
import type { NewEventInstanceData } from '@/types/admin/instancesTabEventInstance'

/** {@link useBlockInstanceEventInstancesForParent} */
export interface UseBlockInstanceEventInstancesForParentReturn {
  blockInstanceId: ComputedRef<GlobalEntityId>
  filteredEventInstances: ComputedRef<GlobalEntity<'eventInstance'>[]>
  hasEventInstances: ComputedRef<boolean>
  isLoadingEventInstances: ComputedRef<boolean>
  createEventInstance: (
    entity: Partial<GlobalEntity<'eventInstance'>>
  ) => Promise<GlobalEntity<'eventInstance'>>
  patchEventInstanceOrderIndex: (updates: OrderIndexUpdate) => Promise<void>
  removeEventInstance: (id: GlobalEntityId) => Promise<{ deletedId: string }>
}

/** {@link useBlockInstanceEventSegmentDragOrder} */
export interface UseBlockInstanceEventSegmentDragOrderReturn {
  eventInstancesDisplay: ComputedRef<GlobalEntity<'eventInstance'>[]>
  eventInstancesList: Ref<GlobalEntity<'eventInstance'>[]>
  eventInstancesContainer: Ref<HTMLElement | null>
  eventInstancesPanelsContainer: Ref<ComponentPublicInstance | HTMLElement | null>
  bindEventInstancesContainer: (el: unknown) => void
  bindEventInstancesPanelsContainer: (el: unknown) => void
}

export interface BlockInstanceEventSegmentExpansionSlice {
  expandedInstances: Ref<string[]>
  isPanelExpanded: (id: string) => boolean
}

export interface BlockInstanceEventSegmentDraftSlice {
  isCreatingEventInstance: Ref<boolean>
  newEventInstanceData: Ref<NewEventInstanceData | null>
  isCreatingEventInstanceLoading: Ref<boolean>
  templateWarnings: ComputedRef<{
    titleTemplate: string[]
    descriptionTemplate: string[]
    locationTemplate: string[]
  }>
  canSubmitNewEventInstance: ComputedRef<boolean>
  newSegmentPanelValue: ComputedRef<string>
}

export interface BlockInstanceEventSegmentActionSlice {
  openCreateEventInstanceForm: () => void
  handleEventInstanceCreate: () => Promise<void>
  handleEventInstanceCancelled: () => void
  handleDeleteEventInstance: (id: string) => Promise<void>
}

/** {@link useBlockInstanceEventSegmentPanels} */
export interface UseBlockInstanceEventSegmentPanelsReturn {
  expansion: BlockInstanceEventSegmentExpansionSlice
  draft: BlockInstanceEventSegmentDraftSlice
  actions: BlockInstanceEventSegmentActionSlice
}
