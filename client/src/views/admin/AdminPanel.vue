<!--
  LEARNING: Main Admin Panel with Tabbed Interface
  WHY: Provides unified admin interface with tab navigation for Instances and Types management
  PATTERN: VTabs + VWindow pattern for tab navigation in Vuexy
  COMPARISON: React uses Ant Design Tabs. Vue uses Vuetify VTabs with VWindow
  RESOURCE: https://vuetifyjs.com/en/components/tabs/
-->
<script setup lang="ts">
import { ref } from 'vue'
import InstancesTab from './tabs/InstancesTab.vue'
import ShapesTab from './tabs/ShapesTab.vue'
import DataManagementTab from './tabs/DataManagementTab.vue'
import BusinessControlsTab from './tabs/BusinessControlsTab.vue'
import { useAdmin } from '@/composables/useAdmin'
import { isDevModeEnabled } from '@/utils/env/devMode'
import ApiDevPanel from '@/components/admin/dev/ApiDevPanel.vue'

/**
 * LEARNING: Initialize admin data context when admin panel mounts
 * WHY: Ensures admin data (with transformer) only loads when admin page is accessed
 * PATTERN: Initialize route-specific composables in view component setup
 * PERFORMANCE: Admin transformer only runs on admin pages, not on scheduler pages
 * NOTE: Metadata is prefetched in route guard before component renders (same pattern as globalData)
 */
useAdmin()

/**
 * LEARNING: Reactive tab state management
 * WHY: Tracks which tab is currently active for two-way binding with VTabs/VWindow
 * PATTERN: Use ref for reactive primitive values in Vue 3 Composition API
 */
const currentTab = ref('instances')

/**
 * LEARNING: Dev panel visibility state
 * WHY: Controls visibility of API dev panel for debugging
 * PATTERN: Only visible in dev mode
 */
const isDevMode = isDevModeEnabled()
const apiDevPanelVisible = ref(false)
</script>

<template>
  <div class="admin-panel">
    <!-- 
      Dev Panel Toggle (dev mode only) 
      LEARNING: Fixed position FAB matching global booking wizard toggle style
      WHY: Consistent dev panel access across all pages
      PATTERN: Admin has its own ApiDevPanel for OAuth, cache, rate limit debugging
    -->
    <VBtn
      v-if="isDevMode"
      icon
      size="small"
      color="info"
      variant="elevated"
      class="admin-dev-panel-toggle"
      @click="apiDevPanelVisible = !apiDevPanelVisible"
    >
      <VIcon>mdi-bug</VIcon>
      <VTooltip activator="parent" location="left">
        API Dev Panel
      </VTooltip>
    </VBtn>

    <!-- API Dev Panel -->
    <ApiDevPanel
      v-if="isDevMode"
      :visible="apiDevPanelVisible"
      @close="apiDevPanelVisible = false"
    />

    <!--
      LEARNING: VTabs component for tab navigation
      WHY: Provides tabbed interface with Vuexy styling
      PATTERN: v-model binds to reactive ref for two-way data binding
    -->
    <VTabs v-model="currentTab">
      <VTab value="instances">Instances</VTab>
      <VTab value="shapes">Shapes</VTab>
      <VTab value="data">APPOINTMENTS</VTab>
      <VTab value="business">CONTROLS</VTab>
    </VTabs>
    
    <!--
      LEARNING: VWindow component for tab content container
      WHY: Manages which tab content is visible based on currentTab value
      PATTERN: v-model syncs with VTabs - when tab clicked, VWindow shows matching VWindowItem
    -->
    <!--
      LEARNING: Add explicit keys to VWindowItem components
      WHY: Helps Vue track components during transitions and prevents undefined VNode errors
      PATTERN: Use stable keys matching the value prop for proper component tracking
    -->
    <VWindow v-model="currentTab">
      <VWindowItem key="instances" value="instances">
        <InstancesTab />
      </VWindowItem>
      <VWindowItem key="shapes" value="shapes">
        <ShapesTab />
      </VWindowItem>
      <VWindowItem key="data" value="data">
        <DataManagementTab />
      </VWindowItem>
      <VWindowItem key="business" value="business">
        <BusinessControlsTab />
      </VWindowItem>
    </VWindow>
  </div>
</template>

<style scoped>
.admin-panel {
  padding: 1rem;
}

/* Fixed position FAB for dev panel toggle - matches global booking wizard toggle */
.admin-dev-panel-toggle {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@media (max-width: 960px) {
  .admin-dev-panel-toggle {
    bottom: 16px;
    right: 16px;
  }
}
</style>


