<!-- Extracted from AppointmentsTable for component-health (allowlist repair). -->
<script setup lang="ts">
import { APPOINTMENTS_TABLE_UI } from '@/constants/appointmentsTableConstants'
import type { PropertyResponse } from '@/types/property'

defineProps<{
  property: PropertyResponse | undefined | null
}>()
</script>

<template>
  <div class="tooltip-content">
    <template v-if="property">
      <div class="tooltip-title">{{ APPOINTMENTS_TABLE_UI.PROPERTY_TOOLTIP_TITLE }}</div>
      <div><strong>{{ APPOINTMENTS_TABLE_UI.ADDRESS }}:</strong> {{ property.address }}</div>
      <div v-if="property.unit">
        <strong>{{ APPOINTMENTS_TABLE_UI.UNIT }}:</strong> {{ property.unit }}
      </div>
      <div>
        <strong>{{ APPOINTMENTS_TABLE_UI.LOCATION }}:</strong>
        {{ property.city }}, {{ property.state }} {{ property.zipCode }}
      </div>
      <div v-if="property.squareFootage">
        <strong>{{ APPOINTMENTS_TABLE_UI.SQ_FT }}:</strong> {{ property.squareFootage?.toLocaleString() }}
      </div>
      <div v-if="property.bedrooms">
        <strong>{{ APPOINTMENTS_TABLE_UI.BEDROOMS }}:</strong> {{ property.bedrooms }}
      </div>
      <div v-if="property.bathrooms">
        <strong>{{ APPOINTMENTS_TABLE_UI.BATHROOMS }}:</strong> {{ property.bathrooms }}
      </div>
      <div v-if="property.foundationAccess">
        <strong>{{ APPOINTMENTS_TABLE_UI.FOUNDATION }}:</strong> {{ property.foundationAccess }}
      </div>
      <div v-if="property.mlsNumber">
        <strong>{{ APPOINTMENTS_TABLE_UI.MLS }}:</strong> {{ property.mlsNumber }}
      </div>
      <div class="tooltip-hint">{{ APPOINTMENTS_TABLE_UI.CLICK_PROPERTIES_TAB }}</div>
    </template>
    <template v-else>
      <div>{{ APPOINTMENTS_TABLE_UI.PROPERTY_NOT_FOUND }}</div>
    </template>
  </div>
</template>

<style scoped>
.tooltip-content {
  padding: 8px;
  min-width: 200px;
}
.tooltip-title {
  font-weight: bold;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.3);
}
.tooltip-content div {
  margin-bottom: 4px;
}
.tooltip-hint {
  margin-top: 8px;
  font-size: 0.85em;
  opacity: 0.7;
  font-style: italic;
}
</style>
