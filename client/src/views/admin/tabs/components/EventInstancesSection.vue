<!-- Extracted from InstancesTab for component-health (allowlist repair). -->
<script setup lang="ts">
import { computed, inject } from 'vue'
import EntityCard from '@/components/admin/generic/EntityCard.vue'
import { instancesTabContextKey } from '@/composables/admin/injectionKeys'

const ctx = inject(instancesTabContextKey)
if (!ctx) throw new Error('EventInstancesSection must be used inside InstancesTab')

// WHY: v-model requires a top-level Ref for Vue's template auto-unwrapping.
// inject() returns a plain object so ctx.expandedInstances is a raw Ref —
// VExpansionPanels would receive the Ref wrapper instead of the string[].
const expandedInstances = ctx.expandedInstances

const eventInstancesDisplay = computed(() => {
  const list = ctx.eventInstancesList.value
  const filtered = ctx.filteredEventInstances.value
  return list.length > 0 ? list : filtered
})
const eventShapesList = computed(() => {
  const s = ctx.eventShapes
  return 'value' in s ? (s as { value: unknown[] }).value : (s as unknown[])
})
const hasEventInstances = computed(() => {
  const ev = ctx.eventInstances
  const arr = 'value' in ev ? (ev as { value: unknown[] }).value : (ev as unknown[])
  return Array.isArray(arr) && arr.length > 0
})
const isLoading = computed(() => {
  const v = ctx.isLoadingEventInstances
  return 'value' in v ? (v as { value: boolean }).value : (v as boolean)
})
function toggleEventInstanceMetadata(): void {
  ctx.eventInstanceMetadataModalOpen.value = !ctx.eventInstanceMetadataModalOpen.value
}
</script>

