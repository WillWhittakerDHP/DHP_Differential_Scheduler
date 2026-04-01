<!-- Extracted from ShapesTab for component-health (allowlist repair). -->
<!-- eslint-disable vue/no-mutating-props -- expanded is Ref<string[]> passed by parent for v-model binding -->
<script setup lang="ts">
import { computed, isRef, unref } from 'vue'
import type { Ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import EntityCard from '@/components/admin/generic/EntityCard.vue'

const props = withDefaults(
  defineProps<{
    entityKey: GlobalEntityKey
    items: Ref<GlobalEntity<GlobalEntityKey>[]> | GlobalEntity<GlobalEntityKey>[]
    expanded: Ref<string[]> | string[]
    isPanelExpanded: (id: string) => boolean
    dragClass?: string
    /** When false, only render EntityCards (parent wraps in VExpansionPanels). */
    wrapInPanels?: boolean
    showShapeListDragHandle?: boolean
  }>(),
  { dragClass: '', wrapInPanels: true, showShapeListDragHandle: true }
)

defineEmits<{
  (e: 'saved', entity: GlobalEntity<GlobalEntityKey>): void
  (e: 'delete', id: string): void
}>()

const itemsArray = computed(() => unref(props.items))

const expandedModel = computed({
  get: () => (isRef(props.expanded) ? props.expanded.value : props.expanded),
  set: (v: string[]) => {
    if (isRef(props.expanded)) props.expanded.value = v
  }
})
</script>

<template>
  <VExpansionPanels v-if="wrapInPanels" v-model="expandedModel" multiple>
    <EntityCard
      v-for="item in itemsArray"
      :key="String(item.id)"
      :class="props.dragClass || undefined"
      :data-drag-id="String(item.id)"
      :entity-key="props.entityKey"
      :entity="item"
      :expanded="props.isPanelExpanded(String(item.id))"
      :show-shape-list-drag-handle="props.showShapeListDragHandle"
      @saved="(e: GlobalEntity<GlobalEntityKey>) => $emit('saved', e)"
      @delete="(id: string) => $emit('delete', id)"
    />
  </VExpansionPanels>
  <template v-else>
    <EntityCard
      v-for="item in itemsArray"
      :key="String(item.id)"
      :class="props.dragClass || undefined"
      :data-drag-id="String(item.id)"
      :entity-key="props.entityKey"
      :entity="item"
      :expanded="props.isPanelExpanded(String(item.id))"
      :show-shape-list-drag-handle="props.showShapeListDragHandle"
      @saved="(e: GlobalEntity<GlobalEntityKey>) => $emit('saved', e)"
      @delete="(id: string) => $emit('delete', id)"
    />
  </template>
</template>
