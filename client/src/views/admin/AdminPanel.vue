<!--
  WHY: Unified admin shell — Instances-first IA, then Appointments (data), then Controls (business).
  PATTERN: VTabs + VWindow; lazy-loaded tab bodies.
-->
<script setup lang="ts">
import { ref, provide, defineAsyncComponent } from 'vue'
import { useAdmin } from '@/composables/admin/useAdmin'
import { adminCurrentTabKey } from '@/types/admin/adminInjectionKeys'

const InstancesDomainTab = defineAsyncComponent(() => import('./tabs/InstancesDomainTab.vue'))
const ShapesTab = defineAsyncComponent(() => import('./tabs/ShapesTab.vue'))
const DataManagementTab = defineAsyncComponent(() => import('./tabs/DataManagementTab.vue'))
const BusinessControlsTab = defineAsyncComponent(() => import('./tabs/BusinessControlsTab.vue'))

useAdmin()

const currentTab = ref('instances')

provide(adminCurrentTabKey, currentTab)
</script>

<template>
  <div class="admin-panel">
    <VRow class="mb-2" density="compact" align="center">
      <VCol cols="auto">
        <VBtn variant="text" size="small" :to="{ name: 'admin-booking-entry' }">
          Open booking wizard
        </VBtn>
      </VCol>
    </VRow>
    <VTabs v-model="currentTab">
      <VTab value="instances">
        Instances
      </VTab>
      <VTab value="shapes">
        Shapes
      </VTab>
      <VTab value="data">
        Appointments
      </VTab>
      <VTab value="business">
        Controls
      </VTab>
    </VTabs>

    <VWindow v-model="currentTab">
      <VWindowItem key="instances" value="instances">
        <InstancesDomainTab />
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
