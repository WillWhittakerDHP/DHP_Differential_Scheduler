<template>
  <tbody>
    <tr
      v-for="item in preview"
      :key="item.componentId"
    >
      <td>{{ getComponentName(item.componentId) }}</td>
      <td>{{ formatValue(item.currentValue) }}</td>
      <td>{{ formatValue(item.newValue) }}</td>
      <td>
        <VChip
          :color="item.change >= 0 ? 'success' : 'error'"
          size="small"
        >
          {{ item.change >= 0 ? '+' : '' }}{{ formatValue(item.change) }}
        </VChip>
      </td>
      <td v-if="selectedStrategy === 'manual'">
        <VTextField
          :model-value="manualValues[item.componentId]"
          type="number"
          density="compact"
          variant="outlined"
          @update:model-value="(v) => setManualValue(item.componentId, Number(v))"
        />
      </td>
    </tr>
  </tbody>
</template>

<script setup lang="ts">
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { DistributionStrategy, DistributionPreview } from '@/types/component'

defineProps<{
  preview: DistributionPreview[]
  selectedStrategy: DistributionStrategy
  manualValues: Record<GlobalEntityId, number>
  getComponentName: (id: GlobalEntityId) => string
  formatValue: (value: number) => string
  setManualValue: (componentId: GlobalEntityId, value: number) => void
}>()
</script>
