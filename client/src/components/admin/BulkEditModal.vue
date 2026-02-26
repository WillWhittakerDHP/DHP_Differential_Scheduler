<template>
  <VDialog
    :model-value="modelValue"
    @update:model-value="updateModelValue"
    max-width="800"
    :persistent="persistent"
  >
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between pa-6">
        <span class="text-headline-medium">{{ title }}</span>
        <VBtn
          icon
          variant="text"
          @click="updateModelValue(false)"
        >
          <VIcon icon="tabler-x" />
        </VBtn>
      </VCardTitle>

      <VCardText class="pa-6">
        <p class="mb-4 text-body-medium">
          {{ description }}
        </p>

        <div class="bulk-edit-entity-card">
          <!--
            LEARNING: EntityCard for bulk edit form
            WHY: Uses EntityCard for consistency, but prevents actual saves
            PATTERN: Set isNew=false and intercept saved event to prevent API calls
            NOTE: Field blur auto-save is disabled by using a non-existent entity ID
            NOTE: Pass filtered metadata that only includes fields with bulkEdit: true
          -->
          <EntityCard
            ref="entityCardRef"
            :entity-key="entityKey"
            :entity="entity"
            :expanded="true"
            :field-metadata="fieldMetadata"
            :is-new="false"
            :disable-auto-save="true"
            :use-expansion-panel="false"
            @saved="handleEntityCardSaved"
          />
        </div>
      </VCardText>

      <VCardActions class="pa-6">
        <VSpacer />
        <VBtn
          color="secondary"
          variant="tonal"
          @click="updateModelValue(false)"
        >
          Cancel
        </VBtn>
        <VBtn
          color="primary"
          variant="elevated"
          @click="handleApply"
        >
          Apply to All ({{ instanceCount }})
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import EntityCard from '@/components/admin/generic/EntityCard.vue'

interface Props {
  modelValue?: boolean
  entityKey: GlobalEntityKey
  entity: GlobalEntity<GlobalEntityKey>
  fieldMetadata: Record<string, FieldMetadataEntry>
  title: string
  description: string
  instanceCount: number
  /** When true, dialog cannot be closed by clicking outside. When false, clicking outside closes. Undefined uses VDialog default. */
  persistent?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', formValues: Record<string, unknown>): void
}

withDefaults(defineProps<Props>(), {
  modelValue: false
})
const emit = defineEmits<Emits>()

const entityCardRef = ref<InstanceType<typeof EntityCard> | null>(null)

function updateModelValue(value: boolean) {
  emit('update:modelValue', value)
}

function handleEntityCardSaved() {
  // No-op: bulk edit does not persist on save; user must click Apply to All
}

function handleApply() {
  if (!entityCardRef.value?.form) {
    return
  }
  const formValues = entityCardRef.value.form.values as Record<string, unknown>
  emit('confirm', formValues)
  updateModelValue(false)
}
</script>

<style scoped>
.bulk-edit-entity-card :deep(.d-flex.align-center.justify-end.mt-4.pt-4) {
  display: none !important;
}
</style>
