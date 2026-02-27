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
    WHY: Use text prop (not default slot) so content is rendered inside VSnackbar's render function.
    PATTERN: Avoids "Slot default invoked outside of the render function" when overlay/transition invokes slots.
  -->
  <VSnackbar
    v-if="notification"
    v-model="showNotification"
    :text="message"
    :color="color"
    :timeout="timeout"
    location="bottom"
    @update:model-value="(value) => !value && close()"
  >
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

