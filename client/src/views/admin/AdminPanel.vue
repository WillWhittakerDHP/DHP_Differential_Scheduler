<!--
  WHY: Provides unified admin interface with tab navigation for Instances and Types management
  PATTERN: VTabs + VWindow pattern for tab navigation in Vuexy
  COMPARISON: React uses Ant Design Tabs. Vue uses Vuetify VTabs with VWindow
  RESOURCE: https://vuetifyjs.com/en/components/tabs/
-->
<script setup lang="ts">
import { ref, provide, defineAsyncComponent } from 'vue'
import { useAdmin } from '@/composables/admin/useAdmin'

const InstancesTab = defineAsyncComponent(() => import('./tabs/InstancesTab.vue'))
const ShapesTab = defineAsyncComponent(() => import('./tabs/ShapesTab.vue'))
const DataManagementTab = defineAsyncComponent(() => import('./tabs/DataManagementTab.vue'))
const BusinessControlsTab = defineAsyncComponent(() => import('./tabs/BusinessControlsTab.vue'))

/**
 * PATTERN: Initialize route-specific composables in view component setup
PERFORMANC...
 */
useAdmin()

/**
 */
const currentTab = ref('instances')

provide('adminCurrentTab', currentTab)
</script>

<template>
  <div class="admin-panel">
    <!--
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
      WHY: Manages which tab content is visible based on currentTab value
      PATTERN: v-model syncs with VTabs - when tab clicked, VWindow shows matching VWindowItem
    -->
    <!--
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
</style>
