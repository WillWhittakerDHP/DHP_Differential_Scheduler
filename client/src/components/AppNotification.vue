<!--
  LEARNING: Global Notification Component
  WHY: Provides app-wide snackbar notifications
  PATTERN: VSnackbar component that reads from useNotification composable
  COMPARISON: React uses Ant Design message. Vue uses VSnackbar
-->
<script setup lang="ts">
import { computed, watch } from 'vue'
import { useNotification } from '@/composables/useNotification'

/**
 * LEARNING: Notification composable
 * WHY: Provides shared notification state and methods
 * PATTERN: useNotification composable with singleton state
 */
const { notification, showNotification, close } = useNotification()

/**
 * LEARNING: Computed message for proper reactivity tracking
 * WHY: Ensures slot content is tracked within render function
 * PATTERN: Computed property for slot content
 */
const message = computed(() => notification.value?.message || '')
const color = computed(() => notification.value?.color || 'info')
const timeout = computed(() => notification.value?.timeout || 4000)

// #region agent log
watch(() => notification.value, (newVal) => {
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppNotification.vue:26',message:'Notification changed',data:{hasNotification:!!newVal,message:newVal?.message,showNotification:showNotification.value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
}, { immediate: true })
// #endregion
</script>

<template>
  <!--
    LEARNING: VSnackbar component for notifications
    WHY: Provides toast-style notifications at the bottom of the screen
    PATTERN: VSnackbar with default slot for message (not text prop) to avoid slot invocation warning
    WHY: Using default slot instead of text prop ensures slot is invoked within render function for proper reactivity tracking
  -->
  <VSnackbar
    v-if="notification"
    v-model="showNotification"
    :color="color"
    :timeout="timeout"
    location="bottom"
    @update:model-value="(value) => !value && close()"
  >
    {{ message }}
    <template #actions="{ close: snackbarClose }">
      <VBtn
        icon="tabler-x"
        variant="text"
        density="comfortable"
        @click="() => { snackbarClose(); close() }"
      />
    </template>
  </VSnackbar>
</template>

<style scoped>
/* No custom styles needed - Vuexy components handle styling */
</style>

