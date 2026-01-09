import type { FieldMetadata } from '@/configs/adminConfig'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import { PrimitiveTypeEnum } from '@/types/entity/formDataEnums'
import type { FormFieldConfigMap, FormFieldConfig } from '@/types/entity/formFields'
import { isDevModeEnabled } from '@/utils/env/devMode'

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
  headerFields: GlobalFieldKey<GlobalEntityKey>[]
  directInlineFields: GlobalFieldKey<GlobalEntityKey>[]
  directStackedFields: GlobalFieldKey<GlobalEntityKey>[]
  subPanelFields: {
    parts: GlobalFieldKey<GlobalEntityKey>[]
    relationships: GlobalFieldKey<GlobalEntityKey>[]
    annotations: GlobalFieldKey<GlobalEntityKey>[]
  }
  /**
   * LEARNING: Status button fields extracted from config
   * WHY: Boolean fields with renderAs: 'statusButton' should render as clickable VChips
   * PATTERN: Rendered in panel title, clickable to toggle value
   */
  statusButtonFields: StatusButtonField[]
}

/**
 * LEARNING: Pure categorization utility (no Vue dependencies)
 * WHY: Keeps rendering components thin; logic stays reusable and testable
 * PATTERN: Order-aware bucketing with metadata fallbacks
 */
