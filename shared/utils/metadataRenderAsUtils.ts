/**
 * Single source of truth for which admin UI “render kind” a field uses.
 *
 * WHY: Persisted `renderAs` in `admin_metadata` is denormalized (API/DB convenience). The
 * authoritative decision for routing (FieldRenderer, PrimitiveInputs, form fieldType, etc.)
 * is always `computeRenderAs(dataType, inputConfig, fieldKey)` so stale DB values cannot
 * pick the wrong component.
 */

import { RELATIONSHIP_COLLECTION_FIELD_KEYS } from '../constants/collectionFieldKeys.js'

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
 * Derive render kind from structural metadata. Call this on read (UI routing) and on write
 * (persist a matching `render_as` column).
 *
 * Relationship collection fields are identified by `RELATIONSHIP_COLLECTION_FIELD_KEYS`, not
 * by a magic `selectType` string.
 */
export function computeRenderAs(
  dataType: string | undefined,
  inputConfig: Record<string, unknown> | null | undefined,
  fieldKey: string
): RenderAsType {
  if (fieldKey === 'icon') {
    return 'iconSelect'
  }

  if (RELATIONSHIP_COLLECTION_FIELD_KEYS.has(fieldKey)) {
    return 'relationshipCollection'
  }

  if (inputConfig && typeof inputConfig === 'object') {
    const ic = inputConfig as Record<string, unknown>
    if (ic.selectMode === 'multiple') {
      return 'multiselect'
    }
    if (ic.targetMode === 'relationship') {
      return 'reference'
    }
    if (Array.isArray(ic.options)) {
      return 'select'
    }
    // inputConfig without select shape (e.g. multiline, hint) — treat as text primitive
  }

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
