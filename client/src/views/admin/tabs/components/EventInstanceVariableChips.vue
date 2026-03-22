<!-- LEARNING: Variable chips insert tokens into the last-focused template field (see useEventInstanceBuilder). -->
<script setup lang="ts">
import { computed } from 'vue'
import { EVENT_TEMPLATE_VARIABLES } from '@shared/constants/templateVariables'
import { nilToEmptyArray } from '@shared/utils/nilDefaults'

const props = defineProps<{
  insertVariable: (name: string) => void
}>()

const GROUP_ORDER = ['Address', 'Appointment', 'Service', 'Links'] as const

const GROUP_MEMBERS: Record<(typeof GROUP_ORDER)[number], readonly string[]> = {
  Address: ['streetAddress', 'city', 'state', 'zipCode', 'fullAddress'],
  Appointment: ['appointmentDate', 'appointmentTime', 'appointmentId', 'status'],
  Service: ['service'],
  Links: ['rescheduleLink', 'cancelLink'],
}

const variablesByGroup = computed(() => {
  const map = new Map<string, (typeof EVENT_TEMPLATE_VARIABLES)[number][]>()
  for (const g of GROUP_ORDER) {
    map.set(g, [])
  }
  const nameToVar = new Map<string, (typeof EVENT_TEMPLATE_VARIABLES)[number]>(
    EVENT_TEMPLATE_VARIABLES.map((v) => [v.name, v])
  )
  for (const g of GROUP_ORDER) {
    for (const name of GROUP_MEMBERS[g]) {
      const row = nameToVar.get(name)
      if (row) {
        map.get(g)!.push(row)
      }
    }
  }
  return GROUP_ORDER.map((label) => ({ label, variables: nilToEmptyArray(map.get(label)) }))
})

function onChipDown(name: string): void {
  props.insertVariable(name)
}
</script>

<template>
  <div class="text-title-small mb-2">Insert variables</div>
  <p class="text-body-small text-medium-emphasis mb-3">
    Inserts <code>{{ '{name}' }}</code> into the template field you last clicked in. (Chips use
    <span class="text-no-wrap">mousedown</span> so focus is not stolen before insert.)
  </p>
  <div
    v-for="group in variablesByGroup"
    :key="group.label"
    class="mb-3"
  >
    <div class="text-label-large text-medium-emphasis mb-1">{{ group.label }}</div>
    <div class="d-flex flex-wrap gap-1">
      <VTooltip
        v-for="v in group.variables"
        :key="v.name"
        location="top"
      >
        <template #activator="{ props: tipProps }">
          <VChip
            v-bind="tipProps"
            size="small"
            variant="outlined"
            class="cursor-pointer"
            @mousedown.prevent="onChipDown(v.name)"
          >
            {{ v.name }}
          </VChip>
        </template>
        <div class="text-body-small" style="max-width: 280px">
          <div class="font-weight-medium">{{ v.description }}</div>
          <div class="text-medium-emphasis mt-1">Example: {{ v.example }}</div>
        </div>
      </VTooltip>
    </div>
  </div>

  <VExpansionPanels variant="accordion" class="mb-2">
    <VExpansionPanel>
      <VExpansionPanelTitle class="text-body-small py-1" style="min-height: 36px">
        Full variable reference
      </VExpansionPanelTitle>
      <VExpansionPanelText>
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
              <td><code>{{ '{' }}{{ v.name }}{{ '}' }}</code></td>
              <td>{{ v.description }}</td>
              <td class="text-medium-emphasis">{{ v.example }}</td>
            </tr>
          </tbody>
        </VTable>
      </VExpansionPanelText>
    </VExpansionPanel>
  </VExpansionPanels>
</template>
