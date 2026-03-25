<!--
  WHY: Admin brand anchors + logo (session 6.15.2.2); uses `useWizardBrandSettings` + `WIZARD_FORM_DATA_KEY`.
  PATTERN: Thin template; orchestration in composable; save via parent Save settings.
-->
<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { WIZARD_FORM_DATA_KEY } from '../businessControlsStateKey'
import { useWizardBrandSettings } from '@/composables/admin/useWizardBrandSettings'
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import { createLogger } from '@/utils/logger'
import { DEFAULT_BRAND_MODE_PALETTE_DELTAS, DEFAULT_BRAND_WARNING_PALETTE_ADJUSTERS } from '@/utils/theme'

const logger = createLogger('WizardBrandPanel')

const wizardFormRef = inject(WIZARD_FORM_DATA_KEY, null)
const brand = wizardFormRef ? useWizardBrandSettings(wizardFormRef) : null
const UI = BUSINESS_CONTROLS_TAB_STRINGS.brand

const uploading = computed(() => brand?.uploading.value ?? false)
const previewStandard = computed(() => (brand ? brand.previewPalettes.value.standard : null))

const lastFile = ref<File | null>(null)
const localError = ref<string | null>(null)
const extracting = ref(false)

const D = DEFAULT_BRAND_MODE_PALETTE_DELTAS
const W = DEFAULT_BRAND_WARNING_PALETTE_ADJUSTERS

const quoteHuePercent = computed({
  get(): number {
    const row = wizardFormRef?.value
    const fr = row?.brandQuoteHueCircleFraction
    const v = typeof fr === 'number' && !Number.isNaN(fr) ? fr : D.quoteHueCircleFraction
    return Math.round(v * 1000) / 10
  },
  set(v: number) {
    if (!wizardFormRef?.value) return
    const n = Number(v)
    if (!Number.isFinite(n)) return
    wizardFormRef.value.brandQuoteHueCircleFraction = Math.min(100, Math.max(0, n)) / 100
  },
})

const quoteChromaFactor = computed({
  get(): number {
    const row = wizardFormRef?.value
    const x = row?.brandQuoteChromaFactor
    const v = typeof x === 'number' && !Number.isNaN(x) ? x : D.quoteChromaFactor
    return Math.round(v * 1000) / 1000
  },
  set(v: number) {
    if (!wizardFormRef?.value) return
    const n = Number(v)
    if (!Number.isFinite(n)) return
    wizardFormRef.value.brandQuoteChromaFactor = Math.min(2.5, Math.max(0.05, n))
  },
})

const rescheduleHuePercent = computed({
  get(): number {
    const row = wizardFormRef?.value
    const fr = row?.brandRescheduleHueCircleFraction
    const v = typeof fr === 'number' && !Number.isNaN(fr) ? fr : D.rescheduleHueCircleFraction
    return Math.round(v * 1000) / 10
  },
  set(v: number) {
    if (!wizardFormRef?.value) return
    const n = Number(v)
    if (!Number.isFinite(n)) return
    wizardFormRef.value.brandRescheduleHueCircleFraction = Math.min(100, Math.max(0, n)) / 100
  },
})

const rescheduleChromaFactor = computed({
  get(): number {
    const row = wizardFormRef?.value
    const x = row?.brandRescheduleChromaFactor
    const v = typeof x === 'number' && !Number.isNaN(x) ? x : D.rescheduleChromaFactor
    return Math.round(v * 1000) / 1000
  },
  set(v: number) {
    if (!wizardFormRef?.value) return
    const n = Number(v)
    if (!Number.isFinite(n)) return
    wizardFormRef.value.brandRescheduleChromaFactor = Math.min(2.5, Math.max(0.05, n))
  },
})

const warningHuePercent = computed({
  get(): number {
    const row = wizardFormRef?.value
    const fr = row?.brandWarningHueCircleFraction
    const v = typeof fr === 'number' && !Number.isNaN(fr) ? fr : W.warningHueCircleFraction
    return Math.round(v * 1000) / 10
  },
  set(v: number) {
    if (!wizardFormRef?.value) return
    const n = Number(v)
    if (!Number.isFinite(n)) return
    wizardFormRef.value.brandWarningHueCircleFraction = Math.min(100, Math.max(0, n)) / 100
  },
})

