/**
 * LEARNING: Primitive Field Config Builder
 * WHY: Builds primitive field configuration map from individual entity field definitions
 * PATTERN: Combines all primitive field configs into a single map
 */

import type { GlobalEntityKey } from '../../../constants/entities'
import type { PrimitiveFieldType } from '../../../types/entity/formFields'
import { blockInstancePrimitiveFields } from './appliedForm/blockInstancePrimitiveFields'
import { blockShapePrimitiveFields } from './appliedForm/blockShapePrimitiveFields'
import { partInstancePrimitiveFields } from './appliedForm/partInstancePrimitiveFields'
import { partShapePrimitiveFields } from './appliedForm/partShapePrimitiveFields'

export type PrimitiveFieldTypeMap = {
  [GE in GlobalEntityKey]: PrimitiveFieldType<GE>;
};

export function buildPrimitiveFieldType(): PrimitiveFieldTypeMap {
  return {
    blockInstance: blockInstancePrimitiveFields as PrimitiveFieldType<"blockInstance">,
    partInstance: partInstancePrimitiveFields as PrimitiveFieldType<"partInstance">,
    blockShape: blockShapePrimitiveFields as PrimitiveFieldType<"blockShape">,
    partShape: partShapePrimitiveFields as PrimitiveFieldType<"partShape">,
  };
}

