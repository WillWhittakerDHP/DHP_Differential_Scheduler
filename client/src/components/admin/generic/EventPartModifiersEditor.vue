<!--
  WHY: Strategy C — atomic event = one part shape (modifiers). Packages (composite /
  orchestrator) own segments + routing; they package atomics under Components.
  PATTERN: Simple VSelect; create or update the single modifier partInstance on change.
-->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import { useGlobal } from '@/composables/useGlobal'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import { useRelationshipCrud } from '@/composables/useRelationship'
import { useNotification } from '@/composables/useNotification'
import { getApiErrorMessage } from '@/composables/useApiErrorMessage'
import { createLogger } from '@/utils/logger'
import { toGlobalEntityId } from '@/utils/globalEntity'
import { getDefaultEntityValues } from '@/utils/entityDefaults'
import AtomicPartLedgerEditor from './AtomicPartLedgerEditor.vue'
import {
  allActivePartShapeOptions,
  firstAssignedPartInstanceForBlock,
} from '@/utils/admin/eventPartModifierAttachment'

const logger = createLogger('EventPartModifiersEditor')

const props = defineProps<{
  blockInstanceId: string
}>()

const EVENT_TYPES = [BLOCK_SHAPE_TYPES.EVENT] as const

const { globalData } = useGlobal()
const { error: notifyError } = useNotification()
const { entities: blockInstances } = useEntityCrud('blockInstance')
const { entities: partShapes } = useEntityCrud('partShape')
const { entities: partInstances, create: createPartInstance, update: updatePartInstance } =
  useEntityCrud('partInstance')
const {
  create: createPartAssignment,
  refetch: refetchPartAssignments,
} = useRelationshipCrud('partAssignments')

const isSaving = ref(false)

const blockInstance = computed(() =>
  blockInstances.value.find((block) => String(block.id) === props.blockInstanceId) ?? null
)

/** Package surface: no part-shape select — segments/routing + Components instead. */
const isEventPackage = computed(
  () =>
    blockInstance.value?.orchestrator === true ||
    blockInstance.value?.composite === true
)

const assignedPart = computed(() => {
  const data = globalData.value
  if (!data) {
    return null
  }
  return firstAssignedPartInstanceForBlock({
    blockInstanceId: props.blockInstanceId,
    partAssignments: data.relationships.partAssignments,
    partInstances: partInstances.value,
  })
})

const selectedShapeId = ref<string | null>(null)

watch(
  assignedPart,
  (part) => {
    selectedShapeId.value = part ? String(part.partShapeRef) : null
  },
  { immediate: true }
)

const partShapeItems = computed(() =>
  allActivePartShapeOptions(partShapes.value).map((option) => ({
    title: option.title,
    value: option.id,
  }))
)

const hasPartShape = computed(
  () => typeof selectedShapeId.value === 'string' && selectedShapeId.value.trim() !== ''
)

async function onPartShapeChange(value: unknown): Promise<void> {
  if (isEventPackage.value) {
    return
  }
  const shapeId = typeof value === 'string' && value.trim() !== '' ? value : null
  if (!shapeId) {
    // Required field — restore previous selection if cleared.
    selectedShapeId.value = assignedPart.value ? String(assignedPart.value.partShapeRef) : null
    notifyError('Part shape is required for an atomic event')
    return
  }
  if (assignedPart.value && String(assignedPart.value.partShapeRef) === shapeId) {
    selectedShapeId.value = shapeId
    return
  }

  const shapeName = partShapes.value.find((row) => String(row.id) === shapeId)?.name ?? 'Part'
  const blockName = blockInstance.value?.name ?? 'Event'
  isSaving.value = true
  selectedShapeId.value = shapeId
  try {
    if (assignedPart.value) {
      await updatePartInstance(
        {
          partShapeRef: shapeId,
          name: `${blockName} — ${shapeName}`,
        },
        toGlobalEntityId(assignedPart.value.id)
      )
    } else {
      const defaults = getDefaultEntityValues('partInstance')
      const created = await createPartInstance({
        ...defaults,
        entityKey: 'partInstance',
        name: `${blockName} — ${shapeName}`,
        partShapeRef: shapeId,
        active: true,
        baseTime: 0,
        timePerUnit: 0,
        baseMultiplier: 1,
        rateMultiplier: 1,
        baseFee: 0,
        feePerUnit: 0,
        zeroOutPart: false,
        orderIndex: 0,
      })
      await createPartAssignment({
        parentId: toGlobalEntityId(props.blockInstanceId),
        childId: toGlobalEntityId(created.id),
      })
    }
    await refetchPartAssignments()
  } catch (error) {
    selectedShapeId.value = assignedPart.value ? String(assignedPart.value.partShapeRef) : null
    notifyError(getApiErrorMessage(error, 'Could not set part shape'))
    logger.error('Failed to set atomic event part shape', {
      error,
      blockInstanceId: props.blockInstanceId,
      shapeId,
    })
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <VAlert
    v-if="isEventPackage"
    type="info"
    variant="tonal"
    density="compact"
    class="mb-4"
  >
    Event packages do not set a part shape. They own calendar segments and work-item routing.
    Turn on <strong>Composite</strong>, then add atomic event children under Components — each
    atomic has its own part shape for duration modifiers.
  </VAlert>

  <div
    v-else
    class="mb-4"
  >
    <VSelect
      :model-value="selectedShapeId"
      :items="partShapeItems"
      item-title="title"
      item-value="value"
      label="Part shape"
      hint="Required — which part type this atomic event modifies"
      persistent-hint
      variant="outlined"
      density="compact"
      class="mb-4"
      :loading="isSaving"
      :disabled="isSaving"
      :error="!hasPartShape"
      :error-messages="hasPartShape ? [] : ['Part shape is required']"
      @update:model-value="onPartShapeChange"
    />

    <AtomicPartLedgerEditor
      v-if="hasPartShape"
      :block-instance-id="blockInstanceId"
      :allowed-shape-types="EVENT_TYPES"
      :name-editable="false"
      title="Event part modifiers"
      subtitle="Duration tweaks for the selected part shape (extra minutes, multipliers, or zero-out)."
    />
  </div>
</template>
