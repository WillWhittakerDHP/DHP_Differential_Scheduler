import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldMetadataEntry } from '@/types/entityMetadata'
import type { FieldMetadata } from '@/configs/adminConfig'

/**
 * LEARNING: NO DEFAULTS - removed DEFAULT_PANEL_ASSIGNMENTS
 * WHY: fieldMetadata: null means not configured - don't create fake defaults
 * PATTERN: Fields must be explicitly configured in fieldMetadata to render
 */

/**
 * LEARNING: Status button field configuration
 * WHY: Extracted from config for rendering clickable status badges
 * PATTERN: Contains field key, label, and color for VChip rendering
 */
export interface StatusButtonField {
  key: GlobalFieldKey<GlobalEntityKey>
  label: string
  color: string
  order: number
}

export interface CategorizedFields {
  /**
   * LEARNING: Fields with panel: 'none' - rendered directly in card content
   * WHY: Fields without a panel assignment render in the main card area
   * PATTERN: Organized by layout (inline vs stacked) from metadata
   */
  directFields: {
    inline: GlobalFieldKey<GlobalEntityKey>[]
    stacked: GlobalFieldKey<GlobalEntityKey>[]
  }
  subPanelFields: {
    parts: GlobalFieldKey<GlobalEntityKey>[]
    relationships: GlobalFieldKey<GlobalEntityKey>[]
    annotations: GlobalFieldKey<GlobalEntityKey>[]
    events: GlobalFieldKey<GlobalEntityKey>[]
  }
  /**
   * LEARNING: Status button fields extracted from config
   * WHY: Boolean fields with renderAs: 'statusButton' should render as clickable VChips
   * PATTERN: Rendered in panel title, clickable to toggle value
   */
  statusButtonFields: StatusButtonField[]
}

export interface CategorizeFieldsOptions {
  blockShapeProperties?: {
    canHaveParts?: boolean
    composable?: boolean
    composite?: boolean
  }
  fieldMetadata?: Record<string, FieldMetadataEntry>
}

/**
 * LEARNING: Pure categorization utility (no Vue dependencies)
 * WHY: Keeps rendering components thin; logic stays reusable and testable
 * PATTERN: Order-aware bucketing with metadata from fieldMetadata (database) EXCLUSIVELY
 * 
 * LEARNING: Reads from fieldMetadata in BlockShape/PartShape directly
 * WHY: Single source of truth for field configuration - NO FALLBACKS
 * PATTERN: fieldMetadata is REQUIRED - if missing, fields will not render (fail fast, fail visible)
 */
