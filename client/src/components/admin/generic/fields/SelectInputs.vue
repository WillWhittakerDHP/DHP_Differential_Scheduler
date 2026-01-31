<template>
  <BaseInput
    :field-key="String(fieldContext.fieldKey)"
    :display-config="fieldContext.displayConfig"
    :error="fieldContext.error?.value"
    :show-label="false"
    :is-disabled="fieldContext.isDisabled.value"
  >
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
import { AUTCOMPLETE_OFF } from '../../../../utils/autocomplete'
import BaseInput from './BaseInput.vue'
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'
import type { GlobalEntityKey } from '../../../../constants/entities'
import type { GlobalFieldKey } from '../../../../constants/primitives'
import type { FieldContextType } from '../../../../composables/useFieldContext'
import { useFieldValue } from '../../../../composables/useFieldValue'
import { useAdmin } from '@/composables/useAdmin'
import type { GlobalEntity } from '../../../../types/entities'
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

interface Props {
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: true
})

const { fieldContext } = props

// LEARNING: Use unified field value composable
// WHY: Provides consistent value access pattern that handles Vue's Ref unwrapping
// PATTERN: Always use useFieldValue for accessing field values
const rawFieldValue = useFieldValue(fieldContext)

// LEARNING: Use admin composable to get entities with relationships attached
// WHY: AdminEntity has relationships (validCascades, validParts) attached, raw GlobalEntity doesn't
// PATTERN: Use admin store/composable for admin interface operations
const adminComp = useAdmin()

// LEARNING: Use select config composable for all configuration logic
// WHY: Moves config parsing out of component into reusable composable
// PATTERN: Composable handles field config, select config, and derived properties
// NOTE: useSelectConfig now handles enum selects gracefully (returns undefined for selectConfig)
const selectConfigComposable = useSelectConfig({ fieldContext })
const {
  selectConfig,
  isEnumSelect,
  isOptionsSelect,
  optionsSelectOptions,
  isAnnotationAssignmentSelect,
  isMultiple,
  chipsProps,
  optionEntityKey,
  optionLabelKey
} = selectConfigComposable

// LEARNING: Get all entities for filtering
// WHY: Need source entities before filtering
// PATTERN: Use admin store for all entity types (including annotations - now core entities)
const allEntities = computed(() => {
  // LEARNING: Annotations are now core entities accessible via admin store
  // WHY: All entities (including events/annotations) are now in the unified entities structure
  // PATTERN: Use admin store for all entity types - no special handling needed
  return adminComp.getEntitiesByKey(optionEntityKey.value)
})

// LEARNING: Get current entity from admin store (with relationships attached)
// WHY: Need AdminEntity with relationships for filtering logic
// PATTERN: Use admin store getEntity which returns AdminEntity
const currentEntityRaw = computed(() => {
  return adminComp.getEntity(fieldContext.entityKey, fieldContext.entityId)
})

// LEARNING: Convert AdminObject to GlobalEntity for useSelectLabelResolution and useSelectFiltering
// WHY: useSelectLabelResolution expects GlobalEntity | null, useSelectFiltering expects GlobalEntity | undefined
//      getEntity returns AdminObject | undefined
// PATTERN: Map undefined to null for useSelectLabelResolution, keep undefined for useSelectFiltering
const currentEntity = computed<GlobalEntity<GlobalEntityKey> | null>(() => {
  return currentEntityRaw.value ?? null
})
const currentEntityForFiltering = computed<GlobalEntity<GlobalEntityKey> | undefined>(() => {
  return currentEntityRaw.value ?? undefined
})

// LEARNING: Use select label resolution composable
// WHY: Extracts label placeholder replacement logic from component to composable
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
  isAnnotationAssignmentSelect
})
const {
  filteredEntities,
} = selectFilteringComposable

// LEARNING: Provide enum options for type field
// WHY: Block shape type is an enum with fixed values
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
// WHY: Moves all data transformation logic out of component to prevent recursion
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

// LEARNING: Extract computed properties and functions from composable
// WHY: Component uses composable's computed values and helper functions
// PATTERN: Destructure composable return values for use in template
const {
  options: entityOptions,
  groupedByKey,
  shouldUseMultipleSelects,
  getGroupOptions,
  getGroupValue
} = selectOptionsComposable

// LEARNING: Use metadata options for options selects, enum options for enum selects
// WHY: bookingMode uses metadata.inputConfig.options, blockShape.type uses enum options
// PATTERN: Prefer optionsSelectOptions, then enum options, then entity options
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


// Method to log chip rendering data
const logChipRender = (item: { title: string; value: string | number }): string => {
  if (isDevModeEnabled()) {
    // Find the matching option from our options array to see what AppSelect should be using
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
    
    // If AppSelect is using value as title, return the correct title from our options
    if (item.title === String(item.value) && matchingOption) {
      return matchingOption.title
    }
  }
  return item.title // Return title for display
}

/**
 * LEARNING: Inject EntityCard save context for create cards
 * WHY: When creating new entities, selects should not trigger mutations
 * PATTERN: Match TextInput/NumberInput pattern - inject context and pass to handlers
 */
const entityCardSaveContext = inject<EntityCardSaveContext | undefined>(ENTITY_CARD_SAVE_KEY, undefined)

/**
 * LEARNING: Inject disableAutoSave flag from EntityCard
 * WHY: Allows parent to disable field blur auto-save (e.g., in bulk edit modals)
 * PATTERN: Match TextInput/NumberInput pattern
 */
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
  handleBlur
} = selectHandlersComposable

// LEARNING: Use select DOM targets composable
// WHY: Extracts DOM target calculation logic from component to composable
// PATTERN: Composable provides DOM targets for form association
// LEARNING: Convert Ref to ComputedRef and GroupedEntities[] to SelectGroup[]
// WHY: useSelectDomTargets expects ComputedRef types and SelectGroup[] (without entities)
// PATTERN: Map types appropriately - SelectGroup is subset of GroupedEntities
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

/**
 * WHY: Ensures proper spacing and layout for chips
 * PATTERN: Match Vuexy's chip styling pattern with custom overrides for visual separation
 */
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
</style>

