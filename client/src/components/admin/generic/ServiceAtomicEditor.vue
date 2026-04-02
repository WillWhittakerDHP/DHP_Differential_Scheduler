<!--
  WHY: Service block instances get a convergence / work-item ledger (Feature 20 §8.3 #2).
  PATTERN: VCard + VDataTable; rows from useServiceAtomicPartRows; persist via useEntityCrud('partInstance').update.
-->
<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import { useServiceAtomicPartRows } from '@/composables/admin/useServiceAtomicPartRows'
import type { ServiceAtomicPartRow } from '@/types/admin/serviceAtomicPartRows'
import { createLogger } from '@/utils/logger'
import { toGlobalEntityId } from '@/utils/globalEntity'

const logger = createLogger('ServiceAtomicEditor')

const props = defineProps<{
  blockInstanceId: string
}>()

const { isServiceBlockInstance, rows } = useServiceAtomicPartRows(() => props.blockInstanceId)
const { update } = useEntityCrud('partInstance')

const isSaving = ref(false)

/** Local edit buffers; seeded when a part row appears, refreshed after successful save. */
const drafts = reactive<
  Record<
    string,
    {
      name: string
      baseTime: string
      rateOverBaseTime: string
      baseFee: string
      rateOverBaseFee: string
    }
  >
>({})

function seedDraftFromRow(r: ServiceAtomicPartRow): void {
  const id = String(r.partInstance.id)
  drafts[id] = {
    name: r.name,
    baseTime: String(r.baseTime),
    rateOverBaseTime: String(r.rateOverBaseTime),
    baseFee: String(r.baseFee),
    rateOverBaseFee: String(r.rateOverBaseFee),
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

const headers = [
  { title: 'Part shape', key: 'partShapeName', sortable: false },
  { title: 'Work item', key: 'name', sortable: false },
  { title: 'Base time', key: 'baseTime', sortable: false },
  { title: 'Rate / base time', key: 'rateOverBaseTime', sortable: false },
  { title: 'Base fee', key: 'baseFee', sortable: false },
  { title: 'Rate / base fee', key: 'rateOverBaseFee', sortable: false },
  { title: 'Zero out', key: 'zeroOutPart', sortable: false },
] as const

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

async function onNameBlur(item: TableRow): Promise<void> {
  const id = String(item.partInstance.id)
  const d = drafts[id]
  if (!d) {
    return
  }
  const next = d.name.trim()
  if (next === item.partInstance.name) {
    return
  }
  const ok = await runUpdate(toGlobalEntityId(id), { name: next }, 'name')
  if (ok) {
    await refreshDraftAfterSave(id)
  }
}

async function onNumericBlur(
  item: TableRow,
  key: 'baseTime' | 'rateOverBaseTime' | 'baseFee' | 'rateOverBaseFee'
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
</script>

<template>
  <VCard
    v-if="isServiceBlockInstance"
    variant="tonal"
    class="mb-4 service-atomic-editor"
  >
    <VCardTitle class="text-subtitle-1">Work items (convergence)</VCardTitle>
    <VCardSubtitle class="text-body-2">
      Per-part time and fee for this service instance. Edits save when you leave a field.
    </VCardSubtitle>
    <VCardText class="pa-2">
      <div class="overflow-x-auto">
        <VDataTable
          :headers="[...headers]"
          :items="tableItems"
          :loading="isSaving"
          item-value="id"
          density="compact"
          hide-default-footer
          class="service-atomic-editor__table"
        >
          <template #item.partShapeName="{ item }">
            <span v-if="item" class="text-body-2">{{ item.partShapeName || '—' }}</span>
          </template>
          <template #item.name="{ item }">
            <VTextField
              v-if="item && drafts[item.id]"
              v-model="drafts[item.id].name"
              density="compact"
              variant="underlined"
              hide-details
              :disabled="isSaving"
              @blur="onNameBlur(item)"
            />
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
          <template #item.rateOverBaseTime="{ item }">
            <VTextField
              v-if="item && drafts[item.id]"
              v-model="drafts[item.id].rateOverBaseTime"
              type="number"
              density="compact"
              variant="underlined"
              hide-details
              :disabled="isSaving"
              @blur="onNumericBlur(item, 'rateOverBaseTime')"
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
          <template #item.rateOverBaseFee="{ item }">
            <VTextField
              v-if="item && drafts[item.id]"
              v-model="drafts[item.id].rateOverBaseFee"
              type="number"
              density="compact"
              variant="underlined"
              hide-details
              :disabled="isSaving"
              @blur="onNumericBlur(item, 'rateOverBaseFee')"
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
    </VCardText>
  </VCard>
</template>
