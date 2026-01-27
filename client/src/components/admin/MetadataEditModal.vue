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
          :mode="mode"
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
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import { useNotification } from '@/composables/useNotification'
import { getApiErrorMessage } from '@/composables/useApiErrorMessage'

interface Props {
  modelValue: boolean
  entityKey: GlobalEntityKey  // Required - blockShape, partShape, blockInstance, or partInstance
  entity: GlobalEntity<GlobalEntityKey>  // Required - entity object
  mode?: 'global' | 'instanceOverride'  // Optional - defaults to 'global' for shapes, 'instanceOverride' for instances
  entityName?: string  // Optional - for display in title
  blockShapeRef?: string  // Optional - BlockShape ID for BlockShape-specific instance metadata
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}

const props = withDefaults(defineProps<Props>(), {
  mode: (props: Props) => {
    // Default mode based on entityKey
    if (props.entityKey === 'blockShape' || props.entityKey === 'partShape') {
      return 'global'
    }
    return 'instanceOverride'
  }
})

const emit = defineEmits<Emits>()

// Notification composable for error handling
const { error: showError } = useNotification()

// Template ref for editor component
const editorRef = ref<InstanceType<typeof AdminPrimitiveMetadataEditor> | null>(null)

// Computed modal title
const modalTitle = computed(() => {
  if (props.entityName) {
    return `Metadata Edit: ${props.entityName}`
  }
  // LEARNING: Use config-driven entity type label
  // WHY: Eliminates entityKey branching (ternary chain) - single source of truth
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

/**
 * LEARNING: Handle save with proper error handling
 * WHY: Prevents unhandled promise rejections and shows user-friendly error messages
 * PATTERN: Async handler with try-catch, uses composable for error message extraction
 */
async function handleSave(): Promise<void> {
  if (!editorRef.value) {
    showError('Editor not available')
    return
  }

  try {
    await editorRef.value.save()
  } catch (err) {
    console.error('[MetadataEditModal] Error saving metadata:', err)
    
    // LEARNING: Use composable for error message extraction
    // WHY: Centralizes error message parsing logic
    // PATTERN: Composable handles AxiosError, Error, and unknown error types
    const errorMessage = getApiErrorMessage(err, 'Failed to save metadata configuration')
    showError(errorMessage)
  }
}
</script>
