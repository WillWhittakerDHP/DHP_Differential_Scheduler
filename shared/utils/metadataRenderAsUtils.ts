/**
 * Shared utility for computing renderAs field metadata.
 * LEARNING: Single source of truth for renderAs computation logic shared between client and server.
 * WHY: Ensures consistent field rendering determination across frontend and backend.
 * PATTERN: Shared utilities alongside shared types.
 */

export type RenderAsType =
  | 'text'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'reference'
  | 'statusButton'
  | 'iconSelect'
  | 'relationshipCollection'

/**
 * Compute the renderAs value for a field from its dataType, inputConfig, and fieldKey.
 * Used by client (metadataFieldUpdates) and server (adminPrimitiveMetadataHelpers).
 */
export function computeRenderAs(
  dataType: string | undefined,
  inputConfig: Record<string, unknown> | null | undefined,
  fieldKey: string
): RenderAsType {
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
