/**
 * Field Metadata Constants
 * 
 * LEARNING: Centralized constants for field metadata values
 * WHY: Reduces hardcoding audit findings, provides single source of truth for metadata values
 * PATTERN: Constants file with exported string literals matching type definitions
 */

import type { FieldMetadataEntry } from '@/types/entityMetadata'

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
 * LEARNING: Constants matching FieldMetadataEntry['panel'] union type
 * WHY: Allows using constants in comparisons instead of string literals
 * PATTERN: Export constants that match the type definition
 */
export const FIELD_PANEL = {
  NONE: 'none' as const satisfies FieldMetadataEntry['panel'],
  PARTS: 'parts' as const satisfies FieldMetadataEntry['panel'],
  RELATIONSHIPS: 'relationships' as const satisfies FieldMetadataEntry['panel'],
  ANNOTATIONS: 'annotations' as const satisfies FieldMetadataEntry['panel'],
  EVENTS: 'events' as const satisfies FieldMetadataEntry['panel'],
} as const
