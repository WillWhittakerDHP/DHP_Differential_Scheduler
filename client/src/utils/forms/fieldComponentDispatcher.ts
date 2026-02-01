/**
 * Field Component Dispatcher
 * 
 * LEARNING: Single source of truth for WHAT component renders a field based on metadata
 * WHY: Consolidates scattered component type logic into one place, parallel to field location dispatcher
 * PATTERN: Pure function that determines component type from metadata
 * 
 * This utility handles:
 * - Component type determination (icon, primitive, relationshipCollection, annotations, select)
 * - RenderAs-based type checking (iconSelect, text, number, statusButton, select, multiselect, reference, relationshipCollection)
 * - Special case handling (annotations field)
 */

import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldMetadataEntry } from '@/types/entityMetadata'

/**
 * Field component types with reasons
 * WHY: Provides clear component assignment with explanation for debugging
 * PATTERN: Discriminated union for type safety, parallel to FieldLocation type
 */
export type FieldComponent =
  | { type: 'icon'; reason: 'iconSelect' } // Renders IconInput component
  | { type: 'primitive'; reason: 'text' | 'number' | 'statusButton' } // Renders PrimitiveInputs component
  | { type: 'relationshipCollection'; reason: 'relationshipCollection' } // Renders RelationshipCollection component (for parts, annotations, events)
  | { type: 'select'; reason: 'select' | 'multiselect' | 'reference' } // Renders SelectInputs component
  | { type: 'unknown'; reason: 'notConfigured' | 'invalidRenderAs' } // Unknown/invalid field

/**
 * Field Component Dispatcher
 * 
 * LEARNING: Determines WHAT component should render a field based on metadata
 * WHY: Single source of truth for component type determination - all logic in one place
 * PATTERN: Pure function that returns component type with reason, parallel to getFieldLocation()
 * 
 * Logic Flow:
 * 1. Check for missing metadata → unknown
 * 2. Check for annotations field → annotations component
 * 3. Check renderAs for iconSelect → icon component
 * 4. Check renderAs for text/number/statusButton → primitive component
 * 5. Check renderAs for relationshipCollection → relationshipCollection component
 * 6. Check renderAs for select/multiselect/reference → select component (with enum select exception)
 * 7. Unknown renderAs → unknown component
 */
export function getFieldComponent<GE extends GlobalEntityKey>(
  entityKey: GE,
  fieldKey: GlobalFieldKey<GE>,
  fieldMetadata: FieldMetadataEntry | undefined
): FieldComponent {
  // PATTERN: Return unknown with reason for debugging
  if (!fieldMetadata) {
    return { type: 'unknown', reason: 'notConfigured' }
  }

  const { renderAs, inputConfig } = fieldMetadata

  // PATTERN: Annotations field should have renderAs: 'relationshipCollection' in metadata

  // PATTERN: Check renderAs for 'iconSelect'
  if (renderAs === 'iconSelect') {
    return { type: 'icon', reason: 'iconSelect' }
  }

  // PATTERN: Check renderAs for text/number/statusButton
  const primitiveRenderAs: Array<FieldMetadataEntry['renderAs']> = ['text', 'number', 'statusButton']
  if (primitiveRenderAs.includes(renderAs)) {
    return { type: 'primitive', reason: renderAs as 'text' | 'number' | 'statusButton' }
  }
  // PATTERN: Check renderAs for 'relationshipCollection'
  if (renderAs === 'relationshipCollection') {
    return { type: 'relationshipCollection', reason: 'relationshipCollection' }
  }

  // WHY: These fields render as SelectInputs component
  // PATTERN: Check renderAs for select/multiselect/reference
  const selectRenderAs: Array<FieldMetadataEntry['renderAs']> = ['select', 'multiselect', 'reference']
  if (selectRenderAs.includes(renderAs)) {
    // PATTERN: Check entityKey and fieldKey to identify known enum selects
    const isEnumSelect = String(fieldKey) === 'type' && 
      (entityKey === 'blockShape' || entityKey === 'partShape')
    
    // PATTERN: Return 'select' type for enum selects even without inputConfig
    if (isEnumSelect) {
      return { type: 'select', reason: renderAs as 'select' | 'multiselect' | 'reference' }
    }
    
    // PATTERN: Return unknown if inputConfig is missing, preventing render error
    if (!inputConfig) {
      return { type: 'unknown', reason: 'invalidRenderAs' }
    }
    return { type: 'select', reason: renderAs as 'select' | 'multiselect' | 'reference' }
  }

  // PATTERN: Return unknown with invalidRenderAs reason
  return { type: 'unknown', reason: 'invalidRenderAs' }
}
