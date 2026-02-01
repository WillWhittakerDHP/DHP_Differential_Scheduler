<!--
  LEARNING: Entity Card Parts Totals Component
  WHY: Displays uneditable summary fields showing totals from all parts
  PATTERN: Simple text display at top of card when entity can have parts
-->
<template>
  <div v-if="canHaveParts" class="parts-totals-section">
    <!-- LEARNING: Simple text display of parts totals -->
    <!-- WHY: Clean, minimal display without form fields -->
    <!-- PATTERN: Plain text with labels and formatted values -->
    <div class="d-flex flex-wrap gap-4">
      <div>
        <span class="text-body-2 text-medium-emphasis">Base Fee:</span>
        <span class="text-body-1 ml-2">{{ formatCurrency(totalBaseFee) }}</span>
      </div>
      <div>
        <span class="text-body-2 text-medium-emphasis">Base Time:</span>
        <span class="text-body-1 ml-2">{{ formatDuration(totalBaseTime) }}</span>
      </div>
      <div>
        <span class="text-body-2 text-medium-emphasis">Overage Rate ($/sq ft):</span>
        <span class="text-body-1 ml-2">{{ formatCurrency(totalRateOverBaseFee) }}</span>
      </div>
      <div>
        <span class="text-body-2 text-medium-emphasis">Overage Rate (sq ft/hr):</span>
        <span class="text-body-1 ml-2">{{ formatRate(totalRateOverBaseTime) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePartsTotals } from '@/composables/admin/usePartsTotals'
import { formatDuration } from '@/utils/time/timeFormatting'
import type { GlobalEntityKey } from '@/constants/entities'

interface Props {
  entityKey: GlobalEntityKey
  entityId: string
}

const props = defineProps<Props>()

/**
 * LEARNING: Use parts totals composable
 * WHY: Provides reactive totals calculation and canHaveParts flag
 * PATTERN: Composable handles all logic, component just displays
 */
const {
  canHaveParts,
  totalBaseFee,
  totalBaseTime,
  totalRateOverBaseFee,
  totalRateOverBaseTime
} = usePartsTotals(props.entityKey, props.entityId)

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`
}

function formatRate(rate: number): string {
  return rate.toFixed(2)
}
</script>

<style scoped>
.parts-totals-section {
  /* Add any specific styling if needed */
}
</style>
