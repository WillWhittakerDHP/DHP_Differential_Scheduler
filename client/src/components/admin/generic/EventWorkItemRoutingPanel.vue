<!--
  WHY: Event-package work-item → segment overrides (PartFinalizer). Not duration modifiers.
  PATTERN: VCard + table; immediate relationship CRUD like ServiceActiveBlockControls.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { useGlobal } from '@/composables/useGlobal'
import { useRelationshipCrud } from '@/composables/useRelationship'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import { createLogger } from '@/utils/logger'
import {
  buildEventWorkItemRoutingRows,
  packageSegmentIdsForEventBlock,
  segmentOptionsForEventBlock,
  syncPartEventSegmentOverride,
} from '@/utils/admin/eventWorkItemRouting'

const logger = createLogger('EventWorkItemRoutingPanel')

const props = defineProps<{
  blockInstanceId: string
}>()

const { globalData } = useGlobal()
const { entities: blockInstances } = useEntityCrud('blockInstance')
const { entities: blockShapes } = useEntityCrud('blockShape')
const { entities: partInstances } = useEntityCrud('partInstance')
const { entities: partShapes } = useEntityCrud('partShape')
const { entities: eventInstances } = useEntityCrud('eventInstance')
const {
  create: createEventAssignment,
  remove: removeEventAssignment,
  refetch: refetchEventAssignments,
} = useRelationshipCrud('eventAssignments')

const packageSegmentIds = computed(() =>
  packageSegmentIdsForEventBlock(props.blockInstanceId, eventInstances.value)
)

const hasSegments = computed(() => packageSegmentIds.value.length > 0)

const segmentItems = computed(() => {
  const options = segmentOptionsForEventBlock(props.blockInstanceId, eventInstances.value)
  return [
    { title: 'Use service default', value: null as string | null },
    ...options.map((option) => ({ title: option.title, value: option.id as string | null })),
  ]
})

const rows = computed(() => {
  const data = globalData.value
  if (!data || !hasSegments.value) {
    return []
  }
  return buildEventWorkItemRoutingRows({
    eventBlockInstanceId: props.blockInstanceId,
    blockInstances: blockInstances.value,
    blockShapes: blockShapes.value,
    partInstances: partInstances.value,
    partShapes: partShapes.value,
    partAssignments: data.relationships.partAssignments,
    eventInstances: eventInstances.value,
    eventAssignments: data.relationships.eventAssignments,
  })
})

const headers = [
  { title: 'Service', key: 'serviceBlockName', sortable: false },
  { title: 'Work item', key: 'workItemName', sortable: false },
  { title: 'Part shape', key: 'partShapeName', sortable: false },
  { title: 'Calendar segment', key: 'assignedSegmentId', sortable: false },
] as const

async function setSegmentForPart(partInstanceId: string, desiredSegmentId: unknown): Promise<void> {
  const normalized =
    typeof desiredSegmentId === 'string' && desiredSegmentId.trim() !== ''
      ? desiredSegmentId
      : null
  const row = rows.value.find((r) => r.partInstanceId === partInstanceId)
  const currentlyAssigned = row?.assignedSegmentId ? [row.assignedSegmentId] : []
  try {
    await syncPartEventSegmentOverride({
      partInstanceId,
      packageSegmentIds: packageSegmentIds.value,
      desiredSegmentId: normalized,
      currentlyAssignedSegmentIds: currentlyAssigned,
      createEventAssignment,
      removeEventAssignment,
    })
    await refetchEventAssignments()
  } catch (error) {
    logger.error('Failed to update work-item segment routing', {
      error,
      partInstanceId,
      desiredSegmentId: normalized,
      eventBlockInstanceId: props.blockInstanceId,
    })
  }
}
</script>

<template>
  <VCard
    v-if="hasSegments"
    variant="outlined"
    class="mb-4"
  >
    <VCardTitle class="text-subtitle-1">
      Work item routing
    </VCardTitle>
    <VCardText>
      <div class="text-body-small text-medium-emphasis mb-3">
        Choose which calendar segment each work item uses under this event package.
        Leave “Use service default” to keep the service card’s baseline segment.
      </div>
      <VDataTable
        :headers="[...headers]"
        :items="rows"
        item-value="partInstanceId"
        density="compact"
        hide-default-footer
        :items-per-page="-1"
        class="elevation-0"
      >
        <template #item.assignedSegmentId="{ item }">
          <VSelect
            :model-value="item.assignedSegmentId"
            :items="segmentItems"
            item-title="title"
            item-value="value"
            density="compact"
            variant="outlined"
            hide-details
            clearable
            @update:model-value="(value) => setSegmentForPart(item.partInstanceId, value)"
          />
        </template>
        <template #no-data>
          <div class="text-body-small text-medium-emphasis pa-4">
            No service work items found. Assign parts on service cards first.
          </div>
        </template>
      </VDataTable>
    </VCardText>
  </VCard>
</template>
