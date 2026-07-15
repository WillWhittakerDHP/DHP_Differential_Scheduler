<!-- PATTERN: Shared template + preview + calendar sections for create and edit flows. -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { NewEventInstanceData } from '@/types/admin/instancesTabEventInstance'
import { templateFieldUnknownWarnings } from '@shared/utils/templateVariableWarnings'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import { useEventInstanceBuilder } from '@/composables/admin/useEventInstanceBuilder'
import { useEventTemplatePreview } from '@/composables/admin/useEventTemplatePreview'
import { useListForAdminEntry, formatUserDisplayName } from '@/composables/booking/useListForAdminEntry'
import { useUser } from '@/composables/useUser'
import type { AdminEntryAppointmentItem } from '@shared/types/appointmentTypes'
import type { UserResponse } from '@/types/user'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import { attendeeIdsFromDraftValue } from '@/utils/admin/eventInstanceAttendeeAssignments'
import EventInstanceTemplateFields from './EventInstanceTemplateFields.vue'
import EventInstanceVariableChips from './EventInstanceVariableChips.vue'
import EventInstancePreviewPanel from './EventInstancePreviewPanel.vue'
import EventInstanceCalendarSettings from './EventInstanceCalendarSettings.vue'
import EventInstanceTimeBlockClaims from './EventInstanceTimeBlockClaims.vue'
import { eventTimingBehaviorFromPlacement } from '@/utils/admin/eventPlacementLabels'

const draft = defineModel<NewEventInstanceData>({ required: true })

const props = defineProps<{
  eventShapesList: GlobalEntity<'eventShape'>[]
}>()

const expandedSections = ref<string[]>(['segment', 'template'])

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
const { entities: blockInstances } = useEntityCrud('blockInstance')
const { entities: blockShapes } = useEntityCrud('blockShape')

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
    title: `${item.address} — ${formatUserDisplayName(getUserById(item.buyerUserId))}`,
    value: item.id,
  }))
})

const eventShapeItems = computed(() =>
  props.eventShapesList.map((shape) => {
    const timing = eventTimingBehaviorFromPlacement(shape.placementKind, shape.anchorEdge)
    return {
      title: `${shape.name} - ${timing.shortTitle}`,
      value: String(shape.id),
    }
  })
)

const selectedEventShape = computed(() =>
  props.eventShapesList.find((shape) => String(shape.id) === String(draft.value.eventShapeRef)) ?? null
)

const selectedTimingBehavior = computed(() => {
  const shape = selectedEventShape.value
  return shape ? eventTimingBehaviorFromPlacement(shape.placementKind, shape.anchorEdge) : null
})

const userBlockShapeIds = computed(() => {
  return new Set(
    blockShapes.value
      .filter((shape) => shape.semanticType === BLOCK_SHAPE_TYPES.USER)
      .map((shape) => String(shape.id))
  )
})

const attendeeTypeItems = computed(() =>
  blockInstances.value
    .filter((instance) => userBlockShapeIds.value.has(String(instance.blockShapeRef)))
    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
    .map((instance) => ({
      title: instance.name,
      value: String(instance.id),
    }))
)

const attendeeSelection = computed<string[]>({
  get: () => attendeeIdsFromDraftValue(draft.value.attendees),
  set: (ids) => {
    draft.value.attendees = attendeeIdsFromDraftValue(ids)
  },
})
</script>

<template>
  <div class="d-flex flex-column gap-2">
    <VExpansionPanels v-model="expandedSections" multiple class="event-instance-builder-cards">
      <VExpansionPanel value="segment">
        <VExpansionPanelTitle>
          Segment details
        </VExpansionPanelTitle>
        <VExpansionPanelText>
          <VTextField
            v-model="draft.name"
            label="Segment label"
            hint="Internal/admin label for this segment. The actual Google Calendar title is the Calendar Title field in Template builder."
            persistent-hint
            variant="outlined"
            density="compact"
            class="mb-3"
          />

          <VRow density="comfortable">
            <VCol cols="12" md="6">
              <VSelect
                v-model="draft.eventShapeRef"
                :items="eventShapeItems"
                item-title="title"
                item-value="value"
                label="Event type"
                variant="outlined"
                density="compact"
                hint="Controls where this segment sits in time. Attendees are configured separately."
                persistent-hint
              />
              <div
                v-if="selectedTimingBehavior"
                class="text-body-small text-medium-emphasis mt-1"
              >
                {{ selectedTimingBehavior.description }}
              </div>
            </VCol>
            <VCol cols="12" md="6">
              <VSelect
                v-model="attendeeSelection"
                :items="attendeeTypeItems"
                item-title="title"
                item-value="value"
                label="Attendee types included"
                variant="outlined"
                density="compact"
                multiple
                chips
                closable-chips
                clearable
                no-data-text="Create user-type block instances before assigning attendees."
                hint="People are routed to this calendar event through their user type, such as Inspector, Buyer, or Agent."
                persistent-hint
              />
            </VCol>
          </VRow>

          <EventInstanceTimeBlockClaims v-model="draft.eventPartClaims" />
        </VExpansionPanelText>
      </VExpansionPanel>

      <VExpansionPanel value="template">
        <VExpansionPanelTitle>
          Template builder
        </VExpansionPanelTitle>
        <VExpansionPanelText>
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
        </VExpansionPanelText>
      </VExpansionPanel>

      <VExpansionPanel value="calendar">
        <VExpansionPanelTitle>
          Calendar behavior
        </VExpansionPanelTitle>
        <VExpansionPanelText>
          <EventInstanceCalendarSettings v-model="draft" />
        </VExpansionPanelText>
      </VExpansionPanel>
    </VExpansionPanels>
  </div>
</template>
