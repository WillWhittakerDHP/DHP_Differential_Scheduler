<!--
  LEARNING: Global Notification Component
  WHY: Provides app-wide snackbar notifications
  PATTERN: VSnackbar component that reads from useNotification composable
  COMPARISON: React uses Ant Design message. Vue uses VSnackbar
-->
<script setup lang="ts">
import { computed } from 'vue'
import { asEmptyString } from '@/utils/safeDefaults'
import { useNotification } from '@/composables/useNotification'

/**
 * WHY: Notification composable
PATTERN: useNotification composable with singlet...
 */
const { notification, showNotification, close } = useNotification()

/**
 * LEARNING: Computed message for proper reactivity tracking
 */
const message = computed(() => asEmptyString(notification.value?.message))
const color = computed(() => notification.value?.color || 'info')
const timeout = computed(() => notification.value?.timeout || 4000)
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
    <template #actions>
      <VBtn
        icon="tabler-x"
        variant="text"
        density="comfortable"
        @click="close"
      />
    </template>
  </VSnackbar>
</template>

<style scoped>
</style>

