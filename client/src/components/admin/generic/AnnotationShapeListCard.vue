<!--
  WHY: FEATURE_20 §8.3 #5 — Shapes → Annotations list uses a domain-named card instead of importing EntityCard in the tab panel.
  PATTERN: Typed façade; EntityCard remains implementation until phase 20.6 deletes the generic tree.
-->
<script setup lang="ts">
import EntityCard from '@/components/admin/generic/EntityCard.vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'

defineProps<{
  entity: GlobalEntity<'annotationShape'>
  expanded: boolean
}>()

const emit = defineEmits<{
  saved: [entity: GlobalEntity<'annotationShape'>]
  delete: [id: string]
}>()

function handleSaved(entity: GlobalEntity<GlobalEntityKey>): void {
  emit('saved', entity as GlobalEntity<'annotationShape'>)
}
</script>

<template>
  <EntityCard
    entity-key="annotationShape"
    :entity="entity"
    :expanded="expanded"
    show-shape-list-drag-handle
    v-bind="$attrs"
    @saved="handleSaved"
    @delete="emit('delete', $event)"
  />
</template>
