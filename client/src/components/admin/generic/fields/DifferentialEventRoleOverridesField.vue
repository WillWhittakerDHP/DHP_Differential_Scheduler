<template>
  <BaseInput
    :field-key="String(fieldContext.state.fieldKey)"
    :display-config="fieldContext.state.displayConfig"
    :error="fieldContext.state.error?.value"
    :show-label="showLabel"
    :is-disabled="fieldContext.state.isDisabled.value"
  >
    <!--
      WHY: BaseInput `.field-content` is `display: flex` (row). Multiple slot roots become
      side-by-side siblings — long help text steals width and crams the matrix. One wrapper
      = one flex child, full-width column stack.
    -->
    <div class="differential-role-field-stack">
      <!-- WHY: Placement defines template defaults; overrides adjust scheduling weight per block instance. -->
      <p class="text-body-2 text-medium-emphasis mb-0">
        {{ displayConfig.helpText ?? defaultHelpText }}
      </p>

      <VAlert
        v-if="matrixRows.length === 0"
        type="info"
        variant="tonal"
        density="compact"
        class="mb-0"
      >
        No active event shapes yet. Add shapes under Shapes → Events, then return here to set per-block scheduling overrides.
      </VAlert>

      <div
        v-else
        class="differential-role-matrix"
      >
        <VRow
          v-for="row in matrixRows"
          :key="row.eventShapeId"
          class="align-center differential-role-matrix__row"
          density="comfortable"
        >
          <VCol
            cols="12"
            md="5"
            lg="4"
          >
            <div class="text-body-2 font-weight-medium">
              {{ row.name }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ row.placementCaption }}
            </div>
            <div class="text-caption text-medium-emphasis">
              Schedules as {{ schedulingRoleLabel(row.templateRole) }}
            </div>
          </VCol>
          <VCol
            cols="12"
            md="7"
            lg="8"
          >
            <VSelect
              :model-value="selectValueForRow(row)"
              :items="roleSelectItems"
              item-title="title"
              item-value="value"
              density="comfortable"
              variant="outlined"
              hide-details="auto"
              class="differential-role-matrix__select"
              :disabled="matrixSelectDisabled"
              @update:model-value="(v: unknown) => onRowRoleUpdate(row.eventShapeId, v)"
            />
          </VCol>
        </VRow>
      </div>
    </div>
  </BaseInput>
</template>

<script setup lang="ts">
/**
 * LEARNING: JSON map fields need a dedicated control so admins don’t edit raw JSON.
 * PATTERN: Same field-context contract as IconInput / SelectInputs (grouped context + setValue).
 */
import { computed } from 'vue'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import type { GlobalEntityKey } from '@/constants/entities'
import type { DifferentialEventRoleOverridesMap, GlobalFieldKey } from '@/constants/primitives'
import { useAdmin } from '@/composables/admin/useAdmin'
import { buildDifferentialRoleMatrixRows } from '@/utils/admin/differentialRoleMatrixRows'
import type { BlockInstanceEntity, EventShapeEntity } from '@/types/entities'
import type { DifferentialRole } from '@shared/types/differentialRole'
import { DIFFERENTIAL_ROLE_LABELS } from '@shared/constants/differentialRoleMappings'
import { sanitizeDifferentialEventRoleOverridesInput } from '@shared/utils/differentialRoleUtils'
import BaseInput from './BaseInput.vue'

const INHERIT_SENTINEL = '__inherit__' as const

interface RoleSelectItem {
  title: string
  value: typeof INHERIT_SENTINEL | DifferentialRole
}

const props = defineProps<{
  fieldContext: FieldContextTypeGrouped<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  showLabel?: boolean
}>()

const admin = useAdmin()

const defaultHelpText =
  'Each row is an active event shape. Its placement (primary vs secondary, which edge, etc.) sets how that segment ' +
  'participates in scheduling by default. You can override that behavior for this block instance only; choose Inherit ' +
  'to use the shape’s placement defaults.'

const displayConfig = computed(() => props.fieldContext.state.displayConfig)

const matrixSelectDisabled = computed(
  () => props.fieldContext.state.isDisabled.value || props.fieldContext.state.displayConfig.readOnly
)

const blockInstance = computed((): BlockInstanceEntity | undefined => {
  const id = props.fieldContext.state.entityId
  return admin.getEntity('blockInstance', id) as BlockInstanceEntity | undefined
})

const matrixRows = computed(() =>
  buildDifferentialRoleMatrixRows(
    blockInstance.value,
    admin.getEntitiesByKey('eventShape') as EventShapeEntity[]
  )
)

const roleSelectItems = computed((): RoleSelectItem[] => [
  { title: 'Inherit (use shape placement default)', value: INHERIT_SENTINEL },
  { title: DIFFERENTIAL_ROLE_LABELS.major, value: 'major' },
  { title: DIFFERENTIAL_ROLE_LABELS.minor, value: 'minor' },
  { title: DIFFERENTIAL_ROLE_LABELS.minimizer, value: 'minimizer' },
  { title: DIFFERENTIAL_ROLE_LABELS.margin, value: 'margin' },
  { title: DIFFERENTIAL_ROLE_LABELS.none, value: 'none' },
])

const overridesMap = computed((): DifferentialEventRoleOverridesMap => {
  const raw = props.fieldContext.state.value.value
  const sanitized = sanitizeDifferentialEventRoleOverridesInput(raw)
  return sanitized
})

function selectValueForRow(row: { eventShapeId: GlobalEntityId }): RoleSelectItem['value'] {
  const o = overridesMap.value[row.eventShapeId]
  return o === undefined ? INHERIT_SENTINEL : o
}

function schedulingRoleLabel(role: DifferentialRole): string {
  return DIFFERENTIAL_ROLE_LABELS[role]
}

function onRowRoleUpdate(eventShapeId: GlobalEntityId, raw: unknown): void {
  const selected = raw as RoleSelectItem['value'] | null
  const next: Record<string, DifferentialRole> = { ...overridesMap.value }
  if (selected === null || selected === INHERIT_SENTINEL) {
    delete next[eventShapeId]
  } else {
    next[eventShapeId] = selected
  }
  props.fieldContext.actions.setValue(next)
}
</script>

<style scoped>
.differential-role-field-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  min-width: 0;
  flex: 1 1 100%;
}

.differential-role-matrix__row + .differential-role-matrix__row {
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.differential-role-matrix__select {
  max-width: 100%;
}
</style>
