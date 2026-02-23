<template>
  <BaseInput
    :field-key="String(fieldContext.fieldKey)"
    :display-config="fieldContext.displayConfig"
    :error="fieldContext.error?.value"
    :show-label="false"
    :is-disabled="fieldContext.isDisabled.value"
  >
    <!-- LEARNING: Quick-select buttons for AttendeeSelect fields -->
    <!-- WHY: Allows users to quickly select major/minor attendees from business settings -->
    <!-- PATTERN: Conditionally render buttons above select field only for AttendeeSelect type -->
    <div v-if="isAttendeeSelect" class="attendee-quick-select mb-3">
      <div class="d-flex gap-2 flex-wrap">
        <VBtn
          size="small"
          variant="outlined"
          :disabled="quickSelect.isLoading.value || !quickSelect.hasMajorAttendees.value || fieldContext.isDisabled.value"
          :loading="quickSelect.isLoading.value"
          @click="handleQuickSelectMajor"
        >
          Select Major
        </VBtn>
        <VBtn
          size="small"
          variant="outlined"
          :disabled="quickSelect.isLoading.value || !quickSelect.hasMinorAttendees.value || fieldContext.isDisabled.value"
          :loading="quickSelect.isLoading.value"
          @click="handleQuickSelectMinor"
        >
          Select Minor
        </VBtn>
        <VBtn
          size="small"
          variant="outlined"
          :disabled="quickSelect.isLoading.value || (!quickSelect.hasMajorAttendees.value && !quickSelect.hasMinorAttendees.value) || fieldContext.isDisabled.value"
          :loading="quickSelect.isLoading.value"
          @click="handleQuickSelectAll"
        >
          Select All
        </VBtn>
      </div>
      <div v-if="quickSelect.error.value" class="text-caption text-error mt-1">
        {{ quickSelect.error.value }}
      </div>
      <div v-else-if="!quickSelect.hasMajorAttendees.value && !quickSelect.hasMinorAttendees.value && !quickSelect.isLoading.value" class="text-caption text-medium-emphasis mt-1">
        Configure major/minor attendees in Business Controls to use quick-select
      </div>
    </div>
    
    <!-- LEARNING: Multiple select fields when groupByKey configured and multiple groups exist -->
    <!-- WHY: Provides clearer separation with one select per group (e.g., one per blockShapeRef) -->
    <!-- PATTERN: Render one AppSelect per group, each labeled with group name -->
    <template v-if="shouldUseMultipleSelects">
      <div
        v-for="group in groupedByKey"
        :key="`group-${group.groupKey}`"
        class="select-field-group"
      >
        <AppSelect
          :key="`select-${String(fieldContext.fieldKey)}-${group.groupKey}-${isMultiple}`"
          :id="`field-${String(fieldContext.fieldKey)}-${group.groupKey}`"
          :name="`${String(fieldContext.fieldKey)}-${group.groupKey}`"
          :model-value="getGroupValue(group)"
          :items="getGroupOptions(group)"
          :label="group.groupLabel"
          :placeholder="fieldContext.displayConfig.placeholder"
          :disabled="fieldContext.displayConfig.disabled"
          :readonly="fieldContext.displayConfig.readOnly"
          :error="!!fieldContext.error?.value"
          :error-messages="fieldContext.error?.value"
          :multiple="isMultiple"
          v-bind="chipsProps"
          :autocomplete="AUTCOMPLETE_OFF"
          item-title="title"
          item-value="value"
          class="select-field"
          :class="{ 'select-field--multiple': isMultiple }"
          @update:model-value="(value: string | string[] | null) => handleGroupChange(group.groupKey, value)"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="handleKeydown"
        >
          <!-- Selection slot with logging for chip rendering -->
          <template v-if="isMultiple" #selection="{ item }">
            <VChip>
              <span>{{ item.title }}</span>
            </VChip>
          </template>
        </AppSelect>
      </div>
    </template>
    
    <!-- LEARNING: Single select field when no grouping or single group -->
    <!-- WHY: Fallback to single select for simpler cases -->
    <!-- PATTERN: Render single AppSelect with all options -->
    <AppSelect
      v-else
      :key="`select-${String(fieldContext.fieldKey)}-${isMultiple}`"
      :id="`field-${String(fieldContext.fieldKey)}`"
      :name="String(fieldContext.fieldKey)"
      :model-value="fieldValue"
      :items="options"
      :label="resolvedLabel"
      :placeholder="fieldContext.displayConfig.placeholder"
      :disabled="fieldContext.displayConfig.disabled"
      :readonly="fieldContext.displayConfig.readOnly"
      :error="!!fieldContext.error?.value"
      :error-messages="fieldContext.error?.value"
      :multiple="isMultiple"
      v-bind="chipsProps"
      :autocomplete="AUTCOMPLETE_OFF"
      item-title="title"
      item-value="value"
      class="select-field"
      :class="{ 'select-field--multiple': isMultiple }"
      @update:model-value="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    >
      <!-- Selection slot with logging for chip rendering -->
    <template v-if="isMultiple" #selection="{ item }">
      <VChip>
        <span>{{ logChipRender(item) || item.title }}</span>
      </VChip>
    </template>
  </AppSelect>
  </BaseInput>
