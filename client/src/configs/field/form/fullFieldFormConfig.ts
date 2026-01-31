/**
 * LEARNING: Full Form Field Config Builder (DEPRECATED - Metadata-only)
 * WHY: Form field configs are now metadata-only - all field configuration comes from /admin-input-metadata
 * PATTERN: Returns empty configs - metadata is the single source of truth
 * 
 * NOTE: This file is kept for API compatibility but returns empty configs.
 *       All field configuration (primitive types, select configs) now comes from metadata.inputConfig.
 * 
 * ARCHIVED: primitiveFieldConfig.ts and selectableFieldConfig.ts have been moved to _archived/
 */

import type { FormFieldConfigMap } from '../../../types/entity/formFields'
import type { GlobalEntityKey } from '../../../constants/entities'
import type { GlobalFieldKey } from '../../../constants/primitives'
import type { FormFieldConfig } from '../../../types/entity/formFields'

/**
 * Build complete form field configuration for all entities
 * LEARNING: Returns empty configs - metadata is the source of truth
 * WHY: All field configuration now comes from /admin-input-metadata, not hardcoded configs
 * PATTERN: Return empty object - any code accessing this should use metadata instead
 */
export function buildFormFieldConfig(): FormFieldConfigMap {
  // LEARNING: Return empty configs - metadata is authoritative
  // WHY: Field configuration is now stored in admin_input_metadata table
  //      Frontend should read from /admin-input-metadata, not from hardcoded configs
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
 * Build form field configuration for a single entity (DEPRECATED)
 * LEARNING: No longer builds configs - metadata is the source of truth
 * WHY: Field configuration now comes from /admin-input-metadata
 * PATTERN: Return empty object - kept for API compatibility
 */
export function buildAllPerEntityFieldConfig<GE extends GlobalEntityKey>(
  _entityKey: GE,
  _primitiveFieldConfig: unknown,
  _selectableFieldConfig: unknown
): Partial<Record<GlobalFieldKey<GE>, FormFieldConfig<GE, GlobalFieldKey<GE>>>> {
  // LEARNING: Return empty config - metadata is authoritative
  // WHY: All field configuration now comes from admin_input_metadata table
  return {}
}

