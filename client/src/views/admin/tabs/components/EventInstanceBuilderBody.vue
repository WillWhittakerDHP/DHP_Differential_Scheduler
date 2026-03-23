<!-- PATTERN: Shared template + preview + calendar sections for create and edit flows. -->
<script setup lang="ts">
import { computed } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { NewEventInstanceData } from '@/types/admin/instancesTabEventInstance'
import { templateFieldUnknownWarnings } from '@shared/utils/templateVariableWarnings'
import { useEventInstanceBuilder } from '@/composables/admin/useEventInstanceBuilder'
import { useEventTemplatePreview } from '@/composables/admin/useEventTemplatePreview'
import { useListForAdminEntry, formatUserDisplayName } from '@/composables/booking/useListForAdminEntry'
import { useUser } from '@/composables/useUser'
import type { AdminEntryAppointmentItem } from '@shared/types/appointmentTypes'
import type { UserResponse } from '@/types/user'
import EventInstanceTemplateFields from './EventInstanceTemplateFields.vue'
import EventInstanceVariableChips from './EventInstanceVariableChips.vue'
import EventInstancePreviewPanel from './EventInstancePreviewPanel.vue'
import EventInstanceCalendarSettings from './EventInstanceCalendarSettings.vue'

const draft = defineModel<NewEventInstanceData>({ required: true })

defineProps<{
  eventShapesList: GlobalEntity<'eventShape'>[]
}>()

const titleWarnings = computed(() => templateFieldUnknownWarnings(draft.value.titleTemplate))
const descriptionWarnings = computed(() => templateFieldUnknownWarnings(draft.value.descriptionTemplate))
const locationWarnings = computed(() => templateFieldUnknownWarnings(draft.value.locationTemplate))

const { setActiveTemplateField, insertVariable } = useEventInstanceBuilder(draft)

const {
  samplePreview,
  selectedAppointmentId,
  realPreview,
  realPreviewLoading,
  realPreviewError,
} = useEventTemplatePreview({ draft })

const { data: listItems } = useListForAdminEntry()
const { fetchAll: usersQuery } = useUser()

const users = computed((): UserResponse[] => {
  const d = usersQuery.data.value
  return Array.isArray(d) ? d : []
})

function getUserById(id: string | null | undefined): UserResponse | undefined {
  if (!id) return undefined
  return users.value.find((u) => u.id === id)
}

const appointmentSelectItems = computed(() => {
  const raw = listItems.value
  const items: AdminEntryAppointmentItem[] = Array.isArray(raw) ? raw : []
  return items.map((item) => ({
    title: `${item.address} — ${formatUserDisplayName(getUserById(item.clientUserId))}`,
    value: item.id,
  }))
})
</script>

<template>
  <div class="d-flex flex-column gap-2">
    <VRow density="comfortable">
      <VCol cols="12" md="6">
        <VSelect
          v-model="draft.eventShapeRef"
          :items="eventShapesList"
          item-title="name"
          item-value="id"
          label="Event Shape"
          variant="outlined"
          density="compact"
        />
      </VCol>
      <VCol cols="12" md="6">
        <VTextField
          v-model="draft.name"
          label="Event Instance Name"
          variant="outlined"
          density="compact"
        />
      </VCol>
    </VRow>

    <EventInstanceTemplateFields
      v-model="draft"
      :title-error-messages="titleWarnings"
      :description-error-messages="descriptionWarnings"
      :location-error-messages="locationWarnings"
      :set-active-template-field="setActiveTemplateField"
    />

    <EventInstanceVariableChips :insert-variable="insertVariable" />

    <EventInstancePreviewPanel
      v-model:selected-appointment-id="selectedAppointmentId"
      :sample-preview="samplePreview"
      :real-preview="realPreview"
      :real-preview-loading="realPreviewLoading"
      :real-preview-error="realPreviewError"
      :appointment-select-items="appointmentSelectItems"
    />

    <EventInstanceCalendarSettings v-model="draft" />
  </div>
</template>
