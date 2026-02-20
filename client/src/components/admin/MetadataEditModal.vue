<!--
  LEARNING: Metadata Edit Modal
  WHY: Unified modal for editing admin input metadata (rendering configuration only)
  PATTERN: Single editor component wired to admin-input-metadata API
  NOTE: Replaces legacy two-tab modal with unified rendering-focused editor
-->
<template>
  <VDialog
    :model-value="modelValue"
    @update:model-value="updateModelValue"
    max-width="1200"
    scrollable
  >
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between pa-6">
        <span class="text-h5">{{ modalTitle }}</span>
        <VBtn
          icon
          variant="text"
          @click="updateModelValue(false)"
        >
          <VIcon icon="tabler-x" />
        </VBtn>
      </VCardTitle>

      <VCardText class="pa-6">
        <AdminPrimitiveMetadataEditor
          ref="editorRef"
          :entity-key="entityKey"
          :entity="entity"
          :block-shape-ref="blockShapeRef"
          @saved="handleSaved"
        />
      </VCardText>

      <VCardActions class="pa-6">
        <VSpacer />
        <VBtn
          color="secondary"
          variant="tonal"
          @click="updateModelValue(false)"
        >
          Close
        </VBtn>
        <VBtn
          color="primary"
          variant="elevated"
          :loading="editorRef?.isSaving"
          @click="handleSave"
        >
          Save Configuration
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AdminPrimitiveMetadataEditor from './metadata/AdminPrimitiveMetadataEditor.vue'
import { getEntityTypeLabel } from '@/utils/admin/entityDisplayText'
import { useNotification } from '@/composables/useNotification'
import { getApiErrorMessage } from '@/composables/useApiErrorMessage'
import { createLogger } from '@/utils/logger'
import type { MetadataEditorPropsBase } from '@/types/metadataEditorProps'

const logger = createLogger('MetadataEditModal')

/** Extends shared metadata editor base (P3 type-similarity). */
interface Props extends MetadataEditorPropsBase {
  modelValue: boolean
  entityName?: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emits>()

const { error: showError } = useNotification()

const editorRef = ref<InstanceType<typeof AdminPrimitiveMetadataEditor> | null>(null)

const modalTitle = computed(() => {
  if (props.entityName) {
    return `Metadata Edit: ${props.entityName}`
  }
  // PATTERN: Use shared utility function instead of hardcoded ternary chain
  const entityTypeLabel = getEntityTypeLabel(props.entityKey)
  return `Metadata Edit: ${entityTypeLabel}`
})

function updateModelValue(value: boolean) {
  emit('update:modelValue', value)
}

function handleSaved() {
  emit('saved')
}

async function handleSave(): Promise<void> {
  if (!editorRef.value) {
    showError('Editor not available')
    return
  }

  try {
    await editorRef.value.save()
  } catch (err) {
    logger.error('Error saving metadata', { err })
    
    // LEARNING: Use composable for error message extraction
    // PATTERN: Composable handles AxiosError, Error, and unknown error types
    const errorMessage = getApiErrorMessage(err, 'Failed to save metadata configuration')
    showError(errorMessage)
  }
}
</script>
