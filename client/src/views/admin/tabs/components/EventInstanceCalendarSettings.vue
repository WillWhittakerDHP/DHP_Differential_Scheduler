<!-- PATTERN: Secondary Google Calendar behavior — visually subordinate to templates. -->
<script setup lang="ts">
import type { NewEventInstanceData } from '@/types/admin/instancesTabEventInstance'

const draft = defineModel<NewEventInstanceData>({ required: true })
</script>

<template>
  <div class="text-title-small mb-3 mt-4">Calendar behavior</div>
  <p class="text-body-small text-medium-emphasis mb-3">
    These map to Google Calendar event options (visibility, busy/free, color, guests, notifications, Meet).
  </p>

  <VRow density="comfortable">
    <VCol cols="12" sm="6" md="4">
      <VSelect
        v-model="draft.visibility"
        :items="[
          { title: 'Default', value: 'default' },
          { title: 'Public', value: 'public' },
          { title: 'Private', value: 'private' },
          { title: 'Confidential', value: 'confidential' },
        ]"
        label="Calendar Visibility"
        variant="outlined"
        density="compact"
      />
    </VCol>
    <VCol cols="12" sm="6" md="4">
      <VSelect
        v-model="draft.transparency"
        :items="[
          { title: 'Busy', value: 'opaque' },
          { title: 'Free', value: 'transparent' },
        ]"
        label="Show As (Busy/Free)"
        variant="outlined"
        density="compact"
      />
    </VCol>
    <VCol cols="12" sm="6" md="4">
      <VSelect
        v-model="draft.status"
        :items="[
          { title: 'Confirmed', value: 'confirmed' },
          { title: 'Tentative', value: 'tentative' },
        ]"
        label="Calendar Status"
        variant="outlined"
        density="compact"
      />
    </VCol>
    <VCol cols="12" sm="6" md="4">
      <VSelect
        v-model="draft.colorId"
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
        label="Calendar Color"
        variant="outlined"
        density="compact"
        clearable
      />
    </VCol>
  </VRow>

  <div class="text-label-large text-medium-emphasis mb-2 mt-2">Guest permissions</div>
  <VRow density="comfortable">
    <VCol cols="12" sm="6" md="4">
      <VSwitch
        v-model="draft.guestsCanModify"
        label="Guests can modify event"
        density="compact"
        color="primary"
        hide-details
      />
    </VCol>
    <VCol cols="12" sm="6" md="4">
      <VSwitch
        v-model="draft.guestsCanInviteOthers"
        label="Guests can invite others"
        density="compact"
        color="primary"
        hide-details
      />
    </VCol>
    <VCol cols="12" sm="6" md="4">
      <VSwitch
        v-model="draft.guestsCanSeeOtherGuests"
        label="Guests can see guest list"
        density="compact"
        color="primary"
        hide-details
      />
    </VCol>
  </VRow>

  <div class="text-label-large text-medium-emphasis mb-2 mt-2">Notifications & conferencing</div>
  <VRow density="comfortable">
    <VCol cols="12" sm="6" md="4">
      <VSelect
        v-model="draft.sendUpdates"
        :items="[
          { title: 'All — send to everyone', value: 'all' },
          { title: 'External only', value: 'externalOnly' },
          { title: 'None — no emails', value: 'none' },
        ]"
        label="Email Notifications"
        variant="outlined"
        density="compact"
      />
    </VCol>
    <VCol cols="12" sm="6" md="4">
      <VSwitch
        v-model="draft.addConferenceLink"
        label="Google Meet Link"
        density="compact"
        color="primary"
        hide-details
      />
    </VCol>
    <VCol cols="12" sm="6" md="4">
      <VSwitch
        v-model="draft.active"
        label="Active (used for invites)"
        density="compact"
        color="primary"
        hide-details
      />
    </VCol>
  </VRow>
</template>
