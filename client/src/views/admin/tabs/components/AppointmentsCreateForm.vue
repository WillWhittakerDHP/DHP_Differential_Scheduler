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
import { toISO8601Date } from '@/utils/datetime'
import { isBuyerUserRole } from '@/utils/admin/appointmentAttendees'

/** Parent passes ref value so form can update fields (object is shared). */
defineProps<{
  newAppointment: AppointmentRequest
  formBuyerId: string | null
  formAgentId: string | null
  properties: PropertyResponse[]
  users: UserResponse[]
}>()

const emit = defineEmits<{
  'update:patch': [patch: Partial<AppointmentRequest>]
  'update:formBuyerId': [value: string | null]
  'update:formAgentId': [value: string | null]
  save: []
  cancel: []
}>()

function handlePatchPropertyVersionId(v: string | null): void {
  emit('update:patch', { propertyVersionId: v ?? undefined })
}
function handlePatchStatus(v: string): void {
  emit('update:patch', { status: v as AppointmentRequest['status'] })
}
function handlePatchSelectedDate(v: string): void {
  emit('update:patch', { selectedDate: v != null && v !== '' ? toISO8601Date(v) : null })
}
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
            @update:model-value="handlePatchPropertyVersionId"
          >
            <template #item="{ props: itemProps, item }">
              <VListItem v-bind="itemProps">
                <VListItemTitle>
                  {{ item.address }}, {{ item.city }}, {{ item.state }}
                </VListItemTitle>
              </VListItem>
            </template>
          </VSelect>
        </VCol>
        <VCol cols="12" md="6">
          <VSelect
            :model-value="formBuyerId"
            :items="users.filter((u) => isBuyerUserRole(u.userRole))"
            item-title="firstName"
            item-value="id"
            :label="APPOINTMENTS_TABLE_UI.BUYER_LABEL"
            :return-object="false"
            clearable
            @update:model-value="emit('update:formBuyerId', $event ?? null)"
          >
            <template #item="{ props: itemProps, item }">
              <VListItem v-bind="itemProps">
                <VListItemTitle>
                  {{ item.firstName }} {{ item.lastName }}
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
                  {{ item.firstName }} {{ item.lastName }}
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
                  {{ item.firstName }} {{ item.lastName }} ({{ item.userRole }})
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
            @update:model-value="handlePatchStatus"
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
            @update:model-value="handlePatchSelectedDate"
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
