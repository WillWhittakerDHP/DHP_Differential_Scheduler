import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { FieldComponent } from '@/types/forms/fieldComponent'
import { computeRenderAs } from '@shared/utils/metadataRenderAsUtils'

export type { FieldComponent } from '@/types/forms/fieldComponent'

const PRIMITIVE_RENDER_AS: Array<FieldMetadataEntry['renderAs']> = ['text', 'number', 'statusButton']
const SELECT_RENDER_AS: Array<FieldMetadataEntry['renderAs']> = ['select', 'multiselect', 'reference']

function isEventShapePlacementField<GE extends GlobalEntityKey>(
  entityKey: GE,
  fieldKey: GlobalFieldKey<GE>
): boolean {
  return entityKey === 'eventShape' && String(fieldKey) === 'placementKind'
}

function isWizardPlacementField<GE extends GlobalEntityKey>(
  entityKey: GE,
  fieldKey: GlobalFieldKey<GE>
): boolean {
  return entityKey === 'blockInstance' && String(fieldKey) === 'wizardPlacement'
}

function isEnumSelectField<GE extends GlobalEntityKey>(
  entityKey: GE,
  fieldKey: GlobalFieldKey<GE>
): boolean {
  return (
    (entityKey === 'blockShape' && String(fieldKey) === 'semanticType') ||
    (entityKey === 'partShape' && String(fieldKey) === 'type')
  )
}

function hasOptionsInputConfig(inputConfig: FieldMetadataEntry['inputConfig']): boolean {
  return (
    inputConfig !== undefined &&
    inputConfig !== null &&
    typeof inputConfig === 'object' &&
    Array.isArray((inputConfig as Record<string, unknown>).options)
  )
}

function selectFieldComponent<GE extends GlobalEntityKey>(
  entityKey: GE,
  fieldKey: GlobalFieldKey<GE>,
  inputConfig: FieldMetadataEntry['inputConfig'],
  reason: 'select' | 'multiselect' | 'reference'
): FieldComponent {
  if (isEnumSelectField(entityKey, fieldKey) || hasOptionsInputConfig(inputConfig) || inputConfig) {
    return { type: 'select', reason }
  }
  return { type: 'unknown', reason: 'invalidRenderAs' }
}

export function getFieldComponent<GE extends GlobalEntityKey>(
  entityKey: GE,
  fieldKey: GlobalFieldKey<GE>,
  fieldMetadata: FieldMetadataEntry | undefined
): FieldComponent {
  if (isEventShapePlacementField(entityKey, fieldKey)) {
    return { type: 'eventShapePlacement', reason: 'eventShapePlacement' }
  }

  if (isWizardPlacementField(entityKey, fieldKey)) {
    return { type: 'wizardPlacement', reason: 'wizardPlacement' }
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

  if (PRIMITIVE_RENDER_AS.includes(effectiveRenderAs)) {
    return { type: 'primitive', reason: effectiveRenderAs as 'text' | 'number' | 'statusButton' }
  }

  if (effectiveRenderAs === 'relationshipCollection') {
    return { type: 'relationshipCollection', reason: 'relationshipCollection' }
  }

  if (SELECT_RENDER_AS.includes(effectiveRenderAs)) {
    return selectFieldComponent(
      entityKey,
      fieldKey,
      inputConfig,
      effectiveRenderAs as 'select' | 'multiselect' | 'reference'
    )
  }

  return { type: 'unknown', reason: 'invalidRenderAs' }
}
