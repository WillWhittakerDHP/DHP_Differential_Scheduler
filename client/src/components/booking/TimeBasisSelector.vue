<script setup lang="ts">


import { timeBasisHandler, type TimeBasisHandlerProps, type TimeBasisHandlerEmits } from '@/utils/booking/timeBasisHandler'
import { useWizardSettings } from '@/composables/admin/useWizardSettings'

const props = defineProps<TimeBasisHandlerProps>()
const emit = defineEmits<TimeBasisHandlerEmits>()

const { majorLabel, minorLabel } = useWizardSettings()

// FIX: Use shared time basis handler from composable
const { handleTimeBasisClick } = timeBasisHandler(props, emit)
</script>

<template>
  <!-- WHY: Allows switching between major and minor time views for differential services -->
  <div v-if="isDifferentialService" class="d-flex flex-column flex-sm-row align-sm-center align-start mb-4 mb-sm-6 toggle-buttons">
    <div class="d-flex gap-2 flex-wrap">
      <VBtn
        :variant="startTimeType === 'major' ? 'flat' : 'outlined'"
        color="primary"
        size="small"
        class="flex-shrink-0"
        @click="handleTimeBasisClick('major')"
      >
        {{ majorLabel }} Times
      </VBtn>
      <VBtn
        :variant="startTimeType === 'minor' ? 'flat' : 'outlined'"
        color="secondary"
        size="small"
        class="flex-shrink-0"
        @click="handleTimeBasisClick('minor')"
      >
        {{ minorLabel }} Times
      </VBtn>
    </div>
  </div>
</template>

<style scoped lang="scss">
.toggle-buttons {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}
</style>
