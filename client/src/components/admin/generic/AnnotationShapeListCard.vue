<!--
  WHY: FEATURE_20 §8.3 #5 — domain-named card for annotation shapes in Shapes → Annotations.
  PATTERN: Typed façade over AdminEntityEditorPanel (phase 20.6.2.1).
-->
<script setup lang="ts">
import AdminEntityEditorPanel from '@/components/admin/generic/AdminEntityEditorPanel.vue'
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
  <AdminEntityEditorPanel
    entity-key="annotationShape"
    :entity="entity"
    :expanded="expanded"
    show-shape-list-drag-handle
    v-bind="$attrs"
    @saved="handleSaved"
    @delete="emit('delete', $event)"
  />
</template>
