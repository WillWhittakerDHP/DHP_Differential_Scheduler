/**
 * WHY: Vue Admin Config - Dynamic version for Vue admin portal

WHY: Provides admin configuration built dynamically from field configs
     Ensures all property keys are included, not just hardcoded ones

PATTERN: Uses dynamic builders to merge primitive + selectable configs
 */

import type { GlobalEntityKey } from '@/constants/entities'
import type { FormFieldConfigMap } from '../types/entity/formFields'
import type { DisplayFieldConfigMap } from './field/display/fullFieldDisplayConfig'
import { buildFormFieldConfig as buildDynamicFormFieldConfig } from './field/form/fullFieldFormConfig'
import { buildDisplayFieldConfig as buildDynamicDisplayFieldConfig } from './field/display/fullFieldDisplayConfig'

export type FieldSection = 'header' | 'direct' | 'subPanel'
export type SubPanelType = 'parts' | 'relationships' | 'annotations'
export type FieldLayout = 'inline' | 'stacked'
/**
 * LEARNING: renderAs determines how a field is displayed
 * WHY: Allows boolean fields to render as clickable status buttons instead of toggles
 * PATTERN: 'field' (default) renders as form input, 'statusButton' renders as clickable VChip
 */
export type FieldRenderAs = 'field' | 'statusButton'

export interface FieldMetadata {
  section: FieldSection
  layout?: FieldLayout
  panel?: SubPanelType
  order?: number
  /**
   * LEARNING: How the field should be rendered
   * WHY: Boolean fields can render as clickable status buttons for cleaner UI
   * PATTERN: 'statusButton' renders as VChip in panel title, clickable to toggle
   * DEFAULT: 'field' - renders as standard form input
   */
  renderAs?: FieldRenderAs
  /**
   * LEARNING: Color for status button variant
   * WHY: Different boolean fields may need different semantic colors
   * PATTERN: Uses Vuetify color names (success, primary, info, etc.)
   */
  statusButtonColor?: string
}

/**
 * Instance config - defines field layout and omitted fields
 * 
 * LEARNING: All fields must be explicitly categorized
 * WHY: No implicit "regular" category - fields must be in inlineFields, stackedFields, or omitFields
 * PATTERN: Every field from formFieldConfig must appear in exactly one of:
 *   - inlineFields (for inline rendering)
 *   - stackedFields (for stacked rendering)
 *   - omitFields (for hidden/omitted fields)
 */
const deriveLegacyLayout = (
  fields?: Record<string, FieldMetadata>
): { inlineFields: string[]; stackedFields: string[] } => {
  if (!fields) return { inlineFields: [], stackedFields: [] }
  const inlineFields: string[] = []
  const stackedFields: string[] = []
  Object.entries(fields).forEach(([key, meta]) => {
    if (meta.section === 'direct') {
      if (meta.layout === 'inline') {
        inlineFields.push(key)
      } else {
        stackedFields.push(key)
      }
    }
  })
  return { inlineFields, stackedFields }
}

