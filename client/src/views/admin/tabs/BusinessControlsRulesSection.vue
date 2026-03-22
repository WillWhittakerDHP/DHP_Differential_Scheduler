<!--
  WHY: Encapsulates rules sub-tabs (rules, MLS mapping) for Business Controls.
  PATTERN: Injects shared state; owns sub-tab navigation and panel layout.
-->
<script setup lang="ts">
import { useTabNavigation } from '@/composables/admin/useTabNavigation'
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import BusinessRulesTab from './BusinessRulesTab.vue'
import PropertyMappingsTab from './PropertyMappingsTab.vue'

const { currentTab: currentRulesSubTab } = useTabNavigation({ initialTab: 'rules' })

const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS
</script>

<template>
  <div>
    <VTabs v-model="currentRulesSubTab" class="mb-4">
      <VTab value="rules">{{ UI_STRINGS.tabs.rules }}</VTab>
      <VTab value="mls">{{ UI_STRINGS.tabs.mlsMapping }}</VTab>
    </VTabs>

    <VWindow v-model="currentRulesSubTab">
      <VWindowItem key="rules" value="rules">
        <BusinessRulesTab />
      </VWindowItem>

      <VWindowItem key="mls" value="mls">
        <PropertyMappingsTab :enabled-override="currentRulesSubTab === 'mls'" />
      </VWindowItem>
    </VWindow>
  </div>
</template>
