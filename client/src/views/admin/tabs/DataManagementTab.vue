<!--
  WHY: Provides tabbed interface for managing appointments, properties, and users
  PATTERN: Nested VTabs/VWindow pattern similar to AdminPanel
  
  Features:
  - Tab navigation between appointments, properties, and users
  - Cross-tab navigation support (clicking linked data in appointments navigates to related tab)
-->
<script setup lang="ts">
import { useTabNavigation } from '@/composables/admin/useTabNavigation'
import AppointmentsTable from './components/AppointmentsTable.vue'
import PropertiesTable from './components/PropertiesTable.vue'
import UsersTable from './components/UsersTable.vue'

/**
 * WHY: Use tab navigation composable
WHY: All logic moved to composable - compo...
 */
const { currentTab: currentSubTab, navigateToTab: handleNavigateToTab } = useTabNavigation({ initialTab: 'appointments' })
</script>

<template>
  <div class="data-management-tab">
    <!--
      WHY: Provides tabbed interface for switching between appointments, properties, and users
      PATTERN: VTabs with v-model for two-way data binding
    -->
    <VTabs v-model="currentSubTab">
      <VTab value="appointments">Appointments</VTab>
      <VTab value="properties">Properties</VTab>
      <VTab value="users">Users</VTab>
    </VTabs>
    
    <!--
      WHY: Manages which sub-tab content is visible based on currentSubTab value
      PATTERN: v-model syncs with VTabs - when tab clicked, VWindow shows matching VWindowItem
    -->
    <VWindow v-model="currentSubTab">
      <VWindowItem key="appointments" value="appointments">
        <!--
          WHY: Allows clicking on property/user data to navigate to respective tabs
          PATTERN: @navigate-to-tab event binding for cross-component communication
        -->
        <AppointmentsTable @navigate-to-tab="handleNavigateToTab" />
      </VWindowItem>
      <VWindowItem key="properties" value="properties">
        <PropertiesTable />
      </VWindowItem>
      <VWindowItem key="users" value="users">
        <UsersTable />
      </VWindowItem>
    </VWindow>
  </div>
</template>

<style scoped>
.data-management-tab {
  margin-top: 1rem;
}
</style>
