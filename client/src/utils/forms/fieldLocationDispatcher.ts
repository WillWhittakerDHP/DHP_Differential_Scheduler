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
import {
  FIELD_VISIBILITY,
  FIELD_LAYOUT,
  SUB_PANEL_KEYS,
  createEmptySubPanelRecord,
  type SubPanelKey,
  type SubPanelRecord
} from '@/constants/fieldMetadata'
import { FIELD_NAMES } from '@/constants/entityFieldConstants'
import { RELATIONSHIP_KEYS } from '@/constants/relationships'
import { sortFieldsByDisplayOrder } from './fieldSorting'

/**
 * LEARNING: Valid panel values for expandedPanel visibility
 * WHY: Derived from SUB_PANEL_KEYS so add/remove panels in one place
 * PATTERN: Set for O(1) lookup
 */
const VALID_PANELS = new Set<SubPanelKey>(SUB_PANEL_KEYS)

/**
 * LEARNING: Determine panel type from field key
 * WHY: Panel is automatically determined from field key, not manually configured
 * PATTERN: Check RELATIONSHIP_KEYS to determine panel for relationship fields
 */
export function determinePanelFromFieldKey(fieldKey: string): 'none' | SubPanelKey {
  if (fieldKey in RELATIONSHIP_KEYS) {
    // PATTERN: Use RELATIONSHIP_KEYS.frontendKey for comparison
    if (fieldKey === RELATIONSHIP_KEYS.partAssignments.frontendKey) {
      return 'parts'
    }
    if (fieldKey === RELATIONSHIP_KEYS.annotationAssignments.frontendKey) {
      return FIELD_NAMES.ANNOTATIONS
    }
    if (fieldKey === RELATIONSHIP_KEYS.eventAssignments.frontendKey) {
      return 'events'
    }
    if (fieldKey === RELATIONSHIP_KEYS.instanceComponents.frontendKey) {
      return 'composition'
    }
    return 'relationships'
  }

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
  | { type: 'subPanel'; panel: SubPanelKey; reason: 'expandedPanel' }
  | { type: 'hidden'; reason: 'hidden' | 'notConfigured' | 'notExpanded' }

/**
 * Context for field location determination
 * WHY: Location depends on component state (expansion, etc.)
 * PATTERN: Pure function takes context as parameter
 */
export interface FieldLocationContext {
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
  // PATTERN: Return hidden with reason for debugging
  if (!fieldMetadata) {
    return { type: 'hidden', reason: 'notConfigured' }
  }

  const { visibility, panel, layout } = fieldMetadata
  const { isExpanded } = context

  // PATTERN: Switch on visibility value, handle each case explicitly

  switch (visibility) {
    case FIELD_VISIBILITY.TITLE_ROW:
      // LEARNING: Title row fields render in title row regardless of expansion state
      // PATTERN: Return titleRow location immediately
      return { type: 'titleRow', reason: 'titleRow' }
    
    case FIELD_VISIBILITY.STATIC_AS_TITLE:
      // PATTERN: Treat like titleRow for location, but EntityCard handles special rendering
      return { type: 'titleRow', reason: 'staticAsTitle' }

    case FIELD_VISIBILITY.HIDDEN:
      // PATTERN: Return hidden immediately
      return { type: 'hidden', reason: 'hidden' }

    case FIELD_VISIBILITY.NOT_CONFIGURED:
      // PATTERN: Return hidden with notConfigured reason
      return { type: 'hidden', reason: 'notConfigured' }

    case FIELD_VISIBILITY.EXPANDED_DIRECT:
      // PATTERN: Check expansion state, then determine layout (inline vs stacked)
      if (!isExpanded) {
        return { type: 'hidden', reason: 'notExpanded' }
      }

      // PATTERN: Check layout property, default to stacked if not specified
      if (layout === FIELD_LAYOUT.INLINE) {
        return { type: 'directInline', reason: 'expandedDirect' }
      } else {
        return { type: 'directStacked', reason: 'expandedDirect' }
      }

    case FIELD_VISIBILITY.EXPANDED_PANEL: {
      // PATTERN: Check expansion state, then determine which panel
      if (!isExpanded) {
        return { type: 'hidden', reason: 'notExpanded' }
      }

      // PATTERN: Use determinePanelFromFieldKey to get panel, fallback to metadata panel if valid
      const fieldKeyString = String(fieldKey)
      const determinedPanel = determinePanelFromFieldKey(fieldKeyString)
      
      const panelToUse = determinedPanel !== 'none' ? determinedPanel : panel
      
      // PATTERN: Check if panel is valid, then TypeScript knows it's not "none"
      const isValidPanel = (p: string): p is SubPanelKey => {
        return VALID_PANELS.has(p as SubPanelKey)
      }
      if (panelToUse && isValidPanel(panelToUse)) {
        return { type: 'subPanel', panel: panelToUse, reason: 'expandedPanel' }
      }

      // PATTERN: Return hidden - panel assignment is required for expandedPanel visibility
      return { type: 'hidden', reason: 'notConfigured' }
    }

    default:
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
  subPanels: SubPanelRecord<GlobalFieldKey<GE>[]>
  hidden: GlobalFieldKey<GE>[]
} {
  const emptySubPanels = createEmptySubPanelRecord<GlobalFieldKey<GE>[]>(() => [])

  // PATTERN: Reduce fieldKeys to grouped structure, then sort each group
  const grouped = fieldKeys.reduce(
    (acc, fieldKey) => {
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
    },
    {
      titleRow: [] as GlobalFieldKey<GE>[],
      directInline: [] as GlobalFieldKey<GE>[],
      directStacked: [] as GlobalFieldKey<GE>[],
      subPanels: { ...emptySubPanels },
      hidden: [] as GlobalFieldKey<GE>[]
    }
  )

  // PATTERN: Use extracted sorting utility function; build sorted subPanels from SUB_PANEL_KEYS
  const sortedSubPanels = SUB_PANEL_KEYS.reduce<SubPanelRecord<GlobalFieldKey<GE>[]>>(
    (acc, key) => ({
      ...acc,
      [key]: sortFieldsByDisplayOrder(grouped.subPanels[key], fieldMetadata)
    }),
    createEmptySubPanelRecord<GlobalFieldKey<GE>[]>(() => [])
  )

  return {
    titleRow: sortFieldsByDisplayOrder(grouped.titleRow, fieldMetadata),
    directInline: sortFieldsByDisplayOrder(grouped.directInline, fieldMetadata),
    directStacked: sortFieldsByDisplayOrder(grouped.directStacked, fieldMetadata),
    subPanels: sortedSubPanels,
    hidden: sortFieldsByDisplayOrder(grouped.hidden, fieldMetadata)
  }
}
