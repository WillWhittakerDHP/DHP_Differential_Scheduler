<!--
  WHY: One mount point for part-ledger convergence UIs on block instance cards (Phase 20.9).
  PATTERN: Shape-type switch; parent gates slot presence via showPartLedgerConvergence.
-->
<script setup lang="ts">
import type { GlobalEntity } from '@/types/entities'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import ServiceAtomicEditor from './ServiceAtomicEditor.vue'
import TimePriceAtomicPartLedgerEditor from './TimePriceAtomicPartLedgerEditor.vue'
import AtomicPartLedgerEditor from './AtomicPartLedgerEditor.vue'
import ServiceActiveBlockControls from './ServiceActiveBlockControls.vue'
import EventWorkItemRoutingPanel from './EventWorkItemRoutingPanel.vue'

defineProps<{
  blockShape: GlobalEntity<'blockShape'>
  blockInstanceId: string
}>()

const EVENT_TYPES = [BLOCK_SHAPE_TYPES.EVENT] as const
</script>

<template>
  <template v-if="blockShape.semanticType === BLOCK_SHAPE_TYPES.SERVICE">
    <ServiceAtomicEditor
      :block-instance-id="blockInstanceId"
      class="mb-4"
    />
    <ServiceActiveBlockControls
      :block-instance-id="blockInstanceId"
    />
  </template>
  <TimePriceAtomicPartLedgerEditor
    v-else-if="
      blockShape.semanticType === BLOCK_SHAPE_TYPES.TIME ||
      blockShape.semanticType === BLOCK_SHAPE_TYPES.PRICE
    "
    :block-instance-id="blockInstanceId"
    class="mb-4"
  />
  <template v-else-if="blockShape.semanticType === BLOCK_SHAPE_TYPES.EVENT">
    <AtomicPartLedgerEditor
      :block-instance-id="blockInstanceId"
      :allowed-shape-types="EVENT_TYPES"
      :name-editable="false"
      title="Event part modifiers"
      subtitle="Optional duration tweaks for part types under this event profile (extra minutes, multipliers, or zero-out). This does not choose which work items land in which calendar segment."
      class="mb-4"
    />
    <EventWorkItemRoutingPanel :block-instance-id="blockInstanceId" />
  </template>
</template>
