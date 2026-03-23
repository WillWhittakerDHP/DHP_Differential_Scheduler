/**
 * Pure helpers for resolving entity property names from field metadata (no Vue / composables).
 */

export function resolveActualPropertyNameFromFieldMetadata(
  fieldKey: string,
  fieldMetadataEntry: { inputConfig?: unknown } | undefined
): string {
  const metadata = fieldMetadataEntry
  if (metadata?.inputConfig && typeof metadata.inputConfig === 'object') {
    const inputConfig = metadata.inputConfig as Record<string, unknown>
    if (inputConfig.globalField && typeof inputConfig.globalField === 'string') {
      return inputConfig.globalField
    }
  }
  return String(fieldKey)
}