</template>

<script setup lang="ts">
/**
 * LEARNING: SelectInputs component renders select/relationship inputs with config-based option filtering
 * 
 * WHY: Options depend on config type:
 * - Type selects: All entities of candidateChildKey type (no filtering)
 * - Valid child selects: Filtered by filterOptions function from config
 * - Active child selects: Filtered by parent's type's valid children
 * 
 * PATTERN: Read config → determine optionEntityKey → apply filtering logic → transform to options
 * 
 * COMPARISON: React uses adminConfig.formFieldConfig and AdminContext. Vue will use same pattern
 *             once adminConfig is ported. For now, accepts config as props.
 */

import { computed, inject } from 'vue'
import { AUTCOMPLETE_OFF } from '@/utils/autocomplete'
import BaseInput from './BaseInput.vue'
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'
import type { GlobalEntityKey } from '@/constants/entities'
import { useFieldValue } from '@/composables/useFieldValue'
import { useAdmin } from '@/composables/admin/useAdmin'
import type { GlobalEntity } from '@/types/entities'
import { useSelectOptions, type SelectOption } from '@/composables/useSelectOptions'
import { useSelectConfig } from '@/composables/admin/useSelectConfig'
import { useSelectFiltering } from '@/composables/admin/useSelectFiltering'
import { useSelectHandlers } from '@/composables/admin/useSelectHandlers'
import { useSelectFieldValue } from '@/composables/admin/useSelectFieldValue'
import { useSelectFormAssociation } from '@/composables/admin/useSelectFormAssociation'
import { useSelectLabelResolution } from '@/composables/admin/useSelectLabelResolution'
import { useSelectDomTargets } from '@/composables/admin/useSelectDomTargets'
import { isDevModeEnabled } from '@/utils/env/devMode'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import { ENTITY_CARD_SAVE_KEY, ENTITY_CARD_DISABLE_AUTOSAVE_KEY, type EntityCardSaveContext } from '../entityCardConstants'
import { useSelectInputsAsync } from '@/composables/admin/useSelectInputsAsync'
import type { FieldInputProps } from './fieldTypes'

const props = withDefaults(defineProps<FieldInputProps>(), {
  showLabel: true
})

const { fieldContext } = props

// LEARNING: Use unified field value composable
const rawFieldValue = useFieldValue(fieldContext)

// LEARNING: Use admin composable to get entities with relationships attached
// PATTERN: Use admin store/composable for admin interface operations
const adminComp = useAdmin()

// LEARNING: Use select config composable for all configuration logic
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
  return adminComp.getEntity(fieldContext.entityKey, fieldContext.entityId)
})

// LEARNING: Convert AdminObject to GlobalEntity for useSelectLabelResolution and useSelectFiltering
const currentEntity = computed<GlobalEntity<GlobalEntityKey> | null>(() => {
  return currentEntityRaw.value ?? null
})
const currentEntityForFiltering = computed<GlobalEntity<GlobalEntityKey> | undefined>(() => {
  return currentEntityRaw.value ?? undefined
})

// LEARNING: Use select label resolution composable
// PATTERN: Composable provides resolved label with placeholders replaced
const { resolvedLabel } = useSelectLabelResolution({
  fieldContext,
  currentEntity
})

// LEARNING: Use select filtering composable for all filtering logic
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
const {
  filteredEntities,
} = selectFilteringComposable

