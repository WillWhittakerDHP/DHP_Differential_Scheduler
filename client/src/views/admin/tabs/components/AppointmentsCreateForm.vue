<!--
  Create New Appointment form card; emits save and cancel.
  WHY: Extracted from AppointmentsTable for file-cohesion (plan Phase 3).
-->
<script setup lang="ts">
import type { AppointmentRequest } from '@/types/appointment'
import type { PropertyResponse } from '@/types/property'
import type { UserResponse } from '@/types/user'
import { APPOINTMENT_STATUSES } from '@/types/appointment'
import { APPOINTMENTS_TABLE_UI } from '@/constants/appointmentsTableConstants.js'

/** Parent passes ref value so form can update fields (object is shared). */
defineProps<{
  newAppointment: AppointmentRequest
  formClientId: string | null
  formAgentId: string | null
  properties: PropertyResponse[]
  users: UserResponse[]
}>()

const emit = defineEmits<{
  'update:patch': [patch: Partial<AppointmentRequest>]
  'update:formClientId': [value: string | null]
  'update:formAgentId': [value: string | null]
  save: []
  cancel: []
}>()
</script>

<template>
  <VCard class="mb-4">
    <VCardTitle>{{ APPOINTMENTS_TABLE_UI.CREATE_CARD_TITLE }}</VCardTitle>
    <VCardText>
      <VRow>
        <VCol cols="12" md="6">
          <VSelect
            :model-value="newAppointment.propertyVersionId"
            :items="properties"
            item-title="address"
            item-value="propertyVersionId"
            item-value-alt="id"
            :label="APPOINTMENTS_TABLE_UI.PROPERTY_LABEL"
            :return-object="false"
            required
            @update:model-value="(v: string | null) => emit('update:patch', { propertyVersionId: v ?? undefined })"
          >
            <template #item="{ props: itemProps, item }">
              <VListItem v-bind="itemProps">
                <VListItemTitle>
                  {{ item.raw.address }}, {{ item.raw.city }}, {{ item.raw.state }}
                </VListItemTitle>
              </VListItem>
            </template>
          </VSelect>
        </VCol>
        <VCol cols="12" md="6">
          <VSelect
            :model-value="formClientId"
            :items="users.filter((u) => u.userRole === 'client')"
            item-title="firstName"
            item-value="id"
            :label="APPOINTMENTS_TABLE_UI.CLIENT_LABEL"
            :return-object="false"
            clearable
            @update:model-value="emit('update:formClientId', $event ?? null)"
          >
            <template #item="{ props: itemProps, item }">
              <VListItem v-bind="itemProps">
                <VListItemTitle>
                  {{ item.raw.firstName }} {{ item.raw.lastName }}
                </VListItemTitle>
              </VListItem>
            </template>
          </VSelect>
        </VCol>
        <VCol cols="12" md="6">
          <VSelect
            :model-value="formAgentId"
            :items="users.filter((u) => u.userRole === 'agent')"
            item-title="firstName"
            item-value="id"
            :label="APPOINTMENTS_TABLE_UI.AGENT_LABEL"
            :return-object="false"
            clearable
            @update:model-value="emit('update:formAgentId', $event ?? null)"
          >
            <template #item="{ props: itemProps, item }">
              <VListItem v-bind="itemProps">
                <VListItemTitle>
                  {{ item.raw.firstName }} {{ item.raw.lastName }}
                </VListItemTitle>
              </VListItem>
            </template>
          </VSelect>
        </VCol>
        <VCol cols="12" md="6">
          <VSelect
            :model-value="newAppointment.scheduledById"
            :items="users"
            item-title="firstName"
            item-value="id"
            :label="APPOINTMENTS_TABLE_UI.SCHEDULED_BY_LABEL"
            :return-object="false"
            clearable
            @update:model-value="(v: string | null) => emit('update:patch', { scheduledById: v ?? null })"
          >
            <template #item="{ props: itemProps, item }">
              <VListItem v-bind="itemProps">
                <VListItemTitle>
                  {{ item.raw.firstName }} {{ item.raw.lastName }} ({{ item.raw.userRole }})
                </VListItemTitle>
              </VListItem>
            </template>
          </VSelect>
        </VCol>
        <VCol cols="12" md="6">
          <VSelect
            :model-value="newAppointment.status"
            :items="APPOINTMENT_STATUSES"
            :label="APPOINTMENTS_TABLE_UI.STATUS_LABEL"
            @update:model-value="(v: string) => emit('update:patch', { status: v as AppointmentRequest['status'] })"
          />
        </VCol>
        <VCol cols="12" md="6">
          <VCheckbox
            :model-value="newAppointment.isQuoteMode"
            :label="APPOINTMENTS_TABLE_UI.QUOTE_MODE_LABEL"
            @update:model-value="(v: boolean | null) => emit('update:patch', { isQuoteMode: v ?? false })"
          />
        </VCol>
        <VCol cols="12" md="6">
          <VTextField
            :model-value="newAppointment.selectedDate"
            type="date"
            :label="APPOINTMENTS_TABLE_UI.SELECTED_DATE_LABEL"
            @update:model-value="(v: string) => emit('update:patch', { selectedDate: v ?? null })"
          />
        </VCol>
      </VRow>
    </VCardText>
    <VCardActions>
      <VSpacer />
      <VBtn variant="text" @click="emit('cancel')">{{ APPOINTMENTS_TABLE_UI.CANCEL }}</VBtn>
      <VBtn color="primary" @click="emit('save')">{{ APPOINTMENTS_TABLE_UI.SAVE }}</VBtn>
    </VCardActions>
  </VCard>
</template>
