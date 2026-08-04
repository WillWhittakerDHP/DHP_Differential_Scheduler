<!--
  WHY: Shared part-instance ledger — add + edit work items on service / time / price blocks.
  Parts hold values; blocks only gain meaning through attached part instances.
  PATTERN: VCard + VDataTable; create partInstance + partAssignments; update on blur.
-->
<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { BlockShapeType } from '@/constants/blockShapeTypes'
import { useGlobal } from '@/composables/useGlobal'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import { useRelationshipCrud } from '@/composables/useRelationship'
import { useNotification } from '@/composables/useNotification'
import { useAtomicPartLedgerRows } from '@/composables/admin/useAtomicPartLedgerRows'
import type { ServiceAtomicPartRow } from '@/types/admin/serviceAtomicPartRows'
import { createLogger } from '@/utils/logger'
import { toGlobalEntityId } from '@/utils/globalEntity'
import { getDefaultEntityValues } from '@/utils/entityDefaults'
import { getApiErrorMessage } from '@/composables/useApiErrorMessage'
import {
  assignedPartShapeIdsForBlock,
} from '@/utils/admin/eventPartModifierAttachment'
import {
  defaultPartInstanceName,
  partShapesAvailableToAttach,
} from '@/utils/admin/blockInstancePartAttachment'

const logger = createLogger('AtomicPartLedgerEditor')

const props = withDefaults(
  defineProps<{
    blockInstanceId: string
    allowedShapeTypes: readonly BlockShapeType[]
    title: string
    subtitle: string
    /** When false, hide Part shape column and Add (event modifiers — shape chosen above). */
    nameEditable?: boolean
  }>(),
  {
    nameEditable: true,
  }
)

const { globalData, getGlobalEntityById } = useGlobal()
const { error: notifyError } = useNotification()
const { matchesShapeGate, rows } = useAtomicPartLedgerRows(
  () => props.blockInstanceId,
  () => props.allowedShapeTypes
)
const {
  entities: partInstances,
  create: createPartInstance,
  update,
} = useEntityCrud('partInstance')
const { entities: partShapes } = useEntityCrud('partShape')
const {
  create: createPartAssignment,
  refetch: refetchPartAssignments,
} = useRelationshipCrud('partAssignments')

const isSaving = ref(false)
const isAdding = ref(false)
const shapeToAdd = ref<string | null>(null)

const drafts = reactive<
  Record<
    string,
    {
      baseTime: string
      timePerUnit: string
      baseMultiplier: string
      rateMultiplier: string
      baseFee: string
      feePerUnit: string
    }
  >
>({})

