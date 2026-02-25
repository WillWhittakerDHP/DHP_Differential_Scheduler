<!--
  LEARNING: Entity Card Fee Preview Widget
  WHY: Shows fee vs sqft for this block instance so admins can see cost in context while editing
  PATTERN: usePartsTotals for data; compact SVG line + sqft input and cost output; same formula as confirmation step
-->
<template>
  <div v-if="showPreview" class="entity-card-fee-preview">
    <VCard variant="outlined" density="compact" class="fee-preview-card">
      <VCardTitle class="text-caption d-flex align-center gap-1 py-2">
        <VIcon icon="tabler-chart-line" size="small" />
        Fee at square footage
      </VCardTitle>
      <VCardText class="pt-0 pb-2">
        <div class="mini-chart-wrap">
          <svg
            :viewBox="`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`"
            class="fee-preview-svg"
            aria-label="Fee vs square footage for this service"
          >
            <line
              :x1="PAD.left"
              :y1="PAD.top"
              :x2="PAD.left"
              :y2="CHART_HEIGHT - PAD.bottom"
              stroke="currentColor"
              stroke-opacity="0.4"
              stroke-width="1"
            />
            <line
              :x1="PAD.left"
              :y1="CHART_HEIGHT - PAD.bottom"
              :x2="CHART_WIDTH - PAD.right"
              :y2="CHART_HEIGHT - PAD.bottom"
              stroke="currentColor"
              stroke-opacity="0.4"
              stroke-width="1"
            />
            <polyline
              v-if="svgLine.points"
              :points="svgLine.points"
              :stroke="svgLine.color"
              fill="none"
              stroke-width="2"
              vector-effect="non-scaling-stroke"
            />
          </svg>
        </div>
        <div class="d-flex align-center flex-wrap gap-3 mt-2">
          <div class="d-flex align-center gap-2">
            <label for="fee-preview-sqft" class="text-caption text-medium-emphasis">Sq ft</label>
            <VTextField
              id="fee-preview-sqft"
              v-model.number="sqftInput"
              type="number"
              min="0"
              density="compact"
              hide-details
              variant="outlined"
              class="fee-preview-sqft-input fee-preview-sqft-max-width"
              aria-label="Square footage for cost preview"
            />
          </div>
          <div class="d-flex align-center gap-1">
            <span class="text-caption text-medium-emphasis">Cost:</span>
            <span class="text-body-2 font-weight-medium">{{ formatCurrency(computedCost) }}</span>
          </div>
        </div>
      </VCardText>
    </VCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePartsTotals } from '@/composables/admin/usePartsTotals'
import { useFeePreview } from '@/composables/admin/useFeePreview'
import type { EntityCardSharedProps } from './entityCardConstants'

const CHART_WIDTH = 280
const CHART_HEIGHT = 90
const PAD = { left: 32, right: 12, top: 8, bottom: 20 }

type Props = EntityCardSharedProps
const props = defineProps<Props>()

const { canHaveParts, totalBaseFee, totalRateOverBaseFee } = usePartsTotals(props.entityKey, props.entityId)
const showPreview = computed(() => props.entityKey === 'blockInstance' && canHaveParts.value)
const { sqftInput, computedCost, svgLine } = useFeePreview({
  totalBaseFee,
  totalRateOverBaseFee,
  showPreview,
})

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`
}
</script>

<style scoped>
.entity-card-fee-preview {
  margin-bottom: 1rem;
}

.fee-preview-card {
  border-radius: 8px;
}

.mini-chart-wrap {
  min-height: 90px;
}

.fee-preview-svg {
  width: 100%;
  max-width: 280px;
  height: auto;
  display: block;
}

.fee-preview-sqft-max-width {
  max-width: 100px;
}

.fee-preview-sqft-input :deep(input[type="number"]) {
  -moz-appearance: textfield;
}

.fee-preview-sqft-input :deep(input[type="number"]::-webkit-outer-spin-button),
.fee-preview-sqft-input :deep(input[type="number"]::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}
</style>
