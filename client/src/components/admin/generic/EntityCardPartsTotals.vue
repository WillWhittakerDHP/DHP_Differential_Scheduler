<!--
  WHY: Displays uneditable summary fields showing totals from all parts
  PATTERN: Simple text display at top of card when entity can have parts
-->
<template>
  <div v-if="canHaveParts" class="parts-totals-section">
    <!-- WHY: Clean, minimal display without form fields -->
    <!-- PATTERN: Plain text with labels and formatted values -->
    <div class="d-flex flex-wrap gap-4">
      <div>
        <span class="text-body-medium text-medium-emphasis">Base Fee:</span>
        <span class="text-body-large ml-2">{{ formatCurrency(totalBaseFee) }}</span>
      </div>
      <div>
        <span class="text-body-medium text-medium-emphasis">Base Time:</span>
        <span class="text-body-large ml-2">{{ formatDuration(totalBaseTime) }}</span>
      </div>
      <div>
        <span class="text-body-medium text-medium-emphasis">Fee per unit:</span>
        <span class="text-body-large ml-2">{{ formatCurrency(totalFeePerUnit) }}</span>
      </div>
      <div>
        <span class="text-body-medium text-medium-emphasis">Time per unit:</span>
        <span class="text-body-large ml-2">{{ formatRate(totalTimePerUnit) }}</span>
      </div>
      <div>
        <span class="text-body-medium text-medium-emphasis">Base multiplier:</span>
        <span class="text-body-large ml-2">{{ formatMultiplier(totalBaseMultiplier) }}</span>
      </div>
      <div>
        <span class="text-body-medium text-medium-emphasis">Rate multiplier:</span>
        <span class="text-body-large ml-2">{{ formatMultiplier(totalRateMultiplier) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePartsTotals } from '@/composables/admin/usePartsTotals'
import { formatDuration } from '@/utils/time/timeFormatting'
import type { EntityCardSharedProps } from './entityCardConstants'

type Props = EntityCardSharedProps

const props = defineProps<Props>()

/**
 * WHY: Use parts totals composable
PATTERN: Composable handles all logic, compo...
 */
const {
  canHaveParts,
  totalBaseFee,
  totalBaseTime,
  totalFeePerUnit,
  totalTimePerUnit,
  totalBaseMultiplier,
  totalRateMultiplier
} = usePartsTotals(props.entityKey, props.entityId)

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`
}

function formatRate(rate: number): string {
  return rate.toFixed(2)
}

function formatMultiplier(multiplier: number): string {
  return `${multiplier.toFixed(2)}x`
}
</script>

<style scoped>
.parts-totals-section {
}
</style>