export function categorizeFieldsBySection(
  visibleFields: GlobalFieldKey<GlobalEntityKey>[],
  fieldsConfig: Record<string, FieldMetadata> | undefined
): CategorizedFields {
  const result: CategorizedFields = {
    headerFields: [],
    directInlineFields: [],
    directStackedFields: [],
    subPanelFields: {
      parts: [],
      relationships: [],
      annotations: []
    },
    statusButtonFields: []
  }

  if (!fieldsConfig) {
    result.directStackedFields = [...visibleFields]
    return result
  }

  /**
   * LEARNING: Collect status button fields from ALL config entries
   * WHY: Status buttons might not be in visibleFields (they're rendered in panel title)
   * PATTERN: Extract fields with renderAs: 'statusButton' regardless of visibility
   */
  const statusButtonFieldsWithOrder = Object.entries(fieldsConfig)
    .filter(([, meta]) => meta.renderAs === 'statusButton')
    .map(([fieldKey, meta]) => ({
      key: fieldKey as GlobalFieldKey<GlobalEntityKey>,
      label: fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1), // Capitalize field name
      color: meta.statusButtonColor || 'default',
      order: meta.order ?? 999
    }))
    .sort((a, b) => a.order - b.order)
  
  // Assign to result
  result.statusButtonFields = statusButtonFieldsWithOrder

  // LEARNING: Use reduce to categorize fields without mutations
  // WHY: Functional approach avoids forEach with push mutations
  // PATTERN: Build categorized arrays using reduce with new arrays
  const categorized = visibleFields.reduce((acc, fieldKey, idx) => {
    const meta = fieldsConfig[fieldKey]
    if (!meta) {
      return {
        ...acc,
        directStackedEntries: [...acc.directStackedEntries, `${idx}::${String(fieldKey)}`]
      }
    }

    // LEARNING: Skip status button fields from regular categorization
    // WHY: They're rendered separately in the panel title
    if (meta.renderAs === 'statusButton') {
      return acc
    }

    const orderPrefix = `${meta.order ?? idx}::`
    const fieldEntry = `${orderPrefix}${String(fieldKey)}`

    if (meta.section === 'header') {
      return { ...acc, headerEntries: [...acc.headerEntries, fieldEntry] }
    } else if (meta.section === 'direct') {
      if (meta.layout === 'inline') {
        return { ...acc, directInlineEntries: [...acc.directInlineEntries, fieldEntry] }
      } else {
        return { ...acc, directStackedEntries: [...acc.directStackedEntries, fieldEntry] }
      }
    } else if (meta.section === 'subPanel' && meta.panel) {
      return {
        ...acc,
        subPanelEntries: {
          ...acc.subPanelEntries,
          [meta.panel]: [...acc.subPanelEntries[meta.panel], fieldEntry]
        }
      }
    }
    
    return acc
  }, {
    headerEntries: [] as string[],
    directInlineEntries: [] as string[],
    directStackedEntries: [] as string[],
    subPanelEntries: {
      parts: [] as string[],
      relationships: [] as string[],
      annotations: [] as string[]
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

  // Assign normalized categorized results to result
  result.headerFields = normalize(categorized.headerEntries)
  result.directInlineFields = normalize(categorized.directInlineEntries)
  result.directStackedFields = normalize(categorized.directStackedEntries)
  result.subPanelFields = {
    parts: normalize(categorized.subPanelEntries.parts),
    relationships: normalize(categorized.subPanelEntries.relationships),
    annotations: normalize(categorized.subPanelEntries.annotations)
  }

  return {
    headerFields: result.headerFields,
    directInlineFields: result.directInlineFields,
    directStackedFields: result.directStackedFields,
    subPanelFields: result.subPanelFields,
    statusButtonFields: result.statusButtonFields
  }
}

/**
 * LEARNING: DevMode warning for unconfigured boolean fields
 * WHY: Helps developers catch boolean fields that exist in the database/form config but aren't configured as status buttons
 * PATTERN: Compares boolean fields from formFieldConfig against adminConfig to detect missing configurations
 * 
 * @param entityKey - Entity type to check
 * @param formFieldConfig - Form field configuration for the entity
 * @param fieldsConfig - Admin field metadata configuration
 */
export function warnUnconfiguredBooleanFields<GE extends GlobalEntityKey>(
  entityKey: GE,
  formFieldConfig: FormFieldConfigMap[GE] | undefined,
  fieldsConfig: Record<string, FieldMetadata> | undefined
): void {
  if (!isDevModeEnabled()) {
    return
  }

  if (!formFieldConfig || !fieldsConfig) {
    return
  }

  // LEARNING: Find all boolean fields from formFieldConfig
  // WHY: Check which fields are actually boolean types in the form configuration
  // PATTERN: Use map + filter instead of forEach + push
  const booleanFields = Object.entries(formFieldConfig)
    .filter(([, fieldConfig]) => {
      const config = fieldConfig as FormFieldConfig<GE, GlobalFieldKey<GE>> | undefined
      return config?.primitiveInput?.primitiveType === PrimitiveTypeEnum.Boolean
    })
    .map(([fieldKey]) => fieldKey)

  // LEARNING: Get configured status button fields
  // WHY: Compare against what's actually configured as status buttons
  // PATTERN: Extract statusButtonFields using same logic as categorizeFieldsBySection
  // LEARNING: Use filter + map to build Set instead of forEach + add
  const configuredStatusButtons = new Set(
    Object.entries(fieldsConfig)
      .filter(([, meta]) => meta.renderAs === 'statusButton')
      .map(([fieldKey]) => fieldKey)
  )

  // LEARNING: Warn about boolean fields not configured in adminConfig
  // WHY: Helps catch fields that exist in database/form but aren't configured for display
  // PATTERN: Use for...of for side effects (console.warn) instead of forEach
  // WHY: for...of is appropriate for side effects, avoids forEach mutation pattern
  for (const fieldKey of booleanFields) {
    if (!(fieldKey in fieldsConfig)) {
      console.warn(
        `[DevMode Warning] Boolean field '${fieldKey}' on ${entityKey} exists in formFieldConfig but is not configured in adminConfig.fields. ` +
        `Add to adminConfig.ts with renderAs: 'statusButton' (if it should be a status button) or configure it as a regular field.`
      )
    } else if (!configuredStatusButtons.has(fieldKey)) {
      // LEARNING: Optional: Warn if boolean field is configured but not as status button
      // WHY: Some boolean fields might intentionally be regular form fields, but this helps catch potential oversights
      // NOTE: This is less critical, so we could make it optional or remove it if too noisy
      // For now, we'll only warn if the field is completely missing from fieldsConfig
    }
  }
}
