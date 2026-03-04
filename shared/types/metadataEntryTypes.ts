/**
 * Shared Metadata Entry Types
 *
 * WHY: Single source of truth for common shape; client and server entry types extend it.
 * PATTERN: Shared types directory for cross-cutting concerns.
 */

/**
 * Common fields for field and relationship metadata entries.
 * WHY: FieldMetadataEntry and RelationshipMetadataEntry share this shape; extend with fieldKey/relationshipKey as needed.
 */
export interface MetadataEntryBase {
  dataType: 'string' | 'number' | 'boolean' | 'ternary' | 'array' | 'reference'
  label: string
  isRequired: boolean
  visibility: 'titleRow' | 'staticAsTitle' | 'expandedDirect' | 'expandedPanel' | 'hidden' | 'notConfigured'
  layout: 'inline' | 'stacked'
  displayOrder: number
  renderAs: 'text' | 'number' | 'select' | 'multiselect' | 'reference' | 'statusButton' | 'iconSelect' | 'relationshipCollection'
  statusButtonColor?: string | null
  /** Panel key; client narrows to SubPanelKey, server to 'parts' | 'relationships' | annotations. */
  panel: 'none' | string
  bulkEdit: boolean
  inputConfig?: Record<string, unknown> | null
}
