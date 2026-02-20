/**
 * WHY: Vue Admin Config - Dynamic version for Vue admin portal

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
 * LEARNING: Field visibility types aligned with FieldMetadataEntry
 * WHY: Single source of truth for field configuration - matches database fieldMetadata structure
 * PATTERN: Same types as FieldMetadataEntry in entityMetadata.ts
 * NOTE: These types are used internally in FieldMetadata interface - not exported as they're not used outside this file
 */
type FieldVisibility = 'titleRow' | 'expandedDirect' | 'expandedPanel' | 'hidden' | 'notConfigured'
type SubPanelType = 'none' | SubPanelKey
type FieldLayout = 'inline' | 'stacked'
type FieldRenderAs = 'text' | 'number' | 'select' | 'multiselect' | 'reference' | 'statusButton' | 'iconSelect'

/**
 * LEARNING: FieldMetadata interface aligned with FieldMetadataEntry
 * WHY: Single type system for all field configuration - shape-level and instance-level
 * PATTERN: All properties required - explicit configuration only, no optional fields
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
 * LEARNING: Field visibility comes from metadata, not config
 * WHY: Metadata is the single source of truth for which fields should render
 * PATTERN: Fields with visibility: 'hidden' in metadata won't render
 * NOTE: inlineFields/stackedFields are layout hints for expandedDirect fields
 */
/**
 * LEARNING: Field visibility comes from metadata, not config
 * WHY: Metadata is the single source of truth for which fields should render
 * PATTERN: Fields with visibility: 'hidden' in metadata won't render
 * NOTE: inlineFields/stackedFields are layout hints for expandedDirect fields
 * NOTE: Internal function only - not exported as it's only used by buildAdminConfig
 */
function buildInstanceConfig() {
  /**
   * LEARNING: All field configuration removed - now 100% metadata-driven
   * WHY: Field configuration controlled by database metadata via /admin-input-metadata
   * PATTERN: No hardcoded field configs - all config comes from database
   * NOTE: categorizeFieldsBySection uses metadata panel and layout properties
   * 
   * LEARNING: Field visibility comes from metadata, not config
   * WHY: Metadata is the single source of truth for which fields should render
   * PATTERN: Fields with visibility: 'hidden' in metadata won't render
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
 * LEARNING: Returns empty configs - metadata is the source of truth
 * WHY: All field configuration now comes from /admin-input-metadata, not hardcoded configs
 * PATTERN: Return empty object - any code accessing this should use metadata instead
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
 * LEARNING: Now uses dynamic builder that merges primitive + selectable display configs
 * WHY: Ensures all property keys have display configs, not just hardcoded ones
 * PATTERN: Calls buildDynamicDisplayFieldConfig() from fullFieldDisplayConfig.ts
 */
export function buildDisplayFieldConfig() {
  return buildDynamicDisplayFieldConfig()
}

/**
 * Instance config type - defines field layout per entity
 * LEARNING: inlineFields/stackedFields are layout hints, not type definitions
 * WHY: EntityFormContent determines field types from formFieldConfig, not instanceConfig
 * NOTE: controlFields removed - was redundant with inlineFields
 * NOTE: omitFields removed - field visibility controlled by metadata only
 * 
 * LEARNING: Field visibility comes from metadata, not config
 * WHY: Metadata is the single source of truth for which fields should render
 * PATTERN: Fields with visibility: 'hidden' in metadata won't render
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

