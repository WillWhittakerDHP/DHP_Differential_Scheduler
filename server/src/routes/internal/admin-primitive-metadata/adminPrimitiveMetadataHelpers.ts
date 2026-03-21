import { computeRenderAs as computeRenderAsShared } from '../../../../../shared/utils/metadataRenderAsUtils.js'
import type { FieldMetadataEntry } from '../../../utils/adminPrimitiveMetadataComposer.js'
import { mapMetaFieldsToPayload } from '../../../utils/adminMetadataPayload.js'

export function computeRenderAs(
  dataType: string | undefined,
  inputConfig: Record<string, unknown> | null | undefined,
  fieldKey: string
): ReturnType<typeof computeRenderAsShared> {
  return computeRenderAsShared(dataType, inputConfig, fieldKey)
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
