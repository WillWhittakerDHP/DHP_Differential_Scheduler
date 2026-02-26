<!--
  LEARNING: Metadata Edit Modal
  WHY: Unified modal for editing admin input metadata (rendering configuration only)
  PATTERN: Single editor component wired to admin-metadata API
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
        <span class="text-headline-medium">{{ modalTitle }}</span>
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
import { useMetadataEditModal } from '@/composables/admin/useMetadataEditModal'
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

const { handleSave } = useMetadataEditModal({
  editorRef,
  showError,
  getErrorMessage: (err) => getApiErrorMessage(err, 'Failed to save metadata configuration'),
  logger,
})

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
</script>
