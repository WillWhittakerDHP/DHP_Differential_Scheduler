/**
 * LEARNING: Full Display Field Config Builder
 * WHY: Merges primitive and selectable display configs into complete display configuration
 * PATTERN: Combines primitive + selectable display configs, iterates over all field keys
 */

import type { GlobalEntityKey } from '../../../constants/entities'
import type { GlobalFieldKey } from '../../../constants/primitives'
import { blockInstanceDisplays } from './appliedDisplay/blockInstanceDisplays'
import { blockShapeDisplays } from './appliedDisplay/blockShapeDisplays'
import { partInstanceDisplays } from './appliedDisplay/partInstanceDisplays'
import { partShapeDisplays } from './appliedDisplay/partShapeDisplays'
import { buildSelectableDisplayType, type SelectableDisplayType } from './selectableDisplayConfig'

/**
 * Display configuration for individual fields
 * Includes label, placeholder, visibility, styling, and validation configs
 */
 
export interface DisplayFieldType<GE extends GlobalEntityKey, _FieldKey extends GlobalFieldKey<GE>> {
  label: string;
  placeholder: string;
  className?: string;
  style?: Record<string, string | number>;
  tooltip?: string;
  inline?: boolean;
  stacked?: boolean;
  width?: number | string;
  align?: "left" | "center" | "right";
  meta?: {
    visible?: boolean;
    required?: boolean;
    disabled?: boolean;
    groupByKey?: GlobalEntityKey;
    defaultSort?: boolean;
  };
}

export type DisplayFieldConfig<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>> = {
    primitiveDisplay?: DisplayFieldType<GE, FieldKey>;
    relationshipDisplay?: SelectableDisplayType<GE>;
    typeDisplay?: SelectableDisplayType<GE>;
};

export type DisplayFieldConfigMap = {
  [GE in GlobalEntityKey]: {
    [FieldKey in GlobalFieldKey<GE>]?: DisplayFieldConfig<GE, FieldKey>;
  };
};

type DisplayFieldTypeMap = {
  [GE in GlobalEntityKey]: {
    [FieldKey in GlobalFieldKey<GE>]?: DisplayFieldType<GE, FieldKey>;
  };
};

// Removed unused type: DisplayFieldAdmin
// LEARNING: Type was declared but never used
// WHY: Removes dead code to improve maintainability

/**
 * Build complete display field configuration for all entities
 */
export function buildDisplayFieldConfig(): DisplayFieldConfigMap {
  const selectableDisplayConfig = buildSelectableDisplayType();

  return {
    blockInstance: buildAllPerEntityDisplayConfig(
      "blockInstance",
      blockInstanceDisplays,
      selectableDisplayConfig.blockInstance
    ),
    blockShape: buildAllPerEntityDisplayConfig(
      "blockShape",
      blockShapeDisplays,
      selectableDisplayConfig.blockShape
    ),
    partInstance: buildAllPerEntityDisplayConfig(
      "partInstance",
      partInstanceDisplays,
      selectableDisplayConfig.partInstance
    ),
    partShape: buildAllPerEntityDisplayConfig(
      "partShape",
      partShapeDisplays,
      selectableDisplayConfig.partShape
    ),
    eventShape: {},
    eventInstance: {},
    annotationShape: {},
    annotationInstance: {},
  };
}

/**
 * Build display field configuration for a single entity
 * Merges primitive and selectable display configs, iterates over all field keys
 */
function buildAllPerEntityDisplayConfig<GE extends GlobalEntityKey>(
  _entityKey: GE,
  primitiveDisplayConfig: DisplayFieldTypeMap[GE],
  selectableDisplayConfig: Partial<Record<GlobalFieldKey<GE>, SelectableDisplayType<GE>>>
): Partial<Record<GlobalFieldKey<GE>, DisplayFieldConfig<GE, GlobalFieldKey<GE>>>> {
  // ✅ Simplified approach to avoid complex type issues
  const primitiveKeys = Object.keys(primitiveDisplayConfig || {});
  const selectableKeys = Object.keys(selectableDisplayConfig || {});
  
  // ✅ Merge all field keys, avoiding duplicates
  const allFieldKeys = [...new Set([...primitiveKeys, ...selectableKeys])];

  const result: Partial<Record<GlobalFieldKey<GE>, DisplayFieldConfig<GE, GlobalFieldKey<GE>>>> = {};

  // Build configuration using functional approach
  Object.assign(result, 
    Object.fromEntries(
      allFieldKeys.map(fieldKey => {
        const primitiveConfig = primitiveDisplayConfig?.[fieldKey as GlobalFieldKey<GE>];
        const selectConfig = selectableDisplayConfig?.[fieldKey as GlobalFieldKey<GE>];

        const config: DisplayFieldConfig<GE, GlobalFieldKey<GE>> = {};

        if (primitiveConfig) {
          config.primitiveDisplay = primitiveConfig;
        } else if (selectConfig) {
          const mode = selectConfig?.targetMode;

          if (!mode) {
            throw new Error(`❌ Missing targetMode for ${String(fieldKey)}`);
          }
          if (mode === "relationship") {
            config.relationshipDisplay = selectConfig;
          } else if (mode === "property") {
            config.typeDisplay = selectConfig;
          } else {
            throw new Error(`❌ Unknown select mode: ${mode}`);
          }
        }

        return [fieldKey, config];
      })
    )
  );

  return result;
}

// Removed unused function: buildDisplayFieldType
// LEARNING: Function was declared but never used
// WHY: Removes dead code to improve maintainability

