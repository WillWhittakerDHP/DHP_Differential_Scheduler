/**
 * Field Component Dispatcher
 * 
 * LEARNING: Single source of truth for WHAT component renders a field based on metadata
 * WHY: Consolidates scattered component type logic into one place, parallel to field location dispatcher
 * PATTERN: Pure function that determines component type from metadata
 * 
 * This utility handles:
 * - Component type determination (icon, primitive, partsCollection, annotations, select)
 * - RenderAs-based type checking (iconSelect, text, number, statusButton, select, multiselect, reference, partsCollection)
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
  | { type: 'partsCollection'; reason: 'partsCollection' } // Renders PartsCollection component
  | { type: 'annotations'; reason: 'annotationsField' } // Renders AnnotationsField component
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
 * 5. Check renderAs for partsCollection → partsCollection component
 * 6. Check renderAs for select/multiselect/reference → select component (with enum select exception)
 * 7. Unknown renderAs → unknown component
 */
export function getFieldComponent<GE extends GlobalEntityKey>(
  entityKey: GE,
  fieldKey: GlobalFieldKey<GE>,
  fieldMetadata: FieldMetadataEntry | undefined
): FieldComponent {
  // LEARNING: Handle missing metadata
  // WHY: Fields without metadata cannot determine component type
  // PATTERN: Return unknown with reason for debugging
  if (!fieldMetadata) {
    return { type: 'unknown', reason: 'notConfigured' }
  }

  const { renderAs, inputConfig } = fieldMetadata

  // LEARNING: Check for annotations field first (special case)
  // WHY: Annotations field is identified by fieldKey, not renderAs
  // PATTERN: Check fieldKey string value before checking metadata
  if (String(fieldKey) === 'annotations') {
    return { type: 'annotations', reason: 'annotationsField' }
  }

  // LEARNING: Check for icon field
  // WHY: Icon fields need special IconInput component
  // PATTERN: Check renderAs for 'iconSelect'
  if (renderAs === 'iconSelect') {
    return { type: 'icon', reason: 'iconSelect' }
  }

  // LEARNING: Check for primitive fields
  // WHY: Primitive fields use PrimitiveInputs component
  // PATTERN: Check renderAs for text/number/statusButton
  const primitiveRenderAs: Array<FieldMetadataEntry['renderAs']> = ['text', 'number', 'statusButton']
  if (primitiveRenderAs.includes(renderAs)) {
    return { type: 'primitive', reason: renderAs as 'text' | 'number' | 'statusButton' }
  }
  // LEARNING: Check for partsCollection renderAs (declarative partsCollection)
  // WHY: PartsCollection is now explicitly declared via renderAs, not inferred from selectMode
  // PATTERN: Check renderAs for 'partsCollection' directly
  if (renderAs === 'partsCollection') {
    return { type: 'partsCollection', reason: 'partsCollection' }
  }

  // LEARNING: Check for select-like fields (select, multiselect, reference)
  // WHY: These fields render as SelectInputs component
  // PATTERN: Check renderAs for select/multiselect/reference
  // NOTE: Enum selects (e.g., blockShape.type) don't require inputConfig - they use hardcoded options
  const selectRenderAs: Array<FieldMetadataEntry['renderAs']> = ['select', 'multiselect', 'reference']
  if (selectRenderAs.includes(renderAs)) {
    // LEARNING: Check for enum selects - they don't require inputConfig
    // WHY: Enum selects (e.g., blockShape.type, partShape.type) use hardcoded options, not inputConfig
    // PATTERN: Check entityKey and fieldKey to identify known enum selects
    const isEnumSelect = String(fieldKey) === 'type' && 
      (entityKey === 'blockShape' || entityKey === 'partShape')
    
    // LEARNING: Enum selects don't require inputConfig - they use hardcoded options
    // WHY: blockShape.type and partShape.type are enums with fixed values
    // PATTERN: Return 'select' type for enum selects even without inputConfig
    if (isEnumSelect) {
      return { type: 'select', reason: renderAs as 'select' | 'multiselect' | 'reference' }
    }
    
    // LEARNING: Non-enum select fields require inputConfig - fail gracefully if missing
    // WHY: SelectInputs component needs inputConfig to determine select behavior (relationship/type select config)
    // PATTERN: Return unknown if inputConfig is missing, preventing render error
    if (!inputConfig) {
      return { type: 'unknown', reason: 'invalidRenderAs' }
    }
    return { type: 'select', reason: renderAs as 'select' | 'multiselect' | 'reference' }
  }

  // LEARNING: Unknown renderAs value
  // WHY: Fail explicitly for unknown renderAs values
  // PATTERN: Return unknown with invalidRenderAs reason
  return { type: 'unknown', reason: 'invalidRenderAs' }
}
