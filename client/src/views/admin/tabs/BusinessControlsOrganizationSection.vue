<!--
  WHY: Phase 6.14 — edit persisted OrganizationDefaults JSON (merge-at-read baseline).
  PATTERN: Thin template; mutates shared object from composable.
-->
<script setup lang="ts">
/* eslint-disable vue/no-mutating-props -- Deep form: OrganizationDefaults object is owned by useAdminOrganizationDefaults formData ref (same pattern as availability slices). */
import type { OrganizationDefaults } from '@shared/types/organizationDefaults'

defineProps<{
  model: OrganizationDefaults
}>()
</script>

<template>
  <div class="organization-defaults-section">
    <VCard class="mb-4" variant="outlined">
      <VCardTitle class="text-subtitle-1">Time &amp; rounding</VCardTitle>
      <VCardText>
        <VRow>
          <VCol cols="12" md="4">
            <VTextField
              v-model.number="model.timeAndRounding.minuteIncrement"
              label="Minute increment"
              type="number"
              min="1"
              step="1"
              density="comfortable"
              hide-details="auto"
            />
          </VCol>
          <VCol cols="12" md="4">
            <VSwitch
              v-model="model.timeAndRounding.durationRounding.enabled"
              label="Duration rounding enabled"
              color="primary"
              hide-details
            />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField
              v-model.number="model.timeAndRounding.durationRounding.increment"
              label="Rounding increment (minutes)"
              type="number"
              min="1"
              step="1"
              density="comfortable"
              hide-details="auto"
            />
          </VCol>
          <VCol cols="12" md="4">
            <VSelect
              v-model="model.timeAndRounding.durationRounding.method"
              label="Rounding method"
              :items="[
                { title: 'Round up', value: 'roundUp' },
                { title: 'Round down', value: 'roundDown' },
                { title: 'Round nearest', value: 'roundNearest' },
              ]"
              item-title="title"
              item-value="value"
              density="comfortable"
              hide-details="auto"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <VCard class="mb-4" variant="outlined">
      <VCardTitle class="text-subtitle-1">Drive-time fee (billing)</VCardTitle>
      <VCardText>
        <VRow>
          <VCol cols="12" md="4">
            <VTextField
              v-model.number="model.driveTimeFee.complimentaryDriveMinutes"
              label="Complimentary drive (minutes)"
              type="number"
              min="0"
              step="1"
              density="comfortable"
              hide-details="auto"
            />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField
              v-model.number="model.driveTimeFee.drivingRatePerHour"
              label="Rate per hour"
              type="number"
              min="0"
              step="0.01"
              density="comfortable"
              hide-details="auto"
            />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField
              v-model.number="model.driveTimeFee.driveTimeRoundingMinutes"
              label="Billable rounding (minutes)"
              type="number"
              min="1"
              step="1"
              density="comfortable"
              hide-details="auto"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <VCard class="mb-4" variant="outlined">
      <VCardTitle class="text-subtitle-1">Holds &amp; admin entry</VCardTitle>
      <VCardText>
        <VRow>
          <VCol cols="12" md="3">
            <VTextField
              v-model.number="model.holdsAndAdminEntry.holdDurationMinutes"
              label="Hold duration (minutes)"
              type="number"
              min="1"
              step="1"
              density="comfortable"
              hide-details="auto"
            />
          </VCol>
          <VCol cols="12" md="3">
            <VTextField
              v-model.number="model.holdsAndAdminEntry.holdDurationMin"
              label="Hold min"
              type="number"
              min="1"
              step="1"
              density="comfortable"
              hide-details="auto"
            />
          </VCol>
          <VCol cols="12" md="3">
            <VTextField
              v-model.number="model.holdsAndAdminEntry.holdDurationMax"
              label="Hold max"
              type="number"
              min="1"
              step="1"
              density="comfortable"
              hide-details="auto"
            />
          </VCol>
          <VCol cols="12" md="3">
            <VTextField
              v-model.number="model.holdsAndAdminEntry.holdDurationFallback"
              label="Hold fallback"
              type="number"
              min="1"
              step="1"
              density="comfortable"
              hide-details="auto"
            />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField
              v-model.number="model.holdsAndAdminEntry.adminEntryTimeout.value"
              label="Admin entry timeout value"
              type="number"
              min="1"
              step="1"
              density="comfortable"
              hide-details="auto"
            />
          </VCol>
          <VCol cols="12" md="4">
            <VSelect
              v-model="model.holdsAndAdminEntry.adminEntryTimeout.unit"
              label="Admin entry timeout unit"
              :items="[
                { title: 'Days', value: 'days' },
                { title: 'Weeks', value: 'weeks' },
              ]"
              item-title="title"
              item-value="value"
              density="comfortable"
              hide-details="auto"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <VCard v-if="model.constraintBaselines" variant="outlined">
      <VCardTitle class="text-subtitle-1">Constraint baselines (optional)</VCardTitle>
      <VCardText>
        <VRow>
          <VCol cols="12" md="4">
            <VTextField
              v-model.number="model.constraintBaselines.leadTimeMinutes"
              label="Lead time baseline (minutes)"
              type="number"
              min="0"
              step="1"
              density="comfortable"
              hide-details="auto"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped>
.organization-defaults-section {
  max-width: 960px;
}
</style>
