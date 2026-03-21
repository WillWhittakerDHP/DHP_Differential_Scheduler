import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import {
  SUB_PANEL_KEYS,
  createEmptySubPanelRecord,
  type SubPanelRecord
} from '@/constants/fieldMetadata'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { StatusButtonField } from '@/types/forms/fieldSectionCategorization'

export type { StatusButtonField } from '@/types/forms/fieldSectionCategorization'

interface CategorizedFields {
  directFields: {
    inline: GlobalFieldKey<GlobalEntityKey>[]
    stacked: GlobalFieldKey<GlobalEntityKey>[]
  }
  subPanelFields: SubPanelRecord<GlobalFieldKey<GlobalEntityKey>[]>
  /**
   * WHY: Boolean fields with renderAs: 'statusButton' should render as clickable VChips
   */
  statusButtonFields: StatusButtonField[]
}

interface CategorizeFieldsOptions {
  blockShapeProperties?: {
    canHaveParts?: boolean
    composable?: boolean
    composite?: boolean
  }
  fieldMetadata?: Record<string, FieldMetadataEntry>
}

export function categorizeFieldsBySection(
  fieldKeys: GlobalFieldKey<GlobalEntityKey>[],
  options?: CategorizeFieldsOptions
): CategorizedFields {
  const result: CategorizedFields = {
    directFields: {
      inline: [],
      stacked: []
    },
    subPanelFields: createEmptySubPanelRecord(() => [] as GlobalFieldKey<GlobalEntityKey>[]),
    statusButtonFields: []
  }
  
  const rawMeta = options?.fieldMetadata
  const fieldMetadata: Record<string, FieldMetadataEntry> = rawMeta !== undefined && rawMeta !== null ? rawMeta : {}
  
  const hasFieldMetadata = Object.keys(fieldMetadata).length > 0
  
  // PATTERN: Fail silently - empty metadata means no fields to render, which is fine
  if (!hasFieldMetadata) {
    return {
      directFields: {
        inline: [],
        stacked: []
      },
      subPanelFields: createEmptySubPanelRecord(() => [] as GlobalFieldKey<GlobalEntityKey>[]),
      statusButtonFields: []
    }
  }

  /**
   * PATTERN: // PATTERN: All field configuration comes from fieldMetadata, period
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
    } else if ((SUB_PANEL_KEYS as readonly string[]).includes(panel)) {
      return {
        ...acc,
        subPanelEntries: {
          ...acc.subPanelEntries,
          [panel]: [...(acc.subPanelEntries as Record<string, string[]>)[panel], fieldEntry]
        }
      }
    }

    return acc
  }, {
    directInlineEntries: [] as string[],
    directStackedEntries: [] as string[],
    subPanelEntries: createEmptySubPanelRecord(() => [] as string[])
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
  result.subPanelFields = SUB_PANEL_KEYS.reduce<SubPanelRecord<GlobalFieldKey<GlobalEntityKey>[]>>(
    (acc, key) => ({
      ...acc,
      [key]: normalize(categorized.subPanelEntries[key])
    }),
    createEmptySubPanelRecord(() => [] as GlobalFieldKey<GlobalEntityKey>[])
  )

  return {
    directFields: result.directFields,
    subPanelFields: result.subPanelFields,
    statusButtonFields: result.statusButtonFields
  }
}