<template>
  <div class="event-instances-tab-content">
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-headline-small">Event Instances</h3>
      <div class="d-flex gap-2">
        <VBtn
          :variant="ctx.eventInstanceMetadataModalOpen.value ? 'flat' : 'outlined'"
          :color="ctx.eventInstanceMetadataModalOpen.value ? 'primary' : 'default'"
          prepend-icon="tabler-settings"
          @click="toggleEventInstanceMetadata"
        >
          Instance Fields
        </VBtn>
        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          @click="ctx.openCreateEventInstanceForm()"
        >
          Create Event Instance
        </VBtn>
      </div>
    </div>
    <div v-if="isLoading" class="text-center py-4">
      <VProgressCircular indeterminate />
    </div>
    <div
      v-else-if="ctx.isCreatingEventInstance.value || hasEventInstances"
      :ref="(el) => { if (ctx.eventInstancesContainer) ctx.eventInstancesContainer.value = el as HTMLElement | null }"
    >
      <VExpansionPanels
        :ref="(el) => { if (ctx.eventInstancesPanelsContainer && el != null) (ctx.eventInstancesPanelsContainer as { value: unknown }).value = el }"
        v-model="expandedInstances"
        multiple
      >
        <VExpansionPanel
          v-if="ctx.isCreatingEventInstance.value"
          key="new-eventInstance"
          value="new-eventInstance"
          class="new-shape-card"
        >
          <template #title>
            <div class="d-flex align-center gap-2 flex-grow-1">
              <VIcon icon="tabler-plus" size="small" color="primary" />
              <span class="text-primary font-weight-medium">New Event Instance</span>
            </div>
          </template>
          <template #text>
            <div v-if="ctx.newEventInstanceData.value" class="d-flex flex-column gap-4">
              <VSelect
                v-model="ctx.newEventInstanceData.value.eventShapeRef"
                :items="eventShapesList"
                item-title="name"
                item-value="id"
                label="Event Shape"
                variant="outlined"
                density="compact"
              />
              <VTextField
                v-model="ctx.newEventInstanceData.value.name"
                label="Name"
                variant="outlined"
                density="compact"
                @keyup.enter="ctx.handleEventInstanceCreate()"
              />
              <div class="text-label-large text-medium-emphasis mt-2">Content Templates</div>
              <VExpansionPanels variant="accordion" class="mb-2">
                <VExpansionPanel>
                  <VExpansionPanelTitle class="text-body-small py-1" style="min-height: 36px">
                    Available Template Variables
                  </VExpansionPanelTitle>
                  <VExpansionPanelText>
                    <div class="text-body-small text-medium-emphasis mb-1">
                      Use <code>{{ '{variableName}' }}</code> in templates. Variables are replaced at invite time.
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
                        <tr v-for="v in ctx.templateVariables" :key="v.name">
                          <td><code>{{ '{' }}{{ v.name }}{{ '}' }}</code></td>
                          <td>{{ v.description }}</td>
                          <td class="text-medium-emphasis">{{ v.example }}</td>
                        </tr>
                      </tbody>
                    </VTable>
                  </VExpansionPanelText>
                </VExpansionPanel>
              </VExpansionPanels>
              <VTextarea
                v-model="ctx.newEventInstanceData.value.titleTemplate"
                label="Title Template"
                variant="outlined"
                density="compact"
                rows="2"
                hint="e.g. '{service} at {streetAddress}'"
                :error-messages="ctx.templateWarnings.titleTemplate"
              />
              <VTextarea
                v-model="ctx.newEventInstanceData.value.descriptionTemplate"
                label="Description Template"
                variant="outlined"
                density="compact"
                rows="2"
                hint="e.g. 'Home inspection on {appointmentDate} at {appointmentTime}'"
                :error-messages="ctx.templateWarnings.descriptionTemplate"
              />
              <VTextarea
                v-model="ctx.newEventInstanceData.value.locationTemplate"
                label="Location Template"
                variant="outlined"
                density="compact"
                rows="2"
                hint="e.g. '{fullAddress}'"
                :error-messages="ctx.templateWarnings.locationTemplate"
              />
              <div class="text-label-large text-medium-emphasis mt-2">Display & Status</div>
              <VRow dense>
                <VCol cols="12" sm="6" md="4">
                  <VSelect
                    v-model="ctx.newEventInstanceData.value.visibility"
                    :items="[
                      { title: 'Default', value: 'default' },
                      { title: 'Public', value: 'public' },
                      { title: 'Private', value: 'private' },
                      { title: 'Confidential', value: 'confidential' },
                    ]"
                    label="Visibility"
                    variant="outlined"
                    density="compact"
                  />
                </VCol>
                <VCol cols="12" sm="6" md="4">
                  <VSelect
                    v-model="ctx.newEventInstanceData.value.transparency"
                    :items="[
                      { title: 'Busy', value: 'opaque' },
                      { title: 'Free', value: 'transparent' },
                    ]"
                    label="Show As"
                    variant="outlined"
                    density="compact"
                  />
                </VCol>
                <VCol cols="12" sm="6" md="4">
                  <VSelect
                    v-model="ctx.newEventInstanceData.value.status"
                    :items="[
                      { title: 'Confirmed', value: 'confirmed' },
                      { title: 'Tentative', value: 'tentative' },
                    ]"
                    label="Event Status"
                    variant="outlined"
                    density="compact"
                  />
                </VCol>
                <VCol cols="12" sm="6" md="4">
                  <VSelect
                    v-model="ctx.newEventInstanceData.value.colorId"
                    :items="[
                      { title: 'Default', value: null },
                      { title: '1 - Lavender', value: '1' },
                      { title: '2 - Sage', value: '2' },
                      { title: '3 - Grape', value: '3' },
                      { title: '4 - Flamingo', value: '4' },
                      { title: '5 - Banana', value: '5' },
                      { title: '6 - Tangerine', value: '6' },
                      { title: '7 - Peacock', value: '7' },
                      { title: '8 - Graphite', value: '8' },
                      { title: '9 - Blueberry', value: '9' },
                      { title: '10 - Basil', value: '10' },
                      { title: '11 - Tomato', value: '11' },
                    ]"
                    label="Event Color"
                    variant="outlined"
                    density="compact"
                    clearable
                  />
                </VCol>
              </VRow>
              <div class="text-label-large text-medium-emphasis mt-2">Guest Permissions</div>
              <VRow dense>
                <VCol cols="12" sm="6" md="4">
                  <VSwitch
                    v-model="ctx.newEventInstanceData.value.guestsCanModify"
                    label="Guests can modify event"
                    density="compact"
                    color="primary"
                    hide-details
                  />
                </VCol>
                <VCol cols="12" sm="6" md="4">
                  <VSwitch
                    v-model="ctx.newEventInstanceData.value.guestsCanInviteOthers"
                    label="Guests can invite others"
                    density="compact"
                    color="primary"
                    hide-details
                  />
                </VCol>
                <VCol cols="12" sm="6" md="4">
                  <VSwitch
                    v-model="ctx.newEventInstanceData.value.guestsCanSeeOtherGuests"
                    label="Guests can see guest list"
                    density="compact"
                    color="primary"
                    hide-details
                  />
                </VCol>
              </VRow>
              <div class="text-label-large text-medium-emphasis mt-2">Notifications & Conferencing</div>
              <VRow dense>
                <VCol cols="12" sm="6" md="4">
                  <VSelect
                    v-model="ctx.newEventInstanceData.value.sendUpdates"
                    :items="[
                      { title: 'All — send to everyone', value: 'all' },
                      { title: 'External only', value: 'externalOnly' },
                      { title: 'None — no emails', value: 'none' },
                    ]"
                    label="Send Invitations"
                    variant="outlined"
                    density="compact"
                  />
                </VCol>
                <VCol cols="12" sm="6" md="4">
                  <VSwitch
                    v-model="ctx.newEventInstanceData.value.addConferenceLink"
                    label="Add Google Meet link"
                    density="compact"
                    color="primary"
                    hide-details
                  />
                </VCol>
              </VRow>
              <div class="d-flex gap-2 justify-end mt-2">
                <VBtn
                  color="primary"
                  :loading="ctx.isCreatingEventInstanceLoading.value"
                  :disabled="!ctx.newEventInstanceData.value?.name?.trim()"
                  @click="ctx.handleEventInstanceCreate()"
                >
                  Create
                </VBtn>
                <VBtn
                  variant="outlined"
                  @click="ctx.handleEventInstanceCancelled()"
                >
                  Cancel
                </VBtn>
              </div>
            </div>
          </template>
        </VExpansionPanel>
        <EntityCard
          v-for="eventInstance in eventInstancesDisplay"
          :key="String(eventInstance.id)"
          :class="`draggable-event-instance draggable-instance-item`"
          :data-drag-id="String(eventInstance.id)"
          entity-key="eventInstance"
          :entity="eventInstance"
          :expanded="ctx.isPanelExpanded(String(eventInstance.id))"
          @saved="ctx.handleExistingBlockInstanceSaved"
          @delete="ctx.handleDeleteEventInstance"
        />
      </VExpansionPanels>
    </div>
    <VAlert
      v-else
      type="info"
      variant="tonal"
      class="mt-4"
    >
      No event instances found. Create one to get started.
    </VAlert>
  </div>
</template>
