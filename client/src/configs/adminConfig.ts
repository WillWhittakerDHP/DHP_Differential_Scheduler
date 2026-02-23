/**

WHY: Provides admin configuration built dynamically from field configs
     Ensures all property keys are included, not just hardcoded ones

PATTERN: Uses dynamic builders to merge primitive + selectable configs
 */

import type { GlobalEntityKey } from '@/constants/entities'
import type { SubPanelKey } from '@/constants/fieldMetadata'
import type { FormFieldConfigMap } from '../types/entity/formFields'
import type { DisplayFieldConfigMap } from './field/display/fullFieldDisplayConfig'
import { buildDisplayFieldConfig as buildDynamicDisplayFieldConfig } from './field/display/fullFieldDisplayConfig'

/**
 * PATTERN: Same types as FieldMetadataEntry in entityMetadata.ts
NOTE: These types ...
 */
type FieldVisibility = 'titleRow' | 'expandedDirect' | 'expandedPanel' | 'hidden' | 'notConfigured'
type SubPanelType = 'none' | SubPanelKey
type FieldLayout = 'inline' | 'stacked'
type FieldRenderAs = 'text' | 'number' | 'select' | 'multiselect' | 'reference' | 'statusButton' | 'iconSelect'

/**
 * NOTE: This is used for shape-level fields (BlockShape/PartShape cards)
 *       Instance fields use FieldMetadataEntry from entityMetadata.ts
 */
export interface FieldMetadata {
  visibility: FieldVisibility
  
  layout: FieldLayout
  
  displayOrder: number
  
  renderAs: FieldRenderAs
  
  statusButtonColor?: string
  
  panel: SubPanelType
}

/**
 * Instance config - defines field layout
 * 
 * NOTE: inlineFields/stackedFields are layout hints for expandedDirect fields
 */
/**
 * NOTE: inlineFields/stackedFields are layout hints for expandedDirect fields
 * NOTE: Internal function only - not exported as it's only used by buildAdminConfig
 */
function buildInstanceConfig() {
  /**
   * NOTE: categorizeFieldsBySection uses metadata panel and layout properties
   * 
   */
  
  return {
    blockInstance: {
      titleField: 'name',
      fields: undefined, // Metadata-driven
    },
    blockShape: {
      titleField: 'name',
      fields: undefined, // Metadata-driven (was hardcoded)
    },
    eventShape: {
      titleField: 'name',
      fields: undefined, // Metadata-driven
    },
    eventInstance: {
      titleField: 'name',
      fields: undefined, // Metadata-driven
    },
    annotationShape: {
      titleField: 'name',
      fields: undefined, // Metadata-driven
    },
    annotationInstance: {
      titleField: 'name',
      fields: undefined, // Metadata-driven
    },
    partInstance: {
      titleField: 'partShapeRef',
      fields: undefined, // Metadata-driven
    },
    partShape: {
      titleField: 'name',
      fields: undefined, // Metadata-driven (was hardcoded)
    }
  }
}

/**
 */
function buildFormFieldConfig(): FormFieldConfigMap {
  return {
    blockInstance: {},
    blockShape: {},
    partInstance: {},
    partShape: {},
    eventShape: {},
    eventInstance: {},
    annotationShape: {},
    annotationInstance: {},
  }
}

/**
 * Display field config - defines labels, placeholders, etc.
 */
export function buildDisplayFieldConfig() {
  return buildDynamicDisplayFieldConfig()
}

/**
 * Instance config type - defines field layout per entity
 * NOTE: controlFields removed - was redundant with inlineFields
 * NOTE: omitFields removed - field visibility controlled by metadata only
 * 
 */
export type InstanceConfig = {
  [GE in GlobalEntityKey]: {
    titleField: string
    fields?: Record<string, FieldMetadata>
    inlineFields?: string[]
    stackedFields?: string[]
  }
}

export interface AdminConfig {
  displayFieldConfig: DisplayFieldConfigMap
  formFieldConfig: FormFieldConfigMap
  instanceConfig: InstanceConfig
}

function buildAdminConfig(): AdminConfig {
  const formFieldConfig = buildFormFieldConfig()
  const displayFieldConfig = buildDisplayFieldConfig()
  const instanceConfig = buildInstanceConfig()
  
  return {
    displayFieldConfig,
    formFieldConfig,
    instanceConfig
  }
}

let _adminConfig: AdminConfig | null = null

export function getAdminConfig(): AdminConfig {
  if (!_adminConfig) {
    _adminConfig = buildAdminConfig()
  }
  // FIX: Removed log for cached config - this was being called excessively (98+ times)
  return _adminConfig
}

export function rebuildAdminConfig(): void {
  _adminConfig = null
  _adminConfig = buildAdminConfig()
}