const warningChromaFactor = computed({
  get(): number {
    const row = wizardFormRef?.value
    const x = row?.brandWarningChromaFactor
    const v = typeof x === 'number' && !Number.isNaN(x) ? x : W.warningChromaFactor
    return Math.round(v * 1000) / 1000
  },
  set(v: number) {
    if (!wizardFormRef?.value) return
    const n = Number(v)
    if (!Number.isFinite(n)) return
    wizardFormRef.value.brandWarningChromaFactor = Math.min(2.5, Math.max(0.05, n))
  },
})

function onFilePicked(files: File | File[] | null): void {
  if (!files) {
    lastFile.value = null
    return
  }
  const f = Array.isArray(files) ? files[0] : files
  lastFile.value = f ?? null
  localError.value = null
}

async function handleUploadLogo(): Promise<void> {
  if (!brand || !lastFile.value) {
    return
  }
  localError.value = null
  try {
    await brand.uploadLogo(lastFile.value)
  } catch (err: unknown) {
    logger.warn('Wizard logo upload failed in panel', { err })
    localError.value = UI.uploadFailed
  }
}

async function handleExtract(): Promise<void> {
  if (!brand || !lastFile.value) {
    return
  }
  localError.value = null
  extracting.value = true
  try {
    await brand.extractAnchorsFromFile(lastFile.value)
  } catch (err: unknown) {
    logger.warn('Extract brand anchors failed in panel', { err })
    localError.value = UI.extractFailed
  } finally {
    extracting.value = false
  }
}
</script>