const blockInstance = computed(() =>
  getGlobalEntityById('blockInstance', props.blockInstanceId)
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

const allowedPartShapeIds = computed((): Set<string> | null => {
  const block = blockInstance.value
  const data = globalData.value
  if (!block || !data) {
    return null
  }
  const shapeId = String(block.blockShapeRef)
  const ids = new Set<string>()
  for (const rel of data.relationships.validPartCascades ?? []) {
    if (rel.parent.entityKey !== 'blockShape' || String(rel.parent.id) !== shapeId) {
      continue
    }
    for (const child of rel.children) {
      ids.add(String(child.id))
    }
  }
  return ids.size > 0 ? ids : null
})

const addableShapeItems = computed(() =>
  partShapesAvailableToAttach({
    partShapes: partShapes.value,
    attachedPartShapeIds: attachedPartShapeIds.value,
    allowedPartShapeIds: allowedPartShapeIds.value,
  }).map((option) => ({
    title: option.title,
    value: option.id,
  }))
)

const canAddWorkItem = computed(
  () => props.nameEditable && matchesShapeGate.value && addableShapeItems.value.length > 0
)

function seedDraftFromRow(r: ServiceAtomicPartRow): void {
  const id = String(r.partInstance.id)
  drafts[id] = {
    baseTime: String(r.baseTime),
    timePerUnit: String(r.timePerUnit),
    baseMultiplier: String(r.baseMultiplier),
    rateMultiplier: String(r.rateMultiplier),
    baseFee: String(r.baseFee),
    feePerUnit: String(r.feePerUnit),
  }
}

watch(
  rows,
  (list) => {
    const ids = new Set(list.map((r) => String(r.partInstance.id)))
    for (const key of Object.keys(drafts)) {
      if (!ids.has(key)) {
        delete drafts[key]
      }
    }
    for (const r of list) {
      const id = String(r.partInstance.id)
      if (!(id in drafts)) {
        seedDraftFromRow(r)
      }
    }
  },
  { immediate: true, deep: true }
)

const headers = computed(() => {
  const valueHeaders = [
    { title: 'Base time', key: 'baseTime', sortable: false as const },
    { title: 'Time / unit', key: 'timePerUnit', sortable: false as const },
    { title: 'Base multiplier', key: 'baseMultiplier', sortable: false as const },
    { title: 'Rate multiplier', key: 'rateMultiplier', sortable: false as const },
    { title: 'Base fee', key: 'baseFee', sortable: false as const },
    { title: 'Fee / unit', key: 'feePerUnit', sortable: false as const },
    { title: 'Zero out', key: 'zeroOutPart', sortable: false as const },
  ]
  // WHY: On the parent block card, Part shape identifies the row — a separate name
  // column looked like “which block this belongs to” (defaults copied the block name).
  if (!props.nameEditable) {
    return valueHeaders
  }
  return [{ title: 'Part shape', key: 'partShapeName', sortable: false as const }, ...valueHeaders]
})

type TableRow = ServiceAtomicPartRow & { id: string }

const tableItems = computed((): TableRow[] =>
  rows.value.map((r) => ({
    ...r,
    id: String(r.partInstance.id),
  }))
)

function parseFiniteNumber(raw: string): number | null {
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

async function runUpdate(
  id: GlobalEntityId,
  patch: Record<string, unknown>,
  context: string
): Promise<boolean> {
  isSaving.value = true
  try {
    await update(patch as Parameters<typeof update>[0], id)
    return true
  } catch (error) {
    logger.error('Part instance update failed', { error, context, id })
    return false
  } finally {
    isSaving.value = false
  }
}

async function refreshDraftAfterSave(partId: string): Promise<void> {
  await nextTick()
  const row = rows.value.find((r) => String(r.partInstance.id) === partId)
  if (row) {
    seedDraftFromRow(row)
  }
}

async function onNumericBlur(
  item: TableRow,
  key: 'baseTime' | 'timePerUnit' | 'baseMultiplier' | 'rateMultiplier' | 'baseFee' | 'feePerUnit'
): Promise<void> {
  const id = String(item.partInstance.id)
  const d = drafts[id]
  if (!d) {
    return
  }
  const parsed = parseFiniteNumber(d[key])
  if (parsed === null) {
    logger.warn('Invalid numeric input for part instance field', { key, raw: d[key], id })
    seedDraftFromRow(item)
    return
  }
  if (parsed === item.partInstance[key]) {
    return
  }
  const ok = await runUpdate(toGlobalEntityId(id), { [key]: parsed }, key)
  if (ok) {
    await refreshDraftAfterSave(id)
  }
}

async function onZeroOutUpdate(item: TableRow, value: boolean | null): Promise<void> {
  if (value === null) {
    return
  }
  if (value === item.partInstance.zeroOutPart) {
    return
  }
  const id = String(item.partInstance.id)
  const ok = await runUpdate(toGlobalEntityId(id), { zeroOutPart: value }, 'zeroOutPart')
  if (ok) {
    await refreshDraftAfterSave(id)
  }
}

async function addWorkItem(): Promise<void> {
  const shapeId = shapeToAdd.value
  if (!shapeId || !props.nameEditable) {
    return
  }
  const shapeName = partShapes.value.find((row) => String(row.id) === shapeId)?.name ?? 'Part'
  const blockName = blockInstance.value?.name ?? 'Block'
  isAdding.value = true
  try {
    const defaults = getDefaultEntityValues('partInstance')
    const created = await createPartInstance({
      ...defaults,
      entityKey: 'partInstance',
      name: defaultPartInstanceName(blockName, shapeName),
      partShapeRef: shapeId,
      active: true,
      baseTime: 0,
      timePerUnit: 0,
      baseMultiplier: 1,
      rateMultiplier: 1,
      baseFee: 0,
      feePerUnit: 0,
      zeroOutPart: false,
      orderIndex: rows.value.length,
    })
    await createPartAssignment({
      parentId: toGlobalEntityId(props.blockInstanceId),
      childId: toGlobalEntityId(created.id),
    })
    await refetchPartAssignments()
    shapeToAdd.value = null
  } catch (error) {
    notifyError(getApiErrorMessage(error, 'Could not add work item'))
    logger.error('Failed to add work item', {
      error,
      blockInstanceId: props.blockInstanceId,
      shapeId,
    })
  } finally {
    isAdding.value = false
  }
}
</script>

<template>
  <VCard
    v-if="matchesShapeGate"
    variant="tonal"
    class="mb-4 atomic-part-ledger-editor"
  >
    <VCardTitle class="text-subtitle-1">{{ title }}</VCardTitle>
    <VCardSubtitle class="text-body-2">{{ subtitle }}</VCardSubtitle>
    <VCardText class="pa-2">
      <div
        v-if="tableItems.length === 0"
        class="text-body-small text-medium-emphasis px-2 pb-3"
      >
        No work items on this block yet. Add a part shape below — that is where time and fee values live.
      </div>
      <div class="overflow-x-auto">
        <VDataTable
          v-if="tableItems.length > 0"
          :headers="headers"
          :items="tableItems"
          :loading="isSaving"
          item-value="id"
          density="compact"
          hide-default-footer
          class="atomic-part-ledger-editor__table"
        >
          <template #item.partShapeName="{ item }">
            <span v-if="item" class="text-body-2">{{ item.partShapeName || '—' }}</span>
          </template>
          <template #item.baseTime="{ item }">
            <VTextField
              v-if="item && drafts[item.id]"
              v-model="drafts[item.id].baseTime"
              type="number"
              density="compact"
              variant="underlined"
              hide-details
              :disabled="isSaving"
              @blur="onNumericBlur(item, 'baseTime')"
            />
          </template>
          <template #item.timePerUnit="{ item }">
            <VTextField
              v-if="item && drafts[item.id]"
              v-model="drafts[item.id].timePerUnit"
              type="number"
              density="compact"
              variant="underlined"
              hide-details
              :disabled="isSaving"
              @blur="onNumericBlur(item, 'timePerUnit')"
            />
          </template>
          <template #item.baseMultiplier="{ item }">
            <VTextField
              v-if="item && drafts[item.id]"
              v-model="drafts[item.id].baseMultiplier"
              type="number"
              density="compact"
              variant="underlined"
              hide-details
              :disabled="isSaving"
              @blur="onNumericBlur(item, 'baseMultiplier')"
            />
          </template>
          <template #item.rateMultiplier="{ item }">
            <VTextField
              v-if="item && drafts[item.id]"
              v-model="drafts[item.id].rateMultiplier"
              type="number"
              density="compact"
              variant="underlined"
              hide-details
              :disabled="isSaving"
              @blur="onNumericBlur(item, 'rateMultiplier')"
            />
          </template>
          <template #item.baseFee="{ item }">
            <VTextField
              v-if="item && drafts[item.id]"
              v-model="drafts[item.id].baseFee"
              type="number"
              density="compact"
              variant="underlined"
              hide-details
              :disabled="isSaving"
              @blur="onNumericBlur(item, 'baseFee')"
            />
          </template>
          <template #item.feePerUnit="{ item }">
            <VTextField
              v-if="item && drafts[item.id]"
              v-model="drafts[item.id].feePerUnit"
              type="number"
              density="compact"
              variant="underlined"
              hide-details
              :disabled="isSaving"
              @blur="onNumericBlur(item, 'feePerUnit')"
            />
          </template>
          <template #item.zeroOutPart="{ item }">
            <VCheckbox
              v-if="item"
              :model-value="item.zeroOutPart"
              density="compact"
              hide-details
              :disabled="isSaving"
              @update:model-value="(v: boolean | null) => onZeroOutUpdate(item, v)"
            />
          </template>
        </VDataTable>
      </div>

      <div
        v-if="canAddWorkItem"
        class="d-flex flex-wrap align-center ga-2 mt-3 px-1"
      >
        <VSelect
          v-model="shapeToAdd"
          :items="addableShapeItems"
          item-title="title"
          item-value="value"
          label="Add work item"
          hint="Choose a part type, then Add"
          persistent-hint
          density="compact"
          variant="outlined"
          clearable
          class="flex-grow-1"
          style="min-width: 12rem; max-width: 24rem"
          :disabled="isAdding"
        />
        <VBtn
          color="primary"
          variant="tonal"
          :disabled="!shapeToAdd || isAdding"
          :loading="isAdding"
          @click="addWorkItem"
        >
          Add
        </VBtn>
      </div>
      <div
        v-else-if="nameEditable && matchesShapeGate && addableShapeItems.length === 0"
        class="text-body-small text-medium-emphasis mt-2 px-1"
      >
        All allowed part shapes are already on this block. Add more part types under the block
        shape’s Valid part shapes, or remove an unused work item first.
      </div>
    </VCardText>
  </VCard>
</template>
