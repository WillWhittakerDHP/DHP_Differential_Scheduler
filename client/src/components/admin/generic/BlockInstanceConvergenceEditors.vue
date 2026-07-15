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
  <AtomicPartLedgerEditor
    v-else-if="blockShape.semanticType === BLOCK_SHAPE_TYPES.EVENT"
    :block-instance-id="blockInstanceId"
    :allowed-shape-types="EVENT_TYPES"
    title="Event part modifiers"
    subtitle="Use fixed minutes, time per unit, or a multiplier to modify the selected part types for this event profile."
    class="mb-4"
  />
</template>
