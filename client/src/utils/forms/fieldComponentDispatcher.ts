import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { FieldComponent } from '@/types/forms/fieldComponent'

export type { FieldComponent } from '@/types/forms/fieldComponent'

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
    const isEnumSelect = String(fieldKey) === 'type' && 
      (entityKey === 'blockShape' || entityKey === 'partShape')

    if (isEnumSelect) {
      return { type: 'select', reason: renderAs as 'select' | 'multiselect' | 'reference' }
    }

    const hasOptions = inputConfig &&
      typeof inputConfig === 'object' &&
      Array.isArray((inputConfig as Record<string, unknown>).options)

    if (hasOptions) {
      return { type: 'select', reason: renderAs as 'select' | 'multiselect' | 'reference' }
    }
    
    if (!inputConfig) {
      return { type: 'unknown', reason: 'invalidRenderAs' }
    }
    return { type: 'select', reason: renderAs as 'select' | 'multiselect' | 'reference' }
  }

  // PATTERN: Return unknown with invalidRenderAs reason
  return { type: 'unknown', reason: 'invalidRenderAs' }
}
