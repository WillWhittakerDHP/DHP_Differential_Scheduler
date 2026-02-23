
import type { FieldMetadataEntry } from '../../../utils/adminPrimitiveMetadataComposer.js';
import { mapMetaFieldsToPayload } from '../../../utils/adminMetadataPayload.js';

export function computeRenderAs(
  dataType: string | undefined,
  inputConfig: Record<string, unknown> | null | undefined,
  fieldKey: string
): 'text' | 'number' | 'select' | 'multiselect' | 'reference' | 'statusButton' | 'iconSelect' | 'relationshipCollection' {
  if (fieldKey === 'icon') {
    return 'iconSelect'
  }
  
  if (inputConfig && typeof inputConfig === 'object') {
    const selectType = inputConfig.selectType as string | undefined
    if (selectType === 'partsCollectionSelect') {
      return 'relationshipCollection'
    }
    const selectMode = inputConfig.selectMode as string | undefined
    if (selectMode === 'multiple') {
      return 'multiselect'
    }
    if (inputConfig.targetMode === 'relationship') {
      return 'reference'
    }
    return 'select'
  }
  
  // LEARNING: Ternary fields use 'boolean' dataType but render as statusButton
  // WHY: Ternary is a boolean variant with three states, still renders as status button
  if (dataType === 'boolean' || dataType === 'ternary') {
    return 'statusButton'
  }
  if (dataType === 'number') {
    return 'number'
  }
  if (dataType === 'array') {
    return 'reference'
  }
  
  return 'text'
}

/**
 * PATTERN: Transform metadata array to record format
PATTERN: Map array to record w...
 */
export function transformMetadataToRecord(metadata: FieldMetadataEntry[]): Record<string, unknown> {
  const metadataRecord: Record<string, unknown> = {}
  for (const meta of metadata) {
    metadataRecord[meta.fieldKey] = mapMetaFieldsToPayload(meta);
  }
  return metadataRecord
}
