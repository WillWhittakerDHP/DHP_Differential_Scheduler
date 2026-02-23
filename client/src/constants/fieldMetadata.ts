/**
 * Field Metadata Constants
 * 
 */

import type { EntityMetadataType } from '@/constants/entities'
import { FIELD_NAMES } from '@/constants/entityFieldConstants'

/** Re-export for consumers that import from fieldMetadata. */
export type { EntityMetadataType }

/**
 * Single source of truth for sub-panel types (expansion panels in entity cards).
 */
export const SUB_PANEL_KEYS = ['parts', 'relationships', FIELD_NAMES.ANNOTATIONS, 'events', 'composition'] as const

/** Derived type used for panel discriminators (FieldLocation, metadata panel, etc.). */
export type SubPanelKey = (typeof SUB_PANEL_KEYS)[number]

/** Record type keyed by sub-panel; replaces manual { parts: T[], relationships: T[], ... } interfaces. */
export type SubPanelRecord<T> = Record<SubPanelKey, T>

/** Creates an empty sub-panel record; use instead of repeating object literals. */
export function createEmptySubPanelRecord<T>(factory: () => T): SubPanelRecord<T> {
  return Object.fromEntries(SUB_PANEL_KEYS.map(key => [key, factory()])) as SubPanelRecord<T>
}

import type { MetadataEntryBase } from '@shared/types/metadataEntryTypes'

/**
 * Unified field metadata entry; extends shared base (TYPE_SIMILARITY 1.11).
 * Client narrows panel to SubPanelKey.
 */
export interface FieldMetadataEntry extends MetadataEntryBase {
  panel: 'none' | SubPanelKey
}

/**
 * Field metadata configuration type alias
 */
export type FieldMetadata = Record<string, FieldMetadataEntry>

/**
 * WHY: Visibility values for field metadata
WHY: Allows using constants in swit...
 */
export const FIELD_VISIBILITY = {
  TITLE_ROW: 'titleRow' as const satisfies FieldMetadataEntry['visibility'],
  STATIC_AS_TITLE: 'staticAsTitle' as const satisfies FieldMetadataEntry['visibility'],
  EXPANDED_DIRECT: 'expandedDirect' as const satisfies FieldMetadataEntry['visibility'],
  EXPANDED_PANEL: 'expandedPanel' as const satisfies FieldMetadataEntry['visibility'],
  HIDDEN: 'hidden' as const satisfies FieldMetadataEntry['visibility'],
  NOT_CONFIGURED: 'notConfigured' as const satisfies FieldMetadataEntry['visibility'],
} as const

/**
 * Layout values for field metadata
 */
export const FIELD_LAYOUT = {
  INLINE: 'inline' as const satisfies FieldMetadataEntry['layout'],
  STACKED: 'stacked' as const satisfies FieldMetadataEntry['layout'],
} as const

/**
 * RenderAs values for field metadata
 */
export const FIELD_RENDER_AS = {
  TEXT: 'text' as const satisfies FieldMetadataEntry['renderAs'],
  NUMBER: 'number' as const satisfies FieldMetadataEntry['renderAs'],
  SELECT: 'select' as const satisfies FieldMetadataEntry['renderAs'],
  MULTISELECT: 'multiselect' as const satisfies FieldMetadataEntry['renderAs'],
  REFERENCE: 'reference' as const satisfies FieldMetadataEntry['renderAs'],
  STATUS_BUTTON: 'statusButton' as const satisfies FieldMetadataEntry['renderAs'],
  ICON_SELECT: 'iconSelect' as const satisfies FieldMetadataEntry['renderAs'],
  RELATIONSHIP_COLLECTION: 'relationshipCollection' as const satisfies FieldMetadataEntry['renderAs'],
} as const

/**
 * Panel values for field metadata
 */
export const FIELD_PANEL = {
  NONE: 'none' as const,
  PARTS: 'parts' as const satisfies SubPanelKey,
  RELATIONSHIPS: 'relationships' as const satisfies SubPanelKey,
  ANNOTATIONS: FIELD_NAMES.ANNOTATIONS satisfies SubPanelKey,
  EVENTS: 'events' as const satisfies SubPanelKey,
  COMPOSITION: 'composition' as const satisfies SubPanelKey,
} as const

/**
 * Field location type discriminators (where a field renders)
 */
export const FIELD_LOCATION_TYPE = {
  TITLE_ROW: 'titleRow',
  DIRECT_INLINE: 'directInline',
  DIRECT_STACKED: 'directStacked',
  SUB_PANEL: 'subPanel',
  HIDDEN: 'hidden',
} as const
