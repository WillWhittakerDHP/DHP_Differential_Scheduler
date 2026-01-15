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
        <AdminInputMetadataEditor
          ref="editorRef"
          :entity-key="entityKey"
          :entity="entity"
          :mode="mode"
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
          @click="editorRef?.save()"
        >
          Save Configuration
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AdminInputMetadataEditor from './metadata/AdminInputMetadataEditor.vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'

interface Props {
  modelValue: boolean
  entityKey: GlobalEntityKey  // Required - blockShape, partShape, blockInstance, or partInstance
  entity: GlobalEntity<GlobalEntityKey>  // Required - entity object
  mode?: 'global' | 'instanceOverride'  // Optional - defaults to 'global' for shapes, 'instanceOverride' for instances
  entityName?: string  // Optional - for display in title
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

// Template ref for editor component
const editorRef = ref<InstanceType<typeof AdminInputMetadataEditor> | null>(null)

// Computed modal title
const modalTitle = computed(() => {
  if (props.entityName) {
    return `Metadata Edit: ${props.entityName}`
  }
  const entityTypeLabel = props.entityKey === 'blockShape' ? 'Block Shape'
    : props.entityKey === 'partShape' ? 'Part Shape'
    : props.entityKey === 'blockInstance' ? 'Block Instance'
    : 'Part Instance'
  return `Metadata Edit: ${entityTypeLabel}`
})

function updateModelValue(value: boolean) {
  emit('update:modelValue', value)
}

function handleSaved() {
  emit('saved')
}
</script>
