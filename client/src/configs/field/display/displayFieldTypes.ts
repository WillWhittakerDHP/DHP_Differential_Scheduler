/**
 * Display field type definitions (shared to break circular deps with appliedDisplay modules).
 * WHY: fullFieldDisplayConfig imports runtime from appliedDisplay/* which import DisplayFieldType from it.
 * PATTERN: Types live here; fullFieldDisplayConfig and appliedDisplay files import from this file only.
 */

import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { SelectableDisplayType } from './selectableDisplayConfig'

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

export type DisplayFieldTypeMap = {
  [GE in GlobalEntityKey]: {
    [FieldKey in GlobalFieldKey<GE>]?: DisplayFieldType<GE, FieldKey>;
  };
};
