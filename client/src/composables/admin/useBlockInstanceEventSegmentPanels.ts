/**
 * Expansion panels, new-segment draft, and create/delete actions for block-scoped event segments.
 */
import { ref, computed, type ComputedRef } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { toGlobalEntityId } from '@/utils/globalEntity'
import { useNotification } from '@/composables/useNotification'
import { templateFieldUnknownWarnings } from '@shared/utils/templateVariableWarnings'
import { createLogger } from '@/utils/logger'
import type { NewEventInstanceData } from '@/types/admin/instancesTabEventInstance'
import type { UseBlockInstanceEventSegmentPanelsReturn } from '@/types/admin/blockInstanceEventSegments'

const logger = createLogger('useBlockInstanceEventSegmentPanels')

export interface UseBlockInstanceEventSegmentPanelsParams {
  blockInstanceId: ComputedRef<GlobalEntityId>
  filteredEventInstances: ComputedRef<GlobalEntity<'eventInstance'>[]>
  eventShapes: ComputedRef<GlobalEntity<'eventShape'>[]>
  createEventInstance: (
    entity: Partial<GlobalEntity<'eventInstance'>>
  ) => Promise<GlobalEntity<'eventInstance'>>
  removeEventInstance: (id: GlobalEntityId) => Promise<{ deletedId: string }>
}

function emptyWarnings(): {
  titleTemplate: string[]
  descriptionTemplate: string[]
  locationTemplate: string[]
} {
  return { titleTemplate: [], descriptionTemplate: [], locationTemplate: [] }
}

function defaultNewSegmentDraft(firstShapeId: string): NewEventInstanceData {
  return {
    eventShapeRef: firstShapeId,
    name: '',
    titleTemplate: '',
    descriptionTemplate: '',
    locationTemplate: '',
    visibility: 'default',
    transparency: 'opaque',
    guestsCanModify: false,
    guestsCanInviteOthers: true,
    guestsCanSeeOtherGuests: true,
    addConferenceLink: false,
    sendUpdates: 'all',
    colorId: null,
    status: 'confirmed',
    active: true,
  }
}

export function useBlockInstanceEventSegmentPanels(
  params: UseBlockInstanceEventSegmentPanelsParams
): UseBlockInstanceEventSegmentPanelsReturn {
  const { success } = useNotification()
  const { blockInstanceId, filteredEventInstances, eventShapes, createEventInstance, removeEventInstance } =
    params

  const expandedInstances = ref<string[]>([])
  const isCreatingEventInstance = ref(false)
  const newEventInstanceData = ref<NewEventInstanceData | null>(null)
  const isCreatingEventInstanceLoading = ref(false)

  const newSegmentPanelValue = computed((): string => `new-segment-${String(blockInstanceId.value)}`)

  const isPanelExpanded = (id: string): boolean => expandedInstances.value.includes(id)

  const templateWarnings = computed(() => {
    const data = newEventInstanceData.value
    if (!data) {
      return emptyWarnings()
    }
    return {
      titleTemplate: templateFieldUnknownWarnings(data.titleTemplate),
      descriptionTemplate: templateFieldUnknownWarnings(data.descriptionTemplate),
      locationTemplate: templateFieldUnknownWarnings(data.locationTemplate),
    }
  })

  const canSubmitNewEventInstance = computed(() => {
    const d = newEventInstanceData.value
    return typeof d?.name === 'string' && d.name.trim() !== ''
  })

  const openCreateEventInstanceForm = (): void => {
    const shapes = eventShapes.value
    if (shapes.length === 0) {
      logger.warn('Cannot create segment: no event shapes configured')
      return
    }
    const panelKey = newSegmentPanelValue.value
    newEventInstanceData.value = defaultNewSegmentDraft(String(shapes[0].id))
    isCreatingEventInstance.value = true
    expandedInstances.value = [panelKey, ...expandedInstances.value.filter((k) => k !== panelKey)]
  }

  const handleEventInstanceCreate = async (): Promise<void> => {
    const data = newEventInstanceData.value
    if (!data || !data.name.trim()) {
      return
    }
    isCreatingEventInstanceLoading.value = true
    try {
      await createEventInstance({
        parentBlockInstanceId: String(blockInstanceId.value),
        eventShapeRef: data.eventShapeRef,
        name: data.name.trim(),
        titleTemplate: data.titleTemplate.trim() || null,
        descriptionTemplate: data.descriptionTemplate.trim() || null,
        locationTemplate: data.locationTemplate.trim() || null,
        visibility: data.visibility,
        transparency: data.transparency,
        guestsCanModify: data.guestsCanModify,
        guestsCanInviteOthers: data.guestsCanInviteOthers,
        guestsCanSeeOtherGuests: data.guestsCanSeeOtherGuests,
        addConferenceLink: data.addConferenceLink,
        sendUpdates: data.sendUpdates,
        colorId: data.colorId,
        status: data.status,
        reminderOverrides: null,
        orderIndex: filteredEventInstances.value.length,
        active: data.active,
        includeRescheduleLink: true,
        includeCancelLink: true,
        entityKey: 'eventInstance',
      })
      success('Segment created')
      isCreatingEventInstance.value = false
      newEventInstanceData.value = null
      const panelKey = newSegmentPanelValue.value
      expandedInstances.value = expandedInstances.value.filter((id) => id !== panelKey)
    } catch (error) {
      logger.error('Failed to create event segment', { error, blockInstanceId: blockInstanceId.value })
    } finally {
      isCreatingEventInstanceLoading.value = false
    }
  }

  const handleEventInstanceCancelled = (): void => {
    isCreatingEventInstance.value = false
    newEventInstanceData.value = null
    const panelKey = newSegmentPanelValue.value
    expandedInstances.value = expandedInstances.value.filter((id) => id !== panelKey)
  }

  const handleDeleteEventInstance = async (id: string): Promise<void> => {
    try {
      await removeEventInstance(toGlobalEntityId(id))
      success('Segment deleted')
      expandedInstances.value = expandedInstances.value.filter((panelId) => panelId !== id)
    } catch (error) {
      logger.error('Failed to delete event segment', { error, id })
    }
  }

  return {
    expansion: { expandedInstances, isPanelExpanded },
    draft: {
      isCreatingEventInstance,
      newEventInstanceData,
      isCreatingEventInstanceLoading,
      templateWarnings,
      canSubmitNewEventInstance,
      newSegmentPanelValue,
    },
    actions: {
      openCreateEventInstanceForm,
      handleEventInstanceCreate,
      handleEventInstanceCancelled,
      handleDeleteEventInstance,
    },
  }
}
