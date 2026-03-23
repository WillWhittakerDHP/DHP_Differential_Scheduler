/**
 * Maps {@link FieldMetadataEntry} to display config slices for admin forms.
 * WHY: Pure branching for function-governance; warnings stay in callers.
 */
import type { GlobalEntityKey } from '@/constants/entities'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldDisplayConfig } from '@/composables/fieldContext/types'
import { computeRenderAs } from '@shared/utils/metadataRenderAsUtils'

type FormFieldDisplayConfig<GE extends GlobalEntityKey> = FieldDisplayConfig<GE, GlobalFieldKey<GE>>

export function defaultTextDisplayConfig<GE extends GlobalEntityKey>(
  fieldKey: string
): FormFieldDisplayConfig<GE> {
  return {
    fieldType: 'text',
    label: fieldKey,
    placeholder: '',
    required: false,
    disabled: false,
  }
}

function fieldTypeFromMetadataEntry(
  meta: FieldMetadataEntry,
  fieldKey: string
): NonNullable<FormFieldDisplayConfig<GlobalEntityKey>['fieldType']> {
  const effective = computeRenderAs(meta.dataType, meta.inputConfig ?? null, fieldKey)
  if (effective === 'multiselect') return 'multiselect'
  if (effective === 'select' || effective === 'reference') return 'select'
  if (effective === 'number') return 'number'
  if (meta.dataType === 'boolean' || meta.dataType === 'ternary') return 'boolean'
  if (
    meta.inputConfig &&
    typeof meta.inputConfig === 'object' &&
    (meta.inputConfig as Record<string, unknown>).multiline === true
  ) {
    return 'textarea'
  }
  return 'text'
}

/**
 * Build display config when a {@link FieldMetadataEntry} exists for the field.
 */
export function displayConfigFromMetadataEntry<GE extends GlobalEntityKey>(
  meta: FieldMetadataEntry,
  fieldKey: string
): FormFieldDisplayConfig<GE> {
  const displayLabel =
    meta.label !== undefined && meta.label !== null && meta.label !== '' ? meta.label : fieldKey
  const hintFromInput =
    meta.inputConfig &&
    typeof meta.inputConfig === 'object' &&
    typeof (meta.inputConfig as Record<string, unknown>).hint === 'string'
      ? String((meta.inputConfig as Record<string, unknown>).hint)
      : undefined
  const metaHelp = (meta as { helpText?: string }).helpText
  return {
    label: displayLabel,
    placeholder: (meta as { placeholder?: string }).placeholder ?? undefined,
    fieldType: fieldTypeFromMetadataEntry(meta, fieldKey),
    required: meta.isRequired === true,
    disabled: (meta as { disabled?: boolean }).disabled === true,
    readOnly: (meta as { readOnly?: boolean }).readOnly === true,
    helpText: hintFromInput ?? metaHelp,
  }
}