export function buildInstanceConfig() {
  /**
   * LEARNING: blockInstance field configuration with status buttons
   * WHY: Boolean fields (active, composite) render as clickable status badges
   * PATTERN: renderAs: 'statusButton' + statusButtonColor for visual styling
   */
  const blockInstanceFields: Record<string, FieldMetadata> = {
    name: { section: 'header', layout: 'inline', order: 1 },
    active: { section: 'header', layout: 'inline', order: 2, renderAs: 'statusButton', statusButtonColor: 'success' },
    composite: { section: 'header', layout: 'inline', order: 3, renderAs: 'statusButton', statusButtonColor: 'primary' },
    allowMultiple: { section: 'header', layout: 'inline', order: 4, renderAs: 'statusButton', statusButtonColor: 'info' },
    requiresUnitNumber: { section: 'header', layout: 'inline', order: 5, renderAs: 'statusButton', statusButtonColor: 'secondary' },
    dependent: { section: 'header', layout: 'inline', order: 6, renderAs: 'statusButton', statusButtonColor: 'warning' },
    differential: { section: 'header', layout: 'inline', order: 7, renderAs: 'statusButton', statusButtonColor: 'purple' },
    baseSqFt: { section: 'direct', layout: 'inline', order: 1 },
    icon: { section: 'direct', layout: 'inline', order: 2 },
    blockShapeRef: { section: 'direct', layout: 'stacked', order: 3 },
    activeConstituents: { section: 'subPanel', panel: 'parts', order: 1 },
    bookingCascades: { section: 'subPanel', panel: 'relationships', order: 1 },
    instanceComponents: { section: 'subPanel', panel: 'relationships', order: 2 },
    dependentInstanceOptions: { section: 'subPanel', panel: 'relationships', order: 3 },
    annotations: { section: 'subPanel', panel: 'annotations', order: 1 }
  }
  const blockInstanceLayout = deriveLegacyLayout(blockInstanceFields)

  /**
   * LEARNING: blockShape field configuration with status buttons
   * WHY: Boolean fields (active, composable, constituable) render as clickable status badges
   * PATTERN: renderAs: 'statusButton' + statusButtonColor for visual styling
   */
  const blockShapeFields: Record<string, FieldMetadata> = {
    name: { section: 'header', layout: 'inline', order: 1 },
    type: { section: 'header', layout: 'inline', order: 2 },
    active: { section: 'header', layout: 'inline', order: 3, renderAs: 'statusButton', statusButtonColor: 'success' },
    composable: { section: 'header', layout: 'inline', order: 4, renderAs: 'statusButton', statusButtonColor: 'info' },
    constituable: { section: 'header', layout: 'inline', order: 5, renderAs: 'statusButton', statusButtonColor: 'warning' },
    validCascades: { section: 'subPanel', panel: 'relationships', order: 1 },
    validConstituents: { section: 'subPanel', panel: 'relationships', order: 2 }
  }
  const blockShapeLayout = deriveLegacyLayout(blockShapeFields)

  /**
   * LEARNING: partInstance field configuration with status buttons
   * WHY: Boolean fields (active, onSite, clientPresent, moveable) render as clickable status badges
   * PATTERN: renderAs: 'statusButton' + statusButtonColor for visual styling
   */
  const partInstanceFields: Record<string, FieldMetadata> = {
    name: { section: 'header', layout: 'inline', order: 1 },
    partShapeRef: { section: 'header', layout: 'inline', order: 2 },
    active: { section: 'header', layout: 'inline', order: 3, renderAs: 'statusButton', statusButtonColor: 'success' },
    onSite: { section: 'header', layout: 'inline', order: 4, renderAs: 'statusButton', statusButtonColor: 'warning' },
    clientPresent: { section: 'header', layout: 'inline', order: 5, renderAs: 'statusButton', statusButtonColor: 'info' },
    moveable: { section: 'header', layout: 'inline', order: 6, renderAs: 'statusButton', statusButtonColor: 'secondary' },
    baseTime: { section: 'direct', layout: 'inline', order: 1 },
    rateOverBaseTime: { section: 'direct', layout: 'inline', order: 2 },
    baseFee: { section: 'direct', layout: 'inline', order: 3 },
    rateOverBaseFee: { section: 'direct', layout: 'inline', order: 4 }
  }
  const partInstanceLayout = deriveLegacyLayout(partInstanceFields)

  const partShapeFields: Record<string, FieldMetadata> = {
    name: { section: 'header', layout: 'inline', order: 1 }
  }
  const partShapeLayout = deriveLegacyLayout(partShapeFields)

  return {
    blockInstance: {
      titleField: 'name',
      fields: blockInstanceFields,
      inlineFields: blockInstanceLayout.inlineFields,
      stackedFields: blockInstanceLayout.stackedFields,
      omitFields: ['id', 'orderIndex', 'entityKey']
    },
    blockShape: {
      titleField: 'name',
      fields: blockShapeFields,
      inlineFields: blockShapeLayout.inlineFields,
      stackedFields: blockShapeLayout.stackedFields,
      omitFields: ['id', 'entityKey', 'orderIndex']
    },
    partInstance: {
      titleField: 'partShapeRef',
      fields: partInstanceFields,
      inlineFields: partInstanceLayout.inlineFields,
      stackedFields: partInstanceLayout.stackedFields,
      omitFields: ['id', 'entityKey', 'orderIndex']
    },
    partShape: {
      titleField: 'name',
      fields: partShapeFields,
      inlineFields: partShapeLayout.inlineFields,
      stackedFields: partShapeLayout.stackedFields,
      omitFields: ['id', 'orderIndex', 'entityKey']
    }
  }
}

/**
 * Form field config - defines field types (primitive vs select)
 * LEARNING: Now uses dynamic builder that merges primitive + selectable configs
 * WHY: Ensures all property keys are included, not just hardcoded ones
 * PATTERN: Calls buildDynamicFormFieldConfig() from fullFieldFormConfig.ts
 */
export function buildFormFieldConfig() {
  return buildDynamicFormFieldConfig()
}

/**
 * Display field config - defines labels, placeholders, etc.
 * LEARNING: Now uses dynamic builder that merges primitive + selectable display configs
 * WHY: Ensures all property keys have display configs, not just hardcoded ones
 * PATTERN: Calls buildDynamicDisplayFieldConfig() from fullFieldDisplayConfig.ts
 */
export function buildDisplayFieldConfig() {
  return buildDynamicDisplayFieldConfig()
}

/**
 * Instance config type - defines field layout and omitted fields per entity
 * LEARNING: inlineFields/stackedFields are layout hints, not type definitions
 * WHY: EntityFormContent determines field types from formFieldConfig, not instanceConfig
 * NOTE: controlFields removed - was redundant with inlineFields
 * 
 * LEARNING: All fields must be explicitly categorized
 * WHY: No implicit "regular" category - every field must be in inlineFields, stackedFields, or omitFields
 * PATTERN: Fields not in inlineFields or stackedFields are treated as hidden (via omitFields)
 */
export type InstanceConfig = {
  [GE in GlobalEntityKey]: {
    titleField: string
    fields?: Record<string, FieldMetadata>
    inlineFields?: string[]
    stackedFields?: string[]
    omitFields?: string[]
  }
}

/**
 * Admin config type
 */
export interface AdminConfig {
  displayFieldConfig: DisplayFieldConfigMap
  formFieldConfig: FormFieldConfigMap
  instanceConfig: InstanceConfig
}

/**
 * Build admin config
 */
export function buildAdminConfig(): AdminConfig {
  const formFieldConfig = buildFormFieldConfig()
  const displayFieldConfig = buildDisplayFieldConfig()
  const instanceConfig = buildInstanceConfig()
  
  return {
    displayFieldConfig,
    formFieldConfig,
    instanceConfig
  }
}

/**
 * Lazy initialization pattern
 */
let _adminConfig: AdminConfig | null = null

export function getAdminConfig(): AdminConfig {
  if (!_adminConfig) {
    _adminConfig = buildAdminConfig()
  }
  // FIX: Removed log for cached config - this was being called excessively (98+ times)
  //      The config is cached, so we don't need to log every access
  return _adminConfig
}

export function rebuildAdminConfig(): void {
  _adminConfig = null
  _adminConfig = buildAdminConfig()
}

