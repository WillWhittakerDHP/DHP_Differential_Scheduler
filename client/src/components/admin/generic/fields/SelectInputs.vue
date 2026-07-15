<template>
  <BaseInput
    :field-key="String(fieldContext.state.fieldKey)"
    :display-config="fieldContext.state.displayConfig"
    :error="fieldContext.state.error?.value"
    :show-label="false"
    :is-disabled="fieldContext.state.isDisabled.value"
  >
    <!-- WHY: Convenience presets only; saved rows are still segment-scoped attendee relationships. -->
    <!-- PATTERN: Conditionally render buttons above select field only for AttendeeSelect type -->
    <div v-if="isAttendeeSelect" class="attendee-quick-select mb-3">
      <div class="d-flex gap-2 flex-wrap">
        <VBtn
          size="small"
          variant="outlined"
          :disabled="isQuickSelectMajorDisabled"
          :loading="quickSelect.isLoading.value"
          @click="handleQuickSelectMajor"
        >
          Select Internal
        </VBtn>
        <VBtn
          size="small"
          variant="outlined"
          :disabled="isQuickSelectMinorDisabled"
          :loading="quickSelect.isLoading.value"
          @click="handleQuickSelectMinor"
        >
          Select Client-Facing
        </VBtn>
        <VBtn
          size="small"
          variant="outlined"
          :disabled="isQuickSelectAllDisabled"
          :loading="quickSelect.isLoading.value"
          @click="handleQuickSelectAll"
        >
          Select All
        </VBtn>
      </div>
      <div v-if="quickSelect.error.value" class="text-body-small text-error mt-1">
        {{ quickSelect.error.value }}
      </div>
      <div v-else-if="!quickSelect.hasMajorAttendees.value && !quickSelect.hasMinorAttendees.value && !quickSelect.isLoading.value" class="text-body-small text-medium-emphasis mt-1">
        Configure attendee presets in Business Controls to use quick-select
      </div>
    </div>

    <!-- WHY: Single AppSelect with all options; groupByKey only affects option grouping inside the dropdown -->
    <AppSelect
      :key="`select-${String(fieldContext.state.fieldKey)}-${isMultiple}`"
      :id="`field-${String(fieldContext.state.fieldKey)}`"
      :name="String(fieldContext.state.fieldKey)"
      :model-value="fieldValue"
      :items="options"
      :label="resolvedLabel"
      :placeholder="fieldContext.state.displayConfig.placeholder"
      :disabled="fieldContext.state.displayConfig.disabled"
      :readonly="fieldContext.state.displayConfig.readOnly"
      :error="!!fieldContext.state.error?.value"
      :error-messages="fieldContext.state.error?.value"
      :multiple="isMultiple"
      v-bind="chipsProps"
      :autocomplete="AUTCOMPLETE_OFF"
      item-title="title"
      item-value="value"
      class="select-field"
      :class="{ 'select-field--multiple': isMultiple }"
      @update:model-value="handleSelectChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    >
      <!-- WHY: Group headers (block shape name) render as subheaders; options render as list items -->
      <template #item="{ item, props: itemProps }">
        <VListSubheader
          v-if="isSelectOptionGroupHeader(item)"
          class="text-caption font-weight-medium"
        >
          {{ item.header }}
        </VListSubheader>
        <VListItem
          v-else
          v-bind="itemProps"
        />
      </template>
      <!-- Selection slot with logging for chip rendering -->
      <template v-if="isMultiple" #selection="{ item }">
        <VChip v-if="!isSelectOptionGroupHeader(item)">
          <span>{{ logChipRender(item) || item.title }}</span>
        </VChip>
      </template>
  </AppSelect>
  </BaseInput>
</template>

<script setup lang="ts">