export function categorizeFieldsBySection(
  fieldKeys: GlobalFieldKey<GlobalEntityKey>[],
  _fieldsConfig: Record<string, FieldMetadata> | undefined, // DEPRECATED: Not used, kept for API compatibility
  options?: CategorizeFieldsOptions
): CategorizedFields {
  const result: CategorizedFields = {
    directFields: {
      inline: [],
      stacked: []
    },
    subPanelFields: {
      parts: [],
      relationships: [],
      annotations: [],
      events: []
    },
    statusButtonFields: []
  }
  
  const fieldMetadata: Record<string, FieldMetadataEntry> = options?.fieldMetadata ?? {}
  
  const hasFieldMetadata = Object.keys(fieldMetadata).length > 0
  
  // PATTERN: Fail silently - empty metadata means no fields to render, which is fine
  if (!hasFieldMetadata) {
    return {
      directFields: {
        inline: [],
        stacked: []
      },
      subPanelFields: {
        parts: [],
        relationships: [],
        annotations: [],
        events: []
      },
      statusButtonFields: []
    }
  }

  // PATTERN: All field configuration comes from fieldMetadata, period

  /**
   * LEARNING: Collect status button fields from fieldMetadata ONLY
   * WHY: Status buttons configured in fieldMetadata, no fallback
   * PATTERN: Extract fields with renderAs: 'statusButton' from fieldMetadata
   * NOTE: No visibility filtering - categorization is pure, visibility handled elsewhere
   */
  const statusButtonFieldsWithOrder = Object.entries(fieldMetadata)
    .filter(([_fieldKey, meta]) => {
      return meta.renderAs === 'statusButton'
    })
    .map(([fieldKey, meta]) => ({
      key: fieldKey as GlobalFieldKey<GlobalEntityKey>,
      label: meta.label || fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1),
      color: meta.statusButtonColor || 'default',
      order: meta.displayOrder
    }))
    .sort((a, b) => a.order - b.order)
  
  result.statusButtonFields = statusButtonFieldsWithOrder
  
  console.trace(`[categorizeFieldsBySection] Field categorization analysis:`, {
    fieldKeysCount: fieldKeys.length,
    fieldKeys: fieldKeys.map(f => String(f)),
    fieldMetadataKeysCount: Object.keys(fieldMetadata).length,
    fieldMetadataKeys: Object.keys(fieldMetadata),
    allFieldMetadata: Object.entries(fieldMetadata).map(([fieldKey, meta]) => ({
      fieldKey: String(fieldKey),
      renderAs: meta.renderAs,
      panel: meta.panel,
      layout: meta.layout,
      displayOrder: meta.displayOrder,
      isStatusButton: meta.renderAs === 'statusButton'
    })),
    statusButtonsFound: statusButtonFieldsWithOrder.map(f => ({
      key: String(f.key),
      label: f.label,
      color: f.color,
      order: f.order
    }))
  })
  
  // PATTERN: Use reduce to build categorized arrays without mutations
  const categorized = fieldKeys.reduce((acc, fieldKey, _idx) => {
    const fieldMeta = fieldMetadata[fieldKey]
    if (!fieldMeta) {
      // PATTERN: Skip fields without fieldMetadata configuration (fail fast, fail visible)
      return acc
    }
    
    // WHY: Status buttons should render as status button chips in both locations
    // PATTERN: Include status buttons in regular categorization so they render in form fields too
    
    const orderPrefix = `${fieldMeta.displayOrder}::`
    const fieldEntry = `${orderPrefix}${String(fieldKey)}`
    
    const panel = fieldMeta.panel
    
    if (panel === 'none') {
      if (fieldMeta.layout === 'inline') {
        return { ...acc, directInlineEntries: [...acc.directInlineEntries, fieldEntry] }
      } else {
        return { ...acc, directStackedEntries: [...acc.directStackedEntries, fieldEntry] }
      }
    } else if (panel === 'parts' || panel === 'relationships' || panel === 'annotations' || panel === 'events') {
      return {
        ...acc,
        subPanelEntries: {
          ...acc.subPanelEntries,
          [panel]: [...acc.subPanelEntries[panel], fieldEntry]
        }
      }
    }
    
    return acc
  }, {
    directInlineEntries: [] as string[],
    directStackedEntries: [] as string[],
    subPanelEntries: {
      parts: [] as string[],
      relationships: [] as string[],
      annotations: [] as string[],
      events: [] as string[]
    }
  })
  
  const normalize = (arr: string[]) =>
    arr
      .sort((a, b) => {
        const [aOrder] = a.split('::')
        const [bOrder] = b.split('::')
        return Number(aOrder) - Number(bOrder)
      })
      .map(entry => entry.split('::')[1])
      .filter(Boolean) as GlobalFieldKey<GlobalEntityKey>[]

  result.directFields = {
    inline: normalize(categorized.directInlineEntries),
    stacked: normalize(categorized.directStackedEntries)
  }
  result.subPanelFields = {
    parts: normalize(categorized.subPanelEntries.parts),
    relationships: normalize(categorized.subPanelEntries.relationships),
    annotations: normalize(categorized.subPanelEntries.annotations),
    events: normalize(categorized.subPanelEntries.events)
  }

  return {
    directFields: result.directFields,
    subPanelFields: result.subPanelFields,
    statusButtonFields: result.statusButtonFields
  }
}

