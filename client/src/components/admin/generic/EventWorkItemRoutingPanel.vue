<!--
  WHY: Event-package part → segment overrides (PartFinalizer). Strategy C: packages own routing;
  atomics only when they own segments (unusual). Sources = service + time parts.
  PATTERN: VCard + table; immediate relationship CRUD like ServiceActiveBlockControls.
-->
<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useGlobal } from '@/composables/useGlobal'
import { useRelationshipCrud } from '@/composables/useRelationship'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import { useNotification } from '@/composables/useNotification'
import { createLogger } from '@/utils/logger'
import { getApiErrorMessage } from '@/composables/useApiErrorMessage'
import {
  buildEventWorkItemRoutingRows,
  packageSegmentIdsForEventBlock,
  segmentOptionsForEventBlock,
  syncPartEventSegmentOverride,
} from '@/utils/admin/eventWorkItemRouting'
import { assignedPartShapeIdsForBlock } from '@/utils/admin/eventPartModifierAttachment'

const logger = createLogger('EventWorkItemRoutingPanel')

const props = defineProps<{
  blockInstanceId: string
}>()

const { globalData } = useGlobal()
const { error: notifyError } = useNotification()
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

/** Local overrides so the select updates immediately (cache used to miss part parents). */
const pendingSegmentByPartId = reactive<Record<string, string | null>>({})

const blockInstance = computed(() =>
  blockInstances.value.find((block) => String(block.id) === props.blockInstanceId) ?? null
)

/** Package surface: orchestrator or composite — full catalog, no part-shape filter. */
const isEventPackage = computed(
  () =>
    blockInstance.value?.orchestrator === true ||
    blockInstance.value?.composite === true
)

const attachedPartShapeIds = computed(() => {
  const data = globalData.value
  if (!data) {
    return new Set<string>()
  }
  return assignedPartShapeIdsForBlock({
    blockInstanceId: props.blockInstanceId,
    partAssignments: data.relationships.partAssignments,
    partInstances: partInstances.value,
  })
})

const packageSegmentIds = computed(() =>
  packageSegmentIdsForEventBlock(props.blockInstanceId, eventInstances.value)
)

const hasSegments = computed(() => packageSegmentIds.value.length > 0)

/**
 * Strategy C: packages route all service/time parts; atomics (if they own segments) only
 * their attached part shape. Modifier-only atomics have no segments → panel hidden.
 */
const routingShapeLimit = computed((): Set<string> | null => {
  if (isEventPackage.value) {
    return null
  }
  return attachedPartShapeIds.value
})

const needsPartShapeBeforeRouting = computed(
  () => !isEventPackage.value && attachedPartShapeIds.value.size === 0
)

/** Empty string = use service default (VSelect is unreliable with null item values). */
const segmentItems = computed(() => {
  const options = segmentOptionsForEventBlock(props.blockInstanceId, eventInstances.value)
  return [
    { title: 'Use service default', value: '' },
    ...options.map((option) => ({ title: option.title, value: option.id })),
  ]
})

const catalogRows = computed(() => {
  const data = globalData.value
  if (!data || !hasSegments.value || needsPartShapeBeforeRouting.value) {
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
    limitToPartShapeIds: routingShapeLimit.value,
  })
})

const rows = computed(() =>
  catalogRows.value.map((row) => {
    const pending = pendingSegmentByPartId[row.partInstanceId]
    return {
      ...row,
      assignedSegmentId:
        pending !== undefined ? pending : row.assignedSegmentId,
    }
  })
)

const headers = [
  { title: 'Source', key: 'sourceBlockName', sortable: false },
  { title: 'Calendar segment', key: 'assignedSegmentId', sortable: false },
] as const

function selectModelValue(assignedSegmentId: string | null): string {
  return assignedSegmentId ?? ''
}

async function setSegmentForPart(partInstanceId: string, desiredSegmentId: unknown): Promise<void> {
  const normalized =
    typeof desiredSegmentId === 'string' && desiredSegmentId.trim() !== ''
      ? desiredSegmentId
      : null
  const catalogRow = catalogRows.value.find((r) => r.partInstanceId === partInstanceId)
  const currentlyAssigned = catalogRow?.assignedSegmentId ? [catalogRow.assignedSegmentId] : []
  const previousPending = pendingSegmentByPartId[partInstanceId]
  pendingSegmentByPartId[partInstanceId] = normalized

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
    delete pendingSegmentByPartId[partInstanceId]
  } catch (error) {
    if (previousPending !== undefined) {
      pendingSegmentByPartId[partInstanceId] = previousPending
    } else {
      delete pendingSegmentByPartId[partInstanceId]
    }
    const message = getApiErrorMessage(error, 'Could not save segment routing')
    notifyError(message)
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
        <template v-if="isEventPackage">
          Route work items from service and time blocks to this package’s calendar segments.
          Leave “Use service default” for the service card’s baseline.
        </template>
        <template v-else>
          Route work items of this atomic event’s attached part shape to a calendar segment.
          Prefer putting segments and routing on a composite event package.
        </template>
      </div>
      <VAlert
        v-if="needsPartShapeBeforeRouting"
        type="info"
        variant="tonal"
        density="compact"
        class="mb-2"
      >
        Attach a part shape above first — routing only lists work items of that shape.
      </VAlert>
      <VDataTable
        v-else
        :headers="[...headers]"
        :items="rows"
        item-value="partInstanceId"
        density="compact"
        hide-default-footer
        :items-per-page="-1"
        class="elevation-0"
      >
        <template #item.assignedSegmentId="{ item }">
          <div @click.stop>
            <VSelect
              :model-value="selectModelValue(item.assignedSegmentId)"
              :items="segmentItems"
              item-title="title"
              item-value="value"
              density="compact"
              variant="outlined"
              hide-details
              clearable
              :menu-props="{ closeOnContentClick: true }"
              @update:model-value="(value) => setSegmentForPart(item.partInstanceId, value)"
            />
          </div>
        </template>
        <template #no-data>
          <div class="text-body-small text-medium-emphasis pa-4">
            No matching parts on service or time blocks for this filter.
          </div>
        </template>
      </VDataTable>
    </VCardText>
  </VCard>
</template>
