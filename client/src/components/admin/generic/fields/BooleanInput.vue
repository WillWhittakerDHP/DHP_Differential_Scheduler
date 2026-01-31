<template>
  <BaseInput
    :field-key="String(fieldContext.fieldKey)"
    :display-config="fieldContext.displayConfig"
    :error="fieldContext.error?.value"
    :show-label="false"
    :is-disabled="fieldContext.isDisabled.value"
  >
    <!-- LEARNING: BooleanInput renders status button chip (not toggle switch) -->
    <!-- WHY: All boolean fields should render as status buttons for consistency -->
    <!-- PATTERN: Use StatusButton component instead of VSwitch toggle -->
    <StatusButton
      :label="fieldContext.displayConfig.label"
      :color="statusButtonColor"
      :is-active="normalizedValue"
      :disabled="fieldContext.displayConfig.disabled || fieldContext.displayConfig.readOnly"
      @click.stop="handleClick"
    />
  </BaseInput>
</template>

<script setup lang="ts">
/**
 * LEARNING: BooleanInput renders status button chip
 * 
 * WHY: All boolean fields should render as status buttons, not toggle switches
 * 
 * PATTERN: Wrapper component pattern - wraps StatusButton chip with field context
 * 
 * COMPARISON: Previously used VSwitch toggle, now uses StatusButton chip for consistency
 */

import { computed, inject } from 'vue'
import BaseInput from './BaseInput.vue'
import StatusButton from '../StatusButton.vue'
import type { GlobalEntityKey } from '../../../../constants/entities'
import type { GlobalEntity } from '../../../../types/entities'
import type { GlobalFieldKey } from '../../../../constants/primitives'
import type { FieldContextType } from '../../../../composables/useFieldContext'
import { useFieldValue } from '../../../../composables/useFieldValue'
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import { useFieldContextMetadataEntity } from '@/composables/admin/useFieldContextMetadataEntity'
import { useStatusButtonToggle } from '@/composables/admin/useStatusButtonToggle'
import { ENTITY_CARD_SAVE_KEY, type EntityCardSaveContext } from '../entityCardConstants'

interface Props {
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: true
})

const { fieldContext } = props

/**
 * LEARNING: Inject EntityCard save context for create cards
 * WHY: When creating new entities, status buttons should not trigger mutations
 *      User must save the entire form first to create the entity
 * PATTERN: Match TextInput/NumberInput pattern - inject context and check isNew
 */
const entityCardSaveContext = inject<EntityCardSaveContext | undefined>(ENTITY_CARD_SAVE_KEY, undefined)

// LEARNING: Use unified field value composable
// WHY: Provides consistent value access pattern that handles Vue's Ref unwrapping
// PATTERN: Always use useFieldValue for accessing field values
const rawFieldValue = useFieldValue(fieldContext)

// LEARNING: Normalize field value for StatusButton
// WHY: StatusButton expects boolean | TernaryBoolean, but rawFieldValue can be undefined or ''
// PATTERN: Normalize undefined/'' to false for booleans, 'false' for ternary fields
const normalizedValue = computed(() => {
  const value = rawFieldValue.value
  
  // Check if it's a ternary value first (string enum)
  if (value === 'true' || value === 'false' || value === 'override') {
    return value as 'true' | 'false' | 'override'
  }
  
  // Handle undefined, null, or empty string - default to false for booleans
  if (value === undefined || value === null || value === '') {
    // Check if this is a known ternary field by field name
    const fieldKeyStr = String(fieldContext.fieldKey)
    const isTernaryField = fieldKeyStr === 'major' || fieldKeyStr === 'minor' || fieldKeyStr === 'differential'
    
    if (isTernaryField) {
      return 'false' as const
    }
    
    // Default to boolean false for regular boolean fields
    return false
  }
  
  // Otherwise, it's a boolean - normalize to boolean
  return value === true
})


// LEARNING: Load metadata to get statusButtonColor
// WHY: StatusButton needs color from metadata (defaults to 'default' if not configured)
// PATTERN: Use useEntityMetadata to load metadata, then read statusButtonColor
// LEARNING: Use composable for entity lookup
// WHY: Extracts entity lookup logic to reusable composable
// PATTERN: Composable handles both temporary and existing entities
const entityForMetadata = useFieldContextMetadataEntity(fieldContext)

const fetchedMetadata = useEntityMetadata(
  fieldContext.entityKey,
  entityForMetadata
)

const statusButtonColor = computed(() => {
  const metadata = fetchedMetadata.fieldMetadata.value
  const fieldKeyStr = String(fieldContext.fieldKey)
  const meta = metadata[fieldKeyStr]
  return meta?.statusButtonColor || 'default'
})

