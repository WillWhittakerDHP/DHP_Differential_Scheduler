<!--
  WHY: Service block instances — convergence / work-item ledger (Feature 20 §8.3 #2).
  PATTERN: Thin wrapper over AtomicPartLedgerEditor with SERVICE shape gate only.
-->
<script setup lang="ts">
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import AtomicPartLedgerEditor from './AtomicPartLedgerEditor.vue'

defineProps<{
  blockInstanceId: string
}>()

const SERVICE_TYPES = [BLOCK_SHAPE_TYPES.SERVICE] as const
</script>

<template>
  <AtomicPartLedgerEditor
    :block-instance-id="blockInstanceId"
    :allowed-shape-types="SERVICE_TYPES"
    title="Work items"
    subtitle="Parts on this service — where base time and fee live. Add a part type, then edit values (saves when you leave a field)."
  />
</template>
