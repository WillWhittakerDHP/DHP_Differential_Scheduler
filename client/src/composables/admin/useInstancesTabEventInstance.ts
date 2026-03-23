/**
 * PATTERN: Event instance form state, template validation, and create/cancel/delete handlers.
 * WHY: Keeps InstancesTab.vue under vue-architecture limits (script size, function count).
 */
import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { useNotification } from '@/composables/useNotification'
import { EVENT_TEMPLATE_VARIABLES } from '@shared/constants/templateVariables'
import { templateFieldUnknownWarnings } from '@shared/utils/templateVariableWarnings'
import type { UseInstancesTabEventInstanceParams, NewEventInstanceData } from '@/types/admin/instancesTabEventInstance'


export interface UseInstancesTabEventInstanceReturn {
  templateVariables: typeof EVENT_TEMPLATE_VARIABLES
  newEventInstanceData: Ref<NewEventInstanceData | null>
  isCreatingEventInstance: Ref<boolean>
  isCreatingEventInstanceLoading: Ref<boolean>
  templateWarnings: ComputedRef<{ titleTemplate: string[]; descriptionTemplate: string[]; locationTemplate: string[] }>
  openCreateEventInstanceForm: () => void
  handleEventInstanceCreate: () => Promise<void>
  handleEventInstanceCancelled: () => void
  handleDeleteEventInstance: (id: string) => Promise<void>
}

export function useInstancesTabEventInstance(params: UseInstancesTabEventInstanceParams): UseInstancesTabEventInstanceReturn {
  const { expandedInstances, eventShapes, createEventInstance, removeEventInstance, logger } = params
  const { success } = useNotification()

  const isCreatingEventInstance = ref(false)
  const newEventInstanceData = ref<NewEventInstanceData | null>(null)
  const isCreatingEventInstanceLoading = ref(false)

  const templateWarnings = computed(() => {
    const data = newEventInstanceData.value
    if (!data) return { titleTemplate: [], descriptionTemplate: [], locationTemplate: [] }
    return {
      titleTemplate: templateFieldUnknownWarnings(data.titleTemplate),
      descriptionTemplate: templateFieldUnknownWarnings(data.descriptionTemplate),
      locationTemplate: templateFieldUnknownWarnings(data.locationTemplate),
    }
  })

  const openCreateEventInstanceForm = (): void => {
    if (eventShapes.value.length === 0) {
      alert('Please create an event shape first')
      return
    }
    newEventInstanceData.value = {
      eventShapeRef: eventShapes.value[0].id,
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
    expandedInstances.value = ['new-eventInstance', ...expandedInstances.value]
  }

  const handleEventInstanceCreate = async (): Promise<void> => {
    if (!newEventInstanceData.value || !newEventInstanceData.value.name.trim()) return
    isCreatingEventInstanceLoading.value = true
    try {
      await createEventInstance({
        eventShapeRef: newEventInstanceData.value.eventShapeRef,
        name: newEventInstanceData.value.name.trim(),
        titleTemplate: newEventInstanceData.value.titleTemplate.trim() || null,
        descriptionTemplate: newEventInstanceData.value.descriptionTemplate.trim() || null,
        locationTemplate: newEventInstanceData.value.locationTemplate.trim() || null,
        visibility: newEventInstanceData.value.visibility,
        transparency: newEventInstanceData.value.transparency,
        guestsCanModify: newEventInstanceData.value.guestsCanModify,
        guestsCanInviteOthers: newEventInstanceData.value.guestsCanInviteOthers,
        guestsCanSeeOtherGuests: newEventInstanceData.value.guestsCanSeeOtherGuests,
        addConferenceLink: newEventInstanceData.value.addConferenceLink,
        sendUpdates: newEventInstanceData.value.sendUpdates,
        colorId: newEventInstanceData.value.colorId,
        status: newEventInstanceData.value.status,
        reminderOverrides: null,
        orderIndex: 0,
        active: newEventInstanceData.value.active,
        entityKey: 'eventInstance' as const,
      })
      success('Event instance created successfully')
      isCreatingEventInstance.value = false
      newEventInstanceData.value = null
      expandedInstances.value = expandedInstances.value.filter(id => id !== 'new-eventInstance')
    } catch (error) {
      logger.error('Failed to create event instance', { error, data: newEventInstanceData.value })
    } finally {
      isCreatingEventInstanceLoading.value = false
    }
  }

  const handleEventInstanceCancelled = (): void => {
    isCreatingEventInstance.value = false
    newEventInstanceData.value = null
    expandedInstances.value = expandedInstances.value.filter(id => id !== 'new-eventInstance')
  }

  const handleDeleteEventInstance = async (id: string): Promise<void> => {
    try {
      await removeEventInstance(id)
      success('Event instance deleted')
      expandedInstances.value = expandedInstances.value.filter(panelId => panelId !== id)
    } catch (error) {
      logger.error('Failed to delete event instance', { error, id })
    }
  }

  return {
    templateVariables: EVENT_TEMPLATE_VARIABLES,
    newEventInstanceData,
    isCreatingEventInstance,
    isCreatingEventInstanceLoading,
    templateWarnings,
    openCreateEventInstanceForm,
    handleEventInstanceCreate,
    handleEventInstanceCancelled,
    handleDeleteEventInstance,
  }
}
