<!-- Extracted from ShapesTab for component-health (allowlist repair). -->
<script setup lang="ts">
/* eslint-disable vue/no-mutating-props */
import { computed } from 'vue'
import type { Ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import EntityCard from '@/components/admin/generic/EntityCard.vue'

const props = withDefaults(
  defineProps<{
    entityKey: GlobalEntityKey
    items: GlobalEntity<GlobalEntityKey>[]
    expanded: Ref<string[]>
    isPanelExpanded: (id: string) => boolean
    dragClass?: string
    /** When false, only render EntityCards (parent wraps in VExpansionPanels). */
    wrapInPanels?: boolean
  }>(),
  { dragClass: '', wrapInPanels: true }
)

defineEmits<{
  (e: 'saved', entity: GlobalEntity<GlobalEntityKey>): void
  (e: 'delete', id: string): void
}>()

const expandedModel = computed({
  get: () => props.expanded.value,
  set: (v: string[]) => {
    props.expanded.value = v
  }
})
</script>

<template>
  <VExpansionPanels v-if="wrapInPanels" v-model="expandedModel" multiple>
    <EntityCard
      v-for="item in props.items"
      :key="String(item.id)"
      :class="props.dragClass || undefined"
      :data-drag-id="String(item.id)"
      :entity-key="props.entityKey"
      :entity="item"
      :expanded="props.isPanelExpanded(String(item.id))"
      @saved="(e: GlobalEntity<GlobalEntityKey>) => $emit('saved', e)"
      @delete="(id: string) => $emit('delete', id)"
    />
  </VExpansionPanels>
  <template v-else>
    <EntityCard
      v-for="item in props.items"
      :key="String(item.id)"
      :class="props.dragClass || undefined"
      :data-drag-id="String(item.id)"
      :entity-key="props.entityKey"
      :entity="item"
      :expanded="props.isPanelExpanded(String(item.id))"
      @saved="(e: GlobalEntity<GlobalEntityKey>) => $emit('saved', e)"
      @delete="(id: string) => $emit('delete', id)"
    />
  </template>
</template>
