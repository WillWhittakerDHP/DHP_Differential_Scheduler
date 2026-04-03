<!--
  WHY: Backward-compatible name for async import (RelationshipCollection) until task 20.6.2.2.
  PATTERN: Forwards props, attrs, and exposed API to AdminEntityEditorPanel.
-->
<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue'
import type { FormContext } from 'vee-validate'
import type { GlobalEntity } from '@/types/entities'
import { type FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { GlobalEntityKey } from '@/constants/entities'
import AdminEntityEditorPanel from './AdminEntityEditorPanel.vue'

defineOptions({
  inheritAttrs: false,
})

interface Props<GE extends GlobalEntityKey> {
  entityKey: GE
  entity: GlobalEntity<GE>
  expanded?: boolean
  useExpansionPanel?: boolean
  form?: FormContext
  isNew?: boolean
  disableAutoSave?: boolean
  fieldMetadata?: Record<string, FieldMetadataEntry>
  parentBlockShapeIsStateControl?: boolean
  showShapeListDragHandle?: boolean
}

const props = withDefaults(defineProps<Props<GlobalEntityKey>>(), {
  expanded: true,
  isNew: false,
  disableAutoSave: false,
  useExpansionPanel: true,
  parentBlockShapeIsStateControl: false,
  showShapeListDragHandle: false,
})

defineEmits<{
  (e: 'delete', id: string): void
  (e: 'saved', entity: GlobalEntity<GlobalEntityKey>): void
  (e: 'cancelled'): void
  (e: 'duplicate', entity: GlobalEntity<GlobalEntityKey>): void
}>()

const attrs = useAttrs()

const panelRef = ref<InstanceType<typeof AdminEntityEditorPanel> | null>(null)

const forwardedBindings = computed(() => ({ ...props, ...attrs }))

type PanelInstance = InstanceType<typeof AdminEntityEditorPanel>

defineExpose({
  getFieldContext: (...args: Parameters<PanelInstance['getFieldContext']>) =>
    panelRef.value?.getFieldContext(...args),
  getNameFieldContext: () => panelRef.value?.getNameFieldContext(),
  get form() {
    return panelRef.value?.form
  },
  handleSave: (): Promise<void> => panelRef.value?.handleSave() ?? Promise.resolve(),
  get isMetadataReady() {
    return panelRef.value?.isMetadataReady
  },
  get isFormReady() {
    return panelRef.value?.isFormReady
  },
})
</script>

<template>
  <AdminEntityEditorPanel ref="panelRef" v-bind="forwardedBindings" />
</template>
