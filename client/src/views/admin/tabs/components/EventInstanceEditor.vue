<!-- PATTERN: Edit existing event instance — draft resets when panel opens; save uses entity CRUD update. -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { NewEventInstanceData } from '@/types/admin/instancesTabEventInstance'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import { toGlobalEntityId } from '@/utils/globalEntity'
import { useNotification } from '@/composables/useNotification'
import { createLogger } from '@/utils/logger'
import EventInstanceBuilderBody from './EventInstanceBuilderBody.vue'
import { nilToEmptyString } from '@shared/utils/nilDefaults'

const logger = createLogger('EventInstanceEditor')

const props = defineProps<{
  entity: GlobalEntity<'eventInstance'>
  expanded: boolean
  eventShapesList: GlobalEntity<'eventShape'>[]
}>()

const emit = defineEmits<{
  delete: [id: string]
}>()

function cloneFromEntity(e: GlobalEntity<'eventInstance'>): NewEventInstanceData {
  return {
    id: String(e.id),
    eventShapeRef: String(e.eventShapeRef),
    name: nilToEmptyString(e.name),
    titleTemplate: nilToEmptyString(e.titleTemplate),
    descriptionTemplate: nilToEmptyString(e.descriptionTemplate),
    locationTemplate: nilToEmptyString(e.locationTemplate),
    visibility: e.visibility,
    transparency: e.transparency,
    guestsCanModify: e.guestsCanModify,
    guestsCanInviteOthers: e.guestsCanInviteOthers,
    guestsCanSeeOtherGuests: e.guestsCanSeeOtherGuests,
    addConferenceLink: e.addConferenceLink,
    sendUpdates: e.sendUpdates,
    colorId: e.colorId,
    status: e.status,
    active: e.active,
  }
}

const draft = ref<NewEventInstanceData>(cloneFromEntity(props.entity))

watch(
  () => props.expanded,
  (ex) => {
    if (ex) draft.value = cloneFromEntity(props.entity)
  }
)

watch(
  () => props.entity.id,
  () => {
    draft.value = cloneFromEntity(props.entity)
  }
)

const { update } = useEntityCrud('eventInstance')
const { success, error: notifyError } = useNotification()
const saving = ref(false)
const deleteDialogOpen = ref(false)

async function handleSave(): Promise<void> {
  if (!draft.value.name.trim()) {
    notifyError('Name is required')
    return
  }
  saving.value = true
  try {
    await update(
      {
        eventShapeRef: draft.value.eventShapeRef,
        name: draft.value.name.trim(),
        titleTemplate: draft.value.titleTemplate.trim() || null,
        descriptionTemplate: draft.value.descriptionTemplate.trim() || null,
        locationTemplate: draft.value.locationTemplate.trim() || null,
        visibility: draft.value.visibility,
        transparency: draft.value.transparency,
        guestsCanModify: draft.value.guestsCanModify,
        guestsCanInviteOthers: draft.value.guestsCanInviteOthers,
        guestsCanSeeOtherGuests: draft.value.guestsCanSeeOtherGuests,
        addConferenceLink: draft.value.addConferenceLink,
        sendUpdates: draft.value.sendUpdates,
        colorId: draft.value.colorId,
        status: draft.value.status,
        active: draft.value.active,
      },
      toGlobalEntityId(props.entity.id)
    )
    success('Event instance saved')
  } catch (err) {
    notifyError('Failed to save event instance')
    logger.error('Failed to save event instance', { err, entityId: props.entity.id })
  } finally {
    saving.value = false
  }
}

function confirmDelete(): void {
  deleteDialogOpen.value = true
}

function executeDelete(): void {
  emit('delete', props.entity.id)
  deleteDialogOpen.value = false
}
</script>

<template>
  <div class="event-instance-editor pa-2">
    <EventInstanceBuilderBody v-model="draft" :event-shapes-list="eventShapesList" />

    <div class="d-flex flex-wrap gap-2 justify-end mt-4">
      <VBtn
        color="error"
        variant="outlined"
        prepend-icon="tabler-trash"
        @click="confirmDelete"
      >
        Delete
      </VBtn>
      <VBtn
        color="primary"
        :loading="saving"
        :disabled="!draft.name.trim()"
        prepend-icon="tabler-device-floppy"
        @click="handleSave"
      >
        Save
      </VBtn>
    </div>

    <VDialog v-model="deleteDialogOpen" max-width="420">
      <VCard>
        <VCardTitle class="text-headline-small">Delete event instance?</VCardTitle>
        <VCardText>
          This removes "{{ entity.name }}" and cannot be undone.
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="outlined" @click="deleteDialogOpen = false">Cancel</VBtn>
          <VBtn color="error" @click="executeDelete">Delete</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
