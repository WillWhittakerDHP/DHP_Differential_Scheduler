/**
 * PATTERN: Event instance form state, template validation, and create/cancel/delete handlers.
 * WHY: Keeps InstancesTab.vue under vue-architecture limits (script size, function count).
 */
import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { useNotification } from '@/composables/useNotification'
import { EVENT_TEMPLATE_VARIABLES } from '@shared/constants/templateVariables'
import type { UseInstancesTabEventInstanceParams, NewEventInstanceData } from '@/types/admin/instancesTabEventInstance'


/** Re-export for consumers that expect the legacy name. */
export const EVENT_INSTANCE_TEMPLATE_VARIABLES = EVENT_TEMPLATE_VARIABLES

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

const knownVariableNames = new Set<string>(EVENT_TEMPLATE_VARIABLES.map(v => v.name))

function findUnknownVariables(template: string): string[] {
  const varPattern = /\{(\w+)\}/g
  const unknown: string[] = []
  let match: RegExpExecArray | null
  while ((match = varPattern.exec(template)) !== null) {
    const name = match[1]
    if (!knownVariableNames.has(name) && !unknown.includes(name)) {
      unknown.push(match[1])
    }
  }
  return unknown
}

export function useInstancesTabEventInstance(params: UseInstancesTabEventInstanceParams): UseInstancesTabEventInstanceReturn {
  const { expandedInstances, eventShapes, createEventInstance, logger } = params
  const { success } = useNotification()

  const isCreatingEventInstance = ref(false)
  const newEventInstanceData = ref<NewEventInstanceData | null>(null)
  const isCreatingEventInstanceLoading = ref(false)

  const templateWarnings = computed(() => {
    const data = newEventInstanceData.value
    if (!data) return { titleTemplate: [], descriptionTemplate: [], locationTemplate: [] }
    const warn = (field: string): string[] => {
      const unknown = findUnknownVariables(field)
      return unknown.length > 0 ? [`Unknown variable(s): ${unknown.map(v => `{${v}}`).join(', ')}`] : []
    }
    return {
      titleTemplate: warn(data.titleTemplate),
      descriptionTemplate: warn(data.descriptionTemplate),
      locationTemplate: warn(data.locationTemplate),
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
        active: true,
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

  const handleDeleteEventInstance = async (_id: string): Promise<void> => {
  }

  return {
    templateVariables: EVENT_INSTANCE_TEMPLATE_VARIABLES,
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