const enumOptions = computed(() => {
  if (!isEnumSelect.value) return []
  
  return [
    { title: 'User', value: BLOCK_SHAPE_TYPES.USER },
    { title: 'Service', value: BLOCK_SHAPE_TYPES.SERVICE },
    { title: 'Property', value: BLOCK_SHAPE_TYPES.PROPERTY },
    { title: 'Option', value: BLOCK_SHAPE_TYPES.OPTION }
  ]
})

// LEARNING: Use select options composable for all option transformations
// PATTERN: Composable handles option mapping, grouping, and value normalization
const fieldKey = computed(() => String(fieldContext.fieldKey))
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
const {
  options: entityOptions,
  groupedByKey,
  shouldUseMultipleSelects,
  getGroupOptions,
  getGroupValue
} = selectOptionsComposable

const options = computed(() => {
  if (isOptionsSelect.value) {
    return optionsSelectOptions.value
  }
  return isEnumSelect.value ? enumOptions.value : entityOptions.value
})

// LEARNING: Use select field value composable for value normalization and validation
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


const logChipRender = (item: { title: string; value: string | number }): string => {
  if (isDevModeEnabled()) {
    let matchingOption: SelectOption | undefined = undefined
    const optionsArray = options.value as SelectOption[]
    for (const opt of optionsArray) {
      if (opt.children) {
        matchingOption = opt.children.find((c: SelectOption) => String(c.value) === String(item.value))
      } else if (String(opt.value) === String(item.value)) {
        matchingOption = opt
      }
      if (matchingOption) break
    }
    
    if (item.title === String(item.value) && matchingOption) {
      return matchingOption.title
    }
  }
  return item.title // Return title for display
}

const entityCardSaveContext = inject<EntityCardSaveContext | undefined>(ENTITY_CARD_SAVE_KEY, undefined)

const disableAutoSave = inject<boolean | undefined>(ENTITY_CARD_DISABLE_AUTOSAVE_KEY, false)

// LEARNING: Use select handlers composable for all event handling logic
// WHY: Moves event handling logic out of component into reusable composable
// PATTERN: Composable handles change, group change, focus, and blur events
const selectHandlersComposable = useSelectHandlers({
  fieldContext,
  rawFieldValue,
  fieldValue,
  isMultiple,
  isAnnotationAssignmentSelect,
  groupedByKey,
  entityCardSaveContext,
  disableAutoSave
})
const {
  handleGroupChange,
  handleChange,
  handleFocus,
  handleBlur,
  handleKeydown
} = selectHandlersComposable

// LEARNING: Use select DOM targets composable
// PATTERN: Composable provides DOM targets for form association
// LEARNING: Convert Ref to ComputedRef and GroupedEntities[] to SelectGroup[]
const shouldUseMultipleSelectsComputed = computed(() => shouldUseMultipleSelects.value)
const groupedByKeyComputed = computed(() => groupedByKey.value.map(group => ({
  groupKey: group.groupKey,
  groupLabel: group.groupLabel
})))
const { selectDomTargets } = useSelectDomTargets({
  fieldContext,
  shouldUseMultipleSelects: shouldUseMultipleSelectsComputed,
  groupedByKey: groupedByKeyComputed
})

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
</script>

<style scoped>
/* LEARNING: Style multiple select field groups */
/* WHY: When rendering multiple selects (one per group), need spacing between them */
/* PATTERN: Add margin-bottom to separate groups visually */
.select-field-group {
  margin-bottom: 16px;
}

.select-field-group:last-child {
  margin-bottom: 0;
}

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

/* LEARNING: Style individual chips with borders and backgrounds */
/* WHY: Each selection should be visually distinct, matching React's customTagRender styling */
/* PATTERN: Override AppSelect/Vuetify chip default styles to add borders and background colors */
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

/* LEARNING: Style chip close button */
/* WHY: Close button should be visible and accessible */
/* PATTERN: Match React's close button styling with proper spacing */
.select-field--multiple.v-select--chips :deep(.v-chip__close) {
  margin-left: 4px !important;
  opacity: 0.7 !important;
  cursor: pointer !important;
}

.select-field--multiple.v-select--chips :deep(.v-chip__close:hover) {
  opacity: 1 !important;
}

/* LEARNING: Style attendee quick-select button group */
/* WHY: Provides visual separation and proper spacing for quick-select buttons */
/* PATTERN: Add margin-bottom to separate from select field */
.attendee-quick-select {
  margin-bottom: 12px;
}
</style>

