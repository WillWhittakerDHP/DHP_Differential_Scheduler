<!--
  LEARNING: AnnotationType Card Component
  WHY: Displays annotation type with edit/delete functionality
  PATTERN: Simple card with inline editing
-->
<script setup lang="ts">
import { ref } from 'vue'
import type { AnnotationType } from '@/types/annotations'
import { useUpdateAnnotationType, useDeleteAnnotationType } from '@/composables/useAnnotationTypes'
import { createLogger } from '@/utils/logger'

interface Props {
  annotationType: AnnotationType
}

const props = defineProps<Props>()

interface Emits {
  (e: 'delete', id: string): void
}

const emit = defineEmits<Emits>()

const isEditing = ref(false)
const editedName = ref(props.annotationType.name)

const updateMutation = useUpdateAnnotationType()
const deleteMutation = useDeleteAnnotationType()
const logger = createLogger('AnnotationTypeCard')

const handleEdit = () => {
  editedName.value = props.annotationType.name
  isEditing.value = true
}

const handleSave = async () => {
  if (!editedName.value.trim()) {
    return
  }

  try {
    await updateMutation.mutateAsync({
      id: props.annotationType.id,
      data: { name: editedName.value.trim() }
    })
    isEditing.value = false
  } catch (error) {
    logger.error('Failed to update annotation type:', error)
  }
}

const handleCancel = () => {
  editedName.value = props.annotationType.name
  isEditing.value = false
}

const handleDelete = async () => {
  if (!confirm(`Are you sure you want to delete annotation type "${props.annotationType.name}"?`)) {
    return
  }

  try {
    await deleteMutation.mutateAsync(props.annotationType.id)
    emit('delete', props.annotationType.id)
  } catch (error) {
    logger.error('Failed to delete annotation type:', error)
    if (error instanceof Error && error.message.includes('annotations are using it')) {
      alert(`Cannot delete annotation type: ${error.message}`)
    }
  }
}
</script>

<template>
  <VCard class="mb-2">
    <VCardText>
      <div class="d-flex align-center justify-space-between">
        <div v-if="!isEditing" class="flex-grow-1">
          <div class="text-h6">{{ annotationType.name }}</div>
          <div class="text-caption text-medium-emphasis">ID: {{ annotationType.id }}</div>
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

