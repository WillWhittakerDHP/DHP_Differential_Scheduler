import type { EntityMetadataType, FieldMetadataEntry } from '@/constants/fieldMetadata'

/** Shared keys for all field-metadata mutations (admin metadata API). */
export interface FieldMetadataMutationEntityKeys {
  entityType: EntityMetadataType
  entityId: string
  fieldKey: string
}

/** Shared body for save mutations (with or without blockShapeRef). */
export interface SaveFieldMetadataMutationBase extends FieldMetadataMutationEntityKeys {
  renderingUpdates: Partial<FieldMetadataEntry>
  existingMetadata: FieldMetadataEntry | undefined
}

/** Optional block-shape scope for shape-aware metadata CRUD. */
export interface FieldMetadataBlockShapeRef {
  blockShapeRef?: string | null
}

/** Variables for block-shape-aware field metadata save (admin metadata API). */
export type SaveFieldMetadataMutationVariables = SaveFieldMetadataMutationBase & FieldMetadataBlockShapeRef

export type DeleteFieldMetadataMutationVariables = FieldMetadataMutationEntityKeys & FieldMetadataBlockShapeRef
