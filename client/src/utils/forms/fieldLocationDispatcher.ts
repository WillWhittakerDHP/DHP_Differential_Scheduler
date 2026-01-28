/**
 * Field Location Dispatcher
 * 
 * LEARNING: Single source of truth for WHERE fields render based on metadata
 * WHY: Consolidates scattered location logic (visibility, panel, layout, expansion state) into one place
 * PATTERN: Pure function that determines field location from metadata + context
 * 
 * This utility handles:
 * - Visibility-based location assignment (titleRow → titleRow, expandedDirect → form body, etc.)
 * - Panel assignment (parts, relationships, annotations)
 * - Layout assignment (inline vs stacked)
 * - Expansion state checks (expandedDirect/expandedPanel fields only render when expanded)
 */

import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldMetadataEntry } from '@/types/entityMetadata'
import { sortFieldsByDisplayOrder } from './fieldSorting'

/**
 * Field location types with reasons
 * WHY: Provides clear location assignment with explanation for debugging
 * PATTERN: Discriminated union for type safety
 */
export type FieldLocation =
  | { type: 'titleRow'; reason: 'titleRow' | 'staticAsTitle' } // Renders in title row area
  | { type: 'directInline'; reason: 'expandedDirect' } // Renders in form body, inline layout
  | { type: 'directStacked'; reason: 'expandedDirect' } // Renders in form body, stacked layout
  | { type: 'subPanel'; panel: 'parts' | 'relationships' | 'annotations'; reason: 'expandedPanel' }
  | { type: 'hidden'; reason: 'hidden' | 'notConfigured' | 'notExpanded' }

/**
 * Context for field location determination
 * WHY: Location depends on component state (expansion, etc.)
 * PATTERN: Pure function takes context as parameter
 */
export interface FieldLocationContext {
  /**
   * Whether the entity card is expanded
   * WHY: expandedDirect and expandedPanel fields only render when expanded
   */
  isExpanded: boolean
}

/**
 * Field Location Dispatcher
 * 
 * LEARNING: Determines WHERE a field should render based on metadata and context
 * WHY: Single source of truth for location assignment - all logic in one place
 * PATTERN: Pure function that returns location type with reason
 * 
 * Logic Flow:
 * 1. Check visibility first (titleRow → titleRow, hidden → hidden, etc.)
 * 2. For expandedDirect: Check expansion state, then layout (inline/stacked)
 * 3. For expandedPanel: Check expansion state, then panel assignment
 */
export function getFieldLocation<GE extends GlobalEntityKey>(
  _fieldKey: GlobalFieldKey<GE>,
  fieldMetadata: FieldMetadataEntry | undefined,
  context: FieldLocationContext
): FieldLocation {
  // LEARNING: Handle missing metadata
  // WHY: Fields without metadata should not render (fail fast, fail visible)
  // PATTERN: Return hidden with reason for debugging
  if (!fieldMetadata) {
    return { type: 'hidden', reason: 'notConfigured' }
  }

  const { visibility, panel, layout } = fieldMetadata
  const { isExpanded } = context

  // LEARNING: Check visibility first - this is the primary location determinant
  // WHY: Visibility determines WHERE field renders (header vs form body vs hidden)
  // PATTERN: Switch on visibility value, handle each case explicitly

  switch (visibility) {
    case 'titleRow':
      // LEARNING: Title row fields render in title row regardless of expansion state
      // WHY: Title row should always show these fields (e.g., status buttons)
      // PATTERN: Return titleRow location immediately
      return { type: 'titleRow', reason: 'titleRow' }
    
    case 'staticAsTitle':
      // LEARNING: staticAsTitle fields render in title row (left-justified, read-only when collapsed)
      // WHY: Name field should always be visible, read-only when collapsed
      // PATTERN: Treat like titleRow for location, but EntityCard handles special rendering
      return { type: 'titleRow', reason: 'staticAsTitle' }

    case 'hidden':
      // LEARNING: Hidden fields never render
      // WHY: Explicitly hidden fields should not appear anywhere
      // PATTERN: Return hidden immediately
      return { type: 'hidden', reason: 'hidden' }

    case 'notConfigured':
      // LEARNING: Not configured fields don't render
      // WHY: Fields must be explicitly configured in metadata to render
      // PATTERN: Return hidden with notConfigured reason
      return { type: 'hidden', reason: 'notConfigured' }

    case 'expandedDirect':
      // LEARNING: Expanded direct fields render in form body when expanded
      // WHY: These fields appear in main card content area, not in sub-panels
      // PATTERN: Check expansion state, then determine layout (inline vs stacked)
      if (!isExpanded) {
        return { type: 'hidden', reason: 'notExpanded' }
      }

      // LEARNING: Determine layout (inline vs stacked)
      // WHY: Layout determines how field is rendered (horizontal row vs vertical stack)
      // PATTERN: Check layout property, default to stacked if not specified
      if (layout === 'inline') {
        return { type: 'directInline', reason: 'expandedDirect' }
      } else {
        // Default to stacked if layout is not 'inline' or not specified
        return { type: 'directStacked', reason: 'expandedDirect' }
      }

    case 'expandedPanel':
      // LEARNING: Expanded panel fields render in sub-panels when expanded
      // WHY: These fields appear in collapsible sub-panels (parts, relationships, annotations)
      // PATTERN: Check expansion state, then determine which panel
      if (!isExpanded) {
        return { type: 'hidden', reason: 'notExpanded' }
      }

      // LEARNING: Determine which sub-panel
      // WHY: Panel property determines which sub-panel the field appears in
      // PATTERN: Check panel property, return subPanel location with panel type
      if (panel === 'parts' || panel === 'relationships' || panel === 'annotations') {
        return { type: 'subPanel', panel, reason: 'expandedPanel' }
      }

      // LEARNING: Fallback for expandedPanel without valid panel assignment
      // WHY: If panel is 'none' or invalid, field should not render
      // PATTERN: Return hidden - panel assignment is required for expandedPanel visibility
      return { type: 'hidden', reason: 'notConfigured' }

    default:
      // LEARNING: Unknown visibility value
      // WHY: Fail explicitly for unknown visibility values
      // PATTERN: Return hidden with notConfigured reason
      return { type: 'hidden', reason: 'notConfigured' }
  }
}

