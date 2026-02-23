<!--
  LEARNING: Main Admin Panel with Tabbed Interface
  WHY: Provides unified admin interface with tab navigation for Instances and Types management
  PATTERN: VTabs + VWindow pattern for tab navigation in Vuexy
  COMPARISON: React uses Ant Design Tabs. Vue uses Vuetify VTabs with VWindow
  RESOURCE: https://vuetifyjs.com/en/components/tabs/
-->
<script setup lang="ts">
import { ref, provide } from 'vue'
import InstancesTab from './tabs/InstancesTab.vue'
import ShapesTab from './tabs/ShapesTab.vue'
import DataManagementTab from './tabs/DataManagementTab.vue'
import BusinessControlsTab from './tabs/BusinessControlsTab.vue'
import PropertyMappingsTab from './tabs/PropertyMappingsTab.vue'
import { useAdmin } from '@/composables/admin/useAdmin'

/**
 * PATTERN: Initialize route-specific composables in view component setup
PERFORMANC...
 */
useAdmin()

/**
 * LEARNING: Reactive tab state management
 */
const currentTab = ref('instances')

/**
 */
provide('adminCurrentTab', currentTab)
</script>

<template>
  <div class="admin-panel">
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
      <VTab value="property-mappings">MLS Mappings</VTab>
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
      <VWindowItem key="property-mappings" value="property-mappings">
        <PropertyMappingsTab />
      </VWindowItem>
    </VWindow>
  </div>
</template>

<style scoped>
.admin-panel {
  padding: 1rem;
}
</style>


