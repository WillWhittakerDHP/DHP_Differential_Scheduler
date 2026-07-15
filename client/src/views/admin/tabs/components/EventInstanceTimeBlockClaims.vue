<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGlobal } from '@/composables/useGlobal'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import {
  buildEventTimeClaimServiceOptions,
  timeBlockClaimIdsFromDraftValue,
  type EventTimeClaimBlockOption,
} from '@/utils/admin/eventPartClaimAssignments'

const claims = defineModel<string[]>({ required: true })

const expandedClaimServices = ref<string[]>([])
const expandedClaimTimes = ref<string[]>([])

const { globalData } = useGlobal()
const { entities: blockInstances } = useEntityCrud('blockInstance')
const { entities: blockShapes } = useEntityCrud('blockShape')
const { entities: partInstances } = useEntityCrud('partInstance')
const { entities: partShapes } = useEntityCrud('partShape')

const timeClaimServices = computed(() =>
  buildEventTimeClaimServiceOptions({
    blockInstances: blockInstances.value,
    blockShapes: blockShapes.value,
    partInstances: partInstances.value,
    partShapes: partShapes.value,
    partAssignments: globalData.value?.relationships?.partAssignments ?? [],
    bookingCascades: globalData.value?.relationships?.bookingCascades ?? [],
    instanceComponents: globalData.value?.relationships?.instanceComponents ?? [],
  })
)

const selectedIds = computed<string[]>({
  get: () => timeBlockClaimIdsFromDraftValue(claims.value),
  set: (ids) => {
    claims.value = timeBlockClaimIdsFromDraftValue(ids)
  },
})

function selectedTimeBlockSet(): Set<string> {
  return new Set(selectedIds.value)
}

function timeBlockSelected(timeBlock: EventTimeClaimBlockOption): boolean {
  return selectedTimeBlockSet().has(timeBlock.id)
}

function setTimeBlockClaim(timeBlockId: string, value: boolean | null): void {
  if (value === null) return
  const selected = selectedTimeBlockSet()
  if (value) {
    selected.add(timeBlockId)
  } else {
    selected.delete(timeBlockId)
  }
  selectedIds.value = Array.from(selected)
}
</script>

<template>
  <div class="mt-4">
    <div class="text-subtitle-2 mb-1">Claimed time blocks</div>
    <div class="text-body-small text-medium-emphasis mb-3">
      Events claim time blocks. Services are shown only as grouping context, and each selected time block passes its parts through to this calendar segment.
    </div>

    <VAlert
      v-if="timeClaimServices.length === 0"
      type="info"
      variant="tonal"
      density="compact"
    >
      No active base time blocks found under base services yet. Activate time blocks on the service block card first.
    </VAlert>

    <VExpansionPanels
      v-model="expandedClaimServices"
      multiple
      variant="accordion"
    >
      <VExpansionPanel
        v-for="service in timeClaimServices"
        :key="service.id"
        :value="service.id"
      >
        <VExpansionPanelTitle>
          {{ service.title }}
        </VExpansionPanelTitle>
        <VExpansionPanelText>
          <VExpansionPanels
            v-model="expandedClaimTimes"
            multiple
            variant="accordion"
          >
            <VExpansionPanel
              v-for="timeBlock in service.timeBlocks"
              :key="timeBlock.id"
              :value="`${service.id}:${timeBlock.id}`"
            >
              <VExpansionPanelTitle>
                <div class="d-flex align-center gap-2">
                  <VCheckbox
                    :model-value="timeBlockSelected(timeBlock)"
                    :label="timeBlock.title"
                    density="compact"
                    hide-details
                    @click.stop
                    @update:model-value="(value) => setTimeBlockClaim(timeBlock.id, value)"
                  />
                </div>
              </VExpansionPanelTitle>
              <VExpansionPanelText>
                <div class="text-body-small text-medium-emphasis mb-2">
                  {{ timeBlock.subtitle }}
                </div>
                <div
                  v-if="timeBlock.parts.length === 0"
                  class="text-body-small text-medium-emphasis"
                >
                  No parts assigned to this time block yet.
                </div>
                <ul v-else class="mb-0 pl-4">
                  <li
                    v-for="part in timeBlock.parts"
                    :key="part.id"
                  >
                    {{ part.label }}
                  </li>
                </ul>
              </VExpansionPanelText>
            </VExpansionPanel>
          </VExpansionPanels>
        </VExpansionPanelText>
      </VExpansionPanel>
    </VExpansionPanels>
  </div>
</template>
