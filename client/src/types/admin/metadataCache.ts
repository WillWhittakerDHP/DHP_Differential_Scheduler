import type { ComputedRef, Ref } from 'vue'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'

export interface MetadataCache {
  global: {
    blockShape: Record<string, FieldMetadataEntry>
    partShape: Record<string, FieldMetadataEntry>
    blockInstance: Record<string, FieldMetadataEntry>
    partInstance: Record<string, FieldMetadataEntry>
    eventShape: Record<string, FieldMetadataEntry>
    eventInstance: Record<string, FieldMetadataEntry>
    annotationShape: Record<string, FieldMetadataEntry>
    annotationInstance: Record<string, FieldMetadataEntry>
  }
  blockShapeSpecific: Record<string, Record<string, FieldMetadataEntry>>
}

export type MetadataEntityType =
  | 'blockShape'
  | 'partShape'
  | 'blockInstance'
  | 'partInstance'
  | 'eventShape'
  | 'eventInstance'
  | 'annotationShape'
  | 'annotationInstance'

export interface UseMetadataCacheReturn {
  ensureMetadataLoaded: () => void
  getMetadata: (
    entityType: MetadataEntityType,
    blockShapeRef?: string | null
  ) => Record<string, FieldMetadataEntry>
  getFieldMetadata: (
    entityType: MetadataEntityType,
    fieldKey: string,
    blockShapeRef?: string | null
  ) => FieldMetadataEntry | undefined
  getMetadataCache: () => MetadataCache | null
  invalidateMetadataCache: () => void
  isLoading: Ref<boolean>
  isLoaded: ComputedRef<boolean>
  error: Ref<unknown>
  metadataData: ComputedRef<MetadataCache | undefined>
}
