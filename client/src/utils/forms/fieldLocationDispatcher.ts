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
import { FIELD_VISIBILITY, FIELD_LAYOUT, FIELD_PANEL } from '@/constants/fieldMetadata'
import { RELATIONSHIP_KEYS } from '@/constants/relationships'
import { sortFieldsByDisplayOrder } from './fieldSorting'

/**
 * LEARNING: Valid panel values for expandedPanel visibility
 * WHY: Config-driven approach instead of hardcoded string checks
 * PATTERN: Use Set for O(1) lookup instead of multiple OR conditions
 */
const VALID_PANELS = new Set([FIELD_PANEL.PARTS, FIELD_PANEL.RELATIONSHIPS, FIELD_PANEL.ANNOTATIONS, FIELD_PANEL.EVENTS] as const)

/**
 * LEARNING: Determine panel type from field key
 * WHY: Panel is automatically determined from field key, not manually configured
 * PATTERN: Check RELATIONSHIP_KEYS to determine panel for relationship fields
 */
export function determinePanelFromFieldKey(fieldKey: string): 'none' | 'parts' | 'relationships' | 'annotations' | 'events' {
  // Check if fieldKey is a relationship field
  if (fieldKey in RELATIONSHIP_KEYS) {
    // Map relationship fields to their panels
    if (fieldKey === 'partAssignments') {
      return 'parts'
    }
    if (fieldKey === 'annotationAssignments') {
      return 'annotations'
    }
    if (fieldKey === 'eventAssignments') {
      return 'events'
    }
    // All other relationship fields go to relationships panel
    return 'relationships'
  }
  
  // Primitive fields don't use panels
  return 'none'
}

/**
 * Field location types with reasons
 * WHY: Provides clear location assignment with explanation for debugging
 * PATTERN: Discriminated union for type safety
 */
