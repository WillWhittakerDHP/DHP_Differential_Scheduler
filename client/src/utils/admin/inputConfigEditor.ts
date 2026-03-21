/**
 * Admin primitive metadata: edit select `inputConfig` subset with passthrough preservation.
 */
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import { mergeSelectInputConfig } from '@shared/utils/selectInputConfigCodec'

export interface InputConfigFormData {
  targetMode: string | null
  selectMode: string | null
  targetKey: string | null
  candidateChildKey: string | null
  groupByKey: string | null
  placeholder: string | null
  options: unknown[] | null
}

export interface InputConfigEditorOptions {
  getEffectiveFieldMetadata: (fieldKey: string) => FieldMetadataEntry | undefined
  updateFieldRendering: (fieldKey: string, updates: Partial<FieldMetadataEntry>) => void
}

export interface InputConfigEditorReturn {
  getInputConfigData: (fieldKey: string) => InputConfigFormData
  updateInputConfigField: (fieldKey: string, fieldName: keyof InputConfigFormData, value: unknown) => void
}

function mergeRelationshipInputFields(
  base: Record<string, unknown>,
  formData: InputConfigFormData
): void {
  if (formData.targetKey) {
    base.targetKey = formData.targetKey
  }
  if (formData.candidateChildKey) {
    base.candidateChildKey = formData.candidateChildKey
  }
  if (formData.groupByKey) {
    base.groupByKey = formData.groupByKey
  }
  if (formData.placeholder) {
    base.placeholder = formData.placeholder
  }
}

function mergePrimitiveInputFields(
  base: Record<string, unknown>,
  formData: InputConfigFormData
): void {
  if (formData.targetKey) {
    base.targetKey = formData.targetKey
  }
  if (formData.placeholder) {
    base.placeholder = formData.placeholder
  }
}

/** fieldKey reserved for future per-field branching (e.g. relationshipCollection). */
function buildInputConfig(_fieldKey: string, formData: InputConfigFormData): Record<string, unknown> | null {
  if (formData.options !== null) {
    return { options: formData.options }
  }
  if (!formData.selectMode) {
    return null
  }
  if (!formData.targetMode) {
    return { selectMode: formData.selectMode }
  }
  const baseConfig: Record<string, unknown> = {
    targetMode: formData.targetMode,
    selectMode: formData.selectMode,
  }
  if (formData.targetMode === 'relationship') {
    mergeRelationshipInputFields(baseConfig, formData)
  } else if (formData.targetMode === 'primitive') {
    mergePrimitiveInputFields(baseConfig, formData)
  }
  return baseConfig
}

export function inputConfigEditor(
  options: InputConfigEditorOptions
): InputConfigEditorReturn {
  const { getEffectiveFieldMetadata, updateFieldRendering } = options

  function getInputConfigData(fieldKey: string): InputConfigFormData {
    const meta = getEffectiveFieldMetadata(fieldKey)
    const inputConfig = meta?.inputConfig as Record<string, unknown> | null | undefined

    if (!inputConfig || typeof inputConfig !== 'object') {
      return {
        targetMode: null,
        selectMode: null,
        targetKey: null,
        candidateChildKey: null,
        groupByKey: null,
        placeholder: null,
        options: null,
      }
    }

    return {
      targetMode: (inputConfig.targetMode as string) || null,
      selectMode: (inputConfig.selectMode as string) || null,
      targetKey: (inputConfig.targetKey as string) || null,
      candidateChildKey: (inputConfig.candidateChildKey as string) || null,
      groupByKey: (inputConfig.groupByKey as string) || null,
      placeholder: (inputConfig.placeholder as string) || null,
      options: (inputConfig.options as Array<unknown>) ?? null,
    }
  }

  function updateInputConfigField(fieldKey: string, fieldName: keyof InputConfigFormData, value: unknown): void {
    const currentData = getInputConfigData(fieldKey)
    const updatedData = { ...currentData, [fieldName]: value }
    const built = buildInputConfig(fieldKey, updatedData)
    const rawExisting = getEffectiveFieldMetadata(fieldKey)?.inputConfig
    const existing =
      rawExisting !== null && rawExisting !== undefined && typeof rawExisting === 'object' && !Array.isArray(rawExisting)
        ? (rawExisting as Record<string, unknown>)
        : undefined

    const next = mergeSelectInputConfig(existing, built)

    updateFieldRendering(fieldKey, { inputConfig: next })
  }

  return {
    getInputConfigData,
    updateInputConfigField,
  }
}
