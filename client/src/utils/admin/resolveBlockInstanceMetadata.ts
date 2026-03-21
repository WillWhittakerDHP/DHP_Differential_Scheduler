/**
 * WHY: Per-shape `admin_metadata` rows are partial overrides; global `blockInstance` rows
 * (e.g. annotationAssignments) must remain visible when a shape has its own field entries.
 */
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { MetadataCache } from '@/types/admin/metadataCache'

export function resolveBlockInstanceMetadataFromCache(
  data: MetadataCache,
  blockShapeRef: string | null | undefined
): Record<string, FieldMetadataEntry> {
  const globalBlock = data.global.blockInstance ?? {}
  const ref = blockShapeRef != null && blockShapeRef !== '' ? blockShapeRef : null
  if (!ref) {
    return { ...globalBlock }
  }
  const specific = data.blockShapeSpecific[ref]
  if (!specific || Object.keys(specific).length === 0) {
    return { ...globalBlock }
  }
  const overlay = Object.fromEntries(
    Object.entries(specific).filter(([, v]) => v !== undefined)
  ) as Record<string, FieldMetadataEntry>
  return { ...globalBlock, ...overlay }
}
