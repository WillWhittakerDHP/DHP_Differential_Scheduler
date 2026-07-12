<!--
  WHY: One mount point for part-ledger convergence UIs on block instance cards (Phase 20.9).
  PATTERN: Shape-type switch; parent gates slot presence via showPartLedgerConvergence.
-->
<script setup lang="ts">
import type { GlobalEntity } from '@/types/entities'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import ServiceAtomicEditor from './ServiceAtomicEditor.vue'
import TimePriceAtomicPartLedgerEditor from './TimePriceAtomicPartLedgerEditor.vue'

defineProps<{
  blockShape: GlobalEntity<'blockShape'>
  blockInstanceId: string
}>()
</script>

<template>
  <ServiceAtomicEditor
    v-if="blockShape.semanticType === BLOCK_SHAPE_TYPES.SERVICE"
    :block-instance-id="blockInstanceId"
    class="mb-4"
  />
  <TimePriceAtomicPartLedgerEditor
    v-else-if="
      blockShape.semanticType === BLOCK_SHAPE_TYPES.TIME ||
      blockShape.semanticType === BLOCK_SHAPE_TYPES.PRICE
    "
    :block-instance-id="blockInstanceId"
    class="mb-4"
  />
</template>
