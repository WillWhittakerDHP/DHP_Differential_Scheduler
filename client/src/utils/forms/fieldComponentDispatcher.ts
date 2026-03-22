import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { FieldComponent } from '@/types/forms/fieldComponent'
import { FIELD_NAMES } from '@/constants/entityFieldConstants'
import { computeRenderAs } from '@shared/utils/metadataRenderAsUtils'

export type { FieldComponent } from '@/types/forms/fieldComponent'

export function getFieldComponent<GE extends GlobalEntityKey>(
  entityKey: GE,
  fieldKey: GlobalFieldKey<GE>,
  fieldMetadata: FieldMetadataEntry | undefined
): FieldComponent {
  if (entityKey === 'blockInstance' && String(fieldKey) === FIELD_NAMES.DIFFERENTIAL_EVENT_ROLE_OVERRIDES) {
    return { type: FIELD_NAMES.DIFFERENTIAL_EVENT_ROLE_OVERRIDES, reason: 'differentialRoleMatrix' }
  }

  if (!fieldMetadata) {
    return { type: 'unknown', reason: 'notConfigured' }
  }

  const { inputConfig } = fieldMetadata
  const effectiveRenderAs = computeRenderAs(
    fieldMetadata.dataType,
    inputConfig ?? null,
    String(fieldKey)
  )

  if (effectiveRenderAs === 'iconSelect') {
    return { type: 'icon', reason: 'iconSelect' }
  }

  const primitiveRenderAs: Array<FieldMetadataEntry['renderAs']> = ['text', 'number', 'statusButton']
  if (primitiveRenderAs.includes(effectiveRenderAs)) {
    return { type: 'primitive', reason: effectiveRenderAs as 'text' | 'number' | 'statusButton' }
  }

  if (effectiveRenderAs === 'relationshipCollection') {
    return { type: 'relationshipCollection', reason: 'relationshipCollection' }
  }

  const selectRenderAs: Array<FieldMetadataEntry['renderAs']> = ['select', 'multiselect', 'reference']
  if (selectRenderAs.includes(effectiveRenderAs)) {
    const isEnumSelect =
      String(fieldKey) === 'type' && (entityKey === 'blockShape' || entityKey === 'partShape')

    if (isEnumSelect) {
      return { type: 'select', reason: effectiveRenderAs as 'select' | 'multiselect' | 'reference' }
    }

    const hasOptions =
      inputConfig &&
      typeof inputConfig === 'object' &&
      Array.isArray((inputConfig as Record<string, unknown>).options)

    if (hasOptions) {
      return { type: 'select', reason: effectiveRenderAs as 'select' | 'multiselect' | 'reference' }
    }

    if (!inputConfig) {
      return { type: 'unknown', reason: 'invalidRenderAs' }
    }
    return { type: 'select', reason: effectiveRenderAs as 'select' | 'multiselect' | 'reference' }
  }

  return { type: 'unknown', reason: 'invalidRenderAs' }
}
