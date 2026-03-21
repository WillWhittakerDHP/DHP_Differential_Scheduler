<!-- Extracted from OverlapConstraintsPanel for component-health (allowlist repair). -->
<script setup lang="ts">
import { inject } from 'vue'
import { BUSINESS_CONTROLS_STATE_KEY, type BusinessControlsState } from '../businessControlsStateKey'
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import { ENFORCEMENT_OPTIONS } from '@/constants/businessControlsOptions'

const _injectedState = inject(BUSINESS_CONTROLS_STATE_KEY)
if (!_injectedState) throw new Error('OverlapRuleSection must be used inside BusinessControlsTab')
const state: BusinessControlsState = _injectedState

const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS
const enforcementOptions = ENFORCEMENT_OPTIONS

function handleOverlapSourcesOutOfOfficeEnforcement(v: 'off' | 'flexible' | 'hard'): void {
  state.buffers.overlapSourcesOutOfOfficeEnforcement = v
}
</script>

<template>
  <VExpansionPanel :title="UI_STRINGS.panels.outOfOfficeEvents">
    <VExpansionPanelText>
      <div class="text-body-medium mb-4 text-medium-emphasis">
        {{ UI_STRINGS.help.outOfOfficeDescription }}
      </div>
      <VRow>
        <VCol cols="12" sm="6" md="3">
          <VSelect
            :model-value="state.buffers.overlapSourcesOutOfOfficeEnforcement"
            @update:model-value="handleOverlapSourcesOutOfOfficeEnforcement"
            :items="enforcementOptions"
            :label="UI_STRINGS.labels.enforcement"
            :hint="UI_STRINGS.hints.bufferEnforcement"
            persistent-hint
          />
        </VCol>
      </VRow>
    </VExpansionPanelText>
  </VExpansionPanel>
</template>