// LEARNING: Use status button toggle composable for consistent store updates
// WHY: useStatusButtonToggle uses usePrimitiveMutation which properly updates the store
//      This ensures status buttons persist correctly after clicking
// PATTERN: Use composable instead of fieldContext.save() for status buttons
// LEARNING: Type assertion - function handles null/undefined at runtime by reading from store
// WHY: useStatusButtonToggle signature expects ComputedRef<GlobalEntity<GE>> but implementation handles null
// PATTERN: Assert type since runtime behavior is correct
const statusButtonToggle = useStatusButtonToggle({
  entityKey: fieldContext.entityKey!,
  entityId: fieldContext.entityId!,
  entity: entityForMetadata as ReturnType<typeof computed<GlobalEntity<GlobalEntityKey>>>
})

// LEARNING: Handle click to toggle value using composable
// WHY: Status buttons should save immediately when clicked (good UX)
//      useStatusButtonToggle handles store updates correctly via usePrimitiveMutation
// PATTERN: Use toggleStatusButton from composable instead of manual save
// NOTE: Inversion logic (for canHaveParts field) is handled at display level only
//       useStatusButtonToggle operates on stored value, which is correct
const handleClick = async (event: Event) => {
  // LEARNING: Stop propagation immediately to prevent expansion panel from intercepting click
  // WHY: Status buttons are in VExpansionPanel title, need to prevent panel expansion
  // PATTERN: Stop propagation and prevent default before any async operations
  event.stopPropagation()
  event.preventDefault()
  
  // LEARNING: Check if field is disabled or readonly
  // WHY: Don't allow toggling if field is disabled or readonly
  // PATTERN: Early return if field cannot be edited
  if (fieldContext.displayConfig.disabled || fieldContext.displayConfig.readOnly) {
    return
  }
  
  // LEARNING: For new entities, update form value directly instead of triggering mutation
  // WHY: New entities haven't been created yet - form values are stored in Vee-Validate form instance
  //      When user clicks Save, form values will be sent to create the entity
  // PATTERN: Match TextInput/NumberInput behavior - update form value, not store
  if (entityCardSaveContext?.isNew) {
    // Get current form value
    const currentRaw = rawFieldValue.value
    
    // LEARNING: Handle ternary boolean fields for new entities
    // WHY: Ternary fields need to cycle through states, boolean fields toggle
    // PATTERN: Check if ternary, then cycle or toggle accordingly
    const isTernary = currentRaw === 'true' || currentRaw === 'false' || currentRaw === 'override'
    
    if (isTernary) {
      // Cycle through ternary states: 'false' → 'true' → 'override' → 'false'
      let newTernary: 'true' | 'false' | 'override'
      if (currentRaw === 'false') {
        newTernary = 'true'
      } else if (currentRaw === 'true') {
        newTernary = 'override'
      } else {
        // currentRaw === 'override' or undefined/null
        newTernary = 'false'
      }
      fieldContext.setValue(newTernary)
      return
    }
    
    // Handle boolean fields
    // LEARNING: Handle empty strings for boolean fields in new entities
    // WHY: useFieldContextState returns empty string '' for temp entities, but we need to treat it as false
    // PATTERN: Normalize empty string to false for boolean fields
    const normalizedRaw = currentRaw === '' ? false : currentRaw
    const isBooleanish = normalizedRaw === true || normalizedRaw === false || 
                        normalizedRaw === null || normalizedRaw === undefined
    if (!isBooleanish) {
      return
    }
    
    const currentValue = normalizedRaw === true
    const newValue = !currentValue
    
    // Update form value
    fieldContext.setValue(newValue)
    
    // Handle mutual exclusivity for blockShape fields (isStateControl and canHaveParts)
    if (fieldContext.entityKey === 'blockShape' && newValue === true) {
      const formInstance = fieldContext.formInstance
      if (formInstance) {
        if (fieldContext.fieldKey === 'isStateControl') {
          // Setting isStateControl to true - clear canHaveParts
          formInstance.setFieldValue('canHaveParts', false)
        } else if (fieldContext.fieldKey === 'canHaveParts') {
          // Setting canHaveParts to true - clear isStateControl
          formInstance.setFieldValue('isStateControl', false)
        }
      }
    }
    
    return
  }
  
  // LEARNING: Use composable's toggle method which handles store updates correctly
  // WHY: useStatusButtonToggle reads from store and toggles stored value (not display value)
  //      For canHaveParts field, display is inverted but stored value is not, so this works correctly
  // PATTERN: Composable handles all toggle logic including store updates via usePrimitiveMutation
  await statusButtonToggle.toggleStatusButton(fieldContext.fieldKey, event)
}
</script>
