<!-- Extracted from ShapesTab for component-health (allowlist repair). -->
<script setup lang="ts">
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import EntityCard from '@/components/admin/generic/EntityCard.vue'

defineProps<{
  entityKey: GlobalEntityKey
  entity: GlobalEntity<GlobalEntityKey>
}>()

const emit = defineEmits<{
  (e: 'saved'): void
  (e: 'cancelled'): void
}>()

function notifySaved(): void {
  emit('saved')
}

function notifyCancelled(): void {
  emit('cancelled')
}
</script>

<template>
  <EntityCard
    key="new-shape"
    :entity-key="entityKey"
    :entity="entity"
    :is-new="true"
    :expanded="true"
    :use-expansion-panel="false"
    class="new-shape-card"
    @saved="notifySaved"
    @cancelled="notifyCancelled"
  />
</template>
