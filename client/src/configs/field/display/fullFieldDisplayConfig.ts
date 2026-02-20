/**
 * LEARNING: Full Display Field Config Builder
 * WHY: Merges primitive and selectable display configs into complete display configuration
 * PATTERN: Combines primitive + selectable display configs, iterates over all field keys
 */

import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type {
  DisplayFieldConfig,
  DisplayFieldConfigMap,
  DisplayFieldTypeMap,
} from './displayFieldTypes'
import { blockInstanceDisplays } from './appliedDisplay/blockInstanceDisplays'
import { blockShapeDisplays } from './appliedDisplay/blockShapeDisplays'
import { partInstanceDisplays } from './appliedDisplay/partInstanceDisplays'
import { partShapeDisplays } from './appliedDisplay/partShapeDisplays'
import { buildSelectableDisplayType, type SelectableDisplayType } from './selectableDisplayConfig'
import { asEmptyObject } from '@/utils/safeDefaults'

export type { DisplayFieldType, DisplayFieldConfig, DisplayFieldConfigMap } from './displayFieldTypes'


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

function buildAllPerEntityDisplayConfig<GE extends GlobalEntityKey>(
  _entityKey: GE,
  primitiveDisplayConfig: DisplayFieldTypeMap[GE],
  selectableDisplayConfig: Partial<Record<GlobalFieldKey<GE>, SelectableDisplayType<GE>>>
): Partial<Record<GlobalFieldKey<GE>, DisplayFieldConfig<GE, GlobalFieldKey<GE>>>> {
  const primitiveKeys = Object.keys(asEmptyObject(primitiveDisplayConfig));
  const selectableKeys = Object.keys(asEmptyObject(selectableDisplayConfig));

  const allFieldKeys = [...new Set([...primitiveKeys, ...selectableKeys])];

  const result: Partial<Record<GlobalFieldKey<GE>, DisplayFieldConfig<GE, GlobalFieldKey<GE>>>> = {};

  Object.assign(
    result,
    Object.fromEntries(
      allFieldKeys.map((fieldKey) => {
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


