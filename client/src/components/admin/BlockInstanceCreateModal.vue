<!--
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
        <!-- WHY: Uses EntityCard for consistency, but prevents auto-save on blur -->
        <!-- PATTERN: Set isNew=true, disableAutoSave=true, useExpansionPanel=false -->
        <div class="create-modal-entity-card">
          <AdminEntityEditorPanel
            ref="entityCardRef"
            entity-key="blockInstance"
            :entity="initialEntity"
            :is-new="true"
            :expanded="true"
            :disable-auto-save="true"
            :use-expansion-panel="false"
            :block-instance-semantic-type-override="blockInstanceSemanticType"
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
import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import AdminEntityEditorPanel from '@/components/admin/generic/AdminEntityEditorPanel.vue'
import { getDefaultEntityValues } from '@/utils/entityDefaults'
import { generateIncrementedName } from '@/utils/blockInstanceUtils'
import { useAdmin } from '@/composables/admin/useAdmin'
import { useBlockInstanceCreate } from '@/composables/admin/useBlockInstanceCreate'
import { WIZARD_PLACEMENT } from '@shared/constants/wizardPlacement'
import { toGlobalEntityId } from '@/utils/globalEntity'

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

const entityCardRef = ref<InstanceType<typeof AdminEntityEditorPanel> | null>(null)
const admin = useAdmin()

const { tempEntityId, handleCreate } = useBlockInstanceCreate({
  modelValue: () => props.modelValue,
  entityCardRef: entityCardRef as Ref<{ handleSave: () => Promise<void> } | null>,
})

const modalTitle = computed(() => {
  return props.sourceEntity ? 'Duplicate Block Instance' : 'Create Block Instance'
})

const createButtonText = computed(() => {
  return props.sourceEntity ? 'Duplicate' : 'Create'
})

const blockInstanceSemanticType = computed(() => {
  if (!props.blockShapeId) {
    return null
  }
  const blockShape = admin.getEntity('blockShape', toGlobalEntityId(props.blockShapeId)) as
    | GlobalEntity<'blockShape'>
    | undefined
  return blockShape?.semanticType ?? null
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
      wizardPlacement: props.sourceEntity.wizardPlacement || WIZARD_PLACEMENT.TOP_LINE,
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

function handleCancel(): void {
  updateModelValue(false)
}
</script>

<style scoped>
.create-modal-entity-card :deep(.d-flex.align-center.justify-end.mt-4.pt-4) {
  display: none !important;
}
</style>
