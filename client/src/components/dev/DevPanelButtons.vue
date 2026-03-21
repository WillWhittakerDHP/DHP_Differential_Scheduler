<script setup lang="ts">

import { computed } from 'vue'
import { useDevPanelButtonsInject } from '@/composables/booking/useDevPanelButtonsInject'

const { devPanelButtons } = useDevPanelButtonsInject()

const hasDevPanelButtons = computed(() => {
  return devPanelButtons.value !== null
})
</script>

<template>
  <VCardText v-if="hasDevPanelButtons" class="pa-2 pb-1">
    <VRow v-if="devPanelButtons" density="compact">
      <VCol cols="12" class="d-flex gap-2 mb-2 align-center">
        <VBtn
          color="secondary"
          variant="outlined"
          size="small"
          prepend-icon="tabler-refresh"
          @click="() => devPanelButtons?.handleResetWizard?.()"
        >
          RESET WIZARD
        </VBtn>
      </VCol>
    </VRow>
  </VCardText>
</template>
