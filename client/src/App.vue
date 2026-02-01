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
        LEARNING: Only show booking wizard dev panel on non-admin routes
        WHY: Admin page has its own ApiDevPanel for API debugging
        PATTERN: Conditionally render based on route
      -->
      <template v-if="isDevMode && !isAdminRoute">
        <DevPanelsContainer :visible="debugPanelVisible" @close="debugPanelVisible = false" />
        <DevPanelToggle @toggle="debugPanelVisible = !debugPanelVisible" />
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
import { isDevModeEnabled } from '@/utils/env/devMode'
import initCore from '@core/initCore'
import { initConfigStore, useConfigStore } from '@core/stores/config'
import { hexToRgb } from '@core/utils/colorConverter'
import type { AppointmentResponse } from '@/types/appointment'
import type { useBookingWizard } from '@/composables/useBookingWizard'

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
</style>

