<script setup lang="ts">
/**
 * TimeBasisSelector Component
 * 
 * LEARNING: Toggle buttons for switching between Inspector and Client time views
 * WHY: Encapsulates time basis selection logic and UI for differential services
 * PATTERN: Self-contained component with props/events for parent communication
 * 
 * Features:
 * - Inspector/Client toggle buttons for differential services
 * - Conditional rendering based on isDifferentialService
 * - Toggle logic: clicking selected button switches to other, clicking active selects it
 * - Responsive layout with mobile-first design
 */


import { useTimeBasisHandler, type TimeBasisHandlerProps, type TimeBasisHandlerEmits } from '@/composables/booking/useTimeBasisHandler'

interface Props {
  isDifferentialService: boolean
  startTimeType: 'inspector' | 'client' | 'nonDifferential'
}

const props = defineProps<Props>()

interface Emits {
  (e: 'time-basis-change', type: 'inspector' | 'client'): void
}

const emit = defineEmits<Emits>()

// FIX: Use shared time basis handler from composable
const { handleTimeBasisClick } = useTimeBasisHandler(props as TimeBasisHandlerProps, emit as unknown as TimeBasisHandlerEmits)
</script>

<template>
  <!-- LEARNING: Inspector/Client Toggle Buttons -->
  <!-- WHY: Allows switching between Inspector and Client time views for differential services -->
  <!-- PATTERN: Conditional rendering based on isDifferentialService -->
  <!-- USER_STORY: Both buttons Active by default (neither Selected), toggle between Selected/Active -->
  <!-- LEARNING: Use Vuetify responsive flex utilities for true responsive behavior -->
  <!-- WHY: flex-column on mobile, flex-row on sm+ breakpoint - buttons stack when column is narrow -->
  <div v-if="isDifferentialService" class="d-flex flex-column flex-sm-row align-sm-center align-start mb-4 mb-sm-6 toggle-buttons">
    <div class="d-flex gap-2 flex-wrap">
      <VBtn
        :variant="startTimeType === 'inspector' ? 'flat' : 'outlined'"
        color="primary"
        size="small"
        class="flex-shrink-0"
        @click="handleTimeBasisClick('inspector')"
      >
        Inspector Times
      </VBtn>
      <VBtn
        :variant="startTimeType === 'client' ? 'flat' : 'outlined'"
        color="secondary"
        size="small"
        class="flex-shrink-0"
        @click="handleTimeBasisClick('client')"
      >
        Client Times
      </VBtn>
    </div>
  </div>
</template>

<style scoped lang="scss">
// LEARNING: Toggle buttons responsive alignment
// WHY: Ensures component respects parent column width and doesn't overflow
// PATTERN: Use Vuetify responsive utilities, minimal custom CSS
.toggle-buttons {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  min-width: 0; // LEARNING: Allow flex container to shrink below content size
  // WHY: Prevents flex container from forcing width beyond parent column
}
</style>