import { computed, inject } from 'vue'
import { AUTCOMPLETE_OFF } from '@/utils/autocomplete'
import BaseInput from './BaseInput.vue'
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'
import type { GlobalEntityKey } from '@/constants/entities'
import { useFieldValue } from '@/composables/useFieldValue'
import { useAdmin } from '@/composables/admin/useAdmin'
import type { GlobalEntity } from '@/types/entities'
import { toGlobalEntityId } from '@/utils/globalEntity'
import { useSelectOptions } from '@/composables/useSelectOptions'
import { useSelectConfig } from '@/composables/admin/useSelectConfig'
import { useSelectFiltering } from '@/composables/admin/useSelectFiltering'
import { useSelectHandlers } from '@/composables/admin/useSelectHandlers'
import { useSelectFieldValue } from '@/composables/admin/useSelectFieldValue'
import { useSelectFormAssociation } from '@/composables/admin/useSelectFormAssociation'
import { useSelectLabelResolution } from '@/composables/admin/useSelectLabelResolution'
import { useSelectDomTargets } from '@/composables/admin/useSelectDomTargets'
import { useSelectEnumOptions } from '@/composables/admin/useSelectEnumOptions'
import { useSelectChipRender } from '@/composables/admin/useSelectChipRender'
import { ENTITY_CARD_SAVE_KEY, ENTITY_CARD_DISABLE_AUTOSAVE_KEY, type EntityCardSaveContext } from '../entityCardConstants'
import { useSelectInputsAsync } from '@/composables/admin/useSelectInputsAsync'
import { isSelectOptionGroupHeader } from '@/types/selectOptions'
import type { FieldInputProps } from './fieldTypes'
import { RelationshipSelectTypeEnum } from '@/types/entity/formDataEnums'
import { PROPERTY_FACT_OPTIONS, type PropertyFactKey } from '@shared/constants/accumulator'
import { setAccumulationLinkChildFactKey } from '@/utils/admin/accumulationLinkFactKeySelection'

const props = withDefaults(defineProps<FieldInputProps>(), {
  showLabel: true
})

const { fieldContext } = props

const rawFieldValue = useFieldValue(fieldContext)

// PATTERN: Use admin store/composable for admin interface operations
const adminComp = useAdmin()

// WHY: Moves config parsing out of component into reusable composable
// PATTERN: Composable handles field config, select config, and derived properties
const selectConfigComposable = useSelectConfig({ fieldContext })
const {
  selectConfig,
  isEnumSelect,
  isOptionsSelect,
  optionsSelectOptions,
  isAnnotationAssignmentSelect,
  isAttendeeSelect,
  isMultiple,
  chipsProps,
  optionEntityKey,
  optionLabelKey
} = selectConfigComposable

const allEntities = computed(() => {
  // PATTERN: Use admin store for all entity types - no special handling needed
  return adminComp.getEntitiesByKey(optionEntityKey.value)
})

const currentEntityRaw = computed(() => {
  return adminComp.getEntity(fieldContext.state.entityKey, fieldContext.state.entityId)
})

const currentEntity = computed<GlobalEntity<GlobalEntityKey> | null>(() => {
  return currentEntityRaw.value ?? null
})
const currentEntityForFiltering = computed<GlobalEntity<GlobalEntityKey> | undefined>(() => {
  return currentEntityRaw.value ?? undefined
})

// PATTERN: Composable provides resolved label with placeholders replaced
const { resolvedLabel } = useSelectLabelResolution({
  fieldContext,
  currentEntity
})

// WHY: Moves complex filtering logic out of component into reusable composable
// PATTERN: Composable handles active child selects, direct matching, component filtering, etc.
const selectFilteringComposable = useSelectFiltering({
  allEntities,
  selectConfig,
  currentEntity: currentEntityForFiltering,
  optionEntityKey,
  fieldContext,
  rawFieldValue,
  isAnnotationAssignmentSelect,
  isAttendeeSelect // Already computed from selectConfigComposable above
})
const { filteredEntities } = selectFilteringComposable
const { enumOptions } = useSelectEnumOptions(isEnumSelect)

// PATTERN: Composable handles option mapping, grouping, and value normalization
const fieldKey = computed(() => String(fieldContext.state.fieldKey))
const selectOptionsComposable = useSelectOptions({
  filteredEntities,
  selectConfig,
  optionLabelKey,
  isMultiple,
  rawFieldValue,
  fieldKey,
  adminComp
})

// WHY: Component uses composable's computed values and helper functions
// PATTERN: Destructure composable return values for use in template
const { options: entityOptions } = selectOptionsComposable

const propertyFactSelectOptions = computed(() => [
  ...PROPERTY_FACT_OPTIONS.map((option) => ({
    title: option.label,
    value: option.value,
  })),
])

const isPropertyFactKeyField = computed(
  () => fieldContext.state.entityKey === 'blockInstance' && String(fieldContext.state.fieldKey) === 'propertyFactKey'
)

const options = computed(() => {
  if (isPropertyFactKeyField.value) {
    return propertyFactSelectOptions.value
  }
  if (isOptionsSelect.value) {
    return optionsSelectOptions.value
  }
  return isEnumSelect.value ? enumOptions.value : entityOptions.value
})

