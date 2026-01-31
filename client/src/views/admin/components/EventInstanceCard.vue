<!--
  LEARNING: EventInstance Card Component
  WHY: Displays event instance with edit/delete functionality and template fields
  PATTERN: Card with inline editing for name and templates
-->
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { EventInstanceEntity } from '@/types/events'
import { useUpdateEventInstance, useDeleteEventInstance } from '@/composables/useEventInstances'
import { useEventShapes } from '@/composables/useEventShapes'
import { createLogger } from '@/utils/logger'

interface Props {
  eventInstance: EventInstance
}

const props = defineProps<Props>()

interface Emits {
  (e: 'delete', id: string): void
}

const emit = defineEmits<Emits>()

const isEditing = ref(false)
const editedName = ref(props.eventInstance.name)
const editedTitleTemplate = ref(props.eventInstance.titleTemplate ?? '')
const editedDescriptionTemplate = ref(props.eventInstance.descriptionTemplate ?? '')
const editedLocationTemplate = ref(props.eventInstance.locationTemplate ?? '')

const updateMutation = useUpdateEventInstance()
const deleteMutation = useDeleteEventInstance()
const { data: eventShapes } = useEventShapes()
const logger = createLogger('EventInstanceCard')

const eventShape = computed(() => {
  return eventShapes.value.find(es => es.id === props.eventInstance.eventShapeRef)
})

const handleEdit = () => {
  editedName.value = props.eventInstance.name
  editedTitleTemplate.value = props.eventInstance.titleTemplate ?? ''
  editedDescriptionTemplate.value = props.eventInstance.descriptionTemplate ?? ''
  editedLocationTemplate.value = props.eventInstance.locationTemplate ?? ''
  isEditing.value = true
}

const handleSave = async () => {
  if (!editedName.value.trim()) {
    return
  }

  try {
    await updateMutation.mutateAsync({
      id: props.eventInstance.id,
      data: {
        name: editedName.value.trim(),
        titleTemplate: editedTitleTemplate.value.trim() || null,
        descriptionTemplate: editedDescriptionTemplate.value.trim() || null,
        locationTemplate: editedLocationTemplate.value.trim() || null,
      }
    })
    isEditing.value = false
  } catch (error) {
    logger.error('Failed to update event instance:', error)
  }
}

const handleCancel = () => {
  editedName.value = props.eventInstance.name
  editedTitleTemplate.value = props.eventInstance.titleTemplate ?? ''
  editedDescriptionTemplate.value = props.eventInstance.descriptionTemplate ?? ''
  editedLocationTemplate.value = props.eventInstance.locationTemplate ?? ''
  isEditing.value = false
}

const handleDelete = async () => {
  if (!confirm(`Are you sure you want to delete event instance "${props.eventInstance.name}"?`)) {
    return
  }

  try {
    await deleteMutation.mutateAsync(props.eventInstance.id)
    emit('delete', props.eventInstance.id)
  } catch (error) {
    logger.error('Failed to delete event instance:', error)
    if (error instanceof Error && error.message.includes('active events are using it')) {
      alert(`Cannot delete event instance: ${error.message}`)
    }
  }
}
</script>

<template>
  <VCard class="mb-2">
    <VCardText>
      <div v-if="!isEditing">
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="flex-grow-1">
            <div class="text-h6">{{ eventInstance.name }}</div>
            <div class="text-caption text-medium-emphasis">
              Shape: {{ eventShape?.name || 'Unknown' }} | ID: {{ eventInstance.id }}
            </div>
          </div>
          <div class="d-flex gap-2">
            <VBtn
              icon="tabler-edit"
              size="small"
              variant="text"
              @click="handleEdit"
            />
            <VBtn
              icon="tabler-trash"
              size="small"
              color="error"
              variant="text"
              :loading="deleteMutation.isPending.value"
              @click="handleDelete"
            />
          </div>
        </div>
        <div v-if="eventInstance.titleTemplate || eventInstance.descriptionTemplate || eventInstance.locationTemplate" class="mt-2">
          <div v-if="eventInstance.titleTemplate" class="text-body-2 mb-1">
            <strong>Title:</strong> {{ eventInstance.titleTemplate }}
          </div>
          <div v-if="eventInstance.descriptionTemplate" class="text-body-2 mb-1">
            <strong>Description:</strong> {{ eventInstance.descriptionTemplate }}
          </div>
          <div v-if="eventInstance.locationTemplate" class="text-body-2">
            <strong>Location:</strong> {{ eventInstance.locationTemplate }}
          </div>
        </div>
      </div>
      
      <div v-else class="d-flex flex-column gap-3">
        <VTextField
          v-model="editedName"
          label="Name"
          variant="outlined"
          density="compact"
          @keyup.enter="handleSave"
          @keyup.esc="handleCancel"
        />
        <VTextarea
          v-model="editedTitleTemplate"
          label="Title Template"
          variant="outlined"
          density="compact"
          rows="2"
          hint="Template for event title (e.g., '{service} on {propertyType}')"
        />
        <VTextarea
          v-model="editedDescriptionTemplate"
          label="Description Template"
          variant="outlined"
          density="compact"
          rows="2"
          hint="Template for event description (e.g., '{clientName} - {propertyAddress}')"
        />
        <VTextarea
          v-model="editedLocationTemplate"
          label="Location Template"
          variant="outlined"
          density="compact"
          rows="2"
          hint="Template for event location (e.g., '{propertyAddress}')"
        />
        <div class="d-flex gap-2 justify-end">
          <VBtn
            icon="tabler-check"
            color="success"
            :loading="updateMutation.isPending.value"
            @click="handleSave"
          >
            Save
          </VBtn>
          <VBtn
            variant="outlined"
            @click="handleCancel"
          >
            Cancel
          </VBtn>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>
