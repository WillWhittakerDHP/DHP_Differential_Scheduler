
import type { EntityMetadataType } from '@/constants/entities'
import { FIELD_NAMES } from '@/constants/entityFieldConstants'
import type { MetadataEntryBase } from '@shared/types/metadataEntryTypes'

/** Re-export for consumers that import from fieldMetadata. */
export type { EntityMetadataType }

const SUB_PANEL_KEYS_CORE = ['parts', 'relationships', FIELD_NAMES.ANNOTATIONS, 'events', 'composition'] as const

export const SUB_PANEL_KEYS = SUB_PANEL_KEYS_CORE

export type SubPanelKey = (typeof SUB_PANEL_KEYS_CORE)[number]

export type SubPanelRecord<T> = Record<SubPanelKey, T>

export function createEmptySubPanelRecord<T>(factory: () => T): SubPanelRecord<T> {
  return Object.fromEntries(SUB_PANEL_KEYS_CORE.map((key) => [key, factory()])) as SubPanelRecord<T>
}

export interface FieldMetadataEntry extends MetadataEntryBase {
  panel: 'none' | SubPanelKey
}

export type FieldMetadata = Record<string, FieldMetadataEntry>