const isAccumulationLinkSelect = computed(
  () =>
    selectConfig.value &&
    'selectType' in selectConfig.value &&
    selectConfig.value.selectType === RelationshipSelectTypeEnum.AccumulationLinkSelect
)

function registerAddedChildFactKeys(nextValue: string | string[] | null): void {
  if (!isAccumulationLinkSelect.value) {
    return
  }
  const parentId = String(fieldContext.state.entityId)
  const nextIds = Array.isArray(nextValue)
    ? nextValue.map((v) => String(v))
    : nextValue
      ? [String(nextValue)]
      : []
  for (const selectedId of nextIds) {
    const child = adminComp.getEntity('blockInstance', toGlobalEntityId(selectedId)) as
      | { propertyFactKey?: unknown }
      | undefined
    const factKey =
      typeof child?.propertyFactKey === 'string' && child.propertyFactKey.trim().length > 0
        ? child.propertyFactKey
        : ''
    setAccumulationLinkChildFactKey(parentId, selectedId, factKey as PropertyFactKey)
  }
}

// WHY: Moves value normalization logic out of component into reusable composable
// PATTERN: Composable handles annotation values, value normalization, and option validation
const selectFieldValueComposable = useSelectFieldValue({
  rawFieldValue,
  isAnnotationAssignmentSelect,
  isMultiple,
  options,
  selectFiltering: selectFilteringComposable,
  fieldContext
})
const { fieldValue } = selectFieldValueComposable
const { logChipRender } = useSelectChipRender(options)

const entityCardSaveContext = inject<EntityCardSaveContext | undefined>(ENTITY_CARD_SAVE_KEY, undefined)

const disableAutoSave = inject<boolean | undefined>(ENTITY_CARD_DISABLE_AUTOSAVE_KEY, false)

// WHY: Moves event handling logic out of component into reusable composable
// PATTERN: Composable handles change, group change, focus, and blur events
const selectHandlersComposable = useSelectHandlers({
  fieldContext,
  rawFieldValue,
  fieldValue,
  isMultiple,
  isAnnotationAssignmentSelect,
  entityCardSaveContext,
  disableAutoSave
})
const {
  handleChange,
  handleFocus,
  handleBlur,
  handleKeydown
} = selectHandlersComposable

function handleSelectChange(value: string | string[] | null): void {
  registerAddedChildFactKeys(value)
  void handleChange(value)
}

const { selectDomTargets } = useSelectDomTargets({ fieldContext })

useSelectFormAssociation({ targets: selectDomTargets })

const selectInputsAsync = useSelectInputsAsync({
  options,
  handleChange
})
const {
  handleQuickSelectMajor,
  handleQuickSelectMinor,
  handleQuickSelectAll,
  quickSelect
} = selectInputsAsync

const isQuickSelectMajorDisabled = computed(() =>
  quickSelect.isLoading.value || !quickSelect.hasMajorAttendees.value || fieldContext.state.isDisabled.value
)
const isQuickSelectMinorDisabled = computed(() =>
  quickSelect.isLoading.value || !quickSelect.hasMinorAttendees.value || fieldContext.state.isDisabled.value
)
const isQuickSelectAllDisabled = computed(() =>
  quickSelect.isLoading.value || (!quickSelect.hasMajorAttendees.value && !quickSelect.hasMinorAttendees.value) || fieldContext.state.isDisabled.value
)
</script>

<style scoped>
.select-field--multiple.v-select--chips.v-input--dirty :deep(.v-select__selection) {
  margin: 0;
}

.select-field--multiple.v-select--chips :deep(.v-field__input) {
  gap: 3px !important;
  flex-wrap: wrap !important;
  min-height: 40px !important;
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}

.select-field--multiple.v-select--chips :deep(.v-chip) {
  background-color: rgba(var(--v-theme-surface-variant), 0.5) !important;
  border: 1px solid rgba(var(--v-theme-outline), 0.3) !important;
  border-radius: 4px !important;
  padding: 2px 8px !important;
  margin: 2px !important;
  font-size: 12px !important;
  height: auto !important;
  min-height: 24px !important;
}

.select-field--multiple.v-select--chips :deep(.v-chip__close) {
  margin-left: 4px !important;
  opacity: 0.7 !important;
  cursor: pointer !important;
}

.select-field--multiple.v-select--chips :deep(.v-chip__close:hover) {
  opacity: 1 !important;
}

.attendee-quick-select {
  margin-bottom: 12px;
}
</style>
