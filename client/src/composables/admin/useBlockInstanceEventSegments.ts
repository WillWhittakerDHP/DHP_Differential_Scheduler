/**
 * Event segments (eventInstance rows) scoped to one block instance — mirrors Instances-tab CRUD + drag.
 */
import {
  ref,
  computed,
  watch,
  onMounted,
  nextTick,
  type Ref,
  type ComponentPublicInstance,
} from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { toGlobalEntityId } from '@/utils/globalEntity'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import { useNotification } from '@/composables/useNotification'
import { EVENT_TEMPLATE_VARIABLES } from '@shared/constants/templateVariables'
import { templateFieldUnknownWarnings } from '@shared/utils/templateVariableWarnings'
import { useEntityDragHandlers } from '@/composables/admin/useEntityDragHandlers'
import { mountEventInstancesDragAndDrop } from '@/utils/admin/mountEventInstancesDragAndDrop'
import { createLogger } from '@/utils/logger'
import type { NewEventInstanceData } from '@/types/admin/instancesTabEventInstance'
import type { UseBlockInstanceEventSegmentsReturn } from '@/types/admin/blockInstanceEventSegments'

const logger = createLogger('useBlockInstanceEventSegments')

function segmentBelongsToBlockInstance(
  entity: GlobalEntity<'eventInstance'>,
  parentId: GlobalEntityId
): boolean {
  const p = entity.parentBlockInstanceId
  return p != null && String(p).trim() !== '' && String(p) === String(parentId)
}

export function useBlockInstanceEventSegments(
  blockInstanceIdProp: Ref<string>
): UseBlockInstanceEventSegmentsReturn {
  const { success } = useNotification()
  const blockInstanceId = computed((): GlobalEntityId => toGlobalEntityId(blockInstanceIdProp.value))

  const {
    entities: eventInstances,
    create: createEventInstance,
    patchOrderIndex: patchEventInstanceOrderIndex,
    remove: removeEventInstanceCrud,
  } = useEntityCrud('eventInstance')
  const { entities: eventShapes } = useEntityCrud('eventShape')

  const expandedInstances = ref<string[]>([])
  const isCreatingEventInstance = ref(false)
  const newEventInstanceData = ref<NewEventInstanceData | null>(null)
  const isCreatingEventInstanceLoading = ref(false)

  const newSegmentPanelValue = computed(
    (): string => `new-segment-${String(blockInstanceId.value)}`
  )

  const isPanelExpanded = (id: string): boolean => expandedInstances.value.includes(id)

  const templateWarnings = computed(() => {
    const data = newEventInstanceData.value
    if (!data) {
      return { titleTemplate: [] as string[], descriptionTemplate: [] as string[], locationTemplate: [] as string[] }
    }
    return {
      titleTemplate: templateFieldUnknownWarnings(data.titleTemplate),
      descriptionTemplate: templateFieldUnknownWarnings(data.descriptionTemplate),
      locationTemplate: templateFieldUnknownWarnings(data.locationTemplate),
    }
  })

  const filteredEventInstances = computed((): GlobalEntity<'eventInstance'>[] => {
    const pid = blockInstanceId.value
    return [...eventInstances.value]
      .filter((e) => segmentBelongsToBlockInstance(e, pid))
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
  })

  const eventInstancesList = ref<GlobalEntity<'eventInstance'>[]>([])
  const eventInstanceIds = ref<string[]>([])
  const eventInstancesContainer = ref<HTMLElement | null>(null)
  const eventInstancesPanelsContainer = ref<ComponentPublicInstance | HTMLElement | null>(null)

  const eventInstancesDragHandlers = useEntityDragHandlers({
    entityIds: eventInstanceIds,
    entityList: eventInstancesList,
    filteredEntities: filteredEventInstances,
    patchOrderIndex: async (updates) => {
      await patchEventInstanceOrderIndex(updates)
    },
  })

  watch(
    filteredEventInstances,
    () => {
      eventInstancesDragHandlers.syncArrays()
    },
    { immediate: true }
  )

  onMounted(() => {
    void nextTick(() => {
      mountEventInstancesDragAndDrop({
        panelsContainerRef: eventInstancesPanelsContainer,
        eventInstanceIds,
        onDragEnd: () => eventInstancesDragHandlers.handleDragEnd(),
        logger,
      })
    })
  })

  const eventInstancesDisplay = computed((): GlobalEntity<'eventInstance'>[] => {
    const list = eventInstancesList.value
    const filtered = filteredEventInstances.value
    return list.length > 0 ? list : filtered
  })

  const hasEventInstances = computed(() => filteredEventInstances.value.length > 0)
  const isLoadingEventInstances = computed(() => false)

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
    newEventInstanceData.value = {
      eventShapeRef: shapes[0].id,
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
      await removeEventInstanceCrud(toGlobalEntityId(id))
      success('Segment deleted')
      expandedInstances.value = expandedInstances.value.filter((panelId) => panelId !== id)
    } catch (error) {
      logger.error('Failed to delete event segment', { error, id })
    }
  }

  function bindEventInstancesContainer(el: unknown): void {
    eventInstancesContainer.value = (el as HTMLElement | null) ?? null
  }

  function bindEventInstancesPanelsContainer(el: unknown): void {
    if (el == null) {
      return
    }
    eventInstancesPanelsContainer.value = el as ComponentPublicInstance | HTMLElement
  }

  return {
    eventShapes,
    eventInstancesDisplay,
    eventInstancesList,
    eventInstancesContainer,
    eventInstancesPanelsContainer,
    expandedInstances,
    isPanelExpanded,
    isCreatingEventInstance,
    newEventInstanceData,
    isCreatingEventInstanceLoading,
    templateWarnings,
    templateVariables: EVENT_TEMPLATE_VARIABLES,
    canSubmitNewEventInstance,
    newSegmentPanelValue,
    isLoadingEventInstances,
    hasEventInstances,
    openCreateEventInstanceForm,
    handleEventInstanceCreate,
    handleEventInstanceCancelled,
    handleDeleteEventInstance,
    bindEventInstancesContainer,
    bindEventInstancesPanelsContainer,
  }
}
