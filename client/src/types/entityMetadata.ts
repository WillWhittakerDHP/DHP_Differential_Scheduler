/**
 * LEARNING: Entity Metadata Types
 * WHY: Unified type definitions for admin input metadata
 * PATTERN: Single type system for all entity types (shapes and instances)
 * 
 * This replaces the separate ShapeFieldMetadata and ShapeLayoutConfig types
 * with a unified FieldMetadataEntry that combines canonical and layout properties.
 */

/**
 * Entity metadata type - used for admin_input_metadata table
 */
export type EntityMetadataType = 'blockShape' | 'partShape' | 'blockInstance' | 'partInstance'

/**
 * Unified field metadata entry
 * Combines canonical properties (dataType, label, isRequired) with layout/rendering properties
 * 
 * LEARNING: Single type replaces separate canonical + layout types
 * WHY: Simplifies code, eliminates need to merge separate configs
 * PATTERN: All properties in one place, clear separation via comments
 */
export interface FieldMetadataEntry {
  // Canonical properties (from old field_metadata)
  dataType: 'string' | 'number' | 'boolean' | 'array' | 'reference'
  label: string
  isRequired: boolean
  
  // Layout/rendering properties (merged from old entity_layout_config)
  visibility: 'titleRow' | 'staticAsTitle' | 'expandedDirect' | 'expandedPanel' | 'hidden' | 'notConfigured'
  layout: 'inline' | 'stacked'
  displayOrder: number
  section: string | null
  renderAs: 'text' | 'number' | 'select' | 'multiselect' | 'reference' | 'statusButton' | 'iconSelect'
  statusButtonColor?: string
  panel: 'none' | 'parts' | 'relationships' | 'annotations'
  bulkEdit: boolean
  
  // Input configuration (for select/multiselect/reference fields)
  // LEARNING: JSONB column stores select behavior config (target entity/relationship, selectMode, groupByKey, etc.)
  // WHY: Select fields need behavioral configuration beyond renderAs
  // PATTERN: Only populated for fields with renderAs: select|multiselect|reference, null otherwise
  inputConfig?: Record<string, unknown> | null
  
  // Inheritance (for instance entities)
  inheritsFromEntityType?: 'blockShape' | 'partShape' | null
  inheritsFromEntityId?: string | null
}

/**
 * Field metadata configuration type alias
 * WHY: Convenience type for Record<fieldKey, FieldMetadataEntry>
 * PATTERN: Used throughout the codebase for metadata lookups
 */
export type FieldMetadata = Record<string, FieldMetadataEntry>
