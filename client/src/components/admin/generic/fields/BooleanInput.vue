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
      :is-active="fieldValue"
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

import { computed } from 'vue'
import BaseInput from './BaseInput.vue'
import StatusButton from '../StatusButton.vue'
import type { GlobalEntityKey } from '../../../../constants/entities'
import type { GlobalFieldKey } from '../../../../constants/primitives'
import type { FieldContextType } from '../../../../composables/useFieldContext'
import { useFieldValue } from '../../../../composables/useFieldValue'
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import { useAdmin } from '@/composables/useAdmin'
import { useStatusButtonToggle } from '@/composables/admin/useStatusButtonToggle'

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


// LEARNING: Handle inverted logic for constituable field (displayed as "State Control")
// WHY: constituable: false = State Control ON, constituable: true = State Control OFF
// PATTERN: Invert value for display when fieldKey is 'constituable'
const isInverted = computed(() => String(fieldContext.fieldKey) === 'constituable')
const fieldValue = computed(() => {
  const value = rawFieldValue.value
  const boolValue = typeof value === 'boolean' ? value : false
  return isInverted.value ? !boolValue : boolValue
})


// LEARNING: Fetch metadata to get statusButtonColor
// WHY: StatusButton needs color from metadata (defaults to 'default' if not configured)
// PATTERN: Use useEntityMetadata to fetch metadata, then read statusButtonColor
const admin = useAdmin()

// LEARNING: Get entity for metadata lookup, handling both new and existing entities
// WHY: New entities (IDs starting with 'new-') don't exist in store yet, so we construct from form values
// PATTERN: Check if entityId is temporary, if so use form values, otherwise use store lookup
const entityForMetadata = computed(() => {
  if (!fieldContext.entityKey || !fieldContext.entityId) {
    return null
  }
  
  const entityIdStr = String(fieldContext.entityId)
  const isTemporaryEntity = entityIdStr.startsWith('new-')
  
  // LEARNING: For temporary entities, construct entity object from form values
  // WHY: New entities don't exist in store yet, but form has the values we need for metadata lookup
  // PATTERN: Build minimal entity object with id, entityKey, and shape references needed for metadata
  if (isTemporaryEntity) {
    const formValues = fieldContext.formInstance?.values || {}
    
    // LEARNING: Construct minimal entity object for metadata lookup
    // WHY: useEntityMetadata needs entity with id and shape references (e.g., blockShapeRef for blockInstance)
    // PATTERN: Include id, entityKey, and shape references from form values
    const entity: Record<string, unknown> = {
      id: fieldContext.entityId,
      entityKey: fieldContext.entityKey,
    }
    
    // LEARNING: Include blockShapeRef for blockInstance entities
    // WHY: BlockInstance metadata can be BlockShape-specific, so blockShapeRef is needed for correct metadata lookup
    // PATTERN: Copy shape reference fields from form values if they exist
    if (fieldContext.entityKey === 'blockInstance' && formValues.blockShapeRef) {
      entity.blockShapeRef = formValues.blockShapeRef
    }
    
    // LEARNING: Include partShapeRef for partInstance entities
    // WHY: PartInstance metadata may be PartShape-specific, so partShapeRef is needed
    // PATTERN: Copy shape reference fields from form values if they exist
    if (fieldContext.entityKey === 'partInstance' && formValues.partShapeRef) {
      entity.partShapeRef = formValues.partShapeRef
    }
    
    // LEARNING: Type assertion for minimal entity object
    // WHY: We only need id, entityKey, and shape references for metadata lookup, not full entity
    // PATTERN: Assert as GlobalEntity type - useEntityMetadata accepts partial entities
    return entity as import('@/types/entities').GlobalEntity<typeof fieldContext.entityKey>
  }
  
  // LEARNING: For existing entities, use store lookup
  // WHY: Existing entities are in the store, so we can look them up directly
  // PATTERN: Try store lookup, return null if not found
  try {
    const entity = admin.getEntity(fieldContext.entityKey, fieldContext.entityId)
    return entity ?? null
  } catch {
    return null
  }
})

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
const statusButtonToggle = useStatusButtonToggle({
  entityKey: fieldContext.entityKey!,
  entityId: fieldContext.entityId!,
  entity: entityForMetadata
})

// LEARNING: Handle click to toggle value using composable
// WHY: Status buttons should save immediately when clicked (good UX)
//      useStatusButtonToggle handles store updates correctly via usePrimitiveMutation
// PATTERN: Use toggleStatusButton from composable instead of manual save
// NOTE: Inversion logic (for constituable field) is handled at display level only
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
  
  // LEARNING: Use composable's toggle method which handles store updates correctly
  // WHY: useStatusButtonToggle reads from store and toggles stored value (not display value)
  //      For constituable field, display is inverted but stored value is not, so this works correctly
  // PATTERN: Composable handles all toggle logic including store updates via usePrimitiveMutation
  await statusButtonToggle.toggleStatusButton(fieldContext.fieldKey, event)
}
</script>
