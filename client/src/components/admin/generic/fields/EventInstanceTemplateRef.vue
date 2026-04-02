<!--
  WHY: Editing event instances via EntityCard loses the create-form template variable reference.
  PATTERN: Accordion + template-variable table; single source EVENT_TEMPLATE_VARIABLES.
-->
<script setup lang="ts">
import { EVENT_TEMPLATE_VARIABLES } from '@shared/constants/templateVariables'
</script>

<template>
  <VExpansionPanels variant="accordion" class="mb-4">
    <VExpansionPanel>
      <VExpansionPanelTitle class="text-body-small py-1" style="min-height: 36px">
        Available Template Variables
      </VExpansionPanelTitle>
      <VExpansionPanelText>
        <div class="text-body-small text-medium-emphasis mb-2">
          Use <code>{{ '{' }}variableName{{ '}' }}</code> in Calendar Title, Description, and Location fields.
          Variables are replaced with real appointment data when the calendar invite is created.
        </div>
        <VTable density="compact" class="text-body-small">
          <thead>
            <tr>
              <th>Variable</th>
              <th>Description</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in EVENT_TEMPLATE_VARIABLES" :key="v.name">
              <td>
                <code>{{ '{' }}{{ v.name }}{{ '}' }}</code>
              </td>
              <td>{{ v.description }}</td>
              <td class="text-medium-emphasis">{{ v.example }}</td>
            </tr>
          </tbody>
        </VTable>
      </VExpansionPanelText>
    </VExpansionPanel>
  </VExpansionPanels>
</template>
