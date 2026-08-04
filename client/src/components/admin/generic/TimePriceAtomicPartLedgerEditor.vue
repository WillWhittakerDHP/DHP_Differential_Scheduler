<!--
  WHY: Time / price block instances — part ledger for duration & fee inputs (Feature 20 §8.3 #3).
  PATTERN: Thin wrapper over AtomicPartLedgerEditor with TIME + PRICE shape gates.
-->
<script setup lang="ts">
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import AtomicPartLedgerEditor from './AtomicPartLedgerEditor.vue'

defineProps<{
  blockInstanceId: string
}>()

const TIME_PRICE_TYPES = [BLOCK_SHAPE_TYPES.TIME, BLOCK_SHAPE_TYPES.PRICE] as const
</script>

<template>
  <AtomicPartLedgerEditor
    :block-instance-id="blockInstanceId"
    :allowed-shape-types="TIME_PRICE_TYPES"
    title="Part ledger"
    subtitle="Parts on this time or fee block — where per-unit duration and fee live. Add a part type, then edit values."
  />
</template>
