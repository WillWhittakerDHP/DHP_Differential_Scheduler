<!--
  LEARNING: EventShape Card Component
  WHY: Displays event shape with edit/delete functionality
  PATTERN: Simple card with inline editing, similar to AnnotationTypeCard
-->
<script setup lang="ts">
import { ref } from 'vue'
import type { EventShapeEntity } from '@/types/events'
import { useUpdateEventShape, useDeleteEventShape } from '@/composables/useEventShapes'
import { createLogger } from '@/utils/logger'

interface Props {
  eventShape: EventShape
}

const props = defineProps<Props>()

interface Emits {
  (e: 'delete', id: string): void
}

const emit = defineEmits<Emits>()

const isEditing = ref(false)
const editedName = ref(props.eventShape.name)

const updateMutation = useUpdateEventShape()
const deleteMutation = useDeleteEventShape()
const logger = createLogger('EventShapeCard')

const handleEdit = () => {
  editedName.value = props.eventShape.name
  isEditing.value = true
}

const handleSave = async () => {
  if (!editedName.value.trim()) {
    return
  }

  try {
    await updateMutation.mutateAsync({
      id: props.eventShape.id,
      data: { name: editedName.value.trim() }
    })
    isEditing.value = false
  } catch (error) {
    logger.error('Failed to update event shape:', error)
  }
}

const handleCancel = () => {
  editedName.value = props.eventShape.name
  isEditing.value = false
}

const handleDelete = async () => {
  if (!confirm(`Are you sure you want to delete event shape "${props.eventShape.name}"?`)) {
    return
  }

  try {
    await deleteMutation.mutateAsync(props.eventShape.id)
    emit('delete', props.eventShape.id)
  } catch (error) {
    logger.error('Failed to delete event shape:', error)
    if (error instanceof Error && error.message.includes('event instances are using it')) {
      alert(`Cannot delete event shape: ${error.message}`)
    }
  }
}
</script>

<template>
  <VCard class="mb-2">
    <VCardText>
      <div class="d-flex align-center justify-space-between">
        <div v-if="!isEditing" class="flex-grow-1">
          <div class="text-h6">{{ eventShape.name }}</div>
          <div class="text-caption text-medium-emphasis">ID: {{ eventShape.id }}</div>
        </div>
        
        <VTextField
          v-else
          v-model="editedName"
          label="Name"
          variant="outlined"
          density="compact"
          class="flex-grow-1 mr-2"
          @keyup.enter="handleSave"
          @keyup.esc="handleCancel"
        />
        
        <div class="d-flex gap-2">
          <VBtn
            v-if="!isEditing"
            icon="tabler-edit"
            size="small"
            variant="text"
            @click="handleEdit"
          />
          <VBtn
            v-else
            icon="tabler-check"
            size="small"
            color="success"
            :loading="updateMutation.isPending.value"
            @click="handleSave"
          />
          <VBtn
            v-if="isEditing"
            icon="tabler-x"
            size="small"
            variant="text"
            @click="handleCancel"
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
    </VCardText>
  </VCard>
</template>
