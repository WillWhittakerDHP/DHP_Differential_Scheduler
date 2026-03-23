<!--
  WHY: Admin config for availability (constraints), calendar, wizard. Each sub-tab loads/saves its own settings.
-->
<script setup lang="ts">
import { useBusinessControlsTab } from '@/composables/admin/useBusinessControlsTab'
import BusinessControlsConstraintsSection from './BusinessControlsConstraintsSection.vue'
import BusinessControlsCalendarSection from './BusinessControlsCalendarSection.vue'
import WizardConfigPanel from './components/WizardConfigPanel.vue'
import BusinessControlsRulesSection from './BusinessControlsRulesSection.vue'

const {
  loading,
  error,
  success,
  handleSave,
  clearAllErrors,
  currentMainTab,
  businessControlsState,
  UI_STRINGS,
} = useBusinessControlsTab()
</script>

<template>
  <div class="business-controls-tab">
    <div v-if="loading" class="text-center py-4">
      <VProgressCircular indeterminate color="primary" />
      <div class="mt-2">{{ UI_STRINGS.loading }}</div>
    </div>

    <VForm v-else @submit.prevent="handleSave">
      <VAlert v-if="success" type="success" dismissible class="mb-4">
        {{ success }}
      </VAlert>
      <VAlert
        v-if="error"
        type="error"
        dismissible
        class="mb-4"
        @click:close="clearAllErrors"
      >
        {{ error }}
      </VAlert>

      <VTabs v-model="currentMainTab" class="mb-4">
        <VTab value="constraints">{{ UI_STRINGS.tabs.constraints }}</VTab>
        <VTab value="calendar">{{ UI_STRINGS.tabs.calendar }}</VTab>
        <VTab value="wizard">{{ UI_STRINGS.tabs.wizard }}</VTab>
        <VTab value="rules">{{ UI_STRINGS.tabs.rules }}</VTab>
      </VTabs>

      <VWindow v-model="currentMainTab">
        <VWindowItem key="constraints" value="constraints">
          <BusinessControlsConstraintsSection />
        </VWindowItem>

        <VWindowItem key="calendar" value="calendar">
          <BusinessControlsCalendarSection />
        </VWindowItem>

        <VWindowItem key="wizard" value="wizard">
          <WizardConfigPanel v-if="businessControlsState?.wizardSettings" />
        </VWindowItem>

        <VWindowItem key="rules" value="rules">
          <BusinessControlsRulesSection />
        </VWindowItem>
      </VWindow>
    </VForm>
  </div>
</template>

<style scoped>
.business-controls-tab {
  padding: 1rem;
}
</style>
