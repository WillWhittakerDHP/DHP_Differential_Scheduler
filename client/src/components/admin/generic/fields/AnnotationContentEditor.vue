<!--
  WHY: Annotation copy varies by wizard user type; one row per user type plus a chosen default for the generic row and `annotation_instances.text`.
  PATTERN: Syncs `text` + `contentRows` on the vee-validate form (see resolveAnnotationTextForAssignment on server).
-->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { FormContext } from 'vee-validate'
import { useAdmin } from '@/composables/admin/useAdmin'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import { listSortedUserTypeBlockInstances } from '@/utils/admin/userTypeBlockInstances'
import { nilToEmptyArray, nilToEmptyString } from '@shared/utils/nilDefaults'

export interface AnnotationContentRowForm {
  userTypeBlockInstanceId: string | null
  text: string
}

interface Props {
  /** Caller guarantees annotationInstance when this component is shown. */
  entity: GlobalEntity<GlobalEntityKey>
  form: FormContext
}

const props = defineProps<Props>()

const admin = useAdmin()

const userTypeBlockInstances = computed(() => listSortedUserTypeBlockInstances(admin))

/** Per user-type block instance id → text for that row. */
const perUserTexts = ref<Record<string, string>>({})

/** Whose textarea value is written to the generic `contentRows` row and `form.values.text`. */
const defaultUserTypeInstanceId = ref('')

function buildContentRowsPayload(): AnnotationContentRowForm[] {
  const insts = userTypeBlockInstances.value
  const defaultId = defaultUserTypeInstanceId.value
  const genericText = nilToEmptyString(perUserTexts.value[defaultId])
  const rows: AnnotationContentRowForm[] = [
    { userTypeBlockInstanceId: null, text: genericText },
  ]
  for (const inst of insts) {
    const id = String(inst.id)
    rows.push({
      userTypeBlockInstanceId: id,
      text: nilToEmptyString(perUserTexts.value[id]),
    })
  }
  return rows
}

function syncFormContentRows(): void {
  const next = buildContentRowsPayload()
  const prev = props.form.values.contentRows as AnnotationContentRowForm[] | undefined
  if (JSON.stringify(prev) === JSON.stringify(next)) {
    return
  }
  void props.form.setFieldValue('contentRows', next)
}

function applyDefaultTextAndRows(): void {
  if (userTypeBlockInstances.value.length === 0) {
    return
  }
  const defaultId = defaultUserTypeInstanceId.value
  const genericText = nilToEmptyString(perUserTexts.value[defaultId])
  void props.form.setFieldValue('text', genericText)
  syncFormContentRows()
}

function hydrateFromEntity(): void {
  const insts = userTypeBlockInstances.value
  if (insts.length === 0) {
    perUserTexts.value = {}
    defaultUserTypeInstanceId.value = ''
    return
  }

  const entity = props.entity as GlobalEntity<'annotationInstance'>
  const rows = nilToEmptyArray(entity.contentRows)

  let genericText = ''
  const byUser = new Map<string, string>()
  for (const r of rows) {
    const uid = r.userTypeBlockInstanceId
    const t = typeof r.text === 'string' ? r.text : ''
    if (uid == null || uid === '') {
      genericText = t
    } else {
      byUser.set(String(uid), t)
    }
  }

  const next: Record<string, string> = {}
  for (const inst of insts) {
    const id = String(inst.id)
    next[id] = nilToEmptyString(byUser.get(id))
  }

  const legacyText = typeof entity.text === 'string' ? entity.text : ''
  const hasRowData = rows.length > 0

  let defaultId = String(insts[0].id)

  if (hasRowData) {
    if (genericText !== '') {
      const match = insts.find((i) => nilToEmptyString(next[String(i.id)]) === genericText)
      if (match) {
        defaultId = String(match.id)
      } else {
        const firstId = String(insts[0].id)
        if (!next[firstId]) {
          next[firstId] = genericText
        }
        defaultId = firstId
      }
    } else {
      const nonEmpty = insts.find((i) => nilToEmptyString(next[String(i.id)]) !== '')
      if (nonEmpty) {
        defaultId = String(nonEmpty.id)
      }
    }
  } else if (legacyText !== '') {
    const firstId = String(insts[0].id)
    next[firstId] = legacyText
    defaultId = firstId
  }

  perUserTexts.value = next
  defaultUserTypeInstanceId.value = defaultId
}

function setPerUserText(instId: string, text: string): void {
  perUserTexts.value = { ...perUserTexts.value, [instId]: text }
}

const userTypeIdsSignature = computed((): string =>
  userTypeBlockInstances.value
    .map((i) => String(i.id))
    .sort()
    .join(',')
)

watch(
  [() => props.entity.id, userTypeIdsSignature],
  () => {
    hydrateFromEntity()
  },
  { immediate: true, flush: 'post' }
)

watch(
  [defaultUserTypeInstanceId, perUserTexts],
  () => {
    applyDefaultTextAndRows()
  },
  { deep: true, flush: 'post' }
)
</script>

<template>
  <div
    v-if="userTypeBlockInstances.length > 0"
    class="annotation-content-editor mt-4"
  >
    <div class="text-subtitle-2 mb-1">
      Text by user type
    </div>
    <p class="text-body-2 text-medium-emphasis mb-4">
      Each row is stored for that wizard user type. Mark one row as the default fallback when no row matches the assignment; that value is also kept in sync with the annotation’s main text field for saves and older code paths.
    </p>

    <VRadioGroup
      v-model="defaultUserTypeInstanceId"
      class="annotation-content-radio-group"
      hide-details
    >
      <div
        v-for="inst in userTypeBlockInstances"
        :key="inst.id"
        class="annotation-user-type-row mb-4"
      >
        <div class="d-flex align-start gap-3">
          <div class="pt-2">
            <VRadio
              :value="String(inst.id)"
              density="comfortable"
            />
          </div>
          <div class="flex-grow-1 min-width-0">
            <div class="d-flex flex-wrap align-center gap-2 mb-1">
              <VLabel class="text-body-2 font-weight-medium mb-0">
                {{ inst.name || 'User type' }}
              </VLabel>
              <VChip
                v-if="defaultUserTypeInstanceId === String(inst.id)"
                size="small"
                variant="tonal"
                color="primary"
              >
                Default fallback
              </VChip>
            </div>
            <VTextarea
              :model-value="perUserTexts[String(inst.id)] ?? ''"
              rows="3"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              @update:model-value="(v: string) => setPerUserText(String(inst.id), v)"
            />
          </div>
        </div>
      </div>
    </VRadioGroup>
  </div>
</template>

<style scoped>
.annotation-content-radio-group :deep(.v-selection-control) {
  align-items: flex-start;
}
</style>