export type FieldLocation =
  | { type: 'titleRow'; reason: 'titleRow' | 'staticAsTitle' } // Renders in title row area
  | { type: 'directInline'; reason: 'expandedDirect' } // Renders in form body, inline layout
  | { type: 'directStacked'; reason: 'expandedDirect' } // Renders in form body, stacked layout
  | { type: 'subPanel'; panel: 'parts' | 'relationships' | 'annotations' | 'events'; reason: 'expandedPanel' }
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
  fieldKey: GlobalFieldKey<GE>,
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
    case FIELD_VISIBILITY.TITLE_ROW:
      // LEARNING: Title row fields render in title row regardless of expansion state
      // WHY: Title row should always show these fields (e.g., status buttons)
      // PATTERN: Return titleRow location immediately
      return { type: 'titleRow', reason: 'titleRow' }
    
    case FIELD_VISIBILITY.STATIC_AS_TITLE:
      // LEARNING: staticAsTitle fields render in title row (left-justified, read-only when collapsed)
      // WHY: Name field should always be visible, read-only when collapsed
      // PATTERN: Treat like titleRow for location, but EntityCard handles special rendering
      return { type: 'titleRow', reason: 'staticAsTitle' }

    case FIELD_VISIBILITY.HIDDEN:
      // LEARNING: Hidden fields never render
      // WHY: Explicitly hidden fields should not appear anywhere
      // PATTERN: Return hidden immediately
      return { type: 'hidden', reason: 'hidden' }

    case FIELD_VISIBILITY.NOT_CONFIGURED:
      // LEARNING: Not configured fields don't render
      // WHY: Fields must be explicitly configured in metadata to render
      // PATTERN: Return hidden with notConfigured reason
      return { type: 'hidden', reason: 'notConfigured' }

    case FIELD_VISIBILITY.EXPANDED_DIRECT:
      // LEARNING: Expanded direct fields render in form body when expanded
      // WHY: These fields appear in main card content area, not in sub-panels
      // PATTERN: Check expansion state, then determine layout (inline vs stacked)
      if (!isExpanded) {
        return { type: 'hidden', reason: 'notExpanded' }
      }

      // LEARNING: Determine layout (inline vs stacked)
      // WHY: Layout determines how field is rendered (horizontal row vs vertical stack)
      // PATTERN: Check layout property, default to stacked if not specified
      if (layout === FIELD_LAYOUT.INLINE) {
        return { type: 'directInline', reason: 'expandedDirect' }
      } else {
        // Default to stacked if layout is not 'inline' or not specified
        return { type: 'directStacked', reason: 'expandedDirect' }
      }

    case FIELD_VISIBILITY.EXPANDED_PANEL:
      // LEARNING: Expanded panel fields render in sub-panels when expanded
      // WHY: These fields appear in collapsible sub-panels (parts, relationships, annotations)
      // PATTERN: Check expansion state, then determine which panel
      if (!isExpanded) {
        return { type: 'hidden', reason: 'notExpanded' }
      }

      // LEARNING: Determine which sub-panel automatically from field key
      // WHY: Panel is automatically determined from field key, not manually configured
      // PATTERN: Use determinePanelFromFieldKey to get panel, fallback to metadata panel if valid
      const fieldKeyString = String(fieldKey)
      const determinedPanel = determinePanelFromFieldKey(fieldKeyString)
      
      // Use determined panel if it's valid, otherwise check metadata panel
      const panelToUse = determinedPanel !== 'none' ? determinedPanel : panel
      
      // LEARNING: Type guard function to narrow panel type
      // WHY: TypeScript doesn't automatically narrow Set.has, so we use a type guard
      // PATTERN: Check if panel is valid, then TypeScript knows it's not "none"
      const isValidPanel = (p: string): p is 'parts' | 'relationships' | 'annotations' | 'events' => {
        return VALID_PANELS.has(p as 'parts' | 'relationships' | 'annotations' | 'events')
      }
      if (panelToUse && isValidPanel(panelToUse)) {
        return { type: 'subPanel', panel: panelToUse, reason: 'expandedPanel' }
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
    events: GlobalFieldKey<GE>[]
  }
  hidden: GlobalFieldKey<GE>[]
} {
  // LEARNING: Use reduce to group fields functionally
  // WHY: Avoids array mutations (push) - builds grouped structure immutably
  // PATTERN: Reduce fieldKeys to grouped structure, then sort each group
  const grouped = fieldKeys.reduce((acc, fieldKey) => {
    const metadata = fieldMetadata[String(fieldKey)]
    const location = getFieldLocation(fieldKey, metadata, context)

    switch (location.type) {
      case 'titleRow':
        return { ...acc, titleRow: [...acc.titleRow, fieldKey] }
      case 'directInline':
        return { ...acc, directInline: [...acc.directInline, fieldKey] }
      case 'directStacked':
        return { ...acc, directStacked: [...acc.directStacked, fieldKey] }
      case 'subPanel':
        return {
          ...acc,
          subPanels: {
            ...acc.subPanels,
            [location.panel]: [...acc.subPanels[location.panel], fieldKey]
          }
        }
      case 'hidden':
        return { ...acc, hidden: [...acc.hidden, fieldKey] }
      default:
        return acc
    }
  }, {
    titleRow: [] as GlobalFieldKey<GE>[],
    directInline: [] as GlobalFieldKey<GE>[],
    directStacked: [] as GlobalFieldKey<GE>[],
    subPanels: {
      parts: [] as GlobalFieldKey<GE>[],
      relationships: [] as GlobalFieldKey<GE>[],
      annotations: [] as GlobalFieldKey<GE>[],
      events: [] as GlobalFieldKey<GE>[]
    },
    hidden: [] as GlobalFieldKey<GE>[]
  })

  // LEARNING: Sort fields by displayOrder using shared utility
  // WHY: Single source of truth for sorting logic, reusable across codebase
  // PATTERN: Use extracted sorting utility function
  return {
    titleRow: sortFieldsByDisplayOrder(grouped.titleRow, fieldMetadata),
    directInline: sortFieldsByDisplayOrder(grouped.directInline, fieldMetadata),
    directStacked: sortFieldsByDisplayOrder(grouped.directStacked, fieldMetadata),
    subPanels: {
      parts: sortFieldsByDisplayOrder(grouped.subPanels.parts, fieldMetadata),
      relationships: sortFieldsByDisplayOrder(grouped.subPanels.relationships, fieldMetadata),
      annotations: sortFieldsByDisplayOrder(grouped.subPanels.annotations, fieldMetadata),
      events: sortFieldsByDisplayOrder(grouped.subPanels.events, fieldMetadata)
    },
    hidden: sortFieldsByDisplayOrder(grouped.hidden, fieldMetadata)
  }
}
