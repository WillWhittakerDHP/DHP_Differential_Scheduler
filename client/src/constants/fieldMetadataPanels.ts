
import type { EntityMetadataType } from '@/constants/entities'
import { FIELD_NAMES } from '@/constants/entityFieldConstants'
import type { MetadataEntryBase } from '@shared/types/metadataEntryTypes'

/** Re-export for consumers that import from fieldMetadata. */
export type { EntityMetadataType }

export const SUB_PANEL_KEYS = ['parts', 'relationships', FIELD_NAMES.ANNOTATIONS, 'events', 'composition'] as const

export type SubPanelKey = (typeof SUB_PANEL_KEYS)[number]

export type SubPanelRecord<T> = Record<SubPanelKey, T>

export function createEmptySubPanelRecord<T>(factory: () => T): SubPanelRecord<T> {
  return Object.fromEntries(SUB_PANEL_KEYS.map(key => [key, factory()])) as SubPanelRecord<T>
}

export interface FieldMetadataEntry extends MetadataEntryBase {
  panel: 'none' | SubPanelKey
}

export type FieldMetadata = Record<string, FieldMetadataEntry>
