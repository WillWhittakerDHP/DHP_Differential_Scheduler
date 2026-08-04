<script setup lang="ts">
import { computed } from 'vue'
import { useGlobal } from '@/composables/useGlobal'
import { useRelationshipCrud } from '@/composables/useRelationship'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import {
  buildServiceBlockActivationState,
  syncActiveBlockRelationships,
} from '@/utils/admin/serviceBlockActivation'
import {
  buildServiceBlockEventSelectionState,
  syncBlockEventAssignments,
} from '@/utils/admin/serviceBlockEventSelection'
import { toGlobalEntityId } from '@/utils/globalEntity'

const props = defineProps<{
  blockInstanceId: string
}>()

const { globalData } = useGlobal()
const {
  create: createBookingCascade,
  remove: removeBookingCascade,
} = useRelationshipCrud('bookingCascades')
const {
  create: createEventAssignment,
  remove: removeEventAssignment,
} = useRelationshipCrud('eventAssignments')
const {
  update: updateBlockInstance,
} = useEntityCrud('blockInstance')

const blockInstance = computed(() =>
  globalData.value?.entities.blockInstance.find((block) => String(block.id) === props.blockInstanceId) ?? null
)

const isAtomicService = computed(() => blockInstance.value?.orchestrator !== true)

const activation = computed(() => {
  const data = globalData.value
  if (!data) {
    return { timeOptions: [], feeOptions: [], selectedTimeIds: [], selectedFeeIds: [] }
  }
  return buildServiceBlockActivationState({
    serviceBlockId: props.blockInstanceId,
    blockInstances: data.entities.blockInstance,
    blockShapes: data.entities.blockShape,
    bookingCascades: data.relationships.bookingCascades,
  })
})

const timeItems = computed(() =>
  activation.value.timeOptions.map((option) => ({
    title: `${option.title} (${option.shapeName})`,
    value: option.id,
  }))
)

const feeItems = computed(() =>
  activation.value.feeOptions.map((option) => ({
    title: `${option.title} (${option.shapeName})`,
    value: option.id,
  }))
)

const eventSelection = computed(() => {
  const data = globalData.value
  if (!data) {
    return { defaultEventId: null, optionEventIds: [], eventOptions: [] }
  }
  return buildServiceBlockEventSelectionState({
    blockInstanceId: props.blockInstanceId,
    blockInstances: data.entities.blockInstance,
    blockShapes: data.entities.blockShape,
    eventInstances: data.entities.eventInstance,
    eventAssignments: data.relationships.eventAssignments,
  })
})

const eventItems = computed(() =>
  eventSelection.value.eventOptions.map((option) => ({
    title: option.title,
    value: option.id,
  }))
)

function normalizeSelectedIds(ids: unknown): string[] {
  return Array.isArray(ids) ? ids.map((id) => String(id)) : []
}

function normalizeOptionalSingleId(id: unknown): string | null {
  return typeof id === 'string' && id.trim() !== '' ? id : null
}

function assignedEventIds(): string[] {
  const defaultId = eventSelection.value.defaultEventId
  return [
    ...(defaultId ? [defaultId] : []),
    ...eventSelection.value.optionEventIds,
  ]
}

async function syncEventSelection(
  defaultEventId: string | null,
  optionEventIds: readonly unknown[],
  oldAssignedEventIds: readonly unknown[] = assignedEventIds()
): Promise<void> {
  await syncBlockEventAssignments({
    blockInstanceId: props.blockInstanceId,
    defaultEventId,
    optionEventIds,
    oldAssignedEventIds,
    createEventAssignment,
    removeEventAssignment,
  })
}

function syncActiveBlockIds(oldIds: readonly unknown[], newIds: unknown): void {
  void syncActiveBlockRelationships({
    serviceBlockId: props.blockInstanceId,
    oldIds,
    newIds: normalizeSelectedIds(newIds),
    createBookingCascade,
    removeBookingCascade,
  })
}

const selectedTimeIds = computed<string[]>({
  get: () => activation.value.selectedTimeIds,
  set: (ids) => syncActiveBlockIds(activation.value.selectedTimeIds, ids),
})

const selectedFeeIds = computed<string[]>({
  get: () => activation.value.selectedFeeIds,
  set: (ids) => syncActiveBlockIds(activation.value.selectedFeeIds, ids),
})

async function setDefaultEventId(id: unknown): Promise<void> {
  const defaultEventId = normalizeOptionalSingleId(id)
  const oldAssignedEventIds = assignedEventIds()
  await updateBlockInstance({ defaultEventInstanceId: defaultEventId }, toGlobalEntityId(props.blockInstanceId))
  await syncEventSelection(defaultEventId, eventSelection.value.optionEventIds, oldAssignedEventIds)
}

function setOptionEventIds(ids: unknown): void {
  void syncEventSelection(eventSelection.value.defaultEventId, normalizeSelectedIds(ids))
}
</script>

<template>
  <VExpansionPanels class="mb-4">
    <VExpansionPanel value="service-activation">
      <VExpansionPanelTitle>
        <span class="font-weight-medium">Service activation</span>
      </VExpansionPanelTitle>
      <VExpansionPanelText>
        <div class="text-body-small text-medium-emphasis mb-4">
          Choose the default calendar segment (baseline) and optional event segments for this service.
          Work-item overrides live on the event package card. Atomic services also choose the time and fee blocks they activate.
        </div>
        <VRow class="mb-2">
          <VCol cols="12" md="6">
            <VSelect
              :model-value="eventSelection.defaultEventId"
              :items="eventItems"
              item-title="title"
              item-value="value"
              label="Default calendar segment (baseline)"
              variant="outlined"
              density="compact"
              clearable
              no-data-text="Configure allowed event types on this service shape first."
              @update:model-value="setDefaultEventId"
            />
          </VCol>
          <VCol cols="12" md="6">
            <VSelect
              :model-value="eventSelection.optionEventIds"
              :items="eventItems"
              item-title="title"
              item-value="value"
              label="Optional calendar segments"
              variant="outlined"
              density="compact"
              multiple
              chips
              closable-chips
              clearable
              no-data-text="Configure allowed event types on this service shape first."
              @update:model-value="setOptionEventIds"
            />
          </VCol>
        </VRow>
        <VDivider class="my-4" />
        <VAlert
          v-if="!isAtomicService"
          type="info"
          variant="tonal"
          density="compact"
        >
          Active time and fee block instances belong to atomic service instances, not orchestrators.
        </VAlert>
        <VRow v-else>
          <VCol cols="12" md="6">
            <VSelect
              v-model="selectedTimeIds"
              :items="timeItems"
              item-title="title"
              item-value="value"
              label="Active time block instances"
              variant="outlined"
              density="compact"
              multiple
              chips
              closable-chips
              clearable
              no-data-text="Configure allowed time block shapes on this service shape first."
            />
          </VCol>
          <VCol cols="12" md="6">
            <VSelect
              v-model="selectedFeeIds"
              :items="feeItems"
              item-title="title"
              item-value="value"
              label="Active fee block instances"
              variant="outlined"
              density="compact"
              multiple
              chips
              closable-chips
              clearable
              no-data-text="Configure allowed price/fee block shapes on this service shape first."
            />
          </VCol>
        </VRow>
      </VExpansionPanelText>
    </VExpansionPanel>
  </VExpansionPanels>
</template>
