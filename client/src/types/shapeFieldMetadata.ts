/**
 */

import { FIELD_NAMES } from '@/constants/entityFieldConstants'

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
  panel: 'parts' | 'relationships' | typeof FIELD_NAMES.ANNOTATIONS | 'none'
  bulkEdit: boolean
  createdAt: string
  updatedAt: string
}

export interface ComposedFieldConfig {
  fieldKey: string
  dataType: 'string' | 'number' | 'boolean' | 'ternary' | 'array' | 'reference'
  controlType: 'text' | 'number' | 'toggle' | 'select' | 'multiselect' | 'reference'
  label: string
  helpText: string | null
  isRequired: boolean
  validationRules: Record<string, unknown> | null
  defaultValue: unknown | null
  
  visibility: 'titleRow' | 'expandedDirect' | 'expandedPanel' | 'hidden'
  layout: 'inline' | 'stacked'
  order: number
  section: string | null
  renderAs: 'field' | 'statusButton'
  statusButtonColor: string | null
  panel: 'parts' | 'relationships' | typeof FIELD_NAMES.ANNOTATIONS | 'none'
  bulkEdit: boolean

  _hasLayoutConfig?: boolean
}
