/**
 * LEARNING: Shape Field Metadata Types
 * WHY: Type definitions for canonical field metadata and layout configs
 * PATTERN: Separate types for canonical metadata vs layout configs
 */

/**
 * Canonical field metadata (shared across shapes)
 */
export interface ShapeFieldMetadata {
  id: string
  entityType: 'block' | 'part' | 'blockShape' | 'partShape'
  fieldKey: string
  dataType: 'string' | 'number' | 'boolean' | 'ternary' | 'array' | 'reference'
  controlType: 'text' | 'number' | 'toggle' | 'select' | 'multiselect' | 'reference'
  label: string
  helpText: string | null
  isRequired: boolean
  validationRules: Record<string, unknown> | null
  defaultValue: unknown | null
  displayOrder: number
  createdAt: string
  updatedAt: string
}

/**
 * Shape layout config (per-shape customizations)
 */
export interface ShapeLayoutConfig {
  id: string
  entityId: string  // Renamed from shapeId
  entityType: 'block' | 'part' | 'blockShape' | 'partShape'  // Renamed from shapeType
  fieldKey: string
  visibility: 'titleRow' | 'expandedDirect' | 'expandedPanel' | 'hidden'
  layout: 'inline' | 'stacked'
  order: number
  section: string | null
  renderAs: 'field' | 'statusButton'
  statusButtonColor: string | null
  panel: 'parts' | 'relationships' | 'annotations' | 'none'
  bulkEdit: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Composed field configuration (canonical + layout merged)
 */
export interface ComposedFieldConfig {
  // From canonical metadata
  fieldKey: string
  dataType: 'string' | 'number' | 'boolean' | 'ternary' | 'array' | 'reference'
  controlType: 'text' | 'number' | 'toggle' | 'select' | 'multiselect' | 'reference'
  label: string
  helpText: string | null
  isRequired: boolean
  validationRules: Record<string, unknown> | null
  defaultValue: unknown | null
  
  // From layout config (overrides canonical displayOrder)
  visibility: 'titleRow' | 'expandedDirect' | 'expandedPanel' | 'hidden'
  layout: 'inline' | 'stacked'
  order: number
  section: string | null
  renderAs: 'field' | 'statusButton'
  statusButtonColor: string | null
  panel: 'parts' | 'relationships' | 'annotations' | 'none'
  bulkEdit: boolean
  
  // Internal flag: true if this field has a layout config, false if using defaults
  // Used by conversion function to determine if 'hidden' means 'notConfigured'
  _hasLayoutConfig?: boolean
}
