<template>
  <!-- 
    LEARNING: Vuexy App component with theme and RTL support
    WHY: Provides app-level layout, theming, and RTL support
    PATTERN: VLocaleProvider wraps app for RTL, VApp provides theme context
    COMPARISON: React uses ThemeProvider. Vue uses VApp with VLocaleProvider
  -->
  <VLocaleProvider :rtl="configStore.isAppRTL">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp :style="`--v-global-theme-primary: ${hexToRgb(global.current.value.colors.primary)}`">
      <RouterView />
      <AppNotification />
      
      <!-- 
        Dev Panel System (dev mode only) 
        LEARNING: Show both dev panels on non-admin routes (wizard)
        WHY: Wizard needs both booking debug panel and API debug panel
        PATTERN: Conditionally render based on route
      -->
      <!-- 
        Dev Panel System (dev mode only) 
        LEARNING: Show both dev panels on non-admin routes (wizard)
        WHY: Wizard needs both booking debug panel and API debug panel
        PATTERN: Conditionally render based on route
      -->
      <template v-if="isDevMode && !isAdminRoute">
        <ApiDevPanel :visible="apiDevPanelVisible" @close="apiDevPanelVisible = false" />
        <DevPanelsContainer :visible="debugPanelVisible" @close="debugPanelVisible = false" />
        <DevPanelToggle @toggle="handleSlotPanelToggle" />
        <VBtn
          color="error"
          variant="elevated"
          class="wizard-api-toggle"
          @click="handleApiPanelToggle"
        >
          <span class="button-label">api</span>
          <VTooltip activator="parent" location="left">
            API Dev Panel
          </VTooltip>
        </VBtn>
      </template>
    </VApp>
  </VLocaleProvider>
</template>

<script setup lang="ts">
/**
 * App Root Component - Vuexy Integration
 * 
 * LEARNING: Root component with Vuexy layout system
 * WHY: Provides app-level structure, theme, and router outlet
 * PATTERN: Uses Vuexy's VApp and VLocaleProvider components
 * COMPARISON: React App.tsx. Vue App.vue with Vuexy components
 */

import { useTheme } from 'vuetify'
import { ref, provide, computed, type Ref, type ComputedRef } from 'vue'
import { useRoute } from 'vue-router'
import AppNotification from '@/components/AppNotification.vue'
import DevPanelToggle from '@/components/booking/dev/DevPanelToggle.vue'
import DevPanelsContainer from '@/components/booking/dev/DevPanelsContainer.vue'
import ApiDevPanel from '@/components/admin/dev/ApiDevPanel.vue'
import { isDevModeEnabled } from '@/utils/env/devMode'
import initCore from '@core/initCore'
import { initConfigStore, useConfigStore } from '@core/stores/config'
import { hexToRgb } from '@core/utils/colorConverter'
import type { AppointmentResponse } from '@/types/appointment'
import { useBookingWizard } from '@/composables/useBookingWizard'

const { global } = useTheme()
const route = useRoute()

/**
 * LEARNING: Check if current route is admin page
 * WHY: Admin page has its own ApiDevPanel, so hide global booking wizard dev panel
 * PATTERN: Reactive computed based on route path
 */
const isAdminRoute = computed(() => route.path.startsWith('/admin'))

// WHY: Vuetify composables require Vue component context
initCore()
initConfigStore()

const configStore = useConfigStore()

/**
 * WHY: Initializing here ensures global data is available before route-specific contexts initialize
 * PATTERN: Only initialize shared/base composables at app root level
 */
import { useGlobal } from './composables/useGlobal'

useGlobal()

// LEARNING: Dev panel visibility state
// PATTERN: Reactive ref passed as prop to DevPanelsContainer
const isDevMode = isDevModeEnabled()
const debugPanelVisible = ref(false)
const apiDevPanelVisible = ref(false)

// Handle slot panel toggle - close API panel if open
const handleSlotPanelToggle = (): void => {
  if (apiDevPanelVisible.value) {
    apiDevPanelVisible.value = false
  }
  debugPanelVisible.value = !debugPanelVisible.value
}

// Handle API panel toggle - close slot panel if open
const handleApiPanelToggle = (): void => {
  if (debugPanelVisible.value) {
    debugPanelVisible.value = false
  }
  apiDevPanelVisible.value = !apiDevPanelVisible.value
}

const devPanelButtons = ref<{
  selectedAppointmentId: Ref<string | null>
  appointmentDropdownItems: ComputedRef<Array<{ text: string; value: string }>>
  loadedAppointmentId: Ref<string | null>
  isLoadingAppointment: Ref<boolean>
  fetchAll: { isLoading: Ref<boolean>; data: Ref<AppointmentResponse[]> }
  handleLoadAppointment: (id: string | null) => Promise<void>
  handleResetWizard: () => void
  handleResetMocks: () => void
  wizard: ReturnType<typeof useBookingWizard> | null
} | null>(null)
provide('devPanelButtons', devPanelButtons)
</script>

<style>
/* Global styles */
#app {
  width: 100%;
  min-height: 100vh;
}

/* Wizard dev panel buttons - positioned at top-right, stacked vertically */
.wizard-api-toggle {
  position: fixed;
  top: 72px; /* 24px (top) + 48px (button height + gap) */
  right: 24px;
  z-index: 999;
  box-shadow: 0 4px 12px rgba(var(--v-theme-on-surface), 0.15);
  min-width: 48px !important;
  width: 48px !important;
  height: 48px !important;
  max-height: 48px !important;
  border-radius: 50%;
  padding: 0 !important;
  
  :deep(.v-btn__content) {
    padding: 0 !important;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.wizard-api-toggle .button-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: lowercase;
  line-height: 1;
}

@media (max-width: 960px) {
  .wizard-api-toggle {
    top: 64px; /* 16px (top) + 48px (button height + gap) */
    right: 16px;
  }
}
</style>