<template>
  <div v-if="brand && wizardFormRef" class="mb-6">
    <VDivider class="my-6" />
    <div class="text-label-large mb-2">{{ UI.sectionTitle }}</div>
    <div class="text-body-small mb-4 text-medium-emphasis">{{ UI.sectionHint }}</div>

    <VAlert
      v-if="localError"
      type="error"
      variant="tonal"
      density="compact"
      class="mb-4"
      dismissible
      @click:close="localError = null"
    >
      {{ localError }}
    </VAlert>

    <div v-if="wizardFormRef.logoUrl" class="mb-4">
      <div class="text-body-small text-medium-emphasis mb-2">{{ UI.currentLogoAlt }}</div>
      <img
        :src="wizardFormRef.logoUrl"
        :alt="UI.currentLogoAlt"
        class="wizard-brand-panel__logo-thumb rounded"
      />
    </div>

    <VFileInput
      accept="image/png,image/jpeg,image/webp"
      :label="UI.logoLabel"
      :hint="UI.logoHint"
      persistent-hint
      prepend-icon="mdi-image-outline"
      density="comfortable"
      class="mb-4"
      @update:model-value="onFilePicked"
    />

    <div class="d-flex flex-wrap gap-2 mb-6">
      <VBtn
        color="primary"
        :loading="uploading"
        :disabled="!lastFile || uploading"
        @click="handleUploadLogo"
      >
        {{ UI.uploadButton }}
      </VBtn>
      <VBtn
        variant="tonal"
        :loading="extracting"
        :disabled="!lastFile || extracting || uploading"
        @click="handleExtract"
      >
        {{ UI.extractButton }}
      </VBtn>
    </div>

    <div class="text-body-small text-medium-emphasis mb-2 mt-2">{{ UI.modeDeltasTitle }}</div>
    <div class="text-body-small text-medium-emphasis mb-4">{{ UI.modeDeltasHint }}</div>

    <VRow class="mb-2">
      <VCol cols="12" sm="6">
        <VTextField
          v-model.number="quoteHuePercent"
          type="number"
          min="0"
          max="100"
          step="0.1"
          :label="UI.quoteHuePercentLabel"
          :hint="UI.quoteHuePercentHint"
          persistent-hint
          density="comfortable"
        />
      </VCol>
      <VCol cols="12" sm="6">
        <VTextField
          v-model.number="quoteChromaFactor"
          type="number"
          min="0.05"
          max="2.5"
          step="0.05"
          :label="UI.quoteChromaLabel"
          :hint="UI.quoteChromaHint"
          persistent-hint
          density="comfortable"
        />
      </VCol>
      <VCol cols="12" sm="6">
        <VTextField
          v-model.number="rescheduleHuePercent"
          type="number"
          min="0"
          max="100"
          step="0.1"
          :label="UI.rescheduleHuePercentLabel"
          :hint="UI.rescheduleHuePercentHint"
          persistent-hint
          density="comfortable"
        />
      </VCol>
      <VCol cols="12" sm="6">
        <VTextField
          v-model.number="rescheduleChromaFactor"
          type="number"
          min="0.05"
          max="2.5"
          step="0.05"
          :label="UI.rescheduleChromaLabel"
          :hint="UI.rescheduleChromaHint"
          persistent-hint
          density="comfortable"
        />
      </VCol>
    </VRow>

    <div class="text-body-small text-medium-emphasis mb-2 mt-2">{{ UI.warningAdjustersTitle }}</div>
    <div class="text-body-small text-medium-emphasis mb-4">{{ UI.warningAdjustersHint }}</div>

    <VRow class="mb-2">
      <VCol cols="12" sm="6">
        <VTextField
          v-model.number="warningHuePercent"
          type="number"
          min="0"
          max="100"
          step="0.1"
          :label="UI.warningHuePercentLabel"
          :hint="UI.warningHuePercentHint"
          persistent-hint
          density="comfortable"
        />
      </VCol>
      <VCol cols="12" sm="6">
        <VTextField
          v-model.number="warningChromaFactor"
          type="number"
          min="0.05"
          max="2.5"
          step="0.05"
          :label="UI.warningChromaLabel"
          :hint="UI.warningChromaHint"
          persistent-hint
          density="comfortable"
        />
      </VCol>
    </VRow>

    <VRow>
      <VCol cols="12" sm="6">
        <VTextField
          :model-value="wizardFormRef.brandPrimaryHex ?? ''"
          :label="UI.primaryHexLabel"
          :hint="UI.primaryHexHint"
          persistent-hint
          density="comfortable"
          @update:model-value="(v: string) => { if (wizardFormRef) wizardFormRef.brandPrimaryHex = v }"
        />
      </VCol>
      <VCol cols="12" sm="6">
        <VTextField
          :model-value="wizardFormRef.brandSecondaryHex ?? ''"
          :label="UI.secondaryHexLabel"
          :hint="UI.secondaryHexHint"
          persistent-hint
          density="comfortable"
          @update:model-value="(v: string) => { if (wizardFormRef) wizardFormRef.brandSecondaryHex = v }"
        />
      </VCol>
    </VRow>

    <div class="text-body-small text-medium-emphasis mb-2 mt-2">{{ UI.previewTitle }}</div>
    <div class="d-flex flex-wrap gap-4">
      <div class="text-center">
        <div
          class="wizard-brand-panel__swatch rounded mb-1"
          :style="{ backgroundColor: previewStandard?.primary ?? 'transparent' }"
        />
        <div class="text-caption">{{ UI.previewPrimary }}</div>
      </div>
      <div class="text-center">
        <div
          class="wizard-brand-panel__swatch rounded mb-1"
          :style="{ backgroundColor: previewStandard?.secondary ?? 'transparent' }"
        />
        <div class="text-caption">{{ UI.previewSecondary }}</div>
      </div>
      <div class="text-center">
        <div
          class="wizard-brand-panel__swatch rounded mb-1"
          :style="{ backgroundColor: previewStandard?.warning ?? 'transparent' }"
        />
        <div class="text-caption">{{ UI.previewWarning }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wizard-brand-panel__logo-thumb {
  max-width: 200px;
  max-height: 80px;
  object-fit: contain;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.wizard-brand-panel__swatch {
  width: 44px;
  height: 44px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