/**
 * Group fields by location
 * WHY: Helper function to organize fields for rendering
 * PATTERN: Pure function that groups field keys by their location
 */
export function groupFieldsByLocation<GE extends GlobalEntityKey>(
  fieldKeys: GlobalFieldKey<GE>[],
  fieldMetadata: Record<string, FieldMetadataEntry>,
  context: FieldLocationContext
): {
  titleRow: GlobalFieldKey<GE>[]
  directInline: GlobalFieldKey<GE>[]
  directStacked: GlobalFieldKey<GE>[]
  subPanels: {
    parts: GlobalFieldKey<GE>[]
    relationships: GlobalFieldKey<GE>[]
    annotations: GlobalFieldKey<GE>[]
  }
  hidden: GlobalFieldKey<GE>[]
} {
  const result = {
    titleRow: [] as GlobalFieldKey<GE>[],
    directInline: [] as GlobalFieldKey<GE>[],
    directStacked: [] as GlobalFieldKey<GE>[],
    subPanels: {
      parts: [] as GlobalFieldKey<GE>[],
      relationships: [] as GlobalFieldKey<GE>[],
      annotations: [] as GlobalFieldKey<GE>[]
    },
    hidden: [] as GlobalFieldKey<GE>[]
  }

  // LEARNING: Group fields by location using dispatcher
  // WHY: Single source of truth - use dispatcher for all location decisions
  // PATTERN: Iterate through fields, determine location, group accordingly
  for (const fieldKey of fieldKeys) {
    const metadata = fieldMetadata[String(fieldKey)]
    const location = getFieldLocation(fieldKey, metadata, context)

    switch (location.type) {
      case 'titleRow':
        result.titleRow.push(fieldKey)
        break
      case 'directInline':
        result.directInline.push(fieldKey)
        break
      case 'directStacked':
        result.directStacked.push(fieldKey)
        break
      case 'subPanel':
        result.subPanels[location.panel].push(fieldKey)
        break
      case 'hidden':
        result.hidden.push(fieldKey)
        break
    }
  }

  // LEARNING: Sort fields by displayOrder using shared utility
  // WHY: Single source of truth for sorting logic, reusable across codebase
  // PATTERN: Use extracted sorting utility function
  result.titleRow = sortFieldsByDisplayOrder(result.titleRow, fieldMetadata)
  result.directInline = sortFieldsByDisplayOrder(result.directInline, fieldMetadata)
  result.directStacked = sortFieldsByDisplayOrder(result.directStacked, fieldMetadata)
  result.subPanels.parts = sortFieldsByDisplayOrder(result.subPanels.parts, fieldMetadata)
  result.subPanels.relationships = sortFieldsByDisplayOrder(result.subPanels.relationships, fieldMetadata)
  result.subPanels.annotations = sortFieldsByDisplayOrder(result.subPanels.annotations, fieldMetadata)

  return result
}
