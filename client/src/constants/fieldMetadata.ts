/**
 * Field Metadata Constants
 * 
 * LEARNING: Centralized constants for field metadata values
 * WHY: Reduces hardcoding audit findings, provides single source of truth for metadata values
 * PATTERN: Constants file with exported string literals matching type definitions
 */

import type { EntityMetadataType } from '@/constants/entities'
import { FIELD_NAMES } from '@/constants/entityFieldConstants'

/** Re-export for consumers that import from fieldMetadata. */
export type { EntityMetadataType }

/**
 * Single source of truth for sub-panel types (expansion panels in entity cards).
 * WHY: Add/remove panels in one place; types and runtime structures derive from this.
 * PATTERN: Const array + derived type + record type + empty-record factory.
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
 * WHY: Convenience type for Record<fieldKey, FieldMetadataEntry>
 * PATTERN: Used throughout the codebase for metadata lookups
 */
export type FieldMetadata = Record<string, FieldMetadataEntry>

/**
 * Visibility values for field metadata
 * LEARNING: Constants matching FieldMetadataEntry['visibility'] union type
 * WHY: Allows using constants in switch statements and comparisons instead of string literals
 * PATTERN: Export constants that match the type definition
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
 * LEARNING: Constants matching FieldMetadataEntry['layout'] union type
 * WHY: Allows using constants in comparisons instead of string literals
 * PATTERN: Export constants that match the type definition
 */
export const FIELD_LAYOUT = {
  INLINE: 'inline' as const satisfies FieldMetadataEntry['layout'],
  STACKED: 'stacked' as const satisfies FieldMetadataEntry['layout'],
} as const

/**
 * RenderAs values for field metadata
 * LEARNING: Constants matching FieldMetadataEntry['renderAs'] union type
 * WHY: Allows using constants in comparisons instead of string literals
 * PATTERN: Export constants that match the type definition
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
 * LEARNING: Constants matching FieldMetadataEntry['panel'] union type (none | SubPanelKey)
 * WHY: Allows using constants in comparisons instead of string literals
 * PATTERN: Export constants that match the type definition
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
 * LEARNING: Matches FieldLocation['type'] union; use in switch to avoid string literal case clauses
 * WHY: Single source of truth for location type strings; satisfies hardcoding audit
 */
export const FIELD_LOCATION_TYPE = {
  TITLE_ROW: 'titleRow',
  DIRECT_INLINE: 'directInline',
  DIRECT_STACKED: 'directStacked',
  SUB_PANEL: 'subPanel',
  HIDDEN: 'hidden',
} as const
