<!--
  LEARNING: Block Instance Create Modal Component
  WHY: Unified modal for creating and duplicating block instances
  PATTERN: VDialog with EntityCard inside, following InstanceBulkEditModal pattern
  COMPARISON: Similar to InstanceBulkEditModal but for create/duplicate operations
-->
<template>
  <VDialog
    :model-value="modelValue"
    @update:model-value="updateModelValue"
    max-width="800"
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
        <!-- LEARNING: EntityCard for create/duplicate form -->
        <!-- WHY: Uses EntityCard for consistency, but prevents auto-save on blur -->
        <!-- PATTERN: Set isNew=true, disableAutoSave=true, useExpansionPanel=false -->
        <div class="create-modal-entity-card">
          <EntityCard
            ref="entityCardRef"
            entity-key="blockInstance"
            :entity="initialEntity"
            :is-new="true"
            :expanded="true"
            :disable-auto-save="true"
            :use-expansion-panel="false"
            @saved="handleEntityCardSaved"
            @cancelled="handleCancel"
          />
        </div>
      </VCardText>

      <VCardActions class="pa-6">
        <VSpacer />
        <VBtn
          color="secondary"
          variant="tonal"
          @click="handleCancel"
        >
          Cancel
        </VBtn>
        <VBtn
          color="primary"
          variant="elevated"
          :disabled="!canSave"
          @click="handleCreate"
        >
          {{ createButtonText }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import EntityCard from '@/components/admin/generic/EntityCard.vue'
import { getDefaultEntityValues } from '@/utils/entityDefaults'
import { generateIncrementedName } from '@/utils/blockInstanceUtils'
import { useAdmin } from '@/composables/admin/useAdmin'

interface Props {
  modelValue?: boolean
  blockShapeId: string
  sourceEntity?: GlobalEntity<'blockInstance'> // For duplicate, undefined for create
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'created', entity: GlobalEntity<'blockInstance'>): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false
})
const emit = defineEmits<Emits>()

const entityCardRef = ref<InstanceType<typeof EntityCard> | null>(null)
const admin = useAdmin()

const tempEntityId = ref<string>(`new-${Date.now()}`)

const modalTitle = computed(() => {
  return props.sourceEntity ? 'Duplicate Block Instance' : 'Create Block Instance'
})

const createButtonText = computed(() => {
  return props.sourceEntity ? 'Duplicate' : 'Create'
})

const initialEntity = computed<GlobalEntity<'blockInstance'>>(() => {
  if (props.sourceEntity) {
    const sourceName = props.sourceEntity.name
    const newName = generateIncrementedName(
      sourceName !== undefined && sourceName !== null && sourceName !== '' ? sourceName : '',
      props.sourceEntity.blockShapeRef,
      admin.getEntitiesByKey
    )
    
    return {
      ...props.sourceEntity,
      name: newName,
      id: tempEntityId.value,
    } as GlobalEntity<'blockInstance'>
  } else {
    const defaults = getDefaultEntityValues('blockInstance')
    return {
      ...defaults,
      blockShapeRef: props.blockShapeId,
      id: tempEntityId.value,
    } as GlobalEntity<'blockInstance'>
  }
})

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    tempEntityId.value = `new-${Date.now()}`
  }
})

const canSave = computed(() => {
  if (!entityCardRef.value?.form) {
    return false
  }
  
  const form = entityCardRef.value.form
  return form.meta.value.valid && entityCardRef.value.isFormReady
})

function updateModelValue(value: boolean) {
  emit('update:modelValue', value)
}

function handleEntityCardSaved(entity: GlobalEntity<GlobalEntityKey>): void {
  emit('created', entity as GlobalEntity<'blockInstance'>)
  updateModelValue(false)
}

async function handleCreate(): Promise<void> {
  if (!entityCardRef.value) {
    return
  }
  
  await entityCardRef.value.handleSave()
}

function handleCancel(): void {
  updateModelValue(false)
}
</script>

<style scoped>
.create-modal-entity-card :deep(.d-flex.align-center.justify-end.mt-4.pt-4) {
  display: none !important;
}
</style>
