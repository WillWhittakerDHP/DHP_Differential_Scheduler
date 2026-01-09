/**
 * LEARNING: Full Form Field Config Builder
 * WHY: Merges primitive and selectable field configs into complete form field configuration
 * PATTERN: Combines primitive + selectable configs, iterates over all field keys
 */

import type { GlobalEntityKey } from '../../../constants/entities'
import type { GlobalFieldKey } from '../../../constants/primitives'
import type { GlobalRelationshipKey } from '../../../constants/relationships'
import type { FormFieldConfig, FormFieldConfigMap, PrimitiveFieldType, RelationshipFieldType as FormFieldsRelationshipFieldType } from '../../../types/entity/formFields'
import type { SelectableFieldType } from './selectableFieldConfig'
import { buildPrimitiveFieldType } from './primitiveFieldConfig'
import { buildSelectableFieldType } from './selectableFieldConfig'

/**
 * Build complete form field configuration for all entities
 */
export function buildFormFieldConfig(): FormFieldConfigMap {
  const primitiveConfig = buildPrimitiveFieldType()
  const selectableFieldConfig = buildSelectableFieldType()

  const result = {
    blockInstance: buildAllPerEntityFieldConfig(
      "blockInstance",
      primitiveConfig.blockInstance,
      selectableFieldConfig.blockInstance
    ),
    blockShape: buildAllPerEntityFieldConfig(
      "blockShape",
      primitiveConfig.blockShape,
      selectableFieldConfig.blockShape
    ),
    partInstance: buildAllPerEntityFieldConfig(
      "partInstance",
      primitiveConfig.partInstance,
      selectableFieldConfig.partInstance
    ),
    partShape: buildAllPerEntityFieldConfig(
      "partShape",
      primitiveConfig.partShape,
      selectableFieldConfig.partShape
    ),
  }

  return result
}

/**
 * Build form field configuration for a single entity
 * Merges primitive and selectable configs, iterates over all field keys
 */
export function buildAllPerEntityFieldConfig<GE extends GlobalEntityKey>(
  _entityKey: GE,
  primitiveFieldConfig: PrimitiveFieldType<GE>,
  selectableFieldConfig: Partial<Record<GlobalFieldKey<GE>, SelectableFieldType<GE>>>
): Partial<Record<GlobalFieldKey<GE>, FormFieldConfig<GE, GlobalFieldKey<GE>>>> {
  // ✅ Simplified approach to avoid complex type issues
  const primitiveKeys = Object.keys(primitiveFieldConfig || {})
  const selectableKeys = Object.keys(selectableFieldConfig || {})
  
  // ✅ Merge all field keys, avoiding duplicates
  const allFieldKeys = [...new Set([...primitiveKeys, ...selectableKeys])]

  const result: Partial<Record<GlobalFieldKey<GE>, FormFieldConfig<GE, GlobalFieldKey<GE>>>> = {}

  // Build configuration using functional approach
  Object.assign(result, 
    Object.fromEntries(
      allFieldKeys.map(fieldKey => {
        const primitiveConfig = primitiveFieldConfig?.[fieldKey as GlobalFieldKey<GE>]
        const selectConfig = selectableFieldConfig?.[fieldKey as GlobalFieldKey<GE>]

        const config: FormFieldConfig<GE, GlobalFieldKey<GE>> = {}

        if (primitiveConfig) {
          config.primitiveInput = primitiveConfig
        } else if (selectConfig) {
          const mode = selectConfig?.targetMode

          if (!mode) {
            throw new Error(`❌ Missing targetMode for ${String(fieldKey)}`)
          }
          if (mode === "relationship") {
            config.relationshipSelect = {
              ...selectConfig,
              // ✅ Preserve original selectMode and selectType from selectConfig
              // Don't override with hardcoded values to preserve modeToggle configuration
            } as unknown as FormFieldsRelationshipFieldType<GE, GlobalRelationshipKey>
          } else if (mode === "property") {
            config.typeSelect = {
              ...selectConfig,
              // selectType is already set in selectConfig, preserve it
            }
          } else {
            throw new Error(`❌ Unknown select mode: ${mode}`)
          }
        }

        return [fieldKey, config]
      })
    )
  )

  return result
}

